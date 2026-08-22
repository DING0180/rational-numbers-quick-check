import katex from 'katex';

export function renderMath(container, source, displayMode = true) {
  container.replaceChildren();
  katex.render(source, container, { throwOnError: false, displayMode, strict: 'ignore' });
}
