import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  Truck, 
  MessageSquare, 
  Users, 
  Settings, 
  Leaf
} from 'lucide-react';
import OverviewSection from './components/OverviewSection';
import ManagementSection from './components/ManagementSection';
import ServicesSection from './components/ServicesSection';
import ChatbotSection from './components/ChatbotSection';
import CommunitySection from './components/CommunitySection';
import SettingsSection from './components/SettingsSection';
import './farmerDashboard.css';

export function FarmerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  // Mock state for new farmer logic
  const [isNewFarmer, setIsNewFarmer] = useState(true);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewSection isNewFarmer={isNewFarmer} />;
      case 'management':
        return <ManagementSection />;
      case 'services':
        return <ServicesSection />;
      case 'chatbot':
        return <ChatbotSection />;
      case 'community':
        return <CommunitySection />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <OverviewSection isNewFarmer={isNewFarmer} />;
    }
  };

  return (
    <div className="farmer-dashboard-container" style={{ display: 'flex', height: '100vh', backgroundColor: '#f3f4f6' }}>
      
      {/* Sidebar */}
      <div className="farmer-sidebar" style={{ width: '260px', backgroundColor: '#115e59', color: 'white', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ backgroundColor: 'white', color: '#115e59', padding: '8px', borderRadius: '50%' }}>
            <Leaf size={24} />
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>NagroMS</h1>
        </div>

        <nav style={{ flex: 1, padding: '24px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="Overview" 
            isActive={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')} 
          />
          <SidebarItem 
            icon={<Wallet size={20} />} 
            label="Management" 
            isActive={activeTab === 'management'} 
            onClick={() => setActiveTab('management')} 
          />
          <SidebarItem 
            icon={<Truck size={20} />} 
            label="Services" 
            isActive={activeTab === 'services'} 
            onClick={() => setActiveTab('services')} 
          />
          <SidebarItem 
            icon={<MessageSquare size={20} />} 
            label="Chatbot" 
            isActive={activeTab === 'chatbot'} 
            onClick={() => setActiveTab('chatbot')} 
          />
          <SidebarItem 
            icon={<Users size={20} />} 
            label="Community" 
            isActive={activeTab === 'community'} 
            onClick={() => setActiveTab('community')} 
          />
        </nav>

        <div style={{ padding: '12px' }}>
          <SidebarItem 
            icon={<Settings size={20} />} 
            label="Settings" 
            isActive={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="farmer-main-content" style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {renderContent()}
        </div>
      </div>

    </div>
  );
}

function SidebarItem({ icon, label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
        padding: '12px 16px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: isActive ? 'white' : 'transparent',
        color: isActive ? '#115e59' : '#d1fae5',
        cursor: 'pointer',
        textAlign: 'left',
        fontSize: '15px',
        fontWeight: isActive ? 600 : 500,
        transition: 'all 0.2s'
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}