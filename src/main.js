import 'katex/dist/katex.min.css';
import './styles/classroom.css';
import { LESSONS } from './data/lessons.js';
import { generateQuestion } from './generators/index.js';
import { getNextState } from './appState.js';
import { renderSidebar } from './components/Sidebar.js';
import { renderQuestionStage } from './components/QuestionStage.js';
import { renderControls } from './components/Controls.js';

function start() {
  const app = document.querySelector('#app');
  const sidebar = document.createElement('aside');
  const stage = document.createElement('main');
  const controls = document.createElement('footer');
  stage.className = 'stage';
  controls.className = 'controls';
  app.append(sidebar, stage, controls);
  let state = { lessonId: 'L01', difficulty: 'easy', answerVisible: false, needsQuestion: true, previousSignature: '', question: null };

  function currentLesson() { return LESSONS.find(lesson => lesson.id === state.lessonId); }
  function render() {
    if (state.needsQuestion) {
      const question = generateQuestion(state.lessonId, state.difficulty, { previousSignature: state.previousSignature });
      state = { ...state, question, previousSignature: question.signature, needsQuestion: false };
    }
    renderSidebar(sidebar, LESSONS, state.lessonId, lessonId => dispatch({ type: 'SELECT_LESSON', lessonId }));
    renderQuestionStage(stage, currentLesson(), state.question, state.answerVisible);
    renderControls(controls, state, difficulty => dispatch({ type: 'SET_DIFFICULTY', difficulty }), () => dispatch({ type: 'NEW_QUESTION' }), () => dispatch({ type: 'TOGGLE_ANSWER' }));
  }
  function dispatch(event) { state = { ...state, ...getNextState(state, event) }; render(); }
  document.addEventListener('keydown', event => {
    const key = event.key.toLowerCase();
    if (event.code === 'Space') { event.preventDefault(); dispatch({ type: 'TOGGLE_ANSWER' }); }
    else if (event.key === 'ArrowRight') dispatch({ type: 'NEW_QUESTION' });
    else if (key === 'e') dispatch({ type: 'SET_DIFFICULTY', difficulty: 'easy' });
    else if (key === 'c') dispatch({ type: 'SET_DIFFICULTY', difficulty: 'challenge' });
  });
  render();
  document.querySelector('#offline-launch-error')?.remove();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
else start();
