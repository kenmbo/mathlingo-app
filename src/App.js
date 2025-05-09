import React, { useState } from 'react';
import QuizApp from './QuizApp';
import logo from './logo.svg';
import './App.css';
import './assets/quiz-styles.css';
import ChatWidget from './ChatWidget'
import SettingsSidebar from './ChatWidget'

function App() {
  
  const [difficulty, setDifficulty] = useState('medium');

  return (
    <div className="App">
      <SettingsSidebar
        difficulty={difficulty}
        setDifficulty={setDifficulty}
      />
      <QuizApp />
      <ChatWidget />
    </div>
  );
}

export default App;
