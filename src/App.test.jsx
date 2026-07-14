import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from './App.jsx'

vi.mock('./api/questionsApi.js', async () => {
  const actual = await vi.importActual('./api/questionsApi.js')

  return {
    ...actual,
    fetchQuestions: vi.fn(),
  }
})

describe('App', () => {
  it('renders the quiz setup screen', () => {
    render(<App />)

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
})
