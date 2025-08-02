import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  LayoutDashboard,
  Building2,
  MessageSquare,
  Wrench,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Shield,
  TrendingUp,
  User,
  Settings
} from 'lucide-react';

// Custom hooks
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};

// Enhanced sections with additional metadata
const sections = [
  { 
    name: 'Dashboard', 
    icon: LayoutDashboard, 
    path: '/tenant',
    gradient: 'from-blue-500 to-indigo-600',
    description: 'Overview & Analytics',
    badge: null
  },
  { 
    name: 'Properties', 
    icon: Building2, 
    path: '/tenant/properties',
    gradient: 'from-purple-500 to-pink-600',
    description: 'Browse & Manage',
    badge: 'new'
  },
  { 
    name: 'Messages', 
    icon: MessageSquare, 
    path: '/tenant/messages',
    gradient: 'from-green-500 to-emerald-600',
    description: 'Chat & Communication',
    badge: 3
  },
  { 
    name: 'Maintenance', 
    icon: Wrench, 
    path: '/tenant/maintenance',
    gradient: 'from-orange-500 to-red-600',
    description: 'Requests & Issues',
    badge: 1
  },
  { 
    name: 'Payments', 
    icon: CreditCard, 
    path: '/tenant/payment',
    gradient: 'from-cyan-500 to-blue-600',
    description: 'Bills & Transactions',
    badge: null
  },
];

// Animated Components
const NavButton = ({ section, isActive, isCollapsed, onClick, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const IconComponent = section.icon;

  return (
    <div
      className={`relative transform transition-all duration-500 ease-out ${
        isActive ? 'translate-x-2' : 'translate-x-0'
      }`}
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group relative w-full flex items-center text-left focus:outline-none transition-all duration-300 overflow-hidden ${
          isCollapsed ? 'p-3 justify-center' : 'p-4 space-x-4'
        } ${
          isActive 
            ? `bg-gradient-to-r ${section.gradient} text-white shadow-xl scale-105 rounded-2xl` 
            : 'text-gray-700 dark:text-gray-300 hover:text-white rounded-xl hover:scale-105'
        }`}
      >
        {/* Background gradient on hover */}
        {!isActive && (
          <div className={`absolute inset-0 bg-gradient-to-r ${section.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl`}></div>
        )}
        
        {/* Glow effect */}
        {(isActive || isHovered) && (
          <div className={`absolute inset-0 bg-gradient-to-r ${section.gradient} blur opacity-20 rounded-2xl`}></div>
        )}
        
        <div className="relative z-10 flex items-center w-full">
          {/* Icon container */}
          <div className={`relative ${isCollapsed ? '' : 'mr-4'}`}>
            <IconComponent className={`transition-all duration-300 ${
              isActive ? 'w-6 h-6 animate-pulse' : 'w-6 h-6 group-hover:scale-110'
            }`} />
            
            {/* Badge */}
            {section.badge && (
              <div className={`absolute -top-2 -right-2 flex items-center justify-center transition-all duration-300 ${
                typeof section.badge === 'number' 
                  ? 'bg-red-500 text-white text-xs rounded-full h-5 w-5 animate-bounce' 
                  : 'bg-green-500 text-white text-xs rounded-full px-2 py-1'
              }`}>
                {section.badge}
              </div>
            )}
          </div>
          
          {/* Text content */}
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-lg truncate">{section.name}</span>
              </div>
              <p className={`text-sm transition-opacity duration-300 ${
                isActive ? 'text-white/80' : 'text-gray-500 dark:text-gray-400 group-hover:text-white/80'
              }`}>
                {section.description}
              </p>
            </div>
          )}
        </div>
        
        {/* Active indicator */}
        {isActive && (
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-l-full animate-pulse"></div>
        )}
        
        {/* Ripple effect */}
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <div className={`absolute inset-0 bg-white opacity-0 group-active:opacity-20 transition-opacity duration-150 ${
            isActive ? 'animate-ping' : ''
          }`}></div>
        </div>
      </button>
      
      {/* Tooltip for collapsed state */}
      {isCollapsed && isHovered && (
        <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg text-sm font-medium shadow-lg z-50 animate-slideIn">
          {section.name}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 dark:bg-gray-100 rotate-45"></div>
        </div>
      )}
    </div>
  );
};

const Logo = ({ isCollapsed, onClick }) => {
  return (
    <div 
      className={`flex items-center cursor-pointer group transition-all duration-500 ${
        isCollapsed ? 'justify-center mb-8' : 'space-x-3 mb-12'
      }`}
      onClick={onClick}
    >
      {/* Logo icon */}
      <div className="relative">
        <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
          <Home className="w-8 h-8 text-white animate-pulse" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
      </div>
      
      {/* Logo text */}
      {!isCollapsed && (
        <div className="overflow-hidden">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300">
            Ghar_Nishchit
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
            Tenant Portal
          </div>
        </div>
      )}
    </div>
  );
};

const CollapseToggle = ({ isCollapsed, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="absolute -right-3 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group z-10"
    >
      {isCollapsed ? (
        <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-blue-600" />
      ) : (
        <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-blue-600" />
      )}
    </button>
  );
};

const StatsCard = ({ icon: Icon, label, value, gradient, isCollapsed }) => {
  if (isCollapsed) return null;

  return (
    <div className={`bg-gradient-to-r ${gradient} rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <Icon className="w-8 h-8 text-white/60" />
      </div>
    </div>
  );
};

// Main Component
const TenantSideBar = ({ setCurrentSection }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useLocalStorage('sidebarCollapsed', false);
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Apply dark mode class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleNavigation = useCallback((path, sectionName) => {
    navigate(path);
    if (setCurrentSection) {
      setCurrentSection(sectionName);
    }
  }, [navigate, setCurrentSection]);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, [setIsCollapsed]);

  // Get current section
  const currentSection = sections.find(section => section.path === location.pathname);

  return (
    <>
      {/* Backdrop for mobile */}
      <div className={`fixed inset-0 bg-black/20 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${
        !isCollapsed ? 'opacity-100 z-40' : 'opacity-0 pointer-events-none'
      }`} onClick={toggleCollapse}></div>

      <aside className={`relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm h-full flex flex-col transition-all duration-500 ease-in-out border-r border-gray-200 dark:border-gray-700 shadow-2xl ${
        isCollapsed ? 'w-20' : 'w-80'
      }`}>
        {/* Gradient border */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"></div>
        
        {/* Collapse Toggle */}
        <CollapseToggle isCollapsed={isCollapsed} onToggle={toggleCollapse} />
        
        <div className={`flex flex-col h-full ${isCollapsed ? 'p-4' : 'p-6'}`}>
          {/* Logo */}
          <Logo 
            isCollapsed={isCollapsed} 
            onClick={() => handleNavigation('/tenant', 'Dashboard')} 
          />
          
          {/* Stats Cards */}
          {!isCollapsed && (
            <div className="grid grid-cols-1 gap-3 mb-8">
              <StatsCard
                icon={TrendingUp}
                label="Active Requests"
                value="4"
                gradient="from-green-500 to-emerald-600"
                isCollapsed={isCollapsed}
              />
              <StatsCard
                icon={Shield}
                label="Account Status"
                value="Verified"
                gradient="from-blue-500 to-indigo-600"
                isCollapsed={isCollapsed}
              />
            </div>
          )}
          
          {/* Navigation */}
          <nav className={`flex flex-col flex-1 ${isCollapsed ? 'space-y-2' : 'space-y-3'}`}>
            <div className={`${!isCollapsed ? 'mb-4' : ''}`}>
              {!isCollapsed && (
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Navigation
                </h3>
              )}
              
              {sections.map((section, index) => {
                const isActive = location.pathname === section.path;
                return (
                  <NavButton
                    key={section.name}
                    section={section}
                    isActive={isActive}
                    isCollapsed={isCollapsed}
                    onClick={() => handleNavigation(section.path, section.name)}
                    index={index}
                  />
                );
              })}
            </div>
          </nav>
          
          {/* Footer */}
          <div className={`border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 ${isCollapsed ? 'text-center' : ''}`}>
            {!isCollapsed ? (
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  © 2024 Ghar_Nishchit
                </p>
                <div className="flex items-center justify-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-300">System Online</span>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        </div>
        
        {/* Custom Styles */}
        <style>{`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(-10px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
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
          
          @keyframes ping {
            75%, 100% {
              transform: scale(2);
              opacity: 0;
            }
          }
          
          .animate-slideIn {
            animation: slideIn 0.3s ease-out;
          }
          
          .animate-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          
          .animate-bounce {
            animation: bounce 1s infinite;
          }
          
          .animate-ping {
            animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
          }
          
          /* Custom scrollbar */
          ::-webkit-scrollbar {
            width: 6px;
          }
          
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          
          ::-webkit-scrollbar-thumb {
            background: linear-gradient(45deg, #3b82f6, #8b5cf6);
            border-radius: 10px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(45deg, #2563eb, #7c3aed);
          }
          
          /* Dark mode scrollbar */
          .dark ::-webkit-scrollbar-track {
            background: transparent;
          }
          
          .dark ::-webkit-scrollbar-thumb {
            background: linear-gradient(45deg, #6366f1, #a855f7);
          }
        `}</style>
      </aside>
    </>
  );
};

export default TenantSideBar;
