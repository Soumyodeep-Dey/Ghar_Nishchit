import mongoose from 'mongoose';

const visitSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    visitDate: {
      type: Date,
      required: true,
    },
    visitTime: {
      type: String,   // e.g. "10:00"
      required: true,
    },
    message: {
      type: String,
      trim: true,
      default: '',
    },
    // Status flow: pending -> approved | rejected | cancelled
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },
    // Landlord can provide a reason when rejecting
    rejectionReason: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Index for fast per-tenant and per-landlord lookups
visitSchema.index({ tenant: 1, createdAt: -1 });
visitSchema.index({ landlord: 1, createdAt: -1 });
visitSchema.index({ property: 1 });

const Visit = mongoose.model('Visit', visitSchema);
export default Visit;
