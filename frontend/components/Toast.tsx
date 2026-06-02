"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export type ToastType = "success" | "error" | "warning";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

// ─── Config ───────────────────────────────────────────────────────────────────
const CONFIG: Record<ToastType, { bg: string; border: string; glow: string; icon: string }> = {
  success: { bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.4)",  glow: "0 0 20px rgba(16,185,129,0.25)",  icon: "✅" },
  error:   { bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.4)",   glow: "0 0 20px rgba(239,68,68,0.25)",   icon: "❌" },
  warning: { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.4)",  glow: "0 0 20px rgba(245,158,11,0.25)",  icon: "⚠️" },
};

// ─── Single Toast ─────────────────────────────────────────────────────────────
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: number) => void }) {
  const [visible, setVisible] = useState(false);
  const cfg = CONFIG[toast.type];

  useEffect(() => {
    const show   = setTimeout(() => setVisible(true), 10);
    const hide   = setTimeout(() => setVisible(false), 3000);
    const remove = setTimeout(() => onRemove(toast.id), 3350);
    return () => { clearTimeout(show); clearTimeout(hide); clearTimeout(remove); };
  }, [toast.id, onRemove]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 16px",
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: 12,
        boxShadow: cfg.glow,
        minWidth: 280,
        maxWidth: 380,
        backdropFilter: "blur(16px)",
        transform: visible ? "translateX(0)" : "translateX(120%)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease",
        pointerEvents: "auto",
      }}
    >
      <span style={{ fontSize: 16, flexShrink: 0 }}>{cfg.icon}</span>
      <p style={{ flex: 1, color: "#e8e8f0", fontSize: 14, fontFamily: "var(--font-dm-sans)", lineHeight: 1.4 }}>
        {toast.message}
      </p>
      <button
        onClick={() => onRemove(toast.id)}
        style={{ background: "none", border: "none", color: "#6b6b80", cursor: "pointer", fontSize: 16, padding: 2, lineHeight: 1 }}
      >
        ×
      </button>
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────
let idCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10, pointerEvents: "none" }}>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useToast() {
  return useContext(ToastContext);
}
