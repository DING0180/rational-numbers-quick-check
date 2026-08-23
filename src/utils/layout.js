export function getQuestionSizeClass(questionKatex) {
  const spacingWeight = (questionKatex.match(/\\(?:quad|qquad)/g) ?? []).length * 5;
  const length = questionKatex.replace(/\\[a-zA-Z]+|[{}\\s]/g, '').length + spacingWeight;
  if (length >= 85) return 'question-extra-long';
  if (length >= 32) return 'question-long';
  return 'question-short';
}
