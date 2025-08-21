import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Phone, Eye, EyeOff, Image as ImageIcon, AlertTriangle, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useDarkMode } from '../../../DarkModeContext';
import { useNavigate } from 'react-router-dom';
// Removed SidebarContext usage
 

export default function UpdateLandlordProfile() {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking'); // 'online', 'offline', 'checking'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '', // Password update is optional
    profilePicture: '',
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  // Check server status and provide retry functionality
  const checkServerStatus = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      // Get authentication token
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      
      // Use a simple endpoint that's likely to exist and respond quickly
      const response = await fetch('http://localhost:3000/api/auth/profile', {
        method: 'HEAD', // Just check if server responds, don't need data
        signal: controller.signal,
        // Add cache control to prevent caching of status check
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      clearTimeout(timeoutId);
      
      // Check if response is successful (including 401 which means server is running but requires auth)
      if (response.ok || response.status === 401) {
        setServerStatus('online');
        return true;
      } else {
        console.error('Server returned error status:', response.status);
        setServerStatus('offline');
        return false;
      }
    } catch (error) {
      console.error('Server status check failed:', error.message);
      // Explicitly log connection refused errors
      if (error.message && error.message.includes('Failed to fetch')) {
        console.log('Backend server appears to be offline (connection refused)');
      }
      setServerStatus('offline');
      return false;
    }
  };
  
  // Function to retry connecting to the server
  const retryConnection = async () => {
    setMessage('Attempting to reconnect to server...');
    const result = await checkServerStatus();
    if (result) {
      setMessage('Successfully reconnected to server! Your changes will be synced.');
      // Try to sync any pending changes
      syncOfflineChanges();
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage('Could not connect to server. Still in offline mode.');
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    }
  };
  
  // Function to sync offline changes when server becomes available
  const syncOfflineChanges = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Check if there are pending changes to sync
      if (user.pendingSync) {
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        if (!token) return;
        
        // Prepare data for API
        const updateData = {
          name: user.name,
          email: user.email,
          phone: user.phone,
          profilePicture: user.profilePicture || '',
        };
        
        // Send update request to API
        const response = await fetch('http://localhost:3000/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });
        
        if (response.ok) {
          // Remove the pendingSync flag
          const updatedUser = { ...user };
          delete updatedUser.pendingSync;
          delete updatedUser.lastUpdatedOffline;
          
          // Update localStorage
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          console.log('Successfully synced offline changes with server');
          setMessage('Your offline changes have been successfully synced with the server!');
          setTimeout(() => setMessage(''), 3000);
        }
      }
    } catch (error) {
      console.error('Failed to sync offline changes:', error);
    }
  };
  
  // Initial server status check and periodic checking
  useEffect(() => {
    checkServerStatus();
    
    // Set up interval to check server status every 30 seconds
    const intervalId = setInterval(checkServerStatus, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Track server status changes to sync offline changes when server comes back online
  useEffect(() => {
    // If server status changes from offline to online, try to sync offline changes
    if (serverStatus === 'online') {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.pendingSync) {
        syncOfflineChanges();
      }
    }
  }, [serverStatus]);

  // Load existing user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        if (!token) {
          // ProtectedRoute will handle redirect; avoid double navigation here
          return;
        }

        // Only try to fetch from API if server is online
        if (serverStatus === 'online') {
          // Fetch user data from API
          const response = await fetch('http://localhost:3000/api/auth/profile', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const userData = await response.json();
            setFormData({
              name: userData.name || '',
              email: userData.email || '',
              phone: userData.phone || '',
              password: '', // Never pre-fill password for security
              profilePicture: userData.profilePicture || '',
            });
            return;
          }
        }
        
        // Fallback to localStorage if API fails or server is offline
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
          setFormData({
            name: storedUser.name || '',
            email: storedUser.email || '',
            phone: storedUser.phone || '',
            password: '',
            profilePicture: storedUser.profilePicture || '',
          });
        } else {
          // No local user data; keep form empty and show message instead of redirecting
          setFormData(prev => ({ ...prev }));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        // Check if it's a connection refused error
        if (error.message && error.message.includes('fetch')) {
          setMessage('Cannot connect to the server. The backend server may not be running. Using local data instead.');
        }
        
        // Fallback to localStorage
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
          setFormData({
            name: storedUser.name || '',
            email: storedUser.email || '',
            phone: storedUser.phone || '',
            password: '',
            profilePicture: storedUser.profilePicture || '',
          });
        } else {
          // Avoid redirect here; let route guard manage auth
        }
      }
    };

    loadUserData();
  }, [navigate]);

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const validatePassword = (password) => {
    if (!password) return true; // Password is optional
    return password.length >= 6;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.password && !validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profilePicture: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setErrors({});

    if (!validateForm()) {
      setMessage('Please fix the errors above.');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (!token) {
        // ProtectedRoute handles redirect; avoid navigating here
        return;
      }

      // Prepare data for API (include all fields except empty password)
      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        profilePicture: formData.profilePicture || '', // Always include profile picture
      };

      // Only include password if provided (for security reasons)
      if (formData.password) {
        updateData.password = formData.password;
      }

      // Only attempt to send to server if it's online
      if (serverStatus === 'online') {
        // Send update request to API
        const response = await fetch('http://localhost:3000/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });

        if (response.ok) {
        const responseData = await response.json();
        const updatedUser = responseData.user || responseData;
        
        // Replace all old information with new data
        const mergedUser = {
          ...JSON.parse(localStorage.getItem('user') || '{}'),
          ...updatedUser
        };
        
        // Update localStorage with the new user data
        localStorage.setItem('user', JSON.stringify(mergedUser));
        
        // Dispatch event to update UI components that use user data
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('user:updated', { detail: mergedUser }));
        }

        // Update the form data with the new values (except password)
        setFormData({
          name: mergedUser.name || '',
          email: mergedUser.email || '',
          phone: mergedUser.phone || '',
          password: '', // Clear password field for security
          profilePicture: mergedUser.profilePicture || formData.profilePicture,
        });

        setMessage(responseData.message || 'Profile updated successfully! All changes have been applied.');
        
        // Show success message for 3 seconds
        setTimeout(() => {
          setMessage('');
        }, 3000);
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || errorData.message || 'Failed to update profile. Please try again.');
        
        // Log detailed error for debugging
        console.error('Profile update failed with status:', response.status, errorData);
        }
      } else {
        // Server is offline, update local storage directly
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = {
          ...currentUser,
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          profilePicture: formData.profilePicture || currentUser.profilePicture || '',
          lastUpdatedOffline: new Date().toISOString(), // Add timestamp for offline updates
          pendingSync: true, // Flag to indicate this needs to be synced when server is available
        };
        
        // Update localStorage with the new user data
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Dispatch event to update UI components that use user data
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('user:updated', { detail: updatedUser }));
        }
        
        // Update the form data with the new values (except password)
        setFormData({
          name: updatedUser.name || '',
          email: updatedUser.email || '',
          phone: updatedUser.phone || '',
          password: '', // Clear password field for security
          profilePicture: updatedUser.profilePicture || formData.profilePicture,
        });
        
        setMessage('Server is offline. Your changes have been saved locally and will sync when the server is available.');
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      
      // Provide more specific error message based on error type
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        // Update server status to offline since we can't connect
        setServerStatus('offline');
        
        setMessage('Connection Error: Cannot connect to the server (ERR_CONNECTION_REFUSED). The backend server may not be running at http://localhost:3000. Your changes have been saved locally.');
        
        // Since we can't reach the server, update local storage directly
        try {
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          const updatedUser = {
            ...currentUser,
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            profilePicture: formData.profilePicture || currentUser.profilePicture || '',
            lastUpdatedOffline: new Date().toISOString(), // Add timestamp for offline updates
          };
          
          // Update localStorage with the new user data
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          // Dispatch event to update UI components that use user data
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('user:updated', { detail: updatedUser }));
          }
          
          setMessage('Server is offline. Your changes have been saved locally and will sync when the server is available.');
        } catch (localStorageError) {
          console.error('Failed to update local storage:', localStorageError);
          setMessage('Failed to save changes locally. Please try again.');
        }
      } else {
        setMessage('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      setMessage('');
      try {
        // Simulate API call for account deletion
        await new Promise(resolve => setTimeout(resolve, 1000));
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        alert('Account deleted successfully.');
        navigate('/signup'); // Redirect to signup or home page after deletion
      } catch (error) {
        console.error('Account deletion failed:', error);
        setMessage('Failed to delete account.');
      }
    }
  };

  const themeClasses = {
    bg: darkMode ? 'bg-gradient-to-br from-blue-950 via-slate-900 to-cyan-900' : 'bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100',
    cardBg: darkMode ? 'bg-gradient-to-br from-slate-900 via-blue-950 to-cyan-900 bg-opacity-95' : 'bg-white',
    textPrimary: darkMode ? 'text-cyan-100' : 'text-gray-700',
    textSecondary: darkMode ? 'text-cyan-200' : 'text-gray-500',
    textAccent: darkMode ? 'text-cyan-300' : 'text-indigo-700',
    inputBg: darkMode ? 'bg-slate-900' : 'bg-white',
    inputBorder: darkMode ? 'border-cyan-700' : 'border-gray-300',
    inputText: darkMode ? 'text-cyan-100' : 'text-gray-900',
    inputPlaceholder: darkMode ? 'placeholder-cyan-300' : 'placeholder-gray-500',
    inputFocusRing: darkMode ? 'focus:ring-cyan-400' : 'focus:ring-indigo-400',
    buttonPrimaryBg: darkMode ? 'bg-gradient-to-r from-cyan-500 via-blue-700 to-slate-900' : 'bg-indigo-600',
    buttonPrimaryText: 'text-white',
    buttonPrimaryHover: darkMode ? 'hover:from-blue-900 hover:via-cyan-700 hover:to-slate-800' : 'hover:bg-indigo-700',
    buttonDangerBg: 'bg-red-600',
    buttonDangerHover: 'hover:bg-red-700',
    buttonDangerText: 'text-white',
    toggleButtonBg: darkMode ? 'bg-cyan-400' : 'bg-white',
    toggleButtonText: darkMode ? 'text-blue-950' : 'text-indigo-600',
    toggleButtonHover: darkMode ? 'hover:bg-cyan-300' : 'hover:bg-indigo-100',
  };

  return (
    <div className={`min-h-screen flex relative overflow-hidden ${themeClasses.bg}`}>
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl ${darkMode ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10' : 'bg-gradient-to-r from-indigo-500/20 to-cyan-500/20'}`} />
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl ${darkMode ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10' : 'bg-gradient-to-r from-pink-500/20 to-purple-500/20'}`} />
      </div>
      
      {/* Server status indicator */}
      <div className={`absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full shadow-lg z-10 ${serverStatus === 'online' ? 'bg-green-100 dark:bg-green-900' : serverStatus === 'offline' ? 'bg-red-100 dark:bg-red-900' : 'bg-yellow-100 dark:bg-yellow-900'}`}>
        <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${serverStatus === 'online' ? 'bg-green-500' : serverStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
        <span className={`text-xs font-semibold ${serverStatus === 'online' ? 'text-green-800 dark:text-green-200' : serverStatus === 'offline' ? 'text-red-800 dark:text-red-200' : 'text-yellow-800 dark:text-yellow-200'}`}>
          {serverStatus === 'online' ? 'Server Online' : serverStatus === 'offline' ? 'Server Offline - Using Local Data' : 'Checking Server Status...'}
        </span>
        {serverStatus === 'offline' && (
          <button 
            onClick={retryConnection}
            className="ml-2 text-xs bg-blue-500 hover:bg-blue-600 text-white px-2.5 py-0.5 rounded-full transition-colors shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
            title="Try to reconnect to the server"
            aria-label="Retry connection to server"
          >
            Retry
          </button>
        )}
      </div>

      <main className="flex-1 overflow-y-auto flex items-center justify-center px-2 sm:px-4 relative z-10 w-full">
          {/* Server status notification */}
          {serverStatus === 'offline' && (
            <div className="absolute top-4 left-0 right-0 mx-auto w-full max-w-md bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-3 rounded shadow-md">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium">Connection Error: Backend server is not running</p>
                  <p className="text-sm">Unable to connect to http://localhost:3000 (ERR_CONNECTION_REFUSED). Your changes will be saved locally and will sync when the server is available again.</p>
                  <p className="text-xs mt-1 text-amber-800">Please ensure the backend server is running at the correct port.</p>
                </div>
              </div>
            </div>
          )}
        <div className={`relative flex flex-col rounded-2xl shadow-2xl overflow-hidden max-w-lg sm:max-w-xl w-full transition-colors duration-300 ${themeClasses.cardBg}`}>
          <div className="w-full p-6 sm:p-8 relative">
          <button
            onClick={toggleDarkMode}
            className={`absolute top-4 right-4 z-10 px-4 py-2 rounded-full font-semibold shadow transition-colors duration-300 ${themeClasses.toggleButtonBg} ${themeClasses.toggleButtonText} ${themeClasses.toggleButtonHover}`}
            aria-label="Toggle dark mode"
          >
            {darkMode ? '🌙' : '☀️'}
          </button>
          <h2 className={`text-xl sm:text-2xl font-bold mb-2 ${themeClasses.textAccent}`}>
            Update Your Profile
          </h2>
          <p className={`mb-6 ${themeClasses.textSecondary}`}>
            Manage your personal information.
          </p>
          <div className="mb-6 flex justify-start">
            <button
              onClick={() => navigate(-1)}
              className={`px-4 py-2 rounded-full font-semibold transition-colors duration-300 ${themeClasses.toggleButtonBg} ${themeClasses.toggleButtonText} ${themeClasses.toggleButtonHover}`}
              aria-label="Go back"
            >
              ← Back
            </button>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm text-center font-medium flex items-center justify-center gap-2 ${
              message.includes('successfully') 
                ? 'text-green-700 bg-green-100 border border-green-300' 
                : 'text-red-700 bg-red-100 border border-red-300'
            }`}>
              {message.includes('successfully') ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              {message}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className={`flex items-center gap-1 font-semibold mb-1 ${themeClasses.textPrimary}`}>
                <User size={18} /> Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 shadow-sm transition-shadow duration-300 hover:shadow-lg text-sm sm:text-base ${
                  errors.name 
                    ? 'border-red-500 focus:ring-red-400' 
                    : `${themeClasses.inputBg} ${themeClasses.inputBorder} ${themeClasses.inputFocusRing}`
                } ${themeClasses.inputText} ${themeClasses.inputPlaceholder}`}
                placeholder="Your full name"
                required
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className={`flex items-center gap-1 font-semibold mb-1 ${themeClasses.textPrimary}`}>
                <Mail size={18} /> Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 shadow-sm transition-shadow duration-300 hover:shadow-lg text-sm sm:text-base ${
                  errors.email 
                    ? 'border-red-500 focus:ring-red-400' 
                    : `${themeClasses.inputBg} ${themeClasses.inputBorder} ${themeClasses.inputFocusRing}`
                } ${themeClasses.inputText} ${themeClasses.inputPlaceholder}`}
                placeholder="you@example.com"
                required
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className={`flex items-center gap-1 font-semibold mb-1 ${themeClasses.textPrimary}`}>
                <Phone size={18} /> Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 shadow-sm transition-shadow duration-300 hover:shadow-lg text-sm sm:text-base ${
                  errors.phone 
                    ? 'border-red-500 focus:ring-red-400' 
                    : `${themeClasses.inputBg} ${themeClasses.inputBorder} ${themeClasses.inputFocusRing}`
                } ${themeClasses.inputText} ${themeClasses.inputPlaceholder}`}
                placeholder="Your phone number"
                required
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {errors.phone}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className={`flex items-center gap-1 font-semibold mb-1 ${themeClasses.textPrimary}`}>
                <Lock size={18} /> New Password (optional)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 shadow-sm transition-shadow duration-300 hover:shadow-lg text-sm sm:text-base ${
                    errors.password 
                      ? 'border-red-500 focus:ring-red-400' 
                      : `${themeClasses.inputBg} ${themeClasses.inputBorder} ${themeClasses.inputFocusRing}`
                  } ${themeClasses.inputText} ${themeClasses.inputPlaceholder}`}
                  placeholder="Leave blank to keep current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400 hover:text-cyan-300' : 'text-gray-400 hover:text-gray-700'}`}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="profilePicture" className={`flex items-center gap-1 font-semibold mb-1 ${themeClasses.textPrimary}`}>
                <ImageIcon size={18} /> Profile Picture
              </label>
              <input
                type="file"
                id="profilePicture"
                name="profilePicture"
                accept="image/*"
                onChange={handleFileChange}
                className={`w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 shadow-sm transition-shadow duration-300 hover:shadow-lg text-sm sm:text-base ${themeClasses.inputBg} ${themeClasses.inputBorder} ${themeClasses.inputText} ${themeClasses.inputFocusRing}`}
              />
              {formData.profilePicture && (
                <div className="mt-2">
                  <img src={formData.profilePicture} alt="Profile Preview" className="w-24 h-24 rounded-full object-cover mx-auto" />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 sm:py-4 rounded-lg font-bold text-center transition-all duration-300 hover:shadow-xl hover:scale-105 text-sm sm:text-base transform active:scale-95 ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : `${themeClasses.buttonPrimaryBg} ${themeClasses.buttonPrimaryText} ${themeClasses.buttonPrimaryHover}`
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating Profile...</span>
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Save Changes
                </span>
              )}
            </button>
          </form>

          {/* DANGER ZONE */}
          <div className={`mt-8 p-6 border-2 rounded-lg ${darkMode ? 'border-red-700 bg-red-950 bg-opacity-20' : 'border-red-300 bg-red-50'}`}>
            <h3 className="flex items-center gap-2 text-lg sm:text-xl font-bold text-red-600 mb-4">
              <AlertTriangle size={24} /> DANGER ZONE
            </h3>
            <p className={`mb-4 ${darkMode ? 'text-red-200' : 'text-red-700'}`}>
              Deleting your account is a permanent action. All your data will be lost.
            </p>
            <button
              onClick={handleDeleteAccount}
              className={`w-full py-2 sm:py-3 rounded-lg font-semibold transition-colors duration-300 hover:shadow-xl hover:scale-105 text-sm sm:text-base ${themeClasses.buttonDangerBg} ${themeClasses.buttonDangerText} ${themeClasses.buttonDangerHover}`}
            >
              <Trash2 size={18} className="inline mr-2" /> Delete Account
            </button>
          </div>
          </div>
        </div>
      </main>
    </div>
  );
}
