"use client";

import { useMemo, useState } from "react";

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

function EmptyState({ message, icon }: { message: string; icon?: React.ReactNode }) {
  return (
    <div className="py-16 text-center text-[#64748b]">
      {icon ? (
        <div className="mb-3 text-4xl">{icon}</div>
      ) : (
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf2ff] text-[#1267e8]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      )}
      <p className="text-sm font-bold text-[#0f172a]">{message}</p>
      <p className="mt-1 text-xs text-[#94a3b8]">Try adjusting your search criteria or add a new entry.</p>
    </div>
  );
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div
            className="skeleton h-4"
            style={{ width: i === 0 ? "40px" : `${55 + (i * 12) % 35}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

export default function DataTable<T extends { id: string }>({
  columns,
  data,
  loading = false,
  searchQuery = "",
  searchKeys = [],
  pageSize = 10,
  emptyMessage = "No records found.",
  emptyIcon,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!searchQuery.trim() || searchKeys.length === 0) return data;
    const q = searchQuery.toLowerCase();
    return data.filter((row) =>
      searchKeys.some((k) => String(row[k] ?? "").toLowerCase().includes(q))
    );
  }, [data, searchQuery, searchKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#64748b]"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1f5f9]">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} cols={columns.length} />
              ))
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState message={emptyMessage} icon={emptyIcon} />
                </td>
              </tr>
            ) : (
              paged.map((row) => (
                <tr
                  key={row.id}
                  className="transition-colors hover:bg-[#f8fafc]/80"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-5 py-3.5 text-sm text-[#1e293b]">
                      {col.render ? col.render(row) : String((row as any)[col.key] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && filtered.length > pageSize && (
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#e2e8f0] bg-[#f8fafc] px-5 py-3 text-xs">
          <p className="text-[#64748b]">
            Showing <span className="font-semibold text-[#0f172a]">{(safePage - 1) * pageSize + 1}</span>–
            <span className="font-semibold text-[#0f172a]">{Math.min(safePage * pageSize, filtered.length)}</span> of{" "}
            <span className="font-semibold text-[#0f172a]">{filtered.length}</span> records
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 font-semibold text-[#334155] shadow-xs transition hover:bg-[#f1f5f9] disabled:opacity-40 disabled:hover:bg-white"
            >
              Previous
            </button>
            <span className="rounded-lg bg-[#eaf2ff] px-2.5 py-1 font-bold text-[#1267e8]">
              {safePage} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 font-semibold text-[#334155] shadow-xs transition hover:bg-[#f1f5f9] disabled:opacity-40 disabled:hover:bg-white"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
