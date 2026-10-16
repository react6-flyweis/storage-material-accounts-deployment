import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Sparkles } from "lucide-react";
import type { ExpenseCategoryItem } from "@/redux/api/reportsApi";
import { formatCurrency, formatCompactCurrency } from "@/lib/dashboardFormatters";

interface ExpenseByCategoryCardProps {
  categories?: ExpenseCategoryItem[];
  isLoading?: boolean;
}

const COLOR_MAP: Record<string, string> = {
  blue: "#2563EB",
  green: "#10B981",
  orange: "#F59E0B",
  purple: "#8B5CF6",
  pink: "#EC4899",
  cyan: "#06B6D4",
  slate: "#64748B",
};

const DEFAULT_COLORS = ["#2563EB", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4"];

const resolveColor = (colorName: string, index: number): string => {
  if (colorName && COLOR_MAP[colorName.toLowerCase()]) {
    return COLOR_MAP[colorName.toLowerCase()];
  }
  if (colorName && colorName.startsWith("#")) {
    return colorName;
  }
  return DEFAULT_COLORS[index % DEFAULT_COLORS.length];
};

interface ProcessedCategory {
  [key: string]: unknown;
  key: string;
  name: string;
  amount: number;
  value: number;
  percentage: string;
  pctNumber: number;
  color: string;
}

export const ExpenseByCategoryCard: React.FC<ExpenseByCategoryCardProps> = ({
  categories = [],
  isLoading = false,
}) => {
  const totalAmount = useMemo(() => {
    return categories.reduce((sum, c) => sum + (c.amount || 0), 0);
  }, [categories]);

  const processedData: ProcessedCategory[] = useMemo(() => {
    return categories.map((cat, idx) => {
      const pct = totalAmount > 0 ? (cat.amount / totalAmount) * 100 : 0;
      const pctDisplay =
        totalAmount === 0
          ? "0%"
          : pct > 0 && pct < 0.1
          ? "<0.1%"
          : `${pct.toFixed(1)}%`;

      return {
        key: cat.key,
        name: cat.label,
        amount: cat.amount,
        value: cat.amount,
        pctNumber: pct,
        percentage: pctDisplay,
        color: resolveColor(cat.color, idx),
      };
    });
  }, [categories, totalAmount]);

  // Donut slices: only categories with amount > 0 for a clean donut rendering
  const activeSlices = useMemo(() => {
    return processedData.filter((d) => d.amount > 0);
  }, [processedData]);

  return (
    <div className="bg-white rounded-xl p-5 sm:p-6 shadow-xs border border-slate-100 flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center text-[#EC4899]">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-slate-800 text-sm sm:text-base">
            Expense by Category (This Month)
          </h3>
        </div>
      </div>

      {/* Donut and Legend */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 my-auto pt-2">
        {/* Donut Chart with Center Text */}
        <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
          {isLoading && categories.length === 0 ? (
            <div className="w-36 h-36 rounded-full border-4 border-slate-100 border-t-blue-500 animate-spin" />
          ) : activeSlices.length === 0 ? (
            <div className="w-36 h-36 rounded-full border-4 border-dashed border-slate-200 flex items-center justify-center text-[11px] text-slate-400 text-center p-2">
              No expenses this month
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const item = payload[0].payload as ProcessedCategory;
                    return (
                      <div className="bg-white p-2.5 rounded-lg shadow-md border border-slate-100 text-xs">
                        <div className="font-semibold text-slate-800">
                          {item.name}
                        </div>
                        <div className="text-slate-900 font-bold mt-0.5">
                          {formatCurrency(item.amount)}
                        </div>
                        <div className="text-slate-500 font-medium text-[11px]">
                          Share: {item.percentage}
                        </div>
                      </div>
                    );
                  }}
                />
                <Pie
                  data={activeSlices}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={56}
                  outerRadius={84}
                  paddingAngle={activeSlices.length > 1 ? 3 : 0}
                  stroke="none"
                >
                  {activeSlices.map((entry) => (
                    <Cell key={`cell-${entry.key}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}

          {/* Absolute Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              {formatCompactCurrency(totalAmount)}
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
              <span className="text-[10px] sm:text-[11px] text-slate-500 font-normal">
                Total Expense
              </span>
            </div>
          </div>
        </div>

        {/* Legend List */}
        <div className="flex flex-col gap-2 w-full sm:max-w-56">
          {processedData.length === 0 && !isLoading ? (
            <div className="text-xs text-slate-400 text-center py-4">
              No categories
            </div>
          ) : (
            processedData.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between text-xs gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-1.5 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-600 text-[11px] sm:text-xs truncate font-medium">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-slate-500 text-[11px]">
                    {formatCompactCurrency(item.amount)}
                  </span>
                  <span className="text-slate-900 font-bold text-[11px] sm:text-xs min-w-10 text-right">
                    {item.percentage}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseByCategoryCard;
