"use client";

import { useEffect, useRef, useState } from "react";
import { KeyRound, Eye, EyeOff, X } from "lucide-react";

interface CurrentUser {
  id: number;
  name: string;
  email: string;
  department: string;
}

export default function Header() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const openChangePassword = () => {
    setMenuOpen(false);
    setShowChangePassword(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
  };

  const closeChangePassword = () => {
    setShowChangePassword(false);
  };

  const submitChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to update password");
      } else {
        setSuccess("Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setError("Server error. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.header}>
      <div style={{ flex: 1 }} />

      <div style={styles.profileWrap} ref={menuRef}>
        <button style={styles.profileBtn} onClick={() => setMenuOpen((v) => !v)}>
          <span style={styles.avatar}>{user.name.charAt(0).toUpperCase()}</span>
          <span style={styles.profileText}>
            <span style={styles.profileName}>{user.name}</span>
            <span style={styles.profileDept}>{user.department}</span>
          </span>
          <span style={{ fontSize: 10, color: "#9ca3af" }}>▼</span>
        </button>

        {menuOpen && (
          <div style={styles.dropdown}>
            <div style={styles.dropdownHeader}>
              <div style={{ fontWeight: 600, color: "#111827" }}>{user.name}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{user.email}</div>
              <div style={styles.deptBadge}>{user.department}</div>
            </div>
            <button style={styles.dropdownItem} onClick={openChangePassword}>
              Change Password
            </button>
            <a href="/logout" style={{ ...styles.dropdownItem, ...styles.logoutItem }}>
              Logout
            </a>
          </div>
        )}
      </div>

      {showChangePassword && (
        <div style={styles.modalOverlay} onClick={closeChangePassword}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalHeaderLeft}>
                <div style={styles.modalIconBadge}>
                  <KeyRound size={20} color="#fff" />
                </div>
                <h3 style={styles.modalTitle}>Change Password</h3>
              </div>
              <button style={styles.closeBtn} onClick={closeChangePassword} type="button">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submitChangePassword}>
              {error && <div style={styles.error}>{error}</div>}
              {success && <div style={styles.success}>{success}</div>}

              <label style={styles.label}>Current Password</label>
              <div style={styles.inputWrap}>
                <input
                  type={showCurrent ? "text" : "password"}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={styles.input}
                />
                <button
                  type="button"
                  style={styles.eyeBtn}
                  onClick={() => setShowCurrent((v) => !v)}
                  tabIndex={-1}
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <label style={styles.label}>New Password</label>
              <div style={styles.inputWrap}>
                <input
                  type={showNew ? "text" : "password"}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={styles.input}
                />
                <button
                  type="button"
                  style={styles.eyeBtn}
                  onClick={() => setShowNew((v) => !v)}
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <label style={styles.label}>Confirm New Password</label>
              <div style={styles.inputWrap}>
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={styles.input}
                />
                <button
                  type="button"
                  style={styles.eyeBtn}
                  onClick={() => setShowConfirm((v) => !v)}
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={closeChangePassword}
                  style={styles.cancelBtn}
                >
                  Close
                </button>
                <button type="submit" disabled={saving} style={styles.saveBtn}>
                  {saving && <span style={styles.spinner} />}
                  {saving ? "Saving..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: "flex",
    alignItems: "center",
    height: 64,
    padding: "0 24px",
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
    position: "sticky",
    top: 0,
    zIndex: 50,
  },
  profileWrap: {
    position: "relative",
  },
  profileBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "6px 10px",
    borderRadius: 10,
    transition: "background 0.15s",
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #2563eb, #9333ea)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
    fontSize: 14,
    boxShadow: "0 2px 8px rgba(37,99,235,0.35)",
  },
  profileText: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    lineHeight: 1.2,
  },
  profileName: {
    fontSize: 13,
    fontWeight: 600,
    color: "#111827",
  },
  profileDept: {
    fontSize: 11,
    color: "#6b7280",
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: "120%",
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    boxShadow: "0 12px 32px rgba(15,23,42,0.15)",
    width: 220,
    overflow: "hidden",
  },
  dropdownHeader: {
    padding: "12px 14px",
    borderBottom: "1px solid #f3f4f6",
  },
  deptBadge: {
    display: "inline-block",
    marginTop: 6,
    fontSize: 11,
    fontWeight: 600,
    color: "#2563eb",
    background: "#eff6ff",
    padding: "2px 8px",
    borderRadius: 999,
  },
  dropdownItem: {
    display: "block",
    width: "100%",
    textAlign: "left",
    padding: "10px 14px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    color: "#111827",
  },
  logoutItem: {
    textDecoration: "none",
    color: "#dc2626",
    fontWeight: 600,
    borderTop: "1px solid #f3f4f6",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.5)",
    backdropFilter: "blur(2px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: 20,
  },
  modal: {
    background: "#fff",
    borderRadius: 20,
    padding: 26,
    width: 400,
    maxWidth: "100%",
    boxShadow: "0 24px 60px rgba(15,23,42,0.25)",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  modalIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: "linear-gradient(135deg, #2563eb, #9333ea)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 6px 16px rgba(37,99,235,0.3)",
  },
  modalTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 700,
    color: "#0f172a",
  },
  closeBtn: {
    background: "#f1f5f9",
    border: "none",
    borderRadius: 8,
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#64748b",
    flexShrink: 0,
  },
  label: {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginTop: 14,
    marginBottom: 6,
  },
  inputWrap: {
    position: "relative",
  },
  input: {
    width: "100%",
    padding: "10px 38px 10px 12px",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    fontSize: 14,
    boxSizing: "border-box",
    background: "#f8fafc",
    color: "#0f172a",
    outline: "none",
  },
  eyeBtn: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    padding: 0,
  },
  error: {
    color: "#dc2626",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    padding: "8px 12px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 4,
  },
  success: {
    color: "#16a34a",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    padding: "8px 12px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 4,
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 22,
    paddingTop: 18,
    borderTop: "1px solid #f1f5f9",
  },
  cancelBtn: {
    padding: "9px 18px",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    background: "#fff",
    color: "#334155",
    fontWeight: 600,
    fontSize: 13.5,
    cursor: "pointer",
  },
  saveBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "9px 18px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg, #2563eb, #9333ea)",
    color: "#fff",
    fontWeight: 600,
    fontSize: 13.5,
    cursor: "pointer",
  },
  spinner: {
    width: 13,
    height: 13,
    borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.4)",
    borderTopColor: "#fff",
    display: "inline-block",
    animation: "spin 0.7s linear infinite",
  },
};
