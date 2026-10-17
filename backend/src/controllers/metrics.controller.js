import { timingSafeEqual } from 'node:crypto';
import mongoose from 'mongoose';
import Outbox from '../models/outbox.model.js';
import { renderMetrics, setOutboxMetrics } from '../utils/metrics.js';

const safeEqual = (left, right) => {
  const leftBuffer = Buffer.from(left || '');
  const rightBuffer = Buffer.from(right || '');
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
};

const refreshOutboxMetrics = async () => {
  const statuses = ['pending', 'processing', 'completed', 'failed', 'dead_letter'];
  if (mongoose.connection.readyState !== 1) {
    setOutboxMetrics({
      counts: Object.fromEntries(statuses.map((status) => [status, 0])),
      available: false,
    });
    return;
  }
  const [counts, oldest] = await Promise.all([
    Outbox.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Outbox.findOne({ status: { $in: ['pending', 'failed'] } }).sort({ createdAt: 1 }).select('createdAt').lean(),
  ]);
  const countByStatus = Object.fromEntries(statuses.map((status) => [status, 0]));
  for (const { _id, count } of counts) countByStatus[_id] = count;
  setOutboxMetrics({
    counts: countByStatus,
    oldestPendingAgeSeconds: oldest
      ? Math.floor((Date.now() - new Date(oldest.createdAt).getTime()) / 1000)
      : 0,
  });
};

export const getMetrics = async (req, res) => {
  if (process.env.METRICS_ENABLED !== 'true' || !process.env.METRICS_TOKEN) {
    return res.status(404).json({ message: 'Route not found' });
  }

  const token = req.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
  if (!safeEqual(token, process.env.METRICS_TOKEN)) {
    return res.status(401).json({ message: 'Invalid metrics token' });
  }

  try {
    await refreshOutboxMetrics();
  } catch {
    setOutboxMetrics({ counts: {}, available: false });
  }
  res.setHeader('content-type', 'text/plain; version=0.0.4; charset=utf-8');
  return res.status(200).send(renderMetrics());
};

