import React, { useState, useMemo } from "react";
import { Calendar, ChevronDown, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from "recharts";
import {
  useGetMarginAnalysisTrendQuery,
  type MarginTrendData,
} from "@/redux/api/marginAnalysisApi";
import type { MarginFilters } from "./types";

export interface MarginTrendChartProps {
  filters?: MarginFilters;
  data?: MarginTrendData;
  interval?: "month" | "quarter" | "year";
  onIntervalChange?: (interval: "month" | "quarter" | "year") => void;
  isLoading?: boolean;
  isFetching?: boolean;
}

interface TooltipPayloadItem {
  name?: string;
  value?: number | string;
  color?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
}

const CustomLineTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-gray-100 rounded-lg shadow-lg p-2.5 text-xs z-50">
        <p className="font-semibold text-gray-800 mb-1.5">{label}</p>
        <div className="space-y-1">
          {payload.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-gray-600">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: item.color }}
                />
                {item.name}:
              </span>
              <span
                className={`font-semibold ${
                  Number(item.value) < 0 ? "text-rose-600" : "text-gray-900"
                }`}
              >
                {Number(item.value).toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const MarginTrendChart: React.FC<MarginTrendChartProps> = ({
  filters,
  data: propData,
  interval: propInterval,
  onIntervalChange: propOnIntervalChange,
  isLoading: propIsLoading,
  isFetching: propIsFetching,
}) => {
  const [internalInterval, setInternalInterval] = useState<
    "month" | "quarter" | "year"
  >("month");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const interval = propInterval ?? internalInterval;
  const onIntervalChange = propOnIntervalChange ?? setInternalInterval;

  const trendQueryParams = useMemo(() => {
    return {
      period: interval,
      projectId:
        filters?.projectId && filters.projectId !== "all"
          ? filters.projectId
          : undefined,
      businessUnit:
        filters?.companyId && filters.companyId !== "all"
          ? filters.companyId
          : undefined,
      startDate: filters?.startDate || undefined,
      endDate: filters?.endDate || undefined,
    };
  }, [interval, filters]);

  const {
    data: fetchedData,
    isLoading: isQueryLoading,
    isFetching: isQueryFetching,
  } = useGetMarginAnalysisTrendQuery(trendQueryParams, {
    skip: Boolean(propData),
  });

  const data = propData ?? fetchedData;
  const isLoading = propIsLoading ?? isQueryLoading;
  const isFetching = propIsFetching ?? isQueryFetching;

  const intervalLabel =
    interval === "month"
      ? "Monthly"
      : interval === "quarter"
      ? "Quarterly"
      : "Yearly";

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm md:text-base font-bold text-gray-900">
              Margin Trend Over Time
            </h2>
            {isFetching && (
              <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
            )}
          </div>

          {/* Trend Interval Dropdown: month | quarter | year */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-1.5 border border-gray-200 rounded-md px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50 cursor-pointer capitalize"
            >
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              <span>{intervalLabel}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-100 rounded-md shadow-md py-1 z-30 text-xs">
                {[
                  { key: "month", label: "Monthly" },
                  { key: "quarter", label: "Quarterly" },
                  { key: "year", label: "Yearly" },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      onIntervalChange(item.key as "month" | "quarter" | "year");
                      setIsMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-gray-50 cursor-pointer ${
                      interval === item.key
                        ? "text-blue-600 font-semibold bg-blue-50/30"
                        : "text-gray-700"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-600 mb-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
            <span>Gross Margin</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            <span>Operating Margin</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
            <span>Net Profit Margin</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308]" />
            <span>Contribution Margin</span>
          </div>
        </div>
      </div>

      {/* Line Chart Body */}
      <div className="w-full h-65 flex items-center justify-center">
        {isLoading || (!data?.trend && isFetching) ? (
          <div className="w-full h-full flex flex-col justify-between p-2">
            <div className="relative w-full h-46 flex flex-col justify-between py-1">
              <div className="border-b border-dashed border-gray-100 w-full" />
              <div className="border-b border-dashed border-gray-100 w-full" />
              <div className="border-b border-dashed border-gray-100 w-full" />
              <div className="border-b border-gray-200/80 w-full" />
              {/* Subtle SVG Trend Curves for Line Chart Skeleton */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 400 120"
                preserveAspectRatio="none"
              >
                <path
                  d="M 10 85 Q 100 35, 200 65 T 390 28"
                  fill="none"
                  stroke="#DBEAFE"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="animate-pulse"
                />
                <path
                  d="M 10 100 Q 100 65, 200 45 T 390 55"
                  fill="none"
                  stroke="#D1FAE5"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="animate-pulse"
                />
              </svg>
            </div>
            {/* X-Axis Ticks */}
            <div className="flex justify-between px-2 pt-1">
              <Skeleton className="w-10 h-3 bg-gray-100" />
              <Skeleton className="w-10 h-3 bg-gray-100" />
              <Skeleton className="w-10 h-3 bg-gray-100" />
              <Skeleton className="w-10 h-3 bg-gray-100" />
              <Skeleton className="w-10 h-3 bg-gray-100" />
              <Skeleton className="w-10 h-3 bg-gray-100" />
            </div>
          </div>
        ) : !data?.trend || data.trend.length === 0 ? (
          <div className="text-center text-xs text-gray-400">
            No trend data available for the selected period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data.trend}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis
                dataKey="label"
                axisLine={{ stroke: "#D1D5DB" }}
                tickLine={{ stroke: "#9CA3AF" }}
                tick={{ fill: "#374151", fontSize: 11, fontWeight: 500 }}
                dy={4}
              />
              <YAxis
                domain={[0, "auto"]}
                tick={{ fill: "#6B7280", fontSize: 10 }}
                tickFormatter={(val) => `${val}%`}
                axisLine={false}
                tickLine={false}
              />
              <RechartsTooltip content={<CustomLineTooltip />} />
              <Line
                type="monotone"
                dataKey="grossMarginPct"
                name="Gross Margin"
                stroke="#3B82F6"
                strokeWidth={2.2}
                dot={false}
                activeDot={{ r: 5, fill: "#3B82F6" }}
              />
              <Line
                type="monotone"
                dataKey="operatingMarginPct"
                name="Operating Margin"
                stroke="#10B981"
                strokeWidth={2.2}
                dot={false}
                activeDot={{ r: 5, fill: "#10B981" }}
              />
              <Line
                type="monotone"
                dataKey="netProfitMarginPct"
                name="Net Profit Margin"
                stroke="#8B5CF6"
                strokeWidth={2.2}
                dot={false}
                activeDot={{ r: 5, fill: "#8B5CF6" }}
              />
              <Line
                type="monotone"
                dataKey="contributionMarginPct"
                name="Contribution Margin"
                stroke="#EAB308"
                strokeWidth={2.2}
                dot={false}
                activeDot={{ r: 5, fill: "#EAB308" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
