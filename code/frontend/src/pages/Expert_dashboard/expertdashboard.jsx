import { useState, useEffect } from "react";
import { useNavigate, Link, Outlet, useLocation } from "react-router-dom";
import { auth } from "../../utils/firebase";
import { signOut } from "firebase/auth";
import { getDashboardStats } from "../../utils/api";
import { Icon } from "@iconify/react";

export function ExpertLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "Overview",       path: "/expert",                icon: "solar:chart-square-bold-duotone"        },
    { label: "Consultations",  path: "/expert/consultations",  icon: "solar:calendar-bold-duotone"            },
    { label: "Q&A Forum",      path: "/expert/qa-forum",       icon: "solar:chat-round-dots-bold-duotone"     },
    { label: "Knowledge Base", path: "/expert/knowledge-base", icon: "solar:book-bold-duotone"                },
    { label: "My Farmers",     path: "/expert/my-farmers",     icon: "solar:users-group-rounded-bold-duotone" },
    { label: "Settings",       path: "/expert/settings",       icon: "solar:settings-bold-duotone"            },
  ];

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/expert") return location.pathname === "/expert";
    return location.pathname.startsWith(path);
  };

  return (
    <div style={styles.layoutContainer}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarLogo}>
          <span style={styles.logoText}>NagroMS</span>
          <span style={styles.logoRole}>Expert Portal</span>
        </div>
        <nav style={styles.nav}>
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} style={{ ...styles.navItem, ...(isActive(item.path) ? styles.navItemActive : {}) }}>
              <Icon icon={item.icon} width={20} height={20} color={isActive(item.path) ? GREEN : "#888"} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <Icon icon="solar:logout-bold-duotone" width={18} height={18} color="#e53935" />
          Logout
        </button>
      </aside>
      <main style={styles.mainContent}><Outlet /></main>
    </div>
  );
}

export default function ExpertDashboard() {
  const [stats, setStats]                     = useState({ totalConsultations: 0, thisMonth: 0, rating: 0, activeFarmers: 0 });
  const [upcomingConsultations, setUpcoming]  = useState([]);
  const [recentQuestions, setRecentQuestions] = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data.stats);
      setUpcoming(data.upcomingConsultations);
      setRecentQuestions(data.recentQuestions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (ts) => {
    if (!ts) return "—";
    const date = ts._seconds ? new Date(ts._seconds * 1000) : new Date(ts);
    return date.toLocaleString("en-US", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  const timeAgo = (ts) => {
    if (!ts) return "";
    const date = ts._seconds ? new Date(ts._seconds * 1000) : new Date(ts);
    const diff = Math.floor((Date.now() - date) / 60000);
    if (diff < 60) return `${diff} minutes ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`;
    return `${Math.floor(diff / 1440)} days ago`;
  };

  const consultIconMap = {
    video: "solar:videocamera-bold-duotone",
    chat:  "solar:chat-round-dots-bold-duotone",
    phone: "solar:phone-bold-duotone",
  };

  if (loading) return (
    <div style={styles.loadingBox}>
      <Icon icon="solar:refresh-bold-duotone" width={32} color={GREEN} />
      <p>Loading dashboard...</p>
    </div>
  );

  if (error) return (
    <div style={styles.loadingBox}>
      <Icon icon="solar:danger-bold-duotone" width={32} color="#e53935" />
      <p style={{ color: "#e53935" }}>{error}</p>
      <button onClick={fetchData} style={styles.retryBtn}>Retry</button>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Expert Dashboard</h1>
          <p style={styles.pageSubtitle}>Help farmers grow better</p>
        </div>
      </div>

      <div style={styles.statsRow}>
        <StatCard label="Total Consultations" value={stats.totalConsultations} icon="solar:check-circle-bold-duotone" />
        <StatCard label="This Month"          value={stats.thisMonth}          icon="solar:calendar-bold-duotone" />
        <StatCard label="Expert Rating"       value={stats.rating}             icon="solar:star-bold-duotone" />
        <StatCard label="Active Farmers"      value={stats.activeFarmers}      icon="solar:users-group-rounded-bold-duotone" />
      </div>

      <div style={styles.twoCol}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Upcoming Consultations</h2>
            <Link to="/expert/consultations" style={styles.viewAllLink}>View All</Link>
          </div>
          {upcomingConsultations.length === 0 ? <p style={styles.emptyText}>No upcoming consultations.</p> : (
            upcomingConsultations.map((c) => (
              <div key={c.id} style={styles.consultItem}>
                <Icon icon={consultIconMap[c.type] || "solar:calendar-bold-duotone"} width={22} height={22} color={GREEN} style={{ marginTop: 2, flexShrink: 0 }} />
                <div style={styles.consultInfo}>
                  <p style={styles.consultTopic}>{c.topic}</p>
                  <p style={styles.consultMeta}>{c.farmerName}</p>
                  <p style={styles.consultMeta}>{formatDate(c.scheduledAt)}</p>
                </div>
                <span style={{ ...styles.statusBadge, ...(c.status === "confirmed" ? styles.badgeConfirmed : styles.badgePending) }}>{c.status}</span>
              </div>
            ))
          )}
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Recent Questions</h2>
            <Link to="/expert/qa-forum" style={styles.viewAllLink}>View All</Link>
          </div>
          {recentQuestions.length === 0 ? <p style={styles.emptyText}>No questions yet.</p> : (
            recentQuestions.map((q) => (
              <div key={q.id} style={styles.questionItem}>
                <p style={styles.questionText}>{q.question}</p>
                <p style={styles.questionMeta}>{q.farmerName}</p>
                <div style={styles.questionFooter}>
                  <span style={styles.questionTime}>{timeAgo(q.createdAt)}</span>
                  <span style={styles.replyCount}>{q.replyCount ?? 0} replies</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statTop}>
        <span style={styles.statLabel}>{label}</span>
        <Icon icon={icon} width={22} height={22} color={GREEN} />
      </div>
      <p style={styles.statValue}>{value}</p>
    </div>
  );
}

const GREEN = "#2e7d32";
const GREEN_BG = "#f1f8e9";
const styles = {
  layoutContainer: { display: "flex", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif", backgroundColor: "#f5f5f5" },
  sidebar: { width: 220, backgroundColor: "#fff", borderRight: "1px solid #e0e0e0", display: "flex", flexDirection: "column", padding: "24px 0", position: "fixed", top: 0, left: 0, height: "100vh" },
  sidebarLogo: { padding: "0 20px 24px", borderBottom: "1px solid #e0e0e0" },
  logoText: { display: "block", fontSize: 20, fontWeight: 700, color: GREEN },
  logoRole: { fontSize: 12, color: "#888" },
  nav: { flex: 1, padding: "16px 0" },
  navItem: { display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", fontSize: 14, color: "#444", textDecoration: "none", cursor: "pointer", borderLeft: "3px solid transparent" },
  navItemActive: { color: GREEN, backgroundColor: GREEN_BG, borderLeft: `3px solid ${GREEN}`, fontWeight: 600 },
  logoutBtn: { margin: "0 16px", padding: "10px 14px", backgroundColor: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, cursor: "pointer", fontSize: 13, color: "#666", display: "flex", alignItems: "center", gap: 8 },
  mainContent: { marginLeft: 220, flex: 1, padding: "32px", minHeight: "100vh" },
  page: { maxWidth: 960, margin: "0 auto" },
  loadingBox: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 12, color: "#888" },
  retryBtn: { padding: "8px 20px", backgroundColor: GREEN, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14 },
  pageHeader: { marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center" },
  pageTitle: { fontSize: 26, fontWeight: 700, color: GREEN, margin: 0 },
  pageSubtitle: { fontSize: 14, color: "#777", margin: "4px 0 0" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 },
  statCard: { backgroundColor: "#fff", borderRadius: 12, padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" },
  statTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  statLabel: { fontSize: 12, color: "#888" },
  statValue: { fontSize: 32, fontWeight: 700, color: GREEN, margin: 0 },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: 600, color: "#333", margin: 0 },
  viewAllLink: { fontSize: 13, color: GREEN, textDecoration: "none" },
  consultItem: { display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: "1px solid #f0f0f0" },
  consultInfo: { flex: 1 },
  consultTopic: { fontSize: 14, fontWeight: 600, color: "#333", margin: "0 0 2px" },
  consultMeta: { fontSize: 12, color: "#777", margin: 0 },
  statusBadge: { fontSize: 11, padding: "3px 8px", borderRadius: 20, fontWeight: 500, whiteSpace: "nowrap" },
  badgeConfirmed: { backgroundColor: "#e8f5e9", color: GREEN },
  badgePending: { backgroundColor: "#fff3e0", color: "#f57c00" },
  questionItem: { padding: "12px 0", borderBottom: "1px solid #f0f0f0" },
  questionText: { fontSize: 14, fontWeight: 500, color: "#333", margin: "0 0 4px" },
  questionMeta: { fontSize: 12, color: "#777", margin: "0 0 4px" },
  questionFooter: { display: "flex", justifyContent: "space-between" },
  questionTime: { fontSize: 12, color: "#aaa" },
  replyCount: { fontSize: 12, color: GREEN },
  emptyText: { color: "#aaa", fontSize: 14, textAlign: "center", padding: 20 },
};