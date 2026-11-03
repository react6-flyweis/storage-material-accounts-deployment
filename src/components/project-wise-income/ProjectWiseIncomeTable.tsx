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
} from "lucide-react";
import type {
  ProjectWiseIncomeRowItem,
  PaginationInfo,
} from "@/redux/api/reportsApi";
import CalendarRangePickerModal, {
  type CalendarRangePickerRange,
} from "@/components/common_components/CalendarRangePickerModal";
import { formatCurrency, formatDateToIso } from "@/lib/dashboardFormatters";

export interface ProjectWiseIncomeTableProps {
  rows?: ProjectWiseIncomeRowItem[];
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
  | "totalIncome"
  | "receivedIncome"
  | "pendingIncome"
  | "overdueIncome"
  | "receivedPct";

export const ProjectWiseIncomeTable: React.FC<ProjectWiseIncomeTableProps> = ({
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

  const handleRowClick = (row: ProjectWiseIncomeRowItem) => {
    navigate(`/project-wise-income/${row.leadId || row.projectId}`);
  };

  const handleDateApply = (range: CalendarRangePickerRange) => {
    if (range.from && range.to) {
      const isoStart = formatDateToIso(range.from);
      const isoEnd = formatDateToIso(range.to);
      const display = range.startDate && range.endDate
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
        pageNumbers.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pageNumbers.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }

    return (
      <div className="flex items-center gap-1.5 text-xs">
        <button
          type="button"
          disabled={currentPage <= 1 || isFetching}
          onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pageNumbers.map((page, index) => {
          if (typeof page === "string") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="text-slate-400 px-1 select-none"
              >
                ...
              </span>
            );
          }
          const isCurrent = page === currentPage;
          return (
            <button
              key={`page-${page}`}
              type="button"
              disabled={isFetching}
              onClick={() => onPageChange?.(page)}
              className={`w-6 h-6 rounded-full text-xs transition-colors flex items-center justify-center cursor-pointer ${
                isCurrent
                  ? "bg-[#2563EB] text-white font-bold shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 font-medium"
              }`}
            >
              {page}
            </button>
          );
        })}

        <button
          type="button"
          disabled={currentPage >= totalPages || isFetching}
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
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-slate-900 text-base sm:text-lg">
            Project-wise Income List
          </h2>
          {isFetching && !isLoading && (
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
              placeholder="Search Project or Job ID"
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
          <span>Failed to load project-wise income data.</span>
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

              {/* Total Income ($) */}
              <th
                onClick={() => handleSort("totalIncome")}
                className="px-5 py-3.5 cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Total Income ($)</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Received Income ($) */}
              <th
                onClick={() => handleSort("receivedIncome")}
                className="px-5 py-3.5 cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Received Income ($)</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Pending Income ($) */}
              <th
                onClick={() => handleSort("pendingIncome")}
                className="px-5 py-3.5 cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Pending Income ($)</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Overdue Income */}
              <th
                onClick={() => handleSort("overdueIncome")}
                className="px-5 py-3.5 cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Overdue Income</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Received % */}
              <th
                onClick={() => handleSort("receivedPct")}
                className="px-5 py-3.5 cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Received %</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Action */}
              <th className="px-5 py-3.5 select-none">
                <div className="flex items-center gap-1.5">
                  <span>Action</span>
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs">
            {isLoading ? (
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
                    <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-7 w-7 bg-slate-100 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : sortedRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-slate-400">
                  No projects found for the selected criteria
                </td>
              </tr>
            ) : (
              sortedRows.map((row, index) => {
                const displayName = row.projectName || row.projectId || "Unnamed Project";
                const displayPercentage = typeof row.receivedPct === "number"
                  ? Math.round(row.receivedPct * 10) / 10
                  : 0;

                return (
                  <tr
                    key={`${row.leadId || row.projectId || index}`}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    {/* Project Name & Job ID */}
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => handleRowClick(row)}
                        className="text-[#2563EB] hover:underline cursor-pointer text-left font-semibold block"
                      >
                        {displayName}
                      </button>
                      {row.projectName && row.projectId && row.projectName !== row.projectId && (
                        <span className="text-[11px] text-slate-400 font-normal block mt-0.5">
                          {row.projectId}
                        </span>
                      )}
                    </td>

                    {/* Total Income ($) */}
                    <td className="px-5 py-4 text-slate-800 font-medium">
                      {formatCurrency(row.totalIncome)}
                    </td>

                    {/* Received Income ($) */}
                    <td className="px-5 py-4 text-[#16A34A] font-medium">
                      {formatCurrency(row.receivedIncome)}
                    </td>

                    {/* Pending Income ($) */}
                    <td className="px-5 py-4 text-[#D97706] font-medium">
                      {formatCurrency(row.pendingIncome)}
                    </td>

                    {/* Overdue Income */}
                    <td className="px-5 py-4 text-slate-600 font-medium">
                      {formatCurrency(row.overdueIncome)}
                    </td>

                    {/* Received % */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-700 w-10">
                          {displayPercentage}%
                        </span>
                        <div className="w-20 sm:w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#10B981] rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(100, Math.max(0, displayPercentage))}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => handleRowClick(row)}
                        aria-label={`View details for ${displayName}`}
                        className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors cursor-pointer"
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
        {/* Left: Row Per Page and entry count */}
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

          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="hidden sm:inline">
            Showing {startEntry} to {endEntry} of {totalEntries} entries
          </span>
        </div>

        {/* Right: Page buttons */}
        {renderPaginationButtons()}
      </div>
    </div>
  );
};

export default ProjectWiseIncomeTable;
