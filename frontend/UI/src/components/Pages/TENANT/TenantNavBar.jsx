import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MessageSquare, 
  Bell, 
  LogOut, 
  ChevronDown, 
  Search,
  User,
  Shield,
  Moon,
  Sun,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Custom hooks
const useClickOutside = (ref, callback) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref, callback]);
};

const useTheme = () => {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const newTheme = !prev;
      localStorage.setItem('theme', newTheme ? 'dark' : 'light');
      return newTheme;
    });
  }, []);

  return { isDark, toggleTheme };
};

// Animated Components
const NotificationBadge = ({ count, className = '' }) => {
  if (count === 0) return null;

  return (
    <div className={`absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse ${className}`}>
      {count > 9 ? '9+' : count}
    </div>
  );
};

const SearchBar = ({ isExpanded, onToggle, searchTerm, onSearchChange }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  return (
    <div className="flex items-center">
      {/* Mobile search toggle */}
      <button
        onClick={onToggle}
        className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-110"
      >
        <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>

      {/* Desktop search bar */}
      <div className="hidden md:flex relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search everything..."
            className="w-80 px-4 py-3 pl-12 pr-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile expanded search */}
      {isExpanded && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-900 shadow-lg border-t border-gray-200 dark:border-gray-700 p-4 animate-slideDown">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search everything..."
              className="w-full px-4 py-3 pl-12 pr-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>
      )}
    </div>
  );
};

const IconButton = ({ icon: Icon, onClick, badge = 0, className = '', ariaLabel }) => {
  return (
    <button
      onClick={onClick}
      className={`relative p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-110 group ${className}`}
      aria-label={ariaLabel}
    >
      <Icon className="w-6 h-6 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300" />
      <NotificationBadge count={badge} />
      
      {/* Hover effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-300"></div>
    </button>
  );
};

const ProfileDropdown = ({ user, showDropdown, onToggle, onLogout, isDark, onThemeToggle }) => {
  const dropdownRef = useRef(null);
  
  useClickOutside(dropdownRef, () => showDropdown && onToggle());

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  const profileImage = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff&size=128`;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-3 rounded-2xl transition-all duration-300 hover:scale-105 group"
        onClick={onToggle}
      >
        <div className="relative">
          <img
            src={profileImage}
            alt="User Profile"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600 group-hover:ring-blue-500 transition-all duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center text-white font-semibold text-sm hidden">
            {getInitials(user?.name)}
          </div>
          
          {/* Online indicator */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
        </div>
        
        <div className="hidden md:block text-left">
          <div className="text-gray-900 dark:text-gray-100 font-semibold text-sm">
            {user?.name || 'User'}
          </div>
          <div className="text-gray-500 dark:text-gray-400 text-xs">
            {user?.role || 'Tenant'}
          </div>
        </div>
        
        <ChevronDown className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown menu */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 animate-slideDown backdrop-blur-sm">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <img
                src={profileImage}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-200 dark:ring-blue-400"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {user?.name || 'User'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {user?.email || 'user@example.com'}
                </div>
                <div className="flex items-center mt-1">
                  <Shield className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600 dark:text-green-400">Verified Account</span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 flex items-center space-x-3 group">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors duration-200">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="font-medium">Profile Settings</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Manage your account</div>
              </div>
            </button>

            <button 
              onClick={onThemeToggle}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 flex items-center space-x-3 group"
            >
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900 group-hover:bg-yellow-200 dark:group-hover:bg-yellow-800 transition-colors duration-200">
                {isDark ? 
                  <Sun className="w-4 h-4 text-yellow-600 dark:text-yellow-400" /> : 
                  <Moon className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                }
              </div>
              <div>
                <div className="font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Switch theme</div>
              </div>
            </button>

            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

            <button
              onClick={onLogout}
              className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 flex items-center space-x-3 group"
            >
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900 group-hover:bg-red-200 dark:group-hover:bg-red-800 transition-colors duration-200">
                <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <div className="font-medium">Sign Out</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Logout from your account</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Component
const TenantNavBar = ({ currentSection }) => {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState({
    messages: 3,
    alerts: 2
  });

  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    const onUserUpdated = (e) => {
      try {
        setUser(e.detail || JSON.parse(localStorage.getItem('user')) || {});
      } catch {}
    };
    window.addEventListener('user:updated', onUserUpdated);
    return () => window.removeEventListener('user:updated', onUserUpdated);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('theme');
    navigate('/login');
  }, [navigate]);

  const handleSearch = useCallback((query) => {
    setSearchTerm(query);
    // Implement search functionality here
    console.log('Searching for:', query);
  }, []);

  const getSectionIcon = (section) => {
    const icons = {
      'Dashboard': '🏠',
      'Properties': '🏢',
      'Messages': '💬',
      'Maintenance': '🔧',
      'Payments': '💳',
      'Profile': '👤'
    };
    return icons[section] || '📄';
  };

  return (
    <nav className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between relative z-40 transition-colors duration-300">
      {/* Left side - Current Section */}
      <div className="flex items-center space-x-4 min-w-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
            <span className="text-2xl">{getSectionIcon(currentSection)}</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
              {currentSection}
            </h2>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Sparkles className="w-3 h-3 mr-1" />
              <span>Tenant Portal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Center - Search */}
      <div className="flex-1 flex justify-center max-w-2xl mx-8">
        <SearchBar
          isExpanded={showMobileSearch}
          onToggle={() => setShowMobileSearch(!showMobileSearch)}
          searchTerm={searchTerm}
          onSearchChange={handleSearch}
        />
      </div>

      {/* Right side - Icons and Profile */}
      <div className="flex items-center space-x-2">
        {/* Action Icons */}
        <div className="hidden sm:flex items-center space-x-1">
          <IconButton
            icon={MessageSquare}
            onClick={() => navigate('/tenant/messages')}
            badge={notifications.messages}
            ariaLabel="Messages"
          />
          
          <IconButton
            icon={Bell}
            onClick={() => navigate('/tenant/notifications')}
            badge={notifications.alerts}
            ariaLabel="Notifications"
          />
        </div>

        {/* Mobile menu button */}
        <button className="sm:hidden p-2 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300">
          <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Profile Dropdown */}
        <ProfileDropdown
          user={user}
          showDropdown={showDropdown}
          onToggle={() => setShowDropdown(!showDropdown)}
          onLogout={handleLogout}
          isDark={isDark}
          onThemeToggle={toggleTheme}
        />
      </div>

      {/* Gradient border effect */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-60"></div>

      {/* Custom Styles */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
            transform: translate3d(0, 0, 0);
          }
          40%, 43% {
            animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
            transform: translate3d(0, -5px, 0);
          }
          70% {
            animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
            transform: translate3d(0, -2px, 0);
          }
          90% {
            transform: translate3d(0, -1px, 0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-bounce {
          animation: bounce 1s infinite;
        }

        /* Dark mode styles */
        .dark {
          color-scheme: dark;
        }

        /* Custom scrollbar for dark mode */
        .dark ::-webkit-scrollbar {
          width: 8px;
        }

        .dark ::-webkit-scrollbar-track {
          background: #374151;
        }

        .dark ::-webkit-scrollbar-thumb {
          background: #6B7280;
          border-radius: 4px;
        }

        .dark ::-webkit-scrollbar-thumb:hover {
          background: #9CA3AF;
        }
      `}</style>
    </nav>
  );
};

export default TenantNavBar;
