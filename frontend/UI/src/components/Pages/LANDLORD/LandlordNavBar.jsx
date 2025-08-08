import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  User,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  X,
  Check,
  MessageSquare,
  Wrench,
  CreditCard,
  Home,
  Building2,
  Users,
  DollarSign
} from 'lucide-react';
import { useDarkMode } from '../../../DarkModeContext';

const LandlordNavbar = ({ currentSection = 'Dashboard' }) => {
  const { darkMode: isDarkMode, toggleDarkMode } = useDarkMode();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const profileDropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const searchRef = useRef(null);

  // Section icons mapping
  const sectionIcons = {
    'Dashboard': Home,
    'Properties': Building2,
    'Tenants': Users,
    'Payments': DollarSign,
    'Maintenance': Settings,
    'Messages': MessageSquare
  };

  // Section colors mapping
  const sectionColors = {
    'Dashboard': 'from-blue-500 to-cyan-500',
    'Properties': 'from-purple-500 to-pink-500',
    'Tenants': 'from-green-500 to-emerald-500',
    'Payments': 'from-yellow-500 to-orange-500',
    'Maintenance': 'from-red-500 to-pink-500',
    'Messages': 'from-teal-500 to-cyan-500'
  };

  // Get the icon component for current section
  const getCurrentSectionIcon = () => {
    return sectionIcons[currentSection] || Home;
  };

  // Get the color for current section
  const getCurrentSectionColor = () => {
    return sectionColors[currentSection] || 'from-blue-500 to-cyan-500';
  };

  // Sample notifications data
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'payment',
      icon: CreditCard,
      title: 'Payment Received',
      message: 'John Doe sent ₹15,000 rent payment',
      time: '2 minutes ago',
      isRead: false,
      color: 'success'
    },
    {
      id: 2,
      type: 'maintenance',
      icon: Wrench,
      title: 'Maintenance Request',
      message: 'AC repair needed at Skyline Residency',
      time: '1 hour ago',
      isRead: false,
      color: 'warning'
    },
    {
      id: 3,
      type: 'message',
      icon: MessageSquare,
      title: 'New Message',
      message: 'Sarah Smith: "When will the plumber arrive?"',
      time: '3 hours ago',
      isRead: true,
      color: 'primary'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Theme toggle functionality
  const toggleTheme = () => {
    toggleDarkMode();
    document.documentElement.classList.toggle('dark');

    // Add smooth transition animation
    const body = document.body;
    body.style.transition = 'all 0.3s ease-in-out';
    setTimeout(() => {
      body.style.transition = '';
    }, 300);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  // Search suggestions (you can replace with real search logic)
  const searchSuggestions = [
    'Skyline Residency',
    'John Doe',
    'Maintenance requests',
    'Payment history',
    'Tenant messages'
  ];

  const filteredSuggestions = searchSuggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(searchQuery.toLowerCase()) && searchQuery.length > 0
  );

  const CurrentSectionIcon = getCurrentSectionIcon();

  return (
    <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-glass dark:shadow-glass-dark border-b border-gray-200/20 dark:border-gray-700/20 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Current Section Display */}
          <div className="flex items-center space-x-4 min-w-0">
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <div className={`p-2.5 bg-gradient-to-br ${getCurrentSectionColor()} rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105`}>
                  <CurrentSectionIcon className="h-5 w-5 text-white" />
                </div>
                {/* Animated glow effect */}
                <div className={`absolute inset-0 p-2.5 bg-gradient-to-br ${getCurrentSectionColor()} rounded-xl opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-300`} />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent truncate">
                  {currentSection}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {currentSection === 'Dashboard' && 'Overview & Analytics'}
                  {currentSection === 'Properties' && 'Manage Properties'}
                  {currentSection === 'Tenants' && 'Tenant Management'}
                  {currentSection === 'Payments' && 'Payment Management'}
                  {currentSection === 'Maintenance' && 'Service Requests'}
                  {currentSection === 'Messages' && 'Communication Hub'}
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Search className={`h-4 w-4 transition-colors duration-200 ${
                  isSearchFocused 
                    ? 'text-primary-500 dark:text-primary-400' 
                    : 'text-gray-400 dark:text-gray-500'
                }`} />
              </div>
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                placeholder="Search properties, tenants, or requests..."
                className="w-full pl-11 pr-4 py-2.5 bg-gray-100/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:border-primary-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 backdrop-blur-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Search Suggestions Dropdown */}
              {isSearchFocused && filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-glass dark:shadow-glass-dark border border-gray-200/20 dark:border-gray-700/20 overflow-hidden z-50">
                  {filteredSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchQuery(suggestion);
                        setIsSearchFocused(false);
                      }}
                      className="w-full px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2.5 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 rounded-xl transition-all duration-200 group"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-error-500 to-error-600 text-white text-xs rounded-full flex items-center justify-center font-semibold animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-xl bg-primary-500/20 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-200" />
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-96 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-glass dark:shadow-glass-dark border border-gray-200/20 dark:border-gray-700/20 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
                  {/* Header */}
                  <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-primary-50/50 to-transparent dark:from-primary-900/20">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => {
                      const IconComponent = notification.icon;
                      const colorClasses = {
                        success: 'text-success-600 bg-success-100 dark:bg-success-900/30',
                        warning: 'text-warning-600 bg-warning-100 dark:bg-warning-900/30',
                        primary: 'text-primary-600 bg-primary-100 dark:bg-primary-900/30'
                      };

                      return (
                        <div
                          key={notification.id}
                          className={`p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer border-l-4 ${
                            notification.isRead 
                              ? 'border-transparent' 
                              : 'border-primary-500 bg-primary-50/30 dark:bg-primary-900/10'
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${colorClasses[notification.color]}`}>
                              <IconComponent className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium ${notification.isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                {notification.time}
                              </p>
                            </div>
                            {!notification.isRead && (
                              <div className="h-2 w-2 bg-primary-600 rounded-full animate-pulse" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/50">
                    <button className="w-full text-center text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium py-2 text-sm transition-colors">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 rounded-xl transition-all duration-200 group relative overflow-hidden"
            >
              <div className="relative z-10">
                {isDarkMode ? (
                  <Sun className="h-5 w-5 animate-in spin-in-180 duration-300" />
                ) : (
                  <Moon className="h-5 w-5 animate-in spin-in-180 duration-300" />
                )}
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-400/20 to-orange-400/20 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-200" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center space-x-3 p-2 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 rounded-xl transition-all duration-200 group"
              >
                <div className="relative">
                  <div className="h-9 w-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  {/* Online indicator */}
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-success-500 rounded-full border-2 border-white dark:border-gray-900" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">John Landlord</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Premium Member</p>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                  isProfileDropdownOpen ? 'rotate-180' : ''
                }`} />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-glass dark:shadow-glass-dark border border-gray-200/20 dark:border-gray-700/20 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
                  {/* Profile Info */}
                  <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-primary-50/50 to-transparent dark:from-primary-900/20">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">John Landlord</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">john@example.com</p>
                        <div className="flex items-center mt-1">
                          <div className="h-2 w-2 bg-success-500 rounded-full mr-2" />
                          <span className="text-xs text-success-600 dark:text-success-400">Online</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Options */}
                  <div className="p-2">
                    <button className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 rounded-xl transition-all duration-200 group">
                      <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg group-hover:bg-primary-200 dark:group-hover:bg-primary-900/50 transition-colors">
                        <Settings className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                      </div>
                      <span className="font-medium">Update Profile</span>
                    </button>

                    <button className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 rounded-xl transition-all duration-200 group">
                      <div className="p-2 bg-warning-100 dark:bg-warning-900/30 rounded-lg group-hover:bg-warning-200 dark:group-hover:bg-warning-900/50 transition-colors">
                        <HelpCircle className="h-4 w-4 text-warning-600 dark:text-warning-400" />
                      </div>
                      <span className="font-medium">Help & Support</span>
                    </button>

                    <hr className="my-2 border-gray-200/50 dark:border-gray-700/50" />

                    <button className="w-full flex items-center space-x-3 px-4 py-3 text-left text-error-600 dark:text-error-400 hover:bg-error-50/80 dark:hover:bg-error-900/20 rounded-xl transition-all duration-200 group">
                      <div className="p-2 bg-error-100 dark:bg-error-900/30 rounded-lg group-hover:bg-error-200 dark:group-hover:bg-error-900/50 transition-colors">
                        <LogOut className="h-4 w-4" />
                      </div>
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default LandlordNavbar;
