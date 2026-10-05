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

const formatValueLabel = (val: any) => {
  if (val === undefined || val === null) return "";
  const num = Number(val);
  if (isNaN(num)) return String(val);
  if (Math.abs(num) >= 1000) {
    return `${Math.round(num / 1000)}k`;
  }
  return `${num}k`;
};

export function RevenueTrend() {
  const [activePeriod, setActivePeriod] = useState<"daily" | "weekly" | "monthly">("monthly");
  const { data: apiData, isLoading, isFetching } = useGetIncomeVsExpenseQuery({ period: activePeriod });

  const chartData = useMemo(() => {
    if (apiData?.points && apiData.points.length > 0) {
      return apiData.points.map((pt) => {
        const inc = pt.income > 10000 ? Math.round(pt.income / 1000) : pt.income;
        const exp = pt.expense > 10000 ? Math.round(pt.expense / 1000) : pt.expense;
        const rev = Math.max(0, inc - exp);
        return {
          label: pt.label,
          income: inc,
          expenses: exp,
          revenue: rev,
        };
      });
    }
    return [];
  }, [apiData]);

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
                margin={{ top: 30, right: 10, left: 0, bottom: 20 }}
                barGap={0}
                barCategoryGap="15%"
              >
                <XAxis
                  xAxisId="bars"
                  dataKey="label"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tick={{ fill: "#6b7280", fontSize: 13, fontWeight: 500 }}
                />
                <XAxis xAxisId="revenue" dataKey="label" hide />
                <YAxis hide />
                <ChartTooltip
                  cursor={{ fill: "transparent" }}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar
                  xAxisId="bars"
                  dataKey="income"
                  fill="#3B82F6"
                  radius={[8, 8, 0, 0]}
                  barSize={40}
                >
                  <LabelList
                    dataKey="income"
                    position="top"
                    offset={10}
                    formatter={formatValueLabel}
                    style={{ fill: "#3B82F6", fontSize: 12, fontWeight: 500 }}
                  />
                </Bar>
                <Bar
                  xAxisId="bars"
                  dataKey="expenses"
                  fill="#F97316"
                  radius={[8, 8, 0, 0]}
                  barSize={40}
                >
                  <LabelList
                    dataKey="expenses"
                    position="top"
                    offset={10}
                    formatter={formatValueLabel}
                    style={{ fill: "#F97316", fontSize: 12, fontWeight: 500 }}
                  />
                </Bar>
                <Bar
                  xAxisId="revenue"
                  dataKey="revenue"
                  fill="#22C55E"
                  radius={[8, 8, 0, 0]}
                  barSize={35}
                >
                  <LabelList
                    dataKey="revenue"
                    position="center"
                    formatter={formatValueLabel}
                    style={{ fill: "#ffffff", fontSize: 11, fontWeight: 500 }}
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
