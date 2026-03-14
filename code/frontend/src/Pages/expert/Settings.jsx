import { useState, useEffect } from 'react';
import { useExpertData } from '../../hooks/useExpertData';
import { updateExpertProfile } from '../../services/expertService';
import * as S from '../../Styles/expertStyles';

export default function Settings() {
    const { data: profile, loading, expertId } = useExpertData('settings');
    const [form, setForm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!loading) {
            setForm(profile ? { ...profile } : { name: '', specialization: '', experience: '', bio: '' });
        }
    }, [profile, loading]);

    const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

    const handleSave = async () => {
        setSaving(true);
        const { id, ...rest } = form;
        await updateExpertProfile(expertId, rest);
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    if (loading || !form) return <div style={{ ...S.page, color: S.colors.textMuted }}>Loading...</div>;

    return (
        <div style={S.page}>
            <h1 style={S.pageTitle}>Settings</h1>
            <p style={S.pageSub}>Manage your expert profile and preferences</p>

            <div style={{ ...S.card, maxWidth: '680px' }}>
                <div style={styles.sectionTitle}>Expert Profile</div>

                <div style={styles.fieldGroup}>
                    <label style={styles.label}>Full Name</label>
                    <input style={styles.input} value={form.name ?? ''} onChange={e => set('name', e.target.value)} />
                </div>
                <div style={styles.fieldGroup}>
                    <label style={styles.label}>Specialization</label>
                    <input style={styles.input} value={form.specialization ?? ''} onChange={e => set('specialization', e.target.value)} />
                </div>
                <div style={styles.fieldGroup}>
                    <label style={styles.label}>Years of Experience</label>
                    <input type="number" style={{ ...styles.input, width: '120px' }} value={form.experience ?? ''} onChange={e => set('experience', e.target.value)} />
                </div>
                <div style={styles.fieldGroup}>
                    <label style={styles.label}>Bio</label>
                    <textarea style={{ ...styles.input, minHeight: '90px', resize: 'vertical' }} value={form.bio ?? ''} onChange={e => set('bio', e.target.value)} />
                </div>

                <div style={{ ...styles.sectionTitle, marginTop: '24px' }}>Availability Settings</div>
                {[
                    { key: 'availVideo', label: 'Available for video consultations' },
                    { key: 'availPhone', label: 'Available for phone consultations' },
                    { key: 'availChat', label: 'Available for chat consultations' },
                ].map(({ key, label }) => (
                    <div key={key} style={styles.checkRow}>
                        <input
                            type="checkbox"
                            id={key}
                            checked={form[key] ?? false}
                            onChange={e => set(key, e.target.checked)}
                            style={{ accentColor: S.colors.green, width: '15px', height: '15px' }}
                        />
                        <label htmlFor={key} style={{ fontSize: '13.5px', cursor: 'pointer' }}>{label}</label>
                    </div>
                ))}

                <button onClick={handleSave} disabled={saving} style={styles.saveBtn}>
                    {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
}

const styles = {
    sectionTitle: { fontSize: '15px', fontWeight: '600', color: S.colors.text, marginBottom: '16px' },
    fieldGroup: { marginBottom: '14px' },
    label: { display: 'block', fontSize: '12px', color: S.colors.textMuted, marginBottom: '6px' },
    input: {
        width: '100%',
        border: `0.5px solid ${S.colors.border}`,
        borderRadius: '7px',
        padding: '9px 12px',
        fontSize: '13.5px',
        fontFamily: "'Lato', sans-serif",
        color: S.colors.text,
        outline: 'none',
        background: S.colors.white,
    },
    checkRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' },
    saveBtn: {
        marginTop: '20px',
        padding: '9px 24px',
        background: S.colors.green,
        color: '#fff',
        border: 'none',
        borderRadius: '7px',
        fontSize: '13.5px',
        cursor: 'pointer',
        fontFamily: "'Lato', sans-serif",
    },
};