import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Bell, Sun, Moon, User, Settings, HelpCircle, LogOut, ChevronDown, X, MessageSquare, Wrench, CreditCard, Home, Building2, Heart } from 'lucide-react';
import { useDarkMode } from '../../../useDarkMode.js';
import { Link, useNavigate } from 'react-router-dom';

// Safe user reader — returns null if localStorage is missing or malformed.
const readUserFromStorage = () => {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || (!parsed.name && !parsed.email)) return null;
    return parsed;
  } catch {
    return null;
  }
};

const TenantNavBar = ({ currentSection = 'Dashboard' }) => {
  const { darkMode: isDarkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Redirect to login if no valid session.
  const [user, setUser] = useState(() => readUserFromStorage());

  useEffect(() => {
    if (!user) navigate('/login', { replace: true });
  }, [user, navigate]);

  // Notifications — fetched from API, shown entirely inside the dropdown.
  // No separate page. The dropdown scrolls if there are many notifications.
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      // TODO: replace with real API call, e.g.:
      // const res = await fetch('/api/tenant/notifications', {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      // });
      // const data = await res.json();
      // setNotifications(data);
      setNotifications([]);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setNotifLoading(false);
    }
  }, []);

  // Fetch on mount and auto-refresh every 60 s.
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Sync user state on external updates.
  useEffect(() => {
    const onUserUpdated = (e) => {
      try {
        setUser(e.detail || readUserFromStorage());
      } catch { /* noop */ }
    };
    window.addEventListener('user:updated', onUserUpdated);
    return () => window.removeEventListener('user:updated', onUserUpdated);
  }, []);

  const profileDropdownRef = useRef(null);
  const notificationsRef   = useRef(null);
  const searchRef          = useRef(null);

  const sectionIcons = {
    Dashboard:   Home,
    Properties:  Building2,
    Favorites:   Heart,
    Payments:    CreditCard,
    Maintenance: Wrench,
    Messages:    MessageSquare,
  };
  const getCurrentSectionIcon = () => sectionIcons[currentSection] || Home;

  // Close dropdowns on outside click.
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target))
        setIsProfileDropdownOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(e.target))
        setIsNotificationsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    // TODO: PATCH /api/tenant/notifications/:id/read
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    // TODO: PATCH /api/tenant/notifications/read-all
  };

  // Search suggestions — each entry navigates on click.
  const searchSuggestions = [
    { label: 'My Property',          route: '/tenant/properties' },
    { label: 'Payment history',      route: '/tenant/payment' },
    { label: 'Maintenance requests', route: '/tenant/maintenance' },
    { label: 'Messages',             route: '/tenant/messages' },
    { label: 'Rent receipt',         route: '/tenant/payment' },
  ];

  const filteredSuggestions = searchSuggestions.filter(s =>
    s.label.toLowerCase().includes(searchQuery.toLowerCase()) && searchQuery.length > 0
  );

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.label);
    setIsSearchFocused(false);
    navigate(suggestion.route);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleHelpSupport = () => {
    setIsProfileDropdownOpen(false);
    navigate('/tenant/support');
  };

  const CurrentSectionIcon = getCurrentSectionIcon();
  if (!user) return null;

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Current Section Display */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <CurrentSectionIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{currentSection}</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {currentSection === 'Dashboard'   && 'Overview & Analytics'}
                  {currentSection === 'Properties'  && 'Browse Properties'}
                  {currentSection === 'Favorites'   && 'Saved Properties'}
                  {currentSection === 'Payments'    && 'Payment History'}
                  {currentSection === 'Maintenance' && 'Service Requests'}
                  {currentSection === 'Messages'    && 'Communication Hub'}
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                placeholder="Search properties, payments, or requests..."
                className="w-full pl-11 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {isSearchFocused && filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  {filteredSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm flex items-center justify-between"
                    >
                      <span>{suggestion.label}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">Go →</span>
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
                onClick={() => {
                  setIsNotificationsOpen(prev => !prev);
                  if (!isNotificationsOpen) fetchNotifications();
                }}
                className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-96 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">

                  {/* Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    <div className="flex items-center gap-3">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                      {/* Close button — keeps users on the same page */}
                      <button
                        onClick={() => setIsNotificationsOpen(false)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        aria-label="Close notifications"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* All notifications shown here — scrollable, no separate page */}
                  <div className="max-h-[28rem] overflow-y-auto">
                    {notifLoading ? (
                      <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                        Loading notifications...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                        <Bell className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">You're all caught up!</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">No new notifications right now.</p>
                      </div>
                    ) : (
                      notifications.map((notification) => {
                        const IconComponent = notification.icon;
                        const colorClasses = {
                          success: 'text-green-600 bg-green-100 dark:bg-green-900/30',
                          warning: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
                          primary: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
                        };
                        return (
                          <div
                            key={notification.id}
                            className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-l-4 ${
                              notification.isRead
                                ? 'border-transparent'
                                : 'border-blue-500 bg-blue-50/30 dark:bg-blue-900/10'
                            }`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`p-2 rounded-lg flex-shrink-0 ${colorClasses[notification.color]}`}>
                                <IconComponent className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`font-medium truncate ${
                                  notification.isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'
                                }`}>
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{notification.time}</p>
                              </div>
                              {!notification.isRead && (
                                <div className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  {/* No footer / no "View all" link — everything is shown inline above */}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(prev => !prev)}
                className="flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <Link
                      to="/tenant/profile"
                      className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="font-medium">Update Profile</span>
                    </Link>

                    <button
                      onClick={handleHelpSupport}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    >
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                        <HelpCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <span className="font-medium">Help & Support</span>
                    </button>

                    <hr className="my-2 border-gray-200 dark:border-gray-700" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
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
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
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

export default TenantNavBar;
