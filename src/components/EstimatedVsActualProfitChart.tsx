"use client";

import {
  Bar,
  BarChart,
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
import type { TabType } from "@/pages/Dashboard";

export const projectCostChartByFilter: Record<
  TabType,
  { project: string; estimated: number; actual: number }[]
> = {
  today: [
    { project: "Project A", estimated: 8_500, actual: 9_200 },
    { project: "Project B", estimated: 6_500, actual: 5_800 },
    { project: "Project C", estimated: 12_000, actual: 13_500 },
    { project: "Project D", estimated: 9_500, actual: 8_800 },
    { project: "Project E", estimated: 7_500, actual: 8_200 },
  ],

  week: [
    { project: "Project A", estimated: 5_000, actual: 6_000 },
    { project: "Project B", estimated: 6_500, actual: 10_800 },
    { project: "Project C", estimated: 12_000, actual: 13_500 },
    { project: "Project D", estimated: 9_500, actual: 8_800 },
    { project: "Project E", estimated: 7_500, actual: 8_200 },
  ],

  month: [
    { project: "Project A", estimated: 285_000, actual: 310_000 },
    { project: "Project B", estimated: 210_000, actual: 198_000 },
    { project: "Project C", estimated: 420_000, actual: 465_000 },
    { project: "Project D", estimated: 350_000, actual: 332_000 },
    { project: "Project E", estimated: 290_000, actual: 315_000 },
  ],
};

const chartConfig = {
  estimated: {
    label: "Estimated",
    color: "#3B82F6",
  },
  actual: {
    label: "Actual",
    color: "#22C55E",
  },
} satisfies ChartConfig;

const CustomLegend = () => {
  return (
    <div className="flex justify-end gap-6 mb-4">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
        <div className="w-3 h-3 rounded-full bg-[#3B82F6]"></div>
        Estimated
      </div>
      <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
        <div className="w-3 h-3 rounded-full bg-[#22C55E]"></div>
        Actual
      </div>
    </div>
  );
};

export default function EstimatedVsActualProfitChart({activeTab}: {activeTab: TabType}) {
  const chartData = projectCostChartByFilter[activeTab];
  return (
    <Card className="flex flex-col h-full border-none shadow-sm bg-white p-6 rounded-md">
      <CardHeader className="flex flex-row items-center justify-between p-0 mb-8">
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">
          Estimated vs Actual Profit
        </h3>
        <CustomLegend />
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              barCategoryGap="20%"
              barGap={5}
            >
              <CartesianGrid vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="project" 
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickMargin={12}
               tickFormatter={(value) => value}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickFormatter={(value) => `$${value / 1000}K`}
                domain={[0, "auto"]}
              />
              <ChartTooltip
                cursor={{ fill: "#f3f4f6" }}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar
                dataKey="estimated"
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
                barSize={32}
              />
              <Bar
                dataKey="actual"
                fill="#22C55E"
                radius={[4, 4, 0, 0]}
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
