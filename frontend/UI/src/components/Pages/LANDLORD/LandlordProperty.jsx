import React, { useState, useEffect, useRef, useMemo } from 'react';
import LandlordSideBar from './LandlordSideBar';
import LandlordNavBar from './LandlordNavBar';
import { useDarkMode } from '../../../DarkModeContext';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Upload, 
  MapPin, 
  Bed, 
  Bath, 
  Car, 
  Wifi, 
  Tv, 
  AirVent, 
  Zap, 
  Waves, 
  Users, 
  DollarSign, 
  Calendar, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Camera, 
  Image as ImageIcon, 
  FileText, 
  Download, 
  Share2, 
  Copy, 
  ChevronDown, 
  Check, 
  X, 
  AlertCircle, 
  Home, 
  Maximize, 
  Heart, 
  ChevronLeft, 
  ChevronRight,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  RefreshCw,
  BookOpen,
  Settings,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  Save,
  ArrowRight,
  ExternalLink,
  Phone,
  Mail,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Youtube
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Custom Hooks
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

// Property Card Component
const PropertyCard = ({ property, onEdit, onDelete, onView, onToggleStatus, delay = 0, viewMode = 'grid' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay, duration: 0.4 }}
        whileHover={{ scale: 1.01, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}
        className={`backdrop-blur-xl border rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group ${darkMode ? 'bg-slate-800/80 border-slate-700/50 hover:border-cyan-400/30' : 'bg-white/80 border-indigo-200/50 hover:border-indigo-400/40'}`}
      >
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            {property.images?.[0] ? (
              <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-12 h-12 text-white/50" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-white mb-2 truncate">{property.title}</h3>
            <div className="flex items-center space-x-4 text-white/70 mb-2">
              <span className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{property.location}</span>
              </span>
              <span className="flex items-center space-x-1">
                <DollarSign className="w-4 h-4" />
                <span>${property.rent}/month</span>
              </span>
            </div>
            <div className="flex items-center space-x-4 text-white/60">
              <span className="flex items-center space-x-1">
                <Bed className="w-4 h-4" />
                <span>{property.bedrooms}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Bath className="w-4 h-4" />
                <span>{property.bathrooms}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Maximize className="w-4 h-4" />
                <span>{property.area} sq ft</span>
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              property.status === 'Available' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
              property.status === 'Occupied' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
              'bg-orange-500/20 text-orange-300 border border-orange-500/30'
            }`}>
              {property.status}
            </span>
            
            <div className="relative" ref={menuRef}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-white/70" />
              </motion.button>
              
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className={`absolute right-0 top-full mt-2 w-48 backdrop-blur-xl rounded-xl shadow-xl z-50 ${darkMode 
                      ? 'bg-white/20 border border-white/30' 
                      : 'bg-white/90 border border-indigo-200/50'}`}
                  >
                    <div className="p-2">
                      <button onClick={() => { onView(property); setShowMenu(false); }} className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10 text-white/80' : 'hover:bg-indigo-50 text-indigo-700'}`}>
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                      <button onClick={() => { onEdit(property); setShowMenu(false); }} className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10 text-white/80' : 'hover:bg-indigo-50 text-indigo-700'}`}>
                        <Edit className="w-4 h-4" />
                        <span>Edit Property</span>
                      </button>
                      <button onClick={() => { onToggleStatus(property.id); setShowMenu(false); }} className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10 text-white/80' : 'hover:bg-indigo-50 text-indigo-700'}`}>
                        <RefreshCw className="w-4 h-4" />
                        <span>Toggle Status</span>
                      </button>
                      <button onClick={() => { onDelete(property.id); setShowMenu(false); }} className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-red-500/20 text-red-300' : 'hover:bg-red-50 text-red-600'}`}>
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 group ${darkMode 
        ? 'bg-white/10 backdrop-blur-xl border border-white/20' 
        : 'bg-white/80 backdrop-blur-xl border border-indigo-200/50'}`}
    >
      {/* Image Carousel */}
      <div className="relative h-64 overflow-hidden rounded-t-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            {property.images?.[currentImageIndex] ? (
              <img 
                src={property.images[currentImageIndex]} 
                alt={property.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Building2 className="w-20 h-20 text-white/50" />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        
        {/* Image Navigation */}
        {property.images?.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            
            {/* Image Indicators */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {property.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
        
        {/* Status Badge */}
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm ${
          property.status === 'Available' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
          property.status === 'Occupied' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
          'bg-orange-500/20 text-orange-300 border border-orange-500/30'
        }`}>
          {property.status}
        </div>
        
        {/* Favorite Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-4 left-4 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart className="w-4 h-4" />
        </motion.button>
        
        {/* Quick Actions */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onView(property)}
            className="p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
          >
            <Eye className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onEdit(property)}
            className="p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
          >
            <Edit className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
      
      {/* Property Info */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-indigo-900'}`}>{property.title}</h3>
            <div className={`flex items-center space-x-1 ${darkMode ? 'text-white/70' : 'text-indigo-700/80'}`}>
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{property.location}</span>
            </div>
          </div>
          
          <div className="relative" ref={menuRef}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowMenu(!showMenu)}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10' : 'hover:bg-indigo-100/80'}`}
            >
              <MoreVertical className={`w-5 h-5 ${darkMode ? 'text-white/70' : 'text-indigo-700/70'}`} />
            </motion.button>
            
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl shadow-xl z-50"
                >
                  <div className="p-2">
                    <button onClick={() => { onView(property); setShowMenu(false); }} className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-white/80">
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                    <button onClick={() => { onEdit(property); setShowMenu(false); }} className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-white/80">
                      <Edit className="w-4 h-4" />
                      <span>Edit Property</span>
                    </button>
                    <button className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-white/80">
                      <Share2 className="w-4 h-4" />
                      <span>Share Property</span>
                    </button>
                    <button className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-white/80">
                      <Download className="w-4 h-4" />
                      <span>Download Report</span>
                    </button>
                    <button onClick={() => { onToggleStatus(property.id); setShowMenu(false); }} className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-white/80">
                      <RefreshCw className="w-4 h-4" />
                      <span>Toggle Status</span>
                    </button>
                    <button onClick={() => { onDelete(property.id); setShowMenu(false); }} className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-red-500/20 transition-colors text-red-300">
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Property Details */}
        <div className="grid grid-cols-3 gap-4 mb-4 text-white/70">
          <div className="flex items-center space-x-1">
            <Bed className="w-4 h-4" />
            <span className="text-sm">{property.bedrooms} bed</span>
          </div>
          <div className="flex items-center space-x-1">
            <Bath className="w-4 h-4" />
            <span className="text-sm">{property.bathrooms} bath</span>
          </div>
          <div className="flex items-center space-x-1">
            <Maximize className="w-4 h-4" />
            <span className="text-sm">{property.area} sq ft</span>
          </div>
        </div>
        
        {/* Amenities */}
        <div className="flex items-center space-x-2 mb-4">
          {property.amenities?.slice(0, 4).map((amenity, index) => (
            <div key={index} className="p-1 rounded bg-white/10">
              {amenity === 'wifi' && <Wifi className="w-3 h-3 text-white/60" />}
              {amenity === 'parking' && <Car className="w-3 h-3 text-white/60" />}
              {amenity === 'ac' && <AirVent className="w-3 h-3 text-white/60" />}
              {amenity === 'tv' && <Tv className="w-3 h-3 text-white/60" />}
            </div>
          ))}
          {property.amenities?.length > 4 && (
            <span className="text-xs text-white/50">+{property.amenities.length - 4} more</span>
          )}
        </div>
        
        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-white">
              ${property.rent}
              <span className="text-sm text-white/60">/month</span>
            </div>
            {property.previousRent && (
              <div className="text-sm text-white/50 line-through">
                ${property.previousRent}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-yellow-400">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm">{property.rating || '4.5'}</span>
            </div>
            {property.trend && (
              <div className={`flex items-center space-x-1 ${
                property.trend === 'up' ? 'text-green-400' : 'text-red-400'
              }`}>
                {property.trend === 'up' ? 
                  <TrendingUp className="w-4 h-4" /> : 
                  <TrendingDown className="w-4 h-4" />
                }
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Property Form Modal
const PropertyModal = ({ isOpen, onClose, property, onSave, mode = 'add' }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    rent: '',
    previousRent: '',
    bedrooms: 1,
    bathrooms: 1,
    area: '',
    propertyType: 'apartment',
    status: 'Available',
    amenities: [],
    images: [],
    features: [],
    policies: {
      petFriendly: false,
      smokingAllowed: false,
      furnished: false
    },
    contact: {
      phone: '',
      email: '',
      website: ''
    },
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: ''
    }
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (property && mode === 'edit') {
      setFormData({ ...property });
    } else {
      setFormData({
        title: '',
        description: '',
        location: '',
        rent: '',
        previousRent: '',
        bedrooms: 1,
        bathrooms: 1,
        area: '',
        propertyType: 'apartment',
        status: 'Available',
        amenities: [],
        images: [],
        features: [],
        policies: {
          petFriendly: false,
          smokingAllowed: false,
          furnished: false
        },
        contact: {
          phone: '',
          email: '',
          website: ''
        },
        socialMedia: {
          facebook: '',
          twitter: '',
          instagram: ''
        }
      });
    }
  }, [property, mode, isOpen]);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    setIsUploading(true);
    
    // Simulate upload process
    setTimeout(() => {
      const newImages = files.map(file => URL.createObjectURL(file));
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
      setIsUploading(false);
    }, 2000);
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: property?.id || Date.now(),
      createdAt: property?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    onClose();
  };

  const steps = [
    { title: 'Basic Info', icon: Home },
    { title: 'Details', icon: FileText },
    { title: 'Images', icon: Camera },
    { title: 'Contact', icon: Phone }
  ];

  if (!isOpen) return null;

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
        className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">
              {mode === 'edit' ? 'Edit Property' : 'Add New Property'}
            </h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6 text-white/70" />
            </motion.button>
          </div>
          
          {/* Step Indicator */}
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className={`p-2 rounded-lg ${
                  currentStep === index + 1 
                    ? 'bg-blue-500 text-white' 
                    : currentStep > index + 1 
                      ? 'bg-green-500 text-white' 
                      : 'bg-white/10 text-white/50'
                }`}>
                  {currentStep > index + 1 ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <step.icon className="w-4 h-4" />
                  )}
                </div>
                <span className={`text-sm ${
                  currentStep === index + 1 ? 'text-white' : 'text-white/50'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 ${
                    currentStep > index + 1 ? 'bg-green-500' : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white/80 text-sm font-semibold mb-2">
                      Property Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="Enter property title"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/80 text-sm font-semibold mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="Enter property location"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                    placeholder="Describe your property..."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-white/80 text-sm font-semibold mb-2">
                      Property Type *
                    </label>
                    <select
                      value={formData.propertyType}
                      onChange={(e) => handleInputChange('propertyType', e.target.value)}
                      className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white focus:border-blue-500 focus:outline-none transition-colors"
                      required
                    >
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="condo">Condo</option>
                      <option value="studio">Studio</option>
                      <option value="villa">Villa</option>
                      <option value="townhouse">Townhouse</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-white/80 text-sm font-semibold mb-2">
                      Status *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white focus:border-blue-500 focus:outline-none transition-colors"
                      required
                    >
                      <option value="Available">Available</option>
                      <option value="Occupied">Occupied</option>
                      <option value="Maintenance">Under Maintenance</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-white/80 text-sm font-semibold mb-2">
                      Area (sq ft) *
                    </label>
                    <input
                      type="number"
                      value={formData.area}
                      onChange={(e) => handleInputChange('area', e.target.value)}
                      className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="1200"
                      required
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Details */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-white/80 text-sm font-semibold mb-2">
                      Bedrooms *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.bedrooms}
                      onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value))}
                      className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-blue-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/80 text-sm font-semibold mb-2">
                      Bathrooms *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.bathrooms}
                      onChange={(e) => handleInputChange('bathrooms', parseFloat(e.target.value))}
                      className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-blue-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/80 text-sm font-semibold mb-2">
                      Rent ($) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.rent}
                      onChange={(e) => handleInputChange('rent', e.target.value)}
                      className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="2500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/80 text-sm font-semibold mb-2">
                      Previous Rent ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.previousRent}
                      onChange={(e) => handleInputChange('previousRent', e.target.value)}
                      className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="2300"
                    />
                  </div>
                </div>
                
                {/* Amenities */}
                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-4">
                    Amenities
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { key: 'wifi', label: 'WiFi', icon: Wifi },
                      { key: 'parking', label: 'Parking', icon: Car },
                      { key: 'ac', label: 'Air Conditioning', icon: AirVent },
                      { key: 'tv', label: 'TV', icon: Tv },
                      { key: 'electricity', label: 'Electricity', icon: Zap },
                      { key: 'water', label: 'Water', icon: Waves },
                      { key: 'gym', label: 'Gym', icon: Users },
                      { key: 'pool', label: 'Swimming Pool', icon: Waves }
                    ].map(({ key, label, icon: Icon }) => (
                      <motion.button
                        key={key}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAmenityToggle(key)}
                        className={`p-4 rounded-xl border transition-all duration-200 ${
                          formData.amenities.includes(key)
                            ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                            : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        <Icon className="w-6 h-6 mx-auto mb-2" />
                        <div className="text-sm font-medium">{label}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>
                
                {/* Policies */}
                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-4">
                    Property Policies
                  </label>
                  <div className="space-y-3">
                    {[
                      { key: 'petFriendly', label: 'Pet Friendly' },
                      { key: 'smokingAllowed', label: 'Smoking Allowed' },
                      { key: 'furnished', label: 'Furnished' }
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center space-x-3 text-white/80">
                        <input
                          type="checkbox"
                          checked={formData.policies[key]}
                          onChange={(e) => handleInputChange(`policies.${key}`, e.target.checked)}
                          className="w-5 h-5 rounded border-2 border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500 focus:ring-2"
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Images */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-4">
                    Property Images
                  </label>
                  
                  {/* Upload Area */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500/50 hover:bg-white/5 transition-all duration-200"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    
                    {isUploading ? (
                      <div className="space-y-4">
                        <Loader className="w-12 h-12 mx-auto text-blue-400 animate-spin" />
                        <p className="text-white/60">Uploading images...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="w-12 h-12 mx-auto text-white/40" />
                        <div>
                          <p className="text-white/80 font-medium">Click to upload images</p>
                          <p className="text-white/50 text-sm">Support: JPG, PNG, GIF up to 10MB each</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Image Preview */}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Property ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 4: Contact */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-white/80 text-sm font-semibold mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.contact.phone}
                        onChange={(e) => handleInputChange('contact.phone', e.target.value)}
                        className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/80 text-sm font-semibold mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.contact.email}
                        onChange={(e) => handleInputChange('contact.email', e.target.value)}
                        className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="contact@property.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/80 text-sm font-semibold mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={formData.contact.website}
                        onChange={(e) => handleInputChange('contact.website', e.target.value)}
                        className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="https://property.com"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Social Media (Optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-white/80 text-sm font-semibold mb-2">
                        Facebook
                      </label>
                      <input
                        type="url"
                        value={formData.socialMedia.facebook}
                        onChange={(e) => handleInputChange('socialMedia.facebook', e.target.value)}
                        className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="https://facebook.com/property"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/80 text-sm font-semibold mb-2">
                        Twitter
                      </label>
                      <input
                        type="url"
                        value={formData.socialMedia.twitter}
                        onChange={(e) => handleInputChange('socialMedia.twitter', e.target.value)}
                        className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="https://twitter.com/property"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/80 text-sm font-semibold mb-2">
                        Instagram
                      </label>
                      <input
                        type="url"
                        value={formData.socialMedia.instagram}
                        onChange={(e) => handleInputChange('socialMedia.instagram', e.target.value)}
                        className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="https://instagram.com/property"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/20 flex items-center justify-between">
            <div className="flex space-x-4">
              {currentStep > 1 && (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors"
                >
                  Previous
                </motion.button>
              )}
            </div>
            
            <div className="flex space-x-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-6 py-3 bg-red-500/20 text-red-300 rounded-xl font-semibold hover:bg-red-500/30 transition-colors"
              >
                Cancel
              </motion.button>
              
              {currentStep < steps.length ? (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              ) : (
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{mode === 'edit' ? 'Update Property' : 'Save Property'}</span>
                </motion.button>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Main Component
const LandlordProperty = () => {
  const [currentSection] = useState('Properties');
  const { darkMode } = useDarkMode();
  const [properties, setProperties] = useLocalStorage('landlord_properties', [
    {
      id: 1,
      title: "Modern Downtown Loft",
      description: "Stunning modern loft in the heart of downtown with panoramic city views",
      location: "Manhattan, NY",
      rent: 2800,
      previousRent: 2600,
      bedrooms: 2,
      bathrooms: 2,
      area: 1200,
      propertyType: "apartment",
      status: "Occupied",
      amenities: ['wifi', 'parking', 'ac', 'tv'],
      images: [],
      rating: 4.8,
      trend: 'up',
      createdAt: '2024-01-01',
      contact: { phone: '+1 234 567 8900', email: 'contact@modernloft.com', website: 'https://modernloft.com' },
      socialMedia: { facebook: '', twitter: '', instagram: '' },
      policies: { petFriendly: true, smokingAllowed: false, furnished: true }
    },
    {
      id: 2,
      title: "Luxury Penthouse",
      description: "Exclusive penthouse with private rooftop terrace and premium amenities",
      location: "Brooklyn, NY",
      rent: 4200,
      bedrooms: 3,
      bathrooms: 2.5,
      area: 1800,
      propertyType: "apartment",
      status: "Available",
      amenities: ['wifi', 'parking', 'ac', 'tv', 'gym', 'pool'],
      images: [],
      rating: 4.9,
      trend: 'up',
      createdAt: '2024-01-02',
      contact: { phone: '+1 234 567 8901', email: 'luxury@penthouse.com', website: '' },
      socialMedia: { facebook: '', twitter: '', instagram: '' },
      policies: { petFriendly: false, smokingAllowed: false, furnished: true }
    },
    {
      id: 3,
      title: "Cozy Studio Apartment",
      description: "Perfect studio for young professionals with modern amenities",
      location: "Queens, NY",
      rent: 1800,
      previousRent: 1750,
      bedrooms: 0,
      bathrooms: 1,
      area: 650,
      propertyType: "studio",
      status: "Maintenance",
      amenities: ['wifi', 'ac'],
      images: [],
      rating: 4.5,
      trend: 'down',
      createdAt: '2024-01-03',
      contact: { phone: '+1 234 567 8902', email: 'cozy@studio.com', website: '' },
      socialMedia: { facebook: '', twitter: '', instagram: '' },
      policies: { petFriendly: true, smokingAllowed: false, furnished: false }
    }
  ]);

  const [filteredProperties, setFilteredProperties] = useState(properties);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid');
  const [showModal, setShowModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [modalMode, setModalMode] = useState('add');
  const [isLoading, setIsLoading] = useState(false);

  // Filter and sort properties
  useEffect(() => {
    let filtered = properties.filter(property => {
      const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           property.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || property.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Sort properties
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProperties(filtered);
  }, [properties, searchTerm, statusFilter, sortBy, sortOrder]);

  const handleAddProperty = () => {
    setSelectedProperty(null);
    setModalMode('add');
    setShowModal(true);
  };

  const handleEditProperty = (property) => {
    setSelectedProperty(property);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleViewProperty = (property) => {
    // Implement view functionality
    console.log('View property:', property);
  };

  const handleDeleteProperty = (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      setProperties(prev => prev.filter(p => p.id !== propertyId));
    }
  };

  const handleToggleStatus = (propertyId) => {
    setProperties(prev => prev.map(p => {
      if (p.id === propertyId) {
        const statuses = ['Available', 'Occupied', 'Maintenance'];
        const currentIndex = statuses.indexOf(p.status);
        const nextIndex = (currentIndex + 1) % statuses.length;
        return { ...p, status: statuses[nextIndex] };
      }
      return p;
    }));
  };

  const handleSaveProperty = (propertyData) => {
    if (modalMode === 'edit') {
      setProperties(prev => prev.map(p => 
        p.id === propertyData.id ? propertyData : p
      ));
    } else {
      setProperties(prev => [...prev, propertyData]);
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(properties, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'properties.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const stats = {
    total: properties.length,
    available: properties.filter(p => p.status === 'Available').length,
    occupied: properties.filter(p => p.status === 'Occupied').length,
    maintenance: properties.filter(p => p.status === 'Maintenance').length,
    totalRevenue: properties.reduce((sum, p) => sum + (p.status === 'Occupied' ? parseInt(p.rent) : 0), 0)
  };

  return (
    <div className={`min-h-screen flex relative overflow-hidden ${darkMode ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-blue-950' : 'bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400'}`}>
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl ${darkMode ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10' : 'bg-gradient-to-r from-indigo-500/20 to-cyan-500/20'}`}
        />
        <motion.div
          animate={{ rotate: -360, scale: [1.1, 1, 1.1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl ${darkMode ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10' : 'bg-gradient-to-r from-pink-500/20 to-purple-500/20'}`}
        />
      </div>

      <LandlordSideBar currentSection={currentSection} />
      
      <div className="flex-1 flex flex-col relative z-10 ml-[85px] md:ml-[320px] transition-all duration-700">
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
                className={`text-5xl font-bold mb-4 bg-clip-text text-transparent ${darkMode ? 'bg-gradient-to-r from-white via-purple-200 to-white' : 'bg-gradient-to-r from-indigo-800 via-purple-800 to-indigo-800'}`}
              >
                Property Management Hub
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className={`text-xl max-w-2xl mx-auto ${darkMode ? 'text-white/70' : 'text-indigo-900/80'}`}
              >
                Manage, track, and optimize your property portfolio with advanced tools and analytics
              </motion.p>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              <AnimatedCard className={`backdrop-blur-xl rounded-xl p-6 text-center ${darkMode ? 'bg-white/10 border border-white/20' : 'bg-white/80 border border-indigo-200/50 shadow-md'}`}>
                <Building2 className={`w-8 h-8 mx-auto mb-3 ${darkMode ? 'text-blue-400' : 'text-indigo-600'}`} />
                <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-indigo-900'}`}>{stats.total}</div>
                <div className={`text-sm ${darkMode ? 'text-white/60' : 'text-indigo-700/70'}`}>Total Properties</div>
              </AnimatedCard>
              
              <AnimatedCard delay={0.1} className={`backdrop-blur-xl rounded-xl p-6 text-center ${darkMode ? 'bg-white/10 border border-white/20' : 'bg-white/80 border border-indigo-200/50 shadow-md'}`}>
                <CheckCircle className={`w-8 h-8 mx-auto mb-3 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-indigo-900'}`}>{stats.available}</div>
                <div className={`text-sm ${darkMode ? 'text-white/60' : 'text-indigo-700/70'}`}>Available</div>
              </AnimatedCard>
              
              <AnimatedCard delay={0.2} className={`backdrop-blur-xl rounded-xl p-6 text-center ${darkMode ? 'bg-white/10 border border-white/20' : 'bg-white/80 border border-indigo-200/50 shadow-md'}`}>
                <Users className={`w-8 h-8 mx-auto mb-3 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-indigo-900'}`}>{stats.occupied}</div>
                <div className={`text-sm ${darkMode ? 'text-white/60' : 'text-indigo-700/70'}`}>Occupied</div>
              </AnimatedCard>
              
              <AnimatedCard delay={0.3} className={`backdrop-blur-xl rounded-xl p-6 text-center ${darkMode ? 'bg-white/10 border border-white/20' : 'bg-white/80 border border-indigo-200/50 shadow-md'}`}>
                <Settings className={`w-8 h-8 mx-auto mb-3 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-indigo-900'}`}>{stats.maintenance}</div>
                <div className={`text-sm ${darkMode ? 'text-white/60' : 'text-indigo-700/70'}`}>Maintenance</div>
              </AnimatedCard>
              
              <AnimatedCard delay={0.4} className={`backdrop-blur-xl rounded-xl p-6 text-center ${darkMode ? 'bg-white/10 border border-white/20' : 'bg-white/80 border border-indigo-200/50 shadow-md'}`}>
                <DollarSign className={`w-8 h-8 mx-auto mb-3 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-indigo-900'}`}>${stats.totalRevenue.toLocaleString()}</div>
                <div className={`text-sm ${darkMode ? 'text-white/60' : 'text-indigo-700/70'}`}>Monthly Revenue</div>
              </AnimatedCard>
            </div>

            {/* Controls */}
            <AnimatedCard delay={0.5} className={`backdrop-blur-xl rounded-2xl p-6 ${darkMode ? 'bg-white/10 border border-white/20' : 'bg-white/80 border-indigo-200/50'}`}>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-white/50' : 'text-indigo-700/70'}`} />
                    <input
                      type="text"
                      placeholder="Search properties..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`pl-10 pr-4 py-3 w-64 rounded-xl focus:outline-none transition-colors ${darkMode ? 'bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-blue-500' : 'bg-white/50 border border-indigo-300 text-indigo-900 placeholder-indigo-700/50 focus:border-indigo-500'}`}
                    />
                  </div>
                  
                  {/* Status Filter */}
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className={`pl-4 pr-10 py-3 rounded-xl focus:outline-none transition-colors appearance-none ${darkMode ? 'bg-gray-800 border border-gray-700 text-white focus:border-blue-500' : 'bg-white/50 border border-indigo-300 text-indigo-900 focus:border-indigo-500'}`}
                    >
                      <option value="All">All Status</option>
                      <option value="Available">Available</option>
                      <option value="Occupied">Occupied</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                    <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none ${darkMode ? 'text-white/50' : 'text-indigo-700/70'}`} />
                  </div>
                  
                  {/* Sort */}
                  <div className="flex space-x-2">
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className={`pl-4 pr-10 py-3 rounded-xl focus:outline-none transition-colors appearance-none ${darkMode ? 'bg-gray-800 border border-gray-700 text-white focus:border-blue-500' : 'bg-white/50 border border-indigo-300 text-indigo-900 focus:border-indigo-500'}`}
                      >
                        <option value="title">Sort by Title</option>
                        <option value="rent">Sort by Rent</option>
                        <option value="location">Sort by Location</option>
                        <option value="createdAt">Sort by Date</option>
                      </select>
                      <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none ${darkMode ? 'text-white/50' : 'text-indigo-700/70'}`} />
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className={`p-3 rounded-xl transition-colors ${darkMode ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20' : 'bg-white/50 border border-indigo-300 text-indigo-900 hover:bg-white'}`}
                    >
                      {sortOrder === 'asc' ? <SortAsc className="w-5 h-5" /> : <SortDesc className="w-5 h-5" />}
                    </motion.button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* View Mode Toggle */}
                  <div className="flex bg-white/10 rounded-xl p-1">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      <Grid3X3 className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      <List className="w-5 h-5" />
                    </motion.button>
                  </div>
                  
                  {/* Export Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleExportData}
                    className="px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <Download className="w-5 h-5" />
                    <span>Export</span>
                  </motion.button>
                  
                  {/* Add Property Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddProperty}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2 shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Property</span>
                  </motion.button>
                </div>
              </div>
            </AnimatedCard>

            {/* Properties Grid/List */}
            <AnimatedCard delay={0.6}>
              {filteredProperties.length === 0 ? (
                <div className="text-center py-20">
                  <Building2 className="w-20 h-20 mx-auto text-white/30 mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-4">No Properties Found</h3>
                  <p className="text-white/60 mb-8">
                    {searchTerm || statusFilter !== 'All' 
                      ? 'Try adjusting your search criteria or filters'
                      : 'Start by adding your first property to get started'
                    }
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddProperty}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Your First Property</span>
                  </motion.button>
                </div>
              ) : (
                <div className={
                  viewMode === 'grid' 
                    ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8"
                    : "space-y-4"
                }>
                  {filteredProperties.map((property, index) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      onEdit={handleEditProperty}
                      onDelete={handleDeleteProperty}
                      onView={handleViewProperty}
                      onToggleStatus={handleToggleStatus}
                      delay={index * 0.1}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              )}
            </AnimatedCard>
          </div>
        </main>
      </div>

      {/* Property Modal */}
      <AnimatePresence>
        {showModal && (
          <PropertyModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            property={selectedProperty}
            onSave={handleSaveProperty}
            mode={modalMode}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandlordProperty;
