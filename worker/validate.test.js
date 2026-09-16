import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateContact, PRESTATIONS } from './validate.js';

const good = {
  nom: 'Etcheverry', prenom: 'Maialen', email: 'maialen@example.com', tel: '',
  prestation: 'ouverture', vehicule: '', assureur: '', message: 'Merci de me prévenir à l\'ouverture.', consent: 'on',
};

test('cas nominal → ok avec données nettoyées', () => {
  const r = validateContact({ ...good, nom: '  Etcheverry ' });
  assert.equal(r.ok, true);
  assert.equal(r.data.nom, 'Etcheverry');
  assert.equal(r.data.prestation, 'ouverture');
});

test('champs requis manquants → erreurs par champ', () => {
  const r = validateContact({ ...good, nom: '', email: '', message: '', consent: '' });
  assert.equal(r.ok, false);
  assert.deepEqual(Object.keys(r.errors).sort(), ['consent', 'email', 'message', 'nom']);
});

test('email invalide', () => {
  const r = validateContact({ ...good, email: 'pas-un-email' });
  assert.equal(r.ok, false);
  assert.equal(r.errors.email, 'Email invalide');
});

test('prestation hors liste', () => {
  const r = validateContact({ ...good, prestation: 'vidange' });
  assert.equal(r.ok, false);
  assert.ok(r.errors.prestation);
  assert.ok(PRESTATIONS.includes('ouverture'));
});

test('message trop court ou trop long', () => {
  assert.equal(validateContact({ ...good, message: 'court' }).ok, false);
  assert.equal(validateContact({ ...good, message: 'x'.repeat(3001) }).ok, false);
  assert.equal(validateContact({ ...good, message: 'x'.repeat(3000) }).ok, true);
});

test('longueurs max des champs optionnels', () => {
  assert.equal(validateContact({ ...good, tel: '1'.repeat(31) }).ok, false);
  assert.equal(validateContact({ ...good, vehicule: 'v'.repeat(121) }).ok, false);
  assert.equal(validateContact({ ...good, assureur: 'a'.repeat(120) }).ok, true);
});

test('valeurs non-string tolérées', () => {
  const r = validateContact({ ...good, tel: undefined, vehicule: null });
  assert.equal(r.ok, true);
  assert.equal(r.data.tel, '');
});
