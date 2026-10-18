import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import test, { mock } from 'node:test';
import Payment from '../src/models/payment.model.js';
import { verifyPayment } from '../src/controllers/payment.controller.js';

const responseRecorder = () => {
  const result = { statusCode: 200, body: null };
  return {
    result,
    response: {
      status(code) {
        result.statusCode = code;
        return this;
      },
      json(body) {
        result.body = body;
        return this;
      },
    },
  };
};

const signedRequest = ({ paymentId = 'pay_456', signature } = {}) => {
  const secret = 'controller-test-secret';
  process.env.RAZORPAY_KEY_SECRET = secret;
  return {
    user: { userId: '507f1f77bcf86cd799439011' },
    body: {
      razorpay_order_id: 'order_123',
      razorpay_payment_id: paymentId,
      razorpay_signature: signature || crypto
        .createHmac('sha256', secret)
        .update(`order_123|${paymentId}`)
        .digest('hex'),
      paymentDbId: '507f191e810c19729de860ea',
      paymentMethod: 'Razorpay',
    },
  };
};

test('an invalid client signature cannot mark a payment failed', async () => {
  const update = mock.method(Payment, 'findOneAndUpdate', async () => {
    throw new Error('payment state must not be mutated');
  });
  const { response, result } = responseRecorder();

  try {
    await verifyPayment(signedRequest({ signature: 'invalid' }), response);
    assert.equal(result.statusCode, 400);
    assert.equal(update.mock.callCount(), 0);
  } finally {
    update.mock.restore();
  }
});

test('replaying the same verified payment is an idempotent success', async () => {
  const existing = {
    status: 'Paid',
    razorpayPaymentId: 'pay_456',
    razorpayOrderId: 'order_123',
  };
  const find = mock.method(Payment, 'findOne', async () => existing);
  const update = mock.method(Payment, 'findOneAndUpdate', async () => {
    throw new Error('a completed payment must not transition again');
  });
  const { response, result } = responseRecorder();

  try {
    await verifyPayment(signedRequest(), response);
    assert.equal(result.statusCode, 200);
    assert.equal(result.body.payment, existing);
    assert.equal(update.mock.callCount(), 0);
  } finally {
    find.mock.restore();
    update.mock.restore();
  }
});

test('a paid order cannot be rebound to a different Razorpay payment ID', async () => {
  const find = mock.method(Payment, 'findOne', async () => ({
    status: 'Paid',
    razorpayPaymentId: 'pay_original',
    razorpayOrderId: 'order_123',
  }));
  const { response, result } = responseRecorder();

  try {
    await verifyPayment(signedRequest({ paymentId: 'pay_replay' }), response);
    assert.equal(result.statusCode, 409);
  } finally {
    find.mock.restore();
  }
});
