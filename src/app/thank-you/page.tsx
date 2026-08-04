"use client";

import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

export default function ThankYou() {
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #4f46e5, #06b6d4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          padding: "50px 30px",
          borderRadius: "20px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
          maxWidth: "400px",
          width: "100%",
          textAlign: "center",
        }}
      >
        {/* Icon */}
        <div style={{ marginBottom: "20px" }}>
          <CheckCircle size={80} color="#22c55e" strokeWidth={2.5} />
        </div>

        <h1
          style={{
            fontSize: "26px",
            fontWeight: "700",
            marginBottom: "10px",
            color: "#111827",
          }}
        >
          Thank You 🎉
        </h1>

        <p
          style={{
            color: "#6b7280",
            marginBottom: "30px",
            fontSize: "15px",
          }}
        >
          Your details have been saved successfully.
        </p>

        {/* <button
          onClick={() => router.push("#")}
          style={{
            width: "100%",
            background: "#4f46e5",
            color: "#fff",
            padding: "12px",
            borderRadius: "10px",
            border: "none",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "0.3s",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.background = "#4338ca")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.background = "#4f46e5")
          }
        >
          Go Back Home
        </button> */}
      </div>
    </div>
  );
}