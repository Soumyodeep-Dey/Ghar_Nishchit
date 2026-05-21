import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import {
  getPayments,
  createPayment,
  updatePaymentStatus,
  getPaymentStats,
  getLandlordRevenue,
  getLandlordTenantPayments,
  createOrder,
  verifyPayment,
} from '../controllers/payment.controller.js';

const router = express.Router();

// All routes in this router require a valid JWT.
// Webhook is mounted directly in `app.js` so it can run BEFORE express.json().
router.use(verifyToken);

// Existing routes (unchanged)
router.get('/landlord-revenue', getLandlordRevenue); // GET  /api/payments/landlord-revenue
router.get('/landlord-tenant-payments', getLandlordTenantPayments); // GET  /api/payments/landlord-tenant-payments
router.get('/',             getPayments);         // GET  /api/payments
router.get('/stats',        getPaymentStats);     // GET  /api/payments/stats
router.post('/',            createPayment);       // POST /api/payments  (manual entry)
router.patch('/:id/status', updatePaymentStatus); // PATCH /api/payments/:id/status

// Razorpay gateway routes
router.post('/create-order', createOrder);   // POST /api/payments/create-order
router.post('/verify',       verifyPayment); // POST /api/payments/verify

export default router;
