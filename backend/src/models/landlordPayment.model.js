/**
 * landlordPayment.model.js
 * -------------------------
 * Mongoose schema for landlord subscription payments.
 * Mirrors the tenant Payment model but stores plan-level info
 * instead of property/due-date info.
 */
import mongoose from 'mongoose';

const landlordPaymentSchema = new mongoose.Schema(
  {
    // Who paid
    landlordId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },

    // What plan they bought
    planId: {
      type:    String,
      required: true,
    },
    planName: {
      type:    String,
      required: true,
      trim:    true,
    },

    // Pricing breakdown
    amount: {
      type:     Number,   // base price (excl. GST)
      required: true,
      min:      0,
    },
    gstAmount: {
      type:    Number,    // 18% of amount
      default: 0,
    },
    totalAmount: {
      type:     Number,   // amount + gstAmount (what Razorpay charged)
      required: true,
      min:      0,
    },

    // Payment state
    status: {
      type:    String,
      enum:    ['Pending', 'Paid', 'Failed'],
      default: 'Pending',
      index:   true,
    },
    paymentMethod: {
      type:    String,
      default: 'Razorpay',
    },
    paidAt: {
      type: Date,
    },

    // Razorpay IDs (populated on success)
    razorpayOrderId: {
      type:  String,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
    },

    note: {
      type:    String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model('LandlordPayment', landlordPaymentSchema);
