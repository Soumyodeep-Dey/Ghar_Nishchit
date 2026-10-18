import crypto from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pool, { isNeonConfigured } from './neon.js';

const directory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../migrations/neon'
);

const checksum = (source) => crypto.createHash('sha256').update(source).digest('hex');

export const runNeonMigrations = async () => {
  if (!isNeonConfigured) throw new Error('NEONDB_URL is required to run Neon migrations');

  const files = (await readdir(directory))
    .filter((file) => /^\d+_[a-z0-9_]+\.sql$/i.test(file))
    .sort((left, right) => left.localeCompare(right));
  const client = await pool.connect();

  try {
    await client.query('SELECT pg_advisory_lock($1)', [73429051]);
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        checksum VARCHAR(64) NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const appliedResult = await client.query('SELECT version, checksum FROM schema_migrations');
    const applied = new Map(appliedResult.rows.map((row) => [row.version, row.checksum]));

    for (const file of files) {
      const source = await readFile(path.join(directory, file), 'utf8');
      const sourceChecksum = checksum(source);
      if (applied.has(file)) {
        if (applied.get(file) !== sourceChecksum) {
          throw new Error(`Applied migration ${file} has been modified`);
        }
        console.log(`[Migration] skipped ${file}`);
        continue;
      }

      await client.query('BEGIN');
      try {
        await client.query(source);
        await client.query(
          'INSERT INTO schema_migrations (version, checksum) VALUES ($1, $2)',
          [file, sourceChecksum]
        );
        await client.query('COMMIT');
        console.log(`[Migration] applied ${file}`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
  } finally {
    await client.query('SELECT pg_advisory_unlock($1)', [73429051]).catch(() => {});
    client.release();
  }
};

runNeonMigrations()
  .then(async () => {
    console.log('[Migration] Neon schema is current');
    await pool.end();
  })
  .catch(async (error) => {
    console.error(`[Migration] failed: ${error.message}`);
    await pool.end().catch(() => {});
    process.exitCode = 1;
  });
