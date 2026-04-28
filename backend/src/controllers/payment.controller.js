import Razorpay from 'razorpay';
import crypto  from 'crypto';
import Payment from '../models/payment.model.js';
import mongoose from 'mongoose';

// ── Razorpay client ──────────────────────────────────────────────────────────
let razorpay;
try {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error(
      '[Payment] ERROR: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing in .env'
    );
  } else {
    razorpay = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log('[Payment] Razorpay client initialised ✔');
  }
} catch (e) {
  console.error('[Payment] Failed to init Razorpay client:', e.message);
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 → POST /api/payments/create-order
// ─────────────────────────────────────────────────────────────────────────────
export const createOrder = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({
        message: 'Payment gateway not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to backend/.env and restart.',
      });
    }

    // JWT payload uses { userId, role } — see auth.controller.js
    const tenantId = req.user?.userId;
    if (!tenantId) {
      return res.status(401).json({ message: 'Unauthorised — userId missing from token' });
    }

    const { propertyId, amount, dueDate, note } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: 'amount is required and must be > 0' });
    }

    // Validate propertyId only if provided
    let safePropertyId = null;
    if (propertyId) {
      if (mongoose.Types.ObjectId.isValid(propertyId)) {
        safePropertyId = propertyId;
      } else {
        return res.status(400).json({ message: `Invalid propertyId: "${propertyId}"` });
      }
    }

    const amountInPaise = Math.round(Number(amount) * 100);

    const rzpOrder = await razorpay.orders.create({
      amount:   amountInPaise,
      currency: 'INR',
      receipt:  `rcpt_${tenantId}_${Date.now()}`,
      notes: {
        tenantId:   tenantId.toString(),
        propertyId: safePropertyId ? safePropertyId.toString() : 'manual',
      },
    });

    const paymentDoc = {
      tenantId:        tenantId,
      amount:          Number(amount),
      status:          'Pending',
      paymentMethod:   'Razorpay',
      razorpayOrderId: rzpOrder.id,
      note:            note ?? '',
    };
    if (safePropertyId) paymentDoc.propertyId = safePropertyId;
    if (dueDate)         paymentDoc.dueDate    = new Date(dueDate);

    const payment = await Payment.create(paymentDoc);

    return res.status(201).json({
      orderId:   rzpOrder.id,
      amount:    rzpOrder.amount,
      currency:  rzpOrder.currency,
      paymentId: payment._id,
      keyId:     process.env.RAZORPAY_KEY_ID,
    });

  } catch (err) {
    console.error('[createOrder] ERROR:', err.message);
    if (err.error) console.error('[createOrder] Razorpay API error:', JSON.stringify(err.error));
    return res.status(500).json({ message: 'Failed to create Razorpay order', detail: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 → POST /api/payments/verify
// ─────────────────────────────────────────────────────────────────────────────
export const verifyPayment = async (req, res) => {
  try {
    const tenantId = req.user?.userId;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentDbId,
      paymentMethod,
    } = req.body;

    const digest = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (digest !== razorpay_signature) {
      await Payment.findByIdAndUpdate(paymentDbId, { status: 'Failed' });
      return res.status(400).json({ message: 'Payment verification failed — signature mismatch.' });
    }

    const updated = await Payment.findOneAndUpdate(
      { _id: paymentDbId, tenantId },
      {
        status:            'Paid',
        paidAt:            new Date(),
        paymentMethod:     paymentMethod ?? 'Razorpay',
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId:   razorpay_order_id,
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Payment record not found' });
    return res.status(200).json({ message: 'Payment verified and recorded', payment: updated });

  } catch (err) {
    console.error('[verifyPayment] ERROR:', err.message);
    return res.status(500).json({ message: 'Payment verification error', detail: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// WEBHOOK → POST /api/payments/webhook
// ─────────────────────────────────────────────────────────────────────────────
export const handleWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature     = req.headers['x-razorpay-signature'];
    const bodyStr       = req.body.toString();

    const expectedSig = crypto
      .createHmac('sha256', webhookSecret)
      .update(bodyStr)
      .digest('hex');

    if (expectedSig !== signature) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const event = JSON.parse(bodyStr);

    if (event.event === 'payment.captured') {
      const rp = event.payload.payment.entity;
      await Payment.findOneAndUpdate(
        { razorpayOrderId: rp.order_id },
        { status: 'Paid', paidAt: new Date(rp.created_at * 1000), razorpayPaymentId: rp.id }
      );
    }
    if (event.event === 'payment.failed') {
      const rp = event.payload.payment.entity;
      await Payment.findOneAndUpdate({ razorpayOrderId: rp.order_id }, { status: 'Failed' });
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('[handleWebhook] ERROR:', err.message);
    return res.status(500).json({ message: 'Webhook processing failed' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// EXISTING FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────
export const getPayments = async (req, res) => {
  try {
    const tenantId = req.user?.userId;
    const payments = await Payment.find({ tenantId })
      .sort({ createdAt: -1 })
      .populate('propertyId', 'title location')
      .lean();

    const shaped = payments.map((p) => ({
      id:                p._id,
      amount:            p.amount,
      status:            p.status,
      paymentMethod:     p.paymentMethod,
      dueDate:           p.dueDate,
      paidAt:            p.paidAt,
      note:              p.note,
      property:          p.propertyId,
      razorpayOrderId:   p.razorpayOrderId,
      razorpayPaymentId: p.razorpayPaymentId,
      createdAt:         p.createdAt,
    }));

    return res.status(200).json(shaped);
  } catch (err) {
    console.error('[getPayments] ERROR:', err.message);
    return res.status(500).json({ message: 'Failed to fetch payments' });
  }
};

export const createPayment = async (req, res) => {
  try {
    const tenantId = req.user?.userId;
    const { propertyId, amount, status, paymentMethod, dueDate, note } = req.body;
    const payment = await Payment.create({
      tenantId,
      propertyId,
      amount,
      status,
      paymentMethod,
      dueDate,
      note,
      paidAt: status === 'Paid' ? new Date() : undefined,
    });
    return res.status(201).json(payment);
  } catch (err) {
    console.error('[createPayment] ERROR:', err.message);
    return res.status(500).json({ message: 'Failed to create payment' });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const tenantId = req.user?.userId;
    const { status } = req.body;
    const update = { status };
    if (status === 'Paid') update.paidAt = new Date();
    const payment = await Payment.findOneAndUpdate(
      { _id: req.params.id, tenantId },
      update,
      { new: true }
    );
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    return res.status(200).json(payment);
  } catch (err) {
    console.error('[updatePaymentStatus] ERROR:', err.message);
    return res.status(500).json({ message: 'Failed to update payment' });
  }
};

export const getPaymentStats = async (req, res) => {
  try {
    const tenantId = req.user?.userId;
    const all = await Payment.find({ tenantId }).lean();
    const stats = {
      total:           all.length,
      paid:            all.filter(p => p.status === 'Paid').length,
      pending:         all.filter(p => p.status === 'Pending').length,
      overdue:         all.filter(p => p.status === 'Overdue').length,
      failed:          all.filter(p => p.status === 'Failed').length,
      totalAmountPaid: all.filter(p => p.status === 'Paid').reduce((s, p) => s + p.amount, 0),
    };
    return res.status(200).json(stats);
  } catch (err) {
    console.error('[getPaymentStats] ERROR:', err.message);
    return res.status(500).json({ message: 'Failed to fetch payment stats' });
  }
};
