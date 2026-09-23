// ============================================================
// NagroMS — Pages/expert/Followers.jsx
// Experts can view all their followers (farmers & customers)
// ============================================================

import React, { useState, useEffect } from 'react';
import { Heart, Users, MapPin, Phone, Tractor, ShoppingBag, Search } from 'lucide-react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { subscribeToFollowers } from '../../utils/userDirectoryService';
import '../../Styles/expertDashboard.css';

const initials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

const avatarColors = [
  { bg: '#e8f5e9', color: '#1F5A2E' },
  { bg: '#e3f2fd', color: '#1565c0' },
  { bg: '#fff8e1', color: '#b8860b' },
  { bg: '#f3e5f5', color: '#6a1b9a' },
];

export default function Followers() {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expertId, setExpertId] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, user => setExpertId(user?.uid || null));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!expertId) return;
    const unsub = subscribeToFollowers(expertId, (data) => {
      setFollowers(data);
      setLoading(false);
    });
    return () => unsub();
  }, [expertId]);

  const farmerCount = followers.filter(f => f.role === 'farmer').length;
  const customerCount = followers.filter(f => f.role === 'customer').length;

  const filtered = followers
    .filter(f => {
      if (filter === 'farmer') return f.role === 'farmer';
      if (filter === 'customer') return f.role === 'customer';
      return true;
    })
    .filter(f =>
      f.name?.toLowerCase().includes(search.toLowerCase()) ||
      f.district?.toLowerCase().includes(search.toLowerCase())
    );

  if (loading) return (
    <div className="exp-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="exp-spinner" />
    </div>
  );

  return (
    <div className="exp-page">
      {/* Header */}
      <div className="exp-header">
        <div>
          <h1 className="exp-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Heart size={24} color="var(--exp-green)" /> My Followers
          </h1>
          <p className="exp-subtitle">
            {farmerCount} farmer{farmerCount !== 1 ? 's' : ''} · {customerCount} customer{customerCount !== 1 ? 's' : ''} following you
          </p>
        </div>
        {/* Total Badge */}
        <div style={{
          background: '#e8f5e9', color: '#1F5A2E',
          padding: '8px 20px', borderRadius: '20px',
          fontWeight: 700, fontSize: '14px',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <Users size={16} /> {followers.length} Total
        </div>
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            className="exp-input"
            style={{ paddingLeft: 36, width: '100%', boxSizing: 'border-box' }}
            placeholder="Search by name or district..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="exp-filter-row" style={{ marginBottom: 0 }}>
          {[
            { id: 'all', label: 'All' },
            { id: 'farmer', label: 'Farmers' },
            { id: 'customer', label: 'Customers' },
          ].map(f => (
            <button key={f.id} className={`exp-filter-tab ${filter === f.id ? 'active' : ''}`}
              onClick={() => setFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '48px 0', color: 'var(--exp-text-muted)', fontSize: 13 }}>
          <Heart size={36} color="var(--exp-border)" strokeWidth={1.2} />
          <p style={{ fontWeight: 600, color: 'var(--exp-text)', margin: 0 }}>
            {followers.length === 0 ? 'No followers yet' : 'No results found'}
          </p>
          <p style={{ margin: 0 }}>
            {followers.length === 0 ? 'Share your expert profile to attract followers.' : 'Try a different search or filter.'}
          </p>
        </div>
      )}

      {/* Follower Cards */}
      <div className="exp-kb-grid">
        {filtered.map((f, i) => {
          const av = avatarColors[i % avatarColors.length];
          const isCustomer = f.role === 'customer';
          return (
            <div key={f.id} className="exp-card interactive">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 700, flexShrink: 0,
                  background: av.bg, color: av.color,
                }}>
                  {initials(f.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--exp-text)', marginBottom: 2 }}>{f.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--exp-text-muted)' }}>
                    {isCustomer ? 'Customer' : 'Farmer'}
                  </div>
                </div>
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: 11, padding: '3px 10px', borderRadius: 20,
                  fontWeight: 700, flexShrink: 0,
                  background: isCustomer ? '#e3f2fd' : '#e8f5e9',
                  color: isCustomer ? '#1565c0' : '#1F5A2E',
                }}>
                  {isCustomer ? <ShoppingBag size={11} /> : <Tractor size={11} />}
                  {isCustomer ? 'Customer' : 'Farmer'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
                {f.district && <span className="exp-meta-item"><MapPin size={12} />{f.district}</span>}
                {f.phone && <span className="exp-meta-item"><Phone size={12} />{f.phone}</span>}
              </div>

              {f.phone && (
                <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--exp-border)', paddingTop: 12, marginTop: 'auto' }}>
                  <a href={`tel:${f.phone}`} className="exp-btn exp-btn-outline"
                    style={{ flex: 1, padding: '7px 0', border: '1px solid var(--exp-border)', textDecoration: 'none', textAlign: 'center' }}>
                    <Phone size={13} /> Call
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
