import React from "react";
import type { ProjectWiseExpenseDetailSummary } from "@/redux/api/reportsApi";
import { formatCurrency } from "@/lib/dashboardFormatters";

interface MetricItem {
  title: string;
  amount: string;
  iconBg: string;
  iconColor: string;
  isNegative?: boolean;
}

interface ProjectExpenseDetailMetricsGridProps {
  summary?: ProjectWiseExpenseDetailSummary;
  isLoading?: boolean;
}

export const ProjectExpenseDetailMetricsGrid: React.FC<
  ProjectExpenseDetailMetricsGridProps
> = ({ summary, isLoading = false }) => {
  const topRowMetrics: MetricItem[] = [
    {
      title: "Total Expense",
      amount: formatCurrency(summary?.totalExpense),
      iconBg: "bg-[#EFF6FF]",
      iconColor: "text-[#2563EB]",
    },
    {
      title: "Approved Expense",
      amount: formatCurrency(summary?.approvedExpense),
      iconBg: "bg-[#ECFDF5]",
      iconColor: "text-[#10B981]",
    },
  ];

  const budgetVarianceNum = summary?.budgetVariance;
  const isVarianceNegative =
    budgetVarianceNum !== undefined && budgetVarianceNum < 0;

  const bottomRowMetrics: MetricItem[] = [
    {
      title: "Pending Approval",
      amount: formatCurrency(summary?.pendingApproval),
      iconBg: "bg-[#FEF2F2]",
      iconColor: "text-[#EF4444]",
    },
    {
      title: "Budgeted Expense",
      amount: formatCurrency(summary?.budgetedExpense),
      iconBg: "bg-[#FAF5FF]",
      iconColor: "text-[#A855F7]",
    },
    {
      title: "Budget Variance",
      amount: formatCurrency(summary?.budgetVariance),
      iconBg: isVarianceNegative ? "bg-[#FEF2F2]" : "bg-[#ECFDF5]",
      iconColor: isVarianceNegative ? "text-[#EF4444]" : "text-[#10B981]",
      isNegative: isVarianceNegative,
    },
  ];

  const renderCard = (item: MetricItem) => (
    <div
      key={item.title}
      className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-100 flex items-center gap-4 transition-all hover:shadow-sm"
    >
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
        <span className="text-xs font-normal text-slate-500">{item.title}</span>
        <span
          className={`text-lg sm:text-xl font-bold tracking-tight mt-0.5 truncate ${
            item.isNegative ? "text-[#EF4444]" : "text-slate-900"
          }`}
        >
          {item.amount}
        </span>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-100 flex items-center gap-4"
            >
              <div className="w-11 h-11 rounded-lg bg-slate-100 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="w-20 h-3 bg-slate-100 rounded" />
                <div className="w-32 h-5 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-100 flex items-center gap-4"
            >
              <div className="w-11 h-11 rounded-lg bg-slate-100 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="w-20 h-3 bg-slate-100 rounded" />
                <div className="w-28 h-5 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Row: 2 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {topRowMetrics.map(renderCard)}
      </div>

      {/* Bottom Row: 3 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {bottomRowMetrics.map(renderCard)}
      </div>
    </div>
  );
};

export default ProjectExpenseDetailMetricsGrid;
