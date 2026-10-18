CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_razorpay_order
  ON payments(razorpay_order_id)
  WHERE razorpay_order_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_razorpay_payment
  ON payments(razorpay_payment_id)
  WHERE razorpay_payment_id IS NOT NULL;
