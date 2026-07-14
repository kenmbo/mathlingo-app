import { screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { quizQuestions } from './test/fixtures/quizQuestions.js'
import {
  expectProgress,
  fetchQuestions,
  getAnswerChoice,
  startQuizWithQuestions,
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
