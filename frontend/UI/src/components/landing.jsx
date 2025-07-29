﻿import { useEffect, useRef, useState } from 'react';
import { useDarkMode } from '../DarkModeContext';
import { Link } from 'react-router-dom';
import { Home, Building, Info, DollarSign, Users, HelpCircle, Menu, X, BookOpen } from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";


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
      className={`rounded-lg shadow-lg p-6 text-center transition-all duration-300 hover:ring-4 hover:scale-105
        ${highlight
          ? darkMode
            ? 'bg-gradient-to-r from-cyan-700 to-blue-900 border-cyan-400 text-white hover:shadow-2xl border-2'
            : 'bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-600 border-emerald-500 text-white hover:shadow-2xl border-2'
          : darkMode
            ? 'bg-blue-950 hover:ring-cyan-400'
            : 'bg-gradient-to-br from-white via-indigo-50 to-indigo-100 border border-indigo-200 hover:ring-indigo-400'
        }
      `}>
      <h3 className={`text-xl font-semibold mb-4 ${highlight ? '' : darkMode ? 'text-cyan-300' : 'text-indigo-700'}`}>{title}</h3>
      <p className={`mb-6 ${highlight ? 'text-lg font-semibold' : darkMode ? 'text-blue-200' : 'text-indigo-600 font-semibold'}`}>{price}</p>
      <ul className={`${highlight ? '' : 'text-indigo-700'} mb-6 space-y-2`}>
        {features.map((f, i) => (
          <li key={i} className="flex items-center justify-center space-x-2">
            <svg className={`w-5 h-5 ${highlight ? '' : 'text-indigo-500'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button className={`${buttonClass} transition-transform hover:scale-105`} onClick={onClick}>
        Choose Plan
      </button>
    </div>
  );
}

function CustomerCard({ customer, darkMode }) {
  return (
    <div className={`flex flex-col items-center p-8 rounded-xl shadow-lg ${darkMode ? 'bg-gradient-to-r from-blue-900 via-slate-800 to-blue-950' : 'bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100'}`}>
      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-4 ${darkMode ? 'bg-cyan-400 text-blue-950' : 'bg-indigo-600 text-white'}`}>
        {customer.name.charAt(0)}
      </div>
      <p className={`font-semibold text-lg mb-2 ${darkMode ? 'text-cyan-300' : 'text-indigo-700'}`}>{customer.name}</p>
      <blockquote className={`relative italic pl-6 before:content-['“'] before:absolute before:left-0 before:text-4xl ${darkMode ? 'text-blue-200 before:text-cyan-400' : 'text-gray-800 before:text-indigo-400'}`}>
        {customer.feedback}
      </blockquote>
      <div className={`mt-4 flex items-center space-x-1 ${darkMode ? 'text-cyan-400' : 'text-yellow-400'}`}>
        {[...Array(5)].map((_, i) => (
          <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.561-.955L10 0l2.949 5.955 6.561.955-4.755 4.635 1.123 6.545z" />
          </svg>
        ))}
      </div>
      <img
        src={`https://randomuser.me/api/portraits/men/${customer.id}.jpg`}
        alt={customer.name}
        className="w-16 h-16 rounded-full mb-4 border-2 border-indigo-400"
        onError={e => {
          e.target.onerror = null;
          e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(customer.name);
        }}
      />
    </div>
  );
}

// 3. FAQ item component
function FaqItem({ faq, expandedFaq, toggleFaq }) {
  return (
    <div className="border rounded-lg p-4">
      <button
        onClick={() => toggleFaq(faq.id)}
        aria-expanded={expandedFaq === faq.id}
        aria-controls={`faq-answer-${faq.id}`}
        className="w-full text-left text-indigo-600 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 "
      >
        {faq.question}
      </button>
      {expandedFaq === faq.id && (
        <p
          id={`faq-answer-${faq.id}`}
          className={`mt-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}
        >
          {faq.answer}
        </p>
      )}
    </div>
  );
}

function BlogItem({ item, selected, setSelected, darkMode }) {
  return (
    <li>
      <button
        className={`block text-left w-full font-semibold focus:outline-none ${darkMode
          ? 'text-cyan-300 hover:text-cyan-200'
          : 'text-indigo-600 hover:text-indigo-900'
          }`}
        onClick={() => setSelected(selected === item.id ? null : item.id)}
      >
        {item.title}
      </button>
      {selected === item.id && (
        <div className={`mt-2 p-3 rounded shadow ${darkMode ? 'bg-slate-900 text-white' : 'bg-white text-gray-800'
          }`}>
          {item.answer}
        </div>
      )}
    </li>
  );
}

function StatCard({ value, label, darkMode }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`text-4xl font-bold ${darkMode ? 'text-cyan-400' : 'text-indigo-600'}`}>{value}</div>
      <div className={`font-semibold ${darkMode ? 'text-blue-200' : 'text-gray-700'}`}>{label}</div>
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


  // Define a single menu array outside the component
  const menu = [
    { href: "#properties", label: "Properties", icon: Building },
    { href: "#about", label: "About", icon: Info },
    { href: "#pricing", label: "Pricing", icon: DollarSign },
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

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${darkMode
        ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-blue-950 text-slate-100'
        : 'bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400 text-gray-900'
        }`}
    >
      {/* Navbar */}
      <nav
        className={`sticky top-0 z-50 backdrop-blur-md bg-opacity-80 shadow-md ${darkMode ? 'bg-gradient-to-r from-blue-950 via-slate-900 to-gray-900 text-slate-100' : 'bg-white'
          }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer flex items-center space-x-2">
            <Home size={28} aria-hidden="true" />
            <span>Ghar_Nishchit</span>
          </div>

          {/* Desktop Menu */}
          <ul className="hidden md:flex space-x-8" role="menubar">
            {menu.map(({ href, label, icon: Icon }, idx) => (
              <li role="none" key={href}>
                <a
                  href={href}
                  role="menuitem"
                  tabIndex={0}
                  className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded transition-transform transform hover:scale-110"
                >
                  <Icon size={18} aria-hidden="true" />
                  <span>{label}</span>
                </a>
              </li>
            ))}
          </ul>
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            onKeyDown={handleKeyDownMenuToggle}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="md:hidden p-2 rounded-md text-indigo-600 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* SignUp Button */}
          <Link
            to="/signup"
            className="hidden md:inline-block bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-700 dark:hover:bg-indigo-600 transition transition-transform hover:scale-105"
          >
            SignUp
          </Link>

          {/* Dark Mode Toggle Button */}
          <button
            onClick={toggleDarkMode}
            className="ml-4 p-2 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition"
            aria-label="Toggle dark mode"
          >
            {darkMode ? '🌙' : '☀️'}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <ul
            id="mobile-menu"
            className="md:hidden bg-white shadow-md"
            role="menu"
            aria-label="Mobile menu"
          >
            {menu.map(({ href, label, icon: Icon }) => (
              <li role="none" key={href}>
                <a
                  href={href}
                  role="menuitem"
                  tabIndex={0}
                  className="flex items-center space-x-3 px-6 py-3 text-gray-700 hover:bg-indigo-100 focus:outline-none focus:bg-indigo-200 transition-colors text-lg"
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon size={20} className="text-indigo-600" aria-hidden="true" />
                  <span>{label}</span>
                </a>
              </li>
            ))}
            <li role="none" className="px-6 py-3">
              <Link
                to="/signup"
                className="block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition text-center font-semibold"
                onClick={() => setMenuOpen(false)}
              >
                SignUp
              </Link>
            </li>
          </ul>
        )}
      </nav>

      {/* Floating Contact Button */}
      <a
        href="#help"
        className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-transform hover:scale-105 animate-pulse"
        aria-label="Contact Us"
      >
        Contact Us
      </a>

      {/* Hero Section with SVG background */}
      <div className="relative py-20 mb-12 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0">
          <svg width="100%" height="100%" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path fill="#a5b4fc" fillOpacity="0.2" d="M0,160L80,170.7C160,181,320,203,480,197.3C640,192,800,160,960,133.3C1120,107,1280,85,1360,74.7L1440,64L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
          </svg>
        </div>

        <div className="container mx-auto px-4 sm:px-6 md:px-6 flex flex-col items-center justify-center text-center relative z-10">

          <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg ${darkMode ? 'text-cyan-300' : 'text-white'}`}>Find Your Perfect Rental Property</h1>

          <p className={`text-base sm:text-lg md:text-xl mb-8 ${darkMode ? 'text-blue-200' : 'text-indigo-100'}`}>Ghar_Nishchit makes property management easy, efficient, and rewarding for owners and tenants.
          </p>

          {/* Primary CTA */}
          <Link to="/signup"
            className={`px-6 py-3 sm:px-8 sm:py-4 rounded-full font-semibold text-base sm:text-lg shadow-lg transition transition-transform hover:scale-105 ${darkMode ? 'bg-cyan-400 text-blue-950 hover:bg-cyan-300' : 'bg-white text-indigo-600 hover:bg-indigo-100 transition-transform hover:scale-105'}`}>
            Get Started
          </Link>

          {/* Secondary CTA */}
          <button
            className={`mt-4 px-6 py-3 sm:px-8 sm:py-4 rounded-full font-semibold text-base sm:text-lg shadow-lg transition transition-transform hover:scale-105 ${darkMode ? 'bg-indigo-900 text-cyan-200 hover:bg-indigo-800' : 'bg-indigo-600 text-white hover:bg-indigo-700 transition-transform hover:scale-105'}`}
            onClick={() => setShowHowItWorks(true)}
          >
            See How It Works
          </button>
        </div>
      </div>

      {showHowItWorks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`bg-white dark:bg-slate-900 rounded-lg shadow-lg p-8 max-w-lg w-full relative`}>
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-indigo-600 dark:hover:text-cyan-300 text-2xl font-bold focus:outline-none"
              onClick={() => setShowHowItWorks(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4 text-indigo-700 dark:text-cyan-300">How Ghar_Nishchit Works</h2>
            <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-cyan-100">
              <li>
                <span className="font-semibold dark:text-cyan-300">Sign Up:</span>
                <span className="dark:text-cyan-200"> Create your free account as a landlord or tenant.</span>
              </li>
              <li>
                <span className="font-semibold dark:text-cyan-300">Browse or List Properties:</span>
                <span className="dark:text-cyan-200"> Tenants can browse listings, landlords can add new properties.</span>
              </li>
              <li>
                <span className="font-semibold dark:text-cyan-300">Connect:</span>
                <span className="dark:text-cyan-200"> Use our secure messaging to contact landlords or tenants.</span>
              </li>
              <li>
                <span className="font-semibold dark:text-cyan-300">Manage & Track:</span>
                <span className="dark:text-cyan-200"> Handle inquiries, favorites, and property details from your dashboard.</span>
              </li>
              <li>
                <span className="font-semibold dark:text-cyan-300">Move In:</span>
                <span className="dark:text-cyan-200"> Finalize agreements and enjoy a smooth rental experience!</span>
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* Social Proof/Stats Bar */}
      <div className="container mx-auto px-6 py-6 flex flex-wrap items-center justify-center gap-8">
        <StatCard value="10,000+" label="Active Users" darkMode={darkMode} />
        <StatCard value="500+" label="Properties Listed" darkMode={darkMode} />
        <StatCard value="4.9/5" label="Average Rating" darkMode={darkMode} />
      </div>

      {/* Properties Section */}
      <section id="properties" ref={propertiesRef} className={`container mx-auto px-6 py-12 rounded-lg shadow-md transition-all duration-700 ${propertiesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${darkMode ? 'bg-gradient-to-r from-blue-950 via-slate-900 to-gray-900' : 'bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200'}`}>
        <h2 className={`text-3xl font-semibold mb-8 text-center ${darkMode ? 'text-cyan-300' : 'text-indigo-700 dark:text-indigo-400'}`}>
          Properties
        </h2>
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
                className="min-w-full relative group cursor-pointer"
                tabIndex={0}
                aria-label={`${property.name}, located in ${property.location}, type: ${property.type}, price ₹${property.price}`}
              >
                <img
                  src={property.image}
                  alt={property.name}
                  loading="lazy"
                  className="w-full max-h-[300px] sm:max-h-[400px] md:h-[500px] object-cover rounded-lg transform transition-transform duration-300 group-hover:scale-110 group-hover:shadow-2xl"
                />
                <div className="absolute bottom-4 left-4 bg-gradient-to-r from-indigo-900 via-indigo-700 to-indigo-900 bg-opacity-80 text-white p-3 rounded-lg transition-opacity duration-300 opacity-90 group-hover:opacity-100">
                  <h3 className="text-lg sm:text-xl font-bold">{property.name}</h3>
                  <p className="text-[9px] sm:text-xs">{property.location}</p>
                  <p className="text-[9px] sm:text-xs font-semibold">₹{property.price} / month</p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-[10px] sm:text-xs font-semibold rounded-full bg-indigo-600">{property.type}</span>
                </div>
                <div className="absolute top-4 right-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                  New
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Controls */}
          <button
            type="button"
            onClick={() => setCurrentIndex((currentIndex - 1 + properties.length) % properties.length)}
            onKeyDown={(e) => handleKeyDownCarousel(e, 'prev')}
            className="absolute top-1/2 left-2 sm:left-4 transform -translate-y-1/2 bg-indigo-600 text-white p-3 sm:p-4 rounded-full hover:bg-indigo-700 transition opacity-0 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Previous Property"
          >
            &#8592;
          </button>

          <button
            type="button"
            onClick={() => setCurrentIndex((currentIndex + 1) % properties.length)}
            onKeyDown={(e) => handleKeyDownCarousel(e, 'next')}
            className="absolute top-1/2 right-2 sm:right-4 transform -translate-y-1/2 bg-indigo-600 text-white p-3 sm:p-4 rounded-full hover:bg-indigo-700 transition opacity-0 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Next Property"
          >
            &#8594;
          </button>

          {/* Carousel Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2" role="tablist" aria-label="Property carousel indicators">
            {properties.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-3 h-3 rounded-full ${currentIndex === idx ? 'bg-indigo-600' : 'bg-gray-400'}`}
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
        className={`container mx-auto px-6 py-16 mb-12 rounded-lg shadow-md mt-20 transition-all duration-700 ${featuredVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${darkMode ? 'bg-slate-900 via-blue-950 to-gray-900' : 'bg-white'}`}>
        <h2 className={`text-3xl font-semibold mb-8 ${darkMode ? 'text-cyan-300' : 'text-indigo-700 dark:text-indigo-400'}`}>
          Featured Properties
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredProperties.map((property) => (
            <div
              key={property.id}
              className="relative rounded-lg overflow-hidden shadow-lg group cursor-pointer hover:shadow-2xl transition-shadow duration-300"
              tabIndex={0}
              aria-label={`${property.name}, located in ${property.location}, type: ${property.type}, price ₹${property.price}`}
            >
              <img
                src={property.image}
                alt={property.name}
                loading="lazy"
                className="w-full h-64 object-cover rounded-t-lg transform transition-transform duration-300 group-hover:scale-105 group-hover:shadow-2xl"
              />
              <div className={`p-6 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 rounded-b-lg`}>
                <h3 className="text-2xl font-bold text-indigo-700">{property.name}</h3>
                <p className="text-sm text-indigo-600">{property.location}</p>
                <p className={`text-sm font-semibold mt-1 ${darkMode ? 'text-black' : ''}`}>₹{property.price} / month</p>
                <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full bg-indigo-600 text-white">{property.type}</span>
              </div>
              <div className="absolute top-4 right-4 bg-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                Featured
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" ref={aboutRef} className={`py-12 transition-all duration-700 ${aboutVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
        <div className="container mx-auto px-6 max-w-6xl flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2 relative overflow-hidden rounded-lg shadow-lg">
            <img
              src={p5}
              alt="About Ghar_Nishchit"
              className="object-cover w-full h-80 transform transition-transform duration-500 hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-900 via-transparent to-transparent opacity-50 pointer-events-none rounded-lg"></div>
            <div className="absolute bottom-4 left-4 text-white font-semibold text-lg drop-shadow-lg">
              Trusted Partner in Rental Property Management
            </div>
          </div>
          <div className="md:w-1/2 space-y-6">
            <h2 className={`text-3xl font-semibold mb-6 ${darkMode ? 'text-cyan-300' : 'text-indigo-700 dark:text-indigo-400'}`}>
              About Us
            </h2>
            <p className="text-gray-600 mb-4 hover:bg-indigo-100 hover:text-indigo-900 transition duration-300 p-2 rounded cursor-pointer">

            </p>
            <p className="text-gray-600 hover:bg-indigo-100 hover:text-indigo-900 transition duration-300 p-2 rounded cursor-pointer">
              Our expert team continuously updates the platform with advanced features to ensure you stay ahead in the competitive rental market. Trust Ghar_Nishchit to simplify your property management journey and help you achieve your investment goals with confidence and ease.
            </p>
            <div className="flex space-x-6">
              <StatCard value="10+" label="Years of Experience" darkMode={darkMode} />
              <StatCard value="500+" label="Properties Managed" darkMode={darkMode} />
              <StatCard value="1000+" label="Happy Clients" darkMode={darkMode} />
            </div>
            <button
              className={`mt-6 px-6 py-3 rounded transition transition-transform hover:scale-105 ${darkMode ? 'bg-cyan-400 text-blue-950 hover:bg-cyan-300' : 'bg-indigo-600 text-white hover:bg-indigo-700 transition-transform hover:scale-105'
                }`}
              onClick={() => alert('Please login first')}
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        ref={pricingRef}
        className={`container mx-auto px-6 py-12 transition-all duration-700 rounded-lg shadow-md mt-6 mb-6
    ${pricingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
    ${darkMode
            ? 'bg-slate-900 border border-slate-800'
            : 'bg-white'
          }`
        }
      >
        <h2 className={`text-3xl font-semibold mb-8 text-center ${darkMode ? 'text-cyan-300' : 'text-indigo-700 dark:text-indigo-400'}`}>
          Pricing
        </h2>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <PricingCard
            title="Basic"
            price="₹ 2,900/month"
            features={[
              "Manage up to 5 properties",
              "Email support",
              "Basic analytics"
            ]}
            buttonClass={`px-4 py-2 rounded transition ${darkMode ? 'bg-cyan-400 text-blue-950 hover:bg-cyan-300' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
            onClick={() => alert('Please login first to choose a plan')}
            darkMode={darkMode}
          />
          <PricingCard
            title="Pro"
            price="₹ 6,900/month"
            features={[
              "Manage up to 20 properties",
              "Priority email support",
              "Advanced analytics"
            ]}
            buttonClass={`px-4 py-2 rounded transition ${darkMode ? 'bg-white text-cyan-700 hover:bg-gray-100' : 'bg-white text-emerald-600 hover:bg-gray-100'}`}
            onClick={() => alert('Please login first to choose a plan')}
            highlight
            darkMode={darkMode}
          />
          <PricingCard
            title="Enterprise"
            price="₹ 15,900/month"
            features={[
              "Unlimited properties",
              "Dedicated support",
              "Custom analytics"
            ]}
            buttonClass={`px-4 py-2 rounded transition ${darkMode ? 'bg-cyan-400 text-blue-950 hover:bg-cyan-300' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
            onClick={() => alert('Please login first to choose a plan')}
            darkMode={darkMode}
          />
        </div>
      </section>

      {/* Customers Section (testimonials with avatars) */}
      <section id="customers" ref={customersRef} className={`py-12 transition-all duration-700 ${customersVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${darkMode ? 'bg-gradient-to-r from-blue-950 via-slate-900 to-gray-900' : 'bg-white'}`}>
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className={`text-3xl font-semibold mb-6 text-center ${darkMode ? 'text-cyan-300' : 'text-indigo-700 dark:text-indigo-400'}`}>
            Our Customers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
        className={`py-8 transition-all duration-700 ${faqVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          } ${darkMode ? 'bg-slate-900' : 'bg-white'}`}
      >
        <div className="container mx-auto px-6 max-w-4xl mx-w-2xl">
          <h2 className="text-3xl font-semibold text-indigo-700 dark:text-cyan-300 mb-6 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className={`border rounded-lg p-4 transition ${darkMode
                  ? 'bg-slate-800 border-slate-700 text-cyan-100'
                  : 'bg-white border-indigo-200 text-gray-700'
                  }`}
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={expandedFaq === faq.id}
                  aria-controls={`faq-answer-${faq.id}`}
                  className={`w-full text-left font-semibold focus:outline-none focus:ring-2 ${darkMode
                    ? 'text-cyan-300 focus:ring-cyan-400'
                    : 'text-indigo-600 focus:ring-indigo-500'
                    }`}
                >
                  {faq.question}
                </button>
                {expandedFaq === faq.id && (
                  <p
                    id={`faq-answer-${faq.id}`}
                    className={`mt-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}
                  >
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
        className={`container mx-auto px-6 py-8 mt-8 transition-all duration-700 ${blogVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          } ${darkMode ? 'bg-slate-900' : 'bg-white'}`}
      >
        <h2 className="text-3xl font-semibold mb-6 text-indigo-700 dark:text-cyan-300">
          Blog & Resources
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div
            className={`p-6 rounded-lg shadow-md transition ${darkMode
              ? 'bg-slate-800 text-cyan-100'
              : 'bg-indigo-100 text-indigo-700'
              }`}
          >
            <h3 className="text-xl font-bold mb-4 text-indigo-700 dark:text-cyan-300">
              Latest Articles
            </h3>
            <ul className="space-y-4">
              {articles.map((article) => (
                <li key={article.id}>
                  <button
                    className={`block text-left w-full font-semibold focus:outline-none ${darkMode
                      ? 'text-cyan-300 hover:text-cyan-200'
                      : 'text-indigo-600 hover:text-indigo-900'
                      }`}
                    onClick={() =>
                      setSelectedArticle(selectedArticle === article.id ? null : article.id)
                    }
                  >
                    {article.title}
                  </button>
                  {selectedArticle === article.id && (
                    <div
                      className={`mt-2 p-3 rounded shadow ${darkMode
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-gray-800'
                        }`}
                    >
                      {article.answer}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div
            className={`p-6 rounded-lg shadow-md transition ${darkMode
              ? 'bg-slate-800 text-cyan-100'
              : 'bg-indigo-100 text-indigo-700'
              }`}
          >
            <h3 className="text-xl font-bold mb-4 text-indigo-700 dark:text-cyan-300">
              Quick Links
            </h3>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.id}>
                  <button
                    className={`block text-left w-full font-semibold focus:outline-none ${darkMode
                      ? 'text-cyan-300 hover:text-cyan-200'
                      : 'text-indigo-600 hover:text-indigo-900'
                      }`}
                    onClick={() =>
                      setSelectedQuickLink(selectedQuickLink === link.id ? null : link.id)
                    }
                  >
                    {link.title}
                  </button>
                  {selectedQuickLink === link.id && (
                    <div
                      className={`mt-2 p-3 rounded shadow ${darkMode
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-gray-800'
                        }`}
                    >
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
      <footer className={`${darkMode ? 'bg-gradient-to-r from-blue-950 via-slate-900 to-gray-900 text-cyan-200' : 'bg-indigo-900 text-indigo-200'} py-8 mt-4`}>
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Newsletter Subscription */}
            <div className="text-white">
              <h2 className="text-3xl font-semibold mb-4">Subscribe to our Newsletter</h2>
              <p className="mb-6">Get the latest updates and offers delivered to your inbox.</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert('Thank you for subscribing!');
                }}
                className="flex flex-col md:flex-row justify-start items-center gap-4"
              >
                <input
                  type="email"
                  aria-label="Email address"
                  required
                  placeholder="Enter your email"
                  className="p-3 rounded text-gray-900 w-full md:w-64"
                />
                <button
                  type="submit"
                  className="bg-white text-indigo-600 px-6 py-3 rounded hover:bg-gray-100 transition"
                >
                  Subscribe
                </button>
              </form>
            </div>
            {/* Help Section */}
            <div id="help" className="text-white">
              <h2 className="text-3xl font-semibold mb-4">Help</h2>
              <p className="mb-2">
                Need assistance? Contact our support team at{' '}
                <a href="mailto:support@ghar_nishchit.com" className="underline hover:text-indigo-300">
                  support@ghar_nishchit.com
                </a>{' '}
                or call us at (123) 456-7890.
              </p>
            </div>
            {/* Social Media */}
            <div className="flex flex-col justify-between">
              <div className="flex space-x-6 mb-6 md:mb-0 justify-center md:justify-end">
                {socialLinks.map(({ href, label, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    <Icon size={24} />
                  </a>
                ))}
              </div>
            </div>
          </div>
          <p className="text-center mt-8">© {new Date().getFullYear()} Ghar_Nishchit. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}