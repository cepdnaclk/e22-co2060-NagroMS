import { useState } from 'react';
import { CustomerDashboard } from './components/CustomerDashboard';

export default function App() {
  const handleNavigate = (page) => {
    console.log('Navigate to:', page);
  };

  return (
    <div className="min-h-screen bg-background">
      <CustomerDashboard onNavigate={handleNavigate} />
    </div>
  );
}
