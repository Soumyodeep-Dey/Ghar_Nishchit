import express from 'express';
import { createInquiry, getLandlordInquiries } from '../controllers/inquiry.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(verifyToken); // All routes require authentication
router.post('/', createInquiry);
router.get('/', getLandlordInquiries);

export default router;
