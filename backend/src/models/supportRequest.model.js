import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  sender:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  senderName: { type: String, default: '' },
  role:       { type: String, enum: ['tenant', 'landlord', 'admin'], required: true },
  content:    { type: String, required: true },
  createdAt:  { type: Date, default: Date.now },
});

const supportRequestSchema = new mongoose.Schema(
  {
    user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userName:  { type: String, default: '' },
    userEmail: { type: String, default: '' },
    userRole:  { type: String, enum: ['tenant', 'landlord'], required: true },
    subject:   { type: String, required: true, trim: true },
    message:   { type: String, required: true, trim: true },
    category:  {
      type: String,
      enum: ['general', 'account', 'payment', 'technical', 'other'],
      default: 'general',
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    replies: [replySchema],
  },
  { timestamps: true }
);

export default mongoose.model('SupportRequest', supportRequestSchema);
