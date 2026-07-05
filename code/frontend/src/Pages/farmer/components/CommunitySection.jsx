import React from 'react';

export default function CommunitySection() {
  return (
    <div className="nagro-section-content">
      <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '24px' }}>Community</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Customers */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', marginBottom: '16px' }}>🛒 Interested Customers</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ padding: '12px 0', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 600, color: '#111827' }}>Sunil Perera</p>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>Looking for fresh tomatoes</p>
              </div>
              <button style={{ padding: '4px 12px', borderRadius: '4px', backgroundColor: '#e5e7eb', color: '#374151', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Message</button>
            </li>
            <li style={{ padding: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 600, color: '#111827' }}>Kamal Silva</p>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>Bulk order inquiry</p>
              </div>
              <button style={{ padding: '4px 12px', borderRadius: '4px', backgroundColor: '#e5e7eb', color: '#374151', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Message</button>
            </li>
          </ul>
        </div>

        {/* Experts */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', marginBottom: '16px' }}>👨‍🌾 Available Experts</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ padding: '12px 0', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 600, color: '#111827' }}>Dr. A. Fernando</p>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>Crop Disease Specialist</p>
              </div>
              <button style={{ padding: '4px 12px', borderRadius: '4px', backgroundColor: '#dcfce7', color: '#16a34a', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Consult</button>
            </li>
            <li style={{ padding: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 600, color: '#111827' }}>Mr. R. Bandara</p>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>Soil Health Expert</p>
              </div>
              <button style={{ padding: '4px 12px', borderRadius: '4px', backgroundColor: '#dcfce7', color: '#16a34a', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Consult</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
