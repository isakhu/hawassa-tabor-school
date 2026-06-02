"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type ToastType = "success" | "error" | "warning";

interface Toast { id: number; message: string; type: ToastType; }
interface ToastContextValue { showToast: (message: string, type?: ToastType) => void; }

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

const CONFIG: Record<ToastType, { bg: string; border: string; bar: string; icon: string }> = {
  success: { bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.4)",  bar: "#10b981", icon: "✅" },
  error:   { bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.4)",   bar: "#ef4444", icon: "❌" },
  warning: { bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.4)",  bar: "#f59e0b", icon: "⚠️" },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: number) => void }) {
  const [phase, setPhase] = useState<"in" | "shown" | "out">("in");
  const cfg = CONFIG[toast.type];

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("shown"), 10);
    const t2 = setTimeout(() => setPhase("out"), 3000);
    const t3 = setTimeout(() => onRemove(toast.id), 3350);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [toast.id, onRemove]);

  return (
    <div style={{
      position: "relative",
      display: "flex", alignItems: "center", gap: 10,
      padding: "12px 16px 14px",
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      borderRadius: 12,
      backdropFilter: "blur(16px)",
      minWidth: 280, maxWidth: 380,
      pointerEvents: "auto",
      overflow: "hidden",
      transform: phase === "shown" ? "translateX(0)" : "translateX(110%)",
      opacity: phase === "shown" ? 1 : 0,
      transition: phase === "out"
        ? "transform 0.3s ease-in, opacity 0.3s ease-in"
        : "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease",
    }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>{cfg.icon}</span>
      <p style={{ flex: 1, color: "#e8e8f0", fontSize: 14, fontFamily: "var(--font-dm-sans)", lineHeight: 1.4 }}>
        {toast.message}
      </p>
      <button onClick={() => onRemove(toast.id)} style={{ background: "none", border: "none", color: "#6b6b80", cursor: "pointer", fontSize: 18, padding: 2, lineHeight: 1, flexShrink: 0 }}>×</button>
      {/* Progress bar */}
      <div className="toast-progress" style={{ background: cfg.bar, opacity: 0.7 }} />
    </div>
  );
}

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
      <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10, pointerEvents: "none" }}>
        {toasts.map((t) => <ToastItem key={t.id} toast={t} onRemove={removeToast} />)}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() { return useContext(ToastContext); }
