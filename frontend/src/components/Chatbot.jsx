import { useState, useRef, useEffect } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaSpinner, FaCommentDots } from 'react-icons/fa';
import { aiService } from '../services/api';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', content: "Hello! I'm the Smart College Assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    "How do I report an issue?",
    "What information should I provide?",
    "How can I check my issue status?",
    "Which department handles Wi-Fi problems?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (text) => {
    if (!text.trim()) return;
    
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await aiService.chat(newMessages);
      setMessages([...newMessages, { role: 'model', content: res.response }]);
    } catch (err) {
      let errorMsg = 'AI service is temporarily unavailable. Please try again.';
      
      if (!err.response) {
        errorMsg = 'Unable to connect to the AI service.';
      } else if (err.response.status === 503) {
        errorMsg = err.response.data?.message || 'AI assistant is not configured.';
      } else if (err.response.status === 429) {
        errorMsg = 'AI service is temporarily busy. Please try again later.';
      } else if (err.response.status === 401 || err.response.status === 403) {
        errorMsg = 'Please log in again.';
      } else if (err.response.data && err.response.data.message) {
        errorMsg = err.response.data.message;
      }
      
      setMessages([
        ...newMessages,
        { role: 'model', content: errorMsg }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend(input);
    }
  };

  const handleClear = () => {
    setMessages([
      { role: 'model', content: "Hello! I'm the Smart College Assistant. How can I help you today?" }
    ]);
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-primary-600 text-white p-4 rounded-full shadow-premium hover:bg-primary-700 transition-all z-50 animate-bounce-slow flex items-center justify-center"
        >
          <FaCommentDots className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden transition-all h-[500px] max-h-[80vh]">
          {/* Header */}
          <div className="bg-primary-600 text-white px-4 py-3 flex justify-between items-center shadow-md">
            <div className="flex items-center space-x-2">
              <FaRobot className="h-5 w-5" />
              <h3 className="font-outfit font-bold">AI Assistant</h3>
            </div>
            <div className="flex space-x-2 text-primary-200">
              <button onClick={handleClear} className="text-xs hover:text-white transition-colors">Clear</button>
              <button onClick={() => setIsOpen(false)} className="hover:text-white transition-colors">
                <FaTimes className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-xl px-4 py-2 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-primary-600 text-white rounded-br-none'
                    : 'bg-white text-slate-700 border border-slate-200 shadow-sm rounded-bl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-slate-400 border border-slate-200 shadow-sm rounded-xl rounded-bl-none px-4 py-2 flex items-center space-x-2">
                  <FaSpinner className="animate-spin h-3 w-3" />
                  <span className="text-xs">Typing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length === 1 && (
            <div className="px-3 pb-2 bg-slate-50">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 px-1">Suggested:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="bg-white border border-primary-200 text-primary-700 text-[11px] px-3 py-1.5 rounded-full hover:bg-primary-50 transition-colors shadow-sm"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask a question..."
              className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={loading}
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || loading}
              className="bg-primary-600 text-white p-2.5 rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              <FaPaperPlane className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
