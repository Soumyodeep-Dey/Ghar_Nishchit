# Razorpay Payment Gateway — Setup Guide

This guide explains how to activate the Razorpay payment gateway
already integrated into the `dev` branch of Ghar Nishchit.

---

## 1. Install the Razorpay SDK

```bash
cd backend
npm install razorpay
```

---

## 2. Configure Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in your keys:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

Get API keys from: https://dashboard.razorpay.com/app/keys

> ⚠️ Never commit `.env` to git. It is already in `.gitignore`.

---

## 3. Files Changed / Added

| File | Change |
|---|---|
| `backend/src/models/payment.model.js` | Added `razorpayOrderId`, `razorpayPaymentId` fields + `'Razorpay'` enum |
| `backend/src/controllers/payment.controller.js` | Added `createOrder`, `verifyPayment`, `handleWebhook` |
| `backend/src/routes/payment.routes.js` | Added `POST /create-order`, `POST /verify`, `POST /webhook` |
| `frontend/UI/src/components/Pages/TENANT/RazorpayCheckout.jsx` | New drop-in component |
| `frontend/UI/src/components/Pages/TENANT/RazorpayCheckout.css` | Teal-themed styles, dark mode |

---

## 4. Use `<RazorpayCheckout>` in `TenantPayment.jsx`

```jsx
import RazorpayCheckout from './RazorpayCheckout';

// Find where your existing "Pay Now" button is and replace it:
<RazorpayCheckout
  propertyId={selectedPayment.property._id}
  amount={selectedPayment.amount}
  dueDate={selectedPayment.dueDate}
  tenantName={user.name}
  tenantEmail={user.email}
  tenantPhone={user.phone}
  note="Monthly rent payment"
  onSuccess={(payment) => {
    fetchPayments();          // refresh the payments list
    toast.success('Rent paid successfully!');
  }}
  onFailure={(msg) => toast.error(msg)}
/>
```

---

## 5. Register the Webhook in Razorpay Dashboard

1. Open https://dashboard.razorpay.com → **Settings → Webhooks → Add New Webhook**
2. URL: `https://yourdomain.com/api/payments/webhook`
3. Enable events: `payment.captured` and `payment.failed`
4. Copy the **Webhook Secret** shown → paste into `.env` as `RAZORPAY_WEBHOOK_SECRET`

The webhook acts as a safety net — if the user closes their browser
before the frontend calls `/verify`, the webhook will still update
the payment status in the database.

---

## 6. Payment Flow (End-to-End)

```
Tenant clicks "Pay Rent"
        ↓
POST /api/payments/create-order
  → Razorpay order created
  → Pending Payment saved in MongoDB
  → Returns { orderId, amount, keyId, paymentId }
        ↓
Razorpay Checkout popup opens
  → Tenant picks: Card / UPI / Net Banking / Wallet
  → Enters OTP / PIN if required
  → Razorpay processes the payment
        ↓
POST /api/payments/verify
  → HMAC-SHA256 signature verified on backend
  → ✅ Match  → status = 'Paid', paidAt = now
  → ❌ No match → status = 'Failed'
        ↓
Frontend shows success / error banner
        ↓
Razorpay Webhook fires (backup)
  → payment.captured → marks Paid (if not already)
  → payment.failed   → marks Failed
```

---

## 7. Test Cards & UPI (No Real Money)

| Method | Details |
|---|---|
| **Card — Success** | `4111 1111 1111 1111` · Any expiry · CVV `123` |
| **Card — Failure** | `4000 0000 0000 0002` |
| **UPI — Success** | `success@razorpay` |
| **UPI — Failure** | `failure@razorpay` |
| **Net Banking** | Select any bank → use test credentials shown |

Full reference: https://razorpay.com/docs/payments/payments/test-card-upi-details/

---

## 8. Security Checklist

- [x] `RAZORPAY_KEY_SECRET` lives only in `.env` — never sent to the frontend
- [x] Only `RAZORPAY_KEY_ID` (public key) is returned to the frontend
- [x] HMAC-SHA256 signature verified on every payment before marking Paid
- [x] Webhook signature independently verified before processing
- [x] Payment record created *before* checkout opens (prevents orphan orders)
- [x] All payment routes protected by `verifyToken` JWT middleware
- [x] `.env` is in `.gitignore` — double-check before pushing
- [x] Switch to `rzp_live_` keys before production deployment
