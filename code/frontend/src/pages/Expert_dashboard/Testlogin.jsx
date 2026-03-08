import { useState } from "react";
import { auth } from "../../utils/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";

const GREEN = "#2e7d32";

export default function TestLogin() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const navigate                = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/expert");
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Allow Enter key to submit
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div style={styles.page}>
      <div style={styles.box}>
        {/* Logo */}
        <div style={styles.logoRow}>
          <Icon icon="solar:leaf-bold-duotone" width={36} color={GREEN} />
          <span style={styles.logoText}>NagroMS</span>
        </div>

        <h2 style={styles.title}>Expert Portal</h2>
        <p style={styles.subtitle}>Sign in to your expert account</p>

        {error && (
          <div style={styles.errorBox}>
            <Icon icon="solar:danger-bold-duotone" width={16} color="#e53935" />
            <span>{error}</span>
          </div>
        )}

        <div style={styles.field}>
          <label style={styles.label}>Email</label>
          <div style={styles.inputRow}>
            <Icon icon="solar:letter-bold-duotone" width={18} color="#aaa" style={styles.inputIcon} />
            <input
              style={styles.input}
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Password</label>
          <div style={styles.inputRow}>
            <Icon icon="solar:lock-bold-duotone" width={18} color="#aaa" style={styles.inputIcon} />
            <input
              style={styles.input}
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        <button
          style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <>
              <Icon icon="solar:refresh-bold-duotone" width={18} />
              Signing in...
            </>
          ) : (
            <>
              <Icon icon="solar:login-bold-duotone" width={18} />
              Sign In
            </>
          )}
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex", alignItems: "center", justifyContent: "center",
    height: "100vh", backgroundColor: "#f1f8e9",
    fontFamily: "'Segoe UI', sans-serif",
  },
  box: {
    backgroundColor: "#fff", borderRadius: 16, padding: "40px 36px",
    width: 380, boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
  },
  logoRow: {
    display: "flex", alignItems: "center", gap: 10,
    marginBottom: 24,
  },
  logoText: { fontSize: 24, fontWeight: 800, color: GREEN },
  title:    { fontSize: 22, fontWeight: 700, color: "#333", margin: "0 0 6px" },
  subtitle: { fontSize: 14, color: "#888", margin: "0 0 24px" },
  errorBox: {
    display: "flex", alignItems: "center", gap: 8,
    backgroundColor: "#ffebee", border: "1px solid #ffcdd2",
    borderRadius: 8, padding: "10px 14px",
    fontSize: 13, color: "#e53935", marginBottom: 16,
  },
  field:  { marginBottom: 16 },
  label:  { display: "block", fontSize: 13, fontWeight: 500, color: "#555", marginBottom: 6 },
  inputRow: {
    display: "flex", alignItems: "center",
    border: "1px solid #ddd", borderRadius: 8,
    padding: "0 12px", gap: 8,
    backgroundColor: "#fafafa",
  },
  inputIcon: { flexShrink: 0 },
  input: {
    flex: 1, padding: "10px 0", border: "none",
    outline: "none", fontSize: 14, backgroundColor: "transparent",
    fontFamily: "inherit", color: "#333",
  },
  btn: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    width: "100%", padding: "12px", backgroundColor: GREEN,
    color: "#fff", border: "none", borderRadius: 8,
    cursor: "pointer", fontSize: 15, fontWeight: 600,
    marginTop: 8,
  },
};
