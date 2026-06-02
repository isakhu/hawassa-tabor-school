"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { isAuthenticated } from "@/lib/auth";

export default function NotFound() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => { setAuthed(isAuthenticated()); }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#08080f", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", overflow: "hidden" }}>
      {/* Mesh blobs */}
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <div className="animate-blob-1" style={{ position: "absolute", top: "10%", left: "20%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.25) 0%,transparent 70%)", filter: "blur(60px)" }} />
        <div className="animate-blob-2" style={{ position: "absolute", bottom: "10%", right: "15%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle,rgba(236,72,153,0.2) 0%,transparent 70%)", filter: "blur(55px)" }} />
      </div>

      {/* Floating shapes */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div className="animate-float-1" style={{ position: "absolute", top: "15%", left: "8%", width: 80, height: 80, borderRadius: "50%", border: "1.5px solid rgba(99,102,241,0.2)" }} />
        <div className="animate-float-2" style={{ position: "absolute", bottom: "20%", right: "10%", width: 50, height: 50, border: "1.5px solid rgba(139,92,246,0.25)", borderRadius: 10 }} />
        <div className="animate-float-3" style={{ position: "absolute", top: "55%", left: "75%", width: 30, height: 30, borderRadius: "50%", background: "rgba(236,72,153,0.15)" }} />
      </div>

      <div className="animate-page-in" style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
        {/* 404 */}
        <div style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(80px,18vw,160px)", fontWeight: 800, lineHeight: 1, marginBottom: 8, background: "linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
          404
        </div>

        {/* Divider */}
        <div style={{ width: 60, height: 2, background: "linear-gradient(90deg,#6366f1,#ec4899)", borderRadius: 2, margin: "0 auto 24px" }} />

        <h1 style={{ fontFamily: "var(--font-syne)", fontSize: 24, fontWeight: 700, color: "#e8e8f0", marginBottom: 10 }}>
          Page not found
        </h1>
        <p style={{ color: "#6b6b80", fontSize: 15, marginBottom: 36, maxWidth: 340, margin: "0 auto 36px" }}>
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          {authed ? (
            <Link href="/dashboard/admin" className="shimmer-btn" style={{ padding: "12px 24px", borderRadius: 12, color: "#fff", fontSize: 15, fontWeight: 600, fontFamily: "var(--font-syne)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></svg>
              Go to Dashboard
            </Link>
          ) : (
            <Link href="/login" className="shimmer-btn" style={{ padding: "12px 24px", borderRadius: 12, color: "#fff", fontSize: 15, fontWeight: 600, fontFamily: "var(--font-syne)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
              Go to Login
            </Link>
          )}
          <button onClick={() => window.history.back()} style={{ padding: "12px 24px", borderRadius: 12, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", color: "#818cf8", fontSize: 15, fontWeight: 600, fontFamily: "var(--font-syne)", cursor: "pointer", transition: "background 0.2s" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.2)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.1)")}>
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
