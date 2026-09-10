import test from 'node:test';
import assert from 'node:assert/strict';
import { verbs, makeQuestions, isCorrect } from '../js/conjugation.mjs';
const shower = verbs.find(verb => verb.infinitive === 'ducharse');

test('practice covers each subject, with vosotros optional', () => {
  assert.equal(makeQuestions(verbs).length, verbs.length * 5);
  assert.equal(makeQuestions(verbs, true).length, verbs.length * 6);
  assert.ok(makeQuestions(verbs).every(question => question.person !== 4));
});

test('requires reflexive pronouns and the correct person', () => {
  const yo = makeQuestions([shower])[0];
  assert.ok(isCorrect(' Me   ducho ', yo));
  assert.ok(isCorrect('yo me ducho', yo));
  for (const wrong of ['ducho', 'se ducho', 'me duchas', 'tú me ducho', '']) {
    assert.equal(isCorrect(wrong, yo), false, wrong);
  }
});

test('preserves accents and accepts equivalent Unicode', () => {
  const vosotros = makeQuestions([shower], true)[4];
  assert.ok(isCorrect('os ducháis'.normalize('NFD'), vosotros));
  assert.equal(isCorrect('os duchais', vosotros), false);
});

test('stem changes exclude nosotros and vosotros; irregular forms are supported', () => {
  const lookup = Object.fromEntries(verbs.map(verb => [verb.infinitive, verb.forms]));
  assert.deepEqual(lookup.despertarse, ['me despierto', 'te despiertas', 'se despierta', 'nos despertamos', 'os despertáis', 'se despiertan']);
  assert.deepEqual(lookup.acostarse, ['me acuesto', 'te acuestas', 'se acuesta', 'nos acostamos', 'os acostáis', 'se acuestan']);
  assert.deepEqual(lookup.vestirse, ['me visto', 'te vistes', 'se viste', 'nos vestimos', 'os vestís', 'se visten']);
  assert.equal(lookup.ponerse[0], 'me pongo');
  assert.deepEqual(lookup.ir, ['voy', 'vas', 'va', 'vamos', 'vais', 'van']);
  assert.equal(lookup.irse, undefined, 'Exclude the starter verb absent from the supplied set');
});

test('accepts each matching subject variant', () => {
  const thirdPerson = makeQuestions([shower])[2];
  for (const subject of ['él', 'ella', 'usted']) assert.ok(isCorrect(`${subject} se ducha`, thirdPerson));
});

test('handles regular endings and phrases without dropping their objects', () => {
  const lookup = Object.fromEntries(verbs.map(verb => [verb.infinitive, verb.forms]));
  assert.deepEqual(lookup.leer, ['leo', 'lees', 'lee', 'leemos', 'leéis', 'leen']);
  assert.equal(lookup['lavarse las manos'][3], 'nos lavamos las manos');
  assert.equal(lookup['cepillarse los dientes'][1], 'te cepillas los dientes');
  assert.equal(lookup['hacer la tarea'][0], 'hago la tarea');
  assert.equal(lookup.jugar[0], 'juego');
  assert.equal(lookup.almorzar[4], 'almorzáis');
  assert.equal(lookup.sentirse[3], 'nos sentimos');
  assert.equal(lookup.tener[0], 'tengo');
  assert.equal(lookup.tener[1], 'tienes');
  assert.equal(lookup.saber[0], 'sé');
});

test('gustar practice agrees with the thing liked, not the person', () => {
  const drills = verbs.filter(verb => verb.base === 'gustar');
  assert.equal(drills.length, 2);
  const singular = makeQuestions([drills[0]])[0];
  const plural = makeQuestions([drills[1]])[0];
  assert.match(singular.subject, /el libro/);
  assert.match(plural.subject, /los libros/);
  assert.ok(isCorrect('me gusta', singular));
  assert.ok(isCorrect('me gustan', plural));
  assert.equal(isCorrect('me gusto', singular), false);
  assert.equal(isCorrect('me gusta', plural), false);
});
