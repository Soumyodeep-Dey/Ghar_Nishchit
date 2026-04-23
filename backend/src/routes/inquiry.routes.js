import express from 'express';
import {
  createInquiry,
  getLandlordInquiries,
  getTenantInquiries,
  getInquiryMessages,
  replyToInquiry
} from '../controllers/inquiry.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(verifyToken); // All routes require authentication

router.post('/',                      createInquiry);          // Tenant: start a conversation
router.get('/',                       getLandlordInquiries);   // Landlord: list all inquiries
router.get('/mine',                   getTenantInquiries);     // Tenant: list my inquiries
router.get('/:id/messages',           getInquiryMessages);     // Both: fetch thread
router.post('/:id/messages',          replyToInquiry);         // Both: send a reply

export default router;
