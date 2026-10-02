const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function loadAlertModule({ fetchImpl, env, log = () => {} }) {
  const source = ts.transpileModule(fs.readFileSync('lib/notifications/alerts.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const context = {
    exports: {},
    process: { env },
    fetch: fetchImpl,
    console: { error: log },
    require: name => {
      assert.equal(name, 'server-only');
      return {};
    },
  };
  vm.runInNewContext(source, context);
  return context.exports;
}

test('La fonction envoie une alerte à Resend par HTTP sans dépendance Nodemailer', async () => {
  let request;
  const alert = loadAlertModule({
    env: {
      RESEND_API_KEY: 're_test_secret',
      ALERT_EMAIL: 'alerts@example.com',
      ALERT_FROM_EMAIL: 'ALPENIA <alerts@verified.example.com>',
    },
    fetchImpl: async (url, options) => {
      request = { url, options };
      return { ok: true, status: 200 };
    },
  });

  await alert.sendRequestAlert('Nouvelle visite', {
    Référence: 'VIS-123',
    Client: '<Client>',
  });

  assert.equal(request.url, 'https://api.resend.com/emails');
  assert.equal(request.options.method, 'POST');
  assert.equal(request.options.headers.Authorization, 'Bearer re_test_secret');
  const body = JSON.parse(request.options.body);
  assert.equal(body.from, 'ALPENIA <alerts@verified.example.com>');
  assert.deepEqual(body.to, ['alerts@example.com']);
  assert.equal(body.subject, 'Nouvelle visite');
  assert.match(body.text, /Référence: VIS-123/);
  assert.match(body.html, /&lt;Client&gt;/);
  assert.equal(fs.readFileSync('lib/notifications/alerts.ts', 'utf8').includes('nodemailer'), false);
});

test('Une erreur Resend est signalée en console sans révéler la clé API', async () => {
  const logs = [];
  const alert = loadAlertModule({
    env: {
      RESEND_API_KEY: 're_test_secret',
      ALERT_EMAIL: 'alerts@example.com',
      ALERT_FROM_EMAIL: 'alerts@verified.example.com',
    },
    fetchImpl: async () => ({
      ok: false,
      status: 422,
      text: async () => 'Invalid sender re_test_secret',
    }),
    log: (...args) => logs.push(args),
  });

  await alert.sendRequestAlert('Nouvelle réservation', { Référence: 'REN-123' });

  assert.equal(logs.length, 1);
  assert.match(logs[0][0], /HTTP 422/);
  assert.match(logs[0][0], /\[masqué\]/);
  assert.doesNotMatch(logs[0][0], /re_test_secret/);
});

test('La configuration Resend incomplète indique les variables manquantes', async () => {
  const logs = [];
  let requested = false;
  const alert = loadAlertModule({
    env: { RESEND_API_KEY: 're_test_secret' },
    fetchImpl: async () => {
      requested = true;
      return { ok: true, status: 200 };
    },
    log: (...args) => logs.push(args),
  });

  await alert.sendRequestAlert('Nouvelle réservation', {});

  assert.equal(requested, false);
  assert.match(logs[0][0], /ALERT_EMAIL, ALERT_FROM_EMAIL/);
});
