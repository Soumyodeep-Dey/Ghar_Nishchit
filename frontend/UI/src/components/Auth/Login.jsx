import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Home, Sparkles } from 'lucide-react';
import { useDarkMode } from '../../useDarkMode.js';
import { showSuccessToast, showErrorToast } from '../../utils/toast.jsx';
import { setAuthSession, restoreSession, getRoleDashboardPath } from '../../services/authService.js';

export default function Login() {
  const navigate = useNavigate();
  const { darkMode } = useDarkMode();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  // Welcome overlay animation state
  const [welcomeOut, setWelcomeOut] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setWelcomeOut(true), 1200);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const user = await restoreSession();
        if (user) {
          showSuccessToast(`Welcome back, ${user.name || user.email}!`);
          navigate(getRoleDashboardPath(user));
        }
      } catch {
        // Session expired — stay on login page
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
      showErrorToast("Please fill in all fields.");
      return;
    }

    setLoading(true);
    const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`;

    // EXACT mirror of original logic to ensure backend compatibility
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Login failed.");

      const destination = getRoleDashboardPath(data.user);
      if (destination === '/') throw new Error('Your account does not have a supported role.');

      setAuthSession(data);
      showSuccessToast("Login successful!");
      navigate(destination, { replace: true });
    } catch (err) {
      console.error("Login Error Details:", err);
      showErrorToast(err.message || "Error during login. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-500 ${darkMode ? 'bg-slate-950' : 'bg-[#fafaf9]'}`}>
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(#d97706 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-amber-400/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container max-w-5xl mx-auto px-4 relative z-10 py-12">
        <div className={`flex flex-col lg:flex-row rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-500 border ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-100'}`}>
          
          {/* Left Panel: Brand & Welcome */}
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
            <div className="relative z-10 space-y-6">
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
              
              <div className="space-y-4">
                <h2 className={`text-4xl font-black tracking-tight leading-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  Access Your <br />
                  <span className="text-amber-500">Premium</span> Dashboard.
                </h2>
                <p className={`font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Join over 10,000+ landlords and tenants experiencing the next generation of property management.
                </p>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="relative z-10 flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <img key={i} src={`https://randomuser.me/api/portraits/men/${i + 10}.jpg`} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 shadow-md" alt="User" />
                ))}
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Trusted by <span className="text-amber-600">10k+</span> users
              </div>
            </div>
          </div>

          {/* Right Panel: Login Form */}
          <div className="lg:w-7/12 p-12 lg:p-16 flex flex-col justify-center max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="max-w-md mx-auto w-full space-y-10">
              <div>
                <h3 className={`text-3xl font-black mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Sign In</h3>
                <p className={`font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Welcome back! Please enter your details.</p>
              </div>

              {/* Email Form */}
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className={`text-xs font-black uppercase tracking-[0.2em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Email Address</label>
                  <div className="relative group">
                    <Mail size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${darkMode ? 'text-slate-600 group-focus-within:text-amber-500' : 'text-slate-400 group-focus-within:text-amber-500'}`} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all outline-none font-bold ${darkMode ? 'bg-slate-900/80 border-slate-700 focus:border-amber-500 text-white' : 'bg-slate-50/50 border-slate-100 focus:border-amber-500 text-slate-900'}`}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className={`text-xs font-black uppercase tracking-[0.2em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Password</label>
                    <Link to="/forgot-password" className="text-[10px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-500">Forgot Password?</Link>
                  </div>
                  <div className="relative group">
                    <Lock size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${darkMode ? 'text-slate-600 group-focus-within:text-amber-500' : 'text-slate-400 group-focus-within:text-amber-500'}`} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-12 py-4 rounded-2xl border-2 transition-all outline-none font-bold ${darkMode ? 'bg-slate-900/80 border-slate-700 focus:border-amber-500 text-white' : 'bg-slate-50/50 border-slate-100 focus:border-amber-500 text-slate-900'}`}
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
                </div>

                <div className="flex items-center gap-3">
                  <input type="checkbox" id="remember" className="w-4 h-4 rounded border-2 border-slate-200 accent-amber-500" />
                  <label htmlFor="remember" className={`text-xs font-black uppercase tracking-widest cursor-pointer ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Remember Me</label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(245,158,11,0.3)] transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 ${darkMode ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                >
                  {loading ? 'Processing...' : 'Sign In Now'} <Sparkles size={18} />
                </button>
              </form>

              <p className={`text-center font-bold text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Don't have an account? <Link to="/signup" className="text-amber-600 hover:text-amber-500 underline underline-offset-4">Sign Up</Link>
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
