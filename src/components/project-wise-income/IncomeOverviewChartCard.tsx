import React, { useState, useMemo } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ShoppingCart, Calendar, ChevronDown } from "lucide-react";
import type { IncomeOverviewChartItem } from "@/redux/api/reportsApi";
import { formatCurrency, formatCompactCurrency } from "@/lib/dashboardFormatters";

interface IncomeOverviewChartCardProps {
  chartData?: IncomeOverviewChartItem[];
  months?: number;
  onMonthsChange?: (months: number) => void;
  isLoading?: boolean;
}

const MONTH_OPTIONS: { label: string; value: number }[] = [
  { label: "Last 3 Months", value: 3 },
  { label: "Last 6 Months", value: 6 },
  { label: "Last 12 Months", value: 12 },
];

interface CustomXAxisTickProps {
  x?: number;
  y?: number;
  payload?: {
    value: string;
  };
}

const CustomXAxisTick: React.FC<CustomXAxisTickProps> = ({ x = 0, y = 0, payload }) => {
  const value = payload?.value || "";
  const parts = value.split(" ");
  const m = parts[0] || "";
  const yVal = parts[1] || "";

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={12}
        textAnchor="middle"
        fill="#64748B"
        fontSize={11}
        fontWeight={500}
      >
        {m}
      </text>
      {yVal ? (
        <text
          x={0}
          y={0}
          dy={26}
          textAnchor="middle"
          fill="#94A3B8"
          fontSize={10}
        >
          {yVal}
        </text>
      ) : null}
    </g>
  );
};

interface CustomLineDotProps {
  cx?: number;
  cy?: number;
}

const CustomLineDot: React.FC<CustomLineDotProps> = ({ cx, cy }) => {
  if (cx == null || cy == null) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill="#F59E0B" />
      <circle cx={cx} cy={cy} r={2.5} fill="#FEF3C7" />
    </g>
  );
};

export const IncomeOverviewChartCard: React.FC<IncomeOverviewChartCardProps> = ({
  chartData = [],
  months = 6,
  onMonthsChange,
  isLoading = false,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedOption =
    MONTH_OPTIONS.find((opt) => opt.value === months) || MONTH_OPTIONS[1];

  const formattedData = useMemo(() => {
    return chartData.map((d) => ({
      ...d,
      total: d.totalIncome,
      received: d.receivedIncome,
      pending: d.pendingIncome,
      displayKey: d.label,
    }));
  }, [chartData]);

  const totals = useMemo(() => {
    return chartData.reduce(
      (acc, curr) => ({
        total: acc.total + (curr.totalIncome || 0),
        received: acc.received + (curr.receivedIncome || 0),
        pending: acc.pending + (curr.pendingIncome || 0),
      }),
      { total: 0, received: 0, pending: 0 }
    );
  }, [chartData]);

  return (
    <div className="bg-white rounded-xl p-5 sm:p-6 shadow-xs border border-slate-100 flex flex-col justify-between h-full">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-[#F97316]">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-slate-800 text-sm sm:text-base">
            Income Overview
          </h3>
        </div>

        {/* Time Filter Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{selectedOption.label}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
              {MONTH_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onMonthsChange?.(opt.value);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                    selectedOption.value === opt.value
                      ? "bg-blue-50 text-blue-600 font-semibold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Legend / Key Summary Indicators */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 my-4">
        {/* Total Income */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
            <span className="text-[11px] sm:text-xs text-slate-500 font-normal">
              Total Income
            </span>
          </div>
          <span className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
            {formatCompactCurrency(totals.total)}
          </span>
        </div>

        {/* Received Income */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="text-[11px] sm:text-xs text-slate-500 font-normal">
              Received Income
            </span>
          </div>
          <span className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
            {formatCompactCurrency(totals.received)}
          </span>
        </div>

        {/* Pending Income */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            <span className="text-[11px] sm:text-xs text-slate-500 font-normal">
              Pending Income
            </span>
          </div>
          <span className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
            {formatCompactCurrency(totals.pending)}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-64 sm:h-72">
        {isLoading && formattedData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="h-40 w-full bg-slate-50 rounded-lg animate-pulse" />
          </div>
        ) : formattedData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
            No income overview data recorded for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={formattedData}
              margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
              barGap={4}
            >
              <CartesianGrid
                strokeDasharray="0"
                stroke="#F1F5F9"
                vertical={false}
              />
              <XAxis
                dataKey="displayKey"
                axisLine={{ stroke: "#E2E8F0" }}
                tickLine={false}
                tick={<CustomXAxisTick />}
                interval={0}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94A3B8", fontSize: 11 }}
                tickFormatter={(val) => formatCompactCurrency(val)}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0].payload as {
                    label: string;
                    total: number;
                    received: number;
                    pending: number;
                  };
                  return (
                    <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-xs space-y-1.5 min-w-36">
                      <div className="font-semibold text-slate-800 border-b border-slate-100 pb-1">
                        {item.label}
                      </div>
                      <div className="flex items-center justify-between text-slate-600 gap-4">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                          Total:
                        </span>
                        <span className="font-bold text-slate-900">
                          {formatCurrency(item.total)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 gap-4">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                          Received:
                        </span>
                        <span className="font-bold text-slate-900">
                          {formatCurrency(item.received)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 gap-4">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                          Pending:
                        </span>
                        <span className="font-bold text-slate-900">
                          {formatCurrency(item.pending)}
                        </span>
                      </div>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="total"
                name="Total Income"
                fill="#2563EB"
                barSize={18}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="received"
                name="Received Income"
                fill="#10B981"
                barSize={18}
                radius={[4, 4, 0, 0]}
              />
              <Line
                type="linear"
                dataKey="pending"
                name="Pending Income"
                stroke="#F59E0B"
                strokeWidth={2.5}
                dot={<CustomLineDot />}
                activeDot={{ r: 6, fill: "#F59E0B" }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default IncomeOverviewChartCard;
