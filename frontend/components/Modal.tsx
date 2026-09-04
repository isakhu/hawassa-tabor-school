"use client";

import { useEffect, useRef, useState } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: number;
}

export default function Modal({ open, onClose, title, children, maxWidth = 520 }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);

  function handleClose() {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 180);
  }

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
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
    const last = focusable[focusable.length - 1];
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    el.addEventListener("keydown", trap);
    setTimeout(() => first?.focus(), 60);
    return () => el.removeEventListener("keydown", trap);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open && !closing) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: closing ? "rgba(15,23,42,0)" : "rgba(15,23,42,0.42)",
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
          maxWidth,
          maxHeight: "min(88vh, 760px)",
          overflowY: "auto",
          background: "#ffffff",
          border: "1px solid #dbe5f0",
          borderRadius: 20,
          boxShadow: "0 24px 70px rgba(15,23,42,0.18)",
          animation: closing
            ? "modalOut 0.18s ease-in forwards"
            : "modalIn 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            padding: "18px 22px",
            background: "rgba(255,255,255,0.96)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid #e5edf5",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 19,
              fontWeight: 800,
              color: "#0b1f3a",
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </h2>
          <button
            onClick={handleClose}
            aria-label="Close"
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "#f4f7fb",
              border: "1px solid #dbe5f0",
              color: "#647991",
              cursor: "pointer",
              fontSize: 20,
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s, color 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#edf3f9";
              e.currentTarget.style.color = "#173653";
              e.currentTarget.style.borderColor = "#cbd9e8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#f4f7fb";
              e.currentTarget.style.color = "#647991";
              e.currentTarget.style.borderColor = "#dbe5f0";
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: 22 }}>{children}</div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes modalOut {
          from { opacity: 1; transform: scale(1) translateY(0); }
          to { opacity: 0; transform: scale(0.97) translateY(8px); }
        }
      `}</style>
    </div>
  );
}
