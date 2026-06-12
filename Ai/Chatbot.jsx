import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader2, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useDarkMode } from '@ui/useDarkMode.js';
import { getDashboardTheme, dotPatternStyle } from '@ui/styles/dashboardTheme.js';
import { GEMINI_API_KEY, GEMINI_MODEL, SYSTEM_PROMPT, QUICK_PROMPTS } from './config.js';

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

const INITIAL_MESSAGE = {
  role: 'model',
  content: "Namaste! I'm Landmark AI Assistant for Ghar Nishchit. Ask me about login, properties, rent, or maintenance.",
};

const formatTimestamp = () => {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatApiError = (error) => {
  const message = error?.message || '';
  if (message.includes('429') || message.toLowerCase().includes('quota')) {
    return 'The AI service is temporarily rate-limited. Please wait about 30 seconds and try again, or check your Gemini API quota in Google AI Studio.';
  }
  if (message.includes('404') || message.toLowerCase().includes('not found')) {
    return `Model "${GEMINI_MODEL}" is not available for your API key. Set VITE_GEMINI_MODEL=gemini-1.5-flash in your .env and restart the dev server.`;
  }
  return 'Something went wrong. Please try again in a moment.';
};

const Chatbot = () => {
  const { darkMode } = useDarkMode();
  const theme = getDashboardTheme(darkMode);
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const messagesEndRef = useRef(null);
  const chatRef = useRef(null);
  const inFlightRef = useRef(false);

  useEffect(() => {
    if (location.pathname === '/' && !isOpen) {
      const timer = setTimeout(() => setShowTooltip(true), 2000);
      const hideTimer = setTimeout(() => setShowTooltip(false), 12000);
      return () => {
        clearTimeout(timer);
        clearTimeout(hideTimer);
      };
    }
    setShowTooltip(false);
  }, [location.pathname, isOpen]);

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
      oscillator.frequency.setValueAtTime(880, context.currentTime);
      gainNode.gain.setValueAtTime(0.1, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.2);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  useEffect(() => {
    scrollToBottom();
    if (messages.length > 1 && messages[messages.length - 1].role === 'model') {
      playNotificationSound();
    }
  }, [messages, isOpen]);

  const resetChat = () => {
    chatRef.current = null;
    inFlightRef.current = false;
    setIsLoading(false);
    setMessages([INITIAL_MESSAGE]);
  };

  const getChatSession = () => {
    if (!genAI) return null;
    if (!chatRef.current) {
      const model = genAI.getGenerativeModel({
        model: GEMINI_MODEL,
        systemInstruction: SYSTEM_PROMPT,
      });
      chatRef.current = model.startChat({ history: [] });
    }
    return chatRef.current;
  };

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || inFlightRef.current) return;

    inFlightRef.current = true;
    setIsLoading(true);
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    setInput('');

    try {
      if (!GEMINI_API_KEY || !genAI) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'model',
            content:
              'Gemini API key is missing. Add VITE_GEMINI_API_KEY to Ai/.env or frontend/UI/.env, then restart the dev server.',
          },
        ]);
        return;
      }

      const chat = getChatSession();
      const result = await chat.sendMessage(trimmed);
      const response = await result.response;
      const replyText = response.text();

      setMessages((prev) => [
        ...prev,
        { role: 'model', content: replyText, timestamp: formatTimestamp() },
      ]);
    } catch (error) {
      console.error('Error communicating with Gemini API:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'model', content: formatApiError(error) },
      ]);
    } finally {
      inFlightRef.current = false;
      setIsLoading(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const panelBg = darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-amber-100';
  const messagesBg = darkMode ? 'bg-slate-950' : 'bg-[#fafaf9]';
  const userBubble = 'bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-tr-none shadow-[0_8px_20px_rgba(217,119,6,0.25)]';
  const botBubble = darkMode
    ? 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-none'
    : 'bg-white text-slate-900 border border-amber-100 rounded-tl-none shadow-sm';
  const inputShell = darkMode
    ? 'bg-slate-800/80 border-slate-700 focus-within:border-amber-500'
    : 'bg-slate-50/80 border-slate-100 focus-within:border-amber-500';

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end">
          <AnimatePresence>
            {showTooltip && (
              <motion.button
                type="button"
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className={`mb-4 relative px-4 py-3 rounded-2xl shadow-xl border font-semibold text-sm flex items-center gap-2 transition-colors ${
                  darkMode
                    ? 'bg-slate-900 text-amber-400 border-slate-800 hover:bg-slate-800'
                    : 'bg-white text-amber-700 border-amber-100 hover:bg-amber-50'
                }`}
              >
                <span className="animate-pulse">Need help with Ghar Nishchit?</span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTooltip(false);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && setShowTooltip(false)}
                  className="text-slate-400 hover:text-slate-600 ml-1"
                  aria-label="Dismiss"
                >
                  <X size={14} />
                </span>
                <div
                  className={`absolute -bottom-2 right-5 w-4 h-4 transform rotate-45 border-b border-r ${
                    darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-amber-100'
                  }`}
                />
              </motion.button>
            )}
          </AnimatePresence>

          <motion.button
            type="button"
            onClick={() => setIsOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Open AI assistant"
            className="relative p-4 bg-gradient-to-br from-amber-400 to-amber-600 text-white rounded-full shadow-[0_8px_20px_rgba(217,119,6,0.35)] hover:from-amber-500 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:ring-offset-2 transition-all"
          >
            <div className="absolute inset-0 bg-amber-500 blur-lg opacity-40 rounded-full" />
            <MessageCircle size={24} className="relative" />
          </motion.button>
        </div>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed bottom-6 right-6 w-[min(400px,calc(100vw-2rem))] h-[min(600px,85vh)] rounded-3xl shadow-2xl flex flex-col z-50 border overflow-hidden ${panelBg}`}
          >
            <div
              className={`relative p-4 flex justify-between items-center border-b ${
                darkMode ? 'bg-slate-950 border-slate-800' : 'bg-gradient-to-r from-slate-900 via-slate-800 to-amber-900 border-amber-100/20'
              }`}
            >
              <div
                className="absolute inset-0 opacity-[0.12] pointer-events-none"
                style={dotPatternStyle}
              />
              <div className="relative flex items-center gap-3">
                <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-2 rounded-xl text-white shadow-[0_8px_20px_rgba(217,119,6,0.3)]">
                  <Bot size={22} />
                </div>
                <div>
                  <h3 className="font-black text-lg tracking-tight text-white">
                    Ghar<span className="text-amber-400">.</span>Nishchit AI
                  </h3>
                  <p className={`text-[10px] font-black uppercase tracking-[0.35em] ${theme.textAccent}`}>
                    Landmark Assistant
                  </p>
                </div>
              </div>
              <div className="relative flex items-center gap-3 text-white/90">
                <button
                  type="button"
                  onClick={resetChat}
                  className="hover:text-amber-300 transition-colors"
                  aria-label="Reset chat"
                >
                  <RotateCcw size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="hover:text-amber-300 transition-colors"
                  aria-label={isMuted ? 'Unmute notifications' : 'Mute notifications'}
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="hover:text-amber-300 transition-colors"
                  aria-label="Close chat"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            <div
              className={`px-5 py-2.5 text-xs leading-relaxed border-b ${
                darkMode
                  ? 'text-slate-400 bg-slate-900/50 border-slate-800'
                  : 'text-slate-500 bg-amber-50/50 border-amber-100'
              }`}
            >
              Chat messages help improve your experience. See our privacy policy for how data is stored.
            </div>

            <div className={`flex-1 p-5 overflow-y-auto space-y-4 scroll-smooth ${messagesBg}`}>
              {messages.map((msg, index) => (
                <div
                  key={`${index}-${msg.content.slice(0, 12)}`}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex flex-col max-w-[88%] gap-2">
                    <div
                      className={`p-4 rounded-2xl text-[15px] leading-relaxed ${
                        msg.role === 'user' ? userBubble : botBubble
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>

                    {index === 0 && messages.length === 1 && !isLoading && (
                      <div className="flex flex-wrap gap-2">
                        {QUICK_PROMPTS.map((prompt) => (
                          <button
                            key={prompt}
                            type="button"
                            onClick={() => sendMessage(prompt)}
                            disabled={isLoading}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                              darkMode
                                ? 'bg-slate-800 border-slate-700 text-slate-200 hover:border-amber-500 hover:text-amber-400'
                                : 'bg-white border-slate-100 text-slate-700 hover:border-amber-500 hover:text-amber-600 shadow-sm'
                            }`}
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className={`p-4 rounded-2xl rounded-tl-none border flex items-center ${botBubble}`}>
                    <Loader2 className={`w-5 h-5 animate-spin ${theme.iconAccent}`} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className={`p-4 border-t ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-amber-100 bg-white'}`}>
              <form onSubmit={handleSendMessage} className="flex items-center">
                <div
                  className={`flex-1 flex items-center border rounded-2xl px-4 py-3 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${inputShell}`}
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about login, rent, properties..."
                    className={`flex-1 bg-transparent border-none outline-none text-[15px] ${
                      darkMode ? 'text-slate-100 placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className={`ml-2 transition-all ${
                      input.trim() ? `${theme.textAccent} hover:scale-110` : 'text-slate-300'
                    }`}
                    aria-label="Send message"
                  >
                    <Send size={22} fill={input.trim() ? 'currentColor' : 'none'} />
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
