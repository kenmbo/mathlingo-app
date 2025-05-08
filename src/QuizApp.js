import React, { useState, useEffect, useRef } from 'react';
import { useStreamedQuestions } from './utils/useStreamedQuestions';

const QuizApp = ({ difficulty }) => {
  // Streamed questions via NDJSON
  const { questions: quizData, loading, error } = useStreamedQuestions(20, difficulty);

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Filtering and subjects
  const [selectedSubject, setSelectedSubject] = useState('All');
  const filteredQuestions = quizData.filter(
    q => selectedSubject === 'All' || q.math_subject === selectedSubject
  );

  // Timer state
  const [timePerQuestion, setTimePerQuestion] = useState(60);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef(null);

  // Timer effects
  useEffect(() => {
    if (isAnswerSubmitted || quizCompleted || filteredQuestions.length === 0) {
      clearInterval(timerRef.current);
      setIsTimerRunning(false);
      return;
    }
    resetTimer();
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [currentQuestionIndex, quizCompleted, filteredQuestions]);

  const startTimer = () => {
    setIsTimerRunning(true);
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsTimerRunning(false);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetTimer = () => {
    clearInterval(timerRef.current);
    setIsTimerRunning(false);
    setTimeRemaining(timePerQuestion);
  };

  const handleTimeUp = () => {
    if (!isAnswerSubmitted) {
      setIsAnswerSubmitted(true);
      if (selectedAnswer) {
        const current = filteredQuestions[currentQuestionIndex];
        if (selectedAnswer.charAt(0) === current.answer) {
          setScore(prev => prev + 1);
        }
      }
    }
  };

  // Handlers
  const handleAnswerSelect = answer => {
    if (!isAnswerSubmitted) setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer && !isAnswerSubmitted) {
      setIsAnswerSubmitted(true);
      const current = filteredQuestions[currentQuestionIndex];
      if (selectedAnswer.charAt(0) === current.answer) {
        setScore(prev => prev + 1);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(idx => idx + 1);
      setSelectedAnswer('');
      setIsAnswerSubmitted(false);
    } else {
      setQuizCompleted(true);
      clearInterval(timerRef.current);
      setIsTimerRunning(false);
    }
  };

  const handleResetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizCompleted(false);
    resetTimer();
  };

  const handleTimerAdjustment = newTime => {
    setTimePerQuestion(newTime);
    if (!isAnswerSubmitted) {
      setTimeRemaining(newTime);
      resetTimer();
      startTimer();
    }
  };

  // Unique subjects list
  const getUniqueSubjects = () => {
    const subjects = [...new Set(quizData.map(q => q.math_subject))];
    return ['All', ...subjects];
  };

  // Render states
  if (loading) {
    return <div className="text-center p-6">Loading questions…</div>;
  }
  if (error) {
    return <div className="text-center p-6 text-red-600">Error: {error.message}</div>;
  }

  // If no questions
  if (!filteredQuestions.length) {
    return (
      <div className="text-center p-6">
        <p>No questions available for the selected subject.</p>
        <button
          onClick={() => setSelectedSubject('All')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Show All Questions
        </button>
      </div>
    );
  }

  // Quiz completed view
  if (quizCompleted) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Quiz Completed!</h1>
        <div className="text-center mb-6">
          <p className="text-xl">
            Your Score: {score} out of {filteredQuestions.length}
          </p>
          <p className="text-lg mt-2">
            ({Math.round((score / filteredQuestions.length) * 100)}%)
          </p>
        </div>
        <div className="mb-6">
          <label className="block mb-2 font-medium">
            Time per question for next attempt:
          </label>
          <div className="flex items-center">
            <input
              type="range"
              min={10}
              max={120}
              value={timePerQuestion}
              onChange={e => setTimePerQuestion(Number(e.target.value))}
              className="w-full mr-3"
            />
            <span className="font-medium w-20">
              {timePerQuestion} seconds
            </span>
          </div>
        </div>
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleResetQuiz}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Take Quiz Again
          </button>
          <button
            onClick={handleResetQuiz}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Generate New Questions
          </button>
        </div>
      </div>
    );
  }

  // Quiz in progress view
  const current = filteredQuestions[currentQuestionIndex];
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">SAT Math Quiz</h1>
      {/* Difficulty tabs */}
      <div className="flex justify-center space-x-2 mb-4">
        {['easy','medium','hard','very hard'].map(level => (
          <button
            key={level}
            onClick={() => {/* difficulty changed by parent */}}
            className={`px-3 py-1 rounded ${
              difficulty === level
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </button>
        ))}
      </div>
      {/* Subject Filter */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">Select Subject:</label>
        <select
          value={selectedSubject}
          onChange={e => setSelectedSubject(e.target.value)}
          className="w-full p-2 border rounded"
        >
          {getUniqueSubjects().map(sub => (
            <option key={sub} value={sub}>{sub}</option>
          ))}
        </select>
      </div>
      {/* Timer Settings */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">Time per question:</label>
        <div className="flex items-center">
          <input
            type="range"
            min={10}
            max={120}
            value={timePerQuestion}
            onChange={e => handleTimerAdjustment(Number(e.target.value))}
            className="w-full mr-3"
            disabled={isAnswerSubmitted}
          />
          <span className="font-medium w-20">
            {timeRemaining}s
          </span>
        </div>
      </div>
      {/* Progress and Timer Display */}
      <div className="mb-4 flex justify-between items-center">
        <span className="font-medium">
          Question {currentQuestionIndex + 1} of {filteredQuestions.length}
        </span>
        <div className="flex items-center">
          <div className={`mr-2 w-16 text-center py-1 px-2 rounded-full font-bold ${
            timeRemaining < 10
              ? 'bg-red-100 text-red-700'
              : timeRemaining < 30
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-green-100 text-green-700'
          }`}>{timeRemaining}s</div>
          <span className="font-medium">Subject: {current.math_subject}</span>
        </div>
      </div>
      {/* Question Prompt */}
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <p className="text-lg">{current.question}</p>
      </div>
      {/* Choices */}
      <div className="mb-6">
        {current.answer_choice_list.map((choice, i) => (
          <div
            key={i}
            onClick={() => handleAnswerSelect(choice)}
            className={`p-3 mb-2 border rounded cursor-pointer ${
              selectedAnswer === choice
                ? isAnswerSubmitted
                  ? choice.charAt(0) === current.answer
                    ? 'bg-green-100 border-green-500'
                    : 'bg-red-100 border-red-500'
                  : 'bg-blue-100 border-blue-500'
                : isAnswerSubmitted && choice.charAt(0) === current.answer
                ? 'bg-green-100 border-green-500'
                : ''
            }`}
          >
            {choice}
          </div>
        ))}
      </div>
      {/* Action Buttons */}
      <div className="flex justify-between">
        {!isAnswerSubmitted ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={!selectedAnswer}
            className={`px-4 py-2 rounded ${
              selectedAnswer
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            {currentQuestionIndex < filteredQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
          </button>
        )}
        <div className="text-right">
          <p className="font-medium">
            Score: {score}/{currentQuestionIndex + (isAnswerSubmitted ? 1 : 0)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuizApp;

