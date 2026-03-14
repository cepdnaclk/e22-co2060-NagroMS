import { useExpertData } from '../../hooks/useExpertData';
import * as S from '../../Styles/expertStyles';

const initials = (name = '') => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

export default function MyFarmers() {
    const { data: farmers, loading } = useExpertData('farmers');

    if (loading) return <div style={{ ...S.page, color: S.colors.textMuted }}>Loading...</div>;

    return (
        <div style={S.page}>
            <h1 style={S.pageTitle}>My Farmers</h1>
            <p style={S.pageSub}>Farmers you are actively supporting</p>

            {farmers?.length === 0 && (
                <p style={{ color: S.colors.textMuted, fontSize: '13px' }}>No farmers linked yet.</p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {farmers?.map(f => (
                    <div key={f.id} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={styles.avatar}>{initials(f.name)}</div>
                        <div style={{ flex: 1 }}>
                            <div style={styles.name}>{f.name}</div>
                            <div style={styles.meta}>{f.cropType} &nbsp;·&nbsp; {f.location}</div>
                        </div>
                        <span style={S.badge(f.status ?? 'confirmed')}>{f.status ?? 'active'}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

const styles = {
    avatar: {
        width: '38px', height: '38px',
        borderRadius: '50%',
        background: S.colors.greenLight,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '13px', fontWeight: '600',
        color: S.colors.green,
        flexShrink: 0,
    },
    name: { fontSize: '14px', fontWeight: '600', color: S.colors.text, marginBottom: '3px' },
    meta: { fontSize: '12px', color: S.colors.textMuted },
};