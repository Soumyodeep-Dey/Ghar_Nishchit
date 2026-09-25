const buckets = new Map();

const clientKey = (req) => req.ip || req.socket?.remoteAddress || "unknown";

export const createRateLimiter = ({ windowMs, max, keyPrefix }) => (req, res, next) => {
  const now = Date.now();
  const key = `${keyPrefix}:${clientKey(req)}`;
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return next();
  }

  current.count += 1;
  if (current.count > max) {
    const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    res.set("Retry-After", String(retryAfter));
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }

  next();
};

export const authRateLimit = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 20, keyPrefix: "auth" });
export const writeRateLimit = createRateLimiter({ windowMs: 60 * 1000, max: 60, keyPrefix: "write" });
export const aiRateLimit = createRateLimiter({ windowMs: 60 * 1000, max: 10, keyPrefix: "ai" });
