// ============================================================
// NagroMS — Pages/farmer/components/ExpertsSection.jsx
// Farmer can view all registered Agricultural Experts
// ============================================================

import React, { useState, useEffect } from 'react';
import { GraduationCap, MapPin, Phone, Star, Search, User } from 'lucide-react';
import { subscribeToUsersByRole } from '../../../utils/userDirectoryService';
import { useLanguage } from '../../../i18n/LanguageContext';

const initials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

export default function ExpertsSection() {
  const { t } = useLanguage();
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsub = subscribeToUsersByRole('expert', (data) => {
      setExperts(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = experts.filter(e =>
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.specialty?.toLowerCase().includes(search.toLowerCase()) ||
    e.district?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #115e59 0%, #0f766e 100%)',
        borderRadius: '16px',
        padding: '32px',
        color: 'white',
      }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <GraduationCap size={32} /> Agricultural Experts
        </h1>
        <p style={{ margin: '8px 0 0', opacity: 0.9, fontSize: '15px' }}>
          Connect with certified agricultural experts for professional guidance
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
        <input
          type="text"
          placeholder="Search by name, specialty, or district..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 14px 12px 42px',
            borderRadius: '10px',
            border: '1px solid #d1d5db',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box',
            backgroundColor: 'white',
          }}
        />
      </div>

      {/* Count */}
      <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
        {filtered.length} expert{filtered.length !== 1 ? 's' : ''} registered
      </p>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
          <div style={{
            width: '40px', height: '40px', border: '4px solid #d1fae5',
            borderTopColor: '#115e59', borderRadius: '50%', animation: 'spin 0.8s linear infinite'
          }} />
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div style={{
          background: 'white', borderRadius: '12px', padding: '48px',
          textAlign: 'center', border: '1px solid #e5e7eb'
        }}>
          <GraduationCap size={48} color="#9ca3af" style={{ marginBottom: '12px' }} />
          <p style={{ fontWeight: 600, color: '#374151', margin: '0 0 4px' }}>No experts found</p>
          <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>
            {search ? 'Try a different search term.' : 'No agricultural experts have registered yet.'}
          </p>
        </div>
      )}

      {/* Expert Cards Grid */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {filtered.map((expert, i) => {
            const colors = [
              { bg: '#e8f5e9', color: '#115e59' },
              { bg: '#e3f2fd', color: '#1565c0' },
              { bg: '#fff8e1', color: '#b8860b' },
              { bg: '#f3e5f5', color: '#6a1b9a' },
            ];
            const av = colors[i % colors.length];
            return (
              <div key={expert.id} style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: 'box-shadow 0.2s',
              }}
                onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(17,94,89,0.12)'}
                onMouseOut={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'}
              >
                {/* Avatar + Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: av.bg, color: av.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '16px', flexShrink: 0,
                  }}>
                    {initials(expert.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: '#111827', marginBottom: '2px' }}>
                      {expert.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {expert.specialty || 'Agricultural Expert'}
                    </div>
                  </div>
                  <span style={{
                    background: '#e8f5e9', color: '#115e59',
                    fontSize: '11px', fontWeight: 700,
                    padding: '3px 10px', borderRadius: '20px', flexShrink: 0,
                  }}>Expert</span>
                </div>

                {/* Meta info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {expert.district && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6b7280' }}>
                      <MapPin size={13} color="#115e59" /> {expert.district}
                    </span>
                  )}
                  {expert.phone && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6b7280' }}>
                      <Phone size={13} color="#115e59" /> {expert.phone}
                    </span>
                  )}
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#b8860b' }}>
                    <Star size={13} fill="#b8860b" color="#b8860b" /> {expert.rating?.toFixed(1) || '5.0'} / 5.0
                  </span>
                </div>

                {/* Action */}
                {expert.phone && (
                  <a
                    href={`tel:${expert.phone}`}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      padding: '9px', borderRadius: '8px', border: '1px solid #d1fae5',
                      color: '#115e59', fontSize: '13px', fontWeight: 600,
                      textDecoration: 'none', background: '#f0fdf4',
                      transition: 'background 0.2s',
                    }}
                    onMouseOver={e => e.currentTarget.style.background = '#dcfce7'}
                    onMouseOut={e => e.currentTarget.style.background = '#f0fdf4'}
                  >
                    <Phone size={14} /> Contact Expert
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
