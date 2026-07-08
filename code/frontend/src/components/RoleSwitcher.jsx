import { useState, useEffect } from 'react';
import { ChevronDown, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function RoleSwitcher({ currentRole }) {
  const navigate = useNavigate();
  const [userRoles, setUserRoles] = useState([]);
  const [userEmail, setUserEmail] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load user roles from localStorage
    let roles = JSON.parse(localStorage.getItem('userRoles') || '[]');
    const email = localStorage.getItem('userEmail') || '';
    
    // If no roles are stored, fall back to the current role
    if (!roles || roles.length === 0) {
      roles = currentRole ? [currentRole] : ['farmer'];
    }
    
    setUserRoles(roles);
    setUserEmail(email);
  }, [currentRole]);

  const getRoleDisplayName = (role) => {
    const names = {
      'farmer': 'Farmer',
      'customer': 'Customer',
      'service-provider': 'Service Provider',
      'expert': 'Agricultural Expert'
    };
    return names[role] || role;
  };

  const getRoleIcon = (role) => {
    const icons = {
      'farmer': '🌾',
      'customer': '🛒',
      'service-provider': '🔧',
      'expert': '👨‍🌾'
    };
    return icons[role] || '👤';
  };

  const handleRoleSwitch = (role) => {
    if (role === 'farmer') {
      navigate('/farmer-dashboard');
    } else if (role === 'customer') {
      navigate('/customer-dashboard');
    } else if (role === 'service-provider') {
      navigate('/service-provider-dashboard');
    } else if (role === 'expert') {
      navigate('/expert-dashboard');
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Dropdown Button */}
      <button
        onClick={() => {
          if (userRoles.length > 1) {
            setIsOpen(!isOpen);
          }
        }}
        disabled={userRoles.length <= 1}
        className={`flex items-center gap-3 px-4 py-2 bg-white border-2 border-primary rounded-lg transition-colors ${
          userRoles.length > 1 ? 'hover:bg-green-50 cursor-pointer' : 'cursor-default'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{getRoleIcon(currentRole)}</span>
          <div className="text-left">
            <p className="text-sm text-muted-foreground">Viewing as:</p>
            <p className="text-sm text-primary">{getRoleDisplayName(currentRole)}</p>
          </div>
        </div>
        {userRoles.length > 1 && (
          <ChevronDown className={`w-5 h-5 text-primary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && userRoles.length > 1 && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white border-2 border-green-100 rounded-lg shadow-xl z-20">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-green-100">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Logged in as:</p>
              </div>
              <p className="text-sm text-foreground truncate">{userEmail}</p>
            </div>

            {/* Available Roles */}
            <div className="py-2">
              <p className="px-4 py-2 text-xs text-muted-foreground">Switch to:</p>
              {userRoles.map(role => (
                <button
                  key={role}
                  onClick={() => handleRoleSwitch(role)}
                  className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                    role === currentRole
                      ? 'bg-green-50 text-primary'
                      : 'hover:bg-green-50 text-foreground'
                  }`}
                >
                  <span className="text-2xl">{getRoleIcon(role)}</span>
                  <div>
                    <p className="text-sm">{getRoleDisplayName(role)}</p>
                    {role === currentRole && (
                      <p className="text-xs text-muted-foreground">Current</p>
                    )}
                  </div>
                  {role === currentRole && (
                    <span className="ml-auto text-primary">✓</span>
                  )}
                </button>
              ))}
            </div>

            {/* Logout */}
            <div className="border-t border-green-100 p-2">
              <button
                onClick={() => {
                  localStorage.removeItem('userRoles');
                  localStorage.removeItem('userEmail');
                  navigate('/');
                }}
                className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors text-left"
              >
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
