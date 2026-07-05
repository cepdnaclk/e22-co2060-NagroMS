import React from 'react';

export default function ServicesSection() {
  return (
    <div className="nagro-section-content">
      <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '24px' }}>Services</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        {/* Transport */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', marginBottom: '16px' }}>🚚 Transport Logistics</h3>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>Manage your delivery services and track current transport requests.</p>
          <button style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #22c55e', color: '#22c55e', backgroundColor: 'transparent', cursor: 'pointer', fontWeight: 600 }}>Request Transport</button>
        </div>

        {/* Bank Details */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', marginBottom: '16px' }}>🏦 Bank Details</h3>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>Update your bank account information for receiving payments securely.</p>
          <button style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #3b82f6', color: '#3b82f6', backgroundColor: 'transparent', cursor: 'pointer', fontWeight: 600 }}>Manage Bank Info</button>
        </div>
      </div>
    </div>
  );
}
