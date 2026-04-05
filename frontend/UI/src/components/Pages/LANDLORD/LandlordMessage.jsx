import React, { useState, useEffect, useRef, useMemo } from 'react';
import LandlordSideBar from './LandlordSideBar';
import LandlordNavBar from './LandlordNavBar';
import { showConfirmToast } from '../../../utils/toast.jsx';
import {
  MessageSquare, Send, Paperclip, MoreVertical, Search, Phone, Smile, File, Calendar, Archive, Trash2, Forward, Reply, Edit3, Download, Check, CheckCheck, AlertCircle, Pin, X, Volume2, VolumeX, Heart, ThumbsUp, Laugh, Angry, Frown, Meh, Bold, Italic, Wrench, CreditCard, FileText, Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Custom Hooks
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.error('Error saving to localStorage');
    }
  };

  return [storedValue, setValue];
};

// Animated Components
const AnimatedCard = ({ children, delay = 0, className = '', ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Message Component
const MessageBubble = ({ message, isOwn, showAvatar = true, onReact, onReply, onForward, onDelete }) => {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const reactions = [
    { emoji: '👍', icon: ThumbsUp, label: 'Like' },
    { emoji: '❤️', icon: Heart, label: 'Love' },
    { emoji: '😂', icon: Laugh, label: 'Laugh' },
    { emoji: '😮', icon: Meh, label: 'Wow' },
    { emoji: '😢', icon: Frown, label: 'Sad' },
    { emoji: '😡', icon: Angry, label: 'Angry' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex items-end space-x-3 mb-4 group ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-cyan-500 dark:to-cyan-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
        >
          {message.sender?.charAt(0) || 'T'}
        </motion.div>
      )}

      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'ml-auto' : ''}`}>
        {/* Message content */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`relative p-4 rounded-2xl shadow-lg ${isOwn
            ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-cyan-500 dark:to-cyan-600 text-white'
            : 'bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-indigo-200 dark:border-slate-700 text-indigo-700 dark:text-cyan-100'
            } ${message.isForwarded ? 'border-l-4 border-pink-400 dark:border-pink-500' : ''}`}
        >
          {/* Forwarded indicator */}
          {message.isForwarded && (
            <div className="flex items-center space-x-1 text-xs text-pink-400 dark:text-pink-300 mb-2">
              <Forward className="w-3 h-3" />
              <span>Forwarded</span>
            </div>
          )}

          {/* Reply indicator */}
          {message.replyTo && (
            <div className="bg-black/10 dark:bg-black/20 rounded-lg p-2 mb-3 border-l-2 border-indigo-300 dark:border-cyan-300">
              <div className="text-xs text-indigo-600 dark:text-cyan-200">{message.replyTo.sender}</div>
              <div className="text-sm text-indigo-700 dark:text-cyan-100 truncate">{message.replyTo.content}</div>
            </div>
          )}

          {/* Message content */}
          <div className="space-y-2">
            {message.content && (
              <p className="text-sm leading-relaxed">{message.content}</p>
            )}

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="space-y-2">
                {message.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-black/10 dark:bg-black/20 rounded-lg">
                    {attachment.type === 'image' ? (
                      <div className="relative">
                        <img
                          src={attachment.url}
                          alt={attachment.name}
                          className="max-w-48 max-h-32 rounded-lg object-cover cursor-pointer"
                          onClick={() => window.open(attachment.url, '_blank')}
                        />
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Download className="w-3 h-3" />
                        </motion.button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 flex-1">
                        <File className="w-5 h-5 text-indigo-400 dark:text-cyan-400" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{attachment.name}</div>
                          <div className="text-xs text-indigo-600 dark:text-cyan-200">{attachment.size}</div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1 hover:bg-indigo-100 dark:hover:bg-cyan-500/20 rounded"
                        >
                          <Download className="w-4 h-4" />
                        </motion.button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Quick actions for property-related messages */}
            {message.propertyActions && (
              <div className="flex flex-wrap gap-2 mt-3">
                {message.propertyActions.map((action, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1 bg-indigo-100 dark:bg-cyan-500/20 text-indigo-700 dark:text-cyan-300 rounded-full text-xs font-medium hover:bg-indigo-200 dark:hover:bg-cyan-500/30 transition-colors"
                  >
                    {action.label}
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Message metadata */}
          <div className={`flex items-center justify-between mt-3 text-xs ${isOwn ? 'text-white/70' : 'text-gray-500 dark:text-blue-300'
            }`}>
            <span>{message.time}</span>
            <div className="flex items-center space-x-1">
              {message.edited && <Edit3 className="w-3 h-3" />}
              {message.priority === 'high' && <AlertCircle className="w-3 h-3 text-red-400" />}
              {message.pinned && <Pin className="w-3 h-3 text-pink-400 dark:text-pink-300" />}
              {isOwn && (
                <div className="flex items-center">
                  {message.status === 'sent' && <Check className="w-3 h-3" />}
                  {message.status === 'delivered' && <CheckCheck className="w-3 h-3" />}
                  {message.status === 'read' && <CheckCheck className="w-3 h-3 text-indigo-400 dark:text-cyan-400" />}
                </div>
              )}
            </div>
          </div>

          {/* Reactions */}
          {message.reactions && Object.keys(message.reactions).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {Object.entries(message.reactions).map(([emoji, count]) => (
                <motion.button
                  key={emoji}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex items-center space-x-1 px-2 py-1 bg-indigo-100 dark:bg-cyan-500/20 rounded-full text-xs"
                  onClick={() => onReact(message.id, emoji)}
                >
                  <span>{emoji}</span>
                  <span>{count}</span>
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick actions */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`flex items-center space-x-2 mt-2 ${isOwn ? 'justify-end' : ''}`}
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowReactions(!showReactions)}
                className="p-2 bg-white/80 dark:bg-slate-700/80 rounded-full hover:bg-white dark:hover:bg-slate-600 transition-colors"
              >
                <Smile className="w-4 h-4 text-indigo-600 dark:text-cyan-300" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onReply(message)}
                className="p-2 bg-white/80 dark:bg-slate-700/80 rounded-full hover:bg-white dark:hover:bg-slate-600 transition-colors"
              >
                <Reply className="w-4 h-4 text-indigo-600 dark:text-cyan-300" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onForward(message)}
                className="p-2 bg-white/80 dark:bg-slate-700/80 rounded-full hover:bg-white dark:hover:bg-slate-600 transition-colors"
              >
                <Forward className="w-4 h-4 text-indigo-600 dark:text-cyan-300" />
              </motion.button>
              {isOwn && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onDelete(message.id)}
                  className="p-2 bg-red-500/20 rounded-full hover:bg-red-500/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reaction picker */}
        <AnimatePresence>
          {showReactions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="flex items-center space-x-2 mt-2 p-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-full border border-indigo-200 dark:border-slate-700"
            >
              {reactions.map(({ emoji, label }) => (
                <motion.button
                  key={emoji}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    onReact(message.id, emoji);
                    setShowReactions(false);
                  }}
                  className="p-2 hover:bg-indigo-100 dark:hover:bg-cyan-500/20 rounded-full transition-colors"
                  title={label}
                >
                  <span className="text-lg">{emoji}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Conversation List Item
const ConversationItem = ({ conversation, isActive, onClick, onArchive, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <motion.div
      whileHover={{ scale: 1.02, x: 5 }}
      onClick={onClick}
      className={`relative p-4 rounded-xl cursor-pointer transition-all duration-200 group ${isActive
        ? 'bg-gradient-to-r from-indigo-500/20 to-indigo-600/20 dark:from-cyan-500/20 dark:to-cyan-600/20 border border-indigo-500/30 dark:border-cyan-500/30'
        : 'hover:bg-indigo-50 dark:hover:bg-slate-800/50 border border-transparent'
        }`}
    >
      <div className="flex items-center space-x-3">
        {/* Avatar */}
        <div className="relative">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-cyan-500 dark:to-cyan-600 flex items-center justify-center text-white font-semibold flex-shrink-0"
          >
            {conversation.avatar || conversation.name?.charAt(0) || 'T'}
          </motion.div>
          {conversation.online && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800"></div>
          )}
          {conversation.unread > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 dark:bg-pink-400 rounded-full flex items-center justify-center text-xs text-white font-bold"
            >
              {conversation.unread > 99 ? '99+' : conversation.unread}
            </motion.div>
          )}
        </div>

        {/* Conversation info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`font-semibold truncate ${isActive ? 'text-indigo-700 dark:text-cyan-100' : 'text-indigo-700 dark:text-cyan-100'
              }`}>
              {conversation.name}
              {conversation.isPinned && <Pin className="w-3 h-3 inline ml-1 text-pink-400 dark:text-pink-300" />}
              {conversation.isMuted && <VolumeX className="w-3 h-3 inline ml-1 text-gray-400 dark:text-gray-500" />}
            </h3>
            <div className="flex items-center space-x-1">
              <span className={`text-xs ${conversation.unread > 0 ? 'text-indigo-600 dark:text-cyan-300 font-medium' : 'text-gray-500 dark:text-blue-300'
                }`}>
                {conversation.time}
              </span>
              {conversation.priority === 'high' && (
                <AlertCircle className="w-3 h-3 text-red-400" />
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className={`text-sm truncate ${conversation.unread > 0 ? 'text-indigo-600 dark:text-cyan-200 font-medium' : 'text-gray-600 dark:text-blue-200'
              }`}>
              {conversation.lastMessage}
            </p>

            {/* Typing indicator */}
            {conversation.isTyping && (
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                    className="w-1 h-1 bg-indigo-400 dark:bg-cyan-400 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                    className="w-1 h-1 bg-indigo-400 dark:bg-cyan-400 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                    className="w-1 h-1 bg-indigo-400 dark:bg-cyan-400 rounded-full"
                  />
                </div>
                <span className="text-xs text-indigo-400 dark:text-cyan-400">typing...</span>
              </div>
            )}
          </div>

          {/* Property info */}
          {conversation.property && (
            <div className="flex items-center space-x-1 mt-1">
              <Building2 className="w-3 h-3 text-pink-400 dark:text-pink-300" />
              <span className="text-xs text-pink-400 dark:text-pink-300">{conversation.property}</span>
            </div>
          )}
        </div>

        {/* Menu button */}
        <div className="relative" ref={menuRef}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 rounded-lg hover:bg-indigo-100 dark:hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="w-4 h-4 text-indigo-600 dark:text-cyan-300" />
          </motion.button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 top-full mt-2 w-48 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-indigo-200 dark:border-slate-700 rounded-xl shadow-xl z-50"
              >
                <div className="p-2">
                  <button
                    onClick={() => {
                      // Toggle pin
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-slate-700 transition-colors text-indigo-700 dark:text-cyan-100"
                  >
                    <Pin className="w-4 h-4" />
                    <span>{conversation.isPinned ? 'Unpin' : 'Pin'} Chat</span>
                  </button>
                  <button
                    onClick={() => {
                      // Toggle mute
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-slate-700 transition-colors text-indigo-700 dark:text-cyan-100"
                  >
                    {conversation.isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    <span>{conversation.isMuted ? 'Unmute' : 'Mute'}</span>
                  </button>
                  <button
                    onClick={() => {
                      onArchive(conversation.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-slate-700 transition-colors text-indigo-700 dark:text-cyan-100"
                  >
                    <Archive className="w-4 h-4" />
                    <span>Archive</span>
                  </button>
                  <button
                    onClick={() => {
                      onDelete(conversation.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-red-500/20 transition-colors text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

// Message Input Component
const MessageInput = ({ onSend, onTyping, replyTo, onCancelReply, placeholder = "Type your message..." }) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const templates = [
    {
      title: "Rent Reminder",
      content: "Hi! This is a friendly reminder that your rent payment is due on {date}. Please let me know if you have any questions.",
      category: "Payment"
    },
    {
      title: "Maintenance Update",
      content: "I wanted to update you on the maintenance request you submitted. We have scheduled the repair for {date} between {time}.",
      category: "Maintenance"
    },
    {
      title: "Property Inspection",
      content: "We will be conducting a routine property inspection on {date}. Please let me know if this time works for you.",
      category: "Inspection"
    },
    {
      title: "Welcome Message",
      content: "Welcome to your new home! Please don't hesitate to reach out if you have any questions or concerns.",
      category: "General"
    },
    {
      title: "Lease Renewal",
      content: "Your lease is coming up for renewal. Let's schedule a time to discuss the terms for the upcoming year.",
      category: "Lease"
    }
  ];

  const quickActions = [
    { label: "Schedule Inspection", icon: Calendar, action: "inspection" },
    { label: "Send Payment Link", icon: CreditCard, action: "payment" },
    { label: "Maintenance Request", icon: Wrench, action: "maintenance" },
    { label: "Property Rules", icon: FileText, action: "rules" },
    { label: "Emergency Contact", icon: Phone, action: "emergency" }
  ];

  const emojis = ['😊', '👍', '❤️', '😂', '😢', '🔥', '👌', '🎉', '💯', '🏠', '🔧', '💰', '📅', '📞', '✅', '❌', '⚠️', '🚨'];

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() || attachments.length > 0) {
      onSend({
        content: message.trim(),
        attachments,
        replyTo: replyTo?.id,
        formatting: {
          bold: isBold,
          italic: isItalic
        }
      });
      setMessage('');
      setAttachments([]);
      if (replyTo) onCancelReply();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      type: file.type.startsWith('image/') ? 'image' : 'file',
      url: URL.createObjectURL(file),
      file
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const insertTemplate = (template) => {
    setMessage(template.content);
    setShowTemplates(false);
  };

  const handleQuickAction = (action) => {
    const actionMessages = {
      inspection: "I'd like to schedule a property inspection. When would be a good time for you?",
      payment: "Here's your payment portal link: [Payment Link]. Let me know if you need any assistance.",
      maintenance: "Please describe the maintenance issue you're experiencing, and I'll arrange for repairs.",
      rules: "Please review the property rules and regulations attached. Let me know if you have any questions.",
      emergency: "For emergencies, please call: [Emergency Number]. For non-urgent matters, continue messaging here."
    };
    setMessage(actionMessages[action] || '');
  };

  return (
    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-indigo-200 dark:border-slate-700 rounded-2xl p-4 space-y-4">
      {/* Reply indicator */}
      {replyTo && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-cyan-500/10 rounded-lg border-l-4 border-indigo-500 dark:border-cyan-400"
        >
          <div className="flex-1">
            <div className="text-sm text-indigo-600 dark:text-cyan-400 font-medium">Replying to {replyTo.sender}</div>
            <div className="text-sm text-gray-600 dark:text-blue-200 truncate">{replyTo.content}</div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onCancelReply}
            className="p-1 hover:bg-indigo-100 dark:hover:bg-cyan-500/20 rounded"
          >
            <X className="w-4 h-4 text-indigo-600 dark:text-cyan-300" />
          </motion.button>
        </motion.div>
      )}

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((attachment) => (
            <motion.div
              key={attachment.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group"
            >
              {attachment.type === 'image' ? (
                <div className="relative">
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeAttachment(attachment.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </motion.button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 p-2 bg-indigo-50 dark:bg-slate-700 rounded-lg pr-8">
                  <File className="w-5 h-5 text-indigo-400 dark:text-cyan-400" />
                  <div>
                    <div className="text-sm font-medium text-indigo-700 dark:text-cyan-100 truncate max-w-20">{attachment.name}</div>
                    <div className="text-xs text-gray-500 dark:text-blue-300">{attachment.size}</div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeAttachment(attachment.id)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </motion.button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        {quickActions.map((action) => (
          <motion.button
            key={action.action}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleQuickAction(action.action)}
            className="flex items-center space-x-1 px-3 py-1 bg-indigo-100 dark:bg-cyan-500/20 rounded-full text-xs text-indigo-700 dark:text-cyan-300 hover:bg-indigo-200 dark:hover:bg-cyan-500/30 transition-colors"
          >
            <action.icon className="w-3 h-3" />
            <span>{action.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Message input area */}
      <div className="relative">
        <div className="flex items-end space-x-3">
          {/* Toolbar */}
          <div className="flex flex-col space-y-2">
            {/* Attachment button */}
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-indigo-100 dark:bg-slate-700 rounded-lg hover:bg-indigo-200 dark:hover:bg-slate-600 transition-colors"
              >
                <Paperclip className="w-5 h-5 text-indigo-600 dark:text-cyan-300" />
              </motion.button>
            </div>

            {/* Templates button */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowTemplates(!showTemplates)}
                className="p-2 bg-indigo-100 dark:bg-slate-700 rounded-lg hover:bg-indigo-200 dark:hover:bg-slate-600 transition-colors"
              >
                <FileText className="w-5 h-5 text-indigo-600 dark:text-cyan-300" />
              </motion.button>

              <AnimatePresence>
                {showTemplates && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute bottom-full mb-2 left-0 w-80 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-indigo-200 dark:border-slate-700 rounded-xl shadow-xl z-50"
                  >
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-indigo-700 dark:text-cyan-100 mb-3">Message Templates</h3>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {templates.map((template, index) => (
                          <motion.button
                            key={index}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => insertTemplate(template)}
                            className="w-full text-left p-3 rounded-lg hover:bg-indigo-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            <div className="text-sm font-medium text-indigo-700 dark:text-cyan-100">{template.title}</div>
                            <div className="text-xs text-gray-600 dark:text-blue-300 mt-1">{template.category}</div>
                            <div className="text-xs text-gray-500 dark:text-blue-200 mt-1 line-clamp-2">{template.content}</div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Emoji button */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowEmoji(!showEmoji)}
                className="p-2 bg-indigo-100 dark:bg-slate-700 rounded-lg hover:bg-indigo-200 dark:hover:bg-slate-600 transition-colors"
              >
                <Smile className="w-5 h-5 text-indigo-600 dark:text-cyan-300" />
              </motion.button>

              <AnimatePresence>
                {showEmoji && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute bottom-full mb-2 left-0 w-64 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-indigo-200 dark:border-slate-700 rounded-xl shadow-xl z-50"
                  >
                    <div className="p-4">
                      <div className="grid grid-cols-6 gap-2">
                        {emojis.map((emoji, index) => (
                          <motion.button
                            key={index}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setMessage(prev => prev + emoji);
                              setShowEmoji(false);
                            }}
                            className="p-2 hover:bg-indigo-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-lg"
                          >
                            {emoji}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Text input */}
          <div className="flex-1 relative">
            {/* Formatting toolbar */}
            <div className="flex items-center space-x-2 mb-2 opacity-50 hover:opacity-100 transition-opacity">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsBold(!isBold)}
                className={`p-1 rounded ${isBold ? 'bg-indigo-500 dark:bg-cyan-500 text-white' : 'hover:bg-indigo-100 dark:hover:bg-slate-700'}`}
              >
                <Bold className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsItalic(!isItalic)}
                className={`p-1 rounded ${isItalic ? 'bg-indigo-500 dark:bg-cyan-500 text-white' : 'hover:bg-indigo-100 dark:hover:bg-slate-700'}`}
              >
                <Italic className="w-4 h-4" />
              </motion.button>
            </div>

            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                onTyping?.();
              }}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className={`w-full p-3 bg-indigo-50 dark:bg-slate-700 border border-indigo-200 dark:border-slate-600 rounded-xl text-indigo-700 dark:text-cyan-100 placeholder-gray-500 dark:placeholder-blue-300 focus:border-indigo-500 dark:focus:border-cyan-400 focus:outline-none transition-colors resize-none ${isBold ? 'font-bold' : ''
                } ${isItalic ? 'italic' : ''}`}
              rows={1}
              style={{ minHeight: '48px' }}
            />
          </div>

          {/* Send/Record button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={message.trim() || attachments.length > 0 ? handleSend : undefined}
            disabled={!message.trim() && attachments.length === 0}
            className={`p-3 rounded-xl font-semibold transition-all duration-300 ${message.trim() || attachments.length > 0
              ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-cyan-500 dark:to-cyan-600 text-white hover:from-indigo-600 hover:to-indigo-700 dark:hover:from-cyan-600 dark:hover:to-cyan-700 shadow-lg'
              : 'bg-indigo-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

// Main Component
const LandlordMessage = () => {
  const [currentSection] = useState('Messages');
  const sidebarWidthClass = '[margin-left:var(--sidebar-width,18rem)]';
  const [conversations, setConversations] = useLocalStorage('landlord_conversations', [
    {
      id: 1,
      name: "John Doe",
      avatar: "JD",
      lastMessage: "Hi, when can we schedule the apartment viewing?",
      time: "10:30 AM",
      unread: 2,
      online: true,
      property: "Modern Downtown Loft",
      isPinned: false,
      isMuted: false,
      isTyping: false,
      priority: 'normal'
    },
    {
      id: 2,
      name: "Jane Smith",
      avatar: "JS",
      lastMessage: "Thank you for fixing the plumbing issue so quickly!",
      time: "Yesterday",
      unread: 0,
      online: false,
      property: "Luxury Penthouse",
      isPinned: true,
      isMuted: false,
      isTyping: false,
      priority: 'normal'
    },
    {
      id: 3,
      name: "Robert Johnson",
      avatar: "RJ",
      lastMessage: "The rent payment has been submitted successfully.",
      time: "2 days ago",
      unread: 0,
      online: true,
      property: "Cozy Studio Apartment",
      isPinned: false,
      isMuted: false,
      isTyping: true,
      priority: 'high'
    },
    {
      id: 4,
      name: "Emily Davis",
      avatar: "ED",
      lastMessage: "Could you please send me the lease renewal documents?",
      time: "1 week ago",
      unread: 1,
      online: false,
      property: "Garden View Apartment",
      isPinned: false,
      isMuted: false,
      isTyping: false,
      priority: 'normal'
    }
  ]);

  const [messages, setMessages] = useLocalStorage('landlord_messages', [
    {
      id: 1,
      conversationId: 1,
      sender: "John Doe",
      content: "Hi, when can we schedule the apartment viewing?",
      time: "10:30 AM",
      isOwn: false,
      status: "read",
      attachments: [],
      reactions: {},
      isForwarded: false,
      replyTo: null,
      edited: false,
      pinned: false,
      priority: 'normal'
    },
    {
      id: 2,
      conversationId: 1,
      sender: "You",
      content: "Hi John! I'm available this Saturday at 2 PM or Sunday at 11 AM. Which works better for you?",
      time: "10:32 AM",
      isOwn: true,
      status: "read",
      attachments: [],
      reactions: { '👍': 1 },
      isForwarded: false,
      replyTo: null,
      edited: false,
      pinned: false,
      priority: 'normal',
      propertyActions: [
        { label: "Schedule Viewing", action: "schedule" },
        { label: "Property Details", action: "details" }
      ]
    },
    {
      id: 3,
      conversationId: 1,
      sender: "John Doe",
      content: "Saturday at 2 PM works perfectly! Should I bring anything specific?",
      time: "10:35 AM",
      isOwn: false,
      status: "read",
      attachments: [],
      reactions: {},
      isForwarded: false,
      replyTo: { id: 2, sender: "You", content: "Hi John! I'm available this Saturday..." },
      edited: false,
      pinned: false,
      priority: 'normal'
    }
  ]);

  const [activeConversation, setActiveConversation] = useState(conversations[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [replyTo, setReplyTo] = useState(null);
  const messagesEndRef = useRef(null);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => {
      const matchesSearch = conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' ||
        (filterStatus === 'unread' && conv.unread > 0) ||
        (filterStatus === 'pinned' && conv.isPinned) ||
        (filterStatus === 'online' && conv.online);
      return matchesSearch && matchesFilter;
    });
  }, [conversations, searchTerm, filterStatus]);

  // Get messages for active conversation
  const activeMessages = useMemo(() => {
    return messages.filter(msg => msg.conversationId === activeConversation?.id) || [];
  }, [messages, activeConversation]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  // Handle sending messages
  const handleSendMessage = (messageData) => {
    const newMessage = {
      id: Date.now(),
      conversationId: activeConversation.id,
      sender: "You",
      content: messageData.content,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
      status: "sent",
      attachments: messageData.attachments || [],
      reactions: {},
      isForwarded: false,
      replyTo: messageData.replyTo ? activeMessages.find(m => m.id === messageData.replyTo) : null,
      edited: false,
      pinned: false,
      priority: 'normal',
      formatting: messageData.formatting
    };

    setMessages(prev => [...prev, newMessage]);

    // Update last message in conversation
    setConversations(prev => prev.map(conv =>
      conv.id === activeConversation.id
        ? { ...conv, lastMessage: messageData.content, time: "now" }
        : conv
    ));

    // Simulate message delivery
    setTimeout(() => {
      setMessages(prev => prev.map(msg =>
        msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg
      ));
    }, 1000);

    // Simulate message read
    setTimeout(() => {
      setMessages(prev => prev.map(msg =>
        msg.id === newMessage.id ? { ...msg, status: "read" } : msg
      ));
    }, 3000);
  };

  // Handle message reactions
  const handleReaction = (messageId, emoji) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = { ...msg.reactions };
        if (reactions[emoji]) {
          delete reactions[emoji];
        } else {
          reactions[emoji] = 1;
        }
        return { ...msg, reactions };
      }
      return msg;
    }));
  };

  // Handle typing indicator
  const handleTyping = () => {
    // Simulate typing indicator for the active conversation
    console.log('User is typing...');
  };

  // Handle reply
  const handleReply = (message) => {
    setReplyTo(message);
  };

  // Handle forward
  const handleForward = (message) => {
    // Implement forward functionality
    console.log('Forward message:', message);
  };

  // Handle delete message
  const handleDeleteMessage = (messageId) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  // Handle archive conversation
  const handleArchiveConversation = (conversationId) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    if (activeConversation?.id === conversationId) {
      setActiveConversation(conversations[0]);
    }
  };

  // Handle delete conversation
  const handleDeleteConversation = (conversationId) => {
    showConfirmToast(
      'Are you sure you want to delete this conversation?',
      () => {
        setConversations(prev => prev.filter(conv => conv.id !== conversationId));
        setMessages(prev => prev.filter(msg => msg.conversationId !== conversationId));
        if (activeConversation?.id === conversationId) {
          setActiveConversation(conversations[0]);
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-slate-900 dark:to-blue-950 flex relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-indigo-300/20 to-pink-300/20 dark:from-cyan-500/10 dark:to-blue-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360, scale: [1.1, 1, 1.1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-300/20 to-indigo-300/20 dark:from-blue-500/10 dark:to-cyan-500/10 rounded-full blur-3xl"
        />
      </div>

      <LandlordSideBar currentSection={currentSection} />

      <div className={`flex-1 flex flex-col relative z-10 ${sidebarWidthClass} transition-all duration-700`}>
        <LandlordNavBar currentSection={currentSection} />

        <main className="flex-1 overflow-hidden">
          <div className="h-full flex">
            {/* Conversations Sidebar */}
            <div className="w-80 bg-white/70 dark:bg-slate-800/50 backdrop-blur-xl border-r border-indigo-200 dark:border-slate-700 flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-indigo-200 dark:border-slate-700">
                <motion.h1
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold text-indigo-700 dark:text-cyan-100 mb-4"
                >
                  Messages
                </motion.h1>

                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-blue-300" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-indigo-50 dark:bg-slate-700 border border-indigo-200 dark:border-slate-600 rounded-xl text-indigo-700 dark:text-cyan-100 placeholder-gray-500 dark:placeholder-blue-300 focus:border-indigo-500 dark:focus:border-cyan-400 focus:outline-none transition-colors"
                  />
                </div>

                {/* Filter tabs */}
                <div className="flex space-x-2">
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'unread', label: 'Unread' },
                    { key: 'pinned', label: 'Pinned' },
                    { key: 'online', label: 'Online' }
                  ].map(({ key, label }) => (
                    <motion.button
                      key={key}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFilterStatus(key)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${filterStatus === key
                        ? 'bg-indigo-500 dark:bg-cyan-500 text-white'
                        : 'bg-indigo-100 dark:bg-slate-700 text-indigo-700 dark:text-cyan-200 hover:bg-indigo-200 dark:hover:bg-slate-600'
                        }`}
                    >
                      {label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <AnimatePresence>
                  {filteredConversations.map((conversation, index) => (
                    <motion.div
                      key={conversation.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ConversationItem
                        conversation={conversation}
                        isActive={activeConversation?.id === conversation.id}
                        onClick={() => setActiveConversation(conversation)}
                        onArchive={handleArchiveConversation}
                        onDelete={handleDeleteConversation}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {filteredConversations.length === 0 && (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No conversations found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {activeConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-6 bg-white/70 dark:bg-slate-800/50 backdrop-blur-xl border-b border-indigo-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="relative"
                        >
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-cyan-500 dark:to-cyan-600 flex items-center justify-center text-white font-semibold">
                            {activeConversation.avatar || activeConversation.name?.charAt(0)}
                          </div>
                          {activeConversation.online && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                          )}
                        </motion.div>

                        <div>
                          <h2 className="text-xl font-bold text-indigo-700 dark:text-cyan-100 flex items-center space-x-2">
                            <span>{activeConversation.name}</span>
                            {activeConversation.isPinned && <Pin className="w-4 h-4 text-pink-400 dark:text-pink-300" />}
                            {activeConversation.isMuted && <VolumeX className="w-4 h-4 text-gray-400" />}
                          </h2>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-blue-200">
                            <span className={activeConversation.online ? 'text-emerald-500' : ''}>
                              {activeConversation.online ? 'Online' : 'Last seen 2 hours ago'}
                            </span>
                            {activeConversation.property && (
                              <>
                                <span>•</span>
                                <div className="flex items-center space-x-1">
                                  <Building2 className="w-3 h-3" />
                                  <span>{activeConversation.property}</span>
                                </div>
                              </>
                            )}
                          </div>
                          {activeConversation.isTyping && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex items-center space-x-1 text-sm text-indigo-400 dark:text-cyan-400"
                            >
                              <div className="flex space-x-1">
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                                  className="w-1 h-1 bg-indigo-400 dark:bg-cyan-400 rounded-full"
                                />
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                                  className="w-1 h-1 bg-indigo-400 dark:bg-cyan-400 rounded-full"
                                />
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                                  className="w-1 h-1 bg-indigo-400 dark:bg-cyan-400 rounded-full"
                                />
                              </div>
                              <span>typing...</span>
                            </motion.div>
                          )}
                        </div>
                      </div>


                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <AnimatePresence>
                      {activeMessages.map((message, index) => (
                        <MessageBubble
                          key={message.id}
                          message={message}
                          isOwn={message.isOwn}
                          showAvatar={!message.isOwn && (index === 0 || activeMessages[index - 1]?.isOwn)}
                          onReact={handleReaction}
                          onReply={handleReply}
                          onForward={handleForward}
                          onDelete={handleDeleteMessage}
                        />
                      ))}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-6 bg-white/70 dark:bg-slate-800/50 backdrop-blur-xl border-t border-indigo-200 dark:border-slate-700">
                    <MessageInput
                      onSend={handleSendMessage}
                      onTyping={handleTyping}
                      replyTo={replyTo}
                      onCancelReply={() => setReplyTo(null)}
                      placeholder={`Message ${activeConversation.name}...`}
                    />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="w-20 h-20 mx-auto text-gray-400 dark:text-gray-600 mb-6" />
                    <h3 className="text-2xl font-bold text-indigo-700 dark:text-cyan-100 mb-4">Select a Conversation</h3>
                    <p className="text-gray-600 dark:text-blue-200">Choose a conversation from the sidebar to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LandlordMessage;