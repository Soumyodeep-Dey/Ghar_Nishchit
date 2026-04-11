import Visit from '../models/visit.model.js';
import Property from '../models/property.model.js';

// ─── Helper ──────────────────────────────────────────────────────────────────
const notFound = (res) => res.status(404).json({ message: 'Visit not found' });
const forbidden = (res) => res.status(403).json({ message: 'Forbidden' });

// ─── POST /api/visits ────────────────────────────────────────────────────────
// Tenant schedules a visit for a property
export const scheduleVisit = async (req, res) => {
  try {
    const { propertyId, landlordId, visitDate, visitTime, message } = req.body;

    if (!propertyId || !visitDate || !visitTime) {
      return res.status(400).json({ message: 'propertyId, visitDate and visitTime are required' });
    }

    // Confirm property exists and resolve landlord if not supplied
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    const resolvedLandlordId = landlordId || property.landlordId || property.owner;

    // Prevent double-booking: same tenant + property + date
    const existing = await Visit.findOne({
      property: propertyId,
      tenant: req.user._id,
      visitDate: new Date(visitDate),
      status: { $in: ['pending', 'approved'] },
    });
    if (existing) {
      return res.status(409).json({ message: 'You already have a visit scheduled for this property on that date' });
    }

    const visit = await Visit.create({
      property: propertyId,
      tenant: req.user._id,
      landlord: resolvedLandlordId,
      visitDate: new Date(visitDate),
      visitTime,
      message: message || '',
    });

    const populated = await visit.populate([
      { path: 'property', select: 'title address images' },
      { path: 'tenant', select: 'name email' },
      { path: 'landlord', select: 'name email' },
    ]);

    return res.status(201).json({ message: 'Visit scheduled successfully', visit: populated });
  } catch (err) {
    console.error('scheduleVisit error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ─── GET /api/visits/my ──────────────────────────────────────────────────────
// Tenant: list their own visits
export const getMyVisits = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { tenant: req.user._id };
    if (status) filter.status = status;

    const visits = await Visit.find(filter)
      .populate('property', 'title address images price')
      .populate('landlord', 'name email')
      .sort({ visitDate: 1 });

    return res.status(200).json(visits);
  } catch (err) {
    console.error('getMyVisits error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ─── GET /api/visits/landlord ────────────────────────────────────────────────
// Landlord: list all visits for their properties
export const getLandlordVisits = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { landlord: req.user._id };
    if (status) filter.status = status;

    const visits = await Visit.find(filter)
      .populate('property', 'title address images price')
      .populate('tenant', 'name email phone')
      .sort({ visitDate: 1 });

    return res.status(200).json(visits);
  } catch (err) {
    console.error('getLandlordVisits error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ─── GET /api/visits/:id ─────────────────────────────────────────────────────
export const getVisitById = async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id)
      .populate('property', 'title address images price')
      .populate('tenant', 'name email')
      .populate('landlord', 'name email');

    if (!visit) return notFound(res);

    // Only the tenant or the landlord of this visit can view it
    const userId = req.user._id.toString();
    if (visit.tenant._id.toString() !== userId && visit.landlord._id.toString() !== userId) {
      return forbidden(res);
    }

    return res.status(200).json(visit);
  } catch (err) {
    console.error('getVisitById error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ─── PATCH /api/visits/:id/status ────────────────────────────────────────────
// Landlord approves or rejects; tenant can cancel (status = 'cancelled')
export const updateVisitStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const allowed = ['approved', 'rejected', 'cancelled'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${allowed.join(', ')}` });
    }

    const visit = await Visit.findById(req.params.id);
    if (!visit) return notFound(res);

    const userId = req.user._id.toString();
    const isTenant = visit.tenant.toString() === userId;
    const isLandlord = visit.landlord.toString() === userId;

    // Tenant can only cancel; landlord can approve/reject
    if (status === 'cancelled' && !isTenant) return forbidden(res);
    if (['approved', 'rejected'].includes(status) && !isLandlord) return forbidden(res);

    visit.status = status;
    if (status === 'rejected' && reason) visit.rejectionReason = reason;
    await visit.save();

    return res.status(200).json({ message: `Visit ${status}`, visit });
  } catch (err) {
    console.error('updateVisitStatus error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ─── DELETE /api/visits/:id ───────────────────────────────────────────────────
// Tenant cancels and removes a visit (only if still pending)
export const cancelVisit = async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id);
    if (!visit) return notFound(res);

    if (visit.tenant.toString() !== req.user._id.toString()) return forbidden(res);

    if (!['pending', 'approved'].includes(visit.status)) {
      return res.status(400).json({ message: 'Only pending or approved visits can be cancelled' });
    }

    await visit.deleteOne();
    return res.status(200).json({ message: 'Visit cancelled successfully' });
  } catch (err) {
    console.error('cancelVisit error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
