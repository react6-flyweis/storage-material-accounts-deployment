import { Card } from "@/components/ui/card";
import { AnalysisCardsByFilter } from "@/data/mockData";
import { cn } from "@/lib/utils";
import type { TabType } from "@/pages/Dashboard";

interface AnalysisCardProps {
  label: string;
  value: string;
  bgColor: string;
  textColor: string;
}

export interface AnalysisCardItem {
  label: string;
  value: string;
  bgColor: string;
  textColor: string;
}

export type AnalysisCardsByFilterType = Record<
  TabType,
  readonly AnalysisCardItem[]
>;
function AnalysisCard({ label, value, bgColor, textColor }: AnalysisCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center md:p-4 p-2 rounded-xl flex-1 w-[120px] max-w-[260px]",
        bgColor
      )}
    >
      <span className="md:text-xs text-[8px] font-normal text-[#4B5563] mb-1">
        {label}
      </span>
      <span className={cn("md:text-xl text-[9px] font-medium", textColor)}>
        {value}
      </span>
    </div>
  );
}

export function AnalysisSection({activeTab}: {activeTab: TabType}) {
const cards = AnalysisCardsByFilter[activeTab];
  return (
    <Card className="xl:p-6 p-3 rounded-md shadow-none">
      <p className="md:text-xl text-sm font-medium text-black mb-1">
        Order Value vs Plant Costs Analysis
      </p>
      <div className="flex gap-4 flex-wrap">
        {cards.map((card: AnalysisCardItem) => (
          <AnalysisCard key={card.label} {...card} />
        ))}
      </div>
    </Card>
  );
}
