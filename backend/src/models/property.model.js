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
  propertyType: { type: String, enum: ['apartment', 'house', 'room', 'commercial'] },
  bedrooms: Number,
  bathrooms: Number,
  images: [String],
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  available: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

propertySchema.index({ location: '2dsphere' });

export default mongoose.model('Property', propertySchema);
