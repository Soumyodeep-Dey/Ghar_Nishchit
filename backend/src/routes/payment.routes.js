import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import {
  getPayments,
  createPayment,
  updatePaymentStatus,
  getPaymentStats,
  createOrder,
  verifyPayment,
  handleWebhook,
} from '../controllers/payment.controller.js';

const router = express.Router();

// ───────────────────────────────────────────────────────────────
// Razorpay Webhook — NO JWT auth, raw body required for HMAC verification
// Register this URL in Razorpay Dashboard → Settings → Webhooks:
//   https://yourdomain.com/api/payments/webhook
//   Events: payment.captured, payment.failed
// ───────────────────────────────────────────────────────────────
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

// ───────────────────────────────────────────────────────────────
// All routes below this line require a valid JWT
// ───────────────────────────────────────────────────────────────
router.use(verifyToken);

// Existing routes (unchanged)
router.get('/',             getPayments);         // GET  /api/payments
router.get('/stats',        getPaymentStats);     // GET  /api/payments/stats
router.post('/',            createPayment);       // POST /api/payments  (manual entry)
router.patch('/:id/status', updatePaymentStatus); // PATCH /api/payments/:id/status

// Razorpay gateway routes
router.post('/create-order', createOrder);   // POST /api/payments/create-order
router.post('/verify',       verifyPayment); // POST /api/payments/verify

export default router;
