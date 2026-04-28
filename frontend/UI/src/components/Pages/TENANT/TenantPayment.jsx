import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDarkMode } from '../../../useDarkMode.js';
import TenantSideBar from './TenantSideBar';
import TenantNavBar from './TenantNavBar';
import RazorpayCheckout from './RazorpayCheckout';
import { showInfoToast, showSuccessToast, showErrorToast } from '../../../utils/toast.jsx';
import api from '../../../services/api.js';
import {
  CreditCard, Banknote, Download, Calendar, CheckCircle, Clock, AlertTriangle,
  IndianRupee, FileText, ShieldCheck, Star, Trophy, BarChart3, X
} from 'lucide-react';

// ─── Sub-components ─────────────────────────────────────────────────────

const PaymentSummaryCard = ({ title, value, icon, subtitle = '' }) => (
  <div className="rounded-2xl p-6 shadow-md bg-white">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">
          {typeof value === 'number' ? `₹${value.toFixed(2)}` : value}
        </p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className="p-3 rounded-xl bg-gray-100">{icon}</div>
    </div>
  </div>
);

const UpcomingPaymentCard = ({ payment, onPayNow }) => {
  const getPaymentIcon = (type) => {
    switch ((type || '').toLowerCase()) {
      case 'rent':      return <Banknote      className="h-6 w-6 text-blue-600" />;
      case 'utilities': return <IndianRupee   className="h-6 w-6 text-green-600" />;
      default:          return <FileText      className="h-6 w-6 text-gray-600" />;
    }
  };

  const daysUntilDue = Math.ceil((new Date(payment.date) - new Date()) / 86400000);

  return (
    <div className="bg-white rounded-2xl p-6 shadow border border-gray-100 relative overflow-hidden">
      {daysUntilDue <= 3 && (
        <div className="absolute top-0 right-0 bg-red-600 text-white px-3 py-1 rounded-bl-xl text-xs font-semibold">
          Due Soon!
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-blue-50">{getPaymentIcon(payment.type)}</div>
          <div>
            <h4 className="font-semibold text-gray-800">{payment.type}</h4>
            <p className="text-sm text-gray-600 flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(payment.date).toLocaleDateString()}
            </p>
            <p className="text-xs text-gray-500">
              {daysUntilDue > 0
                ? `${daysUntilDue} days left`
                : daysUntilDue === 0
                ? 'Due today'
                : `${Math.abs(daysUntilDue)} days overdue`}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-gray-800">
            ₹{Number(payment.amount).toLocaleString('en-IN')}
          </p>
          <button
            onClick={() => onPayNow(payment)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm mt-2"
          >
            Pay Now
          </button>
        </div>
      </div>
    </div>
  );
};

const PaymentHistoryRow = ({ payment, onDownloadReceipt }) => {
  const statusColors = {
    Paid:    'bg-green-100 text-green-700',
    Pending: 'bg-yellow-100 text-yellow-700',
    Overdue: 'bg-red-100 text-red-700',
    Failed:  'bg-red-100 text-red-700',
  };
  const StatusIcon = { Paid: CheckCircle, Pending: Clock, Overdue: AlertTriangle, Failed: AlertTriangle }[payment.status] || FileText;

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="py-4 px-6">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
          {new Date(payment.date || payment.createdAt).toLocaleDateString()}
        </div>
      </td>
      <td className="py-4 px-6">
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-blue-100 mr-3">
            <Banknote className="h-4 w-4 text-blue-600" />
          </div>
          {payment.type || 'Rent'}
        </div>
      </td>
      <td className="py-4 px-6">
        <span className="font-bold text-lg text-gray-800">
          ₹{Number(payment.amount).toLocaleString('en-IN')}
        </span>
      </td>
      <td className="py-4 px-6">
        <div className="flex items-center">
          <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
          {payment.method || payment.paymentMethod || '—'}
        </div>
      </td>
      <td className="py-4 px-6">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center w-fit ${statusColors[payment.status] || 'bg-gray-100 text-gray-700'}`}>
          <StatusIcon className="h-4 w-4" />
          <span className="ml-1">{payment.status}</span>
        </span>
      </td>
      <td className="py-4 px-6">
        {payment.status === 'Paid' ? (
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

// ─── Main Component ──────────────────────────────────────────────────

const TenantPayment = () => {
  const { darkMode } = useDarkMode();

  const [paymentHistory,   setPaymentHistory]   = useState([]);
  const [upcomingPayments, setUpcomingPayments] = useState([]);
  const [isLoading,        setIsLoading]        = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment,  setSelectedPayment]  = useState(null);
  // currentUser is used to prefill Razorpay checkout (name/email/phone)
  const [currentUser,      setCurrentUser]      = useState({});

  // ── Fetch payments + profile on mount ────────────────────────────────
  const fetchPayments = useCallback(async () => {
    try {
      const data = await api.getTenantPaymentHistory();
      const history  = data?.history  || data?.paymentHistory  || data || [];
      const upcoming = data?.upcoming || data?.upcomingPayments || [];
      setPaymentHistory(Array.isArray(history)  ? history  : []);
      setUpcomingPayments(Array.isArray(upcoming) ? upcoming : []);
    } catch (err) {
      console.error('Failed to load payments:', err);
      showErrorToast('Could not load payment data. Please try again.');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        // Fetch payments and profile in parallel
        const [, profile] = await Promise.allSettled([
          fetchPayments(),
          api.getProfile(),
        ]);
        if (!cancelled && profile.status === 'fulfilled') {
          setCurrentUser(profile.value || {});
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [fetchPayments]);

  // ── Memoised stats ───────────────────────────────────────────────
  const calculations = useMemo(() => {
    const paidPayments   = paymentHistory.filter(p => p.status === 'Paid');
    const totalPaid      = paidPayments.reduce((s, p) => s + Number(p.amount || 0), 0);
    const pendingAmount  = upcomingPayments.reduce((s, p) => s + Number(p.amount || 0), 0);
    const nextPaymentDue = upcomingPayments.length > 0
      ? new Date(Math.min(...upcomingPayments.map(p => new Date(p.date || p.dueDate)))).toLocaleDateString()
      : 'N/A';
    const overdueCount = paymentHistory.filter(p => p.status === 'Overdue').length;
    const successBase  = paidPayments.length + overdueCount;
    const successRate  = successBase > 0
      ? ((paidPayments.length / successBase) * 100).toFixed(1) + '%'
      : 'N/A';
    return { totalPaid, pendingAmount, nextPaymentDue, pendingCount: upcomingPayments.length, successRate };
  }, [paymentHistory, upcomingPayments]);

  // ── Handlers ────────────────────────────────────────────────────
  const handleMakePayment = useCallback((payment = null) => {
    if (payment) {
      setSelectedPayment(payment);
      setShowPaymentModal(true);
    } else {
      if (upcomingPayments.length === 0) {
        showInfoToast('No pending payments at this time.');
        return;
      }
      // Open modal for the first pending payment when "Pay All" is clicked
      setSelectedPayment(upcomingPayments[0]);
      setShowPaymentModal(true);
    }
  }, [upcomingPayments]);

  // Called by RazorpayCheckout on successful verified payment
  const handlePaymentSuccess = useCallback(async (payment) => {
    setShowPaymentModal(false);
    setSelectedPayment(null);
    showSuccessToast('✅ Rent paid successfully!');
    // Refresh payment list from server so history is up-to-date
    await fetchPayments();
  }, [fetchPayments]);

  const handlePaymentFailure = useCallback((msg) => {
    showErrorToast(msg || 'Payment failed. Please try again.');
  }, []);

  const downloadReceipt = useCallback((payment) => {
    const amount = Number(payment.amount).toLocaleString('en-IN');
    const receiptContent = [
      '============================================',
      '              PAYMENT RECEIPT',
      '============================================',
      '',
      `Receipt:  ${payment.razorpayPaymentId || payment.receipt || payment.id}`,
      `Date:     ${new Date(payment.paidAt || payment.date || payment.createdAt).toLocaleDateString()}`,
      '',
      'Payment Details:',
      '----------------',
      `Type:     ${payment.type || 'Rent'}`,
      `Amount:   ₹${amount}`,
      `Method:   ${payment.paymentMethod || payment.method || 'Razorpay'}`,
      `Status:   ${payment.status}`,
      '',
      'Thank you for your payment!',
      '============================================',
    ].join('\n');

    const link = document.createElement('a');
    link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(receiptContent)}`;
    link.download = `receipt-${payment.razorpayPaymentId || payment.id}.txt`;
    link.click();
    showSuccessToast('Receipt downloaded');
  }, []);

  // ── Loading screen ────────────────────────────────────────────────
  const bgClass = darkMode
    ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-blue-950'
    : 'bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400';

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <TenantSideBar />
        <div className="flex flex-col flex-1" style={{ marginLeft: 'var(--sidebar-width, 4.5rem)' }}>
          <TenantNavBar currentSection="Payments" />
          <main className={`flex-1 flex items-center justify-center ${bgClass}`}>
            <div className="text-center">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-green-200 rounded-full animate-spin" />
                <div className="absolute inset-0 w-20 h-20 border-4 border-t-green-600 rounded-full animate-spin" />
              </div>
              <h2 className={`text-xl font-bold mt-6 animate-pulse ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Loading Payments…
              </h2>
              <p className={darkMode ? 'text-gray-300 mt-2' : 'text-gray-600 mt-2'}>
                Fetching your financial data
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────
  const cardBg   = darkMode ? 'bg-slate-800/80 border-gray-700/50' : 'bg-white/80 border-white/50';
  const textHead = darkMode ? 'text-white' : 'text-gray-800';
  const textSub  = darkMode ? 'text-gray-300' : 'text-gray-600';

  return (
    <div className={`flex h-screen ${bgClass}`}>
      <TenantSideBar />
      <div className="flex flex-col flex-1" style={{ marginLeft: 'var(--sidebar-width, 4.5rem)' }}>
        <TenantNavBar currentSection="Payments" />
        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Center</h1>
            <p className="text-gray-600">Manage your payments with ease and security</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <PaymentSummaryCard
              title="Total Paid This Year"
              value={calculations.totalPaid}
              icon={<Trophy className="h-8 w-8 text-green-600" />}
            />
            <PaymentSummaryCard
              title="Pending Payments"
              value={calculations.pendingCount}
              icon={<Clock className="h-8 w-8 text-yellow-600" />}
              subtitle={`₹${calculations.pendingAmount.toLocaleString('en-IN')} total`}
            />
            <PaymentSummaryCard
              title="Next Payment Due"
              value={calculations.nextPaymentDue}
              icon={<Calendar className="h-8 w-8 text-blue-600" />}
            />
            <PaymentSummaryCard
              title="Payment Success Rate"
              value={calculations.successRate}
              icon={<Star className="h-8 w-8 text-purple-600" />}
              subtitle={calculations.successRate !== 'N/A' ? 'Based on your history' : 'No history yet'}
            />
          </div>

          {/* Make Payment Section */}
          <div className={`${cardBg} backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-8 border`}>
            <div className="flex items-center mb-8">
              <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl mr-4">
                <CreditCard className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${textHead}`}>Make Payment</h2>
                <p className={textSub}>Quick and secure payment processing</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upcoming */}
              <div>
                <h3 className={`font-semibold ${textHead} mb-6 flex items-center text-lg`}>
                  <Clock className="h-6 w-6 mr-2 text-blue-600" />
                  Upcoming Payments
                </h3>
                {upcomingPayments.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                    <p className={`${textSub} text-lg`}>All caught up!</p>
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No upcoming payments at this time</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingPayments.map(p => (
                      <UpcomingPaymentCard key={p.id || p._id} payment={p} onPayNow={handleMakePayment} />
                    ))}
                  </div>
                )}
              </div>

              {/* Methods info + Pay All button */}
              <div>
                <h3 className={`font-semibold ${textHead} mb-6 flex items-center text-lg`}>
                  <ShieldCheck className="h-6 w-6 mr-2 text-green-600" />
                  Payment Methods
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'UPI (GPay, PhonePe, Paytm…)', icon: <IndianRupee className="h-5 w-5 text-green-600" /> },
                    { label: 'Credit / Debit Card',           icon: <CreditCard  className="h-5 w-5 text-blue-600"  /> },
                    { label: 'Net Banking',                   icon: <Banknote    className="h-5 w-5 text-purple-600"/> },
                    { label: 'Wallets (Mobikwik, Freecharge)', icon: <ShieldCheck className="h-5 w-5 text-orange-500"/> },
                  ].map(({ label, icon }) => (
                    <div key={label}
                      className={`flex items-center gap-3 p-3 rounded-xl border ${
                        darkMode ? 'border-gray-600 bg-slate-700/50' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      {icon}
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{label}</span>
                    </div>
                  ))}

                  <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Powered by Razorpay — Your preferred method is auto-selected in the payment screen.
                  </p>

                  <button
                    onClick={() => handleMakePayment()}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl text-lg font-semibold mt-4 flex items-center justify-center transition-colors"
                  >
                    <IndianRupee className="h-6 w-6 mr-2" />
                    Pay Now via Razorpay
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className={`${cardBg} backdrop-blur-sm rounded-3xl shadow-2xl border overflow-hidden`}>
            <div className={`p-8 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-600 rounded-2xl mr-4">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${textHead}`}>Payment History</h2>
                    <p className={textSub}>Track all your payment transactions</p>
                  </div>
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {paymentHistory.length} total transactions
                </div>
              </div>
            </div>

            {paymentHistory.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className={`${textSub} text-lg`}>No payment history yet</p>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Your completed payments will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                    <tr>
                      {['Date', 'Type', 'Amount', 'Method', 'Status', 'Receipt'].map(h => (
                        <th key={h} className="text-left py-4 px-6 font-semibold text-gray-700">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map(p => (
                      <PaymentHistoryRow key={p.id || p._id} payment={p} onDownloadReceipt={downloadReceipt} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ──────────────────────────────────────────────────────────────
           Razorpay Payment Modal
           — Replaces the old fake "Confirm Payment" modal entirely.
           — RazorpayCheckout handles the full flow:
               1. POST /api/payments/create-order  (backend creates Razorpay order)
               2. Razorpay popup opens             (Card / UPI / Net Banking / Wallet / OTP)
               3. POST /api/payments/verify        (backend verifies HMAC signature)
               4. onSuccess → refreshes payment list from server
      ────────────────────────────────────────────────────────────── */}
      {showPaymentModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full m-4">

            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">Pay Rent</h3>
              <button
                onClick={() => { setShowPaymentModal(false); setSelectedPayment(null); }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close payment modal"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            {/* Payment Summary */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="p-4 bg-blue-100 rounded-2xl w-fit mx-auto mb-4">
                  <IndianRupee className="h-12 w-12 text-blue-600" />
                </div>
                <h4 className="text-2xl font-bold text-gray-800">
                  ₹{Number(selectedPayment.amount).toLocaleString('en-IN')}
                </h4>
                <p className="text-gray-500 text-sm mt-1">
                  {selectedPayment.type || 'Rent'}
                  {selectedPayment.property?.title ? ` — ${selectedPayment.property.title}` : ''}
                </p>
                {selectedPayment.dueDate && (
                  <p className="text-xs text-gray-400 mt-1">
                    Due: {new Date(selectedPayment.dueDate || selectedPayment.date).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* ★ RazorpayCheckout replaces the old Confirm button ★ */}
              <RazorpayCheckout
                propertyId={selectedPayment.propertyId || selectedPayment.property?._id || selectedPayment.id}
                amount={selectedPayment.amount}
                dueDate={selectedPayment.dueDate || selectedPayment.date}
                note={`Rent payment — ${selectedPayment.type || 'Rent'}`}
                tenantName={currentUser.name  || currentUser.fullName  || ''}
                tenantEmail={currentUser.email || ''}
                tenantPhone={currentUser.phone || currentUser.contact  || ''}
                onSuccess={handlePaymentSuccess}
                onFailure={handlePaymentFailure}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantPayment;
