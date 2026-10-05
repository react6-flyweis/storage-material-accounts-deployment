import {
  Calculator,
  ChartLine,
  Percent,
  Trophy,
  ArrowDown,
} from "lucide-react";
import TitleSubtitle from "@/components/common_components/TitleSubtitle";
import FinanceStatCard from "@/components/FinanceStatCard";
import ProjectProfitabilityCard from "@/components/ProjectProfitabilityCard";
import { ProfitGrowthOverTimeChart } from "@/components/ProfitGrowthOverTimeChart";
import EstimatedVsActualProfitChart from "@/components/EstimatedVsActualProfitChart";
import OverallCostBreakdown from "@/components/OverallCostBreakdown";
import WipVsCompletedCard from "@/components/WipVsCompletedCard";
import ProjectDataTable from "@/components/ProjectDataTable";
import ProjectCostBreakdown from "@/components/ProjectCostBreakdown";
import DolleIcon from "@/assets/icon/blueDollerIcon.svg";
import FilterTabs from "@/components/common_components/FilterTabs";
import { useState } from "react";
import type { TabType } from "../Dashboard";
import { costBreakdownByFilter } from "@/data/mockData";

export const financeStatsByFilter = {
  today: [
    {
      title: "Total Project Value",
      value: "$12,30,000",
      icon: (
        <img src={DolleIcon} className="w-5 h-5 object-contain text-[#1D51A4]" />
      ),
      iconBgColor: "bg-[#EFF6FF]",
      valueColor: "text-black",
    },
    {
      title: "Total Cost to Date",
      value: "$8,45,000",
      icon: <Calculator className="md:w-5 md:h-5 w-4 h-4 text-[#EA580C]" />,
      iconBgColor: "bg-[#FFF7ED]",
      valueColor: "text-emerald-500",
    },
    {
      title: "Current WIP Profit",
      value: "$3,85,000",
      icon: <ChartLine className="md:w-5 md:h-5 w-4 h-4 text-[#16A34A]" />,
      iconBgColor: "bg-[#F0FDF4]",
      valueColor: "text-red-500",
    },
    {
      title: "Profit Margin %",
      value: "23%",
      icon: <Percent className="md:w-5 md:h-5 w-4 h-4 text-[#9333EA]" />,
      iconBgColor: "bg-[#FAF5FF]",
      valueColor: "text-black",
    },
  ],

  week: [
    {
      title: "Total Project Value",
      value: "$58,90,000",
      icon: (
        <img src={DolleIcon} className="w-5 h-5 object-contain text-[#1D51A4]" />
      ),
      iconBgColor: "bg-[#EFF6FF]",
      valueColor: "text-black",
    },
    {
      title: "Total Cost to Date",
      value: "$42,10,000",
      icon: <Calculator className="md:w-5 md:h-5 w-4 h-4 text-[#EA580C]" />,
      iconBgColor: "bg-[#FFF7ED]",
      valueColor: "text-emerald-500",
    },
    {
      title: "Current WIP Profit",
      value: "$16,80,000",
      icon: <ChartLine className="md:w-5 md:h-5 w-4 h-4 text-[#16A34A]" />,
      iconBgColor: "bg-[#F0FDF4]",
      valueColor: "text-red-500",
    },
    {
      title: "Profit Margin %",
      value: "28%",
      icon: <Percent className="md:w-5 md:h-5 w-4 h-4 text-[#9333EA]" />,
      iconBgColor: "bg-[#FAF5FF]",
      valueColor: "text-black",
    },
  ],

  month: [
    {
      title: "Total Project Value",
      value: "$2,42,80,000",
      icon: (
        <img src={DolleIcon} className="w-5 h-5 object-contain text-[#1D51A4]" />
      ),
      iconBgColor: "bg-[#EFF6FF]",
      valueColor: "text-black",
    },
    {
      title: "Total Cost to Date",
      value: "$1,98,40,000",
      icon: <Calculator className="md:w-5 md:h-5 w-4 h-4 text-[#EA580C]" />,
      iconBgColor: "bg-[#FFF7ED]",
      valueColor: "text-emerald-500",
    },
    {
      title: "Current WIP Profit",
      value: "$44,40,000",
      icon: <ChartLine className="md:w-5 md:h-5 w-4 h-4 text-[#16A34A]" />,
      iconBgColor: "bg-[#F0FDF4]",
      valueColor: "text-red-500",
    },
    {
      title: "Profit Margin %",
      value: "31%",
      icon: <Percent className="md:w-5 md:h-5 w-4 h-4 text-[#9333EA]" />,
      iconBgColor: "bg-[#FAF5FF]",
      valueColor: "text-black",
    },
  ],
} as const;

const WipProfitPage = () => {
    const [activeTab, setActiveTab] = useState<TabType>("today");
    const stats = financeStatsByFilter[activeTab];
  return (
      <div className="xl:px-0 px-2 pb-10 space-y-6">
        <FilterTabs activeTab={activeTab} onChange={setActiveTab} />
      <div className="flex justify-between items-center flex-wrap gap-2 pr-0 sm:pr-10">
        <TitleSubtitle
          title="WIP Profit Dashboard"
          subtitle="Monitor project profitability and cost breakdown in real-time"
        />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 xl:gap-6 mb-5">
        {stats.map((stat, index) => (
          <FinanceStatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            iconBgColor={stat.iconBgColor}
            valueColor={stat.valueColor}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:gap-6 gap-3">
        <ProfitGrowthOverTimeChart activeTab={activeTab} />
        <EstimatedVsActualProfitChart activeTab={activeTab} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 xl:gap-6 gap-3">
        <ProjectProfitabilityCard
          title="Most Profitable Projects"
          icon={<Trophy className="w-5 h-5 text-green-600" />}
          iconBgColor="bg-green-50"
          items={[
            {
              id: 1,
              name: "Downtown Office Complex",
              value: "$245,000",
              badgeValue: "42.5%",
              badgeColor: "green",
            },
            {
              id: 2,
              name: "Residential Tower Phase 2",
              value: "$198,000",
              badgeValue: "38.2%",
              badgeColor: "green",
            },
            {
              id: 3,
              name: "Shopping Mall Renovation",
              value: "$156,000",
              badgeValue: "35.8%",
              badgeColor: "green",
            },
          ]}
        />
        <ProjectProfitabilityCard
          title="Decreasing Margin"
          icon={<ArrowDown className="w-5 h-5 text-red-600" />}
          iconBgColor="bg-red-50"
          items={[
            {
              id: 1,
              name: "Industrial Warehouse",
              value: "25.2% → 18.5%",
              badgeValue: "-6.7%",
              badgeColor: "red",
            },
            {
              id: 2,
              name: "School Extension",
              value: "28.7% → 22.1%",
              badgeValue: "-6.6%",
              badgeColor: "red",
            },
            {
              id: 3,
              name: "Hospital Wing",
              value: "21.3% → 15.8%",
              badgeValue: "-5.5%",
              badgeColor: "red",
            },
          ]}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OverallCostBreakdown
          title="Overall Cost Breakdown"
          totalCost="$1,678,000"
          items={costBreakdownByFilter[activeTab]}
        />
        <WipVsCompletedCard
        activeTab={activeTab}
        />
      </div>

      <div className="">
        <ProjectDataTable activeTab={activeTab} />
      </div>
      <div className="">
        {/* <div className="grid grid-cols-1 xl:grid-cols-2 xl:gap-6 gap-3 bg-white rounded-md"> */}
          <ProjectCostBreakdown />
        {/* </div> */}
      </div>
    </div>
  );
};

export default WipProfitPage;
