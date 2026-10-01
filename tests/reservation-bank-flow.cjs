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

const pricing = load('lib/utils/reservation-payment.ts', {});

function setup() {
  const inserts = [];
  const emails = [];
  const redirects = [];
  const reservation = { id: 'reservation-1' };
  const supabase = {
    createAdminClient: () => ({
      from: table => {
        if (table === 'properties') {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: async () => ({
                  data: {
                    id: 'property-1',
                    title: 'Chalet',
                    is_published: true,
                    property_type: 'chalet',
                    monthly_price: 700,
                    deposit_amount: 1200,
                    viewing_fee: 0,
                    service_charges: 0,
                  },
                  error: null,
                }),
              }),
            }),
          };
        }
        assert.equal(table, 'reservations');
        return {
          insert: data => {
            inserts.push(data);
            return {
              select: () => ({
                single: async () => ({ data: reservation, error: null }),
              }),
            };
          },
        };
      },
    }),
  };
  const action = load('actions/reservations.ts', {
    'next/navigation': {
      redirect: url => {
        redirects.push(url);
        throw new Error('redirected');
      },
    },
    'next/cache': { revalidatePath: () => {} },
    '@/lib/supabase/admin': supabase,
    '@/lib/data/clients': { upsertClient: async () => ({ id: 'client-1' }) },
    '@/lib/data/history': { recordStatusChange: async () => {} },
    '@/lib/validations/reservation': { reservationSchema: { safeParse: data => ({ success: true, data }) } },
    '@/lib/utils/reference': { generateReference: () => 'REN-2026-123456' },
    '@/lib/notifications/email': { sendAdminAlert: async (subject, data) => emails.push({ subject, data }) },
    '@/lib/utils/reservation-payment': pricing,
  });
  return { action, inserts, emails, redirects };
}

test('Le clic de soumission conserve l’envoi du mail et affiche le RIB avec le total exact', async () => {
  const s = setup();

  await assert.rejects(
    s.action.createReservation({
      propertyId: 'property-1',
      firstName: 'Camille',
      lastName: 'Martin',
      email: 'camille@example.com',
      phone: '+33600000000',
      desiredMoveInDate: '2026-12-20',
      durationDays: 10,
      occupantsCount: 2,
      hasPets: false,
      selectedRateId: 'lowSeason',
    }, 'chalet'),
    /redirected/
  );

  assert.equal(s.inserts[0].rental_amount, 1000);
  assert.equal(s.inserts[0].payment_amount, 700);
  assert.equal(s.emails.length, 1);
  assert.equal(s.emails[0].data['Montant à régler (acompte + caution)'], 700);
  assert.equal(s.redirects[0], '/appartements/chalet/reserver/confirmation?ref=REN-2026-123456&email=camille%40example.com');
});

test('La confirmation finale charge les coordonnées bancaires et le montant enregistré', () => {
  const confirmation = fs.readFileSync(
    'app/(public)/appartements/[slug]/reserver/confirmation/page.tsx',
    'utf8'
  );
  const dataSource = fs.readFileSync('lib/data/dossier.ts', 'utf8');

  assert.match(confirmation, /BankTransferInstructions/);
  assert.match(confirmation, /reservation\.payment_amount/);
  assert.match(confirmation, /getBankSettings/);
  assert.match(dataSource, /\.select\('\*, properties/);
});

test('Le formulaire transmet le tarif choisi sans changer son bouton d’envoi', () => {
  const form = fs.readFileSync('components/forms/reservation-form.tsx', 'utf8');
  assert.match(form, /const STEPS = \['Vos coordonnées', 'Votre projet de location', 'Récapitulatif'\]/);
  assert.match(form, /register\('selectedRateId'\)/);
  assert.match(form, /handleSubmit\(onSubmit\)/);
  assert.match(form, /createReservation\(data, propertySlug\)/);
});
