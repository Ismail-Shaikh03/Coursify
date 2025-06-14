import React, { useEffect, useState } from 'react';

const ChatInterface = ({ messages, handleOptionClick, chatMessagesRef }) => {
  // Track which message indices have had an option selected
  const [answeredMessages, setAnsweredMessages] = useState(new Set());

  // Add effect to scroll to bottom when messages change
  useEffect(() => {
    if (chatMessagesRef?.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages, chatMessagesRef]);

  // Handle option click with tracking
  const handleOptionWithTracking = (option, messageIndex) => {
    // Add this message index to the set of answered messages
    setAnsweredMessages(prev => new Set([...prev, messageIndex]));
    
    // Call the original handler
    handleOptionClick(option);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <img src="/chat-logo.jpg" alt="Chat Icon" className="chat-header-icon" />
        Schedule Assistant
      </div>
      
      <div className="chat-messages" ref={chatMessagesRef}>
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}-message`}>
            <p>{message.text}</p>
            {message.options.length > 0 && message.type === 'bot' && (
              <div className="message-buttons">
                {message.options.map((option, optIndex) => (
                  <button 
                    key={optIndex} 
                    className={`message-btn ${answeredMessages.has(index) ? 'disabled' : ''}`}
                    onClick={() => handleOptionWithTracking(option, index)}
                    disabled={answeredMessages.has(index)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatInterface;