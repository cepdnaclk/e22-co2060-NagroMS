import { useState } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../../../../../utils/firebase.js';

export function PhoneOTPModel({ phoneNumber, onVerified, onClose }) {
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [step, setStep] = useState('send');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── TEST MODE: set to true for demo/viva without real SMS ──
  const TEST_MODE = true;
  const TEST_OTP = '123456';

  const setupRecaptcha = () => {
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {}
      window.recaptchaVerifier = null;
    }
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {},
      'expired-callback': () => {
        window.recaptchaVerifier = null;
      }
    });
  };

  const sendOTP = async () => {
    if (!phoneNumber || phoneNumber.trim() === '') {
      setError('Please enter a phone number first.');
      return;
    }

    setLoading(true);
    setError('');

    // ── TEST MODE: skip real SMS ──────────────────────────────
    if (TEST_MODE) {
      setTimeout(() => {
        setStep('verify');
        setLoading(false);
        console.log(`TEST MODE: OTP is ${TEST_OTP}`);
      }, 1000);
      return;
    }

    // ── REAL MODE: send actual SMS ────────────────────────────
    try {
      setupRecaptcha();
      const formattedPhone = phoneNumber.startsWith('+')
        ? phoneNumber
        : `+94${phoneNumber.replace(/^0/, '')}`;

      console.log('Sending OTP to:', formattedPhone);
      const result = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      setConfirmationResult(result);
      setStep('verify');
    } catch (err) {
      console.error('OTP Error:', err);
      if (err.code === 'auth/billing-not-enabled') {
        setError('SMS not enabled. Contact admin.');
      } else if (err.code === 'auth/invalid-phone-number') {
        setError('Invalid phone number format.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Try again later.');
      } else {
        setError(`Error: ${err.message}`);
      }
    }
    setLoading(false);
  };

  const verifyOTP = async () => {
    setLoading(true);
    setError('');

    // ── TEST MODE: accept test OTP ────────────────────────────
    if (TEST_MODE) {
      setTimeout(() => {
        if (otp === TEST_OTP) {
          onVerified();
        } else {
          setError(`Invalid OTP. Use ${TEST_OTP} for testing.`);
          setLoading(false);
        }
      }, 1000);
      return;
    }

    // ── REAL MODE: verify with Firebase ──────────────────────
    try {
      await confirmationResult.confirm(otp);
      onVerified();
    } catch (err) {
      console.error('Verify Error:', err);
      setError('Invalid OTP. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.box}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>📱 Verify Your Phone</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {step === 'send' ? (
          <>
            <p style={styles.subtitle}>We'll send a verification code to:</p>
            <p style={styles.phone}>{phoneNumber}</p>

            {/* Test mode notice */}
            {TEST_MODE && (
              <div style={styles.testBadge}>
                🧪 Test Mode — OTP will be <strong>{TEST_OTP}</strong>
              </div>
            )}

            {error && <p style={styles.error}>{error}</p>}
            <div id="recaptcha-container"></div>
            <button
              onClick={sendOTP}
              disabled={loading}
              style={styles.primaryBtn}
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </>
        ) : (
          <>
            <p style={styles.subtitle}>Enter the 6-digit code sent to your phone</p>

            {/* Test mode notice */}
            {TEST_MODE && (
              <div style={styles.testBadge}>
                🧪 Test Mode — Enter <strong>{TEST_OTP}</strong>
              </div>
            )}

            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              style={styles.input}
            />
            {error && <p style={styles.error}>{error}</p>}
            <button
              onClick={verifyOTP}
              disabled={loading || otp.length < 6}
              style={styles.primaryBtn}
            >
              {loading ? 'Verifying...' : 'Verify & Proceed'}
            </button>
            <button onClick={() => { setStep('send'); setOtp(''); setError(''); }} style={styles.secondaryBtn}>
              Resend OTP
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  box: {
    backgroundColor: 'white', borderRadius: '12px',
    padding: '32px', width: '100%', maxWidth: '400px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '16px'
  },
  title: { fontSize: '20px', fontWeight: '700', color: '#1a3a1a', margin: 0 },
  closeBtn: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#666' },
  subtitle: { color: '#555', marginBottom: '8px' },
  phone: { fontWeight: '700', fontSize: '18px', color: '#2d7a2d', marginBottom: '16px' },
  testBadge: {
    backgroundColor: '#fff3cd', border: '1px solid #ffc107',
    borderRadius: '8px', padding: '10px 12px',
    fontSize: '13px', color: '#856404', marginBottom: '12px'
  },
  input: {
    width: '100%', padding: '12px', fontSize: '20px', textAlign: 'center',
    letterSpacing: '8px', border: '2px solid #2d7a2d', borderRadius: '8px',
    marginBottom: '16px', boxSizing: 'border-box',
  },
  primaryBtn: {
    width: '100%', padding: '12px', backgroundColor: '#2d7a2d',
    color: 'white', border: 'none', borderRadius: '8px',
    fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginBottom: '8px',
  },
  secondaryBtn: {
    width: '100%', padding: '10px', backgroundColor: 'transparent',
    color: '#2d7a2d', border: '1px solid #2d7a2d', borderRadius: '8px',
    fontSize: '14px', cursor: 'pointer',
  },
  error: { color: 'red', fontSize: '14px', marginBottom: '12px' },
};
