import { environmentConfig } from './config/environment'
import QuizSetup from './components/quiz/QuizSetup'
import QuizHeader from './components/quiz/QuizHeader'
import QuizQuestion from './components/quiz/QuizQuestion'
import useQuizSession, { QUIZ_SESSION_STATUSES } from './hooks/useQuizSession'
import './App.css'

function formatPercentageScore(score) {
  if (!Number.isFinite(score)) {
    return '0%'
  }

  return `${Math.round(score)}%`
}

function App() {
  const quizSession = useQuizSession()
  const isLoading = quizSession.status === QUIZ_SESSION_STATUSES.LOADING
  const isCompleted = quizSession.status === QUIZ_SESSION_STATUSES.COMPLETED
  const hasError = quizSession.status === QUIZ_SESSION_STATUSES.ERROR
  const isActiveQuestion =
    quizSession.status === QUIZ_SESSION_STATUSES.ACTIVE &&
    Boolean(quizSession.currentQuestion)
  const workspaceLabel = isActiveQuestion
    ? 'Active quiz question'
    : isCompleted
      ? 'Completed quiz'
      : isLoading
        ? 'Loading quiz'
        : 'Quiz setup'

  if (!environmentConfig.isValid) {
    return (
      <main className="app-shell app-shell--error" aria-labelledby="app-title">
        <section className="app-intro" role="alert">
          <p className="eyebrow">Configuration required</p>
          <h1 id="app-title">MathLingo</h1>
          <p className="lede">{environmentConfig.errorMessage}</p>
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
            <section
              aria-live="polite"
              className="quiz-state quiz-state--loading"
              role="status"
            >
              <h2>Loading questions</h2>
              <p>Fetching your quiz from the question service.</p>
            </section>
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
            <section className="quiz-state quiz-state--completed">
              <h2>Quiz complete</h2>
              <p>
                You answered {quizSession.currentScore} of{' '}
                {quizSession.totalQuestions} questions correctly (
                {formatPercentageScore(quizSession.finalPercentageScore)}).
              </p>
              <button onClick={quizSession.resetSession} type="button">
                Start another quiz
              </button>
            </section>
          ) : (
            <>
              {quizSession.isEmptyResult ? (
                <div className="quiz-notice" role="status">
                  The question service responded, but it did not return any
                  questions. Try another setup.
                </div>
              ) : null}

              {hasError ? (
                <div className="quiz-notice quiz-notice--error" role="alert">
                  {quizSession.error?.message ||
                    'Questions could not be loaded. Try another setup.'}
                </div>
              ) : null}

              <QuizSetup onStart={quizSession.startSession} />
            </>
          )}
        </section>
      </section>
    </main>
  )
}

export default App

