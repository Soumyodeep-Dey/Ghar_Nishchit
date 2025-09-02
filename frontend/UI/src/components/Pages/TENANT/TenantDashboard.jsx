import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDarkMode } from '../../../useDarkMode.js';
import TenantSideBar from '../../Pages/TENANT/TenantSideBar';
import TenantNavBar from '../../Pages/TENANT/TenantNavBar';
import { HeartIcon, BellIcon, ChatBubbleLeftRightIcon, WrenchScrewdriverIcon, CreditCardIcon, PlusIcon, TrashIcon, EyeIcon, XMarkIcon, ChartBarIcon, ChevronUpIcon, ChevronDownIcon, ExclamationTriangleIcon, SparklesIcon, FireIcon, TrophyIcon, ClockIcon, DocumentArrowDownIcon, CheckCircleIcon, ArrowTrendingUpIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';

// Constants
const ITEMS_PER_PAGE = 4;
const CHART_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

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
      className={`relative overflow-hidden transform transition-all duration-300 hover:scale-105 group ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
    >
      <div className={`absolute inset-0 rounded-lg blur opacity-0 group-hover:opacity-75 transition-opacity bg-gradient-to-r ${glowColor === 'blue' ? 'from-blue-500 to-purple-600' :
          glowColor === 'red' ? 'from-red-500 to-pink-600' :
            glowColor === 'green' ? 'from-green-500 to-emerald-600' :
              'from-blue-500 to-purple-600'
        }`}></div>
      <div className="relative z-10">
        {children}
      </div>
    </button>
  );
};

// Enhanced Components
const PropertyCard = React.memo(({ property, onView, onRemove, removeConfirmId, onConfirmRemove, onCancelRemove, index }) => {
  const [setRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const { darkMode } = useDarkMode();

  return (
    <div
      ref={setRef}
      className={`transform transition-all duration-700 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <FloatingCard delay={index * 200}>
        <div className={`rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group hover:scale-105 border ${darkMode
          ? 'bg-slate-800 border-slate-700 hover:shadow-blue-500/10'
          : 'bg-white border-gray-100 hover:shadow-blue-500/20'}`}>
          <div className="relative overflow-hidden">
            {!imageLoaded && (
              <div className={`absolute inset-0 animate-pulse ${darkMode
                ? 'bg-gradient-to-r from-slate-700 to-slate-600'
                : 'bg-gradient-to-r from-gray-200 to-gray-300'}`}></div>
            )}
            <img
              src={property.image}
              alt={property.title}
              className={`w-full h-48 object-cover transition-all duration-700 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Floating Action Buttons */}
            <div className="absolute top-4 right-4 space-y-2">
              <button
                className={`p-2 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-all duration-300 ${darkMode
                  ? 'bg-slate-800/90 hover:bg-slate-700'
                  : 'bg-white/90 hover:bg-white'}`}
                onClick={() => onView(property)}
                aria-label={`View details of ${property.title}`}
              >
                <EyeIcon className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </button>
            </div>

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
              <SparklesIcon className={`h-4 w-4 mr-2 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
              {property.location}
            </p>
            <p className={`text-sm mb-4 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{property.bedrooms} bed • {property.bathrooms} bath</p>

            <div className="flex justify-between items-center">
              {removeConfirmId === property.id ? (
                <div className="flex space-x-2">
                  <GlowingButton
                    onClick={() => onRemove(property.id)}
                    className={`text-white text-sm px-4 py-2 rounded-lg group ${darkMode ? 'bg-red-700' : 'bg-red-600'}`}
                    glowColor="red"
                  >
                    Confirm
                  </GlowingButton>
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
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </FloatingCard>
    </div>
  );
});

const NotificationItem = React.memo(({ notification, onMarkAsRead, onDelete, index }) => {
  const [setRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const { darkMode } = useDarkMode();

  const notificationTypeIcon = {
    maintenance: <WrenchScrewdriverIcon className={`h-6 w-6 ${darkMode ? 'text-orange-400' : 'text-orange-500'}`} />,
    payment: <CreditCardIcon className={`h-6 w-6 ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} />,
    general: <BellIcon className={`h-6 w-6 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />,
  };

  const bgGradient = darkMode ? {
    maintenance: 'from-slate-800 to-orange-900/50',
    payment: 'from-slate-800 to-purple-900/50',
    general: 'from-slate-800 to-yellow-900/50',
  } : {
    maintenance: 'from-orange-50 to-red-50',
    payment: 'from-purple-50 to-pink-50',
    general: 'from-yellow-50 to-orange-50',
  };

  return (
    <div
      ref={setRef}
      className={`transform transition-all duration-500 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
        }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div
        className={`relative p-4 rounded-xl border-l-4 cursor-pointer transition-all duration-300 shadow-md hover:shadow-xl bg-gradient-to-r ${bgGradient[notification.type]
          } ${notification.read
            ? (darkMode ? 'border-slate-600' : 'border-gray-300')
            : (darkMode ? 'border-blue-400 animate-pulse' : 'border-blue-500 animate-pulse')
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
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
});

const MessageBubble = React.memo(({ message, index }) => {
  const [setRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <div
      ref={setRef}
      className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'} transform transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      <div className={`max-w-xs p-4 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 ${message.isOwn
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
          : 'bg-white text-gray-800 border border-gray-200'
        }`}>
        <p className="text-sm leading-relaxed">{message.message}</p>
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.attachments.map((file, idx) => (
              <div key={idx} className="text-xs bg-white/20 rounded-lg px-3 py-2">
                {file.type?.startsWith('image') ? (
                  <img src={URL.createObjectURL(file)} alt="attachment" className="max-h-24 rounded-lg" />
                ) : (
                  <span>{file.name}</span>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between mt-2">
          <p className={`text-xs ${message.isOwn ? 'text-blue-200' : 'text-gray-500'}`}>
            {message.time}
          </p>
          {message.isOwn && (
            <span className="text-xs ml-2">
              {message.status === "Sent" && "✓"}
              {message.status === "Delivered" && "✓✓"}
              {message.status === "Read" && <span className="text-green-300">✓✓</span>}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

const AnalyticsWidget = React.memo(({ title, children, className = "", icon, gradient = "from-blue-50 to-purple-50" }) => {
  const [setRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const { darkMode } = useDarkMode();

  return (
    <div
      ref={setRef}
      className={`transform transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
    >
      <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 ${darkMode ? 'border border-slate-700/50' : 'border border-white/50'} ${className}`}>
        <div className="flex items-center mb-4">
          {icon && <div className={`p-2 rounded-lg mr-3 ${darkMode ? 'bg-slate-700/50' : 'bg-white/50'}`}>{icon}</div>}
          <h3 className={`font-bold text-lg ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>{title}</h3>
        </div>
        {children}
      </div>
    </div>
  );
});

const Modal = React.memo(({ isOpen, onClose, title, children, size = "md" }) => {
  const [isClosing, setIsClosing] = useState(false);
  const { darkMode } = useDarkMode();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  if (!isOpen && !isClosing) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${isOpen && !isClosing ? 'opacity-100' : 'opacity-0'
        }`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      onClick={handleClose}
    >
      <div
        className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-2xl shadow-2xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto m-4 transform transition-all duration-300 ${isOpen && !isClosing ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`sticky top-0 ${darkMode ? 'bg-slate-800/95' : 'bg-white/95'} backdrop-blur-sm border-b ${darkMode ? 'border-slate-700' : 'border-gray-200'} p-6 rounded-t-2xl`}>
          <div className="flex justify-between items-center">
            <h3 className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>{title}</h3>
            <button
              onClick={handleClose}
              className={`p-2 ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} rounded-full transition-colors duration-200 hover:scale-110`}
              aria-label={`Close ${title}`}
            >
              <XMarkIcon className={`h-6 w-6 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`} />
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

  // Initial data with enhanced properties
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

  const INITIAL_MESSAGES = [
    {
      id: 1,
      sender: "Landlord",
      message: "Hi! Just checking if everything is okay with the apartment.",
      time: "10:30 AM",
      isOwn: false
    },
    {
      id: 2,
      sender: "You",
      message: "Yes, everything is great! Thank you for checking.",
      time: "10:45 AM",
      isOwn: true
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
  const [messages, setMessages] = useLocalStorage('messages', INITIAL_MESSAGES);
  const [maintenanceRequests, setMaintenanceRequests] = useLocalStorage('maintenanceRequests', INITIAL_MAINTENANCE);
  const [paymentHistory, setPaymentHistory] = useLocalStorage('paymentHistory', INITIAL_PAYMENTS);

  // UI state
  const [currentSection, setCurrentSection] = useState('Dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [removeConfirmId, setRemoveConfirmId] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [editingRequestId, setEditingRequestId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [maintenanceForm, setMaintenanceForm] = useState({
    issueType: '',
    priority: '',
    description: '',
    photos: []
  });
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
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
    const timer = setTimeout(() => setIsLoading(false), 2000);
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

  // Memoized analytics data
  const analyticsData = useMemo(() => {
    const totalPaid = paymentHistory
      .filter(p => p.status === 'Paid')
      .reduce((sum, p) => sum + extractNumericValue(p.amount), 0);

    const unreadNotifications = notifications.filter(n => !n.read).length;
    const readNotifications = notifications.filter(n => n.read).length;
    const pendingRequests = maintenanceRequests.filter(r => r.status === 'Pending').length;

    return {
      totalPaid,
      unreadNotifications,
      readNotifications,
      pendingRequests,
      monthlyRentData: Array.from({ length: 12 }, (_, i) => ({
        month: new Date(0, i).toLocaleString('default', { month: 'short' }),
        rent: 1200 + Math.random() * 200 - 100
      })),
      paymentBreakdownData: [
        { name: 'Rent', value: 14400, color: '#3b82f6' },
        { name: 'Utilities', value: 600, color: '#ef4444' },
        { name: 'Other', value: 200, color: '#10b981' },
      ],
      maintenanceTimelineData: [
        { name: 'Submitted', value: 5, color: '#f59e0b' },
        { name: 'In Progress', value: 2, color: '#3b82f6' },
        { name: 'Completed', value: 8, color: '#10b981' },
      ]
    };
  }, [paymentHistory, notifications, maintenanceRequests]);

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

  // Loading screen with enhanced animation
  if (isLoading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-slate-800 dark:to-blue-950">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-32 h-32 border-8 border-blue-200 dark:border-blue-900 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-32 h-32 border-8 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mt-8 animate-pulse">Loading Dashboard...</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Preparing your personalized experience</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen transition-colors duration-500 ${darkMode
      ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-blue-950 text-slate-100'
      : 'bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400 text-gray-900'
      }`}>
      <TenantSideBar setCurrentSection={setCurrentSection} />
      <div className="flex flex-col flex-1">
        <TenantNavBar currentSection={currentSection} />

        <main
          className="flex-1 p-6 overflow-y-auto custom-scrollbar"
          role="main"
          aria-label="Tenant Dashboard Main Content"
        >
          {/* Enhanced Hero Section */}
          <div className="relative mb-12 overflow-hidden">
            <div className={`rounded-3xl p-8 text-white shadow-2xl ${darkMode
              ? 'bg-gradient-to-r from-blue-950 via-slate-900 to-gray-900'
              : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600'}`}>
              <div className={`absolute inset-0 backdrop-blur-sm ${darkMode
                ? 'bg-gradient-to-r from-blue-900/20 to-slate-800/20'
                : 'bg-gradient-to-r from-blue-600/20 to-purple-600/20'}`}></div>
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-white/20 rounded-2xl mr-4 animate-pulse">
                    <SparklesIcon className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-extrabold mb-2 animate-slideDown">
                      Welcome Back!
                    </h1>
                    <p className="text-blue-100 text-lg animate-slideUp">
                      Your rental journey continues here
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <FloatingCard delay={0}>
                    <div className={`backdrop-blur-md rounded-2xl p-6 border transition-all duration-300 ${darkMode
                      ? 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50'
                      : 'bg-white/10 border-white/20 hover:bg-white/20'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-3xl font-bold mb-1">
                            <AnimatedCounter value={favouriteProperties.length} />
                          </div>
                          <div className={`${darkMode ? 'text-cyan-200' : 'text-blue-100'}`}>Favorite Properties</div>
                        </div>
                        <HeartSolidIcon className={`h-12 w-12 ${darkMode ? 'text-red-500' : 'text-red-400'} animate-pulse`} />
                      </div>
                    </div>
                  </FloatingCard>

                  <FloatingCard delay={200}>
                    <div className={`backdrop-blur-md rounded-2xl p-6 border transition-all duration-300 ${darkMode
                      ? 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50'
                      : 'bg-white/10 border-white/20 hover:bg-white/20'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-3xl font-bold mb-1">
                            <AnimatedCounter value={analyticsData.unreadNotifications} />
                          </div>
                          <div className={`${darkMode ? 'text-cyan-200' : 'text-blue-100'}`}>New Notifications</div>
                        </div>
                        <BellIcon className={`h-12 w-12 ${darkMode ? 'text-cyan-400' : 'text-yellow-400'} animate-bounce`} />
                      </div>
                    </div>
                  </FloatingCard>

                  <FloatingCard delay={400}>
                    <div className={`backdrop-blur-md rounded-2xl p-6 border transition-all duration-300 ${darkMode
                      ? 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50'
                      : 'bg-white/10 border-white/20 hover:bg-white/20'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-3xl font-bold mb-1">
                            <AnimatedCounter value={analyticsData.pendingRequests} />
                          </div>
                          <div className={`${darkMode ? 'text-cyan-200' : 'text-blue-100'}`}>Pending Requests</div>
                        </div>
                        <ClockIcon className={`h-12 w-12 ${darkMode ? 'text-cyan-400' : 'text-orange-400'} animate-pulse`} />
                      </div>
                    </div>
                  </FloatingCard>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Row for Dashboard Sections */}
          <div className="mb-8">
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`}>
              {/* Analytics Overview Button */}
              <button
                onClick={() => setCurrentSection('Analytics')}
                className={`flex items-center p-4 rounded-xl transition-all duration-300 hover:scale-105 ${darkMode
                  ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700'
                  : 'bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-200'} 
                  ${currentSection === 'Analytics' ? (darkMode ? 'ring-2 ring-blue-500' : 'ring-2 ring-blue-500') : ''}`}
              >
                <div className={`p-3 rounded-lg mr-3 ${darkMode
                  ? 'bg-blue-900/50 text-blue-400'
                  : 'bg-blue-100 text-blue-600'}`}>
                  <ChartBarIcon className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <h3 className={`font-semibold ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>Analytics Overview</h3>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Track your insights</p>
                </div>
              </button>

              {/* Favorite Properties Button */}
              <button
                onClick={() => setCurrentSection('Favorites')}
                className={`flex items-center p-4 rounded-xl transition-all duration-300 hover:scale-105 ${darkMode
                  ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700'
                  : 'bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200'} 
                  ${currentSection === 'Favorites' ? (darkMode ? 'ring-2 ring-red-500' : 'ring-2 ring-red-500') : ''}`}
              >
                <div className={`p-3 rounded-lg mr-3 ${darkMode
                  ? 'bg-red-900/50 text-red-400'
                  : 'bg-red-100 text-red-600'}`}>
                  <HeartSolidIcon className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <h3 className={`font-semibold ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>Favorite Properties</h3>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Your saved listings</p>
                </div>
              </button>

              {/* Notifications Button */}
              <button
                onClick={() => setCurrentSection('Notifications')}
                className={`flex items-center p-4 rounded-xl transition-all duration-300 hover:scale-105 ${darkMode
                  ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700'
                  : 'bg-white hover:bg-yellow-50 border border-gray-200 hover:border-yellow-200'} 
                  ${currentSection === 'Notifications' ? (darkMode ? 'ring-2 ring-yellow-500' : 'ring-2 ring-yellow-500') : ''}`}
              >
                <div className={`p-3 rounded-lg mr-3 relative ${darkMode
                  ? 'bg-yellow-900/50 text-yellow-400'
                  : 'bg-yellow-100 text-yellow-600'}`}>
                  <BellIcon className="h-6 w-6" />
                  {analyticsData.unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {analyticsData.unreadNotifications}
                    </span>
                  )}
                </div>
                <div className="text-left">
                  <h3 className={`font-semibold ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>Notifications</h3>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Updates & alerts</p>
                </div>
              </button>

              {/* Maintenance Button */}
              <button
                onClick={() => setCurrentSection('Maintenance')}
                className={`flex items-center p-4 rounded-xl transition-all duration-300 hover:scale-105 ${darkMode
                  ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700'
                  : 'bg-white hover:bg-green-50 border border-gray-200 hover:border-green-200'} 
                  ${currentSection === 'Maintenance' ? (darkMode ? 'ring-2 ring-green-500' : 'ring-2 ring-green-500') : ''}`}
              >
                <div className={`p-3 rounded-lg mr-3 ${darkMode
                  ? 'bg-green-900/50 text-green-400'
                  : 'bg-green-100 text-green-600'}`}>
                  <WrenchScrewdriverIcon className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <h3 className={`font-semibold ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>Maintenance</h3>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Request repairs</p>
                </div>
              </button>
            </div>
          </div>

          {/* Dashboard Welcome Section - Only visible when no section is selected */}
          <div className={`mb-12 ${currentSection !== 'Dashboard' ? 'hidden' : ''}`}>
            <div className={`rounded-3xl p-8 text-center ${darkMode
              ? 'bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700'
              : 'bg-white border border-gray-200 shadow-lg'}`}>
              <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                  <SparklesIcon className={`h-16 w-16 mx-auto ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                </div>
                <h2 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>Welcome to Your Dashboard</h2>
                <p className={`text-lg mb-8 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                  Select one of the dashboard sections above to view detailed information about your rental experience.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-blue-50'}`}>
                    <div className="flex items-start">
                      <ChartBarIcon className={`h-6 w-6 mt-1 mr-3 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                      <div>
                        <h3 className={`font-semibold mb-1 ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>Analytics</h3>
                        <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>View your rental insights and payment history</p>
                      </div>
                    </div>
                  </div>
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-red-50'}`}>
                    <div className="flex items-start">
                      <HeartSolidIcon className={`h-6 w-6 mt-1 mr-3 ${darkMode ? 'text-red-400' : 'text-red-500'}`} />
                      <div>
                        <h3 className={`font-semibold mb-1 ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>Favorites</h3>
                        <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>Browse your saved properties</p>
                      </div>
                    </div>
                  </div>
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-yellow-50'}`}>
                    <div className="flex items-start">
                      <BellIcon className={`h-6 w-6 mt-1 mr-3 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
                      <div>
                        <h3 className={`font-semibold mb-1 ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>Notifications</h3>
                        <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>Check your alerts and updates</p>
                      </div>
                    </div>
                  </div>
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-purple-50'}`}>
                    <div className="flex items-start">
                      <WrenchScrewdriverIcon className={`h-6 w-6 mt-1 mr-3 ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} />
                      <div>
                        <h3 className={`font-semibold mb-1 ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>Maintenance</h3>
                        <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>Request repairs and track maintenance issues</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Analytics Section */}
          <div className={`mb-12 ${currentSection !== 'Analytics' ? 'hidden' : ''}`}>
            <div className="flex items-center mb-8">
              <div className={`p-3 rounded-2xl mr-4 ${darkMode
                ? 'bg-gradient-to-r from-blue-700 to-indigo-800'
                : 'bg-gradient-to-r from-blue-500 to-purple-600'}`}>
                <ChartBarIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className={`text-3xl font-bold ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>Analytics Overview</h2>
                <p className={`${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>Track your rental insights and trends</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnalyticsWidget
                title="Monthly Rent Trend"
                icon={<ArrowTrendingUpIcon className={`h-6 w-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />}
                gradient={darkMode ? 'from-slate-800 to-blue-900' : 'from-blue-50 to-indigo-100'}
              >
                <ResponsiveContainer width="100%" height={120}>
                  <AreaChart data={analyticsData.monthlyRentData}>
                    <defs>
                      <linearGradient id="rentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={darkMode ? "#60a5fa" : "#3b82f6"} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={darkMode ? "#60a5fa" : "#3b82f6"} stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value) => [formatCurrency(value), 'Rent']}
                      contentStyle={{
                        backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: darkMode ? '0 10px 25px rgba(0, 0, 0, 0.3)' : '0 10px 25px rgba(0, 0, 0, 0.1)',
                        color: darkMode ? '#e2e8f0' : 'inherit'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="rent"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fill="url(#rentGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </AnalyticsWidget>

              <AnalyticsWidget
                title="Payment Breakdown"
                icon={<CurrencyDollarIcon className={`h-6 w-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />}
                gradient={darkMode ? 'from-slate-800 to-green-900' : 'from-green-50 to-emerald-100'}
              >
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie
                      data={analyticsData.paymentBreakdownData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={45}
                      innerRadius={25}
                    >
                      {analyticsData.paymentBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [formatCurrency(value)]}
                      contentStyle={{
                        backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: darkMode ? '0 10px 25px rgba(0, 0, 0, 0.3)' : '0 10px 25px rgba(0, 0, 0, 0.1)',
                        color: darkMode ? '#e2e8f0' : 'inherit'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </AnalyticsWidget>

              <AnalyticsWidget
                title="Maintenance Status"
                icon={<WrenchScrewdriverIcon className={`h-6 w-6 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />}
                gradient={darkMode ? 'from-slate-800 to-orange-900' : 'from-orange-50 to-red-100'}
              >
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={analyticsData.maintenanceTimelineData}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: darkMode ? '0 10px 25px rgba(0, 0, 0, 0.3)' : '0 10px 25px rgba(0, 0, 0, 0.1)',
                        color: darkMode ? '#e2e8f0' : 'inherit'
                      }}
                    />
                    <Bar dataKey="value" fill={darkMode ? "#fb923c" : "#f59e0b"} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </AnalyticsWidget>

              <AnalyticsWidget
                title="Total Paid This Year"
                icon={<TrophyIcon className={`h-6 w-6 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />}
                gradient={darkMode ? 'from-slate-800 to-yellow-900' : 'from-yellow-50 to-orange-100'}
              >
                <div className={`text-3xl font-bold mb-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                  <AnimatedCounter value={analyticsData.totalPaid} prefix="$" />
                </div>
                <div className={`text-sm ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                  +12% from last year
                </div>
              </AnalyticsWidget>

              <AnalyticsWidget
                title="Notifications Summary"
                icon={<BellIcon className={`h-6 w-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />}
                gradient={darkMode ? 'from-slate-800 to-purple-900' : 'from-purple-50 to-pink-100'}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>Read</span>
                    <span className={`font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                      <AnimatedCounter value={analyticsData.readNotifications} />
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>Unread</span>
                    <span className={`font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                      <AnimatedCounter value={analyticsData.unreadNotifications} />
                    </span>
                  </div>
                </div>
              </AnalyticsWidget>

              <AnalyticsWidget
                title="Quick Actions"
                icon={<FireIcon className={`h-6 w-6 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />}
                gradient={darkMode ? 'from-slate-800 to-red-900' : 'from-red-50 to-pink-100'}
              >
                <div className="space-y-2">
                  <GlowingButton
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm group"
                    onClick={() => alert('Export feature coming soon!')}
                  >
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2 inline" />
                    Download PDF
                  </GlowingButton>
                </div>
              </AnalyticsWidget>
            </div>
          </div>

          {/* Favorite Properties Section */}
          <div className={`mb-12 ${currentSection !== 'Favorites' ? 'hidden' : ''}`}>
            <div className="flex items-center mb-8">
              <div className="flex items-center">
                <div className={`p-3 rounded-2xl mr-4 ${darkMode
                  ? 'bg-gradient-to-r from-red-700 to-pink-800'
                  : 'bg-gradient-to-r from-red-500 to-pink-600'}`}>
                  <HeartSolidIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className={`text-3xl font-bold ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>Favorite Properties</h2>
                  <p className={`${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>Your saved rental listings</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <div className={`relative w-full sm:w-64 ${darkMode ? 'text-slate-200' : 'text-gray-700'}`}>
                  <input
                    type="text"
                    placeholder="Search properties..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-xl border ${darkMode
                      ? 'bg-slate-800 border-slate-700 focus:border-blue-500 text-slate-200'
                      : 'bg-white border-gray-300 focus:border-blue-500 text-gray-700'} focus:outline-none focus:ring-2 focus:ring-blue-500/40`}
                  />
                  <div className="absolute left-3 top-2.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleSort('price')}
                    className={`flex items-center px-3 py-2 rounded-lg border transition-colors duration-200 ${darkMode
                      ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
                      : 'bg-white border-gray-300 hover:bg-gray-100 text-gray-700'}`}
                  >
                    <span>Price</span>
                    {sortKey === 'price' && (
                      sortAsc ? <ChevronUpIcon className="h-4 w-4 ml-1" /> : <ChevronDownIcon className="h-4 w-4 ml-1" />
                    )}
                  </button>
                  <button
                    onClick={() => toggleSort('title')}
                    className={`flex items-center px-3 py-2 rounded-lg border transition-colors duration-200 ${darkMode
                      ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
                      : 'bg-white border-gray-300 hover:bg-gray-100 text-gray-700'}`}
                  >
                    <span>Name</span>
                    {sortKey === 'title' && (
                      sortAsc ? <ChevronUpIcon className="h-4 w-4 ml-1" /> : <ChevronDownIcon className="h-4 w-4 ml-1" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {paginatedProperties.map((property, index) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onView={() => setSelectedProperty(property)}
                  onRemove={removeFavourite}
                  removeConfirmId={removeConfirmId}
                  onConfirmRemove={confirmRemoveFavourite}
                  onCancelRemove={cancelRemoveFavourite}
                  index={index}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg transition-colors duration-200 ${darkMode
                      ? 'bg-slate-800 border border-slate-700 text-slate-200 disabled:opacity-50'
                      : 'bg-white border border-gray-300 text-gray-700 disabled:opacity-50'}`}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg transition-colors duration-200 ${darkMode
                        ? currentPage === page
                          ? 'bg-blue-700 text-white'
                          : 'bg-slate-800 border border-slate-700 text-slate-200'
                        : currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-700'}`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg transition-colors duration-200 ${darkMode
                      ? 'bg-slate-800 border border-slate-700 text-slate-200 disabled:opacity-50'
                      : 'bg-white border border-gray-300 text-gray-700 disabled:opacity-50'}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notifications Section */}
          <div className={`mb-12 ${currentSection !== 'Notifications' ? 'hidden' : ''}`}>
            <div className="flex items-center mb-8">
              <div className={`p-3 rounded-2xl mr-4 ${darkMode
                ? 'bg-gradient-to-r from-yellow-700 to-orange-800'
                : 'bg-gradient-to-r from-yellow-500 to-orange-600'}`}>
                <BellIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className={`text-3xl font-bold ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>Notifications</h2>
                <p className={`${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>Stay updated with important alerts</p>
              </div>
            </div>

            <div className="space-y-4">
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markNotificationAsRead}
                    onDelete={deleteNotification}
                    index={index}
                  />
                ))
              ) : (
                <div className={`text-center py-12 rounded-xl border ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-gray-50'}`}>
                  <BellIcon className={`h-16 w-16 mx-auto mb-4 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`} />
                  <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>No Notifications</h3>
                  <p className={`${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>You're all caught up!</p>
                </div>
              )}
            </div>
          </div>

          {/* Maintenance Section */}
          <div className={`mb-12 ${currentSection !== 'Maintenance' ? 'hidden' : ''}`}>
            <div className="flex items-center mb-8">
              <div className={`p-3 rounded-2xl mr-4 ${darkMode
                ? 'bg-gradient-to-r from-green-700 to-teal-800'
                : 'bg-gradient-to-r from-green-500 to-teal-600'}`}>
                <WrenchScrewdriverIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className={`text-3xl font-bold ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>Maintenance</h2>
                <p className={`${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>Request repairs and track maintenance issues</p>
              </div>
            </div>

            <div className={`rounded-2xl shadow-lg overflow-hidden border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
              <div className="p-8">
                <div className="mb-8">
                  <h3 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-slate-200' : 'text-gray-700'} flex items-center`}>
                    <WrenchScrewdriverIcon className={`h-6 w-6 mr-3 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                    Submit a Maintenance Request
                  </h3>
                  <div className="space-y-6">
                    {/* Issue Type Field with Icon */}
                    <div className="relative">
                      <label className={`block mb-2 font-medium ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                        Issue Type <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={maintenanceForm.issueType}
                          onChange={(e) => setMaintenanceForm({ ...maintenanceForm, issueType: e.target.value })}
                          className={`w-full p-4 pl-12 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500/40 ${darkMode
                            ? 'bg-slate-700 border-slate-600 text-slate-200 hover:border-green-500/50'
                            : 'bg-white border-gray-300 text-gray-700 hover:border-green-500/50'}`}
                        >
                          <option value="">Select issue type</option>
                          <option value="Plumbing">Plumbing</option>
                          <option value="Electrical">Electrical</option>
                          <option value="HVAC">Heating/Cooling</option>
                          <option value="Appliance">Appliance Repair</option>
                          <option value="Structural">Structural Issues</option>
                          <option value="Pest Control">Pest Control</option>
                          <option value="Other">Other</option>
                        </select>
                        <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                          <WrenchScrewdriverIcon className="h-5 w-5" />
                        </div>
                      </div>
                    </div>

                    {/* Priority Field with Visual Indicators */}
                    <div>
                      <label className={`block mb-2 font-medium ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                        Priority <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-4 gap-3">
                        <button
                          type="button"
                          onClick={() => setMaintenanceForm({ ...maintenanceForm, priority: 'Low' })}
                          className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 ${maintenanceForm.priority === 'Low'
                            ? (darkMode ? 'bg-blue-900/50 border-blue-700 ring-2 ring-blue-500' : 'bg-blue-100 border-blue-300 ring-2 ring-blue-500')
                            : (darkMode ? 'bg-slate-700 border-slate-600 hover:bg-slate-600' : 'bg-white border-gray-300 hover:bg-gray-100')}`}
                        >
                          <div className={`w-4 h-4 rounded-full mb-2 ${darkMode ? 'bg-blue-500' : 'bg-blue-600'}`}></div>
                          <span className={`text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-gray-700'}`}>Low</span>
                          <span className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Not urgent</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setMaintenanceForm({ ...maintenanceForm, priority: 'Medium' })}
                          className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 ${maintenanceForm.priority === 'Medium'
                            ? (darkMode ? 'bg-yellow-900/50 border-yellow-700 ring-2 ring-yellow-500' : 'bg-yellow-100 border-yellow-300 ring-2 ring-yellow-500')
                            : (darkMode ? 'bg-slate-700 border-slate-600 hover:bg-slate-600' : 'bg-white border-gray-300 hover:bg-gray-100')}`}
                        >
                          <div className={`w-4 h-4 rounded-full mb-2 ${darkMode ? 'bg-yellow-500' : 'bg-yellow-600'}`}></div>
                          <span className={`text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-gray-700'}`}>Medium</span>
                          <span className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Soon</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setMaintenanceForm({ ...maintenanceForm, priority: 'High' })}
                          className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 ${maintenanceForm.priority === 'High'
                            ? (darkMode ? 'bg-orange-900/50 border-orange-700 ring-2 ring-orange-500' : 'bg-orange-100 border-orange-300 ring-2 ring-orange-500')
                            : (darkMode ? 'bg-slate-700 border-slate-600 hover:bg-slate-600' : 'bg-white border-gray-300 hover:bg-gray-100')}`}
                        >
                          <div className={`w-4 h-4 rounded-full mb-2 ${darkMode ? 'bg-orange-500' : 'bg-orange-600'}`}></div>
                          <span className={`text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-gray-700'}`}>High</span>
                          <span className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Urgent</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setMaintenanceForm({ ...maintenanceForm, priority: 'Emergency' })}
                          className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 ${maintenanceForm.priority === 'Emergency'
                            ? (darkMode ? 'bg-red-900/50 border-red-700 ring-2 ring-red-500' : 'bg-red-100 border-red-300 ring-2 ring-red-500')
                            : (darkMode ? 'bg-slate-700 border-slate-600 hover:bg-slate-600' : 'bg-white border-gray-300 hover:bg-gray-100')}`}
                        >
                          <div className={`w-4 h-4 rounded-full mb-2 ${darkMode ? 'bg-red-500' : 'bg-red-600'}`}></div>
                          <span className={`text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-gray-700'}`}>Emergency</span>
                          <span className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Immediate</span>
                        </button>
                      </div>
                    </div>

                    {/* Description Field with Enhanced Textarea */}
                    <div>
                      <label className={`block mb-2 font-medium ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                        Description <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <textarea
                          value={maintenanceForm.description}
                          onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })}
                          placeholder="Describe the issue in detail..."
                          className={`w-full p-4 rounded-xl border resize-none transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500/40 ${darkMode
                            ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400 hover:border-green-500/50'
                            : 'bg-white border-gray-300 text-gray-700 placeholder-gray-400 hover:border-green-500/50'}`}
                          rows="5"
                        />
                        <div className={`absolute bottom-3 right-3 text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                          {maintenanceForm.description.length} / 500
                        </div>
                      </div>
                    </div>

                    {/* Upload Photos with Enhanced UI */}
                    <div>
                      <label className={`block mb-2 font-medium ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                        Upload Photos (Optional)
                      </label>
                      <div
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${darkMode
                          ? 'border-slate-600 bg-slate-700/30 hover:border-green-500/50 hover:bg-slate-700/50'
                          : 'border-gray-300 bg-gray-50 hover:border-green-500/50 hover:bg-gray-100/80'}`}
                      >
                        <DocumentArrowDownIcon className={`h-16 w-16 mx-auto mb-4 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                        <p className={`text-lg mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>Drag and drop files here</p>
                        <p className={`mb-4 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>or</p>
                        <input
                          type="file"
                          id="maintenance-photos"
                          className="hidden"
                          multiple
                          accept="image/*"
                          onChange={(e) => {
                            const files = Array.from(e.target.files);
                            if (files.length > 0) {
                              setMaintenanceForm({ ...maintenanceForm, photos: files });
                            }
                          }}
                        />
                        <label
                          htmlFor="maintenance-photos"
                          className={`px-6 py-3 rounded-xl text-sm inline-block cursor-pointer transition-all duration-300 ${darkMode
                            ? 'bg-green-700 hover:bg-green-600 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'}`}>
                          <div className="flex items-center">
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Browse Files
                          </div>
                        </label>
                        <p className={`mt-4 text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Maximum 5 photos, 5MB each</p>

                        {/* Photo Preview Section */}
                        {maintenanceForm.photos.length > 0 && (
                          <div className="mt-6 border-t pt-4 border-dashed border-gray-300">
                            <p className={`text-sm font-medium mb-3 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                              {maintenanceForm.photos.length} file(s) selected
                            </p>
                            <div className="flex flex-wrap gap-3 justify-center">
                              {Array.from(maintenanceForm.photos).map((file, index) => (
                                <div key={index} className="relative group">
                                  <div className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${darkMode ? 'border-slate-600' : 'border-gray-300'}`}>
                                    <img
                                      src={URL.createObjectURL(file)}
                                      alt={`Preview ${index}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newPhotos = Array.from(maintenanceForm.photos);
                                      newPhotos.splice(index, 1);
                                      setMaintenanceForm({ ...maintenanceForm, photos: newPhotos });
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                  >
                                    <XMarkIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Form Status Feedback */}
                    {formSubmitStatus.message && (
                      <div className={`p-4 rounded-xl text-center transition-all duration-300 ${formSubmitStatus.isError
                        ? (darkMode ? 'bg-red-900/30 text-red-300 border border-red-700' : 'bg-red-100 text-red-700 border border-red-300')
                        : formSubmitStatus.isSuccess
                          ? (darkMode ? 'bg-green-900/30 text-green-300 border border-green-700' : 'bg-green-100 text-green-700 border border-green-300')
                          : (darkMode ? 'bg-blue-900/30 text-blue-300 border border-blue-700' : 'bg-blue-100 text-blue-700 border border-blue-300')
                        }`}>
                        <div className="flex items-center justify-center">
                          {formSubmitStatus.isError && (
                            <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-500" />
                          )}
                          {formSubmitStatus.isSuccess && (
                            <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500" />
                          )}
                          {formSubmitStatus.isSubmitting && (
                            <div className="animate-spin h-5 w-5 mr-2 border-2 border-t-transparent rounded-full"></div>
                          )}
                          <span>{formSubmitStatus.message}</span>
                        </div>
                      </div>
                    )}

                    {/* Submit Button with Glowing Effect */}
                    <div className="pt-6">
                      <GlowingButton
                        onClick={handleMaintenanceSubmit}
                        disabled={formSubmitStatus.isSubmitting}
                        className={`w-full py-4 rounded-xl font-medium text-white flex items-center justify-center transition-all duration-300 ${darkMode
                          ? 'bg-gradient-to-r from-green-700 to-teal-700'
                          : 'bg-gradient-to-r from-green-600 to-teal-600'} ${formSubmitStatus.isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        glowColor="green"
                      >
                        {formSubmitStatus.isSubmitting ? (
                          <>
                            <div className="animate-spin h-5 w-5 mr-3 border-2 border-t-transparent rounded-full"></div>
                            Submitting...
                          </>
                        ) : (
                          <div className="flex items-center">
                            <CheckCircleIcon className="h-5 w-5 mr-2" />
                            <span>Submit Maintenance Request</span>
                          </div>
                        )}
                      </GlowingButton>
                      <p className={`text-center mt-3 text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                        Our team typically responds within 24-48 hours
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Enhanced Modals */}
        <Modal
          isOpen={!!selectedProperty}
          onClose={() => setSelectedProperty(null)}
          title="Property Details"
          size="lg"
        >
          {selectedProperty && (
            <div className="space-y-6">
              <div className="relative h-64 rounded-2xl overflow-hidden">
                <img
                  src={selectedProperty.image}
                  alt={selectedProperty.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-bold">{selectedProperty.title}</h3>
                  <p className="text-lg">{selectedProperty.price}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className={`font-semibold mb-3 flex items-center ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                    <SparklesIcon className={`h-5 w-5 mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    Details
                  </h4>
                  <div className={`space-y-2 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                    <p>{selectedProperty.location}</p>
                    <p>{selectedProperty.bedrooms} bed • {selectedProperty.bathrooms} bath</p>
                  </div>
                </div>
                <div>
                  <h4 className={`font-semibold mb-3 ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>Actions</h4>
                  <div className="space-y-3">
                    <GlowingButton
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl group"
                      onClick={() => alert('Schedule visit feature coming soon!')}
                    >
                      Schedule Visit
                    </GlowingButton>
                    <button className={`w-full py-3 rounded-xl transition-colors duration-300 ${darkMode ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}>
                      Contact Landlord
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>

        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Property"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Property Title"
                value={newProperty.title}
                onChange={(e) => setNewProperty(prev => ({ ...prev, title: e.target.value }))}
                className={`border-2 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 ${darkMode ? 'border-slate-600 bg-slate-700 text-slate-200' : 'border-gray-200 bg-white text-gray-700'}`}
              />
              <input
                type="text"
                placeholder="Location"
                value={newProperty.location}
                onChange={(e) => setNewProperty(prev => ({ ...prev, location: e.target.value }))}
                className={`border-2 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 ${darkMode ? 'border-slate-600 bg-slate-700 text-slate-200' : 'border-gray-200 bg-white text-gray-700'}`}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Price (e.g., $1,200/month)"
                value={newProperty.price}
                onChange={(e) => setNewProperty(prev => ({ ...prev, price: e.target.value }))}
                className={`border-2 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 ${darkMode ? 'border-slate-600 bg-slate-700 text-slate-200' : 'border-gray-200 bg-white text-gray-700'}`}
              />
              <input
                type="number"
                placeholder="Bedrooms"
                value={newProperty.bedrooms}
                onChange={(e) => setNewProperty(prev => ({ ...prev, bedrooms: parseInt(e.target.value) || 0 }))}
                className={`border-2 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 ${darkMode ? 'border-slate-600 bg-slate-700 text-slate-200' : 'border-gray-200 bg-white text-gray-700'}`}
              />
              <input
                type="number"
                placeholder="Bathrooms"
                value={newProperty.bathrooms}
                onChange={(e) => setNewProperty(prev => ({ ...prev, bathrooms: parseInt(e.target.value) || 0 }))}
                className={`border-2 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 ${darkMode ? 'border-slate-600 bg-slate-700 text-slate-200' : 'border-gray-200 bg-white text-gray-700'}`}
              />
            </div>
            <div className="flex justify-end space-x-4 pt-6">
              <button
                className={`px-6 py-3 rounded-xl transition-all duration-300 ${darkMode ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </button>
              <GlowingButton
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl group"
                onClick={handleAddProperty}
              >
                Add Property
              </GlowingButton>
            </div>
          </div>
        </Modal>
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotateZ(0deg); }
          33% { transform: translateY(-10px) rotateZ(1deg); }
          66% { transform: translateY(5px) rotateZ(-1deg); }
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
        
        /* Custom Scrollbar Styling */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${darkMode ? '#1e293b' : '#f1f5f9'};
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${darkMode ? 'linear-gradient(45deg, #1d4ed8, #7e22ce)' : 'linear-gradient(45deg, #3b82f6, #8b5cf6)'};
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? 'linear-gradient(45deg, #2563eb, #9333ea)' : 'linear-gradient(45deg, #2563eb, #7c3aed)'};
        }
      `}</style>
    </div>
  );
};

export default TenantDashboard;