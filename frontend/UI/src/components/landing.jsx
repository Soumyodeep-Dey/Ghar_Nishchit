import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, Info, DollarSign, Users, HelpCircle } from 'lucide-react';

const properties = [
  { id: 1, name: 'Cozy Apartment', image: 'https://images.unsplash.com/photo-1560448070-4a7a1a0b7a1a?auto=format&fit=crop&w=800&q=60' },
  { id: 2, name: 'Modern House', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=60' },
  { id: 3, name: 'Luxury Villa', image: 'https://images.unsplash.com/photo-1572120360610-d971b9b1a1a1?auto=format&fit=crop&w=800&q=60' },
  { id: 4, name: 'Beach House', image: 'https://images.unsplash.com/photo-1501183638714-1c2a6b6c8a6e?auto=format&fit=crop&w=800&q=60' },
  { id: 5, name: 'Mountain Cabin', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=60' },
  { id: 6, name: 'City Loft', image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=800&q=60' },
  { id: 7, name: 'Suburban Home', image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=60' },
  { id: 8, name: 'Penthouse Suite', image: 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=800&q=60' },
  { id: 9, name: 'Country House', image: 'https://images.unsplash.com/photo-1472220625704-91e1462799b2?auto=format&fit=crop&w=800&q=60' },
  { id: 10, name: 'Modern Bungalow', image: 'https://images.unsplash.com/photo-1494522248282-7a1a1a1a1a1a?auto=format&fit=crop&w=800&q=60' },
];

const customers = [
  { id: 1, name: 'John Doe', feedback: 'Ghar_Nishchit made managing my properties so easy and stress-free!' },
  { id: 2, name: 'Jane Smith', feedback: 'Excellent customer service and great features.' },
  { id: 3, name: 'Michael Johnson', feedback: 'Highly recommend Ghar_Nishchit for property management.' },
];

export default function Landing() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % properties.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400 text-gray-900 dark:text-gray-100 transition-colors duration-500">
      {/* Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer flex items-center space-x-2">
            <Home size={28} />
            <span>Ghar_Nishchit</span>
          </div>
          <ul className="flex space-x-8">
            <li className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">
              <Home size={18} />
              <a href="#properties">Properties</a>
            </li>
            <li className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">
              <Info size={18} />
              <a href="#about">About</a>
            </li>
            <li className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">
              <DollarSign size={18} />
              <a href="#pricing">Pricing</a>
            </li>
            <li className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">
              <Users size={18} />
              <a href="#customers">Customers</a>
            </li>
            <li className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">
              <HelpCircle size={18} />
              <a href="#help">Help</a>
            </li>
          </ul>
          <Link
            to="/login"
            className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-700 dark:hover:bg-indigo-600 transition inline-block"
          >
            SignUp
          </Link>
        </div>
      </nav>

      {/* Properties Section */}
      <section id="properties" className="container mx-auto px-6 py-12">
        <h2 className="text-3xl font-semibold text-indigo-700 dark:text-indigo-400 mb-8">Properties</h2>
        <div className="relative w-full max-w-4xl mx-auto overflow-hidden rounded-lg shadow-lg">
          <div className="flex transition-transform duration-700" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
            {properties.map((property) => (
              <div key={property.id} className="min-w-full relative group">
                <img
                  src={property.image}
                  alt={property.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <h3 className="text-xl font-semibold">{property.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-white py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl font-semibold text-indigo-700 dark:text-indigo-400 mb-6">About Us</h2>
          <p className="text-gray-600">
            Ghar_Nishchit is your trusted partner in rental property management. We provide seamless solutions to help you manage your properties efficiently and maximize your rental income.
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-6 py-12">
        <h2 className="text-3xl font-semibold text-indigo-700 dark:text-indigo-400 mb-8">Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-4 text-indigo-600 dark:text-indigo-300">Basic</h3>
            <p className="text-gray-600 mb-6">$19/month</p>
            <ul className="text-gray-600 mb-6">
              <li>Manage up to 5 properties</li>
              <li>Email support</li>
              <li>Basic analytics</li>
            </ul>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition">Choose Plan</button>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center border-2 border-emerald-600 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-4 text-indigo-600 dark:text-indigo-300">Pro</h3>
            <p className="text-gray-600 mb-6">$49/month</p>
            <ul className="text-gray-600 mb-6">
              <li>Manage up to 20 properties</li>
              <li>Priority email support</li>
              <li>Advanced analytics</li>
            </ul>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition">Choose Plan</button>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-4 text-indigo-600 dark:text-indigo-300">Enterprise</h3>
            <p className="text-gray-600 mb-6">Contact us</p>
            <ul className="text-gray-600 mb-6">
              <li>Unlimited properties</li>
              <li>Dedicated support</li>
              <li>Custom analytics</li>
            </ul>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition">Contact Sales</button>
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

      {/* Help Section */}
      <section id="help" className="bg-white py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl font-semibold text-indigo-700 dark:text-indigo-400 mb-6">Help</h2>
          <p className="text-gray-600">
            Need assistance? Contact our support team at <a href="mailto:support@ghar_nishchit.com" className="text-indigo-600 hover:underline">support@ghar_nishchit.com</a> or call us at (123) 456-7890.
          </p>
        </div>
      </section>
    </div>
  );
}
