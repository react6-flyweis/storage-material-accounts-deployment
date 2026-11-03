import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { TrendingUp } from "lucide-react";
import type { ProfitLossMonthlyTrendItem } from "@/redux/api/reportsApi";
import { formatCurrency, formatCompactCurrency } from "@/lib/dashboardFormatters";

interface ProfitLossTrendChartCardProps {
  chartData?: ProfitLossMonthlyTrendItem[];
  isLoading?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-slate-900/95 backdrop-blur-xs text-white rounded-xl px-4 py-3 shadow-xl border border-slate-800 text-xs space-y-1.5 min-w-44">
      <div className="font-semibold text-slate-200 border-b border-slate-700/60 pb-1.5 mb-1.5">
        {label}
      </div>
      {payload.map((item) => (
        <div key={item.name} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-slate-300 capitalize">{item.name}:</span>
          </div>
          <span className="font-semibold text-white">
            {formatCurrency(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export const ProfitLossTrendChartCard: React.FC<
  ProfitLossTrendChartCardProps
> = ({ chartData = [], isLoading = false }) => {
  return (
    <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-100 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Monthly Financial Trend
            </h3>
            <p className="text-xs text-slate-500 font-normal">
              Fixed 6-month Revenue vs Expense vs Net Profit
            </p>
          </div>
        </div>
      </div>

      {/* Chart Body */}
      <div className="w-full h-72 sm:h-80">
        {isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-400">Loading trend data...</span>
          </div>
        ) : !chartData || chartData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
            No monthly trend data available for this range
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#F1F5F9"
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={{ stroke: "#E2E8F0" }}
                tick={{ fill: "#64748B", fontSize: 12, fontWeight: 500 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => formatCompactCurrency(val)}
                tick={{ fill: "#64748B", fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
              />
              <Bar
                dataKey="revenue"
                name="Revenue"
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
              <Bar
                dataKey="expense"
                name="Expense"
                fill="#EF4444"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
              <Line
                type="monotone"
                dataKey="profit"
                name="Net Profit"
                stroke="#10B981"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#10B981", strokeWidth: 2, stroke: "#FFFFFF" }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ProfitLossTrendChartCard;
