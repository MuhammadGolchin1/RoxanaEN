import test from 'node:test';
import assert from 'node:assert/strict';
import french from '../src/i18n/fr.json' with { type: 'json' };
import { LANGUAGE_KEY, localizedBmi, readLanguage, rememberLanguage, translate } from '../src/i18n/translations.js';
import { calculateBmi } from '../src/lib/assessment.js';

test('English is preserved exactly and French text retains intentional spaces', () => {
  assert.equal(translate('Your details', 'en'), 'Your details');
  assert.equal(translate(' Your details', 'fr'), ' Vos informations');
  assert.equal(translate('Health conditions ', 'fr'), 'Problèmes de santé ');
  assert.equal(translate(undefined, 'fr'), '');
  assert.equal(translate('A user-written answer', 'fr'), 'A user-written answer');
});

test('dynamic progress, file descriptions and already visible length errors are translated', () => {
  assert.equal(translate('Step {step} of 4', 'fr', {step: 2}), 'Étape 2 sur 4');
  assert.equal(translate('{count} of 23 answered', 'fr', {count: 6}), '6 réponses sur 23');
  assert.equal(translate('Attached photos: {views}', 'fr', {views: 'De face'}), 'Photos jointes : De face');
  assert.equal(translate('Please shorten your answer to no more than 1800 characters.', 'fr'), 'Veuillez limiter votre réponse à 1800 caractères.');
});

test('the saved language survives navigation and storage failures fall back safely', () => {
  const values = new Map();
  const storage = {getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value)};
  assert.equal(readLanguage(storage),'en');
  rememberLanguage('fr',storage);assert.equal(values.get(LANGUAGE_KEY),'fr');assert.equal(readLanguage(storage),'fr');
  rememberLanguage('unsupported',storage);assert.equal(readLanguage(storage),'fr');
  const blocked={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};
  assert.equal(readLanguage(blocked),'en');assert.doesNotThrow(()=>rememberLanguage('fr',blocked));
});

test('French BMI formatting supports decimal commas without rounding across the assessment cutoff', () => {
  assert.equal(localizedBmi(calculateBmi('200','119.99'),'fr'),'29,99');
  assert.equal(localizedBmi(calculateBmi('200','120'),'fr'),'30,0');
  assert.equal(localizedBmi(calculateBmi('165','84.5'),'en'),'31.04');
  assert.equal(localizedBmi(calculateBmi('165','84,5'),'fr'),'31,04');
});

test('all French entries have text and preserve their dynamic placeholders', () => {
  assert.ok(Object.keys(french).length > 300);
  for(const [english,translated] of Object.entries(french)){
    assert.ok(translated.trim().length>0,`Empty translation: ${english}`);
    assert.deepEqual([...translated.matchAll(/\{(\w+)\}/g)].map(x=>x[1]).sort(),[...english.matchAll(/\{(\w+)\}/g)].map(x=>x[1]).sort(),`Placeholder mismatch: ${english}`);
  }
});
