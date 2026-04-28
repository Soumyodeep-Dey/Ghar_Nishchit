/**
 * RazorpayCheckout.jsx
 * ---------------------
 * Drop-in payment button for TenantPayment.jsx
 *
 * Usage:
 *   <RazorpayCheckout
 *     propertyId={property._id}
 *     amount={5000}
 *     dueDate="2026-05-01"
 *     note="May rent"
 *     tenantName="Chandra"
 *     tenantEmail="chandra@mail.com"
 *     tenantPhone="9800000000"
 *     onSuccess={(payment) => { ... }}
 *     onFailure={(msg)     => { ... }}
 *   />
 *
 * No axios required — uses the project’s own api.js (fetch-based).
 */
import { useState } from 'react';
import api from '../../../services/api.js';
import './RazorpayCheckout.css';

// Lazily injects the Razorpay checkout.js SDK only when the user clicks Pay
function loadRazorpaySDK() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script  = document.createElement('script');
    script.src    = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// Best-effort method label from the Razorpay payment_id prefix
function detectPaymentMethod(razorpay_payment_id) {
  if (!razorpay_payment_id) return 'Razorpay';
  const id = razorpay_payment_id.toLowerCase();
  if (id.includes('upi'))  return 'UPI';
  if (id.includes('card')) return 'Card';
  return 'Razorpay';
}

export default function RazorpayCheckout({
  propertyId,
  amount,
  dueDate,
  note,
  tenantName  = '',
  tenantEmail = '',
  tenantPhone = '',
  onSuccess,
  onFailure,
}) {
  const [loading, setLoading] = useState(false);
  const [status,  setStatus]  = useState(null); // null | 'success' | 'failed' | 'cancelled'

  const handlePayNow = async () => {
    setLoading(true);
    setStatus(null);

    try {
      // ── 1. Inject Razorpay SDK ────────────────────────────────────
      const sdkLoaded = await loadRazorpaySDK();
      if (!sdkLoaded) {
        alert('Could not load Razorpay. Please check your internet connection.');
        setLoading(false);
        return;
      }

      // ── 2. Create order on our backend via api.js ────────────────
      // api.createRazorpayOrder uses the same fetch + auth header as all
      // other api.js calls — no axios, no duplicate token logic.
      const orderData = await api.createRazorpayOrder({ propertyId, amount, dueDate, note });

      // ── 3. Open Razorpay Checkout Popup ───────────────────────
      const options = {
        key:         orderData.keyId,
        amount:      orderData.amount,    // already in paise from backend
        currency:    orderData.currency,
        name:        'Ghar Nishchit',
        description: `Rent Payment — ₹${Number(amount).toLocaleString('en-IN')}`,
        image:       '/logo.png',
        order_id:    orderData.orderId,

        // Pre-fill tenant details so they don’t have to type them again
        prefill: {
          name:    tenantName,
          email:   tenantEmail,
          contact: tenantPhone,
        },

        theme: {
          color:          '#01696f',          // Ghar Nishchit teal
          backdrop_color: 'rgba(0,0,0,0.6)',
        },

        // ── 4. Success handler: verify signature on our backend ──────
        handler: async function (response) {
          try {
            const verifyData = await api.verifyRazorpayPayment({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              paymentDbId:         orderData.paymentId,
              paymentMethod:       detectPaymentMethod(response.razorpay_payment_id),
            });
            setStatus('success');
            setLoading(false);
            onSuccess?.(verifyData.payment);
          } catch {
            setStatus('failed');
            setLoading(false);
            onFailure?.(
              'Verification failed after payment. Contact support with payment ID: ' +
              response.razorpay_payment_id
            );
          }
        },

        // User closed the popup without paying
        modal: {
          ondismiss: () => {
            setStatus('cancelled');
            setLoading(false);
          },
          animation: true,
        },
      };

      const rzp = new window.Razorpay(options);

      // Payment failure (wrong OTP, insufficient funds, etc.)
      rzp.on('payment.failed', (response) => {
        console.error('Razorpay payment.failed:', response.error);
        setStatus('failed');
        setLoading(false);
        onFailure?.(response.error.description ?? 'Payment failed. Please try again.');
      });

      rzp.open();
      // setLoading(false) is intentionally NOT called here:
      // it is called inside handler / ondismiss / payment.failed.

    } catch (err) {
      console.error('Payment flow error:', err);
      const msg = err?.message ?? 'Could not initiate payment. Please try again.';
      alert(msg);
      setLoading(false);
    }
  };

  const formattedAmount = Number(amount).toLocaleString('en-IN', {
    style:    'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

  return (
    <div className="rzp-checkout">

      {/* Status banners */}
      {status === 'success' && (
        <div className="rzp-banner rzp-banner--success" role="alert">
          <span className="rzp-banner__icon">✅</span>
          <div>
            <strong>Payment Successful!</strong>
            <p>Your rent of {formattedAmount} has been recorded.</p>
          </div>
        </div>
      )}

      {status === 'failed' && (
        <div className="rzp-banner rzp-banner--error" role="alert">
          <span className="rzp-banner__icon">❌</span>
          <div>
            <strong>Payment Failed</strong>
            <p>Please try again or use a different payment method.</p>
          </div>
        </div>
      )}

      {status === 'cancelled' && (
        <div className="rzp-banner rzp-banner--warning" role="alert">
          <span className="rzp-banner__icon">⚠️</span>
          <div>
            <strong>Payment Cancelled</strong>
            <p>You closed the payment window. Click Pay to try again.</p>
          </div>
        </div>
      )}

      {/* Pay button — hidden after success */}
      {status !== 'success' && (
        <button
          className={`rzp-pay-btn${loading ? ' rzp-pay-btn--loading' : ''}`}
          onClick={handlePayNow}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? (
            <>
              <span className="rzp-spinner" aria-hidden="true" />
              Processing…
            </>
          ) : (
            <>
              <svg className="rzp-pay-btn__icon" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              Pay {formattedAmount}
            </>
          )}
        </button>
      )}

      <p className="rzp-secure-note">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          width="12" height="12" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        Secured by Razorpay — Supports Card, UPI, Net Banking &amp; Wallets
      </p>
    </div>
  );
}
