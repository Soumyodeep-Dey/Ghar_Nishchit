// dotenv MUST be the very first import in ES Modules.
// Using `import 'dotenv/config'` ensures .env is loaded before
// any other module (including payment.controller.js) is evaluated.
import 'dotenv/config';

// Validate critical environment variables at startup
const REQUIRED_ENV = ['MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
const missingEnv = REQUIRED_ENV.filter((envVar) => !process.env[envVar]);
if (missingEnv.length > 0) {
  console.error(`\x1b[31m[FATAL] Missing required environment variables: ${missingEnv.join(', ')}\x1b[0m`);
  process.exit(1);
}

import { connectDB } from './db/index.js';
import { app } from './app.js';
import mongoose from 'mongoose';
import pool from './db/neon.js';
import { startOutboxWorker, stopOutboxWorker } from './utils/outboxWorker.js';
import { logger } from './utils/logger.js';
import { markShuttingDown } from './utils/serviceState.js';

const PORT = Number(process.env.PORT) || 5000;
const SHUTDOWN_TIMEOUT_MS = Number(process.env.SHUTDOWN_TIMEOUT_MS) || 10000;
let server;
let shutdownStarted = false;

const closeServer = () => new Promise((resolve, reject) => {
  if (!server) return resolve();
  server.close((error) => error ? reject(error) : resolve());
  server.closeIdleConnections?.();
});

const shutdown = async (signal) => {
  if (shutdownStarted) return;
  shutdownStarted = true;
  markShuttingDown();
  logger.info('shutdown_started', { signal });

  const forceExitTimer = setTimeout(() => {
    logger.error('shutdown_timed_out', { timeoutMs: SHUTDOWN_TIMEOUT_MS });
    server?.closeAllConnections?.();
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  forceExitTimer.unref();

  try {
    await Promise.all([closeServer(), stopOutboxWorker()]);
    await Promise.allSettled([mongoose.disconnect(), pool.end()]);
    clearTimeout(forceExitTimer);
    logger.info('shutdown_completed');
    process.exit(0);
  } catch (err) {
    clearTimeout(forceExitTimer);
    logger.error('shutdown_failed', { err });
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

connectDB()
  .then(() => {
    server = app.listen(PORT, () => {
      logger.info('server_started', { port: PORT });
      // Boot background transactional outbox sync worker
      startOutboxWorker();
    });
  })
  .catch((err) => {
    logger.error('startup_failed', { err });
    process.exit(1);
  });
