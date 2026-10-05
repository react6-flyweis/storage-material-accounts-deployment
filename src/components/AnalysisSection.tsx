import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { OrderVsPlantCosts } from "@/redux/api/dashboardApi";
import { formatCurrency } from "@/lib/dashboardFormatters";

interface AnalysisCardProps {
  label: string;
  value: string;
  bgColor: string;
  textColor: string;
}

function AnalysisCard({ label, value, bgColor, textColor }: AnalysisCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center md:p-4 p-2 rounded-xl flex-1 min-w-[120px] max-w-[260px]",
        bgColor
      )}
    >
      <span className="md:text-xs text-[9px] font-normal text-[#4B5563] mb-1">
        {label}
      </span>
      <span className={cn("md:text-xl text-xs font-semibold", textColor)}>
        {value}
      </span>
    </div>
  );
}

interface AnalysisSectionProps {
  data?: OrderVsPlantCosts;
  isLoading?: boolean;
}

export function AnalysisSection({ data, isLoading }: AnalysisSectionProps) {
  if (isLoading) {
    return (
      <Card className="xl:p-6 p-3 rounded-md shadow-none bg-white">
        <Skeleton className="h-6 w-72 mb-4" />
        <div className="flex gap-4 flex-wrap">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center md:p-4 p-2 rounded-xl flex-1 min-w-[120px] max-w-[260px] bg-gray-50 border border-gray-100 h-20"
            >
              <Skeleton className="h-3 w-24 mb-2" />
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const cards = [
    {
      label: "Total Order Value",
      value: formatCurrency(data?.totalOrderValue ?? 0),
      bgColor: "bg-[#E5ECFF]",
      textColor: "text-[#1D51A4]",
    },
    {
      label: "Total Plant Costs",
      value: formatCurrency(data?.totalPlantCosts ?? 0),
      bgColor: "bg-[#FEE2E2]",
      textColor: "text-[#EF4444]",
    },
    {
      label: "Projected Profit",
      value: formatCurrency(data?.projectedProfit ?? 0),
      bgColor: "bg-[#F0FDF4]",
      textColor: "text-[#16A34A]",
    },
  ];

  return (
    <Card className="xl:p-6 p-3 rounded-md shadow-none bg-white">
      <p className="md:text-xl text-sm font-medium text-black mb-3">
        Order Value vs Plant Costs Analysis
      </p>
      <div className="flex gap-4 flex-wrap">
        {cards.map((card) => (
          <AnalysisCard key={card.label} {...card} />
        ))}
      </div>
    </Card>
  );
}
