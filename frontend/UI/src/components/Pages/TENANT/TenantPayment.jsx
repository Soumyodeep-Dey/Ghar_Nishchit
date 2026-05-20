import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../../useDarkMode.js';
import TenantSideBar from './TenantSideBar';
import TenantNavBar from './TenantNavBar';
import RazorpayCheckout from './RazorpayCheckout';
import { showSuccessToast, showErrorToast } from '../../../utils/toast.jsx';
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
  const daysUntilDue = Math.ceil((new Date(payment.dueDate || payment.date) - new Date()) / 86400000);
  return (
    <div className="bg-white rounded-2xl p-6 shadow border border-gray-100 relative overflow-hidden">
      {daysUntilDue <= 3 && (
        <div className="absolute top-0 right-0 bg-red-600 text-white px-3 py-1 rounded-bl-xl text-xs font-semibold">
          Due Soon!
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-blue-50">
            <Banknote className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">{payment.type || 'Rent'}</h4>
            <p className="text-sm text-gray-600 flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(payment.dueDate || payment.date).toLocaleDateString()}
            </p>
            <p className="text-xs text-gray-500">
              {daysUntilDue > 0 ? `${daysUntilDue} days left`
                : daysUntilDue === 0 ? 'Due today'
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
          {new Date(payment.paidAt || payment.dueDate || payment.createdAt).toLocaleDateString()}
        </div>
      </td>
      <td className="py-4 px-6">
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-blue-100 mr-3"><Banknote className="h-4 w-4 text-blue-600" /></div>
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
          {payment.paymentMethod || payment.method || '—'}
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
            <Download className="h-4 w-4 mr-2" />Download
          </button>
        ) : (
          <span className="text-gray-400 flex items-center text-sm"><X className="h-4 w-4 mr-1" />N/A</span>
        )}
      </td>
    </tr>
  );
};

// ─── Main Component ──────────────────────────────────────────────────

const TenantPayment = () => {
  const { darkMode } = useDarkMode();
  const location = useLocation();
  const navigate = useNavigate();
  const leaseRedirectHandled = useRef(false);

  const [paymentHistory,   setPaymentHistory]   = useState([]);
  const [leaseCheckout,    setLeaseCheckout]    = useState(null);
  const [upcomingPayments, setUpcomingPayments] = useState([]);
  const [isLoading,        setIsLoading]        = useState(true);
  const [currentUser,      setCurrentUser]      = useState({});

  // Modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment,  setSelectedPayment]  = useState(null);

  // Manual pay form state
  const [manualAmount,     setManualAmount]     = useState('');
  const [manualNote,       setManualNote]       = useState('Rent payment');
  const [manualReady,      setManualReady]      = useState(false);

  // ── Fetch on mount ──────────────────────────────────────────────
  const fetchPayments = useCallback(async () => {
    try {
      const data = await api.getTenantPaymentHistory();
      const history  = Array.isArray(data) ? data : (data?.history || data?.paymentHistory || []);
      const upcoming = data?.upcoming || data?.upcomingPayments || [];
      setPaymentHistory(history);
      setUpcomingPayments(upcoming);
    } catch (err) {
      console.error('Failed to load payments:', err);
      showErrorToast('Could not load payment data.');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const [, profileResult] = await Promise.allSettled([
          fetchPayments(),
          api.getProfile(),
        ]);
        if (!cancelled) {
          if (profileResult.status === 'fulfilled') setCurrentUser(profileResult.value || {});
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [fetchPayments]);

  // After accepting a lease, open move-in payment with rent + deposit pre-filled
  useEffect(() => {
    const lp = location.state?.leasePayment;
    if (!lp || leaseRedirectHandled.current) return;
    leaseRedirectHandled.current = true;

    const rent = Number(lp.rentAmount || 0);
    const deposit = Number(lp.securityDeposit || 0);
    const total = Number(lp.totalAmount || rent + deposit);

    setLeaseCheckout(lp);
    setSelectedPayment({
      id: `lease-${lp.contractId}`,
      propertyId: lp.propertyId,
      amount: total,
      rentAmount: rent,
      securityDeposit: deposit,
      propertyTitle: lp.propertyTitle,
      landlordName: lp.landlordName,
      type: 'Move-in Payment',
      dueDate: new Date().toISOString(),
      contractId: lp.contractId,
    });
    setShowPaymentModal(true);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, location.pathname, navigate]);

  // ── Memoised stats ───────────────────────────────────────────────
  const calculations = useMemo(() => {
    const paidPayments  = paymentHistory.filter(p => p.status === 'Paid');
    const totalPaid     = paidPayments.reduce((s, p) => s + Number(p.amount || 0), 0);
    const pendingAmount = upcomingPayments.reduce((s, p) => s + Number(p.amount || 0), 0);
    const nextDue       = upcomingPayments.length > 0
      ? new Date(Math.min(...upcomingPayments.map(p => new Date(p.dueDate || p.date)))).toLocaleDateString()
      : 'N/A';
    const overdueCount = paymentHistory.filter(p => p.status === 'Overdue').length;
    const successBase  = paidPayments.length + overdueCount;
    const successRate  = successBase > 0
      ? ((paidPayments.length / successBase) * 100).toFixed(1) + '%'
      : 'N/A';
    return { totalPaid, pendingAmount, nextDue, pendingCount: upcomingPayments.length, successRate };
  }, [paymentHistory, upcomingPayments]);

  // ── Modal helpers ───────────────────────────────────────────────
  const openModal = useCallback((payment = null) => {
    setSelectedPayment(payment);
    setManualAmount('');
    setManualNote('Rent payment');
    setManualReady(false);
    setShowPaymentModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowPaymentModal(false);
    setSelectedPayment(null);
    setManualReady(false);
  }, []);

  const handlePaymentSuccess = useCallback(async () => {
    const wasLease = !!leaseCheckout;
    closeModal();
    setLeaseCheckout(null);
    showSuccessToast(
      wasLease
        ? '✅ Move-in payment complete! Your landlord has been notified.'
        : '✅ Rent paid successfully!'
    );
    await fetchPayments();
  }, [closeModal, fetchPayments, leaseCheckout]);

  const handlePaymentFailure = useCallback((msg) => {
    showErrorToast(msg || 'Payment failed. Please try again.');
  }, []);

  const downloadReceipt = useCallback((payment) => {
    const lines = [
      '============================================',
      '              PAYMENT RECEIPT',
      '============================================',
      '',
      `Receipt:  ${payment.razorpayPaymentId || payment.id}`,
      `Date:     ${new Date(payment.paidAt || payment.createdAt).toLocaleDateString()}`,
      '',
      `Type:     ${payment.type || 'Rent'}`,
      `Amount:   ₹${Number(payment.amount).toLocaleString('en-IN')}`,
      `Method:   ${payment.paymentMethod || 'Razorpay'}`,
      `Status:   ${payment.status}`,
      '',
      'Thank you for your payment!',
      '============================================',
    ].join('\n');
    const link = document.createElement('a');
    link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(lines)}`;
    link.download = `receipt-${payment.razorpayPaymentId || payment.id}.txt`;
    link.click();
    showSuccessToast('Receipt downloaded');
  }, []);

  // ── Derived props for RazorpayCheckout ───────────────────────────
  // propertyId is intentionally left undefined for manual payments —
  // the backend createOrder accepts it as optional.
  const checkoutProps = selectedPayment
    ? {
        propertyId: selectedPayment.propertyId || selectedPayment.property?._id || undefined,
        amount:     selectedPayment.amount,
        dueDate:    selectedPayment.dueDate || selectedPayment.date,
        note:       selectedPayment.contractId
          ? `Move-in: rent ₹${selectedPayment.rentAmount || 0} + deposit ₹${selectedPayment.securityDeposit || 0} | contract:${selectedPayment.contractId}`
          : `Rent — ${selectedPayment.type || 'Rent'}`,
      }
    : {
        propertyId: undefined,   // optional — backend handles null gracefully
        amount:     Number(manualAmount),
        dueDate:    new Date().toISOString(),
        note:       manualNote,
      };

  const bgClass   = darkMode
    ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-blue-950'
    : 'bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400';
  const cardBg    = darkMode ? 'bg-slate-800/80 border-gray-700/50' : 'bg-white/80 border-white/50';
  const textHead  = darkMode ? 'text-white'     : 'text-gray-800';
  const textSub   = darkMode ? 'text-gray-300'  : 'text-gray-600';
  const inputCls  = darkMode
    ? 'bg-slate-700 border-gray-600 text-white placeholder-gray-400'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400';

  // ── Loading ──────────────────────────────────────────────────
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
            </div>
          </main>
        </div>
      </div>
    );
  }

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

          {/* Move-in payment banner (after lease acceptance) */}
          {leaseCheckout && (
            <div className={`${cardBg} backdrop-blur-sm rounded-3xl shadow-xl p-6 mb-8 border-2 border-green-400/50`}>
              <h2 className={`text-xl font-bold mb-4 ${textHead}`}>Complete Move-in Payment</h2>
              <p className={`${textSub} mb-4`}>
                Pay your first month&apos;s rent and security deposit for the property you just signed.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                  <p className={`text-xs uppercase tracking-wide ${textSub}`}>Apartment</p>
                  <p className={`font-semibold ${textHead}`}>{leaseCheckout.propertyTitle}</p>
                </div>
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                  <p className={`text-xs uppercase tracking-wide ${textSub}`}>Landlord</p>
                  <p className={`font-semibold ${textHead}`}>{leaseCheckout.landlordName}</p>
                </div>
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                  <p className={`text-xs uppercase tracking-wide ${textSub}`}>Monthly Rent</p>
                  <p className={`font-bold text-lg ${textHead}`}>₹{Number(leaseCheckout.rentAmount || 0).toLocaleString('en-IN')}</p>
                </div>
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                  <p className={`text-xs uppercase tracking-wide ${textSub}`}>Security Deposit</p>
                  <p className={`font-bold text-lg ${textHead}`}>₹{Number(leaseCheckout.securityDeposit || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>
              <div className={`flex items-center justify-between p-4 rounded-xl ${darkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
                <span className={`font-semibold ${textHead}`}>Total Due Now</span>
                <span className="text-2xl font-bold text-green-600">
                  ₹{Number(leaseCheckout.totalAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <button
                onClick={() => {
                  const lp = leaseCheckout;
                  openModal({
                    id: `lease-${lp.contractId}`,
                    propertyId: lp.propertyId,
                    amount: Number(lp.totalAmount || 0),
                    rentAmount: lp.rentAmount,
                    securityDeposit: lp.securityDeposit,
                    propertyTitle: lp.propertyTitle,
                    landlordName: lp.landlordName,
                    type: 'Move-in Payment',
                    dueDate: new Date().toISOString(),
                    contractId: lp.contractId,
                  });
                }}
                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold"
              >
                Pay Move-in Amount
              </button>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <PaymentSummaryCard title="Total Paid This Year" value={calculations.totalPaid}
              icon={<Trophy className="h-8 w-8 text-green-600" />} />
            <PaymentSummaryCard title="Pending Payments" value={calculations.pendingCount}
              icon={<Clock className="h-8 w-8 text-yellow-600" />}
              subtitle={`₹${calculations.pendingAmount.toLocaleString('en-IN')} total`} />
            <PaymentSummaryCard title="Next Payment Due" value={calculations.nextDue}
              icon={<Calendar className="h-8 w-8 text-blue-600" />} />
            <PaymentSummaryCard title="Payment Success Rate" value={calculations.successRate}
              icon={<Star className="h-8 w-8 text-purple-600" />}
              subtitle={calculations.successRate !== 'N/A' ? 'Based on your history' : 'No history yet'} />
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
              {/* Left: upcoming OR all-clear */}
              <div>
                <h3 className={`font-semibold ${textHead} mb-6 flex items-center text-lg`}>
                  <Clock className="h-6 w-6 mr-2 text-blue-600" />
                  Upcoming Payments
                </h3>
                {upcomingPayments.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                    <p className={`${textSub} text-lg`}>All caught up!</p>
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-500'} >
                      No scheduled upcoming payments
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingPayments.map(p => (
                      <UpcomingPaymentCard key={p.id || p._id} payment={p} onPayNow={openModal} />
                    ))}
                  </div>
                )}
              </div>

              {/* Right: payment methods + Pay Now button */}
              <div>
                <h3 className={`font-semibold ${textHead} mb-6 flex items-center text-lg`}>
                  <ShieldCheck className="h-6 w-6 mr-2 text-green-600" />
                  Payment Methods
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'UPI (GPay, PhonePe, Paytm…)', icon: <IndianRupee className="h-5 w-5 text-green-600"  /> },
                    { label: 'Credit / Debit Card',            icon: <CreditCard  className="h-5 w-5 text-blue-600"   /> },
                    { label: 'Net Banking',                    icon: <Banknote    className="h-5 w-5 text-purple-600" /> },
                    { label: 'Wallets (Mobikwik, Freecharge)', icon: <ShieldCheck className="h-5 w-5 text-orange-500" /> },
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
                    Powered by Razorpay — Your preferred method is auto-selected at checkout.
                  </p>
                  <button
                    onClick={() => openModal(null)}
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
                      {['Date','Type','Amount','Method','Status','Receipt'].map(h => (
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

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full m-4">

            {/* Modal header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">
                {selectedPayment?.type === 'Move-in Payment' ? 'Pay Move-in' : 'Pay Rent'}
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close">
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              {/* MODE A: pre-filled from upcoming payment */}
              {selectedPayment ? (
                <>
                  {selectedPayment.propertyTitle && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-xl text-sm space-y-1">
                      <p><span className="text-gray-500">Apartment:</span> <strong>{selectedPayment.propertyTitle}</strong></p>
                      {selectedPayment.landlordName && (
                        <p><span className="text-gray-500">Landlord:</span> <strong>{selectedPayment.landlordName}</strong></p>
                      )}
                      {selectedPayment.rentAmount != null && (
                        <p><span className="text-gray-500">Rent:</span> ₹{Number(selectedPayment.rentAmount).toLocaleString('en-IN')}</p>
                      )}
                      {selectedPayment.securityDeposit != null && (
                        <p><span className="text-gray-500">Deposit:</span> ₹{Number(selectedPayment.securityDeposit).toLocaleString('en-IN')}</p>
                      )}
                    </div>
                  )}
                  <div className="text-center mb-6">
                    <div className="p-4 bg-blue-100 rounded-2xl w-fit mx-auto mb-4">
                      <IndianRupee className="h-12 w-12 text-blue-600" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-800">
                      ₹{Number(selectedPayment.amount).toLocaleString('en-IN')}
                    </h4>
                    <p className="text-gray-500 text-sm mt-1">{selectedPayment.type || 'Rent'}</p>
                  </div>
                  <RazorpayCheckout
                    {...checkoutProps}
                    tenantName={currentUser.name  || currentUser.fullName  || ''}
                    tenantEmail={currentUser.email || ''}
                    tenantPhone={currentUser.phone || currentUser.contact  || ''}
                    onSuccess={handlePaymentSuccess}
                    onFailure={handlePaymentFailure}
                  />
                </>
              ) : (
                /* MODE B: manual pay — amount only, no property required */
                <>
                  {!manualReady ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!manualAmount || Number(manualAmount) <= 0) {
                          showErrorToast('Please enter a valid amount greater than ₹0.');
                          return;
                        }
                        setManualReady(true);
                      }}
                      className="space-y-4"
                    >
                      <div className="text-center mb-4">
                        <div className="p-4 bg-green-100 rounded-2xl w-fit mx-auto mb-3">
                          <IndianRupee className="h-10 w-10 text-green-600" />
                        </div>
                        <p className="text-sm text-gray-500">Enter the amount you want to pay</p>
                      </div>

                      {/* Amount */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Amount (₹) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          required
                          autoFocus
                          placeholder="e.g. 12000"
                          value={manualAmount}
                          onChange={e => setManualAmount(e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-400 ${inputCls}`}
                        />
                      </div>

                      {/* Note */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. May rent"
                          value={manualNote}
                          onChange={e => setManualNote(e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-400 ${inputCls}`}
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold text-lg transition-colors"
                      >
                        Proceed to Pay ₹{manualAmount ? Number(manualAmount).toLocaleString('en-IN') : '—'}
                      </button>
                    </form>
                  ) : (
                    /* Step 2 — show RazorpayCheckout with manual values */
                    <>
                      <div className="text-center mb-6">
                        <div className="p-4 bg-green-100 rounded-2xl w-fit mx-auto mb-4">
                          <IndianRupee className="h-12 w-12 text-green-600" />
                        </div>
                        <h4 className="text-2xl font-bold text-gray-800">
                          ₹{Number(manualAmount).toLocaleString('en-IN')}
                        </h4>
                        <p className="text-gray-500 text-sm mt-1">{manualNote}</p>
                        <button
                          onClick={() => setManualReady(false)}
                          className="text-xs text-blue-500 underline mt-1"
                        >
                          ← Edit amount
                        </button>
                      </div>
                      <RazorpayCheckout
                        {...checkoutProps}
                        tenantName={currentUser.name  || currentUser.fullName  || ''}
                        tenantEmail={currentUser.email || ''}
                        tenantPhone={currentUser.phone || currentUser.contact  || ''}
                        onSuccess={handlePaymentSuccess}
                        onFailure={handlePaymentFailure}
                      />
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantPayment;
