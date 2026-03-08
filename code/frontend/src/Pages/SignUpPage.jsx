import { useState } from 'react';
import {
  Leaf, Mail, Lock, User, ArrowLeft, ArrowRight, CreditCard, Phone, MapPin,
  Check, Building2, UserCircle, Tractor, ShoppingBag, Wrench, GraduationCap,
  AlertCircle, Eye, EyeOff
} from 'lucide-react';
import { registerWithEmail } from '../utils/firebase';

const SRI_LANKAN_DISTRICTS = [
  'Colombo','Gampaha','Kalutara','Kandy','Matale','Nuwara Eliya',
  'Galle','Matara','Hambantota','Jaffna','Kilinochchi','Mannar',
  'Vavuniya','Mullaitivu','Batticaloa','Ampara','Trincomalee',
  'Kurunegala','Puttalam','Anuradhapura','Polonnaruwa','Badulla',
  'Monaragala','Ratnapura','Kegalle'
];

export function SignUpPage({ onNavigate }) {
  const [step, setStep]               = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [formError, setFormError]       = useState('');
  const [isLoading, setIsLoading]       = useState(false);
  const [formData, setFormData] = useState({
    roles: [], accountType: '',
    fullName: '', nic: '', district: '', phone: '', email: '',
    password: '', confirmPassword: '',
    businessName: '', businessRegistrationNumber: '', contactPersonName: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleRoleToggle = (role) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const handleRoleContinue = () => {
    if (formData.roles.length === 0) {
      setFormError('Please select at least one role to continue.');
      return;
    }
    setFormError('');
    const needsAccountType = formData.roles.includes('customer') || formData.roles.includes('service-provider');
    if (needsAccountType) { setStep(2); }
    else { setFormData(prev => ({ ...prev, accountType: 'individual' })); setStep(3); }
  };

  const handleAccountTypeSelect = (accountType) => {
    setFormData(prev => ({ ...prev, accountType }));
    setStep(3);
  };

  // ── Map Firebase error codes ──────────────────────────────
  const getFirebaseError = (code) => {
    const map = {
      'auth/email-already-in-use': 'An account already exists with this email/phone/NIC.',
      'auth/invalid-email':        'Invalid email address.',
      'auth/weak-password':        'Password is too weak. Use at least 6 characters.',
      'auth/network-request-failed': 'Network error. Check your connection.',
    };
    return map[code] || null;
  };

  // ── Main registration handler — calls Firebase + backend ──
  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validate passwords
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    // Must have at least one of: email, phone, NIC
    if (!formData.email && !formData.phone && !formData.nic) {
      setFormError('Please provide at least an email, phone number, or NIC.');
      return;
    }

    setIsLoading(true);
    try {
      // Calls firebase.js → registerWithEmail → Firebase Auth + backend /api/auth/register
      const result = await registerWithEmail(formData);
      const dashRoute = result.dashboardRoute || getDashRoute(formData.roles[0]);
      onNavigate(dashRoute);
    } catch (err) {
      const friendly = getFirebaseError(err.code) || err.message || 'Registration failed. Please try again.';
      setFormError(friendly);
    } finally {
      setIsLoading(false);
    }
  };

  const getDashRoute = (role) => {
    const map = {
      farmer: 'farmer-dashboard', customer: 'customer-dashboard',
      'service-provider': 'service-provider-dashboard', expert: 'expert-dashboard',
    };
    return map[role] || 'login';
  };

  const handleBack = () => {
    setFormError('');
    if (step === 3) {
      const needsAccountType = formData.roles.includes('customer') || formData.roles.includes('service-provider');
      setStep(needsAccountType ? 2 : 1);
    } else if (step === 2) { setStep(1); }
    else { onNavigate('landing'); }
  };

  const totalSteps  = formData.roles.includes('customer') || formData.roles.includes('service-provider') ? 3 : 2;
  const displayStep = step === 3 ? totalSteps : step;

  const getRoleLabel = () => formData.roles.map(r => ({
    farmer: 'Farmer', customer: 'Customer',
    'service-provider': 'Service Provider', expert: 'Agricultural Expert'
  }[r] || r)).join(' & ');

  const roles = [
    { id: 'farmer',           icon: <Tractor className="w-8 h-8"/>,       title: 'Farmer',              desc: 'Sell produce, manage crops, and access farming tools',     color: 'green'  },
    { id: 'customer',         icon: <ShoppingBag className="w-8 h-8"/>,   title: 'Customer',            desc: 'Buy fresh produce directly from local farmers',            color: 'blue'   },
    { id: 'service-provider', icon: <Wrench className="w-8 h-8"/>,        title: 'Service Provider',    desc: 'Offer equipment rentals and agricultural services',        color: 'orange' },
    { id: 'expert',           icon: <GraduationCap className="w-8 h-8"/>, title: 'Agricultural Expert', desc: 'Provide consultations and share expertise',                color: 'purple' },
  ];

  return (
    <div className="nagro-signup-root">
      <div className="nagro-blob nagro-blob-1" />
      <div className="nagro-blob nagro-blob-2" />

      <div className="nagro-signup-container">
        {/* Top bar */}
        <div className="nagro-signup-topbar">
          <button type="button" onClick={handleBack} className="nagro-back-btn">
            <ArrowLeft className="w-4 h-4"/><span>Back</span>
          </button>
          <div className="nagro-signup-logo"><Leaf className="w-5 h-5"/><span>NagroMS</span></div>
          <div className="nagro-step-counter">Step {displayStep} of {totalSteps}</div>
        </div>

        {/* Progress bar */}
        <div className="nagro-progress-bar">
          <div className="nagro-progress-fill" style={{ width: `${(displayStep / totalSteps) * 100}%` }}/>
        </div>

        {/* Step dots */}
        <div className="nagro-step-dots">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`nagro-step-dot${i < displayStep ? ' done' : ''}${i + 1 === displayStep ? ' active' : ''}`}>
              {i + 1 < displayStep ? <Check className="w-3.5 h-3.5"/> : <span>{i + 1}</span>}
            </div>
          ))}
        </div>

        <div className="nagro-signup-card">

          {/* ── Step 1: Role Selection ── */}
          {step === 1 && (
            <div className="nagro-step-content">
              <div className="nagro-step-header">
                <h2>Select Your Role</h2>
                <p>Choose one or more roles. You can always update later.</p>
              </div>
              <div className="nagro-roles-grid">
                {roles.map(role => (
                  <button key={role.id} type="button" onClick={() => handleRoleToggle(role.id)}
                    className={`nagro-role-card nagro-role-${role.color}${formData.roles.includes(role.id) ? ' selected' : ''}`}>
                    <div className="nagro-role-check">
                      {formData.roles.includes(role.id) && <Check className="w-4 h-4"/>}
                    </div>
                    <div className="nagro-role-icon">{role.icon}</div>
                    <h3>{role.title}</h3>
                    <p>{role.desc}</p>
                  </button>
                ))}
              </div>
              {formError && (
                <div className="nagro-form-error"><AlertCircle className="w-4 h-4"/><span>{formError}</span></div>
              )}
              <button type="button" onClick={handleRoleContinue} className="nagro-submit-btn">
                <span>Continue</span><ArrowRight className="w-4 h-4"/>
              </button>
            </div>
          )}

          {/* ── Step 2: Account Type ── */}
          {step === 2 && (
            <div className="nagro-step-content">
              <div className="nagro-step-header">
                <h2>Account Type</h2>
                <p>Registering as <strong className="nagro-highlight">{getRoleLabel()}</strong></p>
              </div>
              <div className="nagro-account-type-grid">
                {[
                  { id: 'individual', icon: <UserCircle className="w-14 h-14"/>, title: 'Individual Account', desc: 'For personal use', features: ['Personal profile','Quick registration','Direct purchases'] },
                  { id: 'business',   icon: <Building2 className="w-14 h-14"/>,  title: 'Business Account',  desc: 'For companies & organizations', features: ['Business profile','Multiple users','Bulk transactions'] },
                ].map(type => (
                  <button key={type.id} type="button" onClick={() => handleAccountTypeSelect(type.id)}
                    className="nagro-account-type-card">
                    <div className="nagro-acct-icon">{type.icon}</div>
                    <h3>{type.title}</h3>
                    <p className="nagro-acct-desc">{type.desc}</p>
                    <ul className="nagro-acct-features">
                      {type.features.map((f, i) => (
                        <li key={i}><Check className="w-3.5 h-3.5"/><span>{f}</span></li>
                      ))}
                    </ul>
                    <span className="nagro-acct-select-btn">Select <ArrowRight className="w-3.5 h-3.5"/></span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 3: Registration Form ── */}
          {step === 3 && (
            <div className="nagro-step-content">
              <div className="nagro-step-header">
                <h2>Complete Registration</h2>
                <p>
                  <span className="nagro-highlight">{getRoleLabel()}</span>
                  {' · '}
                  <span className="nagro-highlight">{formData.accountType === 'individual' ? 'Individual' : 'Business'}</span>
                </p>
              </div>

              <form onSubmit={handleRegistrationSubmit} className="nagro-reg-form">

                {/* Individual fields */}
                {formData.accountType === 'individual' ? (
                  <div className="nagro-form-row">
                    <div className="nagro-field">
                      <label className="nagro-label">Full Name *</label>
                      <div className="nagro-input-wrap">
                        <span className="nagro-input-icon"><User className="w-4 h-4"/></span>
                        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                          placeholder="Your full name" className="nagro-input" required/>
                      </div>
                    </div>
                    <div className="nagro-field">
                      <label className="nagro-label">NIC Number *</label>
                      <div className="nagro-input-wrap">
                        <span className="nagro-input-icon"><CreditCard className="w-4 h-4"/></span>
                        <input type="text" name="nic" value={formData.nic} onChange={handleChange}
                          placeholder="123456789V or 200012345678" className="nagro-input" required/>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="nagro-field">
                      <label className="nagro-label">Business Name *</label>
                      <div className="nagro-input-wrap">
                        <span className="nagro-input-icon"><Building2 className="w-4 h-4"/></span>
                        <input type="text" name="businessName" value={formData.businessName} onChange={handleChange}
                          placeholder="Your business name" className="nagro-input" required/>
                      </div>
                    </div>
                    <div className="nagro-form-row">
                      <div className="nagro-field">
                        <label className="nagro-label">Registration No. *</label>
                        <div className="nagro-input-wrap">
                          <span className="nagro-input-icon"><CreditCard className="w-4 h-4"/></span>
                          <input type="text" name="businessRegistrationNumber" value={formData.businessRegistrationNumber}
                            onChange={handleChange} placeholder="BR/12345" className="nagro-input" required/>
                        </div>
                      </div>
                      <div className="nagro-field">
                        <label className="nagro-label">Contact Person *</label>
                        <div className="nagro-input-wrap">
                          <span className="nagro-input-icon"><User className="w-4 h-4"/></span>
                          <input type="text" name="contactPersonName" value={formData.contactPersonName}
                            onChange={handleChange} placeholder="Contact name" className="nagro-input" required/>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="nagro-form-row">
                  <div className="nagro-field">
                    <label className="nagro-label">District *</label>
                    <div className="nagro-input-wrap nagro-select-wrap">
                      <span className="nagro-input-icon"><MapPin className="w-4 h-4"/></span>
                      <select name="district" value={formData.district} onChange={handleChange}
                        className="nagro-input nagro-select" required>
                        <option value="">Select district</option>
                        {SRI_LANKAN_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <span className="nagro-select-arrow"><ArrowRight className="w-4 h-4"/></span>
                    </div>
                  </div>
                  <div className="nagro-field">
                    <label className="nagro-label">Phone Number *</label>
                    <div className="nagro-input-wrap">
                      <span className="nagro-input-icon"><Phone className="w-4 h-4"/></span>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                        placeholder="+94 77 123 4567" className="nagro-input" required/>
                    </div>
                  </div>
                </div>

                <div className="nagro-field">
                  <label className="nagro-label">Email Address <span style={{color:'#9ca3af',fontWeight:400}}>(optional)</span></label>
                  <div className="nagro-input-wrap">
                    <span className="nagro-input-icon"><Mail className="w-4 h-4"/></span>
                    <input type="email" name="email" value={formData.email} onChange={handleChange}
                      placeholder="example@email.com — leave blank if none" className="nagro-input"/>
                  </div>
                </div>

                <div className="nagro-form-row">
                  <div className="nagro-field">
                    <label className="nagro-label">Password *</label>
                    <div className="nagro-input-wrap">
                      <span className="nagro-input-icon"><Lock className="w-4 h-4"/></span>
                      <input type={showPassword ? 'text' : 'password'} name="password"
                        value={formData.password} onChange={handleChange}
                        placeholder="Min. 6 characters" className="nagro-input" required minLength={6}/>
                      <button type="button" className="nagro-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                      </button>
                    </div>
                  </div>
                  <div className="nagro-field">
                    <label className="nagro-label">Confirm Password *</label>
                    <div className="nagro-input-wrap">
                      <span className="nagro-input-icon"><Lock className="w-4 h-4"/></span>
                      <input type={showConfirm ? 'text' : 'password'} name="confirmPassword"
                        value={formData.confirmPassword} onChange={handleChange}
                        placeholder="Re-enter password" className="nagro-input" required minLength={6}/>
                      <button type="button" className="nagro-eye-btn" onClick={() => setShowConfirm(!showConfirm)}>
                        {showConfirm ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                      </button>
                    </div>
                  </div>
                </div>

                {formData.confirmPassword && (
                  <div className={`nagro-password-match ${formData.password === formData.confirmPassword ? 'match' : 'no-match'}`}>
                    {formData.password === formData.confirmPassword
                      ? <><Check className="w-3.5 h-3.5"/><span>Passwords match</span></>
                      : <><AlertCircle className="w-3.5 h-3.5"/><span>Passwords do not match</span></>}
                  </div>
                )}

                <label className="nagro-terms">
                  <input type="checkbox" className="nagro-checkbox" required/>
                  <span>I agree to the <a href="#" className="nagro-link">Terms of Service</a> and <a href="#" className="nagro-link">Privacy Policy</a></span>
                </label>

                {formError && (
                  <div className="nagro-form-error"><AlertCircle className="w-4 h-4"/><span>{formError}</span></div>
                )}

                <button type="submit" disabled={isLoading}
                  className={`nagro-submit-btn${isLoading ? ' loading' : ''}`}>
                  {isLoading
                    ? <span className="nagro-spinner"/>
                    : <><Check className="w-4 h-4"/><span>Create Account</span></>
                  }
                </button>
              </form>
            </div>
          )}
        </div>

        <p className="nagro-bottom-link nagro-signup-signin">
          Already have an account?{' '}
          <button type="button" onClick={() => onNavigate('login')} className="nagro-link">Sign in here</button>
        </p>
        <p className="nagro-signup-footer-note">🌾 Join farmers, customers & agricultural professionals on NagroMS</p>
      </div>
    </div>
  );
}