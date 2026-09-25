import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/user.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import { writeRateLimit } from '../middlewares/rateLimit.middleware.js';

const router = Router();

router.use(verifyToken, requireRole('admin'));

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', writeRateLimit, updateUser);
router.delete('/:id', writeRateLimit, deleteUser);

export default router;
