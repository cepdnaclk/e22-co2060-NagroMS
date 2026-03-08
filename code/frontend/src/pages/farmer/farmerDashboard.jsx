import { useState } from 'react';
import { 
  Menu,
  X,
  Sprout,
  LogOut
} from 'lucide-react';
import { RoleSwitcher } from "../RoleSwitcher.jsx"; 
import './farmerDashboard.css';

export function FarmerDashboard({ onNavigate }) {
  // State for navigation and sidebar
  const [activeNav, setActiveNav] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Render different content based on active nav
  const renderContent = () => {
    switch (activeNav) {
      case 'dashboard':
        return <div className="p-8 text-center text-2xl text-gray-500">Dashboard Content Area</div>;
      case 'products':
        return <div className="p-8 text-center text-2xl text-gray-500">My Products Content Area</div>;
      case 'sales':
        return <div className="p-8 text-center text-2xl text-gray-500">Sales & Income Content Area</div>;
      case 'expenses':
        return <div className="p-8 text-center text-2xl text-gray-500">Expenses Content Area</div>;
      case 'orders':
        return <div className="p-8 text-center text-2xl text-gray-500">Orders Content Area</div>;
      case 'contacts':
        return <div className="p-8 text-center text-2xl text-gray-500">Contacts Content Area</div>;
      case 'loans':
        return <div className="p-8 text-center text-2xl text-gray-500">Bank Loans Content Area</div>;
      case 'equipment':
        return <div className="p-8 text-center text-2xl text-gray-500">Equipment Content Area</div>;
      case 'weather':
        return <div className="p-8 text-center text-2xl text-gray-500">Weather Forecast Content Area</div>;
      case 'inventory':
        return <div className="p-8 text-center text-2xl text-gray-500">Inventory Content Area</div>;
      case 'chatbot':
        return <div className="p-8 text-center text-2xl text-gray-500">Chatbot Assistant Area</div>;
      case 'settings':
        return <div className="p-8 text-center text-2xl text-gray-500">Settings & Profile Area</div>;
      default:
        return <div className="p-8 text-center text-2xl text-gray-500">Content Not Found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Menu Button - Always Visible */}
      <div className="bg-white border-b border-green-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary rounded-lg p-1.5">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <span className="text-primary font-semibold">NagroMS</span>
        </div>
        <div className="flex items-center gap-3">
          <RoleSwitcher currentRole="farmer" onNavigate={onNavigate} />
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-foreground hover:bg-green-50 p-2 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Overlay - Click to close sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Hidden by default on mobile, always accessible via menu */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-green-200
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo Details in Sidebar */}
          <div className="flex items-center gap-2 p-6 border-b border-green-200">
            <div className="bg-primary rounded-lg p-2">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg text-primary font-semibold">NagroMS</h2>
              <p className="text-xs text-muted-foreground">Farmer Portal</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <NavButton
              
              label="Dashboard"
              active={activeNav === 'dashboard'}
              onClick={() => {
                setActiveNav('dashboard');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
            />
            <NavButton
              
              label="My Products"
              active={activeNav === 'products'}
              onClick={() => {
                setActiveNav('products');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
            />
            <NavButton
              
              label="Sales & Income"
              active={activeNav === 'sales'}
              onClick={() => {
                setActiveNav('sales');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
            />
            <NavButton
              
              label="Expenses"
              active={activeNav === 'expenses'}
              onClick={() => {
                setActiveNav('expenses');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
            />
            <NavButton
              
              label="Orders"
              active={activeNav === 'orders'}
              onClick={() => {
                setActiveNav('orders');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
            />
            <NavButton
              
              label="Contacts"
              active={activeNav === 'contacts'}
              onClick={() => {
                setActiveNav('contacts');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
            />
            <NavButton
              
              label="Bank Loans"
              active={activeNav === 'loans'}
              onClick={() => {
                setActiveNav('loans');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
            />
            <NavButton
              
              label="Equipment"
              active={activeNav === 'equipment'}
              onClick={() => {
                setActiveNav('equipment');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
            />
            <NavButton
            
              label="Weather"
              active={activeNav === 'weather'}
              onClick={() => {
                setActiveNav('weather');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
            />
            <NavButton
              
              label="Inventory"
              active={activeNav === 'inventory'}
              onClick={() => {
                setActiveNav('inventory');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
            />
            <NavButton
              
              label="Chatbot"
              active={activeNav === 'chatbot'}
              onClick={() => {
                setActiveNav('chatbot');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
            />
          </nav>

          {/* User Info & Logout at bottom of sidebar */}
          <div className="p-4 border-t border-green-200">
            <button
              onClick={() => {
                setActiveNav('settings');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
              className="w-full bg-green-50 rounded-lg p-3 mb-3 hover:bg-green-100 transition-colors text-left"
            >
              <p className="text-sm text-foreground">👨‍🌾 Sunil Perera</p>
              <p className="text-xs text-muted-foreground">farmer@example.com</p>
              <p className="text-xs text-primary mt-1">⚙️ Click to view settings</p>
            </button>
            <button
              onClick={() => onNavigate('landing')}
              className="w-full flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="min-h-screen">
        <div className="p-4 lg:p-8">
          {renderContent()}
        </div>
      </main>

    </div>
  );
}

// Navigation Button Component
function NavButton({ icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
        ${active 
          ? 'bg-primary text-white shadow-md' 
          : 'bg-white text-gray-700 hover:bg-green-50 hover:text-primary border border-gray-100 hover:border-green-200'
        }
      `}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-base font-medium">{label}</span>
    </button>
  );
}
