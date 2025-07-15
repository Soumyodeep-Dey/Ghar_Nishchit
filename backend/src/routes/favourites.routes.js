import { Router } from 'express';
import {
  getFavourites,
  addFavourite,
  removeFavourite,
  isFavourited
} from '../controllers/favourites.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Get all favourites for the logged-in user
router.get('/', verifyToken, getFavourites);

// Add a property to favourites
router.post('/add', verifyToken, addFavourite);

// Remove a property from favourites
router.post('/remove', verifyToken, removeFavourite);

// Check if a property is favourited by the user
router.get('/check/:propertyId', verifyToken, isFavourited);

export default router; 