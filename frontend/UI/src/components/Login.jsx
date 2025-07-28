import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useDarkMode } from '../DarkModeContext';

export default function Login() {
  // const [darkMode, setDarkMode] = useState(false);
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
      darkMode
        ? 'bg-gradient-to-br from-blue-950 via-slate-900 to-cyan-900'
        : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
    }`}>
      <button
        onClick={toggleDarkMode}
        className={`absolute top-6 right-6 p-2 rounded-full shadow-lg transition ${
          darkMode
            ? 'bg-cyan-400 text-blue-950 hover:bg-cyan-300'
            : 'bg-white text-indigo-600 hover:bg-indigo-100'
        }`}
        aria-label="Toggle dark mode"
      >
        {darkMode ? '🌙' : '☀️'}
      </button>
      <div className={`max-w-md w-full p-8 rounded-xl shadow-2xl transform transition-transform hover:scale-105 duration-300 ${
        darkMode
          ? 'bg-gradient-to-r from-slate-900 via-blue-950 to-cyan-900 bg-opacity-95'
          : 'bg-white bg-opacity-90'
      }`}>
        <h2 className={`text-3xl font-extrabold mb-8 flex items-center space-x-3 ${
          darkMode ? 'text-cyan-300' : 'text-gray-900 dark:text-gray-100'
        }`}>
          <Lock size={28} />
          <span>Login to your account</span>
        </h2>
        <form className="space-y-6" noValidate>
          <div>
            <label htmlFor="email" className={`flex items-center space-x-2 font-semibold ${
              darkMode ? 'text-cyan-200' : 'text-gray-700 dark:text-gray-300'
            }`}>
              <Mail size={18} />
              <span>Email</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-shadow duration-300 shadow-sm hover:shadow-md ${
                darkMode
                  ? 'border-cyan-700 focus:ring-4 focus:ring-cyan-400 bg-slate-900 text-cyan-100 placeholder-cyan-300'
                  : 'border-gray-300 focus:ring-4 focus:ring-indigo-400'
              }`}
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className={`flex items-center space-x-2 font-semibold ${
              darkMode ? 'text-cyan-200' : 'text-gray-700 dark:text-gray-300'
            }`}>
              <Lock size={18} />
              <span>Password</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="current-password"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-shadow duration-300 shadow-sm hover:shadow-md ${
                darkMode
                  ? 'border-cyan-700 focus:ring-4 focus:ring-cyan-400 bg-slate-900 text-cyan-100 placeholder-cyan-300'
                  : 'border-gray-300 focus:ring-4 focus:ring-indigo-400'
              }`}
              placeholder="********"
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full py-3 rounded-lg flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-colors duration-500 ${
              darkMode
                ? 'bg-gradient-to-r from-cyan-500 via-blue-700 to-slate-900 text-white hover:from-blue-900 hover:via-cyan-700 hover:to-slate-800'
                : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600'
            }`}
          >
            <Lock size={18} />
            <span>Login</span>
          </button>
        </form>
        <p className={`mt-6 text-center ${
          darkMode ? 'text-cyan-200' : 'text-gray-700 dark:text-gray-300'
        }`}>
          Don't have an account?{' '}
          <Link to="/signup" className={darkMode ? 'text-cyan-400 hover:underline font-semibold' : 'text-indigo-600 hover:underline font-semibold'}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
