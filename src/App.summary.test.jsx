import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { quizQuestions } from './test/fixtures/quizQuestions.js'
import {
  completeQuizWithAnswers,
  fetchQuestions,
  renderApp,
  startQuiz,
  submitAnswer,
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
