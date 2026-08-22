# Rational Numbers Quick Check Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a classroom-ready Vite single-page Quick Check shell with a fully random, verified Lesson 01 Addition Rules prototype.

**Architecture:** Native ES modules keep pure state transitions in `appState.js`, browser orchestration in `main.js`, presentation code in focused components, and question generation in an independent Lesson 01 module. Generator output follows one typed object contract, is validated before display, and is covered by deterministic Node tests. KaTeX renders only the question and answer fields.

**Tech Stack:** Vite, JavaScript ES modules, Node built-in test runner, KaTeX, CSS.

**Spec:** `docs/superpowers/specs/2026-08-22-rational-numbers-quick-check-design.md`

## Global Constraints

- Use Vite, native HTML/CSS/JavaScript ES modules, and no UI framework.
- Use KaTeX for every mathematical expression; do not use slash-form fractions or image math.
- Optimize for a 16:9 classroom display: one question, large formula, high contrast, large touch controls, and no required vertical page scroll.
- UI controls are English: Easy, Challenge, New Question, Next Question, Reveal Answer, Hide Answer, Lesson, Question, and Answer.
- Lesson names match the approved bilingual naming specification exactly.
- Lesson 01 Easy is short calculation/recognition; Challenge changes reasoning type rather than arithmetic length or number size.
- Answer visibility defaults to hidden. Challenge answers include a single short English Reason and optional concise Chinese support.
- Support Space, Right Arrow, E, and C keyboard controls.
- Random output must be valid, small, meaningful, free of undefined/NaN/zero-division, and not immediately repeat the preceding signature.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `package.json` | Vite, KaTeX, and test/build scripts. |
| `index.html` | App mount point and classroom page metadata. |
| `src/appState.js` | Pure, browser-independent classroom state transitions. |
| `src/main.js` | Rendering orchestration, event wiring, keyboard controls, and mount logic. |
| `src/data/lessons.js` | The 13 fixed bilingual lesson records. |
| `src/utils/random.js` | Random integer, choice, shuffle-safe choice, and injected-random helpers. |
| `src/utils/validation.js` | Generator object invariant checks and numeric helpers. |
| `src/generators/lesson01.js` | Lesson 01 E1/E2/C1/C2 template generators and immediate-repeat prevention. |
| `src/components/Sidebar.js` | Lesson navigation markup and active lesson events. |
| `src/components/QuestionStage.js` | Prompt, math display, answer visibility, and unavailable lesson state. |
| `src/components/Controls.js` | Difficulty and teacher-control markup/events. |
| `src/components/MathRenderer.js` | KaTeX render boundary and controlled fallback. |
| `src/styles/classroom.css` | Projected-screen styling and responsive behavior. |
| `test/random.test.js` | Utility behavior. |
| `test/lesson01.test.js` | Template correctness, validity, and random stress tests. |
| `test/app-state.test.js` | Stateless app transition helpers used by the UI. |

## Task 1: Scaffold Vite and the Shared Question Contract

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `src/data/lessons.js`
- Create: `src/utils/random.js`
- Create: `src/utils/validation.js`
- Create: `test/random.test.js`

**Interfaces:**
- Produces `LESSONS`, an immutable array of `{ id, number, englishName, chineseName }`.
- Produces `randomInt(min, max, randomFn)`, `choose(items, randomFn)`, and `chooseDifferent(items, previous, key, randomFn)`.
- Produces `assertQuestion(question)` and `isFiniteInteger(value)`.

- [ ] **Step 1: Write the failing random-utility tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { randomInt, chooseDifferent } from '../src/utils/random.js';

test('randomInt includes both bounds with injected random values', () => {
  assert.equal(randomInt(-3, 4, () => 0), -3);
  assert.equal(randomInt(-3, 4, () => 0.999999), 4);
});

test('chooseDifferent selects a different signature when one exists', () => {
  const items = [{ signature: 'A' }, { signature: 'B' }];
  const answer = chooseDifferent(items, 'A', item => item.signature, () => 0);
  assert.equal(answer.signature, 'B');
});
```

- [ ] **Step 2: Run the tests to verify they fail because modules are absent**

Run: `npm test -- test/random.test.js`

Expected: failure reporting that `src/utils/random.js` cannot be resolved.

- [ ] **Step 3: Add the minimum project configuration and utility implementation**

```json
{
  "name": "rational-numbers-quick-check",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "node --test"
  },
  "devDependencies": { "vite": "^7.0.0" },
  "dependencies": { "katex": "^0.16.22" }
}
```

```js
export function randomInt(min, max, randomFn = Math.random) {
  return min + Math.floor(randomFn() * (max - min + 1));
}

export function chooseDifferent(items, previous, key, randomFn = Math.random) {
  const alternatives = items.filter(item => key(item) !== previous);
  return choose(alternatives.length ? alternatives : items, randomFn);
}
```

Create `LESSONS` with all 13 approved exact names; make `assertQuestion` throw unless required text fields and `metadata` are present and all numeric metadata is finite.

- [ ] **Step 4: Run the focused tests to verify they pass**

Run: `npm test -- test/random.test.js`

Expected: 2 passing tests, 0 failures.

- [ ] **Step 5: Commit the scaffold and shared contract**

```bash
git add package.json index.html src/data/lessons.js src/utils/random.js src/utils/validation.js test/random.test.js
git commit -m "chore: scaffold quick check app"
```

## Task 2: Implement and Stress-Test the Lesson 01 Generator

**Files:**
- Create: `src/generators/lesson01.js`
- Create: `test/lesson01.test.js`
- Modify: `src/utils/validation.js`

**Interfaces:**
- Consumes `randomInt`, `choose`, `chooseDifferent`, `assertQuestion`, and an optional `{ random, previousSignature, forceTemplate }` generation context.
- Produces `generateLesson01(difficulty, context)` returning a question object with `lessonId`, `difficulty`, `templateId`, `prompt`, `questionKatex`, `answerKatex`, `explanation`, `supportText`, `signature`, and `metadata`.

- [ ] **Step 1: Write failing tests for E1 and E2 behavior**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateLesson01 } from '../src/generators/lesson01.js';

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => ((state = (state * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

test('Easy E1 answer equals the sum of its operands', () => {
  const question = generateLesson01('easy', { random: seededRandom(1), forceTemplate: 'E1' });
  assert.equal(question.templateId, 'E1');
  assert.equal(question.metadata.result, question.metadata.operands[0] + question.metadata.operands[1]);
  assert.match(question.answerKatex, new RegExp(String(question.metadata.result)));
});

test('Easy E2 reports the calculated sign category', () => {
  const question = generateLesson01('easy', { random: seededRandom(2), forceTemplate: 'E2' });
  const expected = Math.sign(question.metadata.sum);
  assert.equal(question.metadata.sign, expected > 0 ? 'Positive' : expected < 0 ? 'Negative' : 'Zero');
});
```

- [ ] **Step 2: Run these tests and verify the missing generator failure**

Run: `npm test -- test/lesson01.test.js`

Expected: failure reporting that `src/generators/lesson01.js` cannot be resolved.

- [ ] **Step 3: Implement E1 and E2 with controlled small-integer pools**

```js
function directCalculation(random) {
  const [a, b] = choose(ADDEND_PAIRS, random);
  const result = a + b;
  return createQuestion({
    templateId: 'E1', prompt: 'Calculate.',
    questionKatex: `${formatInteger(a)}+${formatInteger(b)}=?`,
    answerKatex: `\\boxed{${result}}`,
    metadata: { operands: [a, b], result }
  });
}
```

Use a deliberately curated `ADDEND_PAIRS` list covering same signs, unlike signs, opposites, and zero. E2 uses unlike-sign pairs, plus opposites for Zero, and asks exactly `Positive, Negative or Zero?`.

- [ ] **Step 4: Run the E1/E2 tests to verify they pass**

Run: `npm test -- test/lesson01.test.js`

Expected: the two Easy tests pass.

- [ ] **Step 5: Write failing tests for C1/C2 and repeat prevention**

```js
test('Challenge C1 returned values obey every supplied condition', () => {
  const q = generateLesson01('challenge', { random: seededRandom(3), forceTemplate: 'C1' });
  const { a, b, absA, absB } = q.metadata;
  assert.equal(Math.abs(a), absA);
  assert.equal(Math.abs(b), absB);
  assert.ok(a + b < 0);
});

test('Challenge C2 sign follows the addend with greater absolute value', () => {
  const q = generateLesson01('challenge', { random: seededRandom(4), forceTemplate: 'C2' });
  const [a, b] = q.metadata.operands;
  assert.equal(q.metadata.sign, Math.abs(a) > Math.abs(b) ? Math.sign(a) : Math.sign(b));
  assert.notEqual(q.explanation, '');
});

test('generation does not immediately reuse the prior signature', () => {
  const first = generateLesson01('easy', { random: seededRandom(5) });
  const next = generateLesson01('easy', { random: seededRandom(5), previousSignature: first.signature });
  assert.notEqual(next.signature, first.signature);
});
```

- [ ] **Step 6: Run the Challenge tests and verify the expected failure**

Run: `npm test -- test/lesson01.test.js`

Expected: C1/C2/repeat tests fail because the templates are not yet supported.

- [ ] **Step 7: Implement C1, C2, strict contract validation, and 200-question stress tests**

```js
function absoluteValueConditions(random) {
  const absA = randomInt(3, 8, random);
  const absB = randomInt(1, absA - 1, random);
  const a = -absA;
  const b = choose([-absB, absB], random);
  return createQuestion({
    templateId: 'C1',
    prompt: 'Find one possible pair.',
    questionKatex: `|a|=${absA},\\quad |b|=${absB},\\quad a+b<0`,
    answerKatex: `\\boxed{(a,b)=(${a},${b})}`,
    explanation: 'The signs must make the sum negative.',
    supportText: '和为负数。',
    metadata: { a, b, absA, absB }
  });
}
```

Add two loops of 200 calls in `test/lesson01.test.js`, one for each difficulty. For every question call `assertQuestion`, verify no repeated adjacent signatures, reject strings containing `undefined` or `NaN`, and independently re-check the template mathematics from metadata.

- [ ] **Step 8: Run the complete generator suite to verify it passes**

Run: `npm test -- test/lesson01.test.js`

Expected: all template and 400-generation stress tests pass with 0 failures.

- [ ] **Step 9: Commit the generator**

```bash
git add src/generators/lesson01.js src/utils/validation.js test/lesson01.test.js
git commit -m "feat: add validated addition rules generator"
```

## Task 3: Build the Classroom UI Components and Math Rendering Boundary

**Files:**
- Create: `src/appState.js`
- Create: `src/components/Sidebar.js`
- Create: `src/components/QuestionStage.js`
- Create: `src/components/Controls.js`
- Create: `src/components/MathRenderer.js`
- Create: `test/app-state.test.js`

**Interfaces:**
- Consumes lesson records and question objects.
- Produces `renderSidebar`, `renderQuestionStage`, `renderControls`, `renderMath`, and `getNextState`.
- `getNextState(state, event)` returns a new immutable view state for `SELECT_LESSON`, `SET_DIFFICULTY`, `SET_QUESTION`, and `TOGGLE_ANSWER`.

- [ ] **Step 1: Write failing state-transition tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { getNextState } from '../src/appState.js';

test('changing difficulty hides the answer and requests a fresh question', () => {
  const result = getNextState({ lessonId: 'L01', difficulty: 'easy', answerVisible: true }, { type: 'SET_DIFFICULTY', difficulty: 'challenge' });
  assert.deepEqual(result, { lessonId: 'L01', difficulty: 'challenge', answerVisible: false, needsQuestion: true });
});

test('toggle answer changes only the answer visibility', () => {
  const result = getNextState({ lessonId: 'L01', difficulty: 'easy', answerVisible: false }, { type: 'TOGGLE_ANSWER' });
  assert.equal(result.answerVisible, true);
  assert.equal(result.lessonId, 'L01');
});
```

- [ ] **Step 2: Run the state tests and verify the missing-module failure**

Run: `npm test -- test/app-state.test.js`

Expected: failure because `src/appState.js` does not yet exist.

- [ ] **Step 3: Implement pure transitions and component render functions**

```js
export function getNextState(state, event) {
  if (event.type === 'SET_DIFFICULTY') {
    return { ...state, difficulty: event.difficulty, answerVisible: false, needsQuestion: true };
  }
  if (event.type === 'TOGGLE_ANSWER') return { ...state, answerVisible: !state.answerVisible };
  return state;
}
```

`renderMath(container, katexSource)` calls `katex.render(katexSource, container, { throwOnError: false, displayMode: true })`. Components create DOM nodes with `textContent` for user-facing strings. The unavailable-lesson stage uses the exact message `Generator coming next.` and never calls KaTeX on it.

- [ ] **Step 4: Run state and generator tests to verify they pass together**

Run: `npm test`

Expected: all tests pass, including `test/random.test.js`, `test/lesson01.test.js`, and `test/app-state.test.js`.

- [ ] **Step 5: Commit the component layer**

```bash
git add src/appState.js src/components test/app-state.test.js
git commit -m "feat: add classroom question components"
```

## Task 4: Wire the Page, Controls, and Classroom Styling

**Files:**
- Modify: `index.html`
- Create: `src/main.js`
- Create: `src/styles/classroom.css`

**Interfaces:**
- Consumes components and `generateLesson01`.
- Produces a mounted `#app` screen whose initial state is Lesson 01, Easy, a generated question, and a hidden answer.

- [ ] **Step 1: Write an interaction acceptance test as an executable browser checklist**

Create `test/manual-classroom-check.md` containing these exact checks: initial L01 Easy question with no answer text; Reveal Answer changes to Hide Answer; Space toggles visibility; Right Arrow changes signature and hides answer; E and C select their corresponding difficulty and generate hidden questions; each sidebar row selects a lesson; viewport sizes 1920×1080 and 1280×720 show stage controls without document-level vertical scroll.

- [ ] **Step 2: Run the test suite to establish the pre-wiring baseline**

Run: `npm test`

Expected: all automated tests pass before UI integration, since this task adds integration wiring rather than new generator behavior.

- [ ] **Step 3: Mount the application and implement event wiring**

```js
function generateCurrentQuestion() {
  const generator = state.lessonId === 'L01' ? generateLesson01 : null;
  state.question = generator
    ? generator(state.difficulty, { previousSignature: state.previousSignature })
    : null;
  state.previousSignature = state.question?.signature ?? null;
  state.answerVisible = false;
}

document.addEventListener('keydown', event => {
  if (event.code === 'Space') { event.preventDefault(); dispatch({ type: 'TOGGLE_ANSWER' }); }
  if (event.key === 'ArrowRight') dispatch({ type: 'NEW_QUESTION' });
  if (event.key.toLowerCase() === 'e') dispatch({ type: 'SET_DIFFICULTY', difficulty: 'easy' });
  if (event.key.toLowerCase() === 'c') dispatch({ type: 'SET_DIFFICULTY', difficulty: 'challenge' });
});
```

Import KaTeX CSS from `katex/dist/katex.min.css`. Style the shell with CSS grid, a narrow 260px sidebar, a stage with `min-height: 100dvh`, `clamp()` font sizes, at least 56px control height, and a media query below 900px that turns lesson navigation horizontal. Use no decorative illustration, dashboard widgets, or non-instructional animation.

- [ ] **Step 4: Run automated tests and the production build**

Run: `npm test && npm run build`

Expected: tests pass and Vite reports a successful production build.

- [ ] **Step 5: Execute the browser checklist manually**

Run: `npm run dev -- --host 127.0.0.1`

Expected: every check in `test/manual-classroom-check.md` passes in Chrome or Edge, including rendered fractions/negative signs and all keyboard controls.

- [ ] **Step 6: Commit the complete Phase 1 screen**

```bash
git add index.html src/main.js src/styles/classroom.css test/manual-classroom-check.md
git commit -m "feat: deliver classroom quick check shell"
```

## Task 5: Final Quality Gate

**Files:**
- Modify only if a verification failure identifies a concrete defect in its responsible source or test file.

**Interfaces:**
- Consumes the finished application, automated tests, production bundle, and classroom checklist.
- Produces verification evidence for Phase 1 acceptance.

- [ ] **Step 1: Execute the full automated suite**

Run: `npm test`

Expected: all utility, generator, stress, and state-transition tests pass.

- [ ] **Step 2: Execute a fresh production build**

Run: `npm run build`

Expected: Vite finishes with exit code 0.

- [ ] **Step 3: Check the source boundaries and math requirements**

Run: `rg -n "innerHTML|NaN|undefined|/" src test`

Expected: no `innerHTML`; no executable user-interface slash-form fraction output; `NaN` and `undefined` appear only in test assertions that reject them.

- [ ] **Step 4: Complete the classroom interaction checklist at 1920×1080 and 1280×720**

Run the live app and perform every item in `test/manual-classroom-check.md`.

Expected: one complete question screen; legible math; answer hidden by default; correct control and shortcut behavior; no full-page scroll.

- [ ] **Step 5: Commit only verified corrective changes, if any exist**

```bash
git status --short
git add -- index.html package.json src test
git commit -m "fix: address phase one verification findings"
```
