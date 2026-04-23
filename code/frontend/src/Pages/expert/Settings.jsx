import { useState, useEffect } from 'react';
import { User, Briefcase, Clock, FileText, Video, Phone, MessageSquare, CheckCircle, Save } from 'lucide-react';
import { useExpertData } from '../../hooks/useExpertData';
import { updateExpertProfile } from '../../services/expertService';
import '../../Styles/expertDashboard.css';

const STORAGE_KEY = 'nagroms_expert_settings';

export default function Settings() {
    const { data: profile, loading, expertId } = useExpertData('settings');
    const [form, setForm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        if (loading) return;
        // Prefer profile from database
        if (profile) {
            setForm({ ...profile });
        } else {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                try { setForm(JSON.parse(stored)); } catch (_) { }
            } else {
                setForm({
                    name: '', specialization: '', experience: '', bio: '',
                    availVideo: true, availPhone: true, availChat: false,
                });
            }
        }
    }, [profile, loading]);

    const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

    const handleSave = async () => {
        setSaving(true);
        try {
            // Save to database
            const { id, ...rest } = form;
            await updateExpertProfile(expertId, rest);
            
            // Sync with local for immediate UI updates elsewhere
            localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
            if (form.name) localStorage.setItem('userName', form.name);
            
            setSaved(true);
        } catch (err) {
            console.error('Failed to save settings:', err);
            // Fallback to local only if DB fails
            localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
            alert('Settings saved locally, but failed to sync with database.');
        }
        setSaving(false);
        setTimeout(() => setSaved(false), 2500);
    };

    if (loading || !form) return (
        <div className="exp-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <div className="exp-spinner" />
        </div>
    );

    const TABS = [
        { id: 'profile',       label: 'Profile',       icon: <User size={15} /> },
        { id: 'availability',  label: 'Availability',  icon: <Clock size={15} /> },
    ];

    return (
        <div className="exp-page">
            <h1 className="exp-title">Settings</h1>
            <p className="exp-subtitle">Manage your expert profile and preferences</p>

            {/* Tabs */}
            <div className="exp-filter-row" style={{ marginTop: 24 }}>
                {TABS.map(t => (
                    <button key={t.id} className={`exp-filter-tab ${activeTab === t.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(t.id)}>
                        {t.icon}{t.label}
                    </button>
                ))}
            </div>

            <div style={{ maxWidth: 680 }}>
                {activeTab === 'profile' && (
                    <div className="exp-card interactive" style={{ marginBottom: 20, animation: 'expFadeInUp 0.4s ease-out' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, color: 'var(--exp-text)', marginBottom: 20 }}>
                            <User size={16} color="var(--exp-green)" /> Expert Profile
                        </div>

                        {/* Avatar preview */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, padding: 16, borderRadius: 12, background: 'var(--exp-green-light)' }}>
                            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--exp-green)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>
                                {form.name ? form.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'EX'}
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--exp-text)' }}>{form.name || 'Your Name'}</div>
                                <div style={{ fontSize: 13, color: 'var(--exp-text-muted)' }}>{form.specialization || 'Specialization'}</div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                            <div className="exp-input-group">
                                <label className="exp-label"><User size={12} /> Full Name</label>
                                <input className="exp-input" value={form.name ?? ''} onChange={e => set('name', e.target.value)} placeholder="Dr. Your Name" />
                            </div>
                            <div className="exp-input-group">
                                <label className="exp-label"><Briefcase size={12} /> Specialization</label>
                                <input className="exp-input" value={form.specialization ?? ''} onChange={e => set('specialization', e.target.value)} placeholder="e.g. Soil Science" />
                            </div>
                            <div className="exp-input-group">
                                <label className="exp-label"><Clock size={12} /> Years of Experience</label>
                                <input type="number" className="exp-input" style={{ width: 100 }} value={form.experience ?? ''} onChange={e => set('experience', e.target.value)} min={0} />
                            </div>
                        </div>

                        <div className="exp-input-group">
                            <label className="exp-label"><FileText size={12} /> Bio</label>
                            <textarea className="exp-input" style={{ minHeight: 100, resize: 'vertical' }}
                                value={form.bio ?? ''} onChange={e => set('bio', e.target.value)}
                                placeholder="Write a short bio about your expertise and experience..." />
                        </div>
                    </div>
                )}

                {activeTab === 'availability' && (
                    <div className="exp-card interactive" style={{ marginBottom: 20, animation: 'expFadeInUp 0.4s ease-out' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, color: 'var(--exp-text)', marginBottom: 20 }}>
                            <Clock size={16} color="var(--exp-green)" /> Consultation Availability
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--exp-text-muted)', marginBottom: 20 }}>
                            Choose which consultation types you're available for. Farmers will only see the options you enable.
                        </p>

                        {[
                            { key: 'availVideo', label: 'Video Consultations', desc: 'Face-to-face video calls with farmers', icon: <Video size={18} color="var(--exp-green)" /> },
                            { key: 'availPhone', label: 'Phone Consultations', desc: 'Voice calls for quick advice', icon: <Phone size={18} color="#1565c0" /> },
                            { key: 'availChat',  label: 'Chat Consultations',  desc: 'Text-based messaging sessions', icon: <MessageSquare size={18} color="#b8860b" /> },
                        ].map(({ key, label, desc, icon }) => (
                            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 12, border: `1px solid ${form[key] ? 'var(--exp-green)' : 'var(--exp-border)'}`, marginBottom: 10, cursor: 'pointer', transition: 'all 0.2s', background: form[key] ? 'var(--exp-green-light)' : 'white' }}
                                onClick={() => set(key, !form[key])}>
                                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--exp-shadow-sm)' }}>{icon}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--exp-text)' }}>{label}</div>
                                    <div style={{ fontSize: 12, color: 'var(--exp-text-muted)' }}>{desc}</div>
                                </div>
                                <div style={{ width: 42, height: 24, borderRadius: 12, background: form[key] ? 'var(--exp-green)' : 'var(--exp-border)', position: 'relative', transition: 'background 0.3s', flexShrink: 0 }}>
                                    <div style={{ position: 'absolute', top: 3, left: form[key] ? 21 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Save button */}
                <button onClick={handleSave} disabled={saving} className={`exp-btn ${saved ? '' : 'exp-btn-primary'}`} style={{ padding: '11px 28px', background: saved ? '#2e7d32' : '', color: 'white' }}>
                    {saved
                        ? <><CheckCircle size={16} /> Settings Saved!</>
                        : saving
                            ? 'Saving...'
                            : <><Save size={15} /> Save Changes</>
                    }
                </button>
                <p style={{ fontSize: 12, color: 'var(--exp-text-muted)', marginTop: 8 }}>
                    Changes are saved locally and will sync when connected to the server.
                </p>
            </div>
        </div>
    );
}
