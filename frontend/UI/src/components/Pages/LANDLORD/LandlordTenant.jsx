import React, { useState, useEffect, useRef, useMemo } from 'react';
import LandlordSideBar from './LandlordSideBar';
import LandlordNavBar from './LandlordNavBar';
import { useDarkMode } from '../../../useDarkMode.js';
// Removed SidebarContext usage
import {
  Users, Search, MoreVertical, Edit, Trash2, Eye, Calendar, User, Clock, CheckCircle, XCircle, AlertCircle, Phone, Mail, MessageCircle, Star, DollarSign, Home, Building2, FileText, Download, Send, ArrowUp, ArrowDown, X, BadgeCheck, Info, Video, UserPlus, Crown
} from 'lucide-react';
// eslint-disable-next-line no-unused-vars
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
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

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

const useNotification = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { ...notification, id }]);

    setTimeout(() => {
      removeNotification(id);
    }, notification.duration || 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return { notifications, addNotification, removeNotification };
};

// Animated Components
const AnimatedCard = ({ children, delay = 0, className = '', ...props }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        duration: 0.5,
        delay,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Tenant Card Component
const TenantCard = ({ tenant, onEdit, onView, onDelete, onMessage, onScheduleVisit, onSendContract, delay = 0 }) => {
  const { darkMode } = useDarkMode();
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className={`w-4 h-4 ${darkMode ? 'text-white' : 'text-emerald-800'}`} />;
      case 'Pending':
        return <Clock className={`w-4 h-4 ${darkMode ? 'text-white' : 'text-yellow-800'}`} />;
      case 'Prospect':
        return <User className={`w-4 h-4 ${darkMode ? 'text-white' : 'text-indigo-800'}`} />;
      case 'Inactive':
        return <XCircle className={`w-4 h-4 ${darkMode ? 'text-white' : 'text-slate-800'}`} />;
      case 'Overdue':
        return <AlertCircle className={`w-4 h-4 ${darkMode ? 'text-white' : 'text-red-800'}`} />;
      default:
        return <User className={`w-4 h-4 ${darkMode ? 'text-white' : 'text-gray-800'}`} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return darkMode ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800';
      case 'Pending':
        return darkMode ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800';
      case 'Prospect':
        return darkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-800';
      case 'Inactive':
        return darkMode ? 'bg-slate-600 text-white' : 'bg-slate-100 text-slate-800';
      case 'Overdue':
        return darkMode ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800';
      default:
        return darkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800';
    }
  };

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-400'
          }`}
      />
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className={`relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 group ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'}`}
    >
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="relative"
            >
              {tenant.avatar ? (
                <img
                  src={tenant.avatar}
                  alt={tenant.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                  {tenant.name.split(' ').map(n => n[0]).join('')}
                </div>
              )}

              {tenant.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-lg" />
              )}

              {tenant.isVerified && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <BadgeCheck className="w-3 h-3 text-white" />
                </div>
              )}
            </motion.div>

            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'} group-hover:text-blue-300 transition-colors`}>
                  {tenant.name}
                </h3>
                {tenant.isPremium && (
                  <Crown className="w-4 h-4 text-yellow-400" />
                )}
                {tenant.rating && (
                  <div className="flex items-center space-x-1">
                    {getRatingStars(tenant.rating)}
                  </div>
                )}
              </div>

              <div className={`space-y-1 text-sm ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                <div className="flex items-center space-x-1">
                  <Mail className="w-3 h-3" />
                  <span>{tenant.email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Phone className="w-3 h-3" />
                  <span>{tenant.phone}</span>
                </div>
                {tenant.property && (
                  <div className="flex items-center space-x-1">
                    <Building2 className="w-3 h-3" />
                    <span>{tenant.property}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="relative" ref={menuRef}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowMenu(!showMenu)}
              className={`p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100 ${darkMode ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}
            >
              <MoreVertical className={`w-4 h-4 ${darkMode ? 'text-white/70' : 'text-gray-600'}`} />
            </motion.button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className={`absolute right-0 top-full mt-2 w-56 backdrop-blur-xl border rounded-xl shadow-xl z-50 ${darkMode ? 'bg-white/20 border-white/30' : 'bg-white/80 border-black/10'}`}
                >
                  <div className="p-2">
                    <button
                      onClick={() => { onView(tenant); setShowMenu(false); }}
                      className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10 text-white/80' : 'hover:bg-black/10 text-black/80'}`}
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Profile</span>
                    </button>
                    <button
                      onClick={() => { onEdit(tenant); setShowMenu(false); }}
                      className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10 text-white/80' : 'hover:bg-black/10 text-black/80'}`}
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit Details</span>
                    </button>
                    <button
                      onClick={() => { onMessage(tenant); setShowMenu(false); }}
                      className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10 text-white/80' : 'hover:bg-black/10 text-black/80'}`}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Send Message</span>
                    </button>
                    <button
                      onClick={() => { onScheduleVisit(tenant); setShowMenu(false); }}
                      className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10 text-white/80' : 'hover:bg-black/10 text-black/80'}`}
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Schedule Visit</span>
                    </button>
                    {tenant.status === 'Prospect' && (
                      <button
                        onClick={() => { onSendContract(tenant); setShowMenu(false); }}
                        className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10 text-white/80' : 'hover:bg-black/10 text-black/80'}`}
                      >
                        <FileText className="w-4 h-4" />
                        <span>Send Contract</span>
                      </button>
                    )}
                    <button
                      onClick={() => { onDelete(tenant.id); setShowMenu(false); }}
                      className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-red-500/20 transition-colors text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Remove Tenant</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Status and Info */}
        <div className="flex items-center justify-between mb-4">
          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStatusColor(tenant.status)}`}>
            {getStatusIcon(tenant.status)}
            <span>{tenant.status}</span>
          </div>

          {tenant.rentAmount && (
            <div className="text-right">
              <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                ${tenant.rentAmount}/month
              </div>
              {tenant.nextPaymentDate && (
                <div className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>
                  Next: {new Date(tenant.nextPaymentDate).toLocaleDateString()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className={`grid grid-cols-2 gap-4 mb-4 text-xs ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
          {tenant.moveInDate && (
            <div>
              <span className={`${darkMode ? 'text-white/50' : 'text-gray-400'}`}>Move-in Date</span>
              <div className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {new Date(tenant.moveInDate).toLocaleDateString()}
              </div>
            </div>
          )}

          {tenant.leaseEndDate && (
            <div>
              <span className={`${darkMode ? 'text-white/50' : 'text-gray-400'}`}>Lease Ends</span>
              <div className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {new Date(tenant.leaseEndDate).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>

        {/* Visit Requests */}
        {tenant.visitRequests && tenant.visitRequests.length > 0 && (
          <div className="mb-4 p-3 bg-blue-500 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">
                {tenant.visitRequests.length} Visit Request{tenant.visitRequests.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="text-xs text-blue-100">
              Latest: {new Date(tenant.visitRequests[0].requestedDate).toLocaleDateString()}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onMessage(tenant)}
            className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center space-x-1"
          >
            <MessageCircle className="w-3 h-3" />
            <span>Message</span>
          </motion.button>

          {tenant.status === 'Prospect' ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onScheduleVisit(tenant)}
              className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-1"
            >
              <Calendar className="w-3 h-3" />
              <span>Schedule</span>
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onView(tenant)}
              className="flex-1 px-3 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors flex items-center justify-center space-x-1"
            >
              <Eye className="w-3 h-3" />
              <span>View</span>
            </motion.button>
          )}
        </div>

        {/* Tags */}
        {tenant.tags && tenant.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {tenant.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className={`px-2 py-1 rounded-full text-xs ${darkMode ? 'bg-white/10 text-white/70' : 'bg-black/10 text-black/70'}`}
              >
                {tag}
              </span>
            ))}
            {tenant.tags.length > 3 && (
              <span className={`px-2 py-1 rounded-full text-xs ${darkMode ? 'bg-white/10 text-white/50' : 'bg-black/10 text-black/50'}`}>
                +{tenant.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Visit Request Modal Component
const VisitRequestModal = ({ isOpen, onClose, tenant, onSchedule }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [visitType, setVisitType] = useState('in-person');
  const [selectedProperty, setSelectedProperty] = useState('');

  const availableSlots = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
  ];

  if (!isOpen) return null;

  const handleSchedule = () => {
    if (!selectedDate || !selectedTime || !selectedProperty) return;

    onSchedule({
      tenantId: tenant.id,
      date: selectedDate,
      time: selectedTime,
      property: selectedProperty,
      type: visitType,
      notes
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Schedule Property Visit</h2>
              <p className="text-white/60 text-sm">for {tenant.name}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white/70" />
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Visit Type */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-3">Visit Type</label>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setVisitType('in-person')}
                className={`p-3 rounded-lg border-2 transition-all ${visitType === 'in-person'
                  ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                  : 'border-white/20 text-white/70 hover:border-white/40'
                  }`}
              >
                <Home className="w-5 h-5 mx-auto mb-1" />
                <div className="text-sm font-medium">In-Person</div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setVisitType('virtual')}
                className={`p-3 rounded-lg border-2 transition-all ${visitType === 'virtual'
                  ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                  : 'border-white/20 text-white/70 hover:border-white/40'
                  }`}
              >
                <Video className="w-5 h-5 mx-auto mb-1" />
                <div className="text-sm font-medium">Virtual Tour</div>
              </motion.button>
            </div>
          </div>

          {/* Property Selection */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Property</label>
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select a property</option>
              <option value="downtown-loft">Modern Downtown Loft</option>
              <option value="luxury-penthouse">Luxury Penthouse</option>
              <option value="cozy-studio">Cozy Studio Apartment</option>
              <option value="garden-view">Garden View Apartment</option>
            </select>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Time Selection */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Time</label>
            <div className="grid grid-cols-4 gap-2">
              {availableSlots.map((time) => (
                <motion.button
                  key={time}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedTime(time)}
                  className={`p-2 rounded-lg text-sm font-medium transition-all ${selectedTime === time
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                >
                  {time}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requirements or notes..."
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-blue-500 focus:outline-none resize-none"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 py-3 bg-gray-500/20 text-gray-300 rounded-lg font-medium hover:bg-gray-500/30 transition-colors"
            >
              Cancel
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSchedule}
              disabled={!selectedDate || !selectedTime || !selectedProperty}
              className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Schedule Visit
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Contract Modal Component
const ContractModal = ({ isOpen, onClose, tenant, onSendContract }) => {
  const [contractType, setContractType] = useState('lease');
  const [duration, setDuration] = useState('12');
  const [rentAmount, setRentAmount] = useState('');
  const [securityDeposit, setSecurityDeposit] = useState('');
  const [startDate, setStartDate] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('');
  const [terms, setTerms] = useState({
    petsAllowed: false,
    smokingAllowed: false,
    sublettingAllowed: false,
    earlyTermination: false
  });
  const [customClauses, setCustomClauses] = useState('');

  if (!isOpen) return null;

  const handleSendContract = () => {
    if (!selectedProperty || !rentAmount || !securityDeposit || !startDate) return;

    onSendContract({
      tenantId: tenant.id,
      contractType,
      duration: parseInt(duration),
      rentAmount: parseFloat(rentAmount),
      securityDeposit: parseFloat(securityDeposit),
      startDate,
      property: selectedProperty,
      terms,
      customClauses
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Send Lease Contract</h2>
              <p className="text-white/60">to {tenant.name}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6 text-white/70" />
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Contract Type */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-3">Contract Type</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'lease', label: 'Lease Agreement', icon: FileText },
                { key: 'rental', label: 'Rental Contract', icon: Home },
                { key: 'sublease', label: 'Sublease', icon: Users }
                // eslint-disable-next-line no-unused-vars
              ].map(({ key, label, icon: IconComponent }) => (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setContractType(key)}
                  className={`p-3 rounded-lg border-2 transition-all ${contractType === key
                    ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                    : 'border-white/20 text-white/70 hover:border-white/40'
                    }`}
                >
                  <IconComponent className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-sm font-medium">{label}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Property and Duration */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Property</label>
              <select
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select property</option>
                <option value="downtown-loft">Modern Downtown Loft</option>
                <option value="luxury-penthouse">Luxury Penthouse</option>
                <option value="cozy-studio">Cozy Studio Apartment</option>
                <option value="garden-view">Garden View Apartment</option>
              </select>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Duration (months)</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="6">6 months</option>
                <option value="12">12 months</option>
                <option value="18">18 months</option>
                <option value="24">24 months</option>
              </select>
            </div>
          </div>

          {/* Financial Terms */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Monthly Rent ($)</label>
              <input
                type="number"
                value={rentAmount}
                onChange={(e) => setRentAmount(e.target.value)}
                placeholder="2500"
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Security Deposit ($)</label>
              <input
                type="number"
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(e.target.value)}
                placeholder="2500"
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Terms and Conditions */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-4">Terms & Conditions</label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'petsAllowed', label: 'Pets Allowed' },
                { key: 'smokingAllowed', label: 'Smoking Allowed' },
                { key: 'sublettingAllowed', label: 'Subletting Allowed' },
                { key: 'earlyTermination', label: 'Early Termination Clause' }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center space-x-3 text-white/80">
                  <input
                    type="checkbox"
                    checked={terms[key]}
                    onChange={(e) => setTerms(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="w-4 h-4 rounded border-2 border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Clauses */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Additional Clauses</label>
            <textarea
              value={customClauses}
              onChange={(e) => setCustomClauses(e.target.value)}
              placeholder="Add any custom terms or conditions..."
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-blue-500 focus:outline-none resize-none"
              rows={4}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/20">
          <div className="flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 py-3 bg-gray-500/20 text-gray-300 rounded-lg font-medium hover:bg-gray-500/30 transition-colors"
            >
              Cancel
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSendContract}
              disabled={!selectedProperty || !rentAmount || !securityDeposit || !startDate}
              className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Send Contract</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Tenant Detail Modal Component
const TenantDetailModal = ({ isOpen, onClose, tenant }) => {
  const [activeTab, setActiveTab] = useState('profile');

  if (!isOpen || !tenant) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                {tenant.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{tenant.name}</h2>
                <p className="text-white/60">{tenant.email}</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6 text-white/70" />
            </motion.button>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mt-6 bg-white/5 p-1 rounded-xl">
            {[
              { key: 'profile', label: 'Profile', icon: User },
              { key: 'visits', label: 'Visits', icon: Calendar },
              { key: 'contracts', label: 'Contracts', icon: FileText },
              { key: 'communication', label: 'Messages', icon: MessageCircle }
              // eslint-disable-next-line no-unused-vars
            ].map(({ key, label, icon: IconComponent }) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(key)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${activeTab === key
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Personal Information</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-white/70 text-sm">Full Name</label>
                    <div className="text-white font-medium">{tenant.name}</div>
                  </div>
                  <div>
                    <label className="text-white/70 text-sm">Email</label>
                    <div className="text-white font-medium">{tenant.email}</div>
                  </div>
                  <div>
                    <label className="text-white/70 text-sm">Phone</label>
                    <div className="text-white font-medium">{tenant.phone}</div>
                  </div>
                  <div>
                    <label className="text-white/70 text-sm">Emergency Contact</label>
                    <div className="text-white font-medium">{tenant.emergencyContact || 'Not provided'}</div>
                  </div>
                </div>
              </div>

              {/* Property Information */}
              {tenant.property && (
                <div className="bg-white/5 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Property Information</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-white/70 text-sm">Property</label>
                      <div className="text-white font-medium">{tenant.property}</div>
                    </div>
                    <div>
                      <label className="text-white/70 text-sm">Monthly Rent</label>
                      <div className="text-white font-medium">${tenant.rentAmount}</div>
                    </div>
                    <div>
                      <label className="text-white/70 text-sm">Move-in Date</label>
                      <div className="text-white font-medium">
                        {tenant.moveInDate ? new Date(tenant.moveInDate).toLocaleDateString() : 'Not set'}
                      </div>
                    </div>
                    <div>
                      <label className="text-white/70 text-sm">Lease End Date</label>
                      <div className="text-white font-medium">
                        {tenant.leaseEndDate ? new Date(tenant.leaseEndDate).toLocaleDateString() : 'Not set'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'visits' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Visit History</h3>
              {tenant.visitRequests && tenant.visitRequests.length > 0 ? (
                tenant.visitRequests.map((visit, index) => (
                  <div key={index} className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">
                          {new Date(visit.requestedDate).toLocaleDateString()} at {visit.time}
                        </div>
                        <div className="text-white/60 text-sm">{visit.property}</div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${visit.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                        visit.status === 'scheduled' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-yellow-500/20 text-yellow-300'
                        }`}>
                        {visit.status}
                      </span>
                    </div>
                    {visit.notes && (
                      <div className="text-white/70 text-sm mt-2">{visit.notes}</div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-white/60">
                  No visit history available
                </div>
              )}
            </div>
          )}

          {activeTab === 'contracts' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Contract History</h3>
              {tenant.contracts && tenant.contracts.length > 0 ? (
                tenant.contracts.map((contract, index) => (
                  <div key={index} className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">{contract.type} Agreement</div>
                        <div className="text-white/60 text-sm">
                          {contract.startDate} - {contract.endDate}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${contract.status === 'active' ? 'bg-green-500/20 text-green-300' :
                          contract.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-gray-500/20 text-gray-300'
                          }`}>
                          {contract.status}
                        </span>
                        <button className="p-1 hover:bg-white/10 rounded">
                          <Download className="w-4 h-4 text-white/70" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-white/60">
                  No contracts found
                </div>
              )}
            </div>
          )}

          {activeTab === 'communication' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Message History</h3>
              <div className="space-y-3">
                {/* Sample messages */}
                {[
                  { sender: 'You', message: 'Hello! Thank you for your interest in the property.', time: '2 hours ago' },
                  { sender: tenant.name, message: 'Hi, I would like to schedule a visit to see the apartment.', time: '3 hours ago' }
                ].map((msg, index) => (
                  <div key={index} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs p-3 rounded-lg ${msg.sender === 'You'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-white'
                      }`}>
                      <div className="text-sm">{msg.message}</div>
                      <div className="text-xs opacity-70 mt-1">{msg.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message input */}
              <div className="flex space-x-2 mt-4">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-blue-500 focus:outline-none"
                />
                <button className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Notification Toast Component
const NotificationToast = ({ notifications, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className={`p-4 rounded-lg shadow-lg backdrop-blur-xl border max-w-sm ${notification.type === 'success' ? 'bg-green-500/20 border-green-500/30 text-green-300' :
              notification.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-300' :
                notification.type === 'warning' ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300' :
                  'bg-blue-500/20 border-blue-500/30 text-blue-300'
              }`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
                {notification.type === 'error' && <XCircle className="w-5 h-5" />}
                {notification.type === 'warning' && <AlertCircle className="w-5 h-5" />}
                {notification.type === 'info' && <Info className="w-5 h-5" />}
              </div>

              <div className="flex-1">
                <h4 className="font-semibold">{notification.title}</h4>
                {notification.message && (
                  <p className="text-sm opacity-90 mt-1">{notification.message}</p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onRemove(notification.id)}
                className="flex-shrink-0 opacity-50 hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Main Component
const LandlordTenant = () => {
  const { darkMode } = useDarkMode();
  const sidebarWidthClass = '[margin-left:var(--sidebar-width,18rem)]';

  // Sample tenants data with enhanced information
  const [tenants, setTenants] = useLocalStorage('landlord_tenants', [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@email.com",
      phone: "+1 (555) 123-4567",
      property: "Modern Downtown Loft",
      status: "Active",
      rentAmount: 2800,
      moveInDate: "2024-06-01",
      leaseEndDate: "2025-06-01",
      nextPaymentDate: "2025-08-15",
      isOnline: true,
      isVerified: true,
      isPremium: false,
      rating: 4,
      tags: ["Reliable", "Long-term", "Quiet"],
      emergencyContact: "Jane Doe - (555) 987-6543",
      visitRequests: [
        {
          requestedDate: "2024-05-15",
          time: "14:00",
          property: "Modern Downtown Loft",
          status: "completed",
          notes: "Interested in the downtown location"
        }
      ],
      contracts: [
        {
          type: "Lease",
          startDate: "2024-06-01",
          endDate: "2025-06-01",
          status: "active"
        }
      ]
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@email.com",
      phone: "+1 (555) 234-5678",
      property: "Luxury Penthouse",
      status: "Active",
      rentAmount: 4200,
      moveInDate: "2024-03-15",
      leaseEndDate: "2025-03-15",
      nextPaymentDate: "2025-08-15",
      isOnline: false,
      isVerified: true,
      isPremium: true,
      rating: 5,
      tags: ["Premium", "Professional", "Referral"],
      emergencyContact: "Bob Smith - (555) 876-5432",
      visitRequests: [],
      contracts: [
        {
          type: "Lease",
          startDate: "2024-03-15",
          endDate: "2025-03-15",
          status: "active"
        }
      ]
    },
    {
      id: 3,
      name: "Robert Johnson",
      email: "robert.johnson@email.com",
      phone: "+1 (555) 345-6789",
      property: "Cozy Studio Apartment",
      status: "Overdue",
      rentAmount: 1800,
      moveInDate: "2024-01-10",
      leaseEndDate: "2024-12-10",
      nextPaymentDate: "2025-07-15",
      isOnline: true,
      isVerified: false,
      isPremium: false,
      rating: 3,
      tags: ["Late Payment", "Student"],
      emergencyContact: "Not provided",
      visitRequests: [],
      contracts: [
        {
          type: "Lease",
          startDate: "2024-01-10",
          endDate: "2024-12-10",
          status: "active"
        }
      ]
    },
    {
      id: 4,
      name: "Emily Davis",
      email: "emily.davis@email.com",
      phone: "+1 (555) 456-7890",
      status: "Prospect",
      isOnline: false,
      isVerified: false,
      isPremium: false,
      rating: 0,
      tags: ["New Inquiry", "Young Professional"],
      visitRequests: [
        {
          requestedDate: "2025-08-10",
          time: "15:00",
          property: "Garden View Apartment",
          status: "scheduled",
          notes: "Looking for pet-friendly apartment"
        },
        {
          requestedDate: "2025-08-08",
          time: "10:00",
          property: "Modern Downtown Loft",
          status: "pending",
          notes: "Prefers downtown location"
        }
      ],
      contracts: []
    },
    {
      id: 5,
      name: "Michael Brown",
      email: "michael.brown@email.com",
      phone: "+1 (555) 567-8901",
      status: "Prospect",
      isOnline: true,
      isVerified: true,
      isPremium: false,
      rating: 0,
      tags: ["Corporate", "Immediate Move-in"],
      visitRequests: [
        {
          requestedDate: "2025-08-12",
          time: "11:00",
          property: "Luxury Penthouse",
          status: "scheduled",
          notes: "Corporate relocation"
        }
      ],
      contracts: []
    }
  ]);

  const [filteredTenants, setFilteredTenants] = useState(tenants);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [propertyFilter, setPropertyFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [isLoading] = useState(false);

  const { notifications, addNotification, removeNotification } = useNotification();

  // Filter and sort tenants
  useEffect(() => {
    let filtered = tenants.filter(tenant => {
      const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tenant.property && tenant.property.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'All' || tenant.status === statusFilter;
      const matchesProperty = propertyFilter === 'All' || tenant.property === propertyFilter;

      return matchesSearch && matchesStatus && matchesProperty;
    });

    // Sort tenants
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'moveInDate' || sortBy === 'leaseEndDate' || sortBy === 'nextPaymentDate') {
        aValue = aValue ? new Date(aValue) : new Date(0);
        bValue = bValue ? new Date(bValue) : new Date(0);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue ? bValue.toLowerCase() : '';
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredTenants(filtered);
  }, [tenants, searchTerm, statusFilter, propertyFilter, sortBy, sortOrder]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = tenants.length;
    const active = tenants.filter(t => t.status === 'Active').length;
    const prospects = tenants.filter(t => t.status === 'Prospect').length;
    const overdue = tenants.filter(t => t.status === 'Overdue').length;
    const pendingVisits = tenants.reduce((sum, t) => sum + (t.visitRequests?.filter(v => v.status === 'pending' || v.status === 'scheduled').length || 0), 0);
    const totalRevenue = tenants
      .filter(t => t.status === 'Active' && t.rentAmount)
      .reduce((sum, t) => sum + t.rentAmount, 0);
    const avgRating = tenants
      .filter(t => t.rating > 0)
      .reduce((sum, t) => sum + t.rating, 0) / tenants.filter(t => t.rating > 0).length || 0;

    return {
      total,
      active,
      prospects,
      overdue,
      pendingVisits,
      totalRevenue,
      avgRating: Math.round(avgRating * 10) / 10
    };
  }, [tenants]);

  // Get unique properties for filter
  const properties = useMemo(() => {
    return [...new Set(tenants.filter(t => t.property).map(t => t.property))];
  }, [tenants]);

  // Event handlers
  const handleViewTenant = (tenant) => {
    setSelectedTenant(tenant);
    setShowDetailModal(true);
  };

  const handleEditTenant = (tenant) => {
    addNotification({
      type: 'info',
      title: 'Edit Tenant',
      message: `Opening edit form for ${tenant.name}`
    });
  };

  const handleDeleteTenant = (tenantId) => {
    if (window.confirm('Are you sure you want to remove this tenant?')) {
      setTenants(prev => prev.filter(t => t.id !== tenantId));
      addNotification({
        type: 'success',
        title: 'Tenant Removed',
        message: 'Tenant has been successfully removed from your list.'
      });
    }
  };

  const handleMessageTenant = (tenant) => {
    addNotification({
      type: 'info',
      title: 'Message Tenant',
      message: `Opening chat with ${tenant.name}`
    });
  };

  const handleScheduleVisit = (tenant) => {
    setSelectedTenant(tenant);
    setShowVisitModal(true);
  };

  const handleVisitScheduled = (visitData) => {
    setTenants(prev => prev.map(t =>
      t.id === visitData.tenantId
        ? {
          ...t,
          visitRequests: [
            ...(t.visitRequests || []),
            {
              requestedDate: visitData.date,
              time: visitData.time,
              property: visitData.property,
              status: 'scheduled',
              notes: visitData.notes,
              type: visitData.type
            }
          ]
        }
        : t
    ));

    addNotification({
      type: 'success',
      title: 'Visit Scheduled',
      message: `Property visit has been scheduled for ${visitData.date} at ${visitData.time}`
    });
  };

  const handleSendContract = (tenant) => {
    setSelectedTenant(tenant);
    setShowContractModal(true);
  };

  const handleContractSent = (contractData) => {
    setTenants(prev => prev.map(t =>
      t.id === contractData.tenantId
        ? {
          ...t,
          contracts: [
            ...(t.contracts || []),
            {
              type: contractData.contractType,
              startDate: contractData.startDate,
              endDate: new Date(new Date(contractData.startDate).setMonth(new Date(contractData.startDate).getMonth() + contractData.duration)).toISOString().split('T')[0],
              status: 'pending',
              rentAmount: contractData.rentAmount,
              securityDeposit: contractData.securityDeposit,
              property: contractData.property,
              terms: contractData.terms
            }
          ]
        }
        : t
    ));

    addNotification({
      type: 'success',
      title: 'Contract Sent',
      message: `Lease contract has been sent to ${selectedTenant?.name}`
    });
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode
      ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-blue-950 text-slate-100'
      : 'bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400 text-gray-900'
      } flex relative overflow-hidden`}>
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360, scale: [1.1, 1, 1.1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl"
        />
      </div>

      <LandlordSideBar currentSection="Tenants" />

      <div className={`flex-1 flex flex-col relative z-10 ${sidebarWidthClass} transition-all duration-700`}>
        <LandlordNavBar currentSection="Tenants" />

        <main className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <motion.h1
                className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent"
              >
                Tenant Management
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-xl text-white/70 max-w-2xl mx-auto"
              >
                Manage your tenants, schedule visits, send contracts, and handle the complete tenant lifecycle
              </motion.p>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6 mb-8">
              <AnimatedCard className={`xl:col-span-1 rounded-2xl p-6 text-center ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'}`}>
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center"
                >
                  <Users className="w-6 h-6 text-white" />
                </motion.div>
                <div className="text-2xl font-bold mb-1">{stats.total}</div>
                <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Total Tenants</div>
              </AnimatedCard>

              <AnimatedCard delay={0.1} className={`xl:col-span-1 rounded-2xl p-6 text-center ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'}`}>
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center"
                >
                  <CheckCircle className="w-6 h-6 text-white" />
                </motion.div>
                <div className="text-2xl font-bold mb-1">{stats.active}</div>
                <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Active</div>
              </AnimatedCard>

              <AnimatedCard delay={0.2} className={`xl:col-span-1 rounded-2xl p-6 text-center ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'}`}>
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center"
                >
                  <UserPlus className="w-6 h-6 text-white" />
                </motion.div>
                <div className="text-2xl font-bold mb-1">{stats.prospects}</div>
                <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Prospects</div>
              </AnimatedCard>

              <AnimatedCard delay={0.3} className={`xl:col-span-1 rounded-2xl p-6 text-center ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'}`}>
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center"
                >
                  <AlertCircle className="w-6 h-6 text-white" />
                </motion.div>
                <div className="text-2xl font-bold mb-1">{stats.overdue}</div>
                <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Overdue</div>
              </AnimatedCard>

              <AnimatedCard delay={0.4} className={`xl:col-span-1 rounded-2xl p-6 text-center ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'}`}>
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center"
                >
                  <Calendar className="w-6 h-6 text-white" />
                </motion.div>
                <div className="text-2xl font-bold mb-1">{stats.pendingVisits}</div>
                <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Pending Visits</div>
              </AnimatedCard>

              <AnimatedCard delay={0.5} className={`xl:col-span-1 rounded-2xl p-6 text-center ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'}`}>
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center"
                >
                  <DollarSign className="w-6 h-6 text-white" />
                </motion.div>
                <div className="text-2xl font-bold mb-1">${stats.totalRevenue.toLocaleString()}</div>
                <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Monthly Revenue</div>
              </AnimatedCard>

              <AnimatedCard delay={0.6} className={`xl:col-span-1 rounded-2xl p-6 text-center ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'}`}>
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center"
                >
                  <Star className="w-6 h-6 text-white" />
                </motion.div>
                <div className="text-2xl font-bold mb-1">{stats.avgRating}</div>
                <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Avg Rating</div>
              </AnimatedCard>
            </div>

            {/* Filters and Controls */}
            <AnimatedCard delay={0.7} className={`rounded-2xl p-6 ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'}`}>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      type="text"
                      placeholder="Search tenants..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`pl-10 pr-4 py-3 w-64 rounded-xl focus:border-blue-500 focus:outline-none transition-colors ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    />
                  </div>

                  {/* Filters */}
                  <div className="flex space-x-3">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className={`px-4 py-3 rounded-xl focus:border-blue-500 focus:outline-none transition-colors ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      <option value="All">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Prospect">Prospect</option>
                      <option value="Pending">Pending</option>
                      <option value="Overdue">Overdue</option>
                      <option value="Inactive">Inactive</option>
                    </select>

                    <select
                      value={propertyFilter}
                      onChange={(e) => setPropertyFilter(e.target.value)}
                      className={`px-4 py-3 rounded-xl focus:border-blue-500 focus:outline-none transition-colors ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      <option value="All">All Properties</option>
                      {properties.map((property) => (
                        <option key={property} value={property}>{property}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Sort controls */}
                  <div className="flex items-center space-x-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className={`px-3 py-2 rounded-lg text-sm focus:border-blue-500 focus:outline-none transition-colors ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      <option value="name">Name</option>
                      <option value="status">Status</option>
                      <option value="property">Property</option>
                      <option value="rentAmount">Rent Amount</option>
                      <option value="moveInDate">Move-in Date</option>
                      <option value="rating">Rating</option>
                    </select>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className={`p-2 rounded-lg hover:bg-opacity-20 transition-colors ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                    </motion.button>
                  </div>


                </div>
              </div>
            </AnimatedCard>

            {/* Tenants Grid */}
            <AnimatedCard delay={0.8}>
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full"
                  />
                </div>
              ) : filteredTenants.length === 0 ? (
                <div className="text-center py-20">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Users className="w-20 h-20 mx-auto text-white/30 mb-6" />
                    <h3 className="text-2xl font-bold text-white mb-4">No Tenants Found</h3>
                    <p className="text-white/60 mb-8">
                      {searchTerm || statusFilter !== 'All' || propertyFilter !== 'All'
                        ? 'Try adjusting your search criteria or filters'
                        : 'Start by adding your first tenant or prospect'
                      }
                    </p>

                  </motion.div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                  {filteredTenants.map((tenant, index) => (
                    <TenantCard
                      key={tenant.id}
                      tenant={tenant}
                      onEdit={handleEditTenant}
                      onView={handleViewTenant}
                      onDelete={handleDeleteTenant}
                      onMessage={handleMessageTenant}
                      onScheduleVisit={handleScheduleVisit}
                      onSendContract={handleSendContract}
                      delay={index * 0.1}
                    />
                  ))}
                </div>
              )}
            </AnimatedCard>
          </div>
        </main>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showDetailModal && selectedTenant && (
          <TenantDetailModal
            isOpen={showDetailModal}
            onClose={() => setShowDetailModal(false)}
            tenant={selectedTenant}
            onUpdate={(updatedTenant) => {
              setTenants(prev => prev.map(t =>
                t.id === updatedTenant.id ? updatedTenant : t
              ));
            }}
          />
        )}

        {showVisitModal && selectedTenant && (
          <VisitRequestModal
            isOpen={showVisitModal}
            onClose={() => setShowVisitModal(false)}
            tenant={selectedTenant}
            onSchedule={handleVisitScheduled}
          />
        )}

        {showContractModal && selectedTenant && (
          <ContractModal
            isOpen={showContractModal}
            onClose={() => setShowContractModal(false)}
            tenant={selectedTenant}
            onSendContract={handleContractSent}
          />
        )}
      </AnimatePresence>

      {/* Notifications */}
      <NotificationToast
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  );
};

export default LandlordTenant;