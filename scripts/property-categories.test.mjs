import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import ts from 'typescript';

// Exécute le véritable schéma TypeScript sans ajouter de dépendance de test.
const schemaUrl = new URL('../lib/validations/property.ts', import.meta.url);
const { outputText } = ts.transpileModule(readFileSync(schemaUrl, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
});
const schemaExports = {};
new Function('require', 'exports', outputText)(createRequire(schemaUrl), schemaExports);
const { propertySchema } = schemaExports;

const base = {
  title: 'Logement de test à Annecy',
  description: 'Un logement lumineux avec deux chambres, une salle de bain et une terrasse.',
  slug: 'logement-de-test-annecy',
  city: 'Annecy',
  surfaceM2: 60,
  monthlyPrice: 900,
  serviceCharges: 80,
  depositAmount: 900,
  viewingFee: 0,
  bedrooms: 2,
  bathrooms: 1,
  contractType: 'Location saisonnière à la semaine',
  interiorType: 'Meublé',
  isFurnished: true,
  maintenanceCondition: 'Bien',
  minimumStayMonths: 1,
  status: 'draft',
};
const studio = {
  ...base,
  propertyType: 'furnished_studio',
  contractType: 'Location au mois',
  interiorType: 'Meublé',
  isFurnished: true,
};

for (const propertyType of ['chalet', 'villa']) {
  test(`Le parcours historique ${propertyType} reste accepté sans surface`, () => {
    const result = propertySchema.safeParse({ ...base, surfaceM2: undefined, propertyType });
    assert.equal(result.success, true);
  });
}

test('Un appartement meublé conserve son loyer, ses charges et sa caution', () => {
  const result = propertySchema.parse(studio);
  assert.equal(result.propertyType, 'furnished_studio');
  assert.equal(result.isFurnished, true);
  assert.equal(result.monthlyPrice, 900);
  assert.equal(result.serviceCharges, 80);
  assert.equal(result.depositAmount, 900);
  assert.equal(result.isPublished, false);
});

test('Le serveur refuse un appartement déclaré non meublé ou saisonnier', () => {
  for (const override of [
    { isFurnished: false },
    { interiorType: 'Non meublé' },
    { contractType: 'Location saisonnière à la semaine' },
  ]) {
    const result = propertySchema.safeParse({ ...studio, ...override });
    assert.equal(result.success, false);
    assert.ok(result.error.issues.some(issue => issue.path[0] === Object.keys(override)[0]));
  }
});

test('Un mobil-home peut être créé, modifié et publié avec un tarif hebdomadaire', () => {
  const result = propertySchema.parse({ ...base, propertyType: 'mobile_home', monthlyPrice: '450', surfaceM2: '32', isPublished: true, status: 'available' });
  assert.equal(result.monthlyPrice, 450);
  assert.equal(result.surfaceM2, 32);
  assert.equal(result.isPublished, true);
  assert.equal(result.propertyType, 'mobile_home');
});

test('Le mobil-home ne peut pas annoncer un contrat mensuel avec un prix hebdomadaire', () => {
  assert.equal(propertySchema.safeParse({ ...base, propertyType: 'mobile_home', contractType: 'Location au mois' }).success, false);
});

for (const propertyType of ['furnished_studio', 'mobile_home']) {
  test(`${propertyType} exige une surface, un tarif et une durée valides`, () => {
    const values = propertyType === 'furnished_studio' ? studio : { ...base, propertyType };
    for (const override of [
      { surfaceM2: undefined }, { surfaceM2: 0 }, { monthlyPrice: 0 },
      { minimumStayMonths: 0 }, { depositAmount: -1 }, { serviceCharges: -1 },
    ]) assert.equal(propertySchema.safeParse({ ...values, ...override }).success, false);
  });
}

test('Une catégorie inconnue est refusée', () => {
  assert.equal(propertySchema.safeParse({ ...base, propertyType: 'unknown' }).success, false);
});

test('L’ancienne catégorie non meublée est refusée', () => {
  assert.equal(propertySchema.safeParse({ ...studio, propertyType: 'unfurnished_apartment' }).success, false);
});
