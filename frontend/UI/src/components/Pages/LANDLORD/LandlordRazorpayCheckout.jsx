/**
 * LandlordRazorpayCheckout.jsx
 * -----------------------------
 * Drop-in subscription payment button for LandlordPayment.jsx
 *
 * Usage:
 *   <LandlordRazorpayCheckout
 *     planId={plan.id}
 *     planName="Featured Listing"
 *     planPrice={999}
 *     planValidity="60-day listing validity"
 *     landlordName="Ramesh Kumar"
 *     landlordEmail="ramesh@mail.com"
 *     landlordPhone="9800000000"
 *     onSuccess={(payment) => { ... }}
 *     onFailure={(msg)     => { ... }}
 *   />
 *
 * Mirrors the tenant's RazorpayCheckout.jsx pattern exactly —
 * same SDK lazy-load, same 4-step flow, adapted for subscription billing.
 * No axios — uses the project's own api.js (fetch-based).
 */
import { useState } from 'react';
import api from '../../../services/api.js';
import './LandlordRazorpayCheckout.css';

// ── Helpers ────────────────────────────────────────────────────────────────

/** Lazily injects the Razorpay checkout.js SDK only when the user clicks Pay */
function loadRazorpaySDK() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script   = document.createElement('script');
    script.src     = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/** Best-effort method label from the Razorpay payment_id prefix */
function detectPaymentMethod(razorpay_payment_id) {
  if (!razorpay_payment_id) return 'Razorpay';
  const id = razorpay_payment_id.toLowerCase();
  if (id.includes('upi'))  return 'UPI';
  if (id.includes('card')) return 'Card';
  return 'Razorpay';
}

/** Calculate 18% GST breakdown */
function calcGST(basePrice) {
  const gst   = parseFloat((basePrice * 0.18).toFixed(2));
  const total = parseFloat((basePrice + gst).toFixed(2));
  return { gst, total };
}

/** Format INR currency */
function inr(amount) {
  return Number(amount).toLocaleString('en-IN', {
    style:                 'currency',
    currency:              'INR',
    maximumFractionDigits: 0,
  });
}

// ── Component ───────────────────────────────────────────────────────────────

export default function LandlordRazorpayCheckout({
  planId,
  planName      = 'Subscription Plan',
  planPrice     = 0,
  planValidity  = '',
  landlordName  = '',
  landlordEmail = '',
  landlordPhone = '',
  onSuccess,
  onFailure,
}) {
  const [loading, setLoading] = useState(false);
  const [status,  setStatus]  = useState(null); // null | 'success' | 'failed' | 'cancelled'

  const { gst, total } = calcGST(planPrice);

  const handlePayNow = async () => {
    setLoading(true);
    setStatus(null);

    try {
      // ── 1. Inject Razorpay SDK ──────────────────────────────────────
      const sdkLoaded = await loadRazorpaySDK();
      if (!sdkLoaded) {
        alert('Could not load Razorpay. Please check your internet connection.');
        setLoading(false);
        return;
      }

      // ── 2. Create subscription order on our backend via api.js ─────
      // Backend should create a Razorpay order for `total` (price + GST)
      // and return { keyId, amount, currency, orderId, paymentId }
      const orderData = await api.createLandlordRazorpayOrder({
        planId,
        planName,
        amount: total,  // total includes 18% GST
      });

      // ── 3. Open Razorpay Checkout Popup ───────────────────────────
      const options = {
        key:         orderData.keyId,
        amount:      orderData.amount,   // already in paise from backend
        currency:    orderData.currency,
        name:        'Ghar Nishchit',
        description: `${planName} — Subscription`,
        image:       '/logo.png',
        order_id:    orderData.orderId,

        // Pre-fill landlord details so they don't have to retype them
        prefill: {
          name:    landlordName,
          email:   landlordEmail,
          contact: landlordPhone,
        },

        notes: {
          plan_id:       planId,
          plan_name:     planName,
          plan_validity: planValidity,
        },

        theme: {
          color:          '#01696f',         // Ghar Nishchit teal
          backdrop_color: 'rgba(0,0,0,0.6)',
        },

        // ── 4. Success handler: verify signature on our backend ───────
        handler: async function (response) {
          try {
            const verifyData = await api.verifyLandlordRazorpayPayment({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              paymentDbId:         orderData.paymentId,
              paymentMethod:       detectPaymentMethod(response.razorpay_payment_id),
              planId,
              planName,
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
      // NOTE: setLoading(false) is intentionally NOT called here —
      // it is called inside handler / ondismiss / payment.failed.

    } catch (err) {
      console.error('Landlord payment flow error:', err);
      const msg = err?.message ?? 'Could not initiate payment. Please try again.';
      alert(msg);
      setLoading(false);
    }
  };

  return (
    <div className="lrzp-checkout">

      {/* ── Plan Summary Card ── */}
      {status !== 'success' && (
        <div className="lrzp-plan-summary">
          <div className="lrzp-plan-summary__header">
            <span className="lrzp-plan-summary__name">{planName}</span>
            {planValidity && (
              <span className="lrzp-plan-summary__validity">{planValidity}</span>
            )}
          </div>

          <div className="lrzp-plan-summary__breakdown">
            <div className="lrzp-plan-summary__row">
              <span>Subscription fee</span>
              <span>{inr(planPrice)}</span>
            </div>
            <div className="lrzp-plan-summary__row">
              <span>GST (18%)</span>
              <span>{inr(gst)}</span>
            </div>
            <div className="lrzp-plan-summary__divider" />
            <div className="lrzp-plan-summary__row lrzp-plan-summary__row--total">
              <span>Total payable</span>
              <span>{inr(total)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Status Banners ── */}
      {status === 'success' && (
        <div className="lrzp-banner lrzp-banner--success" role="alert">
          <span className="lrzp-banner__icon">✅</span>
          <div>
            <strong>Payment Successful!</strong>
            <p>
              Your <em>{planName}</em> subscription ({inr(total)} incl. GST)
              has been activated.
            </p>
          </div>
        </div>
      )}

      {status === 'failed' && (
        <div className="lrzp-banner lrzp-banner--error" role="alert">
          <span className="lrzp-banner__icon">❌</span>
          <div>
            <strong>Payment Failed</strong>
            <p>Please try again or use a different payment method.</p>
          </div>
        </div>
      )}

      {status === 'cancelled' && (
        <div className="lrzp-banner lrzp-banner--warning" role="alert">
          <span className="lrzp-banner__icon">⚠️</span>
          <div>
            <strong>Payment Cancelled</strong>
            <p>You closed the payment window. Click Pay to try again.</p>
          </div>
        </div>
      )}

      {/* ── Pay Button — hidden after success ── */}
      {status !== 'success' && (
        <button
          className={`lrzp-pay-btn${loading ? ' lrzp-pay-btn--loading' : ''}`}
          onClick={handlePayNow}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? (
            <>
              <span className="lrzp-spinner" aria-hidden="true" />
              Processing…
            </>
          ) : (
            <>
              <svg
                className="lrzp-pay-btn__icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              Pay {inr(total)}
            </>
          )}
        </button>
      )}

      <p className="lrzp-secure-note">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          width="12"
          height="12"
          aria-hidden="true"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        Secured by Razorpay — Supports Card, UPI, Net Banking &amp; Wallets
      </p>
    </div>
  );
}
