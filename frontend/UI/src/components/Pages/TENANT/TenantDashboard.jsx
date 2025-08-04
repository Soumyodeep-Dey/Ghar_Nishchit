import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

const GlowingButton = ({ children, onClick, className = '', glowColor = 'blue' }) => {
  return (
    <button
      onClick={onClick}
      className={`relative overflow-hidden transform transition-all duration-300 hover:scale-105 ${className}`}
    >
      <div className={`absolute inset-0 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity bg-gradient-to-r ${
        glowColor === 'blue' ? 'from-blue-500 to-purple-600' :
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

  return (
    <div
      ref={setRef}
      className={`transform transition-all duration-700 ease-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <FloatingCard delay={index * 200}>
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group hover:scale-105 border border-gray-100">
          <div className="relative overflow-hidden">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse"></div>
            )}
            <img
              src={property.image}
              alt={property.title}
              className={`w-full h-48 object-cover transition-all duration-700 group-hover:scale-110 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Floating Action Buttons */}
            <div className="absolute top-4 right-4 space-y-2">
              <button
                className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300"
                onClick={() => onView(property)}
                aria-label={`View details of ${property.title}`}
              >
                <EyeIcon className="h-5 w-5 text-blue-600" />
              </button>
            </div>

            {/* Price Badge */}
            <div className="absolute bottom-4 left-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full font-semibold shadow-lg">
              {property.price}
            </div>
          </div>
          
          <div className="p-6">
            <h3 className="font-bold text-xl text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">
              {property.title}
            </h3>
            <p className="text-gray-600 mb-3 flex items-center">
              <SparklesIcon className="h-4 w-4 mr-2 text-yellow-500" />
              {property.location}
            </p>
            <p className="text-gray-500 text-sm mb-4">{property.bedrooms} bed • {property.bathrooms} bath</p>
            
            <div className="flex justify-between items-center">
              {removeConfirmId === property.id ? (
                <div className="flex space-x-2">
                  <GlowingButton
                    onClick={() => onRemove(property.id)}
                    className="bg-red-600 text-white text-sm px-4 py-2 rounded-lg group"
                    glowColor="red"
                  >
                    Confirm
                  </GlowingButton>
                  <button
                    onClick={onCancelRemove}
                    className="bg-gray-200 text-gray-700 text-sm px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onConfirmRemove(property.id)}
                  className="text-red-500 hover:text-red-700 transition-colors duration-200 p-2 hover:scale-110"
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

  const notificationTypeIcon = {
    maintenance: <WrenchScrewdriverIcon className="h-6 w-6 text-orange-500" />,
    payment: <CreditCardIcon className="h-6 w-6 text-purple-500" />,
    general: <BellIcon className="h-6 w-6 text-yellow-500" />,
  };

  const bgGradient = {
    maintenance: 'from-orange-50 to-red-50',
    payment: 'from-purple-50 to-pink-50',
    general: 'from-yellow-50 to-orange-50',
  };

  return (
    <div
      ref={setRef}
      className={`transform transition-all duration-500 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div
        className={`relative p-4 rounded-xl border-l-4 cursor-pointer transition-all duration-300 shadow-md hover:shadow-xl bg-gradient-to-r ${
          bgGradient[notification.type]
        } ${
          notification.read ? 'border-gray-300' : 'border-blue-500 animate-pulse'
        } hover:scale-105 group`}
        onClick={() => onMarkAsRead(notification.id)}
      >
        <div className="flex items-start">
          <div className="p-2 rounded-full bg-white shadow-md group-hover:scale-110 transition-transform duration-300">
            {notificationTypeIcon[notification.type]}
          </div>
          <div className="flex-1 ml-4">
            <h4 className="font-semibold text-gray-800 mb-1">{notification.title}</h4>
            <p className="text-gray-600 text-sm">{notification.message}</p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">{notification.time}</span>
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
            className="ml-2 text-gray-400 hover:text-red-600 p-2 hover:scale-110 transition-all duration-200"
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
      className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'} transform transition-all duration-500 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      <div className={`max-w-xs p-4 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 ${
        message.isOwn 
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

  return (
    <div
      ref={setRef}
      className={`transform transition-all duration-500 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-white/50 ${className}`}>
        <div className="flex items-center mb-4">
          {icon && <div className="p-2 rounded-lg bg-white/50 mr-3">{icon}</div>}
          <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
        </div>
        {children}
      </div>
    </div>
  );
});

const Modal = React.memo(({ isOpen, onClose, title, children, size = "md" }) => {
  const [isClosing, setIsClosing] = useState(false);

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
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isOpen && !isClosing ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      onClick={handleClose}
    >
      <div 
        className={`bg-white rounded-2xl shadow-2xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto m-4 transform transition-all duration-300 ${
          isOpen && !isClosing ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 hover:scale-110"
              aria-label={`Close ${title}`}
            >
              <XMarkIcon className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
});

// Main Component
const TenantDashboard = () => {
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

  const sendMessage = useCallback(() => {
    if (newMessage.trim() || attachments.length) {
      const message = {
        id: Date.now(),
        sender: "You",
        message: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true,
        status: "Sent",
        attachments: attachments,
      };
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      setAttachments([]);
    }
  }, [newMessage, attachments, setMessages]);

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

  // Loading screen
  if (isLoading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-32 h-32 border-8 border-blue-200 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-32 h-32 border-8 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mt-8 animate-pulse">Loading Dashboard...</h2>
            <p className="text-gray-600 mt-2">Preparing your personalized experience</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
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
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm"></div>
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
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-3xl font-bold mb-1">
                            <AnimatedCounter value={favouriteProperties.length} />
                          </div>
                          <div className="text-blue-100">Favorite Properties</div>
                        </div>
                        <HeartSolidIcon className="h-12 w-12 text-red-400 animate-pulse" />
                      </div>
                    </div>
                  </FloatingCard>

                  <FloatingCard delay={200}>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-3xl font-bold mb-1">
                            <AnimatedCounter value={analyticsData.unreadNotifications} />
                          </div>
                          <div className="text-blue-100">New Notifications</div>
                        </div>
                        <BellIcon className="h-12 w-12 text-yellow-400 animate-bounce" />
                      </div>
                    </div>
                  </FloatingCard>

                  <FloatingCard delay={400}>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-3xl font-bold mb-1">
                            <AnimatedCounter value={analyticsData.pendingRequests} />
                          </div>
                          <div className="text-blue-100">Pending Requests</div>
                        </div>
                        <ClockIcon className="h-12 w-12 text-orange-400 animate-pulse" />
                      </div>
                    </div>
                  </FloatingCard>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Analytics Section */}
          <div className="mb-12">
            <div className="flex items-center mb-8">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mr-4">
                <ChartBarIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Analytics Overview</h2>
                <p className="text-gray-600">Track your rental insights and trends</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnalyticsWidget 
                title="Monthly Rent Trend" 
                icon={<ArrowTrendingUpIcon className="h-6 w-6 text-blue-600" />}
                gradient="from-blue-50 to-indigo-100"
              >
                <ResponsiveContainer width="100%" height={120}>
                  <AreaChart data={analyticsData.monthlyRentData}>
                    <defs>
                      <linearGradient id="rentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(value), 'Rent']}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
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
                icon={<CurrencyDollarIcon className="h-6 w-6 text-green-600" />}
                gradient="from-green-50 to-emerald-100"
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
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </AnalyticsWidget>

              <AnalyticsWidget 
                title="Maintenance Status" 
                icon={<WrenchScrewdriverIcon className="h-6 w-6 text-orange-600" />}
                gradient="from-orange-50 to-red-100"
              >
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={analyticsData.maintenanceTimelineData}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </AnalyticsWidget>

              <AnalyticsWidget 
                title="Total Paid This Year" 
                icon={<TrophyIcon className="h-6 w-6 text-yellow-600" />}
                gradient="from-yellow-50 to-orange-100"
              >
                <div className="text-3xl font-bold text-green-600 mb-2">
                  <AnimatedCounter value={analyticsData.totalPaid} prefix="$" />
                </div>
                <div className="text-sm text-gray-600">
                  +12% from last year
                </div>
              </AnalyticsWidget>

              <AnalyticsWidget 
                title="Notifications Summary" 
                icon={<BellIcon className="h-6 w-6 text-purple-600" />}
                gradient="from-purple-50 to-pink-100"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Read</span>
                    <span className="font-bold text-green-600">
                      <AnimatedCounter value={analyticsData.readNotifications} />
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Unread</span>
                    <span className="font-bold text-yellow-600">
                      <AnimatedCounter value={analyticsData.unreadNotifications} />
                    </span>
                  </div>
                </div>
              </AnalyticsWidget>

              <AnalyticsWidget 
                title="Quick Actions" 
                icon={<FireIcon className="h-6 w-6 text-red-600" />}
                gradient="from-red-50 to-pink-100"
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

          {/* Enhanced Properties and Other Sections */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
            {/* Favourite Properties Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/50">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl mr-4">
                    <HeartSolidIcon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Favourite Properties</h2>
                    <p className="text-gray-600">Your saved property listings</p>
                  </div>
                </div>
                <GlowingButton
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-xl group"
                >
                  <PlusIcon className="h-6 w-6" />
                </GlowingButton>
              </div>

              {/* Search and Sort */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search favorites..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                />
              </div>

              {paginatedProperties.length === 0 ? (
                <div className="text-center py-12">
                  <ExclamationTriangleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-bounce" />
                  <p className="text-gray-600 text-lg">No favorite properties found</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {paginatedProperties.map((property, index) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      onView={setSelectedProperty}
                      onRemove={removeFavourite}
                      removeConfirmId={removeConfirmId}
                      onConfirmRemove={confirmRemoveFavourite}
                      onCancelRemove={cancelRemoveFavourite}
                      index={index}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 space-x-4">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-6 py-3 rounded-xl border border-gray-300 bg-white disabled:opacity-50 hover:bg-gray-50 hover:scale-105 transition-all duration-300 disabled:hover:scale-100"
                  >
                    Previous
                  </button>
                  <span className="px-6 py-3 rounded-xl border border-gray-300 bg-gradient-to-r from-blue-100 to-purple-100 font-semibold">
                    {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-6 py-3 rounded-xl border border-gray-300 bg-white disabled:opacity-50 hover:bg-gray-50 hover:scale-105 transition-all duration-300 disabled:hover:scale-100"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {/* Notifications Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/50">
              <div className="flex items-center mb-8">
                <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl mr-4">
                  <BellIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
                  <p className="text-gray-600">Stay updated with important alerts</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {notifications.map((notification, index) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markNotificationAsRead}
                    onDelete={deleteNotification}
                    index={index}
                  />
                ))}
              </div>
            </div>

            {/* Messages Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/50 xl:col-span-2">
              <div className="flex items-center mb-8">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl mr-4">
                  <ChatBubbleLeftRightIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Messages</h2>
                  <p className="text-gray-600">Chat with your landlord</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl p-6 h-80 overflow-y-auto mb-6 border border-gray-200 custom-scrollbar">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <MessageBubble key={message.id} message={message} index={index} />
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="max-w-xs p-4 rounded-2xl bg-white border border-gray-200 text-gray-600 animate-pulse">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-4 items-end">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 border-2 border-gray-200 rounded-xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <input
                  type="file"
                  multiple
                  onChange={(e) => setAttachments(Array.from(e.target.files))}
                  className="hidden"
                  id="attachment-input"
                />
                <label htmlFor="attachment-input" className="cursor-pointer bg-gray-200 p-4 rounded-xl hover:bg-gray-300 transition-all duration-300 hover:scale-105">
                  📎
                </label>
                <GlowingButton
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl group"
                  onClick={sendMessage}
                >
                  Send
                </GlowingButton>
              </div>
              
              {attachments.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {attachments.map((file, idx) => (
                    <div key={idx} className="bg-blue-100 px-3 py-2 rounded-lg text-sm text-blue-800 border border-blue-200">
                      {file.name}
                    </div>
                  ))}
                </div>
              )}
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
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <SparklesIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Details
                  </h4>
                  <div className="space-y-2 text-gray-600">
                    <p>{selectedProperty.location}</p>
                    <p>{selectedProperty.bedrooms} bed • {selectedProperty.bathrooms} bath</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Actions</h4>
                  <div className="space-y-3">
                    <GlowingButton
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl group"
                      onClick={() => alert('Schedule visit feature coming soon!')}
                    >
                      Schedule Visit
                    </GlowingButton>
                    <button className="w-full bg-gray-100 text-gray-800 py-3 rounded-xl hover:bg-gray-200 transition-colors duration-300">
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
                className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
              />
              <input
                type="text"
                placeholder="Location"
                value={newProperty.location}
                onChange={(e) => setNewProperty(prev => ({ ...prev, location: e.target.value }))}
                className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Price (e.g., $1,200/month)"
                value={newProperty.price}
                onChange={(e) => setNewProperty(prev => ({ ...prev, price: e.target.value }))}
                className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
              />
              <input
                type="number"
                placeholder="Bedrooms"
                value={newProperty.bedrooms}
                onChange={(e) => setNewProperty(prev => ({ ...prev, bedrooms: parseInt(e.target.value) || 0 }))}
                className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
              />
              <input
                type="number"
                placeholder="Bathrooms"
                value={newProperty.bathrooms}
                onChange={(e) => setNewProperty(prev => ({ ...prev, bathrooms: parseInt(e.target.value) || 0 }))}
                className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
              />
            </div>
            <div className="flex justify-end space-x-4 pt-6">
              <button
                className="bg-gray-200 text-gray-800 px-6 py-3 rounded-xl hover:bg-gray-300 transition-all duration-300"
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

      {/* Custom Styles - FIXED: Removed jsx attribute */}
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
          background: #f1f5f9;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #2563eb, #7c3aed);
        }
      `}</style>
    </div>
  );
};

export default TenantDashboard;