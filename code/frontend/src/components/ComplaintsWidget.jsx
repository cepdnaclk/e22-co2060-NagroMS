import React, { useState, useEffect } from 'react';
import { db, auth } from '../utils/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { MessageSquare, AlertCircle, X } from 'lucide-react';

export default function ComplaintsWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [complaints, setComplaints] = useState([]);
    const [newComplaint, setNewComplaint] = useState('');

    useEffect(() => {
        if (!auth.currentUser) return;
        
        const qC = query(collection(db, 'complaints'), where('userId', '==', auth.currentUser.uid));
        const unsubC = onSnapshot(qC, snap => {
            const arr = [];
            snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
            arr.sort((a, b) => {
                const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                return tB - tA;
            });
            setComplaints(arr);
        });

        return () => { unsubC(); };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComplaint.trim()) return;
        
        try {
            await addDoc(collection(db, 'complaints'), {
                userId: auth.currentUser.uid,
                userName: auth.currentUser.displayName || auth.currentUser.email,
                role: localStorage.getItem('userRoles') || 'user',
                content: newComplaint,
                status: 'Pending',
                createdAt: serverTimestamp(),
                orderId: 'N/A' // Not tied to an order for generic widget
            });
            setNewComplaint('');
            alert("Complaint submitted successfully.");
        } catch (error) {
            console.error("Error submitting complaint: ", error);
            alert("Error submitting complaint.");
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: '#dc2626',
                    color: '#fff',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                title="Help & Complaints"
            >
                <AlertCircle size={28} />
            </button>

            {isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 10000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        background: '#fff',
                        width: '90%',
                        maxWidth: '500px',
                        maxHeight: '90vh',
                        borderRadius: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#111827' }}>Help & Complaints</h2>
                            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div style={{ padding: '24px', overflowY: 'auto' }}>
                            <form onSubmit={handleSubmit} style={{ marginBottom: '32px' }}>
                                <textarea 
                                    required
                                    rows={4}
                                    value={newComplaint}
                                    onChange={e => setNewComplaint(e.target.value)}
                                    placeholder="Describe your issue or complaint in detail..."
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '16px', boxSizing: 'border-box' }}
                                />
                                <button type="submit" style={{ width: '100%', padding: '12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                                    Submit Complaint
                                </button>
                            </form>

                            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>Your Previous Complaints</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {complaints.length === 0 ? (
                                    <p style={{ color: '#6b7280', fontSize: '14px' }}>You have not submitted any complaints yet.</p>
                                ) : complaints.map(c => (
                                    <div key={c.id} style={{ background: '#f9fafb', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', background: c.status === 'Pending' ? '#fef2f2' : '#f0fdf4', color: c.status === 'Pending' ? '#dc2626' : '#16a34a' }}>
                                                {c.status}
                                            </span>
                                            <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                                                {c.createdAt?.toDate?.().toLocaleDateString() || 'Recently'}
                                            </span>
                                        </div>
                                        <p style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '14px' }}>{c.content}</p>
                                        
                                        {c.reply && (
                                            <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #3b82f6' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                                    <MessageSquare size={14} color="#3b82f6" />
                                                    <span style={{ fontWeight: 600, fontSize: '12px', color: '#1e3a8a' }}>Admin Reply</span>
                                                </div>
                                                <p style={{ margin: 0, color: '#475569', fontSize: '13px' }}>{c.reply}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
