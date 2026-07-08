import { useState } from 'react';
import { Phone, MessageSquare, MapPin, BarChart2, UserCheck, UserX, Tractor, ShoppingBag } from 'lucide-react';
import { useExpertData } from './hooks/useExpertData';
import '../../Styles/expertDashboard.css';

const initials = (name = '') => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

const avatarColors = [
    { bg: '#e8f5e9', color: '#1F5A2E' },
    { bg: '#e3f2fd', color: '#1565c0' },
    { bg: '#fff8e1', color: '#b8860b' },
    { bg: '#f3e5f5', color: '#6a1b9a' },
];

const roleIcon = (role) => {
    if (role === 'customer') return <ShoppingBag size={11} />;
    return <Tractor size={11} />;
};

export default function MyFarmers() {
    const { data: members, loading } = useExpertData('farmers');
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    if (loading) return (
        <div className="exp-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div className="exp-spinner" />
        </div>
    );

    const list = members ?? [];
    const filtered = list
        .filter(f => {
            if (filter === 'all') return true;
            if (filter === 'farmer') return f.memberRole === 'farmer';
            if (filter === 'customer') return f.memberRole === 'customer';
            return f.status === filter;
        })
        .filter(f =>
            f.name?.toLowerCase().includes(search.toLowerCase()) ||
            f.cropType?.toLowerCase().includes(search.toLowerCase()) ||
            f.district?.toLowerCase().includes(search.toLowerCase())
        );

    const farmerCount = list.filter(f => f.memberRole === 'farmer').length;
    const customerCount = list.filter(f => f.memberRole === 'customer').length;

    return (
        <div className="exp-page">
            <div className="exp-header">
                <div>
                    <h1 className="exp-title">My Network</h1>
                    <p className="exp-subtitle">
                        {farmerCount} farmers · {customerCount} customers connected
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
                <input
                    className="exp-input"
                    style={{ flex: 1, minWidth: 200, padding: '9px 14px' }}
                    placeholder="Search by name, crop, or district..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <div className="exp-filter-row" style={{ marginBottom: 0 }}>
                    {[
                        { id: 'all', label: 'All' },
                        { id: 'farmer', label: 'Farmers' },
                        { id: 'customer', label: 'Customers' },
                    ].map(f => (
                        <button key={f.id} className={`exp-filter-tab ${filter === f.id ? 'active' : ''}`}
                            onClick={() => setFilter(f.id)}>
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {filtered.length === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '48px 0', color: 'var(--exp-text-muted)', fontSize: 13 }}>
                    <UserCheck size={36} color="var(--exp-border)" strokeWidth={1.2} />
                    <p style={{ fontWeight: 600, color: 'var(--exp-text)' }}>No connected members yet</p>
                    <p>Accept connection requests to add farmers and customers to your network.</p>
                </div>
            )}

            <div className="exp-kb-grid">
                {filtered.map((f, i) => {
                    const av = avatarColors[i % avatarColors.length];
                    const role = f.memberRole || 'farmer';
                    return (
                        <div key={f.id} className="exp-card interactive">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                <div style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, flexShrink: 0, background: av.bg, color: av.color }}>
                                    {initials(f.name)}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--exp-text)', marginBottom: 2 }}>{f.name}</div>
                                    <div style={{ fontSize: 12, color: 'var(--exp-text-muted)' }}>
                                        {f.cropType || (role === 'customer' ? 'Customer' : 'Farmer')}
                                    </div>
                                </div>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 700, flexShrink: 0, background: role === 'farmer' ? '#e8f5e9' : '#e3f2fd', color: role === 'farmer' ? '#1F5A2E' : '#1565c0' }}>
                                    {roleIcon(role)} {role === 'customer' ? 'Customer' : 'Farmer'}
                                </span>
                            </div>

                            <div style={{ display: 'flex', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
                                {f.district && <span className="exp-meta-item"><MapPin size={12} />{f.district}</span>}
                                {f.phone && <span className="exp-meta-item"><Phone size={12} />{f.phone}</span>}
                            </div>

                            <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--exp-border)', paddingTop: 12, marginTop: 'auto' }}>
                                {f.phone && (
                                    <a href={`tel:${f.phone}`} className="exp-btn exp-btn-outline" style={{ flex: 1, padding: '7px 0', border: '1px solid var(--exp-border)', textDecoration: 'none', textAlign: 'center' }}>
                                        <Phone size={13} /> Call
                                    </a>
                                )}
                                <button className="exp-btn exp-btn-outline" style={{ flex: 1, padding: '7px 0', border: '1px solid var(--exp-border)' }}>
                                    <MessageSquare size={13} /> Message
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
