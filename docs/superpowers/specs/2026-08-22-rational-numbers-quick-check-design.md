# Rational Numbers Quick Check — Phase 1 Design

## Scope

Build a Vite-powered, framework-free single-page classroom tool for a Grade 7 bilingual rational-numbers lesson. Phase 1 contains the complete classroom shell and Lesson 01 (Addition Rules) as the generator prototype. The Lesson 02–13 navigation is present but uses a clear “coming next” state until their dedicated generators are added.

The tool is for a teacher displaying one question at a time. It is not an online textbook, account system, or quiz platform.

## Technology

- Vite with native HTML, CSS, and JavaScript ES modules.
- KaTeX for every mathematical expression.
- SVG for any Lesson 01 diagrammatic need; Lesson 01 itself has none.
- Node’s built-in test runner for deterministic generator tests.

KaTeX is loaded through a pinned CDN stylesheet and module import. The app remains usable after the initial browser load through normal browser caching.

## User Interface

The 16:9 layout has a narrow, scrollable left sidebar and a single large Question Stage. The stage contains, in order:

1. A bilingual lesson heading (`Lesson 01 · Addition Rules / 有理数的加法法则`).
2. Easy and Challenge controls, with Easy selected initially.
3. A short English prompt, the large rendered expression, and occasional small Chinese support.
4. A hidden Answer area that is revealed only after the teacher chooses Reveal Answer.
5. Large controls: New Question and Reveal Answer / Hide Answer.

The main stage never contains a lesson explanation. It focuses on the current question. On a small screen, the sidebar becomes a compact horizontal lesson selector while the stage remains the primary visual area.

Keyboard controls are Space (reveal/hide), Right Arrow (new question), E (Easy), and C (Challenge). Inputs do not exist in Phase 1, so shortcut collision is not a concern.

## Modules and Data Flow

```text
src/
  data/lessons.js             13 bilingual lesson records
  generators/lesson01.js      E1, E2, C1, C2 templates and validation
  components/Sidebar.js       lesson selection UI
  components/QuestionStage.js prompt, KaTeX and answer presentation
  components/Controls.js      difficulty and teacher controls
  components/MathRenderer.js  safe KaTeX rendering boundary
  utils/random.js             bounded random and non-repeat selection
  utils/validation.js         invariant checks used by generators/tests
  main.js                     app state, wiring and keyboard controls
  styles/classroom.css        responsive classroom presentation
```

`main.js` owns the small state object: selected lesson, difficulty, current question, answer visibility, and prior question signature. Choosing a lesson or difficulty always generates a fresh hidden question. A generator returns a plain object:

```js
{
  lessonId: 'L01',
  difficulty: 'easy',
  templateId: 'E1',
  prompt: 'Calculate.',
  questionKatex: '(-7)+12=?',
  answerKatex: '\\boxed{5}',
  explanation: '',
  supportText: '',
  signature: 'L01:E1:-7:12',
  metadata: { operands: [-7, 12], result: 5 }
}
```

`QuestionStage` calls the math-renderer for explicitly supplied KaTeX only. Plain prompt, Reason and Chinese support are rendered as text, never HTML.

## Lesson 01 Generator

Each generated question is validated before it is returned. The app retries a bounded number of times if the signature matches the immediately preceding question; the final fallback selects a different template. Results use small integers and stay within a classroom-friendly range.

| Difficulty | Template | Question intent | Validation / answer rule |
| --- | --- | --- | --- |
| Easy | E1 Direct Calculation | One rational-number addition: same signs, different signs, opposites, or zero. | Integers in the defined range; answer equals `a + b`. |
| Easy | E2 Sign Only | Ask Positive, Negative or Zero? without requesting the exact sum. | `a + b` is non-zero unless the selected category is Zero; answer category follows the computed sum. |
| Challenge | C1 Absolute Value + Conditions | Given `|a|=m`, `|b|=n`, and `a+b<0`, determine a valid pair. | `m,n` are distinct positive small integers; selected signs satisfy all conditions. Reveal includes one valid ordered pair and a short Reason. |
| Challenge | C2 Reason About the Sign | Ask for the sign of an unlike-sign sum, without exact calculation. | Non-zero unequal absolute values; sign follows the operand with greater absolute value. Reveal supplies the English Reason and concise Chinese support. |

Challenge difficulty changes the type of reasoning, not arithmetic size or length.

## Errors and Unavailable Lessons

All generated objects are checked before display. An invalid object is replaced with a short retry message rather than rendering malformed math. Lessons without a generator show an intentional placeholder: `Generator coming next.` They remain navigable so the full lesson sequence is visible, but this temporary state is visually secondary to Lesson 01.

## Testing

Tests run against the real Lesson 01 generator, with a deterministic injected random source where exact assertions matter. They verify:

- each template returns the common question structure;
- E1 values and rendered answer match calculated integer addition;
- E2 answer category matches the actual sign;
- C1 pairs satisfy both absolute-value conditions and the negative-sum condition;
- C2 result sign and Reason follow the larger absolute value;
- 200 random calls per difficulty never yield undefined, NaN, invalid KaTeX fields, out-of-range values, or an immediate duplicate signature.

The final verification also runs the Vite production build and performs an interactive browser check of controls, responsive layout, KaTeX display, answer hiding, and keyboard shortcuts.

## Deferred Work

Lesson 02–13 each receive their own generator file and tests in later phases. Number lines, fractions, scientific notation, precision, and binary diagrams are implemented only with the applicable lesson generators, not as premature shared complexity.
