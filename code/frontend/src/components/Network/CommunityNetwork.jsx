import React, { useState, useEffect } from 'react';
import { Users, UserPlus, UserCheck, MapPin, Search, Phone, Mail, Sprout, UserMinus } from 'lucide-react';
import { getAllNetworkUsers, subscribeToConnections, toggleConnection } from '../../services/networkService';

export default function CommunityNetwork({ currentUserRole, products = [], currentUserId }) {
  const [users, setUsers] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [justClicked, setJustClicked] = useState(null);

  useEffect(() => {
    if (!currentUserId) return;

    const fetchData = async () => {
      setLoading(true);
      const allUsers = await getAllNetworkUsers();
      // Exclude current user
      const filtered = allUsers.filter(u => u.id !== currentUserId);
      setUsers(filtered);

      // Determine default tab based on role
      if (currentUserRole === 'farmer') setActiveTab('customer');
      else if (currentUserRole === 'customer') setActiveTab('feed');
      else if (currentUserRole === 'expert') setActiveTab('farmer');
      else setActiveTab('farmer');

      setLoading(false);
    };

    fetchData();

    const unsub = subscribeToConnections(currentUserId, (conns) => {
      setConnections(conns);
    });
    return () => unsub();
  }, [currentUserId, currentUserRole]);

  const handleConnect = async (targetId, currentlyConnected) => {
    setActionLoading(targetId);
    setJustClicked(targetId);
    try {
      const newStatus = await toggleConnection(currentUserId, targetId, currentlyConnected);
      
      // Update local state instantly based on the result
      setConnections(prev => {
        if (newStatus.status === 'disconnected') {
          return prev.filter(c => !(c.requesterId === currentUserId && c.targetId === targetId) && !(c.targetId === currentUserId && c.requesterId === targetId));
        } else {
          return [...prev, { requesterId: currentUserId, targetId, status: 'connected' }];
        }
      });
    } catch (err) {
      console.error(err);
      alert('Failed to update connection. Error: ' + (err.message || err.code || err));
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

  const getConnectedFarmerIds = () => {
    return connections
      .filter(c => c.requesterId === currentUserId || c.targetId === currentUserId)
      .map(c => c.requesterId === currentUserId ? c.targetId : c.requesterId);
  };

  // Available tabs based on role
  const tabs = [
    ...(currentUserRole === 'customer' ? [
      { id: 'feed', label: 'My Feed', icon: '✨' },
      { id: 'following', label: 'Following', icon: '✅' }
    ] : []),
    { id: 'farmer', label: 'Farmers', icon: '🌾' },
    { id: 'customer', label: 'Customers', icon: '👥' },
    { id: 'expert', label: 'Experts', icon: '🎓' },
  ].filter(tab => tab.id !== currentUserRole);

  const filteredUsers = users.filter(u => {
    const matchRole = activeTab === 'following' ? u.role === 'farmer' && isConnected(u.id) : u.role === activeTab;
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
      <div style={{ padding: '24px 32px', background: 'var(--theme-community-gradient)', color: 'white' }}>
        <h2 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '24px' }}>
          <Users size={28} /> Community Network
        </h2>
        <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.9)', fontSize: '15px' }}>
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
                background: activeTab === tab.id ? 'var(--theme-community-primary)' : '#f5f5f5',
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
        {activeTab === 'feed' ? (
          (() => {
            const connectedFarmerIds = getConnectedFarmerIds();
            const feedProducts = products.filter(p => p.farmerId && connectedFarmerIds.includes(p.farmerId));

            if (feedProducts.length === 0) {
              return (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
                  <p style={{ fontSize: '18px', margin: 0 }}>No updates from followed farmers.</p>
                  <p style={{ fontSize: '14px', marginTop: '8px' }}>Connect with farmers to see their latest products here.</p>
                </div>
              );
            }

            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {feedProducts.map(product => (
                  <div key={product.id} style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #eaeaea', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <div style={{ width: '100%', height: '160px', overflow: 'hidden', borderRadius: '8px', marginBottom: '12px', background: '#f5f5f5' }}>
                      <img src={product.image || 'https://via.placeholder.com/300'} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <h4 style={{ margin: '0 0 4px 0', color: '#333' }}>{product.name}</h4>
                    <p style={{ color: '#1a7f37', fontWeight: 'bold', margin: '0 0 8px 0' }}>Rs {product.price}</p>
                    <p style={{ fontSize: '12px', color: '#777', margin: 0 }}>Farmer: {product.farmer}</p>
                    <p style={{ fontSize: '12px', color: '#777', margin: '4px 0 0 0' }}>Location: {product.location}</p>
                  </div>
                ))}
              </div>
            );
          })()
        ) : filteredUsers.length === 0 ? (
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
              const isHovered = hoveredBtn === user.id && justClicked !== user.id;
              
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
                      background: 'var(--theme-community-bg-light)', 
                      color: 'var(--theme-community-primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '20px', fontWeight: 'bold'
                    }}>
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#333', fontWeight: 600 }}>{displayName}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#777', fontSize: '13px' }}>
                        <MapPin size={12} /> {user.district || user.location || user.city || 'Location Unknown'}
                      </div>
                    </div>
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {user.cropType && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f5132', background: '#d1e7dd', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', width: 'fit-content' }}>
                        <Sprout size={13} />
                        <span>{user.cropType}</span>
                      </div>
                    )}
                    {user.specialization && <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#555' }}><strong>Expertise:</strong> {user.specialization}</p>}
                    {user.businessType && <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#555' }}><strong>Business:</strong> {user.businessType}</p>}
                    
                    {/* Farmer/User Contact Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f3f4f6' }}>
                      {user.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563', fontSize: '13px' }}>
                          <Phone size={13} className="text-emerald-600" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                      {user.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <Mail size={13} className="text-emerald-600" />
                          <span>{user.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={() => handleConnect(user.id, connected)}
                    disabled={actionLoading === user.id}
                    onMouseEnter={() => setHoveredBtn(user.id)}
                    onMouseLeave={() => {
                      setHoveredBtn(null);
                      setJustClicked(null);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: connected ? (isHovered ? '1px solid #fecaca' : '1px solid var(--theme-community-border)') : 'none',
                      background: connected ? (isHovered ? '#fef2f2' : 'var(--theme-community-bg-light)') : 'var(--theme-community-primary)',
                      color: connected ? (isHovered ? '#dc2626' : 'var(--theme-community-text)') : 'white',
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
                      isHovered ? (
                        <><UserMinus size={18} /> {currentUserRole === 'customer' ? 'Unfollow' : 'Disconnect'}</>
                      ) : (
                        <><UserCheck size={18} /> {currentUserRole === 'customer' ? 'Following' : 'Connected'}</>
                      )
                    ) : (
                      <><UserPlus size={18} /> {currentUserRole === 'customer' ? 'Follow' : 'Connect'}</>
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
