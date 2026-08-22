export function getQuestionSizeClass(questionKatex) {
  const length = questionKatex.replace(/\\[a-zA-Z]+|[{}\\s]/g, '').length;
  if (length >= 85) return 'question-extra-long';
  if (length >= 32) return 'question-long';
  return 'question-short';
}
