import { verbs, subjects, makeQuestions, isCorrect } from './conjugation.mjs';

const ui = Object.fromEntries(['type', 'verb', 'vosotros', 'score', 'meaning', 'prompt', 'practice', 'answer', 'check', 'reveal', 'next', 'feedback', 'explanation', 'reference', 'forms'].map(id => [id, document.getElementById(id)]));
let queue = [], current, answered = false, correct = 0, attempted = 0;

function matchesType(verb) {
  return ui.type.value === 'all' || (ui.type.value === 'reflexive' ? verb.reflexive : ui.type.value === 'stem' ? verb.stemChanging : verb.type === ui.type.value);
}

function selectedVerbs() {
  return verbs.filter(verb => (matchesType(verb)) && (ui.verb.value === 'all' || verb.infinitive === ui.verb.value));
}

function populateVerbs() {
  ui.verb.replaceChildren(new Option('All matching verbs', 'all'));
  for (const verb of verbs.filter(verb => matchesType(verb))) {
    ui.verb.add(new Option(verb.infinitive, verb.infinitive));
  }
}

function next() {
  if (!queue.length) {
    queue = makeQuestions(selectedVerbs(), ui.vosotros.checked);
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }
  }
  current = queue.pop();
  answered = false;
  ui.score.textContent = `${correct} correct / ${attempted} attempted`;
  ui.meaning.textContent = current.verb.meaning;
  ui.prompt.textContent = `${current.verb.infinitive} · ${current.subject}`;
  ui.answer.value = '';
  ui.answer.disabled = false;
  ui.check.disabled = ui.reveal.disabled = false;
  ui.next.disabled = true;
  ui.feedback.textContent = ui.explanation.textContent = '';
  ui.reference.open = false;
  ui.forms.replaceChildren();
  (current.verb.subjects || subjects).forEach((subject, index) => {
    if (index === 4 && !ui.vosotros.checked) return;
    const row = document.createElement('tr');
    for (const text of [subject, current.verb.forms[index]]) {
      const cell = document.createElement('td');
      cell.textContent = text;
      row.append(cell);
    }
    ui.forms.append(row);
  });
  ui.answer.focus();
}

function finish(reveal = false) {
  if (answered) return;
  answered = true;
  const passed = !reveal && isCorrect(ui.answer.value, current);
  attempted++;
  if (passed) correct++;
  ui.feedback.textContent = `${passed ? 'Correct!' : reveal ? 'Answer:' : 'Not quite:'} ${current.answer}`;
  ui.explanation.textContent = current.verb.explanation;
  ui.score.textContent = `${correct} correct / ${attempted} attempted`;
  ui.answer.disabled = ui.check.disabled = ui.reveal.disabled = true;
  ui.next.disabled = false;
  ui.next.focus();
}

function restart() {
  queue = [];
  correct = attempted = 0;
  next();
}

ui.type.addEventListener('change', () => { populateVerbs(); restart(); });
ui.verb.addEventListener('change', restart);
ui.vosotros.addEventListener('change', restart);
ui.practice.addEventListener('submit', event => { event.preventDefault(); finish(); });
ui.reveal.addEventListener('click', () => finish(true));
ui.next.addEventListener('click', next);
populateVerbs();
restart();
