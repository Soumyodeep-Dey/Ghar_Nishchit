import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import LandlordSideBar from './LandlordSideBar';
import LandlordNavBar from './LandlordNavBar';
import { showConfirmToast } from '../../../utils/toast.jsx';
import api from '../../../services/api.js';
import {
  MessageSquare, Send, Paperclip, MoreVertical, Search, Phone,
  Smile, File, Calendar, Archive, Trash2, Forward, Reply, Edit3,
  Download, Check, CheckCheck, AlertCircle, Pin, X, Volume2, VolumeX,
  Heart, ThumbsUp, Laugh, Angry, Frown, Meh, Bold, Italic,
  Wrench, CreditCard, FileText, Building2, CalendarCheck, CalendarX,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ───────────────────────────────────────────────────────────────
// MessageBubble
// ───────────────────────────────────────────────────────────────
const MessageBubble = ({ message, isOwn, showAvatar = true, onReact, onReply, onForward, onDelete }) => {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const reactions = [
    { emoji: '\uD83D\uDC4D', label: 'Like' },
    { emoji: '\u2764\uFE0F', label: 'Love' },
    { emoji: '\uD83D\uDE02', label: 'Laugh' },
    { emoji: '\uD83D\uDE2E', label: 'Wow' },
    { emoji: '\uD83D\uDE22', label: 'Sad' },
    { emoji: '\uD83D\uDE21', label: 'Angry' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex items-end space-x-3 mb-4 group ${
        isOwn ? 'flex-row-reverse space-x-reverse' : ''
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {showAvatar && !isOwn && (
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-cyan-500 dark:to-cyan-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
        >
          {message.sender?.charAt(0) || 'T'}
        </motion.div>
      )}

      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'ml-auto' : ''}`}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`relative p-4 rounded-2xl shadow-lg ${
            isOwn
              ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-cyan-500 dark:to-cyan-600 text-white'
              : 'bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-indigo-200 dark:border-slate-700 text-indigo-700 dark:text-cyan-100'
          } ${message.isForwarded ? 'border-l-4 border-pink-400 dark:border-pink-500' : ''}`}
        >
          {message.isForwarded && (
            <div className="flex items-center space-x-1 text-xs text-pink-400 dark:text-pink-300 mb-2">
              <Forward className="w-3 h-3" />
              <span>Forwarded</span>
            </div>
          )}

          {message.replyTo && (
            <div className="bg-black/10 dark:bg-black/20 rounded-lg p-2 mb-3 border-l-2 border-indigo-300 dark:border-cyan-300">
              <div className="text-xs text-indigo-600 dark:text-cyan-200">{message.replyTo.sender}</div>
              <div className="text-sm text-indigo-700 dark:text-cyan-100 truncate">{message.replyTo.content}</div>
            </div>
          )}

          <div className="space-y-2">
            {message.content && <p className="text-sm leading-relaxed">{message.content}</p>}

            {message.attachments?.length > 0 && (
              <div className="space-y-2">
                {message.attachments.map((att, idx) => (
                  <div key={idx} className="flex items-center space-x-2 p-2 bg-black/10 dark:bg-black/20 rounded-lg">
                    {att.type === 'image' ? (
                      <img src={att.url} alt={att.name} className="max-w-48 max-h-32 rounded-lg object-cover cursor-pointer" onClick={() => window.open(att.url, '_blank')} />
                    ) : (
                      <div className="flex items-center space-x-2 flex-1">
                        <File className="w-5 h-5 text-indigo-400 dark:text-cyan-400" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{att.name}</div>
                          <div className="text-xs text-indigo-600 dark:text-cyan-200">{att.size}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {message.propertyActions && (
              <div className="flex flex-wrap gap-2 mt-3">
                {message.propertyActions.map((action, idx) => (
                  <motion.button key={idx} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="px-3 py-1 bg-indigo-100 dark:bg-cyan-500/20 text-indigo-700 dark:text-cyan-300 rounded-full text-xs font-medium hover:bg-indigo-200 dark:hover:bg-cyan-500/30 transition-colors"
                  >{action.label}</motion.button>
                ))}
              </div>
            )}
          </div>

          <div className={`flex items-center justify-between mt-3 text-xs ${
            isOwn ? 'text-white/70' : 'text-gray-500 dark:text-blue-300'
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

          {message.reactions && Object.keys(message.reactions).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {Object.entries(message.reactions).map(([emoji, count]) => (
                <motion.button key={emoji} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  className="flex items-center space-x-1 px-2 py-1 bg-indigo-100 dark:bg-cyan-500/20 rounded-full text-xs"
                  onClick={() => onReact(message.id, emoji)}
                >
                  <span>{emoji}</span><span>{count}</span>
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {showActions && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
              className={`flex items-center space-x-2 mt-2 ${isOwn ? 'justify-end' : ''}`}
            >
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => setShowReactions(!showReactions)}
                className="p-2 bg-white/80 dark:bg-slate-700/80 rounded-full hover:bg-white dark:hover:bg-slate-600 transition-colors"
              ><Smile className="w-4 h-4 text-indigo-600 dark:text-cyan-300" /></motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => onReply(message)}
                className="p-2 bg-white/80 dark:bg-slate-700/80 rounded-full hover:bg-white dark:hover:bg-slate-600 transition-colors"
              ><Reply className="w-4 h-4 text-indigo-600 dark:text-cyan-300" /></motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => onForward(message)}
                className="p-2 bg-white/80 dark:bg-slate-700/80 rounded-full hover:bg-white dark:hover:bg-slate-600 transition-colors"
              ><Forward className="w-4 h-4 text-indigo-600 dark:text-cyan-300" /></motion.button>
              {isOwn && (
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => onDelete(message.id)}
                  className="p-2 bg-red-500/20 rounded-full hover:bg-red-500/30 transition-colors"
                ><Trash2 className="w-4 h-4 text-red-400" /></motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showReactions && (
            <motion.div initial={{ opacity: 0, scale: 0.8, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="flex items-center space-x-2 mt-2 p-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-full border border-indigo-200 dark:border-slate-700"
            >
              {reactions.map(({ emoji, label }) => (
                <motion.button key={emoji} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
                  onClick={() => { onReact(message.id, emoji); setShowReactions(false); }}
                  className="p-2 hover:bg-indigo-100 dark:hover:bg-cyan-500/20 rounded-full transition-colors" title={label}
                ><span className="text-lg">{emoji}</span></motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ───────────────────────────────────────────────────────────────
// ConversationItem
// ───────────────────────────────────────────────────────────────
const ConversationItem = ({ conversation, isActive, onClick, onArchive, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <motion.div whileHover={{ scale: 1.02, x: 5 }} onClick={onClick}
      className={`relative p-4 rounded-xl cursor-pointer transition-all duration-200 group ${
        isActive
          ? 'bg-gradient-to-r from-indigo-500/20 to-indigo-600/20 dark:from-cyan-500/20 dark:to-cyan-600/20 border border-indigo-500/30 dark:border-cyan-500/30'
          : 'hover:bg-indigo-50 dark:hover:bg-slate-800/50 border border-transparent'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <motion.div whileHover={{ scale: 1.1 }}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-cyan-500 dark:to-cyan-600 flex items-center justify-center text-white font-semibold flex-shrink-0"
          >
            {conversation.avatar || conversation.name?.charAt(0) || 'T'}
          </motion.div>
          {conversation.online && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800" />}
          {conversation.unread > 0 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 dark:bg-pink-400 rounded-full flex items-center justify-center text-xs text-white font-bold"
            >{conversation.unread > 99 ? '99+' : conversation.unread}</motion.div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold truncate text-indigo-700 dark:text-cyan-100">
              {conversation.name}
              {conversation.isPinned && <Pin className="w-3 h-3 inline ml-1 text-pink-400 dark:text-pink-300" />}
              {conversation.isMuted && <VolumeX className="w-3 h-3 inline ml-1 text-gray-400 dark:text-gray-500" />}
            </h3>
            <div className="flex items-center space-x-1">
              <span className={`text-xs ${
                conversation.unread > 0 ? 'text-indigo-600 dark:text-cyan-300 font-medium' : 'text-gray-500 dark:text-blue-300'
              }`}>{conversation.time}</span>
              {conversation.priority === 'high' && <AlertCircle className="w-3 h-3 text-red-400" />}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className={`text-sm truncate ${
              conversation.unread > 0 ? 'text-indigo-600 dark:text-cyan-200 font-medium' : 'text-gray-600 dark:text-blue-200'
            }`}>{conversation.lastMessage}</p>
            {conversation.isTyping && (
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <motion.div key={i} animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay }}
                      className="w-1 h-1 bg-indigo-400 dark:bg-cyan-400 rounded-full"
                    />
                  ))}
                </div>
                <span className="text-xs text-indigo-400 dark:text-cyan-400">typing...</span>
              </div>
            )}
          </div>

          {conversation.property && (
            <div className="flex items-center space-x-1 mt-1">
              <Building2 className="w-3 h-3 text-pink-400 dark:text-pink-300" />
              <span className="text-xs text-pink-400 dark:text-pink-300">{conversation.property}</span>
            </div>
          )}
        </div>

        <div className="relative" ref={menuRef}>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="p-1 rounded-lg hover:bg-indigo-100 dark:hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100"
          ><MoreVertical className="w-4 h-4 text-indigo-600 dark:text-cyan-300" /></motion.button>

          <AnimatePresence>
            {showMenu && (
              <motion.div initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 top-full mt-2 w-48 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-indigo-200 dark:border-slate-700 rounded-xl shadow-xl z-50"
              >
                <div className="p-2">
                  {[{ icon: Archive, label: 'Archive', action: () => { onArchive(conversation.id); setShowMenu(false); }, cls: 'text-indigo-700 dark:text-cyan-100' },
                    { icon: Trash2, label: 'Delete', action: () => { onDelete(conversation.id); setShowMenu(false); }, cls: 'text-red-400' }].map(({ icon: Icon, label, action, cls }) => (
                    <button key={label} onClick={action}
                      className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-slate-700 transition-colors ${cls}`}
                    ><Icon className="w-4 h-4" /><span>{label}</span></button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

// ───────────────────────────────────────────────────────────────
// VisitRequestCard  (Task 4 integration)
// ───────────────────────────────────────────────────────────────
const VisitRequestCard = ({ visit, onApprove, onReject }) => {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const dateStr = new Date(visit.visitDate).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
  });

  const handleReject = async () => {
    setLoading(true);
    await onReject(visit._id, reason);
    setLoading(false);
    setRejecting(false);
  };

  const handleApprove = async () => {
    setLoading(true);
    await onApprove(visit._id);
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-indigo-200 dark:border-slate-700 rounded-xl p-4 mb-3 shadow-md"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-semibold text-indigo-700 dark:text-cyan-100">
            {visit.tenant?.name || 'Tenant'}
          </p>
          <p className="text-xs text-gray-500 dark:text-blue-300">{visit.tenant?.email}</p>
        </div>
        <span className="px-2 py-1 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium">Pending</span>
      </div>

      <div className="flex items-center space-x-2 mb-1 text-sm text-gray-600 dark:text-blue-200">
        <Building2 className="w-4 h-4 text-pink-400" />
        <span className="truncate">{visit.property?.title || 'Property'}</span>
      </div>
      <div className="flex items-center space-x-2 mb-3 text-sm text-gray-600 dark:text-blue-200">
        <Calendar className="w-4 h-4 text-indigo-400" />
        <span>{dateStr} at {visit.visitTime}</span>
      </div>

      {visit.message && (
        <p className="text-xs text-gray-500 dark:text-blue-300 mb-3 italic">“{visit.message}”</p>
      )}

      {rejecting ? (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Reason for rejection (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-indigo-50 dark:bg-slate-700 border border-indigo-200 dark:border-slate-600 rounded-lg text-indigo-700 dark:text-cyan-100 placeholder-gray-400 focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-400"
          />
          <div className="flex space-x-2">
            <button onClick={handleReject} disabled={loading}
              className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >{loading ? 'Rejecting...' : 'Confirm Reject'}</button>
            <button onClick={() => setRejecting(false)}
              className="flex-1 py-2 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-cyan-200 rounded-lg text-sm font-medium transition-colors"
            >Cancel</button>
          </div>
        </div>
      ) : (
        <div className="flex space-x-2">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={handleApprove} disabled={loading}
            className="flex-1 flex items-center justify-center space-x-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>{loading ? '...' : 'Approve'}</span>
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setRejecting(true)} disabled={loading}
            className="flex-1 flex items-center justify-center space-x-1 py-2 bg-red-100 dark:bg-red-500/20 hover:bg-red-200 dark:hover:bg-red-500/30 text-red-600 dark:text-red-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <CalendarX className="w-4 h-4" />
            <span>Reject</span>
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};

// ───────────────────────────────────────────────────────────────
// MessageInput
// ───────────────────────────────────────────────────────────────
const MessageInput = ({ onSend, onTyping, replyTo, onCancelReply, placeholder = 'Type your message...' }) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const templates = [
    { title: 'Rent Reminder', content: 'Hi! This is a friendly reminder that your rent payment is due on {date}. Please let me know if you have any questions.', category: 'Payment' },
    { title: 'Maintenance Update', content: 'I wanted to update you on the maintenance request. We have scheduled the repair for {date} between {time}.', category: 'Maintenance' },
    { title: 'Property Inspection', content: 'We will be conducting a routine property inspection on {date}. Please let me know if this time works for you.', category: 'Inspection' },
    { title: 'Welcome Message', content: "Welcome to your new home! Please don't hesitate to reach out if you have any questions.", category: 'General' },
    { title: 'Lease Renewal', content: "Your lease is coming up for renewal. Let's schedule a time to discuss the terms for the upcoming year.", category: 'Lease' },
  ];

  const quickActions = [
    { label: 'Schedule Inspection', icon: Calendar, action: 'inspection' },
    { label: 'Send Payment Link',   icon: CreditCard, action: 'payment' },
    { label: 'Maintenance Request', icon: Wrench,    action: 'maintenance' },
    { label: 'Property Rules',      icon: FileText,  action: 'rules' },
    { label: 'Emergency Contact',   icon: Phone,     action: 'emergency' },
  ];

  const emojis = ['\uD83D\uDE0A', '\uD83D\uDC4D', '\u2764\uFE0F', '\uD83D\uDE02', '\uD83D\uDE22', '\uD83D\uDD25', '\uD83D\uDC4C', '\uD83C\uDF89', '\uD83D\uDCAF', '\uD83C\uDFE0', '\uD83D\uDD27', '\uD83D\uDCB0', '\uD83D\uDCC5', '\uD83D\uDCDE', '\u2705', '\u274C', '\u26A0\uFE0F', '\uD83D\uDEA8'];

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) { ta.style.height = 'auto'; ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`; }
  }, [message]);

  const handleSend = () => {
    if (message.trim() || attachments.length > 0) {
      onSend({ content: message.trim(), attachments, replyTo: replyTo?.id, formatting: { bold: isBold, italic: isItalic } });
      setMessage(''); setAttachments([]);
      if (replyTo) onCancelReply();
    }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newAtts = files.map(f => ({
      id: Date.now() + Math.random(), name: f.name,
      size: `${(f.size / 1024 / 1024).toFixed(2)} MB`,
      type: f.type.startsWith('image/') ? 'image' : 'file',
      url: URL.createObjectURL(f), file: f,
    }));
    setAttachments(prev => [...prev, ...newAtts]);
  };

  const actionMessages = {
    inspection: "I'd like to schedule a property inspection. When would be a good time for you?",
    payment: 'Here\'s your payment portal link: [Payment Link]. Let me know if you need any assistance.',
    maintenance: 'Please describe the maintenance issue and I\'ll arrange for repairs.',
    rules: 'Please review the property rules attached. Let me know if you have any questions.',
    emergency: 'For emergencies call: [Emergency Number]. For non-urgent matters, message here.',
  };

  return (
    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-indigo-200 dark:border-slate-700 rounded-2xl p-4 space-y-4">
      {replyTo && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-cyan-500/10 rounded-lg border-l-4 border-indigo-500 dark:border-cyan-400"
        >
          <div className="flex-1">
            <div className="text-sm text-indigo-600 dark:text-cyan-400 font-medium">Replying to {replyTo.sender}</div>
            <div className="text-sm text-gray-600 dark:text-blue-200 truncate">{replyTo.content}</div>
          </div>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onCancelReply}
            className="p-1 hover:bg-indigo-100 dark:hover:bg-cyan-500/20 rounded"
          ><X className="w-4 h-4 text-indigo-600 dark:text-cyan-300" /></motion.button>
        </motion.div>
      )}

      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map(att => (
            <motion.div key={att.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative group">
              {att.type === 'image' ? (
                <div className="relative">
                  <img src={att.url} alt={att.name} className="w-16 h-16 object-cover rounded-lg" />
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setAttachments(p => p.filter(a => a.id !== att.id))}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  ><X className="w-3 h-3" /></motion.button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 p-2 bg-indigo-50 dark:bg-slate-700 rounded-lg pr-8">
                  <File className="w-5 h-5 text-indigo-400 dark:text-cyan-400" />
                  <div>
                    <div className="text-sm font-medium text-indigo-700 dark:text-cyan-100 truncate max-w-20">{att.name}</div>
                    <div className="text-xs text-gray-500 dark:text-blue-300">{att.size}</div>
                  </div>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setAttachments(p => p.filter(a => a.id !== att.id))}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  ><X className="w-3 h-3" /></motion.button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Quick action chips */}
      <div className="flex flex-wrap gap-2">
        {quickActions.map(({ label, icon: Icon, action }) => (
          <motion.button key={action} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setMessage(actionMessages[action] || '')}
            className="flex items-center space-x-1 px-3 py-1 bg-indigo-100 dark:bg-cyan-500/20 rounded-full text-xs text-indigo-700 dark:text-cyan-300 hover:bg-indigo-200 dark:hover:bg-cyan-500/30 transition-colors"
          ><Icon className="w-3 h-3" /><span>{label}</span></motion.button>
        ))}
      </div>

      <div className="relative">
        <div className="flex items-end space-x-3">
          {/* Left toolbar */}
          <div className="flex flex-col space-y-2">
            <div className="relative">
              <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload} className="hidden" accept="image/*,.pdf,.doc,.docx,.txt" />
              <motion.button whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.9 }}
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-indigo-100 dark:bg-slate-700 rounded-lg hover:bg-indigo-200 dark:hover:bg-slate-600 transition-colors"
              ><Paperclip className="w-5 h-5 text-indigo-600 dark:text-cyan-300" /></motion.button>
            </div>

            <div className="relative">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => setShowTemplates(!showTemplates)}
                className="p-2 bg-indigo-100 dark:bg-slate-700 rounded-lg hover:bg-indigo-200 dark:hover:bg-slate-600 transition-colors"
              ><FileText className="w-5 h-5 text-indigo-600 dark:text-cyan-300" /></motion.button>
              <AnimatePresence>
                {showTemplates && (
                  <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute bottom-full mb-2 left-0 w-80 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-indigo-200 dark:border-slate-700 rounded-xl shadow-xl z-50"
                  >
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-indigo-700 dark:text-cyan-100 mb-3">Message Templates</h3>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {templates.map((t, i) => (
                          <motion.button key={i} whileHover={{ scale: 1.02 }} onClick={() => { setMessage(t.content); setShowTemplates(false); }}
                            className="w-full text-left p-3 rounded-lg hover:bg-indigo-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            <div className="text-sm font-medium text-indigo-700 dark:text-cyan-100">{t.title}</div>
                            <div className="text-xs text-gray-600 dark:text-blue-300 mt-1">{t.category}</div>
                            <div className="text-xs text-gray-500 dark:text-blue-200 mt-1 line-clamp-2">{t.content}</div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => setShowEmoji(!showEmoji)}
                className="p-2 bg-indigo-100 dark:bg-slate-700 rounded-lg hover:bg-indigo-200 dark:hover:bg-slate-600 transition-colors"
              ><Smile className="w-5 h-5 text-indigo-600 dark:text-cyan-300" /></motion.button>
              <AnimatePresence>
                {showEmoji && (
                  <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute bottom-full mb-2 left-0 w-64 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-indigo-200 dark:border-slate-700 rounded-xl shadow-xl z-50"
                  >
                    <div className="p-4">
                      <div className="grid grid-cols-6 gap-2">
                        {emojis.map((e, i) => (
                          <motion.button key={i} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
                            onClick={() => { setMessage(p => p + e); setShowEmoji(false); }}
                            className="p-2 hover:bg-indigo-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-lg"
                          >{e}</motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Textarea */}
          <div className="flex-1 relative">
            <div className="flex items-center space-x-2 mb-2 opacity-50 hover:opacity-100 transition-opacity">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setIsBold(!isBold)}
                className={`p-1 rounded ${isBold ? 'bg-indigo-500 dark:bg-cyan-500 text-white' : 'hover:bg-indigo-100 dark:hover:bg-slate-700'}`}
              ><Bold className="w-4 h-4" /></motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setIsItalic(!isItalic)}
                className={`p-1 rounded ${isItalic ? 'bg-indigo-500 dark:bg-cyan-500 text-white' : 'hover:bg-indigo-100 dark:hover:bg-slate-700'}`}
              ><Italic className="w-4 h-4" /></motion.button>
            </div>
            <textarea ref={textareaRef} value={message}
              onChange={(e) => { setMessage(e.target.value); onTyping?.(); }}
              onKeyDown={handleKeyDown} placeholder={placeholder}
              className={`w-full p-3 bg-indigo-50 dark:bg-slate-700 border border-indigo-200 dark:border-slate-600 rounded-xl text-indigo-700 dark:text-cyan-100 placeholder-gray-500 dark:placeholder-blue-300 focus:border-indigo-500 dark:focus:border-cyan-400 focus:outline-none transition-colors resize-none ${
                isBold ? 'font-bold' : ''} ${isItalic ? 'italic' : ''}`}
              rows={1} style={{ minHeight: '48px' }}
            />
          </div>

          {/* Send button */}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={message.trim() || attachments.length > 0 ? handleSend : undefined}
            disabled={!message.trim() && attachments.length === 0}
            className={`p-3 rounded-xl font-semibold transition-all duration-300 ${
              message.trim() || attachments.length > 0
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-cyan-500 dark:to-cyan-600 text-white hover:from-indigo-600 hover:to-indigo-700 shadow-lg'
                : 'bg-indigo-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          ><Send className="w-5 h-5" /></motion.button>
        </div>
      </div>
    </div>
  );
};

// ───────────────────────────────────────────────────────────────
// Main LandlordMessage component
// ───────────────────────────────────────────────────────────────
const LandlordMessage = () => {
  const sidebarWidthClass = '[margin-left:var(--sidebar-width,18rem)]';

  // ── State ────────────────────────────────────────────────────────────
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({});            // { [convId]: Message[] }
  const [activeConversation, setActiveConversation] = useState(null);
  const [pendingVisits, setPendingVisits] = useState([]);  // Task 4 visit requests
  const [visitTab, setVisitTab] = useState(false);         // toggle visit panel
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [replyTo, setReplyTo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // ── Load conversations + pending visits ────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const [convRes, visitRes] = await Promise.all([
          api.get('/api/messages/conversations'),
          api.get('/api/visits/landlord?status=pending'),
        ]);
        setConversations(convRes.data);
        setPendingVisits(visitRes.data);
        if (convRes.data.length > 0) setActiveConversation(convRes.data[0]);
      } catch (err) {
        console.error('LandlordMessage load error:', err);
        setError('Could not load messages. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // ── Load messages for active conversation ───────────────────────────────
  useEffect(() => {
    if (!activeConversation || messages[activeConversation.id]) return;
    const load = async () => {
      try {
        const { data } = await api.get(`/api/messages/conversations/${activeConversation.id}`);
        setMessages(prev => ({ ...prev, [activeConversation.id]: data }));
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    };
    load();
  }, [activeConversation]);

  // ── Auto-scroll ─────────────────────────────────────────────────────────
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, activeConversation]);

  const activeMessages = useMemo(() =>
    activeConversation ? (messages[activeConversation.id] || []) : [],
  [messages, activeConversation]);

  const filteredConversations = useMemo(() => conversations.filter(conv => {
    const matchSearch = conv.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filterStatus === 'all' ||
      (filterStatus === 'unread' && conv.unread > 0) ||
      (filterStatus === 'pinned' && conv.isPinned) ||
      (filterStatus === 'online' && conv.online);
    return matchSearch && matchFilter;
  }), [conversations, searchTerm, filterStatus]);

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleSendMessage = useCallback(async (messageData) => {
    if (!activeConversation) return;
    const optimistic = {
      id: `local-${Date.now()}`,
      sender: 'You', content: messageData.content,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true, status: 'sent', attachments: messageData.attachments || [],
      reactions: {}, isForwarded: false,
      replyTo: messageData.replyTo ? activeMessages.find(m => m.id === messageData.replyTo) : null,
      edited: false, pinned: false, priority: 'normal',
    };
    setMessages(prev => ({ ...prev, [activeConversation.id]: [...(prev[activeConversation.id] || []), optimistic] }));
    setConversations(prev => prev.map(c =>
      c.id === activeConversation.id ? { ...c, lastMessage: messageData.content, time: 'now' } : c
    ));
    try {
      await api.post(`/api/messages/conversations/${activeConversation.id}`, { message: messageData.content });
      setTimeout(() => setMessages(prev => ({ ...prev, [activeConversation.id]: (prev[activeConversation.id] || []).map(m => m.id === optimistic.id ? { ...m, status: 'delivered' } : m) })), 1000);
      setTimeout(() => setMessages(prev => ({ ...prev, [activeConversation.id]: (prev[activeConversation.id] || []).map(m => m.id === optimistic.id ? { ...m, status: 'read' } : m) })), 3000);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  }, [activeConversation, activeMessages]);

  const handleReaction = useCallback((messageId, emoji) => {
    if (!activeConversation) return;
    setMessages(prev => ({
      ...prev,
      [activeConversation.id]: (prev[activeConversation.id] || []).map(msg => {
        if (msg.id !== messageId) return msg;
        const r = { ...msg.reactions };
        if (r[emoji]) delete r[emoji]; else r[emoji] = 1;
        return { ...msg, reactions: r };
      }),
    }));
  }, [activeConversation]);

  const handleDeleteMessage = useCallback((messageId) => {
    if (!activeConversation) return;
    setMessages(prev => ({
      ...prev,
      [activeConversation.id]: (prev[activeConversation.id] || []).filter(m => m.id !== messageId),
    }));
  }, [activeConversation]);

  const handleArchiveConversation = useCallback((convId) => {
    setConversations(prev => prev.filter(c => c.id !== convId));
    if (activeConversation?.id === convId) setActiveConversation(null);
  }, [activeConversation]);

  const handleDeleteConversation = useCallback((convId) => {
    showConfirmToast('Delete this conversation?', () => {
      setConversations(prev => prev.filter(c => c.id !== convId));
      setMessages(prev => { const n = { ...prev }; delete n[convId]; return n; });
      if (activeConversation?.id === convId) setActiveConversation(null);
    });
  }, [activeConversation]);

  // ── Visit request handlers (Task 4) ────────────────────────────────
  const handleApproveVisit = useCallback(async (visitId) => {
    try {
      await api.patch(`/api/visits/${visitId}/status`, { status: 'approved' });
      setPendingVisits(prev => prev.filter(v => v._id !== visitId));
    } catch (err) { console.error('Approve visit error:', err); }
  }, []);

  const handleRejectVisit = useCallback(async (visitId, reason) => {
    try {
      await api.patch(`/api/visits/${visitId}/status`, { status: 'rejected', reason });
      setPendingVisits(prev => prev.filter(v => v._id !== visitId));
    } catch (err) { console.error('Reject visit error:', err); }
  }, []);

  // ── Loading state ─────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-slate-900 dark:to-blue-950 flex">
        <LandlordSideBar currentSection="Messages" />
        <div className={`flex-1 flex flex-col relative z-10 ${sidebarWidthClass}`}>
          <LandlordNavBar currentSection="Messages" />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-indigo-700 dark:text-cyan-100 font-semibold">Loading messages...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-slate-900 dark:to-blue-950 flex relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div animate={{ rotate: 360, scale: [1, 1.1, 1] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-indigo-300/20 to-pink-300/20 dark:from-cyan-500/10 dark:to-blue-500/10 rounded-full blur-3xl"
        />
        <motion.div animate={{ rotate: -360, scale: [1.1, 1, 1.1] }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-300/20 to-indigo-300/20 dark:from-blue-500/10 dark:to-cyan-500/10 rounded-full blur-3xl"
        />
      </div>

      <LandlordSideBar currentSection="Messages" />

      <div className={`flex-1 flex flex-col relative z-10 ${sidebarWidthClass} transition-all duration-700`}>
        <LandlordNavBar currentSection="Messages" />

        <main className="flex-1 overflow-hidden">
          <div className="h-full flex">

            {/* ── Left: Conversations + Visit Requests panel ── */}
            <div className="w-80 bg-white/70 dark:bg-slate-800/50 backdrop-blur-xl border-r border-indigo-200 dark:border-slate-700 flex flex-col">
              <div className="p-6 border-b border-indigo-200 dark:border-slate-700">
                {/* Heading + Visit toggle */}
                <div className="flex items-center justify-between mb-4">
                  <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-bold text-indigo-700 dark:text-cyan-100"
                  >Messages</motion.h1>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setVisitTab(!visitTab)}
                    className={`relative flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      visitTab
                        ? 'bg-indigo-500 dark:bg-cyan-500 text-white'
                        : 'bg-indigo-100 dark:bg-slate-700 text-indigo-700 dark:text-cyan-200 hover:bg-indigo-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    <Calendar className="w-3 h-3" />
                    <span>Visits</span>
                    {pendingVisits.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                        {pendingVisits.length}
                      </span>
                    )}
                  </motion.button>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-blue-300" />
                  <input type="text" placeholder="Search conversations..." value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-indigo-50 dark:bg-slate-700 border border-indigo-200 dark:border-slate-600 rounded-xl text-indigo-700 dark:text-cyan-100 placeholder-gray-500 dark:placeholder-blue-300 focus:border-indigo-500 dark:focus:border-cyan-400 focus:outline-none transition-colors"
                  />
                </div>

                {/* Filter tabs */}
                <div className="flex space-x-2">
                  {[{ key: 'all', label: 'All' }, { key: 'unread', label: 'Unread' }, { key: 'pinned', label: 'Pinned' }, { key: 'online', label: 'Online' }].map(({ key, label }) => (
                    <motion.button key={key} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setFilterStatus(key)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        filterStatus === key
                          ? 'bg-indigo-500 dark:bg-cyan-500 text-white'
                          : 'bg-indigo-100 dark:bg-slate-700 text-indigo-700 dark:text-cyan-200 hover:bg-indigo-200 dark:hover:bg-slate-600'
                      }`}
                    >{label}</motion.button>
                  ))}
                </div>
              </div>

              {error && <div className="px-4 py-2 bg-red-100 text-red-700 text-sm">{error}</div>}

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {/* — Visit Requests panel — */}
                <AnimatePresence>
                  {visitTab && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold text-indigo-700 dark:text-cyan-100 mb-3 flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>Pending Visit Requests ({pendingVisits.length})</span>
                        </h3>
                        {pendingVisits.length === 0 ? (
                          <div className="text-center py-6">
                            <CalendarCheck className="w-10 h-10 mx-auto text-gray-400 dark:text-gray-600 mb-2" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">No pending visit requests</p>
                          </div>
                        ) : (
                          pendingVisits.map(v => (
                            <VisitRequestCard key={v._id} visit={v} onApprove={handleApproveVisit} onReject={handleRejectVisit} />
                          ))
                        )}
                      </div>
                      <div className="h-px bg-indigo-200 dark:bg-slate-700 mb-4" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* — Conversations — */}
                <AnimatePresence>
                  {filteredConversations.map((conv, idx) => (
                    <motion.div key={conv.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: idx * 0.05 }}>
                      <ConversationItem
                        conversation={conv}
                        isActive={activeConversation?.id === conv.id}
                        onClick={() => setActiveConversation(conv)}
                        onArchive={handleArchiveConversation}
                        onDelete={handleDeleteConversation}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {filteredConversations.length === 0 && !visitTab && (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No conversations found</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Right: Chat area ── */}
            <div className="flex-1 flex flex-col">
              {activeConversation ? (
                <>
                  {/* Chat header */}
                  <div className="p-6 bg-white/70 dark:bg-slate-800/50 backdrop-blur-xl border-b border-indigo-200 dark:border-slate-700">
                    <div className="flex items-center space-x-4">
                      <motion.div whileHover={{ scale: 1.1 }} className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-cyan-500 dark:to-cyan-600 flex items-center justify-center text-white font-semibold">
                          {activeConversation.avatar || activeConversation.name?.charAt(0)}
                        </div>
                        {activeConversation.online && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800" />}
                      </motion.div>
                      <div>
                        <h2 className="text-xl font-bold text-indigo-700 dark:text-cyan-100 flex items-center space-x-2">
                          <span>{activeConversation.name}</span>
                          {activeConversation.isPinned && <Pin className="w-4 h-4 text-pink-400 dark:text-pink-300" />}
                        </h2>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-blue-200">
                          <span className={activeConversation.online ? 'text-emerald-500' : ''}>
                            {activeConversation.online ? 'Online' : 'Offline'}
                          </span>
                          {activeConversation.property && (
                            <><span>•</span><Building2 className="w-3 h-3" /><span>{activeConversation.property}</span></>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <AnimatePresence>
                      {activeMessages.map((msg, idx) => (
                        <MessageBubble key={msg.id || idx} message={msg} isOwn={msg.isOwn}
                          showAvatar={!msg.isOwn && (idx === 0 || activeMessages[idx - 1]?.isOwn)}
                          onReact={handleReaction} onReply={setReplyTo}
                          onForward={(m) => console.log('forward', m)}
                          onDelete={handleDeleteMessage}
                        />
                      ))}
                    </AnimatePresence>
                    {activeMessages.length === 0 && (
                      <div className="text-center py-12">
                        <MessageSquare className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-6 bg-white/70 dark:bg-slate-800/50 backdrop-blur-xl border-t border-indigo-200 dark:border-slate-700">
                    <MessageInput
                      onSend={handleSendMessage}
                      onTyping={() => {}}
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
                    <p className="text-gray-600 dark:text-blue-200">Choose a conversation from the sidebar to start messaging.</p>
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
