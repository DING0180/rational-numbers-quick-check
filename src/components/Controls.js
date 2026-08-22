export function renderControls(container, state, onDifficulty, onNewQuestion, onToggleAnswer) {
  container.replaceChildren();
  const difficulties = document.createElement('div');
  difficulties.className = 'difficulty-toggle';
  ['easy', 'challenge'].forEach(value => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = value === state.difficulty ? 'selected' : '';
    button.textContent = value === 'easy' ? 'Easy' : 'Challenge';
    button.addEventListener('click', () => onDifficulty(value));
    difficulties.append(button);
  });
  const teacher = document.createElement('div');
  teacher.className = 'teacher-controls';
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'secondary';
  next.textContent = 'New Question';
  next.addEventListener('click', onNewQuestion);
  const reveal = document.createElement('button');
  reveal.type = 'button';
  reveal.className = 'primary';
  reveal.textContent = state.answerVisible ? 'Hide Answer' : 'Reveal Answer';
  reveal.addEventListener('click', onToggleAnswer);
  teacher.append(next, reveal);
  container.append(difficulties, teacher);
}
