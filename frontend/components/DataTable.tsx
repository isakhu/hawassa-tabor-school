"use client";

import { useMemo, useState, useRef } from "react";

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  width?: number | string;
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  searchQuery?: string;
  searchKeys?: (keyof T)[];
  pageSize?: number;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  onRefresh?: () => Promise<void>;
}

// ─── Branded loader ───────────────────────────────────────────────────────────
function EduLoader() {
  return (
    <div className="educore-loader" style={{ padding: "40px", justifyContent: "center" }}>
      <span /><span /><span />
    </div>
  );
}

// ─── Empty state SVG ──────────────────────────────────────────────────────────
function EmptyState({ message, icon }: { message: string; icon?: React.ReactNode }) {
  return (
    <div style={{ padding: "60px 20px", textAlign: "center", color: "#6b6b80" }}>
      {icon
        ? <div style={{ fontSize: 48, marginBottom: 14, animation: "float3 6s ease-in-out infinite" }}>{icon}</div>
        : (
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none" style={{ margin: "0 auto 16px", animation: "float3 6s ease-in-out infinite", display: "block" }}>
            <circle cx="36" cy="36" r="32" stroke="rgba(99,102,241,0.2)" strokeWidth="1.5" />
            <circle cx="36" cy="36" r="20" stroke="rgba(139,92,246,0.15)" strokeWidth="1" />
            <path d="M26 36h20M36 26v20" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="24" cy="24" r="3" fill="rgba(236,72,153,0.25)" />
            <circle cx="48" cy="48" r="2" fill="rgba(99,102,241,0.25)" />
            <circle cx="50" cy="22" r="4" fill="rgba(139,92,246,0.15)" />
          </svg>
        )
      }
      <p style={{ fontFamily: "var(--font-syne)", fontSize: 15, fontWeight: 700, color: "#9898b0", marginBottom: 6 }}>{message}</p>
      <p style={{ fontSize: 13 }}>Try adjusting your search or adding a new record.</p>
    </div>
  );
}

function SkeletonRow({ cols, opacity = 1 }: { cols: number; opacity?: number }) {
  return (
    <tr style={{ opacity }}>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: "15px 16px" }}>
          <div className="skeleton" style={{ height: 13, borderRadius: 6, width: i === 0 ? 36 : `${60 + Math.random() * 30}%` }} />
        </td>
      ))}
    </tr>
  );
}

export default function DataTable<T extends { id: string }>({
  columns, data, loading = false,
  searchQuery = "", searchKeys = [],
  pageSize = 10, emptyMessage = "No records found.",
  emptyIcon,
  onRefresh,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!onRefresh || isRefreshing || loading) return;
    if (window.scrollY === 0) {
      startY.current = e.touches[0].pageY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!onRefresh || isRefreshing || loading || startY.current === 0) return;
    const deltaY = e.touches[0].pageY - startY.current;
    if (deltaY > 0 && window.scrollY === 0) {
      const distance = Math.min(deltaY * 0.35, 70);
      setPullDistance(distance);
      if (distance > 10 && e.cancelable) e.preventDefault();
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > 55 && onRefresh) {
      setIsRefreshing(true);
      setPullDistance(50);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
    startY.current = 0;
  };

  const filtered = useMemo(() => {
    if (!searchQuery.trim() || searchKeys.length === 0) return data;
    const q = searchQuery.toLowerCase();
    return data.filter((row) =>
      searchKeys.some((k) => String(row[k] ?? "").toLowerCase().includes(q))
    );
  }, [data, searchQuery, searchKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const paged      = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const tdBase: React.CSSProperties = {
    padding: "13px 16px",
    color: "#c8c8d8",
    fontSize: 14,
    borderBottom: "1px solid rgba(99,102,241,0.06)",
    fontFamily: "var(--font-dm-sans)",
    whiteSpace: "nowrap",
  };

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ position: 'relative' }}
    >
      {/* Pull-to-refresh Indicator */}
      {onRefresh && (
        <div style={{
          height: pullDistance || (isRefreshing ? 50 : 0),
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: pullDistance === 0 ? "height 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)" : "none",
          background: "rgba(212, 175, 55, 0.03)",
          borderBottom: pullDistance > 0 || isRefreshing ? "1px solid rgba(212, 175, 55, 0.15)" : "none",
          borderRadius: "14px 14px 0 0",
          color: "#D4AF37",
          fontSize: "12px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.5px"
        }}>
          <span style={{ transform: `rotate(${pullDistance * 4}deg)`, marginRight: "10px", fontSize: "16px", display: "inline-block" }}>
            {isRefreshing ? "⏳" : "⚓"}
          </span>
          {isRefreshing ? "Refreshing Records..." : pullDistance > 55 ? "Release to sync" : "Pull to sync"}
        </div>
      )}

      <div style={{ overflowX: "auto", borderRadius: 14, border: "1px solid rgba(99,102,241,0.12)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "linear-gradient(90deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.04) 100%)" }}>
              {columns.map((col) => (
                <th key={col.key} style={{ padding: "13px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "#6b6b80", fontFamily: "var(--font-syne)", whiteSpace: "nowrap", width: col.width }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading || isRefreshing
              ? Array.from({ length: Math.min(pageSize, 5) }).map((_, i) => <SkeletonRow key={i} cols={columns.length} opacity={isRefreshing ? 0.7 : 1} />)
              : paged.length === 0
                ? <tr><td colSpan={columns.length}><EmptyState message={emptyMessage} icon={emptyIcon} /></td></tr>
                : paged.map((row, rowIndex) => (
                  <tr
                    key={row.id}
                    className="table-row-in"
                    style={{ "--row-index": rowIndex } as React.CSSProperties}
                    onMouseEnter={(e) => {
                      const tr = e.currentTarget as HTMLTableRowElement;
                      tr.style.background = "linear-gradient(90deg, rgba(99,102,241,0.07) 0%, transparent 60%)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.background = "transparent";
                    }}
                  >
                    {columns.map((col) => (
                      <td key={col.key} style={tdBase}>
                        {col.render ? col.render(row) : String((row as any)[col.key] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && filtered.length > pageSize && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, flexWrap: "wrap", gap: 8 }}>
          <p style={{ fontSize: 13, color: "#6b6b80" }}>
            Showing {Math.min((safePage - 1) * pageSize + 1, filtered.length)}–{Math.min(safePage * pageSize, filtered.length)} of {filtered.length}
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setPage((p: number) => Math.max(1, p - 1))} disabled={safePage === 1} style={{ padding: "7px 16px", borderRadius: 8, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: safePage === 1 ? "#6b6b80" : "#e8e8f0", cursor: safePage === 1 ? "not-allowed" : "pointer", fontSize: 13, transition: "background 0.2s" }}
              onMouseEnter={(e) => { if (safePage !== 1) (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.2)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.1)"; }}>
              ← Prev
            </button>
            <span style={{ padding: "7px 14px", fontSize: 13, color: "#9898b0", background: "rgba(99,102,241,0.05)", borderRadius: 8, border: "1px solid rgba(99,102,241,0.1)" }}>
              {safePage} / {totalPages}
            </span>
            <button onClick={() => setPage((p: number) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} style={{ padding: "7px 16px", borderRadius: 8, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: safePage === totalPages ? "#6b6b80" : "#e8e8f0", cursor: safePage === totalPages ? "not-allowed" : "pointer", fontSize: 13, transition: "background 0.2s" }}
              onMouseEnter={(e) => { if (safePage !== totalPages) (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.2)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.1)"; }}>
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
