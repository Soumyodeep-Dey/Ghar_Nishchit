import { useEffect, useRef, useState } from 'react';
import { useDarkMode } from '../useDarkMode.js';
import { Link } from 'react-router-dom';
import { Home, Building, Info, IndianRupee, Users, HelpCircle, Menu, X, BookOpen, ArrowRight } from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import { showInfoToast, showSuccessToast } from '../utils/toast.jsx';


import p1 from '../assets/p1.jpg';
import p2 from '../assets/p2.jpg';
import p3 from '../assets/p3.jpg';
import p4 from '../assets/p4.jpg';
import p5 from '../assets/p5.jpg';
import p6 from '../assets/p6.jpg';
import p7 from '../assets/p7.jpg';
import p8 from '../assets/p8.jpg';
import p9 from '../assets/p9.jpg';
import p10 from '../assets/p10.jpg';

const properties = [
  { id: 1, name: 'Cozy Apartment', image: p1, location: 'City Center', price: 1200, type: 'Apartment' },
  { id: 2, name: 'Modern House', image: p2, location: 'Suburbs', price: 2500, type: 'House' },
  { id: 3, name: 'Luxury Villa', image: p3, location: 'Beachside', price: 5000, type: 'Villa' },
  { id: 4, name: 'Beach House', image: p4, location: 'Beachside', price: 3000, type: 'House' },
  { id: 5, name: 'Mountain Cabin', image: p5, location: 'Mountains', price: 1500, type: 'Cabin' },
  { id: 6, name: 'City Loft', image: p6, location: 'City Center', price: 1800, type: 'Loft' },
  { id: 7, name: 'Suburban Home', image: p7, location: 'Suburbs', price: 2200, type: 'House' },
  { id: 8, name: 'Penthouse Suite', image: p8, location: 'City Center', price: 4000, type: 'Apartment' },
  { id: 9, name: 'Country House', image: p9, location: 'Countryside', price: 2000, type: 'House' },
  { id: 10, name: 'Modern Bungalow', image: p10, location: 'Suburbs', price: 2100, type: 'Bungalow' },
];

const featuredProperties = [
  { id: 11, name: 'Exclusive Villa', image: p3, location: 'Beachside', price: 7000, type: 'Villa' },
  { id: 12, name: 'Downtown Apartment', image: p6, location: 'City Center', price: 2300, type: 'Apartment' },
];

const customers = [
  { id: 1, name: 'John Doe', feedback: 'Ghar_Nishchit made managing my properties so easy and stress-free!' },
  { id: 2, name: 'Jane Smith', feedback: 'Excellent customer service and great features.' },
  { id: 3, name: 'Michael Johnson', feedback: 'Highly recommend Ghar_Nishchit for property management.' },
];

const faqs = [
  { id: 1, question: 'How do I list my property?', answer: 'You can list your property by signing up and using our property management dashboard.' },
  { id: 2, question: 'What payment methods are accepted?', answer: 'We accept all major credit cards and PayPal.' },
  { id: 3, question: 'Can I manage multiple properties?', answer: 'Yes, depending on your subscription plan, you can manage multiple properties.' },
];

const articles = [
  {
    id: 1,
    title: 'How to Choose the Right Rental Property',
    answer: 'Consider location, budget, amenities, and landlord reputation. Visit the property and review the rental agreement carefully before making a decision.'
  },
  {
    id: 2,
    title: 'Tips for Tenants: What to Look for in a Rental',
    answer: 'Look for safety features, proximity to work/school, fair rent, and responsive property management. Always inspect the property and clarify maintenance responsibilities.'
  },
  {
    id: 3,
    title: 'Understanding Rental Agreements',
    answer: 'A rental agreement should clearly state rent, duration, deposit, maintenance, and exit clauses. Read all terms and ask questions before signing.'
  }
];

const quickLinks = [
  {
    id: 1,
    title: 'Terms of Service',
    answer: 'Our Terms of Service outline the rules and regulations for using Ghar_Nishchit. Please read them carefully to understand your rights and responsibilities.'
  },
  {
    id: 2,
    title: 'Privacy Policy',
    answer: 'Our Privacy Policy explains how we collect, use, and protect your personal information. Your privacy is important to us.'
  }
];


// Define a single menu array outside the component
const menu = [
  { href: "#properties", label: "Properties", icon: Building },
  { href: "#about", label: "About", icon: Info },
  { href: "#pricing", label: "Pricing", icon: IndianRupee },
  { href: "#customers", label: "Customers", icon: Users },
  { href: "#blog", label: "Blog & Resources", icon: BookOpen },
  { href: "#help", label: "Help", icon: HelpCircle },
];


// Define this array near your other menu arrays (outside the component)
const socialLinks = [
  { href: "https://facebook.com", label: "Facebook", icon: FaFacebook },
  { href: "https://twitter.com", label: "Twitter", icon: FaTwitter },
  { href: "https://instagram.com", label: "Instagram", icon: FaInstagram },
  { href: "https://linkedin.com", label: "LinkedIn", icon: FaLinkedin },
];

// 2. Fade-in on scroll hook
function useFadeInOnScroll() {
  const ref = useRef();
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, isVisible];
}

function PricingCard({ title, price, features, buttonClass, onClick, highlight, darkMode }) {
  return (
    <div
      className={`flex flex-col h-full rounded-3xl p-10 text-center transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl border
        ${highlight
          ? darkMode
            ? 'bg-amber-600 border-amber-400 text-white shadow-amber-900/40 border-2'
            : 'bg-amber-500 border-amber-600 text-white shadow-amber-200/50 border-2'
          : darkMode
            ? 'bg-slate-900 border-slate-800 hover:border-amber-500/50'
            : 'bg-white border-slate-100 hover:border-amber-400 shadow-[0_20px_50px_rgba(0,0,0,0.04)]'
        }
      `}>
      <h3 className={`text-2xl font-black mb-2 ${highlight ? 'text-white' : darkMode ? 'text-amber-400' : 'text-slate-900'}`}>{title}</h3>
      <div className={`w-12 h-1 mx-auto mb-6 rounded-full ${highlight ? 'bg-white/40' : 'bg-amber-500/40'}`}></div>
      
      <p className={`mb-10 text-4xl font-black ${highlight ? 'text-white' : darkMode ? 'text-white' : 'text-slate-900'}`}>{price}</p>
      
      <ul className={`${highlight ? 'text-white' : 'text-slate-600 dark:text-slate-400'} mb-10 space-y-4 text-left flex-grow`}>
        {features.map((f, i) => (
          <li key={i} className="flex items-start space-x-3">
            <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${highlight ? 'text-white' : 'text-amber-500'}`} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-bold leading-tight">{f}</span>
          </li>
        ))}
      </ul>

      {/* The "One Line" (Divider) */}
      <div className={`w-full h-px mb-8 ${highlight ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}></div>

      <button className={`${buttonClass} w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-xl mt-auto hover:-translate-y-1`} onClick={onClick}>
        Choose Plan
      </button>
    </div>
  );
}

function CustomerCard({ customer, darkMode }) {
  return (
    <div className={`flex flex-col items-center p-8 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-amber-50'}`}>
      <div className="relative mb-6">
        <img
          src={`https://randomuser.me/api/portraits/men/${customer.id}.jpg`}
          alt={customer.name}
          className="w-20 h-20 rounded-full border-4 border-amber-500 shadow-lg object-cover"
          onError={e => {
            e.target.onerror = null;
            e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(customer.name);
          }}
        />
        <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white p-1.5 rounded-full shadow-md">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.561-.955L10 0l2.949 5.955 6.561.955-4.755 4.635 1.123 6.545z" /></svg>
        </div>
      </div>
      <p className={`font-bold text-xl mb-1 ${darkMode ? 'text-amber-400' : 'text-slate-900'}`}>{customer.name}</p>
      <div className={`mb-4 flex items-center space-x-1 ${darkMode ? 'text-amber-500' : 'text-amber-500'}`}>
        {[...Array(5)].map((_, i) => (
          <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.561-.955L10 0l2.949 5.955 6.561.955-4.755 4.635 1.123 6.545z" />
          </svg>
        ))}
      </div>
      <blockquote className={`relative italic text-center px-4 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
        <span className="text-4xl text-amber-500 opacity-20 absolute -top-4 -left-2">"</span>
        {customer.feedback}
        <span className="text-4xl text-amber-500 opacity-20 absolute -bottom-8 -right-2">"</span>
      </blockquote>
    </div>
  );
}

// 3. FAQ item component
function FaqItem({ faq, expandedFaq, toggleFaq, darkMode }) {
  return (
    <div className={`rounded-2xl p-6 transition-all duration-300 border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-amber-100 shadow-sm hover:shadow-md'}`}>
      <button
        onClick={() => toggleFaq(faq.id)}
        aria-expanded={expandedFaq === faq.id}
        aria-controls={`faq-answer-${faq.id}`}
        className={`w-full text-left font-black text-lg flex items-center justify-between focus:outline-none ${darkMode ? 'text-slate-100 hover:text-amber-400' : 'text-slate-900 hover:text-amber-600'}`}
      >
        <span>{faq.question}</span>
        <span className={`transform transition-transform duration-300 text-amber-500 ${expandedFaq === faq.id ? 'rotate-180' : ''}`}>
          <HelpCircle size={20} />
        </span>
      </button>
      {expandedFaq === faq.id && (
        <p
          id={`faq-answer-${faq.id}`}
          className={`mt-4 font-medium leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}
        >
          {faq.answer}
        </p>
      )}
    </div>
  );
}

function BlogItem({ item, selected, setSelected, darkMode }) {
  return (
    <li className="list-none">
      <button
        className={`block text-left w-full font-black text-sm uppercase tracking-widest transition-colors focus:outline-none ${darkMode
          ? 'text-slate-400 hover:text-amber-400'
          : 'text-slate-600 hover:text-amber-600'
          }`}
        onClick={() => setSelected(selected === item.id ? null : item.id)}
      >
        {item.title}
      </button>
      {selected === item.id && (
        <div className={`mt-4 p-5 rounded-2xl font-medium leading-relaxed shadow-lg border ${darkMode ? 'bg-slate-900 text-slate-300 border-slate-800' : 'bg-white text-slate-600 border-amber-50'
          }`}>
          {item.answer}
        </div>
      )}
    </li>
  );
}

function StatCard({ value, label, darkMode }) {
  return (
    <div className="flex flex-col items-center p-6 rounded-2xl transition-all duration-300 hover:bg-amber-50 dark:hover:bg-amber-900/10 group">
      <div className={`text-4xl md:text-5xl font-black mb-2 transition-transform group-hover:scale-110 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>{value}</div>
      <div className={`font-bold tracking-wide uppercase text-xs md:text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{label}</div>
    </div>
  );
}

export default function Landing() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  // Remove local darkMode state

  const { darkMode, toggleDarkMode } = useDarkMode();

  const carouselRef = useRef(null);

  // Add fade-in refs for each section
  const [propertiesRef, propertiesVisible] = useFadeInOnScroll();
  const [featuredRef, featuredVisible] = useFadeInOnScroll();
  const [aboutRef, aboutVisible] = useFadeInOnScroll();
  const [pricingRef, pricingVisible] = useFadeInOnScroll();
  const [customersRef, customersVisible] = useFadeInOnScroll();
  const [faqRef, faqVisible] = useFadeInOnScroll();
  const [blogRef, blogVisible] = useFadeInOnScroll();

  // Add state for 'How It Works' modal
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % properties.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Smooth scroll for anchor links
  useEffect(() => {
    const handleAnchorClick = (e) => {
      if (e.target.tagName === 'A' && e.target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
          setMenuOpen(false);
        }
      }
    };
    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  // Keyboard navigation for carousel buttons
  const handleKeyDownCarousel = (e, direction) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (direction === 'prev') {
        setCurrentIndex((currentIndex - 1 + properties.length) % properties.length);
      } else {
        setCurrentIndex((currentIndex + 1) % properties.length);
      }
    }
  };

  // Keyboard navigation for hamburger menu toggle
  const handleKeyDownMenuToggle = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setMenuOpen(!menuOpen);
    }
  };

  // Toggle FAQ expansion
  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  // Add state for selected article in Blog & Resources
  const [selectedArticle, setSelectedArticle] = useState(null);


  // Add state for selected quick link in Blog & Resources
  const [selectedQuickLink, setSelectedQuickLink] = useState(null);


  return (
    <div
      className={`min-h-screen transition-colors duration-500 font-sans ${darkMode
        ? 'bg-slate-950 text-slate-100'
        : 'bg-white text-slate-900'
        }`}
    >
      {/* Navbar */}
      <nav
        className={`sticky top-0 z-50 backdrop-blur-xl bg-opacity-80 border-b ${darkMode ? 'bg-slate-950/80 border-slate-800 text-slate-100' : 'bg-white/80 border-amber-100'
          }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div
              className="group flex items-center gap-3 cursor-pointer select-none"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500 blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-amber-400 to-amber-600 p-2 rounded-[14px] text-white shadow-[0_8px_20px_rgba(217,119,6,0.3)] transform transition-transform group-hover:scale-105 active:scale-95">
                  <Home size={22} strokeWidth={2.5} aria-hidden="true" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className={`text-2xl font-black tracking-tighter transition-colors leading-none ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  Ghar<span className="text-amber-500">.</span>Nishchit
                </span>
                <span className="text-[8px] font-black uppercase tracking-[0.6em] text-amber-600 mt-1 pl-0.5">
                  Premium Living
                </span>
              </div>
            </div>

            {/* Desktop Menu */}
            <ul className="hidden lg:flex items-center space-x-8" role="menubar">
              {menu.map(({ href, label, icon: IconComponent }) => (
                <li role="none" key={href}>
                  <a
                    href={href}
                    role="menuitem"
                    tabIndex={0}
                    className={`flex items-center space-x-2 text-sm font-bold uppercase tracking-widest transition-all
          ${darkMode
                        ? 'text-slate-400 hover:text-amber-400'
                        : 'text-slate-600 hover:text-amber-600'}
          cursor-pointer focus:outline-none rounded-full px-4 py-2 hover:bg-amber-50 dark:hover:bg-amber-900/20`}
                  >
                    <span>{label}</span>
                  </a>
                </li>
              ))}
            </ul>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4 sm:gap-8 flex-shrink-0">
              {/* Login Button - Hidden on mobile and small tablets */}
              <Link
                to="/login"
                className={`hidden lg:flex items-center gap-2 px-8 py-2.5 text-sm font-black uppercase tracking-widest rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 ${darkMode ? 'bg-amber-500 hover:bg-amber-400 text-slate-900' : 'bg-amber-500 hover:bg-amber-600 text-white'
                  }`}
              >
                Login <ArrowRight size={16} />
              </Link>

              {/* Dark Mode Toggle Button */}
              <button
                onClick={toggleDarkMode}
                className={`p-2.5 rounded-full transition-all shadow-md active:scale-90 ${darkMode
                  ? 'bg-slate-800 text-amber-400 hover:bg-slate-700'
                  : 'bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200'
                  }`}
                aria-label="Toggle dark mode"
              >
                <span className="text-xl">{darkMode ? '🌙' : '☀️'}</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                onKeyDown={handleKeyDownMenuToggle}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                className={`lg:hidden p-2 rounded-md transition focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-shrink-0 ${darkMode
                  ? 'text-cyan-400 hover:bg-slate-800'
                  : 'text-indigo-600 hover:bg-indigo-100'
                  }`}
              >
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <ul
            id="mobile-menu"
            className={`lg:hidden border-t ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-amber-100'}`}
            role="menu"
            aria-label="Mobile menu"
          >
            {menu.map(({ href, label, icon: IconComponent }) => (
              <li role="none" key={href}>
                <a
                  href={href}
                  role="menuitem"
                  tabIndex={0}
                  className={`flex items-center space-x-4 px-8 py-4 transition-all text-sm font-black uppercase tracking-[0.2em] ${darkMode
                    ? 'text-slate-400 hover:bg-amber-500/10 hover:text-amber-400'
                    : 'text-slate-600 hover:bg-amber-50 hover:text-amber-600'
                    }`}
                  onClick={() => setMenuOpen(false)}
                >
                  <IconComponent size={20} className="text-amber-500" aria-hidden="true" />
                  <span>{label}</span>
                </a>
              </li>
            ))}
            <li role="none" className="px-8 py-6">
              <Link
                to="/login"
                className={`block w-full py-4 rounded-2xl text-center font-black uppercase tracking-widest transition-all shadow-xl ${darkMode
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
            </li>
          </ul>
        )}
      </nav>

      {/* Floating Contact Button */}
      <a
        href="#help"
        className="fixed bottom-8 right-8 z-50 bg-amber-500 text-white p-5 rounded-full shadow-2xl hover:bg-amber-600 focus:outline-none transition-all hover:scale-110 active:scale-90 animate-bounce"
        aria-label="Contact Us"
      >
        <HelpCircle size={24} />
      </a>

      {/* Hero Section */}
      <div className={`relative pt-40 pb-32 overflow-hidden ${darkMode ? 'bg-slate-950' : 'bg-[#fafaf9]'}`}>
        {/* Advanced Decorative Background */}
        <div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.2]" style={{ backgroundImage: 'radial-gradient(#d97706 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
        
        {/* Mesh Gradients */}
        <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] bg-amber-400/20 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute top-[20%] left-[10%] w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
            <div className="inline-block px-4 py-1.5 mb-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 shadow-sm">
              <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                <Users size={12} /> Trusted by 10,000+ Landlords
              </span>
            </div>

            <h1 className={`text-6xl sm:text-7xl md:text-8xl font-black mb-8 leading-[1.05] tracking-tight ${darkMode ? 'text-white' : 'text-[#1c1c1c]'}`}>
              Find Your <span className="text-amber-500 italic">Perfect</span> <span className={darkMode ? 'text-amber-200' : 'text-[#854d0e]'}>Home</span> <br />
              With Confidence.
            </h1>

            <p className={`text-lg md:text-xl mb-12 max-w-3xl font-medium leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Ghar_Nishchit streamlines property management with AI-powered matching, secure digital contracts, and automated payment tracking.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 w-full justify-center mb-20">
              {/* Primary CTA */}
              <Link to="/login"
                className="w-full sm:w-auto px-10 py-5 rounded-2xl font-black text-lg shadow-[0_20px_50px_rgba(245,158,11,0.3)] bg-amber-500 text-white hover:bg-amber-600 transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
                Get Started Now <ArrowRight size={24} />
              </Link>

              {/* Secondary CTA */}
              <button
                className={`w-full sm:w-auto px-10 py-5 rounded-2xl font-black text-lg border-2 transition-all active:scale-95 ${darkMode ? 'border-slate-800 bg-slate-900/50 text-white hover:bg-slate-800' : 'border-slate-100 bg-white text-slate-900 shadow-sm hover:bg-slate-50'}`}
                onClick={() => setShowHowItWorks(true)}
              >
                Watch Demo
              </button>
            </div>

            {/* Stats Cards in Hero */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
              {[
                { icon: Users, value: '10k+', label: 'Active Users' },
                { icon: Building, value: '500+', label: 'Properties' },
                { icon: Home, value: '4.9/5', label: 'User Rating' },
                { icon: HelpCircle, value: '24/7', label: 'AI Support' }
              ].map((stat, i) => (
                <div key={i} className={`p-8 rounded-3xl transition-all duration-300 border ${darkMode ? 'bg-slate-900/50 border-slate-800 shadow-2xl' : 'bg-white border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.04)] hover:shadow-xl'}`}>
                  <stat.icon size={24} className="text-amber-500 mb-6 mx-auto" />
                  <div className={`text-3xl font-black mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{stat.value}</div>
                  <div className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showHowItWorks && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className={`rounded-[2.5rem] shadow-2xl p-10 max-w-lg w-full relative border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-amber-100'}`}>
            <button
              className="absolute top-6 right-6 text-slate-400 hover:text-amber-500 transition-colors text-3xl font-black focus:outline-none"
              onClick={() => setShowHowItWorks(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-3xl font-black mb-8 tracking-tighter text-amber-600">How It Works</h2>
            <ol className="space-y-6">
              {[
                { title: 'Sign Up', desc: 'Create your premium account as a landlord or tenant.' },
                { title: 'Browse or List', desc: 'Explore exclusive listings or showcase your property.' },
                { title: 'Connect', desc: 'Securely interact with our verified community.' },
                { title: 'Manage', desc: 'Track everything from your personalized dashboard.' },
                { title: 'Enjoy', desc: 'Experience a seamless and rewarding rental journey.' }
              ].map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-sm">{i + 1}</span>
                  <div>
                    <h4 className={`font-black uppercase tracking-widest text-xs mb-1 ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>{step.title}</h4>
                    <p className={`font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Social Proof/Stats Bar */}
      <div className={`border-y ${darkMode ? 'border-slate-800 bg-slate-900/30' : 'border-amber-100 bg-amber-50/30'}`}>
        <div className="container mx-auto px-6 py-10 flex flex-wrap items-center justify-around gap-8">
          <StatCard value="10k+" label="Active Users" darkMode={darkMode} />
          <StatCard value="500+" label="Properties" darkMode={darkMode} />
          <StatCard value="4.9/5" label="Top Rated" darkMode={darkMode} />
          <StatCard value="24/7" label="Support" darkMode={darkMode} />
        </div>
      </div>

      {/* Properties Section */}
      <section id="properties" ref={propertiesRef} className={`container mx-auto px-6 py-32 transition-all duration-1000 ${propertiesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="text-center mb-20">
          <h2 className={`text-5xl md:text-6xl font-black mb-6 tracking-tighter ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Explore <span className="text-amber-500 italic">Premium</span> Properties
          </h2>
          <div className="w-24 h-2 bg-amber-500 mx-auto rounded-full shadow-lg shadow-amber-200"></div>
        </div>
        <div
          className="relative w-full max-w-6xl mx-auto overflow-hidden rounded-lg shadow-lg group"
          ref={carouselRef}
        >
          <div
            className="flex transition-transform duration-700"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {properties.map((property) => (
              <div
                key={property.id}
                className="min-w-full relative group cursor-pointer overflow-hidden rounded-lg"
                tabIndex={0}
                aria-label={`${property.name}, located in ${property.location}, type: ${property.type}, price ₹${property.price}`}
              >
                <img
                  src={property.image}
                  alt={property.name}
                  loading="lazy"
                  className="w-full max-h-[300px] sm:max-h-[400px] md:h-[500px] object-cover rounded-lg transform transition-transform duration-500 group-hover:scale-105"
                />
                <div className={`absolute bottom-6 left-6 right-6 backdrop-blur-md p-6 rounded-2xl shadow-xl transition-all duration-500 group-hover:bottom-10 ${darkMode ? 'bg-slate-900/90' : 'bg-white/90'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{property.name}</h3>
                    <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-amber-500 text-white">{property.type}</span>
                  </div>
                  <p className={`text-sm font-bold mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{property.location}</p>
                  <p className="text-lg font-black text-amber-600">₹{property.price.toLocaleString()} <span className="text-xs font-bold text-slate-400">/ month</span></p>
                </div>
                <div className="absolute top-6 right-6 bg-slate-900 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-xl">
                  New Listing
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Controls */}
          <button
            type="button"
            onClick={() => setCurrentIndex((currentIndex - 1 + properties.length) % properties.length)}
            onKeyDown={(e) => handleKeyDownCarousel(e, 'prev')}
            className="absolute top-1/2 left-6 transform -translate-y-1/2 bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-white p-4 rounded-full hover:bg-amber-500 hover:text-white transition-all shadow-xl opacity-0 group-hover:opacity-100 focus:outline-none"
            aria-label="Previous Property"
          >
            &#8592;
          </button>

          <button
            type="button"
            onClick={() => setCurrentIndex((currentIndex + 1) % properties.length)}
            onKeyDown={(e) => handleKeyDownCarousel(e, 'next')}
            className="absolute top-1/2 right-6 transform -translate-y-1/2 bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-white p-4 rounded-full hover:bg-amber-500 hover:text-white transition-all shadow-xl opacity-0 group-hover:opacity-100 focus:outline-none"
            aria-label="Next Property"
          >
            &#8594;
          </button>

          {/* Carousel Indicators */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex space-x-3" role="tablist" aria-label="Property carousel indicators">
            {properties.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full ${currentIndex === idx ? 'w-8 h-2.5 bg-amber-500' : 'w-2.5 h-2.5 bg-slate-400 hover:bg-amber-300'}`}
                aria-label={`Go to property ${idx + 1}`}
                aria-selected={currentIndex === idx}
                role="tab"
                tabIndex={currentIndex === idx ? 0 : -1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section id="featured" ref={featuredRef}
        className={`container mx-auto px-6 py-20 transition-all duration-1000 ${featuredVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h2 className={`text-4xl md:text-5xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Featured <span className="text-amber-500">Listings</span>
            </h2>
            <p className={`mt-2 font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Handpicked premium properties just for you.</p>
          </div>
          <div className="h-1 w-32 bg-amber-500 rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredProperties.map((property) => (
            <div
              key={property.id}
              className="relative rounded-3xl overflow-hidden shadow-2xl group cursor-pointer"
              tabIndex={0}
            >
              <img
                src={property.image}
                alt={property.name}
                loading="lazy"
                className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
              <div className="absolute bottom-0 left-0 right-0 p-8 transform transition-transform duration-500">
                <span className="inline-block px-3 py-1 mb-4 text-[10px] font-black uppercase tracking-widest rounded-full bg-amber-500 text-white shadow-lg">Featured Property</span>
                <h3 className="text-3xl font-black text-white mb-2">{property.name}</h3>
                <div className="flex items-center gap-4 text-slate-200 font-bold">
                  <span>{property.location}</span>
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                  <span className="text-amber-400">₹{property.price.toLocaleString()} / mo</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" ref={aboutRef} className={`py-32 transition-all duration-1000 ${aboutVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${darkMode ? 'bg-[#0a0a0a]' : 'bg-white'}`}>
        <div className="container mx-auto px-6 max-w-7xl flex flex-col lg:flex-row items-center gap-20">
          <div className="lg:w-1/2 relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-amber-400/20 rounded-full blur-3xl"></div>
            <img
              src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1000"
              alt="About Ghar_Nishchit"
              className={`relative z-10 object-cover w-full h-[600px] rounded-[3rem] shadow-2xl ${darkMode ? 'border-4 border-slate-900' : ''}`}
              loading="lazy"
            />
            <div className="absolute -bottom-10 -right-10 bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-2xl z-20 border border-slate-100 dark:border-slate-800">
              <div className="text-5xl font-black text-amber-500 mb-2">10+</div>
              <div className={`text-sm font-black uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Years of Excellence <br /> In Real Estate</div>
            </div>
          </div>
          <div className="lg:w-1/2 space-y-10">
            <div>
              <h2 className={`text-5xl md:text-6xl font-black mb-8 leading-tight tracking-tighter ${darkMode ? 'text-white' : 'text-[#1c1c1c]'}`}>
                We Redefine the <br /> <span className="text-amber-500">Rental Experience</span>
              </h2>
              <p className={`text-lg font-medium leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                At Ghar_Nishchit, we believe finding a home should be as exciting as moving in. Our platform bridges the gap between landlords and tenants with transparency, speed, and cutting-edge technology.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {[
                { title: 'Verified Listings', desc: 'Every property is manually checked for authenticity.' },
                { title: 'Secure Payments', desc: 'Integrated escrow for safe rent deposits.' },
                { title: 'Instant Messaging', desc: 'Direct line of communication with landlords.' },
                { title: 'Digital Contracts', desc: 'Legally binding e-signatures made easy.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg text-amber-600 dark:text-amber-400">
                    <Building size={20} />
                  </div>
                  <div>
                    <h4 className={`font-black text-lg mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</h4>
                    <p className={`text-sm font-medium ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              className={`px-12 py-5 rounded-2xl font-black text-lg transition-all shadow-xl hover:-translate-y-1 ${darkMode ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'bg-[#0f172a] text-white hover:bg-slate-800'}`}
              onClick={() => showInfoToast('Please login first')}
            >
              Learn More About Us
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        ref={pricingRef}
        className={`container mx-auto px-6 py-24 transition-all duration-1000 ${pricingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
      >
        <div className="text-center mb-20">
          <h2 className={`text-4xl md:text-5xl font-black mb-4 tracking-tighter ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Simple <span className="text-amber-500">Pricing</span>
          </h2>
          <div className="w-24 h-1.5 bg-amber-500 mx-auto rounded-full"></div>
        </div>

        {/* For Landlords */}
        <div className={`mb-10 inline-block px-6 py-2 rounded-full text-sm font-black uppercase tracking-[0.2em] ${darkMode ? 'bg-amber-500 text-slate-900' : 'bg-slate-900 text-white'}`}>
          For Landlords
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 items-stretch">
          <PricingCard
            title="Standard Listing"
            price="₹ 499"
            features={[
              "List 1 property",
              "Subscription valid for 30 days",
              "Basic property analytics"
            ]}
            buttonClass={`${darkMode ? 'bg-amber-500 text-slate-900 hover:bg-amber-400' : 'bg-[#0f172a] text-white hover:bg-slate-800'}`}
            onClick={() => showInfoToast('Please login first to choose a plan')}
            darkMode={darkMode}
          />
          <PricingCard
            title="Featured Listing"
            price="₹ 999"
            features={[
              "Boosted visibility in search",
              "60-day listing validity",
              "Priority placement",
              "List 5 properties per month"
            ]}
            buttonClass={`${darkMode ? 'bg-white text-amber-600 hover:bg-amber-50' : 'bg-white text-amber-600 hover:bg-amber-50'}`}
            onClick={() => showInfoToast('Please login first to choose a plan')}
            highlight
            darkMode={darkMode}
          />
          <PricingCard
            title="Verified Badge"
            price="₹ 1,499"
            features={[
              "Trust verification badge",
              "Enhanced credibility",
              "One-time verification",
              "Unlimited property listings per month",
              "All features of Standard & Featured Listing"
            ]}
            buttonClass={`${darkMode ? 'bg-amber-500 text-slate-900 hover:bg-amber-400' : 'bg-[#0f172a] text-white hover:bg-slate-800'}`}
            onClick={() => showInfoToast('Please login first to choose a plan')}
            darkMode={darkMode}
          />
        </div>

        {/* For Tenants */}
        <div className={`mb-10 mt-16 inline-block px-6 py-2 rounded-full text-sm font-black uppercase tracking-[0.2em] ${darkMode ? 'bg-amber-500 text-slate-900' : 'bg-slate-900 text-white'}`}>
          For Tenants
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <PricingCard
            title="Free"
            price="₹ 0/month"
            features={[
              "Browse all listings",
              "Save favorites",
              "Limited contact reveals"
            ]}
            buttonClass={`${darkMode ? 'bg-amber-500 text-slate-900 hover:bg-amber-400' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
            onClick={() => showInfoToast('Please login first to choose a plan')}
            darkMode={darkMode}
          />
          <PricingCard
            title="Basic"
            price="₹ 199/month"
            features={[
              "Unlimited property views",
              "Direct landlord contact",
              "Priority support"
            ]}
            buttonClass="bg-white text-amber-600 hover:bg-amber-50"
            onClick={() => showInfoToast('Please login first to choose a plan')}
            highlight
            darkMode={darkMode}
          />
          <PricingCard
            title="Premium"
            price="₹ 499/month"
            features={[
              "All Basic features",
              "Early access to listings",
              "Advanced filters & document storage"
            ]}
            buttonClass={`${darkMode ? 'bg-amber-500 text-slate-900 hover:bg-amber-400' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
            onClick={() => showInfoToast('Please login first to choose a plan')}
            darkMode={darkMode}
          />
        </div>
      </section>

      {/* Customers Section */}
      <section id="customers" ref={customersRef} className={`py-24 transition-all duration-1000 ${customersVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${darkMode ? 'bg-slate-950' : 'bg-white'}`}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className={`text-4xl md:text-5xl font-black mb-4 tracking-tighter ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Our <span className="text-amber-500">Happy Clients</span>
            </h2>
            <div className="w-24 h-1.5 bg-amber-500 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto">
            {customers.map((customer) => (
              <CustomerCard key={customer.id} customer={customer} darkMode={darkMode} />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="faq"
        ref={faqRef}
        className={`py-24 transition-all duration-1000 ${faqVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          } ${darkMode ? 'bg-slate-900/50' : 'bg-amber-50/30'}`}
      >
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-black mb-4 tracking-tighter ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Common <span className="text-amber-500">Questions</span>
            </h2>
            <div className="w-20 h-1.5 bg-amber-500 mx-auto rounded-full"></div>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className={`rounded-2xl p-6 transition-all duration-300 border ${darkMode
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-white border-amber-100 shadow-sm hover:shadow-md'
                  }`}
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className={`w-full text-left font-black text-lg flex items-center justify-between focus:outline-none ${darkMode
                    ? 'text-slate-100 hover:text-amber-400'
                    : 'text-slate-900 hover:text-amber-600'
                    }`}
                >
                  <span>{faq.question}</span>
                  <span className={`transform transition-transform duration-300 text-amber-500 ${expandedFaq === faq.id ? 'rotate-180' : ''}`}>
                    <HelpCircle size={20} />
                  </span>
                </button>
                {expandedFaq === faq.id && (
                  <p className={`mt-4 text-lg font-medium leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog/Resources Section */}
      <section
        id="blog"
        ref={blogRef}
        className={`container mx-auto px-6 py-24 transition-all duration-1000 ${blogVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
      >
        <div className="text-center mb-20">
          <h2 className={`text-4xl md:text-5xl font-black mb-4 tracking-tighter ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Blog & <span className="text-amber-500">Resources</span>
          </h2>
          <div className="w-24 h-1.5 bg-amber-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div
            className={`p-10 rounded-[2.5rem] shadow-2xl transition-all duration-300 border ${darkMode
              ? 'bg-slate-900 border-slate-800'
              : 'bg-white border-amber-50 shadow-amber-200/20'
              }`}
          >
            <h3 className={`text-2xl font-black mb-8 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>Latest Articles</h3>
            <ul className="space-y-6">
              {articles.map((article) => (
                <li key={article.id}>
                  <button
                    className={`block text-left w-full text-xl font-bold transition-all ${darkMode
                      ? 'text-slate-100 hover:text-amber-400'
                      : 'text-slate-900 hover:text-amber-600'
                      }`}
                    onClick={() => setSelectedArticle(selectedArticle === article.id ? null : article.id)}
                  >
                    {article.title}
                  </button>
                  {selectedArticle === article.id && (
                    <div className={`mt-4 p-6 rounded-2xl text-lg font-medium leading-relaxed ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-amber-50 text-slate-600'}`}>
                      {article.answer}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div
            className={`p-10 rounded-[2.5rem] shadow-2xl transition-all duration-300 border ${darkMode
              ? 'bg-slate-900 border-slate-800'
              : 'bg-white border-amber-50 shadow-amber-200/20'
              }`}
          >
            <h3 className={`text-2xl font-black mb-8 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>Quick Links</h3>
            <ul className="space-y-6">
              {quickLinks.map((link) => (
                <li key={link.id}>
                  <button
                    className={`block text-left w-full text-xl font-bold transition-all ${darkMode
                      ? 'text-slate-100 hover:text-amber-400'
                      : 'text-slate-900 hover:text-amber-600'
                      }`}
                    onClick={() => setSelectedQuickLink(selectedQuickLink === link.id ? null : link.id)}
                  >
                    {link.title}
                  </button>
                  {selectedQuickLink === link.id && (
                    <div className={`mt-4 p-6 rounded-2xl text-lg font-medium leading-relaxed ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-amber-50 text-slate-600'}`}>
                      {link.answer}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`${darkMode ? 'bg-slate-950 text-slate-100 border-t border-slate-800' : 'bg-slate-900 text-white'} py-20`}>
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-16">

            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-8">
                <div className="bg-amber-500 p-2 rounded-xl text-white">
                  <Home size={28} />
                </div>
                <h3 className="text-3xl font-black tracking-tighter">Ghar_Nishchit</h3>
              </div>
              <p className="text-lg font-medium leading-relaxed mb-8 text-slate-400">
                Your trusted partner for premium property management. Experience the future of real estate today.
              </p>
              <div className="flex space-x-4">
                {socialLinks.map(({ href, label, icon: IconComponent }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 bg-slate-800 text-amber-500 hover:bg-amber-500 hover:text-white hover:-translate-y-1 shadow-lg"
                  >
                    <IconComponent size={20} />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xl font-black mb-8 uppercase tracking-widest text-amber-500">Navigation</h4>
              <ul className="space-y-4">
                {[
                  { href: '#properties', label: 'Properties' },
                  { href: '#about', label: 'About Us' },
                  { href: '#pricing', label: 'Pricing' },
                  { href: '#customers', label: 'Testimonials' }
                ].map(({ href, label }) => (
                  <li key={href}>
                    <a
                      href={href}
                      className="text-lg font-bold text-slate-400 hover:text-amber-400 transition-colors"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div id="help">
              <h4 className="text-xl font-black mb-8 uppercase tracking-widest text-amber-500">Get in Touch</h4>
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-black uppercase tracking-widest text-slate-500 mb-2">Email Us</p>
                  <a
                    href="mailto:support@ghar_nishchit.com"
                    className="text-lg font-bold text-slate-100 hover:text-amber-400 transition-colors"
                  >
                    support@ghar_nishchit.com
                  </a>
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-widest text-slate-500 mb-2">Call Us</p>
                  <span className="text-lg font-bold text-slate-100">(123) 456-7890</span>
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-xl font-black mb-8 uppercase tracking-widest text-amber-500">Newsletter</h4>
              <p className="text-lg font-medium text-slate-400 mb-6">Stay ahead with the latest property trends.</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  showSuccessToast('Subscribed to the newsletter!');
                }}
                className="space-y-4"
              >
                <input
                  type="email"
                  aria-label="Email address"
                  required
                  placeholder="Your email address"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-800 border-2 border-transparent focus:border-amber-500 focus:outline-none text-white font-bold transition-all"
                />
                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-amber-500 text-slate-900 font-black uppercase tracking-widest hover:bg-amber-400 transition-all shadow-xl"
                >
                  Join the Club
                </button>
              </form>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-slate-800 pt-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-slate-500 font-bold">
                © {new Date().getFullYear()} Ghar_Nishchit. Designed for excellence.
              </p>
              <div className="flex space-x-8">
                {['Privacy', 'Terms', 'Cookies'].map((link) => (
                  <a key={link} href="#" className="text-sm font-black uppercase tracking-widest text-slate-500 hover:text-amber-500 transition-colors">
                    {link}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
