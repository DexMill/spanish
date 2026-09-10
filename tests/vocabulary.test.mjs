import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { matchesVocabularyAnswer } from '../js/answers.mjs';
import { verbs } from '../js/conjugation.mjs';

const deck = JSON.parse(readFileSync(new URL('../data/vocabulary.json', import.meta.url)));
const source = readFileSync(new URL('../data/unit-1-source.tsv', import.meta.url), 'utf8').trim().split('\n').map(line => line.split('\t'));

test('preserves all 100 supplied pairs, including distinct cards sharing translations', () => {
  assert.equal(deck.vocabulary.length, 100);
  assert.deepEqual(deck.vocabulary.map(card => [card.english, card.spanish]), source);
  assert.equal(deck.expectedSourceCount - deck.receivedSourceCount, 13);
  assert.equal(new Set(deck.vocabulary.map(card => card.category)).size, 13);
  for (const card of deck.vocabulary) assert.ok(deck.categoryOrder.includes(card.category));
});

test('all supplied verbs have six nonempty conjugations', () => {
  for (const [english, spanish] of source) {
    if (!english.startsWith('To ') && !english.startsWith('Can /')) continue;
    for (const term of spanish.split(', ')) {
      assert.ok(verbs.some(verb => verb.infinitive === term || verb.base === term), term);
    }
  }
  for (const verb of verbs) {
    assert.equal(verb.forms.length, 6, verb.infinitive);
    assert.ok(verb.forms.every(form => typeof form === 'string' && form.length));
  }
});

test('accepts individual translations and punctuation variations, retaining accents', () => {
  for (const [input, expected] of [
    ['estar', 'ser, estar'], ['ella', 'él / ella'], ['luego', 'Más tarde/luego/después'],
    ['más tarde', 'después, luego, más tarde'], ['qué', '¿qué?'],
    ['to make', 'To do / to make'], ['make', 'To do / to make'],
    [' To Shower ', 'To shower'], ['¿qué?'.normalize('NFD'), '¿qué?'],
  ]) assert.ok(matchesVocabularyAnswer(input, expected), input);
  assert.equal(matchesVocabularyAnswer('que', '¿qué?'), false);
  assert.equal(matchesVocabularyAnswer('porque', '¿por qué?'), false);
  assert.equal(matchesVocabularyAnswer('', 'To shower'), false);
  assert.equal(matchesVocabularyAnswer('tener', 'ser, estar'), false);
});
