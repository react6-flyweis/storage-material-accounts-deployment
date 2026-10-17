import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Eye,
  Loader2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetProfitLossSummaryQuery,
  type ProfitLossSummaryRow,
} from "@/redux/api/marginAnalysisApi";
import { formatCompanyEnum, type MarginFilters } from "./types";

export interface ProfitLossSummaryTableProps {
  filters?: MarginFilters;
  onOpenAnalysisModal?: (projectId?: string) => void;
  rows?: ProfitLossSummaryRow[];
  totalRecords?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  isLoading?: boolean;
  isFetching?: boolean;
}

const formatCurrency = (val: number | undefined | null) => {
  if (val == null || isNaN(val)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

const formatPercent = (val: number | undefined | null) => {
  if (val == null || isNaN(val)) return "0.00%";
  return `${Number(val).toFixed(2)}%`;
};

export const ProfitLossSummaryTable: React.FC<ProfitLossSummaryTableProps> = ({
  filters,
  onOpenAnalysisModal,
  rows: propRows,
  totalRecords: propTotalRecords,
  currentPage: propCurrentPage,
  pageSize: propPageSize,
  onPageChange: propOnPageChange,
  onPageSizeChange: propOnPageSizeChange,
  searchValue: propSearchValue,
  onSearchChange: propOnSearchChange,
  isLoading: propIsLoading,
  isFetching: propIsFetching,
}) => {
  const [internalSearch, setInternalSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [internalPageSize, setInternalPageSize] = useState(10);
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);

  // Debounce search input (350ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(internalSearch);
      setInternalCurrentPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [internalSearch]);

  // Reset page to 1 when global filters change
  const currentFilterKey = `${filters?.companyId}-${filters?.projectId}-${filters?.startDate}-${filters?.endDate}`;
  const [prevFilterKey, setPrevFilterKey] = useState(currentFilterKey);
  if (prevFilterKey !== currentFilterKey) {
    setPrevFilterKey(currentFilterKey);
    setInternalCurrentPage(1);
  }

  const plSummaryQueryParams = useMemo(() => {
    return {
      search: debouncedSearch.trim() || undefined,
      page: internalCurrentPage,
      limit: internalPageSize,
      startDate: filters?.startDate || undefined,
      endDate: filters?.endDate || undefined,
      businessUnit:
        filters?.companyId && filters.companyId !== "all"
          ? filters.companyId
          : undefined,
      projectId:
        filters?.projectId && filters.projectId !== "all"
          ? filters.projectId
          : undefined,
    };
  }, [debouncedSearch, internalCurrentPage, internalPageSize, filters]);

  const {
    data: fetchedData,
    isLoading: isQueryLoading,
    isFetching: isQueryFetching,
  } = useGetProfitLossSummaryQuery(plSummaryQueryParams, {
    skip: Boolean(propRows),
  });

  const rows = propRows ?? fetchedData?.rows ?? [];
  const totalRecords = propTotalRecords ?? fetchedData?.total ?? 0;
  const currentPage = propCurrentPage ?? internalCurrentPage;
  const pageSize = propPageSize ?? internalPageSize;
  const onPageChange = propOnPageChange ?? setInternalCurrentPage;
  const onPageSizeChange = propOnPageSizeChange ?? setInternalPageSize;
  const searchValue = propSearchValue ?? internalSearch;
  const onSearchChange = propOnSearchChange ?? setInternalSearch;
  const handleOpenAnalysisModal = onOpenAnalysisModal ?? (() => {});
  const isLoading = propIsLoading ?? isQueryLoading;
  const isFetching = propIsFetching ?? isQueryFetching;

  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
      {/* Table Top Header */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base md:text-lg font-bold text-gray-900">
            Profit & Loss Summary
          </h2>
          {isFetching && (
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search Project"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full sm:w-56 pl-9 pr-3 py-1.5 text-xs md:text-sm border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* View P&L Analysis Modal Button */}
          <button
            onClick={() => handleOpenAnalysisModal()}
            className="border border-purple-200 bg-purple-50/40 hover:bg-purple-100/60 text-purple-700 font-medium text-xs md:text-sm px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
            <span>View Profit & Loss Analysis</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs md:text-sm">
          <thead className="bg-[#F9FAFB] border-y border-gray-100 text-xs font-semibold text-gray-800">
            <tr>
              <th className="py-3 px-4 font-semibold text-gray-900">Project Name</th>
              <th className="py-3 px-4 font-semibold text-gray-900">Category</th>
              <th className="py-3 px-4 font-semibold text-gray-900">Sales (USD)</th>
              <th className="py-3 px-4 font-semibold text-gray-900">COGS (USD)</th>
              <th className="py-3 px-4 font-semibold text-gray-900">Gross Profit (USD)</th>
              <th className="py-3 px-4 font-semibold text-gray-900">Gross Margin</th>
              <th className="py-3 px-4 font-semibold text-gray-900 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading || (!rows.length && isFetching) ? (
              Array.from({ length: Math.min(pageSize, 5) }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-3.5 px-4">
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-32 bg-gray-200/90" />
                      <Skeleton className="h-3 w-16 bg-gray-100" />
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <Skeleton className="h-4 w-20 bg-gray-100" />
                  </td>
                  <td className="py-3.5 px-4">
                    <Skeleton className="h-4 w-24 bg-gray-100" />
                  </td>
                  <td className="py-3.5 px-4">
                    <Skeleton className="h-4 w-24 bg-gray-100" />
                  </td>
                  <td className="py-3.5 px-4">
                    <Skeleton className="h-4 w-24 bg-gray-100" />
                  </td>
                  <td className="py-3.5 px-4">
                    <Skeleton className="h-4 w-16 bg-gray-100" />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Skeleton className="h-6 w-6 rounded ml-auto bg-gray-100" />
                  </td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-400">
                  No matching projects found.
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr
                  key={row.leadId || idx}
                  className="hover:bg-gray-50/70 transition-colors group"
                >
                  <td
                    onClick={() => handleOpenAnalysisModal(row.leadId)}
                    className="py-3.5 px-4 font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                  >
                    <div className="flex items-center gap-2">
                      <span>{row.projectName}</span>
                      {row.jobId && (
                        <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                          #{row.jobId}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">
                    {formatCompanyEnum(row.category) || row.category || "-"}
                  </td>
                  <td className="py-3.5 px-4 text-gray-700 font-medium">
                    {formatCurrency(row.salesUSD)}
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">
                    {formatCurrency(row.cogsUSD)}
                  </td>
                  <td
                    className={`py-3.5 px-4 font-medium ${
                      (row.grossProfitUSD ?? 0) < 0
                        ? "text-rose-600 font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    {formatCurrency(row.grossProfitUSD)}
                  </td>
                  <td
                    className={`py-3.5 px-4 font-semibold ${
                      (row.grossMarginPct ?? 0) < 0
                        ? "text-rose-600"
                        : "text-[#10B981]"
                    }`}
                  >
                    {formatPercent(row.grossMarginPct)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleOpenAnalysisModal(row.leadId)}
                      className="p-1 rounded text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer inline-flex items-center gap-1 text-xs"
                      title="View Detailed Analysis"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden group-hover:inline text-[11px] font-medium text-purple-600">
                        View
                      </span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Row */}
      <div className="p-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm">
        {/* Left: Showing X Results */}
        {isLoading ? (
          <Skeleton className="h-4 w-40 bg-gray-100" />
        ) : (
          <div className="flex items-center gap-2 text-gray-600">
            <span>Showing</span>
            <div className="relative">
              <button
                onClick={() => setIsPageSizeOpen(!isPageSizeOpen)}
                className="border border-gray-200 rounded px-2 py-1 flex items-center gap-1.5 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                <span>{pageSize}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>
              {isPageSizeOpen && (
                <div className="absolute left-0 bottom-full mb-1 w-16 bg-white border border-gray-100 rounded shadow-md py-1 z-30">
                  {[5, 10, 20, 50].map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        onPageSizeChange(size);
                        setIsPageSizeOpen(false);
                        onPageChange(1);
                      }}
                      className="w-full text-center py-1 hover:bg-gray-50 cursor-pointer"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span>Results (Total: {totalRecords})</span>
          </div>
        )}

        {/* Right: Page Navigation */}
        {isLoading ? (
          <div className="flex items-center gap-1">
            <Skeleton className="w-8 h-8 rounded bg-gray-100" />
            <Skeleton className="w-8 h-8 rounded bg-gray-100" />
            <Skeleton className="w-8 h-8 rounded bg-gray-100" />
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Dynamic page buttons */}
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`w-8 h-8 rounded flex items-center justify-center font-medium cursor-pointer transition-colors ${
                    currentPage === pageNum
                      ? "border border-purple-500 text-purple-600 bg-purple-50/20 font-bold"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {totalPages > 5 && (
              <>
                <span className="px-1 text-gray-400">...</span>
                <button
                  onClick={() => onPageChange(totalPages)}
                  className={`w-8 h-8 rounded flex items-center justify-center font-medium cursor-pointer transition-colors ${
                    currentPage === totalPages
                      ? "border border-purple-500 text-purple-600 bg-purple-50/20 font-bold"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
