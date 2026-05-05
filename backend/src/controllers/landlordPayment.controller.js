/**
 * landlordPayment.controller.js
 * ------------------------------
 * Handles Razorpay subscription payments for landlords.
 * Mirrors the existing payment.controller.js (tenant) but uses the
 * LandlordPayment model and stores plan-level metadata.
 *
 * Routes (see landlordPayment.routes.js):
 *   POST /api/landlord-payments/create-order  → createLandlordOrder
 *   POST /api/landlord-payments/verify        → verifyLandlordPayment
 *   GET  /api/landlord-payments               → getLandlordPayments
 *   GET  /api/landlord-payments/stats         → getLandlordPaymentStats
 *   POST /api/landlord-payments/webhook       → handleLandlordWebhook
 *     (webhook is mounted BEFORE express.json() in app.js — see NOTE below)
 */
import Razorpay         from 'razorpay';
import crypto           from 'crypto';
import LandlordPayment  from '../models/landlordPayment.model.js';

// ── Razorpay client (reuses the same key pair as tenant gateway) ─────────────
let razorpay;
try {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error('[LandlordPayment] ERROR: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing in .env');
  } else {
    razorpay = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log('[LandlordPayment] Razorpay client initialised ✔');
  }
} catch (e) {
  console.error('[LandlordPayment] Failed to init Razorpay client:', e.message);
}

// ── Helper: 18% GST ──────────────────────────────────────────────────────────
function calcGST(baseAmount) {
  const gst   = parseFloat((baseAmount * 0.18).toFixed(2));
  const total = parseFloat((baseAmount + gst).toFixed(2));
  return { gst, total };
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 → POST /api/landlord-payments/create-order
// ─────────────────────────────────────────────────────────────────────────────
export const createLandlordOrder = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({
        message: 'Payment gateway not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to backend/.env and restart.',
      });
    }

    const landlordId = req.user?.userId;
    if (!landlordId) {
      return res.status(401).json({ message: 'Unauthorised — userId missing from token' });
    }

    const { planId, planName, amount } = req.body;

    if (!planId || !planName) {
      return res.status(400).json({ message: 'planId and planName are required' });
    }
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: 'amount is required and must be > 0' });
    }

    // amount coming from the frontend is already the TOTAL (base + 18% GST)
    // because LandlordRazorpayCheckout.jsx calculates and passes total.
    const totalAmount   = Number(amount);
    const baseAmount    = parseFloat((totalAmount / 1.18).toFixed(2));
    const { gst }       = calcGST(baseAmount);
    const amountInPaise = Math.round(totalAmount * 100);

    const receipt = `lp_${Date.now().toString(36)}_${String(landlordId).slice(-6)}`.slice(0, 40);

    const rzpOrder = await razorpay.orders.create({
      amount:   amountInPaise,
      currency: 'INR',
      receipt,
      notes: {
        landlordId: landlordId.toString(),
        planId,
        planName,
      },
    });

    // Persist a Pending record in MongoDB
    const payment = await LandlordPayment.create({
      landlordId,
      planId,
      planName,
      amount:          baseAmount,
      gstAmount:       gst,
      totalAmount,
      status:          'Pending',
      paymentMethod:   'Razorpay',
      razorpayOrderId: rzpOrder.id,
    });

    return res.status(201).json({
      orderId:   rzpOrder.id,
      amount:    rzpOrder.amount,    // paise
      currency:  rzpOrder.currency,
      paymentId: payment._id,        // our internal DB id — sent back to frontend
      keyId:     process.env.RAZORPAY_KEY_ID,
    });

  } catch (err) {
    const msg = err?.error?.description || err?.error?.reason || err?.message || 'Unknown error';
    console.error('[createLandlordOrder] ERROR:', msg);
    if (err?.error) console.error('[createLandlordOrder] Razorpay API error:', JSON.stringify(err.error));
    return res.status(500).json({ message: 'Failed to create Razorpay order', detail: msg });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 → POST /api/landlord-payments/verify
// ─────────────────────────────────────────────────────────────────────────────
export const verifyLandlordPayment = async (req, res) => {
  try {
    const landlordId = req.user?.userId;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentDbId,
      paymentMethod,
      planId,
      planName,
    } = req.body;

    // HMAC-SHA256 signature check — same algorithm as tenant flow
    const digest = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (digest !== razorpay_signature) {
      await LandlordPayment.findByIdAndUpdate(paymentDbId, { status: 'Failed' });
      return res.status(400).json({ message: 'Payment verification failed — signature mismatch.' });
    }

    const updated = await LandlordPayment.findOneAndUpdate(
      { _id: paymentDbId, landlordId },
      {
        status:            'Paid',
        paidAt:            new Date(),
        paymentMethod:     paymentMethod ?? 'Razorpay',
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId:   razorpay_order_id,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    return res.status(200).json({
      message: 'Subscription payment verified and activated',
      payment: updated,
    });

  } catch (err) {
    console.error('[verifyLandlordPayment] ERROR:', err.message);
    return res.status(500).json({ message: 'Payment verification error', detail: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// WEBHOOK → POST /api/landlord-payments/webhook
// NOTE: Mount this BEFORE express.json() in app.js so the raw body is intact.
// Example in app.js:
//   import landlordPaymentRouter from './routes/landlordPayment.routes.js';
//   app.post('/api/landlord-payments/webhook',
//     express.raw({ type: 'application/json' }),
//     handleLandlordWebhook
//   );
// ─────────────────────────────────────────────────────────────────────────────
export const handleLandlordWebhook = async (req, res) => {
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
      await LandlordPayment.findOneAndUpdate(
        { razorpayOrderId: rp.order_id },
        { status: 'Paid', paidAt: new Date(rp.created_at * 1000), razorpayPaymentId: rp.id }
      );
    }
    if (event.event === 'payment.failed') {
      const rp = event.payload.payment.entity;
      await LandlordPayment.findOneAndUpdate(
        { razorpayOrderId: rp.order_id },
        { status: 'Failed' }
      );
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('[handleLandlordWebhook] ERROR:', err.message);
    return res.status(500).json({ message: 'Webhook processing failed' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/landlord-payments  — landlord's own payment history
// ─────────────────────────────────────────────────────────────────────────────
export const getLandlordPayments = async (req, res) => {
  try {
    const landlordId = req.user?.userId;
    const payments   = await LandlordPayment.find({ landlordId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(payments);
  } catch (err) {
    console.error('[getLandlordPayments] ERROR:', err.message);
    return res.status(500).json({ message: 'Failed to fetch landlord payments' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/landlord-payments/stats
// ─────────────────────────────────────────────────────────────────────────────
export const getLandlordPaymentStats = async (req, res) => {
  try {
    const landlordId = req.user?.userId;
    const all        = await LandlordPayment.find({ landlordId }).lean();

    const stats = {
      total:              all.length,
      paid:               all.filter(p => p.status === 'Paid').length,
      pending:            all.filter(p => p.status === 'Pending').length,
      failed:             all.filter(p => p.status === 'Failed').length,
      totalAmountSpent:   all.filter(p => p.status === 'Paid')
                            .reduce((s, p) => s + p.totalAmount, 0),
      activePlan:         all.find(p => p.status === 'Paid')?.planName ?? null,
    };

    return res.status(200).json(stats);
  } catch (err) {
    console.error('[getLandlordPaymentStats] ERROR:', err.message);
    return res.status(500).json({ message: 'Failed to fetch landlord payment stats' });
  }
};
