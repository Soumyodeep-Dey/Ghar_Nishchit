import mongoose from 'mongoose';
import pool, { isNeonConfigured } from '../db/neon.js';
import { isShuttingDown } from '../utils/serviceState.js';

export const getLiveness = (_req, res) => {
  res.status(200).json({ status: 'ok' });
};

export const getReadiness = async (_req, res) => {
  const checks = {
    server: isShuttingDown() ? 'unavailable' : 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'ok' : 'unavailable',
    neon: isNeonConfigured ? 'unavailable' : 'not_configured',
  };

  const criticalReady = checks.server === 'ok' && checks.mongodb === 'ok';
  if (!criticalReady) {
    return res.status(503).json({ status: 'not_ready', checks });
  }

  if (isNeonConfigured) {
    try {
      await pool.query({ text: 'SELECT 1', query_timeout: 2000 });
      checks.neon = 'ok';
    } catch {
      // Do not expose connection details or credentials through health responses.
    }
  }

  const degraded = checks.neon !== 'ok';
  return res.status(200).json({
    status: degraded ? 'degraded' : 'ready',
    checks,
  });
};

