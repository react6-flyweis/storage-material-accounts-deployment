import React, { useState, useEffect } from "react";
import { ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import ProjectExpenseInfoCard from "@/components/project-wise-expense/detail/ProjectExpenseInfoCard";
import ProjectExpenseDetailMetricsGrid from "@/components/project-wise-expense/detail/ProjectExpenseDetailMetricsGrid";
import ProjectExpenseSummaryCard from "@/components/project-wise-expense/detail/ProjectExpenseSummaryCard";
import RecentExpenseTransactionsCard from "@/components/project-wise-expense/detail/RecentExpenseTransactionsCard";
import { useGetProjectWiseExpenseDetailQuery } from "@/redux/api/reportsApi";

export const ProjectWiseExpenseDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId?: string }>();
  const [searchParams] = useSearchParams();

  // Route param can be leadId or projectId (job ID), or fallback to searchParams
  const effectiveProjectId =
    projectId ||
    searchParams.get("projectId") ||
    searchParams.get("leadId") ||
    "";

  // Tab: all (first pos), approved, pending
  const [tab, setTab] = useState<"all" | "approved" | "pending">("all");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [dateRangeText, setDateRangeText] = useState<string>("");

  // Debounce search by 350ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);

    return () => clearTimeout(handler);
  }, [search]);

  // Fetch project-wise expense detail (Screen D1)
  const { data, isLoading, isFetching, isError, refetch } =
    useGetProjectWiseExpenseDetailQuery(
      {
        projectIdOrLeadId: effectiveProjectId,
        tab,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        search: debouncedSearch.trim() || undefined,
        page,
        limit,
      },
      {
        skip: !effectiveProjectId,
      }
    );

  const handleDateRangeChange = (
    start?: string,
    end?: string,
    displayText?: string
  ) => {
    setStartDate(start);
    setEndDate(end);
    setDateRangeText(displayText || "");
    setPage(1);
  };

  return (
    <div className="p-3 sm:p-5 lg:p-6 space-y-6">
      {/* Header Row: Back Button + Title & Subtitle */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/project-wise-expense")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Project-wise Expense Details
              </h1>
              {isFetching && !isLoading && (
                <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
              Project-wise expense tracking
            </p>
          </div>
        </div>
      </div>

      {/* Error state alert if API fails */}
      {isError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between gap-3 text-red-700 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>Failed to load project expense details. Please try again.</span>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-3 py-1 rounded-md bg-white border border-red-200 text-red-700 font-semibold hover:bg-red-100/50 transition-colors cursor-pointer text-xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* Top Grid: Left Side (Info Card + Metrics) & Right Side (Summary Card) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column (8 cols on lg/xl) */}
        <div className="lg:col-span-8 xl:col-span-8 space-y-4 flex flex-col justify-between">
          <ProjectExpenseInfoCard
            project={data?.project}
            code={effectiveProjectId}
            isLoading={isLoading}
          />
          <ProjectExpenseDetailMetricsGrid
            summary={data?.summary}
            isLoading={isLoading}
          />
        </div>

        {/* Right Column (4 cols on lg/xl) */}
        <div className="lg:col-span-4 xl:col-span-4">
          <ProjectExpenseSummaryCard
            summary={data?.summary}
            project={data?.project}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Bottom Section: Recent Expense Transactions Table Card */}
      <RecentExpenseTransactionsCard
        projectIdOrLeadId={data?.project?.leadId || effectiveProjectId}
        transactions={data?.transactions}
        pagination={data?.pagination}
        activeTab={tab}
        onTabChange={setTab}
        searchTerm={search}
        onSearchChange={setSearch}
        startDate={startDate}
        endDate={endDate}
        dateRangeText={dateRangeText}
        onDateRangeChange={handleDateRangeChange}
        page={page}
        onPageChange={setPage}
        limit={limit}
        onLimitChange={setLimit}
        isLoading={isLoading}
        isFetching={isFetching}
      />
    </div>
  );
};

export default ProjectWiseExpenseDetailPage;
