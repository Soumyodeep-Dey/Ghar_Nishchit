import express from 'express';
import {
  scheduleVisit,
  getMyVisits,
  getLandlordVisits,
  getVisitById,
  updateVisitStatus,
  cancelVisit,
} from '../controllers/visit.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All visit routes require authentication
router.use(verifyToken);

// Tenant: schedule a visit
router.post('/', scheduleVisit);

// Tenant: get their own visits
router.get('/my', getMyVisits);

// Landlord: get all visit requests for their properties
router.get('/landlord', getLandlordVisits);

// Both: get a single visit by ID
router.get('/:id', getVisitById);

// Landlord: approve/reject  |  Tenant: cancel
router.patch('/:id/status', updateVisitStatus);

// Tenant: delete/cancel a visit
router.delete('/:id', cancelVisit);

export default router;
