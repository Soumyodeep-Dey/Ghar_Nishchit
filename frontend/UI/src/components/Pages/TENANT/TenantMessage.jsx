import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useDarkMode } from '../../../useDarkMode.js';
import TenantSideBar from './TenantSideBar';
import TenantNavBar from './TenantNavBar';
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  PhotoIcon,
  DocumentIcon,
  XMarkIcon,
  CheckIcon,
  FaceSmileIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import api from '../../../services/api.js';

// ─── Intersection Observer hook ──────────────────────────────────────────────
const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [element, setElement] = useState(null);
  useEffect(() => {
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      options
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);
  return [setElement, isIntersecting];
};

// ─── Sub-components ──────────────────────────────────────────────────────────
const AnimatedMessage = ({ children, index }) => {
  const [setRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  return (
    <div
      ref={setRef}
      className={`transform transition-all duration-500 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      {children}
    </div>
  );
};

const TypingIndicator = ({ isVisible }) => {
  if (!isVisible) return null;
  return (
    <div className="flex justify-start mb-4 animate-fadeIn">
      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold mr-2">
        ?
      </div>
      <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 rounded-bl-none">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
      </div>
    </div>
  );
};

const ConversationItem = ({ conversation, isActive, onClick, index, darkMode }) => {
  const [setRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  return (
    <div
      ref={setRef}
      className={`transform transition-all duration-500 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div
        className={`flex items-center p-4 border-b ${
          darkMode ? 'border-gray-700' : 'border-gray-100'
        } cursor-pointer transition-all duration-300 ${
          darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
        } hover:scale-105 ${
          isActive
            ? darkMode
              ? 'bg-gradient-to-r from-blue-900 to-purple-900 border-l-4 border-blue-500'
              : 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500'
            : ''
        }`}
        onClick={onClick}
      >
        <div className="relative">
          <div
            className={`w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg transition-transform duration-300 hover:scale-110 ${
              isActive ? (darkMode ? 'ring-4 ring-blue-900' : 'ring-4 ring-blue-200') : ''
            }`}
          >
            {conversation.avatar || conversation.name?.charAt(0) || '?'}
          </div>
          {conversation.online && (
            <div
              className={`absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 ${
                darkMode ? 'border-gray-800' : 'border-white'
              } animate-pulse`}
            />
          )}
        </div>
        <div className="ml-3 flex-1 min-w-0">
          <div className="flex justify-between">
            <h3
              className={`font-medium ${
                darkMode ? 'text-gray-100' : 'text-gray-900'
              } truncate`}
            >
              {conversation.name}
            </h3>
            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {conversation.time}
            </span>
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>
            {conversation.lastMessage}
          </p>
        </div>
        {conversation.unread && (
          <div className="w-3 h-3 rounded-full bg-blue-500 ml-2 animate-ping" />
        )}
      </div>
    </div>
  );
};

const MessageBubble = ({ message, index, darkMode }) => {
  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return <PhotoIcon className="h-4 w-4" />;
    return <DocumentIcon className="h-4 w-4" />;
  };

  return (
    <AnimatedMessage index={index}>
      <div className={`flex mb-4 ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
        {!message.isOwn && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold mr-3 shadow-lg">
            {message.sender?.charAt(0)}
          </div>
        )}
        <div
          className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 ${
            message.isOwn
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-md'
              : darkMode
              ? 'bg-gray-800 text-gray-100 rounded-bl-md border border-gray-700'
              : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
          }`}
        >
          <p className="leading-relaxed">{message.message || message.text}</p>
          {message.attachments?.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.attachments.map((file, idx) => (
                <div
                  key={idx}
                  className={`text-xs rounded-lg px-3 py-2 flex items-center transition-all duration-200 hover:scale-105 ${
                    message.isOwn
                      ? 'bg-white/20 text-blue-100'
                      : darkMode
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {getFileIcon(file.name)}
                  <span className="ml-2 truncate">{file.name}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between mt-2">
            <p
              className={`text-xs ${
                message.isOwn ? 'text-blue-200' : darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              {message.time}
            </p>
            {message.isOwn && (
              <div className="flex items-center ml-2">
                <CheckIcon className="h-3 w-3 text-blue-200" />
                <CheckIcon className="h-3 w-3 text-blue-200 -ml-1" />
              </div>
            )}
          </div>
        </div>
      </div>
    </AnimatedMessage>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const TenantMessage = () => {
  const { darkMode } = useDarkMode();
  const location = useLocation();

  // ── State ────────────────────────────────────────────────────────────────
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState({});          // { [convId]: Message[] }
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // ── Fetch conversations from API ─────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const { data } = await api.get('/api/messages/conversations');
        setConversations(data);

        // ── Task 1 integration: auto-open landlord conversation from router state
        const routerState = location.state;
        if (routerState?.contactLandlord && routerState?.landlordId) {
          // Find existing conversation with this landlord
          const existing = data.find(
            (c) => c.participantId === routerState.landlordId
          );
          if (existing) {
            setActiveConversation(existing);
          } else {
            // Create a stub conversation so the landlord appears in the list immediately
            const stub = {
              id: `new-${routerState.landlordId}`,
              participantId: routerState.landlordId,
              name: routerState.landlordName || 'Landlord',
              avatar: routerState.landlordName?.charAt(0) || 'L',
              lastMessage: routerState.propertyTitle
                ? `Re: ${routerState.propertyTitle}`
                : 'New conversation',
              time: 'Now',
              online: false,
              unread: false,
              isStub: true,   // will be replaced after first real message
            };
            setConversations((prev) => [stub, ...prev]);
            setActiveConversation(stub);
            // Pre-fill the message box if a property title was passed
            if (routerState.propertyTitle) {
              setNewMessage(`Hi, I am interested in your property "${routerState.propertyTitle}". `);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load conversations:', err);
        setError('Could not load conversations. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [location.state]);

  // ── Fetch messages when active conversation changes ───────────────────────
  useEffect(() => {
    if (!activeConversation || activeConversation.isStub) return;
    if (messages[activeConversation.id]) return; // already loaded

    const load = async () => {
      try {
        const { data } = await api.get(
          `/api/messages/conversations/${activeConversation.id}`
        );
        setMessages((prev) => ({ ...prev, [activeConversation.id]: data }));
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    };
    load();
  }, [activeConversation]);

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeConversation]);

  // ── Typing indicator ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!newMessage) { setIsTyping(false); return; }
    setIsTyping(true);
    const t = setTimeout(() => setIsTyping(false), 2000);
    return () => clearTimeout(t);
  }, [newMessage]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAttachment = useCallback((e) => {
    setAttachments((prev) => [...prev, ...Array.from(e.target.files)]);
  }, []);

  const removeAttachment = useCallback((idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const sendMessage = useCallback(async () => {
    if ((!newMessage.trim() && !attachments.length) || !activeConversation) return;

    const optimistic = {
      id: `local-${Date.now()}`,
      sender: 'You',
      message: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
      attachments,
    };

    // Optimistically append
    setMessages((prev) => ({
      ...prev,
      [activeConversation.id]: [...(prev[activeConversation.id] || []), optimistic],
    }));
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id
          ? { ...c, lastMessage: newMessage || `${attachments.length} file(s)`, unread: false }
          : c
      )
    );
    setNewMessage('');
    setAttachments([]);
    setShowEmojiPicker(false);

    try {
      if (activeConversation.isStub) {
        // First message to a new landlord — create the conversation on the backend
        const { data } = await api.post('/api/messages/conversations', {
          participantId: activeConversation.participantId,
          message: newMessage,
        });
        // Replace stub with real conversation
        setConversations((prev) =>
          prev.map((c) => (c.id === activeConversation.id ? { ...data.conversation } : c))
        );
        const realId = data.conversation.id;
        setMessages((prev) => {
          const { [activeConversation.id]: old, ...rest } = prev;
          return { ...rest, [realId]: data.messages };
        });
        setActiveConversation(data.conversation);
      } else {
        await api.post(
          `/api/messages/conversations/${activeConversation.id}`,
          { message: newMessage }
        );
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  }, [newMessage, attachments, activeConversation]);

  const filteredConversations = conversations.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const emojis = ['😀', '😃', '😄', '😁', '😊', '😍', '🥰', '😘', '🤔', '👍', '👎', '❤️', '🎉', '🔥', '💯'];

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex h-screen">
        <TenantSideBar />
        <div className="flex flex-col flex-1" style={{ marginLeft: 'var(--sidebar-width, 4.5rem)' }}>
          <TenantNavBar currentSection="Messages" />
          <main
            className={`flex-1 flex items-center justify-center ${
              darkMode
                ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-blue-950'
                : 'bg-gradient-to-br from-blue-50 to-purple-50'
            }`}
          >
            <div className="text-center">
              <div className="relative">
                <div
                  className={`w-20 h-20 border-4 ${
                    darkMode ? 'border-blue-900' : 'border-blue-200'
                  } rounded-full animate-spin`}
                />
                <div
                  className={`absolute inset-0 w-20 h-20 border-4 ${
                    darkMode ? 'border-t-cyan-500' : 'border-t-blue-600'
                  } rounded-full animate-spin`}
                />
              </div>
              <h2
                className={`text-xl font-bold ${
                  darkMode ? 'text-slate-100' : 'text-gray-800'
                } mt-6 animate-pulse`}
              >
                Loading Messages...
              </h2>
              <p className={`${darkMode ? 'text-slate-300' : 'text-gray-600'} mt-2`}>
                Connecting to your conversations
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div
      className={`flex h-screen ${
        darkMode
          ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-blue-950'
          : 'bg-gradient-to-br from-gray-50 to-blue-50'
      }`}
    >
      <TenantSideBar />
      <div className="flex flex-col flex-1" style={{ marginLeft: 'var(--sidebar-width, 4.5rem)' }}>
        <TenantNavBar currentSection="Messages" />
        <main className="flex-1 flex h-full overflow-hidden">
          {/* ── Left panel: Conversations list ───────────────────────────── */}
          <div
            className={`w-1/3 border-r ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            } flex flex-col ${
              darkMode ? 'bg-slate-800/80' : 'bg-white/80'
            } backdrop-blur-sm`}
          >
            <div
              className={`p-6 border-b ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              } bg-gradient-to-r from-blue-600 to-purple-600 text-white`}
            >
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <ChatBubbleLeftRightIcon className="h-8 w-8 mr-3" />
                Messages
              </h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 pl-12 text-white placeholder-white/70 focus:outline-none focus:ring-4 focus:ring-white/20 transition-all duration-300"
                />
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-4 text-white/70" />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-100 text-red-700 text-sm">{error}</div>
            )}

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-12">
                  <ChatBubbleLeftRightIcon
                    className={`h-16 w-16 ${
                      darkMode ? 'text-gray-600' : 'text-gray-400'
                    } mx-auto mb-4 animate-bounce`}
                  />
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    No conversations found
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv, idx) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isActive={activeConversation?.id === conv.id}
                    onClick={() => setActiveConversation(conv)}
                    index={idx}
                    darkMode={darkMode}
                  />
                ))
              )}
            </div>
          </div>

          {/* ── Right panel: Chat area ────────────────────────────────────── */}
          <div className={`flex-1 flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
            {activeConversation ? (
              <>
                {/* Chat header */}
                <div
                  className={`p-4 border-b ${
                    darkMode ? 'border-gray-700' : 'border-gray-200'
                  } ${
                    darkMode
                      ? 'bg-gradient-to-r from-gray-800 to-blue-900'
                      : 'bg-gradient-to-r from-white to-blue-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg">
                        {activeConversation.avatar || activeConversation.name?.charAt(0)}
                      </div>
                      {activeConversation.online && (
                        <div
                          className={`absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 ${
                            darkMode ? 'border-gray-800' : 'border-white'
                          } animate-pulse`}
                        />
                      )}
                    </div>
                    <div className="ml-4">
                      <h3
                        className={`font-semibold ${
                          darkMode ? 'text-gray-100' : 'text-gray-900'
                        } text-lg`}
                      >
                        {activeConversation.name}
                      </h3>
                      <p
                        className={`text-sm ${
                          activeConversation.online
                            ? darkMode
                              ? 'text-green-400'
                              : 'text-green-600'
                            : darkMode
                            ? 'text-gray-400'
                            : 'text-gray-500'
                        }`}
                      >
                        {activeConversation.isStub
                          ? 'Start a new conversation'
                          : activeConversation.online
                          ? 'Online'
                          : 'Offline'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div
                  className={`flex-1 overflow-y-auto p-6 ${
                    darkMode
                      ? 'bg-gradient-to-b from-gray-900 to-gray-800'
                      : 'bg-gradient-to-b from-gray-50 to-white'
                  } custom-scrollbar`}
                >
                  {Array.isArray(messages[activeConversation.id]) &&
                  messages[activeConversation.id].length > 0 ? (
                    messages[activeConversation.id].map((msg, idx) => (
                      <MessageBubble
                        key={msg.id || idx}
                        message={msg}
                        index={idx}
                        darkMode={darkMode}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <ChatBubbleLeftRightIcon
                        className={`h-16 w-16 ${
                          darkMode ? 'text-gray-600' : 'text-gray-400'
                        } mx-auto mb-4`}
                      />
                      <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {activeConversation.isStub
                          ? 'Send your first message to start this conversation.'
                          : 'No messages yet in this conversation.'}
                      </p>
                    </div>
                  )}
                  <TypingIndicator isVisible={isTyping && !!newMessage} />
                  <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <div
                  className={`p-4 border-t ${
                    darkMode
                      ? 'border-gray-700 bg-gray-800'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  {attachments.length > 0 && (
                    <div
                      className={`flex flex-wrap gap-2 mb-4 p-4 ${
                        darkMode ? 'bg-gray-700' : 'bg-gray-50'
                      } rounded-xl`}
                    >
                      {attachments.map((file, idx) => (
                        <div
                          key={idx}
                          className={`${
                            darkMode
                              ? 'bg-gray-800 text-gray-300'
                              : 'bg-white text-gray-700'
                          } px-3 py-2 rounded-lg shadow-md text-sm flex items-center`}
                        >
                          {file.type?.startsWith('image/') ? (
                            <PhotoIcon className="h-4 w-4 mr-2 text-blue-600" />
                          ) : (
                            <DocumentIcon className="h-4 w-4 mr-2 text-gray-600" />
                          )}
                          <span className="truncate max-w-[150px]">{file.name}</span>
                          <button
                            className="ml-2 text-gray-400 hover:text-red-500"
                            onClick={() => removeAttachment(idx)}
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {showEmojiPicker && (
                    <div
                      className={`mb-4 p-4 ${
                        darkMode
                          ? 'bg-gray-800 border-gray-700'
                          : 'bg-white border-gray-200'
                      } rounded-xl shadow-lg border animate-slideUp`}
                    >
                      <div className="grid grid-cols-8 gap-2">
                        {emojis.map((emoji, idx) => (
                          <button
                            key={idx}
                            className={`p-2 text-2xl ${
                              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                            } rounded-lg transition-all duration-200 hover:scale-125`}
                            onClick={() => {
                              setNewMessage((prev) => prev + emoji);
                              setShowEmojiPicker(false);
                            }}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-end space-x-3">
                    <div className="flex-1 relative">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className={`w-full border-2 ${
                          darkMode
                            ? 'border-gray-700 bg-gray-800 text-gray-200 placeholder-gray-500'
                            : 'border-gray-200 bg-white text-gray-800 placeholder-gray-400'
                        } rounded-2xl px-6 py-4 pr-16 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 resize-none`}
                        rows={1}
                        style={{ minHeight: '56px', maxHeight: '120px' }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                      />
                      <button
                        className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                          darkMode
                            ? 'text-gray-500 hover:text-yellow-400'
                            : 'text-gray-400 hover:text-yellow-500'
                        } transition-all duration-200 hover:scale-110`}
                        onClick={() => setShowEmojiPicker((v) => !v)}
                      >
                        <FaceSmileIcon className="h-6 w-6" />
                      </button>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleAttachment}
                      className="hidden"
                      accept="image/*,application/pdf,.doc,.docx,.txt"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-4 ${
                        darkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      } rounded-2xl transition-all duration-300 hover:scale-110`}
                    >
                      <PaperClipIcon className="h-6 w-6" />
                    </button>

                    <button
                      className={`p-4 rounded-2xl transition-all duration-300 hover:scale-110 ${
                        newMessage.trim() || attachments.length
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl'
                          : darkMode
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                      onClick={sendMessage}
                      disabled={!newMessage.trim() && !attachments.length}
                    >
                      <PaperAirplaneIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div
                className={`flex-1 flex flex-col items-center justify-center ${
                  darkMode
                    ? 'bg-gradient-to-b from-gray-900 to-gray-800'
                    : 'bg-gradient-to-b from-gray-50 to-white'
                }`}
              >
                <ChatBubbleLeftRightIcon
                  className={`h-24 w-24 ${
                    darkMode ? 'text-gray-700' : 'text-gray-300'
                  } mb-6`}
                />
                <h2
                  className={`text-2xl font-bold ${
                    darkMode ? 'text-gray-200' : 'text-gray-700'
                  } mb-2`}
                >
                  No conversation selected
                </h2>
                <p
                  className={`${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  } text-center max-w-md`}
                >
                  Select a conversation from the list to begin messaging.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
        .animate-fadeIn  { animation: fadeIn  0.5s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        .animate-pulse   { animation: pulse  2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: ${darkMode ? '#1e293b' : '#f1f5f9'}; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: linear-gradient(45deg,#3b82f6,#8b5cf6); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: linear-gradient(45deg,#2563eb,#7c3aed); }
        textarea { overflow-y: auto; }
      `}</style>
    </div>
  );
};

export default TenantMessage;
