"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface DetailsModalProps {
  id: string;
  onClose: () => void;
}

export default function DetailsModal({ id, onClose }: DetailsModalProps) {
  const [instrumentName, setInstrumentName] = useState("");
  const [instRefNo, setInstRefNo] = useState("");
  const [make, setMake] = useState("");
  const [location, setLocation] = useState("");
  const [instRange, setInstRange] = useState("");
  const [leastCount, setLeastCount] = useState("");
  const [rangeOfUse, setRangeOfUse] = useState("");
  const [calibRange, setCalibRange] = useState("");
  const [frequency, setFrequency] = useState("");
  const [performedBy, setPerformedBy] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [calibDueOn, setCalibDueOn] = useState("");
  const [formNo, setFormNo] = useState("MIPL-CA-001-07");

  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/details/${encodeURIComponent(id)}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Record not found");
        return json;
      })
      .then((data) => {
        setData(data);
        setInstrumentName(data.InstrumentName || "");
        setInstRefNo(data.InstRefNo || "");
        setMake(data.Make || "");
        setLocation(data.Location || "");
        setInstRange(data.InstRange || "");
        setLeastCount(data.LeastCount || "");
        setRangeOfUse(data.RangeOfUse || "");
        setCalibRange(data.CalibRange || "");
        setFrequency(data.Frequency || "");
        setFormNo(data.FormNo || "MIPL-CA-001-07");
        setPerformedBy(data.PerformedBy || "");
        setEffectiveDate(data.EffectiveDate ? data.EffectiveDate.split("T")[0] : "");
        setCalibDueOn(data.CalibDueOn ? data.CalibDueOn.split("T")[0] : "");
        setError("");
      })
      .catch((err) => {
        console.error(err);
        setError("Record not found");
      });
  }, [id]);

  const saveDetails = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/details/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          InstrumentName: instrumentName,
          InstRefNo: instRefNo,
          Make: make,
          Location: location,
          InstRange: instRange,
          LeastCount: leastCount,
          RangeOfUse: rangeOfUse,
          CalibRange: calibRange,
          Frequency: frequency,
          FormNo: formNo,
          EffectiveDate: effectiveDate || null,
          CalibDueOn: calibDueOn || null,
          PerformedBy: performedBy,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        onClose();
        window.location.reload();
      } else {
        alert(json.message || "Something went wrong");
      }
    } finally {
      setSaving(false);
    }
  };

  const fields: Array<{
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
    readOnly?: boolean;
  }> = [
    { label: "Instrument", value: instrumentName, onChange: setInstrumentName },
    { label: "Equipments No", value: instRefNo, onChange: setInstRefNo },
    { label: "Make", value: make, onChange: setMake },
    { label: "Location", value: location, onChange: setLocation },
    { label: "Range", value: instRange, onChange: setInstRange },
    { label: "Least Count", value: leastCount, onChange: setLeastCount },
    { label: "Use Range", value: rangeOfUse, onChange: setRangeOfUse },
    { label: "Calibration Range", value: calibRange, onChange: setCalibRange },
    { label: "Frequency", value: frequency, onChange: setFrequency },
    { label: "Performed By", value: performedBy, onChange: setPerformedBy },
    { label: "Form No", value: formNo, onChange: setFormNo, readOnly: true },
    { label: "Cal. Done", value: effectiveDate, onChange: setEffectiveDate, type: "date" },
    { label: "Cal. Due", value: calibDueOn, onChange: setCalibDueOn, type: "date" },
  ];

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Instrument Details</h2>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {!data && !error && <div style={styles.loading}>Loading...</div>}

        {data && (
          <>
            <div style={styles.grid}>
              {fields.map((f) => (
                <div key={f.label} style={styles.field}>
                  <label style={styles.label}>{f.label}</label>
                  <input
                    type={f.type || "text"}
                    value={f.value}
                    readOnly={f.readOnly}
                    onChange={(e) => f.onChange(e.target.value)}
                    style={{
                      ...styles.input,
                      background: f.readOnly ? "#f1f5f9" : "#fff",
                      cursor: f.readOnly ? "not-allowed" : "text",
                    }}
                  />
                </div>
              ))}
            </div>

            <div style={styles.footer}>
              <button style={styles.cancelBtn} onClick={onClose}>
                Close
              </button>
              <button style={styles.saveBtn} onClick={saveDetails} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </>
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
  error: {
    color: "#dc2626",
    fontSize: 14,
    fontWeight: 600,
  },
  loading: {
    color: "#64748b",
    fontSize: 14,
    padding: "20px 0",
    textAlign: "center",
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
