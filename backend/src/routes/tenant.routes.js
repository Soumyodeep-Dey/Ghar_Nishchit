import { Router } from 'express';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import {
    getMyTenants,
    getTenantById,
    getTenantStats,
    removeTenant,
} from '../controllers/tenant.controller.js';

const router = Router();
router.use(verifyToken, requireRole('landlord'));

// All tenant routes require authentication
// Only landlords should access these endpoints (could add role check middleware)
router.get('/', getMyTenants);
router.get('/stats', getTenantStats);
router.delete('/:tenantId', removeTenant);
router.get('/:tenantId', getTenantById);

export default router;
