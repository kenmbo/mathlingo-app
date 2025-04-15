import React, { useState, useEffect, useRef } from 'react';

const QuizApp = () => {
  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [timePerQuestion, setTimePerQuestion] = useState(60); // Default time: 60 seconds
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isGeneratingNew, setIsGeneratingNew] = useState(false);
  const timerRef = useRef(null);
  
  const apiEndpoint = "https://kbolando2172.pythonanywhere.com";

  // Fetch quiz data
  useEffect(() => {
    fetchQuizData();
  }, []);
  
  // Function to fetch quiz data from API
  const fetchQuizData = async () => {
    try {
      setLoading(true);
      setIsGeneratingNew(true);
      
      // Fetch data from the API endpoint
      const response = await fetch(apiEndpoint);
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setQuizData(data);
      setFilteredQuestions(data.sat_questions);
      
      // Reset quiz state when new questions are loaded
      setCurrentQuestionIndex(0);
      setSelectedAnswer('');
      setIsAnswerSubmitted(false);
      setScore(0);
      setQuizCompleted(false);
      resetTimer();
      
      setLoading(false);
      setIsGeneratingNew(false);
    } catch (err) {
      setError('Failed to load quiz data: ' + err.message);
      setLoading(false);
      setIsGeneratingNew(false);
    }
  };

  // Filter questions when subject changes
  useEffect(() => {
    if (!quizData) return;
    
    if (selectedSubject === 'All') {
      setFilteredQuestions(quizData.sat_questions);
    } else {
      const filtered = quizData.sat_questions.filter(
        q => q.math_subject === selectedSubject
      );
      setFilteredQuestions(filtered);
    }
    
    // Reset quiz state
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizCompleted(false);
    resetTimer();
  }, [selectedSubject, quizData]);
  
  // Timer functionality
  useEffect(() => {
    if (isAnswerSubmitted || quizCompleted || !quizData) {
      // Stop the timer when answer is submitted or quiz is completed
      clearInterval(timerRef.current);
      setIsTimerRunning(false);
      return;
    }
    
    // Reset and start timer when moving to a new question
    resetTimer();
    startTimer();
    
    return () => {
      clearInterval(timerRef.current);
    };
  }, [currentQuestionIndex, quizCompleted, quizData]);
  
  const startTimer = () => {
    setIsTimerRunning(true);
    timerRef.current = setInterval(() => {
      setTimeRemaining(prevTime => {
        if (prevTime <= 1) {
          // Time's up - handle automatic submission
          clearInterval(timerRef.current);
          setIsTimerRunning(false);
          handleTimeUp();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };
  
  const resetTimer = () => {
    clearInterval(timerRef.current);
    setIsTimerRunning(false);
    setTimeRemaining(timePerQuestion);
  };
  
  const handleTimeUp = () => {
    // Auto-submit the current answer when time is up
    if (!isAnswerSubmitted) {
      setIsAnswerSubmitted(true);
      
      // Check if answer is correct (if one was selected)
      if (selectedAnswer) {
        const currentQuestion = filteredQuestions[currentQuestionIndex];
        if (selectedAnswer.charAt(0) === currentQuestion.answer) {
          setScore(score + 1);
        }
      }
    }
  };

  // Get unique subjects for the filter
  const getUniqueSubjects = () => {
    if (!quizData) return [];
    const subjects = [...new Set(quizData.sat_questions.map(q => q.math_subject))];
    return ['All', ...subjects];
  };

  // Handle answer selection
  const handleAnswerSelect = (answer) => {
    if (!isAnswerSubmitted) {
      setSelectedAnswer(answer);
    }
  };

  // Handle answer submission
  const handleSubmitAnswer = () => {
    if (selectedAnswer && !isAnswerSubmitted) {
      setIsAnswerSubmitted(true);
      
      // Check if answer is correct
      const currentQuestion = filteredQuestions[currentQuestionIndex];
      if (selectedAnswer.charAt(0) === currentQuestion.answer) {
        setScore(score + 1);
      }
    }
  };

  // Move to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer('');
      setIsAnswerSubmitted(false);
    } else {
      setQuizCompleted(true);
      clearInterval(timerRef.current);
      setIsTimerRunning(false);
    }
  };

  // Reset quiz
  const handleResetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizCompleted(false);
    resetTimer();
  };
  
  // Handle timer adjustment
  const handleTimerAdjustment = (newTime) => {
    setTimePerQuestion(newTime);
    if (!isAnswerSubmitted) {
      setTimeRemaining(newTime);
      resetTimer();
      startTimer();
    }
  };

  // Show loading message
  if (loading) {
    return <div className="text-center p-6">Loading quiz data...</div>;
  }

  // Show error message
  if (error) {
    return <div className="text-center p-6 text-red-600">{error}</div>;
  }

  // Show quiz content when loaded
  if (quizData && filteredQuestions.length > 0) {
    // Current question
    const currentQuestion = filteredQuestions[currentQuestionIndex];

    // Quiz completed view
    if (quizCompleted) {
      return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-6 text-center">Quiz Completed!</h1>
          <div className="text-center mb-6">
            <p className="text-xl">Your Score: {score} out of {filteredQuestions.length}</p>
            <p className="text-lg mt-2">
              ({Math.round((score / filteredQuestions.length) * 100)}%)
            </p>
          </div>
          
          {/* Timer settings for next attempt */}
          <div className="mb-6">
            <label className="block mb-2 font-medium">Time per question for next attempt:</label>
            <div className="flex items-center">
              <input
                type="range"
                min="10"
                max="120"
                value={timePerQuestion}
                onChange={(e) => setTimePerQuestion(parseInt(e.target.value))}
                className="w-full mr-3"
              />
              <span className="font-medium w-20">{timePerQuestion} seconds</span>
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
              onClick={fetchQuizData}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              disabled={isGeneratingNew}
            >
              {isGeneratingNew ? 'Generating...' : 'Generate New Questions'}
            </button>
          </div>
        </div>
      );
    }

    // Quiz in progress view
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">SAT Math Quiz</h1>
        
        {/* Subject Filter */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">Select Subject:</label>
          <select 
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full p-2 border rounded"
          >
            {getUniqueSubjects().map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>
        
        {/* Timer Settings */}
        <div className="mb-6">
          <label className="block mb-2 font-medium">Time per question:</label>
          <div className="flex items-center">
            <input
              type="range"
              min="10"
              max="120"
              value={timePerQuestion}
              onChange={(e) => handleTimerAdjustment(parseInt(e.target.value))}
              className="w-full mr-3"
              disabled={isAnswerSubmitted}
            />
            <span className="font-medium w-20">{timePerQuestion} seconds</span>
          </div>
        </div>
        
        {/* Generate New Questions Button */}
        <div className="mb-6">
          <button 
            onClick={fetchQuizData}
            className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600"
            disabled={isGeneratingNew}
          >
            {isGeneratingNew ? 'Generating New Questions...' : 'Generate New Questions'}
          </button>
        </div>
        
        {/* Progress and Timer */}
        <div className="mb-4 flex justify-between items-center">
          <span className="font-medium">Question {currentQuestionIndex + 1} of {filteredQuestions.length}</span>
          <div className="flex items-center">
            <div className={`mr-2 w-16 text-center py-1 px-2 rounded-full font-bold ${
              timeRemaining < 10 ? 'bg-red-100 text-red-700' : 
              timeRemaining < 30 ? 'bg-yellow-100 text-yellow-700' : 
              'bg-green-100 text-green-700'
            }`}>
              {timeRemaining}s
            </div>
            <span className="font-medium">Subject: {currentQuestion.math_subject}</span>
          </div>
        </div>
        
        {/* Question */}
        <div className="mb-6 p-4 bg-gray-100 rounded">
          <p className="text-lg">{currentQuestion.question}</p>
        </div>
        
        {/* Answer Choices */}
        <div className="mb-6">
          {currentQuestion.answer_choice_list.map((choice, index) => (
            <div 
              key={index}
              onClick={() => handleAnswerSelect(choice)}
              className={`p-3 mb-2 border rounded cursor-pointer ${
                selectedAnswer === choice 
                  ? isAnswerSubmitted
                    ? choice.charAt(0) === currentQuestion.answer
                      ? 'bg-green-100 border-green-500'
                      : 'bg-red-100 border-red-500'
                    : 'bg-blue-100 border-blue-500'
                  : isAnswerSubmitted && choice.charAt(0) === currentQuestion.answer
                    ? 'bg-green-100 border-green-500'
                    : ''
              }`}
            >
              {choice}
            </div>
          ))}
        </div>
        
        {/* Buttons */}
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
            <p className="font-medium">Score: {score}/{currentQuestionIndex + (isAnswerSubmitted ? 1 : 0)}</p>
          </div>
        </div>
      </div>
    );
  }

  // No questions available
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
};

export default QuizApp;
