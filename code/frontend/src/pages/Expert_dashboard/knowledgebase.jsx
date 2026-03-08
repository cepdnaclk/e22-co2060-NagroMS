import { useState, useEffect } from "react";
import { auth, db } from "../../utils/firebase";
import {
  collection, query, where, getDocs,
  addDoc, updateDoc, deleteDoc, doc,
  serverTimestamp, orderBy,
} from "firebase/firestore";
import { Icon } from "@iconify/react";

const GREEN = "#2e7d32";

export default function KnowledgeBase() {
  const [articles, setArticles]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [showForm, setShowForm]           = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [form, setForm]                   = useState({ title: "", content: "", category: "" });
  const [submitting, setSubmitting]       = useState(false);
  const expertId = auth.currentUser?.uid;

  useEffect(() => { fetchArticles(); }, []);

  const fetchArticles = async () => {
    try {
      const q = query(
        collection(db, "articles"),
        where("expertId", "==", expertId),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      setArticles(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    setSubmitting(true);
    try {
      if (editingArticle) {
        await updateDoc(doc(db, "articles", editingArticle.id), {
          title: form.title, content: form.content,
          category: form.category, updatedAt: serverTimestamp(),
        });
        setArticles((prev) =>
          prev.map((a) => (a.id === editingArticle.id ? { ...a, ...form } : a))
        );
      } else {
        const docRef = await addDoc(collection(db, "articles"), {
          title: form.title, content: form.content,
          category: form.category, expertId,
          expertName: auth.currentUser?.displayName || "Expert",
          createdAt: serverTimestamp(), views: 0, likes: 0,
        });
        setArticles((prev) => [{
          id: docRef.id, ...form, expertId, views: 0, likes: 0,
          createdAt: { toDate: () => new Date() },
        }, ...prev]);
      }
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this article?")) return;
    try {
      await deleteDoc(doc(db, "articles", id));
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (article) => {
    setEditingArticle(article);
    setForm({ title: article.title, content: article.content, category: article.category || "" });
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({ title: "", content: "", category: "" });
    setShowForm(false);
    setEditingArticle(null);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate?.() || new Date(timestamp);
    return date.toISOString().split("T")[0];
  };

  if (loading) {
    return (
      <div style={styles.loadingBox}>
        <Icon icon="solar:refresh-bold-duotone" width={32} color={GREEN} />
        <p>Loading articles...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Knowledge Base</h1>
          <p style={styles.subtitle}>Share your expertise through articles and guides</p>
        </div>
        <button style={styles.newBtn} onClick={() => { resetForm(); setShowForm(true); }}>
          <Icon icon="solar:add-circle-bold-duotone" width={18} />
          New Article
        </button>
      </div>

      {/* Article Form */}
      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>
            <Icon icon={editingArticle ? "solar:pen-bold-duotone" : "solar:document-add-bold-duotone"} width={18} color={GREEN} />
            {editingArticle ? "Edit Article" : "New Article"}
          </h3>
          <input
            style={styles.input}
            placeholder="Article title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            style={styles.input}
            placeholder="Category (e.g. Rice, Pest Control)"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <textarea
            style={{ ...styles.input, minHeight: 120, resize: "vertical" }}
            placeholder="Write your article content..."
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
          <div style={styles.formActions}>
            <button style={styles.cancelBtn} onClick={resetForm}>Cancel</button>
            <button style={styles.saveBtn} onClick={handleSave} disabled={submitting}>
              {submitting ? "Saving..." : (
                <>
                  <Icon icon="solar:check-circle-bold-duotone" width={15} />
                  {editingArticle ? "Update" : "Publish"}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Articles Grid */}
      {articles.length === 0 && !showForm ? (
        <div style={styles.emptyBox}>
          <Icon icon="solar:book-bold-duotone" width={48} color="#ccc" />
          <p>No articles yet. Click "New Article" to share your knowledge!</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {articles.map((article) => (
            <div key={article.id} style={styles.articleCard}>
              <Icon
                icon="solar:document-text-bold-duotone"
                width={32} height={32} color={GREEN}
                style={{ flexShrink: 0 }}
              />
              <div style={styles.articleBody}>
                <h3 style={styles.articleTitle}>{article.title}</h3>
                {article.category && (
                  <span style={styles.categoryTag}>{article.category}</span>
                )}
                <p style={styles.articleDate}>{formatDate(article.createdAt)}</p>
                <div style={styles.articleStats}>
                  <span style={styles.statItem}>
                    <Icon icon="solar:eye-bold-duotone" width={13} color="#aaa" />
                    {article.views ?? 0} views
                  </span>
                  <span style={styles.statItem}>
                    <Icon icon="solar:heart-bold-duotone" width={13} color="#e57373" />
                    {article.likes ?? 0} likes
                  </span>
                </div>
                <div style={styles.articleActions}>
                  <button style={styles.editBtn} onClick={() => handleEdit(article)}>
                    <Icon icon="solar:pen-bold-duotone" width={13} />
                    Edit
                  </button>
                  <button style={styles.deleteBtn} onClick={() => handleDelete(article.id)}>
                    <Icon icon="solar:trash-bin-trash-bold-duotone" width={13} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: 900, margin: "0 auto" },
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
  newBtn: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "10px 18px", backgroundColor: GREEN, color: "#fff",
    border: "none", borderRadius: 8, cursor: "pointer",
    fontSize: 14, fontWeight: 600,
  },
  formCard: {
    backgroundColor: "#fff", borderRadius: 12, padding: 24,
    marginBottom: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  formTitle: {
    display: "flex", alignItems: "center", gap: 8,
    fontSize: 16, fontWeight: 600, color: "#333", marginBottom: 16,
  },
  input: {
    display: "block", width: "100%", padding: 10,
    border: "1px solid #ddd", borderRadius: 8, fontSize: 14,
    marginBottom: 12, fontFamily: "inherit",
    boxSizing: "border-box", outline: "none",
  },
  formActions: { display: "flex", justifyContent: "flex-end", gap: 10 },
  cancelBtn: {
    padding: "9px 18px", border: "1px solid #ddd", borderRadius: 8,
    backgroundColor: "#fff", cursor: "pointer", fontSize: 13,
  },
  saveBtn: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "9px 18px", border: "none", borderRadius: 8,
    backgroundColor: GREEN, color: "#fff",
    cursor: "pointer", fontSize: 13, fontWeight: 600,
  },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  articleCard: {
    backgroundColor: "#fff", borderRadius: 12, padding: 20,
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    display: "flex", gap: 14, alignItems: "flex-start",
  },
  articleBody:  { flex: 1 },
  articleTitle: { fontSize: 15, fontWeight: 600, color: "#333", margin: "0 0 6px" },
  categoryTag: {
    display: "inline-block", fontSize: 11, padding: "2px 8px",
    backgroundColor: "#f1f8e9", color: GREEN,
    borderRadius: 20, marginBottom: 6,
  },
  articleDate: { fontSize: 12, color: "#aaa", margin: "0 0 8px" },
  articleStats: { display: "flex", gap: 12, marginBottom: 12 },
  statItem: {
    display: "flex", alignItems: "center", gap: 4,
    fontSize: 12, color: "#777",
  },
  articleActions: { display: "flex", gap: 10 },
  editBtn: {
    display: "flex", alignItems: "center", gap: 4,
    padding: "6px 14px", border: `1px solid ${GREEN}`,
    borderRadius: 6, backgroundColor: "#fff",
    color: GREEN, cursor: "pointer", fontSize: 12, fontWeight: 500,
  },
  deleteBtn: {
    display: "flex", alignItems: "center", gap: 4,
    padding: "6px 14px", border: "1px solid #ddd",
    borderRadius: 6, backgroundColor: "#fff",
    color: "#e53935", cursor: "pointer", fontSize: 12,
  },
  emptyBox: {
    textAlign: "center", padding: 60, color: "#aaa",
    backgroundColor: "#fff", borderRadius: 12,
    display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
  },
};