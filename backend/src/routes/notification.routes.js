import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
} from '../controllers/notification.controller.js';

const router = express.Router();

// All notification routes require a valid JWT
router.use(verifyToken);

router.get('/',               getNotifications);    // GET  /api/notifications
router.post('/',              createNotification);  // POST /api/notifications
router.patch('/read-all',     markAllAsRead);       // PATCH /api/notifications/read-all
router.patch('/:id/read',     markAsRead);          // PATCH /api/notifications/:id/read
router.delete('/:id',         deleteNotification);  // DELETE /api/notifications/:id

export default router;
