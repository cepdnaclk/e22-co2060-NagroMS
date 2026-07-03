import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Phone, CreditCard, ArrowRight, AlertCircle, Leaf } from 'lucide-react';
import { loginWithEmail } from '../../utils/firebase.js';

export function LoginPage() {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod]   = useState('email');
  const [formData, setFormData]         = useState({ identifier: '', password: '', rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors]             = useState({ identifier: '', password: '' });
  const [isLoading, setIsLoading]       = useState(false);
  const [generalError, setGeneralError] = useState('');

  const getFirebaseError = (code, method) => {
    const fieldLabel = method === 'email' ? 'email address' : method === 'phone' ? 'phone number' : 'NIC number';
    const map = {
      'auth/user-not-found':         `No account found with these ${method === 'email' ? 'email' : method === 'phone' ? 'phone' : 'NIC'} details.`,
      'auth/wrong-password':         'Incorrect password. Please try again.',
      // For phone/NIC logins we translate to an internal email behind the scenes,
      // so a Firebase "invalid-email" here really means we couldn't find/build
      // a matching account for the phone or NIC the user typed — not that their
      // input looked like a bad email address.
      'auth/invalid-email':          method === 'email'
        ? 'Please enter a valid email address.'
        : `No account found for this ${fieldLabel}. Please check and try again.`,
      'auth/invalid-credential':     `Invalid credentials for this ${fieldLabel}. Please check and try again.`,
      'auth/too-many-requests':      'Too many login attempts. Please wait a few minutes before trying again.',
      'auth/user-disabled':          'This account has been disabled.',
      'auth/network-request-failed': 'Network error. Please check your connection and try again.',
    };
    return map[code] || null;
  };

  // ── Strict per-field validation ─────────────────────────────
  const validateIdentifier = (value, method) => {
    if (!value) {
      return `Please enter your ${method === 'email' ? 'email address' : method === 'phone' ? 'phone number' : 'NIC number'}.`;
    }
    if (method === 'email') {
      // Full email regex — must have local@domain.tld
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailRegex.test(value)) return 'Please enter a valid email address (e.g. user@example.com).';
    }
    if (method === 'phone') {
      // Sri Lanka: 07XXXXXXXX (10 digits) or +947XXXXXXXX (11 digits with country code)
      const cleaned = value.replace(/[\s\-().]/g, '');
      const slLocal    = /^07\d{8}$/.test(cleaned);
      const slIntl     = /^\+947\d{8}$/.test(cleaned);
      const slIntlAlt  = /^00947\d{8}$/.test(cleaned);
      if (!slLocal && !slIntl && !slIntlAlt) {
        return 'Enter a valid Sri Lanka phone number (e.g. 0771234567 or +94771234567).';
      }
    }
    if (method === 'nic') {
      const oldNIC = /^\d{9}[VvXx]$/.test(value);
      const newNIC = /^\d{12}$/.test(value);
      if (!oldNIC && !newNIC) return 'Enter a valid NIC (e.g. 123456789V or 200012345678).';
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
          const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
          const res  = await fetch(`${backendUrl}/api/auth/find-user`, {
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
          const cleaned = formData.identifier.replace(/\D/g, '').toLowerCase();
          emailToUse = `${loginMethod}_${cleaned}@nagroms.local`;
        }
      }

      const result = await loginWithEmail(emailToUse, formData.password);
      navigate('/' + result.dashboardRoute);
    } catch (err) {
      const msg = getFirebaseError(err.code, loginMethod) || err.message || 'Login failed.';
      setErrors(prev => ({ ...prev, password: msg }));
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
    { id: 'email', icon: <Mail className="w-4 h-4" />,       label: 'Email'  },
    { id: 'phone', icon: <Phone className="w-4 h-4" />,      label: 'Phone'  },
    { id: 'nic',   icon: <CreditCard className="w-4 h-4" />, label: 'NIC'    },
  ];

  const getPlaceholder = () => {
    switch (loginMethod) {
      case 'email': return 'user@example.com';
      case 'phone': return '0771234567 or +94771234567';
      case 'nic':   return '123456789V  or  200012345678';
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
      <div className="nagro-login-wrapper">

        {/* ── Left panel — farm photo ── */}
        <div className="nagro-login-brand">
          <div className="nagro-brand-overlay" />
          <div className="nagro-brand-inner">
            <div className="nlb-logo-pill">
              <Leaf className="nlb-logo-leaf-icon" />
              <span className="nlb-logo-text">NagroMS</span>
            </div>
            <h1 className="nlb-brand-headline">
              Empowering<br />
              <span className="nlb-headline-accent">Agriculture,</span><br />
              Connecting Markets
            </h1>
            <p className="nlb-brand-sub">
              Direct farm-to-market platform for Sri Lankan farmers — fair prices, zero middlemen.
            </p>
            <div className="nlb-brand-stats">
              <div className="nlb-brand-stat"><span className="nlb-stat-num">2–3</span><span className="nlb-stat-label">Pilot Farmers</span></div>
              <div className="nlb-stat-sep" />
              <div className="nlb-brand-stat"><span className="nlb-stat-num">4</span><span className="nlb-stat-label">User Roles</span></div>
              <div className="nlb-stat-sep" />
              <div className="nlb-brand-stat"><span className="nlb-stat-num">100%</span><span className="nlb-stat-label">Transparent</span></div>
            </div>
          </div>
        </div>

        {/* ── Right panel — form ── */}
        <div className="nagro-login-form-panel">
          <div className="nagro-login-card">

            {/* Mobile-only logo */}
            <div className="nagro-mobile-logo">
              <Leaf size={18} />
              <span>NagroMS</span>
            </div>

            <div className="nagro-form-header">
              <h2>Login to NagroMS</h2>
              <p>Select your account type and sign in below</p>
            </div>

            {generalError && (
              <div className="nagro-form-error" style={{ marginBottom: 16 }}>
                <AlertCircle className="w-4 h-4" /><span>{generalError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="nagro-form">

              {/* Account type selector */}
              <div className="nagro-field">
                <label className="nagro-label">Account Type *</label>
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

              {/* Identifier field */}
              <div className="nagro-field">
                <label className="nagro-label">
                  {loginMethod === 'email' ? 'Email Address' : loginMethod === 'phone' ? 'Phone Number' : 'NIC Number'} *
                </label>
                <div className={`nagro-input-wrap${errors.identifier ? ' error' : ''}`}>
                  <span className="nagro-input-icon">{getIcon()}</span>
                  <input type="text" name="identifier" value={formData.identifier}
                    onChange={handleChange} placeholder={getPlaceholder()}
                    className="nagro-input" autoComplete="username" />
                </div>
                {errors.identifier && (
                  <div className="nagro-error-msg">
                    <AlertCircle className="w-3.5 h-3.5" /><span>{errors.identifier}</span>
                  </div>
                )}
              </div>

              {/* Password field */}
              <div className="nagro-field">
                <div className="nagro-label-row">
                  <label className="nagro-label">Password *</label>
                  <button type="button" onClick={() => navigate('/forgot-password')} className="nagro-forgot-link">
                    Forgot password?
                  </button>
                </div>
                <div className={`nagro-input-wrap${errors.password ? ' error' : ''}`}>
                  <input type={showPassword ? 'text' : 'password'} name="password"
                    value={formData.password} onChange={handleChange}
                    placeholder="Your password" className="nagro-input"
                    style={{ paddingLeft: 14 }} autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="nagro-eye-btn">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <div className="nagro-error-msg">
                    <AlertCircle className="w-3.5 h-3.5" /><span>{errors.password}</span>
                  </div>
                )}
              </div>

              <button type="submit" disabled={isLoading}
                className={`nagro-submit-btn${isLoading ? ' loading' : ''}`}>
                {isLoading ? <span className="nagro-spinner" /> : (
                  <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <p className="nagro-bottom-link">
              Don't have an account?{' '}
              <button type="button" onClick={() => navigate('/signup')} className="nagro-link">Create account</button>
            </p>
            <p className="nagro-security-note">🔒 Role-based secure access · SSL Encrypted</p>
          </div>
        </div>
      </div>
    </div>
  );
}