import { useLanguage } from '../../../i18n/LanguageContext';
import React, { useState, useEffect } from 'react';
import { db } from '../../../utils/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const CATEGORIES = [
  { id: 'equipment', emoji: '🚜', title: 'Equipment Rental', desc: 'Machinery & tools for farmers', color: '#ea580c', bg: '#fff7ed' },
  { id: 'delivery', emoji: '🚚', title: 'Delivery & Export', desc: 'Transport & logistics services', color: '#2563eb', bg: '#eff6ff' },
  { id: 'storage', emoji: '🏠', title: 'Storage Facilities', desc: 'Warehouses, cold rooms & silos', color: '#16a34a', bg: '#f0fdf4' },
  { id: 'packaging', emoji: '📦', title: 'Packaging Services', desc: 'Packing, labelling & sealing', color: '#9333ea', bg: '#faf5ff' },
  { id: 'financial', emoji: '💳', title: 'Financial Services', desc: 'Loans & credit for farmers', color: '#0891b2', bg: '#ecfeff' }
];

const DUMMY_PROVIDERS = [
  { id: 'd1', businessName: 'AgriTech Tractors', serviceProviderType: 'equipment', phone: '+94 77 111 2222', district: 'Anuradhapura' },
  { id: 'd2', businessName: 'Maha Harvest Machinery', serviceProviderType: 'equipment', phone: '+94 71 333 4444', district: 'Polonnaruwa' },
  { id: 'd3', businessName: 'Speedy Fresh Transports', serviceProviderType: 'delivery', phone: '+94 77 555 6666', district: 'Colombo' },
  { id: 'd4', businessName: 'Cool Chain Logistics', serviceProviderType: 'delivery', phone: '+94 70 777 8888', district: 'Dambulla' },
  { id: 'd5', businessName: 'Dambulla Cold Storage', serviceProviderType: 'storage', phone: '+94 77 999 0000', district: 'Dambulla' },
  { id: 'd6', businessName: 'EcoPack Solutions', serviceProviderType: 'packaging', phone: '+94 71 123 4567', district: 'Kandy' },
  { id: 'd7', businessName: 'AgriFinance Bank', serviceProviderType: 'financial', phone: '+94 11 222 3333', district: 'Colombo' }
];

export default function ServicesSection() {
  const { t } = useLanguage();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const q = query(collection(db, 'users'), where('roles', 'array-contains', 'service-provider'));
        const querySnapshot = await getDocs(q);
        let providerList = [];
        querySnapshot.forEach((doc) => {
          providerList.push({ id: doc.id, ...doc.data() });
        });
        
        // Also check if any user has 'role' == 'service-provider' just in case
        const q2 = query(collection(db, 'users'), where('role', '==', 'service-provider'));
        const querySnapshot2 = await getDocs(q2);
        querySnapshot2.forEach((doc) => {
          if (!providerList.find(p => p.id === doc.id)) {
            providerList.push({ id: doc.id, ...doc.data() });
          }
        });
        
        // Always include dummy data for demonstration purposes, 
        // to ensure all categories are populated even if DB users lack category fields.
        providerList = [...providerList, ...DUMMY_PROVIDERS];
        
        setProviders(providerList);
      } catch (error) {
        console.error("Error fetching service providers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, []);

  const renderProvider = (p) => {
    return (
      <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '12px', marginBottom: '16px', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 600, color: '#1f2937' }}>{p.fullName || p.businessName || 'Service Provider'}</h4>
          <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span>📞 {p.phone || p.whatsappNumber || 'N/A'}</span>
            <span>📍 {p.district || p.villageTown || 'N/A'}</span>
          </p>
        </div>
        <button style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', color: 'white', backgroundColor: '#10b981', cursor: 'pointer', fontWeight: 600, fontSize: '14px', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)', transition: 'background-color 0.2s' }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
        >
          Contact
        </button>
      </div>
    );
  };

  return (
    <div className="nagro-section-content" style={{ paddingBottom: '40px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '24px' }}>{t('farmer.services.title') || 'Services Directory'}</h2>
      
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <p style={{ color: '#6b7280', fontWeight: 500 }}>Loading services...</p>
        </div>
      ) : (
        <>
          {!selectedCategory ? (
            // GRID OF CATEGORIES
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {CATEGORIES.map(category => {
                const categoryProviders = providers.filter(p => 
                  p.serviceProviderType === category.id || 
                  p.serviceType === category.id ||
                  (p.businessName || '').toLowerCase().includes(category.id)
                );

                return (
                  <div 
                    key={category.id} 
                    onClick={() => setSelectedCategory(category)}
                    style={{ 
                      backgroundColor: category.bg, 
                      padding: '24px', 
                      borderRadius: '16px', 
                      border: `1px solid ${category.color}40`, 
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'flex-start'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                      <div style={{ fontSize: '40px' }}>{category.emoji}</div>
                      <div>
                        <h3 style={{ fontSize: '20px', fontWeight: 600, color: category.color, margin: 0 }}>{t(`farmer.services.categories.${category.id}.title`) || category.title}</h3>
                        <p style={{ color: '#6b7280', fontSize: '14px', margin: '4px 0 0 0' }}>{t(`farmer.services.categories.${category.id}.desc`) || category.desc}</p>
                      </div>
                    </div>
                    <div style={{ marginTop: 'auto', paddingTop: '12px', color: categoryProviders.length > 0 ? category.color : '#9ca3af', fontSize: '14px', fontWeight: 500 }}>
                      {categoryProviders.length} {categoryProviders.length === 1 ? (t('farmer.services.providerAvailable') || 'provider available') : (t('farmer.services.providersAvailable') || 'providers available')} &rarr;
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // SELECTED CATEGORY VIEW
            <div>
              <button 
                onClick={() => setSelectedCategory(null)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#4b5563', 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  marginBottom: '24px',
                  padding: 0
                }}
              >
                &larr; {t('farmer.services.backToCategories') || 'Back to Categories'}
              </button>

              <div style={{ backgroundColor: selectedCategory.bg, padding: '24px', borderRadius: '16px', border: `1px solid ${selectedCategory.color}40`, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontSize: '48px' }}>{selectedCategory.emoji}</div>
                <div>
                  <h3 style={{ fontSize: '24px', fontWeight: 700, color: selectedCategory.color, margin: 0 }}>{t(`farmer.services.categories.${selectedCategory.id}.title`) || selectedCategory.title}</h3>
                  <p style={{ color: '#4b5563', fontSize: '16px', margin: '4px 0 0 0' }}>{t(`farmer.services.categories.${selectedCategory.id}.desc`) || selectedCategory.desc}</p>
                </div>
              </div>

              {(() => {
                const categoryProviders = providers.filter(p => 
                  p.serviceProviderType === selectedCategory.id || 
                  p.serviceType === selectedCategory.id ||
                  (p.businessName || '').toLowerCase().includes(selectedCategory.id)
                );

                if (categoryProviders.length === 0) {
                  return (
                    <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px dashed #d1d5db' }}>
                      <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>{t('farmer.services.noProviders') || 'No service providers are currently listed in this category.'}</p>
                    </div>
                  );
                }

                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '16px' }}>
                    {categoryProviders.map(renderProvider)}
                  </div>
                );
              })()}
            </div>
          )}
        </>
      )}
    </div>
  );
}
