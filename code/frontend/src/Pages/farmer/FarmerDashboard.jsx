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
  X,
  FileText,
  GraduationCap,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { auth } from '../../utils/firebase';
import OverviewSection from './components/OverviewSection';
import ManagementSection from './components/ManagementSection';
import RequestsSection from './components/RequestsSection';
import ServicesSection from './components/ServicesSection';
import ChatbotSection from './components/ChatbotSection';
import CommunityNetwork from '../../components/Network/CommunityNetwork';
import SettingsSection from './components/SettingsSection';
import NotificationsSection from './components/NotificationsSection';
import FinancialRatesSection from './components/FinancialRatesSection';
import ComplaintsSection from './components/ComplaintsSection';
import './FarmerDashboard.css';

export function FarmerDashboard() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewSection setActiveTab={setActiveTab} />;
      case 'management':
        return <ManagementSection />;
      case 'requests':
        return <RequestsSection />;
      case 'services':
        return <ServicesSection />;
      case 'chatbot':
        return <ChatbotSection />;
      case 'community':
        return <CommunityNetwork currentUserRole="farmer" currentUserId={auth.currentUser?.uid} />;
      case 'notifications':
        return <NotificationsSection />;
      case 'settings':
        return <SettingsSection />;
      case 'financial':
        return <FinancialRatesSection />;
      case 'complaints':
        return <ComplaintsSection />;
      default:
        return <OverviewSection setActiveTab={setActiveTab} />;
    }
  };
  const handleNavClick = (tab) => {
    setActiveTab(tab);
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="farmer-dashboard-container mobile-dash-wrapper" style={{ display: 'flex', height: '100vh', backgroundColor: '#f3f4f6', overflow: 'hidden', position: 'relative' }}>
      <style>{`
        @media (max-width: 768px) {
          .mobile-dash-wrapper { flex-direction: column !important; }
          .farmer-sidebar {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            height: 100vh !important;
            width: 260px !important;
            z-index: 200 !important;
            transition: transform 0.3s ease !important;
          }
          .farmer-sidebar.closed { transform: translateX(-100%) !important; }
          .farmer-sidebar.open { transform: translateX(0) !important; }
          .farmer-main-content { padding: 12px !important; padding-top: 64px !important; }
          .hamburger-btn { display: block !important; }
        }
        .hamburger-btn { display: none; }
      `}</style>

      <button
        className="hamburger-btn"
        onClick={() => setIsSidebarOpen(true)}
        style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 100, background: '#115e59', color: 'white', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <div 
        className={`farmer-sidebar ${isSidebarOpen ? 'open' : 'closed'}`} 
        style={{ 
          width: '260px', 
          backgroundColor: '#115e59', 
          color: 'white', 
          display: 'flex', 
          flexDirection: 'column',
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
            onClick={() => handleNavClick('overview')}
          />
          <SidebarItem
            icon={<Wallet size={20} />}
            label={t('farmer.sidebar.management') || 'Management'}
            isActive={activeTab === 'management'}
            onClick={() => handleNavClick('management')}
          />
          <SidebarItem
            icon={<FileText size={20} />}
            label={t('farmer.sidebar.requests') || 'Customer Requests'}
            isActive={activeTab === 'requests'}
            onClick={() => handleNavClick('requests')}
          />
          <SidebarItem
            icon={<Truck size={20} />}
            label={t('farmer.sidebar.services') || 'Services'}
            isActive={activeTab === 'services'}
            onClick={() => handleNavClick('services')}
          />
          <SidebarItem
            icon={<MessageSquare size={20} />}
            label={t('farmer.sidebar.chatbot') || 'Chatbot'}
            isActive={activeTab === 'chatbot'}
            onClick={() => handleNavClick('chatbot')}
          />
          <SidebarItem
            icon={<Users size={20} />}
            label={t('farmer.sidebar.community') || 'Community'}
            isActive={activeTab === 'community'}
            onClick={() => handleNavClick('community')}
          />
          <SidebarItem
            icon={<Bell size={20} />}
            label={t('farmer.sidebar.notifications') || 'Notifications'}
            isActive={activeTab === 'notifications'}
            onClick={() => handleNavClick('notifications')}
          />
          <SidebarItem
            icon={<DollarSign size={20} />}
            label={t('farmer.sidebar.financial') || 'Bank Rates'}
            isActive={activeTab === 'financial'}
            onClick={() => handleNavClick('financial')}
          />
          <SidebarItem
            icon={<AlertCircle size={20} />}
            label={t('farmer.sidebar.complaints') || 'Help & Complaints'}
            isActive={activeTab === 'complaints'}
            onClick={() => handleNavClick('complaints')}
          />
        </nav>

        <div style={{ padding: '12px' }}>
          <SidebarItem
            icon={<Settings size={20} />}
            label={t('farmer.sidebar.settings') || 'Settings'}
            isActive={activeTab === 'settings'}
            onClick={() => handleNavClick('settings')}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="farmer-main-content" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minWidth: 0, padding: '32px', paddingTop: !isSidebarOpen ? '64px' : '32px', transition: 'padding 0.3s' }}>
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