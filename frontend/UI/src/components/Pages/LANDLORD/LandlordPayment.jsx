import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import LandlordSideBar from './LandlordSideBar';
import LandlordNavBar from './LandlordNavBar';
import { getCurrentYear } from '../../../utils/dateUtils.js';
import {
  CreditCard, IndianRupee, TrendingUp, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Download, Receipt, Crown, Building2, Users, Plus, Edit, Trash2, Wallet, Trophy, X, Check, Info, Database, ShieldCheck, Loader, RotateCcw, ArrowRight, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../services/api.js';
import LandlordRazorpayCheckout from './LandlordRazorpayCheckout';

// Import the shared DarkModeContext instead of using custom theme hook
import { useDarkMode } from '../../../useDarkMode.js';

// Custom Hooks
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
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

const useCountUp = (end, duration = 2000, start = 0) => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    if (end === start) return;

    const startTime = Date.now();

    const updateCount = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      const currentCount = start + (end - start) * easeOutQuart;
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };

    requestAnimationFrame(updateCount);
  }, [end, duration, start]);

  return count;
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
const AnimatedCard = ({ children, delay = 0, className = '', darkMode, ...props }) => {
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

// Payment Method Card Component
const PaymentMethodCard = ({ method, isSelected, onSelect, onEdit, onDelete, darkMode }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getCardIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'visa':
        return <div className="text-blue-600 font-bold text-lg">VISA</div>;
      case 'mastercard':
        return <div className="text-red-600 font-bold text-lg">MC</div>;
      case 'amex':
        return <div className="text-blue-800 font-bold text-lg">AMEX</div>;
      case 'paypal':
        return <div className="text-blue-500 font-bold text-lg">PP</div>;
      case 'bank':
        return <Building2 className="w-6 h-6 text-emerald-600" />;
      case 'upi':
        return <div className="text-purple-600 font-bold text-lg">UPI</div>;
      default:
        return <CreditCard className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />;
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(method.id)}
      className={`relative p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden ${isSelected
        ? darkMode
          ? 'border-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-400/20'
          : 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/20'
        : darkMode
          ? 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800/70'
          : 'border-indigo-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50'
        }`}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className={`absolute -top-4 -right-4 w-32 h-32 ${darkMode ? 'bg-gradient-to-br from-cyan-400' : 'bg-gradient-to-br from-indigo-500'} to-transparent rounded-full`} />
        <div className={`absolute -bottom-4 -left-4 w-24 h-24 ${darkMode ? 'bg-gradient-to-tr from-cyan-400' : 'bg-gradient-to-tr from-indigo-500'} to-transparent rounded-full`} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          {getCardIcon(method.type)}

          <div className="flex items-center space-x-2">
            {method.isDefault && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-2 py-1 bg-emerald-500/20 rounded-full"
              >
                <span className="text-xs text-emerald-400 font-semibold">Default</span>
              </motion.div>
            )}

            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`w-6 h-6 ${darkMode ? 'bg-cyan-400' : 'bg-indigo-500'} rounded-full flex items-center justify-center`}
              >
                <Check className="w-4 h-4 text-white" />
              </motion.div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className={`${darkMode ? 'text-cyan-100' : 'text-indigo-700'} font-medium`}>
            {method.type === 'bank' ? method.bankName : method.type === 'upi' ? method.id : `•••• •••• •••• ${method.last4}`}
          </div>

          <div className={`flex items-center justify-between ${darkMode ? 'text-blue-200' : 'text-gray-600'} text-sm`}>
            <span>{method.name || method.holderName}</span>
            {method.expiryDate && (
              <span>{method.expiryDate}</span>
            )}
          </div>

          {method.type === 'bank' && (
            <div className={`${darkMode ? 'text-cyan-100' : 'text-gray-500'} text-xs`}>
              Account: •••••••{method.accountNumber?.slice(-4)}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-4 right-4 flex space-x-1"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(method);
                }}
                className={`p-1 ${darkMode ? 'bg-slate-600/70 hover:bg-slate-600' : 'bg-indigo-100/70 hover:bg-indigo-200'} rounded-lg transition-colors`}
              >
                <Edit className={`w-3 h-3 ${darkMode ? 'text-cyan-300' : 'text-indigo-600'}`} />
              </motion.button>

              {!method.isDefault && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(method.id);
                  }}
                  className="p-1 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  <Trash2 className="w-3 h-3 text-red-400" />
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
const SubscriptionPlanCard = ({ plan, currentPlan, onSelect, onUpgrade, popular = false, darkMode }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isCurrentPlan = currentPlan?.id === plan.id;
  const canUpgrade = currentPlan && plan.tier > currentPlan.tier;
  const canDowngrade = currentPlan && plan.tier < currentPlan.tier;

  const cardTheme = darkMode
    ? {
      bg: popular
        ? 'border-amber-500 bg-gradient-to-br from-amber-950/20 via-zinc-900 to-zinc-950/80 shadow-2xl shadow-amber-500/5'
        : isCurrentPlan
          ? 'border-emerald-500/40 bg-zinc-900/80'
          : 'border-zinc-800 bg-zinc-900/60 hover:border-amber-500/30 hover:bg-zinc-900/80',
      textTitle: 'text-amber-100',
      textDesc: 'text-zinc-400',
      textPrice: 'text-amber-400',
      badgeBg: 'bg-gradient-to-r from-amber-500 to-yellow-600 text-zinc-950',
      iconBg: 'bg-gradient-to-br from-amber-500/20 to-yellow-600/10 border border-amber-500/30',
      limitBg: 'bg-zinc-950/60 border border-zinc-800',
      checkBg: 'bg-amber-500/20',
      checkColor: 'text-amber-400',
    }
    : {
      bg: popular
        ? 'border-amber-500 bg-gradient-to-br from-amber-50/50 via-white to-amber-100/30 shadow-2xl shadow-amber-500/10'
        : isCurrentPlan
          ? 'border-emerald-500 bg-emerald-50/50'
          : 'border-amber-200/60 bg-white hover:border-amber-400 hover:bg-amber-50/30',
      textTitle: 'text-amber-950 font-black',
      textDesc: 'text-stone-600',
      textPrice: 'text-amber-600',
      badgeBg: 'bg-gradient-to-r from-amber-500 to-yellow-600 text-zinc-950',
      iconBg: 'bg-gradient-to-br from-amber-100 to-yellow-50 border border-amber-300',
      limitBg: 'bg-amber-50/30 border border-amber-100',
      checkBg: 'bg-amber-100',
      checkColor: 'text-amber-600',
    };

  return (
    <motion.div
      whileHover={{ scale: isCurrentPlan ? 1 : 1.03, y: isCurrentPlan ? 0 : -8 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative p-8 rounded-3xl border-2 transition-all duration-500 overflow-hidden ${cardTheme.bg}`}
    >
      {/* Popular badge */}
      {popular && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full shadow-md shadow-amber-500/20"
        >
          <span className="text-zinc-950 text-sm font-black flex items-center space-x-1.5 uppercase tracking-wider">
            <Crown className="w-4 h-4 text-zinc-950 fill-zinc-950 animate-pulse" />
            <span>VIP Choice</span>
          </span>
        </motion.div>
      )}

      {/* Current plan badge */}
      {isCurrentPlan && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-4 right-4 px-3 py-1 bg-emerald-500/20 rounded-full border border-emerald-500/30"
        >
          <span className="text-emerald-400 text-xs font-black uppercase tracking-wider">Active</span>
        </motion.div>
      )}

      {/* Subtle gold gradient radial blur behind the card */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10">
        {/* Plan header */}
        <div className="text-center mb-8">
          <div
            className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${cardTheme.iconBg} flex items-center justify-center`}
          >
            {React.cloneElement(plan.icon, { className: `w-8 h-8 ${darkMode ? 'text-amber-400' : 'text-amber-600'}` })}
          </div>

          <h3 className={`text-2xl font-black ${cardTheme.textTitle} mb-2 tracking-tight`}>{plan.name}</h3>
          <p className={`${cardTheme.textDesc} text-sm font-medium`}>{plan.description}</p>
        </div>

        {/* Pricing */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <span className={`text-5xl font-black ${cardTheme.textPrice} tracking-tight`}>
              ₹{plan.price.toLocaleString('en-IN')}
            </span>
          </div>
          <div className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-zinc-500' : 'text-stone-400'}`}>
            {plan.validity}
          </div>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-8">
          {plan.features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center space-x-3"
            >
              <div className={`w-5 h-5 ${cardTheme.checkBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                <Check className={`w-3.5 h-3.5 ${cardTheme.checkColor} stroke-[3]`} />
              </div>
              <span className={`${darkMode ? 'text-zinc-300' : 'text-stone-700'} text-sm font-semibold`}>{feature}</span>
            </motion.div>
          ))}
        </div>

        {/* Plan limits */}
        <div className={`${cardTheme.limitBg} rounded-2xl p-4 mb-8 shadow-inner`}>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className={`text-2xl font-black ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>{plan.propertyLimit}</div>
              <div className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-zinc-500' : 'text-stone-400'}`}>Properties</div>
            </div>
            <div>
              <div className={`text-2xl font-black ${darkMode ? 'text-yellow-500' : 'text-yellow-600'}`}>{plan.supportLevel}</div>
              <div className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-zinc-500' : 'text-stone-400'}`}>Support</div>
            </div>
          </div>
        </div>

        {/* Action button */}
        <motion.button
          whileHover={{ scale: isCurrentPlan ? 1 : 1.04 }}
          whileTap={{ scale: isCurrentPlan ? 1 : 0.96 }}
          onClick={() => {
            if (isCurrentPlan) return;
            if (canUpgrade) onUpgrade(plan);
            else onSelect(plan);
          }}
          disabled={isCurrentPlan}
          className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider text-sm transition-all duration-300 border-2 ${isCurrentPlan
            ? 'bg-zinc-800/40 border-zinc-700/50 text-zinc-500 cursor-not-allowed border-zinc-800/50'
            : popular
              ? 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-zinc-950 border-amber-500 shadow-lg shadow-amber-500/10'
              : 'bg-transparent border-amber-500 text-amber-500 hover:bg-gradient-to-r hover:from-amber-500 hover:to-yellow-600 hover:text-zinc-950 hover:shadow-lg'
            }`}
        >
          {isCurrentPlan
            ? 'Active Plan'
            : canUpgrade
              ? 'Upgrade Portal'
              : canDowngrade
                ? 'Downgrade'
                : 'Select Plan'
          }
        </motion.button>
      </div>
    </motion.div>
  );
};

// Payment History Item Component
const PaymentHistoryItem = ({ payment, onDownloadReceipt, onViewDetails, darkMode }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'refunded':
        return <RotateCcw className="w-5 h-5 text-blue-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'refunded':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, boxShadow: darkMode ? "0 10px 30px rgba(0,0,0,0.4)" : "0 10px 30px rgba(0,0,0,0.1)" }}
      className={`${darkMode
        ? 'bg-slate-800/50 backdrop-blur-xl border border-slate-700 hover:border-slate-600'
        : 'bg-white/90 backdrop-blur-xl border border-indigo-200 hover:border-indigo-300'
        } rounded-xl p-6 transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={`w-12 h-12 ${darkMode
              ? 'bg-gradient-to-br from-cyan-500 to-blue-600'
              : 'bg-gradient-to-br from-indigo-500 to-purple-600'
              } rounded-xl flex items-center justify-center`}
          >
            <Receipt className="w-6 h-6 text-white" />
          </motion.div>

          <div>
            <h4 className={`font-semibold ${darkMode ? 'text-cyan-100' : 'text-indigo-700'}`}>{payment.description}</h4>
            <p className={`${darkMode ? 'text-blue-200' : 'text-gray-600'} text-sm`}>
              {new Date(payment.date).toLocaleDateString()} • {payment.method}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className={`text-xl font-bold ${darkMode ? 'text-cyan-100' : 'text-indigo-700'} mb-1`}>
            ₹{payment.amount.toFixed(2)}
          </div>
          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(payment.status)}`}>
            {getStatusIcon(payment.status)}
            <span className="capitalize">{payment.status}</span>
          </div>
        </div>
      </div>

      {payment.invoiceId && (
        <div className={`flex items-center justify-between pt-4 border-t ${darkMode ? 'border-slate-700' : 'border-indigo-200'}`}>
          <div className={`${darkMode ? 'text-blue-200' : 'text-gray-600'} text-sm`}>
            Invoice #{payment.invoiceId}
          </div>

          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onViewDetails(payment)}
              className={`px-3 py-1 ${darkMode
                ? 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30'
                : 'bg-indigo-500/20 text-indigo-600 hover:bg-indigo-500/30'
                } rounded-lg transition-colors text-sm`}
            >
              View Details
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDownloadReceipt(payment)}
              className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors text-sm flex items-center space-x-1"
            >
              <Download className="w-3 h-3" />
              <span>Receipt</span>
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Billing Summary Component
const BillingSummary = ({ summary, onPayNow, isSubscribed, nextRenewalDate, darkMode }) => {
  const daysUntilDue = Math.ceil((new Date(summary.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysUntilDue < 0;
  const isDueSoon = daysUntilDue <= 3 && daysUntilDue > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative overflow-hidden rounded-2xl p-8 ${
        isSubscribed
          ? darkMode
            ? 'bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border-2 border-emerald-500/50'
            : 'bg-gradient-to-br from-emerald-50 to-teal-100/70 border-2 border-emerald-400'
          : isOverdue
            ? 'bg-gradient-to-br from-red-500/20 to-red-600/20 border-2 border-red-500/50'
            : isDueSoon
              ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50'
              : darkMode
                ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/50'
                : 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-2 border-indigo-500/50'
      }`}
    >
      {/* Background animation */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`absolute -top-20 -right-20 w-40 h-40 ${
            isSubscribed
              ? 'bg-gradient-to-br from-emerald-400'
              : darkMode
                ? 'bg-gradient-to-br from-cyan-400'
                : 'bg-gradient-to-br from-indigo-400'
          } to-transparent rounded-full`}
        />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`text-2xl font-bold ${
              isSubscribed
                ? darkMode ? 'text-emerald-300' : 'text-emerald-800'
                : darkMode ? 'text-cyan-100' : 'text-indigo-700'
            } mb-2`}>
              {isSubscribed ? 'Active Subscription' : 'Current Bill'}
            </h3>
            <p className={`${darkMode ? 'text-blue-200' : 'text-gray-600'}`}>
              {summary.planName} • {summary.propertiesCount} {summary.propertiesCount === 1 ? 'property' : 'properties'}
            </p>
          </div>

          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className={`w-16 h-16 ${
              isSubscribed
                ? darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
                : darkMode ? 'bg-slate-700/50' : 'bg-indigo-100/50'
            } rounded-2xl flex items-center justify-center`}
          >
            {isSubscribed ? (
              <ShieldCheck className="w-8 h-8" />
            ) : (
              <IndianRupee className={`w-8 h-8 ${darkMode ? 'text-cyan-300' : 'text-indigo-600'}`} />
            )}
          </motion.div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between">
            <span className={`${darkMode ? 'text-blue-200' : 'text-gray-600'}`}>Subscription Fee</span>
            <span className={`${darkMode ? 'text-cyan-100' : 'text-indigo-700'} font-semibold`}>₹{summary.subscriptionFee.toFixed(2)}</span>
          </div>

          {summary.additionalFees > 0 && (
            <div className="flex justify-between">
              <span className={`${darkMode ? 'text-blue-200' : 'text-gray-600'}`}>Additional Features</span>
              <span className={`${darkMode ? 'text-cyan-100' : 'text-indigo-700'} font-semibold`}>₹{summary.additionalFees.toFixed(2)}</span>
            </div>
          )}

          {summary.discount > 0 && (
            <div className="flex justify-between">
              <span className="text-emerald-400">Discount Applied</span>
              <span className="text-emerald-400 font-semibold">-₹{summary.discount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className={`${darkMode ? 'text-blue-200' : 'text-gray-600'}`}>Tax (18% GST)</span>
            <span className={`${darkMode ? 'text-cyan-100' : 'text-indigo-700'} font-semibold`}>₹{summary.tax.toFixed(2)}</span>
          </div>

          <div className={`h-px ${darkMode ? 'bg-slate-600' : 'bg-indigo-200'}`}></div>

          <div className="flex justify-between text-xl">
            <span className={`${
              isSubscribed
                ? darkMode ? 'text-emerald-300' : 'text-emerald-800'
                : darkMode ? 'text-cyan-100' : 'text-indigo-700'
            } font-bold`}>
              {isSubscribed ? 'Amount Paid' : 'Total Amount'}
            </span>
            <span className={`${
              isSubscribed
                ? darkMode ? 'text-emerald-300' : 'text-emerald-800'
                : darkMode ? 'text-cyan-100' : 'text-indigo-700'
            } font-bold`}>
              ₹{summary.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <div className={`${darkMode ? 'text-blue-200' : 'text-gray-600'} text-sm`}>
              {isSubscribed ? 'Next Renewal Date' : 'Due Date'}
            </div>
            <div className={`text-lg font-semibold ${
              isSubscribed
                ? darkMode ? 'text-emerald-300' : 'text-emerald-800'
                : isOverdue ? 'text-red-400' : isDueSoon ? 'text-yellow-400' : darkMode ? 'text-cyan-100' : 'text-indigo-700'
            }`}>
              {new Date(summary.dueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          <div className="text-right">
            <div className={`${darkMode ? 'text-blue-200' : 'text-gray-600'} text-sm`}>
              {isSubscribed ? 'Days Remaining' : isOverdue ? 'Overdue by' : 'Due in'}
            </div>
            <div className={`text-lg font-semibold ${
              isSubscribed
                ? darkMode ? 'text-emerald-300' : 'text-emerald-800'
                : isOverdue ? 'text-red-400' : isDueSoon ? 'text-yellow-400' : darkMode ? 'text-cyan-100' : 'text-indigo-700'
            }`}>
              {Math.abs(daysUntilDue)} days
            </div>
          </div>
        </div>

        {isSubscribed ? (
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            darkMode ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 animate-pulse text-emerald-400" />
              <span className="font-bold text-sm uppercase tracking-wider">Subscribed &amp; Secure</span>
            </div>
            <span className="text-sm font-semibold">
              Renewal Auto-Tracked
            </span>
          </div>
        ) : (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onPayNow}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-300 ${isOverdue
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25'
                : isDueSoon
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 shadow-lg shadow-yellow-500/25'
                  : darkMode
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/25'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25'
                }`}
            >
              {isOverdue ? 'Pay Overdue Amount' : 'Pay Now'}
            </motion.button>

            {isOverdue && (
              <p className="text-red-400 text-sm text-center mt-3">
                Late fees may apply. Please pay immediately to avoid service interruption.
              </p>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

// Financial Reconciliation Ledger & Yield Component
const FinancialReconciliationLedger = ({ totalRent, totalPlatformFees, netMargin, yieldPct, platformCostPct, darkMode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-3xl p-8 border backdrop-blur-xl ${
        darkMode
          ? 'bg-slate-900/60 border-slate-700/50 text-slate-100 shadow-2xl'
          : 'bg-white/80 border-indigo-100/50 text-gray-900 shadow-xl'
      }`}
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className={`p-3 rounded-2xl ${darkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600'}`}>
          <Trophy className="w-8 h-8" />
        </div>
        <div>
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-amber-300' : 'text-amber-950 font-black'}`}>
            Financial Yield &amp; Yield Ledger
          </h3>
          <p className={`text-sm ${darkMode ? 'text-blue-200' : 'text-stone-600'}`}>
            Reconcile tenant rent collected against Ghar Nishchit platform subscription costs
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-800/40 border-slate-700/40' : 'bg-stone-50/50 border-indigo-50'} transition-all hover:scale-[1.02]`}>
          <div className="flex justify-between items-start mb-2">
            <span className={`text-sm font-semibold ${darkMode ? 'text-blue-200' : 'text-stone-500'}`}>Gross Rent Revenue</span>
            <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className={`text-3xl font-black ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
            ₹{totalRent.toLocaleString('en-IN')}
          </div>
          <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`}>Active tenant payments processed</p>
        </div>

        <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-800/40 border-slate-700/40' : 'bg-stone-50/50 border-indigo-50'} transition-all hover:scale-[1.02]`}>
          <div className="flex justify-between items-start mb-2">
            <span className={`text-sm font-semibold ${darkMode ? 'text-blue-200' : 'text-stone-500'}`}>Platform Cost</span>
            <span className="p-1 rounded-lg bg-red-500/10 text-red-400">
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>
          <div className={`text-3xl font-black ${darkMode ? 'text-red-400' : 'text-red-500'}`}>
            ₹{totalPlatformFees.toLocaleString('en-IN')}
          </div>
          <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`}>Listing &amp; subscription fees paid</p>
        </div>

        <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gradient-to-br from-slate-800/60 to-amber-950/20 border-amber-500/20' : 'bg-gradient-to-br from-amber-50/20 to-orange-50/20 border-amber-200'} transition-all hover:scale-[1.02]`}>
          <div className="flex justify-between items-start mb-2">
            <span className={`text-sm font-semibold ${darkMode ? 'text-amber-200' : 'text-amber-900'}`}>Net Operating Profit</span>
            <span className="p-1 rounded-lg bg-amber-500/10 text-amber-500">
              <Crown className="w-4 h-4" />
            </span>
          </div>
          <div className={`text-3xl font-black ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>
            ₹{netMargin.toLocaleString('en-IN')}
          </div>
          <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`}>Net yield kept in portfolio</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm font-bold mb-2">
          <span className={darkMode ? 'text-blue-200' : 'text-stone-700'}>Rent Yield Ratio</span>
          <span className={darkMode ? 'text-amber-300' : 'text-amber-600'}>{yieldPct.toFixed(1)}%</span>
        </div>
        <div className={`w-full h-4 rounded-full overflow-hidden flex ${darkMode ? 'bg-slate-700' : 'bg-indigo-50'}`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${yieldPct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-emerald-400 to-amber-500"
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${platformCostPct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-red-400"
          />
        </div>
        <div className="flex justify-between text-xs mt-2 text-gray-400 font-semibold">
          <span>Profit Margin ({yieldPct.toFixed(1)}%)</span>
          <span>Platform Overhead ({platformCostPct.toFixed(1)}%)</span>
        </div>
      </div>

      <div className={`p-4 rounded-2xl ${darkMode ? 'bg-slate-800/60 border border-slate-700/50' : 'bg-amber-50/50 border border-amber-200/40'} flex items-start space-x-3`}>
        <div className="mt-0.5">
          <ShieldCheck className={`w-5 h-5 ${darkMode ? 'text-cyan-400' : 'text-indigo-600'}`} />
        </div>
        <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-stone-700'} leading-relaxed`}>
          <strong>Capital Efficiency Boost:</strong> You keep <span className={darkMode ? 'text-amber-300' : 'text-amber-700 font-bold'}>{yieldPct.toFixed(1)}%</span> of all rent revenue collected. By utilizing Ghar Nishchit&apos;s subscription-based plan rather than standard high percentage cuts, your capital yield remains highly optimized!
        </p>
      </div>
    </motion.div>
  );
};


// Notification Toast Component
const NotificationToast = ({ notifications, onRemove, darkMode }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className={`p-4 rounded-lg shadow-lg backdrop-blur-xl border max-w-sm ${notification.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' :
              notification.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-400' :
                notification.type === 'warning' ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400' :
                  darkMode
                    ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400'
                    : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-600'
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

// Add Payment Method Modal Component
// Add/Edit Payment Method Modal Component
const AddEditPaymentMethodModal = ({ isOpen, onClose, onAdd, onEdit, methodToEdit, darkMode }) => {
  const [paymentType, setPaymentType] = useState('card');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [bankDetails, setBankDetails] = useState({ bankName: '', accountNumber: '', name: '' });
  const [upiId, setUpiId] = useState('');

  const isEditMode = !!methodToEdit;

  useEffect(() => {
    if (isOpen) {
      if (methodToEdit) {
        if (methodToEdit.type === 'upi') {
          setPaymentType('upi');
          setUpiId(methodToEdit.id || '');
        } else if (methodToEdit.type === 'bank') {
          setPaymentType('bank');
          setBankDetails({
            bankName: methodToEdit.bankName || '',
            accountNumber: methodToEdit.accountNumber ? methodToEdit.accountNumber.replace('****', '') : '',
            name: methodToEdit.holderName || ''
          });
        } else {
          setPaymentType('card');
          setCardDetails({
            number: methodToEdit.last4 ? `•••• •••• •••• ${methodToEdit.last4}` : '',
            expiry: methodToEdit.expiryDate || '',
            cvv: '•••',
            name: methodToEdit.holderName || ''
          });
        }
      } else {
        // Reset to default addition state
        setPaymentType('card');
        setCardDetails({ number: '', expiry: '', cvv: '', name: '' });
        setBankDetails({ bankName: '', accountNumber: '', name: '' });
        setUpiId('');
      }
    }
  }, [isOpen, methodToEdit]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (paymentType === 'card') {
      if (!cardDetails.name || !cardDetails.number || !cardDetails.expiry) {
        alert('Please fill in all card details');
        return;
      }
      
      const cleanNum = cardDetails.number.replace(/\s+/g, '');
      const last4 = cleanNum.length >= 4 ? cleanNum.slice(-4) : (methodToEdit?.last4 || '4242');
      const type = cleanNum.startsWith('5') ? 'mastercard' : cleanNum.startsWith('3') ? 'amex' : 'visa';

      const payload = {
        type,
        last4,
        expiryDate: cardDetails.expiry || '12/25',
        holderName: cardDetails.name,
      };

      if (isEditMode) {
        onEdit({ ...methodToEdit, ...payload });
      } else {
        onAdd(payload);
      }
    } else if (paymentType === 'bank') {
      if (!bankDetails.bankName || !bankDetails.accountNumber || !bankDetails.name) {
        alert('Please fill in all bank details');
        return;
      }

      const rawAccount = bankDetails.accountNumber;
      const accSuffix = rawAccount.length >= 4 ? rawAccount.slice(-4) : '1234';
      const payload = {
        type: 'bank',
        bankName: bankDetails.bankName,
        accountNumber: `****${accSuffix}`,
        holderName: bankDetails.name,
      };

      if (isEditMode) {
        onEdit({ ...methodToEdit, ...payload });
      } else {
        onAdd(payload);
      }
    } else {
      if (!upiId) {
        alert('Please enter your UPI ID');
        return;
      }
      
      const payload = {
        type: 'upi',
        id: upiId,
        holderName: upiId.split('@')[0] || 'User',
      };

      if (isEditMode) {
        onEdit({ ...methodToEdit, ...payload });
      } else {
        onAdd(payload);
      }
    }
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`${darkMode
          ? 'bg-slate-800/90 backdrop-blur-xl border border-slate-700'
          : 'bg-white/90 backdrop-blur-xl border border-indigo-200'
          } rounded-2xl w-full max-w-md overflow-hidden shadow-2xl`}
        onClick={e => e.stopPropagation()}
      >
        <div className={`p-6 border-b ${darkMode ? 'border-slate-700' : 'border-indigo-200'}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-cyan-100' : 'text-indigo-700'}`}>
              {isEditMode ? 'Edit Payment Method' : 'Add Payment Method'}
            </h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-indigo-100'} transition-colors`}
            >
              <X className={`w-6 h-6 ${darkMode ? 'text-cyan-300' : 'text-indigo-600'}`} />
            </motion.button>
          </div>
        </div>

        <div className="p-6">
          {/* Prevent tab-switching when editing type directly (types are locked for security) */}
          <div className="flex mb-6">
            <button
              onClick={() => !isEditMode && setPaymentType('card')}
              disabled={isEditMode && paymentType !== 'card'}
              className={`flex-1 py-2 text-center font-semibold rounded-l-lg transition-all ${paymentType === 'card'
                ? darkMode ? 'bg-cyan-500 text-white' : 'bg-indigo-500 text-white'
                : darkMode ? 'bg-slate-700 text-blue-200' : 'bg-gray-200 text-gray-600'
                } ${(isEditMode && paymentType !== 'card') ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Card
            </button>
            <button
              onClick={() => !isEditMode && setPaymentType('bank')}
              disabled={isEditMode && paymentType !== 'bank'}
              className={`flex-1 py-2 text-center font-semibold transition-all ${paymentType === 'bank'
                ? darkMode ? 'bg-cyan-500 text-white' : 'bg-indigo-500 text-white'
                : darkMode ? 'bg-slate-700 text-blue-200' : 'bg-gray-200 text-gray-600'
                } ${(isEditMode && paymentType !== 'bank') ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Bank
            </button>
            <button
              onClick={() => !isEditMode && setPaymentType('upi')}
              disabled={isEditMode && paymentType !== 'upi'}
              className={`flex-1 py-2 text-center font-semibold rounded-r-lg transition-all ${paymentType === 'upi'
                ? darkMode ? 'bg-cyan-500 text-white' : 'bg-indigo-500 text-white'
                : darkMode ? 'bg-slate-700 text-blue-200' : 'bg-gray-200 text-gray-600'
                } ${(isEditMode && paymentType !== 'upi') ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              UPI
            </button>
          </div>

          <AnimatePresence mode="wait">
            {paymentType === 'card' && (
              <motion.div
                key="card-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div>
                  <label className={`block ${darkMode ? 'text-blue-200' : 'text-gray-600'} text-sm mb-2`}>Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.number}
                    onChange={e => setCardDetails({ ...cardDetails, number: e.target.value })}
                    className={`w-full p-3 ${darkMode ? 'bg-slate-700/50 border border-slate-600 text-cyan-100' : 'bg-indigo-50/50 border border-indigo-200 text-indigo-700'} rounded-lg focus:outline-none`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block ${darkMode ? 'text-blue-200' : 'text-gray-600'} text-sm mb-2`}>Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={e => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                      className={`w-full p-3 ${darkMode ? 'bg-slate-700/50 border border-slate-600 text-cyan-100' : 'bg-indigo-50/50 border border-indigo-200 text-indigo-700'} rounded-lg focus:outline-none`}
                    />
                  </div>
                  <div>
                    <label className={`block ${darkMode ? 'text-blue-200' : 'text-gray-600'} text-sm mb-2`}>CVV</label>
                    <input
                      type="password"
                      placeholder="•••"
                      value={cardDetails.cvv}
                      onChange={e => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                      className={`w-full p-3 ${darkMode ? 'bg-slate-700/50 border border-slate-600 text-cyan-100' : 'bg-indigo-50/50 border border-indigo-200 text-indigo-700'} rounded-lg focus:outline-none`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block ${darkMode ? 'text-blue-200' : 'text-gray-600'} text-sm mb-2`}>Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={cardDetails.name}
                    onChange={e => setCardDetails({ ...cardDetails, name: e.target.value })}
                    className={`w-full p-3 ${darkMode ? 'bg-slate-700/50 border border-slate-600 text-cyan-100' : 'bg-indigo-50/50 border border-indigo-200 text-indigo-700'} rounded-lg focus:outline-none`}
                  />
                </div>
              </motion.div>
            )}

            {paymentType === 'bank' && (
              <motion.div
                key="bank-form"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-4"
              >
                <div>
                  <label className={`block ${darkMode ? 'text-blue-200' : 'text-gray-600'} text-sm mb-2`}>Bank Name</label>
                  <input
                    type="text"
                    placeholder="Chase Bank or HDFC"
                    value={bankDetails.bankName}
                    onChange={e => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                    className={`w-full p-3 ${darkMode ? 'bg-slate-700/50 border border-slate-600 text-cyan-100' : 'bg-indigo-50/50 border border-indigo-200 text-indigo-700'} rounded-lg focus:outline-none`}
                  />
                </div>
                <div>
                  <label className={`block ${darkMode ? 'text-blue-200' : 'text-gray-600'} text-sm mb-2`}>Account Number</label>
                  <input
                    type="text"
                    placeholder="1234567890"
                    value={bankDetails.accountNumber}
                    onChange={e => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                    className={`w-full p-3 ${darkMode ? 'bg-slate-700/50 border border-slate-600 text-cyan-100' : 'bg-indigo-50/50 border border-indigo-200 text-indigo-700'} rounded-lg focus:outline-none`}
                  />
                </div>
                <div>
                  <label className={`block ${darkMode ? 'text-blue-200' : 'text-gray-600'} text-sm mb-2`}>Account Holder Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={bankDetails.name}
                    onChange={e => setBankDetails({ ...bankDetails, name: e.target.value })}
                    className={`w-full p-3 ${darkMode ? 'bg-slate-700/50 border border-slate-600 text-cyan-100' : 'bg-indigo-50/50 border border-indigo-200 text-indigo-700'} rounded-lg focus:outline-none`}
                  />
                </div>
              </motion.div>
            )}

            {paymentType === 'upi' && (
              <motion.div
                key="upi-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <label className={`block ${darkMode ? 'text-blue-200' : 'text-gray-600'} text-sm mb-2`}>UPI ID</label>
                  <input
                    type="text"
                    placeholder="yourname@bank"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    className={`w-full p-3 ${darkMode ? 'bg-slate-700/50 border border-slate-600 text-cyan-100' : 'bg-indigo-50/50 border border-indigo-200 text-indigo-700'} rounded-lg focus:outline-none`}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={`p-6 border-t ${darkMode ? 'border-slate-700' : 'border-indigo-200'}`}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            className={`w-full py-3 ${darkMode
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600'
              : 'bg-gradient-to-r from-indigo-500 to-purple-600'
              } text-white rounded-xl font-bold`}
          >
            {isEditMode ? 'Update Payment Method' : 'Save Payment Method'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * normaliseAmount
 * ---------------
 * Razorpay always stores/returns amounts in paise (smallest currency unit).
 * e.g. ₹1,179 is stored as 117900.
 *
 * However, some legacy records or certain API responses may already be in
 * rupees (e.g. a direct DB insert that stored 1179 instead of 117900).
 *
 * Rule:
 *   - If the raw value is an integer AND >= 100 we assume paise → divide by 100
 *   - If the raw value already has decimal places (e.g. 1179.00 stored as float)
 *     or is < 100, treat as already in rupees
 *
 * This covers ₹499 (49900 paise), ₹999 (99900), ₹1179 (117900) correctly.
 */
function normaliseAmount(raw) {
  const n = typeof raw === 'number' ? raw : parseFloat(raw);
  if (isNaN(n) || n === 0) return 0;
  // If it's a whole number >= 100 → assume paise
  if (Number.isInteger(n) && n >= 100) return parseFloat((n / 100).toFixed(2));
  // Already in rupees (e.g. 1179.00 or small amounts like 9.99)
  return parseFloat(n.toFixed(2));
}


// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
const LandlordPayment = () => {
  const [currentSection] = useState('Payments');
  const [activeTab, setActiveTab] = useState('billing');
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  // Track which plan is being purchased so LandlordRazorpayCheckout gets full context
  const [checkoutPlan, setCheckoutPlan] = useState(null);

  const { darkMode } = useDarkMode();
  const sidebarWidthClass = '[margin-left:var(--sidebar-width,18rem)]';
  const tc = darkMode ? {
    mainBg: 'from-black via-zinc-950 to-amber-950/20',
  } : {
    mainBg: 'from-amber-50/40 via-stone-50 to-orange-50/30',
  };
  const { notifications, addNotification, removeNotification } = useNotification();

  // ─── Subscription Plans (synced with landing page pricing) ─────────────────────
  const [subscriptionPlans] = useState([
    {
      id: 1,
      name: 'Standard Listing',
      description: 'Perfect for individual landlords starting out',
      price: 499,
      validity: 'Subscription valid for 30 days',
      propertyLimit: '1',
      supportLevel: 'Email',
      tier: 1,
      icon: <Building2 className="w-8 h-8 text-white" />,
      features: [
        'List 1 property',
        'Subscription valid for 30 days',
        'Basic property analytics',
        'Email support',
        'Responsive web access'
      ]
    },
    {
      id: 2,
      name: 'Featured Listing',
      description: 'Best for landlords who want maximum visibility',
      price: 999,
      validity: '60-day listing validity',
      propertyLimit: '5/mo',
      supportLevel: 'Priority',
      tier: 2,
      icon: <Crown className="w-8 h-8 text-white" />,
      features: [
        'Boosted visibility in search',
        '60-day listing validity',
        'Priority placement',
        'List 5 properties per month',
        'Priority support'
      ]
    },
    {
      id: 3,
      name: 'Verified Badge',
      description: 'For serious landlords with large portfolios',
      price: 1499,
      validity: 'One-time verification + monthly billing',
      propertyLimit: 'Unlimited',
      supportLevel: 'Premium',
      tier: 3,
      icon: <Trophy className="w-8 h-8 text-white" />,
      features: [
        'Trust verification badge',
        'Enhanced credibility with tenants',
        'One-time verification',
        'Unlimited property listings per month',
        'All features of Standard & Featured Listing',
        'Premium priority support'
      ]
    }
  ]);

  const [currentPlan, setCurrentPlan] = useState(subscriptionPlans[1]); // Featured Listing as default
  const [nextRenewalDate, setNextRenewalDate] = useState(null);

  const [paymentMethods, setPaymentMethods] = useLocalStorage('landlord_payment_methods', [
    {
      id: 1,
      type: 'visa',
      last4: '4242',
      expiryDate: '12/25',
      holderName: 'John Doe',
      isDefault: true
    },
    {
      id: 2,
      type: 'mastercard',
      last4: '5555',
      expiryDate: '08/26',
      holderName: 'John Doe',
      isDefault: false
    },
    {
      id: 3,
      type: 'bank',
      bankName: 'Chase Bank',
      accountNumber: '****1234',
      holderName: 'John Doe',
      isDefault: false
    }
  ]);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(paymentMethods[0]?.id);

  // ─── User & Properties ──────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(null);
  const [properties, setProperties] = useState([]);

  // ─── Real payment history from backend ─────────────────────────────────────
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  // ─── Real stats from backend ────────────────────────────────────────────────
  const [totalPaid, setTotalPaid] = useState(0);
  const [avgMonthlySpend, setAvgMonthlySpend] = useState(0);
  const [tenantRentPayments, setTenantRentPayments] = useState([]);
  const [tenantRentLoading, setTenantRentLoading] = useState(false);

  const location = useLocation();

  /**
   * fetchPaymentHistory
   * Calls GET /landlord-payments and maps each DB record to the UI shape.
   * Amount is ALWAYS stored in paise by Razorpay — use normaliseAmount() to
   * convert to rupees correctly regardless of the value's magnitude.
   */
  const fetchPaymentHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const data = await api.getLandlordSubscriptionPayments();
      const records = Array.isArray(data) ? data : (data?.payments ?? []);
      
      // Map backend status values to frontend status values
      const mapStatus = (backendStatus) => {
        const statusMap = {
          'Paid': 'completed',
          'Pending': 'pending',
          'Failed': 'failed',
          'Refunded': 'refunded',
        };
        return statusMap[backendStatus] || backendStatus.toLowerCase();
      };
      
      const mapped = records.map((p, idx) => ({
        id: p._id || p.id || idx + 1,
        description: p.planName
          ? `Subscription — ${p.planName}`
          : p.description || 'Platform Subscription Fee',
        // FIX: Use totalAmount (actual amount paid with GST) which is already in rupees
        // Fallback to amount normalized for legacy records stored in paise
        amount: p.totalAmount ? parseFloat(p.totalAmount) : normaliseAmount(p.amount),
        date: p.createdAt || p.paidAt || p.date || new Date().toISOString(),
        status: mapStatus(p.status),
        method: p.paymentMethod || p.method || 'Razorpay',
        invoiceId: p.invoiceId || p.razorpay_order_id || `INV-${p._id?.slice(-6) || idx + 1}`,
      }));
      setPaymentHistory(mapped);
    } catch (err) {
      console.warn('Could not fetch landlord payment history:', err);
      setHistoryError('Unable to load payment history. Please refresh.');
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  /**
   * fetchStats
   * Calls GET /landlord-payments/stats to populate the summary cards.
   * FIX: totalAmountSpent is already in rupees (calculated with totalAmount), don't normalize
   */
  const fetchStats = useCallback(async () => {
    try {
      const stats = await api.getLandlordSubscriptionStats();
      if (stats) {
        // totalAmountSpent is already in rupees, not paise
        const rawTotal = stats.totalAmountSpent ?? stats.totalPaid ?? stats.total_paid ?? 0;
        const paidCount = stats.paid ?? 0;
        const rawAvg = paidCount > 0 ? rawTotal / paidCount : 0;
        setTotalPaid(parseFloat(rawTotal));
        setAvgMonthlySpend(parseFloat(rawAvg));
        
        // Dynamically update current active plan
        if (stats.activePlan) {
          const matchingPlan = subscriptionPlans.find(
            p => p.name.toLowerCase() === stats.activePlan.toLowerCase()
          );
          if (matchingPlan) {
            setCurrentPlan(matchingPlan);
          }
        }

        if (stats.nextRenewalDate) {
          setNextRenewalDate(stats.nextRenewalDate);
        } else {
          setNextRenewalDate(null);
        }
      }
    } catch (err) {
      // Silently fall back to computing from local history
      console.warn('Could not fetch landlord stats:', err);
    }
  }, [subscriptionPlans]);

  const fetchTenantRentPayments = useCallback(async () => {
    setTenantRentLoading(true);
    try {
      const data = await api.getLandlordTenantPayments();
      setTenantRentPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Could not fetch tenant rent payments:', err);
    } finally {
      setTenantRentLoading(false);
    }
  }, []);

  useEffect(() => {
    if (location.state?.highlightTenantPayments) {
      setActiveTab('tenant-rent');
    }
  }, [location.state]);

  // Load user profile, properties, history and stats on mount
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const profile = await api.getProfile();
        if (mounted && profile) {
          setCurrentUser(profile);
          const userId = profile._id || profile.id || profile.userId;
          if (userId) {
            const props = await api.getPropertiesByUser(userId);
            if (mounted && Array.isArray(props)) {
              setProperties(props);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load user info for payment:', err);
      }
    };
    load();
    fetchPaymentHistory();
    fetchStats();
    fetchTenantRentPayments();
    return () => { mounted = false; };
  }, [fetchPaymentHistory, fetchStats, fetchTenantRentPayments]);

  // Update holder name of mock payment methods once user profile loads
  useEffect(() => {
    if (currentUser?.name && paymentMethods.length > 0) {
      const hasJohnDoe = paymentMethods.some(m => m.holderName === 'John Doe');
      if (hasJohnDoe) {
        const updated = paymentMethods.map(m => 
          m.holderName === 'John Doe' ? { ...m, holderName: currentUser.name } : m
        );
        setPaymentMethods(updated);
      }
    }
  }, [currentUser, paymentMethods, setPaymentMethods]);

  // Derive totalPaid / avgMonthlySpend from local history as fallback when
  // the stats endpoint hasn't populated the state values yet.
  useEffect(() => {
    if (totalPaid === 0 && paymentHistory.length > 0) {
      const computed = paymentHistory
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);
      setTotalPaid(computed);
      setAvgMonthlySpend(computed / Math.max(paymentHistory.length, 1));
    }
  }, [paymentHistory, totalPaid]);

  const isSubscribed = useMemo(() => {
    return !!nextRenewalDate;
  }, [nextRenewalDate]);

  const billingSummary = useMemo(() => {
    const planPrice = currentPlan?.price || 499;
    const tax = planPrice * 0.18;
    return {
      planName: currentPlan?.name || 'Standard Listing',
      propertiesCount: properties.length,
      subscriptionFee: planPrice,
      additionalFees: 0,
      discount: 0,
      tax: parseFloat(tax.toFixed(2)),
      totalAmount: parseFloat((planPrice + tax).toFixed(2)),
      dueDate: nextRenewalDate ? nextRenewalDate.split('T')[0] : `${getCurrentYear()}-09-01`
    };
  }, [properties, currentPlan, nextRenewalDate]);

  const daysUntilPayment = useMemo(() => {
    if (!nextRenewalDate) return 0;
    const diffTime = new Date(nextRenewalDate) - new Date();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }, [nextRenewalDate]);

  // Animated counters — called at top-level (Rules of Hooks)
  const animatedTotalPaid = useCountUp(totalPaid, 2000, 0);
  const animatedAvgSpend  = useCountUp(avgMonthlySpend, 2000, 0);

  // ─── Event Handlers ─────────────────────────────────────────────────────────

  const handleSelectPlan = (plan) => {
    setCheckoutPlan(plan);
    setPaymentAmount(plan.price);
    setShowRazorpay(true);
  };

  const handleUpgradePlan = (plan) => {
    const upgradeCost = plan.price - (currentPlan?.price || 0);
    addNotification({
      type: 'info',
      title: 'Plan Upgrade',
      message: `Upgrading to ${plan.name} will cost an additional ₹${upgradeCost.toFixed(2)}`
    });
    const upgradePlan = { ...plan, price: upgradeCost };
    setCheckoutPlan(upgradePlan);
    setPaymentAmount(upgradeCost);
    setShowRazorpay(true);
  };

  const handlePayNow = () => {
    // Pay current bill — use the current plan as context
    setCheckoutPlan(currentPlan);
    setPaymentAmount(billingSummary.totalAmount);
    setShowRazorpay(true);
  };

  // ── Real Razorpay callbacks ────────────────────────────────────────────────
  const handleRazorpaySuccess = (payment) => {
    setShowRazorpay(false);
    addNotification({
      type: 'success',
      title: 'Payment Successful',
      message: `Subscription activated! Payment ID: ${payment?.razorpay_payment_id ?? payment?.id ?? '—'}`,
      duration: 7000,
    });
    // ✅ Refresh history and stats from backend so new record appears immediately
    fetchPaymentHistory();
    fetchStats();
    // Switch to history tab so landlord can see the new entry
    setActiveTab('history');
  };

  const handleRazorpayFailure = (msg) => {
    setShowRazorpay(false);
    addNotification({
      type: 'error',
      title: 'Payment Failed',
      message: msg ?? 'Something went wrong. Please try again.',
      duration: 7000,
    });
  };

  const handleDownloadReceipt = (payment) => {
    addNotification({
      type: 'info',
      title: 'Receipt Download',
      message: `Downloading receipt for payment #${payment.invoiceId}`
    });
  };

  const handleViewDetails = (payment) => {
    addNotification({
      type: 'info',
      title: 'Payment Details',
      message: `Viewing details for payment #${payment.invoiceId}`
    });
  };

  const handleAddPaymentMethod = (method) => {
    const newMethod = {
      ...method,
      id: Date.now(),
      isDefault: paymentMethods.length === 0
    };

    setPaymentMethods(prev => [...prev, newMethod]);
    addNotification({
      type: 'success',
      title: 'Payment Method Added',
      message: 'New payment method has been saved successfully'
    });
  };

  const handleEditPaymentMethod = (updatedMethod) => {
    setPaymentMethods(prev => prev.map(m => m.id === updatedMethod.id ? updatedMethod : m));
    addNotification({
      type: 'success',
      title: 'Payment Method Updated',
      message: 'Payment method details updated successfully'
    });
  };

  const handleDeletePaymentMethod = (id) => {
    const methodToDelete = paymentMethods.find(m => m.id === id);
    if (!methodToDelete) return;
    
    const wasDefault = methodToDelete.isDefault;
    const remaining = paymentMethods.filter(m => m.id !== id);
    
    if (wasDefault && remaining.length > 0) {
      remaining[0].isDefault = true;
      setSelectedPaymentMethod(remaining[0].id);
    }
    
    setPaymentMethods(remaining);
    addNotification({
      type: 'success',
      title: 'Method Removed',
      message: 'Payment method deleted successfully'
    });
  };

  const handleSelectPaymentMethod = (id) => {
    setSelectedPaymentMethod(id);
    setPaymentMethods(prev => prev.map(m => ({
      ...m,
      isDefault: m.id === id
    })));
    addNotification({
      type: 'success',
      title: 'Default Updated',
      message: 'Default payment method has been updated'
    });
  };

  const totalRent = useMemo(() => {
    return tenantRentPayments
      .filter(p => p.status === 'Paid')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  }, [tenantRentPayments]);

  const totalPlatformFees = useMemo(() => {
    return paymentHistory
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  }, [paymentHistory]);

  const netMargin = useMemo(() => {
    return Math.max(0, totalRent - totalPlatformFees);
  }, [totalRent, totalPlatformFees]);

  const yieldPct = useMemo(() => {
    if (totalRent === 0) return 100;
    return Math.min(100, Math.max(0, (netMargin / totalRent) * 100));
  }, [netMargin, totalRent]);

  const platformCostPct = useMemo(() => {
    if (totalRent === 0) return 0;
    return Math.min(100, Math.max(0, (totalPlatformFees / totalRent) * 100));
  }, [totalPlatformFees, totalRent]);

  return (
    <div className={`min-h-screen flex relative overflow-hidden bg-gradient-to-br ${tc.mainBg}`}>
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className={`absolute -top-40 -right-40 w-80 h-80 ${darkMode
            ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10'
            : 'bg-gradient-to-r from-indigo-300/20 to-purple-300/20'
            } rounded-full blur-3xl`}
        />
        <motion.div
          animate={{ rotate: -360, scale: [1.1, 1, 1.1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className={`absolute -bottom-40 -left-40 w-80 h-80 ${darkMode
            ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10'
            : 'bg-gradient-to-r from-purple-300/20 to-pink-300/20'
            } rounded-full blur-3xl`}
        />
      </div>

      <LandlordSideBar currentSection={currentSection} />

      <div className="flex-1 flex flex-col relative z-10 transition-all duration-700" style={{ marginLeft: 'var(--sidebar-width, 4.5rem)' }}>
        <LandlordNavBar currentSection={currentSection} />

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
                className={`text-5xl font-bold mb-4 ${darkMode
                  ? 'bg-gradient-to-r from-cyan-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent'
                  : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent'
                  }`}
              >
                Payment &amp; Billing
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className={`text-xl ${darkMode ? 'text-blue-200' : 'text-gray-600'} max-w-2xl mx-auto`}
              >
                Manage your subscription, payments, and billing with Ghar_Nishchit
              </motion.p>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <AnimatedCard
                darkMode={darkMode}
                className={`${darkMode
                  ? 'bg-slate-800/50 backdrop-blur-xl border border-slate-700'
                  : 'bg-white/70 backdrop-blur-xl border border-indigo-200'
                  } rounded-2xl p-6 text-center`}
              >
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className={`w-12 h-12 mx-auto mb-4 rounded-xl ${darkMode
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600'
                    : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                    } flex items-center justify-center`}
                >
                  <IndianRupee className="w-6 h-6 text-white" />
                </motion.div>
                <div className={`text-2xl font-bold ${darkMode ? 'text-cyan-100' : 'text-indigo-700'} mb-1`}>
                  ₹{Math.round(animatedTotalPaid).toLocaleString('en-IN')}
                </div>
                <div className={`${darkMode ? 'text-blue-200' : 'text-gray-600'} text-sm`}>Total Paid</div>
              </AnimatedCard>

              <AnimatedCard
                delay={0.1}
                darkMode={darkMode}
                className={`${darkMode
                  ? 'bg-slate-800/50 backdrop-blur-xl border border-slate-700'
                  : 'bg-white/70 backdrop-blur-xl border border-indigo-200'
                  } rounded-2xl p-6 text-center`}
              >
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center"
                >
                  <TrendingUp className="w-6 h-6 text-white" />
                </motion.div>
                <div className={`text-2xl font-bold ${darkMode ? 'text-cyan-100' : 'text-indigo-700'} mb-1`}>
                  ₹{Math.round(animatedAvgSpend).toLocaleString('en-IN')}
                </div>
                <div className={`${darkMode ? 'text-blue-200' : 'text-gray-600'} text-sm`}>Avg Monthly</div>
              </AnimatedCard>

              <AnimatedCard
                delay={0.2}
                darkMode={darkMode}
                className={`${darkMode
                  ? 'bg-slate-800/50 backdrop-blur-xl border border-slate-700'
                  : 'bg-white/70 backdrop-blur-xl border border-indigo-200'
                  } rounded-2xl p-6 text-center`}
              >
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className={`w-12 h-12 mx-auto mb-4 rounded-xl ${darkMode
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                    : 'bg-gradient-to-br from-purple-500 to-pink-600'
                    } flex items-center justify-center`}
                >
                  <Crown className="w-6 h-6 text-white" />
                </motion.div>
                <div className={`text-lg font-bold ${darkMode ? 'text-cyan-100' : 'text-indigo-700'} mb-1`}>{currentPlan?.name || 'None'}</div>
                <div className={`${darkMode ? 'text-blue-200' : 'text-gray-600'} text-sm`}>Current Plan</div>
              </AnimatedCard>

              <AnimatedCard
                delay={0.3}
                darkMode={darkMode}
                className={`${darkMode
                  ? 'bg-slate-800/50 backdrop-blur-xl border border-slate-700'
                  : 'bg-white/70 backdrop-blur-xl border border-indigo-200'
                  } rounded-2xl p-6 text-center`}
              >
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center"
                >
                  <Calendar className="w-6 h-6 text-white" />
                </motion.div>
                <div className={`text-lg font-bold ${darkMode ? 'text-cyan-100' : 'text-indigo-700'} mb-1`}>
                  {nextRenewalDate
                    ? new Date(nextRenewalDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'Not Subscribed'
                  }
                </div>
                <div className={`${darkMode ? 'text-blue-200' : 'text-gray-600'} text-sm`}>
                  {nextRenewalDate ? `Renewal (${daysUntilPayment} days)` : 'Days to Payment'}
                </div>
              </AnimatedCard>

              <AnimatedCard
                delay={0.4}
                darkMode={darkMode}
                className={`${darkMode
                  ? 'bg-slate-800/50 backdrop-blur-xl border border-slate-700'
                  : 'bg-white/70 backdrop-blur-xl border border-indigo-200'
                  } rounded-2xl p-6 text-center`}
              >
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className={`w-12 h-12 mx-auto mb-4 rounded-xl ${darkMode
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600'
                    : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                    } flex items-center justify-center`}
                >
                  <CreditCard className="w-6 h-6 text-white" />
                </motion.div>
                <div className={`text-2xl font-bold ${darkMode ? 'text-cyan-100' : 'text-indigo-700'} mb-1`}>{paymentMethods.length}</div>
                <div className={`${darkMode ? 'text-blue-200' : 'text-gray-600'} text-sm`}>Payment Methods</div>
              </AnimatedCard>
            </div>

            {/* Tab Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={`flex space-x-1 mb-8 ${darkMode
                ? 'bg-slate-800/50 border border-slate-700'
                : 'bg-white/50 border border-indigo-200'
                } p-1 rounded-2xl backdrop-blur-xl`}
            >
              {[
                { key: 'billing', label: 'Current Bill', icon: Receipt },
                { key: 'plans', label: 'Subscription Plans', icon: Crown },
                { key: 'methods', label: 'Payment Methods', icon: CreditCard },
                { key: 'tenant-rent', label: 'Tenant Rent', icon: Users },
                { key: 'history', label: 'Payment History', icon: Clock }
              ].map(({ key, label, icon }) => (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === key
                    ? darkMode
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                    : darkMode
                      ? 'text-blue-200 hover:text-cyan-100 hover:bg-slate-700/50'
                      : 'text-gray-600 hover:text-indigo-700 hover:bg-indigo-100/50'
                    }`}
                >
                  {React.createElement(icon, { className: "w-5 h-5" })}
                  <span>{label}</span>
                </motion.button>
              ))}
            </motion.div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'billing' && (
                <motion.div
                  key="billing"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-8"
                >
                  <AnimatedCard darkMode={darkMode}>
                    <BillingSummary
                      summary={billingSummary}
                      onPayNow={handlePayNow}
                      isSubscribed={isSubscribed}
                      nextRenewalDate={nextRenewalDate}
                      darkMode={darkMode}
                    />
                  </AnimatedCard>

                  {/* Financial Yield & Ledger Component */}
                  <AnimatedCard delay={0.1} darkMode={darkMode}>
                    <FinancialReconciliationLedger
                      totalRent={totalRent}
                      totalPlatformFees={totalPlatformFees}
                      netMargin={netMargin}
                      yieldPct={yieldPct}
                      platformCostPct={platformCostPct}
                      darkMode={darkMode}
                    />
                  </AnimatedCard>

                  {/* Usage Details */}
                  <AnimatedCard
                    delay={0.2}
                    darkMode={darkMode}
                    className={`${darkMode
                      ? 'bg-slate-800/50 backdrop-blur-xl border border-slate-700'
                      : 'bg-white/70 backdrop-blur-xl border border-indigo-200'
                      } rounded-2xl p-8`}
                  >
                    <h3 className={`text-2xl font-bold ${darkMode ? 'text-cyan-100' : 'text-indigo-700'} mb-6`}>Usage This Month</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className={`${darkMode ? 'bg-slate-700/50' : 'bg-indigo-50/50'} rounded-xl p-4 text-center`}>
                        <div className={`text-3xl font-bold ${darkMode ? 'text-cyan-400' : 'text-indigo-500'} mb-2`}>{properties.length}</div>
                        <div className={`${darkMode ? 'text-blue-200' : 'text-gray-600'} text-sm`}>Active Properties</div>
                      </div>

                      <div className={`${darkMode ? 'bg-slate-700/50' : 'bg-indigo-50/50'} rounded-xl p-4 text-center`}>
                        <div className={`text-3xl font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-500'} mb-2`}>
                          {paymentHistory.filter(p => p.status === 'completed').length}
                        </div>
                        <div className={`${darkMode ? 'text-blue-200' : 'text-gray-600'} text-sm`}>Payments Completed</div>
                      </div>

                      <div className={`${darkMode ? 'bg-slate-700/50' : 'bg-indigo-50/50'} rounded-xl p-4 text-center`}>
                        <div className={`text-3xl font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-500'} mb-2`}>
                          {paymentHistory.filter(p => p.status === 'pending').length}
                        </div>
                        <div className={`${darkMode ? 'text-blue-200' : 'text-gray-600'} text-sm`}>Pending Payments</div>
                      </div>
                    </div>
                  </AnimatedCard>
                </motion.div>
              )}

              {activeTab === 'plans' && (
                <motion.div
                  key="plans"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {subscriptionPlans.map((plan, index) => (
                      <SubscriptionPlanCard
                        key={plan.id}
                        plan={plan}
                        currentPlan={currentPlan}
                        onSelect={handleSelectPlan}
                        onUpgrade={handleUpgradePlan}
                        popular={index === 1}
                        darkMode={darkMode}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'methods' && (
                <motion.div
                  key="methods"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-2xl font-bold ${darkMode ? 'text-cyan-100' : 'text-indigo-700'}`}>Saved Payment Methods</h3>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setEditingMethod(null);
                        setShowAddPaymentModal(true);
                      }}
                      className={`flex items-center space-x-2 px-4 py-2 ${darkMode
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600'
                        : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                        } text-white rounded-xl font-semibold`}
                    >
                      <Plus className="w-5 h-5" />
                      <span>Add Method</span>
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {paymentMethods.map((method) => (
                      <PaymentMethodCard
                        key={method.id}
                        method={method}
                        isSelected={selectedPaymentMethod === method.id}
                        onSelect={handleSelectPaymentMethod}
                        onEdit={(m) => {
                          setEditingMethod(m);
                          setShowAddPaymentModal(true);
                        }}
                        onDelete={handleDeletePaymentMethod}
                        darkMode={darkMode}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'tenant-rent' && (
                <motion.div
                  key="tenant-rent"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-2xl font-bold ${darkMode ? 'text-cyan-100' : 'text-indigo-700'}`}>
                      Rent Received from Tenants
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={fetchTenantRentPayments}
                      className={`flex items-center space-x-2 px-4 py-2 ${
                        darkMode ? 'bg-slate-700 text-cyan-300 hover:bg-slate-600' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                      } rounded-xl text-sm font-semibold transition-colors`}
                    >
                      <RotateCcw className={`w-4 h-4 ${tenantRentLoading ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </motion.button>
                  </div>

                  {tenantRentLoading ? (
                    <div className={`text-center py-12 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      <Loader className="w-8 h-8 animate-spin mx-auto mb-3" />
                      Loading tenant payments…
                    </div>
                  ) : tenantRentPayments.length === 0 ? (
                    <div className={`text-center py-12 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      No tenant rent payments recorded yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tenantRentPayments.map((p) => (
                        <div
                          key={p.id}
                          className={`flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl border ${
                            darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/80 border-indigo-100'
                          }`}
                        >
                          <div>
                            <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {p.tenantName} — {p.propertyTitle}
                            </p>
                            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                              {p.type} · {p.paymentMethod || 'Razorpay'}
                              {p.paidAt && ` · ${new Date(p.paidAt).toLocaleString()}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-xl font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                              ₹{Number(p.amount).toLocaleString('en-IN')}
                            </p>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              p.status === 'Paid'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {p.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-2xl font-bold ${darkMode ? 'text-cyan-100' : 'text-indigo-700'}`}>
                      Payment History
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { fetchPaymentHistory(); fetchStats(); }}
                      className={`flex items-center space-x-2 px-4 py-2 ${
                        darkMode ? 'bg-slate-700 text-cyan-300 hover:bg-slate-600' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                      } rounded-xl text-sm font-semibold transition-colors`}
                    >
                      <RotateCcw className={`w-4 h-4 ${historyLoading ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </motion.button>
                  </div>

                  {historyLoading && (
                    <div className={`text-center py-12 ${darkMode ? 'text-blue-200' : 'text-gray-500'}`}>
                      <Loader className="w-8 h-8 mx-auto mb-3 animate-spin" />
                      <p>Loading payment history…</p>
                    </div>
                  )}

                  {!historyLoading && historyError && (
                    <div className="text-center py-12 text-red-400">
                      <XCircle className="w-8 h-8 mx-auto mb-3" />
                      <p>{historyError}</p>
                    </div>
                  )}

                  {!historyLoading && !historyError && paymentHistory.length === 0 && (
                    <div className={`text-center py-16 ${darkMode ? 'text-blue-200' : 'text-gray-500'}`}>
                      <Receipt className="w-12 h-12 mx-auto mb-4 opacity-40" />
                      <p className="text-lg font-medium">No payment history yet</p>
                      <p className="text-sm mt-1">Your subscription payments will appear here once processed.</p>
                    </div>
                  )}

                  {!historyLoading && !historyError && paymentHistory.length > 0 && paymentHistory.map((payment) => (
                    <PaymentHistoryItem
                      key={payment.id}
                      payment={payment}
                      onDownloadReceipt={handleDownloadReceipt}
                      onViewDetails={handleViewDetails}
                      darkMode={darkMode}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* ── Razorpay Checkout Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showRazorpay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowRazorpay(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`${
                darkMode
                  ? 'bg-slate-800/95 border border-slate-700'
                  : 'bg-white/95 border border-indigo-200'
              } rounded-2xl w-full max-w-md overflow-hidden shadow-2xl`}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className={`flex items-center justify-between p-5 border-b ${
                darkMode ? 'border-slate-700' : 'border-indigo-100'
              }`}>
                <h2 className={`text-xl font-bold ${
                  darkMode ? 'text-cyan-100' : 'text-indigo-700'
                }`}>
                  Complete Payment
                </h2>
                <button
                  onClick={() => setShowRazorpay(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-indigo-50 text-gray-500'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Razorpay checkout — passes all required plan context */}
              <div className="p-5">
                <LandlordRazorpayCheckout
                  planId={checkoutPlan?.id ?? currentPlan?.id ?? 1}
                  planName={checkoutPlan?.name ?? currentPlan?.name ?? 'Subscription Plan'}
                  planPrice={checkoutPlan?.price ?? paymentAmount}
                  planValidity={checkoutPlan?.validity ?? ''}
                  landlordName={currentUser?.name ?? currentUser?.fullName ?? ''}
                  landlordEmail={currentUser?.email ?? ''}
                  landlordPhone={currentUser?.phone ?? currentUser?.mobile ?? ''}
                  onSuccess={handleRazorpaySuccess}
                  onFailure={handleRazorpayFailure}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Payment Method Modal */}
      <AnimatePresence>
        {showAddPaymentModal && (
          <AddEditPaymentMethodModal
            isOpen={showAddPaymentModal}
            onClose={() => {
              setShowAddPaymentModal(false);
              setEditingMethod(null);
            }}
            onAdd={handleAddPaymentMethod}
            onEdit={handleEditPaymentMethod}
            methodToEdit={editingMethod}
            darkMode={darkMode}
          />
        )}
      </AnimatePresence>

      {/* Notification Toasts */}
      <NotificationToast
        notifications={notifications}
        onRemove={removeNotification}
        darkMode={darkMode}
      />
    </div>
  );
};

export default LandlordPayment;
