import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, Eye, EyeOff, ArrowLeft, Home, Sparkles, ShieldCheck, Zap, Headphones } from 'lucide-react';
import { useDarkMode } from '../../useDarkMode.js';
import { signInWithGoogle, handleGoogleRedirectResult } from '../../firebase.js';
import { showSuccessToast, showErrorToast } from '../../utils/toast.jsx';

const GoogleIcon = () => (
  <span
    className="bg-white rounded-full flex items-center justify-center p-1 shadow-sm"
    style={{ width: 24, height: 24 }}
  >
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
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
  const { darkMode } = useDarkMode();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: '',
  });

  // Animation state management
  const [welcomeOut, setWelcomeOut] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setWelcomeOut(true), 1200);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    (async () => {
      const user = await handleGoogleRedirectResult();
      if (user) {
        showSuccessToast(`Welcome, ${user.displayName || user.email}!`);
        const userRole = (user && (user.role || (user.roles && user.roles[0]))) || '';
        if (userRole.toLowerCase() === 'tenant') navigate('/tenant');
        else if (userRole.toLowerCase() === 'landlord') navigate('/landlord');
        else navigate('/');
      }
    })();
  }, [navigate]);

  const checkStrength = (pwd) => {
    if (pwd.length < 6) return 'Weak';
    if (pwd.match(/[A-Z]/) && pwd.match(/[0-9]/) && pwd.length >= 8) return 'Strong';
    return 'Medium';
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPasswordStrength(checkStrength(pwd));
    setFormData(prev => ({ ...prev, password: pwd }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, phone, role } = formData;
    if (!name || !email || !password || !phone || !role) {
      showErrorToast("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/api/auth/register`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Registration failed.");
      const data = await response.json();
      const { token, user } = data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      showSuccessToast("Registered successfully!");
      const userRole = user.role || (user.roles && user.roles[0]) || '';
      setTimeout(() => {
        if (userRole.toLowerCase() === 'tenant') navigate('/tenant');
        else if (userRole.toLowerCase() === 'landlord') navigate('/landlord');
        else navigate('/');
      }, 1000);
    } catch (err) {
      console.error(err);
      showErrorToast("Error during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-500 ${darkMode ? 'bg-slate-950' : 'bg-[#fafaf9]'}`}>
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(#d97706 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-amber-400/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container max-w-6xl mx-auto px-4 relative z-10 py-12">
        <div className={`flex flex-col lg:flex-row rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-500 border ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-100'}`}>
          
          {/* Left Panel: Brand & Benefits */}
          <div className={`lg:w-5/12 relative p-12 flex flex-col justify-between overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-[#fafaf9]'}`}>
            <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: 'radial-gradient(#d97706 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
            
            {/* Back Button */}
            <Link to="/" className={`relative z-10 flex items-center gap-2 group transition-colors ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
              <div className={`p-2 rounded-xl transition-colors ${darkMode ? 'bg-slate-700' : 'bg-white shadow-sm'}`}>
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              </div>
              <span className="font-black text-xs uppercase tracking-widest">Back to Home</span>
            </Link>

            {/* Brand Logo Section */}
            <div className="relative z-10 space-y-8">
              <div className="group flex items-center gap-3 select-none">
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-500 blur-lg opacity-40"></div>
                  <div className="relative bg-gradient-to-br from-amber-400 to-amber-600 p-2.5 rounded-[14px] text-white shadow-lg">
                    <Home size={28} strokeWidth={2.5} />
                  </div>
                </div>
                <div className="flex flex-col -space-y-1">
                  <span className={`text-2xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-slate-900'}`}>Ghar<span className="text-amber-500">.</span>Nishchit</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-600">Premium Living</span>
                </div>
              </div>
              
              <div className="space-y-6">
                <h2 className={`text-4xl font-black tracking-tight leading-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  Join the <br />
                  <span className="text-amber-500 italic">Evolution</span> of Rental.
                </h2>
                
                <ul className="space-y-5">
                  {[
                    { icon: ShieldCheck, text: "Verified Premium Listings" },
                    { icon: Zap, text: "AI-Powered Matching Engine" },
                    { icon: Headphones, text: "24/7 Priority Concierge" }
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-4 group">
                      <div className={`p-2 rounded-xl transition-colors ${darkMode ? 'bg-slate-700 text-amber-500' : 'bg-white text-amber-600 shadow-sm'}`}>
                        <item.icon size={20} />
                      </div>
                      <span className={`font-bold text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="relative z-10 pt-8 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[10, 11, 12, 13].map(i => (
                    <img key={i} src={`https://randomuser.me/api/portraits/women/${i}.jpg`} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 shadow-md" alt="User" />
                  ))}
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Joining <span className="text-amber-600">500+</span> today
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Signup Form */}
          <div className="lg:w-7/12 p-12 lg:p-16 flex flex-col justify-center max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="max-w-md mx-auto w-full space-y-10">
              <div>
                <h3 className={`text-3xl font-black mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Create Account</h3>
                <p className={`font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Start your premium journey with us.</p>
              </div>

              {/* Social Signup */}
              <button
                onClick={signInWithGoogle}
                className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-md active:scale-95 border ${darkMode ? 'bg-white text-slate-900 hover:bg-slate-100 border-transparent' : 'bg-white text-slate-900 hover:bg-slate-50 border-slate-100'}`}
              >
                <GoogleIcon />
                Sign up with Google
              </button>

              <div className="flex items-center gap-4">
                <div className={`h-px flex-grow ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}></div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">or</span>
                <div className={`h-px flex-grow ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}></div>
              </div>

              {/* Signup Form */}
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className={`text-xs font-black uppercase tracking-[0.2em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Full Name</label>
                  <div className="relative group">
                    <User size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${darkMode ? 'text-slate-600 group-focus-within:text-amber-500' : 'text-slate-400 group-focus-within:text-amber-500'}`} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all outline-none font-bold text-sm ${darkMode ? 'bg-slate-800/50 border-slate-700 focus:border-amber-500 text-white' : 'bg-slate-50/50 border-slate-100 focus:border-amber-500 text-slate-900'}`}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`text-xs font-black uppercase tracking-[0.2em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Email Address</label>
                  <div className="relative group">
                    <Mail size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${darkMode ? 'text-slate-600 group-focus-within:text-amber-500' : 'text-slate-400 group-focus-within:text-amber-500'}`} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all outline-none font-bold text-sm ${darkMode ? 'bg-slate-800/50 border-slate-700 focus:border-amber-500 text-white' : 'bg-slate-50/50 border-slate-100 focus:border-amber-500 text-slate-900'}`}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`text-xs font-black uppercase tracking-[0.2em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Phone Number</label>
                  <div className="relative group">
                    <Phone size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${darkMode ? 'text-slate-600 group-focus-within:text-amber-500' : 'text-slate-400 group-focus-within:text-amber-500'}`} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all outline-none font-bold text-sm ${darkMode ? 'bg-slate-800/50 border-slate-700 focus:border-amber-500 text-white' : 'bg-slate-50/50 border-slate-100 focus:border-amber-500 text-slate-900'}`}
                      placeholder="+91 00000 00000"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`text-xs font-black uppercase tracking-[0.2em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Account Type</label>
                  <div className="flex items-center gap-4 h-14">
                    {['landlord', 'tenant'].map(role => (
                      <label key={role} className={`flex-1 flex items-center justify-center gap-2 h-full rounded-2xl border-2 cursor-pointer transition-all font-black text-xs uppercase tracking-widest ${formData.role === role ? 'border-amber-500 bg-amber-500/10 text-amber-600' : darkMode ? 'border-slate-800 text-slate-500' : 'border-slate-100 text-slate-400'}`}>
                        <input type="radio" name="role" value={role} checked={formData.role === role} onChange={handleChange} className="hidden" required />
                        {role}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className={`text-xs font-black uppercase tracking-[0.2em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Password</label>
                  <div className="relative group">
                    <Lock size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${darkMode ? 'text-slate-600 group-focus-within:text-amber-500' : 'text-slate-400 group-focus-within:text-amber-500'}`} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handlePasswordChange}
                      className={`w-full pl-12 pr-12 py-4 rounded-2xl border-2 transition-all outline-none font-bold text-sm ${darkMode ? 'bg-slate-800/50 border-slate-700 focus:border-amber-500 text-white' : 'bg-slate-50/50 border-slate-100 focus:border-amber-500 text-slate-900'}`}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${darkMode ? 'text-slate-600 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {formData.password && (
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                          passwordStrength === 'Weak' && i === 1 ? 'bg-red-500' :
                          passwordStrength === 'Medium' && i <= 2 ? 'bg-yellow-500' :
                          passwordStrength === 'Strong' ? 'bg-green-500' :
                          darkMode ? 'bg-slate-800' : 'bg-slate-100'
                        }`}></div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(245,158,11,0.3)] transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 ${darkMode ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                  >
                    {loading ? 'Processing...' : 'Create Account'} <Sparkles size={18} />
                  </button>
                </div>
              </form>

              <p className={`text-center font-bold text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Already have an account? <Link to="/login" className="text-amber-600 hover:text-amber-500 underline underline-offset-4">Sign In</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Animation Overlay */}
      <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-slate-950 transition-all duration-1000 ease-in-out ${welcomeOut ? 'translate-y-full' : 'translate-y-0'}`}>
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-amber-500 blur-2xl opacity-40 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-amber-400 to-amber-600 p-6 rounded-[2rem] text-white shadow-2xl">
              <Home size={60} strokeWidth={2.5} />
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-black text-white tracking-tighter mb-2 italic">Ghar.Nishchit</h1>
            <div className="h-1 w-24 bg-amber-500 mx-auto rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}