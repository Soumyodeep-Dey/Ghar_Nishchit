import Property from '../models/property.model.js';

export const resolveUserId = (user) => {
    if (!user) return null;
    return user._id || user.id || user.userId || null;
};

export const resolveUserRole = (user) => (user?.role || '').toLowerCase();

export const isAdmin = (user) => resolveUserRole(user) === 'admin';

const idsMatch = (a, b) => a != null && b != null && String(a) === String(b);

/** Reject if authenticated user is not the tenant in the URL/body. Returns auth user id. */
export const requireTenantSelf = (req, res, tenantId) => {
    const authId = resolveUserId(req.user);
    if (!authId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return null;
    }
    if (isAdmin(req.user)) return authId;
    if (!idsMatch(authId, tenantId)) {
        res.status(403).json({ success: false, message: 'Not authorized to view these maintenance requests' });
        return null;
    }
    return authId;
};

/** Reject if authenticated user is not the landlord in the URL. Returns auth user id. */
export const requireLandlordSelf = (req, res, landlordId) => {
    const authId = resolveUserId(req.user);
    if (!authId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return null;
    }
    if (isAdmin(req.user)) return authId;
    if (!idsMatch(authId, landlordId)) {
        res.status(403).json({ success: false, message: 'Not authorized to view these maintenance requests' });
        return null;
    }
    return authId;
};

/** Tenant or landlord on the request, or admin. */
export const canAccessMaintenanceRequest = (user, request) => {
    if (!request) return false;
    if (isAdmin(user)) return true;
    const authId = resolveUserId(user);
    if (!authId) return false;
    return idsMatch(authId, request.tenant) || idsMatch(authId, request.landlord);
};

export const requireMaintenanceAccess = (req, res, request) => {
    if (!request) {
        res.status(404).json({ success: false, message: 'Maintenance request not found' });
        return false;
    }
    if (!canAccessMaintenanceRequest(req.user, request)) {
        res.status(403).json({ success: false, message: 'Not authorized to access this maintenance request' });
        return false;
    }
    return true;
};

/** Only the property owner (postedBy) or admin may list requests for a property. */
export const requirePropertyOwner = async (req, res, propertyId) => {
    const authId = resolveUserId(req.user);
    if (!authId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return null;
    }
    if (isAdmin(req.user)) {
        const property = await Property.findById(propertyId);
        if (!property) {
            res.status(404).json({ success: false, message: 'Property not found' });
            return null;
        }
        return property;
    }

    const property = await Property.findById(propertyId);
    if (!property) {
        res.status(404).json({ success: false, message: 'Property not found' });
        return null;
    }
    if (!idsMatch(property.postedBy, authId)) {
        res.status(403).json({ success: false, message: 'Not authorized — only the property owner can view these requests' });
        return null;
    }
    return property;
};

/** Landlord-only actions (status, assign). Admin allowed. */
export const requireLandlordOfRequest = (req, res, request) => {
    if (!request) {
        res.status(404).json({ success: false, message: 'Maintenance request not found' });
        return false;
    }
    if (isAdmin(req.user)) return true;
    const authId = resolveUserId(req.user);
    if (!authId || !idsMatch(authId, request.landlord)) {
        res.status(403).json({ success: false, message: 'Only the property owner can perform this action' });
        return false;
    }
    return true;
};

/** Tenant may edit only their own request; landlord may edit their property's requests. */
export const requireMaintenanceWriteAccess = (req, res, request) => {
    if (!requireMaintenanceAccess(req, res, request)) return false;
    return true;
};

/** Fields tenants are allowed to change on their own requests. */
export const TENANT_EDITABLE_FIELDS = new Set(['title', 'description', 'priority', 'category', 'attachments']);

/** Strip update payload based on role. */
export const sanitizeMaintenanceUpdate = (user, request, updateData) => {
    const role = resolveUserRole(user);
    const authId = resolveUserId(user);

    if (isAdmin(user)) return { ...updateData };

    if (idsMatch(authId, request.landlord)) {
        return { ...updateData };
    }

    if (idsMatch(authId, request.tenant)) {
        const sanitized = {};
        Object.keys(updateData).forEach((key) => {
            if (TENANT_EDITABLE_FIELDS.has(key)) sanitized[key] = updateData[key];
        });
        return sanitized;
    }

    return {};
};
