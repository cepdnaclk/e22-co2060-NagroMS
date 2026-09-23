// ============================================================
// NagroMS — Customer/FarmersListSection.jsx
// Customers can view all farmers with Follow/Unfollow
// ============================================================

import React, { useState, useEffect } from 'react';
import { MapPin, Phone, UserCheck, UserPlus, Search, Tractor, Users } from 'lucide-react';
import { auth } from '../../../../../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  subscribeToUsersByRole,
  followUser,
  unfollowUser,
  subscribeToFollowStatus,
  subscribeToFollowerCount,
} from '../../../../../utils/userDirectoryService';

const initials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

// Individual farmer card with its own follow state
function FarmerCard({ farmer, currentUserId, index }) {
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUserId) return;
    const unsub = subscribeToFollowStatus(currentUserId, farmer.id, setFollowing);
    const unsubCount = subscribeToFollowerCount(farmer.id, setFollowerCount);
    return () => { unsub(); unsubCount(); };
  }, [currentUserId, farmer.id]);

  const handleToggleFollow = async () => {
    if (!currentUserId) return;
    setLoading(true);
    if (following) {
      await unfollowUser(currentUserId, farmer.id);
    } else {
      await followUser(currentUserId, farmer.id, 'customer', 'farmer');
    }
    setLoading(false);
  };

  const colors = [
    { bg: '#e8f5e9', color: '#115e59' },
    { bg: '#e3f2fd', color: '#1565c0' },
    { bg: '#fff8e1', color: '#b8860b' },
    { bg: '#f3e5f5', color: '#6a1b9a' },
    { bg: '#fce4ec', color: '#c62828' },
  ];
  const av = colors[index % colors.length];

  return (
    <div style={{
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
          {initials(farmer.name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '15px', color: '#111827', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {farmer.name}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            {farmer.specialty || farmer.cropType || 'Farmer'}
          </div>
        </div>
        <span style={{
          background: '#e8f5e9', color: '#115e59',
          fontSize: '11px', fontWeight: 700,
          padding: '3px 10px', borderRadius: '20px', flexShrink: 0,
        }}>Farmer</span>
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {farmer.district && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6b7280' }}>
            <MapPin size={13} color="#115e59" /> {farmer.district}
          </span>
        )}
        {farmer.phone && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6b7280' }}>
            <Phone size={13} color="#115e59" /> {farmer.phone}
          </span>
        )}
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6b7280' }}>
          <Users size={13} color="#115e59" /> {followerCount} follower{followerCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Follow Button */}
      {currentUserId && (
        <button
          onClick={handleToggleFollow}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            padding: '9px', borderRadius: '8px', border: 'none',
            fontSize: '13px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            background: following ? '#f0fdf4' : '#115e59',
            color: following ? '#115e59' : 'white',
            border: following ? '1px solid #d1fae5' : 'none',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {following ? <UserCheck size={14} /> : <UserPlus size={14} />}
          {loading ? 'Updating...' : following ? 'Following' : 'Follow'}
        </button>
      )}
    </div>
  );
}

export default function FarmersListSection() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => setCurrentUserId(user?.uid || null));
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = subscribeToUsersByRole('farmer', (data) => {
      setFarmers(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = farmers.filter(f =>
    f.name?.toLowerCase().includes(search.toLowerCase()) ||
    f.specialty?.toLowerCase().includes(search.toLowerCase()) ||
    f.district?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--sidebar, #115e59) 0%, #0f766e 100%)',
        borderRadius: '16px', padding: '32px', color: 'white',
      }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Tractor size={32} /> Farmers Directory
        </h1>
        <p style={{ margin: '8px 0 0', opacity: 0.9, fontSize: '15px' }}>
          Follow farmers to stay updated with their latest produce
        </p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
        <input
          type="text"
          placeholder="Search by name, crop, or district..."
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
        {filtered.length} farmer{filtered.length !== 1 ? 's' : ''} registered
      </p>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #d1fae5', borderTopColor: '#115e59', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '48px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
          <Tractor size={48} color="#9ca3af" style={{ marginBottom: '12px' }} />
          <p style={{ fontWeight: 600, color: '#374151', margin: '0 0 4px' }}>No farmers found</p>
          <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>
            {search ? 'Try a different search term.' : 'No farmers have registered yet.'}
          </p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {filtered.map((farmer, i) => (
            <FarmerCard key={farmer.id} farmer={farmer} currentUserId={currentUserId} index={i} />
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
