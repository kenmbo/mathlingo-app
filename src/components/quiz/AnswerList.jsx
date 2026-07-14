import { useId } from 'react'
import { getAnswerLetterForIndex } from '../../utils/answerChoices'
import AnswerChoice from './AnswerChoice'

function AnswerList({
  answerRecord = null,
  answerChoices,
  isSubmitted = false,
  onSelectAnswer,
  questionHeadingId,
  selectedAnswer,
}) {
  const groupId = useId()
  const legendId = useId()
  const instructionsId = useId()
  const correctAnswer = answerRecord?.correctAnswer ?? null
  const groupLabelIds = questionHeadingId
    ? `${legendId} ${questionHeadingId}`
    : legendId

  return (
    <fieldset
      aria-describedby={instructionsId}
      aria-labelledby={groupLabelIds}
      className="answer-list"
    >
      <legend id={legendId}>Answer choices</legend>
      <p className="visually-hidden" id={instructionsId}>
        {isSubmitted
          ? 'Answer choices are locked after submission. Review the feedback before continuing.'
          : 'Choose one answer, then submit your answer.'}
      </p>
      <div className="answer-list__choices">
        {answerChoices.map((choiceText, index) => {
          const answerLetter = getAnswerLetterForIndex(index)
          const isSelected = selectedAnswer === answerLetter
          const isCorrectAnswer = isSubmitted && correctAnswer === answerLetter
          const isIncorrectSelected =
            isSubmitted && isSelected && correctAnswer !== answerLetter

          return (
            <AnswerChoice
              choiceId={`${groupId}-${answerLetter}`}
              choiceName={groupId}
              choiceText={choiceText}
              isCorrectAnswer={isCorrectAnswer}
              isDisabled={isSubmitted}
              isIncorrectSelected={isIncorrectSelected}
              isSelected={isSelected}
              key={answerLetter}
              onSelect={onSelectAnswer}
              value={answerLetter}
            />
          )
        })}
      </div>
    </fieldset>
  )
}

export default AnswerList
