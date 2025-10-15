import React, { useState, useEffect, useRef, useMemo } from 'react';
import LandlordSideBar from './LandlordSideBar';
import LandlordNavBar from './LandlordNavBar';
import AddNewPropertyModal from './AddNewPropertyModal';
import { useDarkMode } from '../../../useDarkMode.js';
// Removed SidebarContext usage
import {
  Building2, Plus, Search, MoreVertical, Edit, Trash2, Eye, MapPin, Bed, Bath, Car, Wifi, Tv, AirVent, Maximize, Heart, ChevronLeft, ChevronRight, ChevronDown, RefreshCw, Download, Share2, Star, TrendingUp, TrendingDown, Users, DollarSign, CheckCircle, Settings, Grid3X3, List, SortAsc, SortDesc
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../services/api.js';

// Ensure 'motion' symbol is referenced to satisfy some linters that may report it as unused
void motion;

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
    } catch {
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
  // hover state removed — not used
  const [showMenu, setShowMenu] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const menuRef = useRef(null);
  const { darkMode } = useDarkMode();

  const theme = useMemo(() => {
    if (darkMode) {
      return {
        cardBg: 'bg-white/10 backdrop-blur-xl border border-white/20',
        listCardBg: 'bg-slate-800/80 border-slate-700/50 hover:border-cyan-400/30',
        title: 'text-white',
        text: 'text-white/70',
        subtleText: 'text-white/60',
        icon: 'text-white/70',
        menuBg: 'bg-white/20 border border-white/30',
        menuItem: 'hover:bg-white/10 text-white/80',
        deleteMenuItem: 'hover:bg-red-500/20 text-red-300',
        status: {
          Available: 'bg-green-500/20 text-green-300 border border-green-500/30',
          Occupied: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
          Maintenance: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
        },
        amenityBg: 'bg-white/10',
        amenityIcon: 'text-white/60',
        price: 'text-white',
        priceUnit: 'text-white/60',
        rating: 'text-yellow-400',
        trendUp: 'text-green-400',
        trendDown: 'text-red-400',
      };
    }
    return {
      cardBg: 'bg-white/80 backdrop-blur-xl border border-indigo-200/50',
      listCardBg: 'bg-white/80 border-indigo-200/50 hover:border-indigo-400/40',
      title: 'text-indigo-900',
      text: 'text-indigo-700/80',
      subtleText: 'text-indigo-600/80',
      icon: 'text-indigo-700/70',
      menuBg: 'bg-white/90 border border-indigo-200/50',
      menuItem: 'hover:bg-indigo-50 text-indigo-700',
      deleteMenuItem: 'hover:bg-red-50 text-red-600',
      status: {
        Available: 'bg-green-100 text-green-800 border border-green-200',
        Occupied: 'bg-blue-100 text-blue-800 border border-blue-200',
        Maintenance: 'bg-orange-100 text-orange-800 border border-orange-200',
      },
      amenityBg: 'bg-indigo-100/60',
      amenityIcon: 'text-indigo-600',
      price: 'text-indigo-900',
      priceUnit: 'text-indigo-700/80',
      rating: 'text-yellow-500',
      trendUp: 'text-green-600',
      trendDown: 'text-red-600',
    };
  }, [darkMode]);

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
    const len = property.images?.length || 0;
    if (len === 0) return;
    setCurrentImageIndex((prev) => (prev + 1) % len);
  };

  const prevImage = () => {
    const len = property.images?.length || 0;
    if (len === 0) return;
    setCurrentImageIndex((prev) => (prev - 1 + len) % len);
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay, duration: 0.4 }}
        whileHover={{ scale: 1.01, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}
        className={`backdrop-blur-xl border rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group ${theme.listCardBg}`}
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
            <h3 className={`text-xl font-bold mb-2 truncate ${theme.title}`}>{property.title}</h3>
            <div className={`flex items-center space-x-4 mb-2 ${theme.text}`}>
              <span className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{property.location}</span>
              </span>
              <span className="flex items-center space-x-1">
                <DollarSign className="w-4 h-4" />
                <span>${property.rent}/month</span>
              </span>
            </div>
            <div className={`flex items-center space-x-4 ${theme.subtleText}`}>
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
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${theme.status[property.status]}`}>
              {property.status}
            </span>

            <div className="relative" ref={menuRef}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowMenu(!showMenu)}
                className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10' : 'hover:bg-indigo-100'}`}
              >
                <MoreVertical className={`w-5 h-5 ${theme.icon}`} />
              </motion.button>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className={`absolute right-0 top-full mt-2 w-48 backdrop-blur-xl rounded-xl shadow-xl z-50 ${theme.menuBg}`}
                  >
                    <div className="p-2">
                      <button onClick={() => { onView(property); setShowMenu(false); }} className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${theme.menuItem}`}>
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                      <button onClick={() => { onEdit(property); setShowMenu(false); }} className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${theme.menuItem}`}>
                        <Edit className="w-4 h-4" />
                        <span>Edit Property</span>
                      </button>
                      <button onClick={() => { onToggleStatus(property.id); setShowMenu(false); }} className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${theme.menuItem}`}>
                        <RefreshCw className="w-4 h-4" />
                        <span>Toggle Status</span>
                      </button>
                      <button onClick={() => { onDelete(property.id); setShowMenu(false); }} className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${theme.deleteMenuItem}`}>
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
      className={`relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 group ${theme.cardBg}`}
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
                  className={`w-2 h-2 rounded-full transition-colors ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Status Badge */}
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm ${theme.status[property.status]}`}>
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
            <h3 className={`text-xl font-bold mb-2 ${theme.title}`}>{property.title}</h3>
            <div className={`flex items-center space-x-1 ${theme.text}`}>
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
              <MoreVertical className={`w-5 h-5 ${theme.icon}`} />
            </motion.button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className={`absolute right-0 top-full mt-2 w-48 backdrop-blur-xl rounded-xl shadow-xl z-50 ${theme.menuBg}`}
                >
                  <div className="p-2">
                    <button onClick={() => { onView(property); setShowMenu(false); }} className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${theme.menuItem}`}>
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                    <button onClick={() => { onEdit(property); setShowMenu(false); }} className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${theme.menuItem}`}>
                      <Edit className="w-4 h-4" />
                      <span>Edit Property</span>
                    </button>
                    <button className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${theme.menuItem}`}>
                      <Share2 className="w-4 h-4" />
                      <span>Share Property</span>
                    </button>
                    <button className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${theme.menuItem}`}>
                      <Download className="w-4 h-4" />
                      <span>Download Report</span>
                    </button>
                    <button onClick={() => { onToggleStatus(property.id); setShowMenu(false); }} className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${theme.menuItem}`}>
                      <RefreshCw className="w-4 h-4" />
                      <span>Toggle Status</span>
                    </button>
                    <button onClick={() => { onDelete(property.id); setShowMenu(false); }} className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${theme.deleteMenuItem}`}>
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
        <div className={`grid grid-cols-3 gap-4 mb-4 ${theme.text}`}>
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
            <div key={index} className={`p-1 rounded ${theme.amenityBg}`}>
              {amenity === 'wifi' && <Wifi className={`w-3 h-3 ${theme.amenityIcon}`} />}
              {amenity === 'parking' && <Car className={`w-3 h-3 ${theme.amenityIcon}`} />}
              {amenity === 'ac' && <AirVent className={`w-3 h-3 ${theme.amenityIcon}`} />}
              {amenity === 'tv' && <Tv className={`w-3 h-3 ${theme.amenityIcon}`} />}
            </div>
          ))}
          {property.amenities?.length > 4 && (
            <span className={`text-xs ${darkMode ? 'text-white/50' : 'text-indigo-500'}`}>+{property.amenities.length - 4} more</span>
          )}
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-2xl font-bold ${theme.price}`}>
              ${property.rent}
              <span className={`text-sm ${theme.priceUnit}`}>/month</span>
            </div>
            {property.previousRent && (
              <div className={`text-sm line-through ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                ${property.previousRent}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 ${theme.rating}`}>
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm">{property.rating || '4.5'}</span>
            </div>
            {property.trend && (
              <div className={`flex items-center space-x-1 ${property.trend === 'up' ? theme.trendUp : theme.trendDown
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

// PropertyModal component removed - now using standardized AddNewPropertyModal


// Main Component
const LandlordProperty = () => {
  const [currentSection] = useState('Properties');
  const { darkMode } = useDarkMode();
  const sidebarWidthClass = '[margin-left:var(--sidebar-width,18rem)]';
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
  // isLoading state removed — not used

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

  // Try to fetch properties from backend on mount and update local storage fallback
  // Fetch properties from API once on mount. We intentionally omit setProperties from deps.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const remote = await api.getProperties();
        if (mounted && Array.isArray(remote) && remote.length > 0) {
          // Normalize remote items to expected shape where necessary
          const normalized = remote.map(r => ({
            id: r._id || r.id || Date.now(),
            title: r.title || r.name || '',
            description: r.description || '',
            location: r.address ? `${r.address.city || ''}, ${r.address.state || ''}` : (r.location || ''),
            rent: r.rent || r.price || r.monthlyRent || 0,
            bedrooms: r.bedrooms || 0,
            bathrooms: r.bathrooms || 0,
            area: r.area || r.size || 0,
            propertyType: r.propertyType || r.type || 'apartment',
            status: r.status || (r.available ? 'Available' : 'Occupied') || 'Available',
            amenities: r.amenities || r.features || [],
            images: r.images || [],
            rating: r.rating || 4.5,
            trend: r.trend || null,
            createdAt: r.createdAt || new Date().toISOString(),
            contact: r.contact || {},
            policies: r.policies || {},
          }));

          setProperties(normalized);
        }
      } catch (err) {
        // backend not available or failed — keep localStorage copy
        console.warn('Could not load properties from API, using local data', err.message || err);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

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
      // Optimistic local update
      setProperties(prev => prev.filter(p => p.id !== propertyId));
      // Try backend delete
      (async () => {
        try {
          await api.deleteProperty(propertyId);
        } catch (err) {
          console.warn('Failed to delete property on server, changes remain local', err.message || err);
        }
      })();
    }
  };

  const handleToggleStatus = (propertyId) => {
    // Toggle locally and try to persist remotely
    setProperties(prev => prev.map(p => {
      if (p.id === propertyId) {
        const statuses = ['Available', 'Occupied', 'Maintenance'];
        const currentIndex = statuses.indexOf(p.status);
        const nextIndex = (currentIndex + 1) % statuses.length;
        const updated = { ...p, status: statuses[nextIndex] };
        // send update
        (async () => {
          try {
            await api.updateProperty(propertyId, updated);
          } catch (err) {
            console.warn('Failed to update property status on server', err.message || err);
          }
        })();
        return updated;
      }
      return p;
    }));
  };

  const handleSaveProperty = (propertyData) => {
    if (modalMode === 'edit') {
      setProperties(prev => prev.map(p => p.id === propertyData.id ? propertyData : p));
      // Try remote update
      (async () => {
        try {
          await api.updateProperty(propertyData.id, propertyData);
        } catch (err) {
          console.warn('Failed to update property on server, change kept locally', err.message || err);
        }
      })();
    } else {
      // create locally with temporary id then try creating on server
      const tempId = propertyData.id || Date.now();
      const item = { ...propertyData, id: tempId };
      setProperties(prev => [...prev, item]);
      (async () => {
        try {
          const created = await api.createProperty(propertyData);
          // replace temp item id with server id if provided
          if (created && (created._id || created.id)) {
            setProperties(prev => prev.map(p => p.id === tempId ? { ...p, id: created._id || created.id } : p));
          }
        } catch (err) {
          console.warn('Failed to create property on server, saved locally', err.message || err);
        }
      })();
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(properties, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
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
    <div className={`min-h-screen flex relative overflow-hidden ${darkMode ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-blue-950' : 'bg-gradient-to-r from-pink-100 via-purple-100 to-indigo-200'}`}>
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
                      className={`pl-4 pr-10 py-3 rounded-xl focus:outline-none transition-colors appearance-none ${darkMode ? 'bg-slate-800 border border-slate-700 text-white focus:border-cyan-500' : 'bg-white/50 border border-indigo-300 text-indigo-900 focus:border-indigo-500'}`}
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
                        className={`pl-4 pr-10 py-3 rounded-xl focus:outline-none transition-colors appearance-none ${darkMode ? 'bg-slate-800 border border-slate-700 text-white focus:border-cyan-500' : 'bg-white/50 border border-indigo-300 text-indigo-900 focus:border-indigo-500'}`}
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
                  <div className={`rounded-xl p-1 ${darkMode ? 'bg-slate-800' : 'bg-indigo-200/50'}`}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? (darkMode ? 'bg-cyan-500 text-white' : 'bg-indigo-600 text-white') : (darkMode ? 'text-slate-400 hover:text-white' : 'text-indigo-700 hover:text-indigo-900')
                        }`}
                    >
                      <Grid3X3 className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? (darkMode ? 'bg-cyan-500 text-white' : 'bg-indigo-600 text-white') : (darkMode ? 'text-slate-400 hover:text-white' : 'text-indigo-700 hover:text-indigo-900')
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
                    className={`px-4 py-3 rounded-xl font-semibold transition-colors flex items-center space-x-2 ${darkMode ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-green-500 text-white hover:bg-green-600'}`}
                  >
                    <Download className="w-5 h-5" />
                    <span>Export</span>
                  </motion.button>

                  {/* Add Property Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddProperty}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2 shadow-lg"
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
                <div className={`text-center py-20 rounded-2xl ${darkMode ? 'bg-white/5' : 'bg-white/50'}`}>
                  <Building2 className={`w-20 h-20 mx-auto mb-6 ${darkMode ? 'text-white/30' : 'text-indigo-300'}`} />
                  <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-indigo-900'}`}>No Properties Found</h3>
                  <p className={`mb-8 ${darkMode ? 'text-white/60' : 'text-indigo-700/80'}`}>
                    {searchTerm || statusFilter !== 'All'
                      ? 'Try adjusting your search criteria or filters'
                      : 'Start by adding your first property to get started'
                    }
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddProperty}
                    className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2 mx-auto"
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

      {/* Add New Property Modal (standardized) */}
      <AddNewPropertyModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        isDark={darkMode}
        mode={modalMode}
        property={selectedProperty}
        onSave={handleSaveProperty}
      />
    </div>
  );
};

export default LandlordProperty;