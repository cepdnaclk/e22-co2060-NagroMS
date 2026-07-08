import React, { useState } from 'react';
import {
  LayoutDashboard,
  Wallet,
  Truck,
  MessageSquare,
  Users,
  Settings,
  Leaf,
  Bell,
  Menu,
  X
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import OverviewSection from './components/OverviewSection';
import ManagementSection from './components/ManagementSection';
import ServicesSection from './components/ServicesSection';
import ChatbotSection from './components/ChatbotSection';
import CommunitySection from './components/CommunitySection';
import SettingsSection from './components/SettingsSection';
import NotificationsSection from './components/NotificationsSection';
import './farmerDashboard.css';

export function FarmerDashboard() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewSection setActiveTab={setActiveTab} />;
      case 'management':
        return <ManagementSection />;
      case 'services':
        return <ServicesSection />;
      case 'chatbot':
        return <ChatbotSection />;
      case 'community':
        return <CommunitySection />;
      case 'notifications':
        return <NotificationsSection />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <OverviewSection setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="farmer-dashboard-container" style={{ display: 'flex', height: '100vh', backgroundColor: '#f3f4f6', overflow: 'hidden', position: 'relative' }}>

      {/* Mobile Sidebar Overlay */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 50, background: '#115e59', color: 'white', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}
        >
          <Menu size={24} />
        </button>
      )}

      {/* Sidebar */}
      <div 
        className="farmer-sidebar" 
        style={{ 
          width: '260px', 
          backgroundColor: '#115e59', 
          color: 'white', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'transform 0.3s ease',
          transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          position: isSidebarOpen ? 'relative' : 'absolute',
          height: '100%',
          zIndex: 40
        }}
      >
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ backgroundColor: 'white', color: '#115e59', padding: '8px', borderRadius: '50%' }}>
              <Leaf size={24} />
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>NagroMS</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <nav style={{ flex: 1, padding: '24px 12px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
          <SidebarItem
            icon={<LayoutDashboard size={20} />}
            label={t('farmer.sidebar.overview') || 'Overview'}
            isActive={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          />
          <SidebarItem
            icon={<Wallet size={20} />}
            label={t('farmer.sidebar.management') || 'Management'}
            isActive={activeTab === 'management'}
            onClick={() => setActiveTab('management')}
          />
          <SidebarItem
            icon={<Truck size={20} />}
            label={t('farmer.sidebar.services') || 'Services'}
            isActive={activeTab === 'services'}
            onClick={() => setActiveTab('services')}
          />
          <SidebarItem
            icon={<MessageSquare size={20} />}
            label={t('farmer.sidebar.chatbot') || 'Chatbot'}
            isActive={activeTab === 'chatbot'}
            onClick={() => setActiveTab('chatbot')}
          />
          <SidebarItem
            icon={<Users size={20} />}
            label={t('farmer.sidebar.community') || 'Community'}
            isActive={activeTab === 'community'}
            onClick={() => setActiveTab('community')}
          />
          <SidebarItem
            icon={<Bell size={20} />}
            label={t('farmer.sidebar.notifications') || 'Notifications'}
            isActive={activeTab === 'notifications'}
            onClick={() => setActiveTab('notifications')}
          />
        </nav>

        <div style={{ padding: '12px' }}>
          <SidebarItem
            icon={<Settings size={20} />}
            label={t('farmer.sidebar.settings') || 'Settings'}
            isActive={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="farmer-main-content" style={{ flex: 1, overflowY: 'auto', padding: '32px', paddingTop: !isSidebarOpen ? '64px' : '32px', transition: 'padding 0.3s' }}>
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