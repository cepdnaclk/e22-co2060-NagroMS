import React from 'react';

export default function OverviewSection({ isNewFarmer }) {
  return (
    <div className="nagro-section-content">
      <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '24px' }}>Overview</h2>
      
      {isNewFarmer ? (
        <div style={{ padding: '40px', backgroundColor: '#f9fafb', borderRadius: '12px', textAlign: 'center', border: '1px dashed #d1d5db' }}>
          <h3 style={{ fontSize: '18px', color: '#374151', marginBottom: '12px' }}>Welcome to NagroMS!</h3>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>It looks like you haven't added any products yet.</p>
          <button style={{ padding: '10px 20px', backgroundColor: '#22c55e', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            + Add Your First Product
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Mock Product Cards */}
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937' }}>Tomatoes</h3>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#22c55e', margin: '8px 0' }}>Rs 320 <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 400 }}>/ kg</span></p>
            <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '16px' }}>Available: 80kg</p>
            <button style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #22c55e', color: '#22c55e', backgroundColor: 'transparent', cursor: 'pointer' }}>Update Item</button>
          </div>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937' }}>Carrots</h3>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#22c55e', margin: '8px 0' }}>Rs 450 <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 400 }}>/ kg</span></p>
            <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '16px' }}>Available: 30kg</p>
            <button style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #22c55e', color: '#22c55e', backgroundColor: 'transparent', cursor: 'pointer' }}>Update Item</button>
          </div>
        </div>
      )}

      {/* Real-time Weather Section */}
      <div style={{ marginTop: '40px', backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', marginBottom: '16px' }}>Sri Lanka Weather (Live)</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '40px' }}>🌤️</span>
          <div>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>28°C</p>
            <p style={{ color: '#6b7280' }}>Partly Cloudy in Colombo</p>
          </div>
        </div>
      </div>
    </div>
  );
}
