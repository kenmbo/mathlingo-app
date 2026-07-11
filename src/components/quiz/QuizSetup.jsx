import { useId, useState } from 'react'
import {
  DIFFICULTY_OPTIONS,
  QUIZ_SETUP_DEFAULTS,
  QUIZ_SETUP_LIMITS,
  validateQuizSetupConfig,
} from '../../utils/quizSetupValidation'
import './QuizSetup.css'

function QuizSetup({
  onStart = () => undefined,
  initialConfig = null,
  isLoading = false,
  isDisabled = false,
}) {
  const initialDifficulty = initialConfig?.difficulty ?? QUIZ_SETUP_DEFAULTS.difficulty
  const initialNumQuestions = initialConfig?.numQuestions ?? QUIZ_SETUP_DEFAULTS.numQuestions
  const [difficulty, setDifficulty] = useState(initialDifficulty)
  const [numQuestions, setNumQuestions] = useState(
    String(initialNumQuestions),
  )
  const [countError, setCountError] = useState('')
  const countInputId = useId()
  const countHelpId = useId()
  const countErrorId = useId()
  const isFormDisabled = isLoading || isDisabled

  function handleSubmit(event) {
    event.preventDefault()

    if (isFormDisabled) {
      return
    }

    const validationResult = validateQuizSetupConfig({
      difficulty,
      numQuestions,
    })

    if (!validationResult.isValid) {
      setCountError(validationResult.errorMessage)
      return
    }

    setCountError('')
    onStart(validationResult.config)
  }

  function handleQuestionCountChange(event) {
    setNumQuestions(event.target.value)

    if (countError) {
      setCountError('')
    }
  }

  return (
    <form className="quiz-setup" onSubmit={handleSubmit} noValidate>
      <div className="quiz-setup__heading">
        <h2>Set up a quiz</h2>
        <p>
          Choose a difficulty and the number of questions for this practice
          round.
        </p>
      </div>

      <fieldset className="quiz-setup__fieldset" disabled={isFormDisabled}>
        <legend>Difficulty</legend>
        <div className="quiz-setup__difficulty-options">
          {DIFFICULTY_OPTIONS.map((option) => (
            <label className="quiz-setup__difficulty-option" key={option.value}>
              <input
                checked={difficulty === option.value}
                name="difficulty"
                onChange={() => setDifficulty(option.value)}
                type="radio"
                value={option.value}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="quiz-setup__field">
        <label htmlFor={countInputId}>Number of questions</label>
        <input
          aria-describedby={`${countHelpId}${countError ? ` ${countErrorId}` : ''}`}
          aria-invalid={countError ? 'true' : 'false'}
          autoComplete="off"
          disabled={isFormDisabled}
          id={countInputId}
          inputMode="numeric"
          onChange={handleQuestionCountChange}
          type="text"
          value={numQuestions}
        />
        <p className="quiz-setup__help" id={countHelpId}>
          Enter a whole number from {QUIZ_SETUP_LIMITS.minQuestions} to{' '}
          {QUIZ_SETUP_LIMITS.maxQuestions}.
        </p>
        {countError ? (
          <p className="quiz-setup__error" id={countErrorId} role="alert">
            {countError}
          </p>
        ) : null}
      </div>

      <div className="quiz-setup__actions">
        <button disabled={isFormDisabled} type="submit">
          {isLoading ? 'Starting quiz...' : 'Start quiz'}
        </button>
        {isLoading ? (
          <p className="quiz-setup__loading" role="status">
            Starting quiz...
          </p>
        ) : null}
      </div>
    </form>
  )
}

export default QuizSetup

