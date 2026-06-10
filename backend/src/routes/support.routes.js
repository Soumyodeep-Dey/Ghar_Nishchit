import express from 'express';
import {
  createSupportRequest,
  getMySupportRequests,
  getSupportRequest,
  replyToSupportRequest,
} from '../controllers/support.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(verifyToken);

router.post('/', createSupportRequest);
router.get('/mine', getMySupportRequests);
router.get('/:id', getSupportRequest);
router.post('/:id/reply', replyToSupportRequest);

export default router;
