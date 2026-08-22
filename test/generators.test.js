import test from 'node:test';
import assert from 'node:assert/strict';
import { GENERATORS, generateQuestion, validateGeneratedQuestion } from '../src/generators/index.js';
import { assertQuestion } from '../src/utils/validation.js';

const LESSON_IDS = Array.from({ length: 13 }, (_, index) => `L${String(index + 1).padStart(2, '0')}`);

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => ((state = (state * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

test('all thirteen lessons expose two Easy and two Challenge templates', () => {
  for (const lessonId of LESSON_IDS) {
    assert.ok(GENERATORS[lessonId], `${lessonId} generator exists`);
    assert.equal(GENERATORS[lessonId].templates.easy.length, 2, `${lessonId} Easy template count`);
    assert.equal(GENERATORS[lessonId].templates.challenge.length, 2, `${lessonId} Challenge template count`);
  }
});

test('each template generates a mathematically valid common question object', () => {
  for (const lessonId of LESSON_IDS) {
    for (const difficulty of ['easy', 'challenge']) {
      for (const templateId of GENERATORS[lessonId].templates[difficulty]) {
        const question = generateQuestion(lessonId, difficulty, { forceTemplate: templateId, random: seededRandom(Number(lessonId.slice(1)) * 17) });
        assertQuestion(question);
        assert.equal(question.lessonId, lessonId);
        assert.equal(question.difficulty, difficulty);
        assert.equal(question.templateId, templateId);
        assert.equal(validateGeneratedQuestion(question), true, `${lessonId} ${templateId} must validate`);
      }
    }
  }
});

test('every lesson survives 100 randomized questions at each difficulty without immediate duplicates', () => {
  for (const lessonId of LESSON_IDS) {
    for (const difficulty of ['easy', 'challenge']) {
      const random = seededRandom(Number(lessonId.slice(1)) * (difficulty === 'easy' ? 13 : 29));
      let previousSignature = '';
      for (let count = 0; count < 100; count += 1) {
        const question = generateQuestion(lessonId, difficulty, { random, previousSignature });
        assertQuestion(question);
        assert.equal(validateGeneratedQuestion(question), true, `${lessonId} ${difficulty} random question ${count}`);
        assert.notEqual(question.signature, previousSignature, `${lessonId} ${difficulty} avoids immediate duplicate`);
        previousSignature = question.signature;
      }
    }
  }
});
