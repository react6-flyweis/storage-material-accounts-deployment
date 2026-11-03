import React from "react";
import type { ProjectWiseExpenseSummary } from "@/redux/api/reportsApi";
import { formatCurrency } from "@/lib/dashboardFormatters";

interface ProjectExpenseStatsGridProps {
  summary?: ProjectWiseExpenseSummary;
  isLoading?: boolean;
}

interface ExpenseStatItem {
  title: string;
  amount: number;
  iconBg: string;
  iconColor: string;
  isVariance?: boolean;
}

export const ProjectExpenseStatsGrid: React.FC<ProjectExpenseStatsGridProps> = ({
  summary,
  isLoading = false,
}) => {
  const stats: ExpenseStatItem[] = [
    {
      title: "Total Expense",
      amount: summary?.totalExpense ?? 0,
      iconBg: "bg-[#EFF6FF]",
      iconColor: "text-[#2563EB]",
    },
    {
      title: "Approved Expense",
      amount: summary?.approvedExpense ?? 0,
      iconBg: "bg-[#ECFDF5]",
      iconColor: "text-[#10B981]",
    },
    {
      title: "Pending Approval",
      amount: summary?.pendingApproval ?? 0,
      iconBg: "bg-[#FFF7ED]",
      iconColor: "text-[#F97316]",
    },
    {
      title: "Budgeted Expense",
      amount: summary?.budgetedExpense ?? 0,
      iconBg: "bg-[#FAF5FF]",
      iconColor: "text-[#A855F7]",
    },
    {
      title: "Budget Variance",
      amount: summary?.budgetVariance ?? 0,
      iconBg: summary && summary.budgetVariance > 0 ? "bg-[#FEF2F2]" : "bg-[#F0FDF4]",
      iconColor: summary && summary.budgetVariance > 0 ? "text-[#EF4444]" : "text-[#16A34A]",
      isVariance: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-100 flex items-center gap-4 transition-all hover:shadow-sm"
        >
          {/* Icon Container */}
          <div
            className={`w-11 h-11 rounded-lg ${stat.iconBg} ${stat.iconColor} flex items-center justify-center shrink-0`}
          >
            {stat.isVariance ? (
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            ) : (
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
            )}
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-normal text-slate-500">
              {stat.title}
            </span>
            {isLoading && !summary ? (
              <div className="h-6 w-24 bg-slate-100 rounded animate-pulse mt-1" />
            ) : (
              <span
                className={`text-lg sm:text-xl font-bold tracking-tight mt-0.5 truncate ${
                  stat.isVariance && summary
                    ? summary.budgetVariance > 0
                      ? "text-rose-600"
                      : "text-emerald-600"
                    : "text-slate-900"
                }`}
              >
                {stat.isVariance && summary && summary.budgetVariance > 0 ? "+" : ""}
                {formatCurrency(stat.amount)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectExpenseStatsGrid;
