import React, { useState, useEffect } from "react";
import ProjectExpenseStatsGrid from "@/components/project-wise-expense/ProjectExpenseStatsGrid";
import ExpenseOverviewChartCard from "@/components/project-wise-expense/ExpenseOverviewChartCard";
import ExpenseByCategoryCard from "@/components/project-wise-expense/ExpenseByCategoryCard";
import ProjectWiseExpenseTable from "@/components/project-wise-expense/ProjectWiseExpenseTable";
import TopExpenseCategoriesCard from "@/components/project-wise-expense/TopExpenseCategoriesCard";
import { useGetProjectWiseExpenseQuery } from "@/redux/api/reportsApi";

export const ProjectWiseExpensePage: React.FC = () => {
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

  // Fetch project-wise expense data
  const { data, isLoading, isFetching, isError, refetch } =
    useGetProjectWiseExpenseQuery({
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
    displayText?: string,
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
          Project-wise Expense
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
          Project-wise Expense tracking
        </p>
      </div>

      {/* Top 5 Stat Cards */}
      <ProjectExpenseStatsGrid summary={data?.summary} isLoading={isLoading} />

      {/* Middle Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7 xl:col-span-7">
          <ExpenseOverviewChartCard
            chartData={data?.expenseOverviewChart}
            months={months}
            onMonthsChange={setMonths}
            isLoading={isLoading}
          />
        </div>
        <div className="lg:col-span-5 xl:col-span-5">
          <ExpenseByCategoryCard
            categories={data?.expenseByCategoryThisMonth}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Project-wise Expense Table Card */}
      <ProjectWiseExpenseTable
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

      {/* Bottom Section: Top Expense Categories (This Month) */}
      <TopExpenseCategoriesCard
        categories={data?.topExpenseCategoriesThisMonth}
        fallbackCategories={data?.expenseByCategoryThisMonth}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ProjectWiseExpensePage;
