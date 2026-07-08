import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Leaf, Mail, Lock, User, ArrowLeft, ArrowRight, CreditCard, Phone, MapPin,
  Check, Building2, UserCircle, Tractor, ShoppingBag, Wrench, GraduationCap,
  AlertCircle, Eye, EyeOff, Globe
} from 'lucide-react';
import { registerWithEmail } from '../../utils/firebase.js';
import { useLanguage, SUPPORTED_LANGUAGES } from '../../i18n/LanguageContext.jsx';

const LANGUAGE_LABELS = { en: 'EN', si: 'සිං', ta: 'த' };

const SRI_LANKAN_DISTRICTS = [
  'Colombo','Gampaha','Kalutara','Kandy','Matale','Nuwara Eliya',
  'Galle','Matara','Hambantota','Jaffna','Kilinochchi','Mannar',
  'Vavuniya','Mullaitivu','Batticaloa','Ampara','Trincomalee',
  'Kurunegala','Puttalam','Anuradhapura','Polonnaruwa','Badulla',
  'Monaragala','Ratnapura','Kegalle'
];

export function SignUpPage() {
  const navigate = useNavigate();
  const { lang, setLang, t } = useLanguage();
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
      setFormError(t('signup.errors.selectRole'));
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
      'auth/email-already-in-use': t('signup.errors.emailInUse'),
      'auth/invalid-email':        t('signup.errors.invalidEmail'),
      'auth/weak-password':        t('signup.errors.weakPassword'),
      'auth/network-request-failed': t('signup.errors.networkFailed'),
    };
    return map[code] || null;
  };

  // ── Main registration handler — calls Firebase + backend ──
  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validate passwords
    if (formData.password !== formData.confirmPassword) {
      setFormError(t('signup.errors.passwordsMismatch'));
      return;
    }
    if (formData.password.length < 6) {
      setFormError(t('signup.errors.passwordTooShort'));
      return;
    }

    // Must have at least one of: email, phone, NIC
    if (!formData.email && !formData.phone && !formData.nic) {
      setFormError(t('signup.errors.needIdentifier'));
      return;
    }

    setIsLoading(true);
    try {
      // Calls firebase.js → registerWithEmail → Firebase Auth + backend /api/auth/register
      const result = await registerWithEmail(formData);
      const dashRoute = result.dashboardRoute || getDashRoute(formData.roles[0]);
      navigate('/' + dashRoute);
    } catch (err) {
      const friendly = getFirebaseError(err.code) || err.message || t('signup.errors.registrationFailed');
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
    else { navigate('/login'); }
  };

  const totalSteps  = formData.roles.includes('customer') || formData.roles.includes('service-provider') ? 3 : 2;
  const displayStep = step === 3 ? totalSteps : step;

  const getRoleLabel = () => formData.roles.map(r => ({
    farmer: t('signup.roles.farmer.title'), customer: t('signup.roles.customer.title'),
    'service-provider': t('signup.roles.serviceProvider.title'), expert: t('signup.roles.expert.title')
  }[r] || r)).join(' & ');

  const roles = [
    { id: 'farmer',           icon: <Tractor className="w-8 h-8"/>,       title: t('signup.roles.farmer.title'),           desc: t('signup.roles.farmer.desc'),           color: 'green'  },
    { id: 'customer',         icon: <ShoppingBag className="w-8 h-8"/>,   title: t('signup.roles.customer.title'),         desc: t('signup.roles.customer.desc'),         color: 'blue'   },
    { id: 'service-provider', icon: <Wrench className="w-8 h-8"/>,        title: t('signup.roles.serviceProvider.title'),  desc: t('signup.roles.serviceProvider.desc'),  color: 'orange' },
    { id: 'expert',           icon: <GraduationCap className="w-8 h-8"/>, title: t('signup.roles.expert.title'),           desc: t('signup.roles.expert.desc'),           color: 'purple' },
  ];

  return (
    <div className="nagro-signup-root">
      <div className="nagro-blob nagro-blob-1" />
      <div className="nagro-blob nagro-blob-2" />

      <div className="nagro-signup-container">
        {/* Top bar */}
        <div className="nagro-signup-topbar">
          <button type="button" onClick={handleBack} className="nagro-back-btn">
            <ArrowLeft className="w-4 h-4"/><span>{t('signup.back')}</span>
          </button>
          <div className="nagro-signup-logo"><Leaf className="w-5 h-5"/><span>NagroMS</span></div>
          <div className="nagro-signup-topbar-right">
            <div className="nagro-lang-switcher" role="group" aria-label="Select language">
              <Globe className="w-4 h-4 nagro-lang-globe" />
              {SUPPORTED_LANGUAGES.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLang(code)}
                  className={`nagro-lang-btn${lang === code ? ' active' : ''}`}
                  aria-pressed={lang === code}
                >
                  {LANGUAGE_LABELS[code]}
                </button>
              ))}
            </div>
            <div className="nagro-step-counter">{t('signup.stepCounter', { current: displayStep, total: totalSteps })}</div>
          </div>
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
                <h2>{t('signup.step1.title')}</h2>
                <p>{t('signup.step1.subtitle')}</p>
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
                <span>{t('signup.step1.continue')}</span><ArrowRight className="w-4 h-4"/>
              </button>
            </div>
          )}

          {/* ── Step 2: Account Type ── */}
          {step === 2 && (
            <div className="nagro-step-content">
              <div className="nagro-step-header">
                <h2>{t('signup.step2.title')}</h2>
                <p>{t('signup.step2.registeringAs')} <strong className="nagro-highlight">{getRoleLabel()}</strong></p>
              </div>
              <div className="nagro-account-type-grid">
                {[
                  { id: 'individual', icon: <UserCircle className="w-14 h-14"/>, title: t('signup.step2.individual.title'), desc: t('signup.step2.individual.desc'), features: t('signup.step2.individual.features') },
                  { id: 'business',   icon: <Building2 className="w-14 h-14"/>,  title: t('signup.step2.business.title'),   desc: t('signup.step2.business.desc'),   features: t('signup.step2.business.features') },
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
                    <span className="nagro-acct-select-btn">{t('signup.step2.select')} <ArrowRight className="w-3.5 h-3.5"/></span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 3: Registration Form ── */}
          {step === 3 && (
            <div className="nagro-step-content">
              <div className="nagro-step-header">
                <h2>{t('signup.step3.title')}</h2>
                <p>
                  <span className="nagro-highlight">{getRoleLabel()}</span>
                  {' · '}
                  <span className="nagro-highlight">{formData.accountType === 'individual' ? t('signup.step3.individual') : t('signup.step3.business')}</span>
                </p>
              </div>

              <form onSubmit={handleRegistrationSubmit} className="nagro-reg-form">

                {/* Individual fields */}
                {formData.accountType === 'individual' ? (
                  <div className="nagro-form-row">
                    <div className="nagro-field">
                      <label className="nagro-label">{t('signup.step3.fullName')} *</label>
                      <div className="nagro-input-wrap">
                        <span className="nagro-input-icon"><User className="w-4 h-4"/></span>
                        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                          placeholder={t('signup.step3.fullNamePh')} className="nagro-input" required/>
                      </div>
                    </div>
                    <div className="nagro-field">
                      <label className="nagro-label">{t('signup.step3.nicNumber')} *</label>
                      <div className="nagro-input-wrap">
                        <span className="nagro-input-icon"><CreditCard className="w-4 h-4"/></span>
                        <input type="text" name="nic" value={formData.nic} onChange={handleChange}
                          placeholder={t('signup.step3.nicPh')} className="nagro-input" required/>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="nagro-field">
                      <label className="nagro-label">{t('signup.step3.businessName')} *</label>
                      <div className="nagro-input-wrap">
                        <span className="nagro-input-icon"><Building2 className="w-4 h-4"/></span>
                        <input type="text" name="businessName" value={formData.businessName} onChange={handleChange}
                          placeholder={t('signup.step3.businessNamePh')} className="nagro-input" required/>
                      </div>
                    </div>
                    <div className="nagro-form-row">
                      <div className="nagro-field">
                        <label className="nagro-label">{t('signup.step3.registrationNo')} *</label>
                        <div className="nagro-input-wrap">
                          <span className="nagro-input-icon"><CreditCard className="w-4 h-4"/></span>
                          <input type="text" name="businessRegistrationNumber" value={formData.businessRegistrationNumber}
                            onChange={handleChange} placeholder={t('signup.step3.registrationNoPh')} className="nagro-input" required/>
                        </div>
                      </div>
                      <div className="nagro-field">
                        <label className="nagro-label">{t('signup.step3.contactPerson')} *</label>
                        <div className="nagro-input-wrap">
                          <span className="nagro-input-icon"><User className="w-4 h-4"/></span>
                          <input type="text" name="contactPersonName" value={formData.contactPersonName}
                            onChange={handleChange} placeholder={t('signup.step3.contactPersonPh')} className="nagro-input" required/>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="nagro-form-row">
                  <div className="nagro-field">
                    <label className="nagro-label">{t('signup.step3.district')} *</label>
                    <div className="nagro-input-wrap nagro-select-wrap">
                      <span className="nagro-input-icon"><MapPin className="w-4 h-4"/></span>
                      <select name="district" value={formData.district} onChange={handleChange}
                        className="nagro-input nagro-select" required>
                        <option value="">{t('signup.step3.selectDistrict')}</option>
                        {SRI_LANKAN_DISTRICTS.map(d => <option key={d} value={d}>{t(`districts.${d}`)}</option>)}
                      </select>
                      <span className="nagro-select-arrow"><ArrowRight className="w-4 h-4"/></span>
                    </div>
                  </div>
                  <div className="nagro-field">
                    <label className="nagro-label">{t('signup.step3.phoneNumber')} *</label>
                    <div className="nagro-input-wrap">
                      <span className="nagro-input-icon"><Phone className="w-4 h-4"/></span>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                        placeholder={t('signup.step3.phonePh')} className="nagro-input" required/>
                    </div>
                  </div>
                </div>

                <div className="nagro-field">
                  <label className="nagro-label">{t('signup.step3.emailAddress')} <span style={{color:'#9ca3af',fontWeight:400}}>{t('signup.step3.optional')}</span></label>
                  <div className="nagro-input-wrap">
                    <span className="nagro-input-icon"><Mail className="w-4 h-4"/></span>
                    <input type="email" name="email" value={formData.email} onChange={handleChange}
                      placeholder={t('signup.step3.emailPh')} className="nagro-input"/>
                  </div>
                </div>

                <div className="nagro-form-row">
                  <div className="nagro-field">
                    <label className="nagro-label">{t('signup.step3.password')} *</label>
                    <div className="nagro-input-wrap">
                      <span className="nagro-input-icon"><Lock className="w-4 h-4"/></span>
                      <input type={showPassword ? 'text' : 'password'} name="password"
                        value={formData.password} onChange={handleChange}
                        placeholder={t('signup.step3.passwordPh')} className="nagro-input" required minLength={6}/>
                      <button type="button" className="nagro-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                      </button>
                    </div>
                  </div>
                  <div className="nagro-field">
                    <label className="nagro-label">{t('signup.step3.confirmPassword')} *</label>
                    <div className="nagro-input-wrap">
                      <span className="nagro-input-icon"><Lock className="w-4 h-4"/></span>
                      <input type={showConfirm ? 'text' : 'password'} name="confirmPassword"
                        value={formData.confirmPassword} onChange={handleChange}
                        placeholder={t('signup.step3.confirmPasswordPh')} className="nagro-input" required minLength={6}/>
                      <button type="button" className="nagro-eye-btn" onClick={() => setShowConfirm(!showConfirm)}>
                        {showConfirm ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                      </button>
                    </div>
                  </div>
                </div>

                {formData.confirmPassword && (
                  <div className={`nagro-password-match ${formData.password === formData.confirmPassword ? 'match' : 'no-match'}`}>
                    {formData.password === formData.confirmPassword
                      ? <><Check className="w-3.5 h-3.5"/><span>{t('signup.step3.passwordsMatch')}</span></>
                      : <><AlertCircle className="w-3.5 h-3.5"/><span>{t('signup.step3.passwordsNoMatch')}</span></>}
                  </div>
                )}

                <label className="nagro-terms">
                  <input type="checkbox" className="nagro-checkbox" required/>
                  <span>{t('signup.step3.agreeTermsPrefix')} <a href="#!" className="nagro-link">{t('signup.step3.termsOfService')}</a> {t('signup.step3.agreeTermsMiddle')} <a href="#!" className="nagro-link">{t('signup.step3.privacyPolicy')}</a></span>
                </label>

                {formError && (
                  <div className="nagro-form-error"><AlertCircle className="w-4 h-4"/><span>{formError}</span></div>
                )}

                <button type="submit" disabled={isLoading}
                  className={`nagro-submit-btn${isLoading ? ' loading' : ''}`}>
                  {isLoading
                    ? <span className="nagro-spinner"/>
                    : <><Check className="w-4 h-4"/><span>{t('signup.step3.createAccount')}</span></>
                  }
                </button>
              </form>
            </div>
          )}
        </div>

        <p className="nagro-bottom-link nagro-signup-signin">
          {t('signup.alreadyHaveAccount')}{' '}
          <button type="button" onClick={() => navigate('/login')} className="nagro-link">{t('signup.signInHere')}</button>
        </p>
        <p className="nagro-signup-footer-note">{t('signup.footerNote')}</p>
      </div>
    </div>
  );
}