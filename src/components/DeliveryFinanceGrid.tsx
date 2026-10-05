import { Banknote } from "lucide-react";
import LeftChartIcon from "../assets/icon/LeftChartIcon.svg";
import MoneyBag from "../assets/moneybag.svg";
import type { DeliveryFinance } from "@/redux/api/dashboardApi";
import { formatCurrency } from "@/lib/dashboardFormatters";
import { Skeleton } from "@/components/ui/skeleton";

interface DeliveryFinanceGridProps {
  data?: DeliveryFinance;
  isLoading?: boolean;
}

export function DeliveryFinanceGrid({ data, isLoading }: DeliveryFinanceGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className="p-4 sm:p-5 bg-white border-2 border-blue-200 rounded-xl flex items-center gap-3.5 sm:gap-4 min-w-0"
          >
            <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const items = [
    {
      label: "Freight Spend",
      value: formatCurrency(data?.freightSpend ?? 0),
      icon: <img src={LeftChartIcon} alt="Freight Spend" className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      label: "Pending Carrier Payments",
      value: formatCurrency(data?.pendingCarrierPayments ?? 0),
      icon: <Banknote className="w-6 h-6 text-white" strokeWidth={2} />,
    },
    {
      label: "Freight Savings",
      value: `${formatCurrency(data?.freightSavings ?? 0)} saved`,
      icon: <img src={MoneyBag} alt="Freight Savings" className="w-6 h-6" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {items.map((item, index) => (
        <div
          key={index}
          className="p-4 sm:p-5 bg-white border-2 border-blue-500 rounded-xl flex items-center gap-3.5 sm:gap-4 min-w-0 transition-all hover:shadow-sm"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
            {item.icon}
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <span className="text-xs sm:text-sm font-medium text-gray-500 truncate">
              {item.label}
            </span>
            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 tracking-tight truncate">
              {item.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
