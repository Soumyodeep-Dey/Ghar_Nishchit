import mongoose from 'mongoose';
import Inquiry from '../models/inquiry.model.js';
import Property from '../models/property.model.js';
import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';

// ─── Helper ──────────────────────────────────────────────────────────────────
function formatTime(date) {
  const d = new Date(date);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60)         return 'Just now';
  if (diff < 3600)       return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)      return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7)  return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// ─── POST /api/inquiries ──────────────────────────────────────────────────────
// Tenant sends an interest/contact message for a property.
// Creates a new Inquiry (conversation thread) if one doesn't already exist for
// this (seeker, property) pair — idempotent.
export const createInquiry = async (req, res) => {
  try {
    const { propertyId, message } = req.body;
    console.log('[Inquiry] createInquiry. userId:', req.user?.userId, 'role:', req.user?.role);

    if (!propertyId || !message) {
      return res.status(400).json({ message: 'Property ID and message are required' });
    }

    const seekerId = req.user.userId || req.user.id || req.user._id;

    // Resolve property + landlord
    const property = await Property.findById(propertyId).select('_id title postedBy');
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    const landlordId = property.postedBy;

    // Idempotency — reuse existing thread for same seeker+property
    let inquiry = await Inquiry.findOne({ property: propertyId, seeker: seekerId });

    if (!inquiry) {
      inquiry = await Inquiry.create({
        property:    propertyId,
        seeker:      seekerId,
        landlord:    landlordId,
        message,
        contactTime: new Date(),
        replies:     []
      });

      // Notify the landlord
      try {
        const seeker = await User.findById(seekerId).select('name');
        await Notification.create({
          userId:    landlordId,
          title:     'New Property Inquiry',
          message:   `${seeker?.name || 'A tenant'} is interested in "${property.title}"`,
          type:      'inquiry',
          relatedId: inquiry._id
        });
      } catch (notifErr) {
        console.warn('[Inquiry] Failed to create notification:', notifErr.message);
      }
    }

    const populated = await Inquiry.findById(inquiry._id)
      .populate('property', 'title')
      .populate('seeker',   'name email')
      .populate('landlord', 'name email');

    console.log('[Inquiry] Created/found inquiry:', inquiry._id);
    res.status(201).json(populated);
  } catch (error) {
    console.error('Error creating inquiry:', error);
    res.status(500).json({ message: 'Error creating inquiry' });
  }
};

// ─── GET /api/inquiries ───────────────────────────────────────────────────────
// Landlord: get all inquiries for their properties
export const getLandlordInquiries = async (req, res) => {
  try {
    const landlordId = req.user.userId || req.user.id || req.user._id;
    console.log('[Inquiry] getLandlordInquiries. userId:', landlordId, 'role:', req.user?.role);

    if (req.user.role !== 'landlord') {
      return res.status(200).json([]);
    }

    const properties = await Property.find({ postedBy: landlordId }).select('_id title');
    const propertyIds = properties.map(p => p._id);

    const inquiries = await Inquiry.find({ property: { $in: propertyIds } })
      .populate('property', 'title')
      .populate('seeker',   'name email')
      .populate('replies.sender', 'name')
      .sort({ contactTime: -1 });

    console.log('[Inquiry] Inquiries found:', inquiries.length);
    res.status(200).json(inquiries);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({ message: 'Error fetching inquiries' });
  }
};

// ─── GET /api/inquiries/mine ──────────────────────────────────────────────────
// Tenant: get all their own inquiries (one per property contacted)
export const getTenantInquiries = async (req, res) => {
  try {
    const seekerId = req.user.userId || req.user.id || req.user._id;
    console.log('[Inquiry] getTenantInquiries. userId:', seekerId);

    const inquiries = await Inquiry.find({ seeker: seekerId })
      .populate({
        path: 'property',
        select: 'title images postedBy',
        populate: { path: 'postedBy', select: 'name email' }
      })
      .populate('landlord', 'name email')
      .populate('replies.sender', 'name')
      .sort({ contactTime: -1 });

    res.status(200).json(inquiries);
  } catch (error) {
    console.error('Error fetching tenant inquiries:', error);
    res.status(500).json({ message: 'Error fetching inquiries' });
  }
};

// ─── GET /api/inquiries/:id/messages ─────────────────────────────────────────
// Both: fetch the full message thread for an inquiry.
// Returns the initial message + all replies as a flat array.
export const getInquiryMessages = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const inquiry = await Inquiry.findById(req.params.id)
      .populate('seeker',   'name role')
      .populate('landlord', 'name role')
      .populate({
        path: 'property',
        select: 'title postedBy',
        populate: { path: 'postedBy', select: 'name role' }
      })
      .populate('replies.sender', 'name role');

    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });

    // Authorization — only seeker or landlord can read
    const seekerId   = String(inquiry.seeker?._id || inquiry.seeker);
    const landlordId = String(inquiry.landlord?._id || inquiry.landlord || inquiry.property?.postedBy?._id || inquiry.property?.postedBy || '');
    const uid        = String(userId);
    if (uid !== seekerId && uid !== landlordId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Shape: initial message first, then replies
    const initial = {
      _id:       inquiry._id + '_init',
      sender:    inquiry.seeker?._id || inquiry.seeker,
      senderName:inquiry.seeker?.name || 'Tenant',
      role:      'tenant',
      content:   inquiry.message,
      createdAt: inquiry.contactTime,
      isOwn:     uid === seekerId
    };

    const replyMessages = (inquiry.replies || []).map(r => ({
      _id:       r._id,
      sender:    r.sender?._id || r.sender,
      senderName:r.senderName || r.sender?.name || '',
      role:      r.role,
      content:   r.content,
      createdAt: r.createdAt,
      isOwn:     String(r.sender?._id || r.sender) === uid
    }));

    res.status(200).json([initial, ...replyMessages]);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
};

// ─── POST /api/inquiries/:id/messages ────────────────────────────────────────
// Both: send a reply in an inquiry thread.
export const replyToInquiry = async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user.userId || req.user.id || req.user._id;
    const role   = req.user.role;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const inquiry = await Inquiry.findById(req.params.id).populate('property', 'postedBy');
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });

    // Authorization
    const seekerId   = String(inquiry.seeker);
    const landlordId = String(inquiry.landlord || inquiry.property?.postedBy || '');
    const uid        = String(userId);
    if (uid !== seekerId && uid !== landlordId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const sender = await User.findById(userId).select('name');
    const reply = {
      sender:     userId,
      senderName: sender?.name || '',
      role,
      content:    content.trim(),
      createdAt:  new Date()
    };

    inquiry.replies.push(reply);
    await inquiry.save();

    const savedReply = inquiry.replies[inquiry.replies.length - 1];

    // Notify the other party
    try {
      const notifyUserId = uid === seekerId ? landlordId : seekerId;
      await Notification.create({
        userId:    notifyUserId,
        title:     'New Message',
        message:   `${sender?.name || 'Someone'} sent you a message`,
        type:      'inquiry',
        relatedId: inquiry._id
      });
    } catch (notifErr) {
      console.warn('[Inquiry] Failed to create reply notification:', notifErr.message);
    }

    res.status(201).json({
      _id:       savedReply._id,
      sender:    userId,
      senderName:sender?.name || '',
      role,
      content:   savedReply.content,
      createdAt: savedReply.createdAt,
      isOwn:     true
    });
  } catch (error) {
    console.error('Error replying to inquiry:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
};
