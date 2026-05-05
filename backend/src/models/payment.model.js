import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // propertyId is optional — manual payments (no linked property) are valid.
    // When populated from an upcoming payment, it will always be set.
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: false,
      default: null,
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
      enum: ['UPI', 'Bank Transfer', 'Cash', 'Card', 'Razorpay', 'Other'],
      default: 'Razorpay',
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

    // ── Razorpay Gateway Fields ─────────────────────────────────
    razorpayOrderId: {
      type: String,
      default: null,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
