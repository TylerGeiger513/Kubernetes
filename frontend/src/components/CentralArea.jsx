import React, { useState, useEffect, useRef } from 'react';
import { HiPaperAirplane } from 'react-icons/hi2';

const CentralArea = ({ selectedChat }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage = {
      user: 'You',
      content: inputText.trim(),
      timestamp: new Date().toLocaleString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: '2-digit',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      id: Date.now(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText('');
  };

  return (
    <div className="central-area">
      <div className="chat-messages">
        <header>
          <h1 className="header-title">{selectedChat.name}</h1>
          <p className="header-subtitle">
            This is the beginning of your conversation with {selectedChat.name}.
          </p>
        </header>
        {messages.map((message, index) => {
          const prevMessage = messages[index - 1];
          const showUserInfo = !prevMessage || prevMessage.user !== message.user;

          return (
            <div className="message" key={message.id}>
              {showUserInfo ? (
                <>
                  <div className="avatar">Y</div>
                  <div className="message-content">
                    <span className="username">{message.user}</span>
                    <span className="timestamp">{message.timestamp}</span>
                    {message.content.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </>
              ) : (
                <div className="message-content collapsed">
                  {message.content.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-container">
        <input
          type="text"
          placeholder={`Message ${selectedChat.name}`}
          className="chat-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button className="send-button" onClick={handleSend}>
          <HiPaperAirplane className="send-icon" />
        </button>
      </div>
    </div>
  );
};

export default CentralArea;