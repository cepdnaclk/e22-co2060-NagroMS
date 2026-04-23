import { Video, MessageSquare, Phone, TrendingUp, Users, Star, Calendar } from 'lucide-react';
import { useExpertData } from '../../hooks/useExpertData';
import { updateConsultationStatus } from '../../services/expertService';
import * as S from '../../styles/expertStyles';
import '../../styles/expertDashboard.css';
import { useState } from 'react';

const typeIcon = (type) => {
    const p = { size: 15, color: S.colors.green, strokeWidth: 1.8 };
    if (type === 'video') return <Video {...p} />;
    if (type === 'phone') return <Phone {...p} />;
    return <MessageSquare {...p} />;
};

const formatDate = (ts) => {
    if (!ts) return '';
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) +
        ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const timeAgo = (ts) => {
    if (!ts) return '';
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

const statConfig = [
    { key: 'totalConsultations', label: 'Total Consultations', icon: <Calendar size={18} />, color: '#1F5A2E' },
    { key: 'thisMonth',          label: 'This Month',          icon: <TrendingUp size={18} />, color: '#2563eb' },
    { key: 'rating',             label: 'Expert Rating',       icon: <Star size={18} />,      color: '#b8860b', suffix: '/ 5' },
    { key: 'activeFarmers',      label: 'Active Farmers',      icon: <Users size={18} />,     color: '#7c3aed' },
];

export default function ExpertDashboard() {
    const { data, loading, expertId } = useExpertData('overview');
    const [notif, setNotif] = useState(null);

    if (loading) return (
        <div className="exp-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <div className="exp-spinner" />
        </div>
    );

    const { stats, consultations, questions, profile } = data || {};
    const expertName = profile?.name || profile?.fullName || localStorage.getItem('userName') || 'Expert';

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    const updateStatus = async (c, status) => {
        try { 
            // Pass the consultation data so it can be "promoted" from dummy to real if needed
            await updateConsultationStatus(c.id, status, {
                expertId,
                farmerName: c.farmerName,
                topic: c.topic,
                scheduledAt: c.scheduledAt,
                type: c.type
            }); 
            setNotif({ message: `Consultation ${status}!`, type: 'success' });
            setTimeout(() => setNotif(null), 3000);
        } catch (err) {
            console.error('Update failed:', err);
            setNotif({ message: 'Failed to update. Check connection.', type: 'error' });
            setTimeout(() => setNotif(null), 3000);
        }
    };

    return (
        <div className="exp-page">
            {/* Notification Toast */}
            {notif && (
                <div style={{
                    position: 'fixed', top: 20, right: 20, zIndex: 1000,
                    padding: '12px 24px', borderRadius: 12,
                    background: notif.type === 'error' ? 'var(--exp-red)' : 'var(--exp-green)',
                    color: 'white', fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    animation: 'expFadeInDown 0.3s ease-out'
                }}>
                    {notif.message}
                </div>
            )}

            {/* Header */}
            <div className="exp-header">
                <div>
                    <p className="exp-greeting">{greeting} 👋</p>
                    <h1 className="exp-title">{expertName}</h1>
                    <p className="exp-subtitle">Here's what's happening with your farmers today.</p>
                </div>
                <div style={inlineStyles.ratingPill}>
                    <Star size={14} fill="var(--exp-gold)" color="var(--exp-gold)" />
                    <span style={{ fontWeight: 700, color: 'var(--exp-gold)' }}>{stats?.rating?.toFixed(1) ?? '—'}</span>
                    <span style={{ color: 'var(--exp-text-muted)', fontSize: 12 }}>rating</span>
                </div>
            </div>

            {/* Stats */}
            <div className="exp-stats-grid">
                {statConfig.map(({ key, label, icon, color, suffix }) => (
                    <div key={key} className="exp-card interactive exp-stat-card">
                        <div className="exp-stat-icon" style={{ background: color + '18', color }}>
                            {icon}
                        </div>
                        <div className="exp-stat-value" style={{ color }}>
                            <span>{typeof stats?.[key] === 'number' ? stats[key] : stats?.[key] ?? '—'}</span>
                            {suffix && <span className="exp-stat-suffix">{suffix}</span>}
                        </div>
                        <div className="exp-stat-label">{label}</div>
                    </div>
                ))}
            </div>

            <div className="exp-two-col">
                {/* Upcoming Consultations */}
                <div>
                    <div className="exp-section-title">
                        Upcoming Consultations
                        <span className="exp-count-badge">{consultations?.length ?? 0}</span>
                    </div>
                    {consultations?.length === 0 && (
                        <div style={{ color: 'var(--exp-text-muted)', fontSize: 13, padding: '20px 0' }}>No upcoming consultations.</div>
                    )}
                    {consultations?.map(c => {
                        const status = c.status;
                        return (
                            <div key={c.id} className="exp-card interactive exp-list-card">
                                <div className="exp-icon-box">{typeIcon(c.type)}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div className="exp-list-title">{c.topic}</div>
                                    <div className="exp-list-meta">
                                        <span className="exp-meta-item">{c.farmerName}</span>
                                        <span>·</span>
                                        <span className="exp-meta-item">{formatDate(c.scheduledAt)}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                                    <span className={`exp-badge ${status}`}>{status}</span>
                                    {status === 'pending' && (
                                        <div className="exp-action-row">
                                            <button className="exp-btn exp-btn-outline exp-btn-icon" onClick={() => updateStatus(c, 'confirmed')} style={{ color: 'var(--exp-green)', borderColor: 'var(--exp-green)' }}>✓</button>
                                            <button className="exp-btn exp-btn-outline exp-btn-icon" onClick={() => updateStatus(c, 'declined')} style={{ color: 'var(--exp-red)', borderColor: 'var(--exp-red-light)' }}>✕</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Recent Questions */}
                <div>
                    <div className="exp-section-title">
                        Farmer Questions
                        <span className="exp-count-badge">{questions?.length ?? 0}</span>
                    </div>
                    {questions?.length === 0 && (
                        <div style={{ color: 'var(--exp-text-muted)', fontSize: 13, padding: '20px 0' }}>No questions yet.</div>
                    )}
                    {questions?.map(q => (
                        <div key={q.id} className="exp-card interactive" style={{ marginBottom: 12, padding: '18px 22px' }}>
                            <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--exp-text)', marginBottom: 8, lineHeight: 1.5 }}>{q.question}</div>
                            <div className="exp-list-meta" style={{ marginBottom: 0 }}>
                                <span style={{ color: 'var(--exp-green)', fontWeight: 600 }}>{q.farmerName}</span>
                                <span>{timeAgo(q.createdAt)}</span>
                                <span style={{ color: q.replyCount > 0 ? 'var(--exp-green)' : 'var(--exp-text-muted)', fontWeight: 600 }}>
                                    {q.replyCount} {q.replyCount === 1 ? 'reply' : 'replies'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}


const inlineStyles = {
    ratingPill: {
        display: 'flex', alignItems: 'center', gap: 6,
        background: '#fffbea',
        border: '1px solid #f0d060',
        borderRadius: 24,
        padding: '6px 14px',
    }
};