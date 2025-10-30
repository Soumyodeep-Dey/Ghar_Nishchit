import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDarkMode } from '../../../useDarkMode.js';
import TenantSideBar from './TenantSideBar';
import TenantNavBar from './TenantNavBar';
import api from '../../../services/api.js';
import { showErrorToast, showSuccessToast, showInfoToast } from '../../../utils/toast.jsx';
import {
  WrenchScrewdriverIcon, PlusIcon, TrashIcon, PencilIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon, DocumentTextIcon, CalendarIcon, MagnifyingGlassIcon, ChartBarIcon
} from '@heroicons/react/24/outline';

// Custom hooks
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
    const startValue = 0;
    const endValue = parseInt(value) || 0;
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
        glowColor === 'red' ? 'bg-gradient-to-r from-red-500 to-pink-600' :
          glowColor === 'green' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
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
const RequestCard = React.memo(({ request, onEdit, onDelete, isEditing, editData, onSaveEdit, onCancelEdit, onEditDataChange, index }) => {
  const [setRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });

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
      'Completed': 'from-green-500 to-emerald-600 text-white',
      'In Progress': 'from-blue-500 to-indigo-600 text-white',
      'Pending': 'from-yellow-500 to-orange-600 text-white',
      'default': 'from-gray-500 to-gray-600 text-white'
    };
    return colors[status] || colors.default;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'High': 'from-red-500 to-pink-600 text-white',
      'Medium': 'from-orange-500 to-yellow-600 text-white',
      'Low': 'from-green-500 to-emerald-600 text-white',
      'default': 'from-gray-500 to-gray-600 text-white'
    };
    return colors[priority] || colors.default;
  };

  return (
    <div
      ref={setRef}
      className={`transform transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
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
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl group"
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
              {/* Status Bar */}
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

              {/* Content */}
              <div className="mb-4">
                <h3 className="font-bold text-xl text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                  {request.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{request.description}</p>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-1000 ${request.status === "Completed"
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 w-full"
                      : request.status === "In Progress"
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 w-2/3"
                        : "bg-gradient-to-r from-yellow-500 to-orange-600 w-1/3"
                      }`}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {request.status === "Completed" ? "100% Complete" :
                    request.status === "In Progress" ? "67% Complete" :
                      "33% Complete"}
                </p>
              </div>

              {/* Footer */}
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

const StatsCard = ({ title, value, icon, gradient, delay = 0 }) => {
  const [setRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <div
      ref={setRef}
      className={`transform transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <FloatingCard delay={delay}>
        <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-white/50`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">{title}</p>
              <p className="text-3xl font-bold text-gray-800">
                <AnimatedCounter value={value} />
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-white/50 backdrop-blur-sm">
              {icon}
            </div>
          </div>
        </div>
      </FloatingCard>
    </div>
  );
};

// Main Component
const TenantMaintenance = () => {
  const { darkMode } = useDarkMode();

  // State - data from API
  const [requests, setRequests] = useState([]);

  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    priority: 'Medium'
  });

  const [editingRequestId, setEditingRequestId] = useState(null);
  const [editRequestData, setEditRequestData] = useState({
    title: '',
    description: '',
    priority: 'Medium'
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);

  // Fetch data from backend
  useEffect(() => {
    const fetchMaintenanceData = async () => {
      try {
        setIsLoading(true);

        // Fetch user profile
        const profile = await api.getProfile();

        // Fetch maintenance requests for tenant
        if (profile && profile.id) {
          const maintenanceData = await api.getTenantMaintenanceRequests(profile.id);

          // Transform backend data to match frontend format
          const transformedRequests = Array.isArray(maintenanceData) ? maintenanceData.map(req => ({
            id: req._id || req.id,
            title: req.title || req.issueType || 'Maintenance Request',
            description: req.description || 'No description',
            priority: req.priority || 'Medium',
            status: req.status || 'Pending',
            date: req.createdAt || req.reportedDate || new Date().toISOString()
          })) : [];

          setRequests(transformedRequests);
        }
      } catch (error) {
        console.error('Error fetching maintenance data:', error);
        showErrorToast('Failed to load maintenance requests');
        setRequests([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaintenanceData();
  }, []);

  // Memoized filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || request.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || request.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [requests, searchTerm, statusFilter, priorityFilter]);

  // Memoized statistics
  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter(r => r.status === 'Pending').length,
      inProgress: requests.filter(r => r.status === 'In Progress').length,
      completed: requests.filter(r => r.status === 'Completed').length
    };
  }, [requests]);

  const submitNewRequest = useCallback(() => {
    if (newRequest.title && newRequest.description) {
      const createRequest = async () => {
        try {
          const profile = await api.getProfile();

          const requestData = {
            title: newRequest.title,
            description: newRequest.description,
            priority: newRequest.priority,
            issueType: newRequest.title,
            reportedBy: profile.id,
            status: 'Pending'
          };

          const createdRequest = await api.createMaintenanceRequest(requestData);

          // Transform to frontend format
          const newReq = {
            id: createdRequest._id || createdRequest.id,
            title: createdRequest.title || createdRequest.issueType,
            description: createdRequest.description,
            priority: createdRequest.priority || 'Medium',
            status: createdRequest.status || 'Pending',
            date: createdRequest.createdAt || new Date().toISOString()
          };

          setRequests(prev => [newReq, ...prev]);
          setNewRequest({ title: '', description: '', priority: 'Medium' });
          setShowNewRequestForm(false);
          showSuccessToast('Maintenance request submitted successfully');
        } catch (error) {
          console.error('Error creating maintenance request:', error);
          showErrorToast('Failed to submit request');
        }
      };

      createRequest();
    } else {
      showInfoToast('Please fill in all required fields');
    }
  }, [newRequest]);

  const handleEditRequest = useCallback((request) => {
    setEditingRequestId(request.id);
    setEditRequestData({
      title: request.title,
      description: request.description,
      priority: request.priority
    });
  }, []);

  const saveEditRequest = useCallback((id) => {
    const updateRequest = async () => {
      try {
        const updateData = {
          title: editRequestData.title,
          description: editRequestData.description,
          priority: editRequestData.priority
        };

        await api.updateMaintenanceRequest(id, updateData);

        setRequests(prev =>
          prev.map(req =>
            req.id === id ? { ...req, ...editRequestData } : req
          )
        );
        setEditingRequestId(null);
        showSuccessToast('Request updated successfully');
      } catch (error) {
        console.error('Error updating maintenance request:', error);
        showErrorToast('Failed to update request');
      }
    };

    updateRequest();
  }, [editRequestData]);

  const cancelEditRequest = useCallback(() => {
    setEditingRequestId(null);
  }, []);

  const deleteRequest = useCallback((id) => {
    const performDelete = async () => {
      try {
        await api.deleteMaintenanceRequest(id);
        setRequests(prev => prev.filter(req => req.id !== id));
        showSuccessToast('Request deleted successfully');
      } catch (error) {
        console.error('Error deleting maintenance request:', error);
        showErrorToast('Failed to delete request');
      }
    };

    performDelete();
  }, []);

  // Loading screen
  if (isLoading) {
    return (
      <div className="flex h-screen">
        <TenantSideBar />
        <div className="flex flex-col flex-1">
          <TenantNavBar currentSection="Maintenance" />
          <main className={`flex-1 flex items-center justify-center ${darkMode
            ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-blue-950'
            : 'bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400'}`}>
            <div className="text-center">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-orange-200 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-20 h-20 border-4 border-t-orange-600 rounded-full animate-spin"></div>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mt-6 animate-pulse">Loading Maintenance...</h2>
              <p className="text-gray-600 mt-2">Preparing your requests</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${darkMode
      ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-blue-950'
      : 'bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400'}`}>
      <TenantSideBar />
      <div className="flex flex-col flex-1">
        <TenantNavBar currentSection="Maintenance" />
        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          {/* Hero Section */}
          <div className="mb-12">
            <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-white/20 rounded-2xl mr-4">
                  <WrenchScrewdriverIcon className="h-10 w-10" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2 animate-slideDown">
                    Maintenance Requests
                  </h1>
                  <p className="text-orange-100 text-lg animate-slideUp">
                    Track and manage all your maintenance needs
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatsCard
              title="Total Requests"
              value={stats.total}
              icon={<DocumentTextIcon className="h-6 w-6 text-blue-600" />}
              gradient="from-blue-50 to-indigo-100"
              delay={0}
            />
            <StatsCard
              title="Pending"
              value={stats.pending}
              icon={<ClockIcon className="h-6 w-6 text-yellow-600" />}
              gradient="from-yellow-50 to-orange-100"
              delay={100}
            />
            <StatsCard
              title="In Progress"
              value={stats.inProgress}
              icon={<WrenchScrewdriverIcon className="h-6 w-6 text-blue-600" />}
              gradient="from-blue-50 to-cyan-100"
              delay={200}
            />
            <StatsCard
              title="Completed"
              value={stats.completed}
              icon={<CheckCircleIcon className="h-6 w-6 text-green-600" />}
              gradient="from-green-50 to-emerald-100"
              delay={300}
            />
          </div>

          {/* Search and Filter Section */}
          <div className={`${darkMode ? 'bg-slate-800/80' : 'bg-white/80'} backdrop-blur-sm p-6 rounded-2xl shadow-xl mb-8 border ${darkMode ? 'border-gray-700/20' : 'border-white/20'}`}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Search */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-6 py-4 pl-12 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg"
                />
                <MagnifyingGlassIcon className="h-6 w-6 text-gray-400 absolute left-4 top-5" />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                >
                  <option value="All">All Priority</option>
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>

                <GlowingButton
                  onClick={() => setShowNewRequestForm(!showNewRequestForm)}
                  className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl group"
                  glowColor="orange"
                >
                  <PlusIcon className="h-6 w-6 mr-2 inline" />
                  New Request
                </GlowingButton>
              </div>
            </div>
          </div>

          {/* New Request Form */}
          {showNewRequestForm && (
            <div className="mb-8 animate-slideUp">
              <div className={`${darkMode ? 'bg-slate-800/90' : 'bg-white/90'} backdrop-blur-sm rounded-3xl shadow-2xl p-8 border ${darkMode ? 'border-gray-700/50' : 'border-white/50'}`}>
                <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'} flex items-center`}>
                  <DocumentTextIcon className="h-8 w-8 mr-3 text-orange-600" />
                  Submit New Request
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>Request Title</label>
                      <input
                        type="text"
                        value={newRequest.title}
                        onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                        placeholder="Brief description of the issue"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>Priority Level</label>
                      <select
                        value={newRequest.priority}
                        onChange={(e) => setNewRequest(prev => ({ ...prev, priority: e.target.value }))}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                      >
                        <option value="Low">Low Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="High">High Priority</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>Detailed Description</label>
                    <textarea
                      value={newRequest.description}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full h-32 border-2 border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                      placeholder="Provide detailed description of the issue..."
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4 mt-8">
                  <button
                    onClick={() => setShowNewRequestForm(false)}
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <GlowingButton
                    onClick={submitNewRequest}
                    className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-3 rounded-xl group"
                    glowColor="orange"
                    disabled={!newRequest.title || !newRequest.description}
                  >
                    <PlusIcon className="h-5 w-5 mr-2 inline" />
                    Submit Request
                  </GlowingButton>
                </div>
              </div>
            </div>
          )}

          {/* Requests Grid */}
          <div className={`${darkMode ? 'bg-slate-800/80' : 'bg-white/80'} backdrop-blur-sm rounded-3xl shadow-2xl p-8 border ${darkMode ? 'border-gray-700/50' : 'border-white/50'}`}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mr-4">
                  <ChartBarIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Your Requests</h2>
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Track and manage your maintenance requests</p>
                </div>
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {filteredRequests.length} of {requests.length} requests
              </div>
            </div>

            {filteredRequests.length === 0 ? (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <WrenchScrewdriverIcon className={`h-24 w-24 ${darkMode ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-6 animate-bounce`} />
                  <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>
                    {requests.length === 0 ? 'No maintenance requests found' : 'No requests match your filters'}
                  </h3>
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-lg mb-8`}>
                    {requests.length === 0
                      ? 'Submit your first maintenance request to get started'
                      : 'Try adjusting your search criteria or filters'
                    }
                  </p>
                  {requests.length === 0 && (
                    <GlowingButton
                      onClick={() => setShowNewRequestForm(true)}
                      className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-xl group"
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
                    onCancelEdit={cancelEditRequest}
                    onEditDataChange={setEditRequestData}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

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
          background: linear-gradient(45deg, #f97316, #dc2626);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #ea580c, #b91c1c);
        }
      `}</style>
    </div>
  );
};

export default TenantMaintenance;