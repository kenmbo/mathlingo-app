const VALID_DIFFICULTIES = new Set(['easy', 'medium', 'hard'])
const VALID_ANSWERS = new Set(['A', 'B', 'C', 'D'])

function createValidResult(questions) {
  return {
    isValid: true,
    questions,
    errorMessage: null,
  }
}

function createInvalidResult(errorMessage) {
  return {
    isValid: false,
    questions: null,
    errorMessage,
  }
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function validateAnswerChoices(question, questionIndex) {
  if (
    !Array.isArray(question.answer_choice_list) ||
    question.answer_choice_list.length !== 4 ||
    !question.answer_choice_list.every((choice) => typeof choice === 'string')
  ) {
    return `Question response.questions[${questionIndex}].answer_choice_list must contain exactly four strings.`
  }

  return null
}

function validateQuestion(question, questionIndex) {
  if (!isPlainObject(question)) {
    return `Question response.questions[${questionIndex}] must be an object.`
  }

  if (!isNonEmptyString(question.id)) {
    return `Question response.questions[${questionIndex}].id must be a non-empty string.`
  }

  if (!VALID_DIFFICULTIES.has(question.difficulty)) {
    return `Question response.questions[${questionIndex}].difficulty must be easy, medium, or hard.`
  }

  if (typeof question.math_subject !== 'string') {
    return `Question response.questions[${questionIndex}].math_subject must be a string.`
  }

  if (typeof question.question !== 'string') {
    return `Question response.questions[${questionIndex}].question must be a string.`
  }

  const answerChoiceError = validateAnswerChoices(question, questionIndex)
  if (answerChoiceError) {
    return answerChoiceError
  }

  if (!VALID_ANSWERS.has(question.answer)) {
    return `Question response.questions[${questionIndex}].answer must be A, B, C, or D.`
  }

  return null
}

export function validateQuestionResponse(response) {
  if (!isPlainObject(response)) {
    return createInvalidResult('Question response must be a non-null object.')
  }

  if (!Array.isArray(response.questions)) {
    return createInvalidResult('Question response.questions must be an array.')
  }

  for (const [index, question] of response.questions.entries()) {
    const questionError = validateQuestion(question, index)
    if (questionError) {
      return createInvalidResult(questionError)
    }
  }

  return createValidResult(response.questions)
}

export function assertValidQuestionResponse(response) {
  const result = validateQuestionResponse(response)

  if (!result.isValid) {
    throw new Error(result.errorMessage)
  }

  return result.questions
}
