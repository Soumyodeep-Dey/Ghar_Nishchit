import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDarkMode } from '../../../useDarkMode.js';
import TenantSideBar from './TenantSideBar';
import TenantNavBar from './TenantNavBar';
import {
  CreditCardIcon,
  BanknotesIcon,
  ReceiptRefundIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  StarIcon,
  TrophyIcon,
  ChartBarIcon,
  SparklesIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

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
const AnimatedCounter = ({ value, duration = 2000, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
    const startValue = 0;
    const endValue = numericValue || 0;
    const increment = endValue / (duration / 16);
    let currentValue = startValue;

    const timer = setInterval(() => {
      currentValue += increment;
      if (currentValue >= endValue) {
        setCount(endValue);
        clearInterval(timer);
      } else {
        setCount(currentValue);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{prefix}{typeof value === 'string' && value.includes('.') ? count.toFixed(2) : Math.floor(count)}{suffix}</span>;
};

const FloatingCard = ({ children, delay = 0, className = '' }) => {
  return (
    <div
      className={`animate-float ${className}`}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: '6s',
        animationIterationCount: 'infinite'
      }}
    >
      {children}
    </div>
  );
};

const GlowingButton = ({ children, onClick, className = '', glowColor = 'blue', disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative overflow-hidden transform transition-all duration-300 hover:scale-105 disabled:hover:scale-100 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <div className={`absolute inset-0 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity ${glowColor === 'blue' ? 'bg-gradient-to-r from-blue-500 to-purple-600' :
          glowColor === 'green' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
            glowColor === 'purple' ? 'bg-gradient-to-r from-purple-500 to-pink-600' :
              glowColor === 'orange' ? 'bg-gradient-to-r from-orange-500 to-yellow-600' :
                'bg-gradient-to-r from-blue-500 to-purple-600'
        }`}></div>
      <div className="relative z-10">
        {children}
      </div>
    </button>
  );
};

// Enhanced Components
const PaymentSummaryCard = ({ title, value, icon, gradient, delay = 0, subtitle = '' }) => {
  const [setRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <div
      ref={setRef}
      className={`transform transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <FloatingCard delay={delay}>
        <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-white/50 relative overflow-hidden`}>
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white transform translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-white transform -translate-x-10 translate-y-10"></div>
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 mb-2">{title}</p>
              <p className="text-3xl font-bold text-gray-800 mb-1">
                <AnimatedCounter value={value} prefix={typeof value === 'string' && value.includes('$') ? '$' : ''} />
              </p>
              {subtitle && (
                <p className="text-xs text-gray-600">{subtitle}</p>
              )}
            </div>
            <div className="p-4 rounded-2xl bg-white/50 backdrop-blur-sm shadow-lg">
              {icon}
            </div>
          </div>
        </div>
      </FloatingCard>
    </div>
  );
};

const UpcomingPaymentCard = ({ payment, index, onPayNow }) => {
  const [setRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  const getPaymentIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'rent': return <BanknotesIcon className="h-6 w-6 text-blue-600" />;
      case 'utilities': return <CurrencyDollarIcon className="h-6 w-6 text-green-600" />;
      default: return <DocumentTextIcon className="h-6 w-6 text-gray-600" />;
    }
  };

  const getDaysUntilDue = (dateString) => {
    const dueDate = new Date(dateString);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = getDaysUntilDue(payment.date);

  return (
    <div
      ref={setRef}
      className={`transform transition-all duration-500 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
        }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 relative overflow-hidden">
        {/* Priority indicator */}
        {daysUntilDue <= 3 && (
          <div className="absolute top-0 right-0 bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1 rounded-bl-xl text-xs font-semibold animate-pulse">
            Due Soon!
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50">
              {getPaymentIcon(payment.type)}
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">{payment.type}</h4>
              <p className="text-sm text-gray-600 flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                {new Date(payment.date).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500">
                {daysUntilDue > 0 ? `${daysUntilDue} days left` : daysUntilDue === 0 ? 'Due today' : `${Math.abs(daysUntilDue)} days overdue`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-gray-800">{payment.amount}</p>
            <GlowingButton
              onClick={() => onPayNow(payment)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg text-sm mt-2 group"
              glowColor="green"
            >
              Pay Now
            </GlowingButton>
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentHistoryRow = ({ payment, index, onDownloadReceipt }) => {
  const [setRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  const getStatusColor = (status) => {
    const colors = {
      'Paid': 'from-green-500 to-emerald-600 text-white',
      'Pending': 'from-yellow-500 to-orange-600 text-white',
      'Overdue': 'from-red-500 to-pink-600 text-white',
      'default': 'from-gray-500 to-gray-600 text-white'
    };
    return colors[status] || colors.default;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Paid': return <CheckCircleIcon className="h-4 w-4" />;
      case 'Pending': return <ClockIcon className="h-4 w-4" />;
      case 'Overdue': return <ExclamationTriangleIcon className="h-4 w-4" />;
      default: return <DocumentTextIcon className="h-4 w-4" />;
    }
  };

  return (
    <tr
      ref={setRef}
      className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      <td className="py-4 px-6">
        <div className="flex items-center">
          <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
          {new Date(payment.date).toLocaleDateString()}
        </div>
      </td>
      <td className="py-4 px-6">
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-blue-100 mr-3">
            <BanknotesIcon className="h-4 w-4 text-blue-600" />
          </div>
          {payment.type}
        </div>
      </td>
      <td className="py-4 px-6">
        <span className="font-bold text-lg text-gray-800">{payment.amount}</span>
      </td>
      <td className="py-4 px-6">
        <div className="flex items-center">
          <CreditCardIcon className="h-4 w-4 text-gray-400 mr-2" />
          {payment.method}
        </div>
      </td>
      <td className="py-4 px-6">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r flex items-center w-fit ${getStatusColor(payment.status)}`}>
          {getStatusIcon(payment.status)}
          <span className="ml-1">{payment.status}</span>
        </span>
      </td>
      <td className="py-4 px-6">
        {payment.status === "Paid" ? (
          <GlowingButton
            className="text-blue-600 hover:text-blue-800 flex items-center text-sm group bg-blue-50 px-3 py-2 rounded-lg"
            onClick={() => onDownloadReceipt(payment)}
            glowColor="blue"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Download
          </GlowingButton>
        ) : (
          <span className="text-gray-400 flex items-center text-sm">
            <XMarkIcon className="h-4 w-4 mr-1" />
            N/A
          </span>
        )}
      </td>
    </tr>
  );
};

const PaymentMethodCard = ({ method, icon, isSelected, onSelect }) => {
  return (
    <div
      className={`border rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 ${isSelected
          ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg ring-2 ring-blue-200'
          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
        }`}
      onClick={onSelect}
    >
      <div className="flex items-center">
        <input
          type="radio"
          checked={isSelected}
          onChange={onSelect}
          className="mr-4 w-4 h-4 text-blue-600"
        />
        <div className="flex items-center">
          <div className={`p-2 rounded-xl mr-3 ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
            {icon}
          </div>
          <span className={`font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
            {method}
          </span>
        </div>
        {isSelected && (
          <div className="ml-auto">
            <CheckCircleIcon className="h-5 w-5 text-blue-600" />
          </div>
        )}
      </div>
    </div>
  );
};

// Main Component
const TenantPayment = () => {
  const [paymentHistory, setPaymentHistory] = useLocalStorage('paymentHistory', [
    {
      id: 1,
      date: "2024-01-01",
      type: "Rent",
      amount: "$1,200.00",
      method: "Bank Transfer",
      status: "Paid",
      receipt: "#REC-001"
    },
    {
      id: 2,
      date: "2024-01-01",
      type: "Utilities",
      amount: "$50.00",
      method: "Credit Card",
      status: "Paid",
      receipt: "#REC-002"
    },
    {
      id: 3,
      date: "2024-02-01",
      type: "Rent",
      amount: "$1,200.00",
      method: "Bank Transfer",
      status: "Pending",
      receipt: "#REC-003"
    },
    {
      id: 4,
      date: "2023-12-01",
      type: "Rent",
      amount: "$1,200.00",
      method: "Bank Transfer",
      status: "Paid",
      receipt: "#REC-004"
    },
    {
      id: 5,
      date: "2023-11-01",
      type: "Utilities",
      amount: "$45.00",
      method: "Credit Card",
      status: "Paid",
      receipt: "#REC-005"
    }
  ]);

  const [upcomingPayments, setUpcomingPayments] = useLocalStorage('upcomingPayments', [
    {
      id: 1,
      date: "2024-02-01",
      type: "Rent",
      amount: "$1,200.00",
      status: "Pending"
    },
    {
      id: 2,
      date: "2024-02-05",
      type: "Utilities",
      amount: "$50.00",
      status: "Pending"
    },
    {
      id: 3,
      date: "2024-02-15",
      type: "Parking",
      amount: "$75.00",
      status: "Pending"
    }
  ]);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('bank');
  const [isLoading, setIsLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  // Memoized calculations
  const calculations = useMemo(() => {
    const totalPaid = paymentHistory
      .filter(p => p.status === 'Paid')
      .reduce((sum, p) => sum + parseFloat(p.amount.replace(/[^0-9.-]/g, '')), 0);

    const pendingAmount = upcomingPayments
      .reduce((sum, p) => sum + parseFloat(p.amount.replace(/[^0-9.-]/g, '')), 0);

    const nextPaymentDue = upcomingPayments.length > 0
      ? new Date(Math.min(...upcomingPayments.map(p => new Date(p.date)))).toLocaleDateString()
      : 'N/A';

    return {
      totalPaid,
      pendingAmount,
      nextPaymentDue,
      pendingCount: upcomingPayments.length
    };
  }, [paymentHistory, upcomingPayments]);

  const handleMakePayment = useCallback((payment = null) => {
    if (payment) {
      setSelectedPayment(payment);
      setShowPaymentModal(true);
    } else {
      alert('Redirecting to payment gateway...');
    }
  }, []);

  const handlePaymentSubmit = useCallback(() => {
    if (selectedPayment) {
      // Move from upcoming to history
      const newHistoryItem = {
        ...selectedPayment,
        method: selectedPaymentMethod === 'bank' ? 'Bank Transfer' : 'Credit Card',
        status: 'Paid',
        receipt: `#REC-${Date.now()}`
      };

      setPaymentHistory(prev => [newHistoryItem, ...prev]);
      setUpcomingPayments(prev => prev.filter(p => p.id !== selectedPayment.id));
      setShowPaymentModal(false);
      setSelectedPayment(null);
    }
  }, [selectedPayment, selectedPaymentMethod, setPaymentHistory, setUpcomingPayments]);

  const downloadReceipt = useCallback((payment) => {
    // Simulate receipt download
    const link = document.createElement('a');
    link.href = `data:text/plain;charset=utf-8,Receipt ${payment.receipt}\nAmount: ${payment.amount}\nDate: ${payment.date}\nType: ${payment.type}`;
    link.download = `receipt-${payment.receipt}.txt`;
    link.click();
  }, []);

  // Loading screen
  if (isLoading) {
    const { darkMode } = useDarkMode();
    return (
      <div className="flex h-screen">
        <TenantSideBar />
        <div className="flex flex-col flex-1">
          <TenantNavBar currentSection="Payments" />
          <main className={`flex-1 flex items-center justify-center ${darkMode
            ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-blue-950'
            : 'bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400'}`}>
            <div className="text-center">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-green-200 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-20 h-20 border-4 border-t-green-600 rounded-full animate-spin"></div>
              </div>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mt-6 animate-pulse`}>Loading Payments...</h2>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-2`}>Preparing your financial data</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const { darkMode } = useDarkMode();

  return (
    <div className={`flex h-screen ${darkMode
      ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-blue-950'
      : 'bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400'}`}>
      <TenantSideBar />
      <div className="flex flex-col flex-1">
        <TenantNavBar currentSection="Payments" />
        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          {/* Hero Section */}
          <div className="mb-12">
            <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white transform translate-x-32 -translate-y-32"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-white transform -translate-x-20 translate-y-20"></div>
              </div>

              <div className="relative z-10 flex items-center mb-6">
                <div className="p-4 bg-white/20 rounded-2xl mr-4">
                  <CurrencyDollarIcon className="h-10 w-10" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2 animate-slideDown">
                    Payment Center
                  </h1>
                  <p className="text-green-100 text-lg animate-slideUp">
                    Manage your payments with ease and security
                  </p>
                </div>
              </div>

              <div className="relative z-10 flex items-center space-x-4">
                <div className="flex items-center">
                  <ShieldCheckIcon className="h-6 w-6 mr-2" />
                  <span className="text-sm">Secure Payments</span>
                </div>
                <div className="flex items-center">
                  <StarSolidIcon className="h-6 w-6 mr-2 text-yellow-400" />
                  <span className="text-sm">Trusted Platform</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-6 w-6 mr-2" />
                  <span className="text-sm">Instant Processing</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <PaymentSummaryCard
              title="Total Paid This Year"
              value={calculations.totalPaid}
              icon={<TrophyIcon className="h-8 w-8 text-green-600" />}
              gradient="from-green-50 to-emerald-100"
              delay={0}
              subtitle="+12% from last year"
            />

            <PaymentSummaryCard
              title="Pending Payments"
              value={calculations.pendingCount}
              icon={<ClockIcon className="h-8 w-8 text-yellow-600" />}
              gradient="from-yellow-50 to-orange-100"
              delay={100}
              subtitle={`$${calculations.pendingAmount.toFixed(2)} total`}
            />

            <PaymentSummaryCard
              title="Next Payment Due"
              value={calculations.nextPaymentDue}
              icon={<CalendarIcon className="h-8 w-8 text-blue-600" />}
              gradient="from-blue-50 to-indigo-100"
              delay={200}
            />

            <PaymentSummaryCard
              title="Payment Success Rate"
              value="99.8%"
              icon={<StarIcon className="h-8 w-8 text-purple-600" />}
              gradient="from-purple-50 to-pink-100"
              delay={300}
              subtitle="Excellent record"
            />
          </div>

          {/* Make Payment Section */}
          <div className={`${darkMode ? 'bg-slate-800/80' : 'bg-white/80'} backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-8 border ${darkMode ? 'border-gray-700/50' : 'border-white/50'}`}>
            <div className="flex items-center mb-8">
              <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl mr-4">
                <CreditCardIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Make Payment</h2>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Quick and secure payment processing</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upcoming Payments */}
              <div>
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-6 flex items-center text-lg`}>
                  <ClockIcon className="h-6 w-6 mr-2 text-blue-600" />
                  Upcoming Payments
                </h3>
                {upcomingPayments.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircleIcon className="h-16 w-16 text-green-400 mx-auto mb-4" />
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-lg`}>All caught up!</p>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No upcoming payments at this time</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingPayments.map((payment, index) => (
                      <UpcomingPaymentCard
                        key={payment.id}
                        payment={payment}
                        index={index}
                        onPayNow={handleMakePayment}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Methods */}
              <div>
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-6 flex items-center text-lg`}>
                  <ShieldCheckIcon className="h-6 w-6 mr-2 text-green-600" />
                  Payment Methods
                </h3>
                <div className="space-y-4">
                  <PaymentMethodCard
                    method="Bank Transfer"
                    icon={<BanknotesIcon className="h-6 w-6 text-blue-600" />}
                    isSelected={selectedPaymentMethod === 'bank'}
                    onSelect={() => setSelectedPaymentMethod('bank')}
                  />

                  <PaymentMethodCard
                    method="Credit Card"
                    icon={<CreditCardIcon className="h-6 w-6 text-purple-600" />}
                    isSelected={selectedPaymentMethod === 'card'}
                    onSelect={() => setSelectedPaymentMethod('card')}
                  />

                  <GlowingButton
                    onClick={() => handleMakePayment()}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 rounded-xl text-lg font-semibold group mt-6"
                    glowColor="green"
                  >
                    <CurrencyDollarIcon className="h-6 w-6 mr-2 inline" />
                    Pay All Pending
                  </GlowingButton>
                </div>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className={`${darkMode ? 'bg-slate-800/80' : 'bg-white/80'} backdrop-blur-sm rounded-3xl shadow-2xl border ${darkMode ? 'border-gray-700/50' : 'border-white/50'} overflow-hidden`}>
            <div className={`p-8 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl mr-4">
                    <ChartBarIcon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Payment History</h2>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Track all your payment transactions</p>
                  </div>
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {paymentHistory.length} total transactions
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Type</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Amount</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Method</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((payment, index) => (
                    <PaymentHistoryRow
                      key={payment.id}
                      payment={payment}
                      index={index}
                      onDownloadReceipt={downloadReceipt}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full m-4 transform animate-slideUp">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">Confirm Payment</h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <XMarkIcon className="h-6 w-6 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="text-center mb-6">
                <div className="p-4 bg-blue-100 rounded-2xl w-fit mx-auto mb-4">
                  <CurrencyDollarIcon className="h-12 w-12 text-blue-600" />
                </div>
                <h4 className="text-2xl font-bold text-gray-800">{selectedPayment.amount}</h4>
                <p className="text-gray-600">for {selectedPayment.type}</p>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-semibold">{selectedPaymentMethod === 'bank' ? 'Bank Transfer' : 'Credit Card'}</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <GlowingButton
                    onClick={handlePaymentSubmit}
                    className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-xl group"
                    glowColor="green"
                  >
                    Confirm Payment
                  </GlowingButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotateZ(0deg); }
          33% { transform: translateY(-8px) rotateZ(0.5deg); }
          66% { transform: translateY(4px) rotateZ(-0.5deg); }
        }
        
        @keyframes slideDown {
          from { transform: translateY(-30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
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
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-slideDown {
          animation: slideDown 0.8s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.8s ease-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
        
        .animate-bounce {
          animation: bounce 1s infinite;
        }
        
        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #10b981, #3b82f6);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #059669, #2563eb);
        }
      `}</style>
    </div>
  );
};

export default TenantPayment;