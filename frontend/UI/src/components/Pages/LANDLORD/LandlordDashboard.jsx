import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import LandlordSideBar from './LandlordSideBar';
import LandlordNavBar from './LandlordNavBar';
import AddNewPropertyModal from './AddNewPropertyModal';
import GenerateReportModal from './GenerateReportModal';
import { 
  Home, 
  DollarSign, 
  Users, 
  Wrench,
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Bell,
  Eye,
  Plus,
  ArrowRight,
  MapPin,
  Calendar,
  Star,
  Flame,
  Sparkles,
  Building2
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useDarkMode } from '../../../DarkModeContext';
// Removed SidebarContext usage

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
    className={`absolute w-0.5 h-0.5 ${
      isDark 
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
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm border ${
              trend === 'up' ? themeStyles.trendUp : themeStyles.trendDown
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

// Enhanced PropertyCard - Reduced Size
const PropertyCard = React.memo(({ property, delay = 0, isDark = true }) => {
  const [isHovered, setIsHovered] = useState(false);

  const statusColors = isDark 
    ? {
        'Occupied': 'bg-cyan-400/20 text-cyan-300 border-cyan-400/50',
        'Available': 'bg-indigo-400/20 text-indigo-300 border-indigo-400/50',
        'Maintenance': 'bg-pink-400/20 text-pink-300 border-pink-400/50'
      }
    : {
        'Occupied': 'bg-indigo-100/60 text-indigo-700 border-indigo-300/60',
        'Available': 'bg-purple-100/60 text-purple-700 border-purple-300/60',
        'Maintenance': 'bg-pink-100/60 text-pink-700 border-pink-300/60'
      };

  const themeStyles = isDark
    ? {
        cardBg: 'from-slate-800/80 to-blue-950/80',
        cardBorder: 'border-slate-700/50',
        cardShadow: 'hover:shadow-cyan-500/20',
        imageBg: 'from-pink-500 via-purple-500 to-indigo-600',
        overlay: 'from-gray-900/80 via-slate-800/40',
        textPrimary: 'text-slate-100',
        textSecondary: 'text-slate-300',
        textTertiary: 'text-slate-200',
        buttonBg: 'from-cyan-500 to-indigo-600',
        buttonHover: 'hover:from-cyan-400 hover:to-indigo-500',
        buttonText: 'text-blue-950'
      }
    : {
        cardBg: 'from-white/90 to-indigo-50/80',
        cardBorder: 'border-indigo-200/50',
        cardShadow: 'hover:shadow-indigo-500/20',
        imageBg: 'from-pink-300 via-purple-300 to-indigo-400',
        overlay: 'from-gray-800/70 via-indigo-900/30',
        textPrimary: 'text-gray-900',
        textSecondary: 'text-indigo-600',
        textTertiary: 'text-white',
        buttonBg: 'from-indigo-600 to-purple-600',
        buttonHover: 'hover:from-indigo-700 hover:to-purple-700',
        buttonText: 'text-white'
      };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: 15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ 
        delay, 
        duration: 0.8,
        type: "spring",
        stiffness: 100,
        damping: 20
      }}
      whileHover={{ 
        scale: 1.03, 
        y: -8,
        rotateY: 3,
        transition: { type: "spring", stiffness: 300, damping: 25 }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative overflow-hidden bg-gradient-to-br ${themeStyles.cardBg} backdrop-blur-xl border ${themeStyles.cardBorder} rounded-2xl shadow-xl ${themeStyles.cardShadow} transition-all duration-500`}
    >
      {/* Image section - Reduced Size */}
      <div className="relative h-40 overflow-hidden rounded-t-2xl">
        <motion.div
          className={`w-full h-full bg-gradient-to-br ${themeStyles.imageBg} flex items-center justify-center`}
          animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
        >
          <motion.div
            animate={isHovered ? { 
              rotate: 360,
              scale: 1.1,
              filter: "brightness(1.2)"
            } : {}}
            transition={{ duration: 2, ease: "easeInOut" }}
          >
            <Building2 className="w-16 h-16 text-white/80 drop-shadow-lg" />
          </motion.div>
        </motion.div>

        <motion.div 
          className={`absolute inset-0 bg-gradient-to-t ${themeStyles.overlay} to-transparent`}
          animate={isHovered ? { opacity: 0.9 } : { opacity: 0.7 }}
          transition={{ duration: 0.4 }}
        />

        {/* Status badge - Smaller */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          whileHover={{ scale: 1.05, y: -2 }}
          className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border ${statusColors[property.status]}`}
        >
          {property.status}
        </motion.div>

        {/* Property info overlay */}
        <motion.div 
          className={`absolute bottom-4 left-4 ${themeStyles.textTertiary}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.3 }}
        >
          <motion.h3 
            className="font-bold text-lg mb-1 drop-shadow-lg"
            whileHover={{ scale: 1.03 }}
          >
            {property.title}
          </motion.h3>
          <motion.div 
            className={`flex items-center space-x-1.5 text-xs ${isDark ? 'text-slate-200' : 'text-white/90'}`}
            whileHover={{ x: 3 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <MapPin className="w-3 h-3" />
            <span>{property.location}</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Content section - Reduced Size */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <motion.div 
            className={`text-xl font-bold ${themeStyles.textPrimary} drop-shadow-sm`}
            whileHover={{ scale: 1.05 }}
          >
            ${property.rent.toLocaleString()}<span className={`text-sm ${themeStyles.textSecondary} font-normal`}>/month</span>
          </motion.div>
          <div className={`flex items-center space-x-4 ${themeStyles.textSecondary}`}>
            <motion.span 
              className="flex items-center space-x-1.5"
              whileHover={{ scale: 1.05, color: isDark ? "#e2e8f0" : "#374151" }}
            >
              <Home className="w-4 h-4" />
              <span>{property.bedrooms} bed</span>
            </motion.span>
            <motion.span 
              className="flex items-center space-x-1.5"
              whileHover={{ scale: 1.05, color: isDark ? "#e2e8f0" : "#374151" }}
            >
              <Users className="w-4 h-4" />
              <span>{property.tenants}</span>
            </motion.span>
          </div>
        </div>

        <motion.button
          whileHover={{ 
            scale: 1.02, 
            boxShadow: isDark 
              ? "0 15px 30px rgba(6, 182, 212, 0.3)" 
              : "0 15px 30px rgba(99, 102, 241, 0.3)"
          }}
          whileTap={{ scale: 0.98 }}
          className={`w-full bg-gradient-to-r ${themeStyles.buttonBg} ${themeStyles.buttonText} py-3 rounded-xl font-semibold ${themeStyles.buttonHover} transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg text-sm`}
        >
          <span>Manage Property</span>
          <motion.div
            animate={isHovered ? { x: 3 } : { x: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <ArrowRight className="w-4 h-4" />
          </motion.div>
        </motion.button>
      </div>
    </motion.div>
  );
});

// Enhanced NotificationCard - Reduced Size
const NotificationCard = React.memo(({ notification, delay = 0, isDark = true }) => {
  const priorityConfig = isDark
    ? {
        high: { bg: 'bg-pink-500/20', text: 'text-pink-300', icon: AlertTriangle },
        medium: { bg: 'bg-purple-500/20', text: 'text-purple-300', icon: Clock },
        low: { bg: 'bg-cyan-500/20', text: 'text-cyan-300', icon: CheckCircle }
      }
    : {
        high: { bg: 'bg-pink-100/60', text: 'text-pink-700', icon: AlertTriangle },
        medium: { bg: 'bg-purple-100/60', text: 'text-purple-700', icon: Clock },
        low: { bg: 'bg-indigo-100/60', text: 'text-indigo-700', icon: CheckCircle }
      };

  const config = priorityConfig[notification.priority];
  const IconComponent = config.icon;

  const themeStyles = isDark
    ? {
        cardBg: 'bg-slate-800/60 hover:bg-slate-800/80',
        cardBorder: 'border-slate-700/50 hover:border-cyan-400/30',
        iconBorder: 'border-slate-600/30',
        textPrimary: 'text-slate-100 group-hover:text-cyan-200',
        textSecondary: 'text-slate-300',
        textTertiary: 'text-slate-400',
        buttonHover: 'hover:bg-cyan-400/20',
        buttonIcon: 'text-slate-400',
        shadow: 'rgba(6, 182, 212, 0.1)'
      }
    : {
        cardBg: 'bg-white/60 hover:bg-white/80',
        cardBorder: 'border-indigo-200/50 hover:border-indigo-400/40',
        iconBorder: 'border-indigo-300/40',
        textPrimary: 'text-gray-900 group-hover:text-indigo-700',
        textSecondary: 'text-indigo-600',
        textTertiary: 'text-indigo-500',
        buttonHover: 'hover:bg-indigo-100/40',
        buttonIcon: 'text-indigo-500',
        shadow: 'rgba(99, 102, 241, 0.1)'
      };

  return (
    <motion.div
      initial={{ opacity: 0, x: -30, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ 
        delay, 
        duration: 0.6,
        type: "spring",
        stiffness: 120,
        damping: 20
      }}
      whileHover={{ 
        scale: 1.02, 
        x: 5,
        boxShadow: `0 8px 25px ${themeStyles.shadow}`
      }}
      className={`group flex items-start space-x-3 p-4 rounded-xl ${themeStyles.cardBg} border ${themeStyles.cardBorder} transition-all duration-400 backdrop-blur-sm`}
    >
      <motion.div
        whileHover={{ rotate: 15, scale: 1.15 }}
        className={`p-2.5 rounded-lg ${config.bg} ${config.text} border ${themeStyles.iconBorder}`}
      >
        <IconComponent className="w-4 h-4" />
      </motion.div>

      <div className="flex-1">
        <motion.h4 
          className={`font-semibold ${themeStyles.textPrimary} transition-colors text-sm mb-1`}
          whileHover={{ x: 3 }}
        >
          {notification.title}
        </motion.h4>
        <p className={`${themeStyles.textSecondary} text-sm mb-1`}>{notification.message}</p>
        <span className={`${themeStyles.textTertiary} text-xs`}>{notification.time}</span>
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 0 }}
        whileHover={{ opacity: 1, scale: 1.1 }}
        className={`p-1.5 rounded-lg ${themeStyles.buttonHover} transition-all duration-200`}
      >
        <Eye className={`w-4 h-4 ${themeStyles.buttonIcon}`} />
      </motion.button>
    </motion.div>
  );
});

// Enhanced MaintenanceRow - Reduced Size
const MaintenanceRow = React.memo(({ request, delay = 0, isDark = true }) => {
  const priorityColors = isDark
    ? {
        High: 'bg-pink-500/20 text-pink-300',
        Medium: 'bg-purple-500/20 text-purple-300',
        Low: 'bg-cyan-500/20 text-cyan-300'
      }
    : {
        High: 'bg-pink-100/60 text-pink-700',
        Medium: 'bg-purple-100/60 text-purple-700',
        Low: 'bg-indigo-100/60 text-indigo-700'
      };

  const statusColors = isDark
    ? {
        Completed: 'bg-cyan-500/20 text-cyan-300',
        'In Progress': 'bg-indigo-500/20 text-indigo-300',
        Pending: 'bg-slate-500/20 text-slate-300'
      }
    : {
        Completed: 'bg-indigo-100/60 text-indigo-700',
        'In Progress': 'bg-purple-100/60 text-purple-700',
        Pending: 'bg-gray-100/60 text-gray-700'
      };

  const themeStyles = isDark
    ? {
        rowHover: 'rgba(51, 65, 85, 0.3)',
        borderColor: 'border-slate-700/50 hover:border-cyan-400/30',
        textPrimary: 'text-slate-100',
        textSecondary: 'text-slate-300',
        textTertiary: 'text-slate-200',
        buttonBg: 'from-cyan-500 to-indigo-600',
        buttonHover: 'hover:from-cyan-400 hover:to-indigo-500',
        buttonText: 'text-blue-950',
        buttonShadow: 'rgba(6, 182, 212, 0.3)'
      }
    : {
        rowHover: 'rgba(199, 210, 254, 0.3)',
        borderColor: 'border-indigo-200/50 hover:border-indigo-400/40',
        textPrimary: 'text-gray-900',
        textSecondary: 'text-indigo-600',
        textTertiary: 'text-indigo-700',
        buttonBg: 'from-indigo-600 to-purple-600',
        buttonHover: 'hover:from-indigo-700 hover:to-purple-700',
        buttonText: 'text-white',
        buttonShadow: 'rgba(99, 102, 241, 0.3)'
      };

  return (
    <motion.tr
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay, 
        duration: 0.6,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ 
        backgroundColor: themeStyles.rowHover,
        scale: 1.005
      }}
      className={`border-b ${themeStyles.borderColor} transition-all duration-300`}
    >
      <td className="py-4 px-4">
        <motion.div whileHover={{ x: 3 }}>
          <h4 className={`font-semibold ${themeStyles.textPrimary} text-sm mb-1`}>{request.title}</h4>
          <p className={`${themeStyles.textSecondary} text-sm`}>{request.description}</p>
        </motion.div>
      </td>
      <td className={`py-4 px-4 ${themeStyles.textTertiary} text-sm`}>{request.property}</td>
      <td className={`py-4 px-4 ${themeStyles.textSecondary} text-sm`}>{request.date}</td>
      <td className="py-4 px-4">
        <motion.span 
          className={`px-3 py-1.5 rounded-full text-xs font-semibold ${priorityColors[request.priority]}`}
          whileHover={{ scale: 1.05 }}
        >
          {request.priority}
        </motion.span>
      </td>
      <td className="py-4 px-4">
        <motion.span 
          className={`px-3 py-1.5 rounded-full text-xs font-semibold ${statusColors[request.status]}`}
          whileHover={{ scale: 1.05 }}
        >
          {request.status}
        </motion.span>
      </td>
      <td className="py-4 px-4">
        <motion.button
          whileHover={{ 
            scale: 1.03,
            boxShadow: `0 8px 20px ${themeStyles.buttonShadow}`
          }}
          whileTap={{ scale: 0.97 }}
          className={`px-4 py-2 bg-gradient-to-r ${themeStyles.buttonBg} ${themeStyles.buttonText} rounded-lg text-xs font-semibold ${themeStyles.buttonHover} transition-all duration-200`}
        >
          View Details
        </motion.button>
      </td>
    </motion.tr>
  );
});

const LandlordDashboard = () => {
  const location = useLocation();
  const sidebarWidthClass = '[margin-left:var(--sidebar-width,18rem)]';
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

  const properties = useMemo(() => [
    {
      id: 1,
      title: "Modern Downtown Loft",
      location: "Manhattan, NY",
      rent: 2800,
      bedrooms: 2,
      tenants: 2,
      status: "Occupied"
    },
    {
      id: 2,
      title: "Luxury Penthouse",
      location: "Brooklyn, NY",
      rent: 4200,
      bedrooms: 3,
      tenants: 1,
      status: "Available"
    },
    {
      id: 3,
      title: "Cozy Studio Apartment",
      location: "Queens, NY",
      rent: 1800,
      bedrooms: 1,
      tenants: 1,
      status: "Maintenance"
    }
  ], []);

  const notifications = useMemo(() => [
    {
      id: 1,
      title: "New Maintenance Request",
      message: "Tenant reported a leaky faucet in Apt 4B",
      time: "2 hours ago",
      priority: "high"
    },
    {
      id: 2,
      title: "Rent Payment Received",
      message: "Monthly rent payment from John Doe",
      time: "1 day ago",
      priority: "low"
    },
    {
      id: 3,
      title: "Property Inspection Due",
      message: "Annual inspection for Downtown Loft",
      time: "3 days ago",
      priority: "medium"
    }
  ], []);

  const maintenanceRequests = useMemo(() => [
    {
      id: 1,
      title: "Plumbing Issue",
      description: "Kitchen sink is clogged",
      property: "Modern Downtown Loft",
      date: "2024-01-15",
      priority: "High",
      status: "In Progress"
    },
    {
      id: 2,
      title: "AC Repair",
      description: "Air conditioning not cooling",
      property: "Luxury Penthouse",
      date: "2024-01-14",
      priority: "Medium",
      status: "Pending"
    },
    {
      id: 3,
      title: "Light Fixture",
      description: "Replace broken light in hallway",
      property: "Cozy Studio",
      date: "2024-01-13",
      priority: "Low",
      status: "Completed"
    }
  ], []);

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
          bell: 'text-purple-400',
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
          bell: 'text-purple-600',
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

            {/* Tab Navigation - Reduced Size */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
              className={`flex flex-wrap gap-3 mb-8 ${themeConfig.tabBg} p-2 rounded-2xl backdrop-blur-xl border ${themeConfig.tabBorder} shadow-xl`}
            >
              {[
                { key: 'overview', label: 'Overview', icon: BarChart3 },
                { key: 'properties', label: 'Properties', icon: Building2 },
                { key: 'notifications', label: 'Notifications', icon: Bell },
                { key: 'maintenance', label: 'Maintenance', icon: Wrench }
              ].map(({ key, label, icon: Icon }) => (
                <motion.button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-400 text-sm ${
                    activeTab === key
                      ? `bg-gradient-to-r ${themeConfig.tabActive} ${themeConfig.tabActiveText} shadow-lg shadow-${isDarkMode ? 'cyan' : 'indigo'}-500/25`
                      : themeConfig.tabInactive
                  }`}
                >
                  <motion.div
                    animate={activeTab === key ? { rotate: 360 } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.div>
                  <span>{label}</span>
                </motion.button>
              ))}
            </motion.div>

            {/* Content Sections - Reduced Size */}
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: 20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                  transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                  className="space-y-8"
                >
                  {/* Quick Actions */}
                  <AnimatedCard className={`${themeConfig.cardBg} backdrop-blur-xl border ${themeConfig.cardBorder} rounded-2xl p-6 shadow-xl`}>
                    <motion.h2 
                      className={`text-2xl font-bold ${themeConfig.textPrimary} mb-6 flex items-center space-x-3`}
                      whileHover={{ x: 5 }}
                    >
                      <motion.div
                        whileHover={{ rotate: 15, scale: 1.1 }}
                      >
                        <Flame className={`w-6 h-6 ${themeConfig.iconColors.flame}`} />
                      </motion.div>
                      <span>Quick Actions</span>
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { label: 'Add New Property', icon: Plus, color: themeConfig.buttonPrimary, onClick: () => setShowAddPropertyModal(true) },
                        { label: 'Schedule Inspection', icon: Calendar, color: themeConfig.buttonPrimary, onClick: () => setShowScheduleModal(true) },
                        { label: 'Generate Report', icon: BarChart3, color: themeConfig.buttonSecondary, onClick: () => setShowGenerateReportModal(true) }
                      ].map((action, index) => (
                        <motion.button
                          key={action.label}
                          onClick={action.onClick} // Added onClick
                          whileHover={{ 
                            scale: 1.05, 
                            y: -5,
                            boxShadow: "0 15px 30px rgba(0,0,0,0.25)"
                          }}
                          whileTap={{ scale: 0.95 }}
                          initial={{ opacity: 0, y: 30, rotateX: 15 }}
                          animate={{ opacity: 1, y: 0, rotateX: 0 }}
                          transition={{ 
                            delay: index * 0.15, 
                            duration: 0.6,
                            type: "spring",
                            stiffness: 120
                          }}
                          className={`group p-6 bg-gradient-to-br ${action.color} rounded-xl text-white font-bold shadow-lg hover:shadow-xl transition-all duration-500 text-sm`}
                        >
                          <motion.div
                            whileHover={{ rotate: 15, scale: 1.15 }}
                            className="mb-3"
                          >
                            <action.icon className="w-6 h-6 mx-auto group-hover:drop-shadow-lg transition-all duration-300" />
                          </motion.div>
                          {action.label}
                        </motion.button>
                      ))}
                    </div>
                  </AnimatedCard>

                  {/* Performance Metrics */}
                  <AnimatedCard delay={0.3} className={`${themeConfig.cardBg} backdrop-blur-xl border ${themeConfig.cardBorder} rounded-2xl p-6 shadow-xl`}>
                    <motion.h2 
                      className={`text-2xl font-bold ${themeConfig.textPrimary} mb-6 flex items-center space-x-3`}
                      whileHover={{ x: 5 }}
                    >
                      <motion.div
                        whileHover={{ rotate: 15, scale: 1.1 }}
                      >
                        <TrendingUp className={`w-6 h-6 ${themeConfig.iconColors.trend}`} />
                      </motion.div>
                      <span>Performance Overview</span>
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { value: '94%', label: 'Occupancy Rate', color: isDarkMode ? 'text-cyan-400' : 'text-indigo-600', delay: 0 },
                        { value: '4.8', label: 'Avg Rating', color: isDarkMode ? 'text-indigo-400' : 'text-purple-600', delay: 0.1 },
                        { value: '2.1', label: 'Avg Response (hrs)', color: isDarkMode ? 'text-purple-400' : 'text-pink-600', delay: 0.2 }
                      ].map((metric, index) => (
                        <motion.div 
                          key={metric.label}
                          className={`text-center p-5 ${isDarkMode ? 'bg-slate-900/50' : 'bg-white/40'} rounded-xl border ${isDarkMode ? 'border-slate-700/50 hover:bg-slate-900/70' : 'border-indigo-200/50 hover:bg-white/60'} transition-all duration-300`}
                          whileHover={{ 
                            scale: 1.03, 
                            y: -3,
                            boxShadow: isDarkMode ? "0 15px 30px rgba(255,255,255,0.1)" : "0 15px 30px rgba(99, 102, 241, 0.1)"
                          }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: metric.delay, duration: 0.6 }}
                        >
                          <motion.div 
                            className={`text-3xl font-bold ${metric.color} mb-2 drop-shadow-lg`}
                            whileHover={{ scale: 1.05 }}
                          >
                            {metric.value}
                          </motion.div>
                          <div className={`${themeConfig.textSecondary} text-base font-medium`}>{metric.label}</div>
                        </motion.div>
                      ))}
                    </div>
                  </AnimatedCard>
                </motion.div>
              )}

              {activeTab === 'properties' && (
                <motion.div
                  key="properties"
                  initial={{ opacity: 0, x: 20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                  transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                >
                  <AnimatedCard className={`${themeConfig.cardBg} backdrop-blur-xl border ${themeConfig.cardBorder} rounded-2xl p-6 shadow-xl`}>
                    <div className="flex justify-between items-center mb-8">
                      <motion.h2 
                        className={`text-3xl font-bold ${themeConfig.textPrimary} flex items-center space-x-3`}
                        whileHover={{ x: 5 }}
                      >
                        <motion.div
                          whileHover={{ rotate: 15, scale: 1.1 }}
                        >
                          <Building2 className={`w-8 h-8 ${themeConfig.iconColors.building}`} />
                        </motion.div>
                        <span>Your Properties</span>
                      </motion.h2>
                      
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {properties.map((property, index) => (
                        <PropertyCard
                          key={property.id}
                          property={property}
                          delay={index * 0.15}
                          isDark={isDarkMode}
                        />
                      ))}
                    </div>
                  </AnimatedCard>
                </motion.div>
              )}

              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: 20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                  transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                >
                  <AnimatedCard className={`${themeConfig.cardBg} backdrop-blur-xl border ${themeConfig.cardBorder} rounded-2xl p-6 shadow-xl`}>
                    <motion.h2 
                      className={`text-3xl font-bold ${themeConfig.textPrimary} mb-8 flex items-center space-x-3`}
                      whileHover={{ x: 5 }}
                    >
                      <motion.div
                        whileHover={{ rotate: 15, scale: 1.1 }}
                        animate={{ 
                          rotate: [0, 10, 0],
                          scale: [1, 1.05, 1]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Bell className={`w-8 h-8 ${themeConfig.iconColors.bell}`} />
                      </motion.div>
                      <span>Recent Notifications</span>
                    </motion.h2>

                    <div className="space-y-4">
                      {notifications.map((notification, index) => (
                        <NotificationCard
                          key={notification.id}
                          notification={notification}
                          delay={index * 0.15}
                          isDark={isDarkMode}
                        />
                      ))}
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="text-center mt-8"
                    >
                      <motion.button
                        whileHover={{ 
                          scale: 1.03,
                          boxShadow: isDarkMode 
                            ? "0 15px 30px rgba(168, 85, 247, 0.4)" 
                            : "0 15px 30px rgba(168, 85, 247, 0.3)"
                        }}
                        whileTap={{ scale: 0.97 }}
                        className={`px-8 py-3 bg-gradient-to-r ${themeConfig.buttonSecondary} text-white rounded-xl font-bold hover:brightness-110 transition-all duration-300 shadow-lg text-sm`}
                      >
                        View All Notifications
                      </motion.button>
                    </motion.div>
                  </AnimatedCard>
                </motion.div>
              )}

              {activeTab === 'maintenance' && (
                <motion.div
                  key="maintenance"
                  initial={{ opacity: 0, x: 20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                  transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                >
                  <AnimatedCard className={`${themeConfig.cardBg} backdrop-blur-xl border ${themeConfig.cardBorder} rounded-2xl p-6 shadow-xl overflow-hidden`}>
                    <motion.h2 
                      className={`text-3xl font-bold ${themeConfig.textPrimary} mb-8 flex items-center space-x-3`}
                      whileHover={{ x: 5 }}
                    >
                      <motion.div
                        whileHover={{ rotate: 15, scale: 1.1 }}
                      >
                        <Wrench className={`w-8 h-8 ${themeConfig.iconColors.wrench}`} />
                      </motion.div>
                      <span>Maintenance Requests</span>
                    </motion.h2>

                    <div className={`overflow-x-auto rounded-xl border ${themeConfig.cardBorder}`}>
                      <table className="w-full">
                        <thead>
                          <tr className={`border-b ${themeConfig.cardBorder} ${isDarkMode ? 'bg-slate-900/50' : 'bg-white/40'}`}>
                            <th className={`text-left py-4 px-4 ${themeConfig.textSecondary} font-bold text-sm`}>Request</th>
                            <th className={`text-left py-4 px-4 ${themeConfig.textSecondary} font-bold text-sm`}>Property</th>
                            <th className={`text-left py-4 px-4 ${themeConfig.textSecondary} font-bold text-sm`}>Date</th>
                            <th className={`text-left py-4 px-4 ${themeConfig.textSecondary} font-bold text-sm`}>Priority</th>
                            <th className={`text-left py-4 px-4 ${themeConfig.textSecondary} font-bold text-sm`}>Status</th>
                            <th className={`text-left py-4 px-4 ${themeConfig.textSecondary} font-bold text-sm`}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {maintenanceRequests.map((request, index) => (
                            <MaintenanceRow
                              key={request.id}
                              request={request}
                              delay={index * 0.15}
                              isDark={isDarkMode}
                            />
                          ))}
                        </tbody>
                      </table>
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