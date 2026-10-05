"use client";

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
import type { TabType } from "@/pages/Dashboard";

export const chartDataByFilter: Record<
  TabType,
  { label: string; profit: number }[]
> = {
  today: [
    { label: "9 AM", profit: 4_500 },
    { label: "11 AM", profit: 7_200 },
    { label: "1 PM", profit: 12_800 },
    { label: "3 PM", profit: 9_600 },
    { label: "5 PM", profit: 15_400 },
    { label: "7 PM", profit: 11_900 },
  ],

  week: [
    { label: "Mon", profit: 45_000 },
    { label: "Tue", profit: 52_000 },
    { label: "Wed", profit: 48_000 },
    { label: "Thu", profit: 65_000 },
    { label: "Fri", profit: 72_000 },
    { label: "Sat", profit: 68_000 },
    { label: "Sun", profit: 85_000 },
  ],

  month: [
    { label: "Jan", profit: 45_000 },
    { label: "Feb", profit: 52_000 },
    { label: "Mar", profit: 48_000 },
    { label: "Apr", profit: 65_000 },
    { label: "May", profit: 72_000 },
    { label: "Jun", profit: 68_000 },
    { label: "Jul", profit: 85_000 },
    { label: "Aug", profit: 92_000 },
    { label: "Sep", profit: 89_000 },
    { label: "Oct", profit: 105_000 },
    { label: "Nov", profit: 112_000 },
    { label: "Dec", profit: 125_000 },
  ],
};


const chartConfig = {
  profit: {
    label: "Monthly Profit",
    color: "#3B82F6",
  },
} satisfies ChartConfig;

const CustomLegend = ({activeTab}: {activeTab: TabType}) => {
  const profitTitleMap: Record<TabType, string> = {
  today: "Today's Profit",
  week: "Weekly Profit",
  month: "Monthly Profit",
};
  return (
    <div className="flex justify-end gap-6 mb-4">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-600 capitalize">
        <div className="w-3 h-3 rounded-full bg-[#3B82F6]"></div>
       {profitTitleMap[activeTab]}
      </div>
    </div>
  );
};

export function ProfitGrowthOverTimeChart({activeTab}: {activeTab: TabType}) {
  const chartData = chartDataByFilter[activeTab];
  return (
    <Card className="flex flex-col h-full border-none shadow-sm bg-white p-6 rounded-md">
      <CardHeader className="flex flex-row items-center justify-between p-0 mb-8">
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">
          Profit Growth Over Time
        </h3>
        <CustomLegend activeTab={activeTab}/>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickMargin={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickFormatter={(value) => `$${value / 1000}K`}
                domain={[0, "auto"]}
              />
              <ChartTooltip
                cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ r: 4, fill: "#3B82F6", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
