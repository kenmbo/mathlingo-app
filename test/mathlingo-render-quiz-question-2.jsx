import React from '../node_modules/react/index.js'
import { renderToStaticMarkup } from '../node_modules/react-dom/server.node.js'
import QuizQuestion from '../src/components/quiz/QuizQuestion.jsx'
import fixture from '../example_stream_questions.json'

const question = fixture.questions[0]

function renderQuestion(props) {
  return renderToStaticMarkup(
    React.createElement(QuizQuestion, {
      onGoToNextQuestion: () => undefined,
      onSelectAnswer: () => undefined,
      onSubmitAnswer: () => undefined,
      question,
      ...props,
    }),
  )
}

const unsubmittedMarkup = renderQuestion({
  answerRecord: null,
  hasSelectedAnswer: false,
  hasSubmittedAnswer: false,
  isFinalQuestion: false,
})

const selectedMarkup = renderQuestion({
  answerRecord: {
    selectedAnswer: 'B',
    correctAnswer: 'C',
    isSubmitted: false,
    isCorrect: null,
  },
  hasSelectedAnswer: true,
  hasSubmittedAnswer: false,
  isFinalQuestion: false,
})

const correctMarkup = renderQuestion({
  answerRecord: {
    selectedAnswer: 'C',
    correctAnswer: 'C',
    isSubmitted: true,
    isCorrect: true,
  },
  hasSelectedAnswer: true,
  hasSubmittedAnswer: true,
  isFinalQuestion: false,
})

const incorrectFinalMarkup = renderQuestion({
  answerRecord: {
    selectedAnswer: 'B',
    correctAnswer: 'C',
    isSubmitted: true,
    isCorrect: false,
  },
  hasSelectedAnswer: true,
  hasSubmittedAnswer: true,
  isFinalQuestion: true,
})

console.log(
  JSON.stringify(
    {
      beforeSubmitHasNoFeedback:
        !unsubmittedMarkup.includes('Correct!') &&
        !unsubmittedMarkup.includes('Incorrect.'),
      beforeSubmitHasNoNextOrFinish:
        !unsubmittedMarkup.includes('Next question') &&
        !unsubmittedMarkup.includes('Finish quiz'),
      submitDisabledUntilSelection: unsubmittedMarkup.includes(
        '<button disabled="" type="button">Submit answer</button>',
      ),
      selectedSubmitEnabled: selectedMarkup.includes(
        '<button type="button">Submit answer</button>',
      ),
      preservesChoiceText: question.answer_choice_list.every((choice) =>
        correctMarkup.includes(choice),
      ),
      avoidsDuplicateChoicePrefix: !correctMarkup.includes('C. C. 7'),
      correctFeedbackShown:
        correctMarkup.includes('Correct!') &&
        correctMarkup.includes('The answer is C. 7.'),
      incorrectFeedbackShown:
        incorrectFinalMarkup.includes('Incorrect.') &&
        incorrectFinalMarkup.includes(
          'You selected B. The correct answer is C. 7.',
        ),
      choicesDisabledAfterSubmit: correctMarkup.includes('disabled=""'),
      correctChoiceLabelShown: incorrectFinalMarkup.includes('Correct answer'),
      incorrectSelectedLabelShown: incorrectFinalMarkup.includes('Your answer'),
      nextActionAfterSubmitted: correctMarkup.includes('Next question'),
      finishActionOnFinal: incorrectFinalMarkup.includes('Finish quiz'),
    },
    null,
    2,
  ),
)

