function AnswerChoice({
  choiceId,
  choiceName,
  choiceText,
  isCorrectAnswer = false,
  isDisabled = false,
  isIncorrectSelected = false,
  isSelected,
  onSelect,
  value,
}) {
  const choiceState = isCorrectAnswer
    ? 'correct'
    : isIncorrectSelected
      ? 'incorrect'
      : isSelected
        ? 'selected'
        : 'idle'
  const stateLabel =
    choiceState === 'correct'
      ? 'Correct answer'
      : choiceState === 'incorrect'
        ? 'Your answer'
        : choiceState === 'selected'
          ? 'Selected'
          : ''
  const stateLabelId = `${choiceId}-state`

  return (
    <label className="answer-choice" data-state={choiceState}>
      <input
        aria-describedby={stateLabel ? stateLabelId : undefined}
        checked={isSelected}
        disabled={isDisabled}
        id={choiceId}
        name={choiceName}
        onChange={() => onSelect(value)}
        type="radio"
        value={value}
      />
      <span className="answer-choice__text">{choiceText}</span>
      {stateLabel ? (
        <span className="answer-choice__state" id={stateLabelId}>
          {stateLabel}
        </span>
      ) : null}
    </label>
  )
}

export default AnswerChoice

