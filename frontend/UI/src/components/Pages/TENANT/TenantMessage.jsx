import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDarkMode } from '../../../useDarkMode.js';
import TenantSideBar from './TenantSideBar';
import TenantNavBar from './TenantNavBar';
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  EllipsisVerticalIcon,
  PhotoIcon,
  DocumentIcon,
  XMarkIcon,
  CheckIcon,
  FaceSmileIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  VideoCameraIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

// Custom hooks
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};

const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [element, setElement] = useState(null);

  useEffect(() => {
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);
    return () => observer.disconnect();
  }, [element, options]);

  return [setElement, isIntersecting];
};

// Animated Components
const AnimatedMessage = ({ children, isOwn, index }) => {
  const [setRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <div
      ref={setRef}
      className={`transform transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
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
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
      className={`transform transition-all duration-500 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
        }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div
        className={`flex items-center p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} cursor-pointer transition-all duration-300 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} hover:scale-105 ${isActive ? darkMode ? 'bg-gradient-to-r from-blue-900 to-purple-900 border-l-4 border-blue-500' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500' : ''
          }`}
        onClick={onClick}
      >
        <div className="relative">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg transition-transform duration-300 hover:scale-110 ${isActive ? darkMode ? 'ring-4 ring-blue-900' : 'ring-4 ring-blue-200' : ''
            }`}>
            {conversation.avatar}
          </div>
          {conversation.online && (
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 ${darkMode ? 'border-gray-800' : 'border-white'} animate-pulse`}></div>
          )}
        </div>
        <div className="ml-3 flex-1 min-w-0">
          <div className="flex justify-between">
            <h3 className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'} truncate group-hover:text-blue-600 transition-colors duration-200`}>
              {conversation.name}
            </h3>
            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{conversation.time}</span>
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>{conversation.lastMessage}</p>
        </div>
        {conversation.unread && (
          <div className="w-3 h-3 rounded-full bg-blue-500 ml-2 animate-ping"></div>
        )}
      </div>
    </div>
  );
};

const MessageBubble = ({ message, index }) => {
  const { darkMode } = useDarkMode();
  const [imageError, setImageError] = useState(false);

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return <PhotoIcon className="h-4 w-4" />;
    }
    return <DocumentIcon className="h-4 w-4" />;
  };

  return (
    <AnimatedMessage isOwn={message.isOwn} index={index}>
      <div className={`flex mb-4 ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
        {!message.isOwn && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold mr-3 shadow-lg">
            {message.sender.charAt(0)}
          </div>
        )}
        <div
          className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 ${message.isOwn
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-md'
              : darkMode
                ? 'bg-gray-800 text-gray-100 rounded-bl-md border border-gray-700'
                : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
            }`}
        >
          <p className="leading-relaxed">{message.message}</p>

          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.attachments.map((file, idx) => (
                <div
                  key={idx}
                  className={`text-xs rounded-lg px-3 py-2 flex items-center transition-all duration-200 hover:scale-105 ${message.isOwn
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
            <p className={`text-xs ${message.isOwn ? 'text-blue-200' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
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

const TenantMessage = () => {
  const { darkMode } = useDarkMode();
  const [conversations, setConversations] = useLocalStorage('conversations', [
    {
      id: 1,
      name: "John Smith (Landlord)",
      lastMessage: "Hi! Just checking if everything is okay with the apartment.",
      time: "10:30 AM",
      unread: false,
      avatar: "JS",
      online: true
    },
    {
      id: 2,
      name: "Property Management",
      lastMessage: "Your maintenance request has been scheduled for tomorrow.",
      time: "Yesterday",
      unread: true,
      avatar: "PM",
      online: false
    },
    {
      id: 3,
      name: "Sarah Johnson (Neighbor)",
      lastMessage: "Thanks for letting me know about the party!",
      time: "Wed",
      unread: false,
      avatar: "SJ",
      online: true
    },
    {
      id: 4,
      name: "Mike Wilson (Maintenance)",
      lastMessage: "I'll be there at 2 PM sharp!",
      time: "2 days ago",
      unread: false,
      avatar: "MW",
      online: false
    }
  ]);

  const [activeConversation, setActiveConversation] = useState(conversations[0]);
  const [messages, setMessages] = useLocalStorage('messages', {
    1: [
      {
        id: 1,
        sender: "John Smith",
        message: "Hi! Just checking if everything is okay with the apartment.",
        time: "10:30 AM",
        isOwn: false
      },
      {
        id: 2,
        sender: "You",
        message: "Yes, everything is great! Thank you for checking.",
        time: "10:45 AM",
        isOwn: true
      },
      {
        id: 3,
        sender: "John Smith",
        message: "Great to hear! Let me know if you need anything.",
        time: "10:50 AM",
        isOwn: false
      }
    ],
    2: [
      {
        id: 1,
        sender: "Property Management",
        message: "Your maintenance request for the leaky faucet has been scheduled for tomorrow between 2-4 PM.",
        time: "9:15 AM",
        isOwn: false
      }
    ],
    3: [
      {
        id: 1,
        sender: "Sarah Johnson",
        message: "Hey, just wanted to confirm about the party on Saturday. Will there be music?",
        time: "2 days ago",
        isOwn: false
      },
      {
        id: 2,
        sender: "You",
        message: "Hi Sarah, yes there will be some music but we'll keep it at a reasonable volume.",
        time: "2 days ago",
        isOwn: true
      },
      {
        id: 3,
        sender: "Sarah Johnson",
        message: "Thanks for letting me know!",
        time: "2 days ago",
        isOwn: false
      }
    ],
    4: [
      {
        id: 1,
        sender: "Mike Wilson",
        message: "Hi! I'll be coming to fix your bathroom sink tomorrow.",
        time: "3 days ago",
        isOwn: false
      },
      {
        id: 2,
        sender: "You",
        message: "Perfect! What time should I expect you?",
        time: "3 days ago",
        isOwn: true
      },
      {
        id: 3,
        sender: "Mike Wilson",
        message: "I'll be there at 2 PM sharp!",
        time: "2 days ago",
        isOwn: false
      }
    ]
  });

  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeConversation.id]);

  // Typing indicator simulation
  useEffect(() => {
    if (newMessage) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 2000);
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
    }
  }, [newMessage]);

  const handleAttachment = useCallback((e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
  }, []);

  const removeAttachment = useCallback((index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }, []);

  const sendMessage = useCallback(() => {
    if (newMessage.trim() || attachments.length) {
      // Ensure we have a valid array for the current conversation
      const currentMessages = Array.isArray(messages[activeConversation.id])
        ? messages[activeConversation.id]
        : [];

      const message = {
        id: currentMessages.length + 1,
        sender: "You",
        message: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true,
        attachments: attachments,
      };

      setMessages(prev => ({
        ...prev,
        [activeConversation.id]: [...currentMessages, message]
      }));

      // Update conversation last message
      setConversations(prev => prev.map(conv =>
        conv.id === activeConversation.id
          ? { ...conv, lastMessage: newMessage || `${attachments.length} file(s)`, unread: false }
          : conv
      ));

      setNewMessage('');
      setAttachments([]);
      setShowEmojiPicker(false);
    }
  }, [newMessage, attachments, activeConversation.id, messages, setMessages, setConversations]);

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const emojis = ['😀', '😃', '😄', '😁', '😊', '😍', '🥰', '😘', '🤔', '👍', '👎', '❤️', '🎉', '🔥', '💯'];

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <TenantSideBar />
        <div className="flex flex-col flex-1">
          <TenantNavBar currentSection="Messages" />
          <main className={`flex-1 flex items-center justify-center ${darkMode ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-blue-950' : 'bg-gradient-to-br from-blue-50 to-purple-50'}`}>
            <div className="text-center">
              <div className="relative">
                <div className={`w-20 h-20 border-4 ${darkMode ? 'border-blue-900' : 'border-blue-200'} rounded-full animate-spin`}></div>
                <div className={`absolute inset-0 w-20 h-20 border-4 ${darkMode ? 'border-t-cyan-500' : 'border-t-blue-600'} rounded-full animate-spin`}></div>
              </div>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-slate-100' : 'text-gray-800'} mt-6 animate-pulse`}>Loading Messages...</h2>
              <p className={`${darkMode ? 'text-slate-300' : 'text-gray-600'} mt-2`}>Connecting to your conversations</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-blue-950' : 'bg-gradient-to-br from-gray-50 to-blue-50'}`}>
      <TenantSideBar />
      <div className="flex flex-col flex-1">
        <TenantNavBar currentSection="Messages" />
        <main className="flex-1 flex h-full overflow-hidden">
          {/* Conversations List */}
          <div className={`w-1/3 border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex flex-col ${darkMode ? 'bg-slate-800/80' : 'bg-white/80'} backdrop-blur-sm`}>
            {/* Header with Search */}
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} bg-gradient-to-r from-blue-600 to-purple-600 text-white`}>
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

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-12">
                  <ChatBubbleLeftRightIcon className={`h-16 w-16 ${darkMode ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-4 animate-bounce`} />
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No conversations found</p>
                </div>
              ) : (
                filteredConversations.map((conversation, index) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isActive={activeConversation.id === conversation.id}
                    onClick={() => setActiveConversation(conversation)}
                    index={index}
                    darkMode={darkMode}
                  />
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} ${darkMode ? 'bg-gradient-to-r from-gray-800 to-blue-900' : 'bg-gradient-to-r from-white to-blue-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg">
                          {activeConversation.avatar}
                        </div>
                        {activeConversation.online && (
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 ${darkMode ? 'border-gray-800' : 'border-white'} animate-pulse`}></div>
                        )}
                      </div>
                      <div className="ml-4">
                        <h3 className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'} text-lg`}>{activeConversation.name}</h3>
                        <p className={`text-sm ${activeConversation.online ? darkMode ? 'text-green-400' : 'text-green-600' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {activeConversation.online ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Messages */}
                <div className={`flex-1 overflow-y-auto p-6 ${darkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-white'} custom-scrollbar`}>
                  {Array.isArray(messages[activeConversation.id]) ?
                    messages[activeConversation.id].map((message, index) => (
                      <MessageBubble key={message.id} message={message} index={index} />
                    ))
                    : (
                      <div className="text-center py-12">
                        <ChatBubbleLeftRightIcon className={`h-16 w-16 ${darkMode ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-4`} />
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No messages in this conversation</p>
                      </div>
                    )}
                  <TypingIndicator isVisible={isTyping && newMessage} />
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className={`p-4 border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                  {/* Attachments Preview */}
                  {attachments.length > 0 && (
                    <div className={`flex flex-wrap gap-2 mb-4 p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl`}>
                      {attachments.map((file, idx) => (
                        <div key={idx} className={`${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'} px-3 py-2 rounded-lg shadow-md text-sm flex items-center transition-all duration-200 hover:shadow-lg`}>
                          {file.type?.startsWith('image/') ? (
                            <PhotoIcon className="h-4 w-4 mr-2 text-blue-600" />
                          ) : (
                            <DocumentIcon className="h-4 w-4 mr-2 text-gray-600" />
                          )}
                          <span className="truncate max-w-[150px]">{file.name}</span>
                          <button
                            className="ml-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                            onClick={() => removeAttachment(idx)}
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div className={`mb-4 p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border animate-slideUp`}>
                      <div className="grid grid-cols-8 gap-2">
                        {emojis.map((emoji, idx) => (
                          <button
                            key={idx}
                            className={`p-2 text-2xl ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-all duration-200 hover:scale-125`}
                            onClick={() => {
                              setNewMessage(prev => prev + emoji);
                              setShowEmojiPicker(false);
                            }}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Input Area */}
                  <div className="flex items-end space-x-3">
                    <div className="flex-1 relative">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className={`w-full border-2 ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-200 placeholder-gray-500' : 'border-gray-200 bg-white text-gray-800 placeholder-gray-400'} rounded-2xl px-6 py-4 pr-16 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 resize-none`}
                        rows="1"
                        style={{ minHeight: '56px', maxHeight: '120px' }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                      />
                      <button
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-500 hover:text-yellow-400' : 'text-gray-400 hover:text-yellow-500'} transition-all duration-200 hover:scale-110`}
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      >
                        <FaceSmileIcon className="h-6 w-6" />
                      </button>
                    </div>

                    {/* Action Buttons */}
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
                      className={`p-4 ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-gray-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'} rounded-2xl transition-all duration-300 hover:scale-110`}
                    >
                      <PaperClipIcon className="h-6 w-6" />
                    </button>

                    <button
                      className={`p-4 rounded-2xl transition-all duration-300 hover:scale-110 ${newMessage.trim() || attachments.length
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl'
                          : darkMode ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      onClick={sendMessage}
                      disabled={!newMessage.trim() && attachments.length === 0}
                    >
                      <PaperAirplaneIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className={`flex-1 flex flex-col items-center justify-center ${darkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-white'}`}>
                <ChatBubbleLeftRightIcon className={`h-24 w-24 ${darkMode ? 'text-gray-700' : 'text-gray-300'} mb-6`} />
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>No conversation selected</h2>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center max-w-md mb-8`}>
                  Select a conversation from the list or start a new one to begin messaging.
                </p>
                <button
                  onClick={startNewConversation}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center"
                >
                  <PlusCircleIcon className="h-5 w-5 mr-2" />
                  New Conversation
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
            transform: translate3d(0, 0, 0);
          }
          40%, 43% {
            animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
            transform: translate3d(0, -30px, 0);
          }
          70% {
            animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
            transform: translate3d(0, -15px, 0);
          }
          90% {
            transform: translate3d(0, -4px, 0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        
        .animate-bounce {
          animation: bounce 1s infinite;
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .5;
          }
        }
        
        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${darkMode ? '#1e293b' : '#f1f5f9'};
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #2563eb, #7c3aed);
        }
        
        /* Textarea auto-resize */
        textarea {
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
};

export default TenantMessage;