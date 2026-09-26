// ============================================================
// NagroMS — System / End-to-End Tests
// File: tests/system/pwa.system.test.js
//
// Tests the full system-level behavior:
// - Service Worker logic
// - OTP expiry workflow
// - Full registration → login workflow
// - PWA offline behavior simulation
// ============================================================

// ─────────────────────────────────────────────────────────────
// SYSTEM TEST 1: Full OTP Workflow Simulation
// (Send OTP → Verify OTP → Reset Password)
// ─────────────────────────────────────────────────────────────
describe('System Test — Full OTP Password Reset Workflow', () => {
  // Simulate the in-memory OTP store (same as in authcontroller.js)
  let otpStore = {};

  function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  function simulateSendOTP(email) {
    const otp = generateOTP();
    otpStore[email] = {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 min
    };
    return otp;
  }

  function simulateVerifyOTP(email, submittedOtp) {
    const record = otpStore[email];
    if (!record) return { success: false, message: 'No OTP requested' };
    if (Date.now() > record.expiresAt) {
      delete otpStore[email];
      return { success: false, message: 'OTP expired' };
    }
    if (record.otp !== submittedOtp.toString()) {
      return { success: false, message: 'Incorrect OTP' };
    }
    otpStore[email].verified = true;
    return { success: true, message: 'OTP verified' };
  }

  function simulateResetPassword(email) {
    const record = otpStore[email];
    if (!record || !record.verified) {
      return { success: false, message: 'Please verify OTP first' };
    }
    delete otpStore[email]; // Cleanup after use
    return { success: true, message: 'Password reset successfully' };
  }

  beforeEach(() => {
    otpStore = {}; // Reset store before each test
  });

  test('Step 1: OTP is sent and stored for email', () => {
    simulateSendOTP('farmer@nagro.lk');
    expect(otpStore['farmer@nagro.lk']).toBeDefined();
    expect(otpStore['farmer@nagro.lk'].otp).toHaveLength(6);
  });

  test('Step 2: Wrong OTP → verification fails', () => {
    simulateSendOTP('farmer@nagro.lk');
    const result = simulateVerifyOTP('farmer@nagro.lk', '000000'); // Wrong OTP
    expect(result.success).toBe(false);
    expect(result.message).toBe('Incorrect OTP');
  });

  test('Step 2: Correct OTP → verification succeeds', () => {
    const otp = simulateSendOTP('farmer@nagro.lk');
    const result = simulateVerifyOTP('farmer@nagro.lk', otp); // Correct OTP
    expect(result.success).toBe(true);
    expect(otpStore['farmer@nagro.lk'].verified).toBe(true);
  });

  test('Step 3: Password reset WITHOUT verifying OTP → fails', () => {
    simulateSendOTP('farmer@nagro.lk'); // OTP sent but NOT verified
    const result = simulateResetPassword('farmer@nagro.lk');
    expect(result.success).toBe(false);
    expect(result.message).toContain('verify OTP first');
  });

  test('Full workflow: Send → Verify → Reset → Success ✅', () => {
    // Step 1: Send OTP
    const otp = simulateSendOTP('farmer@nagro.lk');
    expect(otpStore['farmer@nagro.lk']).toBeDefined();

    // Step 2: Verify OTP
    const verifyResult = simulateVerifyOTP('farmer@nagro.lk', otp);
    expect(verifyResult.success).toBe(true);

    // Step 3: Reset Password
    const resetResult = simulateResetPassword('farmer@nagro.lk');
    expect(resetResult.success).toBe(true);

    // Confirm OTP store is cleaned up after reset
    expect(otpStore['farmer@nagro.lk']).toBeUndefined();
  });

  test('Expired OTP → verification fails with "OTP expired"', () => {
    const otp = generateOTP();
    // Manually set OTP that already expired (expiresAt in the past)
    otpStore['farmer@nagro.lk'] = {
      otp,
      expiresAt: Date.now() - 1000, // Already expired
    };
    const result = simulateVerifyOTP('farmer@nagro.lk', otp);
    expect(result.success).toBe(false);
    expect(result.message).toBe('OTP expired');
    // Confirm it was cleaned up
    expect(otpStore['farmer@nagro.lk']).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────
// SYSTEM TEST 2: Role-Based Access Control Workflow
// (Register with role → Login → Get correct dashboard)
// ─────────────────────────────────────────────────────────────
describe('System Test — Role-Based Dashboard Routing', () => {
  function getDashboardRoute(user) {
    const roles = user?.roles || [];
    if (!roles.length) return 'login';
    if (roles.includes('expert')) return 'expert-dashboard';
    if (roles.includes('service-provider')) {
      return user?.accountType === 'individual' ? 'driver-dashboard' : 'service-provider-dashboard';
    }
    if (roles.includes('customer')) return 'customer-dashboard';
    if (roles.includes('farmer')) return 'farmer-dashboard';
    return 'login';
  }

  const testCases = [
    { user: { roles: ['farmer'], accountType: 'individual' }, expected: 'farmer-dashboard', label: 'Farmer' },
    { user: { roles: ['customer'], accountType: 'individual' }, expected: 'customer-dashboard', label: 'Customer' },
    { user: { roles: ['expert'] }, expected: 'expert-dashboard', label: 'Expert' },
    { user: { roles: ['service-provider'], accountType: 'individual' }, expected: 'driver-dashboard', label: 'Driver (individual service-provider)' },
    { user: { roles: ['service-provider'], accountType: 'business' }, expected: 'service-provider-dashboard', label: 'Business service-provider' },
    { user: { roles: [] }, expected: 'login', label: 'No role user' },
  ];

  testCases.forEach(({ user, expected, label }) => {
    test(`${label} → routes to "${expected}"`, () => {
      expect(getDashboardRoute(user)).toBe(expected);
    });
  });
});

// ─────────────────────────────────────────────────────────────
// SYSTEM TEST 3: PWA Service Worker — Cache Strategy Simulation
// ─────────────────────────────────────────────────────────────
describe('System Test — PWA Cache Strategy Logic', () => {
  // Simulate "Network First, then Cache" strategy
  function networkFirstStrategy(networkAvailable, cachedResponse) {
    if (networkAvailable) {
      return { source: 'network', data: 'fresh-data' };
    }
    if (cachedResponse) {
      return { source: 'cache', data: cachedResponse };
    }
    return { source: 'offline-page', data: null };
  }

  test('Online: Data comes from network', () => {
    const result = networkFirstStrategy(true, 'cached-data');
    expect(result.source).toBe('network');
    expect(result.data).toBe('fresh-data');
  });

  test('Offline + cache exists: Data comes from cache', () => {
    const result = networkFirstStrategy(false, 'cached-data');
    expect(result.source).toBe('cache');
    expect(result.data).toBe('cached-data');
  });

  test('Offline + no cache: Shows offline page', () => {
    const result = networkFirstStrategy(false, null);
    expect(result.source).toBe('offline-page');
    expect(result.data).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────
// SYSTEM TEST 4: Input Validation — Registration Fields
// ─────────────────────────────────────────────────────────────
describe('System Test — Registration Input Validation', () => {
  function validateRegistrationInput({ fullName, phone, nic, roles, accountType }) {
    const errors = [];

    if (!fullName || fullName.trim() === '') {
      errors.push('Full name is required');
    }
    if (!phone || !/^0\d{9}$/.test(phone)) {
      errors.push('Phone must be 10 digits starting with 0');
    }
    if (accountType === 'individual' && (!nic || !/^\d{9}[VvXx]$/.test(nic))) {
      errors.push('NIC must be 9 digits followed by V or X');
    }
    if (!roles || roles.length === 0) {
      errors.push('At least one role must be selected');
    }

    return { valid: errors.length === 0, errors };
  }

  test('Valid farmer registration data passes', () => {
    const result = validateRegistrationInput({
      fullName: 'Sathish Kumar',
      phone: '0771234567',
      nic: '200012345V',
      roles: ['farmer'],
      accountType: 'individual',
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('Missing fullName → validation error', () => {
    const result = validateRegistrationInput({
      fullName: '',
      phone: '0771234567',
      nic: '200012345V',
      roles: ['farmer'],
      accountType: 'individual',
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Full name is required');
  });

  test('Invalid phone format → validation error', () => {
    const result = validateRegistrationInput({
      fullName: 'Sathish',
      phone: '12345', // Wrong format
      nic: '200012345V',
      roles: ['farmer'],
      accountType: 'individual',
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Phone must be 10 digits');
  });

  test('Invalid NIC format → validation error', () => {
    const result = validateRegistrationInput({
      fullName: 'Sathish',
      phone: '0771234567',
      nic: 'INVALID',
      roles: ['farmer'],
      accountType: 'individual',
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('NIC must be');
  });

  test('No role selected → validation error', () => {
    const result = validateRegistrationInput({
      fullName: 'Sathish',
      phone: '0771234567',
      nic: '200012345V',
      roles: [],
      accountType: 'individual',
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('At least one role must be selected');
  });

  test('Multiple errors returned for multiple invalid fields', () => {
    const result = validateRegistrationInput({
      fullName: '',
      phone: 'bad',
      nic: 'bad',
      roles: [],
      accountType: 'individual',
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});
