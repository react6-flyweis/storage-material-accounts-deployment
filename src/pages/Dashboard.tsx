import { AnalysisSection } from "../components/AnalysisSection";
import { WorkInProgress } from "../components/WorkInProgress";
import { RevenueTrend } from "../components/RevenueTrend";
import { ChevronDown, ChevronUp, Download, RefreshCcw } from "lucide-react";
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
import DateRangeFilter from "@/components/ui/date-range-filter";
import FilterTabs, {
  type Period,
  type DateRange,
  getPeriodRange,
} from "@/components/FilterTabs";
import { useState, useMemo } from "react";
import {
  useGetDashboardOverviewQuery,
  useExportDashboardMutation,
} from "@/redux/api/dashboardApi";
import { formatDateToIso, formatCurrency } from "@/lib/dashboardFormatters";
import { cn } from "@/lib/utils";

export type TabType = "today" | "week" | "month";

const FinancePage = () => {
  const [selectedRange, setSelectedRange] = useState<DateRange>(() =>
    getPeriodRange("week")
  );
  const [activePeriod, setActivePeriod] = useState<Period>("week");
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(true);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  const [exportDashboard, { isLoading: isExporting }] =
    useExportDashboardMutation();

  // Compute inclusive startDate & endDate for API query
  const dateRange = useMemo(() => {
    return {
      startDate: selectedRange.startDate
        ? formatDateToIso(selectedRange.startDate)
        : undefined,
      endDate: selectedRange.endDate
        ? formatDateToIso(selectedRange.endDate)
        : undefined,
    };
  }, [selectedRange]);

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

  // Handler for Exporting Financial Overview report
  const handleExport = async () => {
    setExportError(null);
    setExportSuccess(false);
    try {
      const blob = await exportDashboard({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      }).unwrap();

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      const fileExt =
        blob.type.includes("csv") || blob.type.includes("text")
          ? "csv"
          : blob.type.includes("json")
          ? "json"
          : "xlsx";
      link.download = `financial-overview-export-${dateRange.startDate || "all"}-to-${
        dateRange.endDate || "all"
      }.${fileExt}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err: unknown) {
      console.error("Dashboard export failed:", err);
      const errMsg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to export report. Please try again.";
      setExportError(errMsg);
      setTimeout(() => setExportError(null), 5000);
    }
  };

  // Top 4 financial overview cards with live data
  const statsCards = useMemo(() => {
    const fo = overview?.financialOverview;
    return [
      {
        title: "Total Revenue",
        value: formatCurrency(fo?.totalRevenue ?? 0),
        icon: (
          <img
            src={StorageIcon}
            alt="total-revenue"
            className="md:size-7 size-5 p-1"
          />
        ),
        color: "bg-[#1D51A4]",
        navigateTo: "/income",
      },
      {
        title: "Total Expenses",
        value: formatCurrency(fo?.totalExpenses ?? 0),
        icon: (
          <img
            src={MoneyIcon}
            alt="total-expenses"
            className="md:size-7 size-5 p-1"
          />
        ),
        color: "bg-[#3AB449]",
        navigateTo: "/expenses",
      },
      {
        title: "Net Profit",
        value: formatCurrency(fo?.netProfit ?? 0),
        icon: (
          <img
            src={ChartLineIcon}
            alt="net-profit"
            className="md:size-7 size-5 p-1"
          />
        ),
        color: "bg-[#F59E0B]",
        navigateTo: "/wip_profit",
      },
      {
        title: "Outstanding Payments",
        value: formatCurrency(fo?.outstandingPayments ?? fo?.outstanding ?? 0),
        icon: (
          <img
            src={Clock}
            alt="outstanding-payments"
            className="md:size-7 size-5 p-1"
          />
        ),
        color: "bg-[#FD8D5B]",
        navigateTo: "/payment_overview",
      },
    ];
  }, [overview]);

  return (
    <div className="space-y-6">
      <div className="-mt-4 -mx-4">
        <FilterTabs
          initialPeriod="week"
          selectedPeriod={activePeriod}
          onPeriodChange={(period: Period, range: DateRange) => {
            setActivePeriod(period);
            setSelectedRange(range);
          }}
        />
      </div>

      {/* Header Row: Title & Subtitle on Left, Date Range Filter & Export Button on Right */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <TitleSubtitle
          title="Financial Overview"
          subtitle="Monitor your business financial performance and key metrics"
        />

        <div className="flex flex-wrap items-center gap-3">
          <DateRangeFilter
            value={{
              from: selectedRange.startDate || undefined,
              to: selectedRange.endDate || undefined,
            }}
            onChange={(range) => {
              setActivePeriod(undefined);
              if (range?.from) {
                setSelectedRange({
                  startDate: range.from,
                  endDate: range.to || range.from,
                });
              } else {
                setSelectedRange({
                  startDate: null,
                  endDate: null,
                });
              }
            }}
            className="w-full sm:w-60 md:w-65 bg-white shadow-2xs"
            placeholder="Select Date Range"
          />

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
            className="h-9 px-3.5 bg-white border-gray-200 hover:bg-gray-50 text-gray-700 font-medium text-xs sm:text-sm gap-2 cursor-pointer shadow-2xs shrink-0"
            title="Export Dashboard Data"
          >
            {isExporting ? (
              <RefreshCcw className="w-4 h-4 animate-spin text-gray-500" />
            ) : (
              <Download className="w-4 h-4 text-gray-600" />
            )}
            <span>{isExporting ? "Exporting..." : "Export"}</span>
          </Button>
        </div>
      </div>

      {exportError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-md flex justify-between items-center">
          <span>{exportError}</span>
          <button
            type="button"
            onClick={() => setExportError(null)}
            className="text-red-500 hover:text-red-700 ml-2 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {exportSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs sm:text-sm rounded-md flex justify-between items-center">
          <span>Dashboard report exported successfully!</span>
          <button
            type="button"
            onClick={() => setExportSuccess(false)}
            className="text-green-500 hover:text-green-700 ml-2 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        {isLoading
          ? Array.from({ length: 4 }).map((_, idx) => (
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
          : statsCards.map((stat, index) => (
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
              className={cn(
                "h-4 w-4 text-gray-500",
                isFetching && "animate-spin",
              )}
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
        <AlertNotification alerts={overview?.alerts} isLoading={isLoading} />
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
