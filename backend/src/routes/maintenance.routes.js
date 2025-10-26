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

const router = express.Router();

// Create new maintenance request
router.post('/', createMaintenanceRequest);

// Get maintenance requests by landlord
router.get('/landlord/:landlordId', getLandlordMaintenanceRequests);

// Get maintenance requests by tenant
router.get('/tenant/:tenantId', getTenantMaintenanceRequests);

// Get maintenance statistics for landlord dashboard
router.get('/stats/:landlordId', getMaintenanceStats);

// Get maintenance requests by property
router.get('/property/:propertyId', getMaintenanceByProperty);

// Get single maintenance request by ID
router.get('/:id', getMaintenanceRequestById);

// Update maintenance request
router.put('/:id', updateMaintenanceRequest);

// Update status only
router.patch('/:id/status', updateStatus);

// Add comment to maintenance request
router.post('/:id/comment', addComment);

// Assign technician/service provider
router.patch('/:id/assign', assignTechnician);

// Delete maintenance request
router.delete('/:id', deleteMaintenanceRequest);

export default router;
