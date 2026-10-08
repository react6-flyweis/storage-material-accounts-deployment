import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import ProjectInfoCard from "@/components/project-wise-income/detail/ProjectInfoCard";
import ProjectDetailMetricsGrid from "@/components/project-wise-income/detail/ProjectDetailMetricsGrid";
import ProjectIncomeSummaryCard from "@/components/project-wise-income/detail/ProjectIncomeSummaryCard";
import RecentIncomeTransactionsCard from "@/components/project-wise-income/detail/RecentIncomeTransactionsCard";

export const ProjectWiseIncomeDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId?: string }>();

  return (
    <div className="p-3 sm:p-5 lg:p-6 space-y-6">
      {/* Header Row: Back Button + Title & Subtitle */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/project-wise-income")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Project-wise Income Details
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
            Project-wise income tracking
          </p>
        </div>
      </div>

      {/* Top Grid: Left Side (Info Card + 2x2 Metrics) & Right Side (Summary Card) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column (8 cols on lg/xl) */}
        <div className="lg:col-span-8 xl:col-span-8 space-y-4 flex flex-col justify-between">
          <ProjectInfoCard
            name={projectId ? "Alpha Infra Proect" : "Alpha Infra Proect"}
          />
          <ProjectDetailMetricsGrid />
        </div>

        {/* Right Column (4 cols on lg/xl) */}
        <div className="lg:col-span-4 xl:col-span-4">
          <ProjectIncomeSummaryCard />
        </div>
      </div>

      {/* Bottom Section: Recent Income Transactions Table Card */}
      <RecentIncomeTransactionsCard />
    </div>
  );
};

export default ProjectWiseIncomeDetailPage;
