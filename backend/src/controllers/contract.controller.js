import Contract from '../models/contract.model.js';
import Property from '../models/property.model.js';
import Notification from '../models/notification.model.js';
import User from '../models/user.model.js';
import { query as neonQuery } from '../db/neon.js';

// ── NeonDB Sync Helper ────────────────────────────────────────────────────────
const syncContractToNeon = async (c) => {
  try {
    const toDate = (d) => d ? new Date(d).toISOString().split('T')[0] : null;
    await neonQuery(
      `INSERT INTO contracts (
         id, tenant_id, landlord_id, property_id, type, duration,
         rent_amount, security_deposit, start_date, end_date, status,
         pets_allowed, smoking_allowed, subletting_allowed, early_termination,
         custom_clauses, created_at, updated_at
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
       ON CONFLICT (id) DO UPDATE SET
         status             = EXCLUDED.status,
         rent_amount        = EXCLUDED.rent_amount,
         security_deposit   = EXCLUDED.security_deposit,
         start_date         = EXCLUDED.start_date,
         end_date           = EXCLUDED.end_date,
         pets_allowed       = EXCLUDED.pets_allowed,
         smoking_allowed    = EXCLUDED.smoking_allowed,
         subletting_allowed = EXCLUDED.subletting_allowed,
         early_termination  = EXCLUDED.early_termination,
         custom_clauses     = EXCLUDED.custom_clauses,
         updated_at         = NOW()`,
      [
        c._id.toString(),
        c.tenant?.toString(),
        c.landlord?.toString(),
        c.property?.toString(),
        c.type || 'lease',
        Number(c.duration),
        Number(c.rentAmount),
        Number(c.securityDeposit),
        toDate(c.startDate),
        toDate(c.endDate),
        c.status || 'pending',
        c.terms?.petsAllowed       ?? false,
        c.terms?.smokingAllowed    ?? false,
        c.terms?.sublettingAllowed ?? false,
        c.terms?.earlyTermination  ?? false,
        c.customClauses || '',
        c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
        c.updatedAt ? new Date(c.updatedAt).toISOString() : new Date().toISOString(),
      ]
    );
  } catch (e) {
    console.warn('[NeonDB] contract sync warning:', e.message);
  }
};

export const sendContract = async (req, res) => {
    try {
        const { tenantId, contractType, duration, rentAmount, securityDeposit, startDate, property, terms, customClauses } = req.body;
        const landlordId = req.user.id || req.user._id || req.user.userId;

        if (!tenantId || !duration || !rentAmount || !securityDeposit || !startDate || !property) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Find property by title and landlordId since frontend sends title
        let propertyId = property;
        const propDoc = await Property.findOne({ title: property, postedBy: landlordId });
        if (propDoc) {
            propertyId = propDoc._id;
        }

        // Do not allow sending a new contract if there is already an active lease
        // for the same tenant + property pair.
        const existingActive = await Contract.findOne({
            tenant: tenantId,
            property: propertyId,
            status: 'active'
        });
        if (existingActive) {
            return res.status(409).json({
                message: 'An active lease already exists for this tenant and property.'
            });
        }

        // Keep only the latest pending draft before creating a new one.
        await Contract.updateMany(
            {
                tenant: tenantId,
                property: propertyId,
                status: 'pending'
            },
            { $set: { status: 'cancelled' } }
        );

        const endDate = new Date(new Date(startDate).setMonth(new Date(startDate).getMonth() + duration));

        const contract = new Contract({


            tenant: tenantId,
            landlord: landlordId,
            property: propertyId,
            type: contractType,
            duration,
            rentAmount,
            securityDeposit,
            startDate: new Date(startDate),
            endDate,
            status: 'pending',
            terms,
            customClauses
        });

        await contract.save();

        // Dual-write to NeonDB
        await syncContractToNeon(contract);

        res.status(201).json(contract);
    } catch (error) {
        console.error('Error sending contract:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getLandlordContracts = async (req, res) => {
    try {
        const landlordId = req.user.id || req.user._id || req.user.userId;
        const contracts = await Contract.find({ landlord: landlordId })
            .populate('tenant', 'name email phone')
            .populate('property', 'title price')
            .sort({ createdAt: -1 });
        
        // Clean up duplicate active leases
        const groups = {};
        for (const contract of contracts) {
            const propId = contract.property?._id || contract.property;
            const tenId = contract.tenant?._id || contract.tenant;
            if (!propId || !tenId) continue;
            const key = `${propId}_${tenId}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(contract);
        }

        const cleanContracts = [];
        for (const key in groups) {
            const group = groups[key];
            const activeLeases = group.filter(c => c.status === 'active');
            const otherLeases = group.filter(c => c.status !== 'active');

            if (activeLeases.length > 1) {
                const latestActive = activeLeases[0];
                const toCancel = activeLeases.slice(1).map(c => c._id);
                await Contract.updateMany(
                    { _id: { $in: toCancel } },
                    { $set: { status: 'cancelled' } }
                );
                cleanContracts.push(
                    latestActive,
                    ...otherLeases,
                    ...activeLeases.slice(1).map(c => ({ ...c.toObject(), status: 'cancelled' }))
                );
            } else {
                cleanContracts.push(...group);
            }
        }

        res.status(200).json(cleanContracts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getTenantContracts = async (req, res) => {
    try {
        const tenantId = req.user.id || req.user._id || req.user.userId;
        const contracts = await Contract.find({ tenant: tenantId })
            .populate('landlord', 'name email phone')
            .populate('property', 'title price address images')
            .sort({ createdAt: -1 });
        
        // Clean up duplicate active leases
        const groups = {};
        for (const contract of contracts) {
            const propId = contract.property?._id || contract.property;
            const tenId = contract.tenant?._id || contract.tenant;
            if (!propId || !tenId) continue;
            const key = `${propId}_${tenId}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(contract);
        }

        const cleanContracts = [];
        for (const key in groups) {
            const group = groups[key];
            const activeLeases = group.filter(c => c.status === 'active');
            const otherLeases = group.filter(c => c.status !== 'active');

            if (activeLeases.length > 1) {
                const latestActive = activeLeases[0];
                const toCancel = activeLeases.slice(1).map(c => c._id);
                await Contract.updateMany(
                    { _id: { $in: toCancel } },
                    { $set: { status: 'cancelled' } }
                );
                cleanContracts.push(
                    latestActive,
                    ...otherLeases,
                    ...activeLeases.slice(1).map(c => ({ ...c.toObject(), status: 'cancelled' }))
                );
            } else {
                cleanContracts.push(...group);
            }
        }

        res.status(200).json(cleanContracts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const updateContractStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        // status could be 'active' if accepted by tenant

        const contract = await Contract.findById(id);
        if (!contract) return res.status(404).json({ message: 'Contract not found' });

        if (status === 'active') {
            // Accepting one lease should make all other non-final contracts
            // for the same tenant + property inactive.
            await Contract.updateMany(
                {
                    tenant: contract.tenant,
                    property: contract.property,
                    _id: { $ne: contract._id },
                    status: { $in: ['pending', 'active'] }
                },
                { $set: { status: 'cancelled' } }
            );
        }

        contract.status = status;
        await contract.save();

        // Dual-write to NeonDB
        await syncContractToNeon(contract);

        if (status === 'active') {
            try {
                const [tenant, property] = await Promise.all([
                    User.findById(contract.tenant).select('name').lean(),
                    Property.findById(contract.property).select('title').lean(),
                ]);
                const tenantName = tenant?.name || 'A tenant';
                const propertyTitle = property?.title || 'your property';
                await Notification.create({
                    userId: contract.landlord,
                    title: 'Lease Signed',
                    message: `${tenantName} accepted the lease for ${propertyTitle}. Move-in payment is pending.`,
                    type: 'general',
                    relatedId: contract._id,
                });
            } catch (notifErr) {
                console.warn('[Contract] landlord accept notification failed:', notifErr.message);
            }
        }

        res.status(200).json(contract);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
