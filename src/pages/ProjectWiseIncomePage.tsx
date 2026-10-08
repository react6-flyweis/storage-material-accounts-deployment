import React from "react";
import ProjectIncomeStatsGrid from "@/components/project-wise-income/ProjectIncomeStatsGrid";
import IncomeOverviewChartCard from "@/components/project-wise-income/IncomeOverviewChartCard";
import IncomeByProjectCard from "@/components/project-wise-income/IncomeByProjectCard";
import ProjectWiseIncomeTable from "@/components/project-wise-income/ProjectWiseIncomeTable";

export const ProjectWiseIncomePage: React.FC = () => {
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
      <ProjectIncomeStatsGrid />

      {/* Middle Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7 xl:col-span-7">
          <IncomeOverviewChartCard />
        </div>
        <div className="lg:col-span-5 xl:col-span-5">
          <IncomeByProjectCard />
        </div>
      </div>

      {/* Bottom Table Card */}
      <ProjectWiseIncomeTable />
    </div>
  );
};

export default ProjectWiseIncomePage;
