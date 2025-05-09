import React from 'react';

/**
 * Quiz Component
 * Props:
 *  - question: the question object
 *  - selectedAnswer: currently selected choice (string)
 *  - isAnswerSubmitted: boolean flag indicating submission
 *  - onAnswerSelect: fn(choice) to select an answer
 *  - onSubmitAnswer: fn() to submit the selected answer
 *  - onNextQuestion: fn() to advance to the next question
 *  - currentIndex: the 1-based index of this question
 *  - total: total number of questions
 *  - score: current score count
 *  - timeRemaining: seconds left for the question
 */
export default function Quiz({
  question,
  selectedAnswer,
  isAnswerSubmitted,
  onAnswerSelect,
  onSubmitAnswer,
  onNextQuestion,
  currentIndex,
  total,
  score,
  timeRemaining
}) {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress & timer */}
      <div className="flex justify-between items-center mb-4">
        <span>Question {currentIndex} of {total}</span>
        <span>{timeRemaining}s</span>
      </div>

      {/* Question text */}
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <p>{question.question}</p>
      </div>

      {/* Choices */}
      <div className="mb-4">
        {question.answer_choice_list.map((choice, i) => {
          const isSelected = selectedAnswer === choice;
          const correct = isAnswerSubmitted && choice.charAt(0) === question.answer;
          const wrong = isAnswerSubmitted && isSelected && choice.charAt(0) !== question.answer;
          return (
            <div
              key={i}
              onClick={() => onAnswerSelect(choice)}
              className={`p-3 mb-2 border rounded cursor-pointer
                ${isSelected ? (isAnswerSubmitted ? (correct ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500') : 'bg-blue-100 border-blue-500') : ''}
                ${correct && !isSelected ? 'bg-green-100 border-green-500' : ''}`}
            >
              {choice}
            </div>
          );
        })}
      </div>

      {/* Controls & score */}
      <div className="flex justify-between items-center">
        {!isAnswerSubmitted ? (
          <button
            onClick={onSubmitAnswer}
            disabled={!selectedAnswer}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Submit
          </button>
        ) : (
          <button
            onClick={onNextQuestion}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            {currentIndex < total ? 'Next' : 'Finish'}
          </button>
        )}
        <span className="ml-4">Score: {score}/{currentIndex}</span>
      </div>
    </div>
  );
}


