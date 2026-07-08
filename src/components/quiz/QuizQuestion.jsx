import AnswerList from './AnswerList'
import './QuizQuestion.css'

function formatDifficulty(difficulty) {
  if (!difficulty) {
    return ''
  }

  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
}

function QuizQuestion({
  hasSelectedAnswer = false,
  hasSubmittedAnswer = false,
  onSelectAnswer,
  onSubmitAnswer,
  question,
  selectedAnswer = null,
}) {
  if (!question) {
    return null
  }

  return (
    <section className="quiz-question" aria-labelledby="quiz-question-heading">
      <div className="quiz-question__meta" aria-label="Question details">
        <span>{question.math_subject}</span>
        <span>{formatDifficulty(question.difficulty)}</span>
      </div>

      <h2 id="quiz-question-heading">{question.question}</h2>

      <AnswerList
        answerChoices={question.answer_choice_list}
        groupLabel={`Answer choices for: ${question.question}`}
        onSelectAnswer={onSelectAnswer}
        selectedAnswer={selectedAnswer}
      />

      <div className="quiz-question__actions">
        <button
          disabled={!hasSelectedAnswer || hasSubmittedAnswer}
          onClick={onSubmitAnswer}
          type="button"
        >
          Submit answer
        </button>
      </div>
    </section>
  )
}

export default QuizQuestion
