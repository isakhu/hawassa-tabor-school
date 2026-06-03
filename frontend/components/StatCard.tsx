"use client";

import React, { useEffect } from "react";
import { motion, useMotionValue, animate } from "framer-motion";

type StatCardProps = {
  label: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
  iconBg: string;
  index?: number;
};

function useCountUp(target: number, duration = 1.2) {
  const m = useMotionValue(0);
  const [val, setVal] = React.useState(0);

  useEffect(() => {
    const controls = animate(m, target, { duration });
    const unsub = m.on("change", (v) => setVal(Math.round(v)));
    return () => {
      controls.stop();
      unsub();
    };
  }, [target, duration, m]);

  return val;
}

export default function StatCard({ label, value, icon, gradient, iconBg, index = 0 }: StatCardProps) {
  const displayed = useCountUp(value, 1.2);

  return (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.45 }}
      whileHover={{ scale: 1.02, y: -4 }}
      style={{
        padding: 24,
        background: "rgba(19,19,26,0.8)",
        borderRadius: 16,
        border: "1px solid rgba(99,102,241,0.12)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: gradient, opacity: 0.04, borderRadius: 16 }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          {icon}
        </div>
        <p style={{ fontSize: 13, color: "#6b6b80", marginBottom: 6, fontFamily: "var(--font-dm-sans)" }}>{label}</p>
        <p className="count-up" style={{ fontSize: 34, fontWeight: 800, fontFamily: "var(--font-syne)", color: "#e8e8f0" }}>
          {displayed.toLocaleString()}
        </p>
      </div>
    </motion.div>
  );
}
