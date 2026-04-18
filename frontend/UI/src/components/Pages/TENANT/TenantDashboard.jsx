import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDarkMode } from '../../../useDarkMode.js';
import TenantSideBar from './TenantSideBar.jsx';
import TenantNavBar from './TenantNavBar.jsx';
import api from '../../../services/api.js';
import { showErrorToast } from '../../../utils/toast.jsx';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Wrench, BarChart3, TrendingUp, TrendingDown, Building2, Heart,
  Bell, CreditCard, Star, X, AlertCircle, RefreshCw
} from 'lucide-react';

const ITEMS_PER_PAGE = 4;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const usePagination = (items, itemsPerPage = ITEMS_PER_PAGE) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(1);
  }, [currentPage, totalPages]);
  return { currentPage, totalPages, paginatedItems, setCurrentPage };
};

// ---------------------------------------------------------------------------
// StatCard — no decorative animation on static text (fix 4)
// ---------------------------------------------------------------------------
const StatCard = React.memo(({ icon: Icon, title, value, change, trend, color, prefix = '', suffix = '', isDark = true }) => {
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;
  const th = isDark
    ? {
        cardBg: 'bg-slate-800/80', cardBorder: 'border-slate-700/50',
        iconBg: 'from-cyan-500/20 to-indigo-500/20', iconBorder: 'border-cyan-400/30',
        iconColor: 'text-cyan-300', textPrimary: 'text-slate-100', textSecondary: 'text-slate-300',
        trendUp: 'bg-cyan-400/20 text-cyan-300 border-cyan-400/40',
        trendDown: 'bg-pink-400/20 text-pink-300 border-pink-400/40',
      }
    : {
        cardBg: 'bg-white/80', cardBorder: 'border-indigo-200/50',
        iconBg: 'from-indigo-100/80 to-purple-100/80', iconBorder: 'border-indigo-300/50',
        iconColor: 'text-indigo-700', textPrimary: 'text-gray-900', textSecondary: 'text-indigo-600',
        trendUp: 'bg-indigo-100/60 text-indigo-700 border-indigo-300/60',
        trendDown: 'bg-pink-100/60 text-pink-700 border-pink-300/60',
      };
  return (
    <div className={`group relative overflow-hidden ${th.cardBg} border ${th.cardBorder} rounded-2xl p-5 shadow-sm ${color}`}>
      <div className="relative z-20">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${th.iconBg} backdrop-blur-sm border ${th.iconBorder}`}>
            {Icon && <Icon className={`w-6 h-6 ${th.iconColor}`} />}
          </div>
          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm border ${trend === 'up' ? th.trendUp : th.trendDown}`}>
            <TrendIcon className="w-3 h-3" />
            <span>{change}</span>
          </div>
        </div>
        {/* Fix 4: plain text — no animate-pulse / animate-bounce */}
        <h3 className={`text-2xl font-bold ${th.textPrimary} mb-2`}>
          {prefix}{parseInt(value).toLocaleString()}{suffix}
        </h3>
        <p className={`${th.textSecondary} font-medium text-sm`}>{title}</p>
      </div>
    </div>
  );
});

// ---------------------------------------------------------------------------
// PropertyCard
// ---------------------------------------------------------------------------
const PropertyCard = React.memo(({ property, onRemove, removeConfirmId, onConfirmRemove, onCancelRemove }) => {
  const { darkMode } = useDarkMode();
  return (
    <div className={`rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group hover:scale-105 border ${
      darkMode ? 'bg-slate-800 border-slate-700 hover:shadow-blue-500/10' : 'bg-white border-gray-100 hover:shadow-blue-500/20'
    }`}>
      <div className="relative overflow-hidden">
        <img src={property.image} alt={property.title}
          className="w-full h-48 object-cover transition-all duration-700 group-hover:scale-110" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className={`absolute bottom-4 left-4 px-4 py-2 rounded-full font-semibold shadow-lg text-white ${
          darkMode ? 'bg-gradient-to-r from-blue-700 to-purple-800' : 'bg-gradient-to-r from-blue-600 to-purple-600'
        }`}>{property.price}</div>
      </div>
      <div className="p-6">
        <h3 className={`font-bold text-xl mb-2 transition-colors duration-300 ${
          darkMode ? 'text-slate-100 group-hover:text-blue-400' : 'text-gray-800 group-hover:text-blue-600'
        }`}>{property.title}</h3>
        <p className={`mb-3 flex items-center ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
          <Star className={`h-4 w-4 mr-2 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
          {property.location}
        </p>
        <p className={`text-sm mb-4 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
          {property.bedrooms} bed • {property.bathrooms} bath
        </p>
        <div className="flex justify-between items-center">
          {removeConfirmId === property.id ? (
            <div className="flex space-x-2">
              <button onClick={() => onRemove(property.id)}
                className={`text-white text-sm px-4 py-2 rounded-lg ${darkMode ? 'bg-red-700' : 'bg-red-600'}`}>
                Confirm
              </button>
              <button onClick={onCancelRemove}
                className={`text-sm px-4 py-2 rounded-lg transition-colors duration-200 ${
                  darkMode ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}>Cancel</button>
            </div>
          ) : (
            <button onClick={() => onConfirmRemove(property.id)}
              className={`transition-colors duration-200 p-2 hover:scale-110 ${
                darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'
              }`} aria-label={`Remove ${property.title} from favorites`}>
              <Heart className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

// ---------------------------------------------------------------------------
// NotificationItem
// ---------------------------------------------------------------------------
const NotificationItem = React.memo(({ notification, onMarkAsRead, onDelete }) => {
  const { darkMode } = useDarkMode();
  const typeIcon = {
    maintenance: <Wrench className={`h-6 w-6 ${darkMode ? 'text-orange-400' : 'text-orange-500'}`} />,
    payment:     <CreditCard className={`h-6 w-6 ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} />,
    general:     <Bell className={`h-6 w-6 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />,
  };
  return (
    <div
      className={`relative p-4 rounded-xl border-l-4 cursor-pointer transition-all duration-300 shadow-md hover:shadow-xl ${
        darkMode ? 'bg-slate-800' : 'bg-white'
      } ${
        notification.read
          ? (darkMode ? 'border-slate-600' : 'border-gray-300')
          : (darkMode ? 'border-blue-400' : 'border-blue-500')
      } hover:scale-105 group`}
      onClick={() => onMarkAsRead(notification.id)}
    >
      <div className="flex items-start">
        <div className={`p-2 rounded-full shadow-md group-hover:scale-110 transition-transform duration-300 ${
          darkMode ? 'bg-slate-700' : 'bg-white'
        }`}>{typeIcon[notification.type]}</div>
        <div className="flex-1 ml-4">
          <h4 className={`font-semibold mb-1 ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>{notification.title}</h4>
          <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>{notification.message}</p>
          <div className="flex justify-between items-center mt-2">
            <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{notification.time}</span>
            {/* Fix 4: replaced animate-ping dot with a static unread indicator */}
            {!notification.read && (
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" aria-label="Unread" />
            )}
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
          className={`ml-2 p-2 hover:scale-110 transition-all duration-200 ${
            darkMode ? 'text-slate-400 hover:text-red-400' : 'text-gray-400 hover:text-red-600'
          }`}
          aria-label="Delete notification">
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
});

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------
const Modal = React.memo(({ isOpen, onClose, title, children, size = 'md' }) => {
  const { darkMode } = useDarkMode();
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = 'unset'; };
    }
  }, [isOpen]);
  if (!isOpen) return null;
  const sizeClasses = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-6xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-2xl shadow-2xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto m-4`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`sticky top-0 ${darkMode ? 'bg-slate-800/95' : 'bg-white/95'} backdrop-blur-sm border-b ${
          darkMode ? 'border-slate-700' : 'border-gray-200'
        } p-6 rounded-t-2xl`}>
          <div className="flex justify-between items-center">
            <h3 className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>{title}</h3>
            <button onClick={onClose}
              className={`p-2 ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} rounded-full transition-colors duration-200 hover:scale-110`}
              aria-label={`Close ${title}`}>
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        <div className={`p-6 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>{children}</div>
      </div>
    </div>
  );
});

// ---------------------------------------------------------------------------
// Skeleton loader — shown while data is fetching (fix 3)
// ---------------------------------------------------------------------------
const SkeletonCard = ({ isDark }) => (
  <div className={`rounded-2xl p-5 border animate-pulse ${
    isDark ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white/80 border-indigo-200/50'
  }`}>
    <div className={`h-10 w-10 rounded-xl mb-4 ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`} />
    <div className={`h-6 w-24 rounded mb-2 ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`} />
    <div className={`h-4 w-32 rounded ${isDark ? 'bg-slate-700/60' : 'bg-gray-100'}`} />
  </div>
);

// ---------------------------------------------------------------------------
// Error banner (fix 3)
// ---------------------------------------------------------------------------
const ErrorBanner = ({ message, onRetry, isDark }) => (
  <div className={`flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border ${
    isDark
      ? 'bg-red-900/30 border-red-700/50 text-red-300'
      : 'bg-red-50 border-red-200 text-red-700'
  }`}>
    <div className="flex items-center gap-3">
      <AlertCircle className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm font-medium">{message}</span>
    </div>
    <button
      onClick={onRetry}
      className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${
        isDark ? 'bg-red-800/50 hover:bg-red-700/60' : 'bg-red-100 hover:bg-red-200'
      }`}
    >
      <RefreshCw className="w-3.5 h-3.5" />
      Retry
    </button>
  </div>
);

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
const TenantDashboard = () => {
  const { darkMode } = useDarkMode();
  const navigate   = useNavigate();
  const location   = useLocation();

  const [currentSection, setCurrentSection] = useState('Dashboard');

  // Fix 3: granular loading + error state per data type
  const [isLoading,  setIsLoading]  = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Fix 1 & 2: all dashboard data comes from the API — no hardcoded mock objects
  const [profile,              setProfile]              = useState(null);
  const [favouriteProperties,  setFavouriteProperties]  = useState([]);
  const [notifications,        setNotifications]        = useState([]);
  const [maintenanceRequests,  setMaintenanceRequests]  = useState([]);
  const [paymentHistory,       setPaymentHistory]       = useState([]);

  // ---------------------------------------------------------------------------
  // Data fetching — single coordinated fetch, real API calls only (fix 1 & 2)
  // ---------------------------------------------------------------------------
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      // 1. User profile (needed for tenant-scoped endpoints)
      const profileData = await api.getProfile();
      setProfile(profileData);

      const tenantId = profileData?.id;

      // 2. Run remaining fetches in parallel so the page loads faster
      const [
        favResult,
        notifResult,
        maintResult,
        payResult,
      ] = await Promise.allSettled([
        api.getFavouriteProperties(tenantId),
        api.getTenantNotifications(tenantId),
        api.getTenantMaintenanceRequests(tenantId),
        api.getTenantPaymentHistory(tenantId),
      ]);

      // Use fulfilled values; fall back to [] on individual failures
      // so a single broken endpoint doesn't blank the whole dashboard.
      setFavouriteProperties(
        favResult.status   === 'fulfilled' && Array.isArray(favResult.value)   ? favResult.value   : []
      );
      setNotifications(
        notifResult.status === 'fulfilled' && Array.isArray(notifResult.value) ? notifResult.value : []
      );
      setMaintenanceRequests(
        maintResult.status === 'fulfilled' && Array.isArray(maintResult.value) ? maintResult.value : []
      );
      setPaymentHistory(
        payResult.status   === 'fulfilled' && Array.isArray(payResult.value)   ? payResult.value   : []
      );

      // Warn in dev if any secondary fetch failed
      [favResult, notifResult, maintResult, payResult].forEach((r, i) => {
        if (r.status === 'rejected') {
          console.warn(`Dashboard fetch [${i}] failed:`, r.reason);
        }
      });
    } catch (err) {
      // Profile fetch failed — whole dashboard is unusable
      console.error('Fatal dashboard fetch error:', err);
      setFetchError('Failed to load your dashboard. Please check your connection and try again.');
      showErrorToast('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  // ---------------------------------------------------------------------------
  // Derived stats — computed from real API data, not hardcoded (fix 1 & 2)
  // ---------------------------------------------------------------------------
  const stats = useMemo(() => [
    {
      icon:   Heart,
      title:  'Favourite Properties',
      value:  favouriteProperties.length,
      change: favouriteProperties.length > 0 ? `+${favouriteProperties.length}` : '0',
      trend:  favouriteProperties.length > 0 ? 'up' : 'down',
      color:  darkMode ? 'from-cyan-500 to-indigo-600' : 'from-indigo-500 to-purple-600',
    },
    {
      icon:   Bell,
      title:  'Unread Notifications',
      value:  notifications.filter(n => !n.read).length,
      change: String(notifications.filter(n => !n.read).length),
      trend:  'up',
      color:  darkMode ? 'from-indigo-500 to-purple-600' : 'from-purple-500 to-pink-500',
    },
    {
      icon:   Wrench,
      title:  'Maintenance Requests',
      value:  maintenanceRequests.length,
      change: String(maintenanceRequests.length),
      trend:  maintenanceRequests.length > 0 ? 'down' : 'up',
      color:  darkMode ? 'from-purple-500 to-pink-600' : 'from-pink-400 to-rose-500',
    },
    {
      icon:   CreditCard,
      title:  'Payments Made',
      value:  paymentHistory.filter(p => p.status === 'Paid' || p.status === 'paid').length,
      change: String(paymentHistory.filter(p => p.status === 'Paid' || p.status === 'paid').length),
      trend:  'up',
      color:  darkMode ? 'from-pink-500 to-rose-600' : 'from-rose-400 to-pink-500',
    },
  ], [darkMode, favouriteProperties, notifications, maintenanceRequests, paymentHistory]);

  // Fix 1 & 2: Recent Activity metrics driven by real API arrays
  const activityMetrics = useMemo(() => [
    {
      value:      notifications.filter(n => !n.read).length,
      label:      'Unread Notifications',
      color:      darkMode ? 'text-cyan-400'   : 'text-indigo-600',
      bgGradient: darkMode ? 'from-cyan-500/20 to-indigo-500/20' : 'from-indigo-500/20 to-cyan-500/20',
    },
    {
      value:      maintenanceRequests.length,
      label:      'Total Requests',
      color:      darkMode ? 'text-indigo-400' : 'text-purple-600',
      bgGradient: darkMode ? 'from-indigo-500/20 to-purple-500/20' : 'from-purple-500/20 to-indigo-500/20',
    },
    {
      value:      favouriteProperties.length,
      label:      'Saved Properties',
      color:      darkMode ? 'text-purple-400' : 'text-pink-600',
      bgGradient: darkMode ? 'from-purple-500/20 to-pink-500/20' : 'from-pink-500/20 to-purple-500/20',
    },
  ], [darkMode, notifications, maintenanceRequests, favouriteProperties]);

  // ---------------------------------------------------------------------------
  // Theme config
  // ---------------------------------------------------------------------------
  const tc = darkMode
    ? {
        mainBg: 'from-gray-900 via-slate-800 to-blue-950',
        loadingBg: 'from-gray-900 via-slate-800 to-blue-950',
        cardBg: 'bg-slate-800/50', cardBorder: 'border-slate-700/50',
        textPrimary: 'text-slate-100', textSecondary: 'text-slate-200',
        textAccent: 'text-cyan-300',
        headerGradient: 'from-cyan-300 via-purple-300 to-pink-300',
        tabBg: 'bg-slate-800/50', tabBorder: 'border-slate-700/50',
        tabActive: 'from-cyan-500 to-indigo-600', tabActiveText: 'text-blue-950',
        tabInactive: 'text-slate-300 hover:text-slate-100 hover:bg-slate-700/50',
        buttonPrimary: 'from-cyan-500 to-indigo-600',
        buttonSecondary: 'from-purple-500 to-pink-600',
        iconColors: { trend: 'text-cyan-400' },
        spinnerBorder: 'border-cyan-500/30 border-t-cyan-400',
        loadingText: 'text-cyan-200',
      }
    : {
        mainBg: 'from-pink-300 via-purple-300 to-indigo-400',
        loadingBg: 'from-pink-300 via-purple-300 to-indigo-400',
        cardBg: 'bg-white/60', cardBorder: 'border-indigo-200/50',
        textPrimary: 'text-gray-900', textSecondary: 'text-indigo-600',
        textAccent: 'text-indigo-700',
        headerGradient: 'from-indigo-700 via-purple-700 to-pink-700',
        tabBg: 'bg-white/30', tabBorder: 'border-indigo-200/50',
        tabActive: 'from-indigo-600 to-purple-600', tabActiveText: 'text-white',
        tabInactive: 'text-indigo-600 hover:text-indigo-800 hover:bg-white/40',
        buttonPrimary: 'from-indigo-600 to-purple-600',
        buttonSecondary: 'from-purple-600 to-pink-600',
        iconColors: { trend: 'text-indigo-600' },
        spinnerBorder: 'border-indigo-400/40 border-t-indigo-600',
        loadingText: 'text-indigo-700',
      };

  // ---------------------------------------------------------------------------
  // Fix 3: Full-screen loading skeleton while first fetch is in flight
  // ---------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${tc.loadingBg} flex flex-col`}>
        <div className="flex flex-1">
          {/* Sidebar placeholder */}
          <div className={`w-[4.5rem] ${ darkMode ? 'bg-slate-900/60' : 'bg-white/30' }`} />
          <div className="flex-1 flex flex-col">
            {/* NavBar placeholder */}
            <div className={`h-16 border-b ${ darkMode ? 'bg-slate-900/60 border-slate-700' : 'bg-white/60 border-indigo-200' }`} />
            <main className="flex-1 p-6 space-y-6">
              {/* Header skeleton */}
              <div className={`h-10 w-64 rounded-xl mx-auto animate-pulse ${ darkMode ? 'bg-slate-700' : 'bg-white/60' }`} />
              <div className={`h-5 w-96 rounded mx-auto animate-pulse ${ darkMode ? 'bg-slate-700/60' : 'bg-white/40' }`} />
              {/* Stats skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                {[0,1,2,3].map(i => <SkeletonCard key={i} isDark={darkMode} />)}
              </div>
              {/* Content skeleton */}
              <div className={`h-48 w-full rounded-3xl animate-pulse ${ darkMode ? 'bg-slate-800/60' : 'bg-white/50' }`} />
            </main>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className={`min-h-screen bg-gradient-to-br ${tc.mainBg} flex relative`}>
      <TenantSideBar setCurrentSection={setCurrentSection} />

      <div
        className="flex-1 flex flex-col relative z-10 transition-all duration-700"
        style={{ marginLeft: 'var(--sidebar-width, 4.5rem)' }}
      >
        <TenantNavBar currentSection={currentSection} />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">

            {/* Fix 3: Error banner with retry — shown above content if fetch failed */}
            {fetchError && (
              <ErrorBanner
                message={fetchError}
                onRetry={fetchDashboardData}
                isDark={darkMode}
              />
            )}

            {/* Header — Fix 4: no animate-pulse on static text */}
            <div className="text-center mb-12">
              <h1 className={`text-4xl font-bold bg-gradient-to-r ${tc.headerGradient} bg-clip-text text-transparent mb-4`}>
                Welcome Back{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}!
              </h1>
              <p className={`text-lg ${tc.textSecondary} max-w-2xl mx-auto leading-relaxed`}>
                Your comprehensive rental management dashboard with real-time insights and property management tools.
              </p>
            </div>

            {/* Stats Grid — Fix 1 & 2: values from real API data */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {stats.map((stat, i) => (
                <StatCard key={stat.title} {...stat} delay={i * 0.15} isDark={darkMode} />
              ))}
            </div>

            {/* Tab Navigation */}
            <div className={`flex flex-wrap gap-4 mb-8 ${tc.tabBg} p-3 rounded-3xl backdrop-blur-xl border ${tc.tabBorder}`}>
              {[
                { key: 'overview',     label: 'Overview',     icon: BarChart3,  action: 'tab' },
                { key: 'properties',   label: 'Properties',   icon: Building2,  action: 'navigate', route: '/tenant/properties' },
                { key: 'maintenance',  label: 'Maintenance',  icon: Wrench,     action: 'navigate', route: '/tenant/maintenance' },
              ].map(({ key, label, icon: Icon, action, route }) => (
                <button
                  key={key}
                  onClick={() => {
                    if (action === 'tab') { setCurrentSection('Dashboard'); navigate('/tenant'); }
                    else if (action === 'navigate') { navigate(route); }
                  }}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-2xl font-bold text-sm relative overflow-hidden group ${
                    (action === 'tab' && location.pathname === '/tenant') ||
                    (action === 'navigate' && location.pathname === route)
                      ? `bg-gradient-to-r ${tc.tabActive} ${tc.tabActiveText}`
                      : tc.tabInactive
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
                <div className={`${tc.cardBg} backdrop-blur-xl border ${tc.cardBorder} rounded-3xl p-8 relative overflow-hidden`}>
                  {/* Fix 4: heading is plain — no animate-pulse */}
                  <h2 className={`text-3xl font-bold ${tc.textPrimary} mb-8 flex items-center space-x-4 relative z-10`}>
                    <span>Quick Actions</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    {[
                      { label: 'View Properties',    icon: Building2, color: tc.buttonPrimary,   onClick: () => navigate('/tenant/properties'),         description: 'Browse available rentals' },
                      { label: 'Request Maintenance', icon: Wrench,    color: tc.buttonPrimary,   onClick: () => navigate('/tenant/maintenance'),         description: 'Report issues' },
                      { label: 'View Notifications',  icon: Bell,      color: tc.buttonSecondary, onClick: () => setCurrentSection('Notifications'),     description: 'Check alerts' },
                    ].map((action) => (
                      <button
                        key={action.label}
                        onClick={action.onClick}
                        className={`group relative p-8 bg-gradient-to-br ${action.color} rounded-2xl text-white font-bold shadow-sm text-base overflow-hidden hover:opacity-95`}
                      >
                        <div className="mb-4 relative z-10"><action.icon className="w-8 h-8 mx-auto" /></div>
                        <div className="relative z-10">
                          <div className="text-lg font-bold mb-2">{action.label}</div>
                          <div className="text-sm opacity-90 font-medium">{action.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recent Activity — Fix 1 & 2: real counts, no hardcoded mock */}
                <div className={`${tc.cardBg} backdrop-blur-xl border ${tc.cardBorder} rounded-3xl p-8 relative overflow-hidden`}>
                  {/* Fix 4: heading is plain — no animate-bounce */}
                  <h2 className={`text-3xl font-bold ${tc.textPrimary} mb-8 flex items-center space-x-4 relative z-10`}>
                    <TrendingUp className={`w-8 h-8 ${tc.iconColors.trend}`} />
                    <span>Recent Activity</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                    {activityMetrics.map((metric) => (
                      <div
                        key={metric.label}
                        className={`relative text-center p-8 ${
                          darkMode ? 'bg-slate-900/60' : 'bg-white/60'
                        } rounded-2xl border ${
                          darkMode ? 'border-slate-700/50' : 'border-indigo-200/50'
                        } backdrop-blur-sm overflow-hidden group`}
                      >
                        <div className={`text-4xl font-bold ${metric.color} mb-3 relative z-10`}>
                          {metric.value}
                        </div>
                        <div className={`${tc.textSecondary} text-lg font-semibold relative z-10`}>
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
