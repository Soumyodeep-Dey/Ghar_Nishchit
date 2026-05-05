import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  sender:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName:{ type: String, default: '' },
  role:      { type: String, enum: ['tenant', 'landlord'], required: true },
  content:   { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const inquirySchema = new mongoose.Schema({
  property:    { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  seeker:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  landlord:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },   // auto-populated from property
  message:     { type: String },
  contactTime: { type: Date, default: Date.now },
  replies:     [replySchema]
});

export default mongoose.model('Inquiry', inquirySchema);

