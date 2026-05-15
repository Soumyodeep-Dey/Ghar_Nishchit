import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Home, RotateCcw, Volume2, VolumeX, Menu } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

// Initialize the Gemini API client
// Note: It's best practice to use environment variables for API keys
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', content: "Hi there, I'm here to help! Let's get started!", timestamp: 'Today 06:46 pm' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = useRef(null);

  const location = useLocation();
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Show tooltip on the landing page if chat is closed
    if (location.pathname === '/' && !isOpen) {
      const timer = setTimeout(() => setShowTooltip(true), 2000); // 2 second delay
      const hideTimer = setTimeout(() => setShowTooltip(false), 12000); // Hide after 12s
      return () => { clearTimeout(timer); clearTimeout(hideTimer); };
    } else {
      setShowTooltip(false);
    }
  }, [location.pathname, isOpen]);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const playNotificationSound = () => {
    if (isMuted) return;
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, context.currentTime); // A5
      gainNode.gain.setValueAtTime(0.1, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.start();
      oscillator.stop(context.currentTime + 0.2);
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  useEffect(() => {
    scrollToBottom();
    // Play sound when AI replies
    if (messages.length > 1 && messages[messages.length - 1].role === 'model') {
      playNotificationSound();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (!apiKey) {
         setMessages((prev) => [...prev, { 
             role: 'model', 
             content: "It looks like the Gemini API key is missing. Please set VITE_GEMINI_API_KEY in your frontend .env file." 
         }]);
         setIsLoading(false);
         return;
      }

      // Prepare chat history for context (skip the first greeting message)
      const systemPrompt = `You are Landmark Ai Assistant, the official AI support bot for the Ghar Nishchit platform. 
Ghar Nishchit is a property management platform for landlords and tenants. 
If asked how to log in, tell them to click the "Login" button at the top navigation bar, enter their email and password, and select their role (Tenant or Landlord).
Key features: Landlords can manage properties, tenants, maintenance, and payments. Tenants can pay rent, submit maintenance requests, and message landlords.
Always be polite, concise, and helpful!`;

      const model = genAI.getGenerativeModel({ 
        model: "gemini-flash-latest",
        systemInstruction: systemPrompt
      });
      
      const history = messages
        .slice(1)
        .filter(m => m.role !== 'system')
        .map(m => ({
            role: m.role,
            parts: [{ text: m.content }]
        }));

      const chat = model.startChat({
        history: history,
      });

      const result = await chat.sendMessage(userMessage.content);
      const response = await result.response;
      const text = response.text();
      const now = new Date();
      const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setMessages((prev) => [...prev, { 
        role: 'model', 
        content: text,
        timestamp: `Today ${timestamp}`
      }]);
    } catch (error) {
      console.error("Error communicating with Gemini API:", error);
      setMessages((prev) => [...prev, { 
          role: 'model', 
          content: `Error: ${error.message || "Something went wrong. Please try again."}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Toggle Button with Attractor Tooltip */}
      {!isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end">
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mb-4 relative bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 px-4 py-3 rounded-2xl shadow-xl border border-indigo-100 dark:border-indigo-900 font-medium text-sm flex items-center space-x-2 cursor-pointer hover:bg-gray-50"
                onClick={toggleChat}
              >
                <span className="animate-pulse">Hi! Need help?</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }} 
                  className="text-gray-400 hover:text-gray-600 ml-2"
                >
                  <X size={14} />
                </button>
                {/* Small triangle pointer */}
                <div className="absolute -bottom-2 right-5 w-4 h-4 bg-white dark:bg-gray-800 border-b border-r border-indigo-100 dark:border-indigo-900 transform rotate-45"></div>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button
            onClick={toggleChat}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            <Home size={24} />
          </motion.button>
        </div>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-[400px] h-[600px] max-h-[85vh] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl flex flex-col z-50 border border-gray-100 dark:border-gray-700 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#2d2d5f] p-4 text-white flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="bg-white/10 p-2 rounded-xl">
                  <Bot size={24} className="text-white" />
                </div>
                <h3 className="font-bold text-xl tracking-tight">Landmark Ai Assistant</h3>
              </div>
              <div className="flex items-center space-x-4">
                <RotateCcw size={20} className="cursor-pointer hover:text-indigo-200 transition-colors" onClick={() => setMessages([{ role: 'model', content: "Hi there, I'm here to help! Let's get started!", timestamp: 'Today 06:46 pm' }])} />
                <div onClick={() => setIsMuted(!isMuted)} className="cursor-pointer hover:text-indigo-200 transition-colors">
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </div>
                <X size={24} className="cursor-pointer hover:text-indigo-200 transition-colors" onClick={toggleChat} />
              </div>
            </div>

            {/* Privacy Disclaimer */}
            <div className="px-6 py-3 text-[13px] leading-relaxed text-gray-500 bg-white border-b border-gray-50">
              The information you provide to the chatbot will be collected to improve your experience. Please read our <span className="text-indigo-600 font-semibold cursor-pointer hover:underline">privacy policy</span> to see how we are storing and protecting your data
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-white dark:bg-gray-900 scroll-smooth">
              {/* Message Group with Timestamp */}
              <div className="flex flex-col space-y-4">
                <div className="text-center">
                  <span className="text-xs font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-full uppercase tracking-wider">Today 06:46 pm</span>
                </div>
                
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                  >
                    <div className="flex flex-col max-w-[85%] space-y-2">
                      <div
                        className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                          msg.role === 'user'
                            ? 'bg-[#2d2d5f] text-white rounded-tr-none'
                            : 'bg-[#f4f7ff] text-[#2d2d5f] border border-[#e8efff] rounded-tl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      
                      {/* Quick Actions for Initial Message */}
                      {index === 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          <button 
                            onClick={() => setInput("Explore Jobs")}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm"
                          >
                            Explore Jobs
                          </button>
                          <button 
                            onClick={() => setInput("Ask a question")}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm"
                          >
                            Ask a question
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {isLoading && (
                <div className="flex justify-start">
                  <div className="p-4 bg-[#f4f7ff] rounded-2xl rounded-tl-none border border-[#e8efff] flex items-center shadow-sm">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white dark:bg-gray-800">
              <form onSubmit={handleSendMessage} className="relative flex items-center">
                <div className="flex-1 flex items-center bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus-within:border-indigo-200 transition-all">
                  <Menu size={20} className="text-gray-400 mr-3 cursor-pointer hover:text-gray-600" />
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything"
                    className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 text-[15px]"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className={`ml-2 transition-all ${input.trim() ? 'text-[#2d2d5f] hover:scale-110' : 'text-gray-300'}`}
                  >
                    <Send size={24} fill={input.trim() ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
