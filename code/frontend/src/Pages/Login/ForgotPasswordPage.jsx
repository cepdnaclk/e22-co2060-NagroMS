import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, AlertCircle, CheckCircle, Eye, EyeOff, Leaf, ArrowRight } from 'lucide-react';

const REQUIREMENTS = [
  { label: 'At least 8 characters',  test: p => p.length >= 8 },
  { label: 'One uppercase letter',    test: p => /[A-Z]/.test(p) },
  { label: 'One lowercase letter',    test: p => /[a-z]/.test(p) },
  { label: 'One number',             test: p => /[0-9]/.test(p) },
  { label: 'One special character',   test: p => /[^A-Za-z0-9]/.test(p) },
];

const API = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}`;

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep]                   = useState(1);
  const [email, setEmail]                 = useState('');
  const [otp, setOtp]                     = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew]             = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [errors, setErrors]               = useState({});
  const [isLoading, setIsLoading]         = useState(false);
  const [successMsg, setSuccessMsg]       = useState('');

  // ── Step 1: Send OTP ────────────────────────────────────────
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!email || !email.includes('@')) {
      setErrors({ email: 'Please enter a valid email address.' });
      return;
    }
    setIsLoading(true);
    try {
      const res  = await fetch(`${API}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP.');
      setSuccessMsg(`OTP sent to ${email}`);
      setStep(2);
    } catch (err) {
      setErrors({ email: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2: Verify OTP ──────────────────────────────────────
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setErrors({});
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setErrors({ otp: 'Please enter the complete 6-digit code.' });
      return;
    }
    setIsLoading(true);
    try {
      const res  = await fetch(`${API}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpValue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid OTP.');
      setStep(3);
    } catch (err) {
      setErrors({ otp: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 3: Reset Password ──────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrors({});
    const failed = REQUIREMENTS.filter(r => !r.test(newPassword));
    if (failed.length > 0) {
      setErrors({ password: 'Password does not meet all requirements.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match.' });
      return;
    }
    setIsLoading(true);
    try {
      const res  = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to reset password.');
      setSuccessMsg('Password reset successfully!');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setErrors({ password: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // ── OTP input handlers ──────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setErrors({});
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0)
      document.getElementById(`otp-${index - 1}`)?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = pasted.split('');
    while (newOtp.length < 6) newOtp.push('');
    setOtp(newOtp);
  };

  const steps = [
    { num: 1, label: 'Verify'  },
    { num: 2, label: 'Confirm' },
    { num: 3, label: 'Reset'   },
  ];

  return (
    <div className="nagro-forgot-root">
      <div className="nagro-blob nagro-blob-1" />
      <div className="nagro-blob nagro-blob-3" />

      <div className="nagro-forgot-container">
        <button type="button" onClick={() => navigate('/login')} className="nagro-back-btn">
          <ArrowLeft className="w-4 h-4" /><span>Back to Login</span>
        </button>

        <div className="nagro-forgot-card">
          <div className="nagro-forgot-logo">
            <div className="nagro-forgot-logo-icon"><Leaf className="w-6 h-6" /></div>
            <span>NagroMS</span>
          </div>

          {/* Progress */}
          <div className="nagro-forgot-steps">
            {steps.map((s, i) => (
              <div key={s.num} className="nagro-forgot-step-wrap">
                <div className={`nagro-forgot-step${step >= s.num ? ' done' : ''}${step === s.num ? ' active' : ''}`}>
                  {step > s.num ? <CheckCircle className="w-4 h-4" /> : <span>{s.num}</span>}
                </div>
                <span className={`nagro-forgot-step-label${step === s.num ? ' active' : ''}`}>{s.label}</span>
                {i < steps.length - 1 && (
                  <div className={`nagro-forgot-step-line${step > s.num ? ' done' : ''}`} />
                )}
              </div>
            ))}
          </div>

          {/* ── Step 1: Enter email ── */}
          {step === 1 && (
            <div className="nagro-forgot-step-content">
              <div className="nagro-form-header">
                <h2>Forgot Password?</h2>
                <p>Enter your registered email and we'll send you a 6-digit OTP code.</p>
              </div>
              <form onSubmit={handleSendOTP} className="nagro-form">
                <div className="nagro-field">
                  <label className="nagro-label">Email Address</label>
                  <div className={`nagro-input-wrap${errors.email ? ' error' : ''}`}>
                    <span className="nagro-input-icon"><Mail className="w-4 h-4" /></span>
                    <input type="email" value={email}
                      onChange={e => { setEmail(e.target.value); setErrors({}); }}
                      placeholder="example@email.com" className="nagro-input" />
                  </div>
                  {errors.email && (
                    <div className="nagro-error-msg">
                      <AlertCircle className="w-3.5 h-3.5" /><span>{errors.email}</span>
                    </div>
                  )}
                </div>
                <button type="submit" disabled={isLoading}
                  className={`nagro-submit-btn${isLoading ? ' loading' : ''}`}>
                  {isLoading ? <span className="nagro-spinner" /> : (
                    <><span>Send OTP Code</span><ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ── Step 2: Enter OTP ── */}
          {step === 2 && (
            <div className="nagro-forgot-step-content">
              <div className="nagro-form-header">
                <h2>Enter OTP Code</h2>
                <p>We sent a 6-digit code to <strong className="nagro-highlight">{email}</strong>. Check your inbox.</p>
              </div>
              <form onSubmit={handleVerifyOTP} className="nagro-form">
                <div className="nagro-field">
                  <label className="nagro-label nagro-otp-label">6-Digit OTP</label>
                  <div className="nagro-otp-row" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input key={i} id={`otp-${i}`} type="text" maxLength={1}
                        value={digit} onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        className={`nagro-otp-box${errors.otp ? ' error' : ''}${digit ? ' filled' : ''}`}
                        autoComplete="off" inputMode="numeric" />
                    ))}
                  </div>
                  {errors.otp && (
                    <div className="nagro-error-msg nagro-otp-error">
                      <AlertCircle className="w-3.5 h-3.5" /><span>{errors.otp}</span>
                    </div>
                  )}
                </div>

                <div className="nagro-resend-row">
                  <span>Didn't receive it?</span>
                  <button type="button" className="nagro-link"
                    onClick={() => { setStep(1); setOtp(['','','','','','']); setErrors({}); }}>
                    Resend OTP
                  </button>
                </div>

                <button type="submit" disabled={isLoading}
                  className={`nagro-submit-btn${isLoading ? ' loading' : ''}`}>
                  {isLoading ? <span className="nagro-spinner" /> : (
                    <><span>Verify OTP</span><ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ── Step 3: New password ── */}
          {step === 3 && (
            <div className="nagro-forgot-step-content">
              <div className="nagro-form-header">
                <h2>Set New Password</h2>
                <p>Create a strong password for your account.</p>
              </div>
              <form onSubmit={handleResetPassword} className="nagro-form">
                <div className="nagro-field">
                  <label className="nagro-label">New Password</label>
                  <div className={`nagro-input-wrap${errors.password ? ' error' : ''}`}>
                    <input type={showNew ? 'text' : 'password'} value={newPassword}
                      onChange={e => { setNewPassword(e.target.value); setErrors({}); }}
                      placeholder="Enter new password" className="nagro-input" />
                    <button type="button" className="nagro-eye-btn" onClick={() => setShowNew(!showNew)}>
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="nagro-password-reqs">
                    {REQUIREMENTS.map((req, i) => {
                      const met = newPassword ? req.test(newPassword) : false;
                      return (
                        <div key={i} className={`nagro-req-item${met ? ' met' : ''}`}>
                          {met ? <CheckCircle className="w-3.5 h-3.5" /> : <div className="nagro-req-dot" />}
                          <span>{req.label}</span>
                        </div>
                      );
                    })}
                  </div>
                  {errors.password && (
                    <div className="nagro-error-msg">
                      <AlertCircle className="w-3.5 h-3.5" /><span>{errors.password}</span>
                    </div>
                  )}
                </div>

                <div className="nagro-field">
                  <label className="nagro-label">Confirm Password</label>
                  <div className={`nagro-input-wrap${errors.confirmPassword ? ' error' : ''}`}>
                    <input type={showConfirm ? 'text' : 'password'} value={confirmPassword}
                      onChange={e => { setConfirmPassword(e.target.value); setErrors({}); }}
                      placeholder="Re-enter password" className="nagro-input" />
                    <button type="button" className="nagro-eye-btn" onClick={() => setShowConfirm(!showConfirm)}>
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <div className="nagro-error-msg">
                      <AlertCircle className="w-3.5 h-3.5" /><span>{errors.confirmPassword}</span>
                    </div>
                  )}
                  {confirmPassword && newPassword === confirmPassword && (
                    <div className="nagro-success-msg">
                      <CheckCircle className="w-3.5 h-3.5" /><span>Passwords match</span>
                    </div>
                  )}
                </div>

                {successMsg && (
                  <div className="nagro-success-msg" style={{ marginBottom: 12 }}>
                    <CheckCircle className="w-4 h-4" /><span>{successMsg}</span>
                  </div>
                )}

                <button type="submit" disabled={isLoading}
                  className={`nagro-submit-btn${isLoading ? ' loading' : ''}`}>
                  {isLoading ? <span className="nagro-spinner" /> : (
                    <><span>Reset Password</span><ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
        <p className="nagro-security-note">🔒 Secure OTP reset · SSL Encrypted</p>
      </div>
    </div>
  );
}
