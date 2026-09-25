import express from 'express';
import { scheduleVisit, getLandlordVisits } from '../controllers/visit.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(verifyToken);

router.post('/schedule', requireRole('tenant'), scheduleVisit);
router.get('/landlord', requireRole('landlord'), getLandlordVisits);

export default router;
