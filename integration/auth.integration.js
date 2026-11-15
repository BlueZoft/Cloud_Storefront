/** @jest-environment node */
import { connectToDb } from '../src/lib/utils';
import { consumeLoginAttempt, issueSession, activeSession, revokeSession, revokeAllSessions } from '../src/lib/auth-state';
let db, connection;
beforeAll(async () => {
  if (!process.env.TEST_MONGO) throw new Error('Set TEST_MONGO to a dedicated storefront_auth_test… database');
  process.env.MONGO = process.env.TEST_MONGO;
  process.env.SESSION_SECRET = 'integration-only-secret-'.repeat(3);
  process.env.ADMIN_USERNAME = 'integration-admin';
  process.env.ADMIN_PASSWORD_HASH = 'integration-password-hash';
  connection = await connectToDb();
  const candidate = connection.connection.db;
  if (!candidate.databaseName.startsWith('storefront_auth_test')) throw new Error('Refusing a non-test database');
  db = candidate;
});
beforeEach(async () => {
  if (db) {
    await db.collection('auth_sessions').deleteMany({});
    await db.collection('login_limits').deleteMany({});
  }
});
afterAll(async () => { if (connection) await connection.disconnect(); });
test('atomic shared database limit allows only ten of twenty simultaneous attempts', async () => {
  const clock = jest.spyOn(Date, 'now').mockReturnValue(Date.now());
  try {
    const results = await Promise.all(Array.from({length:20}, () => consumeLoginAttempt()));
    expect(results.filter(Boolean)).toHaveLength(10);
    const row = await db.collection('login_limits').findOne({});
    expect(row.attempts).toBe(20);
  } finally { clock.mockRestore(); }
});
test('logout revokes a copied token while other sessions remain valid; revoke-all removes both', async () => {
  const first = await issueSession();
  const second = await issueSession();
  expect(first).not.toBe(second);
  expect(await activeSession(first)).toBe(true);
  expect(await activeSession(second)).toBe(true);
  await revokeSession(first);
  expect(await activeSession(first)).toBe(false);
  expect(await activeSession(second)).toBe(true);
  await revokeAllSessions();
  expect(await activeSession(second)).toBe(false);
});
test('expiration is enforced before TTL cleanup', async () => {
  const token = await issueSession();
  await db.collection('auth_sessions').updateMany({}, {$set:{expiresAt:new Date(0)}});
  expect(await activeSession(token)).toBe(false);
});
test('changing configured admin credentials invalidates existing sessions', async () => {
  const token = await issueSession();
  process.env.ADMIN_PASSWORD_HASH = 'changed-integration-hash';
  expect(await activeSession(token)).toBe(false);
});
