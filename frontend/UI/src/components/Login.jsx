import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <div className="max-w-md w-full bg-white bg-opacity-90 dark:bg-gray-800 dark:bg-opacity-90 p-8 rounded-xl shadow-2xl transform transition-transform hover:scale-105 duration-300">
        <h2 className="text-3xl font-extrabold mb-8 text-gray-900 dark:text-gray-100 flex items-center space-x-3">
          <Lock size={28} />
          <span>Login to your account</span>
        </h2>
        <form className="space-y-6" noValidate>
          <div>
            <label htmlFor="email" className="text-gray-700 dark:text-gray-300 flex items-center space-x-2 font-semibold">
              <Mail size={18} />
              <span>Email</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-4 focus:ring-indigo-400 dark:focus:ring-indigo-600 transition-shadow duration-300 shadow-sm hover:shadow-md"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="text-gray-700 dark:text-gray-300 flex items-center space-x-2 font-semibold">
              <Lock size={18} />
              <span>Password</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="current-password"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-4 focus:ring-indigo-400 dark:focus:ring-indigo-600 transition-shadow duration-300 shadow-sm hover:shadow-md"
              placeholder="********"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-3 rounded-lg hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 transition-colors duration-500 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Lock size={18} />
            <span>Login</span>
          </button>
        </form>
        <p className="mt-6 text-gray-700 dark:text-gray-300 text-center">
          Don't have an account?{' '}
          <Link to="/signup" className="text-indigo-600 hover:underline font-semibold">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
