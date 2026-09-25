import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import propertyRoutes           from './routes/property.routes.js';
import userRoutes               from './routes/user.routes.js';
import authRoutes               from './routes/auth.routes.js';
import favouritesRoutes         from './routes/favourites.routes.js';
import tenantRoutes             from './routes/tenant.routes.js';
import maintenanceRoutes        from './routes/maintenance.routes.js';
import inquiryRoutes            from './routes/inquiry.routes.js';
import notificationRoutes       from './routes/notification.routes.js';
import paymentRoutes            from './routes/payment.routes.js';
import landlordPaymentRoutes    from './routes/landlordPayment.routes.js';
import visitRoutes              from './routes/visit.routes.js';
import adminRoutes              from './routes/admin.routes.js';
import contractRoutes           from './routes/contract.routes.js';
import supportRoutes            from './routes/support.routes.js';
import aiRoutes                 from './routes/ai.routes.js';
import { globalErrorHandler }   from './middlewares/error.middleware.js';
import { writeRateLimit }       from './middlewares/rateLimit.middleware.js';
import { handleWebhook }        from './controllers/payment.controller.js';
import { handleLandlordWebhook } from './controllers/landlordPayment.controller.js';
dotenv.config();

const app = express();

app.use(
  cors({
    origin: [process.env.FRONTEND_URL, 'http://localhost:5173'].filter(Boolean),
    credentials: true,
  })
);

// ── Razorpay Webhooks ────────────────────────────────────────────────────────
// MUST be registered BEFORE express.json() so the raw Buffer body is intact
// for HMAC-SHA256 signature verification.

// Tenant rent payment webhook
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), handleWebhook);
app.post('/api/landlord-payments/webhook', express.raw({ type: 'application/json' }), handleLandlordWebhook);

// ── Global body parsing (all routes below get parsed JSON) ───────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use((req, res, next) => ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) ? writeRateLimit(req, res, next) : next());

app.get('/', (_req, res) => {
  res.status(200).json({ status: 'success', message: 'API is running' });
});

// ── Route mounting ───────────────────────────────────────────────────────────
app.use('/api/properties',        propertyRoutes);
app.use('/api/users',             userRoutes);
app.use('/api/auth',              authRoutes);
app.use('/api/favourites',        favouritesRoutes);
app.use('/api/tenants',           tenantRoutes);
app.use('/api/maintenance',       maintenanceRoutes);
app.use('/api/inquiries',         inquiryRoutes);
app.use('/api/notifications',     notificationRoutes);
app.use('/api/payments',          paymentRoutes);           // tenant rent payments
app.use('/api/landlord-payments', landlordPaymentRoutes);   // landlord subscription payments
app.use('/api/visits',            visitRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/contracts',         contractRoutes);
app.use('/api/support',           supportRoutes);
app.use('/api/ai',                aiRoutes);

app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));
app.use(globalErrorHandler);

export { app };
