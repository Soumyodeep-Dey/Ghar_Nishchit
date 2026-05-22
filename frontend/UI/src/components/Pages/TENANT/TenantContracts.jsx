import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useDarkMode } from '../../../useDarkMode.js';
import TenantSideBar from './TenantSideBar';
import TenantNavBar from './TenantNavBar';
import api from '../../../services/api.js';
import { showSuccessToast, showErrorToast } from '../../../utils/toast.jsx';
import { useLanguage } from '../../../i18n/LanguageContext.jsx';
import {
  FileText, CheckCircle, Clock, XCircle, Home, Calendar,
  IndianRupee, Shield, User, AlertTriangle, RefreshCw, Eye, X
} from 'lucide-react';

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const { darkMode } = useDarkMode();
  const cfg = {
    pending:   { label: 'Awaiting Your Signature', color: darkMode ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-800 border-amber-250', icon: Clock },
    active:    { label: 'Active Lease',             color: darkMode ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-green-50  text-green-800  border-green-200',  icon: CheckCircle },
    completed: { label: 'Completed',                color: darkMode ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-blue-50   text-blue-800   border-blue-200',   icon: CheckCircle },
    cancelled: { label: 'Cancelled',                color: darkMode ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-red-50    text-red-800    border-red-200',    icon: XCircle },
  }[status?.toLowerCase()] || { label: status, color: darkMode ? 'bg-slate-800/80 text-slate-350 border-slate-700/50' : 'bg-gray-100 text-gray-700 border-gray-250', icon: FileText };

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
  const [showSignPad, setShowSignPad] = useState(false);
  const [signatureName, setSignatureName] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  if (!contract) return null;

  const isPending = contract.status === 'pending';
  const bg = darkMode ? 'bg-slate-900/95 backdrop-blur-xl border border-slate-700/50' : 'bg-white/95 backdrop-blur-xl border border-indigo-200/50';
  const text = darkMode ? 'text-slate-100' : 'text-gray-900';
  const sub = darkMode ? 'text-slate-400' : 'text-gray-500';
  const border = darkMode ? 'border-slate-700/50' : 'border-indigo-100';
  const rowBg = darkMode ? 'bg-slate-800/50 border border-slate-700/30' : 'bg-gray-50/80 border border-indigo-50';

  const Row = ({ label, value }) => (
    <div className={`flex justify-between items-center py-3 px-4 rounded-xl ${rowBg}`}>
      <span className={`text-sm font-medium ${sub}`}>{label}</span>
      <span className={`text-sm font-semibold ${text}`}>{value}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
      <div
        className={`${bg} rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`sticky top-0 ${bg} p-6 border-b ${border} rounded-t-3xl flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${text}`}>Lease Contract</h2>
              <p className={`text-sm ${sub}`}>{contract.property?.title || 'Property Contract'}</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-800 transition-colors ${sub}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Status banner for pending */}
          {isPending && !showSignPad && (
            <div className={`flex items-start gap-3 p-4 border rounded-2xl ${
              darkMode ? 'bg-amber-500/10 border-amber-500/25' : 'bg-amber-50 border-amber-200'
            }`}>
              <AlertTriangle className="w-5 h-5 text-amber-550 mt-0.5 flex-shrink-0" />
              <div>
                <p className={`text-sm font-semibold ${darkMode ? 'text-amber-400' : 'text-amber-800'}`}>Action Required</p>
                <p className={`text-sm mt-0.5 ${darkMode ? 'text-amber-550' : 'text-amber-700'}`}>
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
            {showSignPad ? (
              <div className="space-y-4 animate-fadeIn">
                <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-zinc-950/60 border-amber-500/20' : 'bg-amber-50/50 border-amber-200'} space-y-4`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-5 h-5 text-amber-500" />
                    <h4 className={`font-bold text-sm uppercase tracking-wider ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
                      Secure e-Signature Certificate
                    </h4>
                  </div>
                  
                  <div className="space-y-3">
                    <label className={`block text-xs font-bold ${darkMode ? 'text-zinc-400' : 'text-stone-600'}`}>
                      TYPE YOUR FULL NAME TO SIGN:
                    </label>
                    <input
                      type="text"
                      value={signatureName}
                      onChange={(e) => setSignatureName(e.target.value)}
                      placeholder="e.g. Jane Doe"
                      className={`w-full px-4 py-3 rounded-xl border-2 font-medium text-sm focus:outline-none transition-all duration-300 ${
                        darkMode 
                          ? 'bg-zinc-900 border-zinc-800 text-slate-100 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20' 
                          : 'bg-white border-amber-200 text-stone-900 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20'
                      }`}
                    />
                  </div>

                  {signatureName.trim() && (
                    <div className="space-y-2">
                      <span className={`block text-xs font-bold ${darkMode ? 'text-zinc-500' : 'text-stone-400'}`}>
                        LIVE E-SIGNATURE PREVIEW:
                      </span>
                      <div className={`p-6 rounded-xl border border-dashed text-center relative overflow-hidden ${
                        darkMode ? 'bg-zinc-950/80 border-amber-500/30' : 'bg-amber-50/20 border-amber-300'
                      }`}>
                        {/* Interactive cursive script preview */}
                        <p className={`text-4xl text-amber-500 tracking-wider select-none font-light py-2`} style={{ fontFamily: "'Brush Script MT', 'Great Vibes', 'Parisienne', 'Georgia', cursive, sans-serif" }}>
                          {signatureName}
                        </p>
                        <div className={`text-[10px] uppercase font-bold tracking-widest mt-2 ${darkMode ? 'text-zinc-650' : 'text-stone-400'}`}>
                          Digitally Verified • {new Date().toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </div>
                        {/* Decorative background logo */}
                        <div className="absolute right-3 bottom-1 opacity-5">
                          <Shield className="w-16 h-16 text-amber-500" />
                        </div>
                      </div>
                    </div>
                  )}

                  <label className="flex items-start gap-3 cursor-pointer group mt-2">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-1 rounded border-amber-500/30 text-amber-500 focus:ring-amber-500/20 w-4 h-4"
                    />
                    <span className={`text-xs select-none ${darkMode ? 'text-zinc-400 group-hover:text-zinc-300' : 'text-stone-600 group-hover:text-stone-850'}`}>
                      I agree that this is a legally binding electronic signature and I accept all terms, conditions, and custom clauses of this lease contract.
                    </span>
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSignPad(false)}
                    disabled={accepting}
                    className={`flex-1 py-3 rounded-xl border font-semibold text-sm transition-colors disabled:opacity-50 ${
                      darkMode ? 'border-zinc-800 text-zinc-400 hover:bg-zinc-850' : 'border-amber-250 text-amber-800 hover:bg-amber-50/50'
                    }`}
                  >
                    Back to Review
                  </button>
                  <button
                    onClick={() => onAccept(contract._id || contract.id)}
                    disabled={accepting || !signatureName.trim() || !agreeTerms}
                    className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      signatureName.trim() && agreeTerms
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-zinc-950 hover:from-amber-400 hover:to-yellow-500 shadow-amber-500/20 shadow-lg'
                        : darkMode 
                        ? 'bg-zinc-800 text-zinc-500 border border-zinc-700/50' 
                        : 'bg-stone-100 text-stone-400 border border-stone-200'
                    }`}
                  >
                    {accepting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    {accepting ? 'Signing…' : 'Sign & Finalize'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className={`text-xs ${sub} text-center mb-4`}>
                  By clicking "Proceed to e-Signature", you will open the secure digital signature pad.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={onDecline}
                    disabled={accepting}
                    className={`flex-1 py-3 rounded-xl border font-semibold text-sm transition-colors disabled:opacity-50 ${
                      darkMode ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-red-200 text-red-500 hover:bg-red-50'
                    }`}
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => setShowSignPad(true)}
                    disabled={accepting}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-zinc-950 font-semibold text-sm hover:from-amber-450 hover:to-yellow-500 transition-all shadow-lg shadow-amber-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    Proceed to e-Signature
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Contract Card ────────────────────────────────────────────────────────────
const ContractCard = ({ contract, onView }) => {
  const { darkMode } = useDarkMode();
  const isPending = contract.status === 'pending';
  const cardBg = darkMode ? 'bg-slate-800/60 border-slate-700/50 backdrop-blur-md' : 'bg-white/60 border-indigo-100 backdrop-blur-md';
  const text = darkMode ? 'text-white' : 'text-gray-900';
  const sub = darkMode ? 'text-slate-400' : 'text-gray-500';
  const subCardBg = darkMode ? 'bg-slate-700/40 border border-slate-650' : 'bg-indigo-50/40 border border-indigo-100/50';

  return (
    <div className={`relative rounded-2xl border shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group ${cardBg} ${isPending ? 'ring-2 ring-amber-400/50' : ''}`}>
      {/* Pending pulse indicator */}
      {isPending && (
        <div className="absolute top-4 right-4">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
          </span>
        </div>
      )}

      <div className="p-6">
        {/* Top row */}
        <div className="flex items-start gap-4 mb-5">
          <div className={`p-3 rounded-xl flex-shrink-0 ${isPending ? darkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600' : darkMode ? 'bg-blue-500/20 text-cyan-400' : 'bg-blue-100 text-blue-600'}`}>
            <Home className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold text-lg truncate ${text}`}>
              {contract.property?.title || 'Property Contract'}
            </h3>
            <p className={`text-sm mt-0.5 ${sub}`}>
              {contract.type?.charAt(0).toUpperCase() + contract.type?.slice(1) || 'Lease'} Agreement
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className={`p-3 rounded-xl ${subCardBg}`}>
            <div className="flex items-center gap-1.5 mb-1">
              <IndianRupee className={`w-3.5 h-3.5 ${sub}`} />
              <span className={`text-xs ${sub}`}>Monthly Rent</span>
            </div>
            <p className={`font-bold text-base ${text}`}>
              ₹{Number(contract.rentAmount || 0).toLocaleString('en-IN')}
            </p>
          </div>
          <div className={`p-3 rounded-xl ${subCardBg}`}>
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar className={`w-3.5 h-3.5 ${sub}`} />
              <span className={`text-xs ${sub}`}>Duration</span>
            </div>
            <p className={`font-bold text-base ${text}`}>
              {contract.duration || '—'} months
            </p>
          </div>
          <div className={`p-3 rounded-xl ${subCardBg}`}>
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar className={`w-3.5 h-3.5 ${sub}`} />
              <span className={`text-xs ${sub}`}>Start Date</span>
            </div>
            <p className={`font-semibold text-sm ${text}`}>
              {contract.startDate ? new Date(contract.startDate).toLocaleDateString('en-IN') : '—'}
            </p>
          </div>
          <div className={`p-3 rounded-xl ${subCardBg}`}>
            <div className="flex items-center gap-1.5 mb-1">
              <Shield className={`w-3.5 h-3.5 ${sub}`} />
              <span className={`text-xs ${sub}`}>Deposit</span>
            </div>
            <p className={`font-bold text-base ${text}`}>
              ₹{Number(contract.securityDeposit || 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Landlord */}
        {contract.landlord && (
          <div className={`flex items-center gap-2 mb-4 p-3 rounded-xl ${subCardBg}`}>
            <User className={`w-4 h-4 flex-shrink-0 ${sub}`} />
            <span className={`text-sm ${darkMode ? 'text-slate-350' : 'text-gray-700'}`}>
              From <strong>{contract.landlord.name || 'Landlord'}</strong>
            </span>
          </div>
        )}

        {/* Status & CTA */}
        <div className="flex items-center justify-between">
          <StatusBadge status={contract.status} />
          <button
            onClick={() => onView(contract)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              isPending
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25 hover:scale-105'
                : darkMode
                ? 'bg-slate-700/80 text-slate-200 hover:bg-slate-650 hover:text-white border border-slate-600/30'
                : 'bg-indigo-50 text-indigo-650 hover:bg-indigo-100 hover:scale-105'
            }`}
          >
            <Eye className="w-4 h-4" />
            {isPending ? 'Review & Sign' : 'View Details'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({ darkMode, t }) => (
  <div className="text-center py-20">
    <div className={`inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-6 ${darkMode ? 'bg-slate-800/80' : 'bg-indigo-50/50'}`}>
      <FileText className={`w-12 h-12 ${darkMode ? 'text-slate-500' : 'text-indigo-400'}`} />
    </div>
    <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t('pages.noContracts')}</h3>
    <p className={`text-sm max-w-xs mx-auto ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
      When a landlord sends you a lease contract, it will appear here for your review and signature.
    </p>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const TenantContracts = () => {
  const { darkMode } = useDarkMode();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { data: contracts = [], isLoading, refetch } = useQuery({
    queryKey: ['tenantContracts'],
    queryFn: async () => {
      const data = await api.getTenantContracts();
      return Array.isArray(data) ? data : [];
    }
  });

  const [selectedContract, setSelectedContract] = useState(null);
  const [accepting, setAccepting]           = useState(false);

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
        panelBg: 'bg-white/40',
      };

  // Accept a contract → redirect to payment with rent + deposit pre-filled
  const handleAccept = useCallback(async (contractId) => {
    try {
      setAccepting(true);
      const contract =
        contracts.find(c => String(c._id || c.id) === String(contractId)) ||
        selectedContract;

      await api.updateContractStatus(contractId, 'active');
      queryClient.invalidateQueries({ queryKey: ['tenantContracts'] });

      const propertyId =
        contract?.property?._id ||
        contract?.propertyId ||
        (typeof contract?.property === 'string' ? contract.property : null);
      const rentAmount = Number(contract?.rentAmount || 0);
      const securityDeposit = Number(contract?.securityDeposit || 0);

      setSelectedContract(null);
      showSuccessToast('🎉 Lease accepted! Complete your move-in payment.');

      navigate('/tenant/payment', {
        state: {
          leasePayment: {
            contractId,
            propertyId,
            propertyTitle: contract?.property?.title || 'Your apartment',
            landlordName: contract?.landlord?.name || 'Landlord',
            rentAmount,
            securityDeposit,
            totalAmount: rentAmount + securityDeposit,
          },
        },
      });
    } catch (err) {
      showErrorToast(err.message || 'Failed to accept contract. Please try again.');
    } finally {
      setAccepting(false);
    }
  }, [contracts, selectedContract, navigate]);

  // Decline a contract
  const handleDecline = useCallback(async () => {
    if (!selectedContract) return;
    const id = selectedContract._id || selectedContract.id;
    try {
      await api.updateContractStatus(id, 'cancelled');
      queryClient.invalidateQueries({ queryKey: ['tenantContracts'] });
      setSelectedContract(null);
      showSuccessToast('Contract declined.');
    } catch (err) {
      showErrorToast(err.message || 'Failed to decline contract.');
    }
  }, [selectedContract]);

  // Stats
  const pending   = contracts.filter(c => c.status === 'pending').length;
  const active    = contracts.filter(c => c.status === 'active').length;
  const completed = contracts.filter(c => c.status === 'completed').length;

  // Loading
  if (isLoading) {
    return (
      <div className={`flex min-h-screen bg-gradient-to-br ${tc.loadingBg}`}>
        <TenantSideBar />
        <div className="flex-1 flex flex-col relative z-10 transition-all duration-700" style={{ marginLeft: 'var(--sidebar-width, 4.5rem)' }}>
          <TenantNavBar currentSection="Contracts" />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className={`w-20 h-20 border-4 ${tc.spinnerBorder} rounded-full animate-spin`} />
              </div>
              <h2 className={`text-xl font-bold ${tc.textPrimary} mt-6 animate-pulse`}>Loading Contracts...</h2>
              <p className={`${tc.textSecondary} mt-2`}>Retrieving your lease documents</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen bg-gradient-to-br ${tc.mainBg} relative overflow-hidden`}>
      <TenantSideBar />
      <div className="flex-1 flex flex-col relative z-10 transition-all duration-700" style={{ marginLeft: 'var(--sidebar-width, 4.5rem)' }}>
        <TenantNavBar currentSection="Contracts" />

        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-8 max-w-7xl mx-auto">

            {/* Header */}
            <div className="text-center mb-2">
              <h1 className={`text-4xl font-extrabold mb-3 bg-gradient-to-r ${tc.headerGradient} bg-clip-text text-transparent`}>
                {t('pages.myContracts')}
              </h1>
              <p className={`text-lg ${tc.textSecondary} max-w-xl mx-auto`}>
                {t('pages.contractsSubtitle')}
              </p>
            </div>

            {/* Stats */}
            {contracts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { label: 'Awaiting Signature', value: pending,   icon: Clock,        color: 'from-amber-500 to-orange-500',  warn: pending > 0 },
                  { label: 'Active Leases',       value: active,    icon: CheckCircle,  color: 'from-green-500 to-emerald-500', warn: false },
                  { label: 'Completed',           value: completed, icon: FileText,     color: 'from-blue-500 to-indigo-500',   warn: false },
                ].map(({ label, value, icon: Icon, color, warn }) => (
                  <div key={label} className={`${tc.cardBg} backdrop-blur-xl border ${tc.cardBorder} rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:shadow-lg ${warn && value > 0 ? 'ring-2 ring-amber-400/50' : ''}`}>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${color} flex-shrink-0 shadow-md`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className={`text-3xl font-bold ${tc.textPrimary}`}>{value}</p>
                      <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{label}</p>
                    </div>
                    {warn && value > 0 && (
                      <span className="ml-auto text-xs bg-amber-500/20 text-amber-300 font-semibold px-2.5 py-1 rounded-full border border-amber-500/30 animate-pulse">Action needed</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Pending Alert Banner */}
            {pending > 0 && (
              <div className={`flex items-center gap-4 p-4 border rounded-2xl transition-all duration-300 ${
                darkMode ? 'bg-amber-500/10 border-amber-500/25' : 'bg-amber-50 border-amber-200'
              }`}>
                <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 animate-bounce" />
                <div className="flex-1">
                  <p className={`font-semibold ${darkMode ? 'text-amber-400' : 'text-amber-800'}`}>
                    You have {pending} contract{pending > 1 ? 's' : ''} waiting for your signature.
                  </p>
                  <p className={`text-sm mt-0.5 ${darkMode ? 'text-amber-500/80' : 'text-amber-700/80'}`}>
                    Click "Review & Sign" on the contract card below to proceed.
                  </p>
                </div>
              </div>
            )}

            {/* Contract Grid */}
            <div className={`${tc.cardBg} backdrop-blur-xl border ${tc.cardBorder} rounded-3xl p-6 shadow-xl`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${tc.textPrimary}`}>{t('pages.allContracts')}</h2>
                <button
                  onClick={() => refetch()}
                  className={`flex items-center gap-2 text-sm px-4 py-2 rounded-xl transition-all hover:scale-105 border ${
                    darkMode ? 'text-slate-350 hover:bg-slate-700/50 border-slate-700/50' : 'text-indigo-650 hover:bg-indigo-50 border-indigo-100'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>

              {contracts.length === 0 ? (
                <EmptyState darkMode={darkMode} t={t} />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {contracts.map(contract => (
                    <ContractCard
                      key={contract._id || contract.id}
                      contract={contract}
                      onView={setSelectedContract}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      {selectedContract && (
        <ContractModal
          contract={selectedContract}
          onClose={() => setSelectedContract(null)}
          onAccept={handleAccept}
          onDecline={handleDecline}
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

export default TenantContracts;
