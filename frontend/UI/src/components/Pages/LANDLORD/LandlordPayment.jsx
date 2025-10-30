import React, { useState, useEffect, useMemo } from 'react';
import LandlordSideBar from './LandlordSideBar';
import LandlordNavBar from './LandlordNavBar';
import { getCurrentYear } from '../../../utils/dateUtils.js';
import {
  CreditCard, DollarSign, TrendingUp, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Download, Receipt, Crown, Building2, Users, Plus, Edit, Trash2, Wallet, Trophy, X, Check, Info, Database, ShieldCheck, Loader, RotateCcw, ArrowRight, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

// Subscription Plan Card Component
const SubscriptionPlanCard = ({ plan, currentPlan, onSelect, onUpgrade, popular = false, darkMode }) => {
  const isCurrentPlan = currentPlan?.id === plan.id;
  const canUpgrade = currentPlan && plan.tier > currentPlan.tier;
  const canDowngrade = currentPlan && plan.tier < currentPlan.tier;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -10 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative p-8 rounded-3xl border-2 transition-all duration-500 overflow-hidden ${popular
        ? darkMode
          ? 'border-cyan-400 bg-gradient-to-br from-cyan-400/10 to-blue-500/10'
          : 'border-pink-500 bg-gradient-to-br from-pink-300/20 via-purple-300/20 to-indigo-400/20'
        : isCurrentPlan
          ? 'border-emerald-500 bg-emerald-500/10'
          : darkMode
            ? 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800/70'
            : 'border-indigo-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50'
        }`}
    >
      {/* Popular badge */}
      {popular && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`absolute -top-3 left-1/2 transform -translate-x-1/2 px-6 py-2 ${darkMode
            ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
            : 'bg-gradient-to-r from-pink-500 to-purple-500'
            } rounded-full`}
        >
          <span className="text-white text-sm font-bold flex items-center space-x-1">
            <Crown className="w-4 h-4" />
            <span>Most Popular</span>
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
          <span className="text-emerald-400 text-xs font-semibold">Current Plan</span>
        </motion.div>
      )}

      {/* Background effects */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className={`absolute -top-10 -right-10 w-40 h-40 ${darkMode
            ? 'bg-gradient-to-br from-cyan-500 to-blue-500'
            : 'bg-gradient-to-br from-indigo-500 to-purple-500'
            } rounded-full blur-2xl`}
        />
      </div>

      <div className="relative z-10">
        {/* Plan header */}
        <div className="text-center mb-8">
          <div
            className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${darkMode
              ? 'bg-gradient-to-br from-cyan-500 to-blue-600'
              : 'bg-gradient-to-br from-indigo-500 to-purple-600'
              } flex items-center justify-center`}
          >
            {plan.icon}
          </div>

          <h3 className={`text-2xl font-bold ${darkMode ? 'text-cyan-100' : 'text-indigo-700'} mb-2`}>{plan.name}</h3>
          <p className={`${darkMode ? 'text-blue-200' : 'text-gray-600'} text-sm`}>{plan.description}</p>
        </div>

        {/* Pricing */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <span className={`text-4xl font-bold ${darkMode ? 'text-cyan-100' : 'text-indigo-700'}`}>
              ${plan.monthlyPrice}
            </span>
            <div className={`${darkMode ? 'text-blue-200' : 'text-gray-600'}`}>
              <div className="text-sm">/month</div>
              <div className="text-xs">per property</div>
            </div>
          </div>

          {plan.yearlyPrice && (
            <div className="flex items-center justify-center space-x-2 text-sm">
              <span className={`${darkMode ? 'text-blue-300' : 'text-gray-500'} line-through`}>
                ${plan.monthlyPrice * 12}/year
              </span>
              <span className="text-emerald-400 font-semibold">
                ${plan.yearlyPrice}/year
              </span>
              <span className="px-2 py-1 bg-emerald-500/20 rounded-full text-xs text-emerald-400">
                Save ${(plan.monthlyPrice * 12 - plan.yearlyPrice)}
              </span>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="space-y-4 mb-8">
          {plan.features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-3"
            >
              <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-emerald-400" />
              </div>
              <span className={`${darkMode ? 'text-blue-200' : 'text-gray-700'} text-sm`}>{feature}</span>
            </motion.div>
          ))}
        </div>

        {/* Limits */}
        <div className={`${darkMode ? 'bg-slate-800/50' : 'bg-indigo-50/50'} rounded-xl p-4 mb-8`}>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className={`text-2xl font-bold ${darkMode ? 'text-cyan-400' : 'text-indigo-500'}`}>{plan.propertyLimit}</div>
              <div className={`text-xs ${darkMode ? 'text-blue-200' : 'text-gray-600'}`}>Properties</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-purple-500'}`}>{plan.supportLevel}</div>
              <div className={`text-xs ${darkMode ? 'text-blue-200' : 'text-gray-600'}`}>Support</div>
            </div>
          </div>
        </div>

        {/* Action button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (isCurrentPlan) return;
            if (canUpgrade) onUpgrade(plan);
            else onSelect(plan);
          }}
          disabled={isCurrentPlan}
          className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${isCurrentPlan
            ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
            : popular
              ? darkMode
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 shadow-lg shadow-cyan-500/25'
                : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 shadow-lg shadow-pink-500/25'
              : canUpgrade
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25'
                : canDowngrade
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 shadow-lg shadow-orange-500/25'
                  : darkMode
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/25'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25'
            }`}
        >
          {isCurrentPlan
            ? 'Current Plan'
            : canUpgrade
              ? 'Upgrade Now'
              : canDowngrade
                ? 'Downgrade'
                : 'Select Plan'
          }
        </motion.button>

        {/* Additional info */}
        {plan.trialDays && !isCurrentPlan && (
          <p className={`text-center ${darkMode ? 'text-cyan-100' : 'text-gray-500'} text-xs mt-3`}>
            {plan.trialDays}-day free trial included
          </p>
        )}
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
            ${payment.amount.toFixed(2)}
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
const BillingSummary = ({ summary, onPayNow, darkMode }) => {
  const daysUntilDue = Math.ceil((new Date(summary.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysUntilDue < 0;
  const isDueSoon = daysUntilDue <= 3 && daysUntilDue > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative overflow-hidden rounded-2xl p-8 ${isOverdue
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
          className={`absolute -top-20 -right-20 w-40 h-40 ${darkMode
            ? 'bg-gradient-to-br from-cyan-400'
            : 'bg-gradient-to-br from-indigo-400'
            } to-transparent rounded-full`}
        />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`text-2xl font-bold ${darkMode ? 'text-cyan-100' : 'text-indigo-700'} mb-2`}>Current Bill</h3>
            <p className={`${darkMode ? 'text-blue-200' : 'text-gray-600'}`}>
              {summary.planName} • {summary.propertiesCount} properties
            </p>
          </div>

          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className={`w-16 h-16 ${darkMode ? 'bg-slate-700/50' : 'bg-indigo-100/50'} rounded-2xl flex items-center justify-center`}
          >
            <DollarSign className={`w-8 h-8 ${darkMode ? 'text-cyan-300' : 'text-indigo-600'}`} />
          </motion.div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between">
            <span className={`${darkMode ? 'text-blue-200' : 'text-gray-600'}`}>Subscription Fee</span>
            <span className={`${darkMode ? 'text-cyan-100' : 'text-indigo-700'} font-semibold`}>${summary.subscriptionFee.toFixed(2)}</span>
          </div>

          {summary.additionalFees > 0 && (
            <div className="flex justify-between">
              <span className={`${darkMode ? 'text-blue-200' : 'text-gray-600'}`}>Additional Features</span>
              <span className={`${darkMode ? 'text-cyan-100' : 'text-indigo-700'} font-semibold`}>${summary.additionalFees.toFixed(2)}</span>
            </div>
          )}

          {summary.discount > 0 && (
            <div className="flex justify-between">
              <span className="text-emerald-400">Discount Applied</span>
              <span className="text-emerald-400 font-semibold">-${summary.discount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className={`${darkMode ? 'text-blue-200' : 'text-gray-600'}`}>Tax</span>
            <span className={`${darkMode ? 'text-cyan-100' : 'text-indigo-700'} font-semibold`}>${summary.tax.toFixed(2)}</span>
          </div>

          <div className={`h-px ${darkMode ? 'bg-slate-600' : 'bg-indigo-200'}`}></div>

          <div className="flex justify-between text-xl">
            <span className={`${darkMode ? 'text-cyan-100' : 'text-indigo-700'} font-bold`}>Total Amount</span>
            <span className={`${darkMode ? 'text-cyan-100' : 'text-indigo-700'} font-bold`}>${summary.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <div className={`${darkMode ? 'text-blue-200' : 'text-gray-600'} text-sm`}>Due Date</div>
            <div className={`text-lg font-semibold ${isOverdue ? 'text-red-400' : isDueSoon ? 'text-yellow-400' : darkMode ? 'text-cyan-100' : 'text-indigo-700'
              }`}>
              {new Date(summary.dueDate).toLocaleDateString()}
            </div>
          </div>

          <div className="text-right">
            <div className={`${darkMode ? 'text-blue-200' : 'text-gray-600'} text-sm`}>
              {isOverdue ? 'Overdue by' : 'Due in'}
            </div>
            <div className={`text-lg font-semibold ${isOverdue ? 'text-red-400' : isDueSoon ? 'text-yellow-400' : darkMode ? 'text-cyan-100' : 'text-indigo-700'
              }`}>
              {Math.abs(daysUntilDue)} days
            </div>
          </div>
        </div>

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
      </div>
    </motion.div>
  );
};

// Payment Modal Component
const PaymentModal = ({ isOpen, onClose, amount, onPayment, darkMode }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  if (!isOpen) return null;

  const handlePayment = async () => {
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onPayment({
        amount,
        method: selectedMethod,
        cardDetails
      });
      onClose();
    }, 3000);
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
        className={`${darkMode
          ? 'bg-slate-800/90 backdrop-blur-xl border border-slate-700'
          : 'bg-white/90 backdrop-blur-xl border border-indigo-200'
          } rounded-2xl w-full max-w-md overflow-hidden`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 border-b ${darkMode ? 'border-slate-700' : 'border-indigo-200'}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-cyan-100' : 'text-indigo-700'}`}>Complete Payment</h2>
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

        {/* Content */}
        <div className="p-6">
          {/* Amount */}
          <div className="text-center mb-8">
            <div className={`text-4xl font-bold ${darkMode ? 'text-cyan-100' : 'text-indigo-700'} mb-2`}>
              ${amount?.toFixed(2)}
            </div>
            <div className={`${darkMode ? 'text-blue-200' : 'text-gray-600'}`}>
              Payment to Ghar_Nishchit
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-4 mb-6">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-cyan-100' : 'text-indigo-700'} mb-4`}>Payment Method</h3>

            {/* Credit Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedMethod('card')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedMethod === 'card'
                ? darkMode
                  ? 'border-cyan-400 bg-cyan-400/10'
                  : 'border-indigo-500 bg-indigo-500/10'
                : darkMode
                  ? 'border-slate-600 hover:border-slate-500'
                  : 'border-indigo-200 hover:border-indigo-300'
                }`}
            >
              <div className="flex items-center space-x-3">
                <CreditCard className={`w-6 h-6 ${darkMode ? 'text-cyan-400' : 'text-indigo-500'}`} />
                <div>
                  <div className={`${darkMode ? 'text-cyan-100' : 'text-indigo-700'} font-medium`}>Credit/Debit Card</div>
                  <div className={`${darkMode ? 'text-blue-200' : 'text-gray-600'} text-sm`}>Visa, Mastercard, Amex</div>
                </div>
                {selectedMethod === 'card' && (
                  <Check className={`w-5 h-5 ${darkMode ? 'text-cyan-400' : 'text-indigo-500'} ml-auto`} />
                )}
              </div>
            </motion.div>

            {/* PayPal */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedMethod('paypal')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedMethod === 'paypal'
                ? darkMode
                  ? 'border-cyan-400 bg-cyan-400/10'
                  : 'border-indigo-500 bg-indigo-500/10'
                : darkMode
                  ? 'border-slate-600 hover:border-slate-500'
                  : 'border-indigo-200 hover:border-indigo-300'
                }`}
            >
              <div className="flex items-center space-x-3">
                <Wallet className={`w-6 h-6 ${darkMode ? 'text-cyan-400' : 'text-indigo-500'}`} />
                <div>
                  <div className={`${darkMode ? 'text-cyan-100' : 'text-indigo-700'} font-medium`}>PayPal</div>
                  <div className={`${darkMode ? 'text-blue-200' : 'text-gray-600'} text-sm`}>Pay with PayPal account</div>
                </div>
                {selectedMethod === 'paypal' && (
                  <Check className={`w-5 h-5 ${darkMode ? 'text-cyan-400' : 'text-indigo-500'} ml-auto`} />
                )}
              </div>
            </motion.div>
          </div>

          {/* Card Details Form */}
          {selectedMethod === 'card' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4 mb-6"
            >
              <div>
                <label className={`block ${darkMode ? 'text-blue-200' : 'text-gray-600'} text-sm mb-2`}>Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails(prev => ({ ...prev, number: e.target.value }))}
                  className={`w-full p-3 ${darkMode
                    ? 'bg-slate-700/50 border border-slate-600 text-cyan-100 placeholder-blue-300'
                    : 'bg-indigo-50/50 border border-indigo-200 text-indigo-700 placeholder-gray-500'
                    } rounded-lg focus:${darkMode ? 'border-cyan-400' : 'border-indigo-500'} focus:outline-none`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block ${darkMode ? 'text-blue-200' : 'text-gray-600'} text-sm mb-2`}>Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))}
                    className={`w-full p-3 ${darkMode
                      ? 'bg-slate-700/50 border border-slate-600 text-cyan-100 placeholder-blue-300'
                      : 'bg-indigo-50/50 border border-indigo-200 text-indigo-700 placeholder-gray-500'
                      } rounded-lg focus:${darkMode ? 'border-cyan-400' : 'border-indigo-500'} focus:outline-none`}
                  />
                </div>

                <div>
                  <label className={`block ${darkMode ? 'text-blue-200' : 'text-gray-600'} text-sm mb-2`}>CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))}
                    className={`w-full p-3 ${darkMode
                      ? 'bg-slate-700/50 border border-slate-600 text-cyan-100 placeholder-blue-300'
                      : 'bg-indigo-50/50 border border-indigo-200 text-indigo-700 placeholder-gray-500'
                      } rounded-lg focus:${darkMode ? 'border-cyan-400' : 'border-indigo-500'} focus:outline-none`}
                  />
                </div>
              </div>

              <div>
                <label className={`block ${darkMode ? 'text-blue-200' : 'text-gray-600'} text-sm mb-2`}>Cardholder Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full p-3 ${darkMode
                    ? 'bg-slate-700/50 border border-slate-600 text-cyan-100 placeholder-blue-300'
                    : 'bg-indigo-50/50 border border-indigo-200 text-indigo-700 placeholder-gray-500'
                    } rounded-lg focus:${darkMode ? 'border-cyan-400' : 'border-indigo-500'} focus:outline-none`}
                />
              </div>
            </motion.div>
          )}

          {/* Security Info */}
          <div className="flex items-center space-x-2 mb-6 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400 text-sm">
              Your payment is secured with 256-bit SSL encryption
            </span>
          </div>

          {/* Pay Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePayment}
            disabled={!selectedMethod || isProcessing}
            className={`w-full py-4 ${darkMode
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/25'
              : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25'
              } text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
          >
            {isProcessing ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Pay ${amount?.toFixed(2)}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
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
const AddPaymentMethodModal = ({ isOpen, onClose, onAdd, darkMode }) => {
  const [paymentType, setPaymentType] = useState('card'); // 'card' or 'upi'
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [upiId, setUpiId] = useState('');

  if (!isOpen) return null;

  const handleAdd = () => {
    if (paymentType === 'card') {
      onAdd({
        type: 'visa', // Default to visa for now
        ...cardDetails
      });
    } else {
      onAdd({
        type: 'upi',
        id: upiId
      });
    }
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
        className={`${darkMode
          ? 'bg-slate-800/90 backdrop-blur-xl border border-slate-700'
          : 'bg-white/90 backdrop-blur-xl border border-indigo-200'
          } rounded-2xl w-full max-w-md overflow-hidden`}
        onClick={e => e.stopPropagation()}
      >
        <div className={`p-6 border-b ${darkMode ? 'border-slate-700' : 'border-indigo-200'}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-cyan-100' : 'text-indigo-700'}`}>Add Payment Method</h2>
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
          <div className="flex mb-6">
            <button
              onClick={() => setPaymentType('card')}
              className={`flex-1 py-2 text-center font-semibold rounded-l-lg transition-all ${paymentType === 'card'
                ? darkMode ? 'bg-cyan-500 text-white' : 'bg-indigo-500 text-white'
                : darkMode ? 'bg-slate-700 text-blue-200' : 'bg-gray-200 text-gray-600'
                }`}
            >
              Card
            </button>
            <button
              onClick={() => setPaymentType('upi')}
              className={`flex-1 py-2 text-center font-semibold rounded-r-lg transition-all ${paymentType === 'upi'
                ? darkMode ? 'bg-cyan-500 text-white' : 'bg-indigo-500 text-white'
                : darkMode ? 'bg-slate-700 text-blue-200' : 'bg-gray-200 text-gray-600'
                }`}
            >
              UPI
            </button>
          </div>

          <AnimatePresence mode="wait">
            {paymentType === 'card' ? (
              <motion.div
                key="card-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div>
                  <label className={`block ${darkMode ? 'text-blue-200' : 'text-gray-600'} text-sm mb-2`}>Card Number</label>
                  <input type="text" placeholder="1234 5678 9012 3456" onChange={e => setCardDetails({ ...cardDetails, number: e.target.value })} className={`w-full p-3 ${darkMode ? 'bg-slate-700/50 border border-slate-600 text-cyan-100' : 'bg-indigo-50/50 border border-indigo-200 text-indigo-700'} rounded-lg focus:outline-none`} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block ${darkMode ? 'text-blue-200' : 'text-gray-600'} text-sm mb-2`}>Expiry Date</label>
                    <input type="text" placeholder="MM/YY" onChange={e => setCardDetails({ ...cardDetails, expiry: e.target.value })} className={`w-full p-3 ${darkMode ? 'bg-slate-700/50 border border-slate-600 text-cyan-100' : 'bg-indigo-50/50 border border-indigo-200 text-indigo-700'} rounded-lg focus:outline-none`} />
                  </div>
                  <div>
                    <label className={`block ${darkMode ? 'text-blue-200' : 'text-gray-600'} text-sm mb-2`}>CVV</label>
                    <input type="text" placeholder="123" onChange={e => setCardDetails({ ...cardDetails, cvv: e.target.value })} className={`w-full p-3 ${darkMode ? 'bg-slate-700/50 border border-slate-600 text-cyan-100' : 'bg-indigo-50/50 border border-indigo-200 text-indigo-700'} rounded-lg focus:outline-none`} />
                  </div>
                </div>
                <div>
                  <label className={`block ${darkMode ? 'text-blue-200' : 'text-gray-600'} text-sm mb-2`}>Cardholder Name</label>
                  <input type="text" placeholder="John Doe" onChange={e => setCardDetails({ ...cardDetails, name: e.target.value })} className={`w-full p-3 ${darkMode ? 'bg-slate-700/50 border border-slate-600 text-cyan-100' : 'bg-indigo-50/50 border border-indigo-200 text-indigo-700'} rounded-lg focus:outline-none`} />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="upi-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <label className={`block ${darkMode ? 'text-blue-200' : 'text-gray-600'} text-sm mb-2`}>UPI ID</label>
                <input type="text" placeholder="yourname@bank" onChange={e => setUpiId(e.target.value)} className={`w-full p-3 ${darkMode ? 'bg-slate-700/50 border border-slate-600 text-cyan-100' : 'bg-indigo-50/50 border border-indigo-200 text-indigo-700'} rounded-lg focus:outline-none`} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={`p-6 border-t ${darkMode ? 'border-slate-700' : 'border-indigo-200'}`}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAdd}
            className={`w-full py-3 ${darkMode
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600'
              : 'bg-gradient-to-r from-indigo-500 to-purple-600'
              } text-white rounded-xl font-bold`}
          >
            Save Payment Method
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};


// Main Component
const LandlordPayment = () => {
  const [currentSection] = useState('Payments');
  const [activeTab, setActiveTab] = useState('billing');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const { darkMode } = useDarkMode();
  const sidebarWidthClass = '[margin-left:var(--sidebar-width,18rem)]';
  const { notifications, addNotification, removeNotification } = useNotification();

  // Sample data
  const [subscriptionPlans] = useState([
    {
      id: 1,
      name: 'Starter',
      description: 'Perfect for individual landlords',
      monthlyPrice: 29,
      yearlyPrice: 290,
      propertyLimit: '1-5',
      supportLevel: 'Email',
      tier: 1,
      icon: <Building2 className="w-8 h-8 text-white" />,
      features: [
        'Up to 5 properties',
        'Basic tenant management',
        'Payment tracking',
        'Email support',
        'Mobile app access',
        'Document storage (1GB)'
      ],
      trialDays: 14
    },
    {
      id: 2,
      name: 'Professional',
      description: 'Ideal for growing portfolios',
      monthlyPrice: 59,
      yearlyPrice: 590,
      propertyLimit: '6-25',
      supportLevel: 'Priority',
      tier: 2,
      icon: <Crown className="w-8 h-8 text-white" />,
      features: [
        'Up to 25 properties',
        'Advanced analytics',
        'Automated rent collection',
        'Priority support',
        'Custom branding',
        'Document storage (10GB)',
        'Financial reporting',
        'Maintenance tracking'
      ],
      trialDays: 14
    },
    {
      id: 3,
      name: 'Enterprise',
      description: 'For large property portfolios',
      monthlyPrice: 99,
      yearlyPrice: 990,
      propertyLimit: 'Unlimited',
      supportLevel: '24/7',
      tier: 3,
      icon: <Trophy className="w-8 h-8 text-white" />,
      features: [
        'Unlimited properties',
        'Advanced AI insights',
        'Multi-user access',
        '24/7 phone support',
        'White-label solution',
        'Unlimited storage',
        'API access',
        'Dedicated account manager',
        'Custom integrations'
      ],
      trialDays: 30
    }
  ]);

  const [currentPlan] = useState(subscriptionPlans[1]); // Professional plan

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

  const [paymentHistory] = useState([
    {
      id: 1,
      description: 'Professional Plan - Monthly',
      amount: 59.00,
      date: `${getCurrentYear()}-07-15`,
      status: 'completed',
      method: 'Visa •••• 4242',
      invoiceId: `INV-${getCurrentYear()}-001`
    },
    {
      id: 2,
      description: 'Professional Plan - Monthly',
      amount: 59.00,
      date: `${getCurrentYear()}-06-15`,
      status: 'completed',
      method: 'Visa •••• 4242',
      invoiceId: `INV-${getCurrentYear()}-002`
    },
    {
      id: 3,
      description: 'Starter Plan - Monthly',
      amount: 29.00,
      date: `${getCurrentYear()}-05-15`,
      status: 'completed',
      method: 'Visa •••• 4242',
      invoiceId: `INV-${getCurrentYear()}-003`
    }
  ]);

  const [billingSummary] = useState({
    planName: 'Professional Plan',
    propertiesCount: 12,
    subscriptionFee: 59.00,
    additionalFees: 0,
    discount: 0,
    tax: 5.31,
    totalAmount: 64.31,
    dueDate: `${getCurrentYear()}-08-15`
  });

  // Calculate stats
  const stats = useMemo(() => {
    const totalPaid = paymentHistory
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    const avgMonthlySpend = totalPaid / Math.max(paymentHistory.length, 1);
    const nextPaymentDate = new Date(billingSummary.dueDate);
    const daysUntilPayment = Math.ceil((nextPaymentDate - new Date()) / (1000 * 60 * 60 * 24));

    return {
      totalPaid,
      avgMonthlySpend,
      nextPaymentDate: nextPaymentDate.toLocaleDateString(),
      daysUntilPayment,
      activeSubscription: currentPlan?.name || 'None'
    };
  }, [paymentHistory, billingSummary, currentPlan]);

  // Event handlers
  const handleSelectPlan = (plan) => {
    setPaymentAmount(plan.monthlyPrice);
    setShowPaymentModal(true);
  };

  const handleUpgradePlan = (plan) => {
    const upgradeCost = plan.monthlyPrice - (currentPlan?.monthlyPrice || 0);

    addNotification({
      type: 'info',
      title: 'Plan Upgrade',
      message: `Upgrading to ${plan.name} will cost an additional $${upgradeCost.toFixed(2)}`
    });

    setPaymentAmount(upgradeCost);
    setShowPaymentModal(true);
  };

  const handlePayment = (paymentData) => {
    addNotification({
      type: 'success',
      title: 'Payment Successful',
      message: `Payment of $${paymentData.amount.toFixed(2)} has been processed successfully`
    });
  };

  const handlePayNow = () => {
    setPaymentAmount(billingSummary.totalAmount);
    setShowPaymentModal(true);
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
      id: paymentMethods.length + 1,
      ...method,
      isDefault: false
    };
    if (method.type === 'visa') { // or other card types
      newMethod.last4 = method.number.slice(-4);
      newMethod.holderName = method.name;
      newMethod.expiryDate = method.expiry;
    } else if (method.type === 'upi') {
      newMethod.holderName = method.id.split('@')[0];
    }

    setPaymentMethods(prev => [...prev, newMethod]);
    addNotification({
      type: 'success',
      title: 'Payment Method Added',
      message: 'New payment method has been saved successfully'
    });
  };

  return (
    <div className={`min-h-screen ${darkMode
      ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-blue-950'
      : 'bg-gradient-to-br from-white via-indigo-50 to-purple-100'
      } flex relative overflow-hidden`}>
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

      <div className={`flex-1 flex flex-col relative z-10 ${sidebarWidthClass} transition-all duration-700`}>
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
                Payment & Billing
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
                  <DollarSign className="w-6 h-6 text-white" />
                </motion.div>
                <div className={`text-2xl font-bold ${darkMode ? 'text-cyan-100' : 'text-indigo-700'} mb-1`}>
                  ${Math.round(useCountUp(stats.totalPaid, 2000, 0))}
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
                  ${Math.round(useCountUp(stats.avgMonthlySpend, 2000, 0))}
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
                <div className={`text-lg font-bold ${darkMode ? 'text-cyan-100' : 'text-indigo-700'} mb-1`}>{stats.activeSubscription}</div>
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
                <div className={`text-2xl font-bold ${darkMode ? 'text-cyan-100' : 'text-indigo-700'} mb-1`}>{stats.daysUntilPayment}</div>
                <div className={`${darkMode ? 'text-blue-200' : 'text-gray-600'} text-sm`}>Days to Payment</div>
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
                      <div className={`text-center p-6 ${darkMode ? 'bg-slate-700/50' : 'bg-indigo-50/50'} rounded-xl`}>
                        <Building2 className={`w-8 h-8 mx-auto mb-3 ${darkMode ? 'text-cyan-400' : 'text-indigo-500'}`} />
                        <div className={`text-3xl font-bold ${darkMode ? 'text-cyan-100' : 'text-indigo-700'} mb-1`}>12</div>
                        <div className={`${darkMode ? 'text-blue-200' : 'text-gray-600'}`}>Properties Listed</div>
                        <div className={`text-xs ${darkMode ? 'text-cyan-400' : 'text-indigo-500'} mt-1`}>of 25 allowed</div>
                      </div>

                      <div className={`text-center p-6 ${darkMode ? 'bg-slate-700/50' : 'bg-indigo-50/50'} rounded-xl`}>
                        <Users className="w-8 h-8 mx-auto mb-3 text-emerald-400" />
                        <div className={`text-3xl font-bold ${darkMode ? 'text-cyan-100' : 'text-indigo-700'} mb-1`}>34</div>
                        <div className={`${darkMode ? 'text-blue-200' : 'text-gray-600'}`}>Active Tenants</div>
                        <div className="text-xs text-emerald-400 mt-1">Unlimited</div>
                      </div>

                      <div className={`text-center p-6 ${darkMode ? 'bg-slate-700/50' : 'bg-indigo-50/50'} rounded-xl`}>
                        <Database className={`w-8 h-8 mx-auto mb-3 ${darkMode ? 'text-blue-400' : 'text-purple-500'}`} />
                        <div className={`text-3xl font-bold ${darkMode ? 'text-cyan-100' : 'text-indigo-700'} mb-1`}>7.2</div>
                        <div className={`${darkMode ? 'text-blue-200' : 'text-gray-600'}`}>GB Storage Used</div>
                        <div className={`text-xs ${darkMode ? 'text-blue-400' : 'text-purple-500'} mt-1`}>of 10 GB</div>
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
                  <AnimatedCard darkMode={darkMode}>
                    <div className="text-center mb-12">
                      <h2 className={`text-3xl font-bold ${darkMode ? 'text-cyan-100' : 'text-indigo-700'} mb-4`}>Choose Your Plan</h2>
                      <p className={`${darkMode ? 'text-blue-200' : 'text-gray-600'} max-w-2xl mx-auto`}>
                        Select the perfect plan for your property management needs
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

                    {/* Plan Comparison */}
                    <div className="mt-16">
                      <h3 className={`text-2xl font-bold ${darkMode ? 'text-cyan-100' : 'text-indigo-700'} mb-8 text-center`}>Feature Comparison</h3>

                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className={`border-b ${darkMode ? 'border-slate-700' : 'border-indigo-200'}`}>
                              <th className={`text-left py-4 ${darkMode ? 'text-blue-200' : 'text-gray-600'} font-semibold`}>Feature</th>
                              {subscriptionPlans.map((plan) => (
                                <th key={plan.id} className={`text-center py-4 ${darkMode ? 'text-blue-200' : 'text-gray-600'} font-semibold`}>
                                  {plan.name}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { feature: 'Properties', values: ['1-5', '6-25', 'Unlimited'] },
                              { feature: 'Storage', values: ['1GB', '10GB', 'Unlimited'] },
                              { feature: 'Support', values: ['Email', 'Priority', '24/7 Phone'] },
                              { feature: 'Analytics', values: ['Basic', 'Advanced', 'AI Powered'] },
                              { feature: 'Branding', values: ['❌', '✅', '✅'] },
                              { feature: 'API Access', values: ['❌', '❌', '✅'] }
                            ].map((row, index) => (
                              <tr key={index} className={`border-b ${darkMode ? 'border-slate-800 hover:bg-slate-800/50' : 'border-indigo-100 hover:bg-indigo-50/50'}`}>
                                <td className={`py-4 ${darkMode ? 'text-cyan-100' : 'text-indigo-700'} font-medium`}>{row.feature}</td>
                                {row.values.map((value, valueIndex) => (
                                  <td key={valueIndex} className={`py-4 text-center ${darkMode ? 'text-blue-200' : 'text-gray-600'}`}>
                                    {value}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </AnimatedCard>
                </motion.div>
              )}

              {activeTab === 'methods' && (
                <motion.div
                  key="methods"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <AnimatedCard darkMode={darkMode}>
                    <div className="flex justify-between items-center mb-8">
                      <div>
                        <h2 className={`text-3xl font-bold ${darkMode ? 'text-cyan-100' : 'text-indigo-700'} mb-2`}>Payment Methods</h2>
                        <p className={`${darkMode ? 'text-blue-200' : 'text-gray-600'}`}>Manage your saved payment methods</p>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowAddPaymentModal(true)}
                        className={`px-6 py-3 ${darkMode
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700'
                          : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
                          } text-white rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2`}
                      >
                        <Plus className="w-5 h-5" />
                        <span>Add Payment Method</span>
                      </motion.button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {paymentMethods.map((method) => (
                        <PaymentMethodCard
                          key={method.id}
                          method={method}
                          isSelected={selectedPaymentMethod === method.id}
                          onSelect={setSelectedPaymentMethod}
                          onEdit={(method) => {
                            addNotification({
                              type: 'info',
                              title: 'Edit Payment Method',
                              message: `Editing ${method.type} ending in ${method.last4 || ''}`
                            });
                          }}
                          onDelete={(methodId) => {
                            setPaymentMethods(prev => prev.filter(m => m.id !== methodId));
                            addNotification({
                              type: 'success',
                              title: 'Payment Method Deleted',
                              message: 'Payment method has been removed successfully'
                            });
                          }}
                          darkMode={darkMode}
                        />
                      ))}
                    </div>
                  </AnimatedCard>
                </motion.div>
              )}

              {activeTab === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <AnimatedCard darkMode={darkMode}>
                    <div className="flex justify-between items-center mb-8">
                      <div>
                        <h2 className={`text-3xl font-bold ${darkMode ? 'text-cyan-100' : 'text-indigo-700'} mb-2`}>Payment History</h2>
                        <p className={`${darkMode ? 'text-blue-200' : 'text-gray-600'}`}>View all your past transactions</p>
                      </div>

                      <div className="flex space-x-4">
                        <div className="relative">
                          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-blue-300' : 'text-gray-500'}`} />
                          <input
                            type="text"
                            placeholder="Search payments..."
                            className={`pl-10 pr-4 py-2 ${darkMode
                              ? 'bg-slate-700/50 border border-slate-600 text-cyan-100 placeholder-blue-300'
                              : 'bg-indigo-50/50 border border-indigo-200 text-indigo-700 placeholder-gray-500'
                              } rounded-lg focus:${darkMode ? 'border-cyan-400' : 'border-indigo-500'} focus:outline-none`}
                          />
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors flex items-center space-x-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>Export</span>
                        </motion.button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {paymentHistory.map((payment, index) => (
                        <motion.div
                          key={payment.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <PaymentHistoryItem
                            payment={payment}
                            onDownloadReceipt={handleDownloadReceipt}
                            onViewDetails={handleViewDetails}
                            darkMode={darkMode}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </AnimatedCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            amount={paymentAmount}
            onPayment={handlePayment}
            darkMode={darkMode}
          />
        )}
      </AnimatePresence>

      {/* Add Payment Method Modal */}
      <AnimatePresence>
        {showAddPaymentModal && (
          <AddPaymentMethodModal
            isOpen={showAddPaymentModal}
            onClose={() => setShowAddPaymentModal(false)}
            onAdd={handleAddPaymentMethod}
            darkMode={darkMode}
          />
        )}
      </AnimatePresence>

      {/* Notifications */}
      <NotificationToast
        notifications={notifications}
        onRemove={removeNotification}
        darkMode={darkMode}
      />
    </div>
  );
};

export default LandlordPayment;