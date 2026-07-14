import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { quizQuestions } from './test/fixtures/quizQuestions.js'
import {
  fetchQuestions,
  getQuestionCountInput,
  renderApp,
  setQuestionCount,
  startQuiz,
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

describe('App setup', () => {
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
