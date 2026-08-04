"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

/* ================= DATE HELPERS ================= */

const addDays = (dateStr, days) => {
  if (!dateStr) return "";
  const date = new Date(dateStr.split("T")[0]);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
};

const diffInDays = (date1, date2) => {
  const d1 = new Date(date1.split("T")[0]);
  const d2 = new Date(date2.split("T")[0]);
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
};

/* ================= COMPONENT ================= */

export default function EntryForm() {
  const router = useRouter();
  const { qr_id } = useParams();

  const [mounted, setMounted] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
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
  });

  /* ================= CLIENT ONLY ================= */

  useEffect(() => {
    setMounted(true);
  }, []);

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    if (!qr_id) return;

    fetch(`/api/entry/${qr_id}`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data) setForm(prev => ({
          ...prev, ...data,

        }));
      });
  }, [qr_id]);

  /* ================= CAL DUE ENABLE LOGIC ================= */

  const ENABLE_MODE = "TODAY";
  let isCalDueEditable = false;

  //const TEST_TODAY = "2028-10-17";

  if (ENABLE_MODE === "TODAY" && form.EffectiveDate) {

    const expectedDueDate = addDays(form.EffectiveDate, 365);

    // 👇 Important change
    const baseDate = form.ReviewDate || expectedDueDate;
    const today = new Date().toISOString().split("T")[0];
    //const today = TEST_TODAY || new Date().toISOString().split("T")[0];

    const diff = diffInDays(baseDate, today);

    // ✅ Always ±7 days from selected/base date
    isCalDueEditable = diff >= -7 && diff <= 7;
  }

  if (ENABLE_MODE === "EFFECTIVE" && form.ReviewDate) {

    //const today = TEST_TODAY || new Date().toISOString().split("T")[0];
    const today = new Date().toISOString().split("T")[0];

    const diff = diffInDays(form.ReviewDate, today);

    // ✅ Enable only in ±7 days of selected ReviewDate
    isCalDueEditable = diff >= -7 && diff <= 7;
  }
  /* ================= CHANGE HANDLER ================= */

  const handleChange = e => {
    const { name, value } = e.target;

    if (name === "EffectiveDate" && value) {
      setForm(prev => ({
        ...prev,
        EffectiveDate: value,
        ReviewDate: addDays(value, 365),
      }));
      return;
    }

    setForm(prev => ({ ...prev, [name]: value }));
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async e => {
    e.preventDefault();

    if (!form.InstRefNo || !form.InstRefNo.trim()) {
      setErrors({ InstRefNo: "Ref No is required" });
      alert("Ref No is required");
      return;
    }

    setErrors({});

    const res = await fetch("/api/entry/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qr_id, ...form }),
    });

    const result = await res.json();

    if (!res.ok) {
      alert(result.message);
      return;
    }

    alert("Data Saved Successfully ✅");
    setTimeout(() => {
      router.push("/thank-you");
    }, 1000);
  };

  if (!mounted) return null;

  /* ================= UI ================= */

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.heading}>Calibration Entry Form</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <Field label="Instrument Name" name="InstrumentName" value={form.InstrumentName} onChange={handleChange} />
        <Field label="Equipment ID" name="InstRefNo" value={form.InstRefNo} onChange={handleChange} required error={errors.InstRefNo} />
        <Field label="Make" name="Make" value={form.Make} onChange={handleChange} />
        <Field label="Location" name="Location" value={form.Location} onChange={handleChange} />
        <Field label="Instrument Range" name="InstRange" value={form.InstRange} onChange={handleChange} />
        <Field label="Least Count" name="LeastCount" value={form.LeastCount} onChange={handleChange} />
        <Field label="Range Of Use" name="RangeOfUse" value={form.RangeOfUse} onChange={handleChange} />
        <Field label="Calibration Range" name="CalibRange" value={form.CalibRange} onChange={handleChange} />
        <Field label="Frequency" name="Frequency" value={form.Frequency} onChange={handleChange} />
        <Field label="Performed By" name="PerformedBy" value={form.PerformedBy} onChange={handleChange} />

        {/* <Field type="date" label="Calibration Due On" name="CalibDueOn" value={form.CalibDueOn} onChange={handleChange} /> */}
        <Field label="Form No" name="FormNo" value={form.FormNo} onChange={handleChange} />
        <Field type="date" label="Calibration Done" name="EffectiveDate" value={form.EffectiveDate} onChange={handleChange} />

        <Field
          type="date"
          label="Calibration Due"
          name="ReviewDate"
          value={form.ReviewDate}
          onChange={handleChange}
          disabled={!isCalDueEditable}
          min={form.EffectiveDate ? addDays(form.EffectiveDate, 358) : undefined}
        />

        <button type="submit" style={styles.button}>Save Entry</button>
      </form>
    </div>
  );
}

/* ================= FIELD ================= */

function Field({ label, name, value, onChange, type = "text", required, error, disabled, min, max }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
      <label
        style={{
          fontWeight: 600,
          fontSize: 14,
          lineHeight: "18px",
          whiteSpace: "normal",
          wordBreak: "break-word",
        }}
      >
        {label}
        {required && <span style={{ color: "red" }}> *</span>}
      </label>

      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        min={min}
        max={max}
        style={{
          padding: "10px 12px",
          borderRadius: 6,
          border: error ? "1px solid red" : "1px solid #ccc",
          background: disabled ? "#f3f4f6" : "#fff",
          color: "#111827",
          width: "100%",
          fontSize: 14,
        }}
      />

      {error && <span style={{ color: "red", fontSize: 12 }}>{error}</span>}
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  wrapper: {
    maxWidth: 800,
    margin: "40px auto",
    padding: 30,
    border: "1px solid #ddd",
    borderRadius: 8,
    background: "#fff",
    color: "#111827",
  },
  heading: {
    fontSize: 22,
    marginBottom: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    width: "100%",
  },
  button: {
    marginTop: 20,
    padding: 12,
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontSize: 16,
    cursor: "pointer",
  },
};