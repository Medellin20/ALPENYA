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
    console,
    process,
    require: name => {
      assert.ok(name in imports, `Unexpected import: ${name}`);
      return imports[name];
    },
  };
  vm.runInNewContext(source, context);
  return context.exports;
}

const pricing = load('lib/utils/reservation-payment.ts', {});

function setup({ hasCleaningFee = true, serviceCharges = 125, emailSent = true } = {}) {
  const inserts = [];
  const emails = [];
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
                    service_charges: serviceCharges,
                    cleaning_fee: 0,
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
    'next/cache': { revalidatePath: () => {} },
    '@/lib/supabase/admin': supabase,
    '@/lib/data/clients': { upsertClient: async () => ({ id: 'client-1' }) },
    '@/lib/data/history': { recordStatusChange: async () => {} },
    '@/lib/validations/reservation': { reservationSchema: { safeParse: data => ({ success: true, data }) } },
    '@/lib/utils/reference': { generateReference: () => 'REN-2026-123456' },
    '@/lib/notifications/email': {
      sendAdminAlert: async (subject, data) => {
        emails.push({ subject, data });
        return emailSent;
      },
    },
    '@/lib/utils/reservation-payment': pricing,
  });
  return { action, inserts, emails };
}

test('La demande envoie l’alerte et retourne explicitement l’URL de l’étape RIB', async () => {
  const s = setup();

  const result = await s.action.createReservation({
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

  assert.equal(result.success, true);
  assert.equal(s.inserts[0].rental_amount, 1000);
  assert.equal(s.inserts[0].has_cleaning_fee, true);
  assert.equal(s.inserts[0].cleaning_fee_amount, 125);
  assert.equal(s.inserts[0].payment_amount, 825);
  assert.equal(s.emails.length, 1);
  assert.equal(s.emails[0].data['Client'], 'Camille Martin');
  assert.equal(s.emails[0].data['Email'], 'camille@example.com');
  assert.equal(s.emails[0].data['Téléphone'], '+33600000000');
  assert.equal(s.emails[0].data['Période tarifaire'], 'Hors saison');
  assert.equal(s.emails[0].data['Tarif de base'], '700 € / semaine');
  assert.equal(s.emails[0].data['Acompte (40 %)'], 400);
  assert.equal(s.emails[0].data['Caution'], 300);
  assert.equal(s.emails[0].data['Ménage demandé'], 'Oui');
  assert.equal(s.emails[0].data['Forfait ménage'], 125);
  assert.equal(s.emails[0].data['Montant à régler (acompte + caution)'], 825);
  assert.equal(
    result.data.confirmationUrl,
    '/appartements/chalet/reserver/confirmation?ref=REN-2026-123456&email=camille%40example.com'
  );
});

test('Si l’e-mail configuré ne peut pas être envoyé, la demande ne renvoie pas une URL de confirmation', async () => {
  const s = setup({ emailSent: false });

  const result = await s.action.createReservation({
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

  assert.equal(s.emails.length, 1);
  assert.equal(result.success, false);
  assert.equal(result.data, undefined);
});

test('Une erreur SMTP détaillée est écrite dans la console sans exposer les identifiants', async () => {
  const keys = ['GMAIL_USER', 'GMAIL_APP_PASSWORD', 'ALERT_EMAIL'];
  const originalValues = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  const credentials = {
    GMAIL_USER: 'smtp-user-test@example.invalid',
    GMAIL_APP_PASSWORD: 'smtp-test-secret',
    ALERT_EMAIL: 'alerts-test@example.invalid',
  };
  const smtpError = Object.assign(new Error('Invalid login'), {
    code: 'EAUTH',
    command: 'AUTH PLAIN',
    responseCode: 535,
    response: '535-5.7.8 Username and Password not accepted',
  });
  const logs = [];
  const originalConsoleError = console.error;

  try {
    Object.assign(process.env, credentials);
    console.error = (...args) => logs.push(args);

    const email = load('lib/notifications/email.ts', {
      'server-only': {},
      nodemailer: {
        default: {
          createTransport: () => ({
            sendMail: async () => { throw smtpError; },
          }),
        },
      },
    });
    const sent = await email.sendAdminAlert('Test réservation', { Référence: 'REN-TEST' });

    assert.equal(sent, false);
    assert.equal(logs.length, 1);
    assert.match(logs[0][0], /Détails SMTP/);
    assert.equal(logs[0][1].message, 'Invalid login');
    assert.equal(logs[0][1].code, 'EAUTH');
    assert.equal(logs[0][1].command, 'AUTH PLAIN');
    assert.equal(logs[0][1].responseCode, 535);
    assert.match(logs[0][1].response, /Username and Password not accepted/);
    assert.doesNotMatch(JSON.stringify(logs), /smtp-user-test|smtp-test-secret|alerts-test/);
  } finally {
    console.error = originalConsoleError;
    for (const key of keys) {
      if (originalValues[key] === undefined) delete process.env[key];
      else process.env[key] = originalValues[key];
    }
  }
});

test('Sans sélection du client, aucun forfait ménage n’est ajouté au montant', async () => {
  const s = setup({ hasCleaningFee: false });

  const result = await s.action.createReservation({
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
    }, 'chalet');

  assert.equal(result.success, true);
  assert.equal(s.inserts[0].has_cleaning_fee, false);
  assert.equal(s.inserts[0].cleaning_fee_amount, 0);
  assert.equal(s.inserts[0].payment_amount, 700);
});

test('Le serveur ne facture pas un forfait ménage absent de la configuration du logement', async () => {
  const s = setup({ serviceCharges: 0 });

  const result = await s.action.createReservation({
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

  assert.equal(result.success, true);
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
  const dataSource = fs.readFileSync('lib/data/dossier.ts', 'utf8');

  assert.doesNotMatch(confirmation, /BankTransferInstructions|BankSettings|RIB|virement à effectuer/);
  assert.match(confirmation, /ReservationProgress activeStep=\{3\}/);
  assert.match(confirmation, /Votre demande de réservation est en attente de confirmation/);
  assert.match(confirmation, /En attente de confirmation/);
  assert.match(confirmation, /reservation\.payment_amount/);
  assert.doesNotMatch(progress, /Paiement par RIB/);
  assert.match(progress, /'Récapitulatif'/);
  assert.match(dataSource, /\.select\('\*, properties/);
});

test('Le formulaire transmet le tarif choisi sans changer son bouton d’envoi', () => {
  const form = fs.readFileSync('components/forms/reservation-form.tsx', 'utf8');
  assert.match(form, /const FORM_STEP_COUNT = 3/);
  assert.match(form, /register\('selectedRateId'\)/);
  assert.match(form, /handleSubmit\(onSubmit\)/);
  assert.match(form, /createReservation\(data, propertySlug\)/);
  assert.match(form, /router\.push\(result\.data\.confirmationUrl\)/);
});
