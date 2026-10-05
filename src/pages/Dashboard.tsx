import { AnalysisSection } from "../components/AnalysisSection";
import { WorkInProgress } from "../components/WorkInProgress";
import { RevenueTrend } from "../components/RevenueTrend";
import { ChevronDown, ChevronUp, RefreshCcw } from "lucide-react";
import TitleSubtitle from "../components/common_components/TitleSubtitle";
import { FinanceStatsGrid } from "../components/FinanceStatsGrid";
import StorageIcon from "../assets/storageIcon.svg";
import MoneyIcon from "../assets/money-bill-solid.svg";
import ChartLineIcon from "../assets/chart-growth.svg";
import Clock from "../assets/clock-three.svg";
import { RecentTransactions } from "../components/RecentTransactions";
import { AlertNotification } from "../components/AlertNotification";
import UpcomingPayments from "../components/UpcomingPayments";
import ProjectDetailsTable from "../components/ProjectDetailsTable";
import { WIPProfitTrend } from "../components/WIPProfitTrend";
import { CostBreakdown } from "../components/CostBreakdown";
import StatCard from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import FilterTabs from "@/components/common_components/FilterTabs";
import { useState } from "react";

export const DashboardStatsByFilter = {
  today: [
    {
      title: "Total Revenue",
      value: "12",
      icon: <img src={StorageIcon} alt="total-maintenance" className="md:size-7 size-5 p-1" />,
      color: "bg-[#1D51A4]",
      navigateTo: "/income",
    },
    {
      title: "Total Expenses",
      value: "42",
      icon: <img src={MoneyIcon} alt="breakdown" className="md:size-7 size-5 p-1" />,
      color: "bg-[#3AB449]",
      navigateTo: "/expenses",
    },
    {
      title: "Net Profit",
      value: "74",
      icon: <img src={ChartLineIcon} alt="due-maintenance" className="md:size-7 size-5 p-1" />,
      color: "bg-[#F59E0B]",
      navigateTo: "/wip_profit",
    },
    {
      title: "Outstanding Payments",
      value: "12",
      icon: <img src={Clock} alt="under-maintenance" className="md:size-7 size-5 p-1" />,
      color: "bg-[#FD8D5B]",
      navigateTo: "/payment_overview",
    },
  ],

  week: [
    {
      title: "Total Revenue",
      value: "86",
      icon: <img src={StorageIcon} alt="total-maintenance" className="md:size-7 size-5 p-1" />,
      color: "bg-[#1D51A4]",
      navigateTo: "/income",
    },
    {
      title: "Total Expenses",
      value: "62",
      icon: <img src={MoneyIcon} alt="breakdown" className="md:size-7 size-5 p-1" />,
      color: "bg-[#3AB449]",
      navigateTo: "/expenses",
    },
    {
      title: "Net Profit",
      value: "24",
      icon: <img src={ChartLineIcon} alt="due-maintenance" className="md:size-7 size-5 p-1" />,
      color: "bg-[#F59E0B]",
      navigateTo: "/wip_profit",
    },
    {
      title: "Outstanding Payments",
      value: "11",
      icon: <img src={Clock} alt="under-maintenance" className="md:size-7 size-5 p-1" />,
      color: "bg-[#FD8D5B]",
      navigateTo: "/payment_overview",
    },
  ],

  month: [
    {
      title: "Total Revenue",
      value: "324",
      icon: <img src={StorageIcon} alt="total-maintenance" className="md:size-7 size-5 p-1" />,
      color: "bg-[#1D51A4]",
      navigateTo: "/income",
    },
    {
      title: "Total Expenses",
      value: "248",
      icon: <img src={MoneyIcon} alt="breakdown" className="md:size-7 size-5 p-1" />,
      color: "bg-[#3AB449]",
      navigateTo: "/expenses",
    },
    {
      title: "Net Profit",
      value: "76",
      icon: <img src={ChartLineIcon} alt="due-maintenance" className="md:size-7 size-5 p-1" />,
      color: "bg-[#F59E0B]",
      navigateTo: "/wip_profit",
    },
    {
      title: "Outstanding Payments",
      value: "42",
      icon: <img src={Clock} alt="under-maintenance" className="md:size-7 size-5 p-1" />,
      color: "bg-[#FD8D5B]",
      navigateTo: "/payment_overview",
    },
  ],
} as const;


export type TabType = "today" | "week" | "month";

const FinancePage = () => {
  const [activeTab, setActiveTab] = useState<TabType>("today");
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(true);
  
  return (
 <div className="xl:px-0 px-2 pb-10 space-y-6">
      <FilterTabs activeTab={activeTab} onChange={setActiveTab} />
      <TitleSubtitle
        title="Financial Overview"
        subtitle="Monitor your business financial performance and key metrics"
      />

      <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        {DashboardStatsByFilter[activeTab].map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            navigateTo={stat.navigateTo}
          />
        ))}
      </div>

      <div className="flex justify-between items-center mb-4 pt-2">
        <h1 className="md:text-xl font-medium text-gray-800 tracking-tight">
          Invoice Report
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-white border-gray-200"
          >
            <RefreshCcw className="h-4 w-4 text-gray-500" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-white border-gray-200"
            onClick={() => setIsInvoiceOpen(!isInvoiceOpen)}
          >
            {isInvoiceOpen ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
          </Button>
        </div>
      </div>

    {isInvoiceOpen &&  <FinanceStatsGrid activeTab={activeTab} />}
      <div className="pt-2">
        <AnalysisSection activeTab={activeTab}/>
      </div>
      {/* Middle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-5 xl:gap-6 gap-4">
        <div className="lg:col-span-3 md:col-span-1 col-span-1">
          <WorkInProgress activeTab={activeTab} />
        </div>

        <div className="lg:col-span-2 md:col-span-1 col-span-1">
          <RevenueTrend />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="lg:col-span-1">
          <WIPProfitTrend />
        </div>
        <div className="lg:col-span-1">
          <CostBreakdown />
        </div>
      </div>
      {/* Bottom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <RecentTransactions />
        <AlertNotification />
      </div>

      <UpcomingPayments />
      <ProjectDetailsTable />
    </div>
  );
};

export default FinancePage;
