
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building, Home, Briefcase, DollarSign, Phone, Image, Upload } from 'lucide-react';

const AddNewPropertyModal = ({ isOpen, onClose, isDark }) => {
  const [propertyData, setPropertyData] = useState({
    title: '',
    description: '',
    propertyType: 'apartment',
    address: '',
    contact: '',
    price: '',
    media: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPropertyData({ ...propertyData, [name]: value });
  };

  const handleFileChange = (e) => {
    setPropertyData({ ...propertyData, media: [...e.target.files] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('New Property Data:', propertyData);
    // Here you would typically send the data to your backend API
    onClose();
  };

  if (!isOpen) return null;

  const modalTheme = isDark
    ? {
        bg: 'bg-slate-800/90',
        border: 'border-slate-700/50',
        text: 'text-white',
        inputBg: 'bg-slate-700/50',
        inputBorder: 'border-slate-600/50',
        inputPlaceholder: 'placeholder-slate-400',
        focusBorder: 'focus:border-cyan-500',
        buttonPrimaryBg: 'bg-gradient-to-r from-cyan-500 to-indigo-600',
        buttonPrimaryText: 'text-white',
        buttonSecondaryBg: 'bg-slate-700/50',
        buttonSecondaryText: 'text-slate-300',
        buttonHover: 'hover:brightness-110',
      }
    : {
        bg: 'bg-white/90',
        border: 'border-indigo-200/50',
        text: 'text-gray-900',
        inputBg: 'bg-white/70',
        inputBorder: 'border-indigo-300/50',
        inputPlaceholder: 'placeholder-indigo-400',
        focusBorder: 'focus:border-indigo-500',
        buttonPrimaryBg: 'bg-gradient-to-r from-indigo-600 to-purple-600',
        buttonPrimaryText: 'text-white',
        buttonSecondaryBg: 'bg-indigo-100/60',
        buttonSecondaryText: 'text-indigo-700',
        buttonHover: 'hover:brightness-105',
      };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`${modalTheme.bg} ${modalTheme.border} border rounded-2xl w-full max-w-2xl p-6 shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${modalTheme.text}`}>Add New Property</h2>
          <motion.button whileHover={{ scale: 1.1, rotate: 90 }} onClick={onClose}>
            <X className={`w-6 h-6 ${modalTheme.text}`} />
          </motion.button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${modalTheme.text}`}>Title</label>
              <div className="relative">
                <Building className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${modalTheme.text}`} />
                <input
                  type="text"
                  name="title"
                  value={propertyData.title}
                  onChange={handleChange}
                  className={`w-full p-3 pl-10 rounded-lg ${modalTheme.inputBg} ${modalTheme.inputBorder} border ${modalTheme.text} ${modalTheme.inputPlaceholder} ${modalTheme.focusBorder} focus:outline-none transition-colors`}
                  placeholder="e.g., Sunny Apartment"
                  required
                />
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${modalTheme.text}`}>Property Type</label>
              <div className="relative">
                <Home className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${modalTheme.text}`} />
                <select
                  name="propertyType"
                  value={propertyData.propertyType}
                  onChange={handleChange}
                  className={`w-full p-3 pl-10 rounded-lg ${modalTheme.inputBg} ${modalTheme.inputBorder} border ${modalTheme.text} ${modalTheme.focusBorder} focus:outline-none transition-colors appearance-none`}
                  required
                >
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                </select>
              </div>
            </div>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${modalTheme.text}`}>Description</label>
            <textarea
              name="description"
              value={propertyData.description}
              onChange={handleChange}
              className={`w-full p-3 rounded-lg ${modalTheme.inputBg} ${modalTheme.inputBorder} border ${modalTheme.text} ${modalTheme.inputPlaceholder} ${modalTheme.focusBorder} focus:outline-none transition-colors`}
              placeholder="Describe the property..."
              rows="3"
              required
            ></textarea>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${modalTheme.text}`}>Address</label>
             <div className="relative">
                <Briefcase className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${modalTheme.text}`} />
                <input
                  type="text"
                  name="address"
                  value={propertyData.address}
                  onChange={handleChange}
                  className={`w-full p-3 pl-10 rounded-lg ${modalTheme.inputBg} ${modalTheme.inputBorder} border ${modalTheme.text} ${modalTheme.inputPlaceholder} ${modalTheme.focusBorder} focus:outline-none transition-colors`}
                  placeholder="123 Main St, Anytown, USA"
                  required
                />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${modalTheme.text}`}>Contact Details</label>
              <div className="relative">
                <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${modalTheme.text}`} />
                <input
                  type="text"
                  name="contact"
                  value={propertyData.contact}
                  onChange={handleChange}
                  className={`w-full p-3 pl-10 rounded-lg ${modalTheme.inputBg} ${modalTheme.inputBorder} border ${modalTheme.text} ${modalTheme.inputPlaceholder} ${modalTheme.focusBorder} focus:outline-none transition-colors`}
                  placeholder="e.g., +1 234 567 890"
                  required
                />
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${modalTheme.text}`}>Listing Price ($)</label>
              <div className="relative">
                <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${modalTheme.text}`} />
                <input
                  type="number"
                  name="price"
                  value={propertyData.price}
                  onChange={handleChange}
                  className={`w-full p-3 pl-10 rounded-lg ${modalTheme.inputBg} ${modalTheme.inputBorder} border ${modalTheme.text} ${modalTheme.inputPlaceholder} ${modalTheme.focusBorder} focus:outline-none transition-colors`}
                  placeholder="e.g., 2500"
                  required
                />
              </div>
            </div>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${modalTheme.text}`}>Media Uploads</label>
            <div className={`relative border-2 border-dashed ${modalTheme.inputBorder} rounded-lg p-6 text-center`}>
              <Image className={`mx-auto w-12 h-12 ${modalTheme.text}`} />
              <p className={`mt-2 ${modalTheme.text}`}>Drag & drop files here, or click to select files</p>
              <input
                type="file"
                name="media"
                multiple
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            {propertyData.media.length > 0 && (
              <div className="mt-4">
                <h4 className={`${modalTheme.text} font-semibold`}>Selected files:</h4>
                <ul className="list-disc list-inside">
                  {propertyData.media.map((file, index) => (
                    <li key={index} className={modalTheme.text}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${modalTheme.buttonSecondaryBg} ${modalTheme.buttonSecondaryText} ${modalTheme.buttonHover}`}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${modalTheme.buttonPrimaryBg} ${modalTheme.buttonPrimaryText} ${modalTheme.buttonHover}`}
            >
              <div className="flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Add Property
              </div>
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddNewPropertyModal;
