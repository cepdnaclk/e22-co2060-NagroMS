import { useState } from 'react';
import { useExpertData } from '../../hooks/useExpertData';
import { addAnswer } from '../../services/expertService';
import * as S from '../../Styles/expertStyles';

const timeAgo = (ts) => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
};

export default function QAForum() {
    const { data: questions, loading, expertId } = useExpertData('qa');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);

    const handleSubmit = async (questionId) => {
        if (!replyText.trim()) return;
        setSending(true);
        await addAnswer(questionId, expertId, replyText.trim());
        setReplyText('');
        setReplyingTo(null);
        setSending(false);
    };

    if (loading) return <div style={{ ...S.page, color: S.colors.textMuted }}>Loading...</div>;

    return (
        <div style={S.page}>
            <h1 style={S.pageTitle}>Q&amp;A Forum</h1>
            <p style={S.pageSub}>Answer farmer questions and share knowledge</p>

            {questions?.length === 0 && (
                <p style={{ color: S.colors.textMuted, fontSize: '13px' }}>No questions yet.</p>
            )}

            {questions?.map(q => (
                <div key={q.id} style={{ ...S.card, marginBottom: '10px' }}>
                    <div style={styles.question}>{q.question}</div>
                    <div style={styles.meta}>
                        <span>Asked by {q.farmerName}</span>
                        <span>·</span>
                        <span>{timeAgo(q.createdAt)}</span>
                        <span>·</span>
                        <span style={{ color: q.replyCount > 0 ? S.colors.green : S.colors.textMuted }}>
                            {q.replyCount} {q.replyCount === 1 ? 'reply' : 'replies'}
                        </span>
                    </div>

                    {replyingTo === q.id ? (
                        <div style={styles.replyBox}>
                            <textarea
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                placeholder="Type your expert answer..."
                                style={styles.textarea}
                                rows={3}
                            />
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                <button
                                    onClick={() => handleSubmit(q.id)}
                                    disabled={sending}
                                    style={{ ...styles.forumBtn, background: S.colors.green, color: '#fff', border: 'none' }}
                                >
                                    {sending ? 'Sending...' : 'Post Answer'}
                                </button>
                                <button onClick={() => setReplyingTo(null)} style={styles.forumBtn}>Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <button style={styles.forumBtn} onClick={() => setReplyingTo(q.id)}>
                            {q.replyCount > 0 ? 'View & Reply' : 'Answer Question'}
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}

const styles = {
    question: { fontSize: '14px', fontWeight: '600', color: S.colors.text, marginBottom: '6px' },
    meta: { fontSize: '12px', color: S.colors.textMuted, display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' },
    forumBtn: {
        border: `0.5px solid ${S.colors.green}`,
        color: S.colors.green,
        background: 'none',
        borderRadius: '7px',
        padding: '6px 14px',
        fontSize: '12px',
        cursor: 'pointer',
        fontFamily: "'Lato', sans-serif",
    },
    replyBox: { marginTop: '10px' },
    textarea: {
        width: '100%',
        border: `0.5px solid ${S.colors.border}`,
        borderRadius: '7px',
        padding: '10px 12px',
        fontSize: '13.5px',
        fontFamily: "'Lato', sans-serif",
        resize: 'vertical',
        color: S.colors.text,
        outline: 'none',
    },
};