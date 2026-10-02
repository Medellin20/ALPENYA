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

function setup({ hasCleaningFee = true, serviceCharges = 125 } = {}) {
  const requestInserts = [];
  const alerts = [];
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
                    service_charges: serviceCharges,
                    cleaning_fee: 0,
                  },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'reservation_requests') {
          return { insert: data => { requestInserts.push(data); return Promise.resolve({ error: null }); } };
        }
        assert.fail(`Écriture inattendue dans ${table}`);
      },
    }),
  };
  const action = load('actions/reservations.ts', {
    'next/cache': { revalidatePath: () => {} },
    'next/navigation': {
      redirect: url => {
        const error = new Error('NEXT_REDIRECT');
        error.url = url;
        throw error;
      },
    },
    '@/lib/supabase/admin': supabase,
    '@/lib/validations/reservation': { reservationSchema: { safeParse: data => ({ success: true, data }) } },
    '@/lib/utils/reference': { generateReference: () => 'REN-2026-123456' },
    '@/lib/utils/reservation-payment': pricing,
    '@/lib/notifications/alerts': {
      sendRequestAlert: async (subject, details) => alerts.push({ subject, details }),
    },
  });
  return { action, inserts: requestInserts, requestInserts, alerts };
}

async function captureReservationRedirect(action, data) {
  try {
    await action.createReservation(data, 'chalet');
    assert.fail('La création doit rediriger vers l’étape de confirmation.');
  } catch (error) {
    if (!error.url) throw error;
    return error.url;
  }
}

test('Après insertion, l’action redirige vers la page d’attente avec la référence enregistrée', async () => {
  const s = setup();
  let redirectUrl;

  try {
    await s.action.createReservation({
      propertyId: 'property-1',
      firstName: 'Camille',
      lastName: 'Martin',
      email: 'camille@example.com',
      phone: '+33600000000',
      desiredMoveInDate: '2026-12-20',
      durationDays: 10,
      occupantsCount: 2,
      hasPets: false,
      hasCleaningFee: true,
      selectedRateId: 'lowSeason',
    }, 'chalet');
  } catch (error) {
    redirectUrl = error.url;
  }

  assert.equal(s.inserts.length, 1);
  assert.equal(redirectUrl, '/appartements/chalet/reserver/confirmation?ref=REN-2026-123456');
});

test('La demande est enregistrée une fois puis redirige vers la confirmation', async () => {
  const s = setup();

  const redirectUrl = await captureReservationRedirect(s.action, {
      propertyId: 'property-1',
      firstName: 'Camille',
      lastName: 'Martin',
      email: 'camille@example.com',
      phone: '+33600000000',
      desiredMoveInDate: '2026-12-20',
      durationDays: 10,
      occupantsCount: 2,
      hasPets: false,
      hasCleaningFee: true,
      selectedRateId: 'lowSeason',
    });

  assert.equal(s.inserts[0].first_name, 'Camille');
  assert.equal(s.inserts[0].last_name, 'Martin');
  assert.equal(s.inserts[0].email, 'camille@example.com');
  assert.equal(s.inserts[0].phone, '+33600000000');
  assert.equal(s.inserts[0].desired_move_in_date, '2026-12-20');
  assert.equal(s.inserts[0].duration_days, 10);
  assert.equal(s.inserts[0].occupants_count, 2);
  assert.equal(s.inserts[0].selected_rate_id, 'lowSeason');
  assert.equal(s.inserts[0].rental_amount, 1000);
  assert.equal(s.inserts[0].has_cleaning_fee, true);
  assert.equal(s.inserts[0].cleaning_fee_amount, 125);
  assert.equal(s.inserts[0].payment_amount, 825);
  assert.equal(s.inserts.length, 1);
  assert.equal(s.alerts.length, 1);
  assert.equal(s.alerts[0].subject, 'Nouvelle demande de réservation — REN-2026-123456');
  assert.equal(s.alerts[0].details['E-mail'], 'camille@example.com');
  assert.equal(redirectUrl, '/appartements/chalet/reserver/confirmation?ref=REN-2026-123456');
});

test('Le formulaire affiche une confirmation sans promettre d’e-mail', async () => {
  const s = setup();

  const redirectUrl = await captureReservationRedirect(s.action, {
    propertyId: 'property-1',
    firstName: 'Camille',
    lastName: 'Martin',
    email: 'camille@example.com',
    phone: '+33600000000',
    desiredMoveInDate: '2026-12-20',
    durationDays: 10,
    occupantsCount: 2,
    hasPets: false,
    hasCleaningFee: true,
    selectedRateId: 'lowSeason',
  });

  assert.equal(redirectUrl, '/appartements/chalet/reserver/confirmation?ref=REN-2026-123456');
  const popup = fs.readFileSync('components/forms/reservation-confirmation-toast.tsx', 'utf8');
  assert.match(popup, /en attente de confirmation/);
  assert.doesNotMatch(popup, /mail|e-mail/i);
});

test('Sans sélection du client, aucun forfait ménage n’est ajouté au montant', async () => {
  const s = setup({ hasCleaningFee: false });

  await captureReservationRedirect(s.action, {
      propertyId: 'property-1',
      firstName: 'Camille',
      lastName: 'Martin',
      email: 'camille@example.com',
      phone: '+33600000000',
      desiredMoveInDate: '2026-12-20',
      durationDays: 10,
      occupantsCount: 2,
      hasPets: false,
      hasCleaningFee: false,
      selectedRateId: 'lowSeason',
    });

  assert.equal(s.inserts[0].has_cleaning_fee, false);
  assert.equal(s.inserts[0].cleaning_fee_amount, 0);
  assert.equal(s.inserts[0].payment_amount, 700);
});

test('Le serveur ne facture pas un forfait ménage absent de la configuration du logement', async () => {
  const s = setup({ serviceCharges: 0 });

  await captureReservationRedirect(s.action, {
      propertyId: 'property-1',
      firstName: 'Camille',
      lastName: 'Martin',
      email: 'camille@example.com',
      phone: '+33600000000',
      desiredMoveInDate: '2026-12-20',
      durationDays: 10,
      occupantsCount: 2,
      hasPets: false,
      hasCleaningFee: true,
      selectedRateId: 'lowSeason',
    });

  assert.equal(s.inserts[0].has_cleaning_fee, false);
  assert.equal(s.inserts[0].cleaning_fee_amount, 0);
  assert.equal(s.inserts[0].payment_amount, 700);
});

test('La confirmation finale annonce que la demande est en attente de confirmation', () => {
  const confirmation = fs.readFileSync(
    'app/(public)/appartements/[slug]/reserver/confirmation/page.tsx',
    'utf8'
  );
  const progress = fs.readFileSync('components/forms/reservation-progress.tsx', 'utf8');

  assert.doesNotMatch(confirmation, /BankTransferInstructions|BankSettings|RIB|virement à effectuer|getReservationByReference/);
  assert.match(confirmation, /ReservationProgress activeStep=\{3\}/);
  assert.match(confirmation, /en attente de confirmation/);
  assert.match(confirmation, /attente de confirmation par notre équipe/);
  assert.match(confirmation, /searchParams\.ref/);
  assert.doesNotMatch(progress, /Paiement par RIB/);
  assert.match(progress, /'Vos coordonnées', 'Votre projet', 'Récapitulatif'/);
  assert.doesNotMatch(progress, /'Confirmation'/);
});

test('Le flow réservation conserve le tarif choisi et envoie la demande depuis le récapitulatif', () => {
  const form = fs.readFileSync('components/forms/reservation-form.tsx', 'utf8');
  assert.match(form, /const FORM_STEP_COUNT = 3/);
  assert.match(form, /register\('selectedRateId'\)/);
  assert.match(form, /handleSubmit\(onSubmit\)/);
  assert.match(form, /createReservation\(data, propertySlug\)/);
  assert.match(form, /key="send-request"/);
  assert.match(form, /Confirmer la demande/);
  assert.match(form, /event\.preventDefault\(\)/);
  assert.match(form, /propertySlug/);
  const page = fs.readFileSync('app/(public)/appartements/[slug]/reserver/page.tsx', 'utf8');
  assert.match(page, /propertySlug=\{property\.slug\}/);
});

test('Le récapitulatif affiche le RIB sans les messages de précaution supprimés', () => {
  const form = fs.readFileSync('components/forms/reservation-form.tsx', 'utf8');
  const bankTransferInstructions = fs.readFileSync('components/shared/bank-transfer-instructions.tsx', 'utf8');
  const page = fs.readFileSync('app/(public)/appartements/[slug]/reserver/page.tsx', 'utf8');

  assert.match(page, /getBankSettings\(\)/);
  assert.match(form, /<BankTransferInstructions[\s\S]*?amount=\{null\}/);
  assert.doesNotMatch(form, /RIB est affiché à titre indicatif|N’effectuez aucun virement/);
  assert.doesNotMatch(bankTransferInstructions, /Le montant sera confirmé par notre équipe avant le virement/);
});
