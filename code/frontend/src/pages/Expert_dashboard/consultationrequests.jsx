import { useState, useEffect } from "react";
import { auth, db } from "../../utils/firebase";
import {
  collection, query, where,
  getDocs, doc, updateDoc, orderBy,
} from "firebase/firestore";
import { Icon } from "@iconify/react";

const GREEN    = "#2e7d32";
const GREEN_BG = "#f1f8e9";

export default function ConsultationRequests() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const expertId = auth.currentUser?.uid;

  useEffect(() => { fetchConsultations(); }, []);

  const fetchConsultations = async () => {
    try {
      const q = query(
        collection(db, "consultations"),
        where("expertId", "==", expertId),
        orderBy("scheduledAt", "asc")
      );
      const snap = await getDocs(q);
      setConsultations(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    setActionLoading(id + newStatus);
    try {
      await updateDoc(doc(db, "consultations", id), { status: newStatus });
      setConsultations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "—";
    const date = timestamp.toDate?.() || new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const typeIconMap = {
    video: "solar:videocamera-bold-duotone",
    chat:  "solar:chat-round-dots-bold-duotone",
    phone: "solar:phone-bold-duotone",
  };

  if (loading) {
    return (
      <div style={styles.loadingBox}>
        <Icon icon="solar:refresh-bold-duotone" width={32} color={GREEN} />
        <p>Loading consultations...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Consultation Requests</h1>
          <p style={styles.subtitle}>Manage your consultation schedule</p>
        </div>
        <button style={styles.availBtn}>
          <Icon icon="solar:clock-circle-bold-duotone" width={16} />
          Set Availability
        </button>
      </div>

      {consultations.length === 0 ? (
        <div style={styles.emptyBox}>
          <Icon icon="solar:calendar-bold-duotone" width={48} color="#ccc" />
          <p>No consultation requests yet.</p>
        </div>
      ) : (
        consultations.map((c) => (
          <div key={c.id} style={styles.card}>
            <div style={styles.cardTop}>
              <div style={styles.topLeft}>
                <Icon
                  icon={typeIconMap[c.type] || "solar:calendar-bold-duotone"}
                  width={26} height={26} color={GREEN}
                  style={{ marginTop: 2, flexShrink: 0 }}
                />
                <div>
                  <p style={styles.topic}>{c.topic}</p>
                  <div style={styles.metaRow}>
                    <Icon icon="solar:user-bold-duotone" width={13} color="#aaa" />
                    <span style={styles.meta}>{c.farmerName}</span>
                  </div>
                  <div style={styles.metaRow}>
                    <Icon icon="solar:calendar-bold-duotone" width={13} color="#aaa" />
                    <span style={styles.meta}>{formatDate(c.scheduledAt)}</span>
                  </div>
                  <div style={styles.metaRow}>
                    <Icon icon="solar:clock-circle-bold-duotone" width={13} color="#aaa" />
                    <span style={styles.meta}>Duration: {c.duration || 30} minutes</span>
                  </div>
                </div>
              </div>
              <span style={{
                ...styles.badge,
                ...(c.status === "confirmed" ? styles.badgeConfirmed
                  : c.status === "declined"  ? styles.badgeDeclined
                  : styles.badgePending),
              }}>
                {c.status}
              </span>
            </div>

            <div style={styles.actions}>
              {c.status === "confirmed" ? (
                <button style={styles.joinBtn}>
                  <Icon icon="solar:videocamera-bold-duotone" width={16} />
                  Join Consultation
                </button>
              ) : c.status === "pending" ? (
                <>
                  <button
                    style={styles.acceptBtn}
                    onClick={() => updateStatus(c.id, "confirmed")}
                    disabled={!!actionLoading}
                  >
                    {actionLoading === c.id + "confirmed" ? "..." : "Accept"}
                  </button>
                  <button
                    style={styles.rescheduleBtn}
                    onClick={() => updateStatus(c.id, "rescheduled")}
                    disabled={!!actionLoading}
                  >
                    Reschedule
                  </button>
                  <button
                    style={styles.declineBtn}
                    onClick={() => updateStatus(c.id, "declined")}
                    disabled={!!actionLoading}
                  >
                    {actionLoading === c.id + "declined" ? "..." : "Decline"}
                  </button>
                </>
              ) : (
                <span style={styles.statusNote}>
                  {c.status === "declined"
                    ? "Consultation declined"
                    : "Rescheduled — awaiting confirmation"}
                </span>
              )}
            </div>
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
  availBtn: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "10px 16px", border: "1px solid #ccc",
    borderRadius: 8, backgroundColor: "#fff",
    cursor: "pointer", fontSize: 13, color: "#555",
  },
  card: {
    backgroundColor: "#fff", borderRadius: 12, padding: 20,
    marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  cardTop: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 16,
  },
  topLeft:  { display: "flex", gap: 14, alignItems: "flex-start" },
  topic:    { fontSize: 16, fontWeight: 600, color: "#333", margin: "0 0 6px" },
  metaRow:  { display: "flex", alignItems: "center", gap: 5, marginBottom: 3 },
  meta:     { fontSize: 13, color: "#666" },
  badge:    { fontSize: 12, padding: "4px 12px", borderRadius: 20, fontWeight: 500 },
  badgeConfirmed: { backgroundColor: "#e8f5e9", color: GREEN },
  badgePending:   { backgroundColor: "#fff3e0", color: "#f57c00" },
  badgeDeclined:  { backgroundColor: "#ffebee", color: "#c62828" },
  actions: {
    display: "flex", gap: 12,
    borderTop: "1px solid #f0f0f0", paddingTop: 14,
  },
  acceptBtn: {
    flex: 1, padding: "10px", border: "1px solid #ccc", borderRadius: 8,
    backgroundColor: "#fff", cursor: "pointer", fontSize: 14, color: "#333",
  },
  rescheduleBtn: {
    flex: 1, padding: "10px", border: "1px solid #ccc", borderRadius: 8,
    backgroundColor: "#fff", cursor: "pointer", fontSize: 14, color: "#333",
  },
  declineBtn: {
    flex: 1, padding: "10px", border: "1px solid #ffcdd2", borderRadius: 8,
    backgroundColor: "#fff", cursor: "pointer", fontSize: 14, color: "#e53935",
  },
  joinBtn: {
    flex: 1, padding: "10px", border: "none", borderRadius: 8,
    backgroundColor: GREEN, color: "#fff", cursor: "pointer",
    fontSize: 14, fontWeight: 600,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  },
  statusNote: { fontSize: 13, color: "#aaa", fontStyle: "italic" },
  emptyBox: {
    textAlign: "center", padding: 60, color: "#aaa",
    backgroundColor: "#fff", borderRadius: 12,
    display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
  },
};