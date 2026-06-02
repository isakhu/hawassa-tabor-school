"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/constants";

// ─── Re-use mesh background from login ───────────────────────────────────────
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

function Spinner() {
  return (
    <span
      className="animate-spin-slow"
      style={{
        display: "inline-block",
        width: 18,
        height: 18,
        border: "2px solid rgba(255,255,255,0.3)",
        borderTopColor: "#fff",
        borderRadius: "50%",
      }}
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName]   = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [role, setRole]           = useState("STUDENT");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [mounted, setMounted]     = useState(false);

  useEffect(() => { setMounted(true); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          typeof data?.detail === "string" ? data.detail : "Registration failed."
        );
      }

      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "13px 16px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(99,102,241,0.25)",
    borderRadius: 12,
    color: "#e8e8f0",
    fontSize: 15,
    fontFamily: "var(--font-dm-sans)",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    color: "#9898b0",
    marginBottom: 6,
    fontWeight: 500,
  };

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
          <div className="glass-card" style={{ padding: "36px 32px" }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <h2
                style={{
                  fontFamily: "var(--font-syne)",
                  fontSize: 26,
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                <span className="gradient-text">Create account</span>
              </h2>
              <p style={{ color: "#6b6b80", fontSize: 14 }}>
                Join EduCore and get started today
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  marginBottom: 20,
                  padding: "12px 16px",
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.35)",
                  borderRadius: 10,
                  fontSize: 14,
                  color: "#fca5a5",
                  boxShadow: "0 0 16px rgba(239,68,68,0.15)",
                }}
              >
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Full name */}
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-glow"
                  style={inputStyle}
                />
              </div>

              {/* Email */}
              <div>
                <label style={labelStyle}>Email address</label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-glow"
                  style={inputStyle}
                />
              </div>

              {/* Password */}
              <div>
                <label style={labelStyle}>Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-glow"
                  style={inputStyle}
                />
              </div>

              {/* Role */}
              <div>
                <label style={labelStyle}>Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="input-glow"
                  style={{
                    ...inputStyle,
                    cursor: "pointer",
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236366f1' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 14px center",
                    paddingRight: 40,
                  }}
                >
                  <option value="STUDENT" style={{ background: "#13131a" }}>
                    🎓 Student
                  </option>
                  <option value="TEACHER" style={{ background: "#13131a" }}>
                    📚 Teacher
                  </option>
                  <option value="ADMIN" style={{ background: "#13131a" }}>
                    🛡️ Admin
                  </option>
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="shimmer-btn"
                style={{
                  marginTop: 8,
                  padding: "14px",
                  border: "none",
                  borderRadius: 12,
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: "var(--font-syne)",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  letterSpacing: "0.02em",
                }}
              >
                {loading ? (
                  <>
                    <Spinner /> Creating account…
                  </>
                ) : (
                  "Create Account →"
                )}
              </button>
            </form>

            <p style={{ marginTop: 20, textAlign: "center", fontSize: 14, color: "#6b6b80" }}>
              Already have an account?{" "}
              <Link
                href="/login"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #ec4899)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
