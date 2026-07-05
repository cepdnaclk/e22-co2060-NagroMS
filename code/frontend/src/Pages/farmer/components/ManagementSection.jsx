import React from 'react';

export default function ManagementSection() {
  return (
    <div className="nagro-section-content">
      <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '24px' }}>Management</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Expenses Card */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#dc2626' }}>Total Expenses</h3>
          <p style={{ fontSize: '32px', fontWeight: 700, color: '#111827', margin: '8px 0' }}>Rs 12,500</p>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>This month</p>
          <button style={{ marginTop: '16px', padding: '8px 16px', borderRadius: '6px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer', fontWeight: 600 }}>+ Add Expense</button>
        </div>

        {/* Income Card */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#22c55e' }}>Total Income</h3>
          <p style={{ fontSize: '32px', fontWeight: 700, color: '#111827', margin: '8px 0' }}>Rs 45,000</p>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>This month</p>
          <button style={{ marginTop: '16px', padding: '8px 16px', borderRadius: '6px', backgroundColor: '#dcfce7', color: '#16a34a', border: 'none', cursor: 'pointer', fontWeight: 600 }}>+ Add Income</button>
        </div>
      </div>
    </div>
  );
}
