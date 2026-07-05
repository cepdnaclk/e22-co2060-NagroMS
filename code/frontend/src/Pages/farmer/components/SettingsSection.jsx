import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../../utils/firebase';

export default function SettingsSection() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <div className="nagro-section-content">
      <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '24px' }}>Settings</h2>
      
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', maxWidth: '600px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', marginBottom: '16px' }}>Account Preferences</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Profile Name</label>
            <input type="text" defaultValue="Farmer Account" style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Language</label>
            <select style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}>
              <option value="en">English</option>
              <option value="si">Sinhala</option>
              <option value="ta">Tamil</option>
            </select>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
          <button 
            onClick={handleLogout}
            style={{ padding: '10px 20px', borderRadius: '6px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer', fontWeight: 600, width: '100%' }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
