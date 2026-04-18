import Payment from '../models/payment.model.js';

// GET /api/payments
// Returns payment history for the authenticated tenant.
export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ tenantId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('propertyId', 'title location')
      .lean();

    const shaped = payments.map((p) => ({
      id:            p._id,
      amount:        p.amount,
      status:        p.status,
      paymentMethod: p.paymentMethod,
      dueDate:       p.dueDate,
      paidAt:        p.paidAt,
      note:          p.note,
      property:      p.propertyId,
      createdAt:     p.createdAt,
    }));

    res.status(200).json(shaped);
  } catch (err) {
    console.error('getPayments error:', err);
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
};

// POST /api/payments
export const createPayment = async (req, res) => {
  try {
    const { propertyId, amount, status, paymentMethod, dueDate, note } = req.body;
    const payment = await Payment.create({
      tenantId: req.user.id,
      propertyId,
      amount,
      status,
      paymentMethod,
      dueDate,
      note,
      paidAt: status === 'Paid' ? new Date() : undefined,
    });
    res.status(201).json(payment);
  } catch (err) {
    console.error('createPayment error:', err);
    res.status(500).json({ message: 'Failed to create payment' });
  }
};

// PATCH /api/payments/:id/status
export const updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const update = { status };
    if (status === 'Paid') update.paidAt = new Date();

    const payment = await Payment.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.id },
      update,
      { new: true }
    );
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.status(200).json(payment);
  } catch (err) {
    console.error('updatePaymentStatus error:', err);
    res.status(500).json({ message: 'Failed to update payment' });
  }
};

// GET /api/payments/stats
export const getPaymentStats = async (req, res) => {
  try {
    const all = await Payment.find({ tenantId: req.user.id }).lean();
    const stats = {
      total:   all.length,
      paid:    all.filter((p) => p.status === 'Paid').length,
      pending: all.filter((p) => p.status === 'Pending').length,
      overdue: all.filter((p) => p.status === 'Overdue').length,
      totalAmountPaid: all
        .filter((p) => p.status === 'Paid')
        .reduce((sum, p) => sum + p.amount, 0),
    };
    res.status(200).json(stats);
  } catch (err) {
    console.error('getPaymentStats error:', err);
    res.status(500).json({ message: 'Failed to fetch payment stats' });
  }
};
