import { randomUUID } from 'node:crypto';
import os from 'node:os';
import Outbox from '../models/outbox.model.js';
import { query as neonQuery } from '../db/neon.js';
import { logger } from './logger.js';

const MAX_RETRIES = 5;
const BATCH_SIZE = 10;
const POLL_INTERVAL_MS = Number(process.env.OUTBOX_POLL_INTERVAL_MS) || 10000;
const LEASE_DURATION_MS = Number(process.env.OUTBOX_LEASE_DURATION_MS) || 60000;
const RETRY_BASE_DELAY_MS = Number(process.env.OUTBOX_RETRY_BASE_DELAY_MS) || 10000;
const WORKER_ID = process.env.OUTBOX_WORKER_ID || `${os.hostname()}-${process.pid}-${randomUUID().slice(0, 8)}`;

let isRunning = false;
let intervalId = null;
let activeRun = null;

const toDate = (date) => date ? new Date(date).toISOString().split('T')[0] : null;

export const retryDelayMs = (attempt, baseDelayMs = RETRY_BASE_DELAY_MS) => (
  baseDelayMs * (2 ** Math.max(0, attempt - 1))
);

export const failureState = (attempt, now = Date.now()) => {
  if (attempt >= MAX_RETRIES) return { status: 'dead_letter', nextAttemptAt: null };
  return {
    status: 'failed',
    nextAttemptAt: new Date(now + retryDelayMs(attempt)),
  };
};

const syncContractToNeon = async (contract) => {
  await neonQuery(
    `INSERT INTO contracts (
       id, tenant_id, landlord_id, property_id, type, duration,
       rent_amount, security_deposit, start_date, end_date, status,
       pets_allowed, smoking_allowed, subletting_allowed, early_termination,
       custom_clauses, created_at, updated_at
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
     ON CONFLICT (id) DO UPDATE SET
       status             = EXCLUDED.status,
       rent_amount        = EXCLUDED.rent_amount,
       security_deposit   = EXCLUDED.security_deposit,
       start_date         = EXCLUDED.start_date,
       end_date           = EXCLUDED.end_date,
       pets_allowed       = EXCLUDED.pets_allowed,
       smoking_allowed    = EXCLUDED.smoking_allowed,
       subletting_allowed = EXCLUDED.subletting_allowed,
       early_termination  = EXCLUDED.early_termination,
       custom_clauses     = EXCLUDED.custom_clauses,
       updated_at         = NOW()`,
    [
      contract._id.toString(),
      contract.tenant?.toString(),
      contract.landlord?.toString(),
      contract.property?.toString(),
      contract.type || 'lease',
      Number(contract.duration),
      Number(contract.rentAmount),
      Number(contract.securityDeposit),
      toDate(contract.startDate),
      toDate(contract.endDate),
      contract.status || 'pending',
      contract.terms?.petsAllowed ?? false,
      contract.terms?.smokingAllowed ?? false,
      contract.terms?.sublettingAllowed ?? false,
      contract.terms?.earlyTermination ?? false,
      contract.customClauses || '',
      contract.createdAt ? new Date(contract.createdAt).toISOString() : new Date().toISOString(),
      contract.updatedAt ? new Date(contract.updatedAt).toISOString() : new Date().toISOString(),
    ]
  );
};

const claimNextJob = async () => {
  const now = new Date();
  const expiredLease = new Date(now.getTime() - LEASE_DURATION_MS);
  return Outbox.findOneAndUpdate(
    {
      retries: { $lt: MAX_RETRIES },
      $or: [
        {
          status: { $in: ['pending', 'failed'] },
          $or: [
            { nextAttemptAt: null },
            { nextAttemptAt: { $exists: false } },
            { nextAttemptAt: { $lte: now } },
          ],
        },
        { status: 'processing', lockedAt: { $lt: expiredLease } },
      ],
    },
    {
      $set: { status: 'processing', lockedAt: now, lockedBy: WORKER_ID },
    },
    { new: true, sort: { createdAt: 1 } }
  );
};

const processJob = async (job) => {
  try {
    if (job.action !== 'sync_contract') throw new Error(`Unsupported outbox action: ${job.action}`);
    await syncContractToNeon(job.payload);

    job.status = 'completed';
    job.lastError = null;
    job.nextAttemptAt = null;
    job.lockedAt = null;
    job.lockedBy = null;
    await job.save();
    logger.info('outbox_job_completed', {
      jobId: job._id.toString(),
      aggregateId: job.aggregateId,
      workerId: WORKER_ID,
    });
  } catch (err) {
    job.retries += 1;
    const state = failureState(job.retries);
    job.status = state.status;
    job.nextAttemptAt = state.nextAttemptAt;
    job.lastError = String(err.message || err).slice(0, 2000);
    job.lockedAt = null;
    job.lockedBy = null;
    await job.save();
    logger.error('outbox_job_failed', {
      jobId: job._id.toString(),
      attempt: job.retries,
      terminal: job.status === 'dead_letter',
      workerId: WORKER_ID,
      err,
    });
  }
};

const processBatch = async () => {
  if (isRunning) return;
  isRunning = true;
  try {
    for (let processed = 0; processed < BATCH_SIZE; processed += 1) {
      const job = await claimNextJob();
      if (!job) break;
      await processJob(job);
    }
  } catch (err) {
    logger.error('outbox_poll_failed', { workerId: WORKER_ID, err });
  } finally {
    isRunning = false;
  }
};

const runBatch = () => {
  if (activeRun) return activeRun;
  activeRun = processBatch().finally(() => {
    activeRun = null;
  });
  return activeRun;
};

export const startOutboxWorker = ({ runImmediately = true } = {}) => {
  if (intervalId) return;
  logger.info('outbox_worker_started', {
    workerId: WORKER_ID,
    intervalMs: POLL_INTERVAL_MS,
    leaseDurationMs: LEASE_DURATION_MS,
  });
  if (runImmediately) runBatch();
  intervalId = setInterval(runBatch, POLL_INTERVAL_MS);
};

export const stopOutboxWorker = async () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  if (activeRun) await activeRun;
  logger.info('outbox_worker_stopped', { workerId: WORKER_ID });
};
