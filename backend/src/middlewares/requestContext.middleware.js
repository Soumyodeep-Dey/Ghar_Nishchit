import { randomUUID } from 'node:crypto';
import { logger } from '../utils/logger.js';

const REQUEST_ID_PATTERN = /^[a-zA-Z0-9._-]{1,100}$/;

export const requestContext = (req, res, next) => {
  const suppliedRequestId = req.get('x-request-id');
  req.requestId = REQUEST_ID_PATTERN.test(suppliedRequestId || '')
    ? suppliedRequestId
    : randomUUID();

  res.setHeader('x-request-id', req.requestId);
  const startedAt = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    logger.info('http_request_completed', {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
    });
  });

  next();
};

