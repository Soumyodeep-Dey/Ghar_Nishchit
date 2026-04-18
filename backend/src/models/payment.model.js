import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Paid', 'Pending', 'Overdue', 'Failed'],
      default: 'Pending',
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'Bank Transfer', 'Cash', 'Card', 'Other'],
      default: 'UPI',
    },
    dueDate: {
      type: Date,
    },
    paidAt: {
      type: Date,
    },
    note: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
