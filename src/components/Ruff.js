import React, { useState } from 'react';
import axios from 'axios';
import './ChatButton.css'; // Custom styling

const ChatButton = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [error, setError] = useState(null);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleSend = async () => {
    if (!userInput) return;

    const newMessage = { role: 'user', content: userInput };
    setChatHistory((prevChatHistory) => [...prevChatHistory, newMessage]);
    setError(null); // Clear previous errors if any

    try {
      // Call your backend for medical-related responses
      const response = await axios.post('http://localhost:5005/api/chat', {
        prompt: userInput,
      });

      const replyMessage = { role: 'assistant', content: response.data.reply };
      setChatHistory((prevChatHistory) => [...prevChatHistory, replyMessage]);

      // Clear the input field
      setUserInput('');
    } catch (error) {
      console.error('Error fetching response:', error);
      setError('Failed to fetch response. Please try again.');
    }
  };

  return (
    <div>
      {/* Blue Circle Button */}
      <button className="blue-circle-button" onClick={toggleChat}>
        🐾
      </button>

      {/* Chat Box */}
      {isChatOpen && (
        <div className="chat-box">
          <h3>🐶 Ruff's Medical Advice</h3>
          <p>Ask for help with medication or prescription advice.</p>

          {/* Chat History */}
          <div className="chat-history">
            {chatHistory.map((message, index) => (
              <div
                key={index}
                className={message.role === 'user' ? 'user-message' : 'assistant-message'}
              >
                {message.content}
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && <div className="error-message">{error}</div>}

          <input
            type="text"
            placeholder="Describe your symptoms or ask for medication..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="chat-input"
          />
          <button className="send-btn" onClick={handleSend}>Send</button>
        </div>
      )}
    </div>
  );
};

export default ChatButton;
