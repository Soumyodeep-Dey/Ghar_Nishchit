import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDarkMode } from '../../../DarkModeContext';
import TenantSideBar from './TenantSideBar';
import TenantNavBar from './TenantNavBar';
import { 
  BuildingOfficeIcon, 
  HeartIcon, 
  EyeIcon, 
  MapPinIcon, 
  CurrencyDollarIcon,
  XMarkIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  StarIcon,
  CalendarIcon,
  HomeIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

// Custom hook for localStorage persistence
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

// Custom hook for intersection observer (for scroll animations)
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

// Floating Animation Component
const FloatingCard = ({ children, delay = 0 }) => {
  return (
    <div 
      className="animate-float"
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: '6s',
        animationIterationCount: 'infinite',
        animationTimingFunction: 'ease-in-out'
      }}
    >
      {children}
    </div>
  );
};

// Loading Skeleton Component
const PropertyCardSkeleton = () => {
  const { darkMode } = useDarkMode();
  return (
    <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden animate-pulse`}>
      <div className={`h-48 ${darkMode ? 'bg-slate-700' : 'bg-gray-300'}`}></div>
      <div className="p-5 space-y-3">
        <div className={`h-4 ${darkMode ? 'bg-slate-700' : 'bg-gray-300'} rounded w-3/4`}></div>
        <div className={`h-3 ${darkMode ? 'bg-slate-700' : 'bg-gray-300'} rounded w-1/2`}></div>
        <div className={`h-3 ${darkMode ? 'bg-slate-700' : 'bg-gray-300'} rounded w-full`}></div>
        <div className="flex justify-between">
          <div className={`h-3 ${darkMode ? 'bg-slate-700' : 'bg-gray-300'} rounded w-1/4`}></div>
          <div className={`h-3 ${darkMode ? 'bg-slate-700' : 'bg-gray-300'} rounded w-1/4`}></div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Property Card Component
const PropertyCard = React.memo(({ property, onToggleFavorite, onViewDetails, index }) => {
  const [setRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { darkMode } = useDarkMode();

  return (
    <div
      ref={setRef}
      className={`transform transition-all duration-700 ease-out ${
        isVisible 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-8 opacity-0'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <FloatingCard delay={index * 200}>
        <div 
          className={`${darkMode ? 'bg-slate-800 text-white' : 'bg-white'} rounded-xl shadow-lg overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-105 cursor-pointer group ${
            isHovered ? `ring-2 ${darkMode ? 'ring-cyan-400' : 'ring-blue-400'} ring-opacity-50` : ''
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative overflow-hidden">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-300 animate-pulse"></div>
            )}
            <img 
              src={property.image} 
              alt={property.title} 
              className={`w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Favorite Button with Animation */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(property.id);
              }}
              className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300"
            >
              <div className={`transition-transform duration-300 ${property.favorite ? 'scale-110' : 'scale-100'}`}>
                {property.favorite ? (
                  <HeartSolidIcon className="h-5 w-5 text-red-500 animate-pulse" />
                ) : (
                  <HeartIcon className="h-5 w-5 text-gray-600 hover:text-red-500" />
                )}
              </div>
            </button>

            {/* Property Rating */}
            <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
              <StarSolidIcon className="h-3 w-3 mr-1" />
              4.8
            </div>

            {/* Price Badge */}
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
                  <HomeIcon className={`h-4 w-4 mr-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`} />
                  {property.bedrooms} bed
                </span>
                <span className={`flex items-center ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                  <SparklesIcon className={`h-4 w-4 mr-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`} />
                  {property.bathrooms} bath
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <button
                onClick={() => onViewDetails(property)}
                className={`flex items-center ${darkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-blue-600 hover:text-blue-800'} transition-colors duration-200 font-medium`}
              >
                <EyeIcon className="h-5 w-5 mr-1" />
                View Details
              </button>
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center">
                <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                Contact
              </button>
            </div>
          </div>
        </div>
      </FloatingCard>
    </div>
  );
});

// Enhanced Modal Component
const PropertyModal = ({ property, isOpen, onClose, onToggleFavorite }) => {
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

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isOpen && !isClosing ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
      onClick={handleClose}
    >
      <div 
        className={`bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4 transform transition-all duration-300 ${
          isOpen && !isClosing ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {property && (
          <div className="relative">
            {/* Header with close button */}
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={handleClose}
                className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300"
              >
                <XMarkIcon className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            {/* Image with gradient overlay */}
            <div className="relative h-96 overflow-hidden rounded-t-2xl">
              <img 
                src={property.image} 
                alt={property.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              
              {/* Favorite button */}
              <button
                onClick={() => onToggleFavorite(property.id)}
                className="absolute top-4 left-4 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300"
              >
                {property.favorite ? (
                  <HeartSolidIcon className="h-6 w-6 text-red-500" />
                ) : (
                  <HeartIcon className="h-6 w-6 text-gray-600" />
                )}
              </button>

              {/* Property title overlay */}
              <div className="absolute bottom-6 left-6 text-white">
                <h2 className="text-3xl font-bold mb-2">{property.title}</h2>
                <p className="text-xl font-semibold">{property.price}</p>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Property Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <BuildingOfficeIcon className="h-6 w-6 mr-2 text-blue-600" />
                      Property Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-600">
                        <MapPinIcon className="h-5 w-5 mr-3 text-gray-400" />
                        <span>{property.location}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <HomeIcon className="h-5 w-5 mr-3 text-gray-400" />
                        <span>{property.bedrooms} bedrooms, {property.bathrooms} bathrooms</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <StarSolidIcon className="h-5 w-5 mr-3 text-yellow-400" />
                        <span>4.8/5 Rating (127 reviews)</span>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Features</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {['WiFi', 'Parking', 'Gym', 'Pool', 'Balcony', 'AC'].map((feature, index) => (
                        <div 
                          key={feature} 
                          className="flex items-center text-sm text-gray-600 animate-fadeIn"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description and Actions */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Description</h3>
                    <p className="text-gray-700 leading-relaxed">{property.description}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center justify-center font-semibold">
                      <CalendarIcon className="h-5 w-5 mr-2" />
                      Schedule Visit
                    </button>
                    <button className="w-full bg-gray-100 text-gray-800 py-4 rounded-xl hover:bg-gray-200 transition-all duration-300 flex items-center justify-center font-semibold">
                      <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                      Contact Landlord
                    </button>
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

// Main Component
const TenantProperty = () => {
  const { darkMode } = useDarkMode();
  const [properties, setProperties] = useLocalStorage('properties', [
    {
      id: 1,
      title: "Modern Apartment in Downtown",
      location: "123 Main St, City Center",
      price: "$1,200/month",
      image: "/api/placeholder/300/200",
      bedrooms: 2,
      bathrooms: 1,
      favorite: true,
      description: "Beautiful modern apartment with city views. Recently renovated kitchen and bathroom. Features include hardwood floors, stainless steel appliances, and in-unit laundry."
    },
    {
      id: 2,
      title: "Cozy Studio Near Park",
      location: "456 Oak Ave, Green District",
      price: "$800/month",
      image: "/api/placeholder/300/200",
      bedrooms: 1,
      bathrooms: 1,
      favorite: false,
      description: "Charming studio apartment just steps from the park. Perfect for singles or couples. Includes utilities and features a murphy bed to maximize space."
    },
    {
      id: 3,
      title: "Spacious Family Home",
      location: "789 Family Blvd, Suburbs",
      price: "$2,500/month",
      image: "/api/placeholder/300/200",
      bedrooms: 4,
      bathrooms: 3,
      favorite: true,
      description: "Large family home with backyard and garage. Close to schools and shopping centers. Features include a finished basement, deck, and two-car garage."
    },
    {
      id: 4,
      title: "Luxury Penthouse Suite",
      location: "101 Skyline Dr, Downtown",
      price: "$4,500/month",
      image: "/api/placeholder/300/200",
      bedrooms: 3,
      bathrooms: 2,
      favorite: false,
      description: "Stunning penthouse with panoramic city views. High-end finishes throughout including marble countertops, floor-to-ceiling windows, and private rooftop access."
    },
    {
      id: 5,
      title: "Charming Cottage",
      location: "321 Garden Lane, Riverside",
      price: "$1,800/month",
      image: "/api/placeholder/300/200",
      bedrooms: 2,
      bathrooms: 2,
      favorite: false,
      description: "Quaint cottage with garden views and riverside location. Features original hardwood floors, fireplace, and private patio perfect for morning coffee."
    },
    {
      id: 6,
      title: "Urban Loft",
      location: "555 Art District, Creative Quarter",
      price: "$1,600/month",
      image: "/api/placeholder/300/200",
      bedrooms: 1,
      bathrooms: 1,
      favorite: false,
      description: "Industrial loft in the heart of the art district. Exposed brick walls, high ceilings, and large windows create an inspiring living space for artists and creatives."
    }
  ]);

  const [selectedProperty, setSelectedProperty] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('title');
  const [priceRange, setPriceRange] = useState([0, 5000]);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const toggleFavorite = useCallback((id) => {
    setProperties(prev => 
      prev.map(property => 
        property.id === id 
          ? { ...property, favorite: !property.favorite } 
          : property
      )
    );
  }, [setProperties]);

  const extractPrice = (priceString) => {
    return parseInt(priceString.replace(/[^0-9]/g, ''));
  };

  const filteredAndSortedProperties = useMemo(() => {
    let filtered = properties.filter(property => {
      const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            property.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const price = extractPrice(property.price);
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
      
      if (filter === 'favorite') {
        return matchesSearch && property.favorite && matchesPrice;
      }
      
      return matchesSearch && matchesPrice;
    });

    // Sort properties
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return extractPrice(a.price) - extractPrice(b.price);
        case 'bedrooms':
          return a.bedrooms - b.bedrooms;
        default:
          return a.title.localeCompare(b.title);
      }
    });

    return filtered;
  }, [properties, searchTerm, filter, sortBy, priceRange]);

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <TenantSideBar />
        <div className="flex flex-col flex-1">
          <TenantNavBar currentSection="Properties" />
          <main className={`flex-1 p-6 overflow-y-auto ${darkMode
            ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-blue-950 text-slate-100'
            : 'bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400 text-gray-900'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <PropertyCardSkeleton key={index} />
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <TenantSideBar />
      <div className="flex flex-col flex-1">
        <TenantNavBar currentSection="Properties" />
        <main className={`flex-1 p-6 overflow-y-auto ${darkMode
          ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-blue-950 text-slate-100'
          : 'bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400 text-gray-900'
        }`}>
          {/* Hero Section */}
          <div className="mb-8 animate-fadeIn">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold text-gray-800 mb-2 animate-slideDown">
                Find Your Perfect Home
              </h1>
              <p className="text-gray-600 text-lg animate-slideUp">
                Discover amazing properties tailored to your lifestyle
              </p>
            </div>
          </div>

          {/* Enhanced Search and Filter Section */}
          <div className={`${darkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white/80 border-white/20'} backdrop-blur-sm p-6 rounded-2xl shadow-xl mb-8 border animate-slideUp`}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Search */}
              <div className="flex-1 relative">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search properties by name or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full border-2 rounded-xl px-6 py-4 focus:outline-none focus:ring-4 transition-all duration-300 pl-12 text-lg ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-cyan-500/20 focus:border-cyan-500' : 'bg-white border-gray-200 text-gray-800 placeholder-gray-500 focus:ring-blue-500/20 focus:border-blue-500'}`}
                  />
                  <MagnifyingGlassIcon className={`h-6 w-6 absolute left-4 top-5 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                </div>
              </div>
              
              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`border-2 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 transition-all duration-300 ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:ring-cyan-500/20 focus:border-cyan-500' : 'bg-white border-gray-200 text-gray-800 focus:ring-blue-500/20 focus:border-blue-500'}`}
                >
                  <option value="title">Sort by Name</option>
                  <option value="price">Sort by Price</option>
                  <option value="bedrooms">Sort by Bedrooms</option>
                </select>

                {/* Filter Buttons */}
                <button
                  onClick={() => setFilter('all')}
                  className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                    filter === 'all' 
                      ? `${darkMode ? 'bg-cyan-600' : 'bg-blue-600'} text-white shadow-lg scale-105` 
                      : darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:scale-105' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-105'
                  }`}
                >
                  All Properties
                </button>
                <button
                  onClick={() => setFilter('favorite')}
                  className={`px-6 py-3 rounded-xl flex items-center transition-all duration-300 ${
                    filter === 'favorite' 
                      ? 'bg-red-600 text-white shadow-lg scale-105' 
                      : darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:scale-105' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-105'
                  }`}
                >
                  <HeartSolidIcon className="h-5 w-5 mr-2" />
                  Favorites
                </button>
              </div>
            </div>

            {/* Price Range Slider */}
            <div className="mt-6">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                Price Range: ${priceRange[0]} - ${priceRange[1]}
              </label>
              <input
                type="range"
                min="0"
                max="5000"
                step="100"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer slider ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}
              />
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
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilter('all');
                      setPriceRange([0, 5000]);
                    }}
                    className={`${darkMode ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105`}
                  >
                    Reset Filters
                  </button>
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
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Stats Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 animate-slideUp">
            <h3 className="text-2xl font-bold text-center mb-6">Property Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:scale-105 transition-transform duration-300">
                <div className="text-3xl font-bold text-blue-600">{properties.length}</div>
                <div className="text-gray-600">Total Properties</div>
              </div>
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-red-50 to-red-100 hover:scale-105 transition-transform duration-300">
                <div className="text-3xl font-bold text-red-600">
                  {properties.filter(p => p.favorite).length}
                </div>
                <div className="text-gray-600">Favorites</div>
              </div>
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-green-100 hover:scale-105 transition-transform duration-300">
                <div className="text-3xl font-bold text-green-600">
                  ${Math.round(properties.reduce((sum, p) => sum + extractPrice(p.price), 0) / properties.length)}
                </div>
                <div className="text-gray-600">Average Price</div>
              </div>
            </div>
          </div>
        </main>

        {/* Enhanced Property Modal */}
        <PropertyModal
          property={selectedProperty}
          isOpen={!!selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onToggleFavorite={toggleFavorite}
        />
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-slideDown {
          animation: slideDown 0.8s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.8s ease-out;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
          transition: all 0.3s ease;
        }
        
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 0 0 8px rgba(37, 99, 235, 0.2);
        }
      `}</style>
    </div>
  );
};

export default TenantProperty;