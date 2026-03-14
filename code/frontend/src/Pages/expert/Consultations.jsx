import { Video, MessageSquare, Phone, Clock, Calendar, User } from 'lucide-react';
import { useExpertData } from '../../hooks/useExpertData';
import { updateConsultationStatus } from '../../services/expertService';
import * as S from '../../Styles/expertStyles';
import { useState } from 'react';

const typeIcon = (type) => {
    const props = { size: 15, color: S.colors.green, strokeWidth: 1.8 };
    if (type === 'video') return <Video {...props} />;
    if (type === 'phone') return <Phone {...props} />;
    return <MessageSquare {...props} />;
};

const formatDate = (ts) => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }) +
        ' at ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

export default function Consultations() {
    const { data: consultations, loading, expertId } = useExpertData('consultations');
    const [statuses, setStatuses] = useState({});

    const updateStatus = async (id, status) => {
        await updateConsultationStatus(id, status);
        setStatuses(prev => ({ ...prev, [id]: status }));
    };

    if (loading) return <div style={{ ...S.page, color: S.colors.textMuted }}>Loading...</div>;

    return (
        <div style={S.page}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '26px' }}>
                <div>
                    <h1 style={S.pageTitle}>Consultation Requests</h1>
                    <p style={{ ...S.pageSub, marginBottom: 0 }}>Manage your consultation schedule</p>
                </div>
                <button style={styles.setAvailBtn}>Set Availability</button>
            </div>

            {consultations?.length === 0 && (
                <p style={{ color: S.colors.textMuted, fontSize: '13px' }}>No consultations yet.</p>
            )}

            {consultations?.map(c => {
                const status = statuses[c.id] ?? c.status;
                return (
                    <div key={c.id} style={{ ...S.card, marginBottom: '14px' }}>
                        <div style={styles.top}>
                            <div style={styles.typeIcon}>{typeIcon(c.type)}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <div style={styles.title}>{c.topic}</div>
                                    <span style={S.badge(status)}>{status}</span>
                                </div>
                                <div style={styles.detail}><User size={12} /> <span>{c.farmerName}</span></div>
                                <div style={styles.detail}><Calendar size={12} /> <span>{formatDate(c.scheduledAt)}</span></div>
                                <div style={styles.detail}><Clock size={12} /> <span>Duration: 30 minutes</span></div>
                            </div>
                        </div>

                        {status === 'confirmed' ? (
                            <button style={styles.joinBtn}>Join Consultation</button>
                        ) : status === 'pending' ? (
                            <div style={styles.actions}>
                                <button style={S.btn} onClick={() => updateStatus(c.id, 'confirmed')}>Accept</button>
                                <button style={S.btn} onClick={() => updateStatus(c.id, 'rescheduled')}>Reschedule</button>
                                <button style={{ ...S.btn, color: S.colors.red, borderColor: '#ffcdd2' }} onClick={() => updateStatus(c.id, 'declined')}>Decline</button>
                            </div>
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
}

const styles = {
    setAvailBtn: {
        ...S.btn,
        flex: 'none',
        padding: '8px 16px',
        fontSize: '13px',
    },
    top: { display: 'flex', gap: '14px', marginBottom: '14px' },
    typeIcon: {
        width: '34px', height: '34px',
        background: S.colors.greenLight,
        borderRadius: '8px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        marginTop: '2px',
    },
    title: { fontSize: '14px', fontWeight: '600', color: S.colors.text },
    detail: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: S.colors.textMuted, marginBottom: '4px' },
    actions: { display: 'flex', gap: '8px' },
    joinBtn: {
        width: '100%', padding: '9px',
        border: `0.5px solid ${S.colors.border}`,
        borderRadius: '7px', background: 'none',
        fontSize: '13px', cursor: 'pointer',
        color: S.colors.textMuted, fontFamily: "'Lato', sans-serif",
    },
};