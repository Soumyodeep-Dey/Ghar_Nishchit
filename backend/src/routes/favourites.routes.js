import { Router } from 'express';
import {
  getFavourites,
  addFavourite,
  removeFavourite,
  isFavourited
} from '../controllers/favourites.controller.js';
import { getUsersWhoFavourited } from '../controllers/property.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Get all favourites for the logged-in user
router.get('/', verifyToken, requireRole('tenant'), getFavourites);

// Add a property to favourites
router.post('/add', verifyToken, requireRole('tenant'), addFavourite);

// Remove a property from favourites
router.post('/remove', verifyToken, requireRole('tenant'), removeFavourite);

// Check if a property is favourited by the user
router.get('/check/:propertyId', verifyToken, requireRole('tenant'), isFavourited);

// Get all users who favourited a property
router.get('/users/:propertyId', verifyToken, requireRole('landlord', 'admin'), getUsersWhoFavourited);

export default router;
