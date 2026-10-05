import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetExpenseTrendQuery } from "@/redux/api/dashboardApi";
import { formatCurrency } from "@/lib/dashboardFormatters";
import { useMemo } from "react";

interface FreightSpendTrendProps {
  isLoading?: boolean;
}

export function FreightSpendTrend({ isLoading: propLoading }: FreightSpendTrendProps) {
  const { data: expenseData, isLoading: queryLoading } = useGetExpenseTrendQuery();

  const isLoading = propLoading || queryLoading;

  const chartData = useMemo(() => {
    const points = expenseData?.points || [];
    return points.map((p) => {
      const spendVal = p.amount > 1000 ? Math.round(p.amount / 1000) : p.amount;
      return {
        month: p.month,
        spend: spendVal,
        rawAmount: p.amount,
      };
    });
  }, [expenseData]);

  return (
    <Card className="flex flex-col border border-gray-200/80 shadow-none bg-white p-6 rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between p-0 mb-4 space-y-0">
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">
          Freight Spend Trend
        </h3>
        <div className="border border-gray-200 bg-white rounded-md px-3 py-1.5 text-xs font-medium text-gray-700 flex items-center gap-1.5 shadow-none select-none">
          <span>6 Months</span>
          <Calendar className="w-3.5 h-3.5 text-gray-500" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="h-52.5 w-full flex flex-col justify-end gap-3">
            <Skeleton className="h-44 w-full rounded-lg" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-52.5 w-full flex items-center justify-center text-gray-400 text-sm">
            No freight spend trend data recorded
          </div>
        ) : (
          <div className="h-52.5 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="freightSpendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9333EA" stopOpacity={0.75} />
                    <stop offset="60%" stopColor="#A855F7" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#C084FC" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="#F1F5F9"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748B", fontSize: 12, fontWeight: 500 }}
                  tickMargin={8}
                />
                <YAxis
                  tickFormatter={(val) => `$${val}k`}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748B", fontSize: 12, fontWeight: 500 }}
                />
                <Tooltip
                  formatter={(
                    value: unknown,
                    _name: unknown,
                    item: { payload?: { rawAmount?: number } }
                  ) => [
                    formatCurrency(item?.payload?.rawAmount ?? Number(value) * 1000),
                    "Freight Spend",
                  ]}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "8px",
                    borderColor: "#e2e8f0",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="spend"
                  stroke="#9333EA"
                  strokeWidth={2}
                  fill="url(#freightSpendGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
