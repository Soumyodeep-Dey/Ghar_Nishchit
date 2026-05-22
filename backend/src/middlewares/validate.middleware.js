/**
 * Generic Express Request Validation Middleware using Zod Schema.
 * Accepts a schema with optional 'body', 'query', or 'params' keys.
 */
export const validate = (schema) => (req, res, next) => {
  try {
    const dataToValidate = {};
    if (schema.shape.body) dataToValidate.body = req.body;
    if (schema.shape.query) dataToValidate.query = req.query;
    if (schema.shape.params) dataToValidate.params = req.params;

    const parsed = schema.parse(dataToValidate);

    // Assign sanitized and parsed values back to request
    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;

    next();
  } catch (error) {
    next(error); // Passes the ZodError direct to globalErrorHandler
  }
};
