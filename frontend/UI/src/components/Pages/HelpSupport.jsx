import React, { useState, useEffect, useCallback } from 'react';
import { useDarkMode } from '../../useDarkMode.js';
import TenantSideBar from './TENANT/TenantSideBar';
import TenantNavBar from './TENANT/TenantNavBar';
import LandlordSideBar from './LANDLORD/LandlordSideBar';
import LandlordNavBar from './LANDLORD/LandlordNavBar';
import api from '../../services/api.js';
import { showSuccessToast, showErrorToast } from '../../utils/toast.jsx';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
import {
  LifeBuoy, Plus, Send, MessageCircle, Clock, CheckCircle2,
  XCircle, ChevronRight, ArrowLeft, RefreshCw
} from 'lucide-react';

const CATEGORIES = [
  { value: 'general', labelKey: 'help.categoryGeneral' },
  { value: 'account', labelKey: 'help.categoryAccount' },
  { value: 'payment', labelKey: 'help.categoryPayment' },
  { value: 'technical', labelKey: 'help.categoryTechnical' },
  { value: 'other', labelKey: 'help.categoryOther' },
];

const STATUS_CFG = {
  open:        { labelKey: 'help.statusOpen',        color: 'bg-amber-100 text-amber-800 border-amber-200',  icon: Clock },
  in_progress: { labelKey: 'help.statusInProgress',  color: 'bg-blue-100 text-blue-800 border-blue-200',     icon: MessageCircle },
  resolved:    { labelKey: 'help.statusResolved',    color: 'bg-green-100 text-green-800 border-green-200',  icon: CheckCircle2 },
  closed:      { labelKey: 'help.statusClosed',      color: 'bg-gray-100 text-gray-600 border-gray-200',     icon: XCircle },
};

const StatusBadge = ({ status, t }) => {
  const cfg = STATUS_CFG[status] || STATUS_CFG.open;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {t(cfg.labelKey)}
    </span>
  );
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function HelpSupport({ portal = 'tenant' }) {
  const { darkMode } = useDarkMode();
  const { t } = useLanguage();
  const isTenant = portal === 'tenant';

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [form, setForm] = useState({ subject: '', message: '', category: 'general' });

  const bgClass = darkMode ? 'bg-slate-950 text-slate-100' : 'bg-gray-50 text-gray-900';
  const cardBg = darkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white/80 border-white/50';
  const inputCls = darkMode
    ? 'w-full px-4 py-3 rounded-xl border border-slate-600 bg-slate-900/60 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none'
    : 'w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none';

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getMySupportRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch {
      showErrorToast(t('help.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const fetchDetail = useCallback(async (id) => {
    try {
      const data = await api.getSupportRequest(id);
      setDetail(data);
    } catch {
      showErrorToast(t('help.loadError'));
    }
  }, [t]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  useEffect(() => {
    if (selected) fetchDetail(selected);
    else setDetail(null);
  }, [selected, fetchDetail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      showErrorToast(t('help.fillRequired'));
      return;
    }
    setSubmitting(true);
    try {
      const created = await api.createSupportRequest(form);
      showSuccessToast(t('help.submitSuccess'));
      setForm({ subject: '', message: '', category: 'general' });
      setShowForm(false);
      await fetchRequests();
      setSelected(created._id);
    } catch {
      showErrorToast(t('help.submitError'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selected) return;
    setSubmitting(true);
    try {
      const updated = await api.replyToSupportRequest(selected, replyText.trim());
      setDetail(updated);
      setReplyText('');
      showSuccessToast(t('help.replySent'));
      await fetchRequests();
    } catch (err) {
      showErrorToast(err.message || t('help.submitError'));
    } finally {
      setSubmitting(false);
    }
  };

  const SideBar = isTenant ? TenantSideBar : LandlordSideBar;
  const NavBar = isTenant ? TenantNavBar : LandlordNavBar;
  const sectionLabel = t('help.title');

  const thread = detail
    ? [
        { role: detail.userRole, senderName: detail.userName || 'You', content: detail.message, createdAt: detail.createdAt, isInitial: true },
        ...(detail.replies || []),
      ]
    : [];

  return (
    <div className={`flex h-screen ${bgClass}`}>
      <SideBar />
      <div className="flex flex-col flex-1" style={{ marginLeft: 'var(--sidebar-width, 4.5rem)' }}>
        <NavBar currentSection={sectionLabel} />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600">
                  <LifeBuoy className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t('help.title')}</h1>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{t('help.subtitle')}</p>
                </div>
              </div>
              {!showForm && !selected && (
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  {t('help.newRequest')}
                </button>
              )}
            </div>

            {/* New request form */}
            {showForm && (
              <div className={`${cardBg} backdrop-blur-sm border rounded-2xl p-6`}>
                <h2 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t('help.newRequest')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>{t('help.subject')}</label>
                    <input
                      className={inputCls}
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder={t('help.subjectPlaceholder')}
                      maxLength={120}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>{t('help.category')}</label>
                    <select
                      className={inputCls}
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>{t(c.labelKey)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>{t('help.message')}</label>
                    <textarea
                      className={`${inputCls} min-h-[120px] resize-y`}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder={t('help.messagePlaceholder')}
                      maxLength={2000}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      {submitting ? t('common.loading') : t('help.send')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className={`px-5 py-2.5 rounded-xl font-medium ${darkMode ? 'bg-slate-700 text-slate-200' : 'bg-gray-100 text-gray-700'}`}
                    >
                      {t('common.cancel')}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Detail view */}
            {selected && detail && (
              <div className={`${cardBg} backdrop-blur-sm border rounded-2xl overflow-hidden`}>
                <div className={`p-5 border-b ${darkMode ? 'border-slate-700' : 'border-gray-200'} flex items-start justify-between gap-4`}>
                  <div>
                    <button
                      onClick={() => setSelected(null)}
                      className={`flex items-center gap-1 text-sm mb-2 ${darkMode ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      {t('help.backToList')}
                    </button>
                    <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{detail.subject}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={detail.status} t={t} />
                      <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>{formatDate(detail.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4 max-h-96 overflow-y-auto">
                  {thread.map((msg, i) => {
                    const isAdmin = msg.role === 'admin';
                    return (
                      <div key={i} className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          isAdmin
                            ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-900 dark:text-indigo-100'
                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100'
                        }`}>
                          <p className="text-xs font-semibold mb-1 opacity-70">
                            {isAdmin ? t('help.adminReply') : (msg.senderName || t('help.you'))}
                          </p>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <p className="text-xs opacity-50 mt-1">{formatDate(msg.createdAt)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {detail.status !== 'closed' && (
                  <div className={`p-4 border-t ${darkMode ? 'border-slate-700' : 'border-gray-200'} flex gap-2`}>
                    <input
                      className={`flex-1 ${inputCls}`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={t('help.replyPlaceholder')}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleReply())}
                    />
                    <button
                      onClick={handleReply}
                      disabled={submitting || !replyText.trim()}
                      className="p-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl disabled:opacity-50"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Request list */}
            {!selected && (
              <div className={`${cardBg} backdrop-blur-sm border rounded-2xl`}>
                <div className={`p-5 border-b ${darkMode ? 'border-slate-700' : 'border-gray-200'} flex items-center justify-between`}>
                  <h2 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t('help.myRequests')}</h2>
                  <button
                    onClick={fetchRequests}
                    className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center py-16">
                    <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                  </div>
                ) : requests.length === 0 ? (
                  <div className="text-center py-16 px-6">
                    <LifeBuoy className={`w-12 h-12 mx-auto mb-3 ${darkMode ? 'text-slate-600' : 'text-gray-300'}`} />
                    <p className={`font-medium ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{t('help.noRequests')}</p>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>{t('help.noRequestsHint')}</p>
                  </div>
                ) : (
                  <ul className={`divide-y ${darkMode ? 'divide-slate-700' : 'divide-gray-100'}`}>
                    {requests.map((req) => (
                      <li key={req._id}>
                        <button
                          onClick={() => setSelected(req._id)}
                          className={`w-full flex items-center gap-4 p-5 text-left transition-colors ${darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'}`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{req.subject}</p>
                            <p className={`text-sm truncate mt-0.5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{req.message}</p>
                            <p className={`text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>{formatDate(req.createdAt)}</p>
                          </div>
                          <StatusBadge status={req.status} t={t} />
                          <ChevronRight className={`w-5 h-5 shrink-0 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
