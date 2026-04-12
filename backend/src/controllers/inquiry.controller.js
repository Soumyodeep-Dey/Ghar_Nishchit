import mongoose from 'mongoose';
import Inquiry from '../models/inquiry.model.js';
import Property from '../models/property.model.js';

export const createInquiry = async (req, res) => {
  try {
    const { propertyId, message } = req.body;
    console.log('[Inquiry] createInquiry. userId:', req.user?.userId, 'role:', req.user?.role);
    console.log('[Inquiry] propertyId:', propertyId);

    if (!propertyId || !message) {
      return res.status(400).json({ message: 'Property ID and message are required' });
    }

    const seekerId = req.user.userId || req.user.id || req.user._id;

    const inquiry = await Inquiry.create({
      property: propertyId,
      seeker: seekerId,
      message,
      contactTime: new Date()
    });

    console.log('[Inquiry] Created inquiry:', inquiry._id);
    res.status(201).json(inquiry);
  } catch (error) {
    console.error('Error creating inquiry:', error);
    res.status(500).json({ message: 'Error creating inquiry' });
  }
};

export const getLandlordInquiries = async (req, res) => {
  try {
    const landlordId = req.user.userId || req.user.id || req.user._id;
    console.log('[Inquiry] getLandlordInquiries. userId:', landlordId, 'role:', req.user?.role);

    // Safety: only landlords should get inquiries this way
    if (req.user.role !== 'landlord') {
      return res.status(200).json([]);
    }

    // Find all properties owned by this landlord
    const properties = await Property.find({ postedBy: landlordId }).select('_id title');
    console.log('[Inquiry] Properties found for landlord:', properties.length, properties.map(p => p.title));

    const propertyIds = properties.map(p => p._id);

    // Find all inquiries for these properties
    const inquiries = await Inquiry.find({ property: { $in: propertyIds } })
      .populate('property', 'title')
      .populate('seeker', 'name email')
      .sort({ contactTime: -1 });

    console.log('[Inquiry] Inquiries found:', inquiries.length);
    res.status(200).json(inquiries);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({ message: 'Error fetching inquiries' });
  }
};
