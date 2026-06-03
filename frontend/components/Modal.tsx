"use client";

import { useEffect, useRef, useState } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: number;
}

export default function Modal({ open, onClose, title, children, maxWidth = 480 }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  function handleClose() {
    setClosing(true);
    setTimeout(() => { setClosing(false); onClose(); }, 180);
  }

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = panelRef.current;
    if (!el) return;
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    const trap  = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last?.focus(); } }
      else            { if (document.activeElement === last)  { e.preventDefault(); first?.focus(); } }
    };
    el.addEventListener("keydown", trap);
    setTimeout(() => first?.focus(), 60);
    return () => el.removeEventListener("keydown", trap);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 640);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (!open && !closing) return null;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
        background: closing ? "rgba(0,0,0,0)" : "rgba(0,0,0,0.65)",
        backdropFilter: closing ? "blur(0px)" : "blur(8px)",
        transition: "background 0.2s ease, backdrop-filter 0.2s ease",
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        style={{
          width: "100%",
          maxWidth: isMobile ? "100%" : maxWidth,
          background: "var(--bg-card)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(212,175,55,0.12)",
          borderRadius: isMobile ? 10 : 20,
          boxShadow: isMobile ? "0 12px 36px rgba(0,0,0,0.6)" : "0 24px 64px rgba(0,0,0,0.55), 0 0 48px rgba(212,175,55,0.06)",
          maxHeight: "calc(100vh - 40px)",
          overflowY: "auto",
          overflowX: "hidden",
          animation: closing
            ? "modalOut 0.18s ease-in forwards"
            : "modalIn 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid rgba(99,102,241,0.12)" }}>
          <h2 style={{ fontFamily: "var(--font-syne)", fontSize: 18, fontWeight: 700, color: "#e8e8f0" }}>{title}</h2>
          <button
            onClick={handleClose}
            style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "#6b6b80", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s, color 0.2s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.18)"; (e.currentTarget as HTMLElement).style.color = "#fca5a5"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLElement).style.color = "#6b6b80"; }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: "24px" }}>{children}</div>
      </div>

      <style>{`
        @keyframes modalIn  { from { opacity:0; transform:scale(0.9) translateY(14px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes modalOut { from { opacity:1; transform:scale(1) translateY(0); }      to { opacity:0; transform:scale(0.94) translateY(8px); } }
      `}</style>
    </div>
  );
}
