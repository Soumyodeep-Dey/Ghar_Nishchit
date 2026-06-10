import express from 'express';
import {
  getDashboardData,
  deleteUser,
  updateUserStatus,
  deleteProperty,
  updatePropertyStatus,
  deleteContract,
  updateMaintenanceStatus,
  broadcastNotification,
} from '../controllers/admin.controller.js';
import {
  getAllSupportRequests,
  updateSupportStatus,
  adminReplyToSupport,
} from '../controllers/support.controller.js';

const router = express.Router();

// Dashboard
router.get('/dashboard', getDashboardData);

// User management  — PUT so the param is the last segment (Express 5 compatible)
router.delete('/user/:id', deleteUser);
router.put('/user-status/:id', updateUserStatus);

// Property management
router.delete('/property/:id', deleteProperty);
router.put('/property-status/:id', updatePropertyStatus);

// Contract management
router.delete('/contract/:id', deleteContract);

// Maintenance management
router.put('/maintenance-status/:id', updateMaintenanceStatus);

// Broadcast notification
router.post('/broadcast', broadcastNotification);

// Help / support requests
router.get('/support', getAllSupportRequests);
router.put('/support-status/:id', updateSupportStatus);
router.post('/support/:id/reply', adminReplyToSupport);

export default router;
