import React, { useState, useEffect } from 'react';
import { db, auth } from '../../../utils/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { MessageSquare, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';

export default function ComplaintsSection() {
    const { t } = useLanguage();
    const [complaints, setComplaints] = useState([]);
    const [newComplaint, setNewComplaint] = useState('');

    useEffect(() => {
        if (!auth.currentUser) return;
        const q = query(collection(db, 'complaints'), where('userId', '==', auth.currentUser.uid));
        const unsub = onSnapshot(q, snap => {
            const arr = [];
            snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
            arr.sort((a,b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
            setComplaints(arr);
        });
        return () => unsub();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComplaint.trim() || !auth.currentUser) return;
        try {
            await addDoc(collection(db, 'complaints'), {
                userId: auth.currentUser.uid,
                role: 'farmer',
                content: newComplaint,
                status: 'Pending',
                reply: '',
                createdAt: serverTimestamp()
            });
            setNewComplaint('');
        } catch(err) {
            console.error(err);
        }
    };

    return (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <AlertCircle size={32} color="#dc2626" />
                <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', margin: 0 }}>
                    Help & Complaints
                </h2>
            </div>
            
            <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#374151' }}>Submit a New Complaint</h3>
                <textarea 
                    required
                    rows={4}
                    value={newComplaint}
                    onChange={e => setNewComplaint(e.target.value)}
                    placeholder="Describe your issue or complaint in detail..."
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '16px', boxSizing: 'border-box' }}
                />
                <button type="submit" style={{ padding: '10px 24px', background: '#115e59', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                    Submit Complaint
                </button>
            </form>

            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>Your Previous Complaints</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {complaints.length === 0 ? (
                    <p style={{ color: '#6b7280' }}>You have not submitted any complaints yet.</p>
                ) : complaints.map(c => (
                    <div key={c.id} style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', background: c.status === 'Pending' ? '#fef2f2' : '#f0fdf4', color: c.status === 'Pending' ? '#dc2626' : '#16a34a' }}>
                                {c.status}
                            </span>
                            <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                                {c.createdAt?.toDate?.().toLocaleDateString() || 'Recently'}
                            </span>
                        </div>
                        <p style={{ margin: '0 0 16px 0', color: '#1f2937', fontSize: '15px' }}>{c.content}</p>
                        
                        {c.reply && (
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <MessageSquare size={16} color="#3b82f6" />
                                    <span style={{ fontWeight: 600, fontSize: '14px', color: '#1e3a8a' }}>Admin Reply</span>
                                </div>
                                <p style={{ margin: 0, color: '#334155', fontSize: '14px' }}>{c.reply}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
