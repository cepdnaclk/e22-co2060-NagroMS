import { useState } from 'react';
import { Phone, MessageSquare, MapPin, BarChart2, UserCheck, UserX } from 'lucide-react';
import { useExpertData } from './hooks/useExpertData';
import '../../Styles/expertDashboard.css';

const initials = (name = '') => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

const avatarColors = [
    { bg: '#e8f5e9', color: '#1F5A2E' },
    { bg: '#e3f2fd', color: '#1565c0' },
    { bg: '#fff8e1', color: '#b8860b' },
    { bg: '#f3e5f5', color: '#6a1b9a' },
    { bg: '#fce4ec', color: '#b73232' },
];

export default function MyFarmers() {
    const { data: farmers, loading } = useExpertData('farmers');
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    if (loading) return (
        <div className="exp-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <div className="exp-spinner" />
        </div>
    );

    const list = farmers ?? [];
    const filtered = list
        .filter(f => filter === 'all' || f.status === filter)
        .filter(f => f.name?.toLowerCase().includes(search.toLowerCase()) || f.cropType?.toLowerCase().includes(search.toLowerCase()));

    const activeCount = list.filter(f => f.status === 'active').length;
    const inactiveCount = list.filter(f => f.status !== 'active').length;

    return (
        <div className="exp-page">
            <div className="exp-header">
                <div>
                    <h1 className="exp-title">My Farmers</h1>
                    <p className="exp-subtitle">
                        {activeCount} active · {inactiveCount} inactive
                    </p>
                </div>
            </div>

            {/* Search + filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
                <input
                    className="exp-input"
                    style={{ flex: 1, minWidth: 200, padding: '9px 14px' }}
                    placeholder="Search by name or crop..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <div className="exp-filter-row" style={{ marginBottom: 0 }}>
                    {['all', 'active', 'inactive'].map(f => (
                        <button key={f} className={`exp-filter-tab ${filter === f ? 'active' : ''}`}
                            onClick={() => setFilter(f)}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {filtered.length === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '48px 0', color: 'var(--exp-text-muted)', fontSize: 13 }}>
                    <UserCheck size={36} color="var(--exp-border)" strokeWidth={1.2} />
                    <p>No farmers found.</p>
                </div>
            )}

            <div className="exp-kb-grid">
                {filtered.map((f, i) => {
                    const av = avatarColors[i % avatarColors.length];
                    return (
                        <div key={f.id} className="exp-card interactive">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                <div style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, flexShrink: 0, background: av.bg, color: av.color }}>
                                    {initials(f.name)}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--exp-text)', marginBottom: 2 }}>{f.name}</div>
                                    <div style={{ fontSize: 12, color: 'var(--exp-text-muted)' }}>{f.cropType}</div>
                                </div>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 700, textTransform: 'capitalize', flexShrink: 0, background: f.status === 'active' ? '#e8f5e9' : '#f5f5f5', color: f.status === 'active' ? '#1F5A2E' : '#9e9e9e' }}>
                                    {f.status === 'active' ? <UserCheck size={11} /> : <UserX size={11} />}
                                    {f.status ?? 'active'}
                                </span>
                            </div>

                            <div style={{ display: 'flex', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
                                <span className="exp-meta-item"><MapPin size={12} />{f.location}</span>
                                {f.sessions != null && (
                                    <span className="exp-meta-item"><BarChart2 size={12} />{f.sessions} sessions</span>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--exp-border)', paddingTop: 12, marginTop: 'auto' }}>
                                <button className="exp-btn exp-btn-outline" style={{ flex: 1, padding: '7px 0', border: '1px solid var(--exp-border)' }}><Phone size={13} /> Call</button>
                                <button className="exp-btn exp-btn-outline" style={{ flex: 1, padding: '7px 0', border: '1px solid var(--exp-border)' }}><MessageSquare size={13} /> Message</button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
