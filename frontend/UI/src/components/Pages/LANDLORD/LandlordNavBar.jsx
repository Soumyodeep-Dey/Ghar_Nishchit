import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  BellOff, 
  Search, 
  Settings, 
  User, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown, 
  Plus, 
  MessageCircle, 
  DollarSign, 
  Building2, 
  Users, 
  Calendar, 
  FileText, 
  Star, 
  TrendingUp, 
  Shield, 
  HelpCircle,
  Globe, 
  Moon, 
  Sun, 
  Mail, 
  Phone, 
  MapPin, 
  Crown, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Home, 
  BarChart3, 
  Wallet, 
  CreditCard, 
  Archive, 
  Bookmark, 
  Flag, 
  Share2, 
  Download, 
  Upload, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Filter, 
  SortAsc, 
  Zap, 
  Target, 
  Award, 
  Gift, 
  Heart, 
  Smile, 
  Camera, 
  Video, 
  Mic, 
  Headphones, 
  Volume2, 
  VolumeX,
  Maximize,
  Minimize,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Wifi,
  Database,
  Server,
  Cloud,
  Lock,
  Unlock,
  Key,
  ShieldCheck,
  Eye,
  EyeOff,
  Activity,
  PieChart,
  TrendingDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LandlordNavBar = () => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  const searchRef = useRef(null);
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);
  const quickActionsRef = useRef(null);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target)) {
        setShowQuickActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sample data
  const notifications = [
    {
      id: 1,
      type: 'payment',
      title: 'Payment Received',
      message: 'John Doe paid rent for Modern Loft #101',
      time: '2 minutes ago',
      read: false,
      avatar: 'JD',
      amount: '$2,800'
    },
    {
      id: 2,
      type: 'maintenance',
      title: 'Maintenance Request',
      message: 'New plumbing issue reported at Luxury Penthouse',
      time: '15 minutes ago',
      read: false,
      priority: 'high'
    },
    {
      id: 3,
      type: 'visit',
      title: 'Visit Scheduled',
      message: 'Property viewing confirmed for tomorrow 2 PM',
      time: '1 hour ago',
      read: true,
      property: 'Garden View Apartment'
    },
    {
      id: 4,
      type: 'contract',
      title: 'Contract Signed',
      message: 'Sarah Wilson signed the lease agreement',
      time: '3 hours ago',
      read: true,
      status: 'success'
    },
    {
      id: 5,
      type: 'system',
      title: 'System Update',
      message: 'New features are now available in your dashboard',
      time: '1 day ago',
      read: true
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const quickActions = [
    { 
      icon: Plus, 
      label: 'Add Property', 
      color: 'from-blue-500 to-indigo-600',
      description: 'List a new property'
    },
    { 
      icon: Users, 
      label: 'Add Tenant', 
      color: 'from-green-500 to-emerald-600',
      description: 'Register new tenant'
    },
    { 
      icon: Calendar, 
      label: 'Schedule Visit', 
      color: 'from-purple-500 to-pink-600',
      description: 'Book property viewing'
    },
    { 
      icon: FileText, 
      label: 'Generate Report', 
      color: 'from-orange-500 to-red-600',
      description: 'Create analytics report'
    },
    { 
      icon: MessageCircle, 
      label: 'Send Message', 
      color: 'from-cyan-500 to-blue-600',
      description: 'Contact tenants'
    },
    { 
      icon: DollarSign, 
      label: 'Record Payment', 
      color: 'from-yellow-500 to-orange-600',
      description: 'Log rent payment'
    }
  ];

  const userStats = {
    properties: 12,
    tenants: 28,
    revenue: 42500,
    occupancy: 92
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'payment':
        return <DollarSign className="w-4 h-4 text-green-400" />;
      case 'maintenance':
        return <AlertCircle className="w-4 h-4 text-orange-400" />;
      case 'visit':
        return <Calendar className="w-4 h-4 text-blue-400" />;
      case 'contract':
        return <FileText className="w-4 h-4 text-purple-400" />;
      case 'system':
        return <Settings className="w-4 h-4 text-gray-400" />;
      default:
        return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // Implement search functionality
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    // Apply theme change to document
    document.documentElement.classList.toggle('dark', newDarkMode);
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-lg"
    >
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-4"
          >
            <motion.div
              whileHover={{ rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg"
            >
              <Building2 className="w-7 h-7 text-white" />
            </motion.div>
            <div className="hidden sm:block">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent"
              >
                Ghar Nishchit
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xs text-white/60"
              >
                Landlord Portal
              </motion.p>
            </div>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="hidden md:flex flex-1 max-w-md mx-8"
          >
            <div className="relative w-full">
              <motion.div
                animate={{
                  scale: isSearchFocused ? 1.02 : 1,
                  boxShadow: isSearchFocused 
                    ? "0 10px 25px rgba(59, 130, 246, 0.3)" 
                    : "0 4px 15px rgba(0, 0, 0, 0.1)"
                }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                  isSearchFocused ? 'text-blue-400' : 'text-white/50'
                }`} />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  onKeyPress={handleSearch}
                  placeholder="Search properties, tenants, payments..."
                  className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-2xl text-white placeholder-white/50 transition-all duration-300 ${
                    isSearchFocused 
                      ? 'border-blue-500 bg-white/20' 
                      : 'border-white/20 hover:border-white/40'
                  } focus:outline-none`}
                />
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-white/60" />
                  </motion.button>
                )}
              </motion.div>
              
              {/* Search Suggestions */}
              <AnimatePresence>
                {isSearchFocused && searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full mt-2 w-full bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl shadow-xl overflow-hidden"
                  >
                    <div className="p-3">
                      <div className="text-white/60 text-xs font-semibold mb-2">QUICK RESULTS</div>
                      {[
                        { type: 'property', name: 'Modern Downtown Loft', icon: Building2 },
                        { type: 'tenant', name: 'John Doe', icon: User },
                        { type: 'payment', name: 'Recent Payments', icon: DollarSign }
                      ].map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center space-x-3 p-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
                        >
                          <item.icon className="w-4 h-4 text-white/60" />
                          <span className="text-white text-sm">{item.name}</span>
                          <span className="text-xs text-white/40 capitalize">{item.type}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            {/* Current Time */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="hidden lg:flex flex-col items-end mr-2"
            >
              <div className="text-white text-sm font-semibold">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-white/60 text-xs">
                {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <div className="relative" ref={quickActionsRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300 shadow-lg"
              >
                <Plus className="w-5 h-5 text-purple-300" />
              </motion.button>

              <AnimatePresence>
                {showQuickActions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-80 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl shadow-xl overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="text-white font-semibold mb-4 flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span>Quick Actions</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {quickActions.map((action, index) => (
                          <motion.button
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-200 group"
                          >
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mb-2 mx-auto group-hover:scale-110 transition-transform`}>
                              <action.icon className="w-4 h-4 text-white" />
                            </div>
                            <div className="text-white text-xs font-medium">{action.label}</div>
                            <div className="text-white/50 text-xs mt-1">{action.description}</div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="p-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300 shadow-lg"
            >
              <motion.div
                animate={{ rotate: isDarkMode ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-blue-300" />
                )}
              </motion.div>
            </motion.button>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300 shadow-lg"
              >
                <motion.div
                  animate={{ rotate: showNotifications ? 15 : 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <Bell className="w-5 h-5 text-white" />
                </motion.div>
                {unreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <span className="text-xs text-white font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute inset-0 bg-red-500 rounded-full opacity-50"
                    />
                  </motion.div>
                )}
              </motion.button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-96 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl shadow-xl overflow-hidden"
                  >
                    <div className="p-4 border-b border-white/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Bell className="w-5 h-5 text-white" />
                          <span className="text-white font-semibold">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded-full text-xs font-semibold">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                        >
                          <Settings className="w-4 h-4 text-white/70" />
                        </motion.button>
                      </div>
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((notification, index) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                          className={`p-4 border-b border-white/10 cursor-pointer transition-all duration-200 ${
                            !notification.read ? 'bg-blue-500/10' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              notification.avatar 
                                ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                                : 'bg-white/10'
                            }`}>
                              {notification.avatar ? (
                                <span className="text-white font-semibold text-sm">
                                  {notification.avatar}
                                </span>
                              ) : (
                                getNotificationIcon(notification.type)
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="text-white font-medium text-sm truncate">
                                  {notification.title}
                                </h4>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-white/70 text-sm line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-white/50 text-xs">
                                  {notification.time}
                                </span>
                                {notification.amount && (
                                  <span className="text-green-400 font-semibold text-sm">
                                    {notification.amount}
                                  </span>
                                )}
                                {notification.priority === 'high' && (
                                  <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded-full text-xs">
                                    High Priority
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="p-4 border-t border-white/20">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-2 text-center text-white/70 hover:text-white transition-colors text-sm font-medium"
                      >
                        View All Notifications
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile */}
            <div className="relative" ref={userMenuRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300 shadow-lg"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">JD</span>
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-white text-sm font-medium">John Doe</div>
                  <div className="text-white/60 text-xs">Premium Landlord</div>
                </div>
                <motion.div
                  animate={{ rotate: showUserMenu ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4 text-white/70" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-80 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl shadow-xl overflow-hidden"
                  >
                    {/* User Info Header */}
                    <div className="p-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-b border-white/20">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                          <span className="text-white font-bold text-xl">JD</span>
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-lg">John Doe</h3>
                          <p className="text-white/70 text-sm">john.doe@email.com</p>
                          <div className="flex items-center space-x-1 mt-1">
                            <Crown className="w-3 h-3 text-yellow-400" />
                            <span className="text-yellow-400 text-xs font-medium">Premium Member</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="p-4 border-b border-white/20">
                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-blue-400 font-bold text-lg">{userStats.properties}</div>
                          <div className="text-white/60 text-xs">Properties</div>
                        </div>
                        <div className="text-center">
                          <div className="text-green-400 font-bold text-lg">{userStats.tenants}</div>
                          <div className="text-white/60 text-xs">Tenants</div>
                        </div>
                        <div className="text-center">
                          <div className="text-purple-400 font-bold text-lg">
                            ${(userStats.revenue / 1000).toFixed(0)}K
                          </div>
                          <div className="text-white/60 text-xs">Revenue</div>
                        </div>
                        <div className="text-center">
                          <div className="text-yellow-400 font-bold text-lg">{userStats.occupancy}%</div>
                          <div className="text-white/60 text-xs">Occupied</div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      {[
                        { icon: User, label: 'Profile Settings', color: 'text-blue-400' },
                        { icon: BarChart3, label: 'Analytics Dashboard', color: 'text-green-400' },
                        { icon: Wallet, label: 'Payment History', color: 'text-purple-400' },
                        { icon: Shield, label: 'Security & Privacy', color: 'text-yellow-400' },
                        { icon: Bell, label: 'Notification Settings', color: 'text-pink-400' },
                        { icon: HelpCircle, label: 'Help & Support', color: 'text-cyan-400' }
                      ].map((item, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ x: 5, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-200 text-left"
                        >
                          <item.icon className={`w-5 h-5 ${item.color}`} />
                          <span className="text-white font-medium">{item.label}</span>
                        </motion.button>
                      ))}
                    </div>

                    {/* Logout */}
                    <div className="p-2 border-t border-white/20">
                      <motion.button
                        whileHover={{ x: 5, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-red-500/10 transition-all duration-200 text-left"
                      >
                        <LogOut className="w-5 h-5 text-red-400" />
                        <span className="text-red-400 font-medium">Sign Out</span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300 shadow-lg"
            >
              <motion.div
                animate={{ rotate: showMobileMenu ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {showMobileMenu ? (
                  <X className="w-5 h-5 text-white" />
                ) : (
                  <Menu className="w-5 h-5 text-white" />
                )}
              </motion.div>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/20 bg-white/5 backdrop-blur-xl"
            >
              <div className="p-4 space-y-4">
                {/* Mobile Search */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Mobile Quick Actions */}
                <div className="grid grid-cols-3 gap-3">
                  {quickActions.slice(0, 6).map((action, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mb-2 mx-auto`}>
                        <action.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-white text-xs font-medium">{action.label}</div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Bar for Loading States */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 origin-left"
        style={{ width: '100%' }}
      />
    </motion.nav>
  );
};

export default LandlordNavBar;
