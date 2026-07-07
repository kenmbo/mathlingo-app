import React from '../node_modules/react/index.js'
import { renderToStaticMarkup } from '../node_modules/react-dom/server.node.js'
import QuizQuestion from '../src/components/quiz/QuizQuestion.jsx'
import fixture from '../example_stream_questions.json'

const question = fixture.questions[0]

const unselectedMarkup = renderToStaticMarkup(
  React.createElement(QuizQuestion, {
    hasSelectedAnswer: false,
    hasSubmittedAnswer: false,
    onSelectAnswer: () => undefined,
    onSubmitAnswer: () => undefined,
    question,
    selectedAnswer: null,
  }),
)

const selectedMarkup = renderToStaticMarkup(
  React.createElement(QuizQuestion, {
    hasSelectedAnswer: true,
    hasSubmittedAnswer: false,
    onSelectAnswer: () => undefined,
    onSubmitAnswer: () => undefined,
    question,
    selectedAnswer: 'C',
  }),
)

const selectedAnswerMatch = selectedMarkup.match(
  /<input[^>]+type="radio"[^>]+value="C"[^>]*>/,
)

console.log(
  JSON.stringify(
    {
      rendersQuestion: unselectedMarkup.includes(question.question),
      preservesChoiceText: question.answer_choice_list.every((choice) =>
        unselectedMarkup.includes(choice),
      ),
      avoidsDuplicateChoicePrefix: !unselectedMarkup.includes('A. A. 3'),
      disablesSubmitWithoutSelection: unselectedMarkup.includes(
        '<button disabled="" type="button">Submit answer</button>',
      ),
      enablesSubmitWithSelection: selectedMarkup.includes(
        '<button type="button">Submit answer</button>',
      ),
      selectedAnswerMarkup: selectedAnswerMatch?.[0] ?? null,
      selectedAnswerChecked: selectedAnswerMatch?.[0]?.includes('checked=""') ?? false,
    },
    null,
    2,
  ),
)

