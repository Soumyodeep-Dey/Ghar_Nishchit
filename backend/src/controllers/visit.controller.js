import Visit from '../models/visit.model.js';
import Property from '../models/property.model.js';
import User from '../models/user.model.js';

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
