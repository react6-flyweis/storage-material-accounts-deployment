import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { useGetRevenueTrendQuery, useGetExpenseTrendQuery } from "@/redux/api/dashboardApi";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";

const chartConfig = {
  profit: {
    label: "WIP Profit",
    color: "#3B82F6",
  },
  cogs: {
    label: "COGS",
    color: "#EF4444",
  },
} satisfies ChartConfig;

export function WIPProfitTrend() {
  const { data: revData, isLoading: revLoading } = useGetRevenueTrendQuery();
  const { data: expData, isLoading: expLoading } = useGetExpenseTrendQuery();

  const isLoading = revLoading || expLoading;

  const chartData = useMemo(() => {
    const revPoints = revData?.points || [];
    const expPoints = expData?.points || [];

    if (revPoints.length === 0 && expPoints.length === 0) {
      return [];
    }

    const monthMap = new Map<string, { month: string; profit: number; cogs: number }>();

    revPoints.forEach((p) => {
      const profitVal = p.amount > 1000 ? Math.round(p.amount / 1000) : p.amount;
      monthMap.set(p.month, {
        month: p.month,
        profit: profitVal,
        cogs: 0,
      });
    });

    expPoints.forEach((p) => {
      const cogsVal = p.amount > 1000 ? Math.round(p.amount / 1000) : p.amount;
      const existing = monthMap.get(p.month);
      if (existing) {
        existing.cogs = cogsVal;
      } else {
        monthMap.set(p.month, {
          month: p.month,
          profit: 0,
          cogs: cogsVal,
        });
      }
    });

    return Array.from(monthMap.values());
  }, [revData, expData]);

  return (
    <Card className="flex flex-col h-full border border-gray-200/80 shadow-none bg-white p-6 rounded-xl justify-between">
      <CardHeader className="flex flex-row items-center justify-between p-0 mb-6 space-y-0">
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">
          WIP Profit vs COGS Trend
        </h3>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
            <span className="w-3 h-3 rounded-full bg-[#3B82F6]" />
            <span>WIP Profit</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
            <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
            <span>COGS</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 flex flex-col justify-end">
        {isLoading ? (
          <div className="h-95 w-full flex flex-col justify-end gap-3 p-4">
            <Skeleton className="h-82.5 w-full rounded-xl" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-95 w-full flex items-center justify-center text-gray-400 text-sm">
            No WIP profit vs COGS trend data recorded
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-95 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
              >
                <CartesianGrid vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="month"
                  tickLine={{ stroke: "#CBD5E1", strokeWidth: 1.5 }}
                  axisLine={{ stroke: "#CBD5E1", strokeWidth: 1.5 }}
                  tick={{ fill: "#64748B", fontSize: 12, fontWeight: 500 }}
                  tickMargin={10}
                />
                <YAxis
                  tickLine={{ stroke: "#CBD5E1", strokeWidth: 1.5 }}
                  axisLine={{ stroke: "#CBD5E1", strokeWidth: 1.5 }}
                  tick={{ fill: "#64748B", fontSize: 12, fontWeight: 500 }}
                  tickFormatter={(value) => `$${value}K`}
                />
                <ChartTooltip
                  cursor={{ stroke: "#E2E8F0", strokeWidth: 1 }}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ r: 4.5, fill: "#3B82F6", stroke: "#3B82F6", strokeWidth: 1 }}
                  activeDot={{ r: 6.5, fill: "#3B82F6" }}
                />
                <Line
                  type="monotone"
                  dataKey="cogs"
                  stroke="#EF4444"
                  strokeWidth={3}
                  dot={{ r: 4.5, fill: "#EF4444", stroke: "#EF4444", strokeWidth: 1 }}
                  activeDot={{ r: 6.5, fill: "#EF4444" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
