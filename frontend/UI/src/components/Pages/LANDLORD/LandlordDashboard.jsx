import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import LandlordSideBar from './LandlordSideBar';
import LandlordNavBar from './LandlordNavBar';
import AddNewPropertyModal from './AddNewPropertyModal';
import GenerateReportModal from './GenerateReportModal';
import {
  DollarSign, Users, Wrench, BarChart3, TrendingUp, TrendingDown, Plus, Calendar, Flame, Sparkles, Building2, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../../useDarkMode.js';

// Enhanced Custom Hooks with better performance
const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [element, setElement] = useState(null);
  const observerRef = useRef(null);

  useEffect(() => {
    if (!element) return;

    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      }, { threshold: 0.1, rootMargin: '50px', ...options });
    }

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current && element) {
        observerRef.current.unobserve(element);
      }
    };
  }, [element, options]);

  return [setElement, isIntersecting];
};

const useCountUp = (end, duration = 2000, start = 0, shouldStart = true) => {
  const [count, setCount] = useState(start);
  const animationRef = useRef();

  useEffect(() => {
    if (!shouldStart) return;

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentCount = Math.floor(start + (end - start) * easeOutExpo);

      setCount(currentCount);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [end, duration, start, shouldStart]);

  return count;
};

// Enhanced Animated Components - Reduced Sizes
const AnimatedCard = React.memo(({ children, delay = 0, className = '', ...props }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={isVisible ? {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 25,
          duration: 0.8,
          delay
        }
      } : {}}
      whileHover={{
        y: -4,
        scale: 1.01,
        transition: { type: "spring", stiffness: 400, damping: 25 }
      }}
      className={`relative ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
});

// Enhanced Floating Particles - Smaller Size
const FloatingParticle = React.memo(({ delay = 0, index = 0, isDark = true }) => (
  <motion.div
    className={`absolute w-0.5 h-0.5 ${isDark
      ? 'bg-gradient-to-r from-cyan-400 to-indigo-500'
      : 'bg-gradient-to-r from-indigo-400 to-purple-500'
      } rounded-full`}
    style={{
      left: `${20 + (index * 15) % 60}%`,
      top: `${80 + (index * 10) % 20}%`,
    }}
    animate={{
      y: [-15, -80],
      x: [0, (Math.sin(index) * 30)],
      opacity: [0, isDark ? 0.8 : 0.6, 0],
      scale: [0.5, 1, 0.5],
    }}
    transition={{
      duration: 4 + (index % 3),
      delay: delay + (index * 0.2),
      repeat: Infinity,
      ease: "easeOut",
    }}
  />
));

// Enhanced StatCard - Reduced Size
const StatCard = React.memo(({
  icon: Icon,
  title,
  value,
  change,
  trend,
  color,
  delay = 0,
  prefix = '',
  suffix = '',
  isDark = true
}) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.3 });
  const animatedValue = useCountUp(parseInt(value) || 0, 2500, 0, isVisible);
  const [isHovered, setIsHovered] = useState(false);

  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;

  const themeStyles = isDark
    ? {
      cardBg: 'bg-slate-800/80',
      cardBorder: 'border-slate-700/50',
      cardShadow: 'hover:shadow-cyan-500/10',
      iconBg: 'from-cyan-500/20 to-indigo-500/20',
      iconBorder: 'border-cyan-400/30',
      iconColor: 'text-cyan-300',
      textPrimary: 'text-slate-100',
      textSecondary: 'text-slate-300',
      glowEffect: 'from-cyan-400/20 to-purple-500/20',
      shimmer: 'via-cyan-300/20',
      trendUp: 'bg-cyan-400/20 text-cyan-300 border-cyan-400/40',
      trendDown: 'bg-pink-400/20 text-pink-300 border-pink-400/40'
    }
    : {
      cardBg: 'bg-white/80',
      cardBorder: 'border-indigo-200/50',
      cardShadow: 'hover:shadow-indigo-500/20',
      iconBg: 'from-indigo-100/80 to-purple-100/80',
      iconBorder: 'border-indigo-300/50',
      iconColor: 'text-indigo-700',
      textPrimary: 'text-gray-900',
      textSecondary: 'text-indigo-600',
      glowEffect: 'from-indigo-400/20 to-purple-500/20',
      shimmer: 'via-indigo-300/20',
      trendUp: 'bg-indigo-100/60 text-indigo-700 border-indigo-300/60',
      trendDown: 'bg-pink-100/60 text-pink-700 border-pink-300/60'
    };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
      animate={isVisible ? {
        opacity: 1,
        scale: 1,
        rotateY: 0,
        transition: { type: "spring", stiffness: 120, damping: 20, delay }
      } : {}}
      whileHover={{
        scale: 1.05,
        rotateY: 5,
        transition: { type: "spring", stiffness: 300, damping: 20 }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative overflow-hidden backdrop-blur-xl ${themeStyles.cardBg} border ${themeStyles.cardBorder} rounded-2xl p-5 shadow-xl ${themeStyles.cardShadow} transition-all duration-500 ${color}`}
    >
      {/* Enhanced Floating particles - Smaller */}
      <div className="absolute inset-0 overflow-hidden opacity-60">
        {[...Array(3)].map((_, i) => (
          <FloatingParticle key={i} delay={i * 0.3} index={i} isDark={isDark} />
        ))}
      </div>

      {/* Animated gradient overlay */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${themeStyles.glowEffect}`}
        animate={isHovered ? { opacity: 1, scale: 1.1 } : { opacity: 0.5, scale: 1 }}
        transition={{ duration: 0.4 }}
      />

      {/* Theme-aware glow effect */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${themeStyles.glowEffect} rounded-2xl blur-xl`}
        animate={isHovered ? { opacity: 0.8, scale: 1.2 } : { opacity: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
      />

      <div className="relative z-20">
        <div className="flex items-center justify-between mb-4">
          <motion.div
            className={`p-3 rounded-xl bg-gradient-to-br ${themeStyles.iconBg} backdrop-blur-sm border ${themeStyles.iconBorder}`}
            whileHover={{
              rotate: 15,
              scale: 1.1,
              boxShadow: isDark ? "0 8px 25px rgba(6, 182, 212, 0.3)" : "0 8px 25px rgba(99, 102, 241, 0.3)"
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Icon className={`w-6 h-6 ${themeStyles.iconColor} drop-shadow-lg`} />
          </motion.div>

          <motion.div
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm border ${trend === 'up' ? themeStyles.trendUp : themeStyles.trendDown
              }`}
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={isVisible ? { opacity: 1, x: 0, scale: 1 } : {}}
            transition={{ delay: delay + 0.4, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              animate={{ rotate: trend === 'up' ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              <TrendIcon className="w-3 h-3" />
            </motion.div>
            <span>{change}</span>
          </motion.div>
        </div>

        <motion.h3
          className={`text-2xl font-bold ${themeStyles.textPrimary} mb-2 drop-shadow-lg`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: delay + 0.2, type: "spring", stiffness: 150 }}
        >
          {prefix}{isVisible ? animatedValue.toLocaleString() : 0}{suffix}
        </motion.h3>

        <motion.p
          className={`${themeStyles.textSecondary} font-medium text-sm`}
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ delay: delay + 0.6 }}
        >
          {title}
        </motion.p>

        {/* Enhanced shimmer effect */}
        <motion.div
          className={`absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent ${themeStyles.shimmer} to-transparent`}
          animate={isHovered ? { x: ['-100%', '200%'] } : {}}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
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
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${themeConfig.loadingBg} flex items-center justify-center relative overflow-hidden`}>
        <div className="absolute inset-0">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
            className={`absolute top-1/4 left-1/4 w-48 h-48 bg-gradient-to-r ${themeConfig.backgroundParticles[0]} rounded-full blur-3xl`}
          />
          <motion.div
            animate={{
              rotate: -360,
              scale: [1.2, 1, 1.2]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear"
            }}
            className={`absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-r ${themeConfig.backgroundParticles[1]} rounded-full blur-3xl`}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center z-10"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className={`w-16 h-16 border-4 ${themeConfig.spinnerBorder} rounded-full mx-auto mb-6`}
          />
          <motion.h2
            animate={{
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`text-2xl font-bold ${themeConfig.textPrimary} mb-3`}
          >
            Loading Dashboard...
          </motion.h2>
          <motion.p
            className={`${themeConfig.loadingText} text-base`}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Preparing your property insights
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeConfig.mainBg} flex relative overflow-hidden`}>
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
            x: [0, 30, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className={`absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r ${themeConfig.backgroundParticles[0]} rounded-full blur-3xl`}
        />
        <motion.div
          animate={{
            rotate: -360,
            scale: [1.1, 1, 1.1],
            x: [0, -20, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className={`absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r ${themeConfig.backgroundParticles[1]} rounded-full blur-3xl`}
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r ${themeConfig.backgroundParticles[2]} rounded-full blur-3xl`}
        />
      </div>

      <LandlordSideBar currentSection={currentSection} onSectionChange={setCurrentSection} />

      <div className={`flex-1 flex flex-col relative z-10 ${sidebarWidthClass} transition-all duration-700`}>
        <LandlordNavBar currentSection={currentSection} />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">
            {/* Header Section - Reduced Size */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
              className="text-center mb-12"
            >
              <motion.h1
                className={`text-4xl font-bold ${themeConfig.textPrimary} mb-4 bg-gradient-to-r ${themeConfig.headerGradient} bg-clip-text text-transparent`}
                animate={{
                  backgroundPosition: ["0%", "100%", "0%"],
                  textShadow: isDarkMode
                    ? [
                      "0 0 15px rgba(6, 182, 212, 0.5)",
                      "0 0 30px rgba(168, 85, 247, 0.5)",
                      "0 0 15px rgba(6, 182, 212, 0.5)"
                    ]
                    : [
                      "0 0 15px rgba(99, 102, 241, 0.3)",
                      "0 0 30px rgba(168, 85, 247, 0.3)",
                      "0 0 15px rgba(99, 102, 241, 0.3)"
                    ]
                }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                Welcome Back, Landlord!
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className={`text-lg ${themeConfig.textSecondary} max-w-2xl mx-auto leading-relaxed`}
              >
                Your comprehensive property management dashboard with real-time insights and advanced analytics
              </motion.p>

              {/* Floating icons - Smaller Size */}
              <div className="relative mt-8">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [-10, 10, -10],
                      rotate: [0, 8, 0],
                      opacity: [0.4, 0.8, 0.4]
                    }}
                    transition={{
                      duration: 4 + (i * 0.5),
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.3
                    }}
                    className="absolute"
                    style={{
                      left: `${20 + (i * 12)}%`,
                      top: `${-10 + Math.sin(i) * 15}px`,
                    }}
                  >
                    {i % 4 === 0 && <Sparkles className={`w-4 h-4 ${isDarkMode ? 'text-cyan-400' : 'text-indigo-500'} opacity-60`} />}
                    {i % 4 === 1 && <Star className={`w-3.5 h-3.5 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'} opacity-60`} />}
                    {i % 4 === 2 && <Flame className={`w-3.5 h-3.5 ${isDarkMode ? 'text-pink-400' : 'text-pink-500'} opacity-60`} />}
                    {i % 4 === 3 && <Building2 className={`w-3 h-3 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'} opacity-60`} />}
                  </motion.div>
                ))}
              </div>
            </motion.div>

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

            {/* Enhanced Tab Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
              className={`flex flex-wrap gap-4 mb-8 ${themeConfig.tabBg} p-3 rounded-3xl backdrop-blur-xl border ${themeConfig.tabBorder} shadow-2xl`}
            >
              {[
                { key: 'overview', label: 'Overview', icon: BarChart3, action: 'tab' },
                { key: 'properties', label: 'Properties', icon: Building2, action: 'navigate', route: '/landlord/properties' },
                { key: 'maintenance', label: 'Maintenance', icon: Wrench, action: 'navigate', route: '/landlord/maintenance' }
              ].map(({ key, label, icon: Icon, action, route }) => (
                <motion.button
                  key={key}
                  onClick={() => {
                    if (action === 'tab') {
                      setActiveTab(key);
                    } else if (action === 'navigate') {
                      navigate(route);
                    }
                  }}
                  whileHover={{
                    scale: 1.05,
                    y: -3,
                    boxShadow: isDarkMode
                      ? "0 10px 30px rgba(6, 182, 212, 0.3)"
                      : "0 10px 30px rgba(99, 102, 241, 0.3)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-500 relative overflow-hidden group ${activeTab === key && action === 'tab'
                    ? `bg-gradient-to-r ${themeConfig.tabActive} ${themeConfig.tabActiveText} shadow-lg shadow-${isDarkMode ? 'cyan' : 'indigo'}-500/30`
                    : `${themeConfig.tabInactive} hover:shadow-lg`
                    }`}
                >
                  {/* Animated background glow */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-r ${key === 'overview' ? 'from-cyan-500/20 to-indigo-500/20' :
                      key === 'properties' ? 'from-indigo-500/20 to-purple-500/20' :
                        'from-purple-500/20 to-pink-500/20'
                      } rounded-2xl`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ opacity: 1, scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  />

                  <motion.div
                    animate={
                      (activeTab === key && action === 'tab')
                        ? { rotate: 360, scale: 1.1 }
                        : { rotate: 0, scale: 1 }
                    }
                    whileHover={{ rotate: 15, scale: 1.15 }}
                    transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                    className="relative z-10"
                  >
                    <Icon className="w-5 h-5" />
                  </motion.div>
                  <span className="relative z-10 font-semibold">{label}</span>

                  {/* Shimmer effect */}
                  <motion.div
                    className={`absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent ${isDarkMode ? 'via-white/20' : 'via-white/40'
                      } to-transparent`}
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '200%' }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  />
                </motion.button>
              ))}
            </motion.div>

            {/* Enhanced Overview Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.95 }}
                  transition={{ duration: 0.8, type: "spring", stiffness: 120 }}
                  className="space-y-10"
                >
                  {/* Enhanced Quick Actions */}
                  <AnimatedCard className={`${themeConfig.cardBg} backdrop-blur-xl border ${themeConfig.cardBorder} rounded-3xl p-8 shadow-2xl relative overflow-hidden`}>
                    {/* Animated background gradient */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br ${isDarkMode
                        ? 'from-cyan-500/10 via-purple-500/5 to-pink-500/10'
                        : 'from-indigo-500/10 via-purple-500/5 to-pink-500/10'
                        } rounded-3xl`}
                      animate={{
                        opacity: [0.3, 0.6, 0.3],
                        scale: [1, 1.02, 1]
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />

                    <motion.h2
                      className={`text-3xl font-bold ${themeConfig.textPrimary} mb-8 flex items-center space-x-4 relative z-10`}
                      whileHover={{ x: 8, scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <motion.div
                        whileHover={{ rotate: 25, scale: 1.2 }}
                        animate={{
                          rotate: [0, 5, 0],
                          scale: [1, 1.05, 1]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Flame className={`w-8 h-8 ${themeConfig.iconColors.flame} drop-shadow-lg`} />
                      </motion.div>
                      <span className="bg-gradient-to-r from-current to-transparent bg-clip-text">
                        Quick Actions
                      </span>
                    </motion.h2>

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
                      ].map((action, index) => (
                        <motion.button
                          key={action.label}
                          onClick={action.onClick}
                          whileHover={{
                            scale: 1.08,
                            y: -8,
                            rotateY: 5,
                            boxShadow: isDarkMode
                              ? "0 20px 40px rgba(6, 182, 212, 0.4)"
                              : "0 20px 40px rgba(99, 102, 241, 0.4)"
                          }}
                          whileTap={{ scale: 0.95 }}
                          initial={{ opacity: 0, y: 40, rotateX: 20 }}
                          animate={{ opacity: 1, y: 0, rotateX: 0 }}
                          transition={{
                            delay: index * 0.2,
                            duration: 0.8,
                            type: "spring",
                            stiffness: 150
                          }}
                          className={`group relative p-8 bg-gradient-to-br ${action.color} rounded-2xl text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-700 text-base overflow-hidden`}
                        >
                          {/* Animated glow effect */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"
                            animate={{
                              opacity: [0, 0.3, 0],
                              scale: [0.8, 1.1, 0.8]
                            }}
                            transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                          />

                          <motion.div
                            whileHover={{ rotate: 20, scale: 1.2 }}
                            className="mb-4 relative z-10"
                          >
                            <action.icon className="w-8 h-8 mx-auto group-hover:drop-shadow-2xl transition-all duration-500" />
                          </motion.div>
                          <div className="relative z-10">
                            <div className="text-lg font-bold mb-2">{action.label}</div>
                            <div className="text-sm opacity-90 font-medium">{action.description}</div>
                          </div>

                          {/* Shimmer effect */}
                          <motion.div
                            className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            initial={{ x: '-100%' }}
                            whileHover={{ x: '200%' }}
                            transition={{ duration: 1, ease: "easeInOut" }}
                          />
                        </motion.button>
                      ))}
                    </div>
                  </AnimatedCard>

                  {/* Enhanced Performance Metrics */}
                  <AnimatedCard delay={0.4} className={`${themeConfig.cardBg} backdrop-blur-xl border ${themeConfig.cardBorder} rounded-3xl p-8 shadow-2xl relative overflow-hidden`}>
                    {/* Animated background */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br ${isDarkMode
                        ? 'from-indigo-500/10 via-cyan-500/5 to-purple-500/10'
                        : 'from-purple-500/10 via-indigo-500/5 to-cyan-500/10'
                        } rounded-3xl`}
                      animate={{
                        opacity: [0.3, 0.5, 0.3],
                        rotate: [0, 1, 0]
                      }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    />

                    <motion.h2
                      className={`text-3xl font-bold ${themeConfig.textPrimary} mb-8 flex items-center space-x-4 relative z-10`}
                      whileHover={{ x: 8, scale: 1.02 }}
                    >
                      <motion.div
                        whileHover={{ rotate: 25, scale: 1.2 }}
                        animate={{
                          y: [0, -3, 0],
                          rotate: [0, 10, 0]
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <TrendingUp className={`w-8 h-8 ${themeConfig.iconColors.trend} drop-shadow-lg`} />
                      </motion.div>
                      <span>Performance Overview</span>
                    </motion.h2>

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
                        <motion.div
                          key={metric.label}
                          className={`relative text-center p-8 ${isDarkMode ? 'bg-slate-900/60' : 'bg-white/60'} rounded-2xl border ${isDarkMode ? 'border-slate-700/50 hover:bg-slate-900/80' : 'border-indigo-200/50 hover:bg-white/80'} transition-all duration-500 backdrop-blur-sm overflow-hidden group`}
                          whileHover={{
                            scale: 1.05,
                            y: -5,
                            rotateY: 3,
                            boxShadow: isDarkMode
                              ? "0 20px 40px rgba(255,255,255,0.15)"
                              : "0 20px 40px rgba(99, 102, 241, 0.2)"
                          }}
                          initial={{ opacity: 0, y: 30, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ delay: metric.delay, duration: 0.8, type: "spring", stiffness: 120 }}
                        >
                          {/* Animated background gradient */}
                          <motion.div
                            className={`absolute inset-0 bg-gradient-to-br ${metric.bgGradient} rounded-2xl`}
                            animate={{
                              opacity: [0, 0.4, 0],
                              scale: [0.8, 1.1, 0.8]
                            }}
                            transition={{ duration: 3, repeat: Infinity, delay: metric.delay }}
                          />

                          <motion.div
                            className={`text-4xl font-bold ${metric.color} mb-3 drop-shadow-lg relative z-10`}
                            whileHover={{ scale: 1.1, y: -2 }}
                            animate={{
                              textShadow: isDarkMode
                                ? ["0 0 10px rgba(6, 182, 212, 0.5)", "0 0 20px rgba(168, 85, 247, 0.5)", "0 0 10px rgba(6, 182, 212, 0.5)"]
                                : ["0 0 10px rgba(99, 102, 241, 0.3)", "0 0 20px rgba(168, 85, 247, 0.3)", "0 0 10px rgba(99, 102, 241, 0.3)"]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            {metric.value}
                          </motion.div>
                          <div className={`${themeConfig.textSecondary} text-lg font-semibold relative z-10`}>
                            {metric.label}
                          </div>

                          {/* Hover effect particles */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            {[...Array(5)].map((_, i) => (
                              <motion.div
                                key={i}
                                className={`absolute w-1 h-1 ${metric.color.replace('text-', 'bg-')} rounded-full`}
                                style={{
                                  left: `${20 + (i * 15)}%`,
                                  top: `${60 + (i * 5)}%`,
                                }}
                                animate={{
                                  y: [-10, -30],
                                  opacity: [0, 1, 0],
                                  scale: [0.5, 1, 0.5]
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  delay: i * 0.2
                                }}
                              />
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </AnimatedCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
      {/* Schedule Inspection Modal */}
      <AnimatePresence>
        {showScheduleModal && (
          <ScheduleInspectionModal
            isOpen={showScheduleModal}
            onClose={() => setShowScheduleModal(false)}
            isDark={isDarkMode}
          />
        )}
      </AnimatePresence>

      {/* Add New Property Modal */}
      <AnimatePresence>
        {showAddPropertyModal && (
          <AddNewPropertyModal
            isOpen={showAddPropertyModal}
            onClose={() => setShowAddPropertyModal(false)}
            isDark={isDarkMode}
          />
        )}
      </AnimatePresence>

      {/* Generate Report Modal */}
      <AnimatePresence>
        {showGenerateReportModal && (
          <GenerateReportModal
            isOpen={showGenerateReportModal}
            onClose={() => setShowGenerateReportModal(false)}
            isDark={isDarkMode}
          />
        )}
      </AnimatePresence>
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
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${modalTheme.buttonSecondaryBg} ${modalTheme.buttonSecondaryText} ${modalTheme.buttonHover}`}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${modalTheme.buttonPrimaryBg} ${modalTheme.buttonPrimaryText} ${modalTheme.buttonHover}`}
            >
              Schedule Visit
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default LandlordDashboard;