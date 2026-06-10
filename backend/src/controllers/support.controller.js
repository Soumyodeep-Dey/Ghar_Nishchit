import SupportRequest from '../models/supportRequest.model.js';
import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';

function getUserId(req) {
  return req.user?.userId || req.user?.id || req.user?._id;
}

// POST /api/support — create a help request
export const createSupportRequest = async (req, res) => {
  try {
    const { subject, message, category } = req.body;
    if (!subject?.trim() || !message?.trim()) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }

    const userId = getUserId(req);
    const user = await User.findById(userId).select('name email role');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const request = await SupportRequest.create({
      user: userId,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      subject: subject.trim(),
      message: message.trim(),
      category: category || 'general',
      replies: [],
    });

    res.status(201).json(request);
  } catch (error) {
    console.error('[Support] create error:', error);
    res.status(500).json({ message: 'Failed to submit help request' });
  }
};

// GET /api/support/mine — list current user's requests
export const getMySupportRequests = async (req, res) => {
  try {
    const userId = getUserId(req);
    const requests = await SupportRequest.find({ user: userId })
      .sort({ createdAt: -1 })
      .select('-replies');
    res.json(requests);
  } catch (error) {
    console.error('[Support] list mine error:', error);
    res.status(500).json({ message: 'Failed to fetch help requests' });
  }
};

// GET /api/support/:id — get a single request with thread
export const getSupportRequest = async (req, res) => {
  try {
    const userId = getUserId(req);
    const request = await SupportRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(request);
  } catch (error) {
    console.error('[Support] get error:', error);
    res.status(500).json({ message: 'Failed to fetch help request' });
  }
};

// POST /api/support/:id/reply — user follow-up message
export const replyToSupportRequest = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const userId = getUserId(req);
    const request = await SupportRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (request.status === 'closed') {
      return res.status(400).json({ message: 'This request is closed' });
    }

    const user = await User.findById(userId).select('name role');
    request.replies.push({
      sender: userId,
      senderName: user?.name || '',
      role: user?.role || request.userRole,
      content: content.trim(),
    });
    if (request.status === 'resolved') request.status = 'open';
    await request.save();

    res.json(request);
  } catch (error) {
    console.error('[Support] reply error:', error);
    res.status(500).json({ message: 'Failed to send reply' });
  }
};

// GET /api/admin/support — admin: list all requests
export const getAllSupportRequests = async (_req, res) => {
  try {
    const requests = await SupportRequest.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email role');
    res.json({ success: true, requests });
  } catch (error) {
    console.error('[Support] admin list error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/support-status/:id — admin: update status
export const updateSupportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['open', 'in_progress', 'resolved', 'closed'];
    if (!valid.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const request = await SupportRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    if (status === 'resolved' || status === 'closed') {
      try {
        await Notification.create({
          userId: request.user,
          title: 'Help Request Updated',
          message: `Your help request "${request.subject}" has been marked as ${status.replace('_', ' ')}.`,
          type: 'support',
          relatedId: request._id,
        });
      } catch (notifErr) {
        console.warn('[Support] notification failed:', notifErr.message);
      }
    }

    res.json({ success: true, request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/admin/support/:id/reply — admin reply to user
export const adminReplyToSupport = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const request = await SupportRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    request.replies.push({
      senderName: 'Admin',
      role: 'admin',
      content: content.trim(),
    });
    if (request.status === 'open') request.status = 'in_progress';
    await request.save();

    try {
      await Notification.create({
        userId: request.user,
        title: 'Admin Response',
        message: `You have a new reply on "${request.subject}"`,
        type: 'support',
        relatedId: request._id,
      });
    } catch (notifErr) {
      console.warn('[Support] notification failed:', notifErr.message);
    }

    res.json({ success: true, request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
