import React, { useEffect, useState } from 'react';

const ChatInterface = ({ 
  messages, 
  handleOptionClick, 
  chatMessagesRef, 
  isLoading = false, 
  isConnected = true, 
  onRetry 
}) => {
  const [answeredMessages, setAnsweredMessages] = useState(new Set());

  useEffect(() => {
    if (chatMessagesRef?.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages, chatMessagesRef]);

  const handleOptionWithTracking = (option, messageIndex) => {
    setAnsweredMessages(prev => new Set([...prev, messageIndex]));
    
    handleOptionClick(option);
  };

  const LoadingSpinner = () => (
    <div className="loading-spinner">
      <div className="spinner"></div>
    </div>
  );

  return (
    <div className="chat-container">
      <div className="chat-header">
        <img src="/chat-logo.jpg" alt="Chat Icon" className="chat-header-icon" />
        Schedule Assistant
        {isLoading && <LoadingSpinner />}
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
                    className={`message-btn ${answeredMessages.has(index) || !isConnected ? 'disabled' : ''}`}
                    onClick={() => handleOptionWithTracking(option, index)}
                    disabled={answeredMessages.has(index) || isLoading || !isConnected}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="message bot-message loading-message">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;