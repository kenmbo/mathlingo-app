import { useId } from 'react'
import AnswerChoice from './AnswerChoice'

const ANSWER_LETTERS = ['A', 'B', 'C', 'D']

function AnswerList({
  answerChoices,
  groupLabel,
  onSelectAnswer,
  selectedAnswer,
}) {
  const groupId = useId()

  return (
    <fieldset className="answer-list" aria-label={groupLabel}>
      <legend>Answer choices</legend>
      <div className="answer-list__choices">
        {answerChoices.map((choiceText, index) => {
          const answerLetter = ANSWER_LETTERS[index]

          return (
            <AnswerChoice
              choiceId={`${groupId}-${answerLetter}`}
              choiceName={groupId}
              choiceText={choiceText}
              isSelected={selectedAnswer === answerLetter}
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

