import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import type { TabType } from "@/pages/Dashboard";

interface WipVsCompletedCardProps {
  activeTab: TabType;
  className?: string;
}

export const wipVsCompletedByFilter: Record<
  TabType,
  {
    totalWipValue: string;
    completedWork: string;
    completionRate: string;
    completedPercent: number;
  }
> = {
  today: {
    totalWipValue: "$185,000",
    completedWork: "$92,000",
    completionRate: "49.7%",
    completedPercent: 49.7,
  },

  week: {
    totalWipValue: "$820,000",
    completedWork: "$564,000",
    completionRate: "68.7%",
    completedPercent: 68.7,
  },

  month: {
    totalWipValue: "$2,430,000",
    completedWork: "$1,668,000",
    completionRate: "68.6%",
    completedPercent: 68.6,
  },
} as const;


export default function WipVsCompletedCard({
  activeTab,
  className,
}: WipVsCompletedCardProps) {
  const data = wipVsCompletedByFilter[activeTab];

  return (
    <Card
      className={cn("p-6 bg-white rounded-md border-none shadow-sm", className)}
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="xl:w-10 xl:h-10 w-8 h-8 rounded-xl flex items-center justify-center bg-blue-50">
          <Clock className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="xl:text-lg text-base font-bold text-gray-900">
          WIP vs Completed
        </h3>
      </div>

      <div className="space-y-8">
        {/* Total WIP */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-gray-500 font-medium">
              Total WIP Value
            </span>
            <span className="font-bold text-gray-900">
              {data.totalWipValue}
            </span>
          </div>

          <div className="h-2.5 w-full bg-blue-100/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full"
              style={{ width: "100%" }}
            />
          </div>
        </div>

        {/* Completed */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm mb-1">
            <span className="text-gray-500 font-medium">
              Completed Work
            </span>
            <span className="font-bold text-gray-900">
              {data.completedWork}
            </span>
          </div>

          <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${data.completedPercent}%` }}
            />
          </div>
        </div>

        {/* Completion Rate */}
        <div className="flex justify-between items-center">
          <span className="text-gray-500 font-medium text-sm">
            Completion Rate
          </span>
          <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-normal">
            {data.completionRate}
          </span>
        </div>
      </div>
    </Card>
  );
}
