import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import propertyRoutes      from './routes/property.routes.js';
import userRoutes          from './routes/user.routes.js';
import authRoutes          from './routes/auth.routes.js';
import favouritesRoutes    from './routes/favourites.routes.js';
import tenantRoutes        from './routes/tenant.routes.js';
import maintenanceRoutes   from './routes/maintenance.routes.js';
import inquiryRoutes       from './routes/inquiry.routes.js';
import notificationRoutes  from './routes/notification.routes.js';
import paymentRoutes       from './routes/payment.routes.js';
import visitRoutes         from './routes/visit.routes.js';
import contractRoutes      from './routes/contract.routes.js';
dotenv.config();

const app = express();

app.use(
  cors({
    origin: [process.env.FRONTEND_URL, 'http://localhost:5173'],
    credentials: true,
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANT: The Razorpay webhook route MUST be mounted BEFORE express.json().
// Razorpay sends a raw Buffer body, and we need it unparsed to verify the
// HMAC-SHA256 signature. If express.json() runs first, the raw body is lost
// and every webhook will fail with a signature mismatch.
//
// express.raw({ type: 'application/json' }) is applied on the route itself
// (see payment.routes.js), so only that one route receives a raw Buffer.
// All other routes continue to receive a parsed JSON object as normal.
// ─────────────────────────────────────────────────────────────────────────────
app.use('/api/payments/webhook', paymentRoutes);

// Global JSON + URL-encoded body parsing for all other routes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/', (_req, res) => {
  res.status(200).json({ status: 'success', message: 'API is running' });
});

app.use('/api/properties',    propertyRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/auth',          authRoutes);
app.use('/api/favourites',    favouritesRoutes);
app.use('/api/tenants',       tenantRoutes);
app.use('/api/maintenance',   maintenanceRoutes);
app.use('/api/inquiries',     inquiryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments',      paymentRoutes);
app.use('/api/visits',        visitRoutes);
app.use('/api/contracts',     contractRoutes);

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

export { app };
