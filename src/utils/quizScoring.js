import { ANSWER_LETTERS, getChoiceTextForAnswerLetter } from './answerChoices.js'

export const UNCATEGORIZED_SUBJECT = 'Uncategorized'

function getSafeQuestions(questions) {
  return Array.isArray(questions) ? questions : []
}

function getSafeAnswers(answers) {
  return answers && typeof answers === 'object' ? answers : {}
}

export function getSafeMathSubject(mathSubject) {
  if (typeof mathSubject !== 'string') {
    return UNCATEGORIZED_SUBJECT
  }

  const trimmedSubject = mathSubject.trim()

  return trimmedSubject || UNCATEGORIZED_SUBJECT
}

export function calculatePercentageScore(correctAnswers, totalQuestions) {
  if (!Number.isFinite(totalQuestions) || totalQuestions <= 0) {
    return 0
  }

  if (!Number.isFinite(correctAnswers) || correctAnswers <= 0) {
    return 0
  }

  return (correctAnswers / totalQuestions) * 100
}

function normalizeAnswerLetter(answerLetter) {
  if (typeof answerLetter !== 'string') {
    return ''
  }

  const normalizedLetter = answerLetter.trim().toUpperCase()

  return ANSWER_LETTERS.includes(normalizedLetter) ? normalizedLetter : ''
}

function getAnswerRecordForQuestion(question, answers) {
  if (!question?.id) {
    return null
  }

  return getSafeAnswers(answers)[question.id] ?? null
}

function getCorrectAnswerLetter(question, answerRecord) {
  return (
    normalizeAnswerLetter(answerRecord?.correctAnswer) ||
    normalizeAnswerLetter(question?.answer)
  )
}

function getSelectedAnswerLetter(answerRecord) {
  return normalizeAnswerLetter(answerRecord?.selectedAnswer)
}

function getIsCorrectAnswer(question, answerRecord) {
  const selectedAnswer = getSelectedAnswerLetter(answerRecord)
  const correctAnswer = getCorrectAnswerLetter(question, answerRecord)

  return Boolean(
    answerRecord?.isSubmitted &&
      selectedAnswer &&
      correctAnswer &&
      selectedAnswer === correctAnswer,
  )
}

export function getAnswerDisplayText(answerChoices, answerLetter) {
  const normalizedLetter = normalizeAnswerLetter(answerLetter)

  if (!normalizedLetter) {
    return ''
  }

  const choiceText = getChoiceTextForAnswerLetter(
    Array.isArray(answerChoices) ? answerChoices : [],
    normalizedLetter,
  ).trim()

  if (!choiceText) {
    return normalizedLetter
  }

  if (choiceText.toUpperCase().startsWith(`${normalizedLetter}.`)) {
    return choiceText
  }

  return `${normalizedLetter}. ${choiceText}`
}

export function createQuestionReview(questions = [], answers = {}) {
  return getSafeQuestions(questions).map((question, index) => {
    const answerRecord = getAnswerRecordForQuestion(question, answers)
    const selectedAnswer = getSelectedAnswerLetter(answerRecord)
    const correctAnswer = getCorrectAnswerLetter(question, answerRecord)

    return {
      id: question?.id || `question-${index + 1}`,
      questionNumber: index + 1,
      questionText:
        typeof question?.question === 'string' && question.question.trim()
          ? question.question
          : 'Question text unavailable.',
      mathSubject: getSafeMathSubject(question?.math_subject),
      difficulty: typeof question?.difficulty === 'string' ? question.difficulty : '',
      selectedAnswer,
      selectedAnswerText: getAnswerDisplayText(
        question?.answer_choice_list,
        selectedAnswer,
      ),
      correctAnswer,
      correctAnswerText: getAnswerDisplayText(
        question?.answer_choice_list,
        correctAnswer,
      ),
      isCorrect: getIsCorrectAnswer(question, answerRecord),
    }
  })
}

export function createSubjectBreakdown(questions = [], answers = {}) {
  const subjects = new Map()

  getSafeQuestions(questions).forEach((question) => {
    const mathSubject = getSafeMathSubject(question?.math_subject)
    const currentSubject = subjects.get(mathSubject) ?? {
      mathSubject,
      correctAnswers: 0,
      totalQuestions: 0,
    }
    const answerRecord = getAnswerRecordForQuestion(question, answers)

    currentSubject.totalQuestions += 1

    if (getIsCorrectAnswer(question, answerRecord)) {
      currentSubject.correctAnswers += 1
    }

    subjects.set(mathSubject, currentSubject)
  })

  return Array.from(subjects.values())
}

export function createQuizSessionSummary({ questions = [], answers = {} } = {}) {
  const safeQuestions = getSafeQuestions(questions)
  const reviewItems = createQuestionReview(safeQuestions, answers)
  const correctAnswers = reviewItems.filter((reviewItem) => reviewItem.isCorrect)
    .length
  const totalQuestions = safeQuestions.length

  return {
    correctAnswers,
    totalQuestions,
    percentageScore: calculatePercentageScore(correctAnswers, totalQuestions),
    subjectBreakdown: createSubjectBreakdown(safeQuestions, answers),
    reviewItems,
  }
}
