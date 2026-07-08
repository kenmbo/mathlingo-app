import {
  QUIZ_SESSION_ACTIONS,
  QUIZ_SESSION_STATUSES,
  createInitialQuizSessionState,
  deriveQuizSessionValues,
  quizSessionReducer,
} from '/home/kuser/python/mathlingo-v2/mathlingo-app/src/hooks/useQuizSession.js'

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, received ${actual}`)
  }
}

function loadQuestions(questions) {
  let state = createInitialQuizSessionState()

  state = quizSessionReducer(state, {
    type: QUIZ_SESSION_ACTIONS.START_REQUESTED,
    config: {
      difficulty: 'medium',
      numQuestions: questions.length,
    },
    requestId: 1,
  })

  return quizSessionReducer(state, {
    type: QUIZ_SESSION_ACTIONS.LOAD_SUCCEEDED,
    questions,
    requestId: 1,
  })
}

const questions = [
  {
    id: 'q-1',
    difficulty: 'medium',
    math_subject: 'Algebra',
    question: 'First question?',
    answer_choice_list: ['A. 1', 'B. 2', 'C. 3', 'D. 4'],
    answer: 'A',
  },
  {
    id: 'q-2',
    difficulty: 'medium',
    math_subject: 'Geometry',
    question: 'Second question?',
    answer_choice_list: ['A. 1', 'B. 2', 'C. 3', 'D. 4'],
    answer: 'B',
  },
]

let state = loadQuestions(questions)
assertEqual(state.status, QUIZ_SESSION_STATUSES.ACTIVE, 'loaded status')
assertEqual(deriveQuizSessionValues(state).progressPercentage, 50, 'first progress')

state = quizSessionReducer(state, {
  type: QUIZ_SESSION_ACTIONS.SELECT_ANSWER,
  answerLetter: 'A',
})
assertEqual(
  deriveQuizSessionValues(state).progressPercentage,
  50,
  'progress after selection',
)

state = quizSessionReducer(state, {
  type: QUIZ_SESSION_ACTIONS.SUBMIT_ANSWER,
})
assertEqual(
  deriveQuizSessionValues(state).progressPercentage,
  50,
  'progress after submission',
)

state = quizSessionReducer(state, {
  type: QUIZ_SESSION_ACTIONS.GO_TO_NEXT_QUESTION,
})
assertEqual(state.currentQuestionIndex, 1, 'current question index after next')
assertEqual(deriveQuizSessionValues(state).progressPercentage, 100, 'final progress')

const oneQuestionState = loadQuestions([questions[0]])
assertEqual(
  deriveQuizSessionValues(oneQuestionState).progressPercentage,
  100,
  'one-question progress',
)

console.log('Session progress reducer checks passed.')

