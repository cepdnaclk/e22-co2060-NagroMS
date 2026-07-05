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
    emoji: '🚛',
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
    title: 'Packaging Provider',
    subtitle: 'Packing, labelling & sealing',
    description: 'Pack, label, vacuum-seal and prepare agricultural produce for local markets or export. Manage packing orders and materials inventory.',
    features: ['Order queue management', 'Track packing progress', 'Materials stock monitoring', 'Low-stock alerts'],
    color: '#9333ea',
    bg: 'rgba(250, 245, 255, 0.7)',
    border: 'rgba(233, 213, 255, 0.6)',
  },
  {
    id: 'financial',
    emoji: '🏦',
    title: 'Financial Provider',
    subtitle: 'Loans & credit for farmers',
    description: 'Offer agricultural loans to farmers as a bank representative or individual lender. Help farmers access funding for seeds, equipment, and land.',
    features: ['List your loan products & interest rates', 'Manage loan applications from farmers', 'View bank directory (admin-curated)', 'Track repayments & outstanding loans'],
    color: '#0891b2',
    bg: 'rgba(236, 254, 255, 0.7)',
    border: 'rgba(165, 243, 252, 0.6)',
  },
];

export function ServiceTypeSelectionPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!selected) return;
    localStorage.setItem('serviceProviderType', selected);
    onNavigate('service-provider-dashboard');
  };

  const accountType = localStorage.getItem('userAccountType') || 'individual';
  const name = accountType === 'individual'
    ? localStorage.getItem('userName') || 'there'
    : localStorage.getItem('businessName') || 'there';

  return (
    <div style={{ 
      minHeight: '100vh', 
      // Rich mesh gradient background for glassmorphism to pop against
      background: 'radial-gradient(at 0% 0%, hsla(145,55%,85%,1) 0px, transparent 50%), radial-gradient(at 100% 0%, hsla(40,50%,90%,1) 0px, transparent 50%), radial-gradient(at 100% 100%, hsla(150,40%,80%,1) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(210,40%,90%,1) 0px, transparent 50%), #f8fafc',
      display: 'flex', 
      flexDirection: 'column' 
    }}>

      {/* Top Bar - Glassmorphism */}
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.6)', 
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.5)', 
        padding: '1rem 2rem', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.75rem',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)', borderRadius: '0.5rem', padding: '0.4rem', boxShadow: '0 2px 8px rgba(22,163,74,0.3)' }}>
          <Sprout style={{ width: 22, height: 22, color: '#fff' }} />
        </div>
        <span style={{ fontWeight: 800, color: '#14532d', fontSize: '1.2rem', letterSpacing: '-0.02em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>NagroMS</span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 1.5rem', maxWidth: '72rem', margin: '0 auto', width: '100%' }}>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem', 
            background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.8)', borderRadius: 99, 
            padding: '0.4rem 1.25rem', marginBottom: '1.25rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}>
            <Check style={{ width: 14, height: 14, color: '#16a34a' }} />
            <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>Personalized provider portal</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#064e3b', marginBottom: '0.75rem', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em' }}>
            Which service do you provide?
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#475569', maxWidth: '38rem', margin: '0 auto', fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}>
            Select your provider type to unlock the right NagroMS dashboard, widgets, and reports tailored to your agricultural business.
          </p>
        </div>

        {/* Service Type Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.5rem', width: '100%', marginBottom: '2.5rem' }}>
          {SERVICE_TYPES.map(st => {
            const isSelected = selected === st.id;
            const isHovered = hoveredId === st.id;
            return (
              <button
                key={st.id}
                onClick={() => setSelected(st.id)}
                onMouseEnter={() => setHoveredId(st.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  textAlign: 'left', padding: '1.75rem', borderRadius: '1.5rem', cursor: 'pointer', width: '100%',
                  background: isSelected ? st.bg : 'rgba(255, 255, 255, 0.65)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: `1px solid ${isSelected ? st.color : isHovered ? 'rgba(255,255,255,0.9)' : 'rgba(255, 255, 255, 0.4)'}`,
                  boxShadow: isSelected
                    ? `0 0 0 2px ${st.color}40, 0 12px 40px ${st.color}20, inset 0 1px 0 rgba(255,255,255,0.8)`
                    : isHovered 
                      ? '0 12px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)' 
                      : '0 4px 16px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.6)',
                  transform: isSelected ? 'translateY(-4px)' : isHovered ? 'translateY(-2px)' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Subtle sheen effect on glass */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 100%)', pointerEvents: 'none' }} />

                {/* Selected badge */}
                {isSelected && (
                  <div style={{
                    position: 'absolute', top: '1.25rem', right: '1.25rem',
                    width: 32, height: 32, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${st.color}, ${st.color}dd)`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 4px 12px ${st.color}60`
                  }}>
                    <Check style={{ width: 18, height: 18, color: '#fff' }} />
                  </div>
                )}

                {/* Emoji with glass backing */}
                <div style={{ 
                  width: 64, height: 64, borderRadius: '1rem', 
                  background: 'rgba(255,255,255,0.5)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2.5rem', marginBottom: '1.25rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05), inset 0 2px 4px rgba(255,255,255,0.8)'
                }}>
                  {st.emoji}
                </div>

                {/* Title */}
                <h3 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a', margin: '0 0 0.25rem 0', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{st.title}</h3>
                <p style={{ fontSize: '0.85rem', color: st.color, fontWeight: 700, margin: '0 0 1rem 0', fontFamily: "'Inter', sans-serif" }}>{st.subtitle}</p>

                {/* Description */}
                <p style={{ fontSize: '0.9rem', color: '#475569', margin: '0 0 1.25rem 0', lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>{st.description}</p>

                {/* Features */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {st.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem', color: '#334155', fontFamily: "'Inter', sans-serif" }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: `${st.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <Check style={{ width: 11, height: 11, color: st.color }} />
                      </div>
                      {f}
                    </div>
                  ))}
                </div>

                {/* Select indicator */}
                <div style={{ 
                  marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', 
                  fontSize: '0.85rem', color: st.color, fontWeight: 700, fontFamily: "'Inter', sans-serif",
                  opacity: (isSelected || isHovered) ? 1 : 0, 
                  transform: (isSelected || isHovered) ? 'translateX(0)' : 'translateX(-10px)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
                }}>
                  {isSelected ? 'Open dashboard' : 'Select this service'} <ArrowRight style={{ width: 16, height: 16 }} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Confirm Button */}
        <div style={{ width: '100%', maxWidth: '30rem', textAlign: 'center' }}>
          <button
            onClick={handleConfirm}
            disabled={!selected}
            style={{
              width: '100%', padding: '1.25rem', borderRadius: '1rem', border: 'none',
              background: selected ? 'linear-gradient(135deg,#16a34a,#22c55e)' : 'rgba(226, 232, 240, 0.8)',
              backdropFilter: selected ? 'none' : 'blur(8px)',
              color: selected ? '#fff' : '#94a3b8',
              cursor: selected ? 'pointer' : 'not-allowed',
              fontSize: '1.05rem', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif",
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
              boxShadow: selected ? '0 8px 24px rgba(22,163,74,0.3)' : 'inset 0 1px 0 rgba(255,255,255,0.5)',
              transform: selected ? 'translateY(0)' : 'translateY(2px)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {selected
              ? <><Check style={{ width: 20, height: 20 }} /> Set up my {SERVICE_TYPES.find(s => s.id === selected)?.title} Dashboard</>
              : 'Select a service type to continue'
            }
          </button>
          <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#64748b', fontFamily: "'Inter', sans-serif" }}>
            You can securely update this later from your dashboard settings.
          </p>
        </div>
      </div>
    </div>
  );
}
