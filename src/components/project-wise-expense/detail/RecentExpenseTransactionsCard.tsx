import React, { useState, useMemo } from "react";
import {
  ChevronsUpDown,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  X,
  RefreshCw,
} from "lucide-react";
import type {
  ProjectWiseExpenseTransactionItem,
  PaginationInfo,
} from "@/redux/api/reportsApi";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ExpenseTransactionDetailModal from "./ExpenseTransactionDetailModal";
import DateRangePickerPopover from "@/components/project-wise-income/detail/DateRangePickerPopover";
import {
  formatCurrency,
  formatDisplayDate,
} from "@/lib/dashboardFormatters";

export interface RecentExpenseTransactionsCardProps {
  projectIdOrLeadId: string;
  transactions?: ProjectWiseExpenseTransactionItem[];
  pagination?: PaginationInfo;
  activeTab: "all" | "approved" | "pending";
  onTabChange: (tab: "all" | "approved" | "pending") => void;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  startDate?: string;
  endDate?: string;
  dateRangeText?: string;
  onDateRangeChange?: (
    startDate?: string,
    endDate?: string,
    displayText?: string
  ) => void;
  page: number;
  onPageChange: (page: number) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
  isLoading?: boolean;
  isFetching?: boolean;
}

type SortField =
  | "expenseType"
  | "date"
  | "description"
  | "reference"
  | "amount"
  | "approvalStatus";

const formatSourceBadge = (src?: string): string => {
  if (!src) return "Ledger";
  const map: Record<string, string> = {
    manual: "Manual Ledger",
    manual_expense: "Manual Ledger",
    shipper: "Vendor Bid",
    vendor_material_bid: "Vendor Bid",
    freight: "Freight Bid",
    freight_bid: "Freight Bid",
    approval: "Payment Approval",
  };
  return map[src.toLowerCase()] || src.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

export const RecentExpenseTransactionsCard: React.FC<
  RecentExpenseTransactionsCardProps
> = ({
  projectIdOrLeadId,
  transactions = [],
  pagination,
  activeTab,
  onTabChange,
  searchTerm = "",
  onSearchChange,
  startDate,
  endDate,
  dateRangeText = "",
  onDateRangeChange,
  page,
  onPageChange,
  limit,
  onLimitChange,
  isLoading = false,
  isFetching = false,
}) => {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedSource, setSelectedSource] = useState<string>("manual");
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [selectedRef, setSelectedRef] = useState<string | undefined>(undefined);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedTransactions = useMemo(() => {
    if (!sortField) return transactions;
    const sorted = [...transactions];
    sorted.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === "expenseType") {
        valA = a.expenseType || a.category || "";
        valB = b.expenseType || b.category || "";
      }

      if (typeof valA === "string" && typeof valB === "string") {
        return sortDirection === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      const numA = Number(valA) || 0;
      const numB = Number(valB) || 0;
      return sortDirection === "asc" ? numA - numB : numB - numA;
    });
    return sorted;
  }, [transactions, sortField, sortDirection]);

  const totalPages = pagination?.totalPages || 1;
  const totalEntries = pagination?.total || transactions.length;
  const startEntry = totalEntries === 0 ? 0 : (page - 1) * limit + 1;
  const endEntry = Math.min(startEntry + transactions.length - 1, totalEntries);

  const handleViewRecord = (tx: ProjectWiseExpenseTransactionItem) => {
    let src = tx.source || "manual";
    let id = tx.recordId;
    if (tx.recordId && tx.recordId.includes(":")) {
      const parts = tx.recordId.split(":");
      src = parts[0];
      id = parts.slice(1).join(":");
    }
    setSelectedSource(src);
    setSelectedRecordId(id);
    setSelectedRef(tx.reference);
  };

  const renderPaginationButtons = () => {
    if (totalPages <= 1) return null;

    const pageNumbers: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      if (page <= 3) {
        pageNumbers.push(1, 2, 3, 4, "...", totalPages);
      } else if (page >= totalPages - 2) {
        pageNumbers.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pageNumbers.push(1, "...", page - 1, page, page + 1, "...", totalPages);
      }
    }

    return (
      <div className="flex items-center gap-1.5 text-xs">
        <button
          type="button"
          disabled={page <= 1 || isFetching}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pageNumbers.map((p, idx) => {
          if (p === "...") {
            return (
              <span key={`ellipsis-${idx}`} className="text-slate-400 px-1 select-none">
                ...
              </span>
            );
          }
          const isCurrent = p === page;
          return (
            <button
              key={`page-${p}`}
              type="button"
              disabled={isFetching}
              onClick={() => onPageChange(p as number)}
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
          disabled={page >= totalPages || isFetching}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Tabs Row (All in first position, Approved, Pending) */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-6 border-b border-transparent">
          <button
            type="button"
            onClick={() => {
              onTabChange("all");
              onPageChange(1);
            }}
            className={`pb-2 text-sm font-semibold transition-colors cursor-pointer border-b-2 ${
              activeTab === "all"
                ? "text-[#2563EB] border-[#2563EB]"
                : "text-slate-500 border-transparent hover:text-slate-800"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => {
              onTabChange("approved");
              onPageChange(1);
            }}
            className={`pb-2 text-sm font-semibold transition-colors cursor-pointer border-b-2 ${
              activeTab === "approved"
                ? "text-[#2563EB] border-[#2563EB]"
                : "text-slate-500 border-transparent hover:text-slate-800"
            }`}
          >
            Approved
          </button>
          <button
            type="button"
            onClick={() => {
              onTabChange("pending");
              onPageChange(1);
            }}
            className={`pb-2 text-sm font-semibold transition-colors cursor-pointer border-b-2 ${
              activeTab === "pending"
                ? "text-[#2563EB] border-[#2563EB]"
                : "text-slate-500 border-transparent hover:text-slate-800"
            }`}
          >
            Pending
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
        {/* Card Header with Search & Date Range Popover */}
        <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">
              Recent Expense Transactions
            </h3>
            {isFetching && !isLoading && (
              <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-50 sm:min-w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  onSearchChange?.(e.target.value);
                  onPageChange(1);
                }}
                placeholder="Search reference, description..."
                className="h-8 pl-9 pr-8 text-xs bg-white border-slate-200"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    onSearchChange?.("");
                    onPageChange(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Date Range Selector Popover */}
            <DateRangePickerPopover
              startDate={startDate}
              endDate={endDate}
              dateRangeText={dateRangeText}
              onApply={(start, end, text) => {
                onDateRangeChange?.(start, end, text);
                onPageChange(1);
              }}
            />
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-[#F8FAFC] text-[11px] sm:text-xs text-slate-700 font-semibold">
                <th
                  onClick={() => handleSort("expenseType")}
                  className="px-5 py-3.5 cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Category / Type</span>
                    <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("date")}
                  className="px-5 py-3.5 cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Date</span>
                    <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("description")}
                  className="px-5 py-3.5 cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Description</span>
                    <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("reference")}
                  className="px-5 py-3.5 cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Reference No.</span>
                    <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                <th className="px-5 py-3.5 select-none">
                  <span>Source</span>
                </th>

                <th
                  onClick={() => handleSort("amount")}
                  className="px-5 py-3.5 cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Amount</span>
                    <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                <th className="px-5 py-3.5 select-none">
                  <span>Status</span>
                </th>

                <th className="px-5 py-3.5 select-none text-right">
                  <span>Action</span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                      <span>Loading expense transactions...</span>
                    </div>
                  </td>
                </tr>
              ) : sortedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    No transactions found for {activeTab}
                  </td>
                </tr>
              ) : (
                sortedTransactions.map((tx) => (
                  <tr
                    key={tx.recordId}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-5 py-4 font-semibold text-slate-900 capitalize">
                      {tx.expenseType || tx.category || "-"}
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {formatDisplayDate(tx.date)}
                    </td>

                    <td className="px-5 py-4 text-slate-600 max-w-xs truncate">
                      {tx.description || "-"}
                    </td>

                    <td className="px-5 py-4 font-semibold text-[#16A34A]">
                      {tx.reference || "-"}
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-sm bg-slate-100 text-slate-600">
                        {formatSourceBadge(tx.source)}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {formatCurrency(tx.amount)}
                    </td>

                    <td className="px-5 py-4">
                      <Badge
                        variant="outline"
                        className={`text-[11px] font-semibold border ${
                          (tx.approvalStatus || tx.status || "").toLowerCase() ===
                            "approved" ||
                          (tx.approvalStatus || tx.status || "").toLowerCase() ===
                            "paid"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-amber-200 bg-amber-50 text-amber-700"
                        }`}
                      >
                        {tx.approvalStatus || tx.status || "-"}
                      </Badge>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleViewRecord(tx)}
                        aria-label={`View record ${tx.reference || tx.recordId}`}
                        className="w-7 h-7 rounded border border-slate-200 inline-flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-slate-500 font-normal">
            <div className="flex items-center gap-2">
              <span>Row Per Page</span>
              <div className="relative">
                <select
                  value={limit}
                  onChange={(e) => {
                    onLimitChange(Number(e.target.value));
                    onPageChange(1);
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

          {renderPaginationButtons()}
        </div>
      </div>

      {/* Expense Transaction Detail Modal */}
      <ExpenseTransactionDetailModal
        isOpen={Boolean(selectedRecordId)}
        onClose={() => {
          setSelectedRecordId(null);
          setSelectedRef(undefined);
        }}
        projectIdOrLeadId={projectIdOrLeadId}
        source={selectedSource}
        recordId={selectedRecordId}
        fallbackReference={selectedRef}
      />
    </div>
  );
};

export default RecentExpenseTransactionsCard;
