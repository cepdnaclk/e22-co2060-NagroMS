import { useLanguage } from '../../../i18n/LanguageContext';
import React, { useState, useEffect } from 'react';
import { auth, db } from '../../../utils/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function NotificationsSection() {
  const { t } = useLanguage();

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let unsubscribeNotifs = null;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const notifQuery = query(collection(db, 'notifications'), where('userId', '==', user.uid));
        unsubscribeNotifs = onSnapshot(notifQuery, (snapshot) => {
          const arr = [];
          snapshot.forEach(doc => arr.push({ id: doc.id, ...doc.data() }));
          arr.sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
            return dateB - dateA;
          });
          setNotifications(arr);
        });
      } else {
        setNotifications([]);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeNotifs) unsubscribeNotifs();
    };
  }, []);

  const markAsRead = async (notifId) => {
    if (!auth.currentUser) return;
    try {
      const token = await auth.currentUser.getIdToken();
      await fetch(`${process.env.REACT_APP_API_URL || `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}`}/farmer/notifications/${notifId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const unreadNotifs = notifications.filter(n => !n.read);
  const readNotifs = notifications.filter(n => n.read);

  return (
    <div className="nagro-section-content" style={{ paddingBottom: '40px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '24px' }}>{t('farmer.notifications.title')}</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Unread Notifications */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#dc2626', marginBottom: '16px' }}>{t('farmer.notifications.unread')}</h3>
          
          {unreadNotifs.length === 0 ? (
            <p style={{ color: '#6b7280' }}>{t('farmer.notifications.noNotifications')}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {unreadNotifs.map(n => (
                <div key={n.id} style={{ padding: '16px', borderRadius: '8px', borderLeft: '4px solid #ef4444', backgroundColor: '#fef2f2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#111827' }}>{n.title}</h4>
                    <p style={{ margin: 0, fontSize: '14px', color: '#4b5563' }}>{n.message}</p>
                    {n.createdAt && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>{new Date(n.createdAt?.toDate ? n.createdAt.toDate() : n.createdAt).toLocaleString()}</p>}
                  </div>
                  <button onClick={() => markAsRead(n.id)} style={{ padding: '8px 12px', backgroundColor: '#ef4444', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}>{t('farmer.notifications.markAsRead')}</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Read Notifications */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', marginBottom: '16px' }}>{t('farmer.notifications.read')}</h3>
          
          {readNotifs.length === 0 ? (
            <p style={{ color: '#6b7280' }}>{t('farmer.notifications.noNotifications')}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {readNotifs.map(n => (
                <div key={n.id} style={{ padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#374151' }}>{n.title}</h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>{n.message}</p>
                  {n.createdAt && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>{new Date(n.createdAt?.toDate ? n.createdAt.toDate() : n.createdAt).toLocaleString()}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
