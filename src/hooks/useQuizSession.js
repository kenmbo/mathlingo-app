import { useCallback, useEffect, useReducer, useRef } from 'react'
import { fetchQuestions } from '../api/questionsApi.js'

export const QUIZ_SESSION_STATUSES = Object.freeze({
  IDLE: 'idle',
  LOADING: 'loading',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ERROR: 'error',
})

export const QUIZ_SESSION_ACTIONS = Object.freeze({
  START_REQUESTED: 'session/startRequested',
  LOAD_SUCCEEDED: 'session/loadSucceeded',
  LOAD_FAILED: 'session/loadFailed',
  SELECT_ANSWER: 'session/selectAnswer',
  SUBMIT_ANSWER: 'session/submitAnswer',
  GO_TO_NEXT_QUESTION: 'session/goToNextQuestion',
  RESET: 'session/reset',
})

const VALID_ANSWER_LETTERS = new Set(['A', 'B', 'C', 'D'])

export function createInitialQuizSessionState() {
  return {
    status: QUIZ_SESSION_STATUSES.IDLE,
    config: null,
    questions: [],
    currentQuestionIndex: 0,
    answers: {},
    error: null,
    wasLastResultEmpty: false,
    activeRequestId: null,
  }
}

function getCurrentQuestion(state) {
  return state.questions[state.currentQuestionIndex] ?? null
}

function shouldIgnoreRequestAction(state, requestId) {
  return state.activeRequestId === null || state.activeRequestId !== requestId
}

function createSessionError(error) {
  return {
    name: error?.name ?? 'Error',
    code: error?.code ?? 'QUESTION_REQUEST_FAILED',
    status: error?.status ?? null,
    message: error?.message ?? 'Question request failed.',
    isAborted: Boolean(error?.isAborted),
  }
}

function selectAnswer(state, answerLetter) {
  if (
    state.status !== QUIZ_SESSION_STATUSES.ACTIVE ||
    !VALID_ANSWER_LETTERS.has(answerLetter)
  ) {
    return state
  }

  const currentQuestion = getCurrentQuestion(state)
  if (!currentQuestion) {
    return state
  }

  const existingRecord = state.answers[currentQuestion.id]
  if (existingRecord?.isSubmitted) {
    return state
  }

  return {
    ...state,
    answers: {
      ...state.answers,
      [currentQuestion.id]: {
        selectedAnswer: answerLetter,
        correctAnswer: currentQuestion.answer,
        isSubmitted: false,
        isCorrect: null,
      },
    },
  }
}

function submitAnswer(state) {
  if (state.status !== QUIZ_SESSION_STATUSES.ACTIVE) {
    return state
  }

  const currentQuestion = getCurrentQuestion(state)
  if (!currentQuestion) {
    return state
  }

  const existingRecord = state.answers[currentQuestion.id]
  if (!existingRecord?.selectedAnswer || existingRecord.isSubmitted) {
    return state
  }

  const isCorrect = existingRecord.selectedAnswer === currentQuestion.answer

  return {
    ...state,
    answers: {
      ...state.answers,
      [currentQuestion.id]: {
        ...existingRecord,
        correctAnswer: currentQuestion.answer,
        isSubmitted: true,
        isCorrect,
      },
    },
  }
}

function goToNextQuestion(state) {
  if (state.status !== QUIZ_SESSION_STATUSES.ACTIVE) {
    return state
  }

  const currentQuestion = getCurrentQuestion(state)
  if (!currentQuestion) {
    return state
  }

  const existingRecord = state.answers[currentQuestion.id]
  if (!existingRecord?.isSubmitted) {
    return state
  }

  const isFinalQuestion = state.currentQuestionIndex >= state.questions.length - 1
  if (isFinalQuestion) {
    return {
      ...state,
      status: QUIZ_SESSION_STATUSES.COMPLETED,
    }
  }

  return {
    ...state,
    currentQuestionIndex: state.currentQuestionIndex + 1,
  }
}

export function quizSessionReducer(state, action) {
  switch (action.type) {
    case QUIZ_SESSION_ACTIONS.START_REQUESTED:
      return {
        ...createInitialQuizSessionState(),
        status: QUIZ_SESSION_STATUSES.LOADING,
        config: action.config,
        activeRequestId: action.requestId,
      }

    case QUIZ_SESSION_ACTIONS.LOAD_SUCCEEDED:
      if (shouldIgnoreRequestAction(state, action.requestId)) {
        return state
      }

      if (action.questions.length === 0) {
        return {
          ...createInitialQuizSessionState(),
          config: state.config,
          // Keeps the required status set unchanged while preserving empty success.
          wasLastResultEmpty: true,
        }
      }

      return {
        ...state,
        status: QUIZ_SESSION_STATUSES.ACTIVE,
        questions: action.questions,
        currentQuestionIndex: 0,
        answers: {},
        error: null,
        wasLastResultEmpty: false,
        activeRequestId: null,
      }

    case QUIZ_SESSION_ACTIONS.LOAD_FAILED:
      if (shouldIgnoreRequestAction(state, action.requestId)) {
        return state
      }

      return {
        ...state,
        status: QUIZ_SESSION_STATUSES.ERROR,
        questions: [],
        currentQuestionIndex: 0,
        answers: {},
        error: createSessionError(action.error),
        wasLastResultEmpty: false,
        activeRequestId: null,
      }

    case QUIZ_SESSION_ACTIONS.SELECT_ANSWER:
      return selectAnswer(state, action.answerLetter)

    case QUIZ_SESSION_ACTIONS.SUBMIT_ANSWER:
      return submitAnswer(state)

    case QUIZ_SESSION_ACTIONS.GO_TO_NEXT_QUESTION:
      return goToNextQuestion(state)

    case QUIZ_SESSION_ACTIONS.RESET:
      return createInitialQuizSessionState()

    default:
      return state
  }
}

export function deriveQuizSessionValues(state) {
  const currentQuestion = getCurrentQuestion(state)
  const totalQuestions = state.questions.length
  const currentAnswerRecord = currentQuestion
    ? state.answers[currentQuestion.id] ?? null
    : null
  const currentScore = Object.values(state.answers).filter(
    (answerRecord) => answerRecord.isSubmitted && answerRecord.isCorrect,
  ).length
  const progressPercentage =
    totalQuestions === 0
      ? 0
      : ((state.currentQuestionIndex + 1) / totalQuestions) * 100
  const finalPercentageScore =
    totalQuestions === 0 ? 0 : (currentScore / totalQuestions) * 100

  return {
    currentQuestion,
    totalQuestions,
    currentAnswerRecord,
    currentScore,
    progressPercentage,
    finalPercentageScore,
    hasSelectedAnswer: Boolean(currentAnswerRecord?.selectedAnswer),
    hasSubmittedCurrentAnswer: Boolean(currentAnswerRecord?.isSubmitted),
    isFinalQuestion:
      totalQuestions > 0 && state.currentQuestionIndex === totalQuestions - 1,
    isEmptyResult: state.wasLastResultEmpty,
  }
}

function useQuizSession() {
  const [state, dispatch] = useReducer(
    quizSessionReducer,
    undefined,
    createInitialQuizSessionState,
  )
  const requestRef = useRef({
    requestId: 0,
    controller: null,
  })

  const startSession = useCallback(async (config) => {
    requestRef.current.controller?.abort()

    const requestId = requestRef.current.requestId + 1
    const controller = new AbortController()
    requestRef.current = {
      requestId,
      controller,
    }

    dispatch({
      type: QUIZ_SESSION_ACTIONS.START_REQUESTED,
      config,
      requestId,
    })

    try {
      const questions = await fetchQuestions({
        numQuestions: config.numQuestions,
        difficulty: config.difficulty,
        signal: controller.signal,
      })

      if (requestRef.current.requestId !== requestId || controller.signal.aborted) {
        return
      }

      dispatch({
        type: QUIZ_SESSION_ACTIONS.LOAD_SUCCEEDED,
        questions,
        requestId,
      })
    } catch (error) {
      if (
        requestRef.current.requestId !== requestId ||
        controller.signal.aborted ||
        error?.isAborted
      ) {
        return
      }

      dispatch({
        type: QUIZ_SESSION_ACTIONS.LOAD_FAILED,
        error,
        requestId,
      })
    } finally {
      if (requestRef.current.requestId === requestId) {
        requestRef.current = {
          requestId,
          controller: null,
        }
      }
    }
  }, [])

  const selectAnswerForCurrentQuestion = useCallback((answerLetter) => {
    dispatch({
      type: QUIZ_SESSION_ACTIONS.SELECT_ANSWER,
      answerLetter,
    })
  }, [])

  const submitAnswerForCurrentQuestion = useCallback(() => {
    dispatch({
      type: QUIZ_SESSION_ACTIONS.SUBMIT_ANSWER,
    })
  }, [])

  const goToNextQuestion = useCallback(() => {
    dispatch({
      type: QUIZ_SESSION_ACTIONS.GO_TO_NEXT_QUESTION,
    })
  }, [])

  const resetSession = useCallback(() => {
    requestRef.current.controller?.abort()
    requestRef.current = {
      requestId: requestRef.current.requestId + 1,
      controller: null,
    }

    dispatch({
      type: QUIZ_SESSION_ACTIONS.RESET,
    })
  }, [])

  useEffect(() => {
    return () => {
      requestRef.current.controller?.abort()
      requestRef.current = {
        requestId: requestRef.current.requestId + 1,
        controller: null,
      }
    }
  }, [])

  const derivedValues = deriveQuizSessionValues(state)

  return {
    status: state.status,
    config: state.config,
    questions: state.questions,
    currentQuestionIndex: state.currentQuestionIndex,
    answers: state.answers,
    error: state.error,
    ...derivedValues,
    startSession,
    selectAnswer: selectAnswerForCurrentQuestion,
    submitAnswer: submitAnswerForCurrentQuestion,
    goToNextQuestion,
    resetSession,
  }
}

export default useQuizSession
