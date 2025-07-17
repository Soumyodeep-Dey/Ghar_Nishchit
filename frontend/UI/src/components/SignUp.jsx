import React from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock } from 'lucide-react';

export default function SignUp() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center space-x-2">
          <User size={24} />
          <span>Create a new account</span>
        </h2>
        <form className="space-y-4" noValidate>
          <div>
            <label htmlFor="name" className=" text-gray-700 dark:text-gray-300 flex items-center space-x-1">
              <User size={16} />
              <span>Name</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              autoComplete="name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Your full name"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className=" text-gray-700 dark:text-gray-300 flex items-center space-x-1">
              <Mail size={16} />
              <span>Email</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className=" text-gray-700 dark:text-gray-300 flex items-center space-x-1">
              <Lock size={16} />
              <span>Password</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="new-password"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="********"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition flex items-center justify-center space-x-2"
          >
            <User size={16} />
            <span>Sign Up</span>
          </button>
        </form>
        <p className="mt-4 text-gray-700 dark:text-gray-300">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
