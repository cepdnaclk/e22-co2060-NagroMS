import { useState } from 'react';
import { Sprout, ArrowRight, Check } from 'lucide-react';

const SERVICE_TYPES = [
    {
        id: 'equipment',
        emoji: '🚜',
        title: 'Equipment Rental',
        subtitle: 'Machinery & tools for farmers',
        description: 'Rent out tractors, harvesters, water pumps, sprayers and other farm machinery. Farmers can book your equipment by the day or per acre.',
        features: ['Manage equipment availability', 'Accept & track bookings', 'Set daily / per-acre rates', 'View booking history & earnings'],
        color: '#ea580c',
        bg: 'rgba(255, 247, 237, 0.7)',
        border: 'rgba(254, 215, 170, 0.6)',
    },
    {
        id: 'delivery',
        emoji: '🚚',
        title: 'Delivery & Export',
        subtitle: 'Transport & logistics services',
        description: 'Move produce from farms to markets, supermarkets or export terminals. Handle cold-chain transport, bulk grain haulage, and last-mile delivery.',
        features: ['Manage active deliveries', 'Track fleet & drivers', 'Accept delivery requests', 'Cold chain & export support'],
        color: '#2563eb',
        bg: 'rgba(239, 246, 255, 0.7)',
        border: 'rgba(191, 219, 254, 0.6)',
    },
    {
        id: 'storage',
        emoji: '🏠',
        title: 'Storage Facilities',
        subtitle: 'Warehouses, cold rooms & silos',
        description: 'Provide dry warehouses, cold storage rooms, freezers or grain silos for farmers who need safe storage before selling their produce.',
        features: ['Manage storage units & zones', 'Monitor temperature & humidity', 'Track active rentals', 'Get alerts for out-of-range readings'],
        color: '#16a34a',
        bg: 'rgba(240, 253, 244, 0.7)',
        border: 'rgba(187, 247, 208, 0.6)',
    },
    {
        id: 'packaging',
        emoji: '📦',
        title: 'Packaging Services',
        subtitle: 'Packing, labelling & sealing',
        description: 'Pack, label, vacuum-seal and prepare agricultural produce for local markets or export. Manage packing orders and materials inventory.',
        features: ['Manage packaging queue', 'Track packing progress', 'Materials stock monitoring', 'Low-stock alerts'],
        color: '#9333ea',
        bg: 'rgba(250, 245, 255, 0.7)',
        border: 'rgba(233, 213, 255, 0.6)',
    },
    {
        id: 'financial',
        emoji: '💳',
        title: 'Financial Services',
        subtitle: 'Loans & credit for farmers',
        description: 'Offer agricultural loans to farmers as a bank representative or individual lender. Help farmers access funding for seeds, equipment, and land.',
        features: ['List your loan products & interest rates', 'Manage loan applications from farmers', 'View bank directory (admin-curated)', 'Track repayments & outstanding loans'],
        color: '#0891b2',
        bg: 'rgba(236, 254, 255, 0.7)',
        border: 'rgba(165, 243, 252, 0.6)',
    },
];

export function ServiceProviderTypeSelection({ onNavigate }) {
    const [selected, setSelected] = useState(null);
    const [hoveredId, setHoveredId] = useState(null);

    const handleConfirm = () => {
        if (!selected) return;
        localStorage.setItem('serviceProviderType', selected);
        onNavigate(selected);
    };

    const userName = localStorage.getItem('userName') || localStorage.getItem('businessName') || 'dedwl';

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f3f4f6', // Sync with farmer background
            display: 'flex',
            flexDirection: 'column',
            fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif"
        }}>
            {/* Glass Top Nav Bar - Green styled */}
            <div style={{
                background: '#ffffff',
                borderBottom: '1px solid #e5e7eb',
                padding: '1rem 2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                position: 'sticky',
                top: 0,
                zIndex: 50
            }}>
                <div style={{ background: '#16a34a', borderRadius: '0.5rem', padding: '0.4rem' }}>
                    <Sprout style={{ width: 22, height: 22, color: '#fff' }} />
                </div>
                <span style={{ fontWeight: 800, color: '#166534', fontSize: '1.2rem', letterSpacing: '-0.02em' }}>NagroMS</span>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3.5rem 1.5rem', maxWidth: '75rem', margin: '0 auto', width: '100%' }}>
                
                {/* Heading Section */}
                <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                    <h1 style={{ fontSize: '2.75rem', fontWeight: 850, color: '#111827', marginBottom: '0.75rem', letterSpacing: '-0.03em' }}>
                        Welcome, {userName},! 👋
                    </h1>
                    <p style={{ fontSize: '1.15rem', color: '#4b5563', maxWidth: '40rem', margin: '0 auto', lineHeight: 1.6 }}>
                        One last step — tell us what service you will provide. We'll set up your dashboard to match.
                    </p>
                </div>

                {/* Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem', width: '100%', marginBottom: '3rem' }}>
                    {SERVICE_TYPES.map(st => {
                        const isSelected = selected === st.id;
                        const isHovered = hoveredId === st.id;
                        return (
                            <div
                                key={st.id}
                                onClick={() => setSelected(st.id)}
                                onMouseEnter={() => setHoveredId(st.id)}
                                onMouseLeave={() => setHoveredId(null)}
                                style={{
                                    textAlign: 'left',
                                    padding: '2rem',
                                    borderRadius: '16px',
                                    cursor: 'pointer',
                                    background: '#ffffff',
                                    border: isSelected ? '2px solid #16a34a' : '1px solid #e5e7eb',
                                    boxShadow: isSelected
                                        ? '0 10px 25px -5px rgba(22, 163, 74, 0.15), 0 8px 10px -6px rgba(22, 163, 74, 0.15)'
                                        : isHovered
                                            ? '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05)'
                                            : '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
                                    transform: isHovered ? 'translateY(-2px)' : 'none',
                                    transition: 'all 0.2s ease-in-out',
                                    position: 'relative'
                                }}
                            >
                                {/* Top right selection indicator */}
                                {isSelected && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '1.5rem',
                                        right: '1.5rem',
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        background: '#16a34a',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#ffffff'
                                    }}>
                                        <Check style={{ width: 14, height: 14, margin: 'auto' }} />
                                    </div>
                                )}

                                {/* Icon / Emoji Container */}
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '12px',
                                    background: isSelected ? st.bg : '#f9fafb',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '2rem',
                                    marginBottom: '1.25rem',
                                    border: `1px solid ${isSelected ? st.border : '#e5e7eb'}`
                                }}>
                                    {st.emoji}
                                </div>

                                <h3 style={{ fontWeight: 800, fontSize: '1.35rem', color: '#111827', margin: '0 0 0.25rem 0' }}>
                                    {st.title}
                                </h3>
                                <p style={{ fontSize: '0.85rem', color: st.color, fontWeight: 700, margin: '0 0 1rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {st.subtitle}
                                </p>

                                <p style={{ fontSize: '0.925rem', color: '#4b5563', margin: '0 0 1.5rem 0', lineHeight: 1.6 }}>
                                    {st.description}
                                </p>

                                {/* Features bullet points */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                    {st.features.map((f, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#374151' }}>
                                            <div style={{
                                                width: 18,
                                                height: 18,
                                                borderRadius: '50%',
                                                background: `${st.color}15`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                <Check style={{ width: 11, height: 11, color: st.color }} />
                                            </div>
                                            {f}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Confirm Button */}
                <div style={{ width: '100%', maxWidth: '32rem', textAlign: 'center' }}>
                    <button
                        onClick={handleConfirm}
                        disabled={!selected}
                        style={{
                            width: '100%',
                            padding: '1.125rem',
                            borderRadius: '10px',
                            border: 'none',
                            background: selected ? '#16a34a' : '#d1d5db',
                            color: '#ffffff',
                            cursor: selected ? 'pointer' : 'not-allowed',
                            fontSize: '1.05rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            boxShadow: selected ? '0 10px 15px -3px rgba(22, 163, 74, 0.3)' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        {selected ? (
                            <>
                                Set up my {SERVICE_TYPES.find(s => s.id === selected)?.title} Dashboard
                                <ArrowRight style={{ width: 18, height: 18 }} />
                            </>
                        ) : (
                            'Select a service type to continue'
                        )}
                    </button>
                    <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#6b7280' }}>
                        You can update this later from your dashboard settings.
                    </p>
                </div>

            </div>
        </div>
    );
}