import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

if (!process.env.NEONDB_URL) {
  console.error('[NeonDB] ERROR: NEONDB_URL is not defined in .env');
}

const pool = new Pool({
  connectionString: process.env.NEONDB_URL,
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
export const query = (text, params) => pool.query(text, params);

export default pool;
