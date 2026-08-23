const REQUIRED_TEXT_FIELDS = ['lessonId', 'difficulty', 'templateId', 'prompt', 'questionKatex', 'answerKatex', 'explanation', 'supportText', 'signature'];

function valuesAreFinite(value) {
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(valuesAreFinite);
  if (value && typeof value === 'object') return Object.values(value).every(valuesAreFinite);
  return true;
}

export function assertQuestion(question) {
  if (!question || typeof question !== 'object') throw new TypeError('Question must be an object.');
  for (const field of REQUIRED_TEXT_FIELDS) {
    if (typeof question[field] !== 'string' || ((field === 'questionKatex' || field === 'answerKatex') && (question[field].includes('undefined') || question[field].includes('NaN')))) {
      throw new TypeError(`Invalid question field: ${field}`);
    }
  }
  if (!question.metadata || typeof question.metadata !== 'object' || !valuesAreFinite(question.metadata)) {
    throw new TypeError('Question metadata must contain only finite values.');
  }
  return question;
}
