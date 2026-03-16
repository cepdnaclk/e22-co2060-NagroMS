import { useState } from 'react';
import { Eye, EyeOff, Mail, Phone, CreditCard, ArrowRight, AlertCircle } from 'lucide-react';
import { loginWithEmail, loginWithGoogle, loginWithFacebook } from '../utils/firebase';

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function FarmIllustration() {
  return (
    <svg viewBox="0 0 420 320" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', maxWidth: 380, filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.18))' }}>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#86efac" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#dcfce7" stopOpacity="0.1"/>
        </linearGradient>
        <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80"/>
          <stop offset="100%" stopColor="#16a34a"/>
        </linearGradient>
        <linearGradient id="sun" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde68a"/>
          <stop offset="100%" stopColor="#f59e0b"/>
        </linearGradient>
      </defs>
      <rect width="420" height="320" rx="20" fill="url(#sky)"/>
      <circle cx="360" cy="55" r="32" fill="url(#sun)" opacity="0.9"/>
      {[0,45,90,135,180,225,270,315].map((angle, i) => (
        <line key={i}
          x1={360 + Math.cos(angle * Math.PI/180) * 36} y1={55 + Math.sin(angle * Math.PI/180) * 36}
          x2={360 + Math.cos(angle * Math.PI/180) * 46} y2={55 + Math.sin(angle * Math.PI/180) * 46}
          stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" opacity="0.8"/>
      ))}
      <ellipse cx="80" cy="50" rx="38" ry="18" fill="white" opacity="0.7"/>
      <ellipse cx="105" cy="42" rx="28" ry="16" fill="white" opacity="0.7"/>
      <ellipse cx="60" cy="46" rx="22" ry="14" fill="white" opacity="0.6"/>
      <ellipse cx="210" cy="295" rx="260" ry="80" fill="#166534" opacity="0.4"/>
      <rect x="0" y="230" width="420" height="90" fill="url(#ground)"/>
      <ellipse cx="210" cy="230" rx="250" ry="30" fill="#22c55e"/>
      <rect x="30" y="150" width="90" height="85" rx="3" fill="#dc2626"/>
      <polygon points="20,152 75,100 130,152" fill="#991b1b"/>
      <rect x="58" y="195" width="24" height="40" rx="2" fill="#7f1d1d"/>
      <rect x="40" y="165" width="18" height="16" rx="2" fill="#fef3c7"/>
      <rect x="95" y="165" width="18" height="16" rx="2" fill="#fef3c7"/>
      <rect x="128" y="165" width="28" height="70" rx="4" fill="#e5e7eb"/>
      <ellipse cx="142" cy="160" rx="14" ry="7" fill="#f3f4f6"/>
      {[0,1,2,3,4,5,6].map(i => (
        <g key={i} transform={`translate(${175 + i * 18}, 0)`}>
          <line x1="0" y1="240" x2="0" y2="195" stroke="#a16207" strokeWidth="2"/>
          <ellipse cx="0" cy="192" rx="5" ry="12" fill="#fbbf24" opacity="0.9"/>
        </g>
      ))}
      <g transform="translate(280, 195)">
        <rect x="0" y="20" width="65" height="35" rx="5" fill="#16a34a"/>
        <rect x="5" y="5" width="38" height="30" rx="4" fill="#22c55e"/>
        <rect x="10" y="9" width="28" height="18" rx="3" fill="#bfdbfe" opacity="0.8"/>
        <circle cx="20" cy="55" r="20" fill="#1f2937"/>
        <circle cx="20" cy="55" r="14" fill="#374151"/>
        <circle cx="20" cy="55" r="5" fill="#6b7280"/>
        <circle cx="58" cy="58" r="12" fill="#1f2937"/>
        <circle cx="58" cy="58" r="8" fill="#374151"/>
      </g>
      <rect x="140" y="278" width="140" height="32" rx="16" fill="rgba(0,0,0,0.25)"/>
      <text x="210" y="298" textAnchor="middle" fill="white"
        fontFamily="Georgia, serif" fontSize="13" fontWeight="700" letterSpacing="1">
        🌾 NagroMS
      </text>
    </svg>
  );
}

export function LoginPage({ onNavigate }) {
  const [loginMethod, setLoginMethod]   = useState('email');
  const [formData, setFormData]         = useState({ identifier: '', password: '', rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors]             = useState({ identifier: '', password: '' });
  const [isLoading, setIsLoading]       = useState(false);
  const [generalError, setGeneralError] = useState('');

  const getFirebaseError = (code) => {
    const map = {
      'auth/user-not-found':         'No account found with these details.',
      'auth/wrong-password':         'Incorrect password. Please try again.',
      'auth/invalid-email':          'Please enter a valid email address.',
      'auth/invalid-credential':     'Invalid credentials. Please check and try again.',
      'auth/too-many-requests':      'Too many attempts. Please wait a few minutes.',
      'auth/user-disabled':          'This account has been disabled.',
      'auth/network-request-failed': 'Network error. Check your connection.',
    };
    return map[code] || null;
  };

  // ── Validate identifier by method ──────────────────────────
  const validateIdentifier = (value, method) => {
    if (!value) return `Please enter your ${method === 'email' ? 'email' : method === 'phone' ? 'phone number' : 'NIC number'}`;
    if (method === 'email' && !value.includes('@')) return 'Please enter a valid email address.';
    if (method === 'phone' && value.replace(/\D/g, '').length < 9) return 'Please enter a valid phone number.';
    if (method === 'nic') {
      const oldNIC = /^\d{9}[VvXx]$/.test(value);
      const newNIC = /^\d{12}$/.test(value);
      if (!oldNIC && !newNIC) return 'Enter valid NIC (e.g. 123456789V or 200012345678).';
    }
    return '';
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrors({ identifier: '', password: '' });
    setGeneralError('');

    const identifierError = validateIdentifier(formData.identifier, loginMethod);
    if (identifierError) { setErrors(prev => ({ ...prev, identifier: identifierError })); return; }
    if (!formData.password) { setErrors(prev => ({ ...prev, password: 'Please enter your password.' })); return; }

    setIsLoading(true);
    try {
      let emailToUse = formData.identifier;

      // Phone/NIC login: look up email from backend by phone or NIC
      if (loginMethod === 'phone' || loginMethod === 'nic') {
        try {
          const res  = await fetch('http://localhost:5000/api/auth/find-user', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              [loginMethod === 'phone' ? 'phone' : 'nic']: formData.identifier
            }),
          });
          
          if (res.ok) {
            const data = await res.json();
            if (data.email) {
              emailToUse = data.email;
            }
          }
        } catch (err) {
          console.warn("⚠️ Backend unreachable. Generating mock email for phone/NIC.");
          // Generate same fake email pattern as firebase.js for consistency
          const cleaned = formData.identifier.replace(/\D/g, '').toLowerCase();
          emailToUse = `${loginMethod}_${cleaned}@nagroms.local`;
        }
      }

      const result = await loginWithEmail(emailToUse, formData.password);
      onNavigate(result.dashboardRoute);
    } catch (err) {
      const msg = getFirebaseError(err.code) || err.message || 'Login failed.';
      setErrors(prev => ({ ...prev, password: msg }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setGeneralError('');
    setIsLoading(true);
    try {
      const result = provider === 'Google' ? await loginWithGoogle() : await loginWithFacebook();
      onNavigate(result.dashboardRoute || 'farmer-dashboard');
    } catch (err) {
      setGeneralError(err.message || `${provider} login failed.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setGeneralError('');
  };

  const handleMethodChange = (method) => {
    setLoginMethod(method);
    setFormData({ ...formData, identifier: '' });
    setErrors({ identifier: '', password: '' });
    setGeneralError('');
  };

  const methods = [
    { id: 'email', icon: <Mail className="w-5 h-5" />,       label: 'Email' },
    { id: 'phone', icon: <Phone className="w-5 h-5" />,      label: 'Phone' },
    { id: 'nic',   icon: <CreditCard className="w-5 h-5" />, label: 'NIC'   },
  ];

  const getPlaceholder = () => {
    switch (loginMethod) {
      case 'email': return 'example@email.com';
      case 'phone': return '+94 77 123 4567';
      case 'nic':   return '123456789V or 200012345678';
      default:      return '';
    }
  };

  const getIcon = () => {
    switch (loginMethod) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'nic':   return <CreditCard className="w-4 h-4" />;
      default:      return <Mail className="w-4 h-4" />;
    }
  };

  return (
    <div className="nagro-login-root">
      <div className="nagro-blob nagro-blob-2" />
      <div className="nagro-login-wrapper">

        {/* ── Left panel ── */}
        <div className="nagro-login-brand">
          <div className="nlb-header">
            <div className="nlb-logo-pill">
              <span className="nlb-logo-leaf">🌿</span>
              <span className="nlb-logo-text">NagroMS</span>
            </div>
            <span className="nlb-badge">Sri Lanka 🇱🇰</span>
          </div>
          <div className="nlb-headline">
            <h1 className="nlb-title">From Village<br/><span className="nlb-title-accent">to Market</span></h1>
            <p className="nlb-desc">Empowering farmers across Sri Lanka with direct access to urban buyers — fair prices, zero middlemen.</p>
          </div>
          <div className="nlb-illustration"><FarmIllustration /></div>
          <div className="nlb-stats">
            <div className="nlb-stat"><span className="nlb-stat-num">2–3</span><span className="nlb-stat-label">Pilot Farmers</span></div>
            <div className="nlb-stat-divider" />
            <div className="nlb-stat"><span className="nlb-stat-num">4</span><span className="nlb-stat-label">User Roles</span></div>
            <div className="nlb-stat-divider" />
            <div className="nlb-stat"><span className="nlb-stat-num">100%</span><span className="nlb-stat-label">Transparent</span></div>
          </div>
          <div className="nagro-art-circle nagro-art-c1" />
          <div className="nagro-art-circle nagro-art-c2" />
        </div>

        {/* ── Right panel ── */}
        <div className="nagro-login-form-panel">
          <div className="nagro-login-card">
            <div className="nagro-mobile-logo"><span>🌿</span><span>NagroMS</span></div>
            <div className="nagro-form-header">
              <h2>Welcome back</h2>
              <p>Sign in to your account to continue</p>
            </div>

            {generalError && (
              <div className="nagro-form-error" style={{ marginBottom: 16 }}>
                <AlertCircle className="w-4 h-4" /><span>{generalError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="nagro-form">
              <div className="nagro-field">
                <label className="nagro-label">Login Method</label>
                <div className="nagro-method-tabs">
                  {methods.map(m => (
                    <button key={m.id} type="button"
                      onClick={() => handleMethodChange(m.id)}
                      className={`nagro-method-tab${loginMethod === m.id ? ' active' : ''}`}>
                      {m.icon}<span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="nagro-field">
                <label className="nagro-label">
                  {loginMethod === 'email' ? 'Email Address' : loginMethod === 'phone' ? 'Phone Number' : 'NIC Number'}
                </label>
                <div className={`nagro-input-wrap${errors.identifier ? ' error' : ''}`}>
                  <span className="nagro-input-icon">{getIcon()}</span>
                  <input type="text" name="identifier" value={formData.identifier}
                    onChange={handleChange} placeholder={getPlaceholder()}
                    className="nagro-input" autoComplete="username"/>
                </div>
                {errors.identifier && (
                  <div className="nagro-error-msg">
                    <AlertCircle className="w-3.5 h-3.5"/><span>{errors.identifier}</span>
                  </div>
                )}
              </div>

              <div className="nagro-field">
                <div className="nagro-label-row">
                  <label className="nagro-label">Password</label>
                  <button type="button" onClick={() => onNavigate('forgot-password')} className="nagro-forgot-link">
                    Forgot password?
                  </button>
                </div>
                <div className={`nagro-input-wrap${errors.password ? ' error' : ''}`}>
                  <input type={showPassword ? 'text' : 'password'} name="password"
                    value={formData.password} onChange={handleChange}
                    placeholder="Enter your password" className="nagro-input"
                    style={{ paddingLeft: 14 }} autoComplete="current-password"/>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="nagro-eye-btn">
                    {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                  </button>
                </div>
                {errors.password && (
                  <div className="nagro-error-msg">
                    <AlertCircle className="w-3.5 h-3.5"/><span>{errors.password}</span>
                  </div>
                )}
              </div>

              <label className="nagro-remember">
                <input type="checkbox" name="rememberMe" checked={formData.rememberMe}
                  onChange={handleChange} className="nagro-checkbox"/>
                <span>Remember me for 30 days</span>
              </label>

              <button type="submit" disabled={isLoading}
                className={`nagro-submit-btn${isLoading ? ' loading' : ''}`}>
                {isLoading ? <span className="nagro-spinner"/> : (
                  <><span>Sign In</span><ArrowRight className="w-4 h-4"/></>
                )}
              </button>
            </form>

            <div className="nagro-divider"><span>or continue with</span></div>
            <div className="nagro-social-btns">
              <button type="button" onClick={() => handleSocialLogin('Google')} disabled={isLoading} className="nagro-social-btn">
                <GoogleIcon/><span>Google</span>
              </button>
              <button type="button" onClick={() => handleSocialLogin('Facebook')} disabled={isLoading} className="nagro-social-btn">
                <FacebookIcon/><span>Facebook</span>
              </button>
            </div>

            <p className="nagro-bottom-link">
              Don't have an account?{' '}
              <button type="button" onClick={() => onNavigate('signup')} className="nagro-link">Create account</button>
            </p>
            <p className="nagro-security-note">🔒 Role-based secure access · SSL Encrypted</p>
          </div>
        </div>
      </div>
    </div>
  );
}