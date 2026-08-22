import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getQuestionSizeClass } from '../src/utils/layout.js';

const stylesheet = fs.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/styles/classroom.css'), 'utf8');

test('short questions keep the large classroom size', () => {
  assert.equal(getQuestionSizeClass('(-7)+12=?'), 'question-short');
});

test('long questions use a compact size class', () => {
  assert.equal(getQuestionSizeClass('\\text{Rounds to }7.3\\text{ to the nearest tenth}'), 'question-long');
});

test('very long questions use the smallest safe size class', () => {
  assert.equal(getQuestionSizeClass('x'.repeat(120)), 'question-extra-long');
});

test('long classroom questions use a safe compact font range', () => {
  assert.match(stylesheet, /\.question-long\s*\{[^}]*font-size:\s*clamp\(24px,\s*2\.3vw,\s*44px\)/s);
  assert.match(stylesheet, /\.question-extra-long\s*\{[^}]*font-size:\s*clamp\(20px,\s*1\.95vw,\s*36px\)/s);
});
