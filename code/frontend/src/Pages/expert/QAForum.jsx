import { useState } from 'react';
import { MessageCircle, Clock, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { useExpertData } from './hooks/useExpertData';
import { addAnswer } from '../../services/expertService';
import '../../styles/expertDashboard.css';

const timeAgo = (ts) => {
    if (!ts) return '';
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return `${Math.floor(diff / 86400)} days ago`;
};

const tagColors = ['#e8f5e9', '#e3f2fd', '#fff8e1', '#fce4ec', '#f3e5f5'];
const tagText = ['#1F5A2E', '#1565c0', '#b8860b', '#b73232', '#6a1b9a'];

export default function QAForum() {
    const { data: questions, loading, expertId } = useExpertData('qa');
    const [expanded, setExpanded] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);
    const [filter, setFilter] = useState('all'); // 'all' | 'unanswered'

    const displayed = questions ?? [];
    const filtered = filter === 'unanswered' ? displayed.filter(q => q.replyCount === 0) : displayed;
    const unansweredCount = displayed.filter(q => q.replyCount === 0).length;

    const handleSubmit = async (q) => {
        if (!replyText.trim()) return;
        setSending(true);
        try {
            await addAnswer(q.id, expertId, replyText.trim(), {
                question: q.question,
                farmerName: q.farmerName,
                createdAt: q.createdAt,
                tags: q.tags || [],
                replyCount: q.replyCount || 0
            });
            setReplyText('');
            setExpanded(null);
        } catch (err) {
            console.error('Failed to post answer:', err);
            alert('Failed to post answer to the database. Please try again.');
        }
        setSending(false);
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
                    <h1 className="exp-title">Q&A Forum</h1>
                    <p className="exp-subtitle">
                        Answer farmer questions · {unansweredCount > 0 && (
                            <span style={{ color: 'var(--exp-gold)', fontWeight: 600 }}>{unansweredCount} unanswered</span>
                        )}
                    </p>
                </div>
            </div>

            {/* Filter */}
            <div className="exp-filter-row">
                {['all', 'unanswered'].map(f => (
                    <button key={f} className={`exp-filter-tab ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}>
                        {f === 'all' ? `All Questions (${displayed.length})` : `Unanswered (${unansweredCount})`}
                    </button>
                ))}
            </div>

            {filtered.length === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '48px 0', color: 'var(--exp-text-muted)', fontSize: 13 }}>
                    <MessageCircle size={36} color="var(--exp-border)" strokeWidth={1.2} />
                    <p>No {filter === 'unanswered' ? 'unanswered ' : ''}questions yet.</p>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filtered.map((q, qi) => (
                    <div key={q.id} className="exp-card interactive" style={{ padding: '20px 24px' }}>
                        {/* Question row */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, flexShrink: 0, background: tagColors[qi % tagColors.length], color: tagText[qi % tagText.length] }}>
                                {q.farmerName?.[0] ?? 'F'}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--exp-text)', marginBottom: 8, lineHeight: 1.5 }}>{q.question}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--exp-text-muted)', flexWrap: 'wrap' }}>
                                    <span style={{ fontWeight: 600, color: 'var(--exp-green)' }}>{q.farmerName}</span>
                                    <span style={{ color: 'var(--exp-border)' }}>·</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {timeAgo(q.createdAt)}</span>
                                    <span style={{ color: 'var(--exp-border)' }}>·</span>
                                    <span style={{ color: q.replyCount > 0 ? 'var(--exp-green)' : 'var(--exp-text-muted)', fontWeight: 600 }}>
                                        {q.replyCount} {q.replyCount === 1 ? 'reply' : 'replies'}
                                    </span>
                                </div>
                                {/* Tags */}
                                {q.tags && (
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
                                        {q.tags.map((t, i) => (
                                            <span key={i} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 12, fontWeight: 600, background: tagColors[i % tagColors.length], color: tagText[i % tagText.length] }}>
                                                #{t}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button
                                className="exp-btn exp-btn-outline"
                                style={{ padding: '8px 14px', fontSize: 12.5, color: 'var(--exp-green)', borderColor: 'var(--exp-green)', background: 'var(--exp-green-light)' }}
                                onClick={() => setExpanded(expanded === q.id ? null : q.id)}>
                                {expanded === q.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                {q.replyCount > 0 ? 'View & Reply' : 'Answer'}
                            </button>
                        </div>

                        {/* Reply box */}
                        {expanded === q.id && (
                            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--exp-border)', animation: 'expFadeInDown 0.3s ease-out' }}>
                                <div style={{ fontSize: 12.5, color: 'var(--exp-text-muted)', marginBottom: 8, fontWeight: 600 }}>Your expert answer:</div>
                                <textarea
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                    placeholder="Type a clear, helpful answer for the farmer..."
                                    className="exp-input"
                                    rows={3}
                                />
                                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
                                    <button onClick={() => setExpanded(null)} className="exp-btn exp-btn-outline">Cancel</button>
                                    <button onClick={() => handleSubmit(q)} disabled={sending || !replyText.trim()} className="exp-btn exp-btn-primary">
                                        <Send size={14} /> {sending ? 'Posting...' : 'Post Answer'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
