import express from 'express';
import { chat } from '../controllers/ai.controller.js';
import { aiRateLimit } from '../middlewares/rateLimit.middleware.js';

const router = express.Router();
router.post('/chat', aiRateLimit, chat);
export default router;
