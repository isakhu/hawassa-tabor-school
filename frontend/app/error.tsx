"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[EduCore Error]", error);
  }, [error]);

  return (
    <div style={{ minHeight: "100vh", background: "#08080f", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", overflow: "hidden" }}>
      {/* Background blob */}
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <div className="animate-blob-1" style={{ position: "absolute", top: "20%", left: "30%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(239,68,68,0.15) 0%,transparent 70%)", filter: "blur(60px)" }} />
      </div>

      <div className="animate-page-in" style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
        {/* Error icon */}
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(239,68,68,0.12)", border: "2px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 0 30px rgba(239,68,68,0.2)" }}>
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h1 style={{ fontFamily: "var(--font-syne)", fontSize: 26, fontWeight: 800, color: "#e8e8f0", marginBottom: 10 }}>
          Something went wrong
        </h1>
        <p style={{ color: "#6b6b80", fontSize: 14, marginBottom: 8, maxWidth: 360, margin: "0 auto 8px" }}>
          An unexpected error occurred. This has been noted.
        </p>
        {error?.message && (
          <p style={{ color: "#6b6b80", fontSize: 12, marginBottom: 32, fontFamily: "monospace", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 8, padding: "8px 14px", maxWidth: 420, margin: "0 auto 32px" }}>
            {error.message}
          </p>
        )}

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={reset}
            className="shimmer-btn"
            style={{ padding: "12px 24px", border: "none", borderRadius: 12, color: "#fff", fontSize: 15, fontWeight: 600, fontFamily: "var(--font-syne)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
            Try Again
          </button>
          <a href="/" style={{ padding: "12px 24px", borderRadius: 12, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", color: "#818cf8", fontSize: 15, fontWeight: 600, fontFamily: "var(--font-syne)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, transition: "background 0.2s" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.2)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.1)")}>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
