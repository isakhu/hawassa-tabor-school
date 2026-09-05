"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

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

const CONFIG: Record<ToastType, { border: string; bar: string; icon: string; title: string }> = {
  success: { border: "#a7f3d0", bar: "#059669", icon: "✓", title: "Success" },
  error:   { border: "#fecaca", bar: "#dc2626", icon: "✕", title: "Notice" },
  warning: { border: "#fde68a", bar: "#d97706", icon: "!", title: "Warning" },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: number) => void }) {
  const [phase, setPhase] = useState<"in" | "shown" | "out">("in");
  const cfg = CONFIG[toast.type];

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("shown"), 10);
    const t2 = setTimeout(() => setPhase("out"), 3200);
    const t3 = setTimeout(() => onRemove(toast.id), 3550);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [toast.id, onRemove]);

  return (
    <div
      style={{
        border: `1px solid ${cfg.border}`,
        transform: phase === "shown" ? "translateX(0)" : "translateX(110%)",
        opacity: phase === "shown" ? 1 : 0,
        transition:
          phase === "out"
            ? "transform 0.3s ease-in, opacity 0.3s ease-in"
            : "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease",
      }}
      className="relative flex items-center gap-3 overflow-hidden rounded-2xl bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.12)] min-w-[300px] max-w-sm pointer-events-auto"
    >
      <div
        style={{ backgroundColor: cfg.bar }}
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-black text-white shadow-xs"
      >
        {cfg.icon}
      </div>

      <div className="flex-1 text-xs">
        <p className="font-bold text-[#0f172a]">{cfg.title}</p>
        <p className="mt-0.5 text-[#475569] leading-relaxed">{toast.message}</p>
      </div>

      <button
        onClick={() => onRemove(toast.id)}
        className="text-[#94a3b8] hover:text-[#0f172a] transition text-base p-1 leading-none"
      >
        ×
      </button>

      {/* Progress line */}
      <div
        style={{ backgroundColor: cfg.bar }}
        className="absolute bottom-0 left-0 h-1 w-full opacity-60"
      />
    </div>
  );
}

let idCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = ++idCounter;
    setToasts((prev) => [...prev.slice(-4), { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
