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

test('La demande de visite enregistre les frais affichés avant la redirection vers le RIB', async () => {
  const viewingInserts = [];
  const requestInserts = [];
  const paths = [];
  const redirectUrls = [];
  const alerts = [];
  const supabase = {
    createAdminClient: () => ({
      from: table => {
        if (table === 'properties') {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: async () => ({
                  data: { id: 'property-1', title: 'Chalet', is_published: true },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'visit_requests') {
          return { insert: data => { requestInserts.push(data); return Promise.resolve({ error: null }); } };
        }
        assert.equal(table, 'viewing_requests');
        return {
          insert: data => {
            viewingInserts.push(data);
            return {
              select: () => ({
                single: async () => ({ data: { id: 'viewing-1' }, error: null }),
              }),
            };
          },
        };
      },
    }),
  };

  const action = load('actions/viewings.ts', {
    'next/navigation': {
      redirect: url => {
        redirectUrls.push(url);
        throw new Error('redirected');
      },
    },
    'next/cache': { revalidatePath: path => paths.push(path) },
    '@/lib/supabase/admin': supabase,
    '@/lib/data/clients': { upsertClient: async () => ({ id: 'client-1' }) },
    '@/lib/data/history': { recordStatusChange: async () => {} },
    '@/lib/validations/viewing': { viewingRequestSchema: { safeParse: data => ({ success: true, data }) } },
    '@/lib/utils/reference': { generateReference: () => 'VIS-2026-123456' },
    '@/lib/utils/constants': { VIEWING_FEE_AMOUNT: 50 },
    '@/lib/notifications/alerts': {
      sendRequestAlert: async (subject, details) => alerts.push({ subject, details }),
    },
    '@/types': {},
  });

  await assert.rejects(
    action.createViewingRequest({
      propertyId: 'property-1',
      requestedDate: '2026-10-15',
      requestedTimeSlot: '10:00 - 10:30',
      firstName: 'Camille',
      lastName: 'Martin',
      email: 'camille@example.com',
      phone: '+33600000000',
    }, 'chalet'),
    /redirected/
  );

  assert.equal(viewingInserts[0].fee_amount, 50);
  assert.equal(requestInserts[0].email, 'camille@example.com');
  assert.equal(requestInserts[0].requested_time_slot, '10:00 - 10:30');
  assert.equal(requestInserts[0].status, 'new');
  assert.equal(alerts.length, 1);
  assert.equal(alerts[0].subject, 'Nouvelle demande de visite — VIS-2026-123456');
  assert.equal(alerts[0].details['E-mail'], 'camille@example.com');
  assert.equal(redirectUrls[0], '/appartements/chalet/visite/confirmation?ref=VIS-2026-123456');
  assert.ok(paths.includes('/admin/visites'));
});

test('Le formulaire annonce le remboursement et ne propose plus de lien de paiement', () => {
  const form = fs.readFileSync('components/forms/viewing-request-form.tsx', 'utf8');
  assert.match(form, /l’intérieur du logement ne correspond pas à ce qui vous a été\s+présenté, les frais de visite vous seront remboursés/);
  assert.equal(form.includes('lien de paiement'), false);
  assert.equal(form.includes('Envoyer et accéder au paiement'), false);
});

test('La confirmation de visite affiche le RIB et l’admin ne permet plus de gérer de lien de paiement', () => {
  const confirmation = fs.readFileSync('app/(public)/appartements/[slug]/visite/confirmation/page.tsx', 'utf8');
  const settings = fs.readFileSync('app/admin/(dashboard)/parametres/page.tsx', 'utf8');
  assert.match(confirmation, /BankTransferInstructions/);
  assert.equal(confirmation.includes('PaymentStep'), false);
  assert.equal(settings.includes('PaymentSettingsForm'), false);
  assert.equal(settings.includes('getPaymentSettings'), false);
});
