export const ANSWER_LETTERS = Object.freeze(['A', 'B', 'C', 'D'])

export function getAnswerLetterForIndex(index) {
  return ANSWER_LETTERS[index] ?? null
}

export function getChoiceTextForAnswerLetter(answerChoices, answerLetter) {
  const choiceIndex = ANSWER_LETTERS.indexOf(answerLetter)

  if (choiceIndex === -1) {
    return ''
  }

  return answerChoices[choiceIndex] ?? ''
}

