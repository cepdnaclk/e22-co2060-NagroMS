import React from 'react';

export default function ChatbotSection() {
  return (
    <div className="nagro-section-content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '24px' }}>AI Assistant</h2>
      
      <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: '400px' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>NagroMS Assistant</h3>
          <p style={{ fontSize: '12px', color: '#6b7280' }}>Ask me about farming techniques, crop diseases, or market prices.</p>
        </div>
        
        <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ alignSelf: 'flex-start', backgroundColor: '#f3f4f6', padding: '12px 16px', borderRadius: '12px', maxWidth: '80%' }}>
            <p style={{ color: '#1f2937' }}>Hello! How can I assist you with your farm today?</p>
          </div>
        </div>

        <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '8px' }}>
          <input type="text" placeholder="Type your message..." style={{ flex: 1, padding: '10px 16px', borderRadius: '24px', border: '1px solid #d1d5db', outline: 'none' }} />
          <button style={{ padding: '10px 20px', borderRadius: '24px', backgroundColor: '#22c55e', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Send</button>
        </div>
      </div>
    </div>
  );
}
