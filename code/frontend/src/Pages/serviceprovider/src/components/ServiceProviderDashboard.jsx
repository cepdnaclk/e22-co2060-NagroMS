import { useEffect, useState, useRef } from 'react';
import EquipmentRentalDashboard from './EquipmentRentalDashboard';
import PackagingProviderDashboard from './PackagingProviderDashboard';
import FinancialProviderDashboard from './FinancialProviderDashboard';
import DeliveryExportDashboard from './DeliveryExportDashboard';
import StorageFacilitiesDashboard from './StorageFacilitiesDashboard';
import { ServiceProviderTypeSelection } from './ServiceProviderTypeSelection';
import { auth, db } from '../../../../utils/firebase';
import { doc, getDoc } from 'firebase/firestore';
import ComplaintsWidget from '../../../../components/ComplaintsWidget.jsx';

const SERVICE_META = {
    equipment: { label: 'Equipment Rental', emoji: '🚜', color: '#ea580c' },
    delivery:  { label: 'Delivery & Export', emoji: '🚚', color: '#2563eb' },
    storage:   { label: 'Storage Facilities', emoji: '🏠', color: '#16a34a' },
    packaging: { label: 'Packaging Services', emoji: '📦', color: '#9333ea' },
    financial: { label: 'Financial Services', emoji: '💳', color: '#0891b2' },
};

export default function ServiceProviderDashboard({ onNavigate }) {
    const [serviceType, setServiceType] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [serviceCategories, setServiceCategories] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        async function load() {
            // Try localStorage first
            let cats = [];
            try {
                cats = JSON.parse(localStorage.getItem('serviceCategories') || '[]');
            } catch(e) {}

            // If empty, fetch from Firestore (handles existing accounts)
            if (cats.length === 0 && auth.currentUser) {
                try {
                    const snap = await getDoc(doc(db, 'users', auth.currentUser.uid));
                    if (snap.exists()) {
                        const data = snap.data();
                        cats = data.serviceCategories || [];
                        if (cats.length > 0) {
                            localStorage.setItem('serviceCategories', JSON.stringify(cats));
                        }
                    }
                } catch(e) { console.warn('Could not fetch categories from Firestore', e); }
            }

            setServiceCategories(cats);

            // Load current service type
            let type = localStorage.getItem('serviceProviderType');
            if (type === 'null' || type === 'undefined') type = null;

            // Auto-select if not set
            if (!type && cats.length >= 1) {
                type = cats[0];
                localStorage.setItem('serviceProviderType', type);
            }

            setServiceType(type);
            setIsLoading(false);
        }
        load();
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const switchTo = (type) => {
        localStorage.setItem('serviceProviderType', type);
        setServiceType(type);
        setDropdownOpen(false);
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

    // Fallback: If no type selected and no categories, show selection page
    if (!serviceType) {
        return <ServiceProviderTypeSelection onNavigate={(t) => { localStorage.setItem('serviceProviderType', t); setServiceType(t); }} />;
    }

    // Render the selected dashboard
    const renderDashboard = () => {
        switch (serviceType) {
            case 'storage':   return <StorageFacilitiesDashboard onNavigate={handleLogout} />;
            case 'equipment': return <EquipmentRentalDashboard onNavigate={handleLogout} />;
            case 'delivery':  return <DeliveryExportDashboard onNavigate={handleLogout} />;
            case 'packaging': return <PackagingProviderDashboard onNavigate={handleLogout} />;
            case 'financial': return <FinancialProviderDashboard onNavigate={handleLogout} />;
            default:          return <ServiceProviderTypeSelection onNavigate={(t) => { localStorage.setItem('serviceProviderType', t); setServiceType(t); }} />;
        }
    };

    const canSwitch = serviceCategories.length > 1;
    const isExactlyTwo = serviceCategories.length === 2;
    const otherService = isExactlyTwo ? serviceCategories.find(c => c !== serviceType) : null;
    const currentMeta = SERVICE_META[serviceType] || {};

    // Base button styles
    const btnBase = {
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        zIndex: 9999,
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.2s ease',
        boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
        border: 'none',
        borderRadius: '99px',
        padding: '13px 22px',
        color: '#fff',
        backgroundColor: '#1e293b',
    };

    const isIndividual = localStorage.getItem('accountType') === 'individual';
    const roles = JSON.parse(localStorage.getItem('userRoles') || '[]');
    const isAdmin = roles.includes('admin');

    return (
        <>
            {renderDashboard()}
            <ComplaintsWidget />

            {/* --- Gig Driver back-button for individual accounts --- */}
            {isIndividual && !isAdmin && (
                <button
                    onClick={() => { window.location.href = '/driver-dashboard'; }}
                    style={{ ...btnBase, backgroundColor: '#2563eb', bottom: canSwitch ? '84px' : '28px' }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#1d4ed8'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                    🛵 Back to Gig Driver
                </button>
            )}

            {/* --- Admin back-button --- */}
            {isAdmin && (
                <button
                    onClick={() => { window.location.href = '/admin-dashboard'; }}
                    style={{ ...btnBase, backgroundColor: '#dc2626', bottom: '28px', left: '28px', right: 'auto' }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#b91c1c'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#dc2626'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                    🛡️ Return to Admin Panel
                </button>
            )}

            {/* --- 2 services: single "Switch Account" button --- */}
            {canSwitch && isExactlyTwo && otherService && (
                <button
                    onClick={() => switchTo(otherService)}
                    style={btnBase}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#334155'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#1e293b'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    title={`Switch to ${SERVICE_META[otherService]?.label}`}
                >
                    {/* Switch icon */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8 3L4 7l4 4"/><path d="M4 7h16"/><path d="M16 21l4-4-4-4"/><path d="M20 17H4"/>
                    </svg>
                    <span>{SERVICE_META[otherService]?.emoji} Switch to {SERVICE_META[otherService]?.label}</span>
                </button>
            )}

            {/* --- 3+ services: dropdown menu --- */}
            {canSwitch && !isExactlyTwo && (
                <div ref={dropdownRef} style={{ position: 'fixed', bottom: '28px', right: '28px', zIndex: 9999 }}>
                    {/* Dropdown options — render above the button */}
                    {dropdownOpen && (
                        <div style={{
                            position: 'absolute',
                            bottom: 'calc(100% + 12px)',
                            right: 0,
                            backgroundColor: '#fff',
                            borderRadius: '16px',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                            padding: '8px',
                            minWidth: '240px',
                            border: '1px solid #e5e7eb',
                            animation: 'fadeInUp 0.15s ease',
                        }}>
                            <p style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 12px 4px' }}>
                                Your Services
                            </p>
                            {serviceCategories.map(cat => {
                                const meta = SERVICE_META[cat] || {};
                                const isActive = cat === serviceType;
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => switchTo(cat)}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            padding: '10px 12px',
                                            border: 'none',
                                            borderRadius: '10px',
                                            cursor: isActive ? 'default' : 'pointer',
                                            backgroundColor: isActive ? `${meta.color}15` : 'transparent',
                                            fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                                            fontSize: '14px',
                                            fontWeight: isActive ? 700 : 500,
                                            color: isActive ? meta.color : '#374151',
                                            textAlign: 'left',
                                            transition: 'background-color 0.15s',
                                        }}
                                        onMouseOver={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#f3f4f6'; }}
                                        onMouseOut={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                                    >
                                        <span style={{ fontSize: '20px' }}>{meta.emoji}</span>
                                        <span>{meta.label}</span>
                                        {isActive && (
                                            <span style={{ marginLeft: 'auto', fontSize: '11px', backgroundColor: meta.color, color: '#fff', padding: '2px 8px', borderRadius: '99px', fontWeight: 600 }}>
                                                Active
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Trigger button */}
                    <button
                        onClick={() => setDropdownOpen(o => !o)}
                        style={{ ...btnBase, position: 'static', backgroundColor: dropdownOpen ? '#334155' : '#1e293b' }}
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#334155'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = dropdownOpen ? '#334155' : '#1e293b'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        <span>{currentMeta.emoji}</span>
                        <span>{currentMeta.label}</span>
                        {/* Chevron icon */}
                        <svg
                            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                            style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                        >
                            <path d="M6 9l6 6 6-6"/>
                        </svg>
                    </button>
                </div>
            )}

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </>
    );
}