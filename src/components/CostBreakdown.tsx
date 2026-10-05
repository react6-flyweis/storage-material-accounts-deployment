import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { OrderVsPlantCosts, DeliveryFinance } from "@/redux/api/dashboardApi";
import { formatCurrency } from "@/lib/dashboardFormatters";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";

interface CostBreakdownProps {
  orderVsPlantCosts?: OrderVsPlantCosts;
  deliveryFinance?: DeliveryFinance;
  isLoading?: boolean;
}

export function CostBreakdown({
  orderVsPlantCosts,
  deliveryFinance,
  isLoading,
}: CostBreakdownProps) {
  const { chartData, totalCost } = useMemo(() => {
    const freightCost = deliveryFinance?.freightSpend || 0;
    const pendingCarrier = deliveryFinance?.pendingCarrierPayments || 0;
    const plantCost = orderVsPlantCosts?.totalPlantCosts || 0;
    const total = freightCost + pendingCarrier + plantCost;

    if (total === 0) {
      return { chartData: [], totalCost: 0 };
    }

    const items = [
      {
        name: "Freight Cost",
        value: freightCost,
        fill: "#2563EB",
      },
      {
        name: "Fuel Surcharge",
        value: pendingCarrier,
        fill: "#10B981",
      },
      {
        name: "Handling",
        value: plantCost,
        fill: "#F59E0B",
      },
    ].filter((item) => item.value > 0);

    return { chartData: items, totalCost: total };
  }, [orderVsPlantCosts, deliveryFinance]);

  return (
    <Card className="flex flex-col border border-gray-200/80 shadow-none bg-white p-6 rounded-xl">
      <CardHeader className="p-0 mb-4">
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">
          Logistics Cost Breakdown
        </h3>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-between gap-6 py-2">
            <Skeleton className="w-40 h-40 rounded-full shrink-0" />
            <div className="flex flex-col gap-4 flex-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-48 w-full flex items-center justify-center text-gray-400 text-sm">
            No logistics cost records available
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="relative w-48 h-48 sm:w-52 sm:h-52 shrink-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    formatter={(value: unknown, name: unknown) => [
                      formatCurrency(Number(value) || 0),
                      String(name),
                    ]}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "8px",
                      borderColor: "#e2e8f0",
                      fontSize: "12px",
                    }}
                  />
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={88}
                    paddingAngle={2}
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs sm:text-sm font-semibold text-gray-800">
                  Total Cost
                </span>
                <span className="text-xl sm:text-2xl font-bold text-gray-900">
                  {formatCurrency(totalCost)}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:gap-6 justify-center flex-1 w-full sm:w-auto">
              {chartData.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {item.name} – {formatCurrency(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
