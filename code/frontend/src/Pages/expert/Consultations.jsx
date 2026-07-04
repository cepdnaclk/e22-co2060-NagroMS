import { useState } from 'react';
import { Video, MessageSquare, Phone, Clock, Calendar, User, MapPin, CheckCircle, XCircle, RotateCcw, PlayCircle } from 'lucide-react';
import { useExpertData } from './hooks/useExpertData';
import { updateConsultationStatus } from '../../services/expertService';
import '../../styles/expertDashboard.css';

const typeIcon = (type) => {
    const p = { size: 16, color: 'var(--exp-green)', strokeWidth: 1.8 };
    if (type === 'video') return <Video {...p} />;
    if (type === 'phone') return <Phone {...p} />;
    return <MessageSquare {...p} />;
};

const typeLabel = (type) => {
    if (type === 'video') return 'Video Call';
    if (type === 'phone') return 'Phone Call';
    return 'Chat';
};

const formatDate = (ts) => {
    if (!ts) return '';
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' }) +
        ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const FILTERS = ['all', 'pending', 'confirmed', 'declined', 'rescheduled'];

export default function Consultations() {
    const { data: consultations, loading, expertId } = useExpertData('consultations');
    const [filter, setFilter] = useState('all');

    const updateStatus = async (c, status) => {
        try {
            await updateConsultationStatus(c.id, status, {
                expertId,
                farmerName: c.farmerName,
                topic: c.topic,
                scheduledAt: c.scheduledAt,
                type: c.type,
                district: c.district || ''
            });
        } catch (_) { }
    };

    if (loading) return (
        <div className="exp-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <div className="exp-spinner" />
        </div>
    );

    const list = consultations ?? [];
    const filtered = filter === 'all' ? list : list.filter(c => c.status === filter);
    const pendingCount = list.filter(c => c.status === 'pending').length;

    return (
        <div className="exp-page">
            <div className="exp-header">
                <div>
                    <h1 className="exp-title">Consultations</h1>
                    <p className="exp-subtitle">
                        Manage your schedule · {pendingCount > 0 && <span style={{ color: 'var(--exp-gold)', fontWeight: 600 }}>{pendingCount} awaiting response</span>}
                    </p>
                </div>
            </div>

            {/* Filter tabs */}
            <div className="exp-filter-row">
                {FILTERS.map(f => (
                    <button
                        key={f}
                        className={`exp-filter-tab ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                        {f === 'pending' && pendingCount > 0 && (
                            <span className="exp-filter-dot">{pendingCount}</span>
                        )}
                    </button>
                ))}
            </div>

            {filtered.length === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '48px 0', color: 'var(--exp-text-muted)', fontSize: 13 }}>
                    <Calendar size={36} color="var(--exp-border)" strokeWidth={1.2} />
                    <p>No {filter === 'all' ? '' : filter} consultations.</p>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {filtered.map(c => (
                    <div key={c.id} className="exp-card interactive exp-list-card">
                        <div className="exp-icon-box">{typeIcon(c.type)}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <span className="exp-list-title">{c.topic}</span>
                                <span className={`exp-badge ${c.status}`}>{c.status}</span>
                            </div>
                            <div className="exp-list-meta">
                                <span className="exp-meta-item"><User size={12} />{c.farmerName}</span>
                                <span className="exp-meta-item"><Calendar size={12} />{formatDate(c.scheduledAt)}</span>
                                <span className="exp-meta-item"><Clock size={12} />30 min · {typeLabel(c.type)}</span>
                                {c.district && <span className="exp-meta-item"><MapPin size={12} />{c.district}</span>}
                            </div>

                            <div className="exp-action-row">
                                {c.status === 'confirmed' && (
                                    <button className="exp-btn" style={{ background: 'var(--exp-green-light)', border: '1px solid var(--exp-green)', color: 'var(--exp-green)' }}>
                                        <PlayCircle size={14} /> Join Consultation
                                    </button>
                                )}
                                {c.status === 'pending' && (<>
                                    <button className="exp-btn exp-btn-primary"
                                        onClick={() => updateStatus(c, 'confirmed')}>
                                        <CheckCircle size={13} /> Accept
                                    </button>
                                    <button className="exp-btn exp-btn-outline" style={{ color: 'var(--exp-blue)', borderColor: '#bbdefb' }}
                                        onClick={() => updateStatus(c, 'rescheduled')}>
                                        <RotateCcw size={13} /> Reschedule
                                    </button>
                                    <button className="exp-btn exp-btn-outline" style={{ color: 'var(--exp-red)', borderColor: '#ffcdd2' }}
                                        onClick={() => updateStatus(c, 'declined')}>
                                        <XCircle size={13} /> Decline
                                    </button>
                                </>)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
