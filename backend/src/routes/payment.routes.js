import express from 'express';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
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
router.get('/landlord-revenue', requireRole('landlord'), getLandlordRevenue);
router.get('/landlord-tenant-payments', requireRole('landlord'), getLandlordTenantPayments);
router.get('/',             requireRole('tenant'), getPayments);
router.get('/stats',        requireRole('tenant'), getPaymentStats);
router.post('/',            requireRole('tenant'), createPayment);
router.patch('/:id/status', requireRole('landlord', 'admin'), updatePaymentStatus);

// Razorpay gateway routes
router.post('/create-order', requireRole('tenant'), createOrder);
router.post('/verify',       requireRole('tenant'), verifyPayment);

export default router;
