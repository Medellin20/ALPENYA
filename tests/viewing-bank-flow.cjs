const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('Les parcours publics de visite et de réservation sont retirés', () => {
  const removedFiles = [
    'app/(public)/appartements/[slug]/reagir/page.tsx',
    'app/(public)/appartements/[slug]/visite/page.tsx',
    'app/(public)/appartements/[slug]/visite/confirmation/page.tsx',
    'app/(public)/appartements/[slug]/reserver/page.tsx',
    'app/(public)/appartements/[slug]/reserver/confirmation/page.tsx',
    'components/forms/viewing-request-form.tsx',
    'components/forms/reservation-form.tsx',
    'actions/viewings.ts',
    'actions/reservations.ts',
  ];

  for (const file of removedFiles) assert.equal(fs.existsSync(file), false, `${file} doit être supprimé`);
});

test('La fiche logement renvoie les visiteurs vers le formulaire de contact', () => {
  const page = fs.readFileSync('app/(public)/appartements/[slug]/page.tsx', 'utf8');
  assert.match(page, /href="\/contact"/);
  assert.match(page, /Contacter l’agence/);
  assert.doesNotMatch(page, /\/reagir|\/reserver|\/visite/);
});

test('La gestion administrative des demandes déjà enregistrées reste disponible', () => {
  assert.equal(fs.existsSync('app/admin/(dashboard)/visites/page.tsx'), true);
  assert.equal(fs.existsSync('app/admin/(dashboard)/reservations/page.tsx'), true);
});
