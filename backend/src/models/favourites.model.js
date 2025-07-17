import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  seeker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User who favorited
  properties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }]
});

export default mongoose.model('Favorite', favoriteSchema);