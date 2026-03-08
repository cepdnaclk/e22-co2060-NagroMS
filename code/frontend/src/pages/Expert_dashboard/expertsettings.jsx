import { useState, useEffect } from "react";
import { auth, db } from "../../utils/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { Icon } from "@iconify/react";

const GREEN = "#2e7d32";

export default function ExpertSettings() {
  const [form, setForm] = useState({
    fullName: "", specialization: "", yearsOfExperience: "", bio: "",
    availableVideo: true, availablePhone: true, availableChat: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const expertId = auth.currentUser?.uid;

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const docSnap = await getDoc(doc(db, "users", expertId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setForm({
          fullName: data.name || auth.currentUser?.displayName || "",
          specialization: data.specialization || "",
          yearsOfExperience: data.yearsOfExperience || "",
          bio: data.bio || "",
          availableVideo: data.availableVideo ?? true,
          availablePhone: data.availablePhone ?? true,
          availableChat:  data.availableChat  ?? true,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", expertId), {
        name: form.fullName,
        specialization: form.specialization,
        yearsOfExperience: Number(form.yearsOfExperience),
        bio: form.bio,
        availableVideo: form.availableVideo,
        availablePhone: form.availablePhone,
        availableChat:  form.availableChat,
      });
      await updateProfile(auth.currentUser, { displayName: form.fullName });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const availabilityOptions = [
    { key: "availableVideo", label: "Available for video consultations", icon: "solar:videocamera-bold-duotone" },
    { key: "availablePhone", label: "Available for phone consultations", icon: "solar:phone-bold-duotone"       },
    { key: "availableChat",  label: "Available for chat consultations",  icon: "solar:chat-round-dots-bold-duotone" },
  ];

  if (loading) {
    return (
      <div style={styles.loadingBox}>
        <Icon icon="solar:refresh-bold-duotone" width={32} color={GREEN} />
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Settings</h1>
        <p style={styles.subtitle}>Manage your expert profile and preferences</p>
      </div>

      <div style={styles.card}>
        {/* Profile Section */}
        <div style={styles.sectionHeader}>
          <Icon icon="solar:user-bold-duotone" width={20} color={GREEN} />
          <h2 style={styles.sectionTitle}>Expert Profile</h2>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>
            <Icon icon="solar:user-id-bold-duotone" width={14} color="#888" />
            Full Name
          </label>
          <input
            style={styles.input}
            value={form.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            placeholder="Dr. Your Name"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>
            <Icon icon="solar:diploma-bold-duotone" width={14} color="#888" />
            Specialization
          </label>
          <input
            style={styles.input}
            value={form.specialization}
            onChange={(e) => handleChange("specialization", e.target.value)}
            placeholder="e.g. Rice Cultivation & Pest Management"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>
            <Icon icon="solar:calendar-bold-duotone" width={14} color="#888" />
            Years of Experience
          </label>
          <input
            style={styles.input}
            type="number" min={0}
            value={form.yearsOfExperience}
            onChange={(e) => handleChange("yearsOfExperience", e.target.value)}
            placeholder="e.g. 25"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>
            <Icon icon="solar:document-text-bold-duotone" width={14} color="#888" />
            Bio
          </label>
          <textarea
            style={{ ...styles.input, minHeight: 100, resize: "vertical" }}
            value={form.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            placeholder="Brief description of your expertise..."
          />
        </div>

        {/* Availability Section */}
        <div style={styles.availabilitySection}>
          <div style={styles.sectionHeader}>
            <Icon icon="solar:clock-circle-bold-duotone" width={20} color={GREEN} />
            <h3 style={styles.availTitle}>Availability Settings</h3>
          </div>

          {availabilityOptions.map(({ key, label, icon }) => (
            <label key={key} style={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={form[key]}
                onChange={(e) => handleChange(key, e.target.checked)}
                style={styles.checkbox}
              />
              <Icon icon={icon} width={16} color={form[key] ? GREEN : "#bbb"} />
              <span style={styles.checkboxLabel}>{label}</span>
            </label>
          ))}
        </div>

        {/* Save Row */}
        <div style={styles.saveRow}>
          {saved && (
            <div style={styles.savedMsg}>
              <Icon icon="solar:check-circle-bold-duotone" width={16} color={GREEN} />
              Changes saved successfully!
            </div>
          )}
          <button style={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? (
              "Saving..."
            ) : (
              <>
                <Icon icon="solar:diskette-bold-duotone" width={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: 700, margin: "0 auto" },
  loadingBox: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", height: "60vh", gap: 12, color: "#888",
  },
  header:   { marginBottom: 28 },
  title:    { fontSize: 26, fontWeight: 700, color: GREEN, margin: 0 },
  subtitle: { fontSize: 14, color: "#777", margin: "4px 0 0" },
  card: {
    backgroundColor: "#fff", borderRadius: 12, padding: 28,
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  sectionHeader: {
    display: "flex", alignItems: "center", gap: 8, marginBottom: 20,
  },
  sectionTitle: { fontSize: 17, fontWeight: 600, color: "#333", margin: 0 },
  field: { marginBottom: 18 },
  label: {
    display: "flex", alignItems: "center", gap: 5,
    fontSize: 13, fontWeight: 500, color: "#555", marginBottom: 6,
  },
  input: {
    width: "100%", padding: "10px 12px", border: "1px solid #ddd",
    borderRadius: 8, fontSize: 14, fontFamily: "inherit",
    boxSizing: "border-box", outline: "none", color: "#333",
  },
  availabilitySection: {
    borderTop: "1px solid #f0f0f0", paddingTop: 20, marginTop: 8, marginBottom: 20,
  },
  availTitle: { fontSize: 15, fontWeight: 600, color: "#333", margin: 0 },
  checkboxRow: {
    display: "flex", alignItems: "center", gap: 10,
    marginBottom: 12, cursor: "pointer",
  },
  checkbox: { width: 16, height: 16, accentColor: GREEN, cursor: "pointer" },
  checkboxLabel: { fontSize: 14, color: "#444" },
  saveRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    borderTop: "1px solid #f0f0f0", paddingTop: 20,
  },
  savedMsg: {
    display: "flex", alignItems: "center", gap: 6,
    fontSize: 13, color: GREEN,
  },
  saveBtn: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "10px 24px", border: "none", borderRadius: 8,
    backgroundColor: GREEN, color: "#fff",
    cursor: "pointer", fontSize: 14, fontWeight: 600,
  },
};