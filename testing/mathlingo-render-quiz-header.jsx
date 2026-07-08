import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import QuizHeader from '../src/components/quiz/QuizHeader.jsx'

function assertIncludes(markup, expected) {
  if (!markup.includes(expected)) {
    throw new Error(`Expected markup to include: ${expected}`)
  }
}

function assertExcludes(markup, unexpected) {
  if (markup.includes(unexpected)) {
    throw new Error(`Expected markup not to include: ${unexpected}`)
  }
}

const firstMarkup = renderToStaticMarkup(
  <QuizHeader
    currentQuestionIndex={0}
    progressPercentage={10}
    totalQuestions={10}
  />,
)
assertIncludes(firstMarkup, 'Question 1 of 10')
assertIncludes(firstMarkup, 'aria-valuetext="Question 1 of 10"')
assertIncludes(firstMarkup, 'value="10"')
assertExcludes(firstMarkup, 'Score')

const finalMarkup = renderToStaticMarkup(
  <QuizHeader
    currentQuestionIndex={9}
    progressPercentage={100}
    totalQuestions={10}
  />,
)
assertIncludes(finalMarkup, 'Question 10 of 10')
assertIncludes(finalMarkup, 'aria-valuetext="Question 10 of 10"')
assertIncludes(finalMarkup, 'value="100"')

const oneQuestionMarkup = renderToStaticMarkup(
  <QuizHeader
    currentQuestionIndex={0}
    progressPercentage={100}
    totalQuestions={1}
  />,
)
assertIncludes(oneQuestionMarkup, 'Question 1 of 1')
assertIncludes(oneQuestionMarkup, 'aria-valuetext="Question 1 of 1"')
assertIncludes(oneQuestionMarkup, 'value="100"')

console.log('QuizHeader render checks passed.')

