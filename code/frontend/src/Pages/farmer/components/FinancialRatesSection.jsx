import React, { useState, useEffect } from 'react';
import { db, auth } from '../../../utils/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { DollarSign, Building } from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';

export default function FinancialRatesSection() {
    const { t } = useLanguage();
    const [rates, setRates] = useState([]);

    useEffect(() => {
        const q = query(collection(db, 'financialRates'));
        const unsub = onSnapshot(q, snap => {
            const arr = [];
            snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
            setRates(arr);
        });
        return () => unsub();
    }, []);

    return (
        <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <DollarSign size={32} color="#115e59" />
                <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', margin: 0 }}>
                    {t('farmer.financial.title') || 'Banking & Interest Rates'}
                </h2>
            </div>
            <p style={{ color: '#4b5563', marginBottom: '32px' }}>
                {t('farmer.financial.subtitle') || 'View the latest financial support schemes and interest rates published by administrators.'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {rates.length === 0 ? (
                    <div style={{ padding: '40px', background: '#fff', borderRadius: '12px', textAlign: 'center', gridColumn: '1 / -1', border: '1px solid #e5e7eb' }}>
                        <p style={{ color: '#6b7280', margin: 0 }}>No active financial rates published at the moment.</p>
                    </div>
                ) : rates.map(rate => (
                    <div key={rate.id} style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Building size={24} color="#16a34a" />
                                </div>
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#1f2937' }}>{rate.bankName}</h3>
                            </div>
                            <div style={{ background: '#dcfce7', color: '#16a34a', padding: '6px 12px', borderRadius: '24px', fontWeight: 'bold', fontSize: '16px' }}>
                                {rate.interestRate}
                            </div>
                        </div>
                        <p style={{ margin: 0, color: '#4b5563', fontSize: '14px', lineHeight: '1.5' }}>
                            {rate.description}
                        </p>
                        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #f3f4f6', fontSize: '12px', color: '#9ca3af' }}>
                            Last updated: {rate.updatedAt?.toDate?.().toLocaleDateString() || 'Recently'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
