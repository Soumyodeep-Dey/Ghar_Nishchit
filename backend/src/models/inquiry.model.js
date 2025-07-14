import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema({
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  seeker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: { type: String },
  contactTime: { type: Date, default: Date.now }
});

export default mongoose.model('Inquiry', inquirySchema);
