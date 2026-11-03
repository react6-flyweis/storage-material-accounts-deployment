import React, { useState, useMemo } from "react";
import {
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  FileText,
} from "lucide-react";
import type { ProfitLossRowItem } from "@/redux/api/reportsApi";
import { formatCurrency } from "@/lib/dashboardFormatters";

export interface ProfitLossSummaryTableProps {
  rows?: ProfitLossRowItem[];
  total?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  rowsPerPage?: number;
  onRowsPerPageChange?: (limit: number) => void;
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

type SortField =
  | "invoiceNumber"
  | "projectName"
  | "date"
  | "revenue"
  | "expense"
  | "netProfit"
  | "margin"
  | "status";

export const ProfitLossSummaryTable: React.FC<ProfitLossSummaryTableProps> = ({
  rows = [],
  total,
  currentPage = 1,
  onPageChange,
  rowsPerPage = 20,
  onRowsPerPageChange,
  isLoading = false,
  isFetching = false,
  isError = false,
  onRetry,
}) => {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Direct rows with optional column sorting (no client filtering)
  const sortedRows = useMemo(() => {
    if (!sortField) return rows;
    const sorted = [...rows];
    sorted.sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === "string" && typeof valB === "string") {
        return sortDirection === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      const numA = (valA as number) || 0;
      const numB = (valB as number) || 0;
      return sortDirection === "asc" ? numA - numB : numB - numA;
    });
    return sorted;
  }, [rows, sortField, sortDirection]);

  // Page calculations
  const totalEntries = total ?? rows.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / rowsPerPage));
  const startEntry = totalEntries === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endEntry = Math.min(startEntry + rows.length - 1, totalEntries);

  // Totals for visible rows in current view
  const visibleTotals = useMemo(() => {
    return sortedRows.reduce(
      (acc, r) => {
        acc.revenue += r.revenue || 0;
        acc.expense += r.expense || 0;
        acc.netProfit += r.netProfit || 0;
        return acc;
      },
      { revenue: 0, expense: 0, netProfit: 0 }
    );
  }, [sortedRows]);

  const visibleAvgMargin =
    visibleTotals.revenue > 0
      ? (visibleTotals.netProfit / visibleTotals.revenue) * 100
      : 0;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const renderStatusBadge = (status?: string) => {
    const s = (status || "unknown").toLowerCase();
    let badgeClass = "bg-slate-100 text-slate-700 border-slate-200";

    if (s === "paid") {
      badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
    } else if (s === "pending" || s === "unpaid") {
      badgeClass = "bg-amber-50 text-amber-700 border-amber-200";
    } else if (s === "overdue") {
      badgeClass = "bg-rose-50 text-rose-700 border-rose-200";
    } else if (s === "partially_paid") {
      badgeClass = "bg-blue-50 text-blue-700 border-blue-200";
    }

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${badgeClass}`}
      >
        {status || "—"}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
      {/* Table Card Header: Title & Search & Pagination Limit */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Invoice Profitability Breakdown
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {totalEntries} records
          </span>
          {isFetching && !isLoading && (
            <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" />
          )}
        </div>

        {/* Limit Controls */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span>Show</span>
          <div className="relative">
            <select
              value={rowsPerPage}
              onChange={(e) => onRowsPerPageChange?.(Number(e.target.value))}
              className="appearance-none bg-white border border-slate-200 rounded-lg pl-2.5 pr-6 py-1 text-xs text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-blue-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <span>per page</span>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-212.5">
          <thead>
            <tr className="bg-[#E9EEF4]/70 text-slate-700 text-xs font-semibold border-b border-slate-200/80">
              <th
                onClick={() => handleSort("invoiceNumber")}
                className="px-4 py-3 text-left font-bold text-slate-800 cursor-pointer select-none hover:bg-slate-200/50 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Invoice #</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort("projectName")}
                className="px-4 py-3 text-left font-bold text-slate-800 cursor-pointer select-none hover:bg-slate-200/50 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Project</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort("date")}
                className="px-4 py-3 text-left font-bold text-slate-800 cursor-pointer select-none hover:bg-slate-200/50 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Date</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort("revenue")}
                className="px-4 py-3 text-right font-bold text-slate-800 cursor-pointer select-none hover:bg-slate-200/50 transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Revenue</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort("expense")}
                className="px-4 py-3 text-right font-bold text-slate-800 cursor-pointer select-none hover:bg-slate-200/50 transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Expense</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort("netProfit")}
                className="px-4 py-3 text-right font-bold text-slate-800 cursor-pointer select-none hover:bg-slate-200/50 transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Net Profit</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort("margin")}
                className="px-4 py-3 text-right font-bold text-slate-800 cursor-pointer select-none hover:bg-slate-200/50 transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Margin</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort("status")}
                className="px-4 py-3 text-center font-bold text-slate-800 cursor-pointer select-none hover:bg-slate-200/50 transition-colors"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Status</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs sm:text-[13px]">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <tr key={`skel-${idx}`} className="animate-pulse">
                  <td className="px-4 py-3.5">
                    <div className="h-4 w-24 bg-slate-100 rounded" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="space-y-1.5">
                      <div className="h-4 w-32 bg-slate-100 rounded" />
                      <div className="h-3 w-16 bg-slate-50 rounded" />
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-4 w-20 bg-slate-100 rounded" />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="h-4 w-20 bg-slate-100 rounded ml-auto" />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="h-4 w-20 bg-slate-100 rounded ml-auto" />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="h-4 w-20 bg-slate-100 rounded ml-auto" />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="h-4 w-14 bg-slate-100 rounded ml-auto" />
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="h-5 w-16 bg-slate-100 rounded-full mx-auto" />
                  </td>
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-sm text-rose-500 font-medium">
                      Failed to load profit & loss invoice data
                    </span>
                    {onRetry && (
                      <button
                        type="button"
                        onClick={onRetry}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Try Again
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : sortedRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                  No invoice records found matching your filters.
                </td>
              </tr>
            ) : (
              sortedRows.map((row) => {
                const isPositive = (row.netProfit ?? 0) >= 0;
                return (
                  <tr
                    key={row.orderId || row.invoiceNumber}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    {/* Invoice Number */}
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-blue-600 hover:underline cursor-pointer">
                          {row.invoiceNumber}
                        </span>
                      </div>
                    </td>

                    {/* Project */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800 truncate max-w-56">
                        {row.projectName || "—"}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {row.projectId || "—"}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-slate-600 font-normal">
                      {formatDate(row.date)}
                    </td>

                    {/* Revenue */}
                    <td className="px-4 py-3 text-right font-medium text-slate-800">
                      {formatCurrency(row.revenue)}
                    </td>

                    {/* Expense */}
                    <td className="px-4 py-3 text-right font-medium text-slate-700">
                      {formatCurrency(row.expense)}
                    </td>

                    {/* Net Profit */}
                    <td
                      className={`px-4 py-3 text-right font-bold ${
                        isPositive ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {formatCurrency(row.netProfit)}
                    </td>

                    {/* Margin */}
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-semibold ${
                          (row.margin ?? 0) >= 0
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        {(row.margin ?? 0).toFixed(1)}%
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      {renderStatusBadge(row.status)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Visible Page Summary Row */}
          {sortedRows.length > 0 && !isLoading && (
            <tfoot>
              <tr className="bg-slate-50/80 font-bold text-slate-900 border-t border-slate-200">
                <td colSpan={3} className="px-4 py-3 text-slate-800">
                  Current Page Subtotal ({sortedRows.length} rows)
                </td>
                <td className="px-4 py-3 text-right text-slate-900">
                  {formatCurrency(visibleTotals.revenue)}
                </td>
                <td className="px-4 py-3 text-right text-slate-900">
                  {formatCurrency(visibleTotals.expense)}
                </td>
                <td
                  className={`px-4 py-3 text-right ${
                    visibleTotals.netProfit >= 0
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  {formatCurrency(visibleTotals.netProfit)}
                </td>
                <td
                  className={`px-4 py-3 text-right ${
                    visibleAvgMargin >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {visibleAvgMargin.toFixed(1)}%
                </td>
                <td className="px-4 py-3" />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="px-4 sm:px-5 py-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white">
        <span className="text-xs text-slate-500 font-normal">
          Showing <span className="font-semibold text-slate-700">{startEntry}</span>{" "}
          to <span className="font-semibold text-slate-700">{endEntry}</span> of{" "}
          <span className="font-semibold text-slate-700">{totalEntries}</span> entries
        </span>

        {/* Page Buttons */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            disabled={currentPage <= 1 || isLoading}
            onClick={() => onPageChange?.(currentPage - 1)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
            // Sliding window around current page
            let pageNum = idx + 1;
            if (totalPages > 5) {
              if (currentPage > 3 && currentPage < totalPages - 2) {
                pageNum = currentPage - 2 + idx;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + idx;
              }
            }

            const isActive = pageNum === currentPage;
            return (
              <button
                key={`page-${pageNum}`}
                type="button"
                onClick={() => onPageChange?.(pageNum)}
                disabled={isLoading}
                className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? "bg-[#0284C7] text-white shadow-2xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            type="button"
            disabled={currentPage >= totalPages || isLoading}
            onClick={() => onPageChange?.(currentPage + 1)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            aria-label="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfitLossSummaryTable;
