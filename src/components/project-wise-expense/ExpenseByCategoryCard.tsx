import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Sparkles } from "lucide-react";

interface ExpenseCategorySegment {
  [key: string]: unknown;
  name: string;
  value: number;
  percentage: string;
  color: string;
}

const expenseCategorySegments: ExpenseCategorySegment[] = [
  {
    name: "Material Cost",
    value: 28.35,
    percentage: "28.35%",
    color: "#2563EB", // Blue
  },
  {
    name: "Manpower Cost",
    value: 28.35,
    percentage: "28.35%",
    color: "#10B981", // Green
  },
  {
    name: "Freight & Logistic",
    value: 28.35,
    percentage: "28.35%",
    color: "#F59E0B", // Amber
  },
  {
    name: "Site/Project expense",
    value: 28.35,
    percentage: "28.35%",
    color: "#06B6D4", // Cyan
  },
  {
    name: "Administrative Expense",
    value: 28.35,
    percentage: "28.35%",
    color: "#94A3B8", // Gray
  },
  {
    name: "Equipment & Machinery",
    value: 28.35,
    percentage: "28.35%",
    color: "#64748B", // Slate
  },
];

// Slices data for the donut ring matching visual screenshot
const donutSlices: ExpenseCategorySegment[] = [
  { name: "Material", value: 30, percentage: "30%", color: "#F43F5E" }, // Pink
  { name: "Manpower", value: 25, percentage: "25%", color: "#2563EB" }, // Blue
  { name: "Logistics", value: 25, percentage: "25%", color: "#F59E0B" }, // Amber
  { name: "Site", value: 20, percentage: "20%", color: "#06B6D4" }, // Cyan
];

export const ExpenseByCategoryCard: React.FC = () => {
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
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0].payload as ExpenseCategorySegment;
                  return (
                    <div className="bg-white p-2.5 rounded-lg shadow-md border border-slate-100 text-xs">
                      <div className="font-semibold text-slate-800">
                        {item.name}
                      </div>
                      <div className="text-slate-600 font-medium mt-0.5">
                        Share: {item.percentage}
                      </div>
                    </div>
                  );
                }}
              />
              <Pie
                data={donutSlices}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={88}
                paddingAngle={4}
                stroke="none"
              >
                {donutSlices.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Absolute Center Content matching screenshot */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              $4.86 Cr
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
              <span className="text-[10px] sm:text-[11px] text-slate-500 font-normal">
                Total Income
              </span>
            </div>
          </div>
        </div>

        {/* Legend List */}
        <div className="flex flex-col gap-2 w-full sm:max-w-56">
          {expenseCategorySegments.map((item, idx) => (
            <div
              key={`${item.name}-${idx}`}
              className="flex items-center justify-between text-xs gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-1 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-600 text-[11px] sm:text-xs truncate font-medium">
                  {item.name}
                </span>
              </div>
              <span className="text-slate-900 font-bold text-[11px] sm:text-xs shrink-0">
                {item.percentage}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpenseByCategoryCard;
