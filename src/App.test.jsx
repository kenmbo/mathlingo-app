import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.jsx'
import {
  fetchQuestions,
  QUESTION_API_ERROR_CODES,
  QuestionsApiError,
} from './api/questionsApi.js'

vi.mock('./api/questionsApi.js', async () => {
  const actual = await vi.importActual('./api/questionsApi.js')

  return {
    ...actual,
    fetchQuestions: vi.fn(),
  }
})

const quizQuestions = [
  {
    id: 'question-1',
    difficulty: 'medium',
    math_subject: 'Algebra',
    question: 'What is 3x when x = 4?',
    answer_choice_list: ['A. 7', 'B. 9', 'C. 12', 'D. 16'],
    answer: 'C',
  },
  {
    id: 'question-2',
    difficulty: 'hard',
    math_subject: 'Geometry',
    question: 'A right triangle has legs of 5 and 12. What is the hypotenuse?',
    answer_choice_list: ['A. 11', 'B. 12', 'C. 13', 'D. 17'],
    answer: 'C',
  },
]

function renderApp() {
  const user = userEvent.setup()

  render(<App />)

  return { user }
}

function createDeferred() {
  let resolve
  let reject
  const promise = new Promise((promiseResolve, promiseReject) => {
    resolve = promiseResolve
    reject = promiseReject
  })

  return {
    promise,
    resolve,
    reject,
  }
}

function createQuestionRequestError(errorConfig) {
  return new QuestionsApiError(errorConfig)
}

function getQuestionCountInput() {
  return screen.getByLabelText('Number of questions')
}

function getAnswerChoice(answerLetter) {
  return screen.getByRole('radio', {
    name: new RegExp(`^${answerLetter}\\.`, 'i'),
  })
}

function expectProgress(text) {
  expect(screen.getByRole('progressbar', { name: 'Progress' }))
    .toHaveAccessibleDescription(text)
  expect(screen.getAllByText(text).length).toBeGreaterThan(0)
}

async function setQuestionCount(user, value) {
  const countInput = getQuestionCountInput()

  await user.clear(countInput)

  if (value) {
    await user.type(countInput, value)
  }
}

async function startQuiz(user) {
  await user.click(screen.getByRole('button', { name: 'Start quiz' }))
}

async function startQuizWithQuestions(questions = quizQuestions) {
  fetchQuestions.mockResolvedValueOnce(questions)
  const { user } = renderApp()

  await startQuiz(user)
  await screen.findByRole('heading', { name: questions[0].question })

  return { user }
}

async function submitAnswer(user, answerLetter) {
  await user.click(getAnswerChoice(answerLetter))
  await user.click(screen.getByRole('button', { name: 'Submit answer' }))
}

async function completeQuizWithAnswers(answerLetters, questions = quizQuestions) {
  const { user } = await startQuizWithQuestions(questions)

  for (const [index, answerLetter] of answerLetters.entries()) {
    await submitAnswer(user, answerLetter)
    await user.click(
      screen.getByRole('button', {
        name: index === answerLetters.length - 1 ? 'Finish quiz' : 'Next question',
      }),
    )
  }

  await screen.findByRole('heading', { name: 'Session summary' })

  return { user }
}

beforeEach(() => {
  fetchQuestions.mockReset()
})

describe('App quiz setup', () => {
  it('renders the quiz setup screen', () => {
    renderApp()

    expect(
      screen.getByRole('heading', { name: 'MathLingo', level: 1 }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Set up a quiz', level: 2 }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Start quiz' }),
    ).toBeInTheDocument()
  })

  it.each(['1', '20'])(
    'starts a quiz when the question count is %s',
    async (questionCount) => {
      fetchQuestions.mockResolvedValueOnce([quizQuestions[0]])
      const { user } = renderApp()

      await setQuestionCount(user, questionCount)
      await startQuiz(user)

      expect(fetchQuestions).toHaveBeenCalledWith(
        expect.objectContaining({
          difficulty: 'medium',
          numQuestions: Number(questionCount),
        }),
      )
      expect(
        await screen.findByRole('heading', { name: quizQuestions[0].question }),
      ).toBeInTheDocument()
    },
  )

  it.each([
    ['0', 'Enter a number from 1 to 20.'],
    ['21', 'Enter a number from 1 to 20.'],
    ['2.5', 'Enter a whole number from 1 to 20.'],
    ['', 'Enter a whole number from 1 to 20.'],
    ['abc', 'Enter a whole number from 1 to 20.'],
  ])(
    'shows validation feedback and does not start when count is %s',
    async (questionCount, expectedMessage) => {
      const { user } = renderApp()

      await setQuestionCount(user, questionCount)
      await startQuiz(user)

      expect(fetchQuestions).not.toHaveBeenCalled()
      expect(screen.getByRole('alert')).toHaveTextContent(expectedMessage)
      expect(getQuestionCountInput()).toHaveFocus()
    },
  )

  it('passes the selected difficulty and question count to the API module', async () => {
    fetchQuestions.mockResolvedValueOnce([quizQuestions[0]])
    const { user } = renderApp()

    await user.click(screen.getByRole('radio', { name: 'Hard' }))
    await setQuestionCount(user, '3')
    await startQuiz(user)

    expect(fetchQuestions).toHaveBeenCalledWith(
      expect.objectContaining({
        difficulty: 'hard',
        numQuestions: 3,
      }),
    )
  })
})

describe('App request states', () => {
  it('shows loading UI and prevents duplicate starts while questions load', async () => {
    const questionRequest = createDeferred()
    fetchQuestions.mockReturnValueOnce(questionRequest.promise)
    const { user } = renderApp()

    await startQuiz(user)

    expect(
      screen.getByRole('status', { name: 'Loading questions' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Start quiz' }),
    ).not.toBeInTheDocument()
    expect(fetchQuestions).toHaveBeenCalledTimes(1)

    questionRequest.resolve([quizQuestions[0]])

    expect(
      await screen.findByRole('heading', { name: quizQuestions[0].question }),
    ).toBeInTheDocument()
  })

  it('renders a valid question response', async () => {
    await startQuizWithQuestions([quizQuestions[0]])

    expect(screen.getByText('Algebra')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: quizQuestions[0].question }),
    ).toBeInTheDocument()

    for (const answerChoice of quizQuestions[0].answer_choice_list) {
      expect(
        screen.getByRole('radio', { name: answerChoice }),
      ).toBeInTheDocument()
    }
  })

  it('shows a safe error when invalid question data is rejected', async () => {
    fetchQuestions.mockRejectedValueOnce(
      createQuestionRequestError({
        code: QUESTION_API_ERROR_CODES.INVALID_RESPONSE,
        message: 'Question response did not match the expected shape.',
        status: 200,
      }),
    )
    const { user } = renderApp()

    await startQuiz(user)

    expect(
      await screen.findByRole('heading', { name: 'Unexpected question data' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'MathLingo received question data it could not safely display. Try again or return to setup.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Return to setup' }),
    ).toBeInTheDocument()
  })

  it('shows the dedicated empty state for an empty question response', async () => {
    fetchQuestions.mockResolvedValueOnce([])
    const { user } = renderApp()

    await startQuiz(user)

    expect(
      await screen.findByRole('heading', { name: 'No questions available' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'The question service responded successfully, but it did not return any questions for this quiz.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })

  it('shows a normalized network error with recovery options', async () => {
    fetchQuestions.mockRejectedValueOnce(
      createQuestionRequestError({
        code: QUESTION_API_ERROR_CODES.NETWORK_ERROR,
        message: 'Question request failed before the backend responded.',
      }),
    )
    const { user } = renderApp()

    await startQuiz(user)

    expect(
      await screen.findByRole('heading', {
        name: 'Cannot reach the question service',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'MathLingo could not connect to the backend. Make sure it is running, then try again.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Return to setup' }),
    ).toBeInTheDocument()
  })

  it('retries after a failed request and recovers into the quiz flow', async () => {
    fetchQuestions
      .mockRejectedValueOnce(
        createQuestionRequestError({
          code: QUESTION_API_ERROR_CODES.NETWORK_ERROR,
          message: 'Question request failed before the backend responded.',
        }),
      )
      .mockResolvedValueOnce([quizQuestions[0]])
    const { user } = renderApp()

    await startQuiz(user)
    await screen.findByRole('heading', {
      name: 'Cannot reach the question service',
    })

    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(fetchQuestions).toHaveBeenCalledTimes(2)
    expect(
      await screen.findByRole('heading', { name: quizQuestions[0].question }),
    ).toBeInTheDocument()
  })
})

describe('App answer flow', () => {
  it('selects an answer and waits for explicit submission before showing feedback', async () => {
    const { user } = await startQuizWithQuestions([quizQuestions[0]])
    const submitButton = screen.getByRole('button', { name: 'Submit answer' })

    expect(submitButton).toBeDisabled()

    await user.click(getAnswerChoice('C'))

    expect(getAnswerChoice('C')).toBeChecked()
    expect(submitButton).toBeEnabled()
    expect(screen.queryByText('Correct!')).not.toBeInTheDocument()
    expect(screen.queryByText('Incorrect.')).not.toBeInTheDocument()

    await user.click(submitButton)

    expect(screen.getByText('Correct!')).toBeInTheDocument()
  })

  it('shows text feedback for a correct answer', async () => {
    const { user } = await startQuizWithQuestions([quizQuestions[0]])

    await submitAnswer(user, 'C')

    const feedback = screen.getByRole('status')

    expect(within(feedback).getByText('Correct!')).toBeInTheDocument()
    expect(within(feedback).getByText('The answer is C. 12.')).toBeInTheDocument()
  })

  it('shows text feedback for an incorrect answer and identifies both answers', async () => {
    const { user } = await startQuizWithQuestions([quizQuestions[0]])

    await submitAnswer(user, 'A')

    const feedback = screen.getByRole('status')

    expect(within(feedback).getByText('Incorrect.')).toBeInTheDocument()
    expect(
      within(feedback).getByText('You selected A. The correct answer is C. 12.'),
    ).toBeInTheDocument()
    expect(getAnswerChoice('A')).toBeChecked()
    expect(screen.getByText('Your answer')).toBeInTheDocument()
    expect(screen.getByText('Correct answer')).toBeInTheDocument()
  })

  it('locks answer choices after submission', async () => {
    const { user } = await startQuizWithQuestions([quizQuestions[0]])

    await submitAnswer(user, 'A')

    expect(getAnswerChoice('A')).toBeDisabled()
    expect(getAnswerChoice('B')).toBeDisabled()
    expect(getAnswerChoice('C')).toBeDisabled()
    expect(getAnswerChoice('D')).toBeDisabled()

    await user.click(getAnswerChoice('C'))

    expect(getAnswerChoice('A')).toBeChecked()
    expect(getAnswerChoice('C')).not.toBeChecked()
  })

  it('prevents duplicate scoring after repeated submission interactions', async () => {
    const { user } = await startQuizWithQuestions([quizQuestions[0]])

    await user.click(getAnswerChoice('C'))
    await user.dblClick(screen.getByRole('button', { name: 'Submit answer' }))

    expect(
      screen.queryByRole('button', { name: 'Submit answer' }),
    ).not.toBeInTheDocument()

    await user.dblClick(screen.getByRole('button', { name: 'Finish quiz' }))

    expect(
      await screen.findByText('You answered 1 of 1 questions correctly.'),
    ).toBeInTheDocument()
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('advances to the next question after submission and updates progress', async () => {
    const { user } = await startQuizWithQuestions(quizQuestions)

    expectProgress('Question 1 of 2')

    await submitAnswer(user, 'C')
    await user.click(screen.getByRole('button', { name: 'Next question' }))

    expectProgress('Question 2 of 2')
    expect(
      screen.getByRole('heading', { name: quizQuestions[1].question }),
    ).toBeInTheDocument()
  })

  it('uses a final completion action on the last question', async () => {
    const { user } = await startQuizWithQuestions([quizQuestions[0]])

    await submitAnswer(user, 'C')

    expect(
      screen.queryByRole('button', { name: 'Next question' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Finish quiz' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Finish quiz' }))

    expect(
      await screen.findByRole('heading', { name: 'Session summary' }),
    ).toBeInTheDocument()
  })
})

describe('App session summary', () => {
  it('displays a perfect score', async () => {
    await completeQuizWithAnswers(['C', 'C'])

    expect(
      screen.getByText('You answered 2 of 2 questions correctly.'),
    ).toBeInTheDocument()
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('displays a zero score', async () => {
    await completeQuizWithAnswers(['A', 'A'])

    expect(
      screen.getByText('You answered 0 of 2 questions correctly.'),
    ).toBeInTheDocument()
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('displays a mixed score', async () => {
    await completeQuizWithAnswers(['C', 'A'])

    expect(
      screen.getByText('You answered 1 of 2 questions correctly.'),
    ).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('starts another quiz from the summary without reloading the page', async () => {
    fetchQuestions
      .mockResolvedValueOnce([quizQuestions[0]])
      .mockResolvedValueOnce([quizQuestions[1]])
    const { user } = renderApp()

    await startQuiz(user)
    await screen.findByRole('heading', { name: quizQuestions[0].question })
    await submitAnswer(user, 'C')
    await user.click(screen.getByRole('button', { name: 'Finish quiz' }))
    await screen.findByRole('heading', { name: 'Session summary' })

    await user.click(screen.getByRole('button', { name: 'Start another quiz' }))

    expect(
      screen.getByRole('heading', { name: 'Set up a quiz' }),
    ).toBeInTheDocument()

    await startQuiz(user)

    expect(fetchQuestions).toHaveBeenCalledTimes(2)
    expect(
      await screen.findByRole('heading', { name: quizQuestions[1].question }),
    ).toBeInTheDocument()
  })
})
