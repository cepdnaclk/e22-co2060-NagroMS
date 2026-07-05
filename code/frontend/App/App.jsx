import { useState } from 'react';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
// App.jsx — plug this into your existing router
// Assumes you already have <BrowserRouter> wrapping your app

import { Routes, Route } from 'react-router-dom';

// Your existing pages
// import Login from './pages/Login';

// Expert dashboard
import ExpertLayout from './layouts/ExpertLayout';
import ExpertDashboard from './pages/expert/ExpertDashboard';
import Consultations from './pages/expert/Consultations';
import QAForum from './pages/expert/QAForum';
import KnowledgeBase from './pages/expert/KnowledgeBase';
import MyFarmers from './pages/expert/MyFarmers';
import Settings from './pages/expert/Settings';

export default function App() {
  return (
    <Routes>
      {/* Your existing routes */}
      {/* <Route path="/login" element={<Login />} /> */}

      {/* Expert dashboard — all nested under /expert */}
      <Route path="/expert" element={<ExpertLayout />}>
        <Route index element={<ExpertDashboard />} />
        <Route path="consultations" element={<Consultations />} />
        <Route path="qa" element={<QAForum />} />
        <Route path="knowledge" element={<KnowledgeBase />} />
        <Route path="farmers" element={<MyFarmers />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
// Placeholder dashboard stubs — replace with your real dashboard components
function PlaceholderDashboard({ role, onNavigate }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700 }}>
        {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
      </h2>
      <button
        onClick={() => { localStorage.clear(); onNavigate('login'); }}
        style={{ padding: '10px 24px', background: '#16a34a', color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer' }}
      >
        Logout
      </button>
    </div>
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('login');

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'signup':
        return <SignUpPage onNavigate={handleNavigate} />;
      case 'forgot-password':
        return <ForgotPasswordPage onNavigate={handleNavigate} />;
      case 'farmer-dashboard':
        return <PlaceholderDashboard role="farmer" onNavigate={handleNavigate} />;
      case 'customer-dashboard':
        return <PlaceholderDashboard role="customer" onNavigate={handleNavigate} />;
      case 'service-provider-dashboard':
        return <PlaceholderDashboard role="service-provider" onNavigate={handleNavigate} />;
      case 'expert-dashboard':
        return <PlaceholderDashboard role="expert" onNavigate={handleNavigate} />;
      default:
        return <LoginPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderPage()}
    </div>
  );
}