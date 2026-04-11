import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../../useDarkMode.js';
import TenantSideBar from './TenantSideBar';
import TenantNavBar from './TenantNavBar';
import api from '../../../services/api.js';
import { showErrorToast, showSuccessToast } from '../../../utils/toast.jsx';
import {
  BuildingOfficeIcon, HeartIcon, EyeIcon, MapPinIcon, CurrencyDollarIcon,
  XMarkIcon, MagnifyingGlassIcon, CalendarIcon, HomeIcon, SparklesIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

// ─── Constants ───────────────────────────────────────────────────────────────
// Single source of truth for price range defaults.
// Used by initial state, slider attributes, and Reset Filters.
const PRICE_MIN = 0;
const PRICE_MAX = 50000;       // ₹50,000/month upper bound
const PRICE_STEP = 500;
const DEFAULT_PRICE_RANGE = [PRICE_MIN, PRICE_MAX];
// ─────────────────────────────────────────────────────────────────────────────

// Custom hook for intersection observer (scroll animations)
const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [element, setElement] = useState(null);

  useEffect(() => {
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      options
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [element, options]);

  return [setElement, isIntersecting];
};

// Floating Animation wrapper
const FloatingCard = ({ children, delay = 0 }) => (
  <div
    className="animate-float"
    style={{ animationDelay: `${delay}ms`, animationDuration: '6s', animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out' }}
  >
    {children}
  </div>
);

// Loading skeleton
const PropertyCardSkeleton = () => {
  const { darkMode } = useDarkMode();
  return (
    <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden animate-pulse`}>
      <div className={`h-48 ${darkMode ? 'bg-slate-700' : 'bg-gray-300'}`} />
      <div className="p-5 space-y-3">
        <div className={`h-4 ${darkMode ? 'bg-slate-700' : 'bg-gray-300'} rounded w-3/4`} />
        <div className={`h-3 ${darkMode ? 'bg-slate-700' : 'bg-gray-300'} rounded w-1/2`} />
        <div className={`h-3 ${darkMode ? 'bg-slate-700' : 'bg-gray-300'} rounded w-full`} />
        <div className="flex justify-between">
          <div className={`h-3 ${darkMode ? 'bg-slate-700' : 'bg-gray-300'} rounded w-1/4`} />
          <div className={`h-3 ${darkMode ? 'bg-slate-700' : 'bg-gray-300'} rounded w-1/4`} />
        </div>
      </div>
    </div>
  );
};

// ─── Schedule Visit Modal ─────────────────────────────────────────────────────
const ScheduleVisitModal = ({ property, isOpen, onClose }) => {
  const { darkMode } = useDarkMode();
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('10:00');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) { setVisitDate(''); setVisitTime('10:00'); setMessage(''); }
  }, [isOpen, property?.id]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => { setIsClosing(false); onClose(); }, 300);
  }, [onClose]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') handleClose(); };
    if (isOpen) { document.addEventListener('keydown', handler); return () => document.removeEventListener('keydown', handler); }
  }, [isOpen, handleClose]);

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!visitDate) { showErrorToast('Please select a visit date'); return; }
    setIsSubmitting(true);
    try {
      await api.scheduleVisit({
        propertyId: property.id,
        landlordId: property.landlordId,
        visitDate,
        visitTime,
        message: message.trim() || undefined,
      });
      showSuccessToast('Visit scheduled! The landlord will be notified.');
      handleClose();
    } catch (err) {
      showErrorToast(err?.response?.data?.message || 'Failed to schedule visit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center transition-all duration-300 ${isOpen && !isClosing ? 'opacity-100' : 'opacity-0'}`}
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={handleClose}
    >
      <div
        className={`${darkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'} rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all duration-300 ${isOpen && !isClosing ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between p-6 border-b ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl"><CalendarIcon className="h-6 w-6 text-blue-600" /></div>
            <div>
              <h3 className="font-bold text-lg">Schedule a Visit</h3>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'} truncate max-w-[200px]`}>{property?.title}</p>
            </div>
          </div>
          <button onClick={handleClose} className={`p-2 rounded-full ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} transition-colors`}>
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>Preferred Date <span className="text-red-500">*</span></label>
            <input type="date" value={visitDate} min={minDateStr} onChange={(e) => setVisitDate(e.target.value)} required
              className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 transition-all duration-300 ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:ring-cyan-500/20 focus:border-cyan-500' : 'bg-white border-gray-200 text-gray-800 focus:ring-blue-500/20 focus:border-blue-500'}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>Preferred Time</label>
            <select value={visitTime} onChange={(e) => setVisitTime(e.target.value)}
              className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 transition-all duration-300 ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:ring-cyan-500/20 focus:border-cyan-500' : 'bg-white border-gray-200 text-gray-800 focus:ring-blue-500/20 focus:border-blue-500'}`}
            >
              {['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'].map(t => (
                <option key={t} value={t}>{new Date(`2000-01-01T${t}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              Message to Landlord <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>(optional)</span>
            </label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3}
              placeholder="e.g. I'm interested in a 12-month lease."
              className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 transition-all duration-300 resize-none ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-cyan-500/20 focus:border-cyan-500' : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-blue-500/20 focus:border-blue-500'}`}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleClose}
              className={`flex-1 py-3 rounded-xl border-2 font-semibold transition-all duration-300 ${darkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >Cancel</button>
            <button type="submit" disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:shadow-lg hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Scheduling…</>
              ) : (
                <><CalendarIcon className="h-4 w-4" />Confirm Visit</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
// ─────────────────────────────────────────────────────────────────────────────

// Enhanced Property Card
const PropertyCard = React.memo(({ property, onToggleFavorite, onViewDetails, onContact, onScheduleVisit, index }) => {
  const [setRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { darkMode } = useDarkMode();

  return (
    <div
      ref={setRef}
      className={`transform transition-all duration-700 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <FloatingCard delay={index * 200}>
        <div
          className={`${darkMode ? 'bg-slate-800 text-white' : 'bg-white'} rounded-xl shadow-lg overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-105 cursor-pointer group ${isHovered ? `ring-2 ${darkMode ? 'ring-cyan-400' : 'ring-blue-400'} ring-opacity-50` : ''}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative overflow-hidden">
            {!imageLoaded && <div className="absolute inset-0 bg-gray-300 animate-pulse" />}
            <img src={property.image} alt={property.title}
              className={`w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)} loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(property.id); }}
              className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300"
            >
              <div className={`transition-transform duration-300 ${property.favorite ? 'scale-110' : 'scale-100'}`}>
                {property.favorite
                  ? <HeartSolidIcon className="h-5 w-5 text-red-500 animate-pulse" />
                  : <HeartIcon className="h-5 w-5 text-gray-600 hover:text-red-500" />}
              </div>
            </button>
            <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
              <StarSolidIcon className="h-3 w-3 mr-1" />4.8
            </div>
            <div className="absolute bottom-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">
              {property.price}
            </div>
          </div>

          <div className="p-5">
            <div className="flex items-start justify-between mb-2">
              <h3 className={`font-bold text-lg mb-1 group-hover:${darkMode ? 'text-cyan-400' : 'text-blue-600'} transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {property.title}
              </h3>
            </div>
            <p className={`${darkMode ? 'text-slate-300' : 'text-gray-600'} text-sm mb-3 flex items-center`}>
              <MapPinIcon className={`h-4 w-4 mr-1 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`} />
              {property.location}
            </p>
            <p className={`${darkMode ? 'text-slate-400' : 'text-gray-700'} mb-4 text-sm line-clamp-2`}>{property.description}</p>
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-4 text-sm">
                <span className={`flex items-center ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                  <HomeIcon className={`h-4 w-4 mr-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`} />{property.bedrooms} bed
                </span>
                <span className={`flex items-center ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                  <SparklesIcon className={`h-4 w-4 mr-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`} />{property.bathrooms} bath
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center gap-2">
              <button onClick={() => onViewDetails(property)}
                className={`flex items-center ${darkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-blue-600 hover:text-blue-800'} transition-colors duration-200 font-medium`}
              ><EyeIcon className="h-5 w-5 mr-1" />View Details</button>
              <button
                onClick={(e) => { e.stopPropagation(); onScheduleVisit(property); }}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${darkMode ? 'bg-slate-700 text-cyan-400 hover:bg-slate-600' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
              ><CalendarIcon className="h-4 w-4 mr-1" />Visit</button>
              <button
                onClick={(e) => { e.stopPropagation(); onContact(property); }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center"
              ><CurrencyDollarIcon className="h-4 w-4 mr-1" />Contact</button>
            </div>
          </div>
        </div>
      </FloatingCard>
    </div>
  );
});

// Property Detail Modal
const PropertyModal = ({ property, isOpen, onClose, onToggleFavorite, onContact, onScheduleVisit }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => { setIsClosing(false); onClose(); }, 300);
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = 'unset'; };
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') handleClose(); };
    if (isOpen) { document.addEventListener('keydown', handler); return () => document.removeEventListener('keydown', handler); }
  }, [isOpen, handleClose]);

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${isOpen && !isClosing ? 'opacity-100' : 'opacity-0'}`}
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4 transform transition-all duration-300 ${isOpen && !isClosing ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {property && (
          <div className="relative">
            <div className="absolute top-4 right-4 z-10">
              <button onClick={handleClose} className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300">
                <XMarkIcon className="h-6 w-6 text-gray-600" />
              </button>
            </div>
            <div className="relative h-96 overflow-hidden rounded-t-2xl">
              <img src={property.image} alt={property.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <button onClick={() => onToggleFavorite(property.id)}
                className="absolute top-4 left-4 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300"
              >
                {property.favorite ? <HeartSolidIcon className="h-6 w-6 text-red-500" /> : <HeartIcon className="h-6 w-6 text-gray-600" />}
              </button>
              <div className="absolute bottom-6 left-6 text-white">
                <h2 className="text-3xl font-bold mb-2">{property.title}</h2>
                <p className="text-xl font-semibold">{property.price}</p>
              </div>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <BuildingOfficeIcon className="h-6 w-6 mr-2 text-blue-600" />Property Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-600"><MapPinIcon className="h-5 w-5 mr-3 text-gray-400" /><span>{property.location}</span></div>
                      <div className="flex items-center text-gray-600"><HomeIcon className="h-5 w-5 mr-3 text-gray-400" /><span>{property.bedrooms} bedrooms, {property.bathrooms} bathrooms</span></div>
                      <div className="flex items-center text-gray-600"><StarSolidIcon className="h-5 w-5 mr-3 text-yellow-400" /><span>4.8/5 Rating (127 reviews)</span></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Features</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {['WiFi','Parking','Gym','Pool','Balcony','AC'].map((feature, index) => (
                        <div key={feature} className="flex items-center text-sm text-gray-600 animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />{feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Description</h3>
                    <p className="text-gray-700 leading-relaxed">{property.description}</p>
                  </div>
                  <div className="space-y-3">
                    <button
                      onClick={() => { handleClose(); setTimeout(() => onScheduleVisit(property), 310); }}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center justify-center font-semibold"
                    ><CalendarIcon className="h-5 w-5 mr-2" />Schedule Visit</button>
                    <button
                      onClick={() => onContact(property)}
                      className="w-full bg-gray-100 text-gray-800 py-4 rounded-xl hover:bg-gray-200 transition-all duration-300 flex items-center justify-center font-semibold"
                    ><CurrencyDollarIcon className="h-5 w-5 mr-2" />Contact Landlord</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const TenantProperty = () => {
  const { darkMode } = useDarkMode();
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [scheduleProperty, setScheduleProperty] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('title');

  // ── Price range: single source of truth via PRICE_MIN / PRICE_MAX constants
  const [priceRange, setPriceRange] = useState(DEFAULT_PRICE_RANGE);

  // ── Centralised reset so every "Reset Filters" call is identical
  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setFilter('all');
    setSortBy('title');
    setPriceRange(DEFAULT_PRICE_RANGE);
  }, []);

  // ── Fetch properties + saved favorites in parallel on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch properties and favorites concurrently; favorites failure is non-fatal
        const [propertiesRes, favoritesRes] = await Promise.allSettled([
          api.getProperties(),
          api.getFavorites(),
        ]);

        const propertiesData = propertiesRes.status === 'fulfilled' ? propertiesRes.value : [];
        // Favorites API returns array of property IDs or objects with an `_id` / `propertyId` field
        const rawFavs = favoritesRes.status === 'fulfilled' ? (favoritesRes.value || []) : [];
        const favoriteIds = new Set(
          rawFavs.map(f => (typeof f === 'string' ? f : (f.propertyId || f._id || f.id)))
        );

        if (propertiesRes.status === 'rejected') {
          showErrorToast('Failed to load properties');
        }

        const transformed = propertiesData.map(prop => {
          let locationString = 'Location not specified';
          if (prop.address) {
            if (typeof prop.address === 'string') {
              locationString = prop.address;
            } else {
              const { street, city, state, zip } = prop.address;
              locationString = [street, city, state, zip].filter(Boolean).join(', ') || 'Location not specified';
            }
          }
          const propId = prop._id || prop.id;
          return {
            id: propId,
            title: prop.title || 'Untitled Property',
            price: `₹${prop.price || 0}/month`,
            location: locationString,
            description: prop.description || 'No description available',
            image: prop.images?.length > 0
              ? prop.images[0]
              : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E',
            bedrooms: prop.bedrooms || 0,
            bathrooms: prop.bathrooms || 0,
            landlordId: prop.landlordId || prop.owner || null,
            landlordName: prop.landlordName || prop.ownerName || 'Landlord',
            // Merge saved favorites from backend
            favorite: favoriteIds.has(String(propId)),
          };
        });

        setProperties(transformed);
      } catch (error) {
        console.error('Error fetching properties:', error);
        showErrorToast('Failed to load properties');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Contact: navigate to messages with landlord pre-selected (Task 1)
  const handleContact = useCallback((property) => {
    navigate('/tenant/messages', {
      state: {
        contactLandlord: true,
        landlordId: property.landlordId,
        landlordName: property.landlordName || 'Landlord',
        propertyTitle: property.title,
        propertyId: property.id,
      },
    });
  }, [navigate]);

  // ── Schedule Visit: open modal (Task 2)
  const handleScheduleVisit = useCallback((property) => setScheduleProperty(property), []);

  // ── Toggle favorite: optimistic UI update + backend sync
  const toggleFavorite = useCallback(async (id) => {
    // 1. Optimistic update
    setProperties(prev =>
      prev.map(p => p.id === id ? { ...p, favorite: !p.favorite } : p)
    );

    try {
      // 2. Sync with backend; returns { favorited: true|false }
      const result = await api.toggleFavorite(id);
      const favorited = result?.favorited;

      // 3. If backend disagrees with optimistic state, correct it
      if (typeof favorited === 'boolean') {
        setProperties(prev =>
          prev.map(p => p.id === id ? { ...p, favorite: favorited } : p)
        );
      }

      showSuccessToast(
        favorited === false ? 'Removed from favorites' : 'Added to favorites'
      );
    } catch (err) {
      console.error('toggleFavorite error:', err);
      // 4. Roll back optimistic update on failure
      setProperties(prev =>
        prev.map(p => p.id === id ? { ...p, favorite: !p.favorite } : p)
      );
      showErrorToast('Could not update favorite. Please try again.');
    }
  }, []);

  const extractPrice = (priceString) => parseInt(priceString.replace(/[^0-9]/g, ''));

  const filteredAndSortedProperties = useMemo(() => {
    let filtered = properties.filter(property => {
      const matchesSearch =
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase());
      const price = extractPrice(property.price);
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
      if (filter === 'favorite') return matchesSearch && property.favorite && matchesPrice;
      return matchesSearch && matchesPrice;
    });

    filtered.sort((a, b) => {
      if (sortBy === 'price') return extractPrice(a.price) - extractPrice(b.price);
      if (sortBy === 'bedrooms') return a.bedrooms - b.bedrooms;
      return a.title.localeCompare(b.title);
    });

    return filtered;
  }, [properties, searchTerm, filter, sortBy, priceRange]);

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <TenantSideBar />
        <div className="flex flex-col flex-1" style={{ marginLeft: 'var(--sidebar-width, 4.5rem)' }}>
          <TenantNavBar currentSection="Properties" />
          <main className={`flex-1 p-6 overflow-y-auto ${darkMode ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-blue-950 text-slate-100' : 'bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400 text-gray-900'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <PropertyCardSkeleton key={i} />)}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <TenantSideBar />
      <div className="flex flex-col flex-1" style={{ marginLeft: 'var(--sidebar-width, 4.5rem)' }}>
        <TenantNavBar currentSection="Properties" />
        <main className={`flex-1 p-6 overflow-y-auto ${darkMode ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-blue-950 text-slate-100' : 'bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400 text-gray-900'}`}>

          {/* Hero */}
          <div className="mb-8 animate-fadeIn">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold text-gray-800 mb-2 animate-slideDown">Find Your Perfect Home</h1>
              <p className="text-gray-600 text-lg animate-slideUp">Discover amazing properties tailored to your lifestyle</p>
            </div>
          </div>

          {/* Search + Filters */}
          <div className={`${darkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white/80 border-white/20'} backdrop-blur-sm p-6 rounded-2xl shadow-xl mb-8 border animate-slideUp`}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Search */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search properties by name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full border-2 rounded-xl px-6 py-4 focus:outline-none focus:ring-4 transition-all duration-300 pl-12 text-lg ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-cyan-500/20 focus:border-cyan-500' : 'bg-white border-gray-200 text-gray-800 placeholder-gray-500 focus:ring-blue-500/20 focus:border-blue-500'}`}
                />
                <MagnifyingGlassIcon className={`h-6 w-6 absolute left-4 top-5 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`} />
              </div>

              <div className="flex flex-wrap gap-3">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                  className={`border-2 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 transition-all duration-300 ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:ring-cyan-500/20 focus:border-cyan-500' : 'bg-white border-gray-200 text-gray-800 focus:ring-blue-500/20 focus:border-blue-500'}`}
                >
                  <option value="title">Sort by Name</option>
                  <option value="price">Sort by Price</option>
                  <option value="bedrooms">Sort by Bedrooms</option>
                </select>

                <button onClick={() => setFilter('all')}
                  className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                    filter === 'all'
                      ? `${darkMode ? 'bg-cyan-600' : 'bg-blue-600'} text-white shadow-lg scale-105`
                      : darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:scale-105' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-105'
                  }`}
                >All Properties</button>

                <button onClick={() => setFilter('favorite')}
                  className={`px-6 py-3 rounded-xl flex items-center transition-all duration-300 ${
                    filter === 'favorite'
                      ? 'bg-red-600 text-white shadow-lg scale-105'
                      : darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:scale-105' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-105'
                  }`}
                ><HeartSolidIcon className="h-5 w-5 mr-2" />Favorites</button>

                {/* Visible Reset Filters button in the toolbar */}
                <button onClick={resetFilters}
                  className={`px-4 py-3 rounded-xl flex items-center gap-1 transition-all duration-300 ${
                    darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <XMarkIcon className="h-4 w-4" />Reset
                </button>
              </div>
            </div>

            {/* Price Range Slider — max driven by PRICE_MAX constant */}
            <div className="mt-6">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                Price Range: ₹{priceRange[0].toLocaleString('en-IN')} – ₹{priceRange[1].toLocaleString('en-IN')}/month
              </label>
              <input
                type="range"
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={PRICE_STEP}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer slider ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}
              />
              <div className={`flex justify-between text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                <span>₹0</span>
                <span>₹{(PRICE_MAX / 2).toLocaleString('en-IN')}</span>
                <span>₹{PRICE_MAX.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Properties Grid */}
          <div className="mb-8">
            {filteredAndSortedProperties.length === 0 ? (
              <div className="col-span-full text-center py-16 animate-fadeIn">
                <div className="max-w-md mx-auto">
                  <BuildingOfficeIcon className={`h-24 w-24 mx-auto mb-6 animate-bounce ${darkMode ? 'text-slate-500' : 'text-gray-400'}`} />
                  <h3 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>No properties found</h3>
                  <p className={`text-lg mb-6 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                    Try adjusting your search criteria or browse all available properties
                  </p>
                  {/* Uses the same centralised resetFilters — no inconsistency */}
                  <button onClick={resetFilters}
                    className={`${darkMode ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105`}
                  >Reset Filters</button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredAndSortedProperties.map((property, index) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onToggleFavorite={toggleFavorite}
                    onViewDetails={setSelectedProperty}
                    onContact={handleContact}
                    onScheduleVisit={handleScheduleVisit}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 animate-slideUp">
            <h3 className="text-2xl font-bold text-center mb-6">Property Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:scale-105 transition-transform duration-300">
                <div className="text-3xl font-bold text-blue-600">{properties.length}</div>
                <div className="text-gray-600">Total Properties</div>
              </div>
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-red-50 to-red-100 hover:scale-105 transition-transform duration-300">
                <div className="text-3xl font-bold text-red-600">{properties.filter(p => p.favorite).length}</div>
                <div className="text-gray-600">Favorites</div>
              </div>
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-green-100 hover:scale-105 transition-transform duration-300">
                <div className="text-3xl font-bold text-green-600">
                  ₹{properties.length > 0 ? Math.round(properties.reduce((sum, p) => sum + extractPrice(p.price), 0) / properties.length).toLocaleString('en-IN') : 0}
                </div>
                <div className="text-gray-600">Average Price</div>
              </div>
            </div>
          </div>
        </main>

        <PropertyModal
          property={selectedProperty}
          isOpen={!!selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onToggleFavorite={toggleFavorite}
          onContact={handleContact}
          onScheduleVisit={handleScheduleVisit}
        />

        <ScheduleVisitModal
          property={scheduleProperty}
          isOpen={!!scheduleProperty}
          onClose={() => setScheduleProperty(null)}
        />
      </div>

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideDown { from{transform:translateY(-20px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
        .animate-float{animation:float 6s ease-in-out infinite}
        .animate-fadeIn{animation:fadeIn 0.5s ease-out}
        .animate-slideDown{animation:slideDown 0.8s ease-out}
        .animate-slideUp{animation:slideUp 0.8s ease-out}
        .line-clamp-2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        .slider::-webkit-slider-thumb{appearance:none;height:20px;width:20px;border-radius:50%;background:#2563eb;cursor:pointer;box-shadow:0 0 0 4px rgba(37,99,235,0.2);transition:all 0.3s ease}
        .slider::-webkit-slider-thumb:hover{transform:scale(1.1);box-shadow:0 0 0 8px rgba(37,99,235,0.2)}
      `}</style>
    </div>
  );
};

export default TenantProperty;
