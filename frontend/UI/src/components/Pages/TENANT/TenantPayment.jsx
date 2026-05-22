import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../../useDarkMode.js';
import TenantSideBar from './TenantSideBar';
import TenantNavBar from './TenantNavBar';
import RazorpayCheckout from './RazorpayCheckout';
import { showSuccessToast, showErrorToast } from '../../../utils/toast.jsx';
import api from '../../../services/api.js';
import { useLanguage } from '../../../i18n/LanguageContext.jsx';
import {
  CreditCard, Banknote, Download, Calendar, CheckCircle, Clock, AlertTriangle,
  IndianRupee, FileText, ShieldCheck, Star, Trophy, BarChart3, X
} from 'lucide-react';

// ─── Sub-components ─────────────────────────────────────────────────────

const PaymentSummaryCard = ({ title, value, icon, subtitle = '' }) => {
  const { darkMode } = useDarkMode();
  return (
    <div className={`rounded-2xl p-6 shadow-md border ${darkMode ? 'bg-slate-800/50 border-slate-700/50 text-slate-100' : 'bg-white/60 border-indigo-200/50 text-gray-900'} backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm mb-1 ${darkMode ? 'text-slate-300' : 'text-gray-500'}`}>{title}</p>
          <p className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
            {typeof value === 'number' ? `₹${value.toFixed(2)}` : value}
          </p>
          {subtitle && <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-indigo-600/70'}`}>{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${darkMode ? 'bg-slate-700/50 text-cyan-400' : 'bg-indigo-50 text-indigo-600'}`}>{icon}</div>
      </div>
    </div>
  );
};

const UpcomingPaymentCard = ({ payment, onPayNow }) => {
  const { darkMode } = useDarkMode();
  const daysUntilDue = Math.ceil((new Date(payment.dueDate || payment.date) - new Date()) / 86400000);
  return (
    <div className={`rounded-2xl p-6 shadow border relative overflow-hidden backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] ${darkMode ? 'bg-slate-800/50 border-slate-700/50 text-slate-100' : 'bg-white/60 border-indigo-200/50 text-gray-900'}`}>
      {daysUntilDue <= 3 && (
        <div className="absolute top-0 right-0 bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1 rounded-bl-xl text-xs font-semibold">
          Due Soon!
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-2xl ${darkMode ? 'bg-slate-700/50 text-cyan-400' : 'bg-indigo-50 text-indigo-600'}`}>
            <Banknote className="h-6 w-6" />
          </div>
          <div>
            <h4 className={`font-semibold ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>{payment.type || 'Rent'}</h4>
            <p className={`text-sm flex items-center ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(payment.dueDate || payment.date).toLocaleDateString()}
            </p>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              {daysUntilDue > 0 ? `${daysUntilDue} days left`
                : daysUntilDue === 0 ? 'Due today'
                : `${Math.abs(daysUntilDue)} days overdue`}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-xl font-bold ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>
            ₹{Number(payment.amount).toLocaleString('en-IN')}
          </p>
          <button
            onClick={() => onPayNow(payment)}
            className={`px-4 py-2 rounded-lg text-sm mt-2 font-semibold transition-all duration-300 hover:scale-105 bg-gradient-to-r ${darkMode ? 'from-cyan-500 to-indigo-600 text-white' : 'from-indigo-600 to-purple-600 text-white'}`}
          >
            Pay Now
          </button>
        </div>
      </div>
    </div>
  );
};

const PaymentHistoryRow = ({ payment, onDownloadReceipt }) => {
  const { darkMode } = useDarkMode();
  const statusColors = darkMode
    ? {
        Paid:    'bg-green-500/20 text-green-400 border border-green-500/30',
        Pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
        Overdue: 'bg-red-500/20 text-red-400 border border-red-500/30',
        Failed:  'bg-red-500/20 text-red-400 border border-red-500/30',
      }
    : {
        Paid:    'bg-green-100 text-green-700 border border-green-200',
        Pending: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
        Overdue: 'bg-red-100 text-red-700 border border-red-200',
        Failed:  'bg-red-100 text-red-700 border border-red-200',
      };
  const StatusIcon = { Paid: CheckCircle, Pending: Clock, Overdue: AlertTriangle, Failed: AlertTriangle }[payment.status] || FileText;
  return (
    <tr className={`border-b ${darkMode ? 'border-slate-700/50 hover:bg-slate-700/20' : 'border-indigo-100 hover:bg-indigo-50/30'} transition-colors`}>
      <td className="py-4 px-6">
        <div className={`flex items-center ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
          <Calendar className={`h-4 w-4 mr-2 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`} />
          {new Date(payment.paidAt || payment.dueDate || payment.createdAt).toLocaleDateString()}
        </div>
      </td>
      <td className="py-4 px-6">
        <div className={`flex items-center font-medium ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
          <div className={`p-2 rounded-lg mr-3 ${darkMode ? 'bg-slate-700/50 text-cyan-400' : 'bg-indigo-50 text-indigo-600'}`}>
            <Banknote className="h-4 w-4" />
          </div>
          {payment.type || 'Rent'}
        </div>
      </td>
      <td className="py-4 px-6">
        <span className={`font-bold text-lg ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
          ₹{Number(payment.amount).toLocaleString('en-IN')}
        </span>
      </td>
      <td className="py-4 px-6">
        <div className={`flex items-center ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
          <CreditCard className={`h-4 w-4 mr-2 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`} />
          {payment.paymentMethod || payment.method || '—'}
        </div>
      </td>
      <td className="py-4 px-6">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center w-fit ${statusColors[payment.status] || 'bg-gray-100 text-gray-700'}`}>
          <StatusIcon className="h-4 w-4 mr-1" />
          <span>{payment.status}</span>
        </span>
      </td>
      <td className="py-4 px-6">
        {payment.status === 'Paid' ? (
          <button
            className={`flex items-center text-sm font-semibold px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${darkMode ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
            onClick={() => onDownloadReceipt(payment)}
          >
            <Download className="h-4 w-4 mr-2" />Download
          </button>
        ) : (
          <span className={`flex items-center text-sm ${darkMode ? 'text-slate-400' : 'text-gray-400'}`}>
            <X className="h-4 w-4 mr-1" />N/A
          </span>
        )}
      </td>
    </tr>
  );
};

// ─── Main Component ──────────────────────────────────────────────────

const TenantPayment = () => {
  const { darkMode } = useDarkMode();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const leaseRedirectHandled = useRef(false);

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
      };

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

  const inputCls  = darkMode
    ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 focus:ring-cyan-500/20 focus:border-cyan-500'
    : 'bg-white border-indigo-200/50 text-gray-900 placeholder-gray-400 focus:ring-indigo-500/20 focus:border-indigo-500';

  // ── Loading ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${tc.loadingBg} flex relative`}>
        <TenantSideBar />
        <div className="flex-1 flex flex-col relative z-10 transition-all duration-700" style={{ marginLeft: 'var(--sidebar-width, 4.5rem)' }}>
          <TenantNavBar currentSection="Payments" />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="relative mx-auto w-20 h-20">
                <div className={`w-20 h-20 border-4 ${tc.spinnerBorder} rounded-full animate-spin`}></div>
              </div>
              <h2 className={`text-xl font-bold ${tc.textPrimary} mt-6 animate-pulse`}>Loading Payments...</h2>
              <p className={`${tc.textSecondary} mt-2`}>Preparing your statements</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${tc.mainBg} flex relative`}>
      <TenantSideBar />
      <div className="flex flex-col flex-1 relative z-10 transition-all duration-700" style={{ marginLeft: 'var(--sidebar-width, 4.5rem)' }}>
        <TenantNavBar currentSection="Payments" />
        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">

          {/* Header */}
          <div className="mb-8 text-center animate-fadeIn">
            <h1 className={`text-4xl font-bold mb-2 animate-slideDown bg-gradient-to-r ${tc.headerGradient} bg-clip-text text-transparent`}>
              {t('pages.paymentCenter')}
            </h1>
            <p className={`text-lg animate-slideUp ${tc.textSecondary}`}>
              Manage your payments with ease and security
            </p>
          </div>

          {/* Move-in payment banner (after lease acceptance) */}
          {leaseCheckout && (
            <div className={`${tc.cardBg} backdrop-blur-sm rounded-3xl shadow-xl p-6 mb-8 border-2 border-green-400/50`}>
              <h2 className={`text-xl font-bold mb-4 ${tc.textPrimary}`}>Complete Move-in Payment</h2>
              <p className={`${tc.textSecondary} mb-4`}>
                Pay your first month&apos;s rent and security deposit for the property you just signed.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                  <p className={`text-xs uppercase tracking-wide ${tc.textSecondary}`}>Apartment</p>
                  <p className={`font-semibold ${tc.textPrimary}`}>{leaseCheckout.propertyTitle}</p>
                </div>
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                  <p className={`text-xs uppercase tracking-wide ${tc.textSecondary}`}>Landlord</p>
                  <p className={`font-semibold ${tc.textPrimary}`}>{leaseCheckout.landlordName}</p>
                </div>
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                  <p className={`text-xs uppercase tracking-wide ${tc.textSecondary}`}>Monthly Rent</p>
                  <p className={`font-bold text-lg ${tc.textPrimary}`}>₹{Number(leaseCheckout.rentAmount || 0).toLocaleString('en-IN')}</p>
                </div>
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                  <p className={`text-xs uppercase tracking-wide ${tc.textSecondary}`}>Security Deposit</p>
                  <p className={`font-bold text-lg ${tc.textPrimary}`}>₹{Number(leaseCheckout.securityDeposit || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>
              <div className={`flex items-center justify-between p-4 rounded-xl ${darkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
                <span className={`font-semibold ${tc.textPrimary}`}>Total Due Now</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-slideUp">
            <PaymentSummaryCard title="Total Paid This Year" value={calculations.totalPaid}
              icon={<Trophy className="h-8 w-8 text-green-500" />} />
            <PaymentSummaryCard title="Pending Payments" value={calculations.pendingCount}
              icon={<Clock className="h-8 w-8 text-yellow-500" />}
              subtitle={`₹${calculations.pendingAmount.toLocaleString('en-IN')} total`} />
            <PaymentSummaryCard title="Next Payment Due" value={calculations.nextDue}
              icon={<Calendar className="h-8 w-8 text-blue-500" />} />
            <PaymentSummaryCard title="Payment Success Rate" value={calculations.successRate}
              icon={<Star className="h-8 w-8 text-purple-500" />}
              subtitle={calculations.successRate !== 'N/A' ? 'Based on your history' : 'No history yet'} />
          </div>

          {/* Make Payment Section */}
          <div className={`${tc.cardBg} backdrop-blur-xl border ${tc.cardBorder} rounded-3xl shadow-2xl p-8 mb-8 animate-slideUp`}>
            <div className="flex items-center mb-8">
              <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl mr-4 hover:rotate-12 transition-transform duration-300">
                <CreditCard className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${tc.textPrimary}`}>{t('pages.makePayment')}</h2>
                <p className={`${tc.textSecondary}`}>Quick and secure payment processing</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: upcoming OR all-clear */}
              <div>
                <h3 className={`font-semibold ${tc.textPrimary} mb-6 flex items-center text-lg`}>
                  <Clock className="h-6 w-6 mr-2 text-blue-500" />
                  Upcoming Payments
                </h3>
                {upcomingPayments.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                    <p className={`${tc.textPrimary} text-lg font-medium`}>All caught up!</p>
                    <p className={`${tc.textSecondary} text-sm mt-1`} >
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
                <h3 className={`font-semibold ${tc.textPrimary} mb-6 flex items-center text-lg`}>
                  <ShieldCheck className="h-6 w-6 mr-2 text-green-500" />
                  Payment Methods
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'UPI (GPay, PhonePe, Paytm…)', icon: <IndianRupee className="h-5 w-5 text-green-500"  /> },
                    { label: 'Credit / Debit Card',            icon: <CreditCard  className="h-5 w-5 text-blue-500"   /> },
                    { label: 'Net Banking',                    icon: <Banknote    className="h-5 w-5 text-purple-500" /> },
                    { label: 'Wallets (Mobikwik, Freecharge)', icon: <ShieldCheck className="h-5 w-5 text-orange-500" /> },
                  ].map(({ label, icon }) => (
                    <div key={label}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 hover:scale-[1.01] ${
                        darkMode ? 'border-slate-700/50 bg-slate-700/30' : 'border-indigo-100 bg-indigo-50/30'
                      }`}
                    >
                      {icon}
                      <span className={`text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-gray-700'}`}>{label}</span>
                    </div>
                  ))}
                  <p className={`text-xs mt-2 ${darkMode ? 'text-slate-400' : 'text-indigo-600/70'}`}>
                    Powered by Razorpay — Your preferred method is auto-selected at checkout.
                  </p>
                  <button
                    onClick={() => openModal(null)}
                    className={`w-full text-white py-4 rounded-xl text-lg font-semibold mt-4 flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:scale-[1.02] bg-gradient-to-r ${darkMode ? 'from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700' : 'from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'}`}
                  >
                    <IndianRupee className="h-6 w-6 mr-2" />
                    Pay Now via Razorpay
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className={`${tc.cardBg} backdrop-blur-xl border ${tc.cardBorder} rounded-3xl shadow-2xl overflow-hidden animate-slideUp`}>
            <div className={`p-8 border-b ${darkMode ? 'border-slate-700/50' : 'border-indigo-100'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-600 rounded-2xl mr-4 hover:rotate-12 transition-transform duration-300">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${tc.textPrimary}`}>{t('pages.paymentHistory')}</h2>
                    <p className={`${tc.textSecondary}`}>Track all your payment transactions</p>
                  </div>
                </div>
                <div className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-indigo-600'}`}>
                  {paymentHistory.length} total transactions
                </div>
              </div>
            </div>
            {paymentHistory.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className={`${tc.textPrimary} text-lg font-medium`}>No payment history yet</p>
                <p className={`${tc.textSecondary} mt-1`}>Your completed payments will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={darkMode ? 'bg-slate-900/60' : 'bg-gradient-to-r from-indigo-50 to-purple-50'}>
                    <tr>
                      {['Date','Type','Amount','Method','Status','Receipt'].map(h => (
                        <th key={h} className={`text-left py-4 px-6 font-semibold ${darkMode ? 'text-slate-300' : 'text-indigo-700'}`}>{h}</th>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md transition-opacity duration-300">
          <div className={`rounded-3xl shadow-2xl max-w-md w-full m-4 border overflow-hidden backdrop-blur-xl ${
            darkMode ? 'bg-slate-800/95 border-slate-700/50 text-slate-100' : 'bg-white/95 border-indigo-200/50 text-gray-900'
          }`}>

            {/* Modal header */}
            <div className={`p-6 border-b flex items-center justify-between ${darkMode ? 'border-slate-700/50' : 'border-indigo-100'}`}>
              <h3 className={`text-xl font-bold ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>
                {selectedPayment?.type === 'Move-in Payment' ? 'Pay Move-in' : 'Pay Rent'}
              </h3>
              <button onClick={closeModal} className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-slate-700/50 text-slate-400 hover:text-slate-200' : 'hover:bg-indigo-50 text-gray-500'}`}
                aria-label="Close">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              {/* MODE A: pre-filled from upcoming payment */}
              {selectedPayment ? (
                <>
                  {selectedPayment.propertyTitle && (
                    <div className={`mb-4 p-4 rounded-xl text-sm space-y-1 border ${
                      darkMode ? 'bg-slate-700/30 border-slate-700/50 text-slate-350' : 'bg-indigo-50/50 border-indigo-100 text-gray-700'
                    }`}>
                      <p><span className={darkMode ? 'text-slate-400' : 'text-gray-500'}>Apartment:</span> <strong>{selectedPayment.propertyTitle}</strong></p>
                      {selectedPayment.landlordName && (
                        <p><span className={darkMode ? 'text-slate-400' : 'text-gray-500'}>Landlord:</span> <strong>{selectedPayment.landlordName}</strong></p>
                      )}
                      {selectedPayment.rentAmount != null && (
                        <p><span className={darkMode ? 'text-slate-400' : 'text-gray-500'}>Rent:</span> ₹{Number(selectedPayment.rentAmount).toLocaleString('en-IN')}</p>
                      )}
                      {selectedPayment.securityDeposit != null && (
                        <p><span className={darkMode ? 'text-slate-400' : 'text-gray-500'}>Deposit:</span> ₹{Number(selectedPayment.securityDeposit).toLocaleString('en-IN')}</p>
                      )}
                    </div>
                  )}
                  <div className="text-center mb-6 animate-scaleIn">
                    <div className={`p-4 rounded-2xl w-fit mx-auto mb-4 ${darkMode ? 'bg-slate-700/50 text-cyan-400' : 'bg-indigo-50 text-indigo-600'}`}>
                      <IndianRupee className="h-12 w-12" />
                    </div>
                    <h4 className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>
                      ₹{Number(selectedPayment.amount).toLocaleString('en-IN')}
                    </h4>
                    <p className={`${darkMode ? 'text-slate-300' : 'text-gray-500'} text-sm mt-1`}>{selectedPayment.type || 'Rent'}</p>
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
                        <div className={`p-4 rounded-2xl w-fit mx-auto mb-3 ${darkMode ? 'bg-slate-700/50 text-green-400' : 'bg-green-50 text-green-600'}`}>
                          <IndianRupee className="h-10 w-10" />
                        </div>
                        <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-gray-500'}`}>Enter the amount you want to pay</p>
                      </div>

                      {/* Amount */}
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-200' : 'text-gray-700'}`}>
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
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-200' : 'text-gray-700'}`}>Note (optional)</label>
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
                        className={`w-full text-white py-3 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-[1.02] bg-gradient-to-r ${darkMode ? 'from-green-500 to-emerald-600' : 'from-green-600 to-teal-600'}`}
                      >
                        Proceed to Pay ₹{manualAmount ? Number(manualAmount).toLocaleString('en-IN') : '—'}
                      </button>
                    </form>
                  ) : (
                    /* Step 2 — show RazorpayCheckout with manual values */
                    <>
                      <div className="text-center mb-6">
                        <div className={`p-4 rounded-2xl w-fit mx-auto mb-4 ${darkMode ? 'bg-slate-700/50 text-green-400' : 'bg-green-50 text-green-600'}`}>
                          <IndianRupee className="h-12 w-12" />
                        </div>
                        <h4 className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>
                          ₹{Number(manualAmount).toLocaleString('en-IN')}
                        </h4>
                        <p className={`${darkMode ? 'text-slate-300' : 'text-gray-500'} text-sm mt-1`}>{manualNote}</p>
                        <button
                          onClick={() => setManualReady(false)}
                          className="text-xs text-blue-500 hover:text-blue-700 underline mt-2 block mx-auto"
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

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.8s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.8s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
        }
      `}</style>
    </div>
  );
};

export default TenantPayment;
