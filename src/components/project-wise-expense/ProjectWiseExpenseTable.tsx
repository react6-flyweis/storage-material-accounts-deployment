import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Calendar,
  Eye,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  RefreshCw,
  Info,
} from "lucide-react";
import type {
  ProjectWiseExpenseRowItem,
  PaginationInfo,
} from "@/redux/api/reportsApi";
import CalendarRangePickerModal, {
  type CalendarRangePickerRange,
} from "@/components/common_components/CalendarRangePickerModal";
import { formatCurrency, formatDateToIso } from "@/lib/dashboardFormatters";

export interface ProjectWiseExpenseTableProps {
  rows?: ProjectWiseExpenseRowItem[];
  pagination?: PaginationInfo;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  rowsPerPage?: number;
  onRowsPerPageChange?: (limit: number) => void;
  searchTerm?: string;
  onSearchChange?: (search: string) => void;
  dateRangeText?: string;
  onDateRangeChange?: (
    startDate?: string,
    endDate?: string,
    displayText?: string
  ) => void;
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

type SortField =
  | "projectName"
  | "totalExpense"
  | "approvedExpense"
  | "pendingApproval"
  | "budgetedExpense"
  | "budgetVariance"
  | "variancePct";

export const ProjectWiseExpenseTable: React.FC<ProjectWiseExpenseTableProps> = ({
  rows = [],
  pagination,
  currentPage = 1,
  onPageChange,
  rowsPerPage = 10,
  onRowsPerPageChange,
  searchTerm = "",
  onSearchChange,
  dateRangeText = "",
  onDateRangeChange,
  isLoading = false,
  isFetching = false,
  isError = false,
  onRetry,
}) => {
  const navigate = useNavigate();

  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

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

  const totalPages = pagination?.totalPages || 1;
  const totalEntries = pagination?.total || rows.length;
  const startEntry = totalEntries === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endEntry = Math.min(startEntry + rows.length - 1, totalEntries);

  const handleRowClick = (row: ProjectWiseExpenseRowItem) => {
    navigate(`/project-wise-expense/${row.leadId || row.projectId}`);
  };

  const handleDateApply = (range: CalendarRangePickerRange) => {
    if (range.from && range.to) {
      const isoStart = formatDateToIso(range.from);
      const isoEnd = formatDateToIso(range.to);
      const display =
        range.startDate && range.endDate
          ? `${range.startDate} - ${range.endDate}`
          : `${isoStart} - ${isoEnd}`;
      onDateRangeChange?.(isoStart, isoEnd, display);
    }
  };

  const renderPaginationButtons = () => {
    if (totalPages <= 1) return null;

    const pageNumbers: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      if (currentPage <= 3) {
        pageNumbers.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pageNumbers.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }

    return (
      <div className="flex items-center gap-1.5 text-xs">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pageNumbers.map((p, idx) => {
          if (p === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="w-6 h-6 flex items-center justify-center text-slate-400"
              >
                ...
              </span>
            );
          }
          const isCurrent = p === currentPage;
          return (
            <button
              key={`page-${p}`}
              type="button"
              onClick={() => onPageChange?.(p as number)}
              className={`w-6 h-6 rounded-full text-xs transition-colors flex items-center justify-center cursor-pointer ${
                isCurrent
                  ? "bg-[#2563EB] text-white font-bold shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 font-medium"
              }`}
            >
              {p}
            </button>
          );
        })}

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
      {/* Top Filter and Search Bar */}
      <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-slate-900 text-base sm:text-lg">
            Project-wise Expense List
          </h2>
          {isFetching && (
            <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Project Input */}
          <div className="relative min-w-[200px] sm:min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search Project or ID"
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchChange?.("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Date Range Selector Button */}
          <div className="relative">
            <div className="flex items-center rounded-lg border border-slate-200 bg-white">
              <button
                type="button"
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer rounded-lg"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{dateRangeText || "Filter by Date"}</span>
              </button>
              {dateRangeText && (
                <button
                  type="button"
                  onClick={() => onDateRangeChange?.(undefined, undefined, "")}
                  className="p-1.5 text-slate-400 hover:text-red-500 border-l border-slate-100 transition-colors cursor-pointer"
                  title="Clear date filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <CalendarRangePickerModal
              isOpen={isDatePickerOpen}
              onClose={() => setIsDatePickerOpen(false)}
              onApply={handleDateApply}
            />
          </div>
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div className="p-4 bg-red-50 border-b border-red-100 text-xs text-red-700 flex items-center justify-between">
          <span>Failed to load project-wise expense data.</span>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="underline font-semibold hover:text-red-900 cursor-pointer"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-[#F8FAFC] text-[11px] sm:text-xs text-slate-700 font-semibold">
              {/* Project Name */}
              <th
                onClick={() => handleSort("projectName")}
                className="px-5 py-3.5 cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Project Name</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Total Expense ($) */}
              <th
                onClick={() => handleSort("totalExpense")}
                className="px-5 py-3.5 cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Total Expense ($)</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Approved Expense ($) */}
              <th
                onClick={() => handleSort("approvedExpense")}
                className="px-5 py-3.5 cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Approved Expense ($)</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Pending Approval ($) */}
              <th
                onClick={() => handleSort("pendingApproval")}
                className="px-5 py-3.5 cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Pending Approval ($)</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Budgeted Expense */}
              <th
                onClick={() => handleSort("budgetedExpense")}
                className="px-5 py-3.5 cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Budgeted Expense</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Budget Variance */}
              <th
                onClick={() => handleSort("budgetVariance")}
                className="px-5 py-3.5 cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Budget Variance</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Variance % */}
              <th
                onClick={() => handleSort("variancePct")}
                className="px-5 py-3.5 cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Variance %</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Action */}
              <th className="px-5 py-3.5 select-none text-right">
                <span>Action</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs">
            {isLoading && rows.length === 0 ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={`loading-row-${idx}`}>
                  <td className="px-5 py-4">
                    <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-4 w-16 bg-slate-100 rounded animate-pulse" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-5 w-12 bg-slate-100 rounded-full animate-pulse" />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="h-7 w-7 bg-slate-100 rounded ml-auto animate-pulse" />
                  </td>
                </tr>
              ))
            ) : sortedRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <p className="font-medium text-slate-600">No project expense records found</p>
                    <p className="text-[11px] text-slate-400">
                      Try adjusting your search or date range filters
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedRows.map((row, index) => {
                const isOverBudget = (row.budgetVariance || 0) > 0;
                return (
                  <tr
                    key={`${row.leadId || row.projectId}-${index}`}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    {/* Project Name + ID & Status */}
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleRowClick(row)}
                            className="text-[#2563EB] hover:underline cursor-pointer text-left font-semibold truncate max-w-xs"
                          >
                            {row.projectName || "Unnamed Project"}
                          </button>
                          {row.status && (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 uppercase tracking-wider">
                              {row.status.replace(/_/g, " ")}
                            </span>
                          )}
                        </div>
                        {row.projectId && (
                          <span className="text-[11px] text-slate-400 font-mono mt-0.5">
                            ID: {row.projectId}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Total Expense ($) + Source Breakdown tooltip hint */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                        <span>{formatCurrency(row.totalExpense)}</span>
                        {row.sources && (
                          <span
                            title={`Breakdown:
• Manual: ${formatCurrency(row.sources.manualExpenses)}
• Material/Vendor: ${formatCurrency(row.sources.vendorMaterialFromEmailBids)}
• Freight: ${formatCurrency(row.sources.freightFromEmailBids)}`}
                            className="cursor-help text-slate-300 hover:text-slate-500"
                          >
                            <Info className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Approved Expense ($) */}
                    <td className="px-5 py-3.5 text-[#16A34A] font-medium">
                      {formatCurrency(row.approvedExpense)}
                    </td>

                    {/* Pending Approval ($) */}
                    <td className="px-5 py-3.5 text-[#D97706] font-medium">
                      {formatCurrency(row.pendingApproval)}
                    </td>

                    {/* Budgeted Expense */}
                    <td className="px-5 py-3.5 text-slate-700 font-medium">
                      {formatCurrency(row.budgetedExpense)}
                    </td>

                    {/* Budget Variance */}
                    <td
                      className={`px-5 py-3.5 font-medium ${
                        isOverBudget ? "text-rose-600" : "text-slate-600"
                      }`}
                    >
                      {row.budgetVariance > 0 ? "+" : ""}
                      {formatCurrency(row.budgetVariance)}
                    </td>

                    {/* Variance % badge */}
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                          isOverBudget
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {row.variancePct > 0 ? `+${row.variancePct.toFixed(1)}%` : `${(row.variancePct || 0).toFixed(1)}%`}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleRowClick(row)}
                        aria-label={`View details for ${row.projectName}`}
                        className="w-7 h-7 rounded border border-slate-200 inline-flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Row Per Page & Entries Count */}
        <div className="flex items-center gap-3 text-xs text-slate-500 font-normal">
          <div className="flex items-center gap-2">
            <span>Row Per Page</span>
            <div className="relative">
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  onRowsPerPageChange?.(Number(e.target.value));
                  onPageChange?.(1);
                }}
                className="appearance-none bg-white border border-slate-200 rounded-md pl-2.5 pr-6 py-1 text-xs text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-blue-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <span>Entries</span>
          </div>

          <span className="text-slate-400">|</span>

          <span>
            Showing <strong className="text-slate-700">{startEntry}</strong> to{" "}
            <strong className="text-slate-700">{endEntry}</strong> of{" "}
            <strong className="text-slate-700">{totalEntries}</strong> entries
          </span>
        </div>

        {/* Right: Pagination Page Buttons */}
        {renderPaginationButtons()}
      </div>
    </div>
  );
};

export default ProjectWiseExpenseTable;
