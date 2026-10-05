import { Card } from "@/components/ui/card";
import { ArrowUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export default function OverallCostEfficiencyCard() {
  const percentage = 92.6;
  const totalSegments = 8;
  const filledSegments = Math.round((percentage / 100) * totalSegments);

  // Create data for the segmented ring
  const chartData = Array.from({ length: totalSegments }).map((_, index) => ({
    name: `Segment ${index + 1}`,
    value: 1, // Equal size segments
    isFilled: index < filledSegments,
  }));

  return (
    <Card className="p-6 xl:pb-10 bg-white rounded-md border-none shadow-sm h-full flex flex-col">
      <h3 className="xl:text-lg font-bold text-gray-900 mb-6">
        Overall Cost Efficiency
      </h3>

      <div className="flex-1 flex flex-col items-center justify-center min-h-[160px] relative">
        <div className="w-[180px] h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5} // Gaps between segments
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                stroke="none"
                cornerRadius={4}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isFilled ? "#10B981" : "#E5E7EB"}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="xl:text-3xl text-xl font-bold text-gray-900">
            {percentage}%
          </span>
        </div>
      </div>

      <div className="space-y-4 mt-6">
        <div className="flex justify-between items-center xl:text-sm text-xs">
          <span className="text-gray-600 font-medium">Projects On Budget</span>
          <span className="font-semibold text-emerald-600">23 of 26</span>
        </div>
        <div className="flex justify-between items-center xl:text-sm text-xs">
          <span className="text-gray-600 font-medium">Average Variance</span>
          <span className="font-semibold text-gray-900">+3.2%</span>
        </div>
        <div className="flex justify-between items-center xl:text-sm text-xs">
          <span className="text-gray-600 font-medium">Cost Savings YTD</span>
          <span className="font-semibold text-emerald-600">$127,450</span>
        </div>
      </div>

      <div className="pt-5 mb-10 flex items-center justify-center gap-2 border-t xl:text-sm text-xs font-medium text-emerald-600">
        <ArrowUp className="w-4 h-4" />
        +2.3% improvement from last quarter
      </div>
    </Card>
  );
}
