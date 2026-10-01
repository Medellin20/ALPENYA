const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('Les annonces ne proposent plus les parcours de réservation ou de visite', () => {
  const files = [
    'app/(public)/page.tsx',
    'app/(public)/comment-ca-marche/page.tsx',
    'app/(public)/faq/page.tsx',
    'app/(public)/appartements/[slug]/page.tsx',
  ];
  const copy = files.map(file => fs.readFileSync(file, 'utf8')).join('\n');

  assert.doesNotMatch(copy, /\/reagir|\/reserver|\/visite/);
  assert.match(copy, /Contacter l’agence/);
  assert.match(copy, /formulaire de contact/);
});
