import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { quizQuestions } from './test/fixtures/quizQuestions.js'
import {
  createDeferred,
  createQuestionRequestError,
  fetchQuestions,
  QUESTION_API_ERROR_CODES,
  renderApp,
  startQuiz,
  startQuizWithQuestions,
} from './test/utils/appTestUtils.jsx'

vi.mock('./api/questionsApi.js', async () => {
  const actual = await vi.importActual('./api/questionsApi.js')

  return {
    ...actual,
    fetchQuestions: vi.fn(),
  }
})

beforeEach(() => {
  fetchQuestions.mockReset()
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

