import WebhookEvent from '../models/webhookEvent.model.js';

const LEASE_MS = Number(process.env.WEBHOOK_LEASE_DURATION_MS) || 5 * 60 * 1000;

export const claimWebhookEvent = async ({ consumer, eventId, eventType }) => {
  const now = new Date();
  try {
    const event = await WebhookEvent.create({
      provider: 'razorpay',
      consumer,
      eventId,
      eventType,
      status: 'processing',
      lockedAt: now,
    });
    return { claimed: true, event };
  } catch (error) {
    if (error?.code !== 11000) throw error;
  }

  const expiredAt = new Date(now.getTime() - LEASE_MS);
  const event = await WebhookEvent.findOneAndUpdate(
    {
      provider: 'razorpay',
      consumer,
      eventId,
      $or: [
        { status: 'failed' },
        { status: 'processing', lockedAt: { $lt: expiredAt } },
      ],
    },
    {
      $set: { status: 'processing', eventType, lockedAt: now, lastError: null },
      $inc: { attempts: 1 },
    },
    { new: true }
  );

  if (event) return { claimed: true, event };
  const existing = await WebhookEvent.findOne({ provider: 'razorpay', consumer, eventId }).lean();
  return { claimed: false, event: existing };
};

export const completeWebhookEvent = (event) => WebhookEvent.updateOne(
  { _id: event._id },
  { $set: { status: 'completed', completedAt: new Date(), lockedAt: null, lastError: null } }
);

export const failWebhookEvent = (event, error) => WebhookEvent.updateOne(
  { _id: event._id },
  {
    $set: {
      status: 'failed',
      lockedAt: null,
      lastError: String(error?.message || error).slice(0, 2000),
    },
  }
);
