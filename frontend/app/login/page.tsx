Here is your updated app/login/page.tsx — PIN step removed, "Create one" link removed, clean and simple:
tsx"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/constants";
import { saveToken, saveUser, dashboardForRole } from "@/lib/auth";

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
          top: "10%",
          left: "15%",
          width: 480,
          height: 480,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="animate-blob-2"
        style={{
          position: "absolute",
          top: "50%",
          left: "55%",
          width: 560,
          height: 560,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)",
          filter: "blur(70px)",
        }}
      />
      <div
        className="animate-blob-3"
        style={{
          position: "absolute",
          bottom: "5%",
          left: "30%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(236,72,153,0.25) 0%, transparent 70%)",
          filter: "blur(55px)",
        }}
      />
    </div>
  );
}

// ─── Logo mark SVG ────────────────────────────────────────────────────────────
function LogoMark({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#6366f1" />
          <stop offset="50%"  stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <path
        d="M24 4L6 12V26C6 35.4 14.2 44.2 24 46C33.8 44.2 42 35.4 42 26V12L24 4Z"
        fill="url(#logoGrad)" opacity="0.15"
      />
      <path
        d="M24 4L6 12V26C6 35.4 14.2 44.2 24 46C33.8 44.2 42 35.4 42 26V12L24 4Z"
        stroke="url(#logoGrad)" strokeWidth="2" fill="none"
      />
      <path
        d="M17 24L22 29L31 19"
        stroke="url(#logoGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Floating shapes ──────────────────────────────────────────────────────────
function FloatingShapes() {
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div className="animate-float-1" style={{ position: "absolute", top: "15%", left: "10%", width: 120, height: 120, borderRadius: "50%", border: "2px solid rgba(99,102,241,0.3)" }} />
      <div className="animate-float-2" style={{ position: "absolute", top: "60%", left: "75%", width: 50, height: 50, border: "2px solid rgba(139,92,246,0.4)", borderRadius: 8 }} />
      <div className="animate-float-3" style={{ position: "absolute", bottom: "20%", left: "20%", width: 80, height: 80, borderRadius: "50%", background: "radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)" }} />
      <div className="animate-float-2" style={{ position: "absolute", top: "40%", left: "60%", width: 70, height: 70, borderRadius: "50%", border: "1.5px solid rgba(236,72,153,0.25)" }} />
      <div className="animate-float-1" style={{ position: "absolute", top: "75%", left: "40%", width: 16, height: 16, borderRadius: "50%", background: "rgba(99,102,241,0.5)" }} />
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
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
export default function LoginPage() {
  return (
    <>
      <MeshBackground />
      <Suspense fallback={<div>Loading...</div>}>
        <LoginContent />
      </Suspense>
    </>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [wakeUp, setWakeUp]     = useState(false);
  const [mounted, setMounted]   = useState(false);
  const wakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    wakeTimer.current = setTimeout(() => setWakeUp(true), 3000);

    fetch(`${API_BASE_URL.replace("/api/v1", "")}/health`, { method: "GET" })
      .then(() => {
        if (wakeTimer.current) clearTimeout(wakeTimer.current);
        setWakeUp(false);
      })
      .catch(() => {});

    return () => {
      if (wakeTimer.current) clearTimeout(wakeTimer.current);
    };
  }, []);

  // ✅ FIXED: sends JSON body matching UserLogin schema
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          typeof data?.detail === "string" ? data.detail : "Invalid email or password."
        );
      }

      saveToken(data.access_token);
      saveUser(data.user);
      router.push(dashboardForRole(data.user.role));
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

  return (
    <div
      style={{
        position: "relative",
        zIndex: 1,
        minHeight: "100vh",
        display: "flex",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}
    >
      {/* ── Left panel (hidden on mobile) ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px",
          position: "relative",
          borderRight: "1px solid rgba(99,102,241,0.12)",
        }}
        className="hidden lg:flex"
      >
        <FloatingShapes />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 380 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 24 }}>
            <LogoMark size={52} />
            <span style={{ fontFamily: "var(--font-syne)", fontSize: 32, fontWeight: 800, background: "linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              EduCore
            </span>
          </div>
          <h1 style={{ fontFamily: "var(--font-syne)", fontSize: 42, fontWeight: 800, color: "#e8e8f0", lineHeight: 1.15, marginBottom: 16 }}>
            The future of{" "}
            <span className="gradient-text">school management</span>
          </h1>
          <p style={{ color: "#6b6b80", fontSize: 17, lineHeight: 1.65 }}>
            Streamline students, teachers, classes, attendance, and grades —
            all from one powerful platform.
          </p>
          <div style={{ display: "flex", gap: 24, marginTop: 40, justifyContent: "center" }}>
            {[
              { value: "10k+", label: "Students" },
              { value: "500+", label: "Teachers" },
              { value: "99.9%", label: "Uptime" },
            ].map((s) => (
              <div key={s.label} style={{ padding: "14px 20px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 12, textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-syne)", fontSize: 22, fontWeight: 700, background: "linear-gradient(135deg, #6366f1, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 12, color: "#6b6b80", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "24px 20px" }}>

        {/* Server wake-up banner */}
        {wakeUp && (
          <div style={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.4)", borderRadius: 10, padding: "10px 20px", fontSize: 13, color: "#c4b5fd", whiteSpace: "nowrap", zIndex: 100 }}>
            ⚡ Server waking up, please wait…
          </div>
        )}

        <div style={{ width: "100%", maxWidth: 420 }}>
          {/* Mobile brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32, justifyContent: "center" }} className="lg:hidden">
            <LogoMark size={36} />
            <span style={{ fontFamily: "var(--font-syne)", fontSize: 24, fontWeight: 800, background: "linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              EduCore
            </span>
          </div>

          {/* Card */}
          <div className="glass-card animate-pulse-glow" style={{ padding: "36px 32px" }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                <LogoMark size={44} />
              </div>
              <h2 style={{ fontFamily: "var(--font-syne)", fontSize: 26, fontWeight: 700, marginBottom: 6 }}>
                <span className="gradient-text">Welcome back</span>
              </h2>
              <p style={{ color: "#6b6b80", fontSize: 14 }}>
                Sign in to your EduCore account
              </p>
            </div>

            {/* Error */}
            {error && (
              <div style={{ marginBottom: 20, padding: "12px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.35)", borderRadius: 10, fontSize: 14, color: "#fca5a5", boxShadow: "0 0 16px rgba(239,68,68,0.15)", display: "flex", alignItems: "center", gap: 8 }}>
                ⚠️ {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#9898b0", marginBottom: 6, fontWeight: 500 }}>
                  Email address
                </label>
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

              <div>
                <label style={{ display: "block", fontSize: 13, color: "#9898b0", marginBottom: 6, fontWeight: 500 }}>
                  Password
                </label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-glow"
                    style={{ ...inputStyle, paddingRight: "45px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: 12, background: "none", border: "none", color: "#9898b0", cursor: "pointer", fontSize: 18, padding: "4px 8px", display: "flex", alignItems: "center", justifyContent: "center" }}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

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
                {loading ? <><Spinner /> Signing in…</> : "Sign In →"}
              </button>
            </form>

            {/* ✅ "Create one" link removed — admin creates users inside app */}
            <p style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "#6b6b80" }}>
              Contact your school admin to get access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}