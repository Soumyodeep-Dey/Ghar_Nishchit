import mongoose from 'mongoose';

const contractSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  type: { type: String, enum: ['lease', 'rental', 'sublease'], default: 'lease' },
  duration: { type: Number, required: true }, // in months
  rentAmount: { type: Number, required: true },
  securityDeposit: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'active', 'completed', 'cancelled'], default: 'pending' },
  terms: {
    petsAllowed: { type: Boolean, default: false },
    smokingAllowed: { type: Boolean, default: false },
    sublettingAllowed: { type: Boolean, default: false },
    earlyTermination: { type: Boolean, default: false }
  },
  customClauses: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Contract', contractSchema);
