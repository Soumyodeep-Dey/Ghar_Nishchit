import crypto from 'node:crypto';

const safeEqual = (left, right) => {
  if (typeof left !== 'string' || typeof right !== 'string') return false;
  const leftBuffer = Buffer.from(left, 'utf8');
  const rightBuffer = Buffer.from(right, 'utf8');
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

export const verifyRazorpayPaymentSignature = ({ secret, orderId, paymentId, signature }) => {
  if (!secret || !orderId || !paymentId || !signature) return false;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return safeEqual(expected, signature);
};

export const verifyRazorpayWebhookSignature = ({ secret, body, signature }) => {
  if (!secret || !Buffer.isBuffer(body) || !signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return safeEqual(expected, signature);
};

export const webhookEventId = ({ body, headerEventId }) => {
  if (typeof headerEventId === 'string' && headerEventId.trim()) return headerEventId.trim();
  return crypto.createHash('sha256').update(body).digest('hex');
};
