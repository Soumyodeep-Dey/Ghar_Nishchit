import express from 'express';
import {
  createInquiry,
  getLandlordInquiries,
  getTenantInquiries,
  getInquiryMessages,
  replyToInquiry,
  deleteInquiry,
  deleteMessage
} from '../controllers/inquiry.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(verifyToken); // All routes require authentication

router.post('/',                      requireRole('tenant'), createInquiry);
router.get('/',                       requireRole('landlord'), getLandlordInquiries);
router.get('/mine',                   requireRole('tenant'), getTenantInquiries);
router.get('/:id/messages',           getInquiryMessages);     // Both: fetch thread
router.post('/:id/messages',          replyToInquiry);         // Both: send a reply
router.delete('/:id/messages/:messageId', deleteMessage);      // Both: delete individual message
router.delete('/:id',                 deleteInquiry);          // Both: delete conversation


export default router;
