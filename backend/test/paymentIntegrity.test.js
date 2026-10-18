import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import test from 'node:test';
import {
  verifyRazorpayPaymentSignature,
  verifyRazorpayWebhookSignature,
  webhookEventId,
} from '../src/utils/paymentIntegrity.js';

test('payment signatures validate only the bound order and payment IDs', () => {
  const secret = 'test-secret';
  const signature = crypto
    .createHmac('sha256', secret)
    .update('order_123|pay_456')
    .digest('hex');

  assert.equal(verifyRazorpayPaymentSignature({
    secret,
    orderId: 'order_123',
    paymentId: 'pay_456',
    signature,
  }), true);
  assert.equal(verifyRazorpayPaymentSignature({
    secret,
    orderId: 'order_other',
    paymentId: 'pay_456',
    signature,
  }), false);
  assert.equal(verifyRazorpayPaymentSignature({
    secret,
    orderId: 'order_123',
    paymentId: 'pay_456',
    signature: `${signature}00`,
  }), false);
});

test('webhook signatures are calculated from the exact raw body', () => {
  const secret = 'webhook-secret';
  const body = Buffer.from('{"event":"payment.captured"}');
  const signature = crypto.createHmac('sha256', secret).update(body).digest('hex');

  assert.equal(verifyRazorpayWebhookSignature({ secret, body, signature }), true);
  assert.equal(verifyRazorpayWebhookSignature({
    secret,
    body: Buffer.from('{"event":"payment.failed"}'),
    signature,
  }), false);
  assert.equal(verifyRazorpayWebhookSignature({ secret, body: body.toString(), signature }), false);
});

test('webhook event IDs prefer the provider ID and otherwise hash the payload', () => {
  const body = Buffer.from('same-event');
  assert.equal(webhookEventId({ body, headerEventId: 'evt_123' }), 'evt_123');
  assert.equal(webhookEventId({ body }), webhookEventId({ body }));
  assert.notEqual(webhookEventId({ body }), webhookEventId({ body: Buffer.from('other-event') }));
});
