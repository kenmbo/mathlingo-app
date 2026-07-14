import { useId } from 'react'
import './QuizHeader.css'

function clampPercentage(value) {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.min(Math.max(value, 0), 100)
}

function getCurrentQuestionNumber(currentQuestionIndex, totalQuestions) {
  if (totalQuestions <= 0) {
    return 0
  }

  return Math.min(Math.max(currentQuestionIndex + 1, 1), totalQuestions)
}

function QuizHeader({
  currentQuestionIndex = 0,
  progressPercentage = 0,
  totalQuestions = 0,
}) {
  const progressLabelId = useId()
  const progressTextId = useId()
  const currentQuestionNumber = getCurrentQuestionNumber(
    currentQuestionIndex,
    totalQuestions,
  )
  const progressValue = totalQuestions > 0 ? clampPercentage(progressPercentage) : 0
  const progressText =
    totalQuestions > 0
      ? `Question ${currentQuestionNumber} of ${totalQuestions}`
      : 'No questions loaded'

  return (
    <header className="quiz-header" aria-label="Quiz progress">
      <div className="quiz-header__summary">
        <p className="quiz-header__label" id={progressLabelId}>
          Progress
        </p>
        <p
          aria-live="polite"
          className="quiz-header__text"
          id={progressTextId}
        >
          {progressText}
        </p>
      </div>

      <progress
        aria-describedby={progressTextId}
        aria-labelledby={progressLabelId}
        aria-valuetext={progressText}
        className="quiz-header__progress"
        max={totalQuestions > 0 ? totalQuestions : 1}
        value={totalQuestions > 0 ? currentQuestionNumber : progressValue}
      >
        {progressText}
      </progress>
    </header>
  )
}

export default QuizHeader
