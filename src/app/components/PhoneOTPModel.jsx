import { useState } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../firebase';

export function PhoneOTPModal({ phoneNumber, onVerified, onClose }) {
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [step, setStep] = useState('send'); // 'send' or 'verify'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }
  };

  const sendOTP = async () => {
    setLoading(true);
    setError('');
    try {
      setupRecaptcha();
      // Format phone number for Sri Lanka
      const formattedPhone = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : `+94${phoneNumber.replace(/^0/, '')}`;
      
      const result = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      setConfirmationResult(result);
      setStep('verify');
    } catch (err) {
      setError('Failed to send OTP. Check your phone number.');
      console.error(err);
    }
    setLoading(false);
  };

  const verifyOTP = async () => {
    setLoading(true);
    setError('');
    try {
      await confirmationResult.confirm(otp);
      onVerified(); // ✅ proceed to checkout
    } catch (err) {
      setError('Invalid OTP. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" style={styles.overlay}>
      <div className="modal-box" style={styles.box}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>📱 Verify Your Phone</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {step === 'send' ? (
          <>
            <p style={styles.subtitle}>
              We'll send a verification code to:
            </p>
            <p style={styles.phone}>{phoneNumber}</p>
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
            <button onClick={() => setStep('send')} style={styles.secondaryBtn}>
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
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  title: { fontSize: '20px', fontWeight: '700', color: '#1a3a1a', margin: 0 },
  closeBtn: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#666' },
  subtitle: { color: '#555', marginBottom: '8px' },
  phone: { fontWeight: '700', fontSize: '18px', color: '#2d7a2d', marginBottom: '16px' },
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