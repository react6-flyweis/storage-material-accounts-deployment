import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Calendar, ChevronDown, Download, X } from "lucide-react";
import ProfitLossMetrics from "@/components/profit-loss/ProfitLossMetrics";
import ProfitLossTrendChartCard from "@/components/profit-loss/ProfitLossTrendChartCard";
import ProfitLossCategoryExpenseCard from "@/components/profit-loss/ProfitLossCategoryExpenseCard";
import ProfitLossSummaryTable from "@/components/profit-loss/ProfitLossSummaryTable";
import CalendarRangePickerModal, {
  type CalendarRangePickerRange,
} from "@/components/common_components/CalendarRangePickerModal";
import ProjectSelectorDropdownModal from "@/components/common_components/ProjectSelectorDropdownModal";
import { useGetProfitLossStatementQuery } from "@/redux/api/reportsApi";
import { useGetBudgetVsActualProjectsQuery } from "@/redux/api/financialApi";
import { formatDateToIso } from "@/lib/dashboardFormatters";

export const ProfitLossStatementPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedLeadId = searchParams.get("leadId") || undefined;

  // Query Filters State
  const [selectedDateRange, setSelectedDateRange] = useState<string>("All Dates");
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);

  // Modals state
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState<boolean>(false);

  // Fetch real projects for dropdown picker
  const { data: projectList = [] } = useGetBudgetVsActualProjectsQuery();
  const projectOptions = useMemo(() => {
    return projectList.map((p) => ({
      id: p._id,
      name: p.projectName,
      code: p.jobId,
    }));
  }, [projectList]);

  // Derive label from current leadId and project list
  const selectedProjectLabel = useMemo(() => {
    if (!selectedLeadId) return "All Projects";
    const matched = projectList.find((p) => p._id === selectedLeadId);
    return matched ? `${matched.projectName} (${matched.jobId})` : "Selected Project";
  }, [selectedLeadId, projectList]);

  // Main Profit & Loss API Query
  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetProfitLossStatementQuery({
    leadId: selectedLeadId,
    page,
    limit,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  // Handle Project Selection
  const handleSelectProject = (_projectLabel: string, leadId?: string) => {
    setPage(1);

    const nextParams = new URLSearchParams(searchParams);
    if (leadId) {
      nextParams.set("leadId", leadId);
    } else {
      nextParams.delete("leadId");
    }
    setSearchParams(nextParams, { replace: true });
  };

  // Handle Date Range Selection
  const handleDateApply = (range: CalendarRangePickerRange) => {
    if (range.from && range.to) {
      const isoStart = formatDateToIso(range.from);
      const isoEnd = formatDateToIso(range.to);
      setStartDate(isoStart);
      setEndDate(isoEnd);
      setSelectedDateRange(
        range.startDate && range.endDate
          ? `${range.startDate} - ${range.endDate}`
          : `${isoStart} - ${isoEnd}`
      );
      setPage(1);
    }
  };

  const handleClearDateRange = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedDateRange("All Dates");
    setPage(1);
  };


  return (
    <div className="p-3 sm:p-5 lg:p-6 space-y-6">
      {/* Header Row: Title & Subtitle on left, Filters & Export on right */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Profit & Loss Statement
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
            Overview of project revenue, combined expenses, and profitability margins.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Date Range Selector & Calendar Modal */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsDatePickerOpen(!isDatePickerOpen);
                setIsProjectDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
            >
              <span>{selectedDateRange}</span>
              {startDate ? (
                <span
                  onClick={handleClearDateRange}
                  className="p-0.5 hover:bg-slate-200 rounded-full cursor-pointer text-slate-500"
                  title="Clear date filter"
                >
                  <X className="w-3.5 h-3.5" />
                </span>
              ) : (
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>

            <CalendarRangePickerModal
              isOpen={isDatePickerOpen}
              onClose={() => setIsDatePickerOpen(false)}
              onApply={handleDateApply}
            />
          </div>

          {/* Project Filter Dropdown & Project Selector Modal */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsProjectDropdownOpen(!isProjectDropdownOpen);
                setIsDatePickerOpen(false);
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs min-w-32.5 max-w-[280px] justify-between"
            >
              <span className="truncate">{selectedProjectLabel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            <ProjectSelectorDropdownModal
              isOpen={isProjectDropdownOpen}
              onClose={() => setIsProjectDropdownOpen(false)}
              selectedProject={selectedProjectLabel}
              projects={projectOptions}
              onSelectProject={handleSelectProject}
            />
          </div>

          {/* Export Report Button (Static / Unclickable) */}
          <button
            type="button"
            disabled
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0284C7]/60 text-white text-xs sm:text-sm font-semibold shadow-2xs cursor-not-allowed shrink-0 select-none"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Top Summary Metric Cards */}
      <ProfitLossMetrics summary={data?.summary} isLoading={isLoading} />

      {/* Middle Analytics Grid: 6-Month Trend & Expense by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7 xl:col-span-7">
          <ProfitLossTrendChartCard
            chartData={data?.monthlyTrend}
            isLoading={isLoading}
          />
        </div>
        <div className="lg:col-span-5 xl:col-span-5">
          <ProfitLossCategoryExpenseCard
            expenseByCategory={data?.expenseByCategory}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Profit & Loss Invoice Breakdown Table Card */}
      <ProfitLossSummaryTable
        rows={data?.rows}
        total={data?.total}
        currentPage={page}
        onPageChange={setPage}
        rowsPerPage={limit}
        onRowsPerPageChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        onRetry={refetch}
      />
    </div>
  );
};

export default ProfitLossStatementPage;
