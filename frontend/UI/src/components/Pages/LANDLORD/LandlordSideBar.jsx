import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Building2, Users, Wallet, Settings, MessageSquare, ChevronLeft, Crown, Sparkles, LogOut } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useDarkMode } from '../../../useDarkMode.js';

// Constants
const SIDEBAR_WIDTHS = { collapsed: '4.5rem', expanded: '24rem' };
const BREAKPOINT = 768;
const USER_STATS = {
  properties: 12,
  tenants: 34,
  revenue: 45600,
  occupancy: 92,
  growth: 15.8,
  maintenance: 5,
  messages: 3
};

// Menu configuration - Static list for better performance
const MENU_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    route: '/landlord',
    badge: null,
    description: 'Analytics & Overview',
    color: 'from-sky-400 via-sky-500 to-blue-500',
    premium: true
  },
  {
    id: 'properties',
    label: 'Properties',
    icon: Building2,
    route: '/landlord/properties',
    badge: 'properties',
    description: 'Property Portfolio',
    color: 'from-emerald-400 via-emerald-500 to-green-500',
    premium: true
  },
  {
    id: 'tenants',
    label: 'Tenants',
    icon: Users,
    route: '/landlord/tenants',
    badge: 'tenants',
    description: 'Resident Management',
    color: 'from-teal-400 via-teal-500 to-cyan-500',
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
    premium: true
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
    icon: Settings,
    route: '/landlord/maintenance',
    badge: 'maintenance',
    description: 'Service Requests',
    color: 'from-rose-400 via-pink-400 to-pink-500',
    premium: false
  },
  // {
  //   id: 'messages',
  //   label: 'Messages',
  //   icon: MessageSquare,
  //   route: '/landlord/messages',
  //   badge: 'messages',
  //   description: 'Communication Hub',
  //   color: 'from-violet-400 via-purple-400 to-purple-500',
  //   premium: false
  // }
];

const LandlordSideBar = ({ onSectionChange }) => {
  const { darkMode: isDark } = useDarkMode();
  const [isCollapsed, setIsCollapsed] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < BREAKPOINT : false
  );
  const [sidebarWidth, setSidebarWidth] = useState(() =>
    isCollapsed ? SIDEBAR_WIDTHS.collapsed : SIDEBAR_WIDTHS.expanded
  );
  const [showTooltip, setShowTooltip] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef(null);

  // Helper function to get badge value
  const getBadgeValue = (badgeKey) => {
    if (!badgeKey) return null;
    return USER_STATS[badgeKey] || null;
  };

  // Process menu items with dynamic badge values
  const menuItems = MENU_ITEMS.map(item => ({
    ...item,
    badge: getBadgeValue(item.badge),
    glowColor: isDark ? 'shadow-slate-400/20' : 'shadow-slate-500/15'
  }));


  const handleNavigation = useCallback((route, sectionName = null) => {
    try {
      if (navigator.vibrate) navigator.vibrate(50);
      navigate(route);
      if (sectionName && onSectionChange) onSectionChange(sectionName);
      if (window.innerWidth < BREAKPOINT) setTimeout(() => setIsCollapsed(true), 300);
    } catch {
      window.location.href = route;
    }
  }, [navigate, onSectionChange]);

  useEffect(() => {
    setSidebarWidth(isCollapsed ? SIDEBAR_WIDTHS.collapsed : SIDEBAR_WIDTHS.expanded);
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--sidebar-width', isCollapsed ? SIDEBAR_WIDTHS.collapsed : SIDEBAR_WIDTHS.expanded);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleResize = () => setIsCollapsed(window.innerWidth < BREAKPOINT);
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
  }, [isCollapsed, menuItems, handleNavigation]);

  const handleItemClick = (item) => handleNavigation(item.route, item.label);
  const handleTooltip = (itemId, show) => isCollapsed && setShowTooltip(show ? itemId : null);
  const isItemActive = (item) => {
    const pathname = location.pathname;
    return pathname === item.route || (item.route === '/landlord' && pathname === '/landlord') ||
      (pathname.startsWith(item.route + '/') && item.route !== '/landlord');
  };
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      // Redirect to home page
      navigate('/');
    }
  };

  // Sub-components
  const SidebarHeader = () => (
    <div className={`relative z-20 p-6 border-b ${themeClasses.border} flex-shrink-0`}>
      <div className="flex items-center justify-between">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleNavigation('/landlord', 'Dashboard')}
          className="flex items-center space-x-4 cursor-pointer group"
        >
          <motion.div
            whileHover={{
              rotate: [0, -2, 2, 0],
              scale: 1.05,
              boxShadow: "0 10px 20px rgba(59, 130, 246, 0.2)"
            }}
            transition={{ duration: 0.4 }}
            className="relative"
          >
            <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-500 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:shadow-blue-500/20 transition-all duration-300">
              <Building2 className="w-8 h-8 text-white group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 -z-10" />
          </motion.div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <h1
                className={`text-2xl font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'} transition-colors duration-300`}
              >
                Ghar Nishchit
              </h1>
              <div className="flex items-center space-x-2">
                <Crown className="w-3 h-3 text-amber-500" />
                <span className={`text-sm ${themeClasses.textSecondary} font-medium transition-colors duration-300`}>Landlord Portal</span>
              </div>
            </div>
          )}
        </motion.div>
        <motion.button
          whileHover={{
            scale: 1.1,
            rotate: 3,
            boxShadow: isDark ? "0 10px 25px rgba(148, 163, 184, 0.2)" : "0 10px 25px rgba(148, 163, 184, 0.3)"
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-3 rounded-2xl ${themeClasses.buttonIdle} border ${themeClasses.border} transition-all duration-500 shadow-sm group overflow-hidden hover:shadow-lg hover:shadow-slate-500/10 ${isCollapsed ? 'absolute -right-3 top-6 z-50' : 'relative'} hover:scale-105 hover:-translate-y-1`}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
            className="group-hover:scale-110 transition-transform duration-300"
          >
            <ChevronLeft className={`w-5 h-5 ${themeClasses.textSecondary} group-hover:text-blue-500 transition-colors duration-300`} />
          </motion.div>
        </motion.button>
      </div>
    </div>
  );

  const themeClasses = isDark ? {
    shellBg: 'from-gray-900/95 via-slate-900/95 to-gray-900/95',
    border: 'border-slate-800/60',
    overlay: 'bg-slate-900/40',
    sectionCard: 'from-gray-800/70 to-slate-800/70',
    textPrimary: 'text-slate-100',
    textSecondary: 'text-slate-300',
    textMuted: 'text-slate-400',
    buttonIdle: 'bg-slate-800/70 hover:bg-slate-700/60',
    menuIdle: 'hover:bg-slate-800/70 hover:border-slate-700/60',
    tooltipBg: 'bg-slate-900/95',
    tooltipBorder: 'border-slate-700/60',
    footerText: 'text-slate-400',
  } : {
    shellBg: 'from-slate-50/95 via-indigo-50/95 to-slate-50/95',
    border: 'border-slate-200/60',
    overlay: 'bg-slate-900/30',
    sectionCard: 'from-white/60 to-slate-50/60',
    textPrimary: 'text-slate-700',
    textSecondary: 'text-slate-600',
    textMuted: 'text-slate-500',
    buttonIdle: 'bg-slate-100/80 hover:bg-slate-200/80',
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
        
        /* Enhanced hover effects */
        .group:hover .group-hover\\:animate-pulse {
          animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .group:hover .group-hover\\:scale-110 {
          transform: scale(1.1);
        }
        
        .group:hover .group-hover\\:scale-125 {
          transform: scale(1.25);
        }
        
        .group:hover .group-hover\\:rotate-3 {
          transform: rotate(3deg);
        }
        
        .group:hover .group-hover\\:rotate-12 {
          transform: rotate(12deg);
        }
        
        .group:hover .group-hover\\:translate-x-1 {
          transform: translateX(0.25rem);
        }
        
        .group:hover .group-hover\\:-translate-y-1 {
          transform: translateY(-0.25rem);
        }
        
        /* Smooth transitions for all hover effects */
        * {
          transition-property: transform, color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, filter, backdrop-filter;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 300ms;
        }
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

        <SidebarHeader />

        {/* Menu */}
        <div className="flex-1 relative min-h-0">
          <div className="absolute inset-0 sidebar-scrollable" style={{ overflowY: 'auto', overflowX: 'hidden', padding: '24px 12px' }}>
            <div className="space-y-3">
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  onMouseEnter={() => { handleTooltip(item.id, true); }}
                  onMouseLeave={() => { handleTooltip(item.id, false); }}
                  className="relative"
                >
                  <motion.button
                    whileHover={{
                      x: isCollapsed ? 2 : 5,
                      scale: 1.02,
                      y: -2,
                      boxShadow: isItemActive(item)
                        ? "0 15px 35px rgba(0, 0, 0, 0.2)"
                        : isDark
                          ? "0 10px 25px rgba(148, 163, 184, 0.15)"
                          : "0 10px 25px rgba(148, 163, 184, 0.2)"
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleItemClick(item)}
                    className={`w-full flex items-center p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${isItemActive(item)
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg hover:shadow-xl`
                      : `${themeClasses.menuIdle} hover:shadow-md hover:shadow-slate-500/10 hover:-translate-y-1`
                      }`}
                  >
                    {isItemActive(item) && (
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1.5 h-10 bg-white rounded-full shadow-md" />
                    )}

                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${isItemActive(item) ? 'bg-white/20 group-hover:bg-white/30' : 'bg-slate-100/80 group-hover:bg-slate-200/90'}`}>
                      <item.icon className={`w-6 h-6 transition-all duration-300 group-hover:scale-110 ${isItemActive(item) ? 'text-white group-hover:text-white/90' : `${themeClasses.textPrimary} group-hover:text-blue-500`}`} />
                      {item.premium && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                          <Sparkles className="w-2 h-2 text-white group-hover:animate-pulse" />
                        </div>
                      )}
                    </div>

                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -15 }}
                          transition={{ duration: 0.3 }}
                          className="flex-1 ml-4 text-left"
                        >
                          <div className={`font-bold text-lg transition-all duration-300 group-hover:translate-x-1 ${isItemActive(item) ? 'text-white group-hover:text-white/90' : `${themeClasses.textPrimary} group-hover:text-blue-500`}`}>
                            {item.label}
                          </div>
                          <div className={`text-sm transition-all duration-300 group-hover:translate-x-1 ${isItemActive(item) ? 'text-white/80 group-hover:text-white/70' : `${themeClasses.textMuted} group-hover:text-slate-600`}`}>
                            {item.description}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {item.badge && (
                      <div className="relative">
                        {!isCollapsed ? (
                          <div className="px-3 py-1.5 bg-gradient-to-r from-rose-400 to-red-500 rounded-full text-white text-sm font-bold group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg group-hover:shadow-rose-500/30 transition-all duration-300">
                            {item.badge}
                          </div>
                        ) : (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-rose-400 to-red-500 rounded-full flex items-center justify-center group-hover:scale-125 group-hover:rotate-12 group-hover:shadow-lg group-hover:shadow-rose-500/40 transition-all duration-300">
                            <span className="text-white text-xs font-bold group-hover:animate-pulse">
                              {item.badge > 9 ? '9+' : item.badge}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.button>

                  {isCollapsed && showTooltip === item.id && (
                    <motion.div
                      initial={{ opacity: 0, x: -15, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -15, scale: 0.9 }}
                      className={`absolute left-full top-1/2 transform -translate-y-1/2 ml-4 px-4 py-3 ${themeClasses.tooltipBg} backdrop-blur-2xl text-sm rounded-2xl shadow-xl border ${themeClasses.tooltipBorder} whitespace-nowrap z-50 min-w-[200px]`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${item.color} flex items-center justify-center`}>
                          <item.icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-base">{item.label}</div>
                          <div className="text-xs opacity-70">{item.description}</div>
                          {item.badge && (
                            <div className="text-xs text-rose-500 font-bold mt-1">
                              {item.badge} notifications
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className={`relative z-20 p-4 border-t ${themeClasses.border} flex-shrink-0`}>
          <motion.button
            whileHover={{
              x: isCollapsed ? 2 : 5,
              scale: 1.02,
              y: -2,
              boxShadow: "0 15px 35px rgba(239, 68, 68, 0.3)"
            }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className={`w-full flex items-center p-4 rounded-2xl ${isDark ? 'hover:bg-rose-500/10' : 'hover:bg-rose-50/80'} transition-all duration-300 group hover:shadow-lg hover:shadow-rose-500/20 hover:-translate-y-1`}
            title="Logout"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-rose-400 to-red-500 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-xl group-hover:shadow-rose-500/30 transition-all duration-300">
              <LogOut className="w-6 h-6 text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" />
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 ml-4 text-left"
                >
                  <div className={`${isDark ? 'text-rose-300 group-hover:text-rose-200' : 'text-rose-600 group-hover:text-rose-700'} font-bold text-lg transition-all duration-300 group-hover:translate-x-1`}>
                    Logout
                  </div>
                  <div className={`${isDark ? 'text-rose-400/80 group-hover:text-rose-300/90' : 'text-rose-500/80 group-hover:text-rose-600/90'} text-sm transition-all duration-300 group-hover:translate-x-1`}>
                    Sign out of your account
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

        </div>
      </motion.div>
    </>
  );
};

export default LandlordSideBar;
