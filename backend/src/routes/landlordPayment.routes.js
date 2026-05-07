import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import {
  createLandlordOrder,
  verifyLandlordPayment,
  getLandlordPayments,
  getLandlordPaymentStats,
} from '../controllers/landlordPayment.controller.js';

const router = express.Router();

// All routes require a valid JWT
router.use(verifyToken);

// Payment history & stats
router.get('/',       getLandlordPayments);      // GET  /api/landlord-payments
router.get('/stats',  getLandlordPaymentStats);  // GET  /api/landlord-payments/stats

// Razorpay gateway
router.post('/create-order', createLandlordOrder);    // POST /api/landlord-payments/create-order
router.post('/verify',       verifyLandlordPayment);  // POST /api/landlord-payments/verify

// NOTE: /webhook is mounted directly in app.js (needs raw body — see header comment above)

export default router;
