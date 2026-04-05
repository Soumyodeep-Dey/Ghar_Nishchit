import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import {
    getMyTenants,
    getTenantById,
    getTenantStats
} from '../controllers/tenant.controller.js';

const router = Router();

// All tenant routes require authentication
// Only landlords should access these endpoints (could add role check middleware)
router.get('/', verifyToken, getMyTenants);
router.get('/stats', verifyToken, getTenantStats);
router.get('/:tenantId', verifyToken, getTenantById);

export default router;
