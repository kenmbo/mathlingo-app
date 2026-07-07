export const QUIZ_SETUP_DEFAULTS = Object.freeze({
  difficulty: 'medium',
  numQuestions: 10,
})

export const QUIZ_SETUP_LIMITS = Object.freeze({
  minQuestions: 1,
  maxQuestions: 20,
})

export const DIFFICULTY_OPTIONS = Object.freeze([
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
])

const VALID_DIFFICULTIES = new Set(
  DIFFICULTY_OPTIONS.map((difficulty) => difficulty.value),
)

function createInvalidResult(errorMessage) {
  return {
    isValid: false,
    config: null,
    errorMessage,
  }
}

function createValidResult(config) {
  return {
    isValid: true,
    config,
    errorMessage: null,
  }
}

export function validateQuizSetupConfig({ difficulty, numQuestions }) {
  const normalizedDifficulty =
    typeof difficulty === 'string' ? difficulty.trim().toLowerCase() : ''

  if (!VALID_DIFFICULTIES.has(normalizedDifficulty)) {
    return createInvalidResult('Choose a quiz difficulty.')
  }

  const normalizedQuestionCount =
    typeof numQuestions === 'string'
      ? numQuestions.trim()
      : String(numQuestions ?? '').trim()

  if (!/^\d+$/.test(normalizedQuestionCount)) {
    return createInvalidResult('Enter a whole number from 1 to 20.')
  }

  const parsedQuestionCount = Number(normalizedQuestionCount)

  if (
    parsedQuestionCount < QUIZ_SETUP_LIMITS.minQuestions ||
    parsedQuestionCount > QUIZ_SETUP_LIMITS.maxQuestions
  ) {
    return createInvalidResult('Enter a number from 1 to 20.')
  }

  return createValidResult({
    difficulty: normalizedDifficulty,
    numQuestions: parsedQuestionCount,
  })
}
