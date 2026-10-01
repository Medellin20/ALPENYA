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
    const sent = await email.sendAdminAlert('Test alerte', { Référence: 'TEST-123' });

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
