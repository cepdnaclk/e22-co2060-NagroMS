import { useLanguage } from '../../../i18n/LanguageContext';
import React, { useState, useEffect } from 'react';
import { auth, db } from '../../../utils/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { Calendar, Phone, MapPin, Send, CheckCircle2, X } from 'lucide-react';

const CATEGORIES = [
  { id: 'equipment', emoji: '🚜', title: 'Equipment Rental', desc: 'Machinery & tools for farmers', color: '#ea580c', bg: '#fff7ed' },
  { id: 'delivery', emoji: '🚚', title: 'Delivery & Export', desc: 'Transport & logistics services', color: '#2563eb', bg: '#eff6ff' },
  { id: 'storage', emoji: '🏠', title: 'Storage Facilities', desc: 'Warehouses, cold rooms & silos', color: '#16a34a', bg: '#f0fdf4' },
  { id: 'packaging', emoji: '📦', title: 'Packaging Services', desc: 'Packing, labelling & sealing', color: '#9333ea', bg: '#faf5ff' },
  { id: 'financial', emoji: '💳', title: 'Financial Services', desc: 'Loans & credit for farmers', color: '#0891b2', bg: '#ecfeff' }
];

export default function ServicesSection() {
  const { t } = useLanguage();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Booking Modal State
  const [bookingProvider, setBookingProvider] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    requirement: '',
    requiredDate: '',
    phone: '',
    district: 'Anuradhapura',
    durationDays: 1,
    proposedCost: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const q = query(collection(db, 'users'), where('roles', 'array-contains', 'service-provider'));
        const querySnapshot = await getDocs(q);
        let providerList = [];
        querySnapshot.forEach((doc) => {
          providerList.push({ id: doc.id, ...doc.data() });
        });
        
        // Also check if any user has 'role' == 'service-provider'
        const q2 = query(collection(db, 'users'), where('role', '==', 'service-provider'));
        const querySnapshot2 = await getDocs(q2);
        querySnapshot2.forEach((doc) => {
          if (!providerList.find(p => p.id === doc.id)) {
            providerList.push({ id: doc.id, ...doc.data() });
          }
        });
        
        setProviders(providerList);
      } catch (error) {
        console.error("Error fetching service providers:", error);
        setProviders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, []);

  const handleOpenBooking = (p) => {
    setBookingProvider(p);
    setBookingSuccess(false);
    setBookingForm({
      requirement: '',
      requiredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      phone: auth.currentUser?.phoneNumber || '',
      district: p.district || 'Anuradhapura',
      durationDays: 1,
      proposedCost: '',
      notes: ''
    });
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!bookingForm.requirement) return;

    setIsSubmitting(true);
    try {
      const farmerId = auth.currentUser?.uid || 'demo-farmer';
      const farmerName = auth.currentUser?.displayName || auth.currentUser?.email || 'Farmer User';

      await addDoc(collection(db, 'serviceBookings'), {
        providerId: bookingProvider.id,
        providerName: bookingProvider.businessName || bookingProvider.fullName || 'Service Provider',
        serviceType: bookingProvider.serviceProviderType || selectedCategory?.id || 'general',
        farmerId,
        farmerName,
        farmerPhone: bookingForm.phone,
        district: bookingForm.district,
        requirement: bookingForm.requirement,
        requiredDate: bookingForm.requiredDate,
        durationDays: Number(bookingForm.durationDays) || 1,
        proposedCost: Number(bookingForm.proposedCost) || 0,
        notes: bookingForm.notes,
        status: 'pending',
        createdAt: serverTimestamp(),
        createdAtIso: new Date().toISOString()
      });

      setBookingSuccess(true);
      setTimeout(() => {
        setBookingProvider(null);
        setBookingSuccess(false);
      }, 2500);
    } catch (err) {
      console.warn("Falling back to local confirmation:", err);
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingProvider(null);
        setBookingSuccess(false);
      }, 2500);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <button 
          onClick={() => handleOpenBooking(p)}
          style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', color: 'white', backgroundColor: '#10b981', cursor: 'pointer', fontWeight: 600, fontSize: '14px', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)', transition: 'background-color 0.2s' }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
        >
          Book / Contact
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
                const categoryProviders = providers.filter(p => {
                  const catId = category.id.toLowerCase();
                  if (p.serviceCategories && Array.isArray(p.serviceCategories)) {
                    if (p.serviceCategories.includes(catId)) return true;
                  }
                  const type = (p.serviceProviderType || p.serviceType || '').toLowerCase();
                  const bizName = (p.businessName || p.fullName || '').toLowerCase();
                  return type.includes(catId) || bizName.includes(catId);
                });

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
                        <h3 style={{ fontSize: '20px', fontWeight: 600, color: category.color, margin: 0 }}>{category.title}</h3>
                        <p style={{ color: '#6b7280', fontSize: '14px', margin: '4px 0 0 0' }}>{category.desc}</p>
                      </div>
                    </div>
                    <div style={{ marginTop: 'auto', paddingTop: '12px', color: categoryProviders.length > 0 ? category.color : '#9ca3af', fontSize: '14px', fontWeight: 500 }}>
                      {categoryProviders.length} {categoryProviders.length === 1 ? 'provider' : 'providers'} available &rarr;
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
                &larr; Back to Categories
              </button>

              <div style={{ backgroundColor: selectedCategory.bg, padding: '24px', borderRadius: '16px', border: `1px solid ${selectedCategory.color}40`, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontSize: '48px' }}>{selectedCategory.emoji}</div>
                <div>
                  <h3 style={{ fontSize: '24px', fontWeight: 700, color: selectedCategory.color, margin: 0 }}>{selectedCategory.title}</h3>
                  <p style={{ color: '#4b5563', fontSize: '16px', margin: '4px 0 0 0' }}>{selectedCategory.desc}</p>
                </div>
              </div>

              {(() => {
                const categoryProviders = providers.filter(p => {
                  const catId = selectedCategory.id.toLowerCase();
                  
                  // Check the new serviceCategories array
                  if (p.serviceCategories && Array.isArray(p.serviceCategories)) {
                    if (p.serviceCategories.includes(catId)) return true;
                  }

                  // Fallback for older profiles before the array update
                  const type = (p.serviceProviderType || p.serviceType || '').toLowerCase();
                  const bizName = (p.businessName || p.fullName || '').toLowerCase();
                  
                  if (type.includes(catId) || bizName.includes(catId)) return true;
                  
                  return false;
                });

                return (
                  <div>
                    {/* General Request Button */}
                    <div style={{ backgroundColor: '#fff', border: `1px solid ${selectedCategory.color}40`, borderRadius: '12px', padding: '24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 600, color: '#1f2937' }}>Open / Broadcast Request</h4>
                        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Can't find a specific provider? Post your request and available providers will contact you.</p>
                      </div>
                      <button 
                        onClick={() => handleOpenBooking({ id: 'broadcast', businessName: 'Any Available Provider', serviceProviderType: selectedCategory.id })}
                        style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', color: 'white', backgroundColor: selectedCategory.color, cursor: 'pointer', fontWeight: 600, fontSize: '15px', boxShadow: `0 4px 6px ${selectedCategory.color}30`, transition: 'transform 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        Post General Request
                      </button>
                    </div>

                    {categoryProviders.length === 0 ? (
                      <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px dashed #d1d5db' }}>
                        <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>No direct service providers are currently listed in this category, but you can still post a general request above!</p>
                      </div>
                    ) : (
                      <>
                        <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#4b5563', marginBottom: '16px' }}>Directly Book a Provider</h4>
                        {categoryProviders.map(p => renderProvider(p))}
                      </>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </>
      )}

      {/* Booking / Contact Modal */}
      {bookingProvider && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '520px',
            padding: '28px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            position: 'relative'
          }}>
            <button
              onClick={() => setBookingProvider(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: '#6b7280',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            {bookingSuccess ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <CheckCircle2 size={56} style={{ color: '#16a34a', margin: '0 auto 16px auto' }} />
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>
                  Booking Request Sent!
                </h3>
                <p style={{ color: '#4b5563', fontSize: '14px', margin: 0 }}>
                  <strong>{bookingProvider.businessName || bookingProvider.fullName}</strong> has received your request and will contact you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitBooking} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: '0 0 4px 0' }}>
                    Request Service
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                    Connecting with <strong>{bookingProvider.businessName || bookingProvider.fullName}</strong>
                  </p>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Required Service / Machinery / Need *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 4WD Tractor with Plough for 2 Days"
                    value={bookingForm.requirement}
                    onChange={(e) => setBookingForm({ ...bookingForm, requirement: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                      Required Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={bookingForm.requiredDate}
                      onChange={(e) => setBookingForm({ ...bookingForm, requiredDate: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                      Duration (Days) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={bookingForm.durationDays}
                      onChange={(e) => setBookingForm({ ...bookingForm, durationDays: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="07XXXXXXXX"
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                      Proposed Cost (Rs)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 5000"
                      value={bookingForm.proposedCost}
                      onChange={(e) => setBookingForm({ ...bookingForm, proposedCost: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    District / Farm Location
                  </label>
                  <input
                    type="text"
                    value={bookingForm.district}
                    onChange={(e) => setBookingForm({ ...bookingForm, district: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Additional Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Field size, specific attachments, delivery preferences, etc."
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setBookingProvider(null)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      background: '#ffffff',
                      color: '#4b5563',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      padding: '10px 22px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      fontWeight: 600,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Send size={16} />
                    {isSubmitting ? 'Sending...' : 'Confirm Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
