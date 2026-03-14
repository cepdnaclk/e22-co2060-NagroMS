import { useState } from 'react';
import { useExpertData } from '../../hooks/useExpertData';
import { createArticle, updateArticle, deleteArticle } from '../../services/expertService';
import * as S from '../../Styles/expertStyles';
import { FileText, Heart } from 'lucide-react';

const formatDate = (ts) => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toISOString().split('T')[0];
};

export default function KnowledgeBase() {
    const { data: articles, loading, expertId } = useExpertData('knowledge');
    const [localArticles, setLocalArticles] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', content: '' });
    const [saving, setSaving] = useState(false);

    const displayed = localArticles ?? articles ?? [];

    const handleCreate = async () => {
        if (!form.title.trim()) return;
        setSaving(true);
        const ref = await createArticle(expertId, form);
        const newArticle = { id: ref.id, ...form, views: 0, likes: 0, createdAt: { toDate: () => new Date() } };
        setLocalArticles([newArticle, ...displayed]);
        setForm({ title: '', content: '' });
        setShowForm(false);
        setSaving(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this article?')) return;
        await deleteArticle(id);
        setLocalArticles(displayed.filter(a => a.id !== id));
    };

    if (loading) return <div style={{ ...S.page, color: S.colors.textMuted }}>Loading...</div>;

    return (
        <div style={S.page}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '26px' }}>
                <div>
                    <h1 style={S.pageTitle}>Knowledge Base</h1>
                    <p style={{ ...S.pageSub, marginBottom: 0 }}>Share your expertise through articles and guides</p>
                </div>
                <button style={styles.newBtn} onClick={() => setShowForm(!showForm)}>+ New Article</button>
            </div>

            {showForm && (
                <div style={{ ...S.card, marginBottom: '20px' }}>
                    <div style={styles.formLabel}>Article Title</div>
                    <input
                        value={form.title}
                        onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                        placeholder="e.g. Best Practices for Rice Cultivation"
                        style={styles.input}
                    />
                    <div style={{ ...styles.formLabel, marginTop: '12px' }}>Content</div>
                    <textarea
                        value={form.content}
                        onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                        placeholder="Write your article content..."
                        style={{ ...styles.input, minHeight: '100px', resize: 'vertical' }}
                    />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                        <button
                            onClick={handleCreate}
                            disabled={saving}
                            style={{ ...S.btn, flex: 'none', padding: '8px 20px', background: S.colors.green, color: '#fff', border: 'none', borderRadius: '7px' }}
                        >
                            {saving ? 'Saving...' : 'Publish Article'}
                        </button>
                        <button onClick={() => setShowForm(false)} style={{ ...S.btn, flex: 'none', padding: '8px 16px' }}>Cancel</button>
                    </div>
                </div>
            )}

            <div style={styles.grid}>
                {displayed.map(a => (
                    <div key={a.id} style={S.card}>
                        <div style={styles.cardTop}>
                            <div style={styles.articleIcon}><FileText size={15} color={S.colors.green} strokeWidth={1.8} /></div>
                            <div style={{ flex: 1 }}>
                                <div style={styles.articleTitle}>{a.title}</div>
                                <div style={styles.articleDate}>{formatDate(a.createdAt)}</div>
                            </div>
                        </div>
                        <div style={styles.articleStats}>
                            <span>{a.views?.toLocaleString()} views</span>
                            <span style={{ color: '#d32f2f', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Heart size={12} fill="#d32f2f" /> {a.likes}
                            </span>
                        </div>
                        <div style={styles.cardActions}>
                            <button style={{ ...S.btn, color: S.colors.green }}>Edit</button>
                            <button style={{ ...S.btn, color: S.colors.red, borderColor: '#ffcdd2' }} onClick={() => handleDelete(a.id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {displayed.length === 0 && !showForm && (
                <p style={{ color: S.colors.textMuted, fontSize: '13px' }}>No articles yet. Create your first one!</p>
            )}
        </div>
    );
}

const styles = {
    newBtn: { ...S.btn, flex: 'none', padding: '8px 16px', fontSize: '13px' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
    cardTop: { display: 'flex', gap: '10px', marginBottom: '12px' },
    articleIcon: {
        width: '32px', height: '32px',
        background: S.colors.greenLight,
        borderRadius: '7px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
    },
    articleTitle: { fontSize: '13.5px', fontWeight: '600', color: S.colors.text, marginBottom: '3px' },
    articleDate: { fontSize: '11px', color: S.colors.textMuted },
    articleStats: { fontSize: '12px', color: S.colors.textMuted, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
    cardActions: { display: 'flex', gap: '8px' },
    formLabel: { fontSize: '12px', color: S.colors.textMuted, marginBottom: '6px' },
    input: {
        width: '100%',
        border: `0.5px solid ${S.colors.border}`,
        borderRadius: '7px',
        padding: '9px 12px',
        fontSize: '13.5px',
        fontFamily: "'Lato', sans-serif",
        color: S.colors.text,
        outline: 'none',
    },
};