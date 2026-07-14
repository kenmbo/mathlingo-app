/* eslint-disable react-refresh/only-export-components */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect } from 'vitest'
import App from '../../App.jsx'
import {
  fetchQuestions,
  QUESTION_API_ERROR_CODES,
  QuestionsApiError,
} from '../../api/questionsApi.js'
import { quizQuestions } from '../fixtures/quizQuestions.js'

export { fetchQuestions, QUESTION_API_ERROR_CODES }

export function renderApp() {
  const user = userEvent.setup()

  render(<App />)

  return { user }
}

export function createDeferred() {
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

export function createQuestionRequestError(errorConfig) {
  return new QuestionsApiError(errorConfig)
}

export function getQuestionCountInput() {
  return screen.getByLabelText('Number of questions')
}

export function getAnswerChoice(answerLetter) {
  return screen.getByRole('radio', {
    name: new RegExp(`^${answerLetter}\\.`, 'i'),
  })
}

export function expectProgress(text) {
  expect(screen.getByRole('progressbar', { name: 'Progress' }))
    .toHaveAccessibleDescription(text)
  expect(screen.getAllByText(text).length).toBeGreaterThan(0)
}

export async function setQuestionCount(user, value) {
  const countInput = getQuestionCountInput()

  await user.clear(countInput)

  if (value) {
    await user.type(countInput, value)
  }
}

export async function startQuiz(user) {
  await user.click(screen.getByRole('button', { name: 'Start quiz' }))
}

export async function startQuizWithQuestions(questions = quizQuestions) {
  fetchQuestions.mockResolvedValueOnce(questions)
  const { user } = renderApp()

  await startQuiz(user)
  await screen.findByRole('heading', { name: questions[0].question })

  return { user }
}

export async function submitAnswer(user, answerLetter) {
  await user.click(getAnswerChoice(answerLetter))
  await user.click(screen.getByRole('button', { name: 'Submit answer' }))
}

export async function completeQuizWithAnswers(
  answerLetters,
  questions = quizQuestions,
) {
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
