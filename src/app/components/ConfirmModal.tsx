"use client";

import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  title = "Are you sure?",
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            ...styles.iconBadge,
            background: danger
              ? "linear-gradient(135deg, #dc2626, #ea580c)"
              : "linear-gradient(135deg, #2563eb, #9333ea)",
          }}
        >
          <AlertTriangle size={22} color="#fff" />
        </div>

        <h3 style={styles.title}>{title}</h3>
        <p style={styles.message}>{message}</p>

        <div style={styles.actions}>
          <button style={styles.cancelBtn} onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            style={{
              ...styles.confirmBtn,
              background: danger
                ? "linear-gradient(135deg, #dc2626, #ea580c)"
                : "linear-gradient(135deg, #2563eb, #9333ea)",
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <span style={styles.spinner} />}
            {loading ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.5)",
    backdropFilter: "blur(2px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 20,
  },
  modal: {
    background: "#fff",
    borderRadius: 20,
    padding: 28,
    width: "100%",
    maxWidth: 380,
    textAlign: "center",
    boxShadow: "0 24px 60px rgba(15,23,42,0.25)",
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
    boxShadow: "0 6px 18px rgba(220,38,38,0.3)",
  },
  title: {
    margin: 0,
    fontSize: 17,
    fontWeight: 700,
    color: "#0f172a",
  },
  message: {
    marginTop: 8,
    marginBottom: 0,
    fontSize: 13.5,
    color: "#64748b",
    lineHeight: 1.5,
  },
  actions: {
    display: "flex",
    justifyContent: "center",
    gap: 10,
    marginTop: 24,
  },
  cancelBtn: {
    flex: 1,
    padding: "10px 16px",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    background: "#fff",
    color: "#334155",
    fontWeight: 600,
    fontSize: 13.5,
    cursor: "pointer",
  },
  confirmBtn: {
    flex: 1,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "10px 16px",
    borderRadius: 10,
    border: "none",
    color: "#fff",
    fontWeight: 600,
    fontSize: 13.5,
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
