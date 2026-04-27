import React, { useState, useEffect, useRef } from 'react';

const Chatbot = ({ darkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am your Ghar Nishchit rental assistant. I can help you find properties, guide you to add listings, or help with maintenance requests. How can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Show tooltip after a short delay
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 2000);
    
    // Auto hide after 15 seconds
    const hideTimer = setTimeout(() => {
      setShowTooltip(false);
    }, 15000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: data.reply }
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Sorry, I am having trouble connecting right now. Please try again later.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50">
      {isOpen ? (
        <div className={`${darkMode ? 'bg-slate-900/95 border-slate-700/50 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)]' : 'bg-white/95 border-white/20 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)]'} backdrop-blur-xl w-80 sm:w-96 max-h-[85vh] rounded-3xl flex flex-col overflow-hidden border transition-all duration-500 ease-out ring-1 ring-black/5`}>
          <div className={`${darkMode ? 'bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700/50' : 'bg-gradient-to-r from-blue-600 to-indigo-600'} text-white p-5 flex justify-between items-center transition-colors duration-300`}>
            <div className="font-semibold text-lg flex items-center gap-3 tracking-wide">
              <div className={`p-2 rounded-xl ${darkMode ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/20 text-white'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <span className="font-bold">Ghar Nishchit AI</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              title="Close/Minimize Chat"
              className="p-1.5 rounded-full text-white/80 hover:bg-white/20 hover:text-white focus:outline-none transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className={`flex-1 p-5 overflow-y-auto min-h-[300px] flex flex-col gap-4 transition-colors duration-300 ${darkMode ? 'bg-slate-800/30' : 'bg-slate-50/50'}`}>
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`max-w-[85%] px-4 py-3 text-[15px] leading-relaxed ${
                  msg.sender === 'user' 
                    ? (darkMode 
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-500 text-white self-end rounded-2xl rounded-tr-sm shadow-md' 
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white self-end rounded-2xl rounded-tr-sm shadow-md')
                    : (darkMode 
                        ? 'bg-slate-700/80 backdrop-blur-sm border border-slate-600/50 text-slate-100 self-start rounded-2xl rounded-tl-sm shadow-sm' 
                        : 'bg-white border border-gray-100 text-gray-800 self-start rounded-2xl rounded-tl-sm shadow-sm')
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className={`${darkMode ? 'bg-slate-700/80 border-slate-600/50 text-slate-100' : 'bg-white border-gray-100 text-gray-800'} backdrop-blur-sm border self-start rounded-2xl rounded-tl-sm p-4 max-w-[80%] shadow-sm`}>
                <div className="flex gap-1.5 items-center h-5">
                  <div className={`w-2 h-2 ${darkMode ? 'bg-cyan-400' : 'bg-blue-500'} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
                  <div className={`w-2 h-2 ${darkMode ? 'bg-cyan-400' : 'bg-blue-500'} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
                  <div className={`w-2 h-2 ${darkMode ? 'bg-cyan-400' : 'bg-blue-500'} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className={`p-4 flex gap-3 transition-colors duration-300 ${darkMode ? 'bg-slate-900/80 border-t border-slate-700/50' : 'bg-white/80 border-t border-gray-100'} backdrop-blur-md`}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className={`flex-1 px-5 py-3 text-[15px] rounded-2xl focus:outline-none focus:ring-2 transition-all shadow-inner ${
                darkMode 
                  ? 'bg-slate-800/80 text-white border-transparent focus:ring-cyan-500/50 focus:bg-slate-800 placeholder-slate-400' 
                  : 'bg-slate-100 text-gray-900 border-transparent focus:ring-blue-500/30 focus:bg-white placeholder-gray-500'
              }`}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`${darkMode ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 focus:ring-cyan-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:ring-blue-600'} text-white p-3 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95`}
            >
              <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      ) : (
        <div className="flex items-end gap-4 animate-fade-in-up">
          {showTooltip && (
            <div className={`relative px-5 py-4 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] text-sm w-64 transform transition-all duration-500 ease-in-out ${darkMode ? 'bg-slate-800/95 border border-slate-700/50 backdrop-blur-md' : 'bg-white/95 border border-white/20 backdrop-blur-md'}`}>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(false);
                }}
                className={`absolute top-2 right-2 p-1 rounded-full transition-colors ${darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-gray-400 hover:text-gray-800 hover:bg-gray-100'}`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
              <div className="flex gap-3 items-start">
                <span className="text-2xl animate-bounce" style={{ animationDuration: '2s' }}>👋</span>
                <div>
                  <p className={`font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Need any help?</p>
                  <p className={`text-[13px] leading-relaxed ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>I'm your AI assistant! Ask me about properties, pricing, or adding your own listing.</p>
                </div>
              </div>
              {/* Tooltip Triangle pointing right */}
              <div className={`absolute -right-2 bottom-5 w-4 h-4 transform rotate-45 ${darkMode ? 'bg-slate-800 border-t border-r border-slate-700/50' : 'bg-white border-t border-r border-gray-100'} shadow-sm`}></div>
            </div>
          )}
          <button
            onClick={() => {
              setIsOpen(true);
              setShowTooltip(false);
            }}
            title="Open AI Assistant"
            className={`group relative ${darkMode ? 'bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]' : 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)]'} text-white p-4 rounded-full focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all duration-300 transform hover:scale-110 flex items-center justify-center`}
          >
            <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-white"></div>
            <svg className="w-8 h-8 relative z-10 transition-transform duration-300 group-hover:-translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
