const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, imports) {
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const context = {
    exports: {},
    require: name => {
      assert.ok(name in imports, `Unexpected import: ${name}`);
      return imports[name];
    },
  };
  vm.runInNewContext(source, context);
  return context.exports;
}

function setup({
  existingGuarantee = null,
  bankSettings = { default_deposit_amount: 975.25 },
  reservationError = null,
  paymentAmount = 700,
} = {}) {
  const inserts = [];
  const reservationUpdates = [];
  const paths = [];
  const reservation = {
    id: 'reservation-1',
    reference: 'REN-2026-123456',
    client_id: 'client-1',
    status: 'under_review',
    payment_amount: paymentAmount,
  };
  const supabase = {
    createAdminClient: () => ({
      from: table => {
        if (table === 'reservations') {
          return {
            select: () => ({
              eq: () => ({ maybeSingle: async () => ({ data: reservation, error: null }) }),
            }),
            update: data => {
              reservationUpdates.push(data);
              return {
                eq: async () => ({ error: reservationError }),
              };
            },
          };
        }
        if (table === 'guarantee_payments') {
          return {
            select: () => ({
              eq: () => ({ maybeSingle: async () => ({ data: existingGuarantee, error: null }) }),
            }),
            insert: data => {
              inserts.push(data);
              return Promise.resolve({ error: null });
            },
          };
        }
        throw new Error(`Unexpected table: ${table}`);
      },
    }),
  };
  const action = load('actions/admin-reservations.ts', {
    'next/cache': { revalidatePath: path => paths.push(path) },
    '@/lib/supabase/admin': supabase,
    '@/lib/data/history': { recordStatusChange: async () => {}, logAdminAction: async () => {} },
    '@/lib/data/bank': { getBankSettings: async () => bankSettings },
    '@/lib/utils/constants': { RESERVATION_STATUS_LABELS: { awaiting_guarantee: 'En attente de garantie' } },
    '@/lib/utils/reference': { generateGuaranteeReference: reference => `GUARANTEE-${reference}` },
  });
  return { action, inserts, reservationUpdates, paths };
}

test('Le passage en attente de garantie reprend le montant du virement affiché au client', async () => {
  const s = setup();
  const result = await s.action.updateReservationStatus('reservation-1', 'awaiting_guarantee');

  assert.equal(result.success, true);
  assert.deepEqual(JSON.parse(JSON.stringify(s.inserts)), [{
    reference: 'GUARANTEE-REN-2026-123456',
    reservation_id: 'reservation-1',
    client_id: 'client-1',
    amount: 700,
    status: 'awaiting_payment',
  }]);
  assert.deepEqual(JSON.parse(JSON.stringify(s.reservationUpdates)), [{ status: 'awaiting_guarantee' }]);
  assert.ok(s.paths.includes('/mon-compte'));
});

test('Un montant non configuré bloque la demande de garantie', async () => {
  const s = setup({ bankSettings: { default_deposit_amount: 0 }, paymentAmount: null });
  const result = await s.action.updateReservationStatus('reservation-1', 'awaiting_guarantee');

  assert.equal(result.success, false);
  assert.equal(s.inserts.length, 0);
  assert.equal(s.reservationUpdates.length, 0);
});

test('Une garantie existante n’est pas créée une seconde fois', async () => {
  const s = setup({ existingGuarantee: { id: 'guarantee-1' } });
  const result = await s.action.updateReservationStatus('reservation-1', 'awaiting_guarantee');

  assert.equal(result.success, true);
  assert.equal(s.inserts.length, 0);
  assert.equal(s.reservationUpdates.length, 1);
});
