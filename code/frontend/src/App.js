import { Routes, Route, Navigate } from 'react-router-dom';

// Auth pages
import LandingPage from './pages/Landingpage/Landingpage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { SignUpPage } from './pages/SignUpPage.jsx';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.jsx';

// Expert dashboard components
import ExpertLayout from './layouts/expertlayout.jsx';
import ExpertDashboard from './pages/expert/ExpertDashboard.jsx';
import Consultations from './pages/expert/Consultations.jsx';
import QAForum from './pages/expert/QAForum.jsx';
import KnowledgeBase from './pages/expert/Knowledgebase.jsx';
import MyFarmers from './pages/expert/MyFarmers.jsx';
import Settings from './pages/expert/Settings.jsx';

// Placeholder dashboards for other roles
function PlaceholderDashboard({ role }) {
  return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <h2 className="text-2xl font-bold">{role.charAt(0).toUpperCase() + role.slice(1)} Dashboard</h2>
      <p className="text-gray-500">This feature is coming soon.</p>
      <button 
        onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        Logout
      </button>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        
        {/* Expert Dashboard Routes */}
        <Route path="/expert-dashboard" element={<ExpertLayout />}>
          <Route index element={<ExpertDashboard />} />
          <Route path="consultations" element={<Consultations />} />
          <Route path="qa" element={<QAForum />} />
          <Route path="knowledge" element={<KnowledgeBase />} />
          <Route path="farmers" element={<MyFarmers />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Placeholder Routes for other roles */}
        <Route path="/farmer-dashboard" element={<PlaceholderDashboard role="farmer" />} />
        <Route path="/customer-dashboard" element={<PlaceholderDashboard role="customer" />} />
        <Route path="/service-provider-dashboard" element={<PlaceholderDashboard role="service-provider" />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
