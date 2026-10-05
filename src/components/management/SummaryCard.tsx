import { Card } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

type SummaryItem = {
  label: string;
  value: string;
};

type SummaryCardProps = {
  title: string;
  totalLabel: string;
  totalValue: string;
  items: SummaryItem[];
  icon: LucideIcon;
  iconBgClass?: string;
  iconColorClass?: string;
};

export default function SummaryCard({
  title,
  totalLabel,
  totalValue,
  items,
  icon: Icon,
  iconBgClass = "bg-emerald-50",
  iconColorClass = "text-emerald-600",
}: SummaryCardProps) {
  return (
    <Card className="p-6 bg-white rounded-md border-none shadow-sm">
      <div className="flex justify-between items-start">
        <h3 className="xl:text-lg font-normal text-gray-900">{title}</h3>
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center ${iconBgClass}`}
        >
          <Icon className={`w-3.5 h-3.5 ${iconColorClass}`} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-normal text-gray-600">
            {totalLabel}
          </span>
          <span className="md:text-xl font-normal text-gray-900">
            {totalValue}
          </span>
        </div>

        {items.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center text-sm"
          >
            <span className="text-gray-500">{item.label}</span>
            <span className="font-normal text-gray-900">{item.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
