import express from 'express';
import { scheduleVisit, getLandlordVisits } from '../controllers/visit.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(verifyToken);

router.post('/schedule', scheduleVisit);
router.get('/landlord', getLandlordVisits);

export default router;
