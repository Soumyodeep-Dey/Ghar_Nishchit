import Razorpay from 'razorpay';
import crypto  from 'crypto';
import Payment from '../models/payment.model.js';

// ── Razorpay client (keys come from environment — never hardcoded) ──
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ───────────────────────────────────────────────────────────────
// STEP 1 →  POST /api/payments/create-order
// Tenant hits this first. We create a Razorpay order and save a
// Pending Payment document so we can update it after verification.
// ───────────────────────────────────────────────────────────────
export const createOrder = async (req, res) => {
  try {
    const { propertyId, amount, dueDate, note } = req.body;

    if (!propertyId || !amount) {
      return res.status(400).json({ message: 'propertyId and amount are required' });
    }

    // Razorpay requires amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(Number(amount) * 100);

    const rzpOrder = await razorpay.orders.create({
      amount:   amountInPaise,
      currency: 'INR',
      receipt:  `rcpt_${req.user.id}_${Date.now()}`,
      notes: {
        tenantId:   req.user.id.toString(),
        propertyId: propertyId.toString(),
      },
    });

    // Save a Pending record — we update it to 'Paid' after signature verification
    const payment = await Payment.create({
      tenantId:        req.user.id,
      propertyId,
      amount:          Number(amount),
      status:          'Pending',
      paymentMethod:   'Razorpay',
      dueDate:         dueDate ?? undefined,
      note:            note    ?? '',
      razorpayOrderId: rzpOrder.id,
    });

    res.status(201).json({
      orderId:   rzpOrder.id,        // passed to Razorpay checkout on frontend
      amount:    rzpOrder.amount,    // in paise
      currency:  rzpOrder.currency,
      paymentId: payment._id,        // our internal DB id — sent back in verify call
      keyId:     process.env.RAZORPAY_KEY_ID,  // public key — safe to expose
    });
  } catch (err) {
    console.error('createOrder error:', err);
    res.status(500).json({ message: 'Failed to create Razorpay order' });
  }
};

// ───────────────────────────────────────────────────────────────
// STEP 2 →  POST /api/payments/verify
// Called by the frontend after the user completes payment on the
// Razorpay popup. HMAC-SHA256 signature must match — DO NOT SKIP.
// ───────────────────────────────────────────────────────────────
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentDbId,
      paymentMethod,   // 'UPI' | 'Card' | 'Bank Transfer' | 'Razorpay'
    } = req.body;

    // ── HMAC-SHA256 Verification ──
    const digest = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (digest !== razorpay_signature) {
      await Payment.findByIdAndUpdate(paymentDbId, { status: 'Failed' });
      return res.status(400).json({ message: 'Payment verification failed. Signature mismatch.' });
    }

    // Signature valid → mark as Paid
    const updated = await Payment.findOneAndUpdate(
      { _id: paymentDbId, tenantId: req.user.id },
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

    res.status(200).json({ message: 'Payment verified and recorded', payment: updated });
  } catch (err) {
    console.error('verifyPayment error:', err);
    res.status(500).json({ message: 'Payment verification error' });
  }
};

// ───────────────────────────────────────────────────────────────
// WEBHOOK  →  POST /api/payments/webhook
// Razorpay calls this server-to-server after payment events.
// Acts as a safety net when browser closes before /verify is called.
// Register URL in: Razorpay Dashboard → Webhooks → Add New Webhook
// Events: payment.captured, payment.failed
// ───────────────────────────────────────────────────────────────
export const handleWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature     = req.headers['x-razorpay-signature'];

    // req.body is a raw Buffer here (use express.raw middleware on this route)
    const bodyStr = req.body.toString();

    const expectedSig = crypto
      .createHmac('sha256', webhookSecret)
      .update(bodyStr)
      .digest('hex');

    if (expectedSig !== signature) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const event = JSON.parse(bodyStr);

    if (event.event === 'payment.captured') {
      const rPayment = event.payload.payment.entity;
      await Payment.findOneAndUpdate(
        { razorpayOrderId: rPayment.order_id },
        {
          status:            'Paid',
          paidAt:            new Date(rPayment.created_at * 1000),
          razorpayPaymentId: rPayment.id,
        }
      );
    }

    if (event.event === 'payment.failed') {
      const rPayment = event.payload.payment.entity;
      await Payment.findOneAndUpdate(
        { razorpayOrderId: rPayment.order_id },
        { status: 'Failed' }
      );
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
};

// ───────────────────────────────────────────────────────────────
// EXISTING FUNCTIONS — kept exactly as before, only getPayments
// updated to also return razorpayOrderId in the shaped response.
// ───────────────────────────────────────────────────────────────
export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ tenantId: req.user.id })
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

    res.status(200).json(shaped);
  } catch (err) {
    console.error('getPayments error:', err);
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
};

export const createPayment = async (req, res) => {
  try {
    const { propertyId, amount, status, paymentMethod, dueDate, note } = req.body;
    const payment = await Payment.create({
      tenantId: req.user.id,
      propertyId,
      amount,
      status,
      paymentMethod,
      dueDate,
      note,
      paidAt: status === 'Paid' ? new Date() : undefined,
    });
    res.status(201).json(payment);
  } catch (err) {
    console.error('createPayment error:', err);
    res.status(500).json({ message: 'Failed to create payment' });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const update = { status };
    if (status === 'Paid') update.paidAt = new Date();

    const payment = await Payment.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.id },
      update,
      { new: true }
    );
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.status(200).json(payment);
  } catch (err) {
    console.error('updatePaymentStatus error:', err);
    res.status(500).json({ message: 'Failed to update payment' });
  }
};

export const getPaymentStats = async (req, res) => {
  try {
    const all = await Payment.find({ tenantId: req.user.id }).lean();
    const stats = {
      total:   all.length,
      paid:    all.filter((p) => p.status === 'Paid').length,
      pending: all.filter((p) => p.status === 'Pending').length,
      overdue: all.filter((p) => p.status === 'Overdue').length,
      failed:  all.filter((p) => p.status === 'Failed').length,
      totalAmountPaid: all
        .filter((p) => p.status === 'Paid')
        .reduce((sum, p) => sum + p.amount, 0),
    };
    res.status(200).json(stats);
  } catch (err) {
    console.error('getPaymentStats error:', err);
    res.status(500).json({ message: 'Failed to fetch payment stats' });
  }
};
