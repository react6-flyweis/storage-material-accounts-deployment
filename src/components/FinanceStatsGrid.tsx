import { FinanceMetricCard } from "./FinanceMetricCard";
import { Banknote } from "lucide-react";
import LeftChartIcon from "../assets/icon/LeftChartIcon.svg";
import BarChart from "../assets/barLines.svg";
import MoneyBag from "../assets/moneybag.svg";
import AlertCircleFilled from "../assets/icon/alert-circle-filled.svg";
import type { TabType } from "@/pages/Dashboard";

export function FinanceStatsGrid({activeTab}: {activeTab:TabType}) {
const InvoiceStatsByFilter = {
  today: [
    {
      label: "Total invoices generated",
      value: "560",
      icon: <img src={LeftChartIcon} alt="" className="h-5 w-5" />,
      color: "green" as const,
    },
    {
      label: "Total Paid",
      value: "$2,56,42",
      icon: <Banknote size={24} />,
      color: "blue" as const,
    },
    {
      label: "Total Unpaid",
      value: "$1,52,45",
      icon: <img src={MoneyBag} alt="" className="md:h-6 md:w-6 h-5 w-5" />,
      color: "orange-dark" as const,
    },
    {
      label: "Overdue",
      value: "$2,56,12",
      icon: (
        <img src={AlertCircleFilled} alt="" className="md:h-6 md:w-6 h-5 w-5" />
      ),
      color: "red" as const,
    },
    {
      label: "Total Sales",
      value: "$2,56,12",
      icon: <img src={BarChart} alt="" className="h-5 w-5" />,
      color: "orange-light" as const,
    },
  ],

  week: [
    {
      label: "Total invoices generated",
      value: "1,820",
      icon: <img src={LeftChartIcon} alt="" className="h-5 w-5" />,
      color: "green" as const,
    },
    {
      label: "Total Paid",
      value: "$8,92,10",
      icon: <Banknote size={24} />,
      color: "blue" as const,
    },
    {
      label: "Total Unpaid",
      value: "$4,18,30",
      icon: <img src={MoneyBag} alt="" className="md:h-6 md:w-6 h-5 w-5" />,
      color: "orange-dark" as const,
    },
    {
      label: "Overdue",
      value: "$3,12,55",
      icon: (
        <img src={AlertCircleFilled} alt="" className="md:h-6 md:w-6 h-5 w-5" />
      ),
      color: "red" as const,
    },
    {
      label: "Total Sales",
      value: "$12,24,65",
      icon: <img src={BarChart} alt="" className="h-5 w-5" />,
      color: "orange-light" as const,
    },
  ],

  month: [
    {
      label: "Total invoices generated",
      value: "7,450",
      icon: <img src={LeftChartIcon} alt="" className="h-5 w-5" />,
      color: "green" as const,
    },
    {
      label: "Total Paid",
      value: "$38,42,90",
      icon: <Banknote size={24} />,
      color: "blue" as const,
    },
    {
      label: "Total Unpaid",
      value: "$12,65,40",
      icon: <img src={MoneyBag} alt="" className="md:h-6 md:w-6 h-5 w-5" />,
      color: "orange-dark" as const,
    },
    {
      label: "Overdue",
      value: "$6,92,15",
      icon: (
        <img src={AlertCircleFilled} alt="" className="md:h-6 md:w-6 h-5 w-5" />
      ),
      color: "red" as const,
    },
    {
      label: "Total Sales",
      value: "$45,88,20",
      icon: <img src={BarChart} alt="" className="h-5 w-5" />,
      color: "orange-light" as const,
    },
  ],
} as const;


  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2">
      { InvoiceStatsByFilter[activeTab].map((stat, index) => (
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
