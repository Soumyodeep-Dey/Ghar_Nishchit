import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../../useDarkMode.js';
import TenantSideBar from './TenantSideBar';
import TenantNavBar from './TenantNavBar';
import api from '../../../services/api.js';
import { useLanguage } from '../../../i18n/LanguageContext.jsx';
import { showErrorToast, showSuccessToast } from '../../../utils/toast.jsx';
import {
  ChatBubbleLeftRightIcon, PaperAirplaneIcon, PaperClipIcon,
  XMarkIcon, CheckIcon, FaceSmileIcon, MagnifyingGlassIcon,
  BuildingOfficeIcon, ClockIcon
} from '@heroicons/react/24/outline';
import {
  FileText, CheckCircle, Clock, XCircle, Home, Calendar,
  IndianRupee, Shield, User, AlertTriangle, RefreshCw, Eye, X
} from 'lucide-react';
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
              ? 'bg-slate-800/80 text-slate-100 rounded-bl-md border border-slate-700/50'
              : 'bg-white/80 text-gray-800 rounded-bl-md border border-indigo-100 backdrop-blur-md'
          }`}
      >
        {!msg.isOwn && (
          <p className={`text-xs font-semibold mb-1 ${darkMode ? 'text-cyan-400' : 'text-indigo-600'}`}>
            {msg.senderName || (msg.role === 'landlord' ? 'Landlord' : 'Tenant')}
          </p>
        )}
        <p className="leading-relaxed">{msg.content}</p>
        <div className="flex items-center justify-between mt-2">
          <p className={`text-xs ${msg.isOwn ? 'text-blue-200' : darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
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
        ${darkMode ? 'border-slate-700/50 hover:bg-slate-700/40' : 'border-indigo-100 hover:bg-indigo-50/40'}
        ${isActive
          ? darkMode
            ? 'bg-gradient-to-r from-slate-700/60 to-slate-800/80 border-l-4 border-cyan-400 shadow-md'
            : 'bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border-l-4 border-indigo-600 shadow-md'
          : ''
        }`}
    >
      <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg flex-shrink-0 ${isActive ? 'ring-4 ring-cyan-500/20' : ''}`}>
        {name.charAt(0).toUpperCase()}
      </div>
      <div className="ml-3 flex-1 min-w-0">
        <div className="flex justify-between">
          <h3 className={`font-medium truncate ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{name}</h3>
          <span className={`text-xs flex-shrink-0 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{time}</span>
        </div>
        <p className={`text-xs flex items-center gap-1 mb-1 ${darkMode ? 'text-cyan-400' : 'text-indigo-600'}`}>
          <BuildingOfficeIcon className="h-3 w-3" />{property}
        </p>
        <p className={`text-sm truncate ${darkMode ? 'text-slate-300' : 'text-gray-500'}`}>{lastReply}</p>
      </div>
    </div>
  );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = {
    pending:   { label: 'Awaiting Your Signature', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock },
    active:    { label: 'Active Lease',             color: 'bg-green-500/20  text-green-400  border-green-500/30',  icon: CheckCircle },
    completed: { label: 'Completed',                color: 'bg-blue-500/20   text-blue-400   border-blue-500/30',   icon: CheckCircle },
    cancelled: { label: 'Cancelled',                color: 'bg-red-500/20    text-red-400    border-red-500/30',    icon: XCircle },
  }[status?.toLowerCase()] || { label: status, color: 'bg-gray-500/20 text-slate-300 border-slate-700/30', icon: FileText };

  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
};

// ─── Contract Detail Modal ────────────────────────────────────────────────────
const ContractModal = ({ contract, onClose, onAccept, onDecline, accepting }) => {
  const { darkMode } = useDarkMode();
  if (!contract) return null;

  const isPending = contract.status === 'pending';
  const bg = darkMode ? 'bg-slate-900/95 backdrop-blur-xl border border-slate-700/50' : 'bg-white/95 backdrop-blur-xl border border-indigo-200/50';
  const text = darkMode ? 'text-slate-100' : 'text-gray-900';
  const sub = darkMode ? 'text-slate-400' : 'text-gray-500';
  const border = darkMode ? 'border-slate-700/50' : 'border-indigo-100';
  const rowBg = darkMode ? 'bg-slate-800/50 border border-slate-700/30' : 'bg-gray-50 border border-gray-150';

  const Row = ({ label, value }) => (
    <div className={`flex justify-between items-center py-3 px-4 rounded-xl ${rowBg}`}>
      <span className={`text-sm font-medium ${sub}`}>{label}</span>
      <span className={`text-sm font-semibold ${text}`}>{value}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className={`${bg} rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`sticky top-0 ${bg} p-6 border-b ${border} rounded-t-3xl flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-50 to-indigo-600 rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${text}`}>Lease Contract</h2>
              <p className={`text-sm ${sub}`}>{contract.property?.title || 'Property Contract'}</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-850 transition-colors ${sub}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Status banner for pending */}
          {isPending && (
            <div className={`flex items-start gap-3 p-4 border rounded-2xl ${darkMode ? 'bg-amber-500/10 border-amber-500/25' : 'bg-amber-50 border-amber-200'}`}>
              <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className={`text-sm font-semibold ${darkMode ? 'text-amber-400' : 'text-amber-800'}`}>Action Required</p>
                <p className={`text-sm mt-0.5 ${darkMode ? 'text-amber-500' : 'text-amber-700'}`}>
                  Your landlord has sent you this lease contract. Please review all terms carefully before signing.
                </p>
              </div>
            </div>
          )}

          <StatusBadge status={contract.status} />

          {/* Contract Details */}
          <div className="space-y-2">
            <h3 className={`text-sm font-semibold uppercase tracking-wider ${sub} mb-3`}>Contract Details</h3>
            <Row label="Contract Type"    value={contract.type?.charAt(0).toUpperCase() + contract.type?.slice(1) || '—'} />
            <Row label="Property"         value={contract.property?.title || '—'} />
            <Row label="Duration"         value={contract.duration ? `${contract.duration} months` : '—'} />
            <Row label="Monthly Rent"     value={contract.rentAmount ? `₹${Number(contract.rentAmount).toLocaleString('en-IN')}` : '—'} />
            <Row label="Security Deposit" value={contract.securityDeposit ? `₹${Number(contract.securityDeposit).toLocaleString('en-IN')}` : '—'} />
            <Row label="Start Date"       value={contract.startDate ? new Date(contract.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'} />
            <Row label="End Date"         value={contract.endDate ? new Date(contract.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'} />
          </div>

          {/* Landlord */}
          {contract.landlord && (
            <div className="space-y-2">
              <h3 className={`text-sm font-semibold uppercase tracking-wider ${sub} mb-3`}>Landlord</h3>
              <Row label="Name"  value={contract.landlord.name || '—'} />
              <Row label="Email" value={contract.landlord.email || '—'} />
            </div>
          )}

          {/* Terms */}
          {contract.terms && (
            <div>
              <h3 className={`text-sm font-semibold uppercase tracking-wider ${sub} mb-3`}>Terms & Conditions</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'petsAllowed',       label: 'Pets Allowed' },
                  { key: 'smokingAllowed',     label: 'Smoking Allowed' },
                  { key: 'sublettingAllowed',  label: 'Subletting Allowed' },
                  { key: 'earlyTermination',   label: 'Early Termination Clause' },
                ].map(({ key, label }) => (
                  <div key={key} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl ${rowBg}`}>
                    {contract.terms[key]
                      ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                    <span className={`text-sm ${text}`}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Clauses */}
          {contract.customClauses && (
            <div className={`p-4 rounded-xl ${rowBg}`}>
              <p className={`text-xs font-semibold uppercase tracking-wider ${sub} mb-2`}>Additional Clauses</p>
              <p className={`text-sm ${text} leading-relaxed`}>{contract.customClauses}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {isPending && (
          <div className={`sticky bottom-0 ${bg} p-6 border-t ${border} rounded-b-3xl`}>
            <p className={`text-xs ${sub} text-center mb-4`}>
              By clicking "Accept & Sign", you agree to all terms stated in this contract.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onDecline}
                disabled={accepting}
                className="flex-1 py-3 rounded-xl border border-red-200 text-red-500 font-semibold text-sm hover:bg-red-500/10 transition-colors disabled:opacity-50"
              >
                Decline
              </button>
              <button
                onClick={() => onAccept(contract._id || contract.id)}
                disabled={accepting}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold text-sm hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {accepting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {accepting ? 'Processing…' : 'Accept & Sign'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

const TenantMessage = () => {
  const { darkMode } = useDarkMode();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const tc = darkMode
    ? {
        mainBg: 'from-black via-zinc-950 to-amber-950/20',
        loadingBg: 'from-black via-zinc-950 to-amber-950/20',
        cardBg: 'bg-zinc-900/60',
        cardBorder: 'border-amber-500/10',
        textPrimary: 'text-slate-100',
        textSecondary: 'text-amber-400',
        headerGradient: 'from-amber-200 via-yellow-400 to-amber-500',
        buttonPrimary: 'from-amber-500 to-yellow-600',
        buttonSecondary: 'bg-zinc-900 hover:bg-zinc-800 text-amber-500 border border-amber-500/30',
        spinnerBorder: 'border-amber-500/30 border-t-amber-500',
        panelBg: 'bg-zinc-950/80',
        chatHeaderBg: 'from-zinc-900 to-amber-950/20',
        chatInputBg: 'bg-zinc-900/80 border-amber-500/10',
      }
    : {
        mainBg: 'from-amber-50/40 via-stone-50 to-orange-50/30',
        loadingBg: 'from-amber-50/40 via-stone-50 to-orange-50/30',
        cardBg: 'bg-white/80',
        cardBorder: 'border-amber-200/50',
        textPrimary: 'text-stone-900',
        textSecondary: 'text-amber-700',
        headerGradient: 'from-amber-800 via-yellow-800 to-amber-900',
        buttonPrimary: 'from-amber-600 to-yellow-600',
        buttonSecondary: 'bg-stone-100 hover:bg-stone-200 text-amber-800 border border-amber-200/50',
        spinnerBorder: 'border-amber-400/40 border-t-amber-600',
        panelBg: 'bg-white/60',
        chatHeaderBg: 'from-white to-amber-50/80',
        chatInputBg: 'bg-white/80 border-amber-200/50',
      };

  const [inquiries, setInquiries] = useState([]);
  const [activeInquiry, setActiveInquiry] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [pendingContract, setPendingContract] = useState(null);
  const [showContractModal, setShowContractModal] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimer = useRef(null);
  // Guard so the location.state effect fires exactly once per navigation
  const processedNavState = useRef(false);
  // Always-current snapshot of inquiries, without being a reactive dependency
  const inquiriesRef = useRef([]);

  const emojis = ['😀', '😃', '😊', '😍', '🤔', '👍', '👎', '❤️', '🎉', '🔥', '💯', '🏠', '🔑', '💰'];

  // ── Load tenant inquiries on mount ──────────────────────────────────────────
  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setIsLoading(true);
        const data = await api.getTenantInquiries();
        const list = Array.isArray(data) ? data : [];
        inquiriesRef.current = list;   // keep ref in sync
        setInquiries(list);
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
    // Wait until inquiries are loaded, and only run once per navigation
    if (!location.state?.propertyId || isLoading || processedNavState.current) return;
    processedNavState.current = true;   // ← prevent re-entry on any future re-render

    const { propertyId, propertyTitle, initialMessage } = location.state;
    const msg = initialMessage || `Hi, I am interested in ${propertyTitle || 'this property'}.`;

    // Read current inquiries from the ref — not from reactive state
    const existing = inquiriesRef.current.find(inq => {
      const pid = inq.property?._id || inq.property;
      return String(pid) === String(propertyId);
    });

    if (existing) {
      setActiveInquiry(existing);
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
          inquiriesRef.current = [created, ...inquiriesRef.current];
          setInquiries(prev => [created, ...prev]);
          setActiveInquiry(created);
          showSuccessToast(`Started conversation for ${propertyTitle || 'property'}`);
        } catch (err) {
          console.error('Failed to create inquiry:', err);
          showErrorToast(err.message || 'Could not start conversation');
        } finally {
          setIsSending(false);
          navigate(location.pathname, { replace: true, state: {} });
        }
      };
      startInquiry();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, isLoading]);

  // ── Auto-select conversation based on notification redirect ──────────────────
  useEffect(() => {
    if (inquiries.length > 0 && location.state?.activeInquiryId) {
      const target = inquiries.find(inq => String(inq._id) === String(location.state.activeInquiryId));
      if (target && target._id !== activeInquiry?._id) {
        setActiveInquiry(target);
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [inquiries, location.state, location.pathname, navigate, activeInquiry]);

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
  // ── Load pending contract when active inquiry changes ──────────────────────────
  useEffect(() => {
    if (!activeInquiry) { setPendingContract(null); return; }
    const fetchContracts = async () => {
      try {
        const data = await api.getTenantContracts();
        const propId = activeInquiry.property?._id || activeInquiry.property;
        const contractsForProperty = (data || []).filter(c =>
          String(c.property?._id || c.property) === String(propId)
        );
        const hasActive = contractsForProperty.some(c => c.status === 'active');
        const pending = hasActive
          ? null
          : contractsForProperty.find(c => c.status === 'pending');
        setPendingContract(pending || null);
      } catch (err) {
        console.error('Failed to fetch contracts for this property:', err);
      }
    };
    fetchContracts();
  }, [activeInquiry]);

  // ── Handle Accept Contract ───────────────────────────────────────────────────
  const handleAcceptContract = async (contractId) => {
    try {
      setAccepting(true);
      await api.updateContractStatus(contractId, 'active');
      showSuccessToast('🎉 Lease accepted!');
      setPendingContract(prev => ({ ...prev, status: 'active' }));
      setShowContractModal(false);
    } catch (err) {
      console.error(err);
      showErrorToast('Failed to accept contract');
    } finally {
      setAccepting(false);
    }
  };

  // ── Handle Decline Contract ──────────────────────────────────────────────────
  const handleDeclineContract = async () => {
    if (!pendingContract) return;
    try {
      await api.updateContractStatus(pendingContract._id || pendingContract.id, 'cancelled');
      showSuccessToast('Contract declined');
      setPendingContract(null);
      setShowContractModal(false);
    } catch (err) {
      console.error(err);
      showErrorToast('Failed to decline contract');
    }
  };

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

      // Update last message preview in conversation list and move to top
      setInquiries(prev => {
        const idx = prev.findIndex(inq => inq._id === activeInquiry._id);
        if (idx === -1) return prev;
        const updatedInq = { 
          ...prev[idx], 
          contactTime: new Date(), 
          replies: [...(prev[idx].replies || []), { content: text, createdAt: new Date() }] 
        };
        const newList = [...prev];
        newList.splice(idx, 1);
        newList.unshift(updatedInq);
        return newList;
      });
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
      <div className={`min-h-screen bg-gradient-to-br ${tc.loadingBg} flex relative`}>
        <TenantSideBar />
        <div className="flex-1 flex flex-col relative z-10 transition-all duration-700" style={{ marginLeft: 'var(--sidebar-width, 4.5rem)' }}>
          <TenantNavBar currentSection="Messages" />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="relative mx-auto w-20 h-20">
                <div className={`w-20 h-20 border-4 ${tc.spinnerBorder} rounded-full animate-spin`}></div>
              </div>
              <h2 className={`text-xl font-bold ${tc.textPrimary} mt-6 animate-pulse`}>{t('pages.loadingMessages')}</h2>
              <p className={`${tc.textSecondary} mt-2`}>Connecting to your conversations</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${tc.mainBg} flex relative`}>
      <TenantSideBar />
      <div className="flex-1 flex flex-col relative z-10 transition-all duration-700" style={{ marginLeft: 'var(--sidebar-width, 4.5rem)' }}>
        <TenantNavBar currentSection="Messages" />
        <main className="flex-1 flex h-[calc(100vh-4rem)] overflow-hidden p-6 animate-fadeIn">
          <div className="flex w-full h-full rounded-3xl shadow-2xl overflow-hidden border border-slate-700/30 backdrop-blur-xl">
            {/* ── Conversations list ── */}
            <div className={`w-1/3 border-r ${darkMode ? 'border-slate-700/50 bg-slate-800/40' : 'border-indigo-100 bg-white/40'} flex flex-col backdrop-blur-xl`}>
              {/* Header */}
              <div className={`p-6 border-b ${darkMode ? 'border-slate-700/50 bg-slate-800/60' : 'border-indigo-100 bg-white/60'}`}>
                <h2 className={`text-2xl font-bold mb-4 flex items-center bg-gradient-to-r ${tc.headerGradient} bg-clip-text text-transparent`}>
                  <ChatBubbleLeftRightIcon className="h-8 w-8 mr-3 text-indigo-600 dark:text-cyan-400" />
                  Messages
                </h2>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 pl-12 focus:outline-none focus:ring-4 transition-all duration-300 ${
                      darkMode ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 focus:ring-cyan-500/20 focus:border-cyan-500' : 'bg-white border-gray-200 text-gray-800 placeholder-gray-500 focus:ring-blue-500/20 focus:border-blue-500'
                    }`}
                  />
                  <MagnifyingGlassIcon className={`h-5 w-5 absolute left-4 top-4 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                </div>
              </div>

              {/* Conversation list */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {filteredInquiries.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <ChatBubbleLeftRightIcon className={`h-16 w-16 ${darkMode ? 'text-slate-500' : 'text-gray-400'} mx-auto mb-4 animate-pulse`} />
                    <p className={`${tc.textPrimary} font-medium mb-2`}>No conversations yet</p>
                    <p className={`text-sm ${tc.textSecondary}`}>
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
            <div className={`flex-1 flex flex-col ${darkMode ? 'bg-slate-900/60' : 'bg-white/60'} backdrop-blur-xl`}>
              {activeInquiry ? (
                <>
                  {/* Chat header */}
                  <div className={`p-4 border-b ${darkMode ? 'border-slate-700/50 bg-slate-800/30' : 'border-indigo-100 bg-indigo-50/20'}`}>
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg mr-4 ring-2 ring-cyan-500/20">
                        {(activeInquiry.landlord?.name || activeInquiry.property?.postedBy?.name || 'L').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className={`font-semibold text-lg ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                          {activeInquiry.landlord?.name || activeInquiry.property?.postedBy?.name || 'Landlord'}
                        </h3>
                        <p className={`text-sm flex items-center gap-1 ${darkMode ? 'text-cyan-400' : 'text-indigo-600'}`}>
                          <BuildingOfficeIcon className="h-4 w-4" />
                          {activeInquiry.property?.title || 'Property'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pending Contract Banner */}
                  {pendingContract && pendingContract.status === 'pending' && (
                    <div className={`p-4 flex items-center justify-between border-b ${
                      darkMode ? 'bg-amber-500/10 border-amber-500/25 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-800'
                    }`}>
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold">Action Required</p>
                          <p className={`text-xs ${darkMode ? 'text-amber-500/80' : 'text-amber-700/80'}`}>
                            A lease agreement has been sent for this property.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowContractModal(true)}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-xl shadow-md transition-all hover:scale-105"
                      >
                        Review & Sign
                      </button>
                    </div>
                  )}

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {messages.length === 0 ? (
                      <div className="text-center py-12">
                        <ChatBubbleLeftRightIcon className={`h-16 w-16 ${darkMode ? 'text-slate-650' : 'text-gray-400'} mx-auto mb-4`} />
                        <p className={tc.textSecondary}>No messages yet. Start the conversation!</p>
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
                  <div className={`p-4 border-t ${darkMode ? 'border-slate-700/50 bg-slate-800/40' : 'border-indigo-100 bg-white/40'}`}>
                    {/* Emoji picker */}
                    {showEmojiPicker && (
                      <div className={`mb-4 p-4 rounded-xl shadow-lg border animate-fadeIn ${
                        darkMode ? 'bg-slate-800 border-slate-700/50' : 'bg-white border-indigo-100'
                      }`}>
                        <div className="grid grid-cols-7 gap-2">
                          {emojis.map((emoji, idx) => (
                            <button
                              key={idx}
                              className={`p-2 text-xl rounded-lg transition-all hover:scale-125 ${darkMode ? 'hover:bg-slate-750' : 'hover:bg-indigo-50'}`}
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
                          className={`w-full border focus:outline-none focus:ring-4 transition-all duration-300 resize-none rounded-2xl px-6 py-4 pr-16 ${
                            darkMode ? 'border-slate-700/50 bg-slate-800/50 text-white placeholder-slate-500 focus:ring-cyan-500/20 focus:border-cyan-500' : 'border-indigo-250 bg-white text-gray-800 placeholder-gray-400 focus:ring-blue-500/20 focus:border-blue-500'
                          }`}
                          rows="1"
                          style={{ minHeight: '56px', maxHeight: '120px' }}
                          onKeyPress={e => {
                            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                          }}
                        />
                        <button
                          className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-all hover:scale-110 ${
                            darkMode ? 'text-slate-400 hover:text-yellow-400' : 'text-gray-400 hover:text-yellow-500'
                          }`}
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                          <FaceSmileIcon className="h-6 w-6" />
                        </button>
                      </div>

                      {/* Attachment (UI only for now) */}
                      <input ref={fileInputRef} type="file" multiple className="hidden" />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-4 rounded-2xl transition-all hover:scale-110 ${
                          darkMode ? 'bg-slate-800/50 text-slate-350 hover:bg-slate-700/50 border border-slate-700/30' : 'bg-indigo-50/50 text-indigo-600 hover:bg-indigo-100 border border-indigo-150'
                        }`}
                      >
                        <PaperClipIcon className="h-6 w-6" />
                      </button>

                      {/* Send */}
                      <button
                        className={`p-4 rounded-2xl transition-all hover:scale-110 ${newMessage.trim()
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl'
                          : darkMode ? 'bg-slate-800 text-slate-600 border border-slate-700/30 cursor-not-allowed' : 'bg-gray-150 text-gray-400 cursor-not-allowed'
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
                <div className="flex-1 flex flex-col items-center justify-center p-6">
                  <ChatBubbleLeftRightIcon className={`h-24 w-24 ${darkMode ? 'text-slate-700' : 'text-gray-300'} mb-6`} />
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-slate-200' : 'text-gray-700'} mb-2`}>{t('pages.noConversation')}</h2>
                  <p className={`${darkMode ? 'text-slate-400' : 'text-gray-500'} text-center max-w-md`}>
                    Select a conversation from the list, or go to Properties and click "Contact Landlord" to start one.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      {showContractModal && pendingContract && (
        <ContractModal
          contract={pendingContract}
          onClose={() => setShowContractModal(false)}
          onAccept={handleAcceptContract}
          onDecline={handleDeclineContract}
          accepting={accepting}
        />
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}; }
        @keyframes fadeIn { from { opacity:0; transform:scale(0.98); } to { opacity:1; transform:scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default TenantMessage;