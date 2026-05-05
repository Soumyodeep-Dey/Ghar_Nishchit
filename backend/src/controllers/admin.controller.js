import User from '../models/user.model.js';
import Property from '../models/property.model.js';
import Contract from '../models/contract.model.js';
import Maintenance from '../models/maintenance.model.js';
import Payment from '../models/payment.model.js';
import Inquiry from '../models/inquiry.model.js';
import Notification from '../models/notification.model.js';

// ── Dashboard Overview ────────────────────────────────────────────────────
export const getDashboardData = async (req, res) => {
  try {
    const [users, properties, contracts, maintenance, payments, inquiries] = await Promise.all([
      User.find().select('-password').sort({ createdAt: -1 }),
      Property.find().populate('postedBy', 'name email').sort({ createdAt: -1 }),
      Contract.find().populate('tenant landlord property').sort({ createdAt: -1 }),
      Maintenance.find().populate('tenant landlord property', 'name email title').sort({ createdAt: -1 }),
      Payment.find().populate('tenantId', 'name email').populate('propertyId', 'title').sort({ createdAt: -1 }),
      Inquiry.find().populate('seeker landlord', 'name email').populate('property', 'title').sort({ contactTime: -1 }),
    ]);

    // SLA breaches: Open/In Progress maintenance older than 7 days
    const slaBreachThreshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const slaBreaches = maintenance.filter(m =>
      ['Pending', 'In Progress'].includes(m.status) && new Date(m.createdAt) < slaBreachThreshold
    );

    // Financial summary
    const totalRevenue = payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
    const pendingPayments = payments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0);
    const failedPayments = payments.filter(p => p.status === 'Failed').length;

    // Property occupancy
    const occupiedProperties = properties.filter(p => p.status === 'Occupied').length;
    const availableProperties = properties.filter(p => p.status === 'Available').length;

    // Monthly growth data (last 6 months)
    const monthlyGrowth = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const monthName = date.toLocaleString('default', { month: 'short' });
      monthlyGrowth.push({
        month: monthName,
        users: users.filter(u => new Date(u.createdAt) >= monthStart && new Date(u.createdAt) <= monthEnd).length,
        properties: properties.filter(p => new Date(p.createdAt) >= monthStart && new Date(p.createdAt) <= monthEnd).length,
        payments: payments.filter(p => p.status === 'Paid' && new Date(p.createdAt) >= monthStart && new Date(p.createdAt) <= monthEnd).reduce((s, p) => s + p.amount, 0),
      });
    }

    const activeContracts = contracts.filter(c => c.status === 'active').length;

    res.status(200).json({
      success: true,
      users,
      properties,
      contracts,
      maintenance,
      payments,
      inquiries,
      analytics: {
        totalUsers: users.length,
        totalLandlords: users.filter(u => u.role === 'landlord').length,
        totalTenants: users.filter(u => u.role === 'tenant').length,
        totalContracts: contracts.length,
        activeContracts,
        totalRevenue,
        pendingPayments,
        failedPayments,
        occupiedProperties,
        availableProperties,
        pendingProperties: properties.filter(p => p.status === 'Pending').length,
        slaBreaches: slaBreaches.length,
        slaBreachList: slaBreaches,
        monthlyGrowth,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── User Management ───────────────────────────────────────────────────────
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'active' | 'suspended' | 'banned'
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Property Management ───────────────────────────────────────────────────
export const deleteProperty = async (req, res) => {
  try {
    await Property.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Property deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePropertyStatus = async (req, res) => {
  try {
    const { status, featured } = req.body;
    const update = {};
    if (status !== undefined) update.status = status;
    if (featured !== undefined) update.featured = featured;
    const property = await Property.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    res.status(200).json({ success: true, property });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Contract Management ───────────────────────────────────────────────────
export const deleteContract = async (req, res) => {
  try {
    await Contract.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Contract deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Maintenance Management ────────────────────────────────────────────────
export const updateMaintenanceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await Maintenance.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!request) return res.status(404).json({ success: false, message: 'Maintenance request not found' });
    res.status(200).json({ success: true, request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Broadcast Notification ────────────────────────────────────────────────
export const broadcastNotification = async (req, res) => {
  try {
    const { title, message, targetRole } = req.body; // targetRole: 'all' | 'tenant' | 'landlord'
    let users;
    if (targetRole === 'all') {
      users = await User.find().select('_id');
    } else {
      users = await User.find({ role: targetRole }).select('_id');
    }

    const notifications = users.map(u => ({
      userId: u._id,
      title,
      message,
      type: 'general',
    }));

    await Notification.insertMany(notifications);
    res.status(200).json({ success: true, sent: notifications.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
