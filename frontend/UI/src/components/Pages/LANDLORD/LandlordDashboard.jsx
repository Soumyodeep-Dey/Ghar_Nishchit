import React, { useState, useEffect, useMemo, useCallback } from 'react';
import LandlordSideBar from './LandlordSideBar';
import LandlordNavBar from './LandlordNavBar';
import AddNewPropertyModal from './AddNewPropertyModal';
import GenerateReportModal from './GenerateReportModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  IndianRupee, Users, Wrench, BarChart3, TrendingUp, TrendingDown, Plus, Calendar, Building2
} from 'lucide-react';
// framer-motion removed to reduce animation overhead
import { useLocation, useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../../useDarkMode.js';
import api from '../../../services/api.js';
import { useLanguage } from '../../../i18n/LanguageContext.jsx';

// Simplified Animated Card Wrapper (no framer-motion)
const AnimatedCard = React.memo(({ children, className = '', ...props }) => {
  return (
    <div className={`relative ${className}`} {...props}>
      {children}
    </div>
  );
});

// Enhanced Floating Particles - Smaller Size (converted to regular div without animation)
const FloatingParticle = React.memo(({ delay = 0, index = 0, isDark = true }) => (
  <div
    className={`absolute w-0.5 h-0.5 ${isDark
      ? 'bg-gradient-to-r from-cyan-400 to-indigo-500'
      : 'bg-gradient-to-r from-indigo-400 to-purple-500'
      } rounded-full opacity-60`}
    style={{
      left: `${20 + (index * 15) % 60}%`,
      top: `${80 + (index * 10) % 20}%`,
      animationDelay: `${delay + (index * 0.2)}s`,
    }}
  />
));

// Lightweight StatCard (no framer-motion)
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

const LandlordDashboard = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarWidthClass = '[margin-left:var(--sidebar-width,24rem)]';
  const [currentSection, setCurrentSection] = useState('Dashboard');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [showGenerateReportModal, setShowGenerateReportModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [initialLoading, setInitialLoading] = useState(true);

  const { darkMode: isDarkMode } = useDarkMode();

  // -------------------------------------------------------------------------
  // TanStack Query Declarative Data Fetching
  // -------------------------------------------------------------------------
  const { data: profile = null, isLoading: isProfileLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: api.getProfile,
    staleTime: 60000,
  });

  const userId = profile?._id || profile?.id || profile?.userId;

  const { data: remoteProperties = [], isLoading: isPropsLoading } = useQuery({
    queryKey: ['landlordProperties', userId],
    queryFn: async () => {
      if (!userId) return [];
      try {
        return await api.getPropertiesByUser(userId);
      } catch (err) {
        console.warn('Could not load user properties, falling back to all properties', err);
        return await api.getProperties();
      }
    },
    enabled: !!userId,
  });

  const { data: rawStats = null, isLoading: isStatsLoading } = useQuery({
    queryKey: ['tenantStats', userId],
    queryFn: api.getTenantStats,
    enabled: !!userId,
    refetchInterval: 30000, // Professional declarative polling cache refresh
  });

  const properties = useMemo(() => {
    if (!Array.isArray(remoteProperties)) return [];
    return remoteProperties.map(r => ({
      id: r._id || r.id,
      title: r.title,
      rent: r.rent || r.price || r.monthlyRent || 0,
      status: r.status || (r.available ? 'Available' : 'Occupied') || 'Available',
      tenantCount: r.tenants ? r.tenants.length : (r.tenantCount || 0),
      maintenanceRequests: r.maintenanceRequests || 0
    }));
  }, [remoteProperties]);

  const tenantStats = useMemo(() => ({
    activeTenants: Number(rawStats?.activeTenants || 0),
    pendingContracts: Number(rawStats?.pendingContracts || 0)
  }), [rawStats]);

  const monthlyRevenue = useMemo(() => {
    return rawStats?.monthlyRevenue != null ? Number(rawStats.monthlyRevenue) : null;
  }, [rawStats]);

  const isLoading = isProfileLoading || (!!userId && (isPropsLoading || isStatsLoading));

  const updateSection = useCallback((path) => {
    if (path === '/landlord' || path === '/landlord/') {
      setCurrentSection('Dashboard');
    } else if (path.startsWith('/landlord/properties')) {
      setCurrentSection('Properties');
    } else if (path.startsWith('/landlord/tenants')) {
      setCurrentSection('Tenants');
    } else if (path.startsWith('/landlord/payment')) {
      setCurrentSection('Payments');
    } else if (path.startsWith('/landlord/maintenance')) {
      setCurrentSection('Maintenance');
    } else if (path.startsWith('/landlord/messages')) {
      setCurrentSection('Messages');
    }
  }, []);

  useEffect(() => {
    updateSection(location.pathname);
  }, [location.pathname, updateSection]);

  const themeConfig = useMemo(() => isDarkMode
    ? {
      mainBg: 'from-black via-zinc-950 to-amber-950/20',
      loadingBg: 'from-black via-zinc-950 to-amber-950/20',
      cardBg: 'bg-zinc-900/60',
      cardBorder: 'border-amber-500/10',
      textPrimary: 'text-slate-100',
      textSecondary: 'text-amber-400',
      textAccent: 'text-amber-400',
      headerGradient: 'from-amber-200 via-yellow-400 to-amber-500',
      tabBg: 'bg-zinc-900/50',
      tabBorder: 'border-zinc-850',
      tabActive: 'from-amber-500 to-yellow-600',
      tabActiveText: 'text-slate-950 font-black',
      tabInactive: 'text-slate-400 hover:text-amber-400 hover:bg-zinc-800/50',
      buttonPrimary: 'from-amber-500 to-yellow-600',
      buttonSecondary: 'bg-zinc-900 hover:bg-zinc-800 text-amber-500 border border-amber-500/30',
      iconColors: {
        flame: 'text-amber-400',
        trend: 'text-amber-400',
        building: 'text-amber-400',
        wrench: 'text-amber-400'
      },
      backgroundParticles: [
        'from-amber-500/10 to-yellow-500/10',
        'from-zinc-900/40 to-amber-950/25',
        'from-amber-900/10 to-yellow-900/10'
      ],
      spinnerBorder: 'border-amber-500/30 border-t-amber-500',
      loadingText: 'text-amber-200'
    }
    : {
      mainBg: 'from-amber-50/40 via-stone-50 to-orange-50/30',
      loadingBg: 'from-amber-50/40 via-stone-50 to-orange-50/30',
      cardBg: 'bg-white/80',
      cardBorder: 'border-amber-200/50',
      textPrimary: 'text-stone-900',
      textSecondary: 'text-amber-700',
      textAccent: 'text-amber-800',
      headerGradient: 'from-amber-800 via-yellow-800 to-amber-900',
      tabBg: 'bg-white/40',
      tabBorder: 'border-amber-200/50',
      tabActive: 'from-amber-600 to-yellow-600',
      tabActiveText: 'text-white font-black',
      tabInactive: 'text-amber-700 hover:text-amber-900 hover:bg-white/60',
      buttonPrimary: 'from-amber-600 to-yellow-600',
      buttonSecondary: 'bg-stone-100 hover:bg-stone-200 text-amber-800 border border-amber-200/50',
      iconColors: {
        flame: 'text-amber-700',
        trend: 'text-amber-700',
        building: 'text-amber-700',
        wrench: 'text-amber-700'
      },
      backgroundParticles: [
        'from-amber-200/20 to-orange-200/20',
        'from-amber-300/20 to-yellow-300/20',
        'from-orange-100/15 to-amber-100/15'
      ],
      spinnerBorder: 'border-amber-400/40 border-t-amber-600',
      loadingText: 'text-amber-700'
    }, [isDarkMode]);

  const stats = useMemo(() => {
    // Fallback: sum rent of Occupied properties if real payment stats not yet loaded
    const occupiedRentTotal = properties.reduce(
      (acc, p) => acc + (p.status === 'Occupied' ? Number(p.rent || p.price || 0) : 0),
      0
    );
    const revenueValue = monthlyRevenue !== null ? monthlyRevenue : occupiedRentTotal;

    return [
      {
        icon: Building2,
        title: 'Total Properties',
        value: properties.length || 0,
        change: '+0%',
        trend: properties.length > 0 ? 'up' : 'down',
        color: isDarkMode ? 'from-cyan-500 to-indigo-600' : 'from-indigo-500 to-purple-600'
      },
      {
        icon: IndianRupee,
        title: 'Monthly Revenue',
        value: revenueValue,
        change: '+0%',
        trend: revenueValue > 0 ? 'up' : 'down',
        color: isDarkMode ? 'from-indigo-500 to-purple-600' : 'from-purple-500 to-pink-500',
        prefix: '₹'
      },
      {
        icon: Users,
        title: 'Active Tenants',
        value: tenantStats.activeTenants || 0,
        change: '+0%',
        trend: 'up',
        color: isDarkMode ? 'from-purple-500 to-pink-600' : 'from-pink-400 to-rose-500'
      },
      {
        icon: Wrench,
        title: 'Maintenance Requests',
        value: properties.reduce((acc, p) => acc + (p.maintenanceRequests || 0), 0) || 0,
        change: '-0%',
        trend: 'down',
        color: isDarkMode ? 'from-pink-500 to-rose-600' : 'from-rose-400 to-pink-500'
      }
    ];
  }, [isDarkMode, properties, tenantStats.activeTenants, monthlyRevenue]);

  useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || initialLoading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${themeConfig.loadingBg} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`w-12 h-12 border-4 ${themeConfig.spinnerBorder} rounded-full mx-auto mb-4 animate-spin`} />
          <h2 className={`text-xl font-bold ${themeConfig.textPrimary} mb-1`}>{t('pages.loadingDashboard')}</h2>
          <p className={`${themeConfig.loadingText} text-sm`}>Preparing your property insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeConfig.mainBg} flex relative`}>

      <LandlordSideBar currentSection={currentSection} onSectionChange={setCurrentSection} />

      <div className={`flex-1 flex flex-col relative z-10 ${sidebarWidthClass} transition-all duration-700`}>
        <LandlordNavBar currentSection={currentSection} />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">
            {/* Header Section - simplified */}
            <div className="text-center mb-12">
              <h1 className={`text-4xl font-bold ${themeConfig.textPrimary} mb-4 bg-gradient-to-r ${themeConfig.headerGradient} bg-clip-text text-transparent`}>
                {t('landlord.welcomeBackLandlord')}
              </h1>
              <p className={`text-lg ${themeConfig.textSecondary} max-w-2xl mx-auto leading-relaxed`}>
                Your comprehensive property management dashboard with real-time insights and advanced analytics
              </p>
              {properties.length > 0 && properties.every(p => p.status !== 'Occupied') && (
                <p className={`text-sm ${isDarkMode ? 'text-cyan-400' : 'text-indigo-500'} mt-3 flex items-center justify-center gap-2`}>
                  💡 Tip: Your properties are listed! Check your <strong>Messages</strong> tab for tenant inquiries.
                </p>
              )}
            </div>

            {/* Stats Grid - Reduced Size */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {stats.map((stat, index) => (
                <StatCard
                  key={stat.title}
                  {...stat}
                  delay={index * 0.15}
                  isDark={isDarkMode}
                />
              ))}
            </div>

            {/* Tab Navigation - simplified */}
            <div
              className={`flex flex-wrap gap-4 mb-8 ${themeConfig.tabBg} p-3 rounded-3xl backdrop-blur-xl border ${themeConfig.tabBorder}`}
            >
              {[
                { key: 'overview', label: 'Overview', icon: BarChart3, action: 'tab' },
                { key: 'properties', label: 'Properties', icon: Building2, action: 'navigate', route: '/landlord/properties' },
                { key: 'maintenance', label: 'Maintenance', icon: Wrench, action: 'navigate', route: '/landlord/maintenance' }
              ].map(({ key, label, icon: Icon, action, route }) => (
                <button
                  key={key}
                  onClick={() => {
                    if (action === 'tab') {
                      setActiveTab(key);
                    } else if (action === 'navigate') {
                      navigate(route);
                    }
                  }}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-2xl font-bold text-sm relative overflow-hidden group ${activeTab === key && action === 'tab'
                    ? `bg-gradient-to-r ${themeConfig.tabActive} ${themeConfig.tabActiveText}`
                    : `${themeConfig.tabInactive}`
                    }`}
                >
                  {Icon && <Icon className="w-5 h-5" />}
                  <span className="relative z-10 font-semibold">{label}</span>
                </button>
              ))}
            </div>

            {/* Overview Content - simplified */}
            {activeTab === 'overview' && (
              <div className="space-y-10">
                {/* Enhanced Quick Actions */}
                <AnimatedCard className={`${themeConfig.cardBg} backdrop-blur-xl border ${themeConfig.cardBorder} rounded-3xl p-8 relative overflow-hidden`}>
                  <h2 className={`text-3xl font-bold ${themeConfig.textPrimary} mb-8 flex items-center space-x-4 relative z-10`}>
                    <span className="bg-gradient-to-r from-current to-transparent bg-clip-text">Quick Actions</span>
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    {[
                      {
                        label: 'Add New Property',
                        icon: Plus,
                        color: themeConfig.buttonPrimary,
                        onClick: () => setShowAddPropertyModal(true),
                        description: 'Expand your portfolio'
                      },
                      {
                        label: 'Schedule Inspection',
                        icon: Calendar,
                        color: themeConfig.buttonPrimary,
                        onClick: () => setShowScheduleModal(true),
                        description: 'Plan property visits'
                      },
                      {
                        label: 'Generate Report',
                        icon: BarChart3,
                        color: themeConfig.buttonSecondary,
                        onClick: () => setShowGenerateReportModal(true),
                        description: 'Analytics & insights'
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
                </AnimatedCard>

                {/* Enhanced Performance Metrics */}
                <AnimatedCard className={`${themeConfig.cardBg} backdrop-blur-xl border ${themeConfig.cardBorder} rounded-3xl p-8 relative overflow-hidden`}>
                  <h2 className={`text-3xl font-bold ${themeConfig.textPrimary} mb-8 flex items-center space-x-4 relative z-10`}>
                    <TrendingUp className={`w-8 h-8 ${themeConfig.iconColors.trend}`} />
                    <span>Performance Overview</span>
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                    {[
                      {
                        value: properties.length > 0 ? `${Math.round((properties.filter(p => p.status === 'Occupied').length / properties.length) * 100)}%` : '0%',
                        label: 'Occupancy Rate',
                        color: isDarkMode ? 'text-cyan-400' : 'text-indigo-600',
                        delay: 0,
                        bgGradient: isDarkMode ? 'from-cyan-500/20 to-indigo-500/20' : 'from-indigo-500/20 to-cyan-500/20'
                      },
                      {
                        value: '0.0',
                        label: 'Avg Rating',
                        color: isDarkMode ? 'text-indigo-400' : 'text-purple-600',
                        delay: 0.15,
                        bgGradient: isDarkMode ? 'from-indigo-500/20 to-purple-500/20' : 'from-purple-500/20 to-indigo-500/20'
                      },
                      {
                        value: '0.0',
                        label: 'Avg Response (hrs)',
                        color: isDarkMode ? 'text-purple-400' : 'text-pink-600',
                        delay: 0.3,
                        bgGradient: isDarkMode ? 'from-purple-500/20 to-pink-500/20' : 'from-pink-500/20 to-purple-500/20'
                      }
                    ].map((metric) => (
                      <div
                        key={metric.label}
                        className={`relative text-center p-8 ${isDarkMode ? 'bg-slate-900/60' : 'bg-white/60'} rounded-2xl border ${isDarkMode ? 'border-slate-700/50' : 'border-indigo-200/50'} backdrop-blur-sm overflow-hidden group`}
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
                </AnimatedCard>
              </div>
            )}
          </div>
        </main>
      </div>
      {/* Schedule Inspection Modal */}
      {showScheduleModal && (
        <ScheduleInspectionModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          isDark={isDarkMode}
          properties={properties}
        />
      )}

      {/* Add New Property Modal */}
      {showAddPropertyModal && (
        <AddNewPropertyModal
          isOpen={showAddPropertyModal}
          onClose={() => setShowAddPropertyModal(false)}
          isDark={isDarkMode}
        />
      )}

      {/* Generate Report Modal */}
      {showGenerateReportModal && (
        <GenerateReportModal
          isOpen={showGenerateReportModal}
          onClose={() => setShowGenerateReportModal(false)}
          isDark={isDarkMode}
        />
      )}
    </div>
  );
};

const ScheduleInspectionModal = ({ isOpen, onClose, isDark, properties }) => {
  const [tenants, setTenants] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedTenant, setSelectedTenant] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState('in-person');
  const [notes, setNotes] = useState('');
  const [isLoadingTenants, setIsLoadingTenants] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchTenants = async () => {
        setIsLoadingTenants(true);
        try {
          const res = await api.getMyTenants();
          if (Array.isArray(res)) {
            setTenants(res);
          }
        } catch (err) {
          console.error('Failed to load tenants:', err);
        } finally {
          setIsLoadingTenants(false);
        }
      };
      fetchTenants();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProperty || !selectedTenant || !date || !time) {
      setError('Please select a property, a tenant, date, and time.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const payload = {
        tenantId: selectedTenant,
        date,
        time,
        property: selectedProperty, // Passes the property title/ID
        type,
        notes
      };

      await api.scheduleVisit(payload);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error scheduling inspection:', err);
      setError(err.message || 'Failed to schedule inspection. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const modalTheme = isDark
    ? {
      bg: 'bg-zinc-900/95 backdrop-blur-xl',
      border: 'border-amber-500/20',
      text: 'text-slate-100',
      textMuted: 'text-zinc-400',
      inputBg: 'bg-zinc-950/80',
      inputBorder: 'border-zinc-850 focus:border-amber-500 focus:ring-amber-500/20',
      inputPlaceholder: 'placeholder-zinc-600',
      buttonPrimaryBg: 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-zinc-950 shadow-amber-500/10 shadow-lg',
      buttonSecondaryBg: 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700/50',
    }
    : {
      bg: 'bg-white/95 backdrop-blur-xl',
      border: 'border-indigo-100',
      text: 'text-gray-900',
      textMuted: 'text-gray-500',
      inputBg: 'bg-gray-50',
      inputBorder: 'border-gray-200 focus:border-amber-500 focus:ring-amber-500/20',
      inputPlaceholder: 'placeholder-gray-400',
      buttonPrimaryBg: 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold',
      buttonSecondaryBg: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200',
    };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={`${modalTheme.bg} ${modalTheme.border} border rounded-3xl w-full max-w-lg p-8 shadow-2xl transition-all duration-300 transform scale-100 relative overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <h2 className={`text-3xl font-extrabold mb-2 tracking-tight ${modalTheme.text} flex items-center gap-2`}>
          <Calendar className="w-8 h-8 text-amber-500 animate-pulse" />
          Schedule Inspection
        </h2>
        <p className={`text-sm mb-6 ${modalTheme.textMuted}`}>
          Arrange a virtual or in-person walk-through with an active tenant.
        </p>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            Inspection scheduled successfully! Closing...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Property Dropdown */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${modalTheme.textMuted}`}>Select Property</label>
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className={`w-full p-3.5 rounded-xl ${modalTheme.inputBg} ${modalTheme.inputBorder} border ${modalTheme.text} focus:outline-none focus:ring-2 transition-all`}
              required
            >
              <option value="">-- Choose a property --</option>
              {properties.map((prop) => (
                <option key={prop.id} value={prop.title}>
                  {prop.title} ({prop.status})
                </option>
              ))}
            </select>
          </div>

          {/* Tenant Dropdown */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${modalTheme.textMuted}`}>Select Tenant</label>
            {isLoadingTenants ? (
              <div className="p-3 text-sm text-zinc-500 animate-pulse">Loading tenants...</div>
            ) : (
              <select
                value={selectedTenant}
                onChange={(e) => setSelectedTenant(e.target.value)}
                className={`w-full p-3.5 rounded-xl ${modalTheme.inputBg} ${modalTheme.inputBorder} border ${modalTheme.text} focus:outline-none focus:ring-2 transition-all`}
                required
              >
                <option value="">-- Choose a tenant --</option>
                {tenants.map((ten) => (
                  <option key={ten.id || ten._id} value={ten.id || ten._id}>
                    {ten.name} - {ten.property || 'No active lease'}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${modalTheme.textMuted}`}>Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full p-3.5 rounded-xl ${modalTheme.inputBg} ${modalTheme.inputBorder} border ${modalTheme.text} focus:outline-none focus:ring-2 transition-all`}
                required
              />
            </div>
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${modalTheme.textMuted}`}>Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={`w-full p-3.5 rounded-xl ${modalTheme.inputBg} ${modalTheme.inputBorder} border ${modalTheme.text} focus:outline-none focus:ring-2 transition-all`}
                required
              />
            </div>
          </div>

          {/* Visit Type */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${modalTheme.textMuted}`}>Type</label>
            <div className="flex gap-6 mt-1">
              <label className={`flex items-center gap-2 cursor-pointer font-medium ${modalTheme.text}`}>
                <input
                  type="radio"
                  value="in-person"
                  checked={type === 'in-person'}
                  onChange={() => setType('in-person')}
                  className="form-radio h-5 w-5 text-amber-500 focus:ring-amber-500/20 accent-amber-500 transition-all"
                />
                <span>In-person</span>
              </label>
              <label className={`flex items-center gap-2 cursor-pointer font-medium ${modalTheme.text}`}>
                <input
                  type="radio"
                  value="virtual"
                  checked={type === 'virtual'}
                  onChange={() => setType('virtual')}
                  className="form-radio h-5 w-5 text-amber-500 focus:ring-amber-500/20 accent-amber-500 transition-all"
                />
                <span>Virtual Tour</span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${modalTheme.textMuted}`}>Inspection Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g., Routine quarterly plumbing check."
              rows={2}
              className={`w-full p-3.5 rounded-xl ${modalTheme.inputBg} ${modalTheme.inputBorder} border ${modalTheme.text} ${modalTheme.inputPlaceholder} focus:outline-none focus:ring-2 transition-all resize-none`}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-zinc-800/40">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${modalTheme.buttonSecondaryBg} opacity-90 hover:opacity-100 disabled:opacity-50`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-8 py-3 rounded-xl font-bold transition-all ${modalTheme.buttonPrimaryBg} disabled:opacity-50 flex items-center gap-2`}
            >
              {isSubmitting ? 'Scheduling...' : 'Schedule Visit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LandlordDashboard;
