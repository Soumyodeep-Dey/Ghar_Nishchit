import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import p1 from './assets/p1.jpg';
import { useDarkMode } from '../DarkModeContext';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const { darkMode, toggleDarkMode } = useDarkMode();

  // Welcome overlay animation state
  const [welcomeOut, setWelcomeOut] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setWelcomeOut(true), 900);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-2 sm:px-4 ${
        darkMode
          ? 'bg-gray-950'
          : 'bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100'
      }`}
    >
      <div
        className={`relative flex flex-col md:flex-row rounded-2xl shadow-2xl overflow-hidden max-w-lg sm:max-w-xl md:max-w-3xl w-full transition-colors duration-300
        ${darkMode ? 'bg-gray-900' : 'bg-white'}
        `}
      >
        {/* Overlay: Always shown, covering whole UI at first */}
        <div
          className={`
            absolute inset-0 z-30 flex flex-col justify-center items-center
            bg-gradient-to-br from-indigo-600 to-pink-500 text-white
            transition-all duration-700 ease-in-out
            ${welcomeOut ? '-translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'}
            rounded-2xl
          `}
          style={{
            boxShadow: welcomeOut ? 'none' : '0 10px 40px rgba(0,0,0,0.2)',
          }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4">Welcome Back!</h2>
          <p className="mb-2 text-sm sm:mb-4 sm:text-base">Trusted by 10,000+ users</p>
          <img src={p1} alt="Login" className="rounded-xl shadow-lg w-40 h-28 sm:w-48 sm:h-32 object-cover mt-2 sm:mt-4" />
        </div>
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className={`absolute top-3 right-3 sm:top-6 sm:right-6 z-40 px-3 py-2 sm:px-4 sm:py-2 rounded-full font-semibold shadow transition-colors duration-300 ${
            darkMode
              ? 'bg-gray-800 text-indigo-300 hover:bg-gray-700'
              : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
          }`}
          aria-label="Toggle dark mode"
        >
          {darkMode ? '🌙' : '☀️'}
        </button>

        {/* WELCOME/TRUST BANNER (always visible, position varies) */}
        {/* MOBILE: On top. DESKTOP: On left */}
        <div
          className={`flex md:flex-col items-center justify-center w-full md:w-1/2
           px-6 py-7 sm:p-10 gap-3 sm:gap-4
           bg-gradient-to-br from-indigo-600 to-pink-500 text-white
           ${darkMode ? '' : ''}
           md:rounded-none md:rounded-l-2xl
           ${/* Show for mobile (block), hide for md+ since welcome info is in left */''}
           md:flex
           ${/* On mobile, only show above login form when overlay gone */''}
           ${welcomeOut ? 'flex md:flex' : 'hidden md:flex'}
           md:relative md:z-0 md:translate-x-0 md:opacity-100
           md:shadow-none
           rounded-t-2xl md:rounded-2xl
          `}
        >
          {/* Only show in mobile mode when overlay gone */}
          <div className="flex flex-col items-center w-full">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Welcome Back!</h2>
            <p className="mb-2 text-xs sm:text-base">Trusted by 10,000+ users</p>
            <img src={p1} alt="Login" className="rounded-xl shadow-lg w-32 h-20 sm:w-48 sm:h-32 object-cover mt-2" />
          </div>
        </div>

        {/* LOGIN FORM */}
        <div
          className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-center"
        >
          {/* Mobile only: add top gap below trust */}
          <div className="block md:hidden h-4" />
          <h2
            className={`text-xl sm:text-2xl font-bold mb-2 ${
              darkMode ? 'text-gray-200' : 'text-indigo-700'
            }`}
          >
            Login to Your Account
          </h2>
          <p
            className={`mb-4 sm:mb-6 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            Access your dashboard and manage your rentals.
          </p>
          {/* Social Login */}
          <button className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded mb-3 sm:mb-4 hover:bg-red-600 hover:shadow-lg transition-transform duration-300 hover:scale-105">
            {/* <GoogleIcon /> */} Login with Google
          </button>
          <div className="flex items-center my-2 sm:my-4">
            <hr
              className={`flex-grow ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
            />
            <span className={`mx-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>or</span>
            <hr
              className={`flex-grow ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
            />
          </div>
          <form className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className={`flex items-center gap-1 font-semibold mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                <Mail size={18} /> Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                className={`w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm transition-shadow duration-300 hover:shadow-lg ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className={`flex items-center gap-1 font-semibold mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                <Lock size={18} /> Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  className={`w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm transition-shadow duration-300 hover:shadow-lg ${
                    darkMode
                      ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="********"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${
                    darkMode
                      ? 'text-gray-400 hover:text-gray-200'
                      : 'text-gray-400 hover:text-gray-700'
                  }`}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label
                className={`flex items-center gap-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                <input type="checkbox" className="form-checkbox text-indigo-600" />
                <span className="text-xs sm:text-sm">Remember Me</span>
              </label>
              <a
                href="/forgot-password"
                className={`text-xs sm:text-sm ${
                  darkMode
                    ? 'text-indigo-400 hover:text-indigo-300'
                    : 'text-indigo-600 hover:underline'
                }`}
              >
                Forgot Password?
              </a>
            </div>
            <button className="w-full bg-indigo-600 text-white py-2 sm:py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors duration-300 hover:shadow-xl hover:scale-105 text-sm sm:text-base">
              Login
            </button>
          </form>
          <p
            className={`mt-3 text-xs sm:text-sm text-center ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            Don’t have an account?{' '}
            <Link
              to="/signup"
              className={`${
                darkMode
                  ? 'text-indigo-400 hover:text-indigo-300'
                  : 'text-indigo-600 hover:underline'
              }`}
            >
              Sign Up
            </Link>
          </p>
          <p
            className={`mt-2 text-xs text-center ${
              darkMode ? 'text-gray-500' : 'text-gray-400'
            }`}
          >
            We respect your privacy. No spam ever.
          </p>
        </div>
      </div>
    </div>
  );
}
