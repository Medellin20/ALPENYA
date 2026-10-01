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

const schemas = load('lib/validations/admin.ts', { zod: require('zod') });

function setup({ error = null, row = { id: 1 } } = {}) {
  const writes = [];
  const paths = [];
  const supabase = {
    createAdminClient: () => ({
      from: table => {
        assert.equal(table, 'bank_settings');
        return {
          update: data => {
            writes.push(data);
            return {
              eq: (column, value) => {
                assert.equal(column, 'id');
                assert.equal(value, 1);
                return {
                  select: columns => {
                    assert.equal(columns, 'id');
                    return { maybeSingle: async () => ({ data: row, error }) };
                  },
                };
              },
            };
          },
        };
      },
    }),
  };
  const action = load('actions/admin-bank.ts', {
    'next/cache': { revalidatePath: path => paths.push(path) },
    '@/lib/supabase/admin': supabase,
    '@/lib/data/history': { logAdminAction: async () => {} },
    '@/lib/validations/admin': schemas,
  });
  return { action, writes, paths };
}

const settings = {
  beneficiaryName: 'Alpenia',
  iban: 'FR7612345678901234567890123',
  bic: 'AGRIFRPP',
  paymentInstructions: 'Indiquer la référence du dossier.',
  defaultDepositAmount: '1250.50',
};

test('La configuration bancaire enregistre le RIB et le montant sans nom de banque', async () => {
  const s = setup();
  const result = await s.action.updateBankSettings(settings);

  assert.equal(result.success, true);
  assert.deepEqual(JSON.parse(JSON.stringify(s.writes)), [{
    beneficiary_name: settings.beneficiaryName,
    iban: settings.iban,
    bic: settings.bic,
    payment_instructions: settings.paymentInstructions,
    default_deposit_amount: 1250.5,
  }]);
  assert.ok(s.paths.includes('/admin/configuration-bancaire'));
});

test('Une erreur ou une configuration inexistante ne signale pas une sauvegarde réussie', async () => {
  for (const options of [{ error: { message: 'unavailable' } }, { row: null }]) {
    const s = setup(options);
    const result = await s.action.updateBankSettings(settings);
    assert.equal(result.success, false);
    assert.equal(s.paths.length, 0);
  }
});

test('Les champs invalides sont rejetés avant toute écriture', async () => {
  const s = setup();
  const result = await s.action.updateBankSettings({ ...settings, iban: 'invalid' });

  assert.equal(result.success, false);
  assert.equal(s.writes.length, 0);
});

test('Le formulaire admin ne présente plus le champ du nom de la banque', () => {
  const form = fs.readFileSync('components/admin/bank-settings-form.tsx', 'utf8');
  assert.equal(form.includes('register(\'bankName\')'), false);
  assert.equal(form.includes('htmlFor="bankName"'), false);
  assert.equal(form.includes('htmlFor="defaultDepositAmount"'), false);
  assert.equal(form.includes('type="hidden" {...register(\'defaultDepositAmount\')}'), true);
});

test('Le RIB de démonstration fourni par le schéma est reconnu comme tel', () => {
  const bank = load('lib/data/bank.ts', {
    'server-only': {},
    '@/lib/supabase/admin': { createAdminClient: () => ({}) },
  });
  assert.equal(bank.isDemoBankSettings({ iban: 'FR00 0000 0000 0000 0000 0000 000' }), true);
});
