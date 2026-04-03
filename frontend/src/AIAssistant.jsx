import { useState, useRef, useEffect } from 'react';
import initializeAIAgent from './aiAgentClientService.js';

/**
 * AI Assistant Component - Kimi K2.5 Powered
 * Chat widget for user to interact with AI agent
 */
export default function AIAssistant({ 
  apiKey,
  userRole = 'teacher',
  systemContext = {},
  onAction = null 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      text: '👋 Hi! I\'m your AI Assistant. I can help you with:\n• Grading exams\n• Managing students\n• Answering questions\n\nWhat would you like help with?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const messagesEndRef = useRef(null);
  const agent = useRef(initializeAIAgent(apiKey, userRole, systemContext));

  // Scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load initial suggestions
  useEffect(() => {
    if (isOpen && agent.current && messages.length === 1) {
      loadSuggestions();
    }
  }, [isOpen]);

  const loadSuggestions = async () => {
    if (!agent.current) return;

    const result = await agent.current.getSuggestions(
      `User is a ${userRole} with ${systemContext.totalStudents || 0} students and ${systemContext.totalExams || 0} graded exams`
    );

    if (result.success && result.suggestions.length > 0) {
      setSuggestion(result.suggestions[0]?.suggestion || '');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !agent.current) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message to chat
    const userMsg = {
      id: messages.length + 1,
      type: 'user',
      text: userMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Get AI response
      const result = await agent.current.chat(userMessage);

      // Add assistant message
      const assistantMsg = {
        id: messages.length + 2,
        type: 'assistant',
        text: result.response,
        action: result.action,
        source: result.source,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Handle action if present
      if (result.action && onAction) {
        onAction(result.action);
      }
    } catch (error) {
      const errorMsg = {
        id: messages.length + 2,
        type: 'error',
        text: '❌ ' + error.message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSuggestion = () => {
    if (suggestion) {
      setInput(suggestion);
    }
  };

  if (!apiKey) {
    return null; // Don't render if API key not available
  }

  return (
    <div className="ai-assistant-container">
      {/* Chat Widget */}
      <div className={`ai-assistant-widget ${isOpen ? 'open' : 'closed'}`}>
        {isOpen && (
          <>
            {/* Header */}
            <div className="ai-header">
              <div className="ai-title">
                <span className="ai-icon">🤖</span>
                <h3>Gradify AI Agent</h3>
              </div>
              <button className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
            </div>

            {/* Messages */}
            <div className="ai-messages">
              {messages.map((msg) => (
                <div key={msg.id} className={`message message-${msg.type}`}>
                  <div className="message-content">
                    {msg.type === 'assistant' && <span className="msg-icon">🤖</span>}
                    {msg.type === 'user' && <span className="msg-icon">👤</span>}
                    {msg.type === 'error' && <span className="msg-icon">⚠️</span>}
                    <span className="msg-text">{msg.text}</span>
                  </div>
                  {msg.action && (
                    <div className="message-action">
                      <code className="action-code">
                        {JSON.stringify(msg.action, null, 2)}
                      </code>
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="message message-assistant loading">
                  <div className="message-content">
                    <span className="msg-icon">🤖</span>
                    <span className="typing-indicator">
                      <span></span><span></span><span></span>
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion */}
            {suggestion && !loading && (
              <div className="ai-suggestion">
                <small>💡 Try: {suggestion}</small>
                <button className="try-btn" onClick={handleQuickSuggestion}>Use</button>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSendMessage} className="ai-input-form">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything... (e.g., 'grade this exam', 'show stats')"
                disabled={loading}
                className="ai-input"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="ai-send-btn"
              >
                {loading ? '⏳' : '→'}
              </button>
            </form>
          </>
        )}
      </div>

      {/* Toggle Button */}
      <button
        className="ai-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
      >
        {isOpen ? '↙️' : '🤖'}
      </button>

      {/* Styles */}
      <style>{`
        .ai-assistant-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 50000;
          font-family: var(--font-b, 'Inter', sans-serif);
        }

        .ai-toggle-btn {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #F94C24, #D43916);
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          font-size: 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(249, 76, 36, 0.4);
          transition: all 0.3s ease;
        }

        .ai-toggle-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 12px 32px rgba(249, 76, 36, 0.6);
        }

        .ai-toggle-btn:active {
          transform: scale(0.95);
        }

        .ai-assistant-widget {
          position: absolute;
          bottom: 70px;
          right: 0;
          width: 400px;
          max-height: 600px;
          background: var(--s1, #1a1a1a);
          border: 2px solid var(--bdr, #2a2a2a);
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          opacity: 0;
          visibility: hidden;
          transform: translateY(20px);
          transition: all 0.3s ease;
        }

        .ai-assistant-widget.open {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .ai-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid var(--bdr, #2a2a2a);
          background: linear-gradient(135deg, rgba(249, 76, 36, 0.1), rgba(212, 57, 22, 0.1));
        }

        .ai-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ai-icon {
          font-size: 20px;
        }

        .ai-title h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: var(--t1, #f5f5f5);
        }

        .close-btn {
          background: none;
          border: none;
          color: var(--t2, #a3a3a3);
          font-size: 18px;
          cursor: pointer;
          padding: 0;
          transition: color 0.2s;
        }

        .close-btn:hover {
          color: var(--t1, #f5f5f5);
        }

        .ai-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .message {
          display: flex;
          flex-direction: column;
          gap: 6px;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message-user {
          align-items: flex-end;
        }

        .message-assistant,
        .message-error {
          align-items: flex-start;
        }

        .message-content {
          display: flex;
          gap: 8px;
          max-width: 90%;
        }

        .msg-icon {
          font-size: 16px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .msg-text {
          padding: 10px 12px;
          border-radius: 12px;
          font-size: 13px;
          line-height: 1.4;
          word-wrap: break-word;
          white-space: pre-wrap;
        }

        .message-user .msg-text {
          background: var(--blue, #F94C24);
          color: white;
        }

        .message-assistant .msg-text {
          background: var(--s2, #242424);
          color: var(--t1, #f5f5f5);
          border: 1px solid var(--bdr, #2a2a2a);
        }

        .message-error .msg-text {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .message-action {
          margin-left: 24px;
          font-size: 11px;
        }

        .action-code {
          background: var(--s3, #303030);
          padding: 8px;
          border-radius: 6px;
          font-family: var(--font-m, 'JetBrains Mono');
          color: #8B5CF6;
          display: block;
          overflow-x: auto;
          max-width: 100%;
        }

        .loading {
          opacity: 0.7;
        }

        .typing-indicator {
          display: inline-flex;
          gap: 4px;
        }

        .typing-indicator span {
          width: 6px;
          height: 6px;
          background: var(--t2, #a3a3a3);
          border-radius: 50%;
          animation: bounce 1.4s infinite;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes bounce {
          0%, 80%, 100% {
            opacity: 0.4;
            transform: translateY(0);
          }
          40% {
            opacity: 1;
            transform: translateY(-8px);
          }
        }

        .ai-suggestion {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          background: var(--s2, #242424);
          border-top: 1px solid var(--bdr, #2a2a2a);
          font-size: 12px;
          color: var(--t2, #a3a3a3);
        }

        .try-btn {
          background: none;
          border: 1px solid var(--bdr, #2a2a2a);
          color: var(--blue, #F94C24);
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .try-btn:hover {
          background: var(--blue, #F94C24);
          color: white;
        }

        .ai-input-form {
          display: flex;
          gap: 8px;
          padding: 12px 16px;
          border-top: 1px solid var(--bdr, #2a2a2a);
          background: var(--s1, #1a1a1a);
        }

        .ai-input {
          flex: 1;
          background: var(--s2, #242424);
          border: 1px solid var(--bdr, #2a2a2a);
          border-radius: 8px;
          color: var(--t1, #f5f5f5);
          padding: 8px 12px;
          font-size: 13px;
          font-family: inherit;
          transition: all 0.2s;
        }

        .ai-input:focus {
          outline: none;
          border-color: var(--blue, #F94C24);
          background: var(--s3, #303030);
        }

        .ai-input::placeholder {
          color: var(--t3, #737373);
        }

        .ai-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .ai-send-btn {
          background: linear-gradient(135deg, var(--blue, #F94C24), var(--blue2, #D43916));
          border: none;
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .ai-send-btn:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(249, 76, 36, 0.4);
        }

        .ai-send-btn:active:not(:disabled) {
          transform: scale(0.95);
        }

        .ai-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Scrollbar styling */
        .ai-messages::-webkit-scrollbar {
          width: 6px;
        }

        .ai-messages::-webkit-scrollbar-track {
          background: transparent;
        }

        .ai-messages::-webkit-scrollbar-thumb {
          background: var(--bdr, #2a2a2a);
          border-radius: 3px;
        }

        .ai-messages::-webkit-scrollbar-thumb:hover {
          background: var(--t3, #737373);
        }

        /* Mobile responsive */
        @media (max-width: 480px) {
          .ai-assistant-widget {
            width: calc(100vw - 40px);
            max-height: 70vh;
          }

          .message-content {
            max-width: 95%;
          }
        }
      `}</style>
    </div>
  );
}
