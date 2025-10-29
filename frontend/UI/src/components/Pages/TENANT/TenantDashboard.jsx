import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDarkMode } from '../../../useDarkMode.js';
import TenantSideBar from './TenantSideBar.jsx';
import TenantNavBar from './TenantNavBar.jsx';
import {
  DollarSign, Users, Wrench, BarChart3, TrendingUp, TrendingDown, Plus, Calendar, Building2, Heart, Bell, MessageSquare, CreditCard, Settings, Home, Star, Clock, FileText, CheckCircle, AlertTriangle, X
} from 'lucide-react';

// Constants
const ITEMS_PER_PAGE = 4;

// Simplified hooks
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

const usePagination = (items, itemsPerPage = ITEMS_PER_PAGE) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  return {
    currentPage,
    totalPages,
    paginatedItems,
    setCurrentPage
  };
};

// Simplified Components
const StatCard = React.memo(({ icon: Icon, title, value, change, trend, color, prefix = '', suffix = '', isDark = true }) => {
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;

  const themeStyles = isDark
    ? {
      cardBg: 'bg-slate-800/80',
      cardBorder: 'border-slate-700/50',
      iconBg: 'from-cyan-500/20 to-indigo-500/20',
      iconBorder: 'border-cyan-400/30',
      iconColor: 'text-cyan-300',
      textPrimary: 'text-slate-100',
      textSecondary: 'text-slate-300',
      trendUp: 'bg-cyan-400/20 text-cyan-300 border-cyan-400/40',
      trendDown: 'bg-pink-400/20 text-pink-300 border-pink-400/40'
    }
    : {
      cardBg: 'bg-white/80',
      cardBorder: 'border-indigo-200/50',
      iconBg: 'from-indigo-100/80 to-purple-100/80',
      iconBorder: 'border-indigo-300/50',
      iconColor: 'text-indigo-700',
      textPrimary: 'text-gray-900',
      textSecondary: 'text-indigo-600',
      trendUp: 'bg-indigo-100/60 text-indigo-700 border-indigo-300/60',
      trendDown: 'bg-pink-100/60 text-pink-700 border-pink-300/60'
    };

  return (
    <div className={`group relative overflow-hidden ${themeStyles.cardBg} border ${themeStyles.cardBorder} rounded-2xl p-5 shadow-sm ${color}`}>
      <div className="relative z-20">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${themeStyles.iconBg} backdrop-blur-sm border ${themeStyles.iconBorder}`}>
            {Icon && <Icon className={`w-6 h-6 ${themeStyles.iconColor}`} />}
          </div>
          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm border ${trend === 'up' ? themeStyles.trendUp : themeStyles.trendDown}`}>
            <TrendIcon className="w-3 h-3" />
            <span>{change}</span>
          </div>
        </div>
        <h3 className={`text-2xl font-bold ${themeStyles.textPrimary} mb-2`}>
          {prefix}{parseInt(value).toLocaleString()}{suffix}
        </h3>
        <p className={`${themeStyles.textSecondary} font-medium text-sm`}>
          {title}
        </p>
      </div>
    </div>
  );
});

// Simplified Property Card
const PropertyCard = React.memo(({ property, onView, onRemove, removeConfirmId, onConfirmRemove, onCancelRemove, index }) => {
  const { darkMode } = useDarkMode();

  return (
    <div className={`rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group hover:scale-105 border ${darkMode
      ? 'bg-slate-800 border-slate-700 hover:shadow-blue-500/10'
      : 'bg-white border-gray-100 hover:shadow-blue-500/20'}`}>
      <div className="relative overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-48 object-cover transition-all duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Price Badge */}
        <div className={`absolute bottom-4 left-4 px-4 py-2 rounded-full font-semibold shadow-lg text-white ${darkMode
          ? 'bg-gradient-to-r from-blue-700 to-purple-800'
          : 'bg-gradient-to-r from-blue-600 to-purple-600'}`}>
          {property.price}
        </div>
      </div>

      <div className="p-6">
        <h3 className={`font-bold text-xl mb-2 transition-colors duration-300 ${darkMode
          ? 'text-slate-100 group-hover:text-blue-400'
          : 'text-gray-800 group-hover:text-blue-600'}`}>
          {property.title}
        </h3>
        <p className={`mb-3 flex items-center ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
          <Star className={`h-4 w-4 mr-2 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
          {property.location}
        </p>
        <p className={`text-sm mb-4 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{property.bedrooms} bed • {property.bathrooms} bath</p>

        <div className="flex justify-between items-center">
          {removeConfirmId === property.id ? (
            <div className="flex space-x-2">
              <button
                onClick={() => onRemove(property.id)}
                className={`text-white text-sm px-4 py-2 rounded-lg group ${darkMode ? 'bg-red-700' : 'bg-red-600'}`}
              >
                Confirm
              </button>
              <button
                onClick={onCancelRemove}
                className={`text-sm px-4 py-2 rounded-lg transition-colors duration-200 ${darkMode
                  ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => onConfirmRemove(property.id)}
              className={`transition-colors duration-200 p-2 hover:scale-110 ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'}`}
              aria-label={`Remove ${property.title} from favorites`}
            >
              <Heart className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

// Simplified Notification Item
const NotificationItem = React.memo(({ notification, onMarkAsRead, onDelete, index }) => {
  const { darkMode } = useDarkMode();

  const notificationTypeIcon = {
    maintenance: <Wrench className={`h-6 w-6 ${darkMode ? 'text-orange-400' : 'text-orange-500'}`} />,
    payment: <CreditCard className={`h-6 w-6 ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} />,
    general: <Bell className={`h-6 w-6 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />,
  };

  return (
    <div
      className={`relative p-4 rounded-xl border-l-4 cursor-pointer transition-all duration-300 shadow-md hover:shadow-xl ${darkMode ? 'bg-slate-800' : 'bg-white'} ${notification.read
        ? (darkMode ? 'border-slate-600' : 'border-gray-300')
        : (darkMode ? 'border-blue-400' : 'border-blue-500')
      } hover:scale-105 group`}
      onClick={() => onMarkAsRead(notification.id)}
    >
      <div className="flex items-start">
        <div className={`p-2 rounded-full shadow-md group-hover:scale-110 transition-transform duration-300 ${darkMode ? 'bg-slate-700' : 'bg-white'}`}>
          {notificationTypeIcon[notification.type]}
        </div>
        <div className="flex-1 ml-4">
          <h4 className={`font-semibold mb-1 ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>{notification.title}</h4>
          <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>{notification.message}</p>
          <div className="flex justify-between items-center mt-2">
            <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{notification.time}</span>
            {!notification.read && (
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
            )}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          className={`ml-2 p-2 hover:scale-110 transition-all duration-200 ${darkMode ? 'text-slate-400 hover:text-red-400' : 'text-gray-400 hover:text-red-600'}`}
          aria-label="Delete notification"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
});

// Simplified Modal
const Modal = React.memo(({ isOpen, onClose, title, children, size = "md" }) => {
  const { darkMode } = useDarkMode();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-2xl shadow-2xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto m-4`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`sticky top-0 ${darkMode ? 'bg-slate-800/95' : 'bg-white/95'} backdrop-blur-sm border-b ${darkMode ? 'border-slate-700' : 'border-gray-200'} p-6 rounded-t-2xl`}>
          <div className="flex justify-between items-center">
            <h3 className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>{title}</h3>
            <button
              onClick={onClose}
              className={`p-2 ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} rounded-full transition-colors duration-200 hover:scale-110`}
              aria-label={`Close ${title}`}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        <div className={`p-6 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
          {children}
        </div>
      </div>
    </div>
  );
});

// Main Component
const TenantDashboard = () => {
  const { darkMode } = useDarkMode();
  const [currentSection, setCurrentSection] = useState('Dashboard');
  const [isLoading, setIsLoading] = useState(true);

  // Initial data
  const INITIAL_PROPERTIES = [
    {
      id: 1,
      title: "Modern Apartment in Downtown",
      location: "123 Main St, City Center",
      price: "$1,200/month",
      image: "/api/placeholder/300/200",
      bedrooms: 2,
      bathrooms: 1
    },
    {
      id: 2,
      title: "Cozy Studio Near Park",
      location: "456 Oak Ave, Green District",
      price: "$800/month",
      image: "/api/placeholder/300/200",
      bedrooms: 1,
      bathrooms: 1
    },
    {
      id: 3,
      title: "Luxury Penthouse",
      location: "789 Sky Tower, Downtown",
      price: "$3,500/month",
      image: "/api/placeholder/300/200",
      bedrooms: 3,
      bathrooms: 2
    }
  ];

  const INITIAL_NOTIFICATIONS = [
    {
      id: 1,
      type: "maintenance",
      title: "Maintenance Scheduled",
      message: "Your AC repair is scheduled for tomorrow at 2 PM",
      time: "2 hours ago",
      read: false
    },
    {
      id: 2,
      type: "payment",
      title: "Payment Reminder",
      message: "Your rent payment is due in 3 days",
      time: "1 day ago",
      read: false
    },
    {
      id: 3,
      type: "general",
      title: "Building Notice",
      message: "Water will be shut off for maintenance on Sunday 9-11 AM",
      time: "3 days ago",
      read: true
    }
  ];

  const INITIAL_MAINTENANCE = [
    {
      id: 1,
      title: "Leaky Faucet",
      description: "Kitchen faucet is dripping constantly",
      status: "In Progress",
      date: "2024-01-15",
      priority: "Medium"
    },
    {
      id: 2,
      title: "Broken Light Fixture",
      description: "Living room ceiling light not working",
      status: "Completed",
      date: "2024-01-10",
      priority: "Low"
    }
  ];

  const INITIAL_PAYMENTS = [
    {
      id: 1,
      amount: "$1,200",
      type: "Rent",
      date: "2024-01-01",
      status: "Paid",
      method: "Bank Transfer"
    },
    {
      id: 2,
      amount: "$50",
      type: "Utilities",
      date: "2024-01-01",
      status: "Paid",
      method: "Credit Card"
    },
    {
      id: 3,
      amount: "$1,200",
      type: "Rent",
      date: "2024-02-01",
      status: "Pending",
      method: "Bank Transfer"
    }
  ];

  // State management with localStorage
  const [favouriteProperties, setFavouriteProperties] = useLocalStorage('favouriteProperties', INITIAL_PROPERTIES);
  const [notifications, setNotifications] = useLocalStorage('notifications', INITIAL_NOTIFICATIONS);
  const [maintenanceRequests, setMaintenanceRequests] = useLocalStorage('maintenanceRequests', INITIAL_MAINTENANCE);
  const [paymentHistory, setPaymentHistory] = useLocalStorage('paymentHistory', INITIAL_PAYMENTS);

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [removeConfirmId, setRemoveConfirmId] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRequestId, setEditingRequestId] = useState(null);

  // Form state
  const [maintenanceForm, setMaintenanceForm] = useState({
    issueType: '',
    priority: '',
    description: '',
    photos: []
  });
  const [newMaintenanceRequest, setNewMaintenanceRequest] = useState({
    title: '',
    description: '',
    priority: 'Medium'
  });
  const [editRequestData, setEditRequestData] = useState({
    title: '',
    description: '',
    priority: 'Medium'
  });
  const [newProperty, setNewProperty] = useState({
    title: '',
    location: '',
    price: '',
    image: '/api/placeholder/300/200',
    bedrooms: 0,
    bathrooms: 0,
  });

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Utility functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const extractNumericValue = (priceString) => {
    return Number(priceString.replace(/[^0-9.-]+/g, ""));
  };

  const getStatusColor = (status) => {
    const colors = {
      'Completed': 'from-green-500 to-emerald-600 text-white',
      'In Progress': 'from-blue-500 to-indigo-600 text-white',
      'Pending': 'from-yellow-500 to-orange-600 text-white',
      'Paid': 'from-green-500 to-emerald-600 text-white',
      'default': 'from-gray-500 to-gray-600 text-white'
    };
    return colors[status] || colors.default;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Emergency': 'from-purple-600 to-indigo-700 text-white',
      'High': 'from-red-500 to-pink-600 text-white',
      'Medium': 'from-yellow-500 to-orange-600 text-white',
      'Low': 'from-green-500 to-emerald-600 text-white',
      'default': 'from-gray-500 to-gray-600 text-white'
    };
    return colors[priority] || colors.default;
  };

  // Memoized filtered and sorted properties
  const filteredAndSortedProperties = useMemo(() => {
    let filtered = favouriteProperties.filter((property) =>
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortKey) {
      filtered = [...filtered].sort((a, b) => {
        let aValue = a[sortKey];
        let bValue = b[sortKey];

        if (sortKey === 'price') {
          aValue = extractNumericValue(aValue);
          bValue = extractNumericValue(bValue);
        }

        if (aValue < bValue) return sortAsc ? -1 : 1;
        if (aValue > bValue) return sortAsc ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [favouriteProperties, searchTerm, sortKey, sortAsc]);

  // Pagination for properties
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedProperties,
    setCurrentPage
  } = usePagination(filteredAndSortedProperties);

  // Stats for dashboard
  const stats = useMemo(() => [
    {
      icon: Heart,
      title: 'Favorite Properties',
      value: favouriteProperties.length || 0,
      change: '+0%',
      trend: favouriteProperties.length > 0 ? 'up' : 'down',
      color: darkMode ? 'from-cyan-500 to-indigo-600' : 'from-indigo-500 to-purple-600'
    },
    {
      icon: Bell,
      title: 'Unread Notifications',
      value: notifications.filter(n => !n.read).length || 0,
      change: '+0%',
      trend: 'up',
      color: darkMode ? 'from-indigo-500 to-purple-600' : 'from-purple-500 to-pink-500'
    },
    {
      icon: Wrench,
      title: 'Maintenance Requests',
      value: maintenanceRequests.length || 0,
      change: '-0%',
      trend: 'down',
      color: darkMode ? 'from-purple-500 to-pink-600' : 'from-pink-400 to-rose-500'
    },
    {
      icon: CreditCard,
      title: 'Total Payments',
      value: paymentHistory.filter(p => p.status === 'Paid').length || 0,
      change: '+0%',
      trend: 'up',
      color: darkMode ? 'from-pink-500 to-rose-600' : 'from-rose-400 to-pink-500'
    }
  ], [darkMode, favouriteProperties, notifications, maintenanceRequests, paymentHistory]);

  // Event handlers (keeping all the original handlers)
  const toggleSort = useCallback((key) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  }, [sortKey, sortAsc]);

  const confirmRemoveFavourite = useCallback((id) => {
    setRemoveConfirmId(id);
  }, []);

  const cancelRemoveFavourite = useCallback(() => {
    setRemoveConfirmId(null);
  }, []);

  const removeFavourite = useCallback((id) => {
    setFavouriteProperties(prev => prev.filter(prop => prop.id !== id));
    setRemoveConfirmId(null);
  }, [setFavouriteProperties]);

  const markNotificationAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }, [setNotifications]);

  const deleteNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, [setNotifications]);

  // State for form submission feedback
  const [formSubmitStatus, setFormSubmitStatus] = useState({
    isSubmitting: false,
    isSuccess: false,
    isError: false,
    message: ''
  });

  const handleMaintenanceSubmit = useCallback(() => {
    // Validate form
    if (!maintenanceForm.issueType || !maintenanceForm.priority || !maintenanceForm.description) {
      setFormSubmitStatus({
        isSubmitting: false,
        isSuccess: false,
        isError: true,
        message: 'Please fill in all required fields'
      });

      // Clear error message after 3 seconds
      setTimeout(() => {
        setFormSubmitStatus(prev => ({ ...prev, isError: false, message: '' }));
      }, 3000);

      return;
    }

    // Set submitting state
    setFormSubmitStatus({
      isSubmitting: true,
      isSuccess: false,
      isError: false,
      message: 'Submitting request...'
    });

    // Simulate API call with timeout
    setTimeout(() => {
      try {
        const request = {
          id: Date.now(),
          title: maintenanceForm.issueType,
          description: maintenanceForm.description,
          priority: maintenanceForm.priority,
          status: "Pending",
          date: new Date().toISOString().split('T')[0],
          photos: maintenanceForm.photos
        };

        setMaintenanceRequests(prev => [...prev, request]);

        // Reset form
        setMaintenanceForm({
          issueType: '',
          priority: '',
          description: '',
          photos: []
        });

        // Show success message
        setFormSubmitStatus({
          isSubmitting: false,
          isSuccess: true,
          isError: false,
          message: 'Maintenance request submitted successfully!'
        });

        // Clear success message after 3 seconds
        setTimeout(() => {
          setFormSubmitStatus(prev => ({ ...prev, isSuccess: false, message: '' }));
        }, 3000);

      } catch (error) {
        // Show error message
        setFormSubmitStatus({
          isSubmitting: false,
          isSuccess: false,
          isError: true,
          message: 'Failed to submit request. Please try again.'
        });

        // Clear error message after 3 seconds
        setTimeout(() => {
          setFormSubmitStatus(prev => ({ ...prev, isError: false, message: '' }));
        }, 3000);
      }
    }, 1000); // Simulate network delay
  }, [maintenanceForm, setMaintenanceRequests]);

  const submitMaintenanceRequest = useCallback(() => {
    if (newMaintenanceRequest.title && newMaintenanceRequest.description) {
      const request = {
        id: Date.now(),
        ...newMaintenanceRequest,
        status: "Pending",
        date: new Date().toISOString().split('T')[0]
      };
      setMaintenanceRequests(prev => [...prev, request]);
      setNewMaintenanceRequest({ title: '', description: '', priority: 'Medium' });
    }
  }, [newMaintenanceRequest, setMaintenanceRequests]);

  const sendMessage = useCallback(() => {
    if (newMessage.trim() || attachments.length) {
      const newMsg = {
        id: Date.now(),
        sender: "You",
        message: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true,
        attachments: attachments.length ? attachments.map(file => file.name) : []
      };
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      setAttachments([]);
    }
  }, [newMessage, attachments, setMessages]);

  const handleAddProperty = useCallback(() => {
    if (newProperty.title && newProperty.location && newProperty.price) {
      setFavouriteProperties(prev => [...prev, { ...newProperty, id: Date.now() }]);
      setNewProperty({
        title: '',
        location: '',
        price: '',
        image: '/api/placeholder/300/200',
        bedrooms: 0,
        bathrooms: 0,
      });
      setIsAddModalOpen(false);
    }
  }, [newProperty, setFavouriteProperties]);

  const themeConfig = darkMode
    ? {
      mainBg: 'from-gray-900 via-slate-800 to-blue-950',
      loadingBg: 'from-gray-900 via-slate-800 to-blue-950',
      cardBg: 'bg-slate-800/50',
      cardBorder: 'border-slate-700/50',
      textPrimary: 'text-slate-100',
      textSecondary: 'text-slate-200',
      textAccent: 'text-cyan-300',
      headerGradient: 'from-cyan-300 via-purple-300 to-pink-300',
      tabBg: 'bg-slate-800/50',
      tabBorder: 'border-slate-700/50',
      tabActive: 'from-cyan-500 to-indigo-600',
      tabActiveText: 'text-blue-950',
      tabInactive: 'text-slate-300 hover:text-slate-100 hover:bg-slate-700/50',
      buttonPrimary: 'from-cyan-500 to-indigo-600',
      buttonSecondary: 'from-purple-500 to-pink-600',
      iconColors: {
        flame: 'text-pink-400',
        trend: 'text-cyan-400',
        building: 'text-cyan-400',
        wrench: 'text-pink-400'
      },
      backgroundParticles: [
        'from-purple-500/15 to-pink-500/15',
        'from-cyan-500/15 to-indigo-500/15',
        'from-indigo-500/10 to-purple-500/10'
      ],
      spinnerBorder: 'border-cyan-500/30 border-t-cyan-400',
      loadingText: 'text-cyan-200'
    }
    : {
      mainBg: 'from-pink-300 via-purple-300 to-indigo-400',
      loadingBg: 'from-pink-300 via-purple-300 to-indigo-400',
      cardBg: 'bg-white/60',
      cardBorder: 'border-indigo-200/50',
      textPrimary: 'text-gray-900',
      textSecondary: 'text-indigo-600',
      textAccent: 'text-indigo-700',
      headerGradient: 'from-indigo-700 via-purple-700 to-pink-700',
      tabBg: 'bg-white/30',
      tabBorder: 'border-indigo-200/50',
      tabActive: 'from-indigo-600 to-purple-600',
      tabActiveText: 'text-white',
      tabInactive: 'text-indigo-600 hover:text-indigo-800 hover:bg-white/40',
      buttonPrimary: 'from-indigo-600 to-purple-600',
      buttonSecondary: 'from-purple-600 to-pink-600',
      iconColors: {
        flame: 'text-pink-600',
        trend: 'text-indigo-600',
        building: 'text-indigo-600',
        wrench: 'text-pink-600'
      },
      backgroundParticles: [
        'from-purple-300/20 to-pink-300/20',
        'from-indigo-300/20 to-purple-300/20',
        'from-pink-300/15 to-indigo-300/15'
      ],
      spinnerBorder: 'border-indigo-400/40 border-t-indigo-600',
      loadingText: 'text-indigo-700'
    };

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${themeConfig.loadingBg} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`w-12 h-12 border-4 ${themeConfig.spinnerBorder} rounded-full mx-auto mb-4 animate-spin`} />
          <h2 className={`text-xl font-bold ${themeConfig.textPrimary} mb-1`}>Loading Dashboard...</h2>
          <p className={`${themeConfig.loadingText} text-sm`}>Preparing your tenant insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeConfig.mainBg} flex relative`}>
      <TenantSideBar setCurrentSection={setCurrentSection} />
      
      <div className="flex-1 flex flex-col relative z-10 transition-all duration-700">
        <TenantNavBar currentSection={currentSection} />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">
            {/* Header Section */}
            <div className="text-center mb-12">
              <h1 className={`text-4xl font-bold ${themeConfig.textPrimary} mb-4 bg-gradient-to-r ${themeConfig.headerGradient} bg-clip-text text-transparent`}>
                Welcome Back, Tenant!
              </h1>
              <p className={`text-lg ${themeConfig.textSecondary} max-w-2xl mx-auto leading-relaxed`}>
                Your comprehensive rental management dashboard with real-time insights and property management tools
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {stats.map((stat, index) => (
                <StatCard
                  key={stat.title}
                  {...stat}
                  delay={index * 0.15}
                  isDark={darkMode}
                />
              ))}
            </div>

            {/* Tab Navigation */}
            <div
              className={`flex flex-wrap gap-4 mb-8 ${themeConfig.tabBg} p-3 rounded-3xl backdrop-blur-xl border ${themeConfig.tabBorder}`}
            >
              {[
                { key: 'overview', label: 'Overview', icon: BarChart3, action: 'tab' },
                { key: 'properties', label: 'Properties', icon: Building2, action: 'navigate', route: '/tenant/properties' },
                { key: 'maintenance', label: 'Maintenance', icon: Wrench, action: 'navigate', route: '/tenant/maintenance' }
              ].map(({ key, label, icon: Icon, action, route }) => (
                <button
                  key={key}
                  onClick={() => {
                    if (action === 'tab') {
                      setCurrentSection(key === 'overview' ? 'Dashboard' : key);
                    } else if (action === 'navigate') {
                      // Navigate to route
                    }
                  }}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-2xl font-bold text-sm relative overflow-hidden group ${currentSection === key && action === 'tab'
                    ? `bg-gradient-to-r ${themeConfig.tabActive} ${themeConfig.tabActiveText}`
                    : `${themeConfig.tabInactive}`
                    }`}
                >
                  {Icon && <Icon className="w-5 h-5" />}
                  <span className="relative z-10 font-semibold">{label}</span>
                </button>
              ))}
            </div>

            {/* Overview Content */}
            {currentSection === 'Dashboard' && (
              <div className="space-y-10">
                {/* Quick Actions */}
                <div className={`${themeConfig.cardBg} backdrop-blur-xl border ${themeConfig.cardBorder} rounded-3xl p-8 relative overflow-hidden`}>
                  <h2 className={`text-3xl font-bold ${themeConfig.textPrimary} mb-8 flex items-center space-x-4 relative z-10`}>
                    <span className="bg-gradient-to-r from-current to-transparent bg-clip-text">Quick Actions</span>
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    {[
                      {
                        label: 'View Properties',
                        icon: Building2,
                        color: themeConfig.buttonPrimary,
                        onClick: () => setCurrentSection('Properties'),
                        description: 'Browse available rentals'
                      },
                      {
                        label: 'Request Maintenance',
                        icon: Wrench,
                        color: themeConfig.buttonPrimary,
                        onClick: () => setCurrentSection('Maintenance'),
                        description: 'Report issues'
                      },
                      {
                        label: 'View Notifications',
                        icon: Bell,
                        color: themeConfig.buttonSecondary,
                        onClick: () => setCurrentSection('Notifications'),
                        description: 'Check alerts'
                      }
                    ].map((action) => (
                      <button
                        key={action.label}
                        onClick={action.onClick}
                        className={`group relative p-8 bg-gradient-to-br ${action.color} rounded-2xl text-white font-bold shadow-sm text-base overflow-hidden hover:opacity-95`}
                      >
                        <div className="mb-4 relative z-10">
                          <action.icon className="w-8 h-8 mx-auto" />
                        </div>
                        <div className="relative z-10">
                          <div className="text-lg font-bold mb-2">{action.label}</div>
                          <div className="text-sm opacity-90 font-medium">{action.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className={`${themeConfig.cardBg} backdrop-blur-xl border ${themeConfig.cardBorder} rounded-3xl p-8 relative overflow-hidden`}>
                  <h2 className={`text-3xl font-bold ${themeConfig.textPrimary} mb-8 flex items-center space-x-4 relative z-10`}>
                    <TrendingUp className={`w-8 h-8 ${themeConfig.iconColors.trend}`} />
                    <span>Recent Activity</span>
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                    {[
                      {
                        value: notifications.filter(n => !n.read).length,
                        label: 'Unread Notifications',
                        color: darkMode ? 'text-cyan-400' : 'text-indigo-600',
                        delay: 0,
                        bgGradient: darkMode ? 'from-cyan-500/20 to-indigo-500/20' : 'from-indigo-500/20 to-cyan-500/20'
                      },
                      {
                        value: maintenanceRequests.length,
                        label: 'Total Requests',
                        color: darkMode ? 'text-indigo-400' : 'text-purple-600',
                        delay: 0.15,
                        bgGradient: darkMode ? 'from-indigo-500/20 to-purple-500/20' : 'from-purple-500/20 to-indigo-500/20'
                      },
                      {
                        value: favouriteProperties.length,
                        label: 'Saved Properties',
                        color: darkMode ? 'text-purple-400' : 'text-pink-600',
                        delay: 0.3,
                        bgGradient: darkMode ? 'from-purple-500/20 to-pink-500/20' : 'from-pink-500/20 to-purple-500/20'
                      }
                    ].map((metric) => (
                      <div
                        key={metric.label}
                        className={`relative text-center p-8 ${darkMode ? 'bg-slate-900/60' : 'bg-white/60'} rounded-2xl border ${darkMode ? 'border-slate-700/50' : 'border-indigo-200/50'} backdrop-blur-sm overflow-hidden group`}
                      >
                        <div className={`text-4xl font-bold ${metric.color} mb-3 relative z-10`}>
                          {metric.value}
                        </div>
                        <div className={`${themeConfig.textSecondary} text-lg font-semibold relative z-10`}>
                          {metric.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default TenantDashboard;
