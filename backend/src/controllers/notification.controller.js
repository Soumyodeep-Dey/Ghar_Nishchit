import Notification from '../models/notification.model.js';

// Helper to resolve userId from JWT payload (JWT encodes `userId`, not `id`)
const resolveUid = (user) => user?.userId || user?.id || user?._id;

// GET /api/notifications
// Returns all notifications for the authenticated user, newest first.
export const getNotifications = async (req, res) => {
  try {
    const uid = resolveUid(req.user);
    const notifications = await Notification.find({ userId: uid })
      .sort({ createdAt: -1 })
      .lean();

    const shaped = notifications.map((n) => ({
      id:        n._id,
      title:     n.title,
      message:   n.message,
      type:      n.type,
      read:      n.read,
      time:      formatRelativeTime(n.createdAt),
      createdAt: n.createdAt,
      relatedId: n.relatedId,
    }));

    res.status(200).json(shaped);
  } catch (err) {
    console.error('getNotifications error:', err);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

// PATCH /api/notifications/:id/read
export const markAsRead = async (req, res) => {
  try {
    const uid = resolveUid(req.user);
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: uid },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.status(200).json({ message: 'Marked as read', notification });
  } catch (err) {
    console.error('markAsRead error:', err);
    res.status(500).json({ message: 'Failed to update notification' });
  }
};

// PATCH /api/notifications/read-all
export const markAllAsRead = async (req, res) => {
  try {
    const uid = resolveUid(req.user);
    await Notification.updateMany({ userId: uid, read: false }, { read: true });
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('markAllAsRead error:', err);
    res.status(500).json({ message: 'Failed to update notifications' });
  }
};

// DELETE /api/notifications/:id
export const deleteNotification = async (req, res) => {
  try {
    const uid = resolveUid(req.user);
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: uid,
    });
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.status(200).json({ message: 'Notification deleted' });
  } catch (err) {
    console.error('deleteNotification error:', err);
    res.status(500).json({ message: 'Failed to delete notification' });
  }
};

// POST /api/notifications  (internal helper — also exposed for admin/system use)
export const createNotification = async (req, res) => {
  try {
    const { userId, title, message, type, relatedId } = req.body;
    const notification = await Notification.create({ userId, title, message, type, relatedId });
    res.status(201).json(notification);
  } catch (err) {
    console.error('createNotification error:', err);
    res.status(500).json({ message: 'Failed to create notification' });
  }
};

// ── helper ──────────────────────────────────────────────────────────────────
function formatRelativeTime(date) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60)         return 'Just now';
  if (diff < 3600)       return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)      return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
