import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ quiet: true });

const { Pool } = pg;
const rawConnectionString = process.env.NEONDB_URL?.trim();
const normalizeConnectionString = (value) => {
  if (!value) return value;
  const url = new URL(value);
  // pg currently treats sslmode=require as verify-full and warns that this
  // alias will weaken in its next major release. Make the intended certificate
  // and hostname verification explicit now.
  if (url.searchParams.get('sslmode') === 'require') {
    url.searchParams.set('sslmode', 'verify-full');
  }
  return url.toString();
};
const connectionString = normalizeConnectionString(rawConnectionString);
const sslMode = connectionString
  ? new URL(connectionString).searchParams.get('sslmode')
  : null;
const queryTimeoutMs = Number(process.env.NEON_QUERY_TIMEOUT_MS) || 10000;
const connectionTimeoutMs = Number(process.env.NEON_CONNECT_TIMEOUT_MS) || 20000;

export const isNeonConfigured = Boolean(connectionString);

const pool = new Pool({
  connectionString,
  // Neon requires TLS. Disposable local PostgreSQL used by integration tests
  // explicitly opts out with sslmode=disable.
  ssl: sslMode === 'disable' ? false : { rejectUnauthorized: false },
  max: 10,                  // max pool connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: connectionTimeoutMs,
  query_timeout: queryTimeoutMs,
  statement_timeout: queryTimeoutMs,
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
