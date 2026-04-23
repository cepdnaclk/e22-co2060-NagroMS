import React, { useState } from 'react';
import LandingPage from './pages/Landingpage/Landingpage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { FarmerDashboard } from './pages/farmer/farmerDashboard';

function App() {
  // Simple state-based routing
  const [currentPage, setCurrentPage] = useState('landing');

  // Navigation handler
  const handleNavigate = (page) => {
    if (page === 'customer-dashboard') {
      window.location.href = 'http://localhost:5173';
      return;
    }
    setCurrentPage(page);
    window.scrollTo(0, 0); // Scroll to top on page change
  };

  return (
    <div className="App">
      {currentPage === 'landing' && <LandingPage onNavigate={handleNavigate} />}
      {currentPage === 'login' && <LoginPage onNavigate={handleNavigate} />}
      {currentPage === 'signup' && <SignUpPage onNavigate={handleNavigate} />}
      {currentPage === 'farmer-dashboard' && <FarmerDashboard onNavigate={handleNavigate} />}
      
      {/* Catch-all to redirect to landing just in case */}
      {!['landing', 'login', 'signup', 'farmer-dashboard', 'customer-dashboard', 'service-provider-dashboard', 'expert-dashboard'].includes(currentPage) && (
        <LandingPage onNavigate={handleNavigate} />
      )}
    </div>
  );
}

export default App;
