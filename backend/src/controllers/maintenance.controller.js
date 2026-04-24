import Maintenance from '../models/maintenance.model.js';
import Property from '../models/property.model.js';
import User from '../models/user.model.js';
import Contract from '../models/contract.model.js';
import Inquiry from '../models/inquiry.model.js';

// Create a new maintenance request
export const createMaintenanceRequest = async (req, res) => {
    try {
        const {
            title,
            description,
            priority,
            category,
            isEmergency,
            isUrgent,
            attachments
        } = req.body;

        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: 'Title and description are required'
            });
        }

        // Get tenant from JWT token
        const tenantId = req.user?.userId || req.user?.id || req.user?._id;
        if (!tenantId) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        const tenantDoc = await User.findById(tenantId);
        if (!tenantDoc) {
            return res.status(404).json({ success: false, message: 'Tenant not found' });
        }

        // Auto-resolve property & landlord from active contract, fall back to latest inquiry
        let propertyId = null;
        let landlordId = null;
        let propertyDoc = null;

        const activeContract = await Contract.findOne({ tenant: tenantId, status: 'active' })
            .sort({ createdAt: -1 });
        
        if (activeContract) {
            propertyId = activeContract.property;
            landlordId = activeContract.landlord;
        } else {
            // Fall back to most recent inquiry
            const latestInquiry = await Inquiry.findOne({ seeker: tenantId })
                .sort({ contactTime: -1 })
                .populate('property', '_id postedBy');
            if (latestInquiry) {
                propertyId = latestInquiry.property?._id;
                landlordId = latestInquiry.landlord || latestInquiry.property?.postedBy;
            }
        }

        if (!propertyId || !landlordId) {
            return res.status(400).json({
                success: false,
                message: 'No active rental or property inquiry found. Please contact your landlord first.'
            });
        }

        propertyDoc = await Property.findById(propertyId);
        if (!propertyDoc) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        // Create maintenance request
        const maintenanceRequest = new Maintenance({
            title,
            description,
            property: propertyId,
            propertyName: propertyDoc.title,
            tenant: tenantId,
            tenantName: tenantDoc.name,
            landlord: landlordId,
            priority: priority || 'Medium',
            category: category || 'general',
            isEmergency: isEmergency || false,
            isUrgent: isUrgent || false,
            attachments: attachments || [],
            history: [{
                type: 'created',
                description: `Request created by ${tenantDoc.name}`,
                timestamp: new Date()
            }]
        });

        await maintenanceRequest.save();

        res.status(201).json({
            success: true,
            message: 'Maintenance request created successfully',
            data: maintenanceRequest
        });

    } catch (error) {
        console.error('Error creating maintenance request:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating maintenance request',
            error: error.message
        });
    }
};

// Get all maintenance requests for a landlord
export const getLandlordMaintenanceRequests = async (req, res) => {
    try {
        const { landlordId } = req.params;
        const { status, priority, property, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

        // Build filter query
        const filter = { landlord: landlordId };

        if (status && status !== 'All') {
            filter.status = status;
        }

        if (priority && priority !== 'All') {
            filter.priority = priority;
        }

        if (property && property !== 'All') {
            filter.property = property;
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const maintenanceRequests = await Maintenance.find(filter)
            .populate('property', 'title address')
            .populate('tenant', 'name email phone')
            .sort(sort);

        res.status(200).json({
            success: true,
            count: maintenanceRequests.length,
            data: maintenanceRequests
        });

    } catch (error) {
        console.error('Error fetching maintenance requests:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching maintenance requests',
            error: error.message
        });
    }
};

// Get all maintenance requests for a tenant
export const getTenantMaintenanceRequests = async (req, res) => {
    try {
        const { tenantId } = req.params;
        const { status, priority, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

        // Build filter query
        const filter = { tenant: tenantId };

        if (status && status !== 'All') {
            filter.status = status;
        }

        if (priority && priority !== 'All') {
            filter.priority = priority;
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const maintenanceRequests = await Maintenance.find(filter)
            .populate('property', 'title address')
            .populate('landlord', 'name email phone')
            .sort(sort);

        res.status(200).json({
            success: true,
            count: maintenanceRequests.length,
            data: maintenanceRequests
        });

    } catch (error) {
        console.error('Error fetching maintenance requests:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching maintenance requests',
            error: error.message
        });
    }
};

// Get a single maintenance request by ID
export const getMaintenanceRequestById = async (req, res) => {
    try {
        const { id } = req.params;

        const maintenanceRequest = await Maintenance.findById(id)
            .populate('property', 'title address')
            .populate('tenant', 'name email phone')
            .populate('landlord', 'name email phone');

        if (!maintenanceRequest) {
            return res.status(404).json({
                success: false,
                message: 'Maintenance request not found'
            });
        }

        res.status(200).json({
            success: true,
            data: maintenanceRequest
        });

    } catch (error) {
        console.error('Error fetching maintenance request:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching maintenance request',
            error: error.message
        });
    }
};

// Update maintenance request
export const updateMaintenanceRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const maintenanceRequest = await Maintenance.findById(id);

        if (!maintenanceRequest) {
            return res.status(404).json({
                success: false,
                message: 'Maintenance request not found'
            });
        }

        // Track status changes
        if (updateData.status && updateData.status !== maintenanceRequest.status) {
            maintenanceRequest.history.push({
                type: 'status',
                description: `Status changed from ${maintenanceRequest.status} to ${updateData.status}`,
                timestamp: new Date()
            });
        }

        // Track assignment changes
        if (updateData.assignedTo && updateData.assignedTo !== maintenanceRequest.assignedTo) {
            maintenanceRequest.history.push({
                type: 'assignment',
                description: `Assigned to ${updateData.assignedTo}`,
                timestamp: new Date()
            });
        }

        // Update fields
        Object.keys(updateData).forEach(key => {
            if (key !== 'history' && key !== 'comments') {
                maintenanceRequest[key] = updateData[key];
            }
        });

        maintenanceRequest.updatedAt = new Date();
        await maintenanceRequest.save();

        res.status(200).json({
            success: true,
            message: 'Maintenance request updated successfully',
            data: maintenanceRequest
        });

    } catch (error) {
        console.error('Error updating maintenance request:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating maintenance request',
            error: error.message
        });
    }
};

// Update status only
export const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const maintenanceRequest = await Maintenance.findById(id);

        if (!maintenanceRequest) {
            return res.status(404).json({
                success: false,
                message: 'Maintenance request not found'
            });
        }

        const oldStatus = maintenanceRequest.status;
        maintenanceRequest.status = status;

        maintenanceRequest.history.push({
            type: 'status',
            description: `Status changed from ${oldStatus} to ${status}`,
            timestamp: new Date()
        });

        maintenanceRequest.updatedAt = new Date();
        await maintenanceRequest.save();

        res.status(200).json({
            success: true,
            message: 'Status updated successfully',
            data: maintenanceRequest
        });

    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating status',
            error: error.message
        });
    }
};

// Add comment to maintenance request
export const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { author, authorId, text, attachments } = req.body;

        if (!text || !author) {
            return res.status(400).json({
                success: false,
                message: 'Comment text and author are required'
            });
        }

        const maintenanceRequest = await Maintenance.findById(id);

        if (!maintenanceRequest) {
            return res.status(404).json({
                success: false,
                message: 'Maintenance request not found'
            });
        }

        const comment = {
            author,
            authorId,
            text,
            timestamp: new Date(),
            attachments: attachments || []
        };

        maintenanceRequest.comments.push(comment);

        maintenanceRequest.history.push({
            type: 'comment',
            description: `Comment added by ${author}`,
            timestamp: new Date()
        });

        maintenanceRequest.updatedAt = new Date();
        await maintenanceRequest.save();

        res.status(200).json({
            success: true,
            message: 'Comment added successfully',
            data: maintenanceRequest
        });

    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding comment',
            error: error.message
        });
    }
};

// Assign technician/service provider
export const assignTechnician = async (req, res) => {
    try {
        const { id } = req.params;
        const { assignedTo, assignedToContact } = req.body;

        if (!assignedTo) {
            return res.status(400).json({
                success: false,
                message: 'Technician name is required'
            });
        }

        const maintenanceRequest = await Maintenance.findById(id);

        if (!maintenanceRequest) {
            return res.status(404).json({
                success: false,
                message: 'Maintenance request not found'
            });
        }

        maintenanceRequest.assignedTo = assignedTo;
        if (assignedToContact) {
            maintenanceRequest.assignedToContact = assignedToContact;
        }

        maintenanceRequest.history.push({
            type: 'assignment',
            description: `Assigned to ${assignedTo}`,
            timestamp: new Date()
        });

        maintenanceRequest.updatedAt = new Date();
        await maintenanceRequest.save();

        res.status(200).json({
            success: true,
            message: 'Technician assigned successfully',
            data: maintenanceRequest
        });

    } catch (error) {
        console.error('Error assigning technician:', error);
        res.status(500).json({
            success: false,
            message: 'Error assigning technician',
            error: error.message
        });
    }
};

// Delete maintenance request
export const deleteMaintenanceRequest = async (req, res) => {
    try {
        const { id } = req.params;

        const maintenanceRequest = await Maintenance.findByIdAndDelete(id);

        if (!maintenanceRequest) {
            return res.status(404).json({
                success: false,
                message: 'Maintenance request not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Maintenance request deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting maintenance request:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting maintenance request',
            error: error.message
        });
    }
};

// Get maintenance statistics for landlord dashboard
export const getMaintenanceStats = async (req, res) => {
    try {
        const { landlordId } = req.params;

        const totalRequests = await Maintenance.countDocuments({ landlord: landlordId });
        const pendingRequests = await Maintenance.countDocuments({ landlord: landlordId, status: 'Pending' });
        const inProgressRequests = await Maintenance.countDocuments({ landlord: landlordId, status: 'In Progress' });
        const completedRequests = await Maintenance.countDocuments({ landlord: landlordId, status: 'Completed' });
        const highPriorityRequests = await Maintenance.countDocuments({ landlord: landlordId, priority: 'High' });

        // Calculate average response time (mock calculation - you can implement actual logic)
        const avgResponseTime = 2.4;

        // Calculate total estimated cost
        const costResult = await Maintenance.aggregate([
            { $match: { landlord: landlordId } },
            { $group: { _id: null, totalCost: { $sum: '$estimatedCost' } } }
        ]);
        const totalCost = costResult.length > 0 ? costResult[0].totalCost : 0;

        const completionRate = totalRequests > 0 ? Math.round((completedRequests / totalRequests) * 100) : 0;

        res.status(200).json({
            success: true,
            data: {
                total: totalRequests,
                pending: pendingRequests,
                inProgress: inProgressRequests,
                completed: completedRequests,
                highPriority: highPriorityRequests,
                avgResponseTime,
                totalCost,
                completionRate
            }
        });

    } catch (error) {
        console.error('Error fetching maintenance stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching maintenance statistics',
            error: error.message
        });
    }
};

// Get maintenance requests by property
export const getMaintenanceByProperty = async (req, res) => {
    try {
        const { propertyId } = req.params;

        const maintenanceRequests = await Maintenance.find({ property: propertyId })
            .populate('tenant', 'name email phone')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: maintenanceRequests.length,
            data: maintenanceRequests
        });

    } catch (error) {
        console.error('Error fetching maintenance requests by property:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching maintenance requests',
            error: error.message
        });
    }
};
