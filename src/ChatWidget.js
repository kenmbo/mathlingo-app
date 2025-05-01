// ChatWidget.js
import React, { useState, useEffect, useRef } from 'react';

const API_URL = 'https://kbolando2172.pythonanywhere.com';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const toggleOpen = () => setOpen(prev => !prev);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    try {
      const response = await fetch('${API_URL}/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      const data = await response.json();
      const botMsg = { sender: 'bot', text: data.reply };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const errMsg = { sender: 'bot', text: 'Error: Could not reach server.' };
      setMessages(prev => [...prev, errMsg]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle button */}
      <button
        onClick={toggleOpen}
        className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700"
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Chat window */}
      {open && (
        <div className="mt-2 w-72 h-96 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden">
          <div className="flex-1 p-2 overflow-y-auto">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={
                  msg.sender === 'user'
                    ? 'text-right mb-2'
                    : 'text-left mb-2'
                }
              >
                <span
                  className={
                    msg.sender === 'user'
                      ? 'inline-block bg-blue-100 text-blue-800 p-1 rounded'
                      : 'inline-block bg-gray-100 text-gray-800 p-1 rounded'
                  }
                >
                  {msg.text}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-2 border-t border-gray-200 flex">
            <input
              className="flex-1 border border-gray-300 rounded-l px-2 py-1 focus:outline-none"
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-4 rounded-r hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

