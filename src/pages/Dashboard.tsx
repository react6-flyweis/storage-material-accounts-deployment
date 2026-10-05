import { AnalysisSection } from "../components/AnalysisSection";
import { WorkInProgress } from "../components/WorkInProgress";
import { RevenueTrend } from "../components/RevenueTrend";
import { ChevronDown, ChevronUp, RefreshCcw } from "lucide-react";
import TitleSubtitle from "../components/common_components/TitleSubtitle";
import { FinanceStatsGrid } from "../components/FinanceStatsGrid";
import { DeliveryFinanceGrid } from "../components/DeliveryFinanceGrid";
import { TopPartnersSection } from "../components/TopPartnersSection";
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
import { FreightSpendTrend } from "../components/FreightSpendTrend";
import StatCard from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import FilterTabs from "@/components/common_components/FilterTabs";
import { useState, useMemo } from "react";
import { useGetDashboardOverviewQuery } from "@/redux/api/dashboardApi";
import { getDateRangeForTab, formatCurrency } from "@/lib/dashboardFormatters";
import { cn } from "@/lib/utils";

export type TabType = "today" | "week" | "month";

const FinancePage = () => {
  const [activeTab, setActiveTab] = useState<TabType>("today");
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(true);

  // Compute inclusive startDate & endDate for API query
  const dateRange = useMemo(() => getDateRangeForTab(activeTab), [activeTab]);

  // Single-load overview pattern (Option A from Figma alignment spec)
  const {
    data: overview,
    isLoading,
    isFetching,
    refetch,
  } = useGetDashboardOverviewQuery({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    transactionsLimit: 5,
    carriersLimit: 5,
    vendorsLimit: 5,
    budgetRowsLimit: 6,
    daysAhead: 30,
  });

  // Top 4 financial overview cards with live data
  const statsCards = useMemo(() => {
    const fo = overview?.financialOverview;
    return [
      {
        title: "Total Revenue",
        value: formatCurrency(fo?.totalRevenue ?? 0),
        icon: <img src={StorageIcon} alt="total-revenue" className="md:size-7 size-5 p-1" />,
        color: "bg-[#1D51A4]",
        navigateTo: "/income",
      },
      {
        title: "Total Expenses",
        value: formatCurrency(fo?.totalExpenses ?? 0),
        icon: <img src={MoneyIcon} alt="total-expenses" className="md:size-7 size-5 p-1" />,
        color: "bg-[#3AB449]",
        navigateTo: "/expenses",
      },
      {
        title: "Net Profit",
        value: formatCurrency(fo?.netProfit ?? 0),
        icon: <img src={ChartLineIcon} alt="net-profit" className="md:size-7 size-5 p-1" />,
        color: "bg-[#F59E0B]",
        navigateTo: "/wip_profit",
      },
      {
        title: "Outstanding Payments",
        value: formatCurrency(fo?.outstandingPayments ?? fo?.outstanding ?? 0),
        icon: <img src={Clock} alt="outstanding-payments" className="md:size-7 size-5 p-1" />,
        color: "bg-[#FD8D5B]",
        navigateTo: "/payment_overview",
      },
    ];
  }, [overview]);

  return (
    <div className="xl:px-0 px-2 pb-10 space-y-6">
      <FilterTabs activeTab={activeTab} onChange={setActiveTab} />
      <TitleSubtitle
        title="Financial Overview"
        subtitle="Monitor your business financial performance and key metrics"
      />

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <Card
              key={idx}
              className="sm:p-5 px-3 py-4 rounded-md bg-white border border-gray-100 shadow-none"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-7 w-28" />
                </div>
                <Skeleton className="w-10 h-10 rounded-md shrink-0" />
              </div>
            </Card>
          ))
        ) : (
          statsCards.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              navigateTo={stat.navigateTo}
            />
          ))
        )}
      </div>

      {/* Invoice Report Section */}
      <div className="flex justify-between items-center mb-4 pt-2">
        <h1 className="md:text-xl font-medium text-gray-800 tracking-tight">
          Invoice Report
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-white border-gray-200 cursor-pointer"
            onClick={() => refetch()}
            title="Refresh Dashboard"
          >
            <RefreshCcw
              className={cn("h-4 w-4 text-gray-500", isFetching && "animate-spin")}
            />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-white border-gray-200 cursor-pointer"
            onClick={() => setIsInvoiceOpen(!isInvoiceOpen)}
          >
            {isInvoiceOpen ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </Button>
        </div>
      </div>

      {isInvoiceOpen && (
        <FinanceStatsGrid
          data={overview?.invoiceReport}
          isLoading={isLoading}
        />
      )}

      {/* Delivery Finance Row */}
      <div className="pt-2">
        <DeliveryFinanceGrid
          data={overview?.deliveryFinance}
          isLoading={isLoading}
        />
      </div>

      {/* Order Value vs Plant Costs Analysis */}
      <div className="pt-2">
        <AnalysisSection
          data={overview?.orderVsPlantCosts}
          isLoading={isLoading}
        />
      </div>

      {/* Middle Grid: Work In Progress & Revenue Trend */}
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-5 xl:gap-6 gap-4">
        <div className="lg:col-span-3 md:col-span-1 col-span-1">
          <WorkInProgress
            projects={overview?.projectBudgetVsActual}
            isLoading={isLoading}
          />
        </div>

        <div className="lg:col-span-2 md:col-span-1 col-span-1">
          <RevenueTrend />
        </div>
      </div>

      {/* Profit Trend & Cost Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6 mt-6 items-stretch">
        <div className="lg:col-span-1 h-full">
          <WIPProfitTrend />
        </div>
        <div className="lg:col-span-1 flex flex-col gap-6">
          <CostBreakdown
            orderVsPlantCosts={overview?.orderVsPlantCosts}
            deliveryFinance={overview?.deliveryFinance}
            isLoading={isLoading}
          />
          <FreightSpendTrend isLoading={isLoading} />
        </div>
      </div>

      {/* Bottom Grid: Recent Transactions & Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <RecentTransactions
          transactions={overview?.recentTransactions}
          isLoading={isLoading}
        />
        <AlertNotification
          alerts={overview?.alerts}
          isLoading={isLoading}
        />
      </div>

      {/* Top Partners: Carriers & Vendors */}
      <TopPartnersSection
        carriers={overview?.topCarriers}
        vendors={overview?.topVendors}
        isLoading={isLoading}
      />

      {/* Upcoming Payments */}
      <UpcomingPayments
        upcomingPayments={overview?.upcomingPayments}
        isLoading={isLoading}
      />

      {/* Project Details Table */}
      <ProjectDetailsTable
        projects={overview?.projectBudgetVsActual}
        isLoading={isLoading}
      />
    </div>
  );
};

export default FinancePage;
