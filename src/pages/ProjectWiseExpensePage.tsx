import React from "react";
import ProjectExpenseStatsGrid from "@/components/project-wise-expense/ProjectExpenseStatsGrid";
import ExpenseOverviewChartCard from "@/components/project-wise-expense/ExpenseOverviewChartCard";
import ExpenseByCategoryCard from "@/components/project-wise-expense/ExpenseByCategoryCard";
import ProjectWiseExpenseTable from "@/components/project-wise-expense/ProjectWiseExpenseTable";
import TopExpenseCategoriesCard from "@/components/project-wise-expense/TopExpenseCategoriesCard";

export const ProjectWiseExpensePage: React.FC = () => {
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
      <ProjectExpenseStatsGrid />

      {/* Middle Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7 xl:col-span-7">
          <ExpenseOverviewChartCard />
        </div>
        <div className="lg:col-span-5 xl:col-span-5">
          <ExpenseByCategoryCard />
        </div>
      </div>

      {/* Project-wise Expense Table Card */}
      <ProjectWiseExpenseTable />

      {/* Bottom Section: Top Expense Categories (This Month) */}
      <TopExpenseCategoriesCard />
    </div>
  );
};

export default ProjectWiseExpensePage;
