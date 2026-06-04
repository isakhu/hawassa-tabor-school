"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// ─── Mesh background ──────────────────────────────────────────────────────────
function MeshBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <div
        className="animate-blob-1"
        style={{
          position: "absolute",
          top: "5%",
          right: "10%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)",
          filter: "blur(65px)",
        }}
      />
      <div
        className="animate-blob-2"
        style={{
          position: "absolute",
          bottom: "10%",
          left: "5%",
          width: 450,
          height: 450,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.28) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="animate-blob-3"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 350,
          height: 350,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)",
          filter: "blur(55px)",
        }}
      />
    </div>
  );
}

function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="lg2" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#6366f1" />
          <stop offset="50%"  stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <path
        d="M24 4L6 12V26C6 35.4 14.2 44.2 24 46C33.8 44.2 42 35.4 42 26V12L24 4Z"
        fill="url(#lg2)"
        opacity="0.15"
      />
      <path
        d="M24 4L6 12V26C6 35.4 14.2 44.2 24 46C33.8 44.2 42 35.4 42 26V12L24 4Z"
        stroke="url(#lg2)"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M17 24L22 29L31 19"
        stroke="url(#lg2)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <>
      <MeshBackground />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 20px",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        <div style={{ width: "100%", maxWidth: 460 }}>
          {/* Brand */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 28,
              justifyContent: "center",
            }}
          >
            <LogoMark size={36} />
            <span
              style={{
                fontFamily: "var(--font-syne)",
                fontSize: 24,
                fontWeight: 800,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              EduCore
            </span>
          </div>

          {/* Card */}
          <div className="glass-card" style={{ padding: "48px 32px", textAlign: "center" }}>

            {/* Lock icon */}
            <div style={{ fontSize: 56, marginBottom: 20 }}>🔒</div>

            <h2
              style={{
                fontFamily: "var(--font-syne)",
                fontSize: 26,
                fontWeight: 700,
                marginBottom: 12,
              }}
            >
              <span className="gradient-text">Registration Closed</span>
            </h2>

            <p style={{ color: "#6b6b80", fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
              Account creation is managed by your school administrator.
              <br />
              Please contact your admin to get access to EduCore.
            </p>

            {/* Info box */}
            <div
              style={{
                padding: "16px 20px",
                background: "rgba(99,102,241,0.08)",
                border: "1px solid rgba(99,102,241,0.25)",
                borderRadius: 12,
                marginBottom: 32,
                fontSize: 14,
                color: "#a5b4fc",
                lineHeight: 1.6,
              }}
            >
              📧 Ask your admin to create an account for you inside the app.
              <br />
              You will receive your login credentials directly.
            </div>

            {/* Back to login */}
            <Link
              href="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "13px 32px",
                borderRadius: 12,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#fff",
                fontFamily: "var(--font-syne)",
                fontWeight: 600,
                fontSize: 15,
                textDecoration: "none",
                letterSpacing: "0.02em",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}