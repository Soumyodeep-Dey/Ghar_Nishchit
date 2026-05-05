import Property from '../models/property.model.js';
import Inquiry from '../models/inquiry.model.js';
import User from '../models/user.model.js';
import Contract from '../models/contract.model.js';
import Visit from '../models/visit.model.js';
import mongoose from 'mongoose';

// Helper to resolve user id
const resolveUserId = (user) => {
    if (!user) return null;
    return user._id || user.id || user.userId || null;
};

/**
 * Get all REAL tenants for the landlord.
 * A "tenant" is someone who has an active (or any) lease contract with this landlord.
 * People who only sent inquiries are NOT tenants — they appear as notifications.
 */
export const getMyTenants = async (req, res) => {
    try {
        const authUserId = resolveUserId(req.user);
        if (!authUserId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        // Fetch ALL contracts for this landlord (active & pending — both are real interactions)
        const contracts = await Contract.find({ landlord: authUserId })
            .populate('tenant', 'name email phone profilePicture')
            .populate('property', 'title price address')
            .sort({ createdAt: -1 });

        if (contracts.length === 0) {
            return res.status(200).json([]);
        }

        // Fetch visits for all tenant IDs
        const tenantIds = [...new Set(contracts.map(c => c.tenant?._id?.toString()).filter(Boolean))];
        const visits = await Visit.find({ tenant: { $in: tenantIds }, landlord: authUserId })
            .populate('property', 'title');

        // Build one record per unique tenant (group multiple contracts)
        const tenantMap = new Map();

        for (const contract of contracts) {
            const tenantUser = contract.tenant;
            if (!tenantUser) continue;

            const tid = tenantUser._id.toString();

            if (!tenantMap.has(tid)) {
                tenantMap.set(tid, {
                    id:          tenantUser._id,
                    name:        tenantUser.name || 'Unknown',
                    email:       tenantUser.email || '',
                    phone:       tenantUser.phone || '',
                    avatar:      tenantUser.profilePicture || '',
                    isVerified:  !!tenantUser.email,
                    isPremium:   false,
                    isOnline:    false,
                    rating:      0,
                    contracts:   [],
                    visitRequests: visits
                        .filter(v => v.tenant.toString() === tid)
                        .map(v => ({
                            requestedDate: v.date,
                            time:          v.time,
                            status:        v.status,
                            notes:         v.notes,
                            type:          v.type,
                            property:      v.property?.title
                        }))
                });
            }

            tenantMap.get(tid).contracts.push({
                _id:             contract._id,
                type:            contract.type,
                startDate:       contract.startDate,
                endDate:         contract.endDate,
                status:          contract.status,
                rentAmount:      contract.rentAmount,
                securityDeposit: contract.securityDeposit,
                property:        contract.property?.title,
                propertyId:      contract.property?._id
            });
        }

        // Compute derived fields per tenant
        const result = [...tenantMap.values()].map(t => {
            const activeContract  = t.contracts.find(c => c.status === 'active');
            const pendingContract = t.contracts.find(c => c.status === 'pending');
            const primaryContract = activeContract || pendingContract || t.contracts[0];

            return {
                ...t,
                property:    primaryContract?.property || '',
                propertyId:  primaryContract?.propertyId || null,
                rentAmount:  primaryContract?.rentAmount || 0,
                moveInDate:  primaryContract?.startDate || null,
                leaseEndDate:primaryContract?.endDate   || null,
                status:      activeContract ? 'Active' : pendingContract ? 'Pending' : 'Inactive',
                tags:        activeContract ? ['Active Lease'] : pendingContract ? ['Contract Pending'] : ['Past Tenant'],
            };
        });

        console.log('Returning contract-based tenants:', result.length);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching tenants:', error);
        res.status(500).json({ message: error.message, error: error.toString() });
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

        const contracts = await Contract.find({ tenant: tenantId, landlord: authUserId }).populate('property', 'title');
        const visits = await Visit.find({ tenant: tenantId, landlord: authUserId }).populate('property', 'title');

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
            visitRequests: visits.map(v => ({
                requestedDate: v.date,
                time: v.time,
                status: v.status,
                notes: v.notes,
                type: v.type,
                property: v.property?.title
            })),
            contracts: contracts.map(c => ({
                type: c.type,
                startDate: c.startDate,
                endDate: c.endDate,
                status: c.status,
                rentAmount: c.rentAmount,
                property: c.property?.title
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

        // Properties count
        const myProperties = await Property.find({ postedBy: authUserId }).select('_id');
        const propertyIds = myProperties.map(p => p._id);

        // Inquiry-based prospects (people who sent messages but don't have a contract yet)
        const inquiries = await Inquiry.find({ property: { $in: propertyIds } }).select('seeker');
        const uniqueInquiryUserIds = new Set(inquiries.map(i => i.seeker?.toString()).filter(Boolean));

        // Contract-based tenant counts
        const activeContracts  = await Contract.countDocuments({ landlord: authUserId, status: 'active' });
        const pendingContracts = await Contract.countDocuments({ landlord: authUserId, status: 'pending' });

        const stats = {
            totalProperties:  myProperties.length,
            totalInquiries:   inquiries.length,
            totalProspects:   uniqueInquiryUserIds.size,   // inquiry senders
            activeTenants:    activeContracts,              // signed lease
            pendingContracts: pendingContracts,             // sent but not yet signed
            overduePayments:  0
        };

        res.status(200).json(stats);
    } catch (error) {
        console.error('Error fetching tenant stats:', error);
        res.status(500).json({ message: error.message });
    }
};
