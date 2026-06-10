import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Bell, Sun, Moon, User, Settings, Languages, LogOut, ChevronDown, X, MessageSquare, Wrench, CreditCard, Home, Building2, Heart } from 'lucide-react';
import { useDarkMode } from '../../../useDarkMode.js';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../services/api.js';
import { useLanguage } from '../../../i18n/LanguageContext.jsx';
import LanguageDialog from '../../LanguageDialog.jsx';
import { showConfirmToast } from '../../../utils/toast.jsx';
import { getDashboardTheme } from '../../../styles/dashboardTheme.js';

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

const SECTION_SUBTITLE_KEYS = {
  Dashboard: 'sections.overviewAnalytics',
  Properties: 'sections.browseProperties',
  Favorites: 'sections.savedProperties',
  Payments: 'sections.paymentHistory',
  Maintenance: 'sections.serviceRequests',
  Messages: 'sections.communicationHub',
  Contracts: 'sections.leaseAgreements',
};

const TenantNavBar = ({ currentSection = 'Dashboard' }) => {
  const { darkMode: isDarkMode, toggleDarkMode } = useDarkMode();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);
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
      const data = await api.getNotifications();
      const iconMap = {
        inquiry:     MessageSquare,
        maintenance: Wrench,
        payment:     CreditCard,
        general:     Bell,
        message:     MessageSquare,
      };
      const colorMap = {
        inquiry:     'primary',
        maintenance: 'warning',
        payment:     'success',
        general:     'primary',
        message:     'primary',
      };
      const mapped = (Array.isArray(data) ? data : []).map((n) => ({
        id:      n.id || n._id,
        type:    n.type,
        icon:    iconMap[n.type] || Bell,
        title:   n.title,
        message: n.message,
        time:    n.time || new Date(n.createdAt).toLocaleString(),
        isRead:  n.read,
        color:   colorMap[n.type] || 'primary',
        relatedId: n.relatedId,
      }));
      setNotifications(mapped);
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

  const markAsRead = async (notification) => {
    setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
    try {
      await api.markNotificationRead(notification.id);
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
    setIsNotificationsOpen(false); // Close dropdown
    
    // Redirect logic
    if (notification.type === 'inquiry' || notification.type === 'message') {
      navigate('/tenant/messages', { state: { activeInquiryId: notification.relatedId } });
    }
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      await api.markAllNotificationsRead();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  // Search suggestions — each entry navigates on click.
  const searchSuggestions = [
    { labelKey: 'search.myProperty',          route: '/tenant/properties' },
    { labelKey: 'search.paymentHistory',      route: '/tenant/payment' },
    { labelKey: 'search.maintenanceRequests', route: '/tenant/maintenance' },
    { labelKey: 'search.messages',             route: '/tenant/messages' },
    { labelKey: 'search.rentReceipt',         route: '/tenant/payment' },
  ];

  const filteredSuggestions = searchSuggestions.filter(s =>
    t(s.labelKey).toLowerCase().includes(searchQuery.toLowerCase()) && searchQuery.length > 0
  );

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(t(suggestion.labelKey));
    setIsSearchFocused(false);
    navigate(suggestion.route);
  };

  const handleLogout = () => {
    showConfirmToast(t('common.logoutConfirm'), () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    });
  };

  const handleLanguages = () => {
    setIsProfileDropdownOpen(false);
    setLanguageDialogOpen(true);
  };

  const CurrentSectionIcon = getCurrentSectionIcon();
  const theme = getDashboardTheme(isDarkMode);
  if (!user) return null;

  return (
    <nav className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-colors duration-500 ${theme.navbar}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Current Section Display */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-[14px] shadow-[0_8px_20px_rgba(217,119,6,0.25)] ${theme.avatar}`}>
                <CurrentSectionIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-black tracking-tight ${theme.textPrimary}`}>{t(`sections.${currentSection}`)}</h1>
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme.textSecondary}`}>
                  {t(SECTION_SUBTITLE_KEYS[currentSection] || 'sections.overviewAnalytics')}
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
                placeholder={t('common.searchProperties')}
                className={`w-full pl-11 pr-4 py-2.5 border-2 rounded-2xl focus:outline-none transition-all font-medium ${theme.searchBg} ${theme.searchFocus} ${theme.textPrimary} placeholder-slate-400`}
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
                <div className={`absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-xl border z-50 ${theme.dropdown}`}>
                  {filteredSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`w-full px-4 py-3 text-left text-sm font-medium flex items-center justify-between ${theme.textPrimary} ${theme.dropdownHover}`}
                    >
                      <span>{t(suggestion.labelKey)}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{t('common.go')}</span>
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
                className={`relative p-2.5 rounded-full transition-all ${isDarkMode ? 'text-slate-400 hover:text-amber-400 hover:bg-slate-800' : 'text-slate-600 hover:text-amber-600 hover:bg-amber-50'}`}
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-amber-500 text-slate-950 text-xs rounded-full flex items-center justify-center font-black">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className={`absolute right-0 mt-3 w-96 rounded-2xl shadow-2xl border z-50 ${theme.dropdown}`}>

                  {/* Header */}
                  <div className={`p-4 border-b flex items-center justify-between ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                    <h3 className={`font-black ${theme.textPrimary}`}>{t('common.notifications')}</h3>
                    <div className="flex items-center gap-3">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-500 font-black uppercase tracking-widest"
                        >
                          {t('common.markAllRead')}
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
                        {t('common.loadingNotifications')}
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                        <Bell className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">{t('common.allCaughtUp')}</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{t('common.noNotifications')}</p>
                      </div>
                    ) : (
                      notifications.map((notification) => {
                        const IconComponent = notification.icon;
                        const colorClasses = {
                          success: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30',
                          warning: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
                          primary: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
                        };
                        return (
                          <div
                            key={notification.id}
                            className={`p-4 cursor-pointer border-l-4 ${theme.dropdownHover} ${
                              notification.isRead ? 'border-transparent' : theme.unreadBorder
                            }`}
                            onClick={() => markAsRead(notification)}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`p-2 rounded-lg flex-shrink-0 ${colorClasses[notification.color]}`}>
                                <IconComponent className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`font-bold truncate ${
                                  notification.isRead ? theme.textSecondary : theme.textPrimary
                                }`}>
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{notification.time}</p>
                              </div>
                              {!notification.isRead && (
                                <div className={`h-2 w-2 rounded-full flex-shrink-0 mt-1 ${theme.unreadDot}`} />
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
              className={`p-2.5 rounded-full transition-all shadow-md active:scale-90 ${isDarkMode ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' : 'bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200'}`}
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(prev => !prev)}
                className={`flex items-center space-x-3 p-2 rounded-2xl transition-all ${theme.dropdownHover}`}
              >
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center shadow-md ${theme.avatar}`}>
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className={`font-black text-sm ${theme.textPrimary}`}>{user.name}</p>
                  <p className={`text-xs ${theme.textSecondary}`}>{user.email}</p>
                </div>
                <ChevronDown className={`h-4 w-4 ${theme.textSecondary} transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileDropdownOpen && (
                <div className={`absolute right-0 mt-3 w-64 rounded-2xl shadow-2xl border z-50 ${theme.dropdown}`}>
                  <div className={`p-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                    <div className="flex items-center space-x-3">
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg ${theme.avatar}`}>
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className={`font-black ${theme.textPrimary}`}>{user.name}</p>
                        <p className={`text-sm ${theme.textSecondary}`}>{user.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <Link
                      to="/tenant/profile"
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl transition-all ${theme.textPrimary} ${theme.dropdownHover}`}
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                        <Settings className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <span className="font-bold">{t('common.updateProfile')}</span>
                    </Link>

                    <button
                      onClick={handleLanguages}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl transition-all ${theme.textPrimary} ${theme.dropdownHover}`}
                    >
                      <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <Languages className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <span className="font-bold">{t('common.languages')}</span>
                    </button>

                    <hr className={`my-2 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`} />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                    >
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <LogOut className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{t('common.logout')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <LanguageDialog open={languageDialogOpen} onClose={() => setLanguageDialogOpen(false)} />

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-2xl focus:outline-none transition-all font-medium ${theme.searchBg} ${theme.searchFocus} ${theme.textPrimary} placeholder-slate-400`}
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
