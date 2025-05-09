import React, { useState, useEffect, useRef } from 'react';
import SettingsSidebar from './SettingsSidebar';
import Quiz from './Quiz';

const API_URL = process.env.REACT_APP_API_URL || 'https://kbolando2172.pythonanywhere.com';

export default function QuizApp() {
  // Difficulty/subject settings
  const [difficulty, setDifficulty] = useState('medium');
  const [selectedSubject, setSelectedSubject] = useState('All');

  // Two-phase question loading
  const [initialQuestions, setInitialQuestions] = useState([]);
  const [restQuestions, setRestQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Loading & error
  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingRest, setLoadingRest] = useState(false);
  const [error, setError] = useState(null);

  // Timer settings
  const [timePerQuestion, setTimePerQuestion] = useState(60);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef(null);

  // Kick off two-phase load whenever difficulty changes or regenerate
  useEffect(() => {
    loadInTwoPhases();
  }, [difficulty]);

  async function loadInTwoPhases() {
    setError(null);
    setLoadingInit(true);
    setQuizCompleted(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setScore(0);

    try {
      const res2 = await fetch(`${API_URL}/?num_questions=2&difficulty=${difficulty}`);
      if (!res2.ok) throw new Error(res2.statusText);
      const data2 = await res2.json();
      setInitialQuestions(data2.sat_questions);
    } catch (err) {
      console.error('Error fetching first 2:', err);
      setError(err.message);
    }
    setLoadingInit(false);

    setLoadingRest(true);
    try {
      const resR = await fetch(`${API_URL}/?num_questions=18&difficulty=${difficulty}`);
      if (!resR.ok) throw new Error(resR.statusText);
      const dataR = await resR.json();
      setRestQuestions(dataR.sat_questions);
    } catch (err) {
      console.error('Error fetching rest:', err);
    }
    setLoadingRest(false);
  }

  // Recompute filteredQuestions whenever questions or subject change
  useEffect(() => {
    const merged = [...initialQuestions, ...restQuestions];
    const base = selectedSubject === 'All'
      ? merged
      : merged.filter(q => q.math_subject === selectedSubject);
    setFilteredQuestions(base);
    // Reset quiz progress
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizCompleted(false);
    resetTimer();
  }, [initialQuestions, restQuestions, selectedSubject]);

  // Timer logic
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

  function startTimer() {
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
  }

  function resetTimer() {
    clearInterval(timerRef.current);
    setIsTimerRunning(false);
    setTimeRemaining(timePerQuestion);
  }

  function handleTimeUp() {
    if (!isAnswerSubmitted) {
      setIsAnswerSubmitted(true);
      const q = filteredQuestions[currentQuestionIndex];
      if (selectedAnswer && selectedAnswer.charAt(0) === q.answer) {
        setScore(s => s + 1);
      }
    }
  }

  // Answer handling
  function handleAnswerSelect(choice) {
    if (!isAnswerSubmitted) setSelectedAnswer(choice);
  }

  function handleSubmitAnswer() {
    if (selectedAnswer && !isAnswerSubmitted) {
      setIsAnswerSubmitted(true);
      const q = filteredQuestions[currentQuestionIndex];
      if (selectedAnswer.charAt(0) === q.answer) {
        setScore(s => s + 1);
      }
    }
  }

  function handleNextQuestion() {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
      setSelectedAnswer('');
      setIsAnswerSubmitted(false);
    } else {
      setQuizCompleted(true);
      clearInterval(timerRef.current);
      setIsTimerRunning(false);
    }
  }

  function handleResetQuiz() {
    setSelectedSubject('All');
    loadInTwoPhases();
  }

  // Subject list helper
  const getUniqueSubjects = () => {
    const merged = [...initialQuestions, ...restQuestions];
    const subs = Array.from(new Set(merged.map(q => q.math_subject)));
    return ['All', ...subs];
  };

  // Render
  if (loadingInit) {
    return <div className="text-center p-6">Loading first two questions…</div>;
  }
  if (error) {
    return <div className="text-center p-6 text-red-600">Error: {error}</div>;
  }
  if (filteredQuestions.length === 0) {
    return (
      <div className="text-center p-6">
        <p>No questions available.</p>
        <button onClick={handleResetQuiz} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Reload</button>
      </div>
    );
  }

  const current = filteredQuestions[currentQuestionIndex];

  if (quizCompleted) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Quiz Completed!</h1>
        <p className="text-center text-xl">Score: {score} / {filteredQuestions.length}</p>
        <button onClick={handleResetQuiz} className="mt-6 px-4 py-2 bg-blue-500 text-white rounded">Take Again</button>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <SettingsSidebar difficulty={difficulty} onChangeDifficulty={setDifficulty} />
      <div className="flex-1 p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">SAT Math Quiz</h1>

        {/* Subject filter */}
        <div className="mb-4">
          <label className="block mb-1">Subject:</label>
          <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="w-full p-2 border rounded">
            {getUniqueSubjects().map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Progress & timer */}
        <div className="flex justify-between items-center mb-4">
          <span>Question {currentQuestionIndex+1} of {filteredQuestions.length}</span>
          <span>{timeRemaining}s</span>
        </div>

        {/* Question */}
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <p>{current.question}</p>
        </div>

        {/* Choices */}
        <div className="mb-4">
          {current.answer_choice_list.map((c, i) => {
            const isSelected = selectedAnswer === c;
            const correct = isAnswerSubmitted && c.charAt(0) === current.answer;
            const wrong = isAnswerSubmitted && isSelected && c.charAt(0) !== current.answer;
            return (
              <div key={i} onClick={() => handleAnswerSelect(c)} className={`p-3 mb-2 border rounded cursor-pointer
                ${isSelected ? (isAnswerSubmitted ? (correct ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500') : 'bg-blue-100 border-blue-500') : ''}
                ${correct && !isSelected ? 'bg-green-100 border-green-500' : ''}`}> {c} </div>
            )
          })}
        </div>

        {/* Controls */}
        <div className="flex justify-between">
          {!isAnswerSubmitted
            ? <button onClick={handleSubmitAnswer} disabled={!selectedAnswer} className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50">Submit</button>
            : <button onClick={handleNextQuestion} className="px-4 py-2 bg-green-500 text-white rounded">{currentQuestionIndex < filteredQuestions.length-1 ? 'Next' : 'Finish'}</button>
          }
          <span>Score: {score}/{currentQuestionIndex + (isAnswerSubmitted?1:0)}</span>
        </div>

        {loadingRest && <div className="mt-4 text-sm text-gray-500">Loading more questions…</div>}
      </div>
    </div>
  );
}

