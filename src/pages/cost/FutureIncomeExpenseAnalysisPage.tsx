import React, { useState, useMemo } from "react";
import {
  Home,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Calendar,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import {
  ResponsiveContainer,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ComposedChart,
  Line,
} from "recharts";
import CalendarRangePickerModal from "@/components/common_components/CalendarRangePickerModal";
import SuccessModal from "@/components/common_components/SuccessModal";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetFutureSummaryQuery,
  useGetFutureRecordsQuery,
  type ProjectForecastItem,
} from "@/redux/api/costsApi";

function formatAmountDisplay(val: unknown, fallback: string = "$0.00"): string {
  if (val == null) return fallback;
  if (typeof val === "string") {
    if (val.trim() === "") return fallback;
    return val;
  }
  if (typeof val === "number") {
    if (val >= 10000000) {
      return `$${(val / 10000000).toFixed(2)} Cr`;
    }
    if (val >= 100000) {
      return `$${(val / 100000).toFixed(2)} L`;
    }
    return `$${val.toLocaleString()}`;
  }
  return fallback;
}

export const FutureIncomeExpenseAnalysisPage: React.FC = () => {
  // Export Menu State
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  // Timeframe selector for chart
  const [timeframe, setTimeframe] = useState("Next 1 Year");
  const [isTimeframeOpen, setIsTimeframeOpen] = useState(false);

  // Filter states for Project-wise table
  const [dateRangeText, setDateRangeText] = useState("dd/mm/yyyy - dd/mm/yyyy");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const [amountRange, setAmountRange] = useState("$0.00 - $00");
  const [isAmountRangeOpen, setIsAmountRangeOpen] = useState(false);

  const [sortBy, setSortBy] = useState("Last 7 Days");
  const [isSortByOpen, setIsSortByOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [marginSortDirection, setMarginSortDirection] = useState<"asc" | "desc">("desc");

  // Success dialog state
  const [successDialogConfig, setSuccessDialogConfig] = useState<{
    isOpen: boolean;
    title: string;
    message?: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  // RTK Query hooks
  const { data: summaryData, isLoading: isSummaryLoading } = useGetFutureSummaryQuery();
  const { data: recordsData, isLoading: isRecordsLoading } = useGetFutureRecordsQuery();

  // Top 5 KPI Cards
  const kpis = useMemo(() => [
    {
      title: "Expected Income",
      amount: formatAmountDisplay(summaryData?.expectedIncome, "$0.00"),
    },
    {
      title: "Expected Expense",
      amount: formatAmountDisplay(summaryData?.expectedExpense, "$0.00"),
    },
    {
      title: "Expected Net Profit",
      amount: formatAmountDisplay(summaryData?.expectedNetProfit, "$0.00"),
    },
    {
      title: "Upcoming Payments",
      amount: formatAmountDisplay(summaryData?.upcomingPayments, "$0.00"),
    },
    {
      title: "Expected Receivables",
      amount: formatAmountDisplay(summaryData?.expectedReceivables, "$0.00"),
    },
  ], [summaryData]);

  // Monthly Overview Chart Data
  const chartData = useMemo(() => {
    if (recordsData?.monthlyOverview && recordsData.monthlyOverview.length > 0) {
      return recordsData.monthlyOverview;
    }
    return [];
  }, [recordsData]);

  // Badges above chart
  const badgeIncome = useMemo(() => {
    if (summaryData?.expectedIncome) return formatAmountDisplay(summaryData.expectedIncome);
    const sum = chartData.reduce((acc, c) => acc + (c.income || 0), 0);
    return sum > 0 ? `${sum} Lacks` : "$0.00";
  }, [summaryData, chartData]);

  const badgeExpense = useMemo(() => {
    if (summaryData?.expectedExpense) return formatAmountDisplay(summaryData.expectedExpense);
    const sum = chartData.reduce((acc, c) => acc + (c.expense || 0), 0);
    return sum > 0 ? `${sum} Lacks` : "$0.00";
  }, [summaryData, chartData]);

  const badgeProfit = useMemo(() => {
    if (summaryData?.expectedNetProfit) return formatAmountDisplay(summaryData.expectedNetProfit);
    const sum = chartData.reduce((acc, c) => acc + (c.profit || 0), 0);
    return sum > 0 ? `${sum} Lacks` : "$0.00";
  }, [summaryData, chartData]);

  // Income Breakdown items
  const incomeItems = useMemo(() => {
    if (recordsData?.incomeBreakdown && recordsData.incomeBreakdown.length > 0) {
      return recordsData.incomeBreakdown;
    }
    if (recordsData?.rows) {
      return recordsData.rows.filter((r) => r.flowType === "income");
    }
    return [];
  }, [recordsData]);

  // Expense Breakdown items
  const expenseItems = useMemo(() => {
    if (recordsData?.expenseBreakdown && recordsData.expenseBreakdown.length > 0) {
      return recordsData.expenseBreakdown;
    }
    if (recordsData?.rows) {
      return recordsData.rows.filter((r) => r.flowType === "expense");
    }
    return [];
  }, [recordsData]);

  // Project-Wise Forecast items
  const projectForecastItems: ProjectForecastItem[] = useMemo(() => {
    if (recordsData?.projectForecast && recordsData.projectForecast.length > 0) {
      return recordsData.projectForecast;
    }
    return [];
  }, [recordsData]);

  // Filter & sort logic for Project-wise forecast table
  const filteredProjects = useMemo(() => {
    let result = [...projectForecastItems];

    if (amountRange === "$0 - $50L") {
      result = result.filter((p) => {
        const val = Number(p.expectedIncomeValue ?? p.expectedIncome) || 0;
        return val <= 5000000;
      });
    } else if (amountRange === "$50L - $80L") {
      result = result.filter((p) => {
        const val = Number(p.expectedIncomeValue ?? p.expectedIncome) || 0;
        return val > 5000000 && val <= 8000000;
      });
    } else if (amountRange === "$80L+") {
      result = result.filter((p) => {
        const val = Number(p.expectedIncomeValue ?? p.expectedIncome) || 0;
        return val > 8000000;
      });
    }

    if (sortBy === "Margin: High to Low") {
      result.sort((a, b) => (Number(b.marginPercent) || 0) - (Number(a.marginPercent) || 0));
    } else if (sortBy === "Margin: Low to High") {
      result.sort((a, b) => (Number(a.marginPercent) || 0) - (Number(b.marginPercent) || 0));
    } else if (sortBy === "Expected Income") {
      result.sort((a, b) => (Number(b.expectedIncomeValue ?? b.expectedIncome) || 0) - (Number(a.expectedIncomeValue ?? a.expectedIncome) || 0));
    } else if (sortBy === "Expected Profit") {
      result.sort((a, b) => (Number(b.expectedProfitValue ?? b.expectedProfit) || 0) - (Number(a.expectedProfitValue ?? a.expectedProfit) || 0));
    }

    if (marginSortDirection === "asc") {
      result.sort((a, b) => (Number(a.marginPercent) || 0) - (Number(b.marginPercent) || 0));
    } else if (marginSortDirection === "desc") {
      result.sort((a, b) => (Number(b.marginPercent) || 0) - (Number(a.marginPercent) || 0));
    }

    return result;
  }, [projectForecastItems, amountRange, sortBy, marginSortDirection]);

  const itemsPerPage = 10;
  const totalEntries = filteredProjects.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / itemsPerPage));

  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProjects.slice(start, start + itemsPerPage);
  }, [filteredProjects, currentPage, itemsPerPage]);

  const handleExport = (type: string) => {
    setIsExportMenuOpen(false);
    if (type === "csv") {
      const headers = "Project,Expected Income,Expected Expense,Expected Profit,Margin,Status\n";
      const rows = filteredProjects.map(
        (p) =>
          `"${p.project}","${formatAmountDisplay(p.expectedIncome)}","${formatAmountDisplay(p.expectedExpense)}","${formatAmountDisplay(p.expectedProfit)}","${p.margin ?? "-"}","${p.status ?? "-"}"`
      ).join("\n");
      const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Future_Income_Expense_Analysis_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      setSuccessDialogConfig({
        isOpen: true,
        title: `Export to ${type.toUpperCase()} Started`,
        message: "Your export document is being processed and will download shortly.",
      });
    }
  };

  const getConfidenceBadge = (confidence?: string) => {
    switch (confidence) {
      case "High":
        return <span className="font-semibold text-[#1877F2]">High</span>;
      case "Medium":
        return <span className="font-semibold text-[#2563EB]">Medium</span>;
      case "Low":
        return <span className="font-semibold text-[#3B82F6]">Low</span>;
      default:
        return <span className="text-slate-600 font-medium">{confidence || "-"}</span>;
    }
  };

  return (
    <div className="space-y-5 pb-10">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Future Income / Expense Analysis
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-normal mt-1">
            <Home className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              Forecast upcoming income, expenses, cash requirements, and profitability across projects and operations.
            </span>
          </div>
        </div>

        {/* Export Button */}
        <div className="relative self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isExportMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-30">
              <button
                type="button"
                onClick={() => handleExport("csv")}
                className="w-full px-3.5 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export as CSV</span>
              </button>
              <button
                type="button"
                onClick={() => handleExport("excel")}
                className="w-full px-3.5 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                <span>Export as Excel</span>
              </button>
              <button
                type="button"
                onClick={() => handleExport("pdf")}
                className="w-full px-3.5 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
              >
                <FileText className="w-3.5 h-3.5 text-rose-600" />
                <span>Export as PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Top 5 Vibrant Dark Blue Metric / KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="relative overflow-hidden rounded-xl bg-[#13519c] p-4 text-white shadow-xs"
            style={{
              background: "linear-gradient(135deg, #17549c 0%, #104887 100%)",
            }}
          >
            {/* Subtle diagonal background watermark styling */}
            <div
              className="absolute -right-4 -bottom-4 w-24 h-24 pointer-events-none opacity-20"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, #fff 0, #fff 1.5px, transparent 0, transparent 8px)",
              }}
            />

            <div className="relative z-10 flex flex-col justify-between h-full">
              <p className="text-xs text-slate-200 font-medium">
                {kpi.title}
              </p>
              {isSummaryLoading ? (
                <Skeleton className="h-7 w-24 bg-white/20 rounded mt-2" />
              ) : (
                <div className="mt-2 text-2xl font-bold tracking-tight text-white">
                  {kpi.amount}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Miscellaneous Cost Overview Chart Card */}
      <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md text-orange-400 bg-orange-50">
              <ShoppingCart className="w-4 h-4 text-orange-400" />
            </span>
            <h2 className="text-sm font-bold text-slate-800">
              Miscellaneous Cost Overview
            </h2>
          </div>

          {/* Timeframe dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsTimeframeOpen(!isTimeframeOpen)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{timeframe}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            {isTimeframeOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-md border border-slate-100 py-1 z-20">
                {["Next 3 Months", "Next 6 Months", "Next 1 Year", "Next 2 Years"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setTimeframe(opt);
                      setIsTimeframeOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs ${
                      timeframe === opt
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3 Legend / Metric Badges (Expected Income, Expected Expense, Expected Profit) */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          {/* Expected Income */}
          <div className="px-3 py-1.5 rounded-lg border border-slate-100 bg-white shadow-2xs min-w-27.5">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#1877F2]"></span>
              <span>Expected Income</span>
            </div>
            {isRecordsLoading ? (
              <Skeleton className="h-5 w-16 bg-slate-200 rounded mt-1" />
            ) : (
              <div className="mt-1 text-sm font-bold text-slate-800">
                {badgeIncome}
              </div>
            )}
          </div>

          {/* Expected Expense */}
          <div className="px-3 py-1.5 rounded-lg border border-slate-100 bg-white shadow-2xs min-w-27.5">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
              <span>Expected Expense</span>
            </div>
            {isRecordsLoading ? (
              <Skeleton className="h-5 w-16 bg-slate-200 rounded mt-1" />
            ) : (
              <div className="mt-1 text-sm font-bold text-slate-800">
                {badgeExpense}
              </div>
            )}
          </div>

          {/* Expected Profit */}
          <div className="px-3 py-1.5 rounded-lg border border-slate-100 bg-white shadow-2xs min-w-27.5">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
              <span>Expected Profit</span>
            </div>
            {isRecordsLoading ? (
              <Skeleton className="h-5 w-16 bg-slate-200 rounded mt-1" />
            ) : (
              <div className="mt-1 text-sm font-bold text-slate-800">
                {badgeProfit}
              </div>
            )}
          </div>
        </div>

        {/* Chart */}
        <div className="h-64 w-full">
          {isRecordsLoading ? (
            <div className="h-full w-full flex items-center justify-center bg-slate-50/50 rounded-xl">
              <Skeleton className="h-44 w-full rounded-lg bg-slate-200/80" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
              No monthly forecast trend data available for {timeframe}.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                barGap={4}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={({ x, y, payload }) => {
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text
                          x={0}
                          y={10}
                          dy={6}
                          textAnchor="middle"
                          fill="#64748B"
                          fontSize={11}
                          fontWeight={500}
                        >
                          {payload.value}
                        </text>
                      </g>
                    );
                  }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748B", fontSize: 11 }}
                  tickFormatter={(value) => (value === 0 ? "0" : `${value} L`)}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2.5 rounded-lg shadow-lg border border-slate-100 text-xs space-y-1">
                          <p className="font-bold text-slate-800">{label}</p>
                          <p className="text-[#1877F2]">
                            Expected Income: {payload[0]?.value} Lacks
                          </p>
                          <p className="text-[#10B981]">
                            Expected Expense: {payload[1]?.value} Lacks
                          </p>
                          <p className="text-[#F97316]">
                            Expected Profit: {payload[2]?.value} Lacks
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* Income Bar (Blue) */}
                <Bar
                  dataKey="income"
                  fill="#1877F2"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={22}
                />
                {/* Expense Bar (Green) */}
                <Bar
                  dataKey="expense"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={22}
                />
                {/* Profit Line (Orange with dot circles) */}
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#F97316"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: "#F97316", strokeWidth: 1.5, stroke: "#FFFFFF" }}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 4. Side-by-Side Breakdown Tables: Income Breakdown & Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: FUTURE INCOME BREAKDOWN */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center gap-2 p-4 pb-3">
              <span className="p-1 rounded-md text-orange-400 bg-orange-50">
                <ShoppingCart className="w-4 h-4 text-orange-400" />
              </span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Future Income Breakdown
              </h2>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#E7F6ED] text-slate-700 font-semibold border-b border-emerald-100">
                    <th className="py-2.5 px-4 font-semibold">Income Source</th>
                    <th className="py-2.5 px-4 font-semibold">Expected Amount</th>
                    <th className="py-2.5 px-4 font-semibold">Confidence</th>
                    <th className="py-2.5 px-4 font-semibold">Expected Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isRecordsLoading ? (
                    [...Array(4)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="py-3 px-4"><Skeleton className="h-4 w-28 bg-slate-200" /></td>
                        <td className="py-3 px-4"><Skeleton className="h-4 w-16 bg-slate-200" /></td>
                        <td className="py-3 px-4"><Skeleton className="h-4 w-12 bg-slate-200" /></td>
                        <td className="py-3 px-4"><Skeleton className="h-4 w-20 bg-slate-200" /></td>
                      </tr>
                    ))
                  ) : incomeItems.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        No future income records found.
                      </td>
                    </tr>
                  ) : (
                    incomeItems.map((row) => (
                      <tr key={row._id || row.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 text-slate-800 font-medium">
                          {row.incomeSource || row.sourceName || "-"}
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#10B981]">
                          {formatAmountDisplay(row.expectedAmount)}
                        </td>
                        <td className="py-3 px-4">
                          {getConfidenceBadge(row.confidence)}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {row.expectedDate || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: FUTURE EXPENSE BREAKDOWN */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center gap-2 p-4 pb-3">
              <span className="p-1 rounded-md text-orange-400 bg-orange-50">
                <ShoppingCart className="w-4 h-4 text-orange-400" />
              </span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Future Expense Breakdown
              </h2>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FDECE7] text-slate-700 font-semibold border-b border-rose-100">
                    <th className="py-2.5 px-4 font-semibold">Expense Category</th>
                    <th className="py-2.5 px-4 font-semibold">Expected Cost</th>
                    <th className="py-2.5 px-4 font-semibold">Confidence</th>
                    <th className="py-2.5 px-4 font-semibold">Expected Period</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isRecordsLoading ? (
                    [...Array(4)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="py-3 px-4"><Skeleton className="h-4 w-28 bg-slate-200" /></td>
                        <td className="py-3 px-4"><Skeleton className="h-4 w-16 bg-slate-200" /></td>
                        <td className="py-3 px-4"><Skeleton className="h-4 w-12 bg-slate-200" /></td>
                        <td className="py-3 px-4"><Skeleton className="h-4 w-20 bg-slate-200" /></td>
                      </tr>
                    ))
                  ) : expenseItems.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        No future expense records found.
                      </td>
                    </tr>
                  ) : (
                    expenseItems.map((row) => (
                      <tr key={row._id || row.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 text-slate-800 font-medium">
                          {row.expenseCategory || row.sourceName || "-"}
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#EF4444]">
                          {formatAmountDisplay(row.expectedAmount)}
                        </td>
                        <td className="py-3 px-4">
                          {getConfidenceBadge(row.confidence)}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {row.expectedDate || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Project-Wise Forecast Table Card */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
        {/* Table Top Controls */}
        <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
            Project-Wise Forecast
          </h2>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Date Range Picker Filter Button */}
            <button
              type="button"
              onClick={() => setIsDatePickerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{dateRangeText}</span>
            </button>

            {/* Amount Range Filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsAmountRangeOpen(!isAmountRangeOpen)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span>{amountRange}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {isAmountRangeOpen && (
                <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-md border border-slate-100 py-1 z-20">
                  {["$0.00 - $00", "$0 - $50L", "$50L - $80L", "$80L+"].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setAmountRange(amt);
                        setIsAmountRangeOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      {amt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort By Filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSortByOpen(!isSortByOpen)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span className="text-slate-400 font-normal">Sort By :</span>
                <span className="font-medium">{sortBy}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {isSortByOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-md border border-slate-100 py-1 z-20">
                  {[
                    "Last 7 Days",
                    "Margin: High to Low",
                    "Margin: Low to High",
                    "Expected Income",
                    "Expected Profit",
                  ].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setSortBy(s);
                        setIsSortByOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Forecast Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#EDF2F7] text-slate-700 font-semibold border-b border-slate-200/80">
                <th className="py-3 px-4 font-semibold">Project</th>
                <th className="py-3 px-4 font-semibold">Expected Income</th>
                <th className="py-3 px-4 font-semibold">Expected Expense</th>
                <th className="py-3 px-4 font-semibold">Expected Profit</th>
                <th
                  className="py-3 px-4 font-semibold cursor-pointer select-none"
                  onClick={() =>
                    setMarginSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
                  }
                >
                  <div className="flex items-center gap-1">
                    <span>Margin</span>
                    <span className="text-[10px]">▼</span>
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isRecordsLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3 px-4"><Skeleton className="h-4 w-32 bg-slate-200" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-16 bg-slate-200" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-16 bg-slate-200" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-16 bg-slate-200" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-12 bg-slate-200" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-5 w-16 rounded-full bg-slate-200" /></td>
                  </tr>
                ))
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No project forecast data available.
                  </td>
                </tr>
              ) : (
                paginatedProjects.map((row, idx) => (
                  <tr key={row._id || row.id || idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {row.project}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {formatAmountDisplay(row.expectedIncome)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {formatAmountDisplay(row.expectedExpense)}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {formatAmountDisplay(row.expectedProfit)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {row.margin ?? "-"}
                    </td>
                    <td className="py-3 px-4">
                      {row.status === "Healthy" ? (
                        <span className="inline-block px-3 py-0.5 rounded-full text-[11px] font-semibold bg-[#E7F6ED] text-[#10B981] border border-emerald-200">
                          Healthy
                        </span>
                      ) : row.status === "Risk" ? (
                        <span className="inline-block px-3.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FDECE7] text-[#EF4444] border border-rose-200">
                          Risk
                        </span>
                      ) : (
                        <span className="text-slate-600">{row.status ?? "-"}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 bg-white">
          <span>
            Showing {filteredProjects.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, totalEntries)} of {totalEntries} entries
          </span>

          <div className="flex items-center gap-1.5 self-center sm:self-auto">
            {/* Prev button */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Page number badge */}
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-[#17549C] text-white rounded">
              {currentPage} / {totalPages}
            </span>

            {/* Next button */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Date Range Picker Modal */}
      <CalendarRangePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onSelectRange={(range) => {
          setDateRangeText(range);
          setIsDatePickerOpen(false);
        }}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={successDialogConfig.isOpen}
        onClose={() =>
          setSuccessDialogConfig((prev) => ({ ...prev, isOpen: false }))
        }
        title={successDialogConfig.title}
        message={successDialogConfig.message}
      />
    </div>
  );
};

export default FutureIncomeExpenseAnalysisPage;
