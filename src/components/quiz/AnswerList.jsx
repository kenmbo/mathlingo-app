import { useId } from 'react'
import { getAnswerLetterForIndex } from '../../utils/answerChoices'
import AnswerChoice from './AnswerChoice'

function AnswerList({
  answerRecord = null,
  answerChoices,
  groupLabel,
  isSubmitted = false,
  onSelectAnswer,
  selectedAnswer,
}) {
  const groupId = useId()
  const correctAnswer = answerRecord?.correctAnswer ?? null

  return (
    <fieldset className="answer-list" aria-label={groupLabel}>
      <legend>Answer choices</legend>
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

