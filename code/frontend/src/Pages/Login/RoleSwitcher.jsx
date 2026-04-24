import { useState, useEffect, useRef } from 'react';
import { ChevronDown, User, LogOut, Check, Leaf } from 'lucide-react';

const ROLE_META = {
  farmer:           { label: 'Farmer',               emoji: '🌾', color: 'green'  },
  customer:         { label: 'Customer',              emoji: '🛒', color: 'blue'   },
  'service-provider': { label: 'Service Provider',   emoji: '🔧', color: 'orange' },
  expert:           { label: 'Agricultural Expert',  emoji: '👨‍🌾', color: 'purple' },
};

export function RoleSwitcher({ currentRole, onNavigate }) {
  const [userRoles, setUserRoles] = useState([]);
  const [userEmail, setUserEmail] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setUserRoles(JSON.parse(localStorage.getItem('userRoles') || '[]'));
    setUserEmail(localStorage.getItem('userEmail') || '');
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Only show when user has multiple roles
  if (userRoles.length <= 1) return null;

  const meta = ROLE_META[currentRole] || { label: currentRole, emoji: '👤', color: 'green' };

  const handleRoleSwitch = (role) => {
    setIsOpen(false);
    const destinations = {
      farmer: 'farmer-dashboard',
      customer: 'customer-dashboard',
      'service-provider': 'service-provider-dashboard',
      expert: 'expert-dashboard',
    };
    onNavigate(destinations[role] || 'landing');
  };

  const handleLogout = () => {
    localStorage.removeItem('userRoles');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('userNIC');
    localStorage.removeItem('userLocation');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('nagroms_token');
    onNavigate('landing');
  };

  return (
    <div className="nagro-switcher" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`nagro-switcher-btn${isOpen ? ' open' : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="nagro-switcher-emoji">{meta.emoji}</span>
        <div className="nagro-switcher-info">
          <span className="nagro-switcher-viewing">Viewing as</span>
          <span className="nagro-switcher-role">{meta.label}</span>
        </div>
        <ChevronDown className={`nagro-switcher-chevron${isOpen ? ' rotated' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="nagro-switcher-dropdown">
          {/* Header */}
          <div className="nagro-switcher-header">
            <div className="nagro-switcher-header-icon">
              <Leaf className="w-4 h-4" />
            </div>
            <div className="nagro-switcher-user-info">
              <span className="nagro-switcher-user-label">
                <User className="w-3 h-3" /> Logged in as
              </span>
              <span className="nagro-switcher-email" title={userEmail}>{userEmail}</span>
            </div>
          </div>

          {/* Role list */}
          <div className="nagro-switcher-roles-label">Switch role</div>
          <ul className="nagro-switcher-roles">
            {userRoles.map(role => {
              const m = ROLE_META[role] || { label: role, emoji: '👤', color: 'green' };
              const isCurrent = role === currentRole;
              return (
                <li key={role}>
                  <button
                    onClick={() => handleRoleSwitch(role)}
                    className={`nagro-switcher-role-item nagro-switcher-role-${m.color}${isCurrent ? ' current' : ''}`}
                    disabled={isCurrent}
                  >
                    <span className="nagro-switcher-role-emoji">{m.emoji}</span>
                    <div className="nagro-switcher-role-text">
                      <span className="nagro-switcher-role-name">{m.label}</span>
                      {isCurrent && <span className="nagro-switcher-current-badge">Current</span>}
                    </div>
                    {isCurrent && (
                      <span className="nagro-switcher-check">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Logout */}
          <div className="nagro-switcher-footer">
            <button onClick={handleLogout} className="nagro-switcher-logout">
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
