/**
 * NeonDB Schema Initializer
 * Run this ONCE to create all tables in NeonDB.
 * Command: node src/db/initNeonSchema.js
 *
 * Tables created:
 *   - users
 *   - payments
 *   - contracts
 *   - visits
 *   - favorites
 */

import { query } from './neon.js';

const createTables = async () => {
  console.log('[Schema] Starting NeonDB schema creation...\n');

  // ── USERS ──────────────────────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id            VARCHAR(24) PRIMARY KEY,        -- MongoDB ObjectId as string
      name          VARCHAR(255) NOT NULL,
      phone         VARCHAR(20)  NOT NULL UNIQUE,
      email         VARCHAR(255) UNIQUE,
      role          VARCHAR(10)  NOT NULL CHECK (role IN ('tenant', 'landlord')),
      password      TEXT         NOT NULL,
      profile_picture TEXT       DEFAULT '',
      created_at    TIMESTAMPTZ  DEFAULT NOW()
    );
  `);
  console.log('[Schema] ✔ users table ready');

  // ── PAYMENTS ────────────────────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS payments (
      id                  VARCHAR(24) PRIMARY KEY,   -- MongoDB ObjectId as string
      tenant_id           VARCHAR(24) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      property_id         VARCHAR(24),               -- MongoDB ObjectId (no FK — lives in MongoDB)
      amount              NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
      status              VARCHAR(10) NOT NULL DEFAULT 'Pending'
                            CHECK (status IN ('Paid','Pending','Overdue','Failed')),
      payment_method      VARCHAR(20) DEFAULT 'Razorpay'
                            CHECK (payment_method IN ('UPI','Bank Transfer','Cash','Card','Razorpay','Other')),
      due_date            TIMESTAMPTZ,
      paid_at             TIMESTAMPTZ,
      note                TEXT DEFAULT '',
      razorpay_order_id   VARCHAR(100) UNIQUE,
      razorpay_payment_id VARCHAR(100),
      created_at          TIMESTAMPTZ DEFAULT NOW(),
      updated_at          TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log('[Schema] ✔ payments table ready');

  // ── CONTRACTS ───────────────────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS contracts (
      id                  VARCHAR(24) PRIMARY KEY,
      tenant_id           VARCHAR(24) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      landlord_id         VARCHAR(24) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      property_id         VARCHAR(24) NOT NULL,      -- MongoDB ObjectId (no FK — lives in MongoDB)
      type                VARCHAR(20) DEFAULT 'lease'
                            CHECK (type IN ('lease','rental','sublease')),
      duration            INTEGER NOT NULL,           -- months
      rent_amount         NUMERIC(12,2) NOT NULL,
      security_deposit    NUMERIC(12,2) NOT NULL,
      start_date          DATE NOT NULL,
      end_date            DATE NOT NULL,
      status              VARCHAR(20) DEFAULT 'pending'
                            CHECK (status IN ('pending','active','completed','cancelled')),
      -- Terms stored as booleans
      pets_allowed        BOOLEAN DEFAULT false,
      smoking_allowed     BOOLEAN DEFAULT false,
      subletting_allowed  BOOLEAN DEFAULT false,
      early_termination   BOOLEAN DEFAULT false,
      custom_clauses      TEXT DEFAULT '',
      created_at          TIMESTAMPTZ DEFAULT NOW(),
      updated_at          TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log('[Schema] ✔ contracts table ready');

  // ── VISITS ──────────────────────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS visits (
      id            VARCHAR(24) PRIMARY KEY,
      tenant_id     VARCHAR(24) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      landlord_id   VARCHAR(24) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      property_id   VARCHAR(24) NOT NULL,            -- MongoDB ObjectId
      visit_date    DATE NOT NULL,
      visit_time    VARCHAR(20) NOT NULL,
      type          VARCHAR(20) DEFAULT 'in-person'
                      CHECK (type IN ('in-person','virtual')),
      notes         TEXT DEFAULT '',
      status        VARCHAR(20) DEFAULT 'scheduled'
                      CHECK (status IN ('pending','scheduled','completed','cancelled')),
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      updated_at    TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log('[Schema] ✔ visits table ready');

  // ── FAVORITES ───────────────────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS favorites (
      seeker_id    VARCHAR(24) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      property_id  VARCHAR(24) NOT NULL,              -- MongoDB ObjectId
      created_at   TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (seeker_id, property_id)
    );
  `);
  console.log('[Schema] ✔ favorites table ready');

  // ── INDEXES ─────────────────────────────────────────────────────────────────
  await query(`CREATE INDEX IF NOT EXISTS idx_payments_tenant    ON payments(tenant_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_payments_status    ON payments(status);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_contracts_tenant   ON contracts(tenant_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_contracts_landlord ON contracts(landlord_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_contracts_status   ON contracts(status);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_visits_tenant      ON visits(tenant_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_visits_landlord    ON visits(landlord_id);`);
  console.log('[Schema] ✔ Indexes created');

  console.log('\n[Schema] ✅ All NeonDB tables and indexes created successfully!');
  process.exit(0);
};

createTables().catch((err) => {
  console.error('[Schema] ❌ Failed to create schema:', err.message);
  process.exit(1);
});
