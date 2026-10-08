import Outbox from '../models/outbox.model.js';
import { query as neonQuery } from '../db/neon.js';
import { logger } from './logger.js';

let isRunning = false;
let intervalId = null;
let activeRun = null;

const toDate = (d) => d ? new Date(d).toISOString().split('T')[0] : null;

const syncContractToNeon = async (c) => {
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
      c._id.toString(),
      c.tenant?.toString(),
      c.landlord?.toString(),
      c.property?.toString(),
      c.type || 'lease',
      Number(c.duration),
      Number(c.rentAmount),
      Number(c.securityDeposit),
      toDate(c.startDate),
      toDate(c.endDate),
      c.status || 'pending',
      c.terms?.petsAllowed       ?? false,
      c.terms?.smokingAllowed    ?? false,
      c.terms?.sublettingAllowed ?? false,
      c.terms?.earlyTermination  ?? false,
      c.customClauses || '',
      c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
      c.updatedAt ? new Date(c.updatedAt).toISOString() : new Date().toISOString(),
    ]
  );
};

const processBatch = async () => {
    if (isRunning) return; // Guard against overlapping runs
    isRunning = true;

    try {
      // Fetch up to 10 pending or failed outbox jobs
      const jobs = await Outbox.find({
        status: { $in: ['pending', 'failed'] },
        retries: { $lt: 5 }
      }).sort({ createdAt: 1 }).limit(10);

      for (const job of jobs) {
        try {
          if (job.action === 'sync_contract') {
            await syncContractToNeon(job.payload);
          }

          // Mark job as successfully synced
          job.status = 'completed';
          job.lastError = null;
          await job.save();
          logger.info('outbox_job_completed', {
            jobId: job._id.toString(),
            aggregateId: job.aggregateId,
          });
        } catch (jobError) {
          job.retries += 1;
          job.status = 'failed';
          job.lastError = jobError.message;
          await job.save();
          logger.error('outbox_job_failed', {
            jobId: job._id.toString(),
            attempt: job.retries,
            err: jobError,
          });
        }
      }
    } catch (err) {
      logger.error('outbox_poll_failed', { err });
    } finally {
      isRunning = false;
    }
};

export const startOutboxWorker = () => {
  if (intervalId) return;

  logger.info('outbox_worker_started', { intervalMs: 10000 });
  intervalId = setInterval(() => {
    activeRun = processBatch().finally(() => {
      activeRun = null;
    });
  }, 10000);
};

export const stopOutboxWorker = async () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }

  if (activeRun) await activeRun;
  logger.info('outbox_worker_stopped');
};
