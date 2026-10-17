import User from '../models/user.model.js';
import Property from '../models/property.model.js';
import Contract from '../models/contract.model.js';
import Maintenance from '../models/maintenance.model.js';
import Payment from '../models/payment.model.js';
import Inquiry from '../models/inquiry.model.js';
import SupportRequest from '../models/supportRequest.model.js';
import Notification from '../models/notification.model.js';
import Outbox from '../models/outbox.model.js';
import mongoose from 'mongoose';

const dashboardLoaders = {
  users: () => User.find().select('-password').sort({ createdAt: -1 }).lean(),
  properties: () => Property.find().populate('postedBy', 'name email').sort({ createdAt: -1 }).lean(),
  contracts: () => Contract.find().populate('tenant landlord property').sort({ createdAt: -1 }).lean(),
  maintenance: () => Maintenance.find().populate('tenant landlord property', 'name email title').sort({ createdAt: -1 }).lean(),
  payments: () => Payment.find().populate('tenantId', 'name email').populate('propertyId', 'title').sort({ createdAt: -1 }).lean(),
  inquiries: () => Inquiry.find().populate('seeker landlord', 'name email').populate('property', 'title').sort({ contactTime: -1 }).lean(),
  supportRequests: () => SupportRequest.find().populate('user', 'name email role').sort({ createdAt: -1 }).lean(),
};

const countByStatus = (field, statuses) => Object.fromEntries(
  statuses.map((status) => [
    status,
    { $sum: { $cond: [{ $eq: [`$${field}`, status] }, 1, 0] } },
  ])
);

const getMonthlySeries = (rows, valueField = 'count') => new Map(
  rows.map((row) => [row._id, row[valueField]])
);

const getAdminAnalytics = async () => {
  const now = new Date();
  const firstMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));
  const slaBreachThreshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const monthGroup = { $dateToString: { format: '%Y-%m', date: '$createdAt', timezone: 'UTC' } };

  const [
    [userStats = {}],
    [propertyStats = {}],
    [contractStats = {}],
    [paymentStats = {}],
    slaBreaches,
    openSupportRequests,
    userGrowth,
    propertyGrowth,
    paymentGrowth,
  ] = await Promise.all([
    User.aggregate([{ $group: { _id: null, totalUsers: { $sum: 1 }, ...countByStatus('role', ['landlord', 'tenant']) } }]),
    Property.aggregate([{ $group: { _id: null, totalProperties: { $sum: 1 }, ...countByStatus('status', ['Occupied', 'Available', 'Pending']) } }]),
    Contract.aggregate([{ $group: { _id: null, totalContracts: { $sum: 1 }, ...countByStatus('status', ['active']) } }]),
    Payment.aggregate([{
      $group: {
        _id: null,
        totalRevenue: { $sum: { $cond: [{ $eq: ['$status', 'Paid'] }, { $ifNull: ['$amount', 0] }, 0] } },
        pendingPayments: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, { $ifNull: ['$amount', 0] }, 0] } },
        failedPayments: { $sum: { $cond: [{ $eq: ['$status', 'Failed'] }, 1, 0] } },
      },
    }]),
    Maintenance.countDocuments({ status: { $in: ['Pending', 'In Progress'] }, createdAt: { $lt: slaBreachThreshold } }),
    SupportRequest.countDocuments({ status: 'open' }),
    User.aggregate([
      { $match: { createdAt: { $gte: firstMonth } } },
      { $group: { _id: monthGroup, count: { $sum: 1 } } },
    ]),
    Property.aggregate([
      { $match: { createdAt: { $gte: firstMonth } } },
      { $group: { _id: monthGroup, count: { $sum: 1 } } },
    ]),
    Payment.aggregate([
      { $match: { createdAt: { $gte: firstMonth }, status: 'Paid' } },
      { $group: { _id: monthGroup, amount: { $sum: { $ifNull: ['$amount', 0] } } } },
    ]),
  ]);

  const usersByMonth = getMonthlySeries(userGrowth);
  const propertiesByMonth = getMonthlySeries(propertyGrowth);
  const paymentsByMonth = getMonthlySeries(paymentGrowth, 'amount');
  const monthlyGrowth = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5 + index, 1));
    const key = date.toISOString().slice(0, 7);
    return {
      month: date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }),
      users: usersByMonth.get(key) || 0,
      properties: propertiesByMonth.get(key) || 0,
      payments: paymentsByMonth.get(key) || 0,
    };
  });

  return {
    totalUsers: userStats.totalUsers || 0,
    totalLandlords: userStats.landlord || 0,
    totalTenants: userStats.tenant || 0,
    totalProperties: propertyStats.totalProperties || 0,
    totalContracts: contractStats.totalContracts || 0,
    activeContracts: contractStats.active || 0,
    totalRevenue: paymentStats.totalRevenue || 0,
    pendingPayments: paymentStats.pendingPayments || 0,
    failedPayments: paymentStats.failedPayments || 0,
    occupiedProperties: propertyStats.Occupied || 0,
    availableProperties: propertyStats.Available || 0,
    pendingProperties: propertyStats.Pending || 0,
    slaBreaches,
    openSupportRequests,
    monthlyGrowth,
  };
};

// ── Dashboard Overview ────────────────────────────────────────────────────
export const getDashboardData = async (req, res) => {
  try {
    const section = req.query.section;
    if (section === 'overview') {
      return res.status(200).json({ success: true, analytics: await getAdminAnalytics() });
    }

    if (section) {
      const loader = dashboardLoaders[section];
      if (!loader) return res.status(400).json({ success: false, message: 'Invalid dashboard section' });
      return res.status(200).json({ success: true, [section]: await loader() });
    }

    // Compatibility path for older clients. New clients request one section at a time.
    const entries = await Promise.all(
      Object.entries(dashboardLoaders).map(async ([key, loader]) => [key, await loader()])
    );
    return res.status(200).json({
      success: true,
      ...Object.fromEntries(entries),
      analytics: await getAdminAnalytics(),
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
    if (!['active', 'suspended', 'banned'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid user status' });
    }
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
    if (status !== undefined && !['Available', 'Occupied', 'Maintenance', 'Pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid property status' });
    }
    if (featured !== undefined && typeof featured !== 'boolean') {
      return res.status(400).json({ success: false, message: 'featured must be a boolean' });
    }
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
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const request = await Maintenance.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found' });
    }

    const oldStatus = request.status;
    if (status !== oldStatus) {
      request.status = status;
      request.history.push({
        type: 'status',
        description: `Status changed from ${oldStatus} to ${status} (admin)`,
        timestamp: new Date()
      });
      request.updatedAt = new Date();
      await request.save();
    }

    res.status(200).json({ success: true, request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Broadcast Notification ────────────────────────────────────────────────
export const broadcastNotification = async (req, res) => {
  try {
    const { title, message, targetRole } = req.body; // targetRole: 'all' | 'tenant' | 'landlord'
    if (typeof title !== 'string' || !title.trim() || title.length > 120 || typeof message !== 'string' || !message.trim() || message.length > 2000) {
      return res.status(400).json({ success: false, message: 'Valid title and message are required' });
    }
    if (!['all', 'tenant', 'landlord'].includes(targetRole)) {
      return res.status(400).json({ success: false, message: 'Invalid target role' });
    }
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

// ── Outbox Operations ─────────────────────────────────────────────────────
export const getOutboxJobs = async (req, res) => {
  try {
    const allowedStatuses = ['pending', 'processing', 'completed', 'failed', 'dead_letter'];
    const status = req.query.status || 'dead_letter';
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid outbox status' });
    }
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 25, 1), 100);
    const [jobs, counts] = await Promise.all([
      Outbox.find({ status }).sort({ createdAt: -1 }).limit(limit).lean(),
      Outbox.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);
    return res.status(200).json({
      success: true,
      jobs,
      counts: Object.fromEntries(counts.map(({ _id, count }) => [_id, count])),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const retryOutboxJob = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid outbox job ID' });
    }
    const job = await Outbox.findOneAndUpdate(
      { _id: req.params.id, status: { $in: ['failed', 'dead_letter'] } },
      {
        $set: {
          status: 'pending',
          retries: 0,
          lastError: null,
          nextAttemptAt: null,
          lockedAt: null,
          lockedBy: null,
        },
      },
      { new: true }
    );
    if (!job) {
      return res.status(404).json({ success: false, message: 'Retryable outbox job not found' });
    }
    return res.status(200).json({ success: true, job });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
