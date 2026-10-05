import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PieChart } from "lucide-react";

export interface CostItem {
  label: string;
  value: string;
  percentage: string;
  color: string;
  progress: number; // 0 to 100
}

interface OverallCostBreakdownProps {
  title: string;
  totalCost: string;
  items: CostItem[];
  className?: string;
  isIcon?: boolean;
}

export default function OverallCostBreakdown({
  totalCost,
  items,
  className,
  title,
  isIcon = true,
}: OverallCostBreakdownProps) {
  return (
    <Card
      className={cn(
        "p-6 pb-40 bg-white rounded-md border-none shadow-sm",
        className
      )}
    >
      <div className="flex items-center gap-3 mb-8">
        {isIcon && (
          <div className="xl:w-10 xl:h-10 w-8 h-8 rounded-xl flex items-center justify-center bg-purple-50">
            <PieChart className="w-5 h-5 text-purple-600" />
          </div>
        )}
        <h3 className="xl:text-lg text-base font-bold text-gray-900">
          {title}
        </h3>
      </div>

      <div className="space-y-6">
        {items.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-600 font-medium">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">{item.value}</span>
                <span className="text-gray-400 text-xs">
                  ({item.percentage})
                </span>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${item.progress}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 pt-6 border-t border-gray-100 flex justify-between items-center">
        <span className="text-gray-900 xl:text-md text-base font-bold">
          Total Cost
        </span>
        <span className="text-gray-900 xl:text-md text-base font-bold ">
          {totalCost}
        </span>
      </div>
    </Card>
  );
}
