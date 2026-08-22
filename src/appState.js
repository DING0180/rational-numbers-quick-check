export function getNextState(state, event) {
  if (event.type === 'SELECT_LESSON') return { ...state, lessonId: event.lessonId, answerVisible: false, needsQuestion: true };
  if (event.type === 'SET_DIFFICULTY') return { ...state, difficulty: event.difficulty, answerVisible: false, needsQuestion: true };
  if (event.type === 'TOGGLE_ANSWER') return { ...state, answerVisible: !state.answerVisible, needsQuestion: false };
  if (event.type === 'NEW_QUESTION') return { ...state, answerVisible: false, needsQuestion: true };
  return state;
}
