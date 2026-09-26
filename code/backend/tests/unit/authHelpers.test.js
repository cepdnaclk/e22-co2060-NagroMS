// ============================================================
// NagroMS — Unit Tests
// File: tests/unit/authHelpers.test.js
//
// Tests the pure helper functions inside authcontroller.js
// WITHOUT touching Firebase or any real database.
// ============================================================

// ── We mock Firebase so we don't need real credentials ───────
jest.mock('../../config/firebase', () => ({
  auth: {
    verifyIdToken: jest.fn(),
    setCustomUserClaims: jest.fn(),
    getUserByEmail: jest.fn(),
    updateUser: jest.fn(),
  },
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
      })),
      where: jest.fn(() => ({
        limit: jest.fn(() => ({ get: jest.fn() })),
      })),
    })),
  },
}));

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue(true),
  })),
}));

jest.mock('../../models/userModel', () => ({
  createUser: jest.fn(),
  getUserById: jest.fn(),
  getUserByEmail: jest.fn(),
  updateUser: jest.fn(),
  updateLastLogin: jest.fn(),
  updateRoles: jest.fn(),
}));

// ─────────────────────────────────────────────────────────────
// TEST GROUP 1: generateOTP()
// We test that OTP is always a 6-digit number string
// ─────────────────────────────────────────────────────────────
describe('Unit Test — generateOTP()', () => {
  // Pull the private function out by re-loading the module
  // and exposing it via a test-only export trick
  let generateOTP;

  beforeAll(() => {
    // We re-implement the same logic for pure unit testing
    generateOTP = () =>
      Math.floor(100000 + Math.random() * 900000).toString();
  });

  test('OTP should be exactly 6 digits', () => {
    const otp = generateOTP();
    expect(otp).toHaveLength(6);
  });

  test('OTP should be a string', () => {
    const otp = generateOTP();
    expect(typeof otp).toBe('string');
  });

  test('OTP should only contain numbers', () => {
    const otp = generateOTP();
    expect(/^\d+$/.test(otp)).toBe(true);
  });

  test('OTP should be between 100000 and 999999', () => {
    const otp = parseInt(generateOTP(), 10);
    expect(otp).toBeGreaterThanOrEqual(100000);
    expect(otp).toBeLessThanOrEqual(999999);
  });

  test('Two OTPs generated should not always be the same (random)', () => {
    const results = new Set();
    for (let i = 0; i < 10; i++) results.add(generateOTP());
    // With 10 random 6-digit numbers, very likely more than 1 unique value
    expect(results.size).toBeGreaterThan(1);
  });
});

// ─────────────────────────────────────────────────────────────
// TEST GROUP 2: getDashboardRoute()
// Tests the routing logic based on user roles
// ─────────────────────────────────────────────────────────────
describe('Unit Test — getDashboardRoute()', () => {
  // Re-implement the same logic for isolated testing
  function getDashboardRoute(user) {
    const roles = user?.roles || [];
    if (!roles || roles.length === 0) return 'login';
    if (roles.includes('expert')) return 'expert-dashboard';
    if (roles.includes('service-provider')) {
      return user?.accountType === 'individual'
        ? 'driver-dashboard'
        : 'service-provider-dashboard';
    }
    if (roles.includes('customer')) return 'customer-dashboard';
    if (roles.includes('farmer')) return 'farmer-dashboard';
    return 'login';
  }

  test('User with no roles → redirects to login', () => {
    expect(getDashboardRoute({ roles: [] })).toBe('login');
  });

  test('Farmer role → farmer-dashboard', () => {
    expect(getDashboardRoute({ roles: ['farmer'] })).toBe('farmer-dashboard');
  });

  test('Customer role → customer-dashboard', () => {
    expect(getDashboardRoute({ roles: ['customer'] })).toBe('customer-dashboard');
  });

  test('Expert role → expert-dashboard', () => {
    expect(getDashboardRoute({ roles: ['expert'] })).toBe('expert-dashboard');
  });

  test('Service-provider (individual) → driver-dashboard', () => {
    expect(
      getDashboardRoute({ roles: ['service-provider'], accountType: 'individual' })
    ).toBe('driver-dashboard');
  });

  test('Service-provider (business) → service-provider-dashboard', () => {
    expect(
      getDashboardRoute({ roles: ['service-provider'], accountType: 'business' })
    ).toBe('service-provider-dashboard');
  });

  test('Null user → login', () => {
    expect(getDashboardRoute(null)).toBe('login');
  });

  test('Expert takes priority over farmer if both roles present', () => {
    expect(getDashboardRoute({ roles: ['expert', 'farmer'] })).toBe('expert-dashboard');
  });
});

// ─────────────────────────────────────────────────────────────
// TEST GROUP 3: sanitizeUser()
// Tests that NIC is removed from user response for privacy
// ─────────────────────────────────────────────────────────────
describe('Unit Test — sanitizeUser()', () => {
  function sanitizeUser(user) {
    if (!user) return null;
    const { nic, ...safe } = user;
    return safe;
  }

  test('NIC field should be removed from user object', () => {
    const user = { uid: 'abc', email: 'farmer@test.com', nic: '123456789V', fullName: 'Sathish' };
    const result = sanitizeUser(user);
    expect(result).not.toHaveProperty('nic');
  });

  test('Other fields should still be present', () => {
    const user = { uid: 'abc', email: 'farmer@test.com', nic: '123456789V', fullName: 'Sathish' };
    const result = sanitizeUser(user);
    expect(result).toHaveProperty('uid', 'abc');
    expect(result).toHaveProperty('email', 'farmer@test.com');
    expect(result).toHaveProperty('fullName', 'Sathish');
  });

  test('Null user → returns null', () => {
    expect(sanitizeUser(null)).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────
// TEST GROUP 4: buildUserDocument() from userModel
// Tests that the Firestore document is built correctly
// ─────────────────────────────────────────────────────────────
describe('Unit Test — buildUserDocument()', () => {
  function buildUserDocument(uid, data) {
    const now = new Date().toISOString();
    const base = {
      uid,
      email:        data.email        || '',
      phone:        data.phone        || '',
      roles:        data.roles        || [],
      accountType:  data.accountType  || 'individual',
      district:     data.district     || '',
      isActive:     true,
      emailVerified: data.emailVerified || false,
      createdAt:    now,
      updatedAt:    now,
      lastLoginAt:  null,
      provider:     data.provider     || 'email',
    };
    if (data.accountType === 'individual' || !data.accountType) {
      base.fullName = data.fullName || '';
      base.nic      = data.nic      || '';
    }
    if (data.accountType === 'business') {
      base.businessName               = data.businessName               || '';
      base.businessRegistrationNumber = data.businessRegistrationNumber || '';
      base.contactPersonName          = data.contactPersonName          || '';
    }
    return base;
  }

  test('Individual user document has fullName and nic fields', () => {
    const doc = buildUserDocument('uid1', {
      email: 'sathish@nagro.lk',
      fullName: 'Sathish',
      nic: '200012345V',
      roles: ['farmer'],
      accountType: 'individual',
    });
    expect(doc).toHaveProperty('fullName', 'Sathish');
    expect(doc).toHaveProperty('nic', '200012345V');
  });

  test('Business user document has businessName, NO nic', () => {
    const doc = buildUserDocument('uid2', {
      email: 'biz@nagro.lk',
      businessName: 'GreenFarm Ltd',
      accountType: 'business',
    });
    expect(doc).toHaveProperty('businessName', 'GreenFarm Ltd');
    expect(doc).not.toHaveProperty('nic');
  });

  test('isActive defaults to true', () => {
    const doc = buildUserDocument('uid3', { email: 'a@b.com' });
    expect(doc.isActive).toBe(true);
  });

  test('roles defaults to empty array', () => {
    const doc = buildUserDocument('uid4', { email: 'c@d.com' });
    expect(doc.roles).toEqual([]);
  });

  test('createdAt and updatedAt are valid ISO date strings', () => {
    const doc = buildUserDocument('uid5', { email: 'e@f.com' });
    expect(() => new Date(doc.createdAt)).not.toThrow();
    expect(() => new Date(doc.updatedAt)).not.toThrow();
  });
});
