import { useEffect, useRef } from 'react'
import { createQuizSessionSummary } from '../../utils/quizScoring.js'
import './QuizSummary.css'

function formatPercentageScore(score) {
  if (!Number.isFinite(score)) {
    return '0%'
  }

  return `${Math.round(score)}%`
}

function formatDifficulty(difficulty) {
  if (!difficulty) {
    return 'Not specified'
  }

  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
}

function formatAnswer(answerText) {
  return answerText || 'No answer recorded'
}

function QuizSummary({
  answers = {},
  onStartAnotherQuiz = () => undefined,
  questions = [],
}) {
  const summaryHeadingRef = useRef(null)
  const summary = createQuizSessionSummary({ questions, answers })
  const percentageText = formatPercentageScore(summary.percentageScore)
  const resultText =
    summary.totalQuestions === 0
      ? 'No questions were completed in this session.'
      : `You answered ${summary.correctAnswers} of ${summary.totalQuestions} questions correctly.`

  useEffect(() => {
    summaryHeadingRef.current?.focus()
  }, [])

  return (
    <section className="quiz-summary" aria-labelledby="quiz-summary-heading">
      <div className="quiz-summary__heading">
        <p className="quiz-summary__eyebrow">Quiz complete</p>
        <h2 id="quiz-summary-heading" ref={summaryHeadingRef} tabIndex={-1}>
          Session summary
        </h2>
        <p className="quiz-summary__lede">{resultText}</p>
      </div>

      <dl className="quiz-summary__score" aria-label="Final score">
        <div>
          <dt>Correct</dt>
          <dd>{summary.correctAnswers}</dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd>{summary.totalQuestions}</dd>
        </div>
        <div>
          <dt>Score</dt>
          <dd>{percentageText}</dd>
        </div>
      </dl>

      <section
        className="quiz-summary__section"
        aria-labelledby="quiz-summary-subjects"
      >
        <h3 id="quiz-summary-subjects">Subject breakdown</h3>
        {summary.subjectBreakdown.length > 0 ? (
          <ul className="quiz-summary__subject-list">
            {summary.subjectBreakdown.map((subjectSummary) => (
              <li
                className="quiz-summary__subject-item"
                key={subjectSummary.mathSubject}
              >
                <span>{subjectSummary.mathSubject}</span>
                <strong>
                  {subjectSummary.correctAnswers} /{' '}
                  {subjectSummary.totalQuestions} correct
                </strong>
              </li>
            ))}
          </ul>
        ) : (
          <p className="quiz-summary__empty">
            No subject data is available for this session.
          </p>
        )}
      </section>

      <section
        className="quiz-summary__section"
        aria-labelledby="quiz-summary-review"
      >
        <h3 id="quiz-summary-review">Question review</h3>
        {summary.reviewItems.length > 0 ? (
          <ol className="quiz-summary__review-list">
            {summary.reviewItems.map((reviewItem) => (
              <li className="quiz-summary__review-item" key={reviewItem.id}>
                <div className="quiz-summary__review-header">
                  <p>Question {reviewItem.questionNumber}</p>
                  <span
                    className={
                      reviewItem.isCorrect
                        ? 'quiz-summary__status quiz-summary__status--correct'
                        : 'quiz-summary__status quiz-summary__status--incorrect'
                    }
                  >
                    {reviewItem.isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>

                <p className="quiz-summary__question">
                  {reviewItem.questionText}
                </p>

                <dl className="quiz-summary__review-details">
                  <div>
                    <dt>Subject</dt>
                    <dd>{reviewItem.mathSubject}</dd>
                  </div>
                  <div>
                    <dt>Difficulty</dt>
                    <dd>{formatDifficulty(reviewItem.difficulty)}</dd>
                  </div>
                  <div>
                    <dt>Selected answer</dt>
                    <dd>{formatAnswer(reviewItem.selectedAnswerText)}</dd>
                  </div>
                  <div>
                    <dt>Correct answer</dt>
                    <dd>{formatAnswer(reviewItem.correctAnswerText)}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ol>
        ) : (
          <p className="quiz-summary__empty">
            No question review is available for this session.
          </p>
        )}
      </section>

      <div className="quiz-summary__actions">
        <button onClick={onStartAnotherQuiz} type="button">
          Start another quiz
        </button>
      </div>
    </section>
  )
}

export default QuizSummary

