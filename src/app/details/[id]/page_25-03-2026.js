"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

export default function DetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [data, setData] = useState(null);
  const [error, setError] = useState("");


  // const [formNo, setFormNo] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  // const [reviewDate, setReviewDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [calibDueOn, setCalibDueOn] = useState("");
  const [formNo, setFormNo] = useState("MIPL-CA-001-07");


  useEffect(() => {
    if (!id) return; 

    fetch(`/api/details/${encodeURIComponent(id)}`)
      .then(async (res) => {
        const json = await res.json();
        console.log("API JSON:", json);
        if (!res.ok) {
          throw new Error(json.message || "Record not found");
        }

        return json;
      })
      .then((data) => {
        setData(data);
        // setFormNo(data.FormNo || "");
        setFormNo(data.FormNo || "MIPL-CA-001-07");
        setEffectiveDate(
          data.EffectiveDate
            ? data.EffectiveDate.split("T")[0]
            : ""
        );
        setCalibDueOn(
        data.CalibDueOn
          ? data.CalibDueOn.split("T")[0]
          : ""
      );
        setError("");
      })
      .catch((err) => {
        console.error(err);
        setError("Record not found");
      });
  }, [id]);

  const isWithin7Days = () => {
    if (!calibDueOn) return false;

    const today = new Date();
    //const today = new Date("2026-11-09");
    const dueDate = new Date(calibDueOn);

    const diffTime = dueDate - today;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    // return diffDays >= 0 && diffDays <= 7;
    return Math.abs(diffDays) <= 7;
  };


  const saveDetails = async () => {
    setSaving(true);

    const res = await fetch(`/api/details/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include", 
      body: JSON.stringify({
        FormNo: formNo,
        EffectiveDate: effectiveDate || null,
        CalibDueOn: calibDueOn || null,
      }),
    });

    const json = await res.json();
    console.log("SAVE RESPONSE:", json);

    setSaving(false);
    if (res.ok) {
      alert("Saved successfully");

      // Redirect to thank you page
      setTimeout(() => {
        router.push("/thank-you");
      }, 1000);
    } else {
      alert(json.message || "Something went wrong");
    }
  };



  if (error) return <h2>{error}</h2>;
  if (!data) return <h2>Loading...</h2>;

  return (
    <div style={styles.container}>
      {/* <h1 style={styles.title}>{data.InstrumentName}</h1> */}

      <table style={styles.table}>
        <tbody>
          <tr><td style={styles.label}>Instrument</td><td style={styles.value}>{data.InstrumentName}</td></tr>
          <tr><td style={styles.label}>Equipments No</td><td style={styles.value}>{data.InstRefNo}</td></tr>
          <tr><td style={styles.label}>Make</td><td style={styles.value}>{data.Make}</td></tr>
          <tr><td style={styles.label}>Location</td><td style={styles.value}>{data.Location}</td></tr>
          <tr><td style={styles.label}>Range</td><td style={styles.value}>{data.InstRange}</td></tr>
          <tr><td style={styles.label}>Least Count</td><td style={styles.value}>{data.LeastCount}</td></tr>
          <tr><td style={styles.label}>Use Range</td><td style={styles.value}>{data.RangeOfUse}</td></tr>
          <tr><td style={styles.label}>Calibration Range</td><td style={styles.value}>{data.CalibRange}</td></tr>
          <tr><td style={styles.label}>Frequency</td><td style={styles.value}>{data.Frequency}</td></tr>
          <tr><td style={styles.label}>Performed By</td><td style={styles.value}>{data.PerformedBy}</td></tr>
          

          <tr>
            <td style={styles.label}>Form No</td>
            <td style={styles.value}>
              <input
                value={formNo}
                onChange={(e) => setFormNo(e.target.value)}
                style={styles.input}
                placeholder="MIPL-CA-001-07"
                readOnly
              />
            </td>
          </tr>

          <tr>
            <td style={styles.label}>Cal. Done</td>
            <td style={styles.value}>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                style={{
                  ...styles.input,
                  backgroundColor: !isWithin7Days() ? "#f3f4f6" : "#ffffff",
                  cursor: !isWithin7Days() ? "not-allowed" : "pointer",
                  opacity: !isWithin7Days() ? 0.6 : 1,
                }}
                disabled={!isWithin7Days()}
              />
            </td>
          </tr>

          <tr>
            <td style={styles.label}>Cal. Due</td>
            <td style={styles.value}>
              <input
                type="date"
                value={calibDueOn}
                onChange={(e) => setCalibDueOn(e.target.value)}
                style={{
                  ...styles.input,
                  backgroundColor: !isWithin7Days() ? "#f3f4f6" : "#ffffff",
                  cursor: !isWithin7Days() ? "not-allowed" : "pointer",
                  opacity: !isWithin7Days() ? 0.6 : 1,
                }}
                // disabled={!isWithin7Days()}
              />
            </td>
          </tr>

          <tr>
            <td colSpan={2} style={{ textAlign: "center", padding: 15 }}>
              <button onClick={saveDetails} style={styles.button} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
            </td>
          </tr>




        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: {
    padding: 30,
    maxWidth: 700,
    margin: "40px auto",
    fontFamily: "Arial, sans-serif",
    background: "#ffffff",
    borderRadius: 8,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },

  title: {
    textAlign: "center",
    marginBottom: 20,
    color: "#1f2937",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  label: {
    border: "1px solid #e5e7eb",
    padding: 10,
    fontWeight: "bold",
    width: "40%",
    background: "#f9fafb",
    color: "#374151",
  },

  value: {
    border: "1px solid #e5e7eb",
    padding: 10,
    color: "#111827",
  },
  input: {
    width: "100%",
    padding: 8,
    border: "1px solid #d1d5db",
    borderRadius: 4,
  },

  button: {
    padding: "8px 20px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
  },

};

