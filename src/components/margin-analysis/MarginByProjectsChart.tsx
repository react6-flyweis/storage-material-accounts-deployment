import React, { useState, useMemo } from "react";
import { Calendar, ChevronDown, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from "recharts";
import {
  useGetMarginAnalysisByProjectQuery,
  type MarginByProjectsData,
} from "@/redux/api/marginAnalysisApi";
import type { MarginFilters } from "./types";

export interface MarginByProjectsChartProps {
  filters?: MarginFilters;
  data?: MarginByProjectsData;
  filter?: "All Projects" | "Top 5" | "Bottom 5";
  onFilterChange?: (filter: "All Projects" | "Top 5" | "Bottom 5") => void;
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

const CustomBarTooltip = ({ active, payload, label }: CustomTooltipProps) => {
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

export const MarginByProjectsChart: React.FC<MarginByProjectsChartProps> = ({
  filters,
  data: propData,
  filter: propFilter,
  onFilterChange: propOnFilterChange,
  isLoading: propIsLoading,
  isFetching: propIsFetching,
}) => {
  const [internalFilter, setInternalFilter] = useState<
    "All Projects" | "Top 5" | "Bottom 5"
  >("All Projects");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const filter = propFilter ?? internalFilter;
  const onFilterChange = propOnFilterChange ?? setInternalFilter;

  const byProjectQueryParams = useMemo(() => {
    return {
      limit: filter === "All Projects" ? 15 : 5,
      startDate: filters?.startDate || undefined,
      endDate: filters?.endDate || undefined,
      businessUnit:
        filters?.companyId && filters.companyId !== "all"
          ? filters.companyId
          : undefined,
      projectId:
        filters?.projectId && filters.projectId !== "all"
          ? filters.projectId
          : undefined,
    };
  }, [filter, filters]);

  const {
    data: fetchedData,
    isLoading: isQueryLoading,
    isFetching: isQueryFetching,
  } = useGetMarginAnalysisByProjectQuery(byProjectQueryParams, {
    skip: Boolean(propData),
  });

  const data = propData ?? fetchedData;
  const isLoading = propIsLoading ?? isQueryLoading;
  const isFetching = propIsFetching ?? isQueryFetching;

  // Apply sorting for Top 5 / Bottom 5
  const chartItems = useMemo(() => {
    const list = data?.projects || [];
    if (!list.length) return [];

    const copy = [...list];
    if (filter === "Top 5") {
      copy.sort((a, b) => (b.grossMarginPct || 0) - (a.grossMarginPct || 0));
      return copy.slice(0, 5);
    }
    if (filter === "Bottom 5") {
      copy.sort((a, b) => (a.grossMarginPct || 0) - (b.grossMarginPct || 0));
      return copy.slice(0, 5);
    }
    return copy;
  }, [data, filter]);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm md:text-base font-bold text-gray-900">
              Margin by Projects
            </h2>
            {isFetching && (
              <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
            )}
          </div>

          {/* Project Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-1.5 border border-gray-200 rounded-md px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              <span>{filter}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-100 rounded-md shadow-md py-1 z-30 text-xs">
                {(["All Projects", "Top 5", "Bottom 5"] as const).map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      onFilterChange(item);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-gray-50 cursor-pointer ${
                      filter === item
                        ? "text-blue-600 font-semibold bg-blue-50/30"
                        : "text-gray-700"
                    }`}
                  >
                    {item}
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

      {/* Grouped Bar Chart */}
      <div className="w-full h-65 flex items-center justify-center">
        {isLoading || (!data?.projects && isFetching) ? (
          <div className="w-full h-full flex flex-col justify-between p-2">
            <div className="relative w-full h-46 flex flex-col justify-between py-1">
              <div className="border-b border-dashed border-gray-100 w-full" />
              <div className="border-b border-dashed border-gray-100 w-full" />
              <div className="border-b border-dashed border-gray-100 w-full" />
              <div className="border-b border-gray-200/80 w-full" />
              {/* Grouped Bar Clusters for 5 Projects */}
              <div className="absolute inset-0 flex items-end justify-around px-4 pb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-end gap-1">
                    <Skeleton
                      className="w-2.5 bg-blue-200/80 rounded-t"
                      style={{ height: `${65 + ((i * 13) % 30)}%` }}
                    />
                    <Skeleton
                      className="w-2.5 bg-emerald-200/80 rounded-t"
                      style={{ height: `${50 + ((i * 19) % 35)}%` }}
                    />
                    <Skeleton
                      className="w-2.5 bg-purple-200/80 rounded-t"
                      style={{ height: `${40 + ((i * 23) % 30)}%` }}
                    />
                    <Skeleton
                      className="w-2.5 bg-amber-200/80 rounded-t"
                      style={{ height: `${55 + ((i * 17) % 30)}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
            {/* X-axis Labels */}
            <div className="flex justify-around px-2 pt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="w-14 h-3 bg-gray-100" />
              ))}
            </div>
          </div>
        ) : chartItems.length === 0 ? (
          <div className="text-center text-xs text-gray-400">
            No project margin data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartItems}
              barGap={3}
              barCategoryGap="24%"
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid vertical={false} stroke="#F9FAFB" />
              <XAxis
                dataKey="projectName"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 11 }}
                dy={4}
              />
              <YAxis
                domain={[0, "auto"]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 11 }}
                tickFormatter={(val) => `${val}%`}
              />
              <RechartsTooltip content={<CustomBarTooltip />} />
              <Bar
                dataKey="grossMarginPct"
                name="Gross Margin"
                fill="#3B82F6"
                barSize={8}
                radius={[3, 3, 0, 0]}
              />
              <Bar
                dataKey="operatingMarginPct"
                name="Operating Margin"
                fill="#10B981"
                barSize={8}
                radius={[3, 3, 0, 0]}
              />
              <Bar
                dataKey="netProfitMarginPct"
                name="Net Profit Margin"
                fill="#8B5CF6"
                barSize={8}
                radius={[3, 3, 0, 0]}
              />
              <Bar
                dataKey="contributionMarginPct"
                name="Contribution Margin"
                fill="#EAB308"
                barSize={8}
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
