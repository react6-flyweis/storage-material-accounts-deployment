import React from "react";
import type { ProjectWiseIncomeSummary } from "@/redux/api/reportsApi";
import { formatCurrency } from "@/lib/dashboardFormatters";

interface ProjectIncomeStatsGridProps {
  summary?: ProjectWiseIncomeSummary;
  isLoading?: boolean;
}

interface StatItem {
  title: string;
  amount: number;
  iconBg: string;
  iconColor: string;
}

export const ProjectIncomeStatsGrid: React.FC<ProjectIncomeStatsGridProps> = ({
  summary,
  isLoading = false,
}) => {
  const stats: StatItem[] = [
    {
      title: "Total Income",
      amount: summary?.totalIncome ?? 0,
      iconBg: "bg-[#EFF6FF]",
      iconColor: "text-[#2563EB]",
    },
    {
      title: "Received Income",
      amount: summary?.receivedIncome ?? 0,
      iconBg: "bg-[#ECFDF5]",
      iconColor: "text-[#10B981]",
    },
    {
      title: "Pending Income",
      amount: summary?.pendingIncome ?? 0,
      iconBg: "bg-[#FEF2F2]",
      iconColor: "text-[#EF4444]",
    },
    {
      title: "Overdue Income",
      amount: summary?.overdueIncome ?? 0,
      iconBg: "bg-[#FAF5FF]",
      iconColor: "text-[#A855F7]",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-100 flex items-center gap-4 transition-all hover:shadow-sm"
        >
          {/* Document / Receipt Icon matching the design */}
          <div
            className={`w-11 h-11 rounded-lg ${stat.iconBg} ${stat.iconColor} flex items-center justify-center shrink-0`}
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

          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-normal text-slate-500">
              {stat.title}
            </span>
            {isLoading && !summary ? (
              <div className="h-6 w-24 bg-slate-100 rounded animate-pulse mt-1" />
            ) : (
              <span className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-0.5 truncate">
                {formatCurrency(stat.amount)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectIncomeStatsGrid;
