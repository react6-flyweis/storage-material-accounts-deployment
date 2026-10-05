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

const chartData = [
  { month: "Jan", profit: 180, cogs: 120 },
  { month: "Feb", profit: 220, cogs: 140 },
  { month: "Mar", profit: 195, cogs: 135 },
  { month: "Apr", profit: 240, cogs: 160 },
  { month: "May", profit: 280, cogs: 180 },
  { month: "Jun", profit: 320, cogs: 200 },
];

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

const CustomLegend = () => {
  return (
    <div className="flex justify-end gap-6 mb-4 ml-auto">
      <div className="flex items-center gap-2 md:text-sm text-xs font-medium text-gray-600">
        <div className="w-3 h-3 rounded-full bg-[#3B82F6]"></div>
        WIP Profit
      </div>
      <div className="flex items-center gap-2 md:text-sm text-xs font-medium text-gray-600">
        <div className="w-3 h-3 rounded-full bg-[#EF4444]"></div>
        COGS
      </div>
    </div>
  );
};

export function WIPProfitTrend() {
  return (
    <Card className="flex flex-col h-full border-none shadow-none bg-white p-6 rounded-md">
      <CardHeader className="flex flex-wrap items-center justify-between p-0 mb-8">
        <h3 className="xl:text-xl text-md font-medium text-black tracking-tight">
          WIP Profit vs COGS Trend
        </h3>
        <CustomLegend />
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
                dataKey="month"
                tickLine={{ stroke: "#e2e8f0" }}
                axisLine={{ stroke: "#e2e8f0", strokeWidth: 3 }}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickMargin={12}
              />
              <YAxis
                tickLine={{ stroke: "#e2e8f0" }}
                axisLine={{ stroke: "#e2e8f0", strokeWidth: 3 }}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickFormatter={(value) => `$${value}K`}
                domain={[0, 400]}
                ticks={[0, 64, 128, 192, 256, 320]}
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
              <Line
                type="monotone"
                dataKey="cogs"
                stroke="#EF4444"
                strokeWidth={3}
                dot={{ r: 4, fill: "#EF4444", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
