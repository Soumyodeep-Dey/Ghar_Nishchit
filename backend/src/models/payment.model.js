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
      // 'Razorpay' added to support gateway payments
      enum: ['UPI', 'Bank Transfer', 'Cash', 'Card', 'Razorpay', 'Other'],
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

    // ── Razorpay Gateway Fields ───────────────────────────────
    // Stored so we can verify payments and reconcile via webhook
    razorpayOrderId: {
      type: String,
      default: null,
      index: true, // fast lookup in webhook handler
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    // ─────────────────────────────────────────────────────────
  },
  { timestamps: true }
);

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
