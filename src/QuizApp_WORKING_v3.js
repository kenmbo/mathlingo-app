import React, { useState, useEffect, useRef } from 'react';
import SettingsSidebar from './SettingsSidebar';
import Quiz from './Quiz';

const API_URL = process.env.REACT_APP_API_URL || 'https://kbolando2172.pythonanywhere.com';

export default function QuizApp() {
  // Difficulty and subject
  const [difficulty, setDifficulty] = useState('medium');
  const [selectedSubject, setSelectedSubject] = useState('All');

  // Question count
  const [numQuestions, setNumQuestions] = useState(20);
  const [pendingNumQuestions, setPendingNumQuestions] = useState(numQuestions);

  // Timer
  const [timePerQuestion, setTimePerQuestion] = useState(60);
  const [timeRemaining, setTimeRemaining] = useState(60);

  // Two-phase loading
  const [initialQuestions, setInitialQuestions] = useState([]);
  const [restQuestions, setRestQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Loading & errors
  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingRest, setLoadingRest] = useState(false);
  const [error, setError] = useState(null);

  // Refs for timer and audio
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  // Batch sizes
  const initialBatch = Math.min(2, numQuestions);
  const restBatch    = numQuestions - initialBatch;

  // Fetch on difficulty or numQuestions change
  useEffect(() => { loadInTwoPhases(); }, [difficulty, numQuestions]);

  async function loadInTwoPhases() {
    setError(null);
    setLoadingInit(true);
    setQuizCompleted(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setScore(0);

    try {
      const res = await fetch(`${API_URL}/?num_questions=${initialBatch}&difficulty=${difficulty}`);
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      setInitialQuestions(data.sat_questions);
    } catch (e) {
      setError(e.message);
    }
    setLoadingInit(false);

    setLoadingRest(true);
    if (restBatch > 0) {
      try {
        const res = await fetch(`${API_URL}/?num_questions=${restBatch}&difficulty=${difficulty}`);
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        setRestQuestions(data.sat_questions);
      } catch (e) {
        console.error(e);
      }
    }
    setLoadingRest(false);
  }

  // Merge & filter
  useEffect(() => {
    const merged = [...initialQuestions, ...restQuestions];
    const list = selectedSubject === 'All'
      ? merged
      : merged.filter(q => q.math_subject === selectedSubject);
    setFilteredQuestions(list);
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizCompleted(false);
    resetTimer();
  }, [initialQuestions, restQuestions, selectedSubject]);

  // Timer control
  useEffect(() => {
    if (isAnswerSubmitted || quizCompleted || filteredQuestions.length === 0) {
      clearInterval(timerRef.current);
      return;
    }
    resetTimer();
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [currentQuestionIndex, quizCompleted, filteredQuestions]);

  function startTimer() {
    timerRef.current = setInterval(() => {
      setTimeRemaining(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleAutoSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
  }

  function resetTimer() {
    clearInterval(timerRef.current);
    setTimeRemaining(timePerQuestion);
  }

  function handleAutoSubmit() {
    setIsAnswerSubmitted(true);
    const q = filteredQuestions[currentQuestionIndex];
    if (selectedAnswer.charAt(0) === q.answer) setScore(s => s + 1);
  }

  function handleTimerAdjustment(value) {
    setTimePerQuestion(value);
    if (!isAnswerSubmitted) {
      setTimeRemaining(value);
      resetTimer();
      startTimer();
    }
  }

  function handleAnswerSelect(choice) { if (!isAnswerSubmitted) setSelectedAnswer(choice); }
  function handleSubmitAnswer() { if (!isAnswerSubmitted && selectedAnswer) { setIsAnswerSubmitted(true); const q = filteredQuestions[currentQuestionIndex]; if (selectedAnswer.charAt(0) === q.answer) setScore(s => s + 1); }}
  function handleNext() { currentQuestionIndex < filteredQuestions.length - 1 ? setCurrentQuestionIndex(i => i + 1) : setQuizCompleted(true); setSelectedAnswer(''); setIsAnswerSubmitted(false); }
  function applyNumQuestions() { setNumQuestions(pendingNumQuestions); }
  function handleReset() { setSelectedSubject('All'); setPendingNumQuestions(numQuestions); loadInTwoPhases(); }

  const subjects = Array.from(new Set([...initialQuestions, ...restQuestions].map(q => q.math_subject)));
  const allSubjects = ['All', ...subjects];

  // Text-to-Speech effect: speak each question when it changes
  useEffect(() => {
    const current = filteredQuestions[currentQuestionIndex];
    if (!current) return;
    const { question, answer_choice_list, answer } = current;
    const speakText = [
      question,
      'Choices:',
      ...answer_choice_list,
      `Answer: ${answer}`
    ].join(' ');

    fetch(`${API_URL}/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: speakText })
    })
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.play();
        }
      })
      .catch(err => console.error('TTS error:', err));
  }, [currentQuestionIndex, filteredQuestions]);

  // Initial loading or errors
  if (loadingInit) return <div className="text-center p-6">Loading first batch…</div>;
  if (error) return <div className="text-center p-6 text-red-600">Error: {error}</div>;
  if (!filteredQuestions.length) return <div className="text-center p-6"><p>No questions.</p><button onClick={handleReset} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Reload</button></div>;

  const current = filteredQuestions[currentQuestionIndex];

  if (quizCompleted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-center mb-4">Quiz Completed!</h1>
        <p className="text-center text-lg">Score: {score} / {filteredQuestions.length}</p>
        <button onClick={handleReset} className="mt-6 px-4 py-2 bg-blue-500 text-white rounded">Retry Quiz</button>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <SettingsSidebar />
      <div className="flex-1 p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">SAT Math Quiz</h1>

        {/* Difficulty Buttons */}
        <div className="flex justify-center space-x-2 mb-4">
          {['easy','medium','hard','very hard'].map(level => (
            <button
              key={level}
              onClick={() => setDifficulty(level)}
              className={`px-3 py-1 rounded ${difficulty===level ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            >
              {level.charAt(0).toUpperCase()+level.slice(1)}
            </button>
          ))}
        </div>

        {/* Timer Slider */}
        <div className="mb-4">
          <label className="block mb-1">Time per question: {timePerQuestion}s</label>
          <input
            type="range"
            min={10}
            max={120}
            value={timePerQuestion}
            onChange={e => handleTimerAdjustment(+e.target.value)}
            className="w-full"
            disabled={isAnswerSubmitted}
          />
        </div>

        {/* Question Count Slider */}
        <div className="mb-4 flex items-center">
          <label className="mr-4">Questions: {pendingNumQuestions}</label>
          <input
            type="range"
            min={1}
            max={50}
            value={pendingNumQuestions}
            onChange={e => setPendingNumQuestions(+e.target.value)}
            className="flex-1"
          />
          <button onClick={applyNumQuestions} className="ml-4 px-4 py-2 bg-blue-500 text-white rounded">Apply</button>
        </div>

        {/* Subject Filter */}
        <div className="mb-4">
          <label className="block mb-1">Subject:</label>
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            className="w-full p-2 border rounded"
          >
            {allSubjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Play Button & Hidden Audio */}
        <div className="mb-4 flex justify-center">
          <button onClick={() => audioRef.current && audioRef.current.play()} className="px-4 py-2 bg-green-500 text-white rounded">
            🔊 Play Question
          </button>
          <audio ref={audioRef} controls style={{ display: 'none' }} />
        </div>

        {/* Quiz Component */}
        <Quiz
          question={current}
          selectedAnswer={selectedAnswer}
          isAnswerSubmitted={isAnswerSubmitted}
          onAnswerSelect={handleAnswerSelect}
          onSubmitAnswer={handleSubmitAnswer}
          onNextQuestion={handleNext}
          currentIndex={currentQuestionIndex + 1}
          total={filteredQuestions.length}
          score={score}
          timeRemaining={timeRemaining}
        />

        {loadingRest && <div className="mt-4 text-sm text-gray-500">Loading more…</div>}
      </div>
    </div>
  );
}

