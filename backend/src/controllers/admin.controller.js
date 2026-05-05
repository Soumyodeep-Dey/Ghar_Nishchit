import User from '../models/user.model.js';
import Property from '../models/property.model.js';
import Contract from '../models/contract.model.js';

export const getDashboardData = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    const properties = await Property.find().sort({ createdAt: -1 });
    const contracts = await Contract.find().populate('tenant property landlord').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      users,
      properties,
      contracts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProperty = async (req, res) => {
  try {
    await Property.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Property deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteContract = async (req, res) => {
  try {
    await Contract.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Contract deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
