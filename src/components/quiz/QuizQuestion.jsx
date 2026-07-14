import { useEffect, useId, useRef } from 'react'
import { getChoiceTextForAnswerLetter } from '../../utils/answerChoices'
import AnswerList from './AnswerList'
import './QuizQuestion.css'

function formatDifficulty(difficulty) {
  if (!difficulty) {
    return ''
  }

  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
}

function getCorrectAnswerText(answerChoices, correctAnswer) {
  return getChoiceTextForAnswerLetter(answerChoices, correctAnswer) || correctAnswer
}

function getSubmittedFeedback(question, answerRecord) {
  if (!answerRecord?.isSubmitted) {
    return null
  }

  const correctAnswerText = getCorrectAnswerText(
    question.answer_choice_list,
    answerRecord.correctAnswer,
  )

  if (answerRecord.isCorrect) {
    return {
      tone: 'correct',
      title: 'Correct!',
      message: `The answer is ${correctAnswerText}.`,
    }
  }

  return {
    tone: 'incorrect',
    title: 'Incorrect.',
    message: `You selected ${answerRecord.selectedAnswer}. The correct answer is ${correctAnswerText}.`,
  }
}

function QuizQuestion({
  answerRecord = null,
  hasSelectedAnswer = false,
  hasSubmittedAnswer = false,
  isFinalQuestion = false,
  onGoToNextQuestion,
  onSelectAnswer,
  onSubmitAnswer,
  question,
}) {
  const questionHeadingId = useId()
  const feedbackTitleId = useId()
  const feedbackMessageId = useId()
  const questionHeadingRef = useRef(null)
  const feedbackRef = useRef(null)

  useEffect(() => {
    questionHeadingRef.current?.focus()
  }, [question?.id])

  useEffect(() => {
    if (hasSubmittedAnswer) {
      feedbackRef.current?.focus()
    }
  }, [hasSubmittedAnswer, question?.id])

  if (!question) {
    return null
  }

  const selectedAnswer = answerRecord?.selectedAnswer ?? null
  const feedback = getSubmittedFeedback(question, answerRecord)

  return (
    <section className="quiz-question" aria-labelledby={questionHeadingId}>
      <div className="quiz-question__meta" aria-label="Question details">
        <span>{question.math_subject}</span>
        <span>{formatDifficulty(question.difficulty)}</span>
      </div>

      <h2 id={questionHeadingId} ref={questionHeadingRef} tabIndex={-1}>
        {question.question}
      </h2>

      <AnswerList
        answerRecord={answerRecord}
        answerChoices={question.answer_choice_list}
        isSubmitted={hasSubmittedAnswer}
        onSelectAnswer={onSelectAnswer}
        questionHeadingId={questionHeadingId}
        selectedAnswer={selectedAnswer}
      />

      <div className="quiz-question__feedback-region" aria-live="polite">
        {feedback ? (
          <div
            aria-describedby={feedbackMessageId}
            aria-labelledby={feedbackTitleId}
            className={`quiz-question__feedback quiz-question__feedback--${feedback.tone}`}
            ref={feedbackRef}
            role="status"
            tabIndex={-1}
          >
            <p className="quiz-question__feedback-title" id={feedbackTitleId}>
              {feedback.title}
            </p>
            <p id={feedbackMessageId}>{feedback.message}</p>
          </div>
        ) : null}
      </div>

      <div className="quiz-question__actions">
        {hasSubmittedAnswer ? (
          <button onClick={onGoToNextQuestion} type="button">
            {isFinalQuestion ? 'Finish quiz' : 'Next question'}
          </button>
        ) : (
          <button
            disabled={!hasSelectedAnswer}
            onClick={onSubmitAnswer}
            type="button"
          >
            Submit answer
          </button>
        )}
      </div>
    </section>
  )
}

export default QuizQuestion

