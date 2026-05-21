import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Phone, Eye, EyeOff, Image as ImageIcon, AlertTriangle, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useDarkMode } from '../../../useDarkMode.js';
import { useNavigate } from 'react-router-dom';
import { showConfirmToast, showSuccessToast } from '../../../utils/toast.jsx';
import TenantSideBar from './TenantSideBar';
import TenantNavBar from './TenantNavBar';

export default function UpdateTenantProfile() {
    const navigate = useNavigate();
    const { darkMode } = useDarkMode();
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
                }
            }
        };

        loadUserData();
    }, [navigate, serverStatus]);

    // Validation functions
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone) => {
        const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-()]/g, ''));
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
        showConfirmToast(
            'Are you sure you want to delete your account? This action cannot be undone.',
            async () => {
                setMessage('');
                try {
                    // Simulate API call for account deletion
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    showSuccessToast('Account deleted successfully.');
                    navigate('/signup'); // Redirect to signup or home page after deletion
                } catch (error) {
                    console.error('Account deletion failed:', error);
                    setMessage('Failed to delete account.');
                }
            }
        );
    };

    const tc = darkMode
        ? {
            mainBg: 'from-gray-900 via-slate-800 to-blue-950',
            loadingBg: 'from-gray-900 via-slate-800 to-blue-950',
            cardBg: 'bg-slate-800/50',
            cardBorder: 'border-slate-700/50',
            textPrimary: 'text-slate-100',
            textSecondary: 'text-slate-350',
            headerGradient: 'from-cyan-300 via-purple-300 to-pink-300',
            buttonPrimary: 'from-cyan-500 to-indigo-600',
            buttonPrimaryHover: 'from-cyan-600 to-indigo-700',
            inputBg: 'bg-slate-900/50',
            inputBorder: 'border-slate-700/60',
            inputText: 'text-slate-100',
            inputPlaceholder: 'placeholder-slate-500',
            inputFocusRing: 'focus:ring-cyan-500/20 focus:border-cyan-500',
            dangerBg: 'bg-red-500/10 border-red-500/20 text-red-200',
            dangerBtn: 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700',
          }
        : {
            mainBg: 'from-pink-300 via-purple-300 to-indigo-400',
            loadingBg: 'from-pink-300 via-purple-300 to-indigo-400',
            cardBg: 'bg-white/60',
            cardBorder: 'border-indigo-200/50',
            textPrimary: 'text-gray-900',
            textSecondary: 'text-indigo-650',
            headerGradient: 'from-indigo-700 via-purple-700 to-pink-700',
            buttonPrimary: 'from-indigo-600 to-purple-650',
            buttonPrimaryHover: 'from-indigo-700 to-purple-700',
            inputBg: 'bg-white/80',
            inputBorder: 'border-indigo-150',
            inputText: 'text-gray-950',
            inputPlaceholder: 'placeholder-gray-400',
            inputFocusRing: 'focus:ring-indigo-500/20 focus:border-indigo-650',
            dangerBg: 'bg-red-50 border-red-200 text-red-700',
            dangerBtn: 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600',
          };

    return (
        <div className={`min-h-screen flex relative overflow-hidden bg-gradient-to-br ${tc.mainBg}`}>
            <TenantSideBar />
            
            <div className="flex-1 flex flex-col relative z-10 transition-all duration-700" style={{ marginLeft: 'var(--sidebar-width, 4.5rem)' }}>
                <TenantNavBar currentSection="Profile" />
                
                {/* Server status indicator */}
                <div className={`absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full shadow-lg z-20 ${serverStatus === 'online' ? 'bg-green-500/20 border border-green-500/30' : serverStatus === 'offline' ? 'bg-red-500/20 border border-red-500/30' : 'bg-yellow-500/20 border border-yellow-500/30'}`}>
                    <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${serverStatus === 'online' ? 'bg-green-400' : serverStatus === 'offline' ? 'bg-red-400' : 'bg-yellow-400'}`}></div>
                    <span className={`text-xs font-semibold ${serverStatus === 'online' ? 'text-green-300' : serverStatus === 'offline' ? 'text-red-300' : 'text-yellow-300'}`}>
                        {serverStatus === 'online' ? 'Server Online' : serverStatus === 'offline' ? 'Offline Mode' : 'Checking connection...'}
                    </span>
                    {serverStatus === 'offline' && (
                        <button
                            onClick={retryConnection}
                            className="ml-2 text-xs bg-cyan-500 hover:bg-cyan-600 text-slate-950 px-2.5 py-0.5 rounded-full transition-all shadow-sm font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            title="Try to reconnect to the server"
                        >
                            Retry
                        </button>
                    )}
                </div>

                <main className="flex-1 overflow-y-auto custom-scrollbar p-6 animate-fadeIn">
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* Server status notification */}
                        {serverStatus === 'offline' && (
                            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 p-4 rounded-2xl flex items-start gap-3 shadow-lg">
                                <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0 text-amber-400" />
                                <div>
                                    <p className="font-semibold text-amber-200">Server Offline</p>
                                    <p className="text-sm mt-0.5">
                                        Unable to connect to http://localhost:3000. Your changes will be saved locally and synced when the server is available.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Profile edit card */}
                        <div className={`${tc.cardBg} backdrop-blur-xl border ${tc.cardBorder} rounded-3xl overflow-hidden shadow-2xl transition-all duration-300`}>
                            <div className="p-6 sm:p-8 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h1 className={`text-3xl font-extrabold bg-gradient-to-r ${tc.headerGradient} bg-clip-text text-transparent`}>
                                            Update Profile
                                        </h1>
                                        <p className={`text-sm ${tc.textSecondary} mt-1`}>
                                            Manage your personal credentials and options.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => navigate(-1)}
                                        className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                                            darkMode 
                                                ? 'border-slate-700 text-slate-300 hover:bg-slate-700/50' 
                                                : 'border-indigo-100 text-indigo-650 hover:bg-indigo-50'
                                        }`}
                                    >
                                        ← Back
                                    </button>
                                </div>

                                {message && (
                                    <div className={`p-4 rounded-xl text-sm font-semibold border flex items-center gap-3 animate-fadeIn ${
                                        message.includes('successfully')
                                            ? darkMode ? 'bg-green-500/10 border-green-500/20 text-green-300' : 'bg-green-50 border-green-200 text-green-800'
                                            : darkMode ? 'bg-red-500/10 border-red-500/20 text-red-300' : 'bg-red-50 border-red-200 text-red-800'
                                    }`}>
                                        {message.includes('successfully') ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <XCircle className="w-5 h-5 flex-shrink-0" />}
                                        <p>{message}</p>
                                    </div>
                                )}

                                <form className="space-y-5" onSubmit={handleSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {/* Name */}
                                        <div>
                                            <label htmlFor="name" className={`flex items-center gap-1.5 font-semibold text-sm mb-2 ${tc.textPrimary}`}>
                                                <User size={16} /> Name
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                autoComplete="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-4 transition-all ${
                                                    errors.name
                                                        ? 'border-red-500 focus:ring-red-500/25'
                                                        : `${tc.inputBg} ${tc.inputBorder} ${tc.inputFocusRing}`
                                                } ${tc.inputText} ${tc.inputPlaceholder}`}
                                                placeholder="Your full name"
                                                required
                                            />
                                            {errors.name && (
                                                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                                    <XCircle className="w-3.5 h-3.5" />
                                                    {errors.name}
                                                </p>
                                            )}
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label htmlFor="email" className={`flex items-center gap-1.5 font-semibold text-sm mb-2 ${tc.textPrimary}`}>
                                                <Mail size={16} /> Email
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                autoComplete="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-4 transition-all ${
                                                    errors.email
                                                        ? 'border-red-500 focus:ring-red-500/25'
                                                        : `${tc.inputBg} ${tc.inputBorder} ${tc.inputFocusRing}`
                                                } ${tc.inputText} ${tc.inputPlaceholder}`}
                                                placeholder="you@example.com"
                                                required
                                            />
                                            {errors.email && (
                                                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                                    <XCircle className="w-3.5 h-3.5" />
                                                    {errors.email}
                                                </p>
                                            )}
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label htmlFor="phone" className={`flex items-center gap-1.5 font-semibold text-sm mb-2 ${tc.textPrimary}`}>
                                                <Phone size={16} /> Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                id="phone"
                                                name="phone"
                                                autoComplete="tel"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-4 transition-all ${
                                                    errors.phone
                                                        ? 'border-red-500 focus:ring-red-500/25'
                                                        : `${tc.inputBg} ${tc.inputBorder} ${tc.inputFocusRing}`
                                                } ${tc.inputText} ${tc.inputPlaceholder}`}
                                                placeholder="Your phone number"
                                                required
                                            />
                                            {errors.phone && (
                                                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                                    <XCircle className="w-3.5 h-3.5" />
                                                    {errors.phone}
                                                </p>
                                            )}
                                        </div>

                                        {/* Password */}
                                        <div>
                                            <label htmlFor="password" className={`flex items-center gap-1.5 font-semibold text-sm mb-2 ${tc.textPrimary}`}>
                                                <Lock size={16} /> New Password (optional)
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    id="password"
                                                    name="password"
                                                    autoComplete="new-password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-4 transition-all ${
                                                        errors.password
                                                            ? 'border-red-500 focus:ring-red-500/25'
                                                            : `${tc.inputBg} ${tc.inputBorder} ${tc.inputFocusRing}`
                                                    } ${tc.inputText} ${tc.inputPlaceholder}`}
                                                    placeholder="Leave blank to keep current"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword((prev) => !prev)}
                                                    className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors"
                                                    tabIndex={-1}
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                            {errors.password && (
                                                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                                    <XCircle className="w-3.5 h-3.5" />
                                                    {errors.password}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Profile pic uploader */}
                                    <div className={`p-5 rounded-2xl border ${tc.inputBorder} ${tc.inputBg} flex flex-col sm:flex-row items-center gap-6`}>
                                        <div className="relative group w-24 h-24 rounded-full overflow-hidden border border-slate-700/30 shadow-lg flex-shrink-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                                            {formData.profilePicture ? (
                                                <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className={`w-10 h-10 ${darkMode ? 'text-slate-500' : 'text-indigo-400'}`} />
                                            )}
                                        </div>
                                        <div className="flex-1 text-center sm:text-left space-y-2">
                                            <p className={`font-semibold text-sm ${tc.textPrimary}`}>Upload a Profile Image</p>
                                            <p className={`text-xs ${tc.textSecondary}`}>Supported formats: JPG, PNG. Max 5MB.</p>
                                            <input
                                                type="file"
                                                id="profilePicture"
                                                name="profilePicture"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className={`w-full max-w-xs text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-slate-700 dark:file:text-cyan-300 hover:file:opacity-80 cursor-pointer ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}
                                            />
                                        </div>
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r ${tc.buttonPrimary} hover:opacity-90 shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <RefreshCw className="w-5 h-5 animate-spin" />
                                                <span>Updating Profile…</span>
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-5 h-5" />
                                                <span>Save Profile Changes</span>
                                            </>
                                        )}
                                    </button>
                                </form>

                                {/* Danger Zone */}
                                <div className={`p-6 border rounded-2xl mt-8 shadow-md ${tc.dangerBg}`}>
                                    <h3 className="flex items-center gap-2 text-lg font-bold text-red-500 mb-3">
                                        <AlertTriangle size={20} className="text-red-500 animate-pulse" />
                                        DANGER ZONE
                                    </h3>
                                    <p className="text-sm mb-4">
                                        Deleting your account is permanent. All lease documents, billing items, and message histories will be deleted forever.
                                    </p>
                                    <button
                                        onClick={handleDeleteAccount}
                                        className={`py-3 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-red-650 to-pink-600 hover:from-red-700 hover:to-pink-700 shadow-md transition-all hover:scale-105 flex items-center justify-center gap-2`}
                                    >
                                        <Trash2 size={16} />
                                        <span>Delete My Account</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}; }
                @keyframes fadeIn { from { opacity:0; transform:scale(0.98); } to { opacity:1; transform:scale(1); } }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
            `}</style>
        </div>
    );
}
