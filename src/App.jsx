import { environmentConfig } from './config/environment'
import QuizSetup from './components/quiz/QuizSetup'
import QuizHeader from './components/quiz/QuizHeader'
import QuizQuestion from './components/quiz/QuizQuestion'
import useQuizSession, { QUIZ_SESSION_STATUSES } from './hooks/useQuizSession'
import './App.css'

function App() {
  const quizSession = useQuizSession()
  const isLoading = quizSession.status === QUIZ_SESSION_STATUSES.LOADING
  const isActiveQuestion =
    quizSession.status === QUIZ_SESSION_STATUSES.ACTIVE &&
    Boolean(quizSession.currentQuestion)

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
          aria-label={isActiveQuestion ? 'Active quiz question' : 'Quiz setup'}
        >
          {isActiveQuestion ? (
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
          ) : (
            <QuizSetup
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

