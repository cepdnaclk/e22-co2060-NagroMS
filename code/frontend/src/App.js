import { Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext.jsx';

// Auth pages
import LandingPage from './Pages/Landingpage/Landingpage.jsx';
import { LoginPage } from './Pages/Login/LoginPage.jsx';
import { SignUpPage } from './Pages/Login/SignUpPage.jsx';
import { ForgotPasswordPage } from './Pages/Login/ForgotPasswordPage.jsx';

// Expert dashboard components
import ExpertLayout from './Pages/expert/layouts/expertlayout.jsx';
import ExpertDashboard from './Pages/expert/ExpertDashboard.jsx';
import Consultations from './Pages/expert/Consultations.jsx';
import QAForum from './Pages/expert/QAForum.jsx';
import KnowledgeBase from './Pages/expert/Knowledgebase.jsx';
import MyFarmers from './Pages/expert/MyFarmers.jsx';
import Settings from './Pages/expert/Settings.jsx';

// Farmer dashboard
import { FarmerDashboard } from './Pages/farmer/farmerDashboard.jsx';

// Customer dashboard
import { CustomerDashboard } from './Pages/Customer/src/app/components/CustomerDashboard.jsx';

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
      <LanguageProvider>
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

        {/* Farmer Dashboard Route */}
        <Route path="/farmer-dashboard" element={<FarmerDashboard onNavigate={() => {}} />} />

        {/* Placeholder Routes for other roles */}
        {/* Customer Dashboard Route */}
        <Route path="/customer-dashboard" element={<CustomerDashboard onNavigate={(path) => { if (path === 'landing') window.location.href = '/'; }} />} />

        {/* Placeholder Routes for other roles */}
        <Route path="/service-provider-dashboard" element={<PlaceholderDashboard role="service-provider" />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </LanguageProvider>
    </div>
  );
}