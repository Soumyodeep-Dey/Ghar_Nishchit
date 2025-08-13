import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Phone, Eye, EyeOff, Image as ImageIcon, AlertTriangle, Trash2 } from 'lucide-react';
import { useDarkMode } from '../../../DarkModeContext';
import { useNavigate } from 'react-router-dom';

export default function UpdateLandlordProfile() {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '', // Password update is optional
    profilePicture: '',
  });
  const [message, setMessage] = useState('');

  // Simulate loading existing user data
  useEffect(() => {
    // In a real application, you would fetch this from your API
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setFormData({
        name: storedUser.name || '',
        email: storedUser.email || '',
        phone: storedUser.phone || '',
        password: '', // Never pre-fill password for security
        profilePicture: storedUser.profilePicture || '',
      });
    } else {
      // Redirect to login if no user data is found
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

    // In a real application, you would send this data to your API
    console.log('Updating profile with:', formData);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.setItem('user', JSON.stringify(formData)); // Update local storage
      setMessage('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update failed:', error);
      setMessage('Failed to update profile.');
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
    <div className={`min-h-screen flex items-center justify-center px-2 sm:px-4 transition-colors duration-500 ${themeClasses.bg}`}>
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
          <p className={`mb-4 sm:mb-6 ${themeClasses.textSecondary}`}>
            Manage your personal information.
          </p>

          {message && (
            <div className={`mb-4 text-sm text-center font-medium ${message.includes('successfully') ? 'text-green-500' : 'text-red-500'}`}>
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
                className={`w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 shadow-sm transition-shadow duration-300 hover:shadow-lg text-sm sm:text-base ${themeClasses.inputBg} ${themeClasses.inputBorder} ${themeClasses.inputText} ${themeClasses.inputPlaceholder} ${themeClasses.inputFocusRing}`}
                placeholder="Your full name"
                required
              />
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
                className={`w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 shadow-sm transition-shadow duration-300 hover:shadow-lg text-sm sm:text-base ${themeClasses.inputBg} ${themeClasses.inputBorder} ${themeClasses.inputText} ${themeClasses.inputPlaceholder} ${themeClasses.inputFocusRing}`}
                placeholder="you@example.com"
                required
              />
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
                className={`w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 shadow-sm transition-shadow duration-300 hover:shadow-lg text-sm sm:text-base ${themeClasses.inputBg} ${themeClasses.inputBorder} ${themeClasses.inputText} ${themeClasses.inputPlaceholder} ${themeClasses.inputFocusRing}`}
                placeholder="Your phone number"
                required
              />
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
                  className={`w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 shadow-sm transition-shadow duration-300 hover:shadow-lg text-sm sm:text-base ${themeClasses.inputBg} ${themeClasses.inputBorder} ${themeClasses.inputText} ${themeClasses.inputPlaceholder} ${themeClasses.inputFocusRing}`}
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
              className={`w-full py-2 sm:py-3 rounded-lg font-semibold transition-colors duration-300 hover:shadow-xl hover:scale-105 text-sm sm:text-base ${themeClasses.buttonPrimaryBg} ${themeClasses.buttonPrimaryText} ${themeClasses.buttonPrimaryHover}`}
            >
              Save Changes
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
    </div>
  );
}
