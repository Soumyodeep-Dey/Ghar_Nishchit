import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Building2,
  Users,
  Wallet,
  Settings,
  MessageSquare,
  ChevronLeft,
  Crown,
  Sparkles,
  TrendingUp,
  LogOut,
  Edit,
  Moon,
  Sunrise,
  Sun,
  Wallet as WalletIcon,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDarkMode } from '../../../useDarkMode.js';

// We'll use the centralized DarkModeContext instead of a custom hook

const LandlordSideBar = ({ currentSection, onSectionChange }) => {
  const { darkMode: isDark } = useDarkMode();
  const [isCollapsed, setIsCollapsed] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false));
  const [sidebarWidth, setSidebarWidth] = useState(() => (isCollapsed ? '4.5rem' : '18rem'));

  const [hoveredItem, setHoveredItem] = useState(null);
  const [showTooltip, setShowTooltip] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem('user') || '{}');
  });
  const [userStats] = useState({
    properties: 12,
    tenants: 34,
    revenue: 45600,
    occupancy: 92,
    growth: 15.8,
    maintenance: 5,
    messages: 3
  });

  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      const hour = now.getHours();
      if (hour < 12) setGreeting('Good Morning');
      else if (hour < 17) setGreeting('Good Afternoon');
      else setGreeting('Good Evening');
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Listen for user data updates
  useEffect(() => {
    const handleUserUpdate = () => {
      setUser(JSON.parse(localStorage.getItem('user') || '{}'));
    };

    // Listen for the custom event dispatched when user data is updated
    window.addEventListener('user:updated', handleUserUpdate);

    // Also check localStorage directly in case it was updated without the event
    const checkUserData = () => {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (storedUser.name !== user.name || storedUser.email !== user.email) {
        setUser(storedUser);
      }
    };

    const interval = setInterval(checkUserData, 5000); // Check every 5 seconds

    return () => {
      window.removeEventListener('user:updated', handleUserUpdate);
      clearInterval(interval);
    };
  }, [user]);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      route: '/landlord',
      badge: null,
      description: 'Analytics & Overview',
      color: 'from-sky-400 via-sky-500 to-blue-500',
      glowColor: isDark ? 'shadow-sky-400/20' : 'shadow-sky-500/15',
      premium: true
    },
    {
      id: 'properties',
      label: 'Properties',
      icon: Building2,
      route: '/landlord/properties',
      badge: userStats.properties,
      description: 'Property Portfolio',
      color: 'from-emerald-400 via-emerald-500 to-green-500',
      glowColor: isDark ? 'shadow-emerald-400/20' : 'shadow-emerald-500/15',
      premium: true
    },
    {
      id: 'tenants',
      label: 'Tenants',
      icon: Users,
      route: '/landlord/tenants',
      badge: userStats.tenants,
      description: 'Resident Management',
      color: 'from-teal-400 via-teal-500 to-cyan-500',
      glowColor: isDark ? 'shadow-teal-400/20' : 'shadow-teal-500/15',
      premium: true
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: Wallet,
      route: '/landlord/payment',
      badge: null,
      description: 'Revenue & Transactions',
      color: 'from-indigo-400 via-indigo-500 to-purple-500',
      glowColor: isDark ? 'shadow-indigo-400/20' : 'shadow-indigo-500/15',
      premium: true
    },
    {
      id: 'maintenance',
      label: 'Maintenance',
      icon: Settings,
      route: '/landlord/maintenance',
      badge: userStats.maintenance,
      description: 'Service Requests',
      color: 'from-rose-400 via-pink-400 to-pink-500',
      glowColor: isDark ? 'shadow-rose-400/20' : 'shadow-rose-500/15',
      premium: false
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      route: '/landlord/messages',
      badge: userStats.messages,
      description: 'Communication Hub',
      color: 'from-violet-400 via-purple-400 to-purple-500',
      glowColor: isDark ? 'shadow-violet-400/20' : 'shadow-violet-500/15',
      premium: false
    }
  ];

  const handleNavigation = (route, sectionName = null) => {
    try {
      if (navigator.vibrate) navigator.vibrate(50);
      navigate(route);
      if (sectionName && onSectionChange) onSectionChange(sectionName);
      if (window.innerWidth < 768) setTimeout(() => setIsCollapsed(true), 300);
    } catch {
      window.location.href = route;
    }
  };

  useEffect(() => {
    // Keep width in sync with collapsed state
    setSidebarWidth(isCollapsed ? '4.5rem' : '18rem');
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--sidebar-width', isCollapsed ? '4.5rem' : '18rem');
    }
  }, [isCollapsed]);

  useEffect(() => {
    // Auto-collapse on small screens, expand on larger
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setShowTooltip(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey && event.key >= '1' && event.key <= '9') {
        event.preventDefault();
        const index = parseInt(event.key) - 1;
        if (menuItems[index]) handleNavigation(menuItems[index].route, menuItems[index].label);
      }
      if (event.key === 'Escape') setIsCollapsed(!isCollapsed);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isCollapsed]); // eslint-disable-line

  const handleItemClick = (item) => handleNavigation(item.route, item.label);

  const handleTooltip = (itemId, show) => {
    if (isCollapsed) setShowTooltip(show ? itemId : null);
  };

  const isItemActive = (item) => {
    const pathname = location.pathname;
    if (pathname === item.route) return true;
    if (item.route === '/landlord' && pathname === '/landlord') return true;
    if (pathname.startsWith(item.route + '/') && item.route !== '/landlord') return true;
    return false;
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      navigate('/login');
    }
  };

  const getGreetingIcon = () => {
    const hour = currentTime.getHours();
    if (hour < 6) return Moon;
    if (hour < 12) return Sunrise;
    if (hour < 18) return Sun;
    return Moon;
  };

  const GreetingIcon = getGreetingIcon();

  // Theme-aware base classes
  const themeClasses = isDark ? {
    shellBg: 'from-gray-900/95 via-slate-900/95 to-gray-900/95',
    border: 'border-slate-800/60',
    overlay: 'bg-slate-900/40',
    sectionCard: 'from-gray-800/70 to-slate-800/70',
    sectionAccent: 'from-gray-700/40 via-gray-700/20 to-transparent',
    iconWrapIdle: 'bg-slate-800/70',
    iconWrapActive: 'bg-white/15',
    textPrimary: 'text-slate-100',
    textSecondary: 'text-slate-300',
    textMuted: 'text-slate-400',
    textSoft: 'text-slate-500',
    buttonIdle: 'bg-slate-800/70 hover:bg-slate-700/60',
    buttonIcon: 'text-slate-300 group-hover:text-cyan-300',
    menuIdle: 'hover:bg-slate-800/70 hover:border-slate-700/60',
    tooltipBg: 'bg-slate-900/95',
    tooltipBorder: 'border-slate-700/60',
    footerText: 'text-slate-400',
  } : {
    shellBg: 'from-slate-50/95 via-indigo-50/95 to-slate-50/95',
    border: 'border-slate-200/60',
    overlay: 'bg-slate-900/30',
    sectionCard: 'from-white/60 to-slate-50/60',
    sectionAccent: 'from-blue-50/30 via-indigo-50/30 to-slate-50/30',
    iconWrapIdle: 'bg-slate-100/80',
    iconWrapActive: 'bg-white/20',
    textPrimary: 'text-slate-700',
    textSecondary: 'text-slate-600',
    textMuted: 'text-slate-500',
    textSoft: 'text-slate-500',
    buttonIdle: 'bg-slate-100/80 hover:bg-slate-200/80',
    buttonIcon: 'text-slate-600 group-hover:text-blue-600',
    menuIdle: 'hover:bg-slate-100/80 hover:border-slate-200/60',
    tooltipBg: 'bg-white/95',
    tooltipBorder: 'border-slate-200/60',
    footerText: 'text-slate-400',
  };

  return (
    <>
      <style>{`
        .sidebar-scrollable::-webkit-scrollbar { width: 6px; }
        .sidebar-scrollable::-webkit-scrollbar-track { background: rgba(148,163,184,0.1); border-radius: 3px; }
        .sidebar-scrollable::-webkit-scrollbar-thumb { background: linear-gradient(180deg, rgba(148,163,184,0.6) 0%, rgba(148,163,184,0.3) 100%); border-radius: 3px; border: 1px solid rgba(148,163,184,0.2); transition: all 0.3s ease; }
        .sidebar-scrollable::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg, rgba(148,163,184,0.8) 0%, rgba(148,163,184,0.5) 100%); box-shadow: 0 0 8px rgba(148,163,184,0.3); }
        .sidebar-scrollable { scrollbar-width: thin; scrollbar-color: rgba(148,163,184,0.6) rgba(148,163,184,0.1); scroll-behavior: smooth; }
      `}</style>

      <AnimatePresence>
        {!isCollapsed && window.innerWidth < 768 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 ${themeClasses.overlay} backdrop-blur-sm z-30 md:hidden`}
            onClick={() => setIsCollapsed(true)}
          />
        )}
      </AnimatePresence>

      <motion.div
        ref={sidebarRef}
        initial={{ x: -400, opacity: 0 }}
        animate={{
          x: 0,
          opacity: 1,
          width: sidebarWidth
        }}
        transition={{ duration: 0.7, type: "spring", stiffness: 120, damping: 20 }}
        className={`fixed left-0 top-0 h-screen bg-gradient-to-br ${themeClasses.shellBg} backdrop-blur-3xl border-r ${themeClasses.border} shadow-2xl z-40 flex flex-col transition-all duration-700`}
        style={{ width: sidebarWidth, height: '100vh', maxHeight: '100vh', overflow: 'hidden', '--sidebar-width': sidebarWidth }}
      >
        {/* Soft background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 360], x: [-30, 30, -30], y: [-30, 30, -30] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className={`absolute -top-32 -left-32 w-64 h-64 ${isDark ? 'bg-gradient-radial from-blue-500/10 via-cyan-400/5 to-transparent' : 'bg-gradient-radial from-blue-200/20 via-cyan-200/10 to-transparent'} rounded-full blur-2xl`}
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], rotate: [360, 0], x: [30, -30, 30], y: [30, -30, 30] }}
            transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
            className={`absolute -bottom-32 -right-32 w-64 h-64 ${isDark ? 'bg-gradient-radial from-emerald-500/10 via-green-400/5 to-transparent' : 'bg-gradient-radial from-emerald-200/20 via-green-200/10 to-transparent'} rounded-full blur-2xl`}
          />
        </div>

        {/* Header */}
        <div className={`relative z-20 p-6 border-b ${themeClasses.border} flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleNavigation('/landlord', 'Dashboard')}
              className="flex items-center space-x-4 cursor-pointer group"
            >
              <motion.div whileHover={{ rotate: [0, -5, 5, 0] }} transition={{ duration: 0.6 }} className="relative">
                <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 opacity-10 blur-md -z-10"
                />
              </motion.div>

              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="flex flex-col"
                  >
                    <motion.h1
                      className={`text-2xl font-bold bg-gradient-to-r ${isDark ? 'from-slate-200 via-blue-200 to-indigo-200' : 'from-slate-700 via-blue-600 to-indigo-600'} bg-clip-text text-transparent`}
                      animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
                      transition={{ duration: 6, repeat: Infinity }}
                    >
                      Ghar Nishchit
                    </motion.h1>
                    <div className="flex items-center space-x-2">
                      <Crown className="w-3 h-3 text-amber-500" />
                      <span className={`text-sm ${themeClasses.textSecondary} font-medium`}>Landlord Portal</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`p-3 rounded-2xl ${themeClasses.buttonIdle} border ${themeClasses.border} transition-all duration-500 shadow-sm group overflow-hidden ${isCollapsed ? 'absolute -right-3 top-6 z-50' : 'relative'}`}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }} transition={{ duration: 0.5, type: "spring", stiffness: 200 }}>
                <ChevronLeft className={`w-5 h-5 ${themeClasses.buttonIcon} transition-colors duration-300`} />
              </motion.div>
            </motion.button>
          </div>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className={`mt-8 p-5 bg-gradient-to-br ${themeClasses.sectionCard} rounded-3xl border ${themeClasses.border} shadow-lg backdrop-blur-xl relative overflow-hidden`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${themeClasses.sectionAccent} rounded-3xl`} />

                <div className="relative z-10">
                  <motion.div className="flex items-center justify-between mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                    <div className="flex items-center space-x-2">
                      <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 5, repeat: Infinity }}>
                        <GreetingIcon className={`w-4 h-4 text-amber-500`} />
                      </motion.div>
                      <span className={`${themeClasses.textSecondary} text-sm font-medium`}>{greeting}</span>
                    </div>
                    <motion.div
                      className={`${themeClasses.textSoft} text-xs font-mono ${isDark ? 'bg-slate-800/60' : 'bg-slate-100/60'} px-2 py-1 rounded-lg`}
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </motion.div>
                  </motion.div>

                  <div className="flex items-center space-x-4 mb-4">
                    <motion.div className="relative" whileHover={{ scale: 1.05 }}>
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">
                          {(() => {
                            const name = user.name || 'Unknown User';
                            const nameParts = name.split(' ');
                            if (nameParts.length >= 2) {
                              return `${nameParts[0][0]}${nameParts[1][0]}`;
                            } else if (nameParts.length === 1 && nameParts[0].length > 0) {
                              return `${nameParts[0][0]}${nameParts[0][1] || ''}`;
                            } else {
                              return 'UN';
                            }
                          })()}
                        </span>
                      </div>
                      <motion.div
                        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-300 to-teal-400 opacity-20 blur-md -z-10"
                      />
                      <motion.div
                        className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center"
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                      >
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </motion.div>
                    </motion.div>

                    <div className="flex-1">
                      <motion.h3 className={`${themeClasses.textPrimary} font-bold text-lg`} whileHover={{ scale: 1.02 }}>
                        {user.name || 'Unknown User'}
                      </motion.h3>
                      <div className="flex items-center space-x-2">
                        <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }}>
                          <Crown className="w-4 h-4 text-amber-500" />
                        </motion.div>
                        <span className="text-amber-500 text-sm font-semibold">Premium Plus</span>
                        <motion.div
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className={`px-2 py-0.5 ${isDark ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-100/60 border-amber-200/60'} rounded-full border`}
                        >
                          <span className={`${isDark ? 'text-amber-300' : 'text-amber-700'} text-xs font-bold`}>VIP</span>
                        </motion.div>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.15, rotate: 8 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/landlord/profile')}
                      className={`p-2 rounded-xl ${themeClasses.buttonIdle} transition-colors duration-300 group`}
                      title="Edit Profile"
                    >
                      <Edit className={`w-4 h-4 ${themeClasses.buttonIcon}`} />
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <motion.div
                      whileHover={{ scale: 1.05, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      className={`text-center p-3 ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-blue-50/80 border-blue-100/60'} rounded-2xl cursor-pointer border hover:border-blue-300/60 transition-all duration-300 group relative overflow-hidden`}
                      onClick={() => navigate('/landlord/properties')}
                    >
                      <div className="relative z-10">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <Building2 className={`w-4 h-4 ${isDark ? 'text-blue-300' : 'text-blue-600'}`} />
                          <motion.div className={`${isDark ? 'text-blue-200' : 'text-blue-700'} font-bold text-xl`} animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 3, repeat: Infinity }}>
                            {userStats.properties}
                          </motion.div>
                        </div>
                        <div className={`${themeClasses.textMuted} text-xs font-medium`}>Properties</div>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      className={`text-center p-3 ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-emerald-50/80 border-emerald-100/60'} rounded-2xl cursor-pointer border hover:border-emerald-300/60 transition-all duration-300 group relative overflow-hidden`}
                      onClick={() => navigate('/landlord/tenants')}
                    >
                      <div className="relative z-10">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <TrendingUp className={`w-4 h-4 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`} />
                          <motion.div className={`${isDark ? 'text-emerald-200' : 'text-emerald-700'} font-bold text-xl`} animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }}>
                            {userStats.occupancy}%
                          </motion.div>
                        </div>
                        <div className={`${themeClasses.textMuted} text-xs font-medium`}>Occupied</div>
                      </div>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 }}
                    className={`mt-3 p-3 ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-indigo-50/80 border-indigo-100/60'} rounded-2xl border`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <WalletIcon className={`${isDark ? 'text-indigo-300' : 'text-indigo-600'} w-4 h-4`} />
                        <span className={`${themeClasses.textMuted} text-xs`}>Monthly Revenue</span>
                      </div>
                      <motion.div className={`${isDark ? 'text-indigo-200' : 'text-indigo-700'} font-bold text-sm`} animate={{ opacity: [0.8, 1, 0.8] }} transition={{ duration: 3, repeat: Infinity }}>
                        ₹{(userStats.revenue / 1000).toFixed(1)}K
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Menu */}
        <div className="flex-1 relative min-h-0">
          <div className="absolute inset-0 sidebar-scrollable" style={{ overflowY: 'auto', overflowX: 'hidden', padding: '24px 12px' }}>
            <div className="space-y-3">
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5, type: "spring", stiffness: 120 }}
                  onMouseEnter={() => { setHoveredItem(item.id); handleTooltip(item.id, true); }}
                  onMouseLeave={() => { setHoveredItem(null); handleTooltip(item.id, false); }}
                  className="relative"
                >
                  <motion.button
                    whileHover={{ x: isCollapsed ? 2 : 5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleItemClick(item)}
                    className={`w-full flex items-center p-4 rounded-2xl transition-all duration-400 group relative overflow-hidden backdrop-blur-sm ${isItemActive(item)
                        ? `bg-gradient-to-r ${item.color} border border-white/30 shadow-lg ${item.glowColor} text-white`
                        : `${themeClasses.menuIdle} border border-transparent`
                      }`}
                  >
                    {isItemActive(item) && (
                      <>
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1.5 h-10 bg-gradient-to-b from-white via-white/70 to-white rounded-full shadow-md"
                          initial={false}
                          transition={{ type: "spring", stiffness: 200, damping: 25 }}
                        />
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-transparent rounded-2xl"
                          animate={{ opacity: [0.2, 0.4, 0.2] }}
                          transition={{ duration: 4, repeat: Infinity }}
                        />
                      </>
                    )}

                    {/* Hover glow */}
                    <AnimatePresence>
                      {hoveredItem === item.id && !isItemActive(item) && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className={`absolute inset-0 bg-gradient-to-r ${item.color} ${isDark ? 'opacity-10' : 'opacity-15'} rounded-2xl blur-sm`}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </AnimatePresence>

                    {/* Icon */}
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0], y: -1 }}
                      transition={{ duration: 0.5 }}
                      className={`relative w-12 h-12 rounded-2xl flex items-center justify-center z-10 ${isItemActive(item) ? themeClasses.iconWrapActive : themeClasses.iconWrapIdle
                        }`}
                    >
                      <item.icon className={`w-6 h-6 ${isItemActive(item) ? 'text-white' : isDark ? 'text-slate-300 group-hover:text-slate-200' : 'text-slate-600 group-hover:text-slate-700'} transition-colors duration-300`} />
                      {item.premium && (
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-sm"
                        >
                          <Sparkles className="w-2 h-2 text-white" />
                        </motion.div>
                      )}
                    </motion.div>

                    {/* Labels */}
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -15 }}
                          transition={{ duration: 0.3 }}
                          className="flex-1 ml-4 text-left z-10"
                        >
                          <motion.div
                            className={`font-bold text-lg transition-colors duration-300 ${isItemActive(item) ? 'text-white' : themeClasses.textPrimary}`}
                            whileHover={{ x: 3 }}
                          >
                            {item.label}
                          </motion.div>
                          <motion.div
                            className={`text-sm transition-colors duration-300 ${isItemActive(item) ? 'text-white/80' : themeClasses.textMuted}`}
                            whileHover={{ x: 3 }}
                          >
                            {item.description}
                          </motion.div>
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: hoveredItem === item.id ? 0.6 : 0 }}
                            className={`text-xs mt-1 font-mono ${isItemActive(item) ? 'text-white/60' : themeClasses.textSoft}`}
                          >
                            Alt + {index + 1}
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Badge */}
                    <AnimatePresence>
                      {item.badge && (
                        <motion.div
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 90 }}
                          className="relative z-10"
                          transition={{ type: "spring", stiffness: 150, damping: 12 }}
                        >
                          {!isCollapsed ? (
                            <motion.div
                              animate={{
                                scale: [1, 1.05, 1],
                                boxShadow: [
                                  '0 0 0 0 rgba(239, 68, 68, 0.3)',
                                  '0 0 0 8px rgba(239, 68, 68, 0)',
                                  '0 0 0 0 rgba(239, 68, 68, 0)'
                                ]
                              }}
                              transition={{ duration: 2.5, repeat: Infinity, delay: index * 0.4 }}
                              className="px-3 py-1.5 bg-gradient-to-r from-rose-400 via-pink-500 to-red-500 rounded-full shadow-lg border border-rose-300/40 relative overflow-hidden"
                            >
                              <motion.div
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                              />
                              <span className="text-white text-sm font-bold relative z-10">
                                {item.badge}
                              </span>
                            </motion.div>
                          ) : (
                            <motion.div
                              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                              transition={{ duration: 2.5, repeat: Infinity, delay: index * 0.4 }}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-rose-400 to-red-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white/30"
                            >
                              <span className="text-white text-xs font-bold">
                                {item.badge > 9 ? '9+' : item.badge}
                              </span>
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  {/* Tooltip for collapsed */}
                  <AnimatePresence>
                    {isCollapsed && showTooltip === item.id && (
                      <motion.div
                        initial={{ opacity: 0, x: -15, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -15, scale: 0.9 }}
                        className={`absolute left-full top-1/2 transform -translate-y-1/2 ml-4 px-4 py-3 ${themeClasses.tooltipBg} backdrop-blur-2xl ${isDark ? 'text-slate-200' : 'text-slate-700'} text-sm rounded-2xl shadow-xl border ${themeClasses.tooltipBorder} whitespace-nowrap z-50 min-w-[200px]`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${item.color} flex items-center justify-center shadow-sm`}>
                            <item.icon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className={`font-bold text-base ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{item.label}</div>
                            <div className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-xs`}>{item.description}</div>
                            {item.badge && (
                              <div className="text-xs text-rose-500 font-bold mt-1">
                                {item.badge} notifications
                              </div>
                            )}
                            <div className={`${isDark ? 'text-slate-500' : 'text-slate-400'} text-xs mt-1 font-mono`}>
                              Alt + {index + 1}
                            </div>
                          </div>
                        </div>
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2">
                          <div className={`w-4 h-4 ${themeClasses.tooltipBg} border-l border-t ${themeClasses.tooltipBorder} rotate-45 backdrop-blur-2xl`}></div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className={`relative z-20 p-4 border-t ${themeClasses.border} flex-shrink-0`}>
          <motion.button
            whileHover={{ x: isCollapsed ? 2 : 5, scale: 1.02, boxShadow: isDark ? "0 8px 25px rgba(239,68,68,0.15)" : "0 8px 25px rgba(239,68,68,0.2)" }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className={`w-full flex items-center p-4 rounded-2xl ${isDark ? 'hover:bg-rose-500/10' : 'hover:bg-rose-50/80'} border border-transparent ${isDark ? 'hover:border-rose-500/20' : 'hover:border-rose-200/60'} transition-all duration-400 group relative overflow-hidden`}
            title="Logout"
          >
            <motion.div className={`absolute inset-0 bg-gradient-to-r ${isDark ? 'from-rose-500/10 to-red-500/10' : 'from-rose-50/60 to-red-50/60'} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} whileHover={{ scale: 1.02 }} />
            <motion.div whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }} transition={{ duration: 0.5 }} className="w-12 h-12 rounded-2xl bg-gradient-to-r from-rose-400 via-red-500 to-red-600 flex items-center justify-center shadow-lg relative z-10">
              <LogOut className="w-6 h-6 text-white" />
            </motion.div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.3 }} className="flex-1 ml-4 text-left relative z-10">
                  <motion.div className={`${isDark ? 'text-rose-300' : 'text-rose-600'} font-bold text-lg transition-colors duration-300`} whileHover={{ x: 3 }}>
                    Logout
                  </motion.div>
                  <motion.div className={`${isDark ? 'text-rose-400/80' : 'text-rose-500/80'} text-sm transition-colors duration-300`} whileHover={{ x: 3 }}>
                    Sign out of your account
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }} transition={{ delay: 0.2 }} className="mt-4 pt-4 border-t border-current/10">
                <div className="text-center">
                  <motion.div className={`${themeClasses.footerText} text-xs mb-1`} animate={{ opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 4, repeat: Infinity }}>
                    © 2024 Ghar Nishchit
                  </motion.div>
                  <div className="flex items-center justify-center space-x-1">
                    <span className={`${themeClasses.footerText} text-xs`}>Made with</span>
                    <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      <Heart className="w-3 h-3 text-rose-400" />
                    </motion.div>
                    <span className={`${themeClasses.footerText} text-xs`}>in India</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Resize rail indicator */}
        <motion.div className={`absolute right-0 top-0 bottom-0 w-2 ${isDark ? 'bg-white/5' : 'bg-slate-200/40'} cursor-col-resize hover:bg-gradient-to-b hover:from-blue-400/20 hover:via-indigo-400/20 hover:to-blue-400/20 transition-all duration-500 group`} whileHover={{ scale: 1.1 }} title="Resize sidebar">
          <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-400 via-indigo-500 to-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
        </motion.div>
      </motion.div>
    </>
  );
};

export default LandlordSideBar;
