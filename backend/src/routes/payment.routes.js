import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import {
  getPayments,
  createPayment,
  updatePaymentStatus,
  getPaymentStats,
} from '../controllers/payment.controller.js';

const router = express.Router();

// All payment routes require a valid JWT
router.use(verifyToken);

router.get('/',              getPayments);          // GET  /api/payments
router.get('/stats',         getPaymentStats);      // GET  /api/payments/stats
router.post('/',             createPayment);        // POST /api/payments
router.patch('/:id/status',  updatePaymentStatus);  // PATCH /api/payments/:id/status

export default router;
