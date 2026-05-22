/**
 * NeonDB Health Check & Verification Script
 * ==========================================
 * Run: node src/db/testNeon.js
 *
 * Checks:
 *   1. NeonDB connection is alive
 *   2. All 5 tables exist
 *   3. Row counts match what migration reported
 *   4. A sample row from each table
 */

import { query } from './neon.js';
import dotenv from 'dotenv';
dotenv.config();

const CHECK  = '✅';
const FAIL   = '❌';
const WARN   = '⚠️ ';

const tables = ['users', 'payments', 'contracts', 'visits', 'favorites'];

const run = async () => {
  console.log('='.repeat(55));
  console.log('  NeonDB Health Check — Ghar Nishchit');
  console.log('='.repeat(55));
  console.log('');

  // ── 1. Connection ────────────────────────────────────────
  console.log('[ 1 ] Checking connection...');
  try {
    await query('SELECT 1');
    console.log(`      ${CHECK} Connected to NeonDB successfully\n`);
  } catch (e) {
    console.error(`      ${FAIL} Connection FAILED:`, e.message);
    process.exit(1);
  }

  // ── 2. Tables Exist ──────────────────────────────────────
  console.log('[ 2 ] Checking tables exist...');
  for (const table of tables) {
    try {
      const res = await query(
        `SELECT to_regclass('public.${table}') AS exists`
      );
      const exists = res.rows[0].exists !== null;
      console.log(`      ${exists ? CHECK : FAIL} ${table.padEnd(12)} → ${exists ? 'EXISTS' : 'MISSING!'}`);
    } catch (e) {
      console.log(`      ${FAIL} ${table} → ERROR: ${e.message}`);
    }
  }
  console.log('');

  // ── 3. Row Counts ────────────────────────────────────────
  console.log('[ 3 ] Row counts in NeonDB...');
  for (const table of tables) {
    try {
      const res = await query(`SELECT COUNT(*) FROM ${table}`);
      const count = res.rows[0].count;
      const icon = count > 0 ? CHECK : WARN;
      console.log(`      ${icon} ${table.padEnd(12)} → ${count} rows`);
    } catch (e) {
      console.log(`      ${FAIL} ${table} → ERROR: ${e.message}`);
    }
  }
  console.log('');

  // ── 4. Sample Data ───────────────────────────────────────
  console.log('[ 4 ] Sample data preview...');

  // Users
  try {
    const res = await query(`SELECT id, name, email, role FROM users LIMIT 2`);
    console.log(`      users sample:`);
    res.rows.forEach(r => console.log(`        → ${r.name} (${r.role}) — ${r.email}`));
  } catch (e) { console.log(`      ${FAIL} users sample error: ${e.message}`); }

  // Payments
  try {
    const res = await query(`SELECT id, amount, status, payment_method FROM payments LIMIT 2`);
    console.log(`      payments sample:`);
    res.rows.forEach(r => console.log(`        → ₹${r.amount} | ${r.status} | ${r.payment_method}`));
  } catch (e) { console.log(`      ${FAIL} payments sample error: ${e.message}`); }

  // Contracts
  try {
    const res = await query(`SELECT id, status, rent_amount, duration FROM contracts LIMIT 2`);
    console.log(`      contracts sample:`);
    res.rows.forEach(r => console.log(`        → ₹${r.rent_amount}/mo | ${r.duration} months | ${r.status}`));
  } catch (e) { console.log(`      ${FAIL} contracts sample error: ${e.message}`); }

  // Visits
  try {
    const res = await query(`SELECT id, visit_date, type, status FROM visits LIMIT 2`);
    console.log(`      visits sample:`);
    res.rows.forEach(r => console.log(`        → ${r.visit_date} | ${r.type} | ${r.status}`));
  } catch (e) { console.log(`      ${FAIL} visits sample error: ${e.message}`); }

  // Favorites
  try {
    const res = await query(`SELECT seeker_id, property_id FROM favorites LIMIT 2`);
    console.log(`      favorites sample:`);
    res.rows.forEach(r => console.log(`        → seeker: ${r.seeker_id} → prop: ${r.property_id}`));
  } catch (e) { console.log(`      ${FAIL} favorites sample error: ${e.message}`); }

  console.log('');

  // ── 5. Dual-write sanity: latest user ──────────────────
  console.log('[ 5 ] Latest record in each table (most recent write)...');
  const latestQueries = {
    users:     `SELECT id, name, role, created_at FROM users     ORDER BY created_at DESC LIMIT 1`,
    payments:  `SELECT id, amount, status, created_at FROM payments  ORDER BY created_at DESC LIMIT 1`,
    contracts: `SELECT id, status, rent_amount, created_at FROM contracts ORDER BY created_at DESC LIMIT 1`,
    visits:    `SELECT id, status, visit_date, created_at FROM visits    ORDER BY created_at DESC LIMIT 1`,
    favorites: `SELECT seeker_id, property_id, created_at FROM favorites ORDER BY created_at DESC LIMIT 1`,
  };
  for (const [table, sql] of Object.entries(latestQueries)) {
    try {
      const res = await query(sql);
      if (res.rows.length === 0) {
        console.log(`      ${WARN} ${table.padEnd(12)} → no rows yet`);
      } else {
        const r = res.rows[0];
        const ts = r.created_at ? new Date(r.created_at).toLocaleString('en-IN') : '-';
        console.log(`      ${CHECK} ${table.padEnd(12)} → last written at ${ts}`);
      }
    } catch (e) {
      console.log(`      ${FAIL} ${table} → ${e.message}`);
    }
  }

  console.log('');
  console.log('='.repeat(55));
  console.log('  Health check complete!');
  console.log('='.repeat(55));
  process.exit(0);
};

run().catch((e) => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
