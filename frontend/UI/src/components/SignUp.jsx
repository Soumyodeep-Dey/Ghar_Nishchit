import React from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, Phone } from 'lucide-react'; 

export default function SignUp() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <div className="max-w-md w-full bg-white bg-opacity-90 dark:bg-gray-800 dark:bg-opacity-90 p-8 rounded-xl shadow-2xl transform transition-transform hover:scale-105 duration-300">
        <h2 className="text-3xl font-extrabold mb-8 text-gray-900 dark:text-gray-100 flex items-center space-x-3">
          <User size={28} />
          <span>Create a new account</span>
        </h2>
        <form className="space-y-6" noValidate>
          <div>
            <label htmlFor="name" className="text-gray-700 dark:text-gray-300 flex items-center space-x-2 font-semibold">
              <User size={18} />
              <span>Name</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              autoComplete="name"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-4 focus:ring-indigo-400 dark:focus:ring-indigo-600 transition-shadow duration-300 shadow-sm hover:shadow-md"
              placeholder="Your full name"
              required
            />
          </div>
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
            <label htmlFor="phone" className="text-gray-700 dark:text-gray-300 flex items-center space-x-2 font-semibold">
              <Phone size={18} />
              <span>Phone Number</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              autoComplete="tel"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-4 focus:ring-indigo-400 dark:focus:ring-indigo-600 transition-shadow duration-300 shadow-sm hover:shadow-md"
              placeholder="Your phone number"
              required
            />
          </div>
          <div>
            <span className="text-gray-700 dark:text-gray-300 font-semibold">Registering as:</span>
            <div className="flex items-center space-x-8 mt-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="landlord"
                  className="form-radio text-indigo-600 focus:ring-indigo-500"
                  required
                />
                <span>Landlord</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="tenant"
                  className="form-radio text-indigo-600 focus:ring-indigo-500"
                  required
                />
                <span>Tenant</span>
              </label>
            </div>
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
              autoComplete="new-password"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-4 focus:ring-indigo-400 dark:focus:ring-indigo-600 transition-shadow duration-300 shadow-sm hover:shadow-md"
              placeholder=""
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-3 rounded-lg hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 transition-colors duration-500 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <User size={18} />
            <span>Sign Up</span>
          </button>
        </form>
        <p className="mt-6 text-gray-700 dark:text-gray-300 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}