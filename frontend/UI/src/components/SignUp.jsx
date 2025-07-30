import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, Eye, EyeOff } from 'lucide-react';
import { useDarkMode } from '../DarkModeContext';
import p1 from '../assets/p1.jpg';
import { signInWithGoogle, handleGoogleRedirectResult } from '../firebase';
import { useNavigate } from 'react-router-dom';

// Update the GoogleIcon to add a white background and rounded style for visibility
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


export default function SignUp() {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: '',
  });

  // Animation state management
  const [animationState, setAnimationState] = useState({
    containerVisible: false,
    titleVisible: false,
    benefitsVisible: [false, false, false],
    imageVisible: false,
  });

  // Welcome overlay animation
  const [welcomeOut, setWelcomeOut] = useState(false);

  // Handle Google redirect result
  useEffect(() => {
    (async () => {
      const user = await handleGoogleRedirectResult();
      if (user) {
        alert(`Welcome, ${user.displayName || user.email}!`);
        navigate('/'); // redirect to homepage
      }
    })();
  }, [navigate]);

  // Password strength logic
  const checkStrength = (pwd) => {
    if (pwd.length < 6) return 'Weak';
    if (pwd.match(/[A-Z]/) && pwd.match(/[0-9]/) && pwd.length >= 8) return 'Strong';
    return 'Medium';
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    setPasswordStrength(checkStrength(pwd));
  };

  // Animation effect (same as before)
  useEffect(() => {
    const initialDelay = setTimeout(() => {
      setAnimationState((prev) => ({ ...prev, containerVisible: true }));
    }, 300);

    const titleDelay = setTimeout(() => {
      setAnimationState((prev) => ({ ...prev, titleVisible: true }));
    }, 600);

    const benefitsDelays = [
      setTimeout(() => {
        setAnimationState((prev) => ({
          ...prev,
          benefitsVisible: [true, false, false],
        }));
      }, 800),
      setTimeout(() => {
        setAnimationState((prev) => ({
          ...prev,
          benefitsVisible: [true, true, false],
        }));
      }, 950),
      setTimeout(() => {
        setAnimationState((prev) => ({
          ...prev,
          benefitsVisible: [true, true, true],
        }));
      }, 1100),
    ];

    const imageDelay = setTimeout(() => {
      setAnimationState((prev) => ({ ...prev, imageVisible: true }));
    }, 1250);

    const welcomeTimeout = setTimeout(() => {
      setWelcomeOut(true);
    }, 900);

    return () => {
      clearTimeout(initialDelay);
      clearTimeout(titleDelay);
      benefitsDelays.forEach(clearTimeout);
      clearTimeout(imageDelay);
      clearTimeout(welcomeTimeout);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const { name, email, password, phone, role } = formData;

    if (!name || !email || !password || !phone || !role) {
      alert("Please fill in all fields.");
      return;
    }

    const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/api/auth/register`;

    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Registration failed.");
        }
        return response.json();
      })
      .then((data) => {
        const { token, user } = data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        alert("Registered successfully!");
        navigate("/");
      })
      .catch((err) => {
        console.error(err);
        alert("Error during registration.");
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  return (
    <div
      className={`min-h-screen flex items-center justify-center px-2 sm:px-4 transition-colors duration-500 ${darkMode
        ? 'bg-gradient-to-br from-blue-950 via-slate-900 to-cyan-900'
        : 'bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100'
        }`}
    >
      <div
        className={`relative flex flex-col md:flex-row rounded-2xl shadow-2xl overflow-hidden max-w-lg sm:max-w-xl md:max-w-4xl w-full transition-colors duration-300 ${darkMode
          ? 'bg-gradient-to-br from-slate-900 via-blue-950 to-cyan-900 bg-opacity-95'
          : 'bg-white'
          }`}
      >
        {/* Welcome Overlay – always appears at first, then slides out everywhere */}
        <div
          className={`
            absolute left-0 top-0 w-full h-full z-40 flex flex-col justify-center items-center
            bg-gradient-to-br from-indigo-600 to-pink-500 text-white
            transition-all duration-700 ease-in-out
            ${welcomeOut ? '-translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'}
            rounded-2xl
          `}
          style={{
            boxShadow: welcomeOut ? 'none' : '0 10px 40px rgba(0,0,0,0.2)',
          }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Welcome to Ghar_Nishchit!</h2>
          <ul className="space-y-2 sm:space-y-3 text-base sm:text-lg">
            <li>✔️ Verified Listings</li>
            <li>✔️ Secure Messaging</li>
            <li>✔️ 24/7 Support</li>
          </ul>
          <div className="mt-6 sm:mt-8">
            <img
              src={p1}
              alt="Welcome"
              className="rounded-xl shadow-lg w-44 h-28 sm:w-64 sm:h-40 object-cover mt-3 sm:mt-4"
            />
          </div>
        </div>
        <div className="relative w-full flex flex-col md:flex-row">
          {/* MOBILE WELCOME (above form), DESKTOP LEFT PANEL */}
          <div
            // Show on mobile below overlay, show on md+ as left column
            className={`
              flex flex-col items-center justify-center
              w-full md:w-1/2
              px-5 py-7 sm:p-10 gap-3 sm:gap-5
              bg-gradient-to-br from-indigo-600 to-pink-500 text-white
              md:rounded-none md:rounded-l-2xl
              ${welcomeOut ? 'flex md:flex' : 'hidden md:flex'}
              md:relative md:z-0
              md:opacity-100
              rounded-t-2xl md:rounded-2xl
              transition-all duration-700
              ${animationState.containerVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}
            `}
          >
            {/* Animated Desktop */}
            <div className="flex flex-col items-center w-full">
              <h2
                className={`text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-4 transition-all duration-600 ${animationState.titleVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                  }`}
              >
                Welcome to Ghar_Nishchit!
              </h2>
              <ul className="space-y-2 sm:space-y-3 text-sm sm:text-lg">
                {[
                  { text: '✔️ Verified Listings', key: 0 },
                  { text: '✔️ Secure Messaging', key: 1 },
                  { text: '✔️ 24/7 Support', key: 2 },
                ].map((b, i) => (
                  <li
                    key={b.key}
                    className={`transition-all duration-600 ${animationState.benefitsVisible[i]
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-4 opacity-0'
                      }`}
                  >
                    <span
                      className={`inline-block transition-all duration-300 ${animationState.benefitsVisible[i] ? 'animate-pulse-checkmark' : ''
                        }`}
                    >
                      {b.text}
                    </span>
                  </li>
                ))}
              </ul>
              <div
                className={`mt-4 sm:mt-8 transition-all duration-700 ${animationState.imageVisible
                  ? 'translate-y-0 opacity-100 scale-100'
                  : 'translate-y-8 opacity-0 scale-95'
                  }`}
              >
                <img
                  src={p1}
                  alt="Welcome"
                  className={`rounded-xl shadow-lg w-32 h-20 sm:w-56 sm:h-36 md:w-64 md:h-40 object-cover transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
                />
              </div>
            </div>
          </div>

          {/* SIGNUP FORM */}
          <div className={`w-full md:w-1/2 p-6 sm:p-8 ${darkMode ? 'text-cyan-100' : ''} relative`}>
            <button
              onClick={toggleDarkMode}
              className={`absolute top-4 right-4 z-30 px-4 py-2 rounded-full font-semibold shadow transition-colors duration-300 ${darkMode
                ? 'bg-cyan-400 text-blue-950 hover:bg-cyan-300'
                : 'bg-white text-indigo-600 hover:bg-indigo-100'
                }`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? '🌙' : '☀️'}
            </button>
            <h2 className={`text-xl sm:text-2xl font-bold mb-2 ${darkMode ? 'text-cyan-300' : 'text-indigo-700'}`}>
              Create Your Account
            </h2>
            <p className={`mb-4 sm:mb-6 ${darkMode ? 'text-cyan-200' : 'text-gray-500'}`}>
              Join 10,000+ happy users!
            </p>

            {/* Social Signup */}
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
              <span>Sign up with Google</span>
            </button>

            <div className="flex items-center my-2 sm:my-4">
              <hr className={`flex-grow ${darkMode ? 'border-cyan-700' : 'border-gray-300'}`} />
              <span className={`mx-2 ${darkMode ? 'text-cyan-400' : 'text-gray-400'}`}>or</span>
              <hr className={`flex-grow ${darkMode ? 'border-cyan-700' : 'border-gray-300'}`} />
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className={`flex items-center gap-1 font-semibold mb-1 ${darkMode ? 'text-cyan-200' : 'text-gray-700'}`}>
                  <User size={18} /> Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 shadow-sm transition-shadow duration-300 hover:shadow-lg text-sm sm:text-base ${darkMode ? 'bg-slate-900 border-cyan-700 text-cyan-100 placeholder-cyan-300 focus:ring-cyan-400' : 'border-gray-300 focus:ring-indigo-400'}`}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className={`flex items-center gap-1 font-semibold mb-1 ${darkMode ? 'text-cyan-200' : 'text-gray-700'}`}>
                  <Mail size={18} /> Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 shadow-sm transition-shadow duration-300 hover:shadow-lg text-sm sm:text-base ${darkMode ? 'bg-slate-900 border-cyan-700 text-cyan-100 placeholder-cyan-300 focus:ring-cyan-400' : 'border-gray-300 focus:ring-indigo-400'}`}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className={`flex items-center gap-1 font-semibold mb-1 ${darkMode ? 'text-cyan-200' : 'text-gray-700'}`}>
                  <Phone size={18} /> Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 shadow-sm transition-shadow duration-300 hover:shadow-lg text-sm sm:text-base ${darkMode ? 'bg-slate-900 border-cyan-700 text-cyan-100 placeholder-cyan-300 focus:ring-cyan-400' : 'border-gray-300 focus:ring-indigo-400'}`}
                  placeholder="Your phone number"
                  required
                />
              </div>

              <div>
                <span className={`font-semibold ${darkMode ? 'text-cyan-200' : 'text-gray-700'}`}>Registering as:</span>
                <div className="flex items-center gap-5 sm:gap-7 mt-2">
                  <label className={`flex items-center gap-2 cursor-pointer ${darkMode ? 'text-cyan-100' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="landlord"
                      checked={formData.role === 'landlord'}
                      onChange={handleChange}
                      className={`form-radio ${darkMode ? 'text-cyan-400 focus:ring-cyan-500' : 'text-indigo-600 focus:ring-indigo-500'}`}
                      required
                    />
                    <span>Landlord</span>
                  </label>
                  <label className={`flex items-center gap-2 cursor-pointer ${darkMode ? 'text-cyan-100' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="tenant"
                      checked={formData.role === 'tenant'}
                      onChange={handleChange}
                      className={`form-radio ${darkMode ? 'text-cyan-400 focus:ring-cyan-500' : 'text-indigo-600 focus:ring-indigo-500'}`}
                      required
                    />
                    <span>Tenant</span>
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="password" className={`flex items-center gap-1 font-semibold mb-1 ${darkMode ? 'text-cyan-200' : 'text-gray-700'}`}>
                  <Lock size={18} /> Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      handleChange(e);
                    }}
                    className={`w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 shadow-sm transition-shadow duration-300 hover:shadow-lg text-sm sm:text-base ${darkMode ? 'bg-slate-900 border-cyan-700 text-cyan-100 placeholder-cyan-300 focus:ring-cyan-400' : 'border-gray-300 focus:ring-indigo-400'}`}
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-cyan-300`}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {password && (
                  <div className="mt-2 text-xs sm:text-sm">
                    <span
                      className={
                        passwordStrength === 'Weak'
                          ? 'text-red-500'
                          : passwordStrength === 'Medium'
                            ? 'text-yellow-500'
                            : 'text-green-600'
                      }
                    >
                      Password strength: {passwordStrength}
                    </span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className={`w-full py-2 sm:py-3 rounded-lg font-semibold transition-colors duration-300 hover:shadow-xl hover:scale-105 text-sm sm:text-base ${darkMode
                  ? 'bg-gradient-to-r from-cyan-500 via-blue-700 to-slate-900 text-white hover:from-blue-900 hover:via-cyan-700 hover:to-slate-800'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
              >
                Sign Up
              </button>
            </form>

            <p className={`mt-3 text-xs sm:text-sm text-center ${darkMode ? 'text-cyan-200' : 'text-gray-500'}`}>
              Already have an account?{' '}
              <Link
                to="/login"
                className={darkMode ? 'text-cyan-400 hover:underline font-semibold' : 'text-indigo-600 hover:underline font-semibold'}
              >
                Login
              </Link>
            </p>
            <p className={`mt-2 text-xs text-center ${darkMode ? 'text-cyan-400' : 'text-gray-400'}`}>
              We respect your privacy. No spam ever.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}