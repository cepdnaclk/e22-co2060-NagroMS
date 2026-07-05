import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage, logout } from '../../../utils/firebase';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

export default function SettingsSection() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [isPaymentEditable, setIsPaymentEditable] = useState(false);
  const [isPasswordEditable, setIsPasswordEditable] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpTarget, setOtpTarget] = useState('');

  const initialForm = {
    fullName: '', nicNumber: '', dateOfBirth: '', gender: '',
    phoneNumber: '', whatsappNumber: '', email: '',
    villageTown: '', district: '', postalCode: '',
    languagePreference: 'en',
    notifications: { newOrderReceived: false, orderAcceptedByCustomer: false, paymentReceived: false, lowStockAlert: false, newMessageReceived: false },
    paymentDetails: { preferredPaymentMethod: '', bankName: '', accountNumber: '', accountHolderName: '', branch: '' },
    profileImage: ''
  };

  const [formData, setFormData] = useState(initialForm);
  const [photoFile, setPhotoFile] = useState(null);
  
  // Password change state
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });

  useEffect(() => {
    let unsub = null;
    const unsubAuth = auth.onAuthStateChanged(user => {
      if (user) {
        unsub = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFormData(prev => ({
              ...prev,
              ...data,
              notifications: { ...prev.notifications, ...(data.notifications || {}) },
              paymentDetails: { ...prev.paymentDetails, ...(data.paymentDetails || {}) }
            }));
          }
        });
      }
    });
    return () => {
      unsubAuth();
      if (unsub) unsub();
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('notif_')) {
      const key = name.split('notif_')[1];
      setFormData(prev => ({ ...prev, notifications: { ...prev.notifications, [key]: checked } }));
    } else if (name.startsWith('pay_')) {
      const key = name.split('pay_')[1];
      setFormData(prev => ({ ...prev, paymentDetails: { ...prev.paymentDetails, [key]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handlePasswordChange = async () => {
    if (!passwords.newPassword && !passwords.confirmPassword) return true;
    
    if (!passwords.newPassword || !passwords.confirmPassword) {
      throw new Error('Please fill all password fields to change password.');
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      throw new Error('New passwords do not match.');
    }
    
    const user = auth.currentUser;
    // OTP verification handles authorization; update directly
    await updatePassword(user, passwords.newPassword);
    setPasswords({ newPassword: '', confirmPassword: '' });
    return true;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setLoading(true);
    setMsg({ type: '', text: '' });
    const uid = auth.currentUser.uid;

    try {
      let finalProfileImage = formData.profileImage;
      
      // Upload photo if selected
      if (photoFile) {
        try {
          const fileRef = ref(storage, `farmers/${uid}/profile/profile-photo-${Date.now()}`);
          await uploadBytes(fileRef, photoFile);
          finalProfileImage = await getDownloadURL(fileRef);
        } catch (imgError) {
          console.warn('Profile image upload failed, proceeding without image update:', imgError);
          finalProfileImage = formData.profileImage || '';
        }
      }

      // Password change if requested
      if (passwords.newPassword) {
        await handlePasswordChange();
      }

      await updateDoc(doc(db, 'users', uid), {
        ...formData,
        profileImage: finalProfileImage,
        role: "farmer",
        updatedAt: serverTimestamp()
      });

      setMsg({ type: 'success', text: 'Settings updated successfully!' });
      setPhotoFile(null);

    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: err.message || 'Failed to update settings.' });
    } finally {
      setLoading(false);
      setIsPaymentEditable(false);
      setIsPasswordEditable(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };
  
  const confirmDelete = () => {
    alert("Account deletion will be handled later with backend security");
    setShowDeleteModal(false);
  };

  const handleEditPaymentClick = () => {
    if (isPaymentEditable) {
      setIsPaymentEditable(false);
    } else {
      setOtpTarget('payment');
      setShowOtpModal(true);
    }
  };

  const handleEditPasswordClick = () => {
    if (isPasswordEditable) {
      setIsPasswordEditable(false);
    } else {
      setOtpTarget('password');
      setShowOtpModal(true);
    }
  };

  const handleVerifyOtp = () => {
    if (otpInput.length >= 4) {
      if (otpTarget === 'payment') {
        setIsPaymentEditable(true);
        setMsg({ type: 'success', text: 'Verification successful. You can now edit your payment details.' });
      } else if (otpTarget === 'password') {
        setIsPasswordEditable(true);
        setMsg({ type: 'success', text: 'Verification successful. You can now change your password.' });
      }
      setShowOtpModal(false);
      setOtpInput('');
      setOtpTarget('');
    } else {
      alert("Please enter a valid OTP code.");
    }
  };

  return (
    <div className="nagro-section-content" style={{ paddingBottom: '60px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '24px' }}>Settings</h2>
      
      {msg.text && (
        <div style={{ padding: '12px', marginBottom: '20px', borderRadius: '6px', backgroundColor: msg.type === 'success' ? '#dcfce7' : '#fee2e2', color: msg.type === 'success' ? '#16a34a' : '#dc2626' }}>
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'grid', gap: '24px', gridTemplateColumns: '1fr', maxWidth: '800px' }}>
        
        {/* Profile Details */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', marginBottom: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>Personal Information</h3>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#f3f4f6', overflow: 'hidden', border: '1px solid #d1d5db', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {photoFile ? (
                <img src={URL.createObjectURL(photoFile)} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : formData.profileImage ? (
                <img src={formData.profileImage} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: '#9ca3af', fontSize: '12px' }}>No Photo</span>
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Profile Photo</label>
              <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} style={{ fontSize: '14px' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Full Name</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>NIC Number</label>
              <input type="text" name="nicNumber" value={formData.nicNumber} onChange={handleChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Date of Birth</label>
              <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Language Preference</label>
              <select name="languagePreference" value={formData.languagePreference} onChange={handleChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}>
                <option value="en">English</option>
                <option value="si">Sinhala</option>
                <option value="ta">Tamil</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', marginBottom: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>Contact Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Phone Number</label>
              <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>WhatsApp Number</label>
              <input type="text" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Village / Town</label>
              <input type="text" name="villageTown" value={formData.villageTown} onChange={handleChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>District</label>
              <input type="text" name="district" value={formData.district} onChange={handleChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Postal Code</label>
              <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} />
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', margin: 0 }}>Payment Details</h3>
            <button type="button" onClick={handleEditPaymentClick} style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: isPaymentEditable ? '#f3f4f6' : '#dcfce7', color: isPaymentEditable ? '#374151' : '#16a34a', border: isPaymentEditable ? '1px solid #d1d5db' : 'none', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}>
              {isPaymentEditable ? 'Cancel Edit' : 'Edit Payment Details'}
            </button>
          </div>
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>{isPaymentEditable ? 'You can now edit your payment details.' : 'Payment details are locked for your security. Click "Edit Payment Details" to verify via SMS.'}</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', opacity: isPaymentEditable ? 1 : 0.6 }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Preferred Payment Method</label>
              <select name="pay_preferredPaymentMethod" disabled={!isPaymentEditable} value={formData.paymentDetails.preferredPaymentMethod} onChange={handleChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', backgroundColor: isPaymentEditable ? 'white' : '#f9fafb' }}>
                <option value="">Select Method</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Bank Name</label>
              <input type="text" name="pay_bankName" disabled={!isPaymentEditable} value={formData.paymentDetails.bankName} onChange={handleChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', backgroundColor: isPaymentEditable ? 'white' : '#f9fafb' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Account Holder Name</label>
              <input type="text" name="pay_accountHolderName" disabled={!isPaymentEditable} value={formData.paymentDetails.accountHolderName} onChange={handleChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', backgroundColor: isPaymentEditable ? 'white' : '#f9fafb' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Account Number</label>
              <input type="text" name="pay_accountNumber" disabled={!isPaymentEditable} value={formData.paymentDetails.accountNumber} onChange={handleChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', backgroundColor: isPaymentEditable ? 'white' : '#f9fafb' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Branch</label>
              <input type="text" name="pay_branch" disabled={!isPaymentEditable} value={formData.paymentDetails.branch} onChange={handleChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', backgroundColor: isPaymentEditable ? 'white' : '#f9fafb' }} />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', marginBottom: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>Notifications</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.keys(formData.notifications).map(key => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#374151', cursor: 'pointer' }}>
                <input type="checkbox" name={`notif_${key}`} checked={formData.notifications[key]} onChange={handleChange} />
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </label>
            ))}
          </div>
        </div>

        {/* Security (Password Change) */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', margin: 0 }}>Change Password</h3>
            <button type="button" onClick={handleEditPasswordClick} style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: isPasswordEditable ? '#f3f4f6' : '#dcfce7', color: isPasswordEditable ? '#374151' : '#16a34a', border: isPasswordEditable ? '1px solid #d1d5db' : 'none', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}>
              {isPasswordEditable ? 'Cancel Edit' : 'Edit Password'}
            </button>
          </div>
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>{isPasswordEditable ? 'You can now change your password. Leave empty if you do not want to change it.' : 'Password fields are locked for your security. Click "Edit Password" to verify via SMS.'}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', opacity: isPasswordEditable ? 1 : 0.6 }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>New Password</label>
              <input type="password" disabled={!isPasswordEditable} value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', backgroundColor: isPasswordEditable ? 'white' : '#f9fafb' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Confirm New Password</label>
              <input type="password" disabled={!isPasswordEditable} value={passwords.confirmPassword} onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', backgroundColor: isPasswordEditable ? 'white' : '#f9fafb' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
          <button type="submit" disabled={loading} style={{ padding: '12px 24px', borderRadius: '6px', backgroundColor: '#16a34a', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '16px', minWidth: '150px' }}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Danger Zone */}
        <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '32px', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button type="button" onClick={handleLogout} style={{ padding: '10px 20px', borderRadius: '6px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', cursor: 'pointer', fontWeight: 600 }}>
            Logout
          </button>
          
          <button type="button" onClick={handleDeleteAccount} style={{ padding: '10px 20px', borderRadius: '6px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            Delete Account
          </button>
        </div>
      </form>

      {/* OTP Modal */}
      {showOtpModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: '#111827' }}>Verify Identity</h2>
            <p style={{ color: '#4b5563', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>
              For your security, we have sent a verification code to your registered mobile number. Please enter it below to verify your identity.
            </p>
            <div style={{ marginBottom: '24px' }}>
              <input type="text" placeholder="Enter OTP (e.g. 123456)" value={otpInput} onChange={e => setOtpInput(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', textAlign: 'center', fontSize: '18px', letterSpacing: '4px' }} />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" onClick={() => { setShowOtpModal(false); setOtpInput(''); setOtpTarget(''); }} style={{ flex: 1, padding: '10px', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
              <button type="button" onClick={handleVerifyOtp} style={{ flex: 1, padding: '10px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Verify</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: '#dc2626' }}>Delete Account</h2>
            <p style={{ color: '#4b5563', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>
              Are you sure you want to delete your account? This action cannot be undone. All your farm data will be permanently removed.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowDeleteModal(false)} style={{ flex: 1, padding: '10px', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
              <button onClick={confirmDelete} style={{ flex: 1, padding: '10px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
