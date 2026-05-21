import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDarkMode } from '../../../useDarkMode.js';
import TenantSideBar from './TenantSideBar';
import TenantNavBar from './TenantNavBar';
import api from '../../../services/api.js';
import { showErrorToast, showSuccessToast, showInfoToast } from '../../../utils/toast.jsx';
import { useLanguage } from '../../../i18n/LanguageContext.jsx';
import {
  WrenchScrewdriverIcon, PlusIcon, TrashIcon, PencilIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon, DocumentTextIcon, CalendarIcon, MagnifyingGlassIcon, ChartBarIcon, PaperClipIcon, XMarkIcon
} from '@heroicons/react/24/outline';

const DEFAULT_OBSERVER_OPTIONS = Object.freeze({ threshold: 0.1 });

const normalizeRequest = (req) => ({
  id: req._id || req.id,
  title: req.title || req.issueType || 'Maintenance Request',
  description: req.description || 'No description',
  priority: req.priority || 'Medium',
  status: req.status || 'Pending',
  date: req.createdAt || req.reportedDate || new Date().toISOString(),
  attachments: Array.isArray(req.attachments) ? req.attachments : []
});

const useIntersectionObserver = (options = DEFAULT_OBSERVER_OPTIONS) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [element, setElement] = useState(null);
  const { threshold = 0.1, root = null, rootMargin = '0px' } = options || DEFAULT_OBSERVER_OPTIONS;

  useEffect(() => {
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, { threshold, root, rootMargin });

    observer.observe(element);
    return () => observer.disconnect();
  }, [element, threshold, root, rootMargin]);

  return [setElement, isIntersecting];
};

const AnimatedCounter = ({ value, duration = 2000, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const startValue = 0;
    const endValue = parseInt(value, 10) || 0;
    const increment = endValue / (duration / 16);
    let currentValue = startValue;

    const timer = setInterval(() => {
      currentValue += increment;
      if (currentValue >= endValue) {
        setCount(endValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(currentValue));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{prefix}{count}{suffix}</span>;
};

const FloatingCard = ({ children, delay = 0, className = '' }) => (
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

const GlowingButton = ({ children, onClick, className = '', glowColor = 'blue', disabled = false, type = 'button' }) => {
  const glowClasses = glowColor === 'blue'
    ? 'bg-gradient-to-r from-blue-500 to-purple-600'
    : glowColor === 'red'
      ? 'bg-gradient-to-r from-red-500 to-pink-600'
      : glowColor === 'green'
        ? 'bg-gradient-to-r from-green-500 to-emerald-600'
        : glowColor === 'orange'
          ? 'bg-gradient-to-r from-orange-500 to-yellow-600'
          : 'bg-gradient-to-r from-blue-500 to-purple-600';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`group relative overflow-hidden transform transition-all duration-300 hover:scale-105 disabled:hover:scale-100 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <div className={`absolute inset-0 rounded-lg blur opacity-0 group-hover:opacity-75 transition-opacity duration-300 ${glowClasses}`}></div>
      <div className="relative z-10">
        {children}
      </div>
    </button>
  );
};

const RequestCard = React.memo(({ request, onEdit, onDelete, isEditing, editData, onSaveEdit, onCancelEdit, onEditDataChange, index }) => {
  const [setRef, isVisible] = useIntersectionObserver(DEFAULT_OBSERVER_OPTIONS);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'In Progress': return <ClockIcon className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'Pending': return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 animate-pulse" />;
      default: return <DocumentTextIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Completed: 'from-green-500 to-emerald-600 text-white',
      'In Progress': 'from-blue-500 to-indigo-600 text-white',
      Pending: 'from-yellow-500 to-orange-600 text-white',
      default: 'from-gray-500 to-gray-600 text-white'
    };
    return colors[status] || colors.default;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      High: 'from-red-500 to-pink-600 text-white',
      Medium: 'from-orange-500 to-yellow-600 text-white',
      Low: 'from-green-500 to-emerald-600 text-white',
      default: 'from-gray-500 to-gray-600 text-white'
    };
    return colors[priority] || colors.default;
  };

  return (
    <div
      ref={setRef}
      className={`transform transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <FloatingCard delay={index * 200}>
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group hover:scale-105 border border-gray-100">
          {isEditing ? (
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={editData.title}
                    onChange={e => onEditDataChange({ ...editData, title: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={editData.description}
                    onChange={e => onEditDataChange({ ...editData, description: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 h-24 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={editData.priority}
                    onChange={e => onEditDataChange({ ...editData, priority: e.target.value })}
                    className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <GlowingButton
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl"
                  onClick={() => onSaveEdit(request.id)}
                  glowColor="blue"
                >
                  <CheckCircleIcon className="h-5 w-5 mr-2 inline" />
                  Save Changes
                </GlowingButton>
                <button
                  className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-all duration-300"
                  onClick={onCancelEdit}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(request.status)}
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${getPriorityColor(request.priority)}`}>
                  {request.priority}
                </span>
              </div>

              <div className="mb-4">
                <h3 className="font-bold text-xl text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                  {request.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{request.description}</p>
              </div>

              {request.attachments?.length > 0 && (
                <div className="mb-4 rounded-xl bg-gray-50 p-3">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Attachments</p>
                  <div className="flex flex-wrap gap-2">
                    {request.attachments.map((attachment, idx) => {
                      const label = attachment?.originalName || attachment?.name || `Attachment ${idx + 1}`;
                      const url = attachment?.url || attachment?.path || attachment?.secure_url;
                      return url ? (
                        <a
                          key={`${label}-${idx}`}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm text-blue-600 shadow-sm hover:text-blue-800"
                        >
                          <PaperClipIcon className="h-4 w-4" />
                          {label}
                        </a>
                      ) : (
                        <span key={`${label}-${idx}`} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm text-gray-600 shadow-sm">
                          <PaperClipIcon className="h-4 w-4" />
                          {label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-1000 ${request.status === 'Completed'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 w-full'
                      : request.status === 'In Progress'
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 w-2/3'
                        : 'bg-gradient-to-r from-yellow-500 to-orange-600 w-1/3'
                      }`}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {request.status === 'Completed' ? '100% Complete' :
                    request.status === 'In Progress' ? '67% Complete' :
                      '33% Complete'}
                </p>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center text-gray-500 text-sm">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  <span>Submitted: {new Date(request.date).toLocaleDateString()}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-full transition-all duration-200 hover:scale-110"
                    onClick={() => onEdit(request)}
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-full transition-all duration-200 hover:scale-110"
                    onClick={() => onDelete(request.id)}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </FloatingCard>
    </div>
  );
});

const TenantMaintenance = () => {
  const { darkMode } = useDarkMode();
  const { t } = useLanguage();
  const [requests, setRequests] = useState([]);
  const [newRequest, setNewRequest] = useState({ title: '', description: '', priority: 'Medium', attachments: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRequestId, setEditingRequestId] = useState(null);
  const [editRequestData, setEditRequestData] = useState({ title: '', description: '', priority: 'Medium' });

  const tc = darkMode
    ? {
        mainBg: 'from-gray-900 via-slate-800 to-blue-950',
        loadingBg: 'from-gray-900 via-slate-800 to-blue-950',
        cardBg: 'bg-slate-800/50', cardBorder: 'border-slate-700/50',
        textPrimary: 'text-slate-100', textSecondary: 'text-slate-200',
        headerGradient: 'from-cyan-300 via-purple-300 to-pink-300',
        tabBg: 'bg-slate-800/50', tabBorder: 'border-slate-700/50',
        tabActive: 'from-cyan-500 to-indigo-600', tabActiveText: 'text-blue-950',
        tabInactive: 'text-slate-300 hover:text-slate-100 hover:bg-slate-700/50',
        buttonPrimary: 'from-cyan-500 to-indigo-600',
        buttonSecondary: 'from-purple-500 to-pink-600',
        iconTrend: 'text-cyan-400',
        spinnerBorder: 'border-cyan-500/30 border-t-cyan-400',
      }
    : {
        mainBg: 'from-pink-300 via-purple-300 to-indigo-400',
        loadingBg: 'from-pink-300 via-purple-300 to-indigo-400',
        cardBg: 'bg-white/60', cardBorder: 'border-indigo-200/50',
        textPrimary: 'text-gray-900', textSecondary: 'text-indigo-600',
        headerGradient: 'from-indigo-700 via-purple-700 to-pink-700',
        tabBg: 'bg-white/30', tabBorder: 'border-indigo-200/50',
        tabActive: 'from-indigo-600 to-purple-600', tabActiveText: 'text-white',
        tabInactive: 'text-indigo-600 hover:text-indigo-800 hover:bg-white/40',
        buttonPrimary: 'from-indigo-600 to-purple-600',
        buttonSecondary: 'from-purple-600 to-pink-600',
        iconTrend: 'text-indigo-600',
        spinnerBorder: 'border-indigo-400/40 border-t-indigo-600',
      };

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        const profile = await api.getProfile();
        const res = await api.getTenantMaintenanceRequests(profile.id);
        if (Array.isArray(res)) {
          setRequests(res.map(normalizeRequest));
        }
      } catch (error) {
        console.error('Error fetching maintenance requests:', error);
        showErrorToast('Failed to load maintenance requests');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const stats = useMemo(() => {
    return requests.reduce((acc, req) => {
      acc.total++;
      if (req.status === 'Pending') acc.pending++;
      else if (req.status === 'In Progress') acc.inProgress++;
      else if (req.status === 'Completed') acc.completed++;
      return acc;
    }, { total: 0, pending: 0, inProgress: 0, completed: 0 });
  }, [requests]);

  const handleAttachmentChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    setNewRequest(prev => ({ ...prev, attachments: [...prev.attachments, ...files] }));
  }, []);

  const removeAttachment = useCallback((index) => {
    setNewRequest(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== index) }));
  }, []);

  const submitNewRequest = useCallback(async () => {
    if (!newRequest.title || !newRequest.description) {
      showInfoToast('Please fill in all required fields');
      return;
    }
    try {
      setIsSubmitting(true);
      const profile = await api.getProfile();
      const uploadedAttachments = await Promise.all(newRequest.attachments.map(file => new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ id: Date.now().toString() + Math.random(), name: file.name, url: reader.result });
        reader.readAsDataURL(file);
      })));
      const requestData = { ...newRequest, reportedBy: profile.id, status: 'Pending', attachments: uploadedAttachments };
      const created = await api.createMaintenanceRequest(requestData);
      setRequests(prev => [normalizeRequest(created?.data || created), ...prev]);
      setNewRequest({ title: '', description: '', priority: 'Medium', attachments: [] });
      setShowNewRequestForm(false);
      showSuccessToast('Request submitted successfully');
    } catch (e) {
      showErrorToast('Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  }, [newRequest]);

  const handleEditRequest = useCallback((request) => {
    setEditingRequestId(request.id);
    setEditRequestData({ title: request.title, description: request.description, priority: request.priority });
  }, []);

  const saveEditRequest = useCallback(async (id) => {
    try {
      await api.updateMaintenanceRequest(id, editRequestData);
      setRequests(prev => prev.map(req => req.id === id ? { ...req, ...editRequestData } : req));
      setEditingRequestId(null);
      showSuccessToast('Request updated');
    } catch (e) {
      showErrorToast('Failed to update');
    }
  }, [editRequestData]);

  const deleteRequest = useCallback(async (id) => {
    try {
      await api.deleteMaintenanceRequest(id);
      setRequests(prev => prev.filter(req => req.id !== id));
      showSuccessToast('Request deleted');
    } catch (e) {
      showErrorToast('Failed to delete');
    }
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || req.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [requests, searchTerm, statusFilter, priorityFilter]);

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${tc.loadingBg} flex relative`}>
        <TenantSideBar />
        <div className="flex-1 flex flex-col relative z-10 transition-all duration-700" style={{ marginLeft: 'var(--sidebar-width, 4.5rem)' }}>
          <TenantNavBar currentSection="Maintenance" />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="relative mx-auto w-20 h-20">
                <div className={`w-20 h-20 border-4 ${tc.spinnerBorder} rounded-full animate-spin`}></div>
              </div>
              <h2 className={`text-xl font-bold ${tc.textPrimary} mt-6 animate-pulse`}>{t('pages.loadingMaintenance')}</h2>
              <p className={`${tc.textSecondary} mt-2`}>Preparing your requests</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${tc.mainBg} flex relative`}>
      <TenantSideBar />
      <div className="flex-1 flex flex-col relative z-10 transition-all duration-700" style={{ marginLeft: 'var(--sidebar-width, 4.5rem)' }}>
        <TenantNavBar currentSection="Maintenance" />
        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <div className="mb-12">
            <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-white/20 rounded-2xl mr-4">
                  <WrenchScrewdriverIcon className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2 animate-slideDown">{t('pages.maintenanceRequests')}</h1>
                  <p className="text-orange-100 text-lg animate-slideUp">Track and manage all your maintenance needs</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatsCard title="Total Requests" value={stats.total} icon={<DocumentTextIcon className={`h-6 w-6 ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`} />} delay={0} />
            <StatsCard title="Pending" value={stats.pending} icon={<ClockIcon className={`h-6 w-6 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />} delay={100} />
            <StatsCard title="In Progress" value={stats.inProgress} icon={<WrenchScrewdriverIcon className={`h-6 w-6 ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`} />} delay={200} />
            <StatsCard title="Completed" value={stats.completed} icon={<CheckCircleIcon className={`h-6 w-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />} delay={300} />
          </div>

          <div className={`${tc.cardBg} backdrop-blur-xl border ${tc.cardBorder} p-6 rounded-3xl shadow-xl mb-8 animate-slideUp`}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full border rounded-xl px-6 py-4 pl-12 focus:outline-none focus:ring-4 transition-all duration-300 text-lg ${darkMode ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 focus:ring-cyan-500/20 focus:border-cyan-500' : 'bg-white border-gray-200 text-gray-800 placeholder-gray-500 focus:ring-blue-500/20 focus:border-blue-500'}`}
                />
                <MagnifyingGlassIcon className={`h-6 w-6 absolute left-4 top-5 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`} />
              </div>

              <div className="flex flex-wrap gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ colorScheme: darkMode ? 'dark' : 'light' }}
                  className={`border rounded-xl px-4 py-3 focus:outline-none focus:ring-4 transition-all duration-300 ${darkMode ? 'bg-slate-700/50 border-slate-600/50 text-white focus:ring-cyan-500/20 focus:border-cyan-500' : 'bg-white border-gray-200 text-gray-800 focus:ring-blue-500/20 focus:border-blue-500'}`}
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  style={{ colorScheme: darkMode ? 'dark' : 'light' }}
                  className={`border rounded-xl px-4 py-3 focus:outline-none focus:ring-4 transition-all duration-300 ${darkMode ? 'bg-slate-700/50 border-slate-600/50 text-white focus:ring-cyan-500/20 focus:border-cyan-500' : 'bg-white border-gray-200 text-gray-800 focus:ring-blue-500/20 focus:border-blue-500'}`}
                >
                  <option value="All">All Priority</option>
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>

                <GlowingButton
                  onClick={() => setShowNewRequestForm(!showNewRequestForm)}
                  className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl"
                  glowColor="orange"
                >
                  <PlusIcon className="h-6 w-6 mr-2 inline" />
                  New Request
                </GlowingButton>
              </div>
            </div>
          </div>

          {showNewRequestForm && (
            <div className="mb-8 animate-slideUp">
              <div className={`${tc.cardBg} backdrop-blur-xl border ${tc.cardBorder} rounded-3xl shadow-2xl p-8`}>
                <h2 className={`text-2xl font-bold mb-6 bg-gradient-to-r ${tc.headerGradient} bg-clip-text text-transparent flex items-center`}>
                  <DocumentTextIcon className="h-8 w-8 mr-3 text-orange-600" />
                  Submit New Request
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <label className={`block text-sm font-semibold ${tc.textSecondary} mb-3`}>Request Title</label>
                      <input
                        type="text"
                        value={newRequest.title}
                        onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
                        className={`w-full border rounded-xl px-4 py-4 focus:outline-none focus:ring-4 transition-all duration-300 ${darkMode ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 focus:ring-cyan-500/20 focus:border-cyan-500' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-blue-500/20 focus:border-blue-500'}`}
                        placeholder="Brief description of the issue"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-semibold ${tc.textSecondary} mb-3`}>Priority Level</label>
                      <select
                        value={newRequest.priority}
                        onChange={(e) => setNewRequest(prev => ({ ...prev, priority: e.target.value }))}
                        className={`w-full border rounded-xl px-4 py-4 focus:outline-none focus:ring-4 transition-all duration-300 ${darkMode ? 'bg-slate-700/50 border-slate-600/50 text-white focus:ring-cyan-500/20 focus:border-cyan-500' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-blue-500/20 focus:border-blue-500'}`}
                      >
                        <option value="Low">Low Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="High">High Priority</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-semibold ${tc.textSecondary} mb-3`}>Attachments</label>
                      <label className={`flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition-all duration-300 ${darkMode ? 'border-slate-600 bg-slate-700/40 text-slate-200 hover:border-cyan-500' : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-orange-500'}`}>
                        <input
                          type="file"
                          multiple
                          className="hidden"
                          onChange={handleAttachmentChange}
                        />
                        <span className="inline-flex items-center gap-2">
                          <PaperClipIcon className="h-5 w-5" />
                          Add photos or files
                        </span>
                      </label>
                      {newRequest.attachments.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {newRequest.attachments.map((file, index) => (
                            <div key={`${file.name}-${index}`} className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm ${darkMode ? 'bg-slate-900 text-slate-200' : 'bg-white text-gray-700 shadow-sm'}`}>
                              <PaperClipIcon className="h-4 w-4" />
                              <span className="max-w-[180px] truncate">{file.name}</span>
                              <button type="button" onClick={() => removeAttachment(index)} className="text-red-500 hover:text-red-700">
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold ${tc.textSecondary} mb-3`}>Detailed Description</label>
                    <textarea
                      value={newRequest.description}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                      className={`w-full h-48 border rounded-xl px-4 py-4 focus:outline-none focus:ring-4 transition-all duration-300 ${darkMode ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 focus:ring-cyan-500/20 focus:border-cyan-500' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-blue-500/20 focus:border-blue-500'}`}
                      placeholder="Provide detailed description of the issue..."
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4 mt-8">
                  <button
                    onClick={() => setShowNewRequestForm(false)}
                    className={`px-6 py-3 rounded-xl transition-all duration-300 ${darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    Cancel
                  </button>
                  <GlowingButton
                    onClick={submitNewRequest}
                    className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-3 rounded-xl"
                    glowColor="orange"
                    disabled={isSubmitting}
                  >
                    <PlusIcon className="h-5 w-5 mr-2 inline" />
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </GlowingButton>
                </div>
              </div>
            </div>
          )}

          <div className={`${tc.cardBg} backdrop-blur-xl border ${tc.cardBorder} rounded-3xl shadow-2xl p-8 animate-slideUp`}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mr-4">
                  <ChartBarIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className={`text-2xl font-bold bg-gradient-to-r ${tc.headerGradient} bg-clip-text text-transparent`}>{t('pages.yourRequests')}</h2>
                  <p className={`${tc.textSecondary}`}>Track and manage your maintenance requests</p>
                </div>
              </div>
              <div className={`text-sm ${tc.textSecondary}`}>
                {filteredRequests.length} of {requests.length} requests
              </div>
            </div>

            {filteredRequests.length === 0 ? (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <WrenchScrewdriverIcon className={`h-24 w-24 ${darkMode ? 'text-slate-600' : 'text-gray-400'} mx-auto mb-6 animate-bounce`} />
                  <h3 className={`text-2xl font-bold mb-4 ${tc.textPrimary}`}>
                    {requests.length === 0 ? 'No maintenance requests found' : 'No requests match your filters'}
                  </h3>
                  <p className={`${tc.textSecondary} text-lg mb-8`}>
                    {requests.length === 0 ? 'Submit your first maintenance request to get started' : 'Try adjusting your search criteria or filters'}
                  </p>
                  {requests.length === 0 && (
                    <GlowingButton
                      onClick={() => setShowNewRequestForm(true)}
                      className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-xl"
                      glowColor="orange"
                    >
                      <PlusIcon className="h-6 w-6 mr-2 inline" />
                      Create First Request
                    </GlowingButton>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {filteredRequests.map((request, index) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    onEdit={handleEditRequest}
                    onDelete={deleteRequest}
                    isEditing={editingRequestId === request.id}
                    editData={editRequestData}
                    onSaveEdit={saveEditRequest}
                    onCancelEdit={() => setEditingRequestId(null)}
                    onEditDataChange={setEditRequestData}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TenantMaintenance;
