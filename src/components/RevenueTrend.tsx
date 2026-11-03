import { Bar, BarChart, XAxis, YAxis, LabelList } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import type { ChartConfig } from "./ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useState, useMemo } from "react";
import { useGetIncomeVsExpenseQuery } from "@/redux/api/dashboardApi";
import { Skeleton } from "@/components/ui/skeleton";

const chartConfig = {
  income: {
    label: "Income",
    color: "#3B82F6", // Blue
  },
  expenses: {
    label: "Expenses",
    color: "#F97316", // Orange
  },
  revenue: {
    label: "Revenue",
    color: "#10B981", // Green
  },
} satisfies ChartConfig;

const CustomLegend = () => {
  return (
    <div className="flex justify-center flex-wrap xl:gap-8 gap-4 mt-2">
      <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
        <div className="w-3 h-3 rounded-full bg-[#3B82F6]"></div>
        Income
      </div>
      <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
        <div className="w-3 h-3 rounded-full bg-[#F97316]"></div>
        Expenses
      </div>
      <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
        <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
        Revenue
      </div>
    </div>
  );
};

const formatValueLabel = (val: unknown) => {
  if (val === undefined || val === null) return "";
  const num = Number(val);
  if (isNaN(num) || num <= 0) return ""; // Suppress 0 and negative labels to eliminate cluster clutter
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (num >= 1000) {
    return `${Math.round(num / 1000)}k`;
  }
  return `${num}k`;
};

const formatXAxisTick = (tick: string) => {
  if (!tick) return "";
  const parts = tick.trim().split(/\s+/);
  if (parts.length === 2 && parts[1].length === 4) {
    return `${parts[0].slice(0, 3)} '${parts[1].slice(2)}`;
  }
  return tick;
};

const PERIOD_LIMITS: Record<"daily" | "weekly" | "monthly", number> = {
  daily: 7,
  weekly: 6,
  monthly: 5,
};

export function RevenueTrend() {
  const [activePeriod, setActivePeriod] = useState<"daily" | "weekly" | "monthly">("monthly");
  const { data: apiData, isLoading, isFetching } = useGetIncomeVsExpenseQuery({ period: activePeriod });

  const chartData = useMemo(() => {
    if (apiData?.points && apiData.points.length > 0) {
      const limit = PERIOD_LIMITS[activePeriod] || 5;
      const recentPoints = apiData.points.slice(-limit);

      return recentPoints.map((pt) => {
        const rawInc = Number(pt.income) || 0;
        const rawExp = Number(pt.expense) || 0;
        const rev = Math.max(0, rawInc - rawExp);
        return {
          label: pt.label,
          income: rawInc,
          expenses: rawExp,
          revenue: rev,
        };
      });
    }
    return [];
  }, [apiData, activePeriod]);

  const showSkeleton = isLoading || isFetching;

  return (
    <Card className="flex flex-col border-none shadow-none bg-white md:p-6 p-4 rounded-md overflow-visible h-full justify-between">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 px-0 pt-0">
        <div className="flex flex-col">
          <h3 className="lg:text-xl sm:text-base text-md font-semibold text-black tracking-tight">
            Income VS Expenses
          </h3>
          <span className="lg:text-xl sm:text-base text-md font-semibold text-black tracking-tight">
            Revenue Trend
          </span>
        </div>
        <Select
          defaultValue={activePeriod}
          onValueChange={(value: "daily" | "weekly" | "monthly") => setActivePeriod(value)}
        >
          <SelectTrigger className="w-28 bg-white border-gray-200 text-gray-600 rounded-xl h-10 shadow-sm focus:ring-0">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-gray-100 shadow-xl">
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex-1 sm:pb-4 px-0">
        {showSkeleton ? (
          <div className="h-80 w-full flex flex-col justify-end gap-3 p-4">
            <div className="flex items-end justify-between h-64 gap-3">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="flex-1 flex items-end gap-1 h-full">
                  <Skeleton className="w-1/2 h-3/4 rounded-t-lg" />
                  <Skeleton className="w-1/2 h-1/2 rounded-t-lg" />
                </div>
              ))}
            </div>
            <Skeleton className="h-4 w-full" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-80 w-full flex flex-col items-center justify-center text-gray-400 text-sm">
            No income vs expenses data recorded for this period
          </div>
        ) : (
          <div className="h-80 w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart
                data={chartData}
                margin={{ top: 25, right: 10, left: 0, bottom: 20 }}
                barGap={3}
                barCategoryGap="22%"
              >
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={formatXAxisTick}
                  tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 500 }}
                />
                <YAxis hide />
                <ChartTooltip
                  cursor={{ fill: "rgba(0, 0, 0, 0.04)" }}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar
                  dataKey="income"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={18}
                >
                  <LabelList
                    dataKey="income"
                    position="top"
                    offset={6}
                    formatter={formatValueLabel}
                    style={{ fill: "#3B82F6", fontSize: 11, fontWeight: 600 }}
                  />
                </Bar>
                <Bar
                  dataKey="expenses"
                  fill="#F97316"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={18}
                >
                  <LabelList
                    dataKey="expenses"
                    position="top"
                    offset={6}
                    formatter={formatValueLabel}
                    style={{ fill: "#F97316", fontSize: 11, fontWeight: 600 }}
                  />
                </Bar>
                <Bar
                  dataKey="revenue"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={18}
                >
                  <LabelList
                    dataKey="revenue"
                    position="top"
                    offset={6}
                    formatter={formatValueLabel}
                    style={{ fill: "#10B981", fontSize: 11, fontWeight: 600 }}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        )}
        <CustomLegend />
      </CardContent>
    </Card>
  );
}
