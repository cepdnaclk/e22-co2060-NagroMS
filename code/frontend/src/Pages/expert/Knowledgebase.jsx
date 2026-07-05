import { useState } from 'react';
import { FileText, Heart, Eye, Plus, Trash2, Edit3, X, ChevronRight } from 'lucide-react';
import { useExpertData } from './hooks/useExpertData';
import { createArticle, deleteArticle } from '../../services/expertService';
import '../../Styles/expertDashboard.css';

const formatDate = (ts) => {
    if (!ts) return '';
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const TOPICS = ['Rice Cultivation', 'Soil Health', 'Pest Control', 'Irrigation', 'Fertilizer', 'Vegetables', 'Other'];

export default function KnowledgeBase() {
    const { data: articles, loading, expertId } = useExpertData('knowledge');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', content: '', topic: '' });
    const [saving, setSaving] = useState(false);
    const [preview, setPreview] = useState(null);

    const displayed = articles ?? [];
    const totalViews = displayed.reduce((s, a) => s + (a.views ?? 0), 0);
    const totalLikes = displayed.reduce((s, a) => s + (a.likes ?? 0), 0);

    const handleCreate = async () => {
        if (!form.title.trim()) return;
        setSaving(true);
        try {
            await createArticle(expertId, form);
            setForm({ title: '', content: '', topic: '' });
            setShowForm(false);
        } catch (err) {
            console.error('Failed to publish article:', err);
            alert('Failed to publish article to the database. Please try again.');
        }
        setSaving(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this article?')) return;
        try { await deleteArticle(id); } catch (_) { }
    };

    if (loading) return (
        <div className="exp-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <div className="exp-spinner" />
        </div>
    );

    return (
        <div className="exp-page">
            <div className="exp-header">
                <div>
                    <h1 className="exp-title">Knowledge Base</h1>
                    <p className="exp-subtitle">Share your expertise through articles and guides</p>
                </div>
                <button className="exp-btn exp-btn-primary" onClick={() => { setShowForm(!showForm); setPreview(null); }}>
                    {showForm ? <><X size={15} /> Cancel</> : <><Plus size={15} /> New Article</>}
                </button>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--exp-green-light)', borderRadius: 14, padding: '14px 24px', marginBottom: 28, width: 'fit-content' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 20px' }}>
                    <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--exp-text)', fontFamily: "'Merriweather', serif" }}>{displayed.length}</span>
                    <span style={{ fontSize: 12, color: 'var(--exp-text-muted)' }}>Articles</span>
                </div>
                <div style={{ width: 1, height: 28, background: 'var(--exp-border)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 20px' }}>
                    <Eye size={14} color="var(--exp-text-muted)" />
                    <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--exp-text)', fontFamily: "'Merriweather', serif" }}>{totalViews.toLocaleString()}</span>
                    <span style={{ fontSize: 12, color: 'var(--exp-text-muted)' }}>Total Views</span>
                </div>
                <div style={{ width: 1, height: 28, background: 'var(--exp-border)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 20px' }}>
                    <Heart size={14} color="var(--exp-red)" />
                    <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--exp-text)', fontFamily: "'Merriweather', serif" }}>{totalLikes}</span>
                    <span style={{ fontSize: 12, color: 'var(--exp-text-muted)' }}>Total Likes</span>
                </div>
            </div>

            {/* New article form */}
            {showForm && (
                <div className="exp-card" style={{ marginBottom: 24, animation: 'expFadeInDown 0.3s ease-out' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--exp-text)', marginBottom: 16 }}>New Article</div>
                    <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
                        <div style={{ flex: 2 }} className="exp-input-group">
                            <label className="exp-label">Title *</label>
                            <input
                                value={form.title}
                                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                placeholder="e.g. Best Practices for Rice Cultivation in Wet Zone"
                                className="exp-input"
                            />
                        </div>
                        <div style={{ flex: 1 }} className="exp-input-group">
                            <label className="exp-label">Topic</label>
                            <select value={form.topic} onChange={e => setForm(p => ({ ...p, topic: e.target.value }))} className="exp-input">
                                <option value="">Select topic...</option>
                                {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="exp-input-group">
                        <label className="exp-label">Content</label>
                        <textarea
                            value={form.content}
                            onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                            placeholder="Write your article content here..."
                            className="exp-input"
                            style={{ minHeight: 120, resize: 'vertical' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
                        <button onClick={() => setShowForm(false)} className="exp-btn exp-btn-outline">Cancel</button>
                        <button onClick={handleCreate} disabled={saving || !form.title.trim()} className="exp-btn exp-btn-primary">
                            {saving ? 'Publishing...' : 'Publish Article'}
                        </button>
                    </div>
                </div>
            )}

            {displayed.length === 0 && !showForm && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '48px 0', color: 'var(--exp-text-muted)', fontSize: 13 }}>
                    <FileText size={36} color="var(--exp-border)" strokeWidth={1.2} />
                    <p>No articles yet. Write your first one!</p>
                    <button className="exp-btn exp-btn-primary" onClick={() => setShowForm(true)}><Plus size={14} /> Create Article</button>
                </div>
            )}

            {/* Article grid */}
            <div className="exp-kb-grid">
                {displayed.map((a) => (
                    <div key={a.id} className="exp-card interactive exp-kb-card">
                        {/* Topic badge */}
                        {a.topic && <div className="exp-kb-topic">{a.topic}</div>}

                        {/* Icon + title */}
                        <div style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                            <div className="exp-icon-box" style={{ width: 32, height: 32 }}>
                                <FileText size={16} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--exp-text)', marginBottom: 3, lineHeight: 1.4 }}>{a.title}</div>
                                <div style={{ fontSize: 11, color: 'var(--exp-text-muted)' }}>{formatDate(a.createdAt)}</div>
                            </div>
                        </div>

                        {/* Content preview */}
                        {a.content && (
                            <p className="exp-kb-preview">
                                {preview === a.id ? a.content : a.content.slice(0, 100) + (a.content.length > 100 ? '…' : '')}
                            </p>
                        )}
                        {a.content?.length > 100 && (
                            <button style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: 'var(--exp-green)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 10, fontWeight: 600 }} onClick={() => setPreview(preview === a.id ? null : a.id)}>
                                {preview === a.id ? 'Show less' : 'Read more'} <ChevronRight size={12} />
                            </button>
                        )}

                        {/* Stats */}
                        <div style={{ display: 'flex', gap: 14, marginTop: 'auto', marginBottom: 14, paddingTop: 12, borderTop: '1px solid var(--exp-border)' }}>
                            <span className="exp-meta-item"><Eye size={12} /> {a.views?.toLocaleString() ?? 0} views</span>
                            <span className="exp-meta-item" style={{ color: 'var(--exp-red)' }}><Heart size={12} fill="var(--exp-red)" /> {a.likes ?? 0}</span>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="exp-btn exp-btn-outline" style={{ flex: 1, padding: '7px 0', color: 'var(--exp-green)' }}><Edit3 size={13} /> Edit</button>
                            <button className="exp-btn exp-btn-outline" onClick={() => handleDelete(a.id)} style={{ flex: 1, padding: '7px 0', color: 'var(--exp-red)', borderColor: 'var(--exp-red-light)' }}><Trash2 size={13} /> Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
