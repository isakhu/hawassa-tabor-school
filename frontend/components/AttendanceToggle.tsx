"use client";

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";

interface AttendanceToggleProps {
  studentId: string;
  value: AttendanceStatus;
  onChange: (studentId: string, status: AttendanceStatus) => void;
  disabled?: boolean;
}

export default function AttendanceToggle({ studentId, value, onChange, disabled }: AttendanceToggleProps) {
  const options: { status: AttendanceStatus; label: string; activeColor: string; activeBg: string; activeShadow: string }[] = [
    { status: "PRESENT", label: "Present", activeColor: "#10b981", activeBg: "rgba(16,185,129,0.18)", activeShadow: "0 0 12px rgba(16,185,129,0.4)" },
    { status: "LATE",    label: "Late",    activeColor: "#f59e0b", activeBg: "rgba(245,158,11,0.18)", activeShadow: "0 0 12px rgba(245,158,11,0.4)" },
    { status: "ABSENT",  label: "Absent",  activeColor: "#ef4444", activeBg: "rgba(239,68,68,0.18)",  activeShadow: "0 0 12px rgba(239,68,68,0.4)"  },
  ];

  return (
    <div style={{ display: "flex", gap: 6 }}>
      {options.map((opt) => {
        const isActive = value === opt.status;
        return (
          <button
            key={opt.status}
            type="button"
            disabled={disabled}
            onClick={() => onChange(studentId, opt.status)}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              border: `1px solid ${isActive ? opt.activeColor + "80" : "rgba(255,255,255,0.08)"}`,
              background: isActive ? opt.activeBg : "rgba(255,255,255,0.03)",
              color: isActive ? opt.activeColor : "#6b6b80",
              fontWeight: isActive ? 700 : 400,
              fontSize: 12,
              cursor: disabled ? "not-allowed" : "pointer",
              fontFamily: "var(--font-dm-sans)",
              boxShadow: isActive ? opt.activeShadow : "none",
              transition: "all 0.18s ease",
              transform: isActive ? "scale(1.03)" : "scale(1)",
              opacity: disabled ? 0.5 : 1,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
