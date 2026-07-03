import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { Users, UserPlus, UserCheck, MapPin, Search } from 'lucide-react';
import { getAllNetworkUsers, subscribeToConnections, toggleConnection } from '../../services/networkService';

export default function CommunityNetwork({ currentUserRole }) {
  const [users, setUsers] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const allUsers = await getAllNetworkUsers();
      // Exclude current user
      const filtered = allUsers.filter(u => u.id !== currentUserId);
      setUsers(filtered);

      // Determine default tab based on role
      if (currentUserRole === 'farmer') setActiveTab('customer');
      else if (currentUserRole === 'customer') setActiveTab('farmer');
      else if (currentUserRole === 'expert') setActiveTab('farmer');
      else setActiveTab('farmer');

      setLoading(false);
    };

    fetchData();

    if (currentUserId) {
      const unsub = subscribeToConnections(currentUserId, (conns) => {
        setConnections(conns);
      });
      return () => unsub();
    }
  }, [currentUserId, currentUserRole]);

  const handleConnect = async (targetId) => {
    setActionLoading(targetId);
    try {
      await toggleConnection(currentUserId, targetId);
    } catch (err) {
      console.error(err);
      alert('Failed to update connection.');
    } finally {
      setActionLoading(null);
    }
  };

  const isConnected = (targetId) => {
    return connections.some(c => 
      (c.requesterId === currentUserId && c.targetId === targetId) ||
      (c.requesterId === targetId && c.targetId === currentUserId)
    );
  };

  // Available tabs based on role
  const tabs = [
    { id: 'farmer', label: 'Farmers', icon: '🌾' },
    { id: 'customer', label: 'Customers', icon: '🛒' },
    { id: 'expert', label: 'Experts', icon: '🧑‍🏫' },
  ].filter(tab => tab.id !== currentUserRole);

  const filteredUsers = users.filter(u => {
    const matchRole = u.role === activeTab;
    const matchSearch = (u.fullName || u.contactPersonName || u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (u.district || u.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchRole && matchSearch;
  });

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#1a7f37' }}>
        <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid #c6e0c6', borderTopColor: '#1a7f37', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ 
      background: '#fff', 
      borderRadius: '16px', 
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '600px'
    }}>
      {/* Header */}
      <div style={{ padding: '24px 32px', background: 'linear-gradient(135deg, #1a7f37 0%, #2e9f4c 100%)', color: 'white' }}>
        <h2 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '24px' }}>
          <Users size={28} /> Community Network
        </h2>
        <p style={{ margin: 0, color: '#e6f4ea', fontSize: '15px' }}>
          Discover and connect with {tabs.map(t => t.label.toLowerCase()).join(' and ')} across Sri Lanka.
        </p>
      </div>

      {/* Tabs & Search */}
      <div style={{ padding: '20px 32px', borderBottom: '1px solid #f0f0f0', display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 20px',
                borderRadius: '24px',
                border: 'none',
                background: activeTab === tab.id ? '#1a7f37' : '#f5f5f5',
                color: activeTab === tab.id ? 'white' : '#555',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>
        
        <div style={{ position: 'relative', minWidth: '250px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
          <input 
            type="text" 
            placeholder="Search by name or district..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 38px',
              borderRadius: '24px',
              border: '1px solid #e0e0e0',
              outline: 'none',
              fontSize: '14px',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#1a7f37'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
        </div>
      </div>

      {/* Grid */}
      <div style={{ padding: '32px', flex: 1, overflowY: 'auto', background: '#fcfcfc' }}>
        {filteredUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
            <Users size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
            <p style={{ fontSize: '18px', margin: 0 }}>No {activeTab}s found.</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '24px' 
          }}>
            {filteredUsers.map(user => {
              const connected = isConnected(user.id);
              const displayName = user.fullName || user.contactPersonName || user.businessName || user.name || 'Anonymous User';
              
              return (
                <div key={user.id} style={{ 
                  background: '#fff', 
                  borderRadius: '12px', 
                  padding: '24px', 
                  border: '1px solid #eaeaea',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.06)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ 
                      width: '50px', height: '50px', 
                      borderRadius: '50%', 
                      background: '#e6f4ea', 
                      color: '#1a7f37',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '20px', fontWeight: 'bold'
                    }}>
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#333' }}>{displayName}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#777', fontSize: '13px' }}>
                        <MapPin size={12} /> {user.district || user.location || user.city || 'Location Unknown'}
                      </div>
                    </div>
                  </div>

                  <div style={{ flex: 1 }}>
                    {user.cropType && <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#555' }}><strong>Crops:</strong> {user.cropType}</p>}
                    {user.specialization && <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#555' }}><strong>Expertise:</strong> {user.specialization}</p>}
                    {user.businessType && <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#555' }}><strong>Business:</strong> {user.businessType}</p>}
                  </div>

                  <button 
                    onClick={() => handleConnect(user.id)}
                    disabled={actionLoading === user.id}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: connected ? '1px solid #1a7f37' : 'none',
                      background: connected ? '#f6fff5' : '#1a7f37',
                      color: connected ? '#1a7f37' : 'white',
                      fontWeight: '600',
                      cursor: actionLoading === user.id ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s',
                      opacity: actionLoading === user.id ? 0.7 : 1
                    }}
                  >
                    {actionLoading === user.id ? (
                       <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    ) : connected ? (
                      <><UserCheck size={18} /> Connected</>
                    ) : (
                      <><UserPlus size={18} /> Connect</>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
