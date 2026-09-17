const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, imports = {}, globals = {}) {
  const context = { exports: {}, ...globals, require(name) {
    assert.ok(name in imports, `Unexpected import: ${name}`);
    return imports[name];
  } };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, context);
  return context.exports;
}

for (const clientType of ['server', 'admin']) {
  test(`${clientType} Supabase client bypasses cached prices and preserves request options`, async () => {
    let options;
    const calls = [];
    const { fetchNoStore } = load('lib/supabase/fetch-no-store.ts', {}, {
      fetch: async (input, init) => { calls.push({ input, init }); return new Response('[]'); },
    });
    const create = (url, key, config) => { options = config; return {}; };
    const imports = {
      './fetch-no-store': { fetchNoStore },
      ...(clientType === 'server' ? {
        'next/headers': { cookies: () => ({ get() {} }) },
        '@supabase/ssr': { createServerClient: create },
      } : {
        'server-only': {}, '@supabase/supabase-js': { createClient: create },
      }),
    };
    const client = load(`lib/supabase/${clientType}.ts`, imports, { process: { env: {
      NEXT_PUBLIC_SUPABASE_URL: 'http://localhost', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon', SUPABASE_SERVICE_ROLE_KEY: 'test',
    } } });
    client[clientType === 'server' ? 'createClient' : 'createAdminClient']();
    const headers = { Authorization: 'Bearer test' };
    const signal = new AbortController().signal;
    await options.global.fetch('http://localhost/rest/v1/properties', { method: 'GET', headers });
    await options.global.fetch('http://localhost/rest/v1/properties', { method: 'PATCH', headers, body: '{"monthly_price":2100}', signal });
    assert.ok(calls.every(call => call.init.cache === 'no-store'));
    assert.equal(calls[1].init.method, 'PATCH');
    assert.equal(calls[1].init.body, '{"monthly_price":2100}');
    assert.equal(calls[1].init.headers, headers);
    assert.equal(calls[1].init.signal, signal);
  });
}

test('Returning to a public page refreshes prices once and cleans up event listeners', () => {
  const window = new EventTarget();
  const document = new EventTarget();
  document.visibilityState = 'visible';
  let cleanup, refreshes = 0, now = 2000;
  const { RefreshOnReturn } = load('components/layout/refresh-on-return.tsx', {
    react: { useEffect: effect => { cleanup = effect(); } },
    'next/navigation': { useRouter: () => ({ refresh: () => { refreshes++; } }) },
  }, { window, document, Date: { now: () => now } });
  RefreshOnReturn();
  assert.equal(refreshes, 0);
  document.visibilityState = 'hidden';
  document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(refreshes, 0);
  document.visibilityState = 'visible';
  document.dispatchEvent(new Event('visibilitychange'));
  window.dispatchEvent(new Event('focus'));
  assert.equal(refreshes, 1);
  now += 1500;
  const restored = new Event('pageshow');
  restored.persisted = true;
  window.dispatchEvent(restored);
  assert.equal(refreshes, 2);
  cleanup();
  now += 1500;
  window.dispatchEvent(new Event('focus'));
  document.dispatchEvent(new Event('visibilitychange'));
  window.dispatchEvent(restored);
  assert.equal(refreshes, 2);
});
