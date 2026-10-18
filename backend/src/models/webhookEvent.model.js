import mongoose from 'mongoose';

const webhookEventSchema = new mongoose.Schema(
  {
    provider: { type: String, required: true, enum: ['razorpay'] },
    consumer: { type: String, required: true, enum: ['tenant_payment', 'landlord_payment'] },
    eventId: { type: String, required: true },
    eventType: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing',
    },
    attempts: { type: Number, default: 1 },
    lockedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
    lastError: { type: String, default: null },
  },
  { timestamps: true }
);

webhookEventSchema.index({ provider: 1, consumer: 1, eventId: 1 }, { unique: true });
webhookEventSchema.index({ status: 1, lockedAt: 1 });
webhookEventSchema.index({ completedAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export default mongoose.model('WebhookEvent', webhookEventSchema);
