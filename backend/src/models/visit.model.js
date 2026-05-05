import mongoose from 'mongoose';

const visitSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  type: { type: String, enum: ['in-person', 'virtual'], default: 'in-person' },
  notes: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'scheduled', 'completed', 'cancelled'], default: 'scheduled' }
}, { timestamps: true });

export default mongoose.model('Visit', visitSchema);
