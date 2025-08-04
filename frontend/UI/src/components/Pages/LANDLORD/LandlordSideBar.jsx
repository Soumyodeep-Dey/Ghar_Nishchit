import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home,
  Building2,
  Users,
  DollarSign,
  FileText,
  Calendar,
  Settings,
  BarChart3,
  Bell,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Plus,
  Star,
  Crown,
  Shield,
  Zap,
  TrendingUp,
  Activity,
  PieChart,
  Wallet,
  CreditCard,
  Award,
  Target,
  Sparkles,
  Globe,
  Headphones,
  User,
  LogOut,
  HelpCircle,
  ArrowRight,
  Clock,
  Heart,
  Bookmark,
  Archive,
  Flag,
  Gift,
  Eye,
  Search,
  Filter,
  Download,
  Upload,
  Share2,
  Edit,
  Trash2,
  RefreshCw,
  Lock,
  Unlock,
  Key,
  Mail,
  Phone,
  MapPin,
  Camera,
  Video,
  Mic,
  Volume2,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Wifi,
  Database,
  Server,
  Cloud
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LandlordSideBar = ({ currentSection, onSectionChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [showTooltip, setShowTooltip] = useState(null);
  const [userStats, setUserStats] = useState({
    properties: 12,
    tenants: 34,
    revenue: 45600,
    occupancy: 92,
    growth: 15.8
  });

  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef(null);

  // Menu items with sub-sections removed
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      route: '/landlord',
      badge: null,
      description: 'Overview & Analytics',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'properties',
      label: 'Properties',
      icon: Building2,
      route: '/landlord/properties',
      badge: userStats.properties,
      description: 'Manage Properties',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'tenants',
      label: 'Tenants',
      icon: Users,
      route: '/landlord/tenants',
      badge: userStats.tenants,
      description: 'Tenant Management',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: DollarSign,
      route: '/landlord/payments',
      badge: null,
      description: 'Payment Management',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'maintenance',
      label: 'Maintenance',
      icon: Settings,
      route: '/landlord/maintenance',
      badge: 5,
      description: 'Service Requests',
      color: 'from-red-500 to-pink-500'
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      route: '/landlord/messages',
      badge: 3,
      description: 'Communication Hub',
      color: 'from-teal-500 to-cyan-500'
    }
  ];

  // Navigation handler with error handling
  const handleNavigation = (route, sectionName = null) => {
    try {
      // Navigate to the route
      navigate(route);

      // Update current section if provided
      if (sectionName && onSectionChange) {
        onSectionChange(sectionName);
      }

      // Auto-collapse on mobile after navigation
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }

      console.log('Navigating to:', route);
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback - try to navigate without error
      try {
        window.location.href = route;
      } catch (fallbackError) {
        console.error('Fallback navigation failed:', fallbackError);
      }
    }
  };

  // Get current active section based on route
  const getCurrentActiveSection = () => {
    const pathname = location.pathname;

    // Handle exact matches first
    if (pathname === '/landlord' || pathname === '/landlord/') {
      return 'Dashboard';
    }

    // Find the matching menu item based on current path
    const activeItem = menuItems.find(item => {
      if (pathname === item.route) return true;
      if (pathname.startsWith(item.route + '/') && item.route !== '/landlord') return true;
      return false;
    });

    return activeItem ? activeItem.label : 'Dashboard';
  };

  // Update current section when location changes
  useEffect(() => {
    const activeSection = getCurrentActiveSection();
    if (onSectionChange && activeSection !== currentSection) {
      onSectionChange(activeSection);
    }
  }, [location.pathname, onSectionChange]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        // No dropdowns to close anymore, but keeping for consistency
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      } else if (window.innerWidth >= 1024) {
        setIsCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey && event.key >= '1' && event.key <= '9') {
        event.preventDefault();
        const index = parseInt(event.key) - 1;
        if (menuItems[index]) {
          handleNavigation(menuItems[index].route, menuItems[index].label);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle menu item click - simplified since no sub-items
  const handleItemClick = (item) => {
    handleNavigation(item.route, item.label);
  };

  // Handle tooltip display
  const handleTooltip = (itemId, show) => {
    if (isCollapsed) {
      setShowTooltip(show ? itemId : null);
    }
  };

  // Check if current path matches item route
  const isItemActive = (item) => {
    const pathname = location.pathname;

    // Exact match
    if (pathname === item.route) return true;

    // For dashboard, only match exact path
    if (item.route === '/landlord' && pathname === '/landlord') return true;

    // For other routes, match if current path starts with item route
    if (pathname.startsWith(item.route + '/') && item.route !== '/landlord') return true;

    return false;
  };

  // Handle logout
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      // Clear any stored authentication data
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');

      // Navigate to login page
      navigate('/login');
    }
  };

  return (
    <motion.div
      ref={sidebarRef}
      initial={{ x: -300, opacity: 0 }}
      animate={{ 
        x: 0, 
        opacity: 1,
        width: isCollapsed ? 80 : 280 
      }}
      transition={{ 
        duration: 0.6, 
        type: "spring", 
        stiffness: 100,
        damping: 15
      }}
      className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-2xl border-r border-white/10 shadow-2xl z-40 ${
        isCollapsed ? 'w-20' : 'w-72'
      } transition-all duration-500`}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360] 
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0] 
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-r from-pink-500/10 to-cyan-500/10 rounded-full blur-3xl"
        />
      </div>

      {/* Header Section */}
      <div className="relative z-10 p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => handleNavigation('/landlord', 'Dashboard')}
            className="flex items-center space-x-3 cursor-pointer"
          >
            <motion.div
              whileHover={{ rotate: 10 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg"
            >
              <Building2 className="w-7 h-7 text-white" />
            </motion.div>

            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h1 className="text-xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                    Ghar Nishchit
                  </h1>
                  <p className="text-xs text-white/60">Landlord Portal</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Collapse Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-lg"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </motion.div>
          </motion.button>
        </div>

        {/* User Profile Section */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.2 }}
              className="mt-6 p-4 bg-gradient-to-r from-white/5 to-white/10 rounded-2xl border border-white/10"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">JD</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-sm">John Doe</h3>
                  <div className="flex items-center space-x-1">
                    <Crown className="w-3 h-3 text-yellow-400" />
                    <span className="text-yellow-400 text-xs">Premium</span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigate('/landlord/profile')}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                  title="Edit Profile"
                >
                  <Edit className="w-3 h-3 text-white/60" />
                </motion.button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-2 bg-white/5 rounded-lg cursor-pointer"
                  onClick={() => navigate('/landlord/properties')}
                >
                  <div className="text-blue-400 font-bold text-lg">{userStats.properties}</div>
                  <div className="text-white/60 text-xs">Properties</div>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-2 bg-white/5 rounded-lg cursor-pointer"
                  onClick={() => navigate('/landlord/tenants')}
                >
                  <div className="text-green-400 font-bold text-lg">{userStats.occupancy}%</div>
                  <div className="text-white/60 text-xs">Occupied</div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto py-4 px-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        <div className="space-y-2">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onMouseEnter={() => {
                setHoveredItem(item.id);
                handleTooltip(item.id, true);
              }}
              onMouseLeave={() => {
                setHoveredItem(null);
                handleTooltip(item.id, false);
              }}
              className="relative"
            >
              <motion.button
                whileHover={{ x: 5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center p-3 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                  isItemActive(item)
                    ? 'bg-gradient-to-r from-white/20 to-white/10 border border-white/30 shadow-lg'
                    : 'hover:bg-white/10 border border-transparent hover:border-white/20'
                }`}
                title={`${item.label} - ${item.description}`}
              >
                {/* Active Indicator */}
                {isItemActive(item) && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Background Glow Effect */}
                {hoveredItem === item.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-10 rounded-2xl`}
                  />
                )}

                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center relative z-10 ${
                    isItemActive(item)
                      ? `bg-gradient-to-r ${item.color} shadow-lg`
                      : 'bg-white/10 group-hover:bg-white/20'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${
                    isItemActive(item) ? 'text-white' : 'text-white/70 group-hover:text-white'
                  }`} />
                </motion.div>

                {/* Label and Description */}
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex-1 ml-4 text-left relative z-10"
                    >
                      <div className={`font-semibold transition-colors ${
                        isItemActive(item) ? 'text-white' : 'text-white/80 group-hover:text-white'
                      }`}>
                        {item.label}
                      </div>
                      <div className="text-xs text-white/50 group-hover:text-white/60 transition-colors">
                        {item.description}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Badge */}
                {item.badge && (
                  <AnimatePresence>
                    {!isCollapsed ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="relative z-10"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="px-2 py-1 bg-gradient-to-r from-red-500 to-pink-600 rounded-full shadow-lg"
                        >
                          <span className="text-white text-xs font-bold">{item.badge}</span>
                        </motion.div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <span className="text-white text-xs font-bold">{item.badge > 9 ? '9+' : item.badge}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </motion.button>

              {/* Tooltip for Collapsed State */}
              <AnimatePresence>
                {isCollapsed && showTooltip === item.id && (
                  <motion.div
                    initial={{ opacity: 0, x: -10, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -10, scale: 0.8 }}
                    className="absolute left-full top-1/2 transform -translate-y-1/2 ml-4 px-3 py-2 bg-gray-900/90 backdrop-blur-xl text-white text-sm rounded-lg shadow-xl border border-white/20 whitespace-nowrap z-50"
                  >
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-white/60">{item.description}</div>
                    {item.badge && (
                      <div className="text-xs text-red-300 font-bold mt-1">
                        {item.badge} pending
                      </div>
                    )}
                    {/* Tooltip Arrow */}
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 border-l border-t border-white/20 rotate-45"></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="relative z-10 p-4 border-t border-white/10">
        {/* Logout Button */}
        <motion.button
          whileHover={{ x: 5, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full flex items-center p-3 rounded-xl hover:bg-red-500/20 border border-transparent hover:border-red-500/30 transition-all duration-300 group"
          title="Logout"
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center shadow-lg"
          >
            <LogOut className="w-5 h-5 text-white" />
          </motion.div>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex-1 ml-4 text-left"
              >
                <div className="text-red-300 group-hover:text-red-200 font-semibold transition-colors">
                  Logout
                </div>
                <div className="text-xs text-red-400/60 group-hover:text-red-300/80 transition-colors">
                  Sign out of your account
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Resize Handle */}
      <motion.div
        className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-white/20 to-transparent cursor-col-resize hover:bg-white/30 transition-colors duration-300"
        whileHover={{ scale: 1.2 }}
        title="Resize sidebar"
      />

      {/* Mobile Overlay */}
      {!isCollapsed && window.innerWidth < 768 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </motion.div>
  );
};

export default LandlordSideBar;
