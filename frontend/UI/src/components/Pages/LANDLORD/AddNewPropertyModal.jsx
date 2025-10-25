
import React, { useEffect, useState } from 'react';
import { X, Building, Home, DollarSign, Image, Upload, MapPin, Bed, Bath } from 'lucide-react';

// Accept mode='add'|'edit', property to edit, and onSave callback
const AddNewPropertyModal = ({ isOpen, onClose, isDark, mode = 'add', property = null, onSave = null }) => {
  const [propertyData, setPropertyData] = useState({
    title: '',
    description: '',
    propertyType: 'apartment',
    address: {
      street: '',
      city: '',
      state: '',
      zip: ''
    },
    price: '',
    bedrooms: 1,
    bathrooms: 1,
    images: [],
    available: true,
  });

  // Populate form when editing
  useEffect(() => {
    if (mode === 'edit' && property) {
      // Map incoming property fields to modal shape where possible
      setPropertyData(prev => ({
        ...prev,
        title: property.title || '',
        description: property.description || '',
        propertyType: property.propertyType || prev.propertyType,
        address: property.address || prev.address,
        price: property.rent || property.price || prev.price,
        bedrooms: property.bedrooms ?? prev.bedrooms,
        bathrooms: property.bathrooms ?? prev.bathrooms,
        images: property.images || prev.images,
        available: property.status ? property.status === 'Available' : prev.available,
      }));
    }
  }, [mode, property]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setPropertyData({
        ...propertyData,
        address: { ...propertyData.address, [addressField]: value }
      });
    } else {
      setPropertyData({ ...propertyData, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    setPropertyData({ ...propertyData, images: [...e.target.files] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Transform data to match backend schema
    const transformedData = {
      title: propertyData.title,
      description: propertyData.description,
      propertyType: propertyData.propertyType,
      address: propertyData.address,
      price: parseFloat(propertyData.price) || 0,
      bedrooms: parseInt(propertyData.bedrooms) || 0,
      bathrooms: parseInt(propertyData.bathrooms) || 0,
      area: 0, // Default area - can be added to form later
      images: propertyData.images.map(img => typeof img === 'string' ? img : URL.createObjectURL(img)), // Convert File objects to URLs
      amenities: [], // Default empty - can be added to form later
      available: propertyData.available,
      status: propertyData.available ? 'Available' : 'Occupied',
      rating: 4.5, // Default rating
      trend: null, // Default trend
      contact: {}, // Default contact info
      policies: { // Default policies
        petFriendly: false,
        smokingAllowed: false,
        furnished: false
      }
    };

    if (typeof onSave === 'function') onSave(transformedData);
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
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={`${modalTheme.bg} ${modalTheme.border} border rounded-2xl w-full max-w-2xl p-6 shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${modalTheme.text}`}>{mode === 'edit' ? 'Edit Property' : 'Add New Property'}</h2>
          <button className="hover:scale-110 hover:rotate-90 transition-transform" onClick={onClose}>
            <X className={`w-6 h-6 ${modalTheme.text}`} />
          </button>
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
                  <option value="room">Room</option>
                  <option value="commercial">Commercial</option>
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
          <div className="space-y-4">
            <label className={`block text-sm font-medium mb-2 ${modalTheme.text}`}>Address</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${modalTheme.text}`} />
                <input
                  type="text"
                  name="address.street"
                  value={propertyData.address.street}
                  onChange={handleChange}
                  className={`w-full p-3 pl-10 rounded-lg ${modalTheme.inputBg} ${modalTheme.inputBorder} border ${modalTheme.text} ${modalTheme.inputPlaceholder} ${modalTheme.focusBorder} focus:outline-none transition-colors`}
                  placeholder="Street Address"
                  required
                />
              </div>
              <div className="relative">
                <input
                  type="text"
                  name="address.city"
                  value={propertyData.address.city}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-lg ${modalTheme.inputBg} ${modalTheme.inputBorder} border ${modalTheme.text} ${modalTheme.inputPlaceholder} ${modalTheme.focusBorder} focus:outline-none transition-colors`}
                  placeholder="City"
                  required
                />
              </div>
              <div className="relative">
                <input
                  type="text"
                  name="address.state"
                  value={propertyData.address.state}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-lg ${modalTheme.inputBg} ${modalTheme.inputBorder} border ${modalTheme.text} ${modalTheme.inputPlaceholder} ${modalTheme.focusBorder} focus:outline-none transition-colors`}
                  placeholder="State"
                  required
                />
              </div>
              <div className="relative">
                <input
                  type="text"
                  name="address.zip"
                  value={propertyData.address.zip}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-lg ${modalTheme.inputBg} ${modalTheme.inputBorder} border ${modalTheme.text} ${modalTheme.inputPlaceholder} ${modalTheme.focusBorder} focus:outline-none transition-colors`}
                  placeholder="ZIP Code"
                  required
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${modalTheme.text}`}>Price ($)</label>
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
                  min="0"
                />
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${modalTheme.text}`}>Bedrooms</label>
              <div className="relative">
                <Bed className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${modalTheme.text}`} />
                <input
                  type="number"
                  name="bedrooms"
                  value={propertyData.bedrooms}
                  onChange={handleChange}
                  className={`w-full p-3 pl-10 rounded-lg ${modalTheme.inputBg} ${modalTheme.inputBorder} border ${modalTheme.text} ${modalTheme.inputPlaceholder} ${modalTheme.focusBorder} focus:outline-none transition-colors`}
                  placeholder="1"
                  min="0"
                  max="10"
                />
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${modalTheme.text}`}>Bathrooms</label>
              <div className="relative">
                <Bath className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${modalTheme.text}`} />
                <input
                  type="number"
                  name="bathrooms"
                  value={propertyData.bathrooms}
                  onChange={handleChange}
                  className={`w-full p-3 pl-10 rounded-lg ${modalTheme.inputBg} ${modalTheme.inputBorder} border ${modalTheme.text} ${modalTheme.inputPlaceholder} ${modalTheme.focusBorder} focus:outline-none transition-colors`}
                  placeholder="1"
                  min="0"
                  max="10"
                />
              </div>
            </div>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${modalTheme.text}`}>Property Images</label>
            <div className={`relative border-2 border-dashed ${modalTheme.inputBorder} rounded-lg p-6 text-center`}>
              <Image className={`mx-auto w-12 h-12 ${modalTheme.text}`} />
              <p className={`mt-2 ${modalTheme.text}`}>Drag & drop images here, or click to select files</p>
              <input
                type="file"
                name="images"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            {propertyData.images.length > 0 && (
              <div className="mt-4">
                <h4 className={`${modalTheme.text} font-semibold`}>Selected images:</h4>
                <ul className="list-disc list-inside">
                  {propertyData.images.map((file, index) => (
                    <li key={index} className={modalTheme.text}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="available"
              name="available"
              checked={propertyData.available}
              onChange={(e) => setPropertyData({ ...propertyData, available: e.target.checked })}
              className="w-4 h-4 rounded border"
            />
            <label htmlFor="available" className={`text-sm font-medium ${modalTheme.text}`}>
              Property is available for rent
            </label>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 active:scale-95 ${modalTheme.buttonSecondaryBg} ${modalTheme.buttonSecondaryText} ${modalTheme.buttonHover}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 active:scale-95 ${modalTheme.buttonPrimaryBg} ${modalTheme.buttonPrimaryText} ${modalTheme.buttonHover}`}
            >
              <div className="flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                {mode === 'edit' ? 'Update Property' : 'Add Property'}
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewPropertyModal;
