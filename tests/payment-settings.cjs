const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, imports) {
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const context = { exports: {}, URL, require: name => {
    assert.ok(name in imports, `Unexpected import: ${name}`);
    return imports[name];
  } };
  vm.runInNewContext(source, context);
  return context.exports;
}
const schemas = load('lib/validations/payment.ts', { zod: require('zod') });
test('Accept HTTPS payment URLs and removing the link; reject unsafe URLs', () => {
  for (const value of ['', 'https://example.com/pay?ref=abc']) {
    assert.equal(schemas.paymentSettingsSchema.safeParse({ paymentUrl: value }).success, true);
  }
  for (const value of ['http://example.com', 'javascript:alert(1)', 'https://user:pass@example.com', '//example.com', 'invalid']) {
    assert.equal(schemas.paymentSettingsSchema.safeParse({ paymentUrl: value }).success, false);
  }
});
function setup({ authenticated = true, error = null, url = 'https://example.com/pay' } = {}) {
  const writes = [], paths = [];
  let clients = 0;
  const client = { from: () => ({
    upsert: async data => { writes.push(data); return { error }; },
    select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { payment_url: url }, error }) }) }),
  }) };
  const supabase = { createAdminClient: () => { clients++; return client; } };
  const action = load('actions/admin-payment.ts', {
    'next/headers': { cookies: () => ({ get: () => ({ value: 'token' }) }) },
    'next/cache': { revalidatePath: path => paths.push(path) },
    '@/lib/auth/admin-session': { isValidAdminSessionToken: async () => authenticated },
    '@/lib/utils/constants': { ADMIN_SESSION_COOKIE: 'admin' },
    '@/lib/supabase/admin': supabase,
    '@/lib/validations/payment': schemas,
  });
  const reader = load('lib/data/payment-settings.ts', {
    'server-only': {}, '@/lib/supabase/admin': supabase, '@/lib/validations/payment': schemas,
  });
  return { action, reader, writes, paths, clients: () => clients };
}
test('An unauthenticated caller cannot change the payment destination', async () => {
  const s = setup({ authenticated: false });
  assert.equal((await s.action.updatePaymentSettings({ paymentUrl: 'https://example.com' })).success, false);
  assert.equal(s.clients(), 0);
});
test('Invalid URLs never reach the database', async () => {
  const s = setup();
  assert.equal((await s.action.updatePaymentSettings({ paymentUrl: 'javascript:alert(1)' })).success, false);
  assert.equal(s.clients(), 0);
});
test('Saving and clearing the link refreshes both final steps', async () => {
  const s = setup();
  for (const paymentUrl of ['https://example.com/new', '']) {
    assert.equal((await s.action.updatePaymentSettings({ paymentUrl })).success, true);
    assert.equal(s.writes.at(-1).payment_url, paymentUrl);
  }
  assert.ok(s.paths.includes('/appartements/[slug]/visite/confirmation'));
  assert.ok(s.paths.includes('/appartements/[slug]/reserver/confirmation'));
});
test('Database errors do not report successful saves', async () => {
  const s = setup({ error: { message: 'unavailable' } });
  assert.equal((await s.action.updatePaymentSettings({ paymentUrl: 'https://example.com' })).success, false);
  assert.equal(s.paths.length, 0);
});
test('Missing or unsafe configured links are not exposed to clients', async () => {
  for (const url of ['', 'javascript:alert(1)', null]) {
    const s = setup({ url });
    assert.equal((await s.reader.getPaymentSettings()).paymentUrl, '');
  }
});
