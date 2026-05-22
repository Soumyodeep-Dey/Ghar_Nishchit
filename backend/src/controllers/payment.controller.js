import Razorpay from 'razorpay';
import crypto  from 'crypto';
import Payment from '../models/payment.model.js';
import Property from '../models/property.model.js';
import Contract from '../models/contract.model.js';
import Notification from '../models/notification.model.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';
import { query as neonQuery } from '../db/neon.js';

const resolveUserId = (user) => {
  if (!user) return null;
  return user._id || user.id || user.userId || null;
};

/** Notify landlord when a tenant completes a rent payment */
const notifyLandlordOnTenantPayment = async (payment) => {
  try {
    let landlordId = null;
    let propertyTitle = 'your property';

    if (payment.propertyId) {
      const property = await Property.findById(payment.propertyId).select('postedBy title').lean();
      if (property) {
        landlordId = property.postedBy;
        propertyTitle = property.title || propertyTitle;
      }
    }

    if (!landlordId && payment.tenantId) {
      const contract = await Contract.findOne({
        tenant: payment.tenantId,
        status: 'active',
      })
        .sort({ updatedAt: -1 })
        .lean();
      if (contract) landlordId = contract.landlord;
      if (contract?.property) {
        const prop = await Property.findById(contract.property).select('title').lean();
        if (prop?.title) propertyTitle = prop.title;
      }
    }

    if (!landlordId) return;

    const tenant = await User.findById(payment.tenantId).select('name').lean();
    const tenantName = tenant?.name || 'A tenant';
    const amountStr = Number(payment.amount || 0).toLocaleString('en-IN');

    await Notification.create({
      userId: landlordId,
      title: 'Rent Payment Received',
      message: `${tenantName} paid ₹${amountStr} for ${propertyTitle}.`,
      type: 'payment',
      relatedId: payment._id,
    });
  } catch (e) {
    console.warn('[Payment] landlord notification failed:', e.message);
  }
};

// ── NeonDB Sync Helper ────────────────────────────────────────────────────────
const syncPaymentToNeon = async (p) => {
  try {
    await neonQuery(
      `INSERT INTO payments (
         id, tenant_id, property_id, amount, status, payment_method,
         due_date, paid_at, note, razorpay_order_id, razorpay_payment_id,
         created_at, updated_at
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       ON CONFLICT (id) DO UPDATE SET
         status              = EXCLUDED.status,
         payment_method      = EXCLUDED.payment_method,
         paid_at             = EXCLUDED.paid_at,
         razorpay_order_id   = EXCLUDED.razorpay_order_id,
         razorpay_payment_id = EXCLUDED.razorpay_payment_id,
         updated_at          = NOW()`,
      [
        p._id.toString(),
        p.tenantId?.toString() || null,
        p.propertyId?.toString() || null,
        Number(p.amount),
        p.status || 'Pending',
        p.paymentMethod || 'Razorpay',
        p.dueDate  ? new Date(p.dueDate).toISOString()  : null,
        p.paidAt   ? new Date(p.paidAt).toISOString()   : null,
        p.note || '',
        p.razorpayOrderId   || null,
        p.razorpayPaymentId || null,
        p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
        p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString(),
      ]
    );
  } catch (e) {
    console.warn('[NeonDB] payment sync warning:', e.message);
  }
};


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

    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        message: 'Request body is missing or invalid JSON. Ensure Content-Type: application/json and that the server has JSON parsing enabled.',
      });
    }

    const { propertyId, amount, dueDate, note } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: 'amount is required and must be > 0' });
    }

    // Validate propertyId only if provided, else attempt fallback to active contract property
    let safePropertyId = null;
    if (propertyId) {
      if (mongoose.Types.ObjectId.isValid(propertyId)) {
        safePropertyId = propertyId;
      } else {
        return res.status(400).json({ message: `Invalid propertyId: "${propertyId}"` });
      }
    } else {
      try {
        const activeContract = await Contract.findOne({ tenant: tenantId, status: 'active' }).select('property').lean();
        if (activeContract && activeContract.property) {
          safePropertyId = activeContract.property;
        }
      } catch (err) {
        console.warn('[createOrder] Fallback contract lookup warning:', err.message);
      }
    }

    const amountInPaise = Math.round(Number(amount) * 100);
    const receipt = `r_${Date.now().toString(36)}_${String(tenantId).slice(-6)}`.slice(0, 40);

    const rzpOrder = await razorpay.orders.create({
      amount:   amountInPaise,
      currency: 'INR',
      receipt,
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

    // Dual-write to NeonDB
    await syncPaymentToNeon(payment);

    return res.status(201).json({
      orderId:   rzpOrder.id,
      amount:    rzpOrder.amount,
      currency:  rzpOrder.currency,
      paymentId: payment._id,
      keyId:     process.env.RAZORPAY_KEY_ID,
    });

  } catch (err) {
    const msg =
      err?.error?.description ||
      err?.error?.reason ||
      err?.message ||
      'Unknown error';
    console.error('[createOrder] ERROR:', msg);
    if (err?.error) console.error('[createOrder] Razorpay API error:', JSON.stringify(err.error));
    return res.status(500).json({ message: 'Failed to create Razorpay order', detail: msg });
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

    // Dual-write to NeonDB
    await syncPaymentToNeon(updated);
    await notifyLandlordOnTenantPayment(updated);

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
      const captured = await Payment.findOneAndUpdate(
        { razorpayOrderId: rp.order_id },
        { status: 'Paid', paidAt: new Date(rp.created_at * 1000), razorpayPaymentId: rp.id },
        { new: true }
      );
      if (captured) {
        await syncPaymentToNeon(captured);
        await notifyLandlordOnTenantPayment(captured);
      }
    }
    if (event.event === 'payment.failed') {
      const rp = event.payload.payment.entity;
      const failed = await Payment.findOneAndUpdate(
        { razorpayOrderId: rp.order_id },
        { status: 'Failed' },
        { new: true }
      );
      if (failed) await syncPaymentToNeon(failed);
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

    // Dual-write to NeonDB
    await syncPaymentToNeon(payment);

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

    // Dual-write to NeonDB
    await syncPaymentToNeon(payment);

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

// Helper to filter payments:
// 1. Matches if payment's propertyId belongs to landlord's properties.
// 2. Matches if propertyId is null/missing and note contains a contract ID belonging to the landlord.
// 3. Matches if propertyId is null/missing and the tenant only has contracts with THIS landlord.
export const filterLandlordPayments = async (payments, landlordId, propertyIds) => {
  const filtered = [];
  for (const p of payments) {
    const pPropId = p.propertyId?._id || p.propertyId;
    if (pPropId && propertyIds.some(id => id.toString() === pPropId.toString())) {
      filtered.push(p);
      continue;
    }
    if (!pPropId) {
      const match = p.note?.match(/contract:([a-f0-9]{24})/i);
      if (match) {
        const contractId = match[1];
        const contract = await Contract.findById(contractId).select('landlord').lean();
        if (contract && contract.landlord?.toString() === landlordId.toString()) {
          filtered.push(p);
        }
        continue;
      }
      const tenantId = p.tenantId?._id || p.tenantId;
      if (tenantId) {
        const tenantContracts = await Contract.find({ tenant: tenantId }).select('landlord').lean();
        const landlords = [...new Set(tenantContracts.map(c => c.landlord?.toString()).filter(Boolean))];
        if (landlords.length === 1 && landlords[0] === landlordId.toString()) {
          filtered.push(p);
        }
      }
    }
  }
  return filtered;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/payments/landlord-revenue
// Returns the landlord's total revenue from tenant payments for their properties
// ─────────────────────────────────────────────────────────────────────────────
export const getLandlordRevenue = async (req, res) => {
  try {
    const landlordId = resolveUserId(req.user);
    if (!landlordId) {
      return res.status(401).json({ message: 'Unauthorised — userId missing from token' });
    }

    const properties = await Property.find({ postedBy: landlordId }).select('_id').lean();
    const propertyIds = properties.map(p => p._id);

    // Active lease rent — matches LandlordTenant monthly revenue card
    const activeContracts = await Contract.find({ landlord: landlordId, status: 'active' })
      .select('rentAmount')
      .lean();
    const contractMonthlyRevenue = activeContracts.reduce(
      (sum, c) => sum + (Number(c.rentAmount) || 0),
      0
    );

    // Tenants with any contract on this landlord's properties (covers payments without propertyId)
    const landlordContracts = await Contract.find({ landlord: landlordId })
      .select('tenant')
      .lean();
    const tenantIds = [...new Set(
      landlordContracts.map(c => c.tenant?.toString()).filter(Boolean)
    )];

    const paidQuery = {
      status: 'Paid',
      $or: [
        ...(propertyIds.length > 0 ? [{ propertyId: { $in: propertyIds } }] : []),
        ...(tenantIds.length > 0 ? [{ tenantId: { $in: tenantIds } }] : []),
      ],
    };
    if (paidQuery.$or.length === 0) {
      return res.status(200).json({
        totalMonthlyRevenue: contractMonthlyRevenue,
        totalRevenue: 0,
        contractMonthlyRevenue,
        paidPayments: 0,
        pendingPayments: 0,
        pendingAmount: 0,
      });
    }

    const rawPaidPayments = await Payment.find(paidQuery).lean();
    const paidPayments = await filterLandlordPayments(rawPaidPayments, landlordId, propertyIds);

    const pendingQuery = {
      status: 'Pending',
      $or: paidQuery.$or,
    };
    const rawPendingPayments = await Payment.find(pendingQuery).lean();
    const pendingPayments = await filterLandlordPayments(rawPendingPayments, landlordId, propertyIds);

    const totalRevenue = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const pendingAmount = pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    return res.status(200).json({
      totalMonthlyRevenue: contractMonthlyRevenue,
      totalRevenue,
      contractMonthlyRevenue,
      paidPayments: paidPayments.length,
      pendingPayments: pendingPayments.length,
      pendingAmount,
    });
  } catch (err) {
    console.error('[getLandlordRevenue] ERROR:', err.message);
    return res.status(500).json({ message: 'Failed to fetch landlord revenue' });
  }
};
// ─────────────────────────────────────────────────────────────────────────────
// GET /api/payments/landlord-tenant-payments
// Tenant rent payments received by the logged-in landlord
// ─────────────────────────────────────────────────────────────────────────────
export const getLandlordTenantPayments = async (req, res) => {
  try {
    const landlordId = resolveUserId(req.user);
    if (!landlordId) {
      return res.status(401).json({ message: 'Unauthorised — userId missing from token' });
    }

    const properties = await Property.find({ postedBy: landlordId }).select('_id title').lean();
    const propertyIds = properties.map(p => p._id);
    const propertyTitleById = Object.fromEntries(
      properties.map(p => [p._id.toString(), p.title])
    );

    const landlordContracts = await Contract.find({ landlord: landlordId }).select('tenant').lean();
    const tenantIds = [...new Set(
      landlordContracts.map(c => c.tenant?.toString()).filter(Boolean)
    )];

    const queryOr = [];
    if (propertyIds.length > 0) queryOr.push({ propertyId: { $in: propertyIds } });
    if (tenantIds.length > 0) queryOr.push({ tenantId: { $in: tenantIds } });

    if (queryOr.length === 0) {
      return res.status(200).json([]);
    }

    const payments = await Payment.find({ $or: queryOr })
      .sort({ createdAt: -1 })
      .populate('tenantId', 'name email')
      .populate('propertyId', 'title')
      .lean();

    const filteredPayments = await filterLandlordPayments(payments, landlordId, propertyIds);

    const shaped = filteredPayments.map((p) => ({
      id: p._id,
      amount: p.amount,
      status: p.status,
      paymentMethod: p.paymentMethod,
      dueDate: p.dueDate,
      paidAt: p.paidAt,
      note: p.note,
      createdAt: p.createdAt,
      tenantName: p.tenantId?.name || 'Tenant',
      tenantEmail: p.tenantId?.email || '',
      propertyTitle:
        p.propertyId?.title ||
        propertyTitleById[p.propertyId?.toString()] ||
        'Property',
      type: p.note?.includes('Move-in') ? 'Move-in' : 'Rent',
    }));

    return res.status(200).json(shaped);
  } catch (err) {
    console.error('[getLandlordTenantPayments] ERROR:', err.message);
    return res.status(500).json({ message: 'Failed to fetch tenant payments' });
  }
};
