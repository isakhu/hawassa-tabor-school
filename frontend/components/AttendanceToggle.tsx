"use client";

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";

interface AttendanceToggleProps {
  studentId?: string;
  status?: AttendanceStatus;
  value?: AttendanceStatus;
  onChange: (status: AttendanceStatus) => void;
  disabled?: boolean;
}

export default function AttendanceToggle({
  status,
  value,
  onChange,
  disabled,
}: AttendanceToggleProps) {
  const currentStatus = status || value || "PRESENT";

  const options: {
    status: AttendanceStatus;
    label: string;
    activeClass: string;
    inactiveClass: string;
  }[] = [
    {
      status: "PRESENT",
      label: "Present",
      activeClass: "bg-[#ecfdf5] text-[#059669] border-[#a7f3d0] font-bold shadow-xs",
      inactiveClass: "bg-white text-[#64748b] border-[#e2e8f0] hover:bg-[#f8fafc]",
    },
    {
      status: "LATE",
      label: "Late",
      activeClass: "bg-[#fffbeb] text-[#d97706] border-[#fde68a] font-bold shadow-xs",
      inactiveClass: "bg-white text-[#64748b] border-[#e2e8f0] hover:bg-[#f8fafc]",
    },
    {
      status: "ABSENT",
      label: "Absent",
      activeClass: "bg-[#fef2f2] text-[#dc2626] border-[#fecaca] font-bold shadow-xs",
      inactiveClass: "bg-white text-[#64748b] border-[#e2e8f0] hover:bg-[#f8fafc]",
    },
  ];

  return (
    <div className="flex items-center gap-1.5">
      {options.map((opt) => {
        const isActive = currentStatus === opt.status;
        return (
          <button
            key={opt.status}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.status)}
            className={`rounded-xl border px-3 py-1.5 text-xs transition-all ${
              isActive ? opt.activeClass : opt.inactiveClass
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
