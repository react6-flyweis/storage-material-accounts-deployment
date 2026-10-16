import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import { formatCurrency } from "@/lib/dashboardFormatters";

interface ProfitLossCategoryExpenseCardProps {
  expenseByCategory?: Record<string, number>;
  isLoading?: boolean;
}

const CATEGORY_COLORS: string[] = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Amber
  "#EC4899", // Pink
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#64748B", // Slate
];

interface FormattedCategory {
  [key: string]: unknown;
  name: string;
  amount: number;
  pct: number;
  color: string;
}

export const ProfitLossCategoryExpenseCard: React.FC<
  ProfitLossCategoryExpenseCardProps
> = ({ expenseByCategory = {}, isLoading = false }) => {
  const { categories, totalExpense } = useMemo(() => {
    const entries = Object.entries(expenseByCategory || {});
    const total = entries.reduce((acc, [, val]) => acc + (Number(val) || 0), 0);

    const formatted: FormattedCategory[] = entries.map(([key, val], idx) => {
      const numVal = Number(val) || 0;
      const pct = total > 0 ? (numVal / total) * 100 : 0;
      // Capitalize first letter of category name
      const name = key.charAt(0).toUpperCase() + key.slice(1);
      return {
        name,
        amount: numVal,
        pct,
        color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
      };
    });

    return {
      categories: formatted,
      totalExpense: total,
    };
  }, [expenseByCategory]);

  return (
    <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-100 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <PieChartIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Expense by Category
            </h3>
            <p className="text-xs text-slate-500 font-normal">
              Breakdown of combined project expenses
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 font-normal block">Total</span>
          <span className="text-xs sm:text-sm font-bold text-slate-900">
            {formatCurrency(totalExpense)}
          </span>
        </div>
      </div>

      {/* Chart & Category List */}
      {isLoading ? (
        <div className="w-full h-72 sm:h-80 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400">Loading category breakdown...</span>
        </div>
      ) : categories.length === 0 ? (
        <div className="w-full h-72 sm:h-80 flex items-center justify-center text-xs text-slate-400">
          No category expense data available
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-6 h-72 sm:h-80">
          {/* Donut Chart */}
          <div className="relative w-44 h-44 sm:w-48 sm:h-48 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  formatter={(val: unknown) => [
                    formatCurrency(typeof val === "number" ? val : 0),
                    "Expense",
                  ]}
                />
                <Pie
                  data={categories}
                  dataKey="amount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                Categories
              </span>
              <span className="text-sm font-bold text-slate-800">
                {categories.length}
              </span>
            </div>
          </div>

          {/* Category List with Progress Bars */}
          <div className="flex-1 w-full space-y-3 overflow-y-auto max-h-56 pr-1">
            {categories.map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-medium text-slate-700 truncate">
                      {cat.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(cat.amount)}
                    </span>
                    <span className="text-slate-400 text-[11px] w-11 text-right">
                      {cat.pct.toFixed(1)}%
                    </span>
                  </div>
                </div>
                {/* Visual bar */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(cat.pct, 100)}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfitLossCategoryExpenseCard;
