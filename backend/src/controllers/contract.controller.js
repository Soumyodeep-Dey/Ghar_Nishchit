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
        res.status(200).json(contracts);
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
        res.status(200).json(contracts);
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

        contract.status = status;
        await contract.save();

        res.status(200).json(contract);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
