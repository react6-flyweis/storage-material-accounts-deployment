import React from "react";

interface ExpenseStatItem {
  title: string;
  amount: string;
  iconBg?: string;
  iconColor?: string;
  isVariance?: boolean;
}

const expenseStats: ExpenseStatItem[] = [
  {
    title: "Total Expense",
    amount: "$3,62,40,000",
    iconBg: "bg-[#EFF6FF]",
    iconColor: "text-[#2563EB]",
  },
  {
    title: "Approved Expense",
    amount: "$3,15,80,000",
    iconBg: "bg-[#ECFDF5]",
    iconColor: "text-[#10B981]",
  },
  {
    title: "Pending Approval",
    amount: "$46,60,000",
    iconBg: "bg-[#FFF7ED]",
    iconColor: "text-[#F97316]",
  },
  {
    title: "Budgeted Expense",
    amount: "$3,75,00,000",
    iconBg: "bg-[#FAF5FF]",
    iconColor: "text-[#A855F7]",
  },
  {
    title: "Budget Variance",
    amount: "-$12,60,00",
    isVariance: true,
  },
];

export const ProjectExpenseStatsGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {expenseStats.map((stat) => (
        <div
          key={stat.title}
          className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-100 flex items-center gap-4 transition-all hover:shadow-sm"
        >
          {/* Icon Container (if stat has icon) */}
          {!stat.isVariance && stat.iconBg && stat.iconColor && (
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
          )}

          <div className="flex flex-col min-w-0">
            <span className="text-xs font-normal text-slate-500">
              {stat.title}
            </span>
            <span
              className={`text-lg sm:text-xl font-bold tracking-tight mt-0.5 truncate ${
                stat.isVariance ? "text-slate-900" : "text-slate-900"
              }`}
            >
              {stat.amount}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectExpenseStatsGrid;
