import React, { useState } from 'react';
import axios from 'axios';
import '../css/Ruff.css'; // Assuming you have some styles for Ruff

const Ruff = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false); // Add loading state

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleSendChat = async () => {
    if (!userInput) return;
  
    const newMessage = { role: 'user', content: userInput };
    setChatHistory([...chatHistory, newMessage]);
  
    // Start loading
    setLoading(true);
  
    try {
      // Simulate an API request
      const response = await axios.post('http://localhost:5005/api/chat', {
        prompt: userInput,
      });
  
      const replyMessage = { role: 'assistant', content: `🐶 Ruff says: ${response.data.reply}` };
      
      // Append both the user's message and the reply to the chat history
      setChatHistory((prevChatHistory) => [...prevChatHistory, newMessage, replyMessage]);
  
      // Clear the input
      setUserInput('');
    } catch (error) {
      console.error('Error fetching response:', error);
      const errorMessage = {
        role: 'assistant',
        content: '🐶 Ruff is having trouble fetching your advice right now. Please try again later!',
      };
      
      // Append the error message to the chat history
      setChatHistory((prevChatHistory) => [...prevChatHistory, newMessage, errorMessage]);
    }
  
    // End loading
    setLoading(false);
  };

  return (
    <div className="chat-button-container">
      {/* Blue Circle Button */}
      <button className={`blue-circle-button ${isChatOpen ? 'open' : ''}`} onClick={toggleChat}>
        🐾
      </button>

      {/* Chat Box */}
      {isChatOpen && (
        <div className="chat-box">
          <h3>🐶 Ruff's Medical Advice</h3>
          <p>Ask for medication or prescription suggestions.</p>

          {/* Loading indicator */}
          {loading && <p>Loading...</p>}

          {/* Chat History */}
          <div className="chat-history">
            {chatHistory.map((message, index) => (
              <div key={index} className={message.role === 'user' ? 'user-message' : 'assistant-message'}>
                {message.content}
              </div>
            ))}
          </div>

          <input
            type="text"
            placeholder="Type symptoms or medicine..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="chat-input"
          />
          <button className="send-btn" onClick={handleSendChat}>
            Send
          </button>
        </div>
      )}
    </div>
  );
};

export default Ruff;
