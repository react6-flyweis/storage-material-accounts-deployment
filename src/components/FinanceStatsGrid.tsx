import { FinanceMetricCard } from "./FinanceMetricCard";
import { Banknote } from "lucide-react";
import LeftChartIcon from "../assets/icon/LeftChartIcon.svg";
import BarChart from "../assets/barLines.svg";
import MoneyBag from "../assets/moneybag.svg";
import AlertCircleFilled from "../assets/icon/alert-circle-filled.svg";
import type { InvoiceReport } from "@/redux/api/dashboardApi";
import { formatCurrency, formatNumber } from "@/lib/dashboardFormatters";
import { Skeleton } from "@/components/ui/skeleton";

interface FinanceStatsGridProps {
  data?: InvoiceReport;
  isLoading?: boolean;
}

export function FinanceStatsGrid({ data, isLoading }: FinanceStatsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={idx}
            className="flex items-center p-3 sm:p-4 bg-white border border-gray-100 rounded-[5px] shadow-sm min-w-0 h-20 sm:h-24"
          >
            <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl mr-3 sm:mr-4 shrink-0" />
            <div className="flex flex-col gap-2 flex-1">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Total invoices generated",
      value: formatNumber(data?.totalInvoicesGenerated ?? data?.total ?? 0),
      icon: <img src={LeftChartIcon} alt="" className="h-5 w-5" />,
      color: "green" as const,
    },
    {
      label: "Total Paid",
      value: formatCurrency(data?.totalPaid ?? 0),
      icon: <Banknote size={24} />,
      color: "blue" as const,
    },
    {
      label: "Total Unpaid",
      value: formatCurrency(data?.totalUnpaid ?? 0),
      icon: <img src={MoneyBag} alt="" className="md:h-6 md:w-6 h-5 w-5" />,
      color: "orange-dark" as const,
    },
    {
      label: "Overdue",
      value: formatCurrency(data?.overdueAmount ?? data?.overdue ?? 0),
      icon: (
        <img
          src={AlertCircleFilled}
          alt=""
          className="md:h-6 md:w-6 h-5 w-5"
        />
      ),
      color: "red" as const,
    },
    {
      label: "Total Sales",
      value: formatCurrency(data?.totalSales ?? 0),
      icon: <img src={BarChart} alt="" className="h-5 w-5" />,
      color: "orange-light" as const,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2">
      {cards.map((stat, index) => (
        <FinanceMetricCard
          key={index}
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
        />
      ))}
    </div>
  );
}
