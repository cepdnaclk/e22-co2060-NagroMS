// src/App.js
import { useState } from 'react';

// Named imports (matches your export function ... style)
import { LoginPage }            from './Pages/LoginPage';
import { SignUpPage }           from './Pages/SignUpPage';
import { ForgotPasswordPage }   from './Pages/ForgotPasswordPage';

// Uncomment these only when you actually create the files
// import { LandingPage }         from './Pages/LandingPage';
// import { RoleSwitcher }         from './Pages/RoleSwitcher';
// import { FarmerDashboard }      from './Pages/FarmerDashboard';
// import { CustomerDashboard }    from './Pages/CustomerDashboard';
// import { ServiceProviderDashboard } from './Pages/ServiceProviderDashboard';
// import { ExpertDashboard }      from './Pages/ExpertDashboard';

export default function App() {
  const [currentPage, setCurrentPage] = useState('login');

  const handleNavigate = (page) => {
    console.log('Navigation requested →', page);
    setCurrentPage(page);
  };

  const renderPage = () => {
    console.log('Rendering page:', currentPage);

    switch (currentPage) {
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;

      case 'signup':
        return <SignUpPage onNavigate={handleNavigate} />;

      case 'forgot-password':
        return <ForgotPasswordPage onNavigate={handleNavigate} />;

      // Add these cases later when dashboards exist
      // case 'farmer-dashboard':
      //   return <FarmerDashboard onNavigate={handleNavigate} />;
      // case 'customer-dashboard':
      //   return <CustomerDashboard onNavigate={handleNavigate} />;
      // ...

      default:
        console.warn(`Unknown page "${currentPage}" → falling back to login`);
        return <LoginPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderPage()}
    </div>
  );
}