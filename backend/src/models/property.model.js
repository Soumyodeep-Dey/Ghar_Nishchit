import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String
  },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number] // [longitude, latitude]
  },
  price: { type: Number, required: true },
  propertyType: { type: String, enum: ['apartment', 'house', 'room', 'commercial', 'studio'] },
  bedrooms: Number,
  bathrooms: Number,
  area: Number, // square footage
  images: [String],
  amenities: [String], // e.g., ['wifi', 'parking', 'ac', 'tv', 'gym', 'pool']
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  available: { type: Boolean, default: true },
  status: { type: String, enum: ['Available', 'Occupied', 'Maintenance'], default: 'Available' },
  rating: { type: Number, min: 0, max: 5, default: 4.5 },
  trend: { type: String, enum: ['up', 'down', null], default: null },
  contact: {
    phone: String,
    email: String,
    website: String
  },
  policies: {
    petFriendly: { type: Boolean, default: false },
    smokingAllowed: { type: Boolean, default: false },
    furnished: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

propertySchema.index({ location: '2dsphere' });

export default mongoose.model('Property', propertySchema);