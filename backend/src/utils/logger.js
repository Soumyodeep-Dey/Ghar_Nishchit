const SENSITIVE_KEY = /authorization|cookie|password|secret|token|api[-_]?key|signature/i;

const redact = (value, seen = new WeakSet()) => {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: value.stack }),
    };
  }

  if (!value || typeof value !== 'object') return value;
  if (seen.has(value)) return '[Circular]';
  seen.add(value);

  if (Array.isArray(value)) return value.map((item) => redact(item, seen));

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      SENSITIVE_KEY.test(key) ? '[REDACTED]' : redact(item, seen),
    ])
  );
};

const write = (level, message, context = {}) => {
  const entry = redact({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  });

  const output = JSON.stringify(entry);
  if (level === 'error') console.error(output);
  else if (level === 'warn') console.warn(output);
  else console.log(output);
};

export const logger = {
  info: (message, context) => write('info', message, context),
  warn: (message, context) => write('warn', message, context),
  error: (message, context) => write('error', message, context),
};

