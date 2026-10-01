const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

const source = ts.transpileModule(fs.readFileSync('lib/utils/reservation-payment.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const context = { exports: {} };
vm.runInNewContext(source, context);
const { calculateReservationPayment, calculateStayRentalAmount } = context.exports;

test('Le montant à payer correspond à 40 % du séjour plus 300 € de caution', () => {
  assert.deepEqual(
    JSON.parse(JSON.stringify(calculateReservationPayment(1425.5))),
    { rentalAmount: 1425.5, depositAmount: 570.2, guaranteeAmount: 300, cleaningFee: 0, totalAmount: 870.2 }
  );
});

test('Le forfait ménage choisi s’ajoute au total sans augmenter la base de l’acompte', () => {
  assert.deepEqual(
    JSON.parse(JSON.stringify(calculateReservationPayment(1000, 125))),
    { rentalAmount: 1000, depositAmount: 400, guaranteeAmount: 300, cleaningFee: 125, totalAmount: 825 }
  );
});

test('Le tarif hebdomadaire est proratisé sur la durée réelle du séjour', () => {
  assert.equal(calculateStayRentalAmount(700, 10, 'week'), 1000);
  assert.equal(calculateStayRentalAmount(700, 7, 'week'), 700);
});

test('Le tarif mensuel est proratisé sur la durée réelle du séjour', () => {
  assert.equal(calculateStayRentalAmount(1500, 15, 'month'), 750);
});

test('Aucun total n’est calculé pour un prix ou une durée invalide', () => {
  assert.equal(calculateStayRentalAmount(0, 7, 'week'), null);
  assert.equal(calculateStayRentalAmount(700, 0, 'week'), null);
});

test('Le formulaire affiche le détail de l’acompte, de la caution et du total', () => {
  const form = fs.readFileSync('components/forms/reservation-form.tsx', 'utf8');
  const notice = fs.readFileSync('components/forms/reservation-payment-notice.tsx', 'utf8');
  assert.match(form, /calculateStayRentalAmount/);
  assert.match(notice, /Acompte \(40 %\)/);
  assert.match(notice, /Caution/);
  assert.match(notice, /Total à régler/);
});
