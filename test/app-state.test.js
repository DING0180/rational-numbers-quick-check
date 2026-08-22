import test from 'node:test';
import assert from 'node:assert/strict';
import { getNextState } from '../src/appState.js';

test('changing lesson generates a fresh hidden question state', () => {
  const next = getNextState({ lessonId: 'L01', difficulty: 'easy', answerVisible: true }, { type: 'SELECT_LESSON', lessonId: 'L02' });
  assert.equal(next.lessonId, 'L02');
  assert.equal(next.answerVisible, false);
  assert.equal(next.needsQuestion, true);
});

test('changing difficulty hides the answer and requests a fresh question', () => {
  const next = getNextState({ lessonId: 'L01', difficulty: 'easy', answerVisible: true }, { type: 'SET_DIFFICULTY', difficulty: 'challenge' });
  assert.equal(next.difficulty, 'challenge');
  assert.equal(next.answerVisible, false);
  assert.equal(next.needsQuestion, true);
});

test('toggling answer affects only answer visibility', () => {
  const next = getNextState({ lessonId: 'L01', difficulty: 'easy', answerVisible: false }, { type: 'TOGGLE_ANSWER' });
  assert.equal(next.answerVisible, true);
  assert.equal(next.lessonId, 'L01');
});
