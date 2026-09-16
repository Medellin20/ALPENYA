const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, imports) {
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const context = { exports: {}, console: { error() {} }, require: name => {
    assert.ok(name in imports, `Unexpected import: ${name}`);
    return imports[name];
  } };
  vm.runInNewContext(source, context);
  return context.exports;
}

const amenityUtils = load('lib/utils/property-amenities.ts', {});

function database(responses) {
  const calls = [];
  const client = {
    from(table) {
      const result = responses.shift();
      assert.ok(result, `Missing response for ${table}`);
      const query = { then: (resolve, reject) => Promise.resolve(result).then(resolve, reject) };
      for (const method of ['select', 'eq', 'neq', 'order', 'range', 'limit', 'update', 'upsert', 'not', 'insert', 'delete', 'single', 'maybeSingle']) {
        query[method] = (...args) => { calls.push({ table, method, args }); return query; };
      }
      return query;
    },
    storage: { from: () => ({ remove: async paths => { calls.push({ method: 'remove', paths }); return { error: null }; } }) },
  };
  return { client, calls };
}

function actions(responses) {
  const db = database(responses);
  const paths = [];
  const api = load('actions/admin-properties.ts', {
    '@/lib/utils/property-amenities': amenityUtils,
    'next/cache': { revalidatePath: path => paths.push(path) },
    '@/lib/supabase/admin': { createAdminClient: () => db.client },
    '@/lib/data/history': { logAdminAction: async () => {} },
    '@/lib/validations/property': { propertySchema: { safeParse: data => ({ success: true, data }) } },
  });
  return { ...db, api, paths };
}

for (const response of [{ error: { message: 'offline' }, data: null }, { error: null, data: null }]) {
  test(`No hardcoded chalet when database returns ${response.error ? 'an error' : 'no matching property'}`, async () => {
    const db = database(Array.from({ length: 7 }, () => response));
    const api = load('lib/data/properties.ts', { '@/lib/supabase/server': { createClient: () => db.client }, '@/lib/utils/property-amenities': amenityUtils });
    assert.equal(await api.getPropertyBySlug('chalet-la-clusaz-haute-savoie'), null);
    assert.equal((await api.getPublishedProperties()).properties.length, 0);
    for (const name of ['getFeaturedProperties', 'getAvailableCities', 'getAvailableCityCounts', 'getCityPropertySummaries', 'getAllPublishedSlugs']) {
      assert.equal((await api[name]()).length, 0);
    }
  });
}

test('Publishing a draft also makes it available', async () => {
  const { api, calls } = actions([{ data: { status: 'draft' } }, { data: { slug: 'chalet' } }]);
  assert.equal((await api.togglePropertyPublish('id', true)).success, true);
  const payload = calls.find(call => call.method === 'update').args[0];
  assert.equal(payload.is_published, true);
  assert.equal(payload.status, 'available');
});

test('Publishing an existing reserved property preserves its status', async () => {
  const { api, calls } = actions([{ data: { status: 'reserved' } }, { data: { slug: 'chalet' } }]);
  await api.togglePropertyPublish('id', true);
  assert.equal('status' in calls.find(call => call.method === 'update').args[0], false);
});

test('Returning to draft unpublishes the property', async () => {
  const { api, calls } = actions([{ data: { slug: 'chalet' } }]);
  await api.updatePropertyStatus('id', 'draft');
  assert.equal(calls.find(call => call.method === 'update').args[0].is_published, false);
});

test('Failed deletion does not delete photos or report success', async () => {
  const { api, calls } = actions([{ data: [{ storage_path: 'photo.jpg' }] }, { data: null, error: { message: 'foreign key' } }]);
  assert.equal((await api.deleteProperty('id')).success, false);
  assert.equal(calls.some(call => call.method === 'remove'), false);
});

test('Successful deletion removes files afterwards and invalidates the public detail', async () => {
  const { api, calls, paths } = actions([{ data: [{ storage_path: 'photo.jpg' }] }, { data: { slug: 'chalet' } }]);
  assert.equal((await api.deleteProperty('id')).success, true);
  assert.ok(calls.findIndex(call => call.method === 'remove') > calls.findIndex(call => call.method === 'delete'));
  assert.ok(paths.includes('/appartements/chalet'));
});

test('Updating a missing property fails before changing amenities', async () => {
  const { api } = actions([{ data: null }, { data: null, error: { message: 'missing' } }]);
  assert.equal((await api.updateProperty('id', { slug: 'chalet' })).success, false);
});

test('Pending lock lasts until settlement and blocks duplicate clicks', async () => {
  const states = [];
  const errors = [];
  const api = load('hooks/use-pending-action.ts', {
    react: { useState: () => [false, value => states.push(value)], useRef: value => ({ current: value }), useCallback: fn => fn },
    sonner: { toast: { error: message => errors.push(message) } },
  });
  const [, run] = api.usePendingAction();
  let finish;
  let count = 0;
  run(() => { count++; return new Promise(resolve => { finish = resolve; }); });
  run(async () => { count++; });
  assert.equal(count, 1);
  assert.deepEqual(states, [true]);
  finish();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(states, [true, false]);
  run(async () => { throw Error('offline'); });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(errors.length, 1);
  assert.deepEqual(states, [true, false, true, false]);
});


test('All configured equipment icons exist and the migration includes the full catalogue', () => {
  const icons = require('lucide-react');
  const seed = fs.readFileSync('supabase/seed.sql', 'utf8');
  const migration = fs.readFileSync('supabase/migrations/20260916_complete_amenities.sql', 'utf8');
  const rows = [...seed.matchAll(/\('([a-z_]+)', '([^']+)', '([^']+)'\)/g)];
  assert.equal(rows.length, 18);
  for (const [row, key, , icon] of rows) {
    assert.ok(icons[icon], `Missing icon: ${key}/${icon}`);
    assert.ok(migration.includes(row), `Missing migration entry: ${key}`);
  }
  assert.equal(/update bank_settings/i.test(migration), false);
});

test('Public equipment includes every checked feature without duplicates', () => {
  const property = Object.fromEntries(amenityUtils.PROPERTY_AMENITY_FIELDS.map(item => [item.column, true]));
  const listed = [{ id: 'parking-id', key: 'parking', label_fr: 'Parking', icon: 'SquareParking' }];
  const result = amenityUtils.getPropertyAmenities(property, listed);
  assert.equal(result.length, 6);
  assert.equal(result.find(item => item.key === 'parking').id, 'parking-id');
  assert.equal(amenityUtils.getPropertyAmenities({}, []).length, 0);
});

test('An equipment insert failure is reported and does not delete existing equipment', async () => {
  const { api, calls } = actions([
    { data: null }, { data: { id: 'id' } },
    { data: [{ id: 'wifi-id', key: 'wifi' }] },
    { error: { message: 'offline' } },
  ]);
  const result = await api.updateProperty('id', { slug: 'chalet', amenityIds: ['wifi-id'] });
  assert.equal(result.success, false);
  assert.equal(calls.some(call => call.table === 'property_amenities' && call.method === 'delete'), false);
});

test('Equipment save follows checked features and removes unchecked associations', async () => {
  const { api, calls } = actions([
    { data: null }, { data: { id: 'id' } },
    { data: [{ id: 'wifi-id', key: 'wifi' }, { id: 'parking-id', key: 'parking' }, { id: 'garage-id', key: 'garage' }] },
    { error: null }, { error: null },
  ]);
  const result = await api.updateProperty('id', { slug: 'chalet', amenityIds: ['wifi-id', 'parking-id'], hasParking: false, hasGarage: true });
  assert.equal(result.success, true);
  const inserted = calls.find(call => call.method === 'upsert').args[0].map(row => row.amenity_id);
  assert.equal(JSON.stringify(inserted), '["wifi-id","garage-id"]');
  assert.equal(calls.find(call => call.method === 'not').args[2], '(wifi-id,garage-id)');
});

test('Equipment removal failure cannot be reported as success', async () => {
  const { api } = actions([{ data: null }, { data: { id: 'id' } }, { data: [] }, { error: { message: 'offline' } }]);
  assert.equal((await api.updateProperty('id', { slug: 'chalet', amenityIds: [] })).success, false);
});
