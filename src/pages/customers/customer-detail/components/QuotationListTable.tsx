import { useState, useMemo } from "react";
import {
  Search,
  Eye,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import type { ProjectQuotationItem } from "@/redux/api/projectApi";
import { formatCurrency, formatDate } from "@/modules/customers/customer-utils";

export interface QuotationListTableProps {
  quotations: ProjectQuotationItem[];
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
  onSelectQuotation: (quotation: ProjectQuotationItem) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  searchTerm: string;
  onSearchChange: (search: string) => void;
  projectName?: string;
  total?: number;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending" },
  { value: "pending_approval", label: "Pending Approval" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "admin_rejected", label: "Admin Rejected" },
  { value: "sent", label: "Sent" },
  { value: "accepted", label: "Accepted" },
  { value: "customer_accepted", label: "Accepted by Customer" },
  { value: "customer_rejected", label: "Declined by Customer" },
];

export function renderQuotationStatusBadge(statusRaw?: string, approvalStatusRaw?: string) {
  const normStatus = (statusRaw || "").toLowerCase().trim().replace(/[\s-]/g, "_");
  const normApproval = (approvalStatusRaw || "").toLowerCase().trim().replace(/[\s-]/g, "_");

  // Customer decisions
  if (normStatus === "customer_accepted" || normApproval === "customer_accepted") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        Accepted by Customer
      </span>
    );
  }

  if (normStatus === "customer_rejected" || normApproval === "customer_rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <AlertCircle className="w-3 h-3 text-rose-600" />
        Declined by Customer
      </span>
    );
  }

  // Approved
  if (normStatus === "approved" || normApproval === "approved") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
        <CheckCircle2 className="w-3 h-3 text-green-600" />
        Approved
      </span>
    );
  }

  // Pending
  if (
    normStatus === "pending_approval" ||
    normApproval === "pending_approval" ||
    normStatus === "pending"
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <Clock className="w-3 h-3 text-amber-600" />
        Pending Approval
      </span>
    );
  }

  // Rejected
  if (
    normStatus === "admin_rejected" ||
    normApproval === "rejected" ||
    normStatus === "rejected"
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
        <AlertCircle className="w-3 h-3 text-red-600" />
        Rejected
      </span>
    );
  }

  // Sent
  if (normStatus === "sent") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
        Sent to Customer
      </span>
    );
  }

  // Accepted
  if (normStatus === "accepted") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        Accepted
      </span>
    );
  }

  // Default: Draft
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      Draft
    </span>
  );
}

export function QuotationListTable({
  quotations,
  isLoading,
  isError,
  onRetry,
  onSelectQuotation,
  statusFilter,
  onStatusFilterChange,
  searchTerm,
  onSearchChange,
  total,
}: QuotationListTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Filter items in memory by search term if provided
  const filteredQuotations = useMemo(() => {
    if (!searchTerm.trim()) return quotations;
    const term = searchTerm.toLowerCase().trim();
    return quotations.filter((q) => {
      const qNum = (q.quotationNumber || q.quoteNumber || q.quotationId || "").toLowerCase();
      const status = (q.status || "").toLowerCase();
      const approval = (q.approvalStatus || "").toLowerCase();
      const bType = (q.buildingType || "").toLowerCase();
      return (
        qNum.includes(term) ||
        status.includes(term) ||
        approval.includes(term) ||
        bType.includes(term)
      );
    });
  }, [quotations, searchTerm]);

  const totalItems = total ?? filteredQuotations.length;
  const totalPages = Math.max(1, Math.ceil(filteredQuotations.length / rowsPerPage));

  // Current page slice
  const paginatedQuotations = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredQuotations.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredQuotations, currentPage, rowsPerPage]);

  const hasActiveFilters = Boolean(searchTerm.trim() || (statusFilter && statusFilter !== "all"));

  const handleClearFilters = () => {
    onSearchChange("");
    onStatusFilterChange("all");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar matching Sales Panel Lead Quotations tab */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by Quote ID, building type, status..."
              value={searchTerm}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-8 text-xs h-9 bg-slate-50 border-slate-200 focus:bg-white"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative min-w-42.5">
              <select
                value={statusFilter}
                onChange={(e) => {
                  onStatusFilterChange(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs h-9 px-3 py-1 bg-white border border-slate-200 rounded-md text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs text-slate-500 hover:text-slate-800 h-9 px-2 gap-1"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Reset</span>
              </Button>
            )}
          </div>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-2 text-xs text-slate-500 justify-end">
          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-semibold rounded-md border border-blue-100">
            {totalItems} {totalItems === 1 ? "Quotation" : "Quotations"}
          </span>
        </div>
      </div>

      {/* Error State Banner */}
      {isError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>Failed to load project quotations. Please check connection and try again.</span>
          </div>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="text-xs h-7 border-red-200 text-red-700 hover:bg-red-100 bg-white"
            >
              Retry
            </Button>
          )}
        </div>
      )}

      {/* Quotations Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 border-b border-slate-200">
            <TableRow>
              <TableHead className="text-slate-600 text-xs font-semibold uppercase tracking-wider py-3.5 px-5">
                Quote ID
              </TableHead>
              <TableHead className="text-slate-600 text-xs font-semibold uppercase tracking-wider py-3.5 px-4">
                Status
              </TableHead>
              <TableHead className="text-slate-600 text-xs font-semibold uppercase tracking-wider py-3.5 px-4">
                Quotation Value
              </TableHead>
              <TableHead className="text-slate-600 text-xs font-semibold uppercase tracking-wider py-3.5 px-4">
                Version
              </TableHead>
              <TableHead className="text-slate-600 text-xs font-semibold uppercase tracking-wider py-3.5 px-4">
                Proposal Date
              </TableHead>
              <TableHead className="text-slate-600 text-xs font-semibold uppercase tracking-wider py-3.5 px-5 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              // Loading Skeleton
              Array.from({ length: 4 }).map((_, idx) => (
                <TableRow key={`skeleton-${idx}`} className="animate-pulse">
                  <TableCell className="px-5 py-4">
                    <div className="h-4 bg-slate-200 rounded w-28" />
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <div className="h-5 bg-slate-200 rounded-full w-24" />
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <div className="h-4 bg-slate-200 rounded w-20" />
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <div className="h-4 bg-slate-200 rounded w-10" />
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <div className="h-4 bg-slate-200 rounded w-24" />
                  </TableCell>
                  <TableCell className="px-5 py-4 text-right">
                    <div className="h-8 bg-slate-200 rounded w-16 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : paginatedQuotations.length === 0 ? (
              // Empty State
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <div className="max-w-sm mx-auto space-y-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">
                        No Quotations Found
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {hasActiveFilters
                          ? "No quotations match your current search and filter criteria."
                          : "There are no quotations created for this project yet."}
                      </p>
                    </div>
                    {hasActiveFilters && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearFilters}
                        className="text-xs mt-2"
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              // Data Rows
              paginatedQuotations.map((quotation) => {
                const quoteIdStr =
                  quotation.quotationNumber ||
                  quotation.quoteNumber ||
                  quotation.quotationId ||
                  "QUO-DRAFT";
                const price = quotation.finalPrice ?? 0;
                const currency = quotation.currency || "USD";
                const dateStr = quotation.proposalDate || quotation.createdAt;

                return (
                  <TableRow
                    key={quotation.quotationId || quotation._id}
                    onClick={() => onSelectQuotation(quotation)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                  >
                    {/* QUOTE ID */}
                    <TableCell className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-blue-600 group-hover:underline text-sm">
                          {quoteIdStr}
                        </span>
                        {quotation.buildingType && (
                          <span className="text-xs text-slate-400 mt-0.5">
                            {quotation.buildingType}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* STATUS */}
                    <TableCell className="px-4 py-4">
                      {renderQuotationStatusBadge(quotation.status, quotation.approvalStatus)}
                    </TableCell>

                    {/* QUOTATION VALUE */}
                    <TableCell className="px-4 py-4">
                      <span className="font-bold text-slate-900 text-sm">
                        {formatCurrency(price, currency)}
                      </span>
                    </TableCell>

                    {/* VERSION */}
                    <TableCell className="px-4 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        v{quotation.versionNumber || 1}
                      </span>
                    </TableCell>

                    {/* PROPOSAL DATE */}
                    <TableCell className="px-4 py-4 text-xs text-slate-600">
                      {formatDate(dateStr)}
                    </TableCell>

                    {/* ACTIONS */}
                    <TableCell className="px-5 py-4 text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectQuotation(quotation);
                        }}
                        className="h-8 px-3 text-xs font-medium text-slate-700 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-600" />
                        <span>View</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
              {Math.min(currentPage * rowsPerPage, filteredQuotations.length)} of{" "}
              {filteredQuotations.length} records
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-7 w-7 p-0 text-slate-600"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={`page-${i + 1}`}
                  type="button"
                  onClick={() => setCurrentPage(i + 1)}
                  className={`h-7 w-7 rounded text-xs font-medium transition-colors ${
                    currentPage === i + 1
                      ? "bg-[#2563EB] text-white"
                      : "text-slate-600 hover:bg-slate-200 bg-white border border-slate-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="h-7 w-7 p-0 text-slate-600"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
