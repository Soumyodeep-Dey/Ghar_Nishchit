import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ quiet: true });

const { Pool } = pg;
const connectionString = process.env.NEONDB_URL?.trim();

export const isNeonConfigured = Boolean(connectionString);

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 10,                  // max pool connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('connect', () => {
  console.log('[NeonDB] Client connected ✔');
});

pool.on('error', (err) => {
  console.error('[NeonDB] Unexpected pool error:', err.message);
});

/**
 * Run a parameterised query against NeonDB.
 * Usage: const { rows } = await query('SELECT * FROM users WHERE id=$1', [id]);
 */
export const query = (text, params) => {
  if (!isNeonConfigured) {
    throw new Error('NEONDB_URL is not configured');
  }
  return pool.query(text, params);
};

export default pool;
