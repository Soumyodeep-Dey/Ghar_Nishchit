import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Home, Building, Info, DollarSign, Users, HelpCircle, Menu, X, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

import p1 from './assets/p1.jpg';
import p2 from './assets/p2.jpg';
import p3 from './assets/p3.jpg';
import p4 from './assets/p4.jpg';
import p5 from './assets/p5.jpg';
import p6 from './assets/p6.jpg';
import p7 from './assets/p7.jpg';
import p8 from './assets/p8.jpg';
import p9 from './assets/p9.jpg';
import p10 from './assets/p10.jpg';

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

export default function Landing() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);

  const carouselRef = useRef(null);

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

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400 text-gray-900 dark:text-gray-100 transition-colors duration-500">
      {/* Navbar */}
      <nav
        className="bg-white shadow-md sticky top-0 z-50"
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
            <li role="none">
              <a
                href="#properties"
                role="menuitem"
                tabIndex={0}
                className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
              >
                <Building size={18} aria-hidden="true" />
                <span>Properties</span>
              </a>
            </li>
            <li role="none">
              <a
                href="#about"
                role="menuitem"
                tabIndex={0}
                className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
              >
                <Info size={18} aria-hidden="true" />
                <span>About</span>
              </a>
            </li>
            <li role="none">
              <a
                href="#pricing"
                role="menuitem"
                tabIndex={0}
                className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
              >
                <DollarSign size={18} aria-hidden="true" />
                <span>Pricing</span>
              </a>
            </li>
            <li role="none">
              <a
                href="#customers"
                role="menuitem"
                tabIndex={0}
                className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
              >
                <Users size={18} aria-hidden="true" />
                <span>Customers</span>
              </a>
            </li>
            <li role="none">
              <a
                href="#help"
                role="menuitem"
                tabIndex={0}
                className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
              >
                <HelpCircle size={18} aria-hidden="true" />
                <span>Help</span>
              </a>
            </li>
          </ul>
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            onKeyDown={handleKeyDownMenuToggle}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="md:hidden p-2 rounded-md text-indigo-600 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          {/* SignUp Button */}
          <Link
            to="/signup"
            className="hidden md:inline-block bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-700 dark:hover:bg-indigo-600 transition"
          >
            SignUp
          </Link>
        </div>
        {/* Mobile Menu */}
        {menuOpen && (
          <ul
            id="mobile-menu"
            className="md:hidden bg-white shadow-md"
            role="menu"
            aria-label="Mobile menu"
          >
            <li role="none">
              <a
                href="#properties"
                role="menuitem"
                tabIndex={0}
                className="block px-6 py-3 text-gray-700 hover:bg-indigo-100 focus:outline-none focus:bg-indigo-100"
                onClick={() => setMenuOpen(false)}
              >
                Properties
              </a>
            </li>
            <li role="none">
              <a
                href="#about"
                role="menuitem"
                tabIndex={0}
                className="block px-6 py-3 text-gray-700 hover:bg-indigo-100 focus:outline-none focus:bg-indigo-100"
                onClick={() => setMenuOpen(false)}
              >
                About
              </a>
            </li>
            <li role="none">
              <a
                href="#pricing"
                role="menuitem"
                tabIndex={0}
                className="block px-6 py-3 text-gray-700 hover:bg-indigo-100 focus:outline-none focus:bg-indigo-100"
                onClick={() => setMenuOpen(false)}
              >
                Pricing
              </a>
            </li>
            <li role="none">
              <a
                href="#customers"
                role="menuitem"
                tabIndex={0}
                className="block px-6 py-3 text-gray-700 hover:bg-indigo-100 focus:outline-none focus:bg-indigo-100"
                onClick={() => setMenuOpen(false)}
              >
                Customers
              </a>
            </li>
            <li role="none">
              <a
                href="#help"
                role="menuitem"
                tabIndex={0}
                className="block px-6 py-3 text-gray-700 hover:bg-indigo-100 focus:outline-none focus:bg-indigo-100"
                onClick={() => setMenuOpen(false)}
              >
                Help
              </a>
            </li>
            <li role="none" className="px-6 py-3">
              <Link
                to="/signup"
                className="block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition text-center"
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
        className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Contact Us"
      >
        Contact Us
      </a>

      {/* Properties Section */}
      <section
        id="properties"
        className="container mx-auto px-6 py-12 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 rounded-lg shadow-md"
        aria-label="Properties carousel"
      >
        <h2 className="text-3xl font-semibold text-indigo-700 dark:text-indigo-400 mb-8 text-center">Properties</h2>
        <div
          className="relative w-full max-w-6xl mx-auto overflow-hidden rounded-lg shadow-lg group"
          ref={carouselRef}
        >
          {/* --- Carousel Section --- */}
          <div
            className="flex transition-transform duration-700"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {properties.map((property) => (
              <div
                key={property.id}
                className="min-w-full relative group"
                tabIndex={0}
                aria-label={`${property.name}, located in ${property.location}, type: ${property.type}, price $${property.price}`}
              >
                <img
                  src={property.image}
                  alt={property.name}
                  loading="lazy"
                  className="w-full h-[500px] object-cover rounded-lg transform transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute bottom-4 left-4 bg-indigo-700 bg-opacity-70 text-white p-3 rounded">
                  <h3 className="text-xl font-semibold">{property.name}</h3>
                  <p className="text-sm">{property.location}</p>
                  <p className="text-sm">${property.price} / month</p>
                </div>
              </div>
            ))}
          </div>
          {/* Carousel Controls */}
          <button
            type="button"
            onClick={() => setCurrentIndex((currentIndex - 1 + properties.length) % properties.length)}
            onKeyDown={(e) => handleKeyDownCarousel(e, 'prev')}
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-indigo-600 text-white p-4 rounded-full hover:bg-indigo-700 transition opacity-0 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Previous Property"
          >
            &#8592;
          </button>
          <button
            type="button"
            onClick={() => setCurrentIndex((currentIndex + 1) % properties.length)}
            onKeyDown={(e) => handleKeyDownCarousel(e, 'next')}
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-indigo-600 text-white p-4 rounded-full hover:bg-indigo-700 transition opacity-0 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Next Property"
          >
            &#8594;
          </button>
          {/* --- Carousel Indicators --- */}
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
      <section
        id="featured"
        className="container mx-auto px-6 py-12 bg-white rounded-lg shadow-md mt-12"
        aria-label="Featured properties"
      >
        <h2 className="text-3xl font-semibold text-indigo-700 dark:text-indigo-400 mb-8">Featured Properties</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* --- Featured Properties Section --- */}
          {featuredProperties.map((property) => (
            <div
              key={property.id}
              className="relative rounded-lg overflow-hidden shadow-lg group cursor-pointer hover:shadow-2xl transition-shadow duration-300"
              tabIndex={0}
              aria-label={`${property.name}, located in ${property.location}, type: ${property.type}, price $${property.price}`}
            >
              <img
                src={property.image}
                alt={property.name}
                loading="lazy"
                className="w-full h-64 object-cover rounded-t-lg"
              />
              <div className="p-4 bg-indigo-50">
                <h3 className="text-xl font-semibold">{property.name}</h3>
                <p className="text-sm">{property.location}</p>
                <p className="text-sm">${property.price} / month</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-white py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl font-semibold text-indigo-700 dark:text-indigo-400 mb-6">About Us</h2>
          <p className="text-gray-600">
           Our website offers a seamless and efficient platform connecting landlords with tenants, simplifying the entire rental process. We understand the challenges both parties face in the traditional rental market, and we've designed our platform to overcome these hurdles, making finding and renting a home easier than ever before.
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-6 py-12">
        <h2 className="text-3xl font-semibold text-indigo-700 dark:text-indigo-400 mb-8">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl transition-shadow duration-300 hover:ring-4 hover:ring-indigo-400">
              <h3 className="text-xl font-semibold mb-4 text-indigo-600 dark:text-indigo-300">Basic</h3>
              <p className="text-gray-600 mb-6">₹560/month</p>
              <ul className="text-gray-600 mb-6">
                <li>Manage up to 5 properties</li>
                <li>Email support</li>
                <li>Basic analytics</li>
              </ul>
            <button
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
              onClick={() => alert('Please login first to choose a plan')}
            >
              Choose Plan
            </button>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center border-2 border-emerald-600 hover:shadow-xl transition-shadow duration-300 hover:ring-4 hover:ring-emerald-400">
              <h3 className="text-xl font-semibold mb-4 text-indigo-600 dark:text-indigo-300">Pro</h3>
              <p className="text-gray-600 mb-6">₹1090/month</p>
              <ul className="text-gray-600 mb-6">
                <li>Manage up to 20 properties</li>
                <li>Priority email support</li>
                <li>Advanced analytics</li>
              </ul>
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
                onClick={() => alert('Please login first to choose a plan')}
              >
                Choose Plan
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl transition-shadow duration-300 hover:ring-4 hover:ring-indigo-400">
              <h3 className="text-xl font-semibold mb-4 text-indigo-600 dark:text-indigo-300">Enterprise</h3>
              <p className="text-gray-600 mb-6">Contact us</p>
              <ul className="text-gray-600 mb-6">
                <li>Unlimited properties</li>
                <li>Dedicated support</li>
                <li>Custom analytics</li>
              </ul>
            <button
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
              onClick={() => alert('Please login first to contact sales')}
            >
              Contact Sales
            </button>
            </div>
          </div>
      </section>

      {/* Customers Section */}
      <section id="customers" className="bg-white py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl font-semibold text-indigo-700 dark:text-indigo-400 mb-6">Our Customers</h2>
          <div className="space-y-6">
            {customers.map((customer) => (
              <div key={customer.id} className="bg-gray-100 p-6 rounded-lg shadow-md">
                <p className="text-gray-800 italic">"{customer.feedback}"</p>
                <p className="mt-4 font-semibold">- {customer.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="bg-white py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl font-semibold text-indigo-700 dark:text-indigo-400 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {/* --- FAQ Section --- */}
            {faqs.map((faq) => (
              <div key={faq.id} className="border rounded-lg p-4">
                <button
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={expandedFaq === faq.id}
                  aria-controls={`faq-answer-${faq.id}`}
                  className="w-full text-left text-indigo-600 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {faq.question}
                </button>
                {expandedFaq === faq.id && (
                  <p id={`faq-answer-${faq.id}`} className="mt-2 text-gray-700">
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Subscription Section */}
      <section id="newsletter" className="bg-indigo-600 py-12 mt-12">
        <div className="container mx-auto px-6 max-w-4xl text-center text-white">
          <h2 className="text-3xl font-semibold mb-4">Subscribe to our Newsletter</h2>
          <p className="mb-6">Get the latest updates and offers delivered to your inbox.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert('Thank you for subscribing!');
            }}
            className="flex flex-col md:flex-row justify-center items-center gap-4"
          >
            <input
              type="email"
              aria-label="Email address"
              required
              placeholder="Enter your email"
              className="p-3 rounded text-gray-900 w-full md:w-1/3"
            />
            <button
              type="submit"
              className="bg-white text-indigo-600 px-6 py-3 rounded hover:bg-gray-100 transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Help Section */}
      <section id="help" className="bg-white py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl font-semibold text-indigo-700 dark:text-indigo-400 mb-6">Help</h2>
          <p className="text-gray-600">
            Need assistance? Contact our support team at{' '}
            <a href="mailto:cybertg@ghar_nishchit.com" className="text-indigo-600 hover:underline">
              cybertg@ghar_nishchit.com
            </a>{' '}
            or call us at +91 3212352947.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-indigo-900 text-indigo-200 py-6 mt-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} Ghar_Nishchit. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noopener noreferrer" className="hover:text-white">
              <Facebook size={24} />
            </a>
            <a href="https://twitter.com" aria-label="Twitter" target="_blank" rel="noopener noreferrer" className="hover:text-white">
              <Twitter size={24} />
            </a>
            <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noopener noreferrer" className="hover:text-white">
              <Instagram size={24} />
            </a>
            <a href="https://linkedin.com" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer" className="hover:text-white">
              <Linkedin size={24} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}