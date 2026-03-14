import { Video, MessageSquare, Phone } from 'lucide-react';
import { useExpertData } from '../../hooks/useExpertData';
import { updateConsultationStatus } from '../../services/expertService';
import * as S from '../../Styles/expertStyles';

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

export default function ExpertDashboard() {
    const { data, loading } = useExpertData('overview');

    if (loading) return <div style={{ ...S.page, color: S.colors.textMuted }}>Loading...</div>;

    const { stats, consultations, questions } = data || {};

    return (
        <div style={S.page}>
            <h1 style={S.pageTitle}>Expert Dashboard</h1>
            <p style={S.pageSub}>Help farmers grow better</p>

            {/* Stats Row */}
            <div style={styles.statsRow}>
                {[
                    { label: 'Total Consultations', value: stats?.totalConsultations ?? 0 },
                    { label: 'This Month', value: stats?.thisMonth ?? 0 },
                    { label: 'Expert Rating', value: stats?.rating?.toFixed(1) ?? '—' },
                    { label: 'Active Farmers', value: stats?.activeFarmers ?? 0 },
                ].map(({ label, value }) => (
                    <div key={label} style={{ ...S.card, ...styles.statCard }}>
                        <div style={styles.statLabel}>{label}</div>
                        <div style={styles.statValue}>{value}</div>
                    </div>
                ))}
            </div>

            {/* Upcoming Consultations */}
            <div style={S.sectionTitle}>Upcoming Consultations</div>
            <div style={{ marginBottom: '30px' }}>
                {consultations?.length === 0 && (
                    <p style={{ color: S.colors.textMuted, fontSize: '13px' }}>No upcoming consultations.</p>
                )}
                {consultations?.map(c => (
                    <div key={c.id} style={styles.consultCard}>
                        <div style={styles.typeIcon}>{typeIcon(c.type)}</div>
                        <div style={{ flex: 1 }}>
                            <div style={styles.consultTitle}>{c.topic}</div>
                            <div style={styles.consultMeta}>{c.farmerName} &nbsp;·&nbsp; {formatDate(c.scheduledAt)}</div>
                        </div>
                        <span style={S.badge(c.status)}>{c.status}</span>
                    </div>
                ))}
            </div>

            {/* Recent Questions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={S.sectionTitle}>Recent Questions</div>
            </div>
            {questions?.map(q => (
                <div key={q.id} style={{ ...S.card, marginBottom: '8px' }}>
                    <div style={styles.qTitle}>{q.question}</div>
                    <div style={styles.qMeta}>
                        <span>{q.farmerName}</span>
                        <span style={{ color: q.replyCount > 0 ? S.colors.green : S.colors.textMuted }}>
                            {q.replyCount} {q.replyCount === 1 ? 'reply' : 'replies'}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}

const styles = {
    statsRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        marginBottom: '30px',
    },
    statCard: { display: 'flex', flexDirection: 'column', gap: '8px' },
    statLabel: { fontSize: '12px', color: S.colors.textMuted },
    statValue: { fontSize: '28px', fontWeight: '700', color: S.colors.green, fontFamily: "'Merriweather', Georgia, serif" },
    consultCard: {
        ...S.card,
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        marginBottom: '8px',
    },
    typeIcon: {
        width: '34px', height: '34px',
        background: S.colors.greenLight,
        borderRadius: '8px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
    },
    consultTitle: { fontSize: '14px', fontWeight: '600', marginBottom: '3px', color: S.colors.text },
    consultMeta: { fontSize: '12px', color: S.colors.textMuted },
    qTitle: { fontSize: '13.5px', fontWeight: '500', marginBottom: '6px', color: S.colors.text },
    qMeta: { fontSize: '12px', color: S.colors.textMuted, display: 'flex', justifyContent: 'space-between' },
};