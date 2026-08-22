import { renderMath } from './MathRenderer.js';
import { getQuestionSizeClass } from '../utils/layout.js';

function numberLine(question) {
  const { a, b } = question.metadata;
  const min = Math.min(-8, a - 1), max = Math.max(8, b + 1), width = 680, y = 72;
  const x = value => 42 + ((value - min) / (max - min)) * (width - 84);
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 680 130');
  svg.setAttribute('class', 'number-line');
  const appendSvg = (name, attributes, text = '') => {
    const element = document.createElementNS('http://www.w3.org/2000/svg', name);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
    element.textContent = text;
    svg.append(element);
  };
  appendSvg('line', { x1: 42, y1: y, x2: 638, y2: y, class: 'axis' });
  for (let value = min; value <= max; value += 1) {
    appendSvg('line', { x1: x(value), y1: 64, x2: x(value), y2: 80, class: 'tick' });
    appendSvg('text', { x: x(value), y: 102 }, value);
  }
  appendSvg('circle', { cx: x(a), cy: y, r: 8, class: 'point-a' });
  appendSvg('text', { x: x(a), y: 44 }, 'A');
  appendSvg('circle', { cx: x(b), cy: y, r: 8, class: 'point-b' });
  appendSvg('text', { x: x(b), y: 44 }, 'B');
  return svg;
}

export function renderQuestionStage(container, lesson, question, answerVisible) {
  container.replaceChildren();
  const heading = document.createElement('header');
  heading.className = 'lesson-heading';
  const lessonNumber = document.createElement('span');
  lessonNumber.textContent = 'Lesson ' + lesson.number;
  const englishName = document.createElement('strong');
  englishName.textContent = lesson.englishName;
  const chineseName = document.createElement('small');
  chineseName.textContent = lesson.chineseName;
  heading.append(lessonNumber, englishName, chineseName);
  const prompt = document.createElement('p');
  prompt.className = 'prompt';
  prompt.textContent = question.prompt;
  const frame = document.createElement('div');
  frame.className = 'question-frame';
  const math = document.createElement('div');
  math.className = 'question-math ' + getQuestionSizeClass(question.questionKatex);
  renderMath(math, question.questionKatex);
  frame.append(math);
  const visual = question.lessonId === 'L04' && question.templateId === 'E2' ? numberLine(question) : null;
  const answer = document.createElement('section');
  answer.className = 'answer ' + (answerVisible ? 'visible' : '');
  const label = document.createElement('span');
  label.textContent = 'Answer';
  const answerMath = document.createElement('div');
  renderMath(answerMath, question.answerKatex);
  answer.append(label, answerMath);
  if (question.explanation) {
    const reason = document.createElement('p');
    reason.className = 'reason';
    reason.textContent = 'Reason: ' + question.explanation;
    answer.append(reason);
  }
  if (question.supportText) {
    const support = document.createElement('p');
    support.className = 'support';
    support.textContent = question.supportText;
    answer.append(support);
  }
  container.append(heading, prompt, frame);
  if (visual) container.append(visual);
  container.append(answer);
}
