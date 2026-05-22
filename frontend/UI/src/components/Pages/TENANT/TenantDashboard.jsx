import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDarkMode } from '../../../useDarkMode.js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import TenantSideBar from './TenantSideBar.jsx';
import TenantNavBar from './TenantNavBar.jsx';
import api from '../../../services/api.js';
import { showErrorToast, showSuccessToast } from '../../../utils/toast.jsx';
import { useLanguage } from '../../../i18n/LanguageContext.jsx';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Wrench, BarChart3, TrendingUp, TrendingDown, Building2, Heart,
  Bell, CreditCard, Star, X, AlertCircle, RefreshCw
} from 'lucide-react';

const ITEMS_PER_PAGE = 4;

// ---------------------------------------------------------------------------
// usePagination
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
// StatCard — no decorative animation on static text
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
          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm border ${
            trend === 'up' ? th.trendUp : th.trendDown
          }`}>
            <TrendIcon className="w-3 h-3" />
            <span>{change}</span>
          </div>
        </div>
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
      <div className="relative overflow-hidden bg-slate-100 dark:bg-slate-900/50">
        <img src={property.image} alt={property.title}
          className="w-full h-48 object-contain transition-all duration-700 group-hover:scale-110" loading="lazy" />
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
                className={`text-sm px-4 py-2 rounded-lg ${
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
        }`}>{typeIcon[notification.type] || typeIcon.general}</div>
        <div className="flex-1 ml-4">
          <h4 className={`font-semibold mb-1 ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>{notification.title}</h4>
          <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>{notification.message}</p>
          <div className="flex justify-between items-center mt-2">
            <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{notification.time}</span>
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
// Skeleton card — shown while data is fetching
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
// Error banner
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
  const { t } = useLanguage();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [currentSection, setCurrentSection] = useState('Dashboard');
  const queryClient = useQueryClient();

  // -------------------------------------------------------------------------
  // TanStack Query Declarative Data Fetching
  // -------------------------------------------------------------------------
  const { data: profile = null, isLoading: isProfileLoading, error: profileError } = useQuery({
    queryKey: ['userProfile'],
    queryFn: api.getProfile,
    staleTime: 60000,
  });

  const tenantId = profile?._id || profile?.id;

  const { data: favouriteProperties = [], isLoading: isFavLoading, error: favError } = useQuery({
    queryKey: ['favouriteProperties', tenantId],
    queryFn: () => api.getFavouriteProperties(tenantId),
    enabled: !!tenantId,
  });

  const { data: notifications = [], isLoading: isNotifLoading, error: notifError } = useQuery({
    queryKey: ['tenantNotifications', tenantId],
    queryFn: () => api.getTenantNotifications(tenantId),
    enabled: !!tenantId,
  });

  const { data: maintenanceRequests = [], isLoading: isMaintLoading, error: maintError } = useQuery({
    queryKey: ['tenantMaintenanceRequests', tenantId],
    queryFn: () => api.getTenantMaintenanceRequests(tenantId),
    enabled: !!tenantId,
  });

  const { data: paymentHistory = [], isLoading: isPayLoading, error: payError } = useQuery({
    queryKey: ['tenantPaymentHistory', tenantId],
    queryFn: () => api.getTenantPaymentHistory(tenantId),
    enabled: !!tenantId,
  });

  const isLoading = isProfileLoading || (!!tenantId && (isFavLoading || isNotifLoading || isMaintLoading || isPayLoading));
  const fetchError = profileError || favError || notifError || maintError || payError ? 'Failed to load your dashboard. Please check your connection and try again.' : null;

  const handleRetry = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    if (tenantId) {
      queryClient.invalidateQueries({ queryKey: ['favouriteProperties', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['tenantNotifications', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['tenantMaintenanceRequests', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['tenantPaymentHistory', tenantId] });
    }
  }, [queryClient, tenantId]);

  // -------------------------------------------------------------------------
  // Optimistic Cache Mutations
  // -------------------------------------------------------------------------
  const markAsReadMutation = useMutation({
    mutationFn: api.markNotificationRead,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['tenantNotifications', tenantId] });
      const previousNotifications = queryClient.getQueryData(['tenantNotifications', tenantId]);
      queryClient.setQueryData(['tenantNotifications', tenantId], (old) =>
        Array.isArray(old) ? old.map(n => (n._id === id || n.id === id) ? { ...n, read: true } : n) : []
      );
      return { previousNotifications };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['tenantNotifications', tenantId], context.previousNotifications);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tenantNotifications', tenantId] });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: api.markAllNotificationsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['tenantNotifications', tenantId] });
      const previousNotifications = queryClient.getQueryData(['tenantNotifications', tenantId]);
      queryClient.setQueryData(['tenantNotifications', tenantId], (old) =>
        Array.isArray(old) ? old.map(n => ({ ...n, read: true })) : []
      );
      return { previousNotifications };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['tenantNotifications', tenantId], context.previousNotifications);
      showErrorToast('Failed to mark notifications as read');
    },
    onSuccess: () => {
      showSuccessToast('All notifications marked as read');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tenantNotifications', tenantId] });
    }
  });

  const handleMarkAsRead = useCallback((id) => {
    markAsReadMutation.mutate(id);
  }, [markAsReadMutation]);

  const handleDeleteNotification = useCallback((id) => {
    queryClient.setQueryData(['tenantNotifications', tenantId], (old) =>
      Array.isArray(old) ? old.filter(n => n._id !== id && n.id !== id) : []
    );
  }, [queryClient, tenantId]);

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsReadMutation.mutate();
  }, [markAllAsReadMutation]);

  // -------------------------------------------------------------------------
  // Derived stats — real API data
  // -------------------------------------------------------------------------
  const stats = useMemo(() => [
    {
      icon: Heart, title: t('tenant.favouriteProperties'),
      value: favouriteProperties.length,
      change: favouriteProperties.length > 0 ? `+${favouriteProperties.length}` : '0',
      trend: favouriteProperties.length > 0 ? 'up' : 'down',
      color: darkMode ? 'from-amber-400 to-amber-600' : 'from-amber-500 to-amber-700',
    },
    {
      icon: Bell, title: t('tenant.unreadNotifications'),
      value: notifications.filter(n => !n.read).length,
      change: String(notifications.filter(n => !n.read).length),
      trend: 'up',
      color: darkMode ? 'from-yellow-400 to-amber-500' : 'from-yellow-500 to-amber-600',
    },
    {
      icon: Wrench, title: t('tenant.maintenanceRequests'),
      value: maintenanceRequests.length,
      change: String(maintenanceRequests.length),
      trend: maintenanceRequests.length > 0 ? 'down' : 'up',
      color: darkMode ? 'from-orange-400 to-amber-500' : 'from-orange-500 to-amber-600',
    },
    {
      icon: CreditCard, title: t('tenant.paymentsMade'),
      value: paymentHistory.filter(p => p.status === 'Paid' || p.status === 'paid').length,
      change: String(paymentHistory.filter(p => p.status === 'Paid' || p.status === 'paid').length),
      trend: 'up',
      color: darkMode ? 'from-amber-500 to-yellow-600' : 'from-amber-600 to-yellow-700',
    },
  ], [darkMode, favouriteProperties, notifications, maintenanceRequests, paymentHistory, t]);

  const activityMetrics = useMemo(() => [
    {
      value: notifications.filter(n => !n.read).length,
      label: t('tenant.unreadNotifications'),
      color: darkMode ? 'text-cyan-400'   : 'text-indigo-600',
    },
    {
      value: maintenanceRequests.length,
      label: t('tenant.totalRequests'),
      color: darkMode ? 'text-indigo-400' : 'text-purple-600',
    },
    {
      value: favouriteProperties.length,
      label: t('tenant.savedProperties'),
      color: darkMode ? 'text-purple-400' : 'text-pink-600',
    },
  ], [darkMode, notifications, maintenanceRequests, favouriteProperties, t]);

  // -------------------------------------------------------------------------
  // Theme config
  // -------------------------------------------------------------------------
  const tc = darkMode
    ? {
        mainBg: 'from-black via-zinc-950 to-amber-950/20',
        loadingBg: 'from-black via-zinc-950 to-amber-950/20',
        cardBg: 'bg-zinc-900/60', cardBorder: 'border-amber-500/10',
        textPrimary: 'text-slate-100', textSecondary: 'text-amber-400',
        headerGradient: 'from-amber-200 via-yellow-400 to-amber-500',
        tabBg: 'bg-zinc-900/50', tabBorder: 'border-zinc-850',
        tabActive: 'from-amber-500 to-yellow-600', tabActiveText: 'text-slate-950 font-black',
        tabInactive: 'text-slate-400 hover:text-amber-400 hover:bg-zinc-800/50',
        buttonPrimary: 'from-amber-500 to-yellow-600',
        buttonSecondary: 'bg-zinc-900 hover:bg-zinc-800 text-amber-500 border border-amber-500/30',
        iconTrend: 'text-amber-400',
        spinnerBorder: 'border-amber-500/30 border-t-amber-500',
      }
    : {
        mainBg: 'from-amber-50/40 via-stone-50 to-orange-50/30',
        loadingBg: 'from-amber-50/40 via-stone-50 to-orange-50/30',
        cardBg: 'bg-white/80', cardBorder: 'border-amber-200/50',
        textPrimary: 'text-stone-900', textSecondary: 'text-amber-700',
        headerGradient: 'from-amber-800 via-yellow-800 to-amber-900',
        tabBg: 'bg-white/40', tabBorder: 'border-amber-200/50',
        tabActive: 'from-amber-600 to-yellow-600', tabActiveText: 'text-white font-black',
        tabInactive: 'text-amber-700 hover:text-amber-900 hover:bg-white/60',
        buttonPrimary: 'from-amber-600 to-yellow-600',
        buttonSecondary: 'bg-stone-100 hover:bg-stone-200 text-amber-800 border border-amber-200/50',
        iconTrend: 'text-amber-600',
        spinnerBorder: 'border-amber-400/40 border-t-amber-600',
      };

  // -------------------------------------------------------------------------
  // Loading skeleton
  // -------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${tc.loadingBg} flex`}>
        <div className={`w-[4.5rem] ${darkMode ? 'bg-slate-900/60' : 'bg-white/30'}`} />
        <div className="flex-1 flex flex-col">
          <div className={`h-16 border-b ${darkMode ? 'bg-slate-900/60 border-slate-700' : 'bg-white/60 border-indigo-200'}`} />
          <main className="flex-1 p-6 space-y-6">
            <div className={`h-10 w-64 rounded-xl mx-auto animate-pulse ${darkMode ? 'bg-slate-700' : 'bg-white/60'}`} />
            <div className={`h-5 w-96 rounded mx-auto animate-pulse ${darkMode ? 'bg-slate-700/60' : 'bg-white/40'}`} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
              {[0,1,2,3].map(i => <SkeletonCard key={i} isDark={darkMode} />)}
            </div>
            <div className={`h-48 w-full rounded-3xl animate-pulse ${darkMode ? 'bg-slate-800/60' : 'bg-white/50'}`} />
          </main>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
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

            {/* Error banner */}
            {fetchError && (
              <ErrorBanner message={fetchError} onRetry={handleRetry} isDark={darkMode} />
            )}

            {/* Header — no animate-pulse on text */}
            <div className="text-center mb-12">
              <h1 className={`text-4xl font-bold bg-gradient-to-r ${tc.headerGradient} bg-clip-text text-transparent mb-4`}>
                {t('tenant.welcomeBack')}{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}!
              </h1>
              <p className={`text-lg ${tc.textSecondary} max-w-2xl mx-auto leading-relaxed`}>
                {t('tenant.dashboardSubtitle')}
              </p>
            </div>

            {/* Stats Grid — real API values */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {stats.map((stat, i) => (
                <StatCard key={stat.title} {...stat} delay={i * 0.15} isDark={darkMode} />
              ))}
            </div>

            {/* Tab Navigation */}
            <div className={`flex flex-wrap gap-4 mb-8 ${tc.tabBg} p-3 rounded-3xl backdrop-blur-xl border ${tc.tabBorder}`}>
              {[
                { key: 'overview',    labelKey: 'tenant.overview',    icon: BarChart3, action: 'tab' },
                { key: 'properties',  labelKey: 'sidebar.properties',  icon: Building2, action: 'navigate', route: '/tenant/properties' },
                { key: 'maintenance', labelKey: 'sidebar.maintenance', icon: Wrench,    action: 'navigate', route: '/tenant/maintenance' },
              ].map(({ key, labelKey, icon: Icon, action, route }) => (
                <button
                  key={key}
                  onClick={() => {
                    if (action === 'tab') { setCurrentSection('Dashboard'); navigate('/tenant'); }
                    else navigate(route);
                  }}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-2xl font-bold text-sm ${
                    (action === 'tab' && location.pathname === '/tenant') ||
                    (action === 'navigate' && location.pathname === route)
                      ? `bg-gradient-to-r ${tc.tabActive} ${tc.tabActiveText}`
                      : tc.tabInactive
                  }`}
                >
                  {Icon && <Icon className="w-5 h-5" />}
                  <span className="font-semibold">{t(labelKey)}</span>
                </button>
              ))}
            </div>

            {/* Overview Content */}
            {currentSection === 'Dashboard' && (
              <div className="space-y-10">

                {/* Quick Actions */}
                <div className={`${tc.cardBg} backdrop-blur-xl border ${tc.cardBorder} rounded-3xl p-8`}>
                  <h2 className={`text-3xl font-bold ${tc.textPrimary} mb-8`}>{t('tenant.quickActions')}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { id: 'viewProps', labelKey: 'tenant.viewProperties', descKey: 'tenant.browseRentals', icon: Building2, color: tc.buttonPrimary,   onClick: () => navigate('/tenant/properties') },
                      { id: 'maint', labelKey: 'tenant.requestMaintenance', descKey: 'tenant.reportIssues', icon: Wrench, color: tc.buttonPrimary, onClick: () => navigate('/tenant/maintenance') },
                      { id: 'notif', labelKey: 'tenant.viewNotifications', descKey: 'tenant.checkAlerts', icon: Bell, color: tc.buttonSecondary, onClick: () => setCurrentSection('Notifications') },
                    ].map((action) => (
                      <button key={action.id} onClick={action.onClick}
                        className={`group relative p-8 bg-gradient-to-br ${action.color} rounded-2xl text-white font-bold shadow-sm text-base hover:opacity-95`}
                      >
                        <div className="mb-4"><action.icon className="w-8 h-8 mx-auto" /></div>
                        <div className="text-lg font-bold mb-2">{t(action.labelKey)}</div>
                        <div className="text-sm opacity-90 font-medium">{t(action.descKey)}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recent Activity — real counts */}
                <div className={`${tc.cardBg} backdrop-blur-xl border ${tc.cardBorder} rounded-3xl p-8`}>
                  <h2 className={`text-3xl font-bold ${tc.textPrimary} mb-8 flex items-center space-x-4`}>
                    <TrendingUp className={`w-8 h-8 ${tc.iconTrend}`} />
                    <span>{t('tenant.recentActivity')}</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {activityMetrics.map((metric) => (
                      <div key={metric.label}
                        className={`text-center p-8 ${
                          darkMode ? 'bg-slate-900/60 border-slate-700/50' : 'bg-white/60 border-indigo-200/50'
                        } rounded-2xl border backdrop-blur-sm`}
                      >
                        <div className={`text-4xl font-bold ${metric.color} mb-3`}>{metric.value}</div>
                        <div className={`${tc.textSecondary} text-lg font-semibold`}>{metric.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* Notifications Content */}
            {currentSection === 'Notifications' && (
              <div className="space-y-10">
                <div className={`${tc.cardBg} backdrop-blur-xl border ${tc.cardBorder} rounded-3xl p-8`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                      <h2 className={`text-3xl font-bold ${tc.textPrimary} mb-2 flex items-center gap-3`}>
                        <Bell className="w-8 h-8 text-amber-500" />
                        <span>{t('tenant.notifications') || 'Notifications'}</span>
                      </h2>
                      <p className={`text-sm ${tc.textSecondary}`}>
                        Stay updated with real-time property, billing, and maintenance alerts.
                      </p>
                    </div>
                    {notifications.some(n => !n.read) && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className={`px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r ${tc.buttonPrimary} text-slate-950 hover:opacity-95 shadow-sm transition-all duration-300`}
                      >
                        Mark All as Read
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div className="text-center py-16">
                      <Bell className="w-16 h-16 text-zinc-600 mx-auto mb-4 opacity-40 animate-pulse" />
                      <p className={`text-lg font-semibold ${tc.textPrimary} mb-1`}>No Notifications Yet</p>
                      <p className={`text-sm ${tc.textSecondary} max-w-sm mx-auto`}>
                        We'll alert you here when there are updates about your properties, rents, or maintenance tickets.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {notifications.map((notif) => (
                        <NotificationItem
                          key={notif._id || notif.id}
                          notification={{
                            id: notif._id || notif.id,
                            title: notif.title,
                            message: notif.message,
                            type: notif.type || 'general',
                            read: notif.read,
                            time: notif.createdAt ? new Date(notif.createdAt).toLocaleString(undefined, {
                              dateStyle: 'short',
                              timeStyle: 'short'
                            }) : notif.time || 'Just now'
                          }}
                          onMarkAsRead={handleMarkAsRead}
                          onDelete={handleDeleteNotification}
                        />
                      ))}
                    </div>
                  )}
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
