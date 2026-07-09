import { useState } from 'react';
import { UserPlus, UserCheck, UserX, MapPin, Tractor, ShoppingBag, Clock } from 'lucide-react';
import { useExpertData } from './hooks/useExpertData';
import { acceptConnection, declineConnection } from '../../services/expertService';
import '../../Styles/expertDashboard.css';

const roleIcon = (role) => {
    if (role === 'farmer') return <Tractor size={14} />;
    if (role === 'customer') return <ShoppingBag size={14} />;
    return <UserPlus size={14} />;
};

const roleLabel = (role) => {
    if (role === 'farmer') return 'Farmer';
    if (role === 'customer') return 'Customer';
    return 'User';
};

const timeAgo = (ts) => {
    if (!ts) return '';
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

const initials = (name = '') =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

export default function ConnectionRequests() {
    const { data: connections, loading, expertId } = useExpertData('connections');
    const [filter, setFilter] = useState('pending');
    const [actionId, setActionId] = useState(null);
    const [notif, setNotif] = useState(null);

    const list = connections ?? [];

    const pending = list.filter(c =>
        (c.status === 'connected' || c.status === 'pending') && !c.expertAcknowledged
    );
    const accepted = list.filter(c => c.status === 'accepted');
    const declined = list.filter(c => c.status === 'declined');

    const displayed = filter === 'pending' ? pending
        : filter === 'accepted' ? accepted
        : declined;

    const showToast = (message, type = 'success') => {
        setNotif({ message, type });
        setTimeout(() => setNotif(null), 3000);
    };

    const handleAccept = async (conn) => {
        setActionId(conn.id);
        try {
            await acceptConnection(conn, expertId);
            showToast(`Connected with ${conn.requester?.name || 'user'}!`);
        } catch (err) {
            console.error(err);
            showToast('Failed to accept connection.', 'error');
        }
        setActionId(null);
    };

    const handleDecline = async (conn) => {
        setActionId(conn.id);
        try {
            await declineConnection(conn.id);
            showToast('Connection declined.');
        } catch (err) {
            console.error(err);
            showToast('Failed to decline connection.', 'error');
        }
        setActionId(null);
    };

    if (loading) {
        return (
            <div className="exp-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div className="exp-spinner" />
            </div>
        );
    }

    return (
        <div className="exp-page">
            {notif && (
                <div style={{
                    position: 'fixed', top: 20, right: 20, zIndex: 1000,
                    padding: '12px 24px', borderRadius: 12,
                    background: notif.type === 'error' ? 'var(--exp-red)' : 'var(--exp-green)',
                    color: 'white', fontWeight: 600,
                }}>
                    {notif.message}
                </div>
            )}

            <div className="exp-header">
                <div>
                    <h1 className="exp-title">Connection Requests</h1>
                    <p className="exp-subtitle">
                        Farmers and customers who want to connect with you in real time
                    </p>
                </div>
            </div>

            <div className="exp-filter-row">
                {[
                    { id: 'pending', label: `Pending (${pending.length})` },
                    { id: 'accepted', label: `Accepted (${accepted.length})` },
                    { id: 'declined', label: `Declined (${declined.length})` },
                ].map(f => (
                    <button
                        key={f.id}
                        className={`exp-filter-tab ${filter === f.id ? 'active' : ''}`}
                        onClick={() => setFilter(f.id)}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {displayed.length === 0 && (
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 12, padding: '60px 0', color: 'var(--exp-text-muted)', fontSize: 14,
                }}>
                    <UserPlus size={40} color="var(--exp-border)" strokeWidth={1.2} />
                    <p style={{ fontWeight: 600, color: 'var(--exp-text)' }}>
                        {filter === 'pending' ? 'No pending connection requests' : `No ${filter} connections`}
                    </p>
                    <p style={{ maxWidth: 400, textAlign: 'center', lineHeight: 1.6 }}>
                        {filter === 'pending'
                            ? 'When farmers or customers connect with you from the Community Network, their requests will appear here instantly.'
                            : `You have no ${filter} connections yet.`}
                    </p>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {displayed.map(conn => {
                    const user = conn.requester;
                    const name = user?.name || 'Unknown User';
                    const role = user?.role || 'user';
                    const isPending = filter === 'pending';

                    return (
                        <div key={conn.id} className="exp-card interactive exp-list-card">
                            <div style={{
                                width: 48, height: 48, borderRadius: '50%',
                                background: role === 'farmer' ? '#e8f5e9' : '#e3f2fd',
                                color: role === 'farmer' ? '#1F5A2E' : '#1565c0',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 16, fontWeight: 700, flexShrink: 0,
                            }}>
                                {initials(name)}
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    <span className="exp-list-title">{name}</span>
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 4,
                                        fontSize: 11, padding: '2px 8px', borderRadius: 12,
                                        background: role === 'farmer' ? '#e8f5e9' : '#e3f2fd',
                                        color: role === 'farmer' ? '#1F5A2E' : '#1565c0',
                                        fontWeight: 600,
                                    }}>
                                        {roleIcon(role)} {roleLabel(role)}
                                    </span>
                                </div>
                                <div className="exp-list-meta">
                                    {user?.district && (
                                        <span className="exp-meta-item"><MapPin size={12} />{user.district}</span>
                                    )}
                                    {user?.cropType && (
                                        <span className="exp-meta-item"><Tractor size={12} />{user.cropType}</span>
                                    )}
                                    {user?.businessName && (
                                        <span className="exp-meta-item"><ShoppingBag size={12} />{user.businessName}</span>
                                    )}
                                    <span className="exp-meta-item"><Clock size={12} />{timeAgo(conn.createdAt)}</span>
                                </div>
                            </div>

                            {isPending && (
                                <div className="exp-action-row">
                                    <button
                                        className="exp-btn exp-btn-primary"
                                        disabled={actionId === conn.id}
                                        onClick={() => handleAccept(conn)}
                                    >
                                        <UserCheck size={14} /> Accept
                                    </button>
                                    <button
                                        className="exp-btn exp-btn-outline"
                                        style={{ color: 'var(--exp-red)', borderColor: '#ffcdd2' }}
                                        disabled={actionId === conn.id}
                                        onClick={() => handleDecline(conn)}
                                    >
                                        <UserX size={14} /> Decline
                                    </button>
                                </div>
                            )}

                            {!isPending && (
                                <span className={`exp-badge ${conn.status}`}>{conn.status}</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
