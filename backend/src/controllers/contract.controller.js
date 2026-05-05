import Contract from '../models/contract.model.js';
import Property from '../models/property.model.js';

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


        res.status(200).json(contract);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
