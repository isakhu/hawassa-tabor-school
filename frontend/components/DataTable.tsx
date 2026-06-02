"use client";

import { useMemo, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
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
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────
function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: "14px 16px" }}>
          <div className="skeleton" style={{ height: 14, borderRadius: 6, width: i === 0 ? 40 : "80%" }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DataTable<T extends { id: string }>({
  columns, data, loading = false,
  searchQuery = "", searchKeys = [],
  pageSize = 10, emptyMessage = "No records found.",
  emptyIcon,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);

  // Client-side search
  const filtered = useMemo(() => {
    if (!searchQuery.trim() || searchKeys.length === 0) return data;
    const q = searchQuery.toLowerCase();
    return data.filter((row) =>
      searchKeys.some((k) => String(row[k] ?? "").toLowerCase().includes(q))
    );
  }, [data, searchQuery, searchKeys]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const paged      = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const tdStyle: React.CSSProperties = {
    padding: "13px 16px",
    color: "#c8c8d8",
    fontSize: 14,
    borderBottom: "1px solid rgba(99,102,241,0.07)",
    fontFamily: "var(--font-dm-sans)",
    whiteSpace: "nowrap",
  };

  return (
    <div>
      {/* Scrollable table */}
      <div style={{ overflowX: "auto", borderRadius: 14, border: "1px solid rgba(99,102,241,0.12)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(99,102,241,0.06)" }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#6b6b80",
                    fontFamily: "var(--font-syne)",
                    whiteSpace: "nowrap",
                    width: col.width,
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: pageSize }).map((_, i) => (
                  <SkeletonRow key={i} cols={columns.length} />
                ))
              : paged.length === 0
                ? (
                  <tr>
                    <td colSpan={columns.length} style={{ padding: "60px 16px", textAlign: "center" }}>
                      <div style={{ color: "#6b6b80" }}>
                        {emptyIcon && <div style={{ fontSize: 40, marginBottom: 12 }}>{emptyIcon}</div>}
                        <p style={{ fontFamily: "var(--font-syne)", fontSize: 15, fontWeight: 600, marginBottom: 4, color: "#9898b0" }}>
                          {emptyMessage}
                        </p>
                        <p style={{ fontSize: 13 }}>Try adjusting your search or add a new record.</p>
                      </div>
                    </td>
                  </tr>
                )
                : paged.map((row) => (
                  <tr
                    key={row.id}
                    style={{ transition: "background 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(99,102,241,0.05)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {columns.map((col) => (
                      <td key={col.key} style={tdStyle}>
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
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              style={{ padding: "7px 14px", borderRadius: 8, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: safePage === 1 ? "#6b6b80" : "#e8e8f0", cursor: safePage === 1 ? "not-allowed" : "pointer", fontSize: 13 }}
            >
              ← Prev
            </button>
            <span style={{ padding: "7px 14px", fontSize: 13, color: "#9898b0" }}>{safePage} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              style={{ padding: "7px 14px", borderRadius: 8, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: safePage === totalPages ? "#6b6b80" : "#e8e8f0", cursor: safePage === totalPages ? "not-allowed" : "pointer", fontSize: 13 }}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
