import React, { useState, useEffect } from "react";
import ProjectIncomeStatsGrid from "@/components/project-wise-income/ProjectIncomeStatsGrid";
import IncomeOverviewChartCard from "@/components/project-wise-income/IncomeOverviewChartCard";
import IncomeByProjectCard from "@/components/project-wise-income/IncomeByProjectCard";
import ProjectWiseIncomeTable from "@/components/project-wise-income/ProjectWiseIncomeTable";
import { useGetProjectWiseIncomeQuery } from "@/redux/api/reportsApi";

export const ProjectWiseIncomePage: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [dateRangeText, setDateRangeText] = useState<string>("");
  const [months, setMonths] = useState<number>(6);

  // Debounce search input by 350ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);

    return () => clearTimeout(handler);
  }, [search]);

  // Fetch project-wise income data
  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetProjectWiseIncomeQuery({
    page,
    limit,
    search: debouncedSearch.trim() || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    months,
  });

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
    <div className="p-3 sm:p-5 lg:p-6 space-y-5">
      {/* Page Title & Subtitle */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Project-wise Income
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
          Project-wise income tracking
        </p>
      </div>

      {/* Top 4 Stat Cards */}
      <ProjectIncomeStatsGrid
        summary={data?.summary}
        isLoading={isLoading}
      />

      {/* Middle Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7 xl:col-span-7">
          <IncomeOverviewChartCard
            chartData={data?.incomeOverviewChart}
            months={months}
            onMonthsChange={setMonths}
            isLoading={isLoading}
          />
        </div>
        <div className="lg:col-span-5 xl:col-span-5">
          <IncomeByProjectCard
            data={data?.incomeByProjectThisMonth}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Bottom Table Card */}
      <ProjectWiseIncomeTable
        rows={data?.rows}
        pagination={data?.pagination}
        currentPage={page}
        onPageChange={setPage}
        rowsPerPage={limit}
        onRowsPerPageChange={setLimit}
        searchTerm={search}
        onSearchChange={setSearch}
        dateRangeText={dateRangeText}
        onDateRangeChange={handleDateRangeChange}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        onRetry={refetch}
      />
    </div>
  );
};

export default ProjectWiseIncomePage;
