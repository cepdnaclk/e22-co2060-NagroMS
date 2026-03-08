// src/App.js
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth pages (from main)
import { LoginPage } from './Pages/LoginPage';
import { SignUpPage } from './Pages/SignUpPage';
import { ForgotPasswordPage } from './Pages/ForgotPasswordPage';

// Expert dashboard (from shathu4)
import { ExpertLayout } from "./pages/Expert_dashboard/expertdashboard";
import ExpertDashboard from "./pages/Expert_dashboard/expertdashboard";
import ConsultationRequests from "./pages/Expert_dashboard/consultationrequests";
import QAForum from "./pages/Expert_dashboard/qaforum";
import KnowledgeBase from "./pages/Expert_dashboard/knowledgebase";
import ExpertSettings from "./pages/Expert_dashboard/expertsettings";

// Simple page switcher for login/signup (no route needed)
function AuthFlow() {
  const [currentPage, setCurrentPage] = useState('login');

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'login': return <LoginPage onNavigate={handleNavigate} />;
      case 'signup': return <SignUpPage onNavigate={handleNavigate} />;
      case 'forgot-password': return <ForgotPasswordPage onNavigate={handleNavigate} />;
      default: return <LoginPage onNavigate={handleNavigate} />;
    }
  };

  return <div className="min-h-screen bg-background">{renderPage()}</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth pages */}
        <Route path="/login" element={<AuthFlow />} />

        {/* Expert dashboard */}
        <Route path="/expert" element={<ExpertLayout />}>
          <Route index element={<ExpertDashboard />} />
          <Route path="consultations" element={<ConsultationRequests />} />
          <Route path="qa-forum" element={<QAForum />} />
          <Route path="knowledge-base" element={<KnowledgeBase />} />
          <Route path="settings" element={<ExpertSettings />} />
        </Route>

        {/* Default redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
