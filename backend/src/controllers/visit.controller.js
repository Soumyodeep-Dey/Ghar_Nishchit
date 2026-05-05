import Visit from '../models/visit.model.js';
import Property from '../models/property.model.js';
import User from '../models/user.model.js';
import { query as neonQuery } from '../db/neon.js';

// ── NeonDB Sync Helper ────────────────────────────────────────────────────────
const syncVisitToNeon = async (v) => {
  try {
    await neonQuery(
      `INSERT INTO visits (
         id, tenant_id, landlord_id, property_id, visit_date, visit_time,
         type, notes, status, created_at, updated_at
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (id) DO UPDATE SET
         status     = EXCLUDED.status,
         notes      = EXCLUDED.notes,
         updated_at = NOW()`,
      [
        v._id.toString(),
        v.tenant?.toString(),
        v.landlord?.toString(),
        v.property?.toString(),
        v.date ? new Date(v.date).toISOString().split('T')[0] : null,
        v.time || '',
        v.type || 'in-person',
        v.notes || '',
        v.status || 'scheduled',
        v.createdAt ? new Date(v.createdAt).toISOString() : new Date().toISOString(),
        v.updatedAt ? new Date(v.updatedAt).toISOString() : new Date().toISOString(),
      ]
    );
  } catch (e) {
    console.warn('[NeonDB] visit sync warning:', e.message);
  }
};

export const scheduleVisit = async (req, res) => {
    try {
        const { tenantId, date, time, property, type, notes } = req.body;
        const landlordId = req.user.id || req.user._id || req.user.userId;

        if (!tenantId || !date || !time || !property) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Find property by title and landlordId since frontend sends title
        let propertyId = property;
        const propDoc = await Property.findOne({ title: property, postedBy: landlordId });
        if (propDoc) {
            propertyId = propDoc._id;
        }

        const visit = new Visit({
            tenant: tenantId,
            landlord: landlordId,
            property: propertyId,
            date: new Date(date),
            time,
            type,
            notes,
            status: 'scheduled'
        });

        await visit.save();

        // Dual-write to NeonDB
        await syncVisitToNeon(visit);

        res.status(201).json(visit);
    } catch (error) {
        console.error('Error scheduling visit:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getLandlordVisits = async (req, res) => {
    try {
        const landlordId = req.user.id || req.user._id || req.user.userId;
        const visits = await Visit.find({ landlord: landlordId })
            .populate('tenant', 'name email phone')
            .populate('property', 'title price')
            .sort({ date: 1 });
        res.status(200).json(visits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
