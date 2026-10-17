import React from "react";
import type {
  ProjectWiseExpenseDetailSummary,
  ProjectWiseExpenseDetailProject,
} from "@/redux/api/reportsApi";
import { formatCurrency } from "@/lib/dashboardFormatters";

interface ProjectExpenseSummaryCardProps {
  summary?: ProjectWiseExpenseDetailSummary;
  project?: ProjectWiseExpenseDetailProject;
  isLoading?: boolean;
}

export const ProjectExpenseSummaryCard: React.FC<
  ProjectExpenseSummaryCardProps
> = ({ summary, project, isLoading = false }) => {
  const mainExpenseItems = [
    {
      label: "Total Contract Value",
      value: formatCurrency(project?.quoteValue),
    },
    {
      label: "Total Budgeted Expense",
      value: formatCurrency(summary?.budgetedExpense),
    },
    {
      label: "Total Expense",
      value: formatCurrency(summary?.totalExpense),
    },
    {
      label: "Approved Expense",
      value: formatCurrency(summary?.approvedExpense),
    },
    {
      label: "Pending Approval",
      value: formatCurrency(summary?.pendingApproval),
    },
  ];

  const sourceItems = summary?.sources
    ? [
        {
          label: "Manual Expenses",
          value: formatCurrency(summary.sources.manualExpenses),
        },
        {
          label: "Vendor Material (Bids)",
          value: formatCurrency(summary.sources.vendorMaterialFromEmailBids),
        },
        {
          label: "Freight (Bids)",
          value: formatCurrency(summary.sources.freightFromEmailBids),
        },
      ]
    : [];

  const budgetVariance = formatCurrency(summary?.budgetVariance);
  const isVarianceNegative =
    summary?.budgetVariance !== undefined && summary.budgetVariance < 0;

  const variancePctText =
    summary?.variancePct !== undefined ? `${summary.variancePct}%` : "-";

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-xs border border-slate-100 flex flex-col justify-between overflow-hidden h-full animate-pulse p-5 space-y-4">
        <div className="w-40 h-5 bg-slate-100 rounded" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="w-28 h-3.5 bg-slate-100 rounded" />
              <div className="w-20 h-3.5 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
        <div className="w-full h-12 bg-slate-100 rounded-lg mt-4" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-100 flex flex-col justify-between overflow-hidden h-full">
      <div>
        {/* Card Header */}
        <div className="p-5 pb-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-base sm:text-lg">
            Project Expense Summary
          </h3>
        </div>

        {/* List Items */}
        <div className="p-5 space-y-3.5 text-xs sm:text-sm">
          {mainExpenseItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between"
            >
              <span className="text-slate-500 font-normal">{item.label}</span>
              <span className="font-bold text-slate-900">{item.value}</span>
            </div>
          ))}

          {/* Sources Breakdown if present */}
          {sourceItems.length > 0 && (
            <div className="border-t border-slate-100 my-2 pt-2 space-y-2.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Expense Sources
              </span>
              {sourceItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-slate-500">{item.label}</span>
                  <span className="font-semibold text-slate-700">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Budget Variance Row */}
          <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
            <span
              className={`font-bold text-xs sm:text-sm ${
                isVarianceNegative ? "text-[#EF4444]" : "text-[#10B981]"
              }`}
            >
              Budget Variance
            </span>
            <span
              className={`font-bold text-sm sm:text-base ${
                isVarianceNegative ? "text-[#EF4444]" : "text-[#10B981]"
              }`}
            >
              {budgetVariance}
            </span>
          </div>
        </div>
      </div>

      {/* Variance % Footer Banner */}
      <div
        className={`mx-5 mb-5 p-3.5 rounded-lg flex items-center justify-between ${
          isVarianceNegative ? "bg-[#FEF2F2]" : "bg-[#E6F4EA]"
        }`}
      >
        <span
          className={`font-bold text-xs sm:text-sm ${
            isVarianceNegative ? "text-[#B91C1C]" : "text-[#15803D]"
          }`}
        >
          Variance Percentage
        </span>
        <span
          className={`font-bold text-sm sm:text-base ${
            isVarianceNegative ? "text-[#B91C1C]" : "text-[#15803D]"
          }`}
        >
          {variancePctText}
        </span>
      </div>
    </div>
  );
};

export default ProjectExpenseSummaryCard;
