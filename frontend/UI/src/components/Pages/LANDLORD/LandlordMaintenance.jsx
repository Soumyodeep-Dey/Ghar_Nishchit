import React, { useState, useEffect, useRef, useMemo } from 'react';
import LandlordSideBar from './LandlordSideBar';
import LandlordNavBar from './LandlordNavBar';
import { useDarkMode } from '../../../DarkModeContext';
// Removed SidebarContext usage
import { 
  Wrench, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Upload, 
  Calendar, 
  MapPin, 
  User, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Pause, 
  Play, 
  FileText, 
  Image as ImageIcon, 
  Camera, 
  Download, 
  Share2, 
  Copy, 
  Phone, 
  Mail, 
  MessageCircle, 
  Star, 
  Flag, 
  Bookmark, 
  Archive, 
  RefreshCw,
  Bell, 
  BellOff, 
  Settings, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Activity, 
  DollarSign, 
  Home, 
  Building2, 
  Users, 
  Zap, 
  Hammer, 
  Paintbrush, 
  Droplets, 
  Thermometer, 
  Shield, 
  Lock, 
  Key, 
  Lightbulb, 
  Wifi, 
  Tv, 
  AirVent, 
  Wind, 
  Snowflake, 
  Sun, 
  Moon, 
  Battery, 
  Plug, 
  Router, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Laptop, 
  HardDrive, 
  Cpu, 
  MemoryStick, 
  Database, 
  Server, 
  Globe, 
  Link, 
  ExternalLink, 
  Send, 
  Reply, 
  Forward, 
  Paperclip, 
  Smile, 
  Heart, 
  ThumbsUp, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  X, 
  Check, 
  Loader, 
  Save, 
  Undo, 
  Redo, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Navigation, 
  Compass, 
  Map, 
  Route, 
  Car, 
  Truck, 
  Bus, 
  Train, 
  Plane, 
  Ship, 
  Bike,
  // Removed 'Scooter' and 'Skateboard' as they don't exist in Lucide
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


// Custom Hooks
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

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

const useNotification = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { ...notification, id }]);
    
    setTimeout(() => {
      removeNotification(id);
    }, notification.duration || 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return { notifications, addNotification, removeNotification };
};

// Animated Components
const AnimatedCard = ({ children, delay = 0, className = '', ...props }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ 
        duration: 0.5, 
        delay, 
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Progress Bar Component
const ProgressBar = ({ progress, status, animated = true }) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setAnimatedProgress(progress), 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedProgress(progress);
    }
  }, [progress, animated]);

  const getProgressColor = () => {
    if (status === 'Completed') return 'from-green-500 to-emerald-600';
    if (status === 'In Progress') return 'from-blue-500 to-purple-600';
    if (status === 'On Hold') return 'from-yellow-500 to-orange-600';
    return 'from-gray-400 to-gray-500';
  };

  return (
    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
      <motion.div
        className={`h-full bg-gradient-to-r ${getProgressColor()} rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${animatedProgress}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status, priority, darkMode }) => { // Added darkMode prop
  const getStatusConfig = () => {
    switch (status) {
      case 'Pending':
        return { 
          bg: darkMode ? 'bg-yellow-600' : 'bg-yellow-100', 
          text: darkMode ? 'text-white' : 'text-yellow-800', 
          border: darkMode ? 'border-yellow-600' : 'border-yellow-100', // Border matches background for solid look
          icon: Clock 
        };
      case 'In Progress':
        return { 
          bg: darkMode ? 'bg-blue-600' : 'bg-blue-100', 
          text: darkMode ? 'text-white' : 'text-blue-800', 
          border: darkMode ? 'border-blue-600' : 'border-blue-100',
          icon: Play 
        };
      case 'On Hold':
        return { 
          bg: darkMode ? 'bg-orange-600' : 'bg-orange-100', 
          text: darkMode ? 'text-white' : 'text-orange-800', 
          border: darkMode ? 'border-orange-600' : 'border-orange-100',
          icon: Pause 
        };
      case 'Completed':
        return { 
          bg: darkMode ? 'bg-emerald-600' : 'bg-emerald-100', 
          text: darkMode ? 'text-white' : 'text-emerald-800', 
          border: darkMode ? 'border-emerald-600' : 'border-emerald-100',
          icon: CheckCircle 
        };
      case 'Cancelled':
        return { 
          bg: darkMode ? 'bg-red-600' : 'bg-red-100', 
          text: darkMode ? 'text-white' : 'text-red-800', 
          border: darkMode ? 'border-red-600' : 'border-red-100',
          icon: XCircle 
        };
      default:
        return { 
          bg: darkMode ? 'bg-gray-600' : 'bg-gray-100', 
          text: darkMode ? 'text-white' : 'text-gray-800', 
          border: darkMode ? 'border-gray-600' : 'border-gray-100',
          icon: AlertCircle 
        };
    }
  };

  const getPriorityConfig = () => {
    switch (priority) {
      case 'High':
        return { bg: 'bg-red-500', pulse: 'animate-pulse' };
      case 'Medium':
        return { bg: 'bg-yellow-500', pulse: '' };
      case 'Low':
        return { bg: 'bg-green-500', pulse: '' };
      default:
        return { bg: 'bg-gray-500', pulse: '' };
    }
  };

  const statusConfig = getStatusConfig();
  const priorityConfig = getPriorityConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div className="flex items-center space-x-2">
      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
        <StatusIcon className="w-3 h-3" />
        <span>{status}</span>
      </div>
      {priority && (
        <div className={`w-2 h-2 rounded-full ${priorityConfig.bg} ${priorityConfig.pulse}`} title={`${priority} Priority`} />
      )}
    </div>
  );
};

// Priority Indicator Component
const PriorityIndicator = ({ priority }) => {
  const getPriorityColor = () => {
    switch (priority) {
      case 'High':
        return 'text-red-400';
      case 'Medium':
        return 'text-yellow-400';
      case 'Low':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const getPriorityIcon = () => {
    switch (priority) {
      case 'High':
        return <AlertCircle className={`w-4 h-4 ${getPriorityColor()} animate-pulse`} />;
      case 'Medium':
        return <AlertCircle className={`w-4 h-4 ${getPriorityColor()}`} />;
      case 'Low':
        return <CheckCircle className={`w-4 h-4 ${getPriorityColor()}`} />;
      default:
        return <AlertCircle className={`w-4 h-4 ${getPriorityColor()}`} />;
    }
  };

  return (
    <div className="flex items-center space-x-1">
      {getPriorityIcon()}
      <span className={`text-xs font-medium ${getPriorityColor()}`}>
        {priority}
      </span>
    </div>
  );
};

// Request Card Component
const MaintenanceRequestCard = ({ request, onEdit, onView, onDelete, onStatusChange, onAssign, delay = 0 }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const menuRef = useRef(null);
  const { darkMode } = useDarkMode();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'plumbing':
        return <Droplets className="w-5 h-5 text-blue-400" />;
      case 'electrical':
        return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'hvac':
        return <AirVent className="w-5 h-5 text-purple-400" />;
      case 'appliance':
        return <Monitor className="w-5 h-5 text-green-400" />;
      case 'structural':
        return <Home className="w-5 h-5 text-orange-400" />;
      case 'security':
        return <Shield className="w-5 h-5 text-red-400" />;
      default:
        return <Wrench className="w-5 h-5 text-gray-400" />;
    }
  };

  const getUrgencyColor = () => {
    const daysSince = Math.floor((Date.now() - new Date(request.createdAt)) / (1000 * 60 * 60 * 24));
    if (request.priority === 'High' && daysSince > 1) return 'border-red-500/50 bg-red-500/5';
    if (request.priority === 'Medium' && daysSince > 3) return 'border-yellow-500/50 bg-yellow-500/5';
    return darkMode ? 'border-white/20' : 'border-indigo-200/50';
  };

  const isHighlighted = request.title === "Heating System Malfunction";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${darkMode ? 'bg-white/10' : 'bg-white/80'} 
                  backdrop-blur-xl 
                  border 
                  ${isHighlighted ? (darkMode ? 'border-yellow-400' : 'border-amber-500') : getUrgencyColor()} 
                  rounded-2xl 
                  p-6 
                  shadow-xl 
                  ${isHighlighted ? (darkMode ? 'shadow-yellow-400/20' : 'shadow-amber-500/20') : ''}
                  hover:shadow-2xl 
                  transition-all 
                  duration-500 
                  group 
                  relative 
                  overflow-hidden`}
    >
      {/* Background Gradient Effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${darkMode ? 'from-white/5' : 'from-indigo-200/20'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      {/* Header */}
      <div className="relative z-10 flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={`p-2 rounded-lg ${darkMode ? 'bg-white/10' : 'bg-indigo-100/50'}`}
          >
            {getCategoryIcon(request.category)}
          </motion.div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white group-hover:text-blue-300' : 'text-indigo-900 group-hover:text-blue-600'} transition-colors`}>
                {request.title}
              </h3>
              {request.isEmergency && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="px-2 py-1 bg-red-500/20 rounded-full"
                >
                  <span className="text-xs text-red-300 font-bold">EMERGENCY</span>
                </motion.div>
              )}
            </div>
            
            <p className={`text-sm mb-2 line-clamp-2 ${darkMode ? 'text-white/70' : 'text-indigo-700/80'}`}>
              {request.description}
            </p>
            
            <div className={`flex items-center space-x-4 text-xs ${darkMode ? 'text-white/60' : 'text-indigo-600/70'}`}>
              <div className="flex items-center space-x-1">
                <Building2 className="w-3 h-3" />
                <span>{request.property}</span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>{request.tenant}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(request.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative" ref={menuRef}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowMenu(!showMenu)}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-white/10' : 'hover:bg-indigo-100/50'} transition-colors opacity-0 group-hover:opacity-100`}
          >
            <MoreVertical className={`w-4 h-4 ${darkMode ? 'text-white/70' : 'text-indigo-600/70'}`} />
          </motion.button>
          
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className={`absolute right-0 top-full mt-2 w-56 ${darkMode ? 'bg-white/20 border-white/30' : 'bg-white/90 border-indigo-200/50'} backdrop-blur-xl border rounded-xl shadow-xl z-50`}
              >
                <div className="p-2">
                  <button 
                    onClick={() => { onView(request); setShowMenu(false); }}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg ${darkMode ? 'hover:bg-white/10 text-white/80' : 'hover:bg-indigo-100/50 text-indigo-700'} transition-colors`}
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                  <button 
                    onClick={() => { onEdit(request); setShowMenu(false); }}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg ${darkMode ? 'hover:bg-white/10 text-white/80' : 'hover:bg-indigo-100/50 text-indigo-700'} transition-colors`}
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Request</span>
                  </button>
                  <button className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg ${darkMode ? 'hover:bg-white/10 text-white/80' : 'hover:bg-indigo-100/50 text-indigo-700'} transition-colors`}>
                    <MessageCircle className="w-4 h-4" />
                    <span>Contact Tenant</span>
                  </button>
                  <button className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg ${darkMode ? 'hover:bg-white/10 text-white/80' : 'hover:bg-indigo-100/50 text-indigo-700'} transition-colors`}>
                    <Share2 className="w-4 h-4" />
                    <span>Share Report</span>
                  </button>
                  <button 
                    onClick={() => { onDelete(request.id); setShowMenu(false); }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-red-500/20 transition-colors text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Request</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Status and Priority */}
      <div className="relative z-10 flex items-center justify-between mb-4">
        <StatusBadge status={request.status} priority={request.priority} darkMode={darkMode} />
        <PriorityIndicator priority={request.priority} />
      </div>
      
      {/* Progress Bar */}
      <div className="relative z-10 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs ${darkMode ? 'text-white/60' : 'text-indigo-600/70'}`}>Progress</span>
          <span className={`text-xs font-medium ${darkMode ? 'text-white/80' : 'text-indigo-800'}`}>{request.progress}%</span>
        </div>
        <ProgressBar progress={request.progress} status={request.status} />
      </div>
      
      {/* Assignment */}
      {request.assignedTo && (
        <div className={`relative z-10 mb-4 p-3 rounded-lg border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-indigo-50/50 border-indigo-100'}`}>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs text-white font-semibold">
              {request.assignedTo.charAt(0)}
            </div>
            <div>
              <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-indigo-900'}`}>Assigned to</div>
              <div className={`text-xs ${darkMode ? 'text-white/60' : 'text-indigo-600/70'}`}>{request.assignedTo}</div>
            </div>
            <div className="ml-auto flex items-center space-x-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`p-1 rounded ${darkMode ? 'hover:bg-white/10' : 'hover:bg-indigo-100/70'}`}
              >
                <Phone className={`w-3 h-3 ${darkMode ? 'text-white/60' : 'text-indigo-600/70'}`} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`p-1 rounded ${darkMode ? 'hover:bg-white/10' : 'hover:bg-indigo-100/70'}`}
              >
                <MessageCircle className={`w-3 h-3 ${darkMode ? 'text-white/60' : 'text-indigo-600/70'}`} />
              </motion.button>
            </div>
          </div>
        </div>
      )}
      
      {/* Attachments Preview */}
      {request.attachments && request.attachments.length > 0 && (
        <div className="relative z-10 mb-4">
          <div className={`text-xs mb-2 ${darkMode ? 'text-white/60' : 'text-indigo-600/70'}`}>Attachments ({request.attachments.length})</div>
          <div className="flex space-x-2">
            {request.attachments.slice(0, 3).map((attachment, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className={`w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer ${darkMode ? 'bg-white/10' : 'bg-indigo-100/50'}`}
              >
                {attachment.type === 'image' ? (
                  <img 
                    src={attachment.url} 
                    alt="Attachment" 
                    className="w-full h-full object-cover rounded-lg" 
                  />
                ) : (
                  <FileText className={`w-5 h-5 ${darkMode ? 'text-white/60' : 'text-indigo-600/70'}`} />
                )}
              </motion.div>
            ))}
            {request.attachments.length > 3 && (
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xs ${darkMode ? 'bg-white/10 text-white/60' : 'bg-indigo-100/50 text-indigo-600/70'}`}>
                +{request.attachments.length - 3}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Quick Actions */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onView(request)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              darkMode
                ? 'bg-sky-500/20 text-sky-300 hover:bg-sky-500/30'
                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            }`}
          >
            View Details
          </motion.button>
          
          {request.status !== 'Completed' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onStatusChange(request.id, 'In Progress')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                darkMode
                  ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                  : 'bg-green-100 text-green-600 hover:bg-green-200'
              }`}
            >
              Start Work
            </motion.button>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`text-xs ${darkMode ? 'text-white/40' : 'text-indigo-500/60'}`}>
            {Math.floor((Date.now() - new Date(request.createdAt)) / (1000 * 60 * 60 * 24))}d ago
          </div>
          {request.isUrgent && (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Flag className="w-4 h-4 text-red-400" />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Detailed Request Modal Component
const RequestDetailModal = ({ isOpen, onClose, request, onUpdate, onAddComment, onUpdateStatus }) => {
  const [newComment, setNewComment] = useState('');
  const [newStatus, setNewStatus] = useState(request?.status || '');
  const [attachments, setAttachments] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const fileInputRef = useRef(null);
  const { darkMode } = useDarkMode();

  useEffect(() => {
    setNewStatus(request?.status || '');
  }, [request]);

  if (!isOpen || !request) return null;

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(request.id, {
        text: newComment,
        author: 'Landlord',
        timestamp: new Date().toISOString(),
        attachments: attachments
      });
      setNewComment('');
      setAttachments([]);
    }
  };

  const handleStatusUpdate = () => {
    if (newStatus !== request.status) {
      onUpdateStatus(request.id, newStatus);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      type: file.type.startsWith('image/') ? 'image' : 'file',
      url: URL.createObjectURL(file),
      file
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`${darkMode ? 'bg-white/10 border-white/20' : 'bg-white/90 border-indigo-200/50'} backdrop-blur-xl border rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 border-b ${darkMode ? 'border-white/20' : 'border-indigo-200/50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl ${darkMode ? 'bg-white/10' : 'bg-indigo-100/50'}`}>
                <Wrench className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-indigo-900'}`}>{request.title}</h2>
                <div className={`flex items-center space-x-4 mt-1 ${darkMode ? 'text-white/60' : 'text-indigo-700/70'}`}>
                  <span>Request #{request.id}</span>
                  <span>•</span>
                  <span>Created {new Date(request.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <StatusBadge status={request.status} priority={request.priority} />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-white/10' : 'hover:bg-indigo-100'} transition-colors`}
              >
                <X className={`w-6 h-6 ${darkMode ? 'text-white/70' : 'text-indigo-700'}`} />
              </motion.button>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className={`flex space-x-1 mt-6 ${darkMode ? 'bg-white/5' : 'bg-indigo-100/70'} p-1 rounded-xl`}>
            {[
              { key: 'overview', label: 'Overview', icon: Eye },
              { key: 'comments', label: 'Comments', icon: MessageCircle },
              { key: 'history', label: 'History', icon: Clock },
              { key: 'attachments', label: 'Attachments', icon: Paperclip }
            ].map(({ key, label, icon: Icon }) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(key)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === key
                    ? 'bg-blue-500 text-white shadow-lg'
                    : darkMode 
                      ? 'text-white/70 hover:text-white hover:bg-white/10'
                      : 'text-indigo-700 hover:text-indigo-900 hover:bg-indigo-200/70'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Request Details */}
              <div className="space-y-6">
                <div className={`${darkMode ? 'bg-white/5 border-white/10' : 'bg-indigo-100 border-indigo-200'} rounded-xl p-6 border`}>
                  <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-indigo-900'} mb-4`}>Request Details</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className={`text-sm font-medium ${darkMode ? 'text-white/70' : 'text-indigo-700/70'}`}>Description</label>
                      <p className={`${darkMode ? 'text-white' : 'text-indigo-900'} mt-1`}>{request.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`text-sm font-medium ${darkMode ? 'text-white/70' : 'text-indigo-700/70'}`}>Property</label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Building2 className={`w-4 h-4 ${darkMode ? 'text-white/60' : 'text-indigo-600/70'}`} />
                          <span className={`${darkMode ? 'text-white' : 'text-indigo-900'}`}>{request.property}</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className={`text-sm font-medium ${darkMode ? 'text-white/70' : 'text-indigo-700/70'}`}>Tenant</label>
                        <div className="flex items-center space-x-2 mt-1">
                          <User className={`w-4 h-4 ${darkMode ? 'text-white/60' : 'text-indigo-600/70'}`} />
                          <span className={`${darkMode ? 'text-white' : 'text-indigo-900'}`}>{request.tenant}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`text-sm font-medium ${darkMode ? 'text-white/70' : 'text-indigo-700/70'}`}>Priority</label>
                        <div className="mt-1">
                          <PriorityIndicator priority={request.priority} />
                        </div>
                      </div>
                      
                      <div>
                        <label className={`text-sm font-medium ${darkMode ? 'text-white/70' : 'text-indigo-700/70'}`}>Category</label>
                        <p className={`${darkMode ? 'text-white' : 'text-indigo-900'} mt-1 capitalize`}>{request.category || 'General'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Progress Section */}
                <div className={`${darkMode ? 'bg-white/5 border-white/10' : 'bg-indigo-100 border-indigo-200'} rounded-xl p-6 border`}>
                  <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-indigo-900'} mb-4`}>Progress Tracking</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm ${darkMode ? 'text-white/70' : 'text-indigo-700/70'}`}>Completion</span>
                        <span className={`text-sm ${darkMode ? 'text-white' : 'text-indigo-900'} font-medium`}>{request.progress}%</span>
                      </div>
                      <ProgressBar progress={request.progress} status={request.status} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className={`text-center p-4 ${darkMode ? 'bg-white/5' : 'bg-indigo-100'} rounded-lg`}>
                        <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                          {Math.floor((Date.now() - new Date(request.createdAt)) / (1000 * 60 * 60 * 24))}
                        </div>
                        <div className={`text-xs ${darkMode ? 'text-white/60' : 'text-indigo-700/70'}`}>Days Open</div>
                      </div>
                      
                      <div className={`text-center p-4 ${darkMode ? 'bg-white/5' : 'bg-indigo-100'} rounded-lg`}>
                        <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                          ${request.estimatedCost || '0'}
                        </div>
                        <div className={`text-xs ${darkMode ? 'text-white/60' : 'text-indigo-700/70'}`}>Est. Cost</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Assignment and Actions */}
              <div className="space-y-6">
                {/* Status Update */}
                <div className={`${darkMode ? 'bg-white/5 border-white/10' : 'bg-indigo-100 border-indigo-200'} rounded-xl p-6 border`}>
                  <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-indigo-900'} mb-4`}>Update Status</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? 'text-white/70' : 'text-indigo-700/70'} mb-2`}>
                        Current Status
                      </label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className={`w-full p-3 ${darkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-white border-indigo-200 text-indigo-900'} border rounded-lg focus:border-blue-500 focus:outline-none`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="On Hold">On Hold</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleStatusUpdate}
                      disabled={newStatus === request.status}
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Update Status
                    </motion.button>
                  </div>
                </div>
                
                {/* Assignment */}
                <div className={`${darkMode ? 'bg-white/5 border-white/10' : 'bg-indigo-100 border-indigo-200'} rounded-xl p-6 border`}>
                  <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-indigo-900'} mb-4`}>Assignment</h3>
                  
                  {request.assignedTo ? (
                    <div className={`flex items-center space-x-3 p-4 ${darkMode ? 'bg-white/5' : 'bg-indigo-100'} rounded-lg`}>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {request.assignedTo.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className={`${darkMode ? 'text-white' : 'text-indigo-900'} font-medium`}>{request.assignedTo}</div>
                        <div className={`${darkMode ? 'text-white/60' : 'text-indigo-700/70'} text-sm`}>Service Provider</div>
                      </div>
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={`p-2 ${darkMode ? 'bg-green-500/20 hover:bg-green-500/30' : 'bg-green-100 hover:bg-green-200'} rounded-lg transition-colors`}
                        >
                          <Phone className={`w-4 h-4 ${darkMode ? 'text-green-300' : 'text-green-600'}`} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={`p-2 ${darkMode ? 'bg-blue-500/20 hover:bg-blue-500/30' : 'bg-blue-100 hover:bg-blue-200'} rounded-lg transition-colors`}
                        >
                          <MessageCircle className={`w-4 h-4 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`} />
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className={`w-12 h-12 mx-auto ${darkMode ? 'text-white/30' : 'text-indigo-400/30'} mb-4`} />
                      <p className={`${darkMode ? 'text-white/60' : 'text-indigo-700/70'} mb-4`}>No one assigned yet</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-all duration-300 shadow-md"
                      >
                        Assign Technician
                      </motion.button>
                    </div>
                  )}
                </div>
                
                {/* Quick Actions */}
                <div className={`${darkMode ? 'bg-white/5 border-white/10' : 'bg-indigo-100 border-indigo-200'} rounded-xl p-6 border`}>
                  <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-indigo-900'} mb-4`}>Quick Actions</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center justify-center space-x-2 p-3 ${darkMode ? 'bg-blue-500/20 hover:bg-blue-500/30' : 'bg-blue-100 hover:bg-blue-200'} rounded-lg transition-colors`}
                    >
                      <MessageCircle className={`w-4 h-4 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`} />
                      <span className={`${darkMode ? 'text-blue-300' : 'text-blue-600'} text-sm`}>Message Tenant</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center justify-center space-x-2 p-3 ${darkMode ? 'bg-green-500/20 hover:bg-green-500/30' : 'bg-green-100 hover:bg-green-200'} rounded-lg transition-colors`}
                    >
                      <Calendar className={`w-4 h-4 ${darkMode ? 'text-green-300' : 'text-green-600'}`} />
                      <span className={`${darkMode ? 'text-green-300' : 'text-green-600'} text-sm`}>Schedule Visit</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center justify-center space-x-2 p-3 ${darkMode ? 'bg-purple-500/20 hover:bg-purple-500/30' : 'bg-purple-100 hover:bg-purple-200'} rounded-lg transition-colors`}
                    >
                      <Share2 className={`w-4 h-4 ${darkMode ? 'text-purple-300' : 'text-purple-600'}`} />
                      <span className={`${darkMode ? 'text-purple-300' : 'text-purple-600'} text-sm`}>Share Report</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center justify-center space-x-2 p-3 ${darkMode ? 'bg-orange-500/20 hover:bg-orange-500/30' : 'bg-orange-100 hover:bg-orange-200'} rounded-lg transition-colors`}
                    >
                      <Download className={`w-4 h-4 ${darkMode ? 'text-orange-300' : 'text-orange-600'}`} />
                      <span className={`${darkMode ? 'text-orange-300' : 'text-orange-600'} text-sm`}>Export PDF</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'comments' && (
            <div className="space-y-6">
              {/* Comments List */}
              <div className="space-y-4">
                {request.comments?.map((comment, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex space-x-4 p-4 ${darkMode ? 'bg-white/5 border-white/10' : 'bg-indigo-100 border-indigo-200'} rounded-lg border`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {comment.author?.charAt(0) || 'L'}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`font-semibold ${darkMode ? 'text-white' : 'text-indigo-900'}`}>{comment.author}</span>
                        <span className={`text-xs ${darkMode ? 'text-white/50' : 'text-indigo-700/50'}`}>
                          {new Date(comment.timestamp).toLocaleString()}
                        </span>
                      </div>
                      
                      <p className={`${darkMode ? 'text-white/80' : 'text-indigo-800/80'}`}>{comment.text}</p>
                      
                      {comment.attachments && comment.attachments.length > 0 && (
                        <div className="flex space-x-2 mt-3">
                          {comment.attachments.map((attachment, idx) => (
                            <div key={idx} className={`w-16 h-16 rounded-lg ${darkMode ? 'bg-white/10' : 'bg-indigo-100'} flex items-center justify-center`}>
                              {attachment.type === 'image' ? (
                                <img 
                                  src={attachment.url} 
                                  alt="Comment attachment" 
                                  className="w-full h-full object-cover rounded-lg" 
                                />
                              ) : (
                                <FileText className={`w-6 h-6 ${darkMode ? 'text-white/60' : 'text-indigo-600/60'}`} />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {!request.comments?.length && (
                  <div className="text-center py-12">
                    <MessageCircle className={`w-16 h-16 mx-auto ${darkMode ? 'text-white/30' : 'text-indigo-400/30'} mb-4`} />
                    <p className={`${darkMode ? 'text-white/60' : 'text-indigo-700/70'}`}>No comments yet</p>
                    <p className={`${darkMode ? 'text-white/40' : 'text-indigo-700/40'} text-sm mt-1`}>Start a conversation with your tenant</p>
                  </div>
                )}
              </div>
              
              {/* Add Comment */}
              <div className={`${darkMode ? 'bg-white/5 border-white/10' : 'bg-indigo-100 border-indigo-200'} rounded-lg p-4 border`}>
                <div className="space-y-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment or update..."
                    className={`w-full p-4 ${darkMode ? 'bg-white/10 border-white/20 text-white placeholder-white/50' : 'bg-white border-indigo-200 text-indigo-900 placeholder-indigo-400/50'} border rounded-lg focus:border-blue-500 focus:outline-none resize-none`}
                    rows={3}
                  />
                  
                  {/* Attachment Preview */}
                  {attachments.length > 0 && (
                    <div className="flex space-x-2">
                      {attachments.map((attachment, index) => (
                        <div key={index} className="relative group">
                          <div className={`w-16 h-16 rounded-lg ${darkMode ? 'bg-white/10' : 'bg-indigo-100'} flex items-center justify-center`}>
                            {attachment.type === 'image' ? (
                              <img 
                                src={attachment.url} 
                                alt="Attachment" 
                                className="w-full h-full object-cover rounded-lg" 
                              />
                            ) : (
                              <FileText className={`w-6 h-6 ${darkMode ? 'text-white/60' : 'text-indigo-600/60'}`} />
                            )}
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </motion.button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx,.txt"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex items-center space-x-1 px-3 py-2 ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-indigo-100/50 hover:bg-indigo-200/50'} rounded-lg transition-colors`}
                      >
                        <Paperclip className={`w-4 h-4 ${darkMode ? 'text-white/70' : 'text-indigo-600/70'}`} />
                        <span className={`text-sm ${darkMode ? 'text-white/70' : 'text-indigo-600/70'}`}>Attach</span>
                      </motion.button>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add Comment
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'history' && (
            <div className="space-y-4">
              {request.history?.map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-start space-x-4 p-4 ${darkMode ? 'bg-white/5 border-white/10' : 'bg-indigo-100 border-indigo-200'} rounded-lg border`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    event.type === 'status' ? 'bg-blue-500/20' :
                    event.type === 'assignment' ? 'bg-purple-500/20' :
                    event.type === 'comment' ? 'bg-green-500/20' :
                    'bg-gray-500/20'
                  }`}>
                    {event.type === 'status' && <RefreshCw className="w-4 h-4 text-blue-400" />}
                    {event.type === 'assignment' && <Users className="w-4 h-4 text-purple-400" />}
                    {event.type === 'comment' && <MessageCircle className="w-4 h-4 text-green-400" />}
                    {event.type === 'created' && <Plus className="w-4 h-4 text-yellow-400" />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-indigo-900'}`}>{event.description}</span>
                      <span className={`text-xs ${darkMode ? 'text-white/50' : 'text-indigo-700/50'}`}>
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {event.details && (
                      <p className={`text-sm ${darkMode ? 'text-white/70' : 'text-indigo-700/70'} mt-1`}>{event.details}</p>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {!request.history?.length && (
                <div className="text-center py-12">
                  <Clock className={`w-16 h-16 mx-auto ${darkMode ? 'text-white/30' : 'text-indigo-400/30'} mb-4`} />
                  <p className={`${darkMode ? 'text-white/60' : 'text-indigo-700/70'}`}>No history available</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'attachments' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {request.attachments?.map((attachment, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`${darkMode ? 'bg-white/5 border-white/10 group hover:border-white/30' : 'bg-indigo-100 border-indigo-200 group hover:border-indigo-300'} rounded-lg p-4 border transition-colors`}
                >
                  <div className={`aspect-square mb-4 rounded-lg overflow-hidden ${darkMode ? 'bg-white/10' : 'bg-indigo-100'} flex items-center justify-center`}>
                    {attachment.type === 'image' ? (
                      <img 
                        src={attachment.url} 
                        alt={attachment.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <FileText className={`w-12 h-12 ${darkMode ? 'text-white/40' : 'text-indigo-600/40'}`} />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-indigo-900'} truncate`}>{attachment.name}</h4>
                    <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-indigo-700/50'}`}>{attachment.size}</p>
                    
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex-1 flex items-center justify-center space-x-1 py-2 ${darkMode ? 'bg-blue-500/20 hover:bg-blue-500/30' : 'bg-blue-100 hover:bg-blue-200'} rounded-lg transition-colors`}
                      >
                        <Eye className={`w-4 h-4 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`} />
                        <span className={`text-xs ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>View</span>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex-1 flex items-center justify-center space-x-1 py-2 ${darkMode ? 'bg-green-500/20 hover:bg-green-500/30' : 'bg-green-100 hover:bg-green-200'} rounded-lg transition-colors`}
                      >
                        <Download className={`w-4 h-4 ${darkMode ? 'text-green-300' : 'text-green-600'}`} />
                        <span className={`text-xs ${darkMode ? 'text-green-300' : 'text-green-600'}`}>Download</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {!request.attachments?.length && (
                <div className="col-span-full text-center py-12">
                  <ImageIcon className={`w-16 h-16 mx-auto ${darkMode ? 'text-white/30' : 'text-indigo-400/30'} mb-4`} />
                  <p className={`${darkMode ? 'text-white/60' : 'text-indigo-700/70'}`}>No attachments</p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Notification Component
const NotificationToast = ({ notifications, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className={`p-4 rounded-lg shadow-lg backdrop-blur-xl border max-w-sm ${
              notification.type === 'success' ? 'bg-green-500/20 border-green-500/30 text-green-300' :
              notification.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-300' :
              notification.type === 'warning' ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300' :
              'bg-blue-500/20 border-blue-500/30 text-blue-300'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
                {notification.type === 'error' && <XCircle className="w-5 h-5" />}
                {notification.type === 'warning' && <AlertCircle className="w-5 h-5" />}
                {notification.type === 'info' && <Bell className="w-5 h-5" />}
              </div>
              
              <div className="flex-1">
                <h4 className="font-semibold">{notification.title}</h4>
                {notification.message && (
                  <p className="text-sm opacity-90 mt-1">{notification.message}</p>
                )}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onRemove(notification.id)}
                className="flex-shrink-0 opacity-50 hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Main Component
const LandlordMaintenance = () => {
  const [currentSection] = useState('Maintenance');
  const { darkMode } = useDarkMode();
  const sidebarWidthClass = '[margin-left:var(--sidebar-width,18rem)]';
  
  // Sample maintenance requests data
  const [maintenanceRequests, setMaintenanceRequests] = useLocalStorage('landlord_maintenance_requests', [
    {
      id: 1,
      title: "Kitchen Faucet Leak",
      description: "The kitchen faucet has been dripping constantly, causing water waste and potential damage to the cabinet below.",
      property: "Modern Downtown Loft #101",
      tenant: "John Doe",
      createdAt: "2025-08-01T10:30:00Z",
      updatedAt: "2025-08-02T14:20:00Z",
      status: "In Progress",
      priority: "High",
      progress: 65,
      category: "plumbing",
      assignedTo: "AquaFix Plumbing Services",
      estimatedCost: 150,
      isEmergency: false,
      isUrgent: true,
      attachments: [
        {
          id: 1,
          name: "faucet_leak.jpg",
          type: "image",
          size: "2.3 MB",
          url: "/api/placeholder/400/300"
        }
      ],
      comments: [
        {
          author: "Landlord",
          text: "I've contacted AquaFix Plumbing and they'll be there tomorrow morning.",
          timestamp: "2025-08-01T15:30:00Z",
          attachments: []
        }
      ],
      history: [
        {
          type: "created",
          description: "Request created by John Doe",
          timestamp: "2025-08-01T10:30:00Z"
        },
        {
          type: "assignment",
          description: "Assigned to AquaFix Plumbing Services",
          timestamp: "2025-08-01T15:00:00Z"
        },
        {
          type: "status",
          description: "Status changed to In Progress",
          timestamp: "2025-08-02T09:00:00Z"
        }
      ]
    },
    {
      id: 2,
      title: "Heating System Malfunction",
      description: "The heating system is not working properly. Rooms are not getting warm enough despite thermostat being set correctly.",
      property: "Luxury Penthouse #505",
      tenant: "Jane Smith",
      createdAt: "2025-07-28T09:15:00Z",
      updatedAt: "2025-08-05T10:00:00Z",
      status: "In Progress",
      priority: "Medium",
      progress: 50,
      category: "hvac",
      assignedTo: "HVAC Solutions Inc.",
      estimatedCost: 300,
      isEmergency: false,
      isUrgent: false,
      attachments: [
        {
          id: 1,
          name: "thermostat_reading.jpg",
          type: "image",
          size: "1.5 MB",
          url: "/api/placeholder/400/300"
        }
      ],
      comments: [
        {
          author: "Landlord",
          text: "HVAC Solutions Inc. has been contacted and will inspect the system tomorrow.",
          timestamp: "2025-07-29T11:00:00Z",
          attachments: []
        }
      ],
      history: [
        {
          type: "created",
          description: "Request created by Jane Smith",
          timestamp: "2025-07-28T09:15:00Z"
        },
        {
          type: "assignment",
          description: "Assigned to HVAC Solutions Inc.",
          timestamp: "2025-07-29T10:30:00Z"
        },
        {
          type: "status",
          description: "Status changed to In Progress",
          timestamp: "2025-08-05T10:00:00Z"
        }
      ]
    },
    {
      id: 3,
      title: "Electrical Outlet Not Working",
      description: "The main electrical outlet in the living room has stopped working completely. Need urgent repair as it affects multiple devices.",
      property: "Cozy Studio Apartment",
      tenant: "Robert Johnson",
      createdAt: "2025-08-02T16:45:00Z",
      updatedAt: "2025-08-03T11:30:00Z",
      status: "Completed",
      priority: "High",
      progress: 100,
      category: "electrical",
      assignedTo: "ElectroFix Solutions",
      estimatedCost: 120,
      isEmergency: true,
      isUrgent: false,
      attachments: [
        {
          id: 1,
          name: "outlet_before.jpg",
          type: "image",
          size: "1.8 MB",
          url: "/api/placeholder/400/300"
        },
        {
          id: 2,
          name: "outlet_after.jpg",
          type: "image",
          size: "2.1 MB",
          url: "/api/placeholder/400/300"
        }
      ],
      comments: [
        {
          author: "ElectroFix Solutions",
          text: "Replaced the faulty outlet and checked all connections. Everything is working properly now.",
          timestamp: "2025-08-03T11:30:00Z",
          attachments: []
        }
      ],
      history: [
        {
          type: "created",
          description: "Emergency request created by Robert Johnson",
          timestamp: "2025-08-02T16:45:00Z"
        },
        {
          type: "assignment",
          description: "Assigned to ElectroFix Solutions",
          timestamp: "2025-08-02T17:00:00Z"
        },
        {
          type: "status",
          description: "Status changed to In Progress",
          timestamp: "2025-08-03T08:00:00Z"
        },
        {
          type: "status",
          description: "Status changed to Completed",
          timestamp: "2025-08-03T11:30:00Z"
        }
      ]
    },
    {
      id: 4,
      title: "Window Lock Repair",
      description: "The lock on the bedroom window is broken and won't secure properly. This is a security concern that needs attention.",
      property: "Garden View Apartment",
      tenant: "Emily Davis",
      createdAt: "2025-07-30T14:20:00Z",
      updatedAt: "2025-08-01T10:15:00Z",
      status: "On Hold",
      priority: "Low",
      progress: 25,
      category: "security",
      assignedTo: "SecureHome Repairs",
      estimatedCost: 80,
      isEmergency: false,
      isUrgent: false,
      attachments: [],
      comments: [
        {
          author: "Landlord",
          text: "Waiting for parts to arrive. Should be completed by end of week.",
          timestamp: "2025-08-01T10:15:00Z",
          attachments: []
        }
      ],
      history: [
        {
          type: "created",
          description: "Request created by Emily Davis",
          timestamp: "2025-07-30T14:20:00Z"
        },
        {
          type: "assignment",
          description: "Assigned to SecureHome Repairs",
          timestamp: "2025-07-30T15:30:00Z"
        },
        {
          type: "status",
          description: "Status changed to On Hold",
          timestamp: "2025-08-01T10:15:00Z",
          details: "Waiting for parts"
        }
      ]
    }
  ]);

  const [filteredRequests, setFilteredRequests] = useState(maintenanceRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [propertyFilter, setPropertyFilter] = useState('All');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { notifications, addNotification, removeNotification } = useNotification();

  // Filter and sort requests
  useEffect(() => {
    let filtered = maintenanceRequests.filter(request => {
      const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.tenant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.property.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || request.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || request.priority === priorityFilter;
      const matchesProperty = propertyFilter === 'All' || request.property === propertyFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesProperty;
    });

    // Sort requests
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredRequests(filtered);
  }, [maintenanceRequests, searchTerm, statusFilter, priorityFilter, propertyFilter, sortBy, sortOrder]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = maintenanceRequests.length;
    const completed = maintenanceRequests.filter(r => r.status === 'Completed').length;
    const pending = maintenanceRequests.filter(r => r.status === 'Pending').length;
    const inProgress = maintenanceRequests.filter(r => r.status === 'In Progress').length;
    const highPriority = maintenanceRequests.filter(r => r.priority === 'High').length;
    const avgResponseTime = 2.4; // hours - could be calculated from actual data
    const totalCost = maintenanceRequests.reduce((sum, r) => sum + (r.estimatedCost || 0), 0);
    
    return {
      total,
      completed,
      pending,
      inProgress,
      highPriority,
      avgResponseTime,
      totalCost,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [maintenanceRequests]);

  // Get unique properties for filter
  const properties = useMemo(() => {
    return [...new Set(maintenanceRequests.map(r => r.property))];
  }, [maintenanceRequests]);

  // Event handlers
  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleEditRequest = (request) => {
    // Implement edit functionality
    console.log('Edit request:', request);
  };

  const handleDeleteRequest = (requestId) => {
    if (window.confirm('Are you sure you want to delete this maintenance request?')) {
      setMaintenanceRequests(prev => prev.filter(r => r.id !== requestId));
      addNotification({
        type: 'success',
        title: 'Request Deleted',
        message: 'Maintenance request has been successfully deleted.'
      });
    }
  };

  const handleStatusChange = (requestId, newStatus) => {
    setMaintenanceRequests(prev => prev.map(r => 
      r.id === requestId 
        ? { 
            ...r, 
            status: newStatus, 
            updatedAt: new Date().toISOString(),
            progress: newStatus === 'Completed' ? 100 : newStatus === 'In Progress' ? 50 : 0,
            history: [
              ...(r.history || []),
              {
                type: 'status',
                description: `Status changed to ${newStatus}`,
                timestamp: new Date().toISOString()
              }
            ]
          }
        : r
    ));
    
    addNotification({
      type: 'success',
      title: 'Status Updated',
      message: `Request status changed to ${newStatus}`
    });
  };

  const handleAddComment = (requestId, comment) => {
    setMaintenanceRequests(prev => prev.map(r => 
      r.id === requestId 
        ? { 
            ...r, 
            comments: [...(r.comments || []), comment],
            updatedAt: new Date().toISOString(),
            history: [
              ...(r.history || []),
              {
                type: 'comment',
                description: `Comment added by ${comment.author}`,
                timestamp: comment.timestamp
              }
            ]
          }
        : r
    ));
    
    addNotification({
      type: 'success',
      title: 'Comment Added',
      message: 'Your comment has been added to the request.'
    });
  };

  const handleAssignTechnician = (requestId, technician) => {
    setMaintenanceRequests(prev => prev.map(r => 
      r.id === requestId 
        ? { 
            ...r, 
            assignedTo: technician,
            updatedAt: new Date().toISOString(),
            history: [
              ...(r.history || []),
              {
                type: 'assignment',
                description: `Assigned to ${technician}`,
                timestamp: new Date().toISOString()
              }
            ]
          }
        : r
    ));
    
    addNotification({
      type: 'success',
      title: 'Technician Assigned',
      message: `Request has been assigned to ${technician}`
    });
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-blue-950' : 'bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400'} flex relative overflow-hidden`}>
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className={`absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r ${darkMode ? 'from-purple-500/10 to-pink-500/10' : 'from-indigo-600/20 to-purple-600/20'} rounded-full blur-3xl`}
        />
        <motion.div
          animate={{ rotate: -360, scale: [1.1, 1, 1.1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className={`absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r ${darkMode ? 'from-blue-500/10 to-cyan-500/10' : 'from-pink-500/20 to-orange-500/20'} rounded-full blur-3xl`}
        />
      </div>

      <LandlordSideBar currentSection={currentSection} />
      
      <div className={`flex-1 flex flex-col relative z-10 ${sidebarWidthClass} transition-all duration-700`}>
        <LandlordNavBar currentSection={currentSection} />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <motion.h1
                className={`text-5xl font-bold mb-4 bg-gradient-to-r ${darkMode ? 'from-white via-purple-200 to-white' : 'from-indigo-800 via-purple-800 to-indigo-800'} bg-clip-text text-transparent`}
              >
                Maintenance Management
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className={`text-xl ${darkMode ? 'text-white/70' : 'text-indigo-900/80'} max-w-2xl mx-auto`}
              >
                Streamline your property maintenance with intelligent request management and real-time tracking
              </motion.p>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-6 mb-8">
              <AnimatedCard className={`xl:col-span-2 backdrop-blur-xl rounded-2xl p-6 text-center ${darkMode ? 'bg-white/10 border border-white/20' : 'bg-white/80 border border-indigo-200/50 shadow-md'}`}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600"
                >
                  <Wrench className="w-6 h-6 text-white" />
                </motion.div>
                <div className={`text-3xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-indigo-900'}`}>{stats.total}</div>
                <div className={`text-sm ${darkMode ? 'text-white/60' : 'text-indigo-700/70'}`}>Total Requests</div>
                <div className={`text-xs mt-1 ${darkMode ? 'text-white/40' : 'text-indigo-600/50'}`}>+12% this month</div>
              </AnimatedCard>
              
              <AnimatedCard delay={0.1} className={`xl:col-span-2 backdrop-blur-xl rounded-2xl p-6 text-center ${darkMode ? 'bg-white/10 border border-white/20' : 'bg-white/80 border border-indigo-200/50 shadow-md'}`}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600"
                >
                  <CheckCircle className="w-6 h-6 text-white" />
                </motion.div>
                <div className={`text-3xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-indigo-900'}`}>{stats.completed}</div>
                <div className={`text-sm ${darkMode ? 'text-white/60' : 'text-indigo-700/70'}`}>Completed</div>
                <div className={`text-xs mt-1 ${darkMode ? 'text-white/40' : 'text-indigo-600/50'}`}>{stats.completionRate}% rate</div>
              </AnimatedCard>
              
              <AnimatedCard delay={0.2} className={`xl:col-span-2 backdrop-blur-xl rounded-2xl p-6 text-center ${darkMode ? 'bg-white/10 border border-white/20' : 'bg-white/80 border border-indigo-200/50 shadow-md'}`}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600"
                >
                  <Clock className="w-6 h-6 text-white" />
                </motion.div>
                <div className={`text-3xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-indigo-900'}`}>{stats.pending}</div>
                <div className={`text-sm ${darkMode ? 'text-white/60' : 'text-indigo-700/70'}`}>Pending</div>
                <div className={`text-xs mt-1 ${darkMode ? 'text-white/40' : 'text-indigo-600/50'}`}>Need attention</div>
              </AnimatedCard>
              
              <AnimatedCard delay={0.3} className={`xl:col-span-2 backdrop-blur-xl rounded-2xl p-6 text-center ${darkMode ? 'bg-white/10 border border-white/20' : 'bg-white/80 border border-indigo-200/50 shadow-md'}`}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-red-500 to-pink-600"
                >
                  <AlertCircle className="w-6 h-6 text-white" />
                </motion.div>
                <div className={`text-3xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-indigo-900'}`}>{stats.highPriority}</div>
                <div className={`text-sm ${darkMode ? 'text-white/60' : 'text-indigo-700/70'}`}>High Priority</div>
                <div className={`text-xs mt-1 ${darkMode ? 'text-white/40' : 'text-indigo-600/50'}`}>Urgent attention</div>
              </AnimatedCard>
            </div>

            {/* Additional Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <AnimatedCard delay={0.4} className={`backdrop-blur-xl rounded-xl p-4 text-center ${darkMode ? 'bg-white/10 border border-white/20' : 'bg-white/80 border border-indigo-200/50 shadow-md'}`}>
                <Activity className={`w-6 h-6 mx-auto mb-2 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-indigo-900'}`}>{stats.inProgress}</div>
                <div className={`text-xs ${darkMode ? 'text-white/60' : 'text-indigo-700/70'}`}>In Progress</div>
              </AnimatedCard>
              
              <AnimatedCard delay={0.5} className={`backdrop-blur-xl rounded-xl p-4 text-center ${darkMode ? 'bg-white/10 border border-white/20' : 'bg-white/80 border border-indigo-200/50 shadow-md'}`}>
                <Clock className={`w-6 h-6 mx-auto mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-indigo-900'}`}>{stats.avgResponseTime}h</div>
                <div className={`text-xs ${darkMode ? 'text-white/60' : 'text-indigo-700/70'}`}>Avg Response</div>
              </AnimatedCard>
              
              <AnimatedCard delay={0.6} className={`backdrop-blur-xl rounded-xl p-4 text-center ${darkMode ? 'bg-white/10 border border-white/20' : 'bg-white/80 border border-indigo-200/50 shadow-md'}`}>
                <DollarSign className={`w-6 h-6 mx-auto mb-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-indigo-900'}`}>${stats.totalCost}</div>
                <div className={`text-xs ${darkMode ? 'text-white/60' : 'text-indigo-700/70'}`}>Total Cost</div>
              </AnimatedCard>
              
              <AnimatedCard delay={0.7} className={`backdrop-blur-xl rounded-xl p-4 text-center ${darkMode ? 'bg-white/10 border border-white/20' : 'bg-white/80 border border-indigo-200/50 shadow-md'}`}>
                <TrendingUp className={`w-6 h-6 mx-auto mb-2 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
                <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-indigo-900'}`}>{stats.completionRate}%</div>
                <div className={`text-xs ${darkMode ? 'text-white/60' : 'text-indigo-700/70'}`}>Success Rate</div>
              </AnimatedCard>
            </div>

            {/* Filters and Controls */}
            <AnimatedCard delay={0.8} className={`backdrop-blur-xl rounded-2xl p-6 ${darkMode ? 'bg-white/10 border border-white/20' : 'bg-white/80 border border-indigo-200/50 shadow-md'}`}>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-white/50' : 'text-indigo-400/70'}`} />
                    <input
                      type="text"
                      placeholder="Search requests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`pl-10 pr-4 py-3 w-64 rounded-xl focus:border-blue-500 focus:outline-none transition-colors ${darkMode ? 'bg-white/10 border border-white/20 text-white placeholder-white/50' : 'bg-white/70 border border-indigo-200/50 text-indigo-900 placeholder-indigo-400/70'}`}
                    />
                  </div>
                  
                  {/* Filters */}
                  <div className="flex space-x-3">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className={`px-4 py-3 rounded-xl focus:border-blue-500 focus:outline-none transition-colors ${darkMode ? 'bg-white/10 border border-white/20 text-white' : 'bg-white/70 border border-indigo-200/50 text-indigo-900'}`}
                    >
                      <option value="All">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className={`px-4 py-3 rounded-xl focus:border-blue-500 focus:outline-none transition-colors ${darkMode ? 'bg-white/10 border border-white/20 text-white' : 'bg-white/70 border border-indigo-200/50 text-indigo-900'}`}
                    >
                      <option value="All">All Priority</option>
                      <option value="High">High Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="Low">Low Priority</option>
                    </select>
                    
                    <select
                      value={propertyFilter}
                      onChange={(e) => setPropertyFilter(e.target.value)}
                      className={`px-4 py-3 rounded-xl focus:border-blue-500 focus:outline-none transition-colors ${darkMode ? 'bg-white/10 border border-white/20 text-white' : 'bg-white/70 border border-indigo-200/50 text-indigo-900'}`}
                    >
                      <option value="All">All Properties</option>
                      {properties.map((property) => (
                        <option key={property} value={property}>{property}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* Sort controls */}
                  <div className="flex items-center space-x-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className={`px-3 py-2 rounded-lg text-sm focus:border-blue-500 focus:outline-none transition-colors ${darkMode ? 'bg-white/10 border border-white/20 text-white' : 'bg-white/70 border border-indigo-200/50 text-indigo-900'}`}
                    >
                      <option value="createdAt">Date Created</option>
                      <option value="updatedAt">Last Updated</option>
                      <option value="priority">Priority</option>
                      <option value="status">Status</option>
                      <option value="property">Property</option>
                    </select>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20' : 'bg-white/70 border border-indigo-200/50 text-indigo-900 hover:bg-indigo-100/70'}`}
                    >
                      {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                    </motion.button>
                  </div>
                  
                  
                </div>
              </div>
            </AnimatedCard>

            {/* Requests Grid */}
            <AnimatedCard delay={0.9}>
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full"
                  />
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-20">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Wrench className={`w-20 h-20 mx-auto mb-6 ${darkMode ? 'text-white/30' : 'text-indigo-300/50'}`} />
                    <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-indigo-900'}`}>No Maintenance Requests Found</h3>
                    <p className={`mb-8 ${darkMode ? 'text-white/60' : 'text-indigo-700/70'}`}>
                      {searchTerm || statusFilter !== 'All' || priorityFilter !== 'All' || propertyFilter !== 'All'
                        ? 'Try adjusting your search criteria or filters'
                        : 'All your maintenance requests will appear here'
                      }
                    </p>
                    {!(searchTerm || statusFilter !== 'All' || priorityFilter !== 'All' || propertyFilter !== 'All') && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-8 py-4 text-white rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 mx-auto ${darkMode ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'}`}
                      >
                        <Plus className="w-5 h-5" />
                        <span>Create First Request</span>
                      </motion.button>
                    )}
                  </motion.div>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {filteredRequests.map((request, index) => (
                    <MaintenanceRequestCard
                      key={request.id}
                      request={request}
                      onEdit={handleEditRequest}
                      onView={handleViewRequest}
                      onDelete={handleDeleteRequest}
                      onStatusChange={handleStatusChange}
                      onAssign={handleAssignTechnician}
                      delay={index * 0.1}
                    />
                  ))}
                </div>
              )}
            </AnimatedCard>
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedRequest && (
          <RequestDetailModal
            isOpen={showDetailModal}
            onClose={() => setShowDetailModal(false)}
            request={selectedRequest}
            onUpdate={(updatedRequest) => {
              setMaintenanceRequests(prev => prev.map(r => 
                r.id === updatedRequest.id ? updatedRequest : r
              ));
              setSelectedRequest(updatedRequest);
            }}
            onAddComment={handleAddComment}
            onUpdateStatus={handleStatusChange}
          />
        )}
      </AnimatePresence>

      {/* Notifications */}
      <NotificationToast
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  );
};

export default LandlordMaintenance;
