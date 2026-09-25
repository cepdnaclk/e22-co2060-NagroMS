// ============================================================
// NagroMS — Customer/ServiceProvidersSection.jsx
// Customers can view all registered Service Providers
// ============================================================

import React, { useState, useEffect } from 'react';
import { Wrench, MapPin, Phone, Search, Truck } from 'lucide-react';
import { subscribeToUsersByRole } from '../../../../../utils/userDirectoryService';

const initials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

const SERVICE_TYPE_COLORS = {
  'equipment': { bg: '#fff8e1', color: '#b8860b' },
  'storage': { bg: '#e3f2fd', color: '#1565c0' },
  'delivery': { bg: '#f3e5f5', color: '#6a1b9a' },
  'financial': { bg: '#fce4ec', color: '#c62828' },
  'packaging': { bg: '#e8f5e9', color: '#115e59' },
  'default': { bg: '#f1f5f9', color: '#475569' },
};

function getServiceColor(serviceType = '') {
  const key = Object.keys(SERVICE_TYPE_COLORS).find(k => serviceType.toLowerCase().includes(k));
  return SERVICE_TYPE_COLORS[key] || SERVICE_TYPE_COLORS.default;
}

export default function ServiceProvidersSection() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsub = subscribeToUsersByRole('serviceProvider', (data) => {
      setProviders(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = providers.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.serviceType?.toLowerCase().includes(search.toLowerCase()) ||
    p.district?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{
        background: 'linear-gradient(135deg, var(--sidebar, #115e59) 0%, #0f766e 100%)',
        borderRadius: '16px', padding: '32px', color: 'white',
      }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Truck size={32} /> Service Providers
        </h1>
        <p style={{ margin: '8px 0 0', opacity: 0.9, fontSize: '15px' }}>
          Find equipment, storage, delivery, and financial service providers
        </p>
      </div>

      <div style={{ position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
        <input
          type="text"
          placeholder="Search by name, service type, or district..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '12px 14px 12px 42px',
            borderRadius: '10px', border: '1px solid #d1d5db',
            fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white',
          }}
        />
      </div>

      <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
        {filtered.length} service provider{filtered.length !== 1 ? 's' : ''} registered
      </p>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #d1fae5', borderTopColor: '#115e59', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '48px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
          <Wrench size={48} color="#9ca3af" style={{ marginBottom: '12px' }} />
          <p style={{ fontWeight: 600, color: '#374151', margin: '0 0 4px' }}>No service providers found</p>
          <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>
            {search ? 'Try a different search term.' : 'No service providers have registered yet.'}
          </p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {filtered.map((provider) => {
            const serviceColor = getServiceColor(provider.serviceType || '');
            return (
              <div key={provider.id} style={{
                background: 'white', borderRadius: '12px', padding: '20px',
                border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                display: 'flex', flexDirection: 'column', gap: '12px', transition: 'box-shadow 0.2s',
              }}
                onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(17,94,89,0.12)'}
                onMouseOut={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '12px',
                    background: serviceColor.bg, color: serviceColor.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '16px', flexShrink: 0,
                  }}>{initials(provider.name)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: '#111827', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {provider.businessName || provider.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {provider.name !== (provider.businessName || provider.name) ? provider.name : ''}
                    </div>
                  </div>
                </div>

                {/* Service Type Badge */}
                {provider.serviceType && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    background: serviceColor.bg, color: serviceColor.color,
                    fontSize: '12px', fontWeight: 700, padding: '4px 12px',
                    borderRadius: '20px', alignSelf: 'flex-start',
                  }}>
                    <Wrench size={11} /> {provider.serviceType}
                  </span>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {provider.district && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6b7280' }}>
                      <MapPin size={13} color="#115e59" /> {provider.district}
                    </span>
                  )}
                  {provider.phone && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6b7280' }}>
                      <Phone size={13} color="#115e59" /> {provider.phone}
                    </span>
                  )}
                </div>

                {provider.phone && (
                  <a href={`tel:${provider.phone}`} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    padding: '9px', borderRadius: '8px', border: '1px solid #d1fae5',
                    color: '#115e59', fontSize: '13px', fontWeight: 600,
                    textDecoration: 'none', background: '#f0fdf4', transition: 'background 0.2s',
                  }}
                    onMouseOver={e => e.currentTarget.style.background = '#dcfce7'}
                    onMouseOut={e => e.currentTarget.style.background = '#f0fdf4'}
                  >
                    <Phone size={14} /> Contact Provider
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
