function AnswerChoice({
  choiceId,
  choiceName,
  choiceText,
  isSelected,
  onSelect,
  value,
}) {
  return (
    <label className="answer-choice" data-selected={isSelected ? 'true' : 'false'}>
      <input
        checked={isSelected}
        id={choiceId}
        name={choiceName}
        onChange={() => onSelect(value)}
        type="radio"
        value={value}
      />
      <span>{choiceText}</span>
    </label>
  )
}

export default AnswerChoice

