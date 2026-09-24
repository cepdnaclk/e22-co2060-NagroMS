import { useEffect, useState } from 'react';
import EquipmentRentalDashboard from './EquipmentRentalDashboard';
import PackagingProviderDashboard from './PackagingProviderDashboard';
import FinancialProviderDashboard from './FinancialProviderDashboard';
import DeliveryExportDashboard from './DeliveryExportDashboard';
import StorageFacilitiesDashboard from './StorageFacilitiesDashboard';
import { ServiceProviderTypeSelection } from './ServiceProviderTypeSelection';

export default function ServiceProviderDashboard({ onNavigate }) {
    const [serviceType, setServiceType] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load selected service type from localStorage
        const type = localStorage.getItem('serviceProviderType');
        setServiceType(type);
        setIsLoading(false);
    }, []);

    const handleSelectType = (selectedType) => {
        localStorage.setItem('serviceProviderType', selectedType);
        setServiceType(selectedType);
    };

    const handleLogout = () => {
        localStorage.clear();
        if (onNavigate) {
            onNavigate('landing');
        } else {
            window.location.href = '/login';
        }
    };

    if (isLoading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
                <p style={{ fontFamily: 'sans-serif', color: '#4b5563' }}>Loading portal...</p>
            </div>
        );
    }

    // Fallback: If no type selected, show selection page
    if (!serviceType) {
        return <ServiceProviderTypeSelection onNavigate={handleSelectType} />;
    }

    // Render the selected dashboard
    const renderDashboard = () => {
        switch (serviceType) {
            case 'storage':
                return <StorageFacilitiesDashboard onNavigate={handleLogout} />;
            case 'equipment':
                return <EquipmentRentalDashboard onNavigate={handleLogout} />;
            case 'delivery':
                return <DeliveryExportDashboard onNavigate={handleLogout} />;
            case 'packaging':
                return <PackagingProviderDashboard onNavigate={handleLogout} />;
            case 'financial':
                return <FinancialProviderDashboard onNavigate={handleLogout} />;
            default:
                return <ServiceProviderTypeSelection onNavigate={handleSelectType} />;
        }
    };

    return (
        <>
            {renderDashboard()}
            
            {/* Floating Switch Button */}
            <button
                onClick={() => handleSelectType(null)}
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px', // Float on the right to avoid overlapping the sidebar
                    zIndex: 9999,
                    backgroundColor: '#1f2937',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '99px',
                    padding: '12px 20px',
                    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#374151';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#1f2937';
                    e.currentTarget.style.transform = 'translateY(0)';
                }}
                title="Switch to a different service dashboard"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3L4 7l4 4"/><path d="M4 7h16"/><path d="M16 21l4-4-4-4"/><path d="M20 17H4"/>
                </svg>
                Switch Dashboard
            </button>
        </>
    );
}