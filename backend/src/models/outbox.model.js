import mongoose from 'mongoose';

const outboxSchema = new mongoose.Schema(
  {
    aggregateType: {
      type: String,
      required: true,
      enum: ['Contract']
    },
    aggregateId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    action: {
      type: String,
      required: true,
      enum: ['sync_contract']
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
      index: true
    },
    retries: {
      type: Number,
      default: 0,
      index: true
    },
    lastError: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound index to quickly pull next jobs to process
outboxSchema.index({ status: 1, retries: 1, createdAt: 1 });

const Outbox = mongoose.model('Outbox', outboxSchema);

export default Outbox;
