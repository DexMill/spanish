// Keep accents significant, but ignore punctuation, case, and spacing.
function normalize(text) {
  return text.normalize('NFC').toLocaleLowerCase('es').replace(/[¿¡.,!?]/g, '').trim().replace(/\s+/g, ' ');
}

export function matchesVocabularyAnswer(input, expected) {
  const answer = normalize(input);
  if (!answer) return false;
  if (answer === normalize(expected)) return true;
  const alternatives = expected.split(/[,/]/).map(part => part.trim());
  // "To do / to make" also accepts "do" or "make".
  const variants = alternatives.flatMap(part => [part, part.replace(/^to\s+/i, '')]);
  return variants.some(part => normalize(part) === answer);
}
