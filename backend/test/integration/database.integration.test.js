import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import request from 'supertest';

const mongoUri = process.env.TEST_MONGODB_URI?.trim();
const postgresUri = process.env.TEST_NEONDB_URL?.trim();

const databaseName = (uri, label) => {
  if (!uri) throw new Error(`${label} is required for integration tests`);
  const name = new URL(uri).pathname.replace(/^\//, '');
  if (!name.endsWith('_test')) {
    throw new Error(`${label} must target a database whose name ends in _test`);
  }
  return name;
};

databaseName(mongoUri, 'TEST_MONGODB_URI');
databaseName(postgresUri, 'TEST_NEONDB_URL');

process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = mongoUri;
process.env.NEONDB_URL = postgresUri;
process.env.JWT_SECRET ||= 'integration-access-secret';
process.env.JWT_REFRESH_SECRET ||= 'integration-refresh-secret';
process.env.RUN_OUTBOX_WORKER = 'false';

let app;
let pool;
let User;
let Property;
let Contract;
let Outbox;
let claimNextJob;
let claimWebhookEvent;
let completeWebhookEvent;

const register = (payload) => request(app).post('/api/auth/register').send(payload);

before(async () => {
  await mongoose.connect(mongoUri);

  ({ app } = await import('../../src/app.js'));
  ({ default: pool } = await import('../../src/db/neon.js'));
  ({ default: User } = await import('../../src/models/user.model.js'));
  ({ default: Property } = await import('../../src/models/property.model.js'));
  ({ default: Contract } = await import('../../src/models/contract.model.js'));
  ({ default: Outbox } = await import('../../src/models/outbox.model.js'));
  ({ claimNextJob } = await import('../../src/utils/outboxWorker.js'));
  ({ claimWebhookEvent, completeWebhookEvent } = await import('../../src/utils/webhookLedger.js'));

  await mongoose.connection.db.dropDatabase();
  await mongoose.syncIndexes();
  await pool.query('DELETE FROM users');
});

after(async () => {
  await mongoose.connection.db.dropDatabase();
  await pool.query('DELETE FROM users').catch(() => {});
  await Promise.allSettled([mongoose.disconnect(), pool.end()]);
});

test('migrations created the expected PostgreSQL schema', async () => {
  const migrations = await pool.query(
    'SELECT version FROM schema_migrations ORDER BY version'
  );
  assert.deepEqual(
    migrations.rows.map(({ version }) => version),
    ['001_initial_schema.sql', '002_payment_idempotency.sql']
  );

  const tables = await pool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('users', 'contracts', 'payments')
    ORDER BY table_name
  `);
  assert.deepEqual(
    tables.rows.map(({ table_name }) => table_name),
    ['contracts', 'payments', 'users']
  );
});

test('registration, login, refresh, profile, and account status use real persistence', async () => {
  const tenant = {
    name: 'Integration Tenant',
    phone: '9000000001',
    email: 'tenant.integration@example.test',
    role: 'tenant',
    password: 'ValidPassword123!',
  };

  const registered = await register(tenant);
  assert.equal(registered.status, 201);
  assert.equal(registered.body.user.role, 'tenant');
  assert.ok(registered.body.accessToken);
  assert.ok(registered.body.refreshToken);
  assert.equal(registered.body.user.password, undefined);

  const mongoUser = await User.findOne({ email: tenant.email }).lean();
  assert.ok(mongoUser);
  assert.notEqual(mongoUser.password, tenant.password);
  assert.equal(await bcrypt.compare(tenant.password, mongoUser.password), true);

  const neonUser = await pool.query(
    'SELECT id, email, role FROM users WHERE id = $1',
    [mongoUser._id.toString()]
  );
  assert.equal(neonUser.rowCount, 1);
  assert.equal(neonUser.rows[0].email, tenant.email);
  assert.equal(neonUser.rows[0].role, 'tenant');

  const duplicate = await register({ ...tenant, phone: '9000000099' });
  assert.equal(duplicate.status, 400);
  assert.equal(duplicate.body.error, 'Email already registered');

  const wrongPassword = await request(app)
    .post('/api/auth/login')
    .send({ email: tenant.email, password: 'incorrect-password' });
  assert.equal(wrongPassword.status, 400);

  const loggedIn = await request(app)
    .post('/api/auth/login')
    .send({ email: tenant.email, password: tenant.password });
  assert.equal(loggedIn.status, 200);
  assert.equal(loggedIn.body.user._id, mongoUser._id.toString());

  const profile = await request(app)
    .get('/api/auth/profile')
    .set('authorization', `Bearer ${loggedIn.body.accessToken}`);
  assert.equal(profile.status, 200);
  assert.equal(profile.body.email, tenant.email);
  assert.equal(profile.body.password, undefined);

  const refreshed = await request(app)
    .post('/api/auth/refresh')
    .send({ refreshToken: loggedIn.body.refreshToken });
  assert.equal(refreshed.status, 200);
  assert.ok(refreshed.body.accessToken);

  await User.updateOne({ _id: mongoUser._id }, { $set: { status: 'suspended' } });
  const suspendedLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: tenant.email, password: tenant.password });
  assert.equal(suspendedLogin.status, 403);

  const suspendedProfile = await request(app)
    .get('/api/auth/profile')
    .set('authorization', `Bearer ${loggedIn.body.accessToken}`);
  assert.equal(suspendedProfile.status, 403);
});

test('contract and outbox records commit together and enforce role/ownership rules', async () => {
  const landlordResponse = await register({
    name: 'Integration Landlord',
    phone: '9000000002',
    email: 'landlord.integration@example.test',
    role: 'landlord',
    password: 'ValidPassword123!',
  });
  const tenantResponse = await register({
    name: 'Contract Tenant',
    phone: '9000000003',
    email: 'contract.tenant@example.test',
    role: 'tenant',
    password: 'ValidPassword123!',
  });
  assert.equal(landlordResponse.status, 201);
  assert.equal(tenantResponse.status, 201);

  const landlordId = landlordResponse.body.user._id;
  const tenantId = tenantResponse.body.user._id;
  const property = await Property.create({
    title: 'Integration Home',
    description: 'Created only in the disposable integration database.',
    price: 25000,
    postedBy: landlordId,
  });
  const contractPayload = {
    tenantId,
    contractType: 'lease',
    duration: 12,
    rentAmount: 25000,
    securityDeposit: 50000,
    startDate: '2027-01-01',
    property: property.title,
    terms: { petsAllowed: true },
  };

  const forbidden = await request(app)
    .post('/api/contracts/send')
    .set('authorization', `Bearer ${tenantResponse.body.accessToken}`)
    .send(contractPayload);
  assert.equal(forbidden.status, 403);

  const sent = await request(app)
    .post('/api/contracts/send')
    .set('authorization', `Bearer ${landlordResponse.body.accessToken}`)
    .send(contractPayload);
  assert.equal(sent.status, 201);

  const contract = await Contract.findById(sent.body._id).lean();
  const outbox = await Outbox.findOne({ aggregateId: sent.body._id }).lean();
  assert.ok(contract);
  assert.ok(outbox);
  assert.equal(outbox.action, 'sync_contract');
  assert.equal(outbox.status, 'pending');

  const accepted = await request(app)
    .patch(`/api/contracts/${sent.body._id}/status`)
    .set('authorization', `Bearer ${tenantResponse.body.accessToken}`)
    .send({ status: 'active' });
  assert.equal(accepted.status, 200);
  assert.equal(accepted.body.status, 'active');
  assert.equal(await Outbox.countDocuments({ aggregateId: sent.body._id }), 2);
});

test('atomic leasing prevents two workers from claiming the same outbox job', async () => {
  await Outbox.deleteMany({});
  const aggregateId = new mongoose.Types.ObjectId();
  await Outbox.create({
    aggregateType: 'Contract',
    aggregateId,
    action: 'sync_contract',
    payload: { _id: aggregateId },
  });

  const claims = await Promise.all([claimNextJob(), claimNextJob()]);
  const claimed = claims.filter(Boolean);
  assert.equal(claimed.length, 1);
  assert.equal(claimed[0].aggregateId.toString(), aggregateId.toString());
  assert.equal(claimed[0].status, 'processing');

  await Outbox.updateOne(
    { _id: claimed[0]._id },
    { $set: { lockedAt: new Date(Date.now() - 120_000) } }
  );
  const recovered = await claimNextJob();
  assert.equal(recovered?._id.toString(), claimed[0]._id.toString());
});

test('webhook ledger admits only one concurrent consumer for an event ID', async () => {
  const event = {
    consumer: 'tenant_payment',
    eventId: 'evt_integration_duplicate',
    eventType: 'payment.captured',
  };
  const claims = await Promise.all([
    claimWebhookEvent(event),
    claimWebhookEvent(event),
  ]);

  assert.equal(claims.filter(({ claimed }) => claimed).length, 1);
  assert.equal(claims.filter(({ claimed }) => !claimed).length, 1);

  const owner = claims.find(({ claimed }) => claimed);
  await completeWebhookEvent(owner.event);
  const replay = await claimWebhookEvent(event);
  assert.equal(replay.claimed, false);
  assert.equal(replay.event.status, 'completed');
});
