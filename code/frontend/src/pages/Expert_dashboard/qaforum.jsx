import { useState, useEffect } from "react";
import { auth, db } from "../../utils/firebase";
import {
  collection, query, getDocs, doc,
  addDoc, updateDoc, orderBy,
  serverTimestamp, increment,
} from "firebase/firestore";
import { Icon } from "@iconify/react";

const GREEN = "#2e7d32";

export default function QAForum() {
  const [questions, setQuestions]         = useState([]);
  const [loading, setLoading]             = useState(true);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [replyText, setReplyText]         = useState("");
  const [submitting, setSubmitting]       = useState(false);

  useEffect(() => { fetchQuestions(); }, []);

  const fetchQuestions = async () => {
    try {
      const q = query(collection(db, "questions"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setQuestions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (questionId) => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "questions", questionId, "replies"), {
        text: replyText,
        expertId: auth.currentUser?.uid,
        expertName: auth.currentUser?.displayName || "Expert",
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "questions", questionId), {
        replyCount: increment(1),
      });
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId ? { ...q, replyCount: (q.replyCount ?? 0) + 1 } : q
        )
      );
      setReplyText("");
      setActiveQuestion(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const timeAgo = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate?.() || new Date(timestamp);
    const diff = Math.floor((Date.now() - date) / 1000 / 60);
    if (diff < 60) return `${diff} minutes ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`;
    return `${Math.floor(diff / 1440)} days ago`;
  };

  if (loading) {
    return (
      <div style={styles.loadingBox}>
        <Icon icon="solar:refresh-bold-duotone" width={32} color={GREEN} />
        <p>Loading questions...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Q&A Forum</h1>
          <p style={styles.subtitle}>Answer farmer questions and share knowledge</p>
        </div>
        <div style={styles.headerStat}>
          <Icon icon="solar:chat-round-dots-bold-duotone" width={18} color={GREEN} />
          <span style={styles.headerStatText}>{questions.length} questions</span>
        </div>
      </div>

      {questions.length === 0 ? (
        <div style={styles.emptyBox}>
          <Icon icon="solar:chat-round-dots-bold-duotone" width={48} color="#ccc" />
          <p>No questions from farmers yet.</p>
        </div>
      ) : (
        questions.map((q) => (
          <div key={q.id} style={styles.card}>
            <div style={styles.questionRow}>
              <Icon
                icon="solar:question-circle-bold-duotone"
                width={20} height={20} color={GREEN}
                style={{ marginTop: 1, flexShrink: 0 }}
              />
              <h3 style={styles.question}>{q.question}</h3>
            </div>

            <div style={styles.metaRow}>
              <Icon icon="solar:user-bold-duotone" width={13} color="#bbb" />
              <span style={styles.meta}>Asked by {q.farmerName}</span>
              <span style={styles.dot}>•</span>
              <Icon icon="solar:clock-circle-bold-duotone" width={13} color="#bbb" />
              <span style={styles.meta}>{timeAgo(q.createdAt)}</span>
              <span style={styles.dot}>•</span>
              <Icon icon="solar:chat-round-bold-duotone" width={13} color={GREEN} />
              <span style={styles.replyCount}>
                {q.replyCount ?? 0} {(q.replyCount ?? 0) === 1 ? "reply" : "replies"}
              </span>
            </div>

            {activeQuestion === q.id ? (
              <div style={styles.replyBox}>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your expert advice here..."
                  style={styles.textarea}
                  rows={4}
                />
                <div style={styles.replyActions}>
                  <button
                    onClick={() => { setActiveQuestion(null); setReplyText(""); }}
                    style={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReply(q.id)}
                    style={styles.submitBtn}
                    disabled={submitting}
                  >
                    {submitting ? (
                      "Submitting..."
                    ) : (
                      <>
                        <Icon icon="solar:send-bold-duotone" width={15} />
                        Submit Reply
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <button
                style={styles.replyBtn}
                onClick={() => { setActiveQuestion(q.id); setReplyText(""); }}
              >
                <Icon
                  icon={(q.replyCount ?? 0) > 0
                    ? "solar:eye-bold-duotone"
                    : "solar:pen-bold-duotone"}
                  width={14}
                />
                {(q.replyCount ?? 0) > 0 ? "View & Reply" : "Answer Question"}
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: 800, margin: "0 auto" },
  loadingBox: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", height: "60vh", gap: 12, color: "#888",
  },
  header: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 28,
  },
  title:    { fontSize: 26, fontWeight: 700, color: GREEN, margin: 0 },
  subtitle: { fontSize: 14, color: "#777", margin: "4px 0 0" },
  headerStat: {
    display: "flex", alignItems: "center", gap: 6,
    backgroundColor: "#f1f8e9", padding: "8px 14px",
    borderRadius: 20, border: "1px solid #c8e6c9",
  },
  headerStatText: { fontSize: 13, color: GREEN, fontWeight: 500 },
  card: {
    backgroundColor: "#fff", borderRadius: 12, padding: 20,
    marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  questionRow: { display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 },
  question:   { fontSize: 15, fontWeight: 600, color: "#333", margin: 0 },
  metaRow:    { display: "flex", alignItems: "center", gap: 5, marginBottom: 14, flexWrap: "wrap" },
  meta:       { fontSize: 13, color: "#777" },
  dot:        { color: "#ddd" },
  replyCount: { fontSize: 13, color: GREEN, fontWeight: 500 },
  replyBtn: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "8px 16px", border: `1px solid ${GREEN}`,
    borderRadius: 8, backgroundColor: "#fff",
    color: GREEN, cursor: "pointer", fontSize: 13, fontWeight: 500,
  },
  replyBox:  { marginTop: 8 },
  textarea: {
    width: "100%", padding: 12, border: "1px solid #ddd",
    borderRadius: 8, fontSize: 14, fontFamily: "inherit",
    resize: "vertical", boxSizing: "border-box", outline: "none",
  },
  replyActions: {
    display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10,
  },
  cancelBtn: {
    padding: "8px 16px", border: "1px solid #ddd", borderRadius: 8,
    backgroundColor: "#fff", cursor: "pointer", fontSize: 13, color: "#555",
  },
  submitBtn: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "8px 18px", border: "none", borderRadius: 8,
    backgroundColor: GREEN, color: "#fff",
    cursor: "pointer", fontSize: 13, fontWeight: 600,
  },
  emptyBox: {
    textAlign: "center", padding: 60, color: "#aaa",
    backgroundColor: "#fff", borderRadius: 12,
    display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
  },
};