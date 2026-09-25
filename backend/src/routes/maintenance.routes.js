import express from 'express';
import {
    createMaintenanceRequest,
    getLandlordMaintenanceRequests,
    getTenantMaintenanceRequests,
    getMaintenanceRequestById,
    updateMaintenanceRequest,
    updateStatus,
    addComment,
    assignTechnician,
    deleteMaintenanceRequest,
    getMaintenanceStats,
    getMaintenanceByProperty
} from '../controllers/maintenance.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All maintenance routes require auth
router.use(verifyToken);

// Create new maintenance request (requires auth to identify tenant)
router.post('/', requireRole('tenant'), createMaintenanceRequest);

// Get maintenance requests by landlord
router.get('/landlord/:landlordId', requireRole('landlord', 'admin'), getLandlordMaintenanceRequests);

// Get maintenance requests by tenant
router.get('/tenant/:tenantId', requireRole('tenant', 'admin'), getTenantMaintenanceRequests);

// Get maintenance statistics for landlord dashboard
router.get('/stats/:landlordId', requireRole('landlord', 'admin'), getMaintenanceStats);

// Get maintenance requests by property
router.get('/property/:propertyId', requireRole('landlord', 'admin'), getMaintenanceByProperty);

// Get single maintenance request by ID
router.get('/:id', getMaintenanceRequestById);

// Update maintenance request
router.put('/:id', updateMaintenanceRequest);

// Update status only
router.patch('/:id/status', requireRole('landlord', 'admin'), updateStatus);

// Add comment to maintenance request
router.post('/:id/comment', addComment);

// Assign technician/service provider
router.patch('/:id/assign', requireRole('landlord', 'admin'), assignTechnician);

// Delete maintenance request
router.delete('/:id', deleteMaintenanceRequest);

export default router;
