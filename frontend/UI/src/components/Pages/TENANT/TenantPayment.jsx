import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDarkMode } from '../../../useDarkMode.js';
import TenantSideBar from './TenantSideBar';
import TenantNavBar from './TenantNavBar';
import {
  CreditCard,
  Banknote,
  Download,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  FileText,
  ShieldCheck,
  Star,
  Trophy,
  BarChart3,
  X
} from 'lucide-react';

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

// Removed custom animation hooks and components

// Enhanced Components
const PaymentSummaryCard = ({ title, value, icon, subtitle = '' }) => {
  return (
    <div className="rounded-2xl p-6 shadow-md bg-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{typeof value === 'number' ? `$${value.toFixed(2)}` : value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 rounded-xl bg-gray-100">
          {icon}
        </div>
      </div>
    </div>
  );
};

const UpcomingPaymentCard = ({ payment, onPayNow }) => {
  const getPaymentIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'rent': return <Banknote className="h-6 w-6 text-blue-600" />;
      case 'utilities': return <DollarSign className="h-6 w-6 text-green-600" />;
      default: return <FileText className="h-6 w-6 text-gray-600" />;
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
    <div>
      <div className="bg-white rounded-2xl p-6 shadow border border-gray-100 relative overflow-hidden">
        {/* Priority indicator */}
        {daysUntilDue <= 3 && (
          <div className="absolute top-0 right-0 bg-red-600 text-white px-3 py-1 rounded-bl-xl text-xs font-semibold">
            Due Soon!
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-2xl bg-blue-50">
              {getPaymentIcon(payment.type)}
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">{payment.type}</h4>
              <p className="text-sm text-gray-600 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(payment.date).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500">
                {daysUntilDue > 0 ? `${daysUntilDue} days left` : daysUntilDue === 0 ? 'Due today' : `${Math.abs(daysUntilDue)} days overdue`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-gray-800">{payment.amount}</p>
            <button
              onClick={() => onPayNow(payment)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm mt-2"
            >
              Pay Now
            </button>
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
      'Paid': 'bg-green-100 text-green-700',
      'Pending': 'bg-yellow-100 text-yellow-700',
      'Overdue': 'bg-red-100 text-red-700',
      'default': 'bg-gray-100 text-gray-700'
    };
    return colors[status] || colors.default;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Paid': return <CheckCircle className="h-4 w-4" />;
      case 'Pending': return <Clock className="h-4 w-4" />;
      case 'Overdue': return <AlertTriangle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="py-4 px-6">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
          {new Date(payment.date).toLocaleDateString()}
        </div>
      </td>
      <td className="py-4 px-6">
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-blue-100 mr-3">
            <Banknote className="h-4 w-4 text-blue-600" />
          </div>
          {payment.type}
        </div>
      </td>
      <td className="py-4 px-6">
        <span className="font-bold text-lg text-gray-800">{payment.amount}</span>
      </td>
      <td className="py-4 px-6">
        <div className="flex items-center">
          <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
          {payment.method}
        </div>
      </td>
      <td className="py-4 px-6">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center w-fit ${getStatusColor(payment.status)}`}>
          {getStatusIcon(payment.status)}
          <span className="ml-1">{payment.status}</span>
        </span>
      </td>
      <td className="py-4 px-6">
        {payment.status === "Paid" ? (
          <button
            className="text-blue-600 hover:text-blue-800 flex items-center text-sm bg-blue-50 px-3 py-2 rounded-lg"
            onClick={() => onDownloadReceipt(payment)}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </button>
        ) : (
          <span className="text-gray-400 flex items-center text-sm">
            <X className="h-4 w-4 mr-1" />
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
      className={`border rounded-2xl p-6 cursor-pointer transition-colors ${isSelected
          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
          : 'border-gray-200 hover:border-blue-300'
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
            <CheckCircle className="h-5 w-5 text-blue-600" />
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
          {/* Header */}
          <div className="mb-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Center</h1>
              <p className="text-gray-600">Manage your payments with ease and security</p>
            </div>
          </div>

          {/* Payment Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <PaymentSummaryCard
              title="Total Paid This Year"
              value={calculations.totalPaid}
              icon={<Trophy className="h-8 w-8 text-green-600" />}
              subtitle="+12% from last year"
            />

            <PaymentSummaryCard
              title="Pending Payments"
              value={calculations.pendingCount}
              icon={<Clock className="h-8 w-8 text-yellow-600" />}
              subtitle={`$${calculations.pendingAmount.toFixed(2)} total`}
            />

            <PaymentSummaryCard
              title="Next Payment Due"
              value={calculations.nextPaymentDue}
              icon={<Calendar className="h-8 w-8 text-blue-600" />}
            />

            <PaymentSummaryCard
              title="Payment Success Rate"
              value="99.8%"
              icon={<Star className="h-8 w-8 text-purple-600" />}
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
                  <Clock className="h-6 w-6 mr-2 text-blue-600" />
                  Upcoming Payments
                </h3>
                {upcomingPayments.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-lg`}>All caught up!</p>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No upcoming payments at this time</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingPayments.map((payment) => (
                      <UpcomingPaymentCard
                        key={payment.id}
                        payment={payment}
                        onPayNow={handleMakePayment}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Methods */}
              <div>
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-6 flex items-center text-lg`}>
                  <ShieldCheck className="h-6 w-6 mr-2 text-green-600" />
                  Payment Methods
                </h3>
                <div className="space-y-4">
                  <PaymentMethodCard
                    method="Bank Transfer"
                    icon={<Banknote className="h-6 w-6 text-blue-600" />}
                    isSelected={selectedPaymentMethod === 'bank'}
                    onSelect={() => setSelectedPaymentMethod('bank')}
                  />

                  <PaymentMethodCard
                    method="Credit Card"
                    icon={<CreditCard className="h-6 w-6 text-purple-600" />}
                    isSelected={selectedPaymentMethod === 'card'}
                    onSelect={() => setSelectedPaymentMethod('card')}
                  />

                  <button
                    onClick={() => handleMakePayment()}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl text-lg font-semibold mt-6 flex items-center justify-center"
                  >
                    <DollarSign className="h-6 w-6 mr-2" />
                    Pay All Pending
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className={`${darkMode ? 'bg-slate-800/80' : 'bg-white/80'} backdrop-blur-sm rounded-3xl shadow-2xl border ${darkMode ? 'border-gray-700/50' : 'border-white/50'} overflow-hidden`}>
            <div className={`p-8 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-600 rounded-2xl mr-4">
                    <BarChart3 className="h-8 w-8 text-white" />
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
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="text-center mb-6">
                <div className="p-4 bg-blue-100 rounded-2xl w-fit mx-auto mb-4">
                  <DollarSign className="h-12 w-12 text-blue-600" />
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
                  <button
                    onClick={handlePaymentSubmit}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl"
                  >
                    Confirm Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TenantPayment;