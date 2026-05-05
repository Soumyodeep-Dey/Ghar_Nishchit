import React, { useState, useEffect, useCallback } from 'react';
import { useDarkMode } from '../../../useDarkMode.js';
import TenantSideBar from './TenantSideBar';
import TenantNavBar from './TenantNavBar';
import api from '../../../services/api.js';
import { showSuccessToast, showErrorToast } from '../../../utils/toast.jsx';
import {
  FileText, CheckCircle, Clock, XCircle, Home, Calendar,
  IndianRupee, Shield, User, AlertTriangle, RefreshCw, Eye, X
} from 'lucide-react';

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = {
    pending:   { label: 'Awaiting Your Signature', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
    active:    { label: 'Active Lease',             color: 'bg-green-100  text-green-800  border-green-200',  icon: CheckCircle },
    completed: { label: 'Completed',                color: 'bg-blue-100   text-blue-800   border-blue-200',   icon: CheckCircle },
    cancelled: { label: 'Cancelled',                color: 'bg-red-100    text-red-800    border-red-200',    icon: XCircle },
  }[status?.toLowerCase()] || { label: status, color: 'bg-gray-100 text-gray-700 border-gray-200', icon: FileText };

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
  const bg = darkMode ? 'bg-slate-900' : 'bg-white';
  const text = darkMode ? 'text-slate-100' : 'text-gray-900';
  const sub = darkMode ? 'text-slate-400' : 'text-gray-500';
  const border = darkMode ? 'border-slate-700' : 'border-gray-200';
  const rowBg = darkMode ? 'bg-slate-800' : 'bg-gray-50';

  const Row = ({ label, value }) => (
    <div className={`flex justify-between items-center py-3 px-4 rounded-xl ${rowBg}`}>
      <span className={`text-sm font-medium ${sub}`}>{label}</span>
      <span className={`text-sm font-semibold ${text}`}>{value}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className={`${bg} rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`sticky top-0 ${bg} p-6 border-b ${border} rounded-t-3xl flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${text}`}>Lease Contract</h2>
              <p className={`text-sm ${sub}`}>{contract.property?.title || 'Property Contract'}</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors ${sub}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Status banner for pending */}
          {isPending && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Action Required</p>
                <p className="text-sm text-amber-700 mt-0.5">
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
                className="flex-1 py-3 rounded-xl border border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50 transition-colors disabled:opacity-50"
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

// ─── Contract Card ────────────────────────────────────────────────────────────
const ContractCard = ({ contract, onView }) => {
  const { darkMode } = useDarkMode();
  const isPending = contract.status === 'pending';
  const cardBg = darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100';

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
          <div className={`p-3 rounded-xl flex-shrink-0 ${isPending ? 'bg-amber-100' : 'bg-blue-100'}`}>
            <Home className={`w-6 h-6 ${isPending ? 'text-amber-600' : 'text-blue-600'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold text-lg truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {contract.property?.title || 'Property Contract'}
            </h3>
            <p className={`text-sm mt-0.5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              {contract.type?.charAt(0).toUpperCase() + contract.type?.slice(1) || 'Lease'} Agreement
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className={`p-3 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-1.5 mb-1">
              <IndianRupee className={`w-3.5 h-3.5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`} />
              <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Monthly Rent</span>
            </div>
            <p className={`font-bold text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              ₹{Number(contract.rentAmount || 0).toLocaleString('en-IN')}
            </p>
          </div>
          <div className={`p-3 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar className={`w-3.5 h-3.5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`} />
              <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Duration</span>
            </div>
            <p className={`font-bold text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {contract.duration || '—'} months
            </p>
          </div>
          <div className={`p-3 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar className={`w-3.5 h-3.5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`} />
              <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Start Date</span>
            </div>
            <p className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {contract.startDate ? new Date(contract.startDate).toLocaleDateString('en-IN') : '—'}
            </p>
          </div>
          <div className={`p-3 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-1.5 mb-1">
              <Shield className={`w-3.5 h-3.5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`} />
              <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Deposit</span>
            </div>
            <p className={`font-bold text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              ₹{Number(contract.securityDeposit || 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Landlord */}
        {contract.landlord && (
          <div className={`flex items-center gap-2 mb-4 p-3 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
            <User className={`w-4 h-4 flex-shrink-0 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`} />
            <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
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
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25'
                : darkMode
                ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
const EmptyState = ({ darkMode }) => (
  <div className="text-center py-20">
    <div className={`inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-6 ${darkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
      <FileText className={`w-12 h-12 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`} />
    </div>
    <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No Contracts Yet</h3>
    <p className={`text-sm max-w-xs mx-auto ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
      When a landlord sends you a lease contract, it will appear here for your review and signature.
    </p>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const TenantContracts = () => {
  const { darkMode } = useDarkMode();

  const [contracts, setContracts]           = useState([]);
  const [isLoading, setIsLoading]           = useState(true);
  const [selectedContract, setSelectedContract] = useState(null);
  const [accepting, setAccepting]           = useState(false);

  const bgClass = darkMode
    ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-blue-950'
    : 'bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400';

  // Fetch contracts from API
  const fetchContracts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.getTenantContracts();
      setContracts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch contracts:', err);
      showErrorToast('Could not load your contracts. Please try again.');
      setContracts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchContracts(); }, [fetchContracts]);

  // Accept a contract
  const handleAccept = useCallback(async (contractId) => {
    try {
      setAccepting(true);
      await api.updateContractStatus(contractId, 'active');

      // Refetch to clear deleted duplicate contracts
      await fetchContracts();

      showSuccessToast('🎉 Lease accepted! You are now an active tenant.');
    } catch (err) {
      showErrorToast(err.message || 'Failed to accept contract. Please try again.');
    } finally {
      setAccepting(false);
    }
  }, []);

  // Decline a contract
  const handleDecline = useCallback(async () => {
    if (!selectedContract) return;
    const id = selectedContract._id || selectedContract.id;
    try {
      await api.updateContractStatus(id, 'cancelled');
      setContracts(prev =>
        prev.map(c => (c._id === id || c.id === id) ? { ...c, status: 'cancelled' } : c)
      );
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
      <div className={`flex h-screen ${bgClass}`}>
        <TenantSideBar />
        <div className="flex flex-col flex-1" style={{ marginLeft: 'var(--sidebar-width, 4.5rem)' }}>
          <TenantNavBar currentSection="Contracts" />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="w-20 h-20 border-4 border-indigo-200 rounded-full animate-spin" />
                <div className="absolute inset-0 w-20 h-20 border-4 border-t-indigo-600 rounded-full animate-spin" />
              </div>
              <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Loading Contracts…</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const cardBg = darkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white/80 border-white/50';

  return (
    <div className={`flex h-screen ${bgClass}`}>
      <TenantSideBar />
      <div className="flex flex-col flex-1" style={{ marginLeft: 'var(--sidebar-width, 4.5rem)' }}>
        <TenantNavBar currentSection="Contracts" />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">

            {/* Header */}
            <div className="text-center mb-2">
              <h1 className={`text-4xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                My Contracts
              </h1>
              <p className={`text-lg ${darkMode ? 'text-slate-300' : 'text-gray-600'} max-w-xl mx-auto`}>
                Review, sign, and track all your lease agreements in one place.
              </p>
            </div>

            {/* Stats */}
            {contracts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Awaiting Signature', value: pending,   icon: Clock,        color: 'from-amber-500 to-orange-500',  warn: pending > 0 },
                  { label: 'Active Leases',       value: active,    icon: CheckCircle,  color: 'from-green-500 to-emerald-500', warn: false },
                  { label: 'Completed',           value: completed, icon: FileText,     color: 'from-blue-500 to-indigo-500',   warn: false },
                ].map(({ label, value, icon: Icon, color, warn }) => (
                  <div key={label} className={`${cardBg} backdrop-blur-sm border rounded-2xl p-5 flex items-center gap-4 ${warn && value > 0 ? 'ring-2 ring-amber-400/50' : ''}`}>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${color} flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
                      <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>{label}</p>
                    </div>
                    {warn && value > 0 && (
                      <span className="ml-auto text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-1 rounded-full">Action needed</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Pending Alert Banner */}
            {pending > 0 && (
              <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-amber-800">
                    You have {pending} contract{pending > 1 ? 's' : ''} waiting for your signature.
                  </p>
                  <p className="text-sm text-amber-700 mt-0.5">
                    Click "Review & Sign" on the contract card below to proceed.
                  </p>
                </div>
              </div>
            )}

            {/* Contract Grid */}
            <div className={`${cardBg} backdrop-blur-sm border rounded-3xl p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>All Contracts</h2>
                <button
                  onClick={fetchContracts}
                  className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors ${darkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>

              {contracts.length === 0 ? (
                <EmptyState darkMode={darkMode} />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
    </div>
  );
};

export default TenantContracts;
