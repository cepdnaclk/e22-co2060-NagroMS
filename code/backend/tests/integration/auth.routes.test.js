// ============================================================
// NagroMS — Integration Tests: Auth API Routes
// File: tests/integration/auth.routes.test.js
//
// Tests HTTP endpoints by sending real HTTP requests to Express.
// Firebase is mocked so no real credentials needed.
// Uses supertest to simulate HTTP calls.
// ============================================================

// ── Mock all external dependencies ───────────────────────────
jest.mock('../../config/firebase', () => ({
  auth: {
    verifyIdToken: jest.fn(),
    setCustomUserClaims: jest.fn().mockResolvedValue(true),
    getUserByEmail: jest.fn(),
    updateUser: jest.fn().mockResolvedValue(true),
  },
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn().mockResolvedValue({ exists: false }),
        set: jest.fn().mockResolvedValue(true),
        update: jest.fn().mockResolvedValue(true),
      })),
      where: jest.fn(() => ({
        limit: jest.fn(() => ({
          get: jest.fn().mockResolvedValue({ empty: true }),
        })),
      })),
    })),
  },
}));

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'mock-id' }),
  })),
}));

jest.mock('../../models/userModel', () => ({
  createUser: jest.fn(),
  getUserById: jest.fn(),
  getUserByEmail: jest.fn(),
  updateUser: jest.fn(),
  updateLastLogin: jest.fn().mockResolvedValue(true),
  updateRoles: jest.fn(),
}));

const request = require('supertest');
const app = require('../../server');
const { auth } = require('../../config/firebase');
const userModel = require('../../models/userModel');

// ─────────────────────────────────────────────────────────────
// TEST GROUP 1: GET /health
// ─────────────────────────────────────────────────────────────
describe('Integration Test — GET /health', () => {
  test('Health check returns 200 with success message', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('NagroMS API is running');
  });

  test('Health check includes timestamp', async () => {
    const res = await request(app).get('/health');
    expect(res.body).toHaveProperty('timestamp');
    expect(() => new Date(res.body.timestamp)).not.toThrow();
  });
});

// ─────────────────────────────────────────────────────────────
// TEST GROUP 2: GET /  (root route)
// ─────────────────────────────────────────────────────────────
describe('Integration Test — GET / (Root)', () => {
  test('Root route returns welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('NagroMS API');
  });
});

// ─────────────────────────────────────────────────────────────
// TEST GROUP 3: POST /api/auth/login-verify
// ─────────────────────────────────────────────────────────────
describe('Integration Test — POST /api/auth/login', () => {
  test('Returns 400 when no idToken provided', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('ID token is required');
  });

  test('Returns 401 when invalid idToken is provided', async () => {
    auth.verifyIdToken.mockRejectedValueOnce(new Error('Invalid token'));
    const res = await request(app)
      .post('/api/auth/login')
      .send({ idToken: 'bad-token' });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('Returns 404 when user not found in Firestore', async () => {
    auth.verifyIdToken.mockResolvedValueOnce({ uid: 'uid-not-in-db' });
    userModel.getUserById.mockResolvedValueOnce(null);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ idToken: 'valid-but-unregistered' });
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toContain('User not found');
  });

  test('Returns 403 when user account is deactivated', async () => {
    auth.verifyIdToken.mockResolvedValueOnce({ uid: 'uid-deactivated' });
    userModel.getUserById.mockResolvedValueOnce({
      uid: 'uid-deactivated',
      isActive: false,
      roles: ['farmer'],
    });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ idToken: 'deactivated-token' });
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toContain('deactivated');
  });

  test('Returns 200 with dashboardRoute on successful login', async () => {
    auth.verifyIdToken.mockResolvedValueOnce({ uid: 'uid-farmer' });
    userModel.getUserById.mockResolvedValueOnce({
      uid: 'uid-farmer',
      email: 'farmer@nagro.lk',
      isActive: true,
      roles: ['farmer'],
      accountType: 'individual',
    });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ idToken: 'valid-farmer-token' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.dashboardRoute).toBe('farmer-dashboard');
  });
});

// ─────────────────────────────────────────────────────────────
// TEST GROUP 4: POST /api/auth/register
// ─────────────────────────────────────────────────────────────
describe('Integration Test — POST /api/auth/register', () => {
  test('Returns 400 when idToken is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ fullName: 'Sathish', roles: ['farmer'] });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('Returns 409 when user profile already exists', async () => {
    // Reset mocks cleanly for this test
    auth.verifyIdToken.mockReset();
    userModel.getUserById.mockReset();
    auth.verifyIdToken.mockResolvedValueOnce({ uid: 'existing-uid', email: 'existing@nagro.lk', email_verified: true });
    userModel.getUserById.mockResolvedValueOnce({ uid: 'existing-uid', email: 'existing@nagro.lk' });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ idToken: 'valid-token', fullName: 'Existing User', roles: ['farmer'], emailForAuth: 'existing@nagro.lk' });
    expect(res.statusCode).toBe(409);
    expect(res.body.message).toContain('already exists');
  });

  test('Returns 201 on successful new user registration', async () => {
    auth.verifyIdToken.mockResolvedValueOnce({
      uid: 'new-uid',
      email: 'newfarmer@nagro.lk',
      email_verified: false,
    });
    userModel.getUserById.mockResolvedValueOnce(null); // No existing user
    userModel.createUser.mockResolvedValueOnce({
      uid: 'new-uid',
      email: 'newfarmer@nagro.lk',
      fullName: 'New Farmer',
      roles: ['farmer'],
      isActive: true,
    });
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        idToken: 'fresh-token',
        fullName: 'New Farmer',
        phone: '0771234567',
        nic: '200012345V',
        roles: ['farmer'],
        accountType: 'individual',
        emailForAuth: 'newfarmer@nagro.lk',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.dashboardRoute).toBe('farmer-dashboard');
  });
});

// ─────────────────────────────────────────────────────────────
// TEST GROUP 5: POST /api/auth/check-availability
// ─────────────────────────────────────────────────────────────
describe('Integration Test — POST /api/auth/check-availability', () => {
  test('Returns 200 when email is available', async () => {
    // Mock DB returning empty (not found)
    const { db } = require('../../config/firebase');
    const mockGet = jest.fn().mockResolvedValue({ empty: true });
    db.collection.mockReturnValue({
      where: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({ get: mockGet }),
      }),
    });

    const res = await request(app)
      .post('/api/auth/check-availability')
      .send({ email: 'available@nagro.lk' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────
// TEST GROUP 6: 404 for Unknown Routes
// ─────────────────────────────────────────────────────────────
describe('Integration Test — 404 for unknown routes', () => {
  test('Unknown route returns 404 with message', async () => {
    const res = await request(app).get('/api/nonexistent-route');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('not found');
  });
});
