CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(24) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(255) UNIQUE,
  role VARCHAR(10) NOT NULL CHECK (role IN ('tenant', 'landlord', 'admin')),
  password TEXT NOT NULL,
  profile_picture TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(24) PRIMARY KEY,
  tenant_id VARCHAR(24) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id VARCHAR(24),
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  status VARCHAR(10) NOT NULL DEFAULT 'Pending'
    CHECK (status IN ('Paid','Pending','Overdue','Failed')),
  payment_method VARCHAR(20) DEFAULT 'Razorpay'
    CHECK (payment_method IN ('UPI','Bank Transfer','Cash','Card','Razorpay','Other')),
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  note TEXT DEFAULT '',
  razorpay_order_id VARCHAR(100) UNIQUE,
  razorpay_payment_id VARCHAR(100) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contracts (
  id VARCHAR(24) PRIMARY KEY,
  tenant_id VARCHAR(24) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  landlord_id VARCHAR(24) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id VARCHAR(24) NOT NULL,
  type VARCHAR(20) DEFAULT 'lease' CHECK (type IN ('lease','rental','sublease')),
  duration INTEGER NOT NULL,
  rent_amount NUMERIC(12,2) NOT NULL,
  security_deposit NUMERIC(12,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending','active','completed','cancelled')),
  pets_allowed BOOLEAN DEFAULT false,
  smoking_allowed BOOLEAN DEFAULT false,
  subletting_allowed BOOLEAN DEFAULT false,
  early_termination BOOLEAN DEFAULT false,
  custom_clauses TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS visits (
  id VARCHAR(24) PRIMARY KEY,
  tenant_id VARCHAR(24) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  landlord_id VARCHAR(24) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id VARCHAR(24) NOT NULL,
  visit_date DATE NOT NULL,
  visit_time VARCHAR(20) NOT NULL,
  type VARCHAR(20) DEFAULT 'in-person' CHECK (type IN ('in-person','virtual')),
  notes TEXT DEFAULT '',
  status VARCHAR(20) DEFAULT 'scheduled'
    CHECK (status IN ('pending','scheduled','completed','cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS favorites (
  seeker_id VARCHAR(24) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id VARCHAR(24) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (seeker_id, property_id)
);

CREATE INDEX IF NOT EXISTS idx_payments_tenant ON payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_contracts_tenant ON contracts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contracts_landlord ON contracts(landlord_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_visits_tenant ON visits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_visits_landlord ON visits(landlord_id);
