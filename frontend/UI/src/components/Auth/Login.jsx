import { useState, useEffect } from 'react';
import p1 from '../../assets/p1.jpg';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useDarkMode } from '../../useDarkMode.js';
import { signInWithGoogle, handleGoogleRedirectResult } from '../../firebase.js';

const GoogleIcon = () => (
  <span
    className="bg-white rounded-full flex items-center justify-center"
    style={{ width: 26, height: 26, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
  >
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <g>
        <path fill="#4285F4" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.3-5.7 7-11.3 7-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.5l6-6C34.1 5.1 29.3 3 24 3 12.9 3 4 11.9 4 23s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.3-4z" />
        <path fill="#34A853" d="M6.3 14.7l6.6 4.8C14.3 16.1 18.7 13 24 13c2.7 0 5.2.9 7.2 2.5l6-6C34.1 5.1 29.3 3 24 3 15.3 3 7.9 8.6 6.3 14.7z" />
        <path fill="#FBBC05" d="M24 43c5.3 0 10.1-1.7 13.8-4.7l-6.4-5.2c-2 1.4-4.5 2.2-7.4 2.2-5.6 0-10.3-3.8-12-9l-6.6 5.1C7.9 39.4 15.3 45 24 45z" />
        <path fill="#EA4335" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.1 3-3.5 5.4-6.7 6.7l6.4 5.2C39.7 37.2 44 32.2 44 24c0-1.3-.1-2.7-.4-3.5z" />
      </g>
    </svg>
  </span>
);

export default function Login() {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');

  // Welcome overlay animation state
  const [welcomeOut, setWelcomeOut] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setWelcomeOut(true), 900);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    (async () => {
      const user = await handleGoogleRedirectResult();
      if (user) {
        alert(`Welcome back, ${user.displayName || user.email}!`);
        // Check user role and redirect accordingly
        const userRole = (user && (user.role || (user.roles && user.roles[0]))) || '';
        if (userRole.toLowerCase() === 'tenant') {
          navigate('/tenant');
        } else if (userRole.toLowerCase() === 'landlord') {
          navigate('/landlord');
        } else {
          navigate('/');
        }
      }
    })();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;
    if (!email || !password) {
      setMessage('Please fill in all fields.');
      return;
    }
    try {
      const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error('Login failed');
      const { token, user } = await response.json();
      console.log('Login response user:', user);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setMessage('Login successful! Redirecting...');
      const userRole = (user && (user.role || (user.roles && user.roles[0]))) || '';
      setTimeout(() => {
        if (userRole.toLowerCase() === 'tenant') {
          navigate('/tenant');
        } else if (userRole.toLowerCase() === 'landlord') {
          navigate('/landlord');
        } else {
          navigate('/'); // or other route for non-tenants
        }
      }, 1000);
    } catch (err) {
      console.error(err);
      setMessage('Invalid credentials.');
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-2 sm:px-4 ${darkMode
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
          className={`absolute top-4 right-4 z-40 px-4 py-2 rounded-full ${darkMode ? 'bg-cyan-400 text-blue-950' : 'bg-white text-indigo-600'
            } shadow transition-colors duration-300`}
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
            className={`text-xl sm:text-2xl font-bold mb-2 ${darkMode ? 'text-gray-200' : 'text-indigo-700'
              }`}
          >
            Login to Your Account
          </h2>
          <p
            className={`mb-4 sm:mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
          >
            Access your dashboard and manage your rentals.
          </p>

          {message && (
            <div className={`mb-4 text-sm text-center font-medium ${message.includes('successful') ? 'text-green-500' : 'text-red-500'
              }`}>
              {message}
            </div>
          )}

          {/* Social Login */}
          <button
            className={`w-full flex items-center justify-center gap-2 py-2 rounded mb-3 sm:mb-4 font-semibold text-sm sm:text-base transition-transform duration-300 hover:scale-105 hover:shadow-lg
    ${darkMode
                ? 'bg-white text-gray-800 hover:bg-gray-100 border border-cyan-700'
                : 'bg-white text-gray-800 hover:bg-gray-100 border border-gray-200'
              }`}
            type="button"
            onClick={signInWithGoogle}
          >
            <GoogleIcon />
            <span>Login with Google</span>
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
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className={`flex items-center gap-1 font-semibold mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
              >
                <Mail size={18} /> Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm transition-shadow duration-300 hover:shadow-lg ${darkMode
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
                className={`flex items-center gap-1 font-semibold mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
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
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm transition-shadow duration-300 hover:shadow-lg ${darkMode
                    ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  placeholder="********"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${darkMode
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
                className={`flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}
              >
                <input type="checkbox" className="form-checkbox text-indigo-600" />
                <span className="text-xs sm:text-sm">Remember Me</span>
              </label>
              <a
                href="/forgot-password"
                className={`text-xs sm:text-sm ${darkMode
                  ? 'text-indigo-400 hover:text-indigo-300'
                  : 'text-indigo-600 hover:underline'
                  }`}
              >
                Forgot Password?
              </a>
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 sm:py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors duration-300 hover:shadow-xl hover:scale-105 text-sm sm:text-base"
            >
              Login
            </button>
          </form>
          <p
            className={`mt-3 text-xs sm:text-sm text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
          >
            Don't have an account?{' '}
            <Link
              to="/signup"
              className={`${darkMode
                ? 'text-indigo-400 hover:text-indigo-300'
                : 'text-indigo-600 hover:underline'
                }`}
            >
              Sign Up
            </Link>
          </p>
          <p
            className={`mt-2 text-xs text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'
              }`}
          >
            We respect your privacy. No spam ever.
          </p>
        </div>
      </div>
    </div>
  );
}