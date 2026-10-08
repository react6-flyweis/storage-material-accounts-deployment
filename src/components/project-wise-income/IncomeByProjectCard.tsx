import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Sparkles } from "lucide-react";

interface ProjectIncomeSegment {
  [key: string]: unknown;
  name: string;
  value: number;
  percentage: string;
  color: string;
}

const projectSegments: ProjectIncomeSegment[] = [
  {
    name: "Alpha Infra Project",
    value: 28.35,
    percentage: "28.35%",
    color: "#2563EB", // Blue
  },
  {
    name: "Sunshine Residency",
    value: 28.35,
    percentage: "28.35%",
    color: "#10B981", // Emerald Green
  },
  {
    name: "Metro Warehouse",
    value: 28.35,
    percentage: "28.35%",
    color: "#F59E0B", // Amber / Golden
  },
  {
    name: "Riverside House",
    value: 28.35,
    percentage: "28.35%",
    color: "#06B6D4", // Cyan
  },
  {
    name: "Wedding Hall Dam",
    value: 28.35,
    percentage: "28.35%",
    color: "#94A3B8", // Slate Gray
  },
];

export const IncomeByProjectCard: React.FC = () => {
  return (
    <div className="bg-white rounded-xl p-5 sm:p-6 shadow-xs border border-slate-100 flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center text-[#EC4899]">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-slate-800 text-sm sm:text-base">
            Income by Project (This Month)
          </h3>
        </div>

        {/* Total stat below header */}
        <div className="mt-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            <span className="text-xs text-slate-500 font-normal">Total</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
            $4,85,75,000
          </div>
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
                  const item = payload[0].payload as ProjectIncomeSegment;
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
                data={projectSegments}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={88}
                paddingAngle={4}
                stroke="none"
              >
                {projectSegments.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Absolute Center Content */}
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
        <div className="flex flex-col gap-2.5 w-full sm:max-w-56">
          {projectSegments.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between text-xs gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                {/* Vertical Pill Indicator matching screenshot */}
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

export default IncomeByProjectCard;
