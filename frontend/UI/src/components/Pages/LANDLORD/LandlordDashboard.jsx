import React, { useState, useEffect, useMemo, useCallback } from 'react';
import LandlordSideBar from './LandlordSideBar';
import LandlordNavBar from './LandlordNavBar';
import AddNewPropertyModal from './AddNewPropertyModal';
import GenerateReportModal from './GenerateReportModal';
import {
  IndianRupee, Users, Wrench, BarChart3, TrendingUp, TrendingDown, Plus, Calendar, Building2
} from 'lucide-react';
// framer-motion removed to reduce animation overhead
import { useLocation, useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../../useDarkMode.js';
import api, { resolveUserId } from '../../../services/api.js';
import { useLanguage } from '../../../i18n/LanguageContext.jsx';
import { getDashboardTheme, dotPatternStyle } from '../../../styles/dashboardTheme.js';
import { getStoredUser } from '../../../services/authService.js';

// Simplified Animated Card Wrapper (no framer-motion)
const AnimatedCard = React.memo(({ children, className = '', ...props }) => {
  return (
    <div className={`relative ${className}`} {...props}>
      {children}
    </div>
  );
});

// Enhanced Floating Particles - amber accent
const FloatingParticle = React.memo(({ delay = 0, index = 0, isDark = true }) => (
  <div
    className={`absolute w-0.5 h-0.5 ${isDark
      ? 'bg-gradient-to-r from-amber-400 to-amber-600'
      : 'bg-gradient-to-r from-amber-400 to-amber-500'
      } rounded-full opacity-60`}
    style={{
      left: `${20 + (index * 15) % 60}%`,
      top: `${80 + (index * 10) % 20}%`,
      animationDelay: `${delay + (index * 0.2)}s`,
    }}
  />
));

const StatCard = React.memo(({ icon: Icon, title, value, change, trend, color, prefix = '', suffix = '', isDark = true }) => {
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;
  const th = getDashboardTheme(isDark).statCard;

  return (
    <div className={`group relative overflow-hidden ${th.cardBg} border ${th.cardBorder} rounded-3xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 ${color}`}>
      <div className="relative z-20">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${th.iconBg} backdrop-blur-sm border ${th.iconBorder}`}>
            {Icon && <Icon className={`w-6 h-6 ${th.iconColor}`} />}
          </div>
          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-sm border ${trend === 'up' ? th.trendUp : th.trendDown}`}>
            <TrendIcon className="w-3 h-3" />
            <span>{change}</span>
          </div>
        </div>
        <h3 className={`text-3xl font-black ${th.textPrimary} mb-2`}>
          {prefix}{parseInt(value).toLocaleString()}{suffix}
        </h3>
        <p className={`${th.textSecondary} font-bold text-xs uppercase tracking-widest`}>
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
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const { darkMode: isDarkMode } = useDarkMode();
  const [properties, setProperties] = useState([]);
  const [tenantStats, setTenantStats] = useState({
    activeTenants: 0,
    pendingContracts: 0
  });
  // Monthly revenue from active lease contracts (via /tenants/stats)
  const [monthlyRevenue, setMonthlyRevenue] = useState(null);
  const [maintenanceStats, setMaintenanceStats] = useState({ total: 0, pending: 0, inProgress: 0 });
  const [profile, setProfile] = useState(() => getStoredUser());

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
        color: isDarkMode ? 'from-amber-500 to-amber-600' : 'from-amber-500 to-amber-600'
      },
      {
        icon: IndianRupee,
        title: 'Monthly Revenue',
        value: revenueValue,
        change: '+0%',
        trend: revenueValue > 0 ? 'up' : 'down',
        color: isDarkMode ? 'from-amber-600 to-orange-600' : 'from-amber-500 to-orange-500',
        prefix: '₹'
      },
      {
        icon: Users,
        title: 'Active Tenants',
        value: tenantStats.activeTenants || 0,
        change: '+0%',
        trend: 'up',
        color: isDarkMode ? 'from-amber-500 to-amber-700' : 'from-amber-400 to-amber-600'
      },
      {
        icon: Wrench,
        title: 'Maintenance Requests',
        value: maintenanceStats.total || 0,
        change: maintenanceStats.pending > 0 ? `${maintenanceStats.pending} pending` : '0 pending',
        trend: maintenanceStats.pending > 0 ? 'down' : 'up',
        color: isDarkMode ? 'from-slate-700 to-slate-800' : 'from-slate-800 to-slate-900'
      }
    ];
  }, [isDarkMode, properties, tenantStats.activeTenants, monthlyRevenue, maintenanceStats]);

  // Load properties on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        let profile = null;
        try {
          profile = await api.getProfile();
          if (mounted && profile) setProfile(profile);
        } catch {
          // not authenticated or endpoint failed
        }

        const userId = resolveUserId(profile);
        let remote = [];

        if (userId) {
          try {
            remote = await api.getPropertiesByUser(userId);
          } catch (err) {
            console.warn('Could not load user properties, falling back to all properties', err);
            remote = await api.getProperties();
          }

          try {
            const stats = await api.getTenantStats();
            if (mounted && stats) {
              setTenantStats({
                activeTenants: Number(stats.activeTenants || 0),
                pendingContracts: Number(stats.pendingContracts || 0)
              });
              if (stats.monthlyRevenue != null) {
                setMonthlyRevenue(Number(stats.monthlyRevenue));
              }
            }
          } catch (statsErr) {
            console.warn('Could not load tenant stats:', statsErr);
          }

          try {
            const maintStats = await api.getMaintenanceStats(userId);
            if (mounted && maintStats?.success) {
              setMaintenanceStats(maintStats.data);
            }
          } catch (maintErr) {
            console.warn('Could not load maintenance stats:', maintErr);
          }
        } else {
            remote = await api.getProperties();
        }

        if (mounted && Array.isArray(remote)) {
          const normalized = remote.map(r => ({
            id: r._id || r.id,
            title: r.title,
            rent: r.rent || r.price || r.monthlyRent || 0,
            status: r.status || (r.available ? 'Available' : 'Occupied') || 'Available',
            tenantCount: r.tenants ? r.tenants.length : (r.tenantCount || 0),
            maintenanceRequests: r.maintenanceRequests || 0
          }));
          setProperties(normalized);
        }

      } catch (err) {
        console.warn('Dashboard: failed to load properties from API', err.message || err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const themeConfig = getDashboardTheme(isDarkMode);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Refresh monthly revenue from active leases (same source as LandlordTenant)
  useEffect(() => {
    let mounted = true;
    const fetchRevenue = async () => {
      try {
        const stats = await api.getTenantStats();
        if (mounted && stats?.monthlyRevenue != null) {
          setMonthlyRevenue(Number(stats.monthlyRevenue));
        }
      } catch (err) {
        console.warn('Could not refresh monthly revenue:', err);
      }
    };

    fetchRevenue();
    const interval = setInterval(fetchRevenue, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${themeConfig.loadingBg} flex items-center justify-center relative`}>
        <div className="absolute inset-0 opacity-[0.3]" style={dotPatternStyle} />
        <div className="text-center relative z-10">
          <div className={`w-12 h-12 border-4 ${themeConfig.spinnerBorder} rounded-full mx-auto mb-4 animate-spin`} />
          <h2 className={`text-xl font-black ${themeConfig.textPrimary} mb-1`}>{t('pages.loadingDashboard')}</h2>
          <p className={`${themeConfig.loadingText} text-sm font-medium`}>Preparing your property insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeConfig.pageBgGradient} flex relative transition-colors duration-500`}>
      <div className="absolute inset-0 opacity-[0.25] dark:opacity-[0.12] pointer-events-none" style={dotPatternStyle} />
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-400/10 rounded-full blur-[120px] pointer-events-none" />

      <LandlordSideBar currentSection={currentSection} onSectionChange={setCurrentSection} />

      <div className={`flex-1 flex flex-col relative z-10 ${sidebarWidthClass} transition-all duration-700`}>
        <LandlordNavBar currentSection={currentSection} />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">
            {/* Header Section - simplified */}
            <div className="text-center mb-12">
              <h1 className={`text-4xl md:text-5xl font-black tracking-tighter mb-4 ${themeConfig.headerTitle}`}>
                {t('tenant.welcomeBack')}{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}!
              </h1>
              <div className="w-24 h-1.5 bg-amber-500 mx-auto rounded-full mb-4" />
              <p className={`text-lg ${themeConfig.textSecondary} max-w-2xl mx-auto leading-relaxed font-medium`}>
                Your comprehensive property management dashboard with real-time insights and advanced analytics
              </p>
              {properties.length > 0 && properties.every(p => p.status !== 'Occupied') && (
                <p className={`text-sm ${themeConfig.textAccent} mt-3 flex items-center justify-center gap-2 font-bold`}>
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
                  className={`flex items-center space-x-3 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest relative overflow-hidden group ${activeTab === key && action === 'tab'
                    ? `${themeConfig.tabActive} ${themeConfig.tabActiveText} shadow-[0_10px_30px_rgba(245,158,11,0.3)]`
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
                <AnimatedCard className={`${themeConfig.cardBg} backdrop-blur-xl border ${themeConfig.cardBorder} rounded-3xl p-8 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.04)]`}>
                  <h2 className={`text-3xl font-black ${themeConfig.textPrimary} mb-8 flex items-center space-x-4 relative z-10`}>
                    <span>Quick Actions</span>
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
                        className={`group relative p-8 bg-gradient-to-br ${action.color} rounded-2xl text-white font-black shadow-[0_20px_50px_rgba(245,158,11,0.2)] text-base overflow-hidden hover:-translate-y-1 transition-all duration-300`}
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
                <AnimatedCard className={`${themeConfig.cardBg} backdrop-blur-xl border ${themeConfig.cardBorder} rounded-3xl p-8 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.04)]`}>
                  <h2 className={`text-3xl font-black ${themeConfig.textPrimary} mb-8 flex items-center space-x-4 relative z-10`}>
                    <TrendingUp className={`w-8 h-8 ${themeConfig.iconAccent}`} />
                    <span>Performance Overview</span>
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                    {[
                      {
                        value: properties.length > 0 ? `${Math.round((properties.filter(p => p.status === 'Occupied').length / properties.length) * 100)}%` : '0%',
                        label: 'Occupancy Rate',
                        color: themeConfig.metricColors[0],
                      },
                      {
                        value: '0.0',
                        label: 'Avg Rating',
                        color: themeConfig.metricColors[1],
                      },
                      {
                        value: '0.0',
                        label: 'Avg Response (hrs)',
                        color: themeConfig.metricColors[2],
                      }
                    ].map((metric) => (
                      <div
                        key={metric.label}
                        className={`relative text-center p-8 rounded-2xl border backdrop-blur-sm overflow-hidden group ${themeConfig.metricCard}`}
                      >
                        <div className={`text-4xl font-black ${metric.color} mb-3 relative z-10`}>
                          {metric.value}
                        </div>
                        <div className={`${themeConfig.textSecondary} text-sm font-black uppercase tracking-widest relative z-10`}>
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

const ScheduleInspectionModal = ({ isOpen, onClose, isDark }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState('in-person');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Scheduling inspection:', { date, time, type });
    onClose();
  };

  if (!isOpen) return null;

  const modalTheme = isDark
    ? {
      bg: 'bg-slate-900/95',
      border: 'border-slate-800',
      text: 'text-white',
      inputBg: 'bg-slate-900/80',
      inputBorder: 'border-slate-700',
      inputPlaceholder: 'placeholder-slate-400',
      focusBorder: 'focus:border-amber-500',
      buttonPrimaryBg: 'bg-amber-500 hover:bg-amber-400',
      buttonPrimaryText: 'text-slate-950',
      buttonSecondaryBg: 'bg-slate-800',
      buttonSecondaryText: 'text-slate-300',
      buttonHover: 'hover:brightness-110',
    }
    : {
      bg: 'bg-white',
      border: 'border-slate-100',
      text: 'text-slate-900',
      inputBg: 'bg-slate-50/80',
      inputBorder: 'border-slate-100',
      inputPlaceholder: 'placeholder-slate-400',
      focusBorder: 'focus:border-amber-500',
      buttonPrimaryBg: 'bg-slate-900 hover:bg-slate-800',
      buttonPrimaryText: 'text-white',
      buttonSecondaryBg: 'bg-amber-50',
      buttonSecondaryText: 'text-amber-700',
      buttonHover: 'hover:brightness-105',
    };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={`${modalTheme.bg} ${modalTheme.border} border rounded-[2rem] w-full max-w-md p-8 shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={`text-2xl font-bold mb-6 ${modalTheme.text}`}>Schedule Inspection</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${modalTheme.text}`}>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`w-full p-3 rounded-lg ${modalTheme.inputBg} ${modalTheme.inputBorder} border ${modalTheme.text} ${modalTheme.inputPlaceholder} ${modalTheme.focusBorder} focus:outline-none transition-colors`}
              required
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${modalTheme.text}`}>Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={`w-full p-3 rounded-lg ${modalTheme.inputBg} ${modalTheme.inputBorder} border ${modalTheme.text} ${modalTheme.inputPlaceholder} ${modalTheme.focusBorder} focus:outline-none transition-colors`}
              required
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${modalTheme.text}`}>Type</label>
            <div className="flex space-x-4">
              <label className={`flex items-center ${modalTheme.text}`}>
                <input
                  type="radio"
                  value="in-person"
                  checked={type === 'in-person'}
                  onChange={() => setType('in-person')}
                  className="form-radio h-4 w-4 text-amber-600 transition-colors duration-200"
                />
                <span className="ml-2">In-person</span>
              </label>
              <label className={`flex items-center ${modalTheme.text}`}>
                <input
                  type="radio"
                  value="virtual"
                  checked={type === 'virtual'}
                  onChange={() => setType('virtual')}
                  className="form-radio h-4 w-4 text-amber-600 transition-colors duration-200"
                />
                <span className="ml-2">Virtual Tour</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${modalTheme.buttonSecondaryBg} ${modalTheme.buttonSecondaryText} ${modalTheme.buttonHover}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${modalTheme.buttonPrimaryBg} ${modalTheme.buttonPrimaryText} ${modalTheme.buttonHover}`}
            >
              Schedule Visit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LandlordDashboard;
