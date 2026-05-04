/**
 * MongoDB → NeonDB Data Migration Script
 * =========================================
 * Copies existing data from MongoDB into NeonDB for:
 *   users, payments, contracts, visits, favorites
 *
 * Run ONCE after schema init:
 *   node src/db/migrateToNeon.js
 *
 * Safe to re-run — uses INSERT ... ON CONFLICT DO NOTHING
 */

import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';
import { query } from './neon.js';

// ── Models ──────────────────────────────────────────────────────────────────
import User from '../models/user.model.js';
import Payment from '../models/payment.model.js';
import Contract from '../models/contract.model.js';
import Visit from '../models/visit.model.js';
import Favorite from '../models/favourites.model.js';

dotenv.config();
dns.setServers(['1.1.1.1', '8.8.8.8']);

// ── Connect MongoDB ──────────────────────────────────────────────────────────
const connectMongo = async () => {
  const mongoUri = process.env.MONGODB_URI?.trim().replace(/\/+$/, '');
  await mongoose.connect(`${mongoUri}/gharNishchit`);
  console.log('[Migrate] MongoDB connected ✔');
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const id = (doc) => doc._id.toString();
const ts = (d) => (d ? new Date(d).toISOString() : null);
const num = (v) => (v != null ? Number(v) : 0);

// ── Migrate Users ────────────────────────────────────────────────────────────
const migrateUsers = async () => {
  const users = await User.find().lean();
  console.log(`[Migrate] Found ${users.length} users in MongoDB`);
  let inserted = 0;

  for (const u of users) {
    try {
      const res = await query(
        `INSERT INTO users (id, name, phone, email, role, password, profile_picture, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (id) DO NOTHING`,
        [id(u), u.name, u.phone, u.email || null, u.role, u.password, u.profilePicture || '', ts(u.createdAt)]
      );
      if (res.rowCount > 0) inserted++;
    } catch (e) {
      console.warn(`  [User] skip ${id(u)} — ${e.message}`);
    }
  }
  console.log(`[Migrate] ✔ Users: ${inserted}/${users.length} inserted into NeonDB`);
};

// ── Migrate Payments ─────────────────────────────────────────────────────────
const migratePayments = async () => {
  const payments = await Payment.find().lean();
  console.log(`[Migrate] Found ${payments.length} payments in MongoDB`);
  let inserted = 0;

  for (const p of payments) {
    try {
      const res = await query(
        `INSERT INTO payments (
           id, tenant_id, property_id, amount, status, payment_method,
           due_date, paid_at, note, razorpay_order_id, razorpay_payment_id,
           created_at, updated_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         ON CONFLICT (id) DO NOTHING`,
        [
          id(p),
          p.tenantId?.toString(),
          p.propertyId?.toString() || null,
          num(p.amount),
          p.status || 'Pending',
          p.paymentMethod || 'Razorpay',
          ts(p.dueDate),
          ts(p.paidAt),
          p.note || '',
          p.razorpayOrderId || null,
          p.razorpayPaymentId || null,
          ts(p.createdAt),
          ts(p.updatedAt),
        ]
      );
      if (res.rowCount > 0) inserted++;
    } catch (e) {
      console.warn(`  [Payment] skip ${id(p)} — ${e.message}`);
    }
  }
  console.log(`[Migrate] ✔ Payments: ${inserted}/${payments.length} inserted into NeonDB`);
};

// ── Migrate Contracts ─────────────────────────────────────────────────────────
const migrateContracts = async () => {
  const contracts = await Contract.find().lean();
  console.log(`[Migrate] Found ${contracts.length} contracts in MongoDB`);
  let inserted = 0;

  for (const c of contracts) {
    try {
      const res = await query(
        `INSERT INTO contracts (
           id, tenant_id, landlord_id, property_id, type, duration,
           rent_amount, security_deposit, start_date, end_date, status,
           pets_allowed, smoking_allowed, subletting_allowed, early_termination,
           custom_clauses, created_at, updated_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
         ON CONFLICT (id) DO NOTHING`,
        [
          id(c),
          c.tenant?.toString(),
          c.landlord?.toString(),
          c.property?.toString(),
          c.type || 'lease',
          num(c.duration),
          num(c.rentAmount),
          num(c.securityDeposit),
          c.startDate ? new Date(c.startDate).toISOString().split('T')[0] : null,
          c.endDate   ? new Date(c.endDate).toISOString().split('T')[0]   : null,
          c.status || 'pending',
          c.terms?.petsAllowed       ?? false,
          c.terms?.smokingAllowed    ?? false,
          c.terms?.sublettingAllowed ?? false,
          c.terms?.earlyTermination  ?? false,
          c.customClauses || '',
          ts(c.createdAt),
          ts(c.updatedAt),
        ]
      );
      if (res.rowCount > 0) inserted++;
    } catch (e) {
      console.warn(`  [Contract] skip ${id(c)} — ${e.message}`);
    }
  }
  console.log(`[Migrate] ✔ Contracts: ${inserted}/${contracts.length} inserted into NeonDB`);
};

// ── Migrate Visits ────────────────────────────────────────────────────────────
const migrateVisits = async () => {
  const visits = await Visit.find().lean();
  console.log(`[Migrate] Found ${visits.length} visits in MongoDB`);
  let inserted = 0;

  for (const v of visits) {
    try {
      const res = await query(
        `INSERT INTO visits (
           id, tenant_id, landlord_id, property_id, visit_date, visit_time,
           type, notes, status, created_at, updated_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT (id) DO NOTHING`,
        [
          id(v),
          v.tenant?.toString(),
          v.landlord?.toString(),
          v.property?.toString(),
          v.date ? new Date(v.date).toISOString().split('T')[0] : null,
          v.time || '',
          v.type || 'in-person',
          v.notes || '',
          v.status || 'scheduled',
          ts(v.createdAt),
          ts(v.updatedAt),
        ]
      );
      if (res.rowCount > 0) inserted++;
    } catch (e) {
      console.warn(`  [Visit] skip ${id(v)} — ${e.message}`);
    }
  }
  console.log(`[Migrate] ✔ Visits: ${inserted}/${visits.length} inserted into NeonDB`);
};

// ── Migrate Favorites ─────────────────────────────────────────────────────────
const migrateFavorites = async () => {
  const favDocs = await Favorite.find().lean();
  console.log(`[Migrate] Found ${favDocs.length} favorite docs in MongoDB`);
  let inserted = 0;
  let total = 0;

  for (const fav of favDocs) {
    const seekerId = fav.seeker?.toString();
    for (const propId of fav.properties || []) {
      total++;
      try {
        const res = await query(
          `INSERT INTO favorites (seeker_id, property_id)
           VALUES ($1, $2)
           ON CONFLICT (seeker_id, property_id) DO NOTHING`,
          [seekerId, propId.toString()]
        );
        if (res.rowCount > 0) inserted++;
      } catch (e) {
        console.warn(`  [Favorite] skip ${seekerId}/${propId} — ${e.message}`);
      }
    }
  }
  console.log(`[Migrate] ✔ Favorites: ${inserted}/${total} rows inserted into NeonDB`);
};

// ── Main ──────────────────────────────────────────────────────────────────────
const run = async () => {
  try {
    await connectMongo();
    console.log('');

    await migrateUsers();
    await migratePayments();
    await migrateContracts();
    await migrateVisits();
    await migrateFavorites();

    console.log('\n[Migrate] ✅ Migration complete! MongoDB data is now in NeonDB.');
    console.log('[Migrate] MongoDB is still the active source — no disruption.');
  } catch (err) {
    console.error('[Migrate] ❌ Migration failed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

run();
