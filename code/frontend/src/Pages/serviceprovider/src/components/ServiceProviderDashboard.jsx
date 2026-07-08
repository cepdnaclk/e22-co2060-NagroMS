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

    // Switch between the dashboard modules based on the selected service provider type
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
}