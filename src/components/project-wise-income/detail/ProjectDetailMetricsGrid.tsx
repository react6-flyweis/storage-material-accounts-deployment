import React from "react";
import type { ProjectWiseIncomeDetailSummary } from "@/redux/api/reportsApi";
import { formatCurrency } from "@/lib/dashboardFormatters";

interface ProjectDetailMetricsGridProps {
  summary?: ProjectWiseIncomeDetailSummary;
  isLoading?: boolean;
}

export const ProjectDetailMetricsGrid: React.FC<ProjectDetailMetricsGridProps> = ({
  summary,
  isLoading = false,
}) => {
  const metrics = [
    {
      title: "Total Income",
      amount: formatCurrency(summary?.totalIncome),
      iconBg: "bg-[#EFF6FF]",
      iconColor: "text-[#2563EB]",
    },
    {
      title: "Received Income",
      amount: formatCurrency(summary?.receivedIncome),
      iconBg: "bg-[#ECFDF5]",
      iconColor: "text-[#10B981]",
    },
    {
      title: "Pending Income",
      amount: formatCurrency(summary?.pendingIncome),
      iconBg: "bg-[#FEF2F2]",
      iconColor: "text-[#EF4444]",
    },
    {
      title: "Overdue Income",
      amount: formatCurrency(summary?.overdueIncome),
      iconBg: "bg-[#FAF5FF]",
      iconColor: "text-[#A855F7]",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-100 flex items-center gap-4 animate-pulse"
          >
            <div className="w-11 h-11 rounded-lg bg-slate-100 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="w-20 h-3 bg-slate-100 rounded" />
              <div className="w-32 h-5 bg-slate-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {metrics.map((item) => (
        <div
          key={item.title}
          className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-100 flex items-center gap-4 transition-all hover:shadow-sm"
        >
          {/* Document / Receipt Icon matching screenshot */}
          <div
            className={`w-11 h-11 rounded-lg ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0`}
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="14" height="18" x="5" y="3" rx="2" />
              <line x1="9" x2="15" y1="8" y2="8" />
              <line x1="9" x2="15" y1="12" y2="12" />
              <line x1="9" x2="13" y1="16" y2="16" />
            </svg>
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-xs font-normal text-slate-500">
              {item.title}
            </span>
            <span className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-0.5 truncate">
              {item.amount}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectDetailMetricsGrid;
