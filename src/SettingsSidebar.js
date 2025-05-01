// SettingsSidebar.js
import React, { useState } from 'react';

const levels = ['easy', 'medium', 'hard', 'very hard'];

export default function SettingsSidebar({ difficulty, setDifficulty }) {
  const [open, setOpen] = useState(false);

  const toggleSidebar = () => setOpen(!open);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-md focus:outline-none"
      >
        ☰ Settings
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-lg overflow-hidden transition-width duration-300 ease-in-out z-40 ${
          open ? 'w-[30vw]' : 'w-0'
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button onClick={toggleSidebar} className="text-gray-600 hover:text-gray-800">
            ✕
          </button>
        </div>

        {/* Difficulty Buttons */}
        <div className="p-4">
          <p className="mb-2 font-medium">Select Difficulty:</p>
          <div className="flex flex-col space-y-2">
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`px-4 py-2 rounded transition-colors duration-200 focus:outline-none ${
                  difficulty === level
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {level.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/*
Integration in App.js:

import React, { useState } from 'react';
import QuizApp from './QuizApp';
import ChatWidget from './ChatWidget';
import SettingsSidebar from './SettingsSidebar';

function App() {
  const [difficulty, setDifficulty] = useState('medium');

  return (
    <div className="App">
      <SettingsSidebar
        difficulty={difficulty}
        setDifficulty={setDifficulty}
      />
      <QuizApp difficulty={difficulty} />
      <ChatWidget />
    </div>
  );
}

export default App;
*/

