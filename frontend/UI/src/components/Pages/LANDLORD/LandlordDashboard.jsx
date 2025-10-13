import React, { useState, useEffect, useMemo, useCallback } from 'react';
import LandlordSideBar from './LandlordSideBar';
import LandlordNavBar from './LandlordNavBar';
import AddNewPropertyModal from './AddNewPropertyModal';
import GenerateReportModal from './GenerateReportModal';
import {
  DollarSign, Users, Wrench, BarChart3, TrendingUp, TrendingDown, Plus, Calendar, Building2
} from 'lucide-react';
// framer-motion removed to reduce animation overhead
import { useLocation, useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../../useDarkMode.js';

// Enhanced Custom Hooks with better performance - commented out as they are not used
// const useIntersectionObserver = (options = {}) => {
//   const [isIntersecting, setIsIntersecting] = useState(false);
//   const [element, setElement] = useState(null);
//   const observerRef = useRef(null);

//   useEffect(() => {
//     if (!element) return;

//     if (!observerRef.current) {
//       observerRef.current = new IntersectionObserver(([entry]) => {
//         setIsIntersecting(entry.isIntersecting);
//       }, { threshold: 0.1, rootMargin: '50px', ...options });
//     }

//     observerRef.current.observe(element);

//     return () => {
//       if (observerRef.current && element) {
//         observerRef.current.unobserve(element);
//       }
//     };
//   }, [element, options]);

//   return [setElement, isIntersecting];
// };

// const useCountUp = (end, duration = 2000, start = 0, shouldStart = true) => {
//   const [count, setCount] = useState(start);
//   const animationRef = useRef();

//   useEffect(() => {
//     if (!shouldStart) return;

//     const startTime = Date.now();
//     const animate = () => {
//       const elapsed = Date.now() - startTime;
//       const progress = Math.min(elapsed / duration, 1);

//       const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
//       const currentCount = Math.floor(start + (end - start) * easeOutExpo);

//       setCount(currentCount);

//       if (progress < 1) {
//         animationRef.current = requestAnimationFrame(animate);
//       }
//     };

//     animationRef.current = requestAnimationFrame(animate);

//     return () => {
//       if (animationRef.current) {
//         cancelAnimationFrame(animationRef.current);
//       }
//     };
//   }, [end, duration, start, shouldStart]);

//   return count;
// };

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

  const stats = useMemo(() => [
    {
      icon: Building2,
      title: 'Total Properties',
      value: '24',
      change: '+12%',
      trend: 'up',
      color: isDarkMode ? 'from-cyan-500 to-indigo-600' : 'from-indigo-500 to-purple-600'
    },
    {
      icon: DollarSign,
      title: 'Monthly Revenue',
      value: '28500',
      change: '+8.2%',
      trend: 'up',
      color: isDarkMode ? 'from-indigo-500 to-purple-600' : 'from-purple-500 to-pink-500',
      prefix: '$'
    },
    {
      icon: Users,
      title: 'Active Tenants',
      value: '156',
      change: '+5.1%',
      trend: 'up',
      color: isDarkMode ? 'from-purple-500 to-pink-600' : 'from-pink-400 to-rose-500'
    },
    {
      icon: Wrench,
      title: 'Maintenance Requests',
      value: '8',
      change: '-23%',
      trend: 'down',
      color: isDarkMode ? 'from-pink-500 to-rose-600' : 'from-rose-400 to-pink-500'
    }
  ], [isDarkMode]);

  const themeConfig = isDarkMode
    ? {
      mainBg: 'from-gray-900 via-slate-800 to-blue-950',
      loadingBg: 'from-gray-900 via-slate-800 to-blue-950',
      cardBg: 'bg-slate-800/50',
      cardBorder: 'border-slate-700/50',
      textPrimary: 'text-slate-100',
      textSecondary: 'text-slate-200',
      textAccent: 'text-cyan-300',
      headerGradient: 'from-cyan-300 via-purple-300 to-pink-300',
      tabBg: 'bg-slate-800/50',
      tabBorder: 'border-slate-700/50',
      tabActive: 'from-cyan-500 to-indigo-600',
      tabActiveText: 'text-blue-950',
      tabInactive: 'text-slate-300 hover:text-slate-100 hover:bg-slate-700/50',
      buttonPrimary: 'from-cyan-500 to-indigo-600',
      buttonSecondary: 'from-purple-500 to-pink-600',
      iconColors: {
        flame: 'text-pink-400',
        trend: 'text-cyan-400',
        building: 'text-cyan-400',
        wrench: 'text-pink-400'
      },
      backgroundParticles: [
        'from-purple-500/15 to-pink-500/15',
        'from-cyan-500/15 to-indigo-500/15',
        'from-indigo-500/10 to-purple-500/10'
      ],
      spinnerBorder: 'border-cyan-500/30 border-t-cyan-400',
      loadingText: 'text-cyan-200'
    }
    : {
      mainBg: 'from-pink-300 via-purple-300 to-indigo-400',
      loadingBg: 'from-pink-300 via-purple-300 to-indigo-400',
      cardBg: 'bg-white/60',
      cardBorder: 'border-indigo-200/50',
      textPrimary: 'text-gray-900',
      textSecondary: 'text-indigo-600',
      textAccent: 'text-indigo-700',
      headerGradient: 'from-indigo-700 via-purple-700 to-pink-700',
      tabBg: 'bg-white/30',
      tabBorder: 'border-indigo-200/50',
      tabActive: 'from-indigo-600 to-purple-600',
      tabActiveText: 'text-white',
      tabInactive: 'text-indigo-600 hover:text-indigo-800 hover:bg-white/40',
      buttonPrimary: 'from-indigo-600 to-purple-600',
      buttonSecondary: 'from-purple-600 to-pink-600',
      iconColors: {
        flame: 'text-pink-600',
        trend: 'text-indigo-600',
        building: 'text-indigo-600',
        wrench: 'text-pink-600'
      },
      backgroundParticles: [
        'from-purple-300/20 to-pink-300/20',
        'from-indigo-300/20 to-purple-300/20',
        'from-pink-300/15 to-indigo-300/15'
      ],
      spinnerBorder: 'border-indigo-400/40 border-t-indigo-600',
      loadingText: 'text-indigo-700'
    };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${themeConfig.loadingBg} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`w-12 h-12 border-4 ${themeConfig.spinnerBorder} rounded-full mx-auto mb-4 animate-spin`} />
          <h2 className={`text-xl font-bold ${themeConfig.textPrimary} mb-1`}>Loading Dashboard...</h2>
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
                Welcome Back, Landlord!
              </h1>
              <p className={`text-lg ${themeConfig.textSecondary} max-w-2xl mx-auto leading-relaxed`}>
                Your comprehensive property management dashboard with real-time insights and advanced analytics
              </p>
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
                        value: '94%',
                        label: 'Occupancy Rate',
                        color: isDarkMode ? 'text-cyan-400' : 'text-indigo-600',
                        delay: 0,
                        bgGradient: isDarkMode ? 'from-cyan-500/20 to-indigo-500/20' : 'from-indigo-500/20 to-cyan-500/20'
                      },
                      {
                        value: '4.8',
                        label: 'Avg Rating',
                        color: isDarkMode ? 'text-indigo-400' : 'text-purple-600',
                        delay: 0.15,
                        bgGradient: isDarkMode ? 'from-indigo-500/20 to-purple-500/20' : 'from-purple-500/20 to-indigo-500/20'
                      },
                      {
                        value: '2.1',
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
  const [type, setType] = useState('in-person'); // 'in-person' or 'virtual'

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Scheduling inspection:', { date, time, type });
    // In a real app, you'd send this data to a backend
    onClose();
  };

  if (!isOpen) return null;

  const modalTheme = isDark
    ? {
      bg: 'bg-slate-800/90',
      border: 'border-slate-700/50',
      text: 'text-white',
      inputBg: 'bg-slate-700/50',
      inputBorder: 'border-slate-600/50',
      inputPlaceholder: 'placeholder-slate-400',
      focusBorder: 'focus:border-cyan-500',
      buttonPrimaryBg: 'bg-gradient-to-r from-cyan-500 to-indigo-600',
      buttonPrimaryText: 'text-white',
      buttonSecondaryBg: 'bg-slate-700/50',
      buttonSecondaryText: 'text-slate-300',
      buttonHover: 'hover:brightness-110',
    }
    : {
      bg: 'bg-white/90',
      border: 'border-indigo-200/50',
      text: 'text-gray-900',
      inputBg: 'bg-white/70',
      inputBorder: 'border-indigo-300/50',
      inputPlaceholder: 'placeholder-indigo-400',
      focusBorder: 'focus:border-indigo-500',
      buttonPrimaryBg: 'bg-gradient-to-r from-indigo-600 to-purple-600',
      buttonPrimaryText: 'text-white',
      buttonSecondaryBg: 'bg-indigo-100/60',
      buttonSecondaryText: 'text-indigo-700',
      buttonHover: 'hover:brightness-105',
    };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={`${modalTheme.bg} ${modalTheme.border} border rounded-2xl w-full max-w-md p-6 shadow-xl`}
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
                  className="form-radio h-4 w-4 text-blue-600 transition-colors duration-200"
                />
                <span className="ml-2">In-person</span>
              </label>
              <label className={`flex items-center ${modalTheme.text}`}>
                <input
                  type="radio"
                  value="virtual"
                  checked={type === 'virtual'}
                  onChange={() => setType('virtual')}
                  className="form-radio h-4 w-4 text-blue-600 transition-colors duration-200"
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