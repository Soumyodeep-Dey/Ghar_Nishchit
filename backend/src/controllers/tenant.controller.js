import Property from '../models/property.model.js';
import Inquiry from '../models/inquiry.model.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';

// Helper to resolve user id
const resolveUserId = (user) => {
    if (!user) return null;
    return user._id || user.id || user.userId || null;
};

/**
 * Get all tenants (prospects) for the landlord's properties
 * This includes people who have inquired about any of the landlord's properties
 */
export const getMyTenants = async (req, res) => {
    try {
        const authUserId = resolveUserId(req.user);
        if (!authUserId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        // Find all properties posted by this landlord
        const myProperties = await Property.find({ postedBy: authUserId }).select('_id title');

        if (myProperties.length === 0) {
            return res.status(200).json([]);
        }

        const propertyIds = myProperties.map(p => p._id);

        // Find all inquiries for these properties
        const inquiries = await Inquiry.find({
            property: { $in: propertyIds }
        })
            .populate('seeker', 'name email phone profilePicture')
            .populate('property', 'title price address')
            .sort({ contactTime: -1 });

        // Transform inquiries into tenant data
        const tenants = inquiries.map(inquiry => {
            const seeker = inquiry.seeker;
            if (!seeker) return null;

            return {
                id: seeker._id,
                name: seeker.name || 'Unknown',
                email: seeker.email || '',
                phone: seeker.phone || '',
                avatar: seeker.profilePicture || '',
                property: inquiry.property?.title || '',
                propertyId: inquiry.property?._id,
                status: 'Prospect', // All inquiries are prospects unless we have a lease system
                inquiryDate: inquiry.contactTime,
                message: inquiry.message,
                rentAmount: inquiry.property?.price || 0,
                isOnline: false,
                isVerified: !!seeker.email,
                isPremium: false,
                rating: 0,
                tags: ['New Inquiry'],
                visitRequests: [{
                    requestedDate: inquiry.contactTime,
                    property: inquiry.property?.title,
                    status: 'pending',
                    notes: inquiry.message
                }]
            };
        }).filter(t => t !== null);

        // Remove duplicates (same tenant might inquire about multiple properties or same property multiple times)
        // Keep the most recent inquiry
        const uniqueTenants = [];
        const seenIds = new Set();

        for (const tenant of tenants) {
            if (!seenIds.has(tenant.id.toString())) {
                seenIds.add(tenant.id.toString());
                uniqueTenants.push(tenant);
            }
        }

        res.status(200).json(uniqueTenants);
    } catch (error) {
        console.error('Error fetching tenants:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get detailed information about a specific tenant
 */
export const getTenantById = async (req, res) => {
    try {
        const authUserId = resolveUserId(req.user);
        if (!authUserId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const { tenantId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(tenantId)) {
            return res.status(400).json({ message: 'Invalid tenant ID' });
        }

        // Find the tenant (user)
        const tenant = await User.findById(tenantId).select('-password');
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        // Find all properties posted by this landlord
        const myProperties = await Property.find({ postedBy: authUserId }).select('_id title');
        const propertyIds = myProperties.map(p => p._id);

        // Find all inquiries from this tenant for the landlord's properties
        const inquiries = await Inquiry.find({
            seeker: tenantId,
            property: { $in: propertyIds }
        })
            .populate('property', 'title price address')
            .sort({ contactTime: -1 });

        if (inquiries.length === 0) {
            return res.status(403).json({ message: 'This tenant has not inquired about any of your properties' });
        }

        // Build detailed tenant profile
        const tenantProfile = {
            id: tenant._id,
            name: tenant.name,
            email: tenant.email,
            phone: tenant.phone,
            avatar: tenant.profilePicture,
            role: tenant.role,
            createdAt: tenant.createdAt,
            inquiries: inquiries.map(inq => ({
                property: inq.property?.title,
                propertyId: inq.property?._id,
                rentAmount: inq.property?.price,
                message: inq.message,
                inquiryDate: inq.contactTime
            })),
            visitRequests: inquiries.map(inq => ({
                requestedDate: inq.contactTime,
                property: inq.property?.title,
                status: 'pending',
                notes: inq.message
            }))
        };

        res.status(200).json(tenantProfile);
    } catch (error) {
        console.error('Error fetching tenant details:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get statistics about tenants
 */
export const getTenantStats = async (req, res) => {
    try {
        const authUserId = resolveUserId(req.user);
        if (!authUserId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        // Find all properties posted by this landlord
        const myProperties = await Property.find({ postedBy: authUserId }).select('_id');
        const propertyIds = myProperties.map(p => p._id);

        // Count total inquiries
        const totalInquiries = await Inquiry.countDocuments({
            property: { $in: propertyIds }
        });

        // Get unique seekers (prospects)
        const inquiries = await Inquiry.find({
            property: { $in: propertyIds }
        }).select('seeker');

        const uniqueSeekers = new Set(inquiries.map(i => i.seeker.toString()));

        const stats = {
            totalProperties: myProperties.length,
            totalInquiries,
            totalProspects: uniqueSeekers.size,
            activeTenants: 0, // Would need a lease system to track this
            overduePayments: 0 // Would need a payment system to track this
        };

        res.status(200).json(stats);
    } catch (error) {
        console.error('Error fetching tenant stats:', error);
        res.status(500).json({ message: error.message });
    }
};
