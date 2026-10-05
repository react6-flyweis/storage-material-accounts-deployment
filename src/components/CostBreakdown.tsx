import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import type { ChartConfig } from "./ui/chart";

const data = [
  { name: "Material", value: 45, fill: "#3B82F6" },
  { name: "Labour", value: 35, fill: "#10B981" },
  { name: "Logistics", value: 20, fill: "#F59E0B" },
];

const chartConfig = {
  material: {
    label: "Material",
    color: "#3B82F6",
  },
  labour: {
    label: "Labour",
    color: "#22C55E",
  },
  logistics: {
    label: "Logistics",
    color: "#EAB308",
  },
} satisfies ChartConfig;

const CustomLegend = () => {
  return (
    <div className="flex flex-col gap-10 mt-4">
      {data.map((item) => (
        <div key={item.name} className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: item.fill }}
          ></div>
          <span className="text-sm font-normal text-[#374151]">
            {item.name}
          </span>
        </div>
      ))}
    </div>
  );
};

export function CostBreakdown() {
  return (
    <Card className="flex flex-col h-full border-none shadow-none bg-white p-6 rounded-md">
      <CardHeader className="p-0 mb-4">
        <h3 className="xl:text-xl text-md font-medium text-black tracking-tight">
          Cost Breakdown
        </h3>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 p-0">
        <div className="relative h-[320px] w-full">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={2}
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-lg font-medium text-[#374151] uppercase tracking-wider mb-1">
              Total Cost
            </span>
            <span className="text-3xl font-medium text-[#374151]">$1680K</span>
          </div>
        </div>
        <CustomLegend />
      </CardContent>
    </Card>
  );
}
