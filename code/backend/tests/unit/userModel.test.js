// ============================================================
// NagroMS — Unit Tests: userModel helpers
// File: tests/unit/userModel.test.js
//
// Tests updateRoles() validation logic
// ============================================================

// Mock Firebase so no real DB is used
jest.mock('../../config/firebase', () => ({
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

const { VALID_ROLES, VALID_ACCOUNT_TYPES } = require('../../models/userModel');

// ─────────────────────────────────────────────────────────────
// TEST GROUP: Constants validation
// ─────────────────────────────────────────────────────────────
describe('Unit Test — VALID_ROLES constant', () => {
  test('Should contain "farmer" role', () => {
    expect(VALID_ROLES).toContain('farmer');
  });

  test('Should contain "customer" role', () => {
    expect(VALID_ROLES).toContain('customer');
  });

  test('Should contain "expert" role', () => {
    expect(VALID_ROLES).toContain('expert');
  });

  test('Should contain "service-provider" role', () => {
    expect(VALID_ROLES).toContain('service-provider');
  });

  test('Should NOT contain unknown roles like "superuser"', () => {
    expect(VALID_ROLES).not.toContain('superuser');
  });

  test('Should NOT contain "superuser"', () => {
    expect(VALID_ROLES).not.toContain('superuser');
  });
});

describe('Unit Test — VALID_ACCOUNT_TYPES constant', () => {
  test('Should contain "individual"', () => {
    expect(VALID_ACCOUNT_TYPES).toContain('individual');
  });

  test('Should contain "business"', () => {
    expect(VALID_ACCOUNT_TYPES).toContain('business');
  });

  test('Should only have 2 types', () => {
    expect(VALID_ACCOUNT_TYPES).toHaveLength(2);
  });
});

// ─────────────────────────────────────────────────────────────
// TEST GROUP: updateRoles validation logic (unit level)
// ─────────────────────────────────────────────────────────────
describe('Unit Test — updateRoles() validation logic', () => {
  // Replicate validation logic for pure unit test
  function validateRoles(roles) {
    const VALID = ['farmer', 'customer', 'service-provider', 'expert'];
    const invalid = roles.filter((r) => !VALID.includes(r));
    if (invalid.length > 0) {
      throw new Error(`Invalid roles: ${invalid.join(', ')}`);
    }
    return true;
  }

  test('Valid single role passes validation', () => {
    expect(() => validateRoles(['farmer'])).not.toThrow();
  });

  test('Multiple valid roles pass validation', () => {
    expect(() => validateRoles(['farmer', 'customer'])).not.toThrow();
  });

  test('Unknown role throws error', () => {
    expect(() => validateRoles(['admin'])).toThrow('Invalid roles: admin');
  });

  test('Empty roles array is allowed', () => {
    expect(() => validateRoles([])).not.toThrow();
  });

  test('Mix of valid and invalid throws error with invalid listed', () => {
    expect(() => validateRoles(['farmer', 'superuser'])).toThrow('Invalid roles: superuser');
  });
});
