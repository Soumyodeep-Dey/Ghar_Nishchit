import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './db/index.js';
import pool, { isNeonConfigured } from './db/neon.js';
import { logger } from './utils/logger.js';
import { startOutboxWorker, stopOutboxWorker } from './utils/outboxWorker.js';

if (!process.env.MONGODB_URI || !isNeonConfigured) {
  logger.error('worker_configuration_invalid', {
    missing: [
      ...(!process.env.MONGODB_URI ? ['MONGODB_URI'] : []),
      ...(!isNeonConfigured ? ['NEONDB_URL'] : []),
    ],
  });
  process.exit(1);
}

let shutdownStarted = false;
const shutdown = async (signal) => {
  if (shutdownStarted) return;
  shutdownStarted = true;
  logger.info('worker_shutdown_started', { signal });
  const timeoutMs = Number(process.env.SHUTDOWN_TIMEOUT_MS) || 10000;
  const forceExitTimer = setTimeout(() => {
    logger.error('worker_shutdown_timed_out', { timeoutMs });
    process.exit(1);
  }, timeoutMs);
  forceExitTimer.unref();
  try {
    await stopOutboxWorker();
    await Promise.allSettled([mongoose.disconnect(), pool.end()]);
    clearTimeout(forceExitTimer);
    logger.info('worker_shutdown_completed');
    process.exit(0);
  } catch (err) {
    clearTimeout(forceExitTimer);
    logger.error('worker_shutdown_failed', { err });
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

connectDB()
  .then(() => {
    startOutboxWorker();
    logger.info('outbox_worker_process_ready');
  })
  .catch((err) => {
    logger.error('worker_startup_failed', { err });
    process.exit(1);
  });

