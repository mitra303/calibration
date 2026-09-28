"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface EntryFormModalProps {
  qrId: string;
  onClose: () => void;
}

const addDays = (dateStr: string, days: number) => {
  if (!dateStr) return "";
  const date = new Date(dateStr.split("T")[0]);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
};

const diffInDays = (date1: string, date2: string) => {
  const d1 = new Date(date1.split("T")[0]);
  const d2 = new Date(date2.split("T")[0]);
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
};

const initialForm = {
  InstrumentName: "",
  InstRefNo: "",
  Make: "",
  Location: "",
  InstRange: "",
  LeastCount: "",
  RangeOfUse: "",
  CalibRange: "",
  Frequency: "",
  PerformedBy: "",
  CalibDueOn: "",
  FormNo: "",
  EffectiveDate: "",
  ReviewDate: "",
};

export default function EntryFormModal({ qrId, onClose }: EntryFormModalProps) {
  const [form, setForm] = useState<any>(initialForm);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!qrId) return;

    fetch(`/api/entry/${qrId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setForm((prev: any) => ({ ...prev, ...data }));
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [qrId]);

  const ENABLE_MODE = "TODAY";
  let isCalDueEditable = false;

  if (ENABLE_MODE === "TODAY" && form.EffectiveDate) {
    const expectedDueDate = addDays(form.EffectiveDate, 365);
    const baseDate = form.ReviewDate || expectedDueDate;
    const today = new Date().toISOString().split("T")[0];
    const diff = diffInDays(baseDate, today);
    isCalDueEditable = diff >= -7 && diff <= 7;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "EffectiveDate" && value) {
      setForm((prev: any) => ({
        ...prev,
        EffectiveDate: value,
        ReviewDate: addDays(value, 365),
      }));
      return;
    }

    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.InstRefNo || !form.InstRefNo.trim()) {
      setError("Ref No is required");
      return;
    }

    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/entry/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qr_id: qrId, ...form }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.message || "Something went wrong");
        return;
      }

      onClose();
      window.location.href = "/thank-you";
    } finally {
      setSaving(false);
    }
  };

  const fields: Array<{
    label: string;
    name: string;
    type?: string;
    required?: boolean;
    disabled?: boolean;
    min?: string;
  }> = [
    { label: "Instrument Name", name: "InstrumentName" },
    { label: "Equipment ID", name: "InstRefNo", required: true },
    { label: "Make", name: "Make" },
    { label: "Location", name: "Location" },
    { label: "Instrument Range", name: "InstRange" },
    { label: "Least Count", name: "LeastCount" },
    { label: "Range Of Use", name: "RangeOfUse" },
    { label: "Calibration Range", name: "CalibRange" },
    { label: "Frequency", name: "Frequency" },
    { label: "Performed By", name: "PerformedBy" },
    { label: "Form No", name: "FormNo" },
    { label: "Calibration Done", name: "EffectiveDate", type: "date" },
    {
      label: "Calibration Due",
      name: "ReviewDate",
      type: "date",
      disabled: !isCalDueEditable,
      min: form.EffectiveDate ? addDays(form.EffectiveDate, 358) : undefined,
    },
  ];

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Calibration Entry Form</h2>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {!loaded ? (
          <div style={styles.loading}>Loading...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.grid}>
              {fields.map((f) => (
                <div key={f.name} style={styles.field}>
                  <label style={styles.label}>
                    {f.label}
                    {f.required && <span style={{ color: "#dc2626" }}> *</span>}
                  </label>
                  <input
                    type={f.type || "text"}
                    name={f.name}
                    value={form[f.name] || ""}
                    onChange={handleChange}
                    disabled={f.disabled}
                    min={f.min}
                    style={{
                      ...styles.input,
                      background: f.disabled ? "#f1f5f9" : "#fff",
                      cursor: f.disabled ? "not-allowed" : "text",
                    }}
                  />
                </div>
              ))}
            </div>

            <div style={styles.footer}>
              <button type="button" style={styles.cancelBtn} onClick={onClose}>
                Close
              </button>
              <button type="submit" style={styles.saveBtn} disabled={saving}>
                {saving ? "Saving..." : "Save Entry"}
              </button>
            </div>
          </form>
        )}
      </div>
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
    maxWidth: 680,
    maxHeight: "88vh",
    overflowY: "auto",
    boxShadow: "0 24px 60px rgba(15,23,42,0.25)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    margin: 0,
    fontSize: 19,
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
  },
  loading: {
    color: "#64748b",
    fontSize: 14,
    padding: "20px 0",
    textAlign: "center",
  },
  error: {
    color: "#dc2626",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    padding: "8px 12px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 14,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  input: {
    padding: "9px 12px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    fontSize: 13.5,
    color: "#0f172a",
    outline: "none",
    boxSizing: "border-box",
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 24,
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
    padding: "9px 18px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg, #2563eb, #9333ea)",
    color: "#fff",
    fontWeight: 600,
    fontSize: 13.5,
    cursor: "pointer",
  },
};
