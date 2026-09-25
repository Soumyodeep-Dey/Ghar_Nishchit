import { Router } from 'express';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';

import {
  createProperty,

  getAllProperties,

  getPropertyById,

  getPropertiesByUser,

  updateProperty,

  deleteProperty,

  searchPropertiesByLocation,

  searchPropertiesNearby
}

  from '../controllers/property.controller.js';

const router = Router();

// CRUD routes
// Protected: create/update/delete require authentication
router.post('/', verifyToken, requireRole('landlord'), createProperty);
router.get('/search', searchPropertiesByLocation);
router.get('/nearby', searchPropertiesNearby);
router.get('/user/:userId', getPropertiesByUser);
router.get('/', getAllProperties);
router.get('/:id', getPropertyById);
router.put('/:id', verifyToken, requireRole('landlord'), updateProperty);
router.delete('/:id', verifyToken, requireRole('landlord'), deleteProperty);

export default router;
