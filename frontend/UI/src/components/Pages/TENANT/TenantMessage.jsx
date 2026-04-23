import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../../useDarkMode.js';
import TenantSideBar from './TenantSideBar';
import TenantNavBar from './TenantNavBar';
import api from '../../../services/api.js';
import { showErrorToast, showSuccessToast } from '../../../utils/toast.jsx';
import {
  ChatBubbleLeftRightIcon, PaperAirplaneIcon, PaperClipIcon,
  XMarkIcon, CheckIcon, FaceSmileIcon, MagnifyingGlassIcon,
  BuildingOfficeIcon, ClockIcon
} from '@heroicons/react/24/outline';

// ── Typing dots ───────────────────────────────────────────────────────────────
const TypingIndicator = () => (
  <div className="flex justify-start mb-4 animate-fadeIn">
    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold mr-2">…</div>
    <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 rounded-bl-none">
      <div className="flex space-x-1">
        {[0, 0.1, 0.2].map((d, i) => (
          <div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
        ))}
      </div>
    </div>
  </div>
);

// ── Message bubble ────────────────────────────────────────────────────────────
const MessageBubble = ({ msg, darkMode }) => {
  const time = msg.createdAt
    ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className={`flex mb-4 ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
      {!msg.isOwn && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold mr-3 shadow-lg flex-shrink-0">
          {(msg.senderName || '?').charAt(0).toUpperCase()}
        </div>
      )}
      <div
        className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl
          ${msg.isOwn
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-md'
            : darkMode
              ? 'bg-gray-800 text-gray-100 rounded-bl-md border border-gray-700'
              : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
          }`}
      >
        {!msg.isOwn && (
          <p className={`text-xs font-semibold mb-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            {msg.senderName || (msg.role === 'landlord' ? 'Landlord' : 'Tenant')}
          </p>
        )}
        <p className="leading-relaxed">{msg.content}</p>
        <div className="flex items-center justify-between mt-2">
          <p className={`text-xs ${msg.isOwn ? 'text-blue-200' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {time}
          </p>
          {msg.isOwn && (
            <div className="flex items-center ml-2">
              <CheckIcon className="h-3 w-3 text-blue-200" />
              <CheckIcon className="h-3 w-3 text-blue-200 -ml-1" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Conversation list item ────────────────────────────────────────────────────
const ConversationItem = ({ inquiry, isActive, onClick, darkMode }) => {
  const name = inquiry.landlord?.name || inquiry.property?.postedBy?.name || 'Landlord';
  const property = inquiry.property?.title || 'Property';
  const lastReply = inquiry.replies?.length
    ? inquiry.replies[inquiry.replies.length - 1].content
    : inquiry.message;
  const time = new Date(inquiry.contactTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      onClick={onClick}
      className={`flex items-center p-4 border-b cursor-pointer transition-all duration-300
        ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'}
        ${isActive
          ? darkMode
            ? 'bg-gradient-to-r from-blue-900 to-purple-900 border-l-4 border-blue-500'
            : 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500'
          : ''
        }`}
    >
      <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg flex-shrink-0 ${isActive ? 'ring-4 ring-blue-300' : ''}`}>
        {name.charAt(0).toUpperCase()}
      </div>
      <div className="ml-3 flex-1 min-w-0">
        <div className="flex justify-between">
          <h3 className={`font-medium truncate ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{name}</h3>
          <span className={`text-xs flex-shrink-0 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{time}</span>
        </div>
        <p className={`text-xs flex items-center gap-1 mb-1 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
          <BuildingOfficeIcon className="h-3 w-3" />{property}
        </p>
        <p className={`text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{lastReply}</p>
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const TenantMessage = () => {
  const { darkMode } = useDarkMode();
  const location = useLocation();
  const navigate = useNavigate();

  const [inquiries, setInquiries] = useState([]);
  const [activeInquiry, setActiveInquiry] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimer = useRef(null);

  const emojis = ['😀', '😃', '😊', '😍', '🤔', '👍', '👎', '❤️', '🎉', '🔥', '💯', '🏠', '🔑', '💰'];

  // ── Load tenant inquiries on mount ──────────────────────────────────────────
  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setIsLoading(true);
        const data = await api.getTenantInquiries();
        setInquiries(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load inquiries:', err);
        showErrorToast('Failed to load conversations');
      } finally {
        setIsLoading(false);
      }
    };
    fetchInquiries();
  }, []);

  // ── Handle navigation state from TenantProperty "Contact Landlord" button ───
  useEffect(() => {
    // Only process when we are done loading the existing inquiries
    if (!location.state?.propertyId || isLoading) return;

    const { propertyId, propertyTitle, initialMessage } = location.state;
    const msg = initialMessage || `Hi, I am interested in ${propertyTitle || 'this property'}.`;

    const existing = inquiries.find(inq => {
      const pid = inq.property?._id || inq.property;
      return String(pid) === String(propertyId);
    });

    if (existing) {
      setActiveInquiry(existing);
      // Automatically send the interest message to the existing thread
      api.replyToInquiry(existing._id, msg)
        .then(savedReply => {
          setMessages(prev => [...prev, savedReply]);
          setInquiries(prev => prev.map(inq => 
            inq._id === existing._id 
              ? { ...inq, replies: [...(inq.replies || []), { content: msg, createdAt: new Date() }] } 
              : inq
          ));
          showSuccessToast(`Sent another message to ${propertyTitle || 'Landlord'}`);
        })
        .catch(err => {
          console.error('Failed to send follow-up inquiry:', err);
        })
        .finally(() => {
          navigate(location.pathname, { replace: true, state: {} });
        });
    } else {
      // create new thread
      const startInquiry = async () => {
        try {
          setIsSending(true);
          const created = await api.createInquiry({ propertyId, message: msg });
          setInquiries(prev => [created, ...prev]);
          setActiveInquiry(created);
          showSuccessToast(`Started conversation for ${propertyTitle || 'property'}`);
        } catch (err) {
          console.error('Failed to create inquiry:', err);
          showErrorToast('Could not start conversation');
        } finally {
          setIsSending(false);
          navigate(location.pathname, { replace: true, state: {} });
        }
      };
      startInquiry();
    }
  }, [location.state, inquiries, isLoading, navigate, location.pathname]);

  // ── Load messages when active inquiry changes ────────────────────────────────
  useEffect(() => {
    if (!activeInquiry) { setMessages([]); return; }
    const fetchMessages = async () => {
      try {
        const data = await api.getInquiryMessages(activeInquiry._id);
        setMessages(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load messages:', err);
        showErrorToast('Failed to load messages');
      }
    };
    fetchMessages();
  }, [activeInquiry]);

  // ── Auto-scroll on new messages ──────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Send a reply ─────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !activeInquiry || isSending) return;
    const text = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    // Optimistic update
    const optimistic = {
      _id:       `opt_${Date.now()}`,
      content:   text,
      isOwn:     true,
      role:      'tenant',
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      const saved = await api.replyToInquiry(activeInquiry._id, text);
      setMessages(prev => prev.map(m => m._id === optimistic._id ? saved : m));

      // Update last message preview in conversation list
      setInquiries(prev => prev.map(inq =>
        inq._id === activeInquiry._id
          ? { ...inq, replies: [...(inq.replies || []), { content: text, createdAt: new Date() }] }
          : inq
      ));
    } catch (err) {
      setMessages(prev => prev.filter(m => m._id !== optimistic._id));
      showErrorToast('Failed to send message');
      setNewMessage(text);
    } finally {
      setIsSending(false);
      setShowEmojiPicker(false);
    }
  }, [newMessage, activeInquiry, isSending]);

  const filteredInquiries = inquiries.filter(inq => {
    const name = (inq.landlord?.name || inq.property?.postedBy?.name || '').toLowerCase();
    const property = (inq.property?.title || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    return name.includes(term) || property.includes(term);
  });

  // ── Loading screen ───────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex h-screen">
        <TenantSideBar />
        <div className="flex flex-col flex-1" style={{ marginLeft: 'var(--sidebar-width, 4.5rem)' }}>
          <TenantNavBar currentSection="Messages" />
          <main className={`flex-1 flex items-center justify-center ${darkMode ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-blue-950' : 'bg-gradient-to-br from-blue-50 to-purple-50'}`}>
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto">
                <div className={`w-20 h-20 border-4 ${darkMode ? 'border-blue-900' : 'border-blue-200'} rounded-full animate-spin`} />
                <div className={`absolute inset-0 w-20 h-20 border-4 ${darkMode ? 'border-t-cyan-500' : 'border-t-blue-600'} rounded-full animate-spin`} />
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
      <div className="flex flex-col flex-1" style={{ marginLeft: 'var(--sidebar-width, 4.5rem)' }}>
        <TenantNavBar currentSection="Messages" />
        <main className="flex-1 flex h-full overflow-hidden">

          {/* ── Conversations list ── */}
          <div className={`w-1/3 border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex flex-col ${darkMode ? 'bg-slate-800/80' : 'bg-white/80'} backdrop-blur-sm`}>
            {/* Header */}
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
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 pl-12 text-white placeholder-white/70 focus:outline-none focus:ring-4 focus:ring-white/20"
                />
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-4 text-white/70" />
              </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {filteredInquiries.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <ChatBubbleLeftRightIcon className={`h-16 w-16 ${darkMode ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-4`} />
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} font-medium mb-2`}>No conversations yet</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Browse properties and click "Contact Landlord" to start a conversation
                  </p>
                </div>
              ) : (
                filteredInquiries.map(inq => (
                  <ConversationItem
                    key={inq._id}
                    inquiry={inq}
                    isActive={activeInquiry?._id === inq._id}
                    onClick={() => setActiveInquiry(inq)}
                    darkMode={darkMode}
                  />
                ))
              )}
            </div>
          </div>

          {/* ── Chat area ── */}
          <div className={`flex-1 flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
            {activeInquiry ? (
              <>
                {/* Chat header */}
                <div className={`p-4 border-b ${darkMode ? 'border-gray-700 bg-gradient-to-r from-gray-800 to-blue-900' : 'border-gray-200 bg-gradient-to-r from-white to-blue-50'}`}>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg mr-4">
                      {(activeInquiry.landlord?.name || activeInquiry.property?.postedBy?.name || 'L').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className={`font-semibold text-lg ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        {activeInquiry.landlord?.name || activeInquiry.property?.postedBy?.name || 'Landlord'}
                      </h3>
                      <p className={`text-sm flex items-center gap-1 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                        <BuildingOfficeIcon className="h-4 w-4" />
                        {activeInquiry.property?.title || 'Property'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className={`flex-1 overflow-y-auto p-6 ${darkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-white'} custom-scrollbar`}>
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <ChatBubbleLeftRightIcon className={`h-16 w-16 ${darkMode ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-4`} />
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => (
                      <MessageBubble key={msg._id || idx} msg={msg} darkMode={darkMode} />
                    ))
                  )}
                  {isTyping && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <div className={`p-4 border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                  {/* Emoji picker */}
                  {showEmojiPicker && (
                    <div className={`mb-4 p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border`}>
                      <div className="grid grid-cols-7 gap-2">
                        {emojis.map((emoji, idx) => (
                          <button
                            key={idx}
                            className={`p-2 text-xl ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-all hover:scale-125`}
                            onClick={() => { setNewMessage(prev => prev + emoji); setShowEmojiPicker(false); }}
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
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className={`w-full border-2 ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-200 placeholder-gray-500' : 'border-gray-200 bg-white text-gray-800 placeholder-gray-400'} rounded-2xl px-6 py-4 pr-16 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 resize-none`}
                        rows="1"
                        style={{ minHeight: '56px', maxHeight: '120px' }}
                        onKeyPress={e => {
                          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                        }}
                      />
                      <button
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-500 hover:text-yellow-400' : 'text-gray-400 hover:text-yellow-500'} transition-all hover:scale-110`}
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      >
                        <FaceSmileIcon className="h-6 w-6" />
                      </button>
                    </div>

                    {/* Attachment (UI only for now) */}
                    <input ref={fileInputRef} type="file" multiple className="hidden" />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-4 ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} rounded-2xl transition-all hover:scale-110`}
                    >
                      <PaperClipIcon className="h-6 w-6" />
                    </button>

                    {/* Send */}
                    <button
                      className={`p-4 rounded-2xl transition-all hover:scale-110 ${newMessage.trim()
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl'
                        : darkMode ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || isSending}
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
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center max-w-md`}>
                  Select a conversation from the list, or go to Properties and click "Contact Landlord" to start one.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: ${darkMode ? '#1e293b' : '#f1f5f9'}; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: linear-gradient(45deg,#3b82f6,#8b5cf6); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: linear-gradient(45deg,#2563eb,#7c3aed); }
        @keyframes fadeIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
      `}</style>
    </div>
  );
};

export default TenantMessage;