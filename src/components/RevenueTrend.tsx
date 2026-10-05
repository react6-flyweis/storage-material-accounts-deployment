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
import { useState } from "react";

export const chartDataByFilter: any = {
  daily: [
    { label: "9 AM", income: 40, expenses: 20, revenue: 20 },
    { label: "12 PM", income: 75, expenses: 35, revenue: 40 },
    { label: "3 PM", income: 120, expenses: 55, revenue: 65 },
    { label: "6 PM", income: 90, expenses: 45, revenue: 45 },
    { label: "9 PM", income: 60, expenses: 30, revenue: 30 },
  ],

  weekly: [
    { label: "Mon", income: 180, expenses: 220, revenue: 160 },
    { label: "Tue", income: 195, expenses: 240, revenue: 100 },
    { label: "Wed", income: 380, expenses: 180, revenue: 160 },
    { label: "Thu", income: 160, expenses: 280, revenue: 60 },
    { label: "Fri", income: 220, expenses: 190, revenue: 130 },
    { label: "Sat", income: 140, expenses: 110, revenue: 90 },
    { label: "Sun", income: 90, expenses: 70, revenue: 40 },
  ],

  monthly: [
    { label: "Week 1", income: 820, expenses: 640, revenue: 180 },
    { label: "Week 2", income: 940, expenses: 720, revenue: 220 },
    { label: "Week 3", income: 1_120, expenses: 860, revenue: 260 },
    { label: "Week 4", income: 980, expenses: 790, revenue: 190 },
  ],
};

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
    <div className="flex justify-center flex-wrap xl:gap-8 gap-4">
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

export function RevenueTrend() {
  const [activeTab, setActiveTab] = useState("monthly");
  const chartData = chartDataByFilter[activeTab];
  return (
    <Card className="flex flex-col border-none shadow-none bg-white md:p-6 p-4 rounded-md overflow-visible">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 px-0 pt-0">
        <div className="flex flex-col">
          <h3 className="lg:text-xl sm:text-base text-md font-semibold text-black tracking-tight">
            Income VS Expenses
          </h3>
          <span className="lg:text-xl sm:text-base text-md font-semibold text-black tracking-tight">
            Revenue Trend
          </span>
        </div>
        <Select defaultValue={activeTab} onValueChange={(value)=>setActiveTab(value)}>
          <SelectTrigger className="w-[110px] bg-white border-gray-200 text-gray-600 rounded-xl h-10 shadow-sm focus:ring-0">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-gray-100 shadow-xl">
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex-1 sm:pb-18 px-0">
        <div className="h-[400px] w-full">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart
              data={chartData}
              margin={{ top: 40, right: 10, left: 0, bottom: 40 }}
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
                  formatter={(val: any) => `${val}k`}
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
                  formatter={(val: any) => `${val}k`}
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
                  formatter={(val: any) => `${val}k`}
                  style={{ fill: "#ffffff", fontSize: 11, fontWeight: 500 }}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
        <CustomLegend />
      </CardContent>
    </Card>
  );
}
