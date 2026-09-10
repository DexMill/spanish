export const subjects = ['yo', 'tú', 'él / ella / usted', 'nosotros / nosotras', 'vosotros / vosotras', 'ellos / ellas / ustedes'];

export { verbs } from './verbs-data.mjs';

export function makeQuestions(verbList, includeVosotros = false) {
  return verbList.flatMap(verb => (verb.subjects || subjects).flatMap((subject, person) =>
    person === 4 && !includeVosotros ? [] : [{ verb, subject, person, answer: verb.forms[person] }]
  ));
}

export function isCorrect(input, question) {
  const normalize = text => text.normalize('NFC').toLocaleLowerCase('es').trim().replace(/\s+/g, ' ');
  const answer = normalize(input);
  return [question.answer, ...(question.verb.type === 'special' ? [] : question.subject.split(' / ').map(subject => `${subject} ${question.answer}`))]
    .some(expected => normalize(expected) === answer);
}
