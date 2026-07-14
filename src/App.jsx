import { useEffect, useId, useRef } from 'react'
import { environmentConfig } from './config/environment'
import {
  QUESTION_API_ERROR_CODES,
} from './api/questionsApi'
import LoadingIndicator from './components/common/LoadingIndicator'
import ErrorMessage from './components/common/ErrorMessage'
import QuizSetup from './components/quiz/QuizSetup'
import QuizHeader from './components/quiz/QuizHeader'
import QuizQuestion from './components/quiz/QuizQuestion'
import QuizSummary from './components/quiz/QuizSummary'
import useQuizSession, { QUIZ_SESSION_STATUSES } from './hooks/useQuizSession'
import './App.css'

function getQuestionRequestErrorMessage(error) {
  if (error?.code === QUESTION_API_ERROR_CODES.NETWORK_ERROR) {
    return {
      title: 'Cannot reach the question service',
      message:
        'MathLingo could not connect to the backend. Make sure it is running, then try again.',
      canRetry: true,
      canReturnToSetup: true,
    }
  }

  if (error?.status === 400) {
    return {
      title: 'Quiz settings need an adjustment',
      message:
        'The question service rejected these quiz settings. Return to setup and choose a valid difficulty and question count.',
      canRetry: false,
      canReturnToSetup: true,
    }
  }

  if (error?.status === 502) {
    return {
      title: 'Question generation failed',
      message:
        'The question service could not prepare this quiz. Try again in a moment.',
      canRetry: true,
      canReturnToSetup: true,
    }
  }

  if (error?.status === 503) {
    return {
      title: 'Question service unavailable',
      message:
        'The question service is temporarily unavailable. Try again in a moment.',
      canRetry: true,
      canReturnToSetup: true,
    }
  }

  if (error?.status === 500) {
    return {
      title: 'Question service hit a problem',
      message:
        'The backend could not finish loading this quiz. Try again in a moment.',
      canRetry: true,
      canReturnToSetup: true,
    }
  }

  if (
    error?.code === QUESTION_API_ERROR_CODES.INVALID_JSON ||
    error?.code === QUESTION_API_ERROR_CODES.INVALID_RESPONSE
  ) {
    return {
      title: 'Unexpected question data',
      message:
        'MathLingo received question data it could not safely display. Try again or return to setup.',
      canRetry: true,
      canReturnToSetup: true,
    }
  }

  return {
    title: 'Questions could not be loaded',
    message:
      'MathLingo could not load this quiz. Try again or return to setup.',
    canRetry: true,
    canReturnToSetup: true,
  }
}

function getDeveloperErrorDetails(error) {
  if (!import.meta.env.DEV || !error) {
    return ''
  }

  const detailParts = [
    error.code ? `Code: ${error.code}` : '',
    error.status ? `HTTP status: ${error.status}` : '',
    error.message ? `Normalized message: ${error.message}` : '',
  ].filter(Boolean)

  return detailParts.join(' | ')
}

function App() {
  const emptyStateHeadingId = useId()
  const emptyStateMessageId = useId()
  const emptyStateRef = useRef(null)
  const quizSession = useQuizSession()
  const isLoading = quizSession.status === QUIZ_SESSION_STATUSES.LOADING
  const isCompleted = quizSession.status === QUIZ_SESSION_STATUSES.COMPLETED
  const hasError = quizSession.status === QUIZ_SESSION_STATUSES.ERROR
  const hasEmptyResult =
    quizSession.status === QUIZ_SESSION_STATUSES.IDLE &&
    quizSession.isEmptyResult
  const isActiveQuestion =
    quizSession.status === QUIZ_SESSION_STATUSES.ACTIVE &&
    Boolean(quizSession.currentQuestion)
  const errorMessage = hasError
    ? getQuestionRequestErrorMessage(quizSession.error)
    : null
  const canRetryLastRequest = Boolean(quizSession.config) && !isLoading
  const workspaceLabel = isActiveQuestion
    ? 'Active quiz question'
    : isCompleted
      ? 'Completed quiz'
      : isLoading
        ? 'Loading quiz'
        : hasError
          ? 'Quiz loading error'
          : hasEmptyResult
            ? 'No questions available'
            : 'Quiz setup'

  useEffect(() => {
    if (hasEmptyResult) {
      emptyStateRef.current?.focus()
    }
  }, [hasEmptyResult])

  if (!environmentConfig.isValid) {
    return (
      <main className="app-shell app-shell--error" aria-labelledby="app-title">
        <section
          aria-describedby="app-config-error"
          className="app-intro"
          role="alert"
        >
          <p className="eyebrow">Configuration required</p>
          <h1 id="app-title">MathLingo</h1>
          <p className="lede" id="app-config-error">
            {environmentConfig.errorMessage}
          </p>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell" aria-labelledby="app-title">
      <section className="app-intro">
        <p className="eyebrow">SAT and ACT math practice</p>
        <h1 id="app-title">MathLingo</h1>
        <p className="lede">
          A focused study space for multiple-choice math practice, immediate
          feedback, and steady session progress.
        </p>

        <section
          className="quiz-workspace"
          aria-label={workspaceLabel}
        >
          {isLoading ? (
            <LoadingIndicator />
          ) : isActiveQuestion ? (
            <div className="active-quiz">
              <QuizHeader
                currentQuestionIndex={quizSession.currentQuestionIndex}
                progressPercentage={quizSession.progressPercentage}
                totalQuestions={quizSession.totalQuestions}
              />
              <QuizQuestion
                answerRecord={quizSession.currentAnswerRecord}
                hasSelectedAnswer={quizSession.hasSelectedAnswer}
                hasSubmittedAnswer={quizSession.hasSubmittedCurrentAnswer}
                isFinalQuestion={quizSession.isFinalQuestion}
                onGoToNextQuestion={quizSession.goToNextQuestion}
                onSelectAnswer={quizSession.selectAnswer}
                onSubmitAnswer={quizSession.submitAnswer}
                question={quizSession.currentQuestion}
              />
            </div>
          ) : isCompleted ? (
            <QuizSummary
              answers={quizSession.answers}
              onStartAnotherQuiz={quizSession.returnToSetup}
              questions={quizSession.questions}
            />
          ) : hasEmptyResult ? (
            <section
              aria-describedby={emptyStateMessageId}
              aria-labelledby={emptyStateHeadingId}
              aria-live="polite"
              className="quiz-state quiz-state--empty"
              ref={emptyStateRef}
              role="status"
              tabIndex={-1}
            >
              <h2 id={emptyStateHeadingId}>No questions available</h2>
              <p id={emptyStateMessageId}>
                The question service responded successfully, but it did not
                return any questions for this quiz.
              </p>
              <div className="quiz-state__actions">
                {canRetryLastRequest ? (
                  <button
                    onClick={quizSession.retryLastRequest}
                    type="button"
                  >
                    Try again
                  </button>
                ) : null}
                <button
                  className="quiz-state__secondary-action"
                  onClick={quizSession.returnToSetup}
                  type="button"
                >
                  Return to setup
                </button>
              </div>
            </section>
          ) : hasError ? (
            <ErrorMessage
              details={getDeveloperErrorDetails(quizSession.error)}
              message={errorMessage.message}
              onRetry={
                errorMessage.canRetry && canRetryLastRequest
                  ? quizSession.retryLastRequest
                  : undefined
              }
              onReturnToSetup={
                errorMessage.canReturnToSetup
                  ? quizSession.returnToSetup
                  : undefined
              }
              title={errorMessage.title}
            />
          ) : (
            <QuizSetup
              initialConfig={quizSession.config}
              isLoading={isLoading}
              onStart={quizSession.startSession}
            />
          )}
        </section>
      </section>
    </main>
  )
}

export default App
