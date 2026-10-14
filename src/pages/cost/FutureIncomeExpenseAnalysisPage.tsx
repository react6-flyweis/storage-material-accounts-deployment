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

// Top KPI Cards data
interface FutureAnalysisKpi {
  title: string;
  amount: string;
}

const KPI_DATA: FutureAnalysisKpi[] = [
  { title: "Expected Income", amount: "$4.82 Cr" },
  { title: "Expected Expense", amount: "$3.16 Cr" },
  { title: "Expected Net Profit", amount: "$1.66 Cr" },
  { title: "Upcoming Payments", amount: "$82.40L" },
  { title: "Expected Receivables", amount: "$1.24 Cr" },
];

// Monthly overview data matching chart bars and line
interface MonthlyOverviewItem {
  month: string;
  year: string;
  income: number; // in Lacks
  expense: number; // in Lacks
  profit: number; // in Lacks (line)
}

const MONTHLY_OVERVIEW_DATA: MonthlyOverviewItem[] = [
  { month: "Jan", year: "2026", income: 38, expense: 12, profit: 16 },
  { month: "Feb", year: "2026", income: 98, expense: 20, profit: 21 },
  { month: "Mar", year: "2026", income: 75, expense: 42, profit: 24 },
  { month: "Apr", year: "2026", income: 98, expense: 20, profit: 32 },
  { month: "May", year: "2026", income: 98, expense: 41, profit: 34 },
  { month: "Jun", year: "2026", income: 65, expense: 38, profit: 33 },
  { month: "Jul", year: "2026", income: 38, expense: 12, profit: 27 },
  { month: "Aug", year: "2026", income: 98, expense: 21, profit: 25 },
  { month: "Sep", year: "2026", income: 75, expense: 42, profit: 32 },
  { month: "Oct", year: "2026", income: 98, expense: 21, profit: 40 },
  { month: "Nov", year: "2026", income: 98, expense: 41, profit: 46 },
  { month: "Dec", year: "2026", income: 65, expense: 38, profit: 51 },
];

// Income Breakdown table items
interface IncomeBreakdownItem {
  id: string;
  incomeSource: string;
  expectedAmount: string;
  confidence: "High" | "Medium" | "Low";
  expectedDate: string;
}

const INCOME_BREAKDOWN_DATA: IncomeBreakdownItem[] = [
  {
    id: "inc-1",
    incomeSource: "Confirmed Orders",
    expectedAmount: "$1.82Cr",
    confidence: "High",
    expectedDate: "Jul-Sep",
  },
  {
    id: "inc-2",
    incomeSource: "Approved Quotations",
    expectedAmount: "$1.24Cr",
    confidence: "High",
    expectedDate: "Aug-Oct",
  },
  {
    id: "inc-3",
    incomeSource: "Active Projects",
    expectedAmount: "$98L",
    confidence: "High",
    expectedDate: "Jul-Dec",
  },
  {
    id: "inc-4",
    incomeSource: "Pending Orders",
    expectedAmount: "$54L",
    confidence: "Medium",
    expectedDate: "Sep-Nov",
  },
  {
    id: "inc-5",
    incomeSource: "Expected New Projects",
    expectedAmount: "$28L",
    confidence: "Low",
    expectedDate: "Oct-Dec",
  },
];

// Expense Breakdown table items
interface ExpenseBreakdownItem {
  id: string;
  expenseCategory: string;
  expectedCost: string;
  confidence: "High" | "Medium" | "Low";
  expectedPeriod: string;
}

const EXPENSE_BREAKDOWN_DATA: ExpenseBreakdownItem[] = [
  {
    id: "exp-1",
    expenseCategory: "Material Purchase",
    expectedCost: "$1.12Cr",
    confidence: "High",
    expectedPeriod: "Jul-Sep",
  },
  {
    id: "exp-2",
    expenseCategory: "Salary",
    expectedCost: "$48L",
    confidence: "High",
    expectedPeriod: "Aug-Oct",
  },
  {
    id: "exp-3",
    expenseCategory: "Manpower",
    expectedCost: "$36L",
    confidence: "High",
    expectedPeriod: "Jul-Dec",
  },
  {
    id: "exp-4",
    expenseCategory: "Logistics",
    expectedCost: "$28L",
    confidence: "Medium",
    expectedPeriod: "Sep-Nov",
  },
  {
    id: "exp-5",
    expenseCategory: "Miscellaneous",
    expectedCost: "$9L",
    confidence: "Low",
    expectedPeriod: "Oct-Dec",
  },
];

// Project-Wise Forecast table items
interface ProjectForecastItem {
  id: string;
  project: string;
  expectedIncome: string;
  expectedIncomeValue: number;
  expectedExpense: string;
  expectedExpenseValue: number;
  expectedProfit: string;
  expectedProfitValue: number;
  margin: string;
  marginPercent: number;
  status: "Healthy" | "Risk";
  date: string;
}

const PROJECT_FORECAST_DATA: ProjectForecastItem[] = [
  {
    id: "prj-1",
    project: "SMDT Warehouse",
    expectedIncome: "$84L",
    expectedIncomeValue: 8400000,
    expectedExpense: "$58L",
    expectedExpenseValue: 5800000,
    expectedProfit: "$28L",
    expectedProfitValue: 2800000,
    margin: "31.0%",
    marginPercent: 31.0,
    status: "Healthy",
    date: "2026-08-15",
  },
  {
    id: "prj-2",
    project: "Steel Storage Unit",
    expectedIncome: "$72L",
    expectedIncomeValue: 7200000,
    expectedExpense: "$54L",
    expectedExpenseValue: 5400000,
    expectedProfit: "$18L",
    expectedProfitValue: 1800000,
    margin: "25.0%",
    marginPercent: 25.0,
    status: "Healthy",
    date: "2026-08-18",
  },
  {
    id: "prj-3",
    project: "Industrial Shed",
    expectedIncome: "$62L",
    expectedIncomeValue: 6200000,
    expectedExpense: "$51L",
    expectedExpenseValue: 5100000,
    expectedProfit: "$11L",
    expectedProfitValue: 1100000,
    margin: "17.7%",
    marginPercent: 17.7,
    status: "Healthy",
    date: "2026-08-20",
  },
  {
    id: "prj-4",
    project: "Warehouse Expansion",
    expectedIncome: "$48L",
    expectedIncomeValue: 4800000,
    expectedExpense: "$44L",
    expectedExpenseValue: 4400000,
    expectedProfit: "$4L",
    expectedProfitValue: 400000,
    margin: "8.3%",
    marginPercent: 8.3,
    status: "Risk",
    date: "2026-08-25",
  },
  {
    id: "prj-5",
    project: "Cold Storage Facility",
    expectedIncome: "$95L",
    expectedIncomeValue: 9500000,
    expectedExpense: "$65L",
    expectedExpenseValue: 6500000,
    expectedProfit: "$30L",
    expectedProfitValue: 3000000,
    margin: "31.5%",
    marginPercent: 31.5,
    status: "Healthy",
    date: "2026-08-28",
  },
  {
    id: "prj-6",
    project: "Pre-Engineered Building",
    expectedIncome: "$55L",
    expectedIncomeValue: 5500000,
    expectedExpense: "$42L",
    expectedExpenseValue: 4200000,
    expectedProfit: "$13L",
    expectedProfitValue: 1300000,
    margin: "23.6%",
    marginPercent: 23.6,
    status: "Healthy",
    date: "2026-09-02",
  },
  {
    id: "prj-7",
    project: "Agri Storage Silos",
    expectedIncome: "$38L",
    expectedIncomeValue: 3800000,
    expectedExpense: "$36L",
    expectedExpenseValue: 3600000,
    expectedProfit: "$2L",
    expectedProfitValue: 200000,
    margin: "5.2%",
    marginPercent: 5.2,
    status: "Risk",
    date: "2026-09-05",
  },
  {
    id: "prj-8",
    project: "Commercial Mezzanine",
    expectedIncome: "$76L",
    expectedIncomeValue: 7600000,
    expectedExpense: "$52L",
    expectedExpenseValue: 5200000,
    expectedProfit: "$24L",
    expectedProfitValue: 2400000,
    margin: "31.5%",
    marginPercent: 31.5,
    status: "Healthy",
    date: "2026-09-10",
  },
  {
    id: "prj-9",
    project: "Dock Leveler Facility",
    expectedIncome: "$42L",
    expectedIncomeValue: 4200000,
    expectedExpense: "$31L",
    expectedExpenseValue: 3100000,
    expectedProfit: "$11L",
    expectedProfitValue: 1100000,
    margin: "26.1%",
    marginPercent: 26.1,
    status: "Healthy",
    date: "2026-09-12",
  },
  {
    id: "prj-10",
    project: "Solar Rooftop Shed",
    expectedIncome: "$88L",
    expectedIncomeValue: 8800000,
    expectedExpense: "$62L",
    expectedExpenseValue: 6200000,
    expectedProfit: "$26L",
    expectedProfitValue: 2600000,
    margin: "29.5%",
    marginPercent: 29.5,
    status: "Healthy",
    date: "2026-09-15",
  },
  {
    id: "prj-11",
    project: "Pallet Racking Hall",
    expectedIncome: "$68L",
    expectedIncomeValue: 6800000,
    expectedExpense: "$63L",
    expectedExpenseValue: 6300000,
    expectedProfit: "$5L",
    expectedProfitValue: 500000,
    margin: "7.3%",
    marginPercent: 7.3,
    status: "Risk",
    date: "2026-09-20",
  },
  {
    id: "prj-12",
    project: "High-Bay Warehouse B",
    expectedIncome: "$92L",
    expectedIncomeValue: 9200000,
    expectedExpense: "$66L",
    expectedExpenseValue: 6600000,
    expectedProfit: "$26L",
    expectedProfitValue: 2600000,
    margin: "28.2%",
    marginPercent: 28.2,
    status: "Healthy",
    date: "2026-09-22",
  },
  {
    id: "prj-13",
    project: "Central Distribution Depo",
    expectedIncome: "$1.10Cr",
    expectedIncomeValue: 11000000,
    expectedExpense: "$80L",
    expectedExpenseValue: 8000000,
    expectedProfit: "$30L",
    expectedProfitValue: 3000000,
    margin: "27.2%",
    marginPercent: 27.2,
    status: "Healthy",
    date: "2026-09-25",
  },
  {
    id: "prj-14",
    project: "Multi-Tier Heavy Racks",
    expectedIncome: "$52L",
    expectedIncomeValue: 5200000,
    expectedExpense: "$48L",
    expectedExpenseValue: 4800000,
    expectedProfit: "$4L",
    expectedProfitValue: 400000,
    margin: "7.6%",
    marginPercent: 7.6,
    status: "Risk",
    date: "2026-09-28",
  },
  {
    id: "prj-15",
    project: "Assembly Plant Shed",
    expectedIncome: "$74L",
    expectedIncomeValue: 7400000,
    expectedExpense: "$55L",
    expectedExpenseValue: 5500000,
    expectedProfit: "$19L",
    expectedProfitValue: 1900000,
    margin: "25.6%",
    marginPercent: 25.6,
    status: "Healthy",
    date: "2026-10-02",
  },
  {
    id: "prj-16",
    project: "Logistics Hub Section 3",
    expectedIncome: "$86L",
    expectedIncomeValue: 8600000,
    expectedExpense: "$60L",
    expectedExpenseValue: 6000000,
    expectedProfit: "$26L",
    expectedProfitValue: 2600000,
    margin: "30.2%",
    marginPercent: 30.2,
    status: "Healthy",
    date: "2026-10-05",
  },
];

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

  const [currentPage, setCurrentPage] = useState(4); // Default to page 4 as in screenshot
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

  // Filter & sort logic for Project-wise forecast table
  const filteredProjects = useMemo(() => {
    let result = [...PROJECT_FORECAST_DATA];

    if (amountRange === "$0 - $50L") {
      result = result.filter((p) => p.expectedIncomeValue <= 5000000);
    } else if (amountRange === "$50L - $80L") {
      result = result.filter(
        (p) => p.expectedIncomeValue > 5000000 && p.expectedIncomeValue <= 8000000
      );
    } else if (amountRange === "$80L+") {
      result = result.filter((p) => p.expectedIncomeValue > 8000000);
    }

    if (sortBy === "Margin: High to Low") {
      result.sort((a, b) => b.marginPercent - a.marginPercent);
    } else if (sortBy === "Margin: Low to High") {
      result.sort((a, b) => a.marginPercent - b.marginPercent);
    } else if (sortBy === "Expected Income") {
      result.sort((a, b) => b.expectedIncomeValue - a.expectedIncomeValue);
    } else if (sortBy === "Expected Profit") {
      result.sort((a, b) => b.expectedProfitValue - a.expectedProfitValue);
    }

    if (marginSortDirection === "asc") {
      result.sort((a, b) => a.marginPercent - b.marginPercent);
    }

    return result;
  }, [amountRange, sortBy, marginSortDirection]);

  const itemsPerPage = 10;
  const totalEntries = filteredProjects.length;
  const totalPages = 15; // Set to 15 to reflect screenshot's pagination exactly (1, 2, 3, 4 ... 15)

  const paginatedProjects = useMemo(() => {
    // Show slice for current page
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProjects.slice(start, start + itemsPerPage);
  }, [filteredProjects, currentPage, itemsPerPage]);

  const handleExport = (type: string) => {
    setIsExportMenuOpen(false);
    if (type === "csv") {
      const headers = "Project,Expected Income,Expected Expense,Expected Profit,Margin,Status\n";
      const rows = PROJECT_FORECAST_DATA.map(
        (p) =>
          `"${p.project}","${p.expectedIncome}","${p.expectedExpense}","${p.expectedProfit}","${p.margin}","${p.status}"`
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

  const getConfidenceBadge = (confidence: "High" | "Medium" | "Low") => {
    switch (confidence) {
      case "High":
        return <span className="font-semibold text-[#1877F2]">High</span>;
      case "Medium":
        return <span className="font-semibold text-[#2563EB]">Medium</span>;
      case "Low":
        return <span className="font-semibold text-[#3B82F6]">Low</span>;
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

      {/* 2. Top 5 Vibrant Dark Blue Metric / KPI Cards with diagonal subtle watermark lines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {KPI_DATA.map((kpi, idx) => (
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
              <div className="mt-2 text-2xl font-bold tracking-tight text-white">
                {kpi.amount}
              </div>
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
          <div className="px-3 py-1.5 rounded-lg border border-slate-100 bg-white shadow-2xs min-w-[110px]">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#1877F2]"></span>
              <span>Expected Income</span>
            </div>
            <div className="mt-1 text-sm font-bold text-slate-800">
              49 Lacks
            </div>
          </div>

          {/* Expected Expense */}
          <div className="px-3 py-1.5 rounded-lg border border-slate-100 bg-white shadow-2xs min-w-[110px]">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
              <span>Expected Expense</span>
            </div>
            <div className="mt-1 text-sm font-bold text-slate-800">
              38 Lacks
            </div>
          </div>

          {/* Expected Profit */}
          <div className="px-3 py-1.5 rounded-lg border border-slate-100 bg-white shadow-2xs min-w-[110px]">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
              <span>Expected Profit</span>
            </div>
            <div className="mt-1 text-sm font-bold text-slate-800">
              30 Lacks
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={MONTHLY_OVERVIEW_DATA}
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
                      <text
                        x={0}
                        y={24}
                        dy={6}
                        textAnchor="middle"
                        fill="#94A3B8"
                        fontSize={10}
                      >
                        2026
                      </text>
                    </g>
                  );
                }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748B", fontSize: 11 }}
                domain={[0, 100]}
                ticks={[0, 10, 20, 40, 60, 80, 100]}
                tickFormatter={(value) => (value === 0 ? "0" : `${value} L`)}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-2.5 rounded-lg shadow-lg border border-slate-100 text-xs space-y-1">
                        <p className="font-bold text-slate-800">{label} 2026</p>
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
                  {INCOME_BREAKDOWN_DATA.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 text-slate-800 font-medium">
                        {row.incomeSource}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#10B981]">
                        {row.expectedAmount}
                      </td>
                      <td className="py-3 px-4">
                        {getConfidenceBadge(row.confidence)}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {row.expectedDate}
                      </td>
                    </tr>
                  ))}
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
                  {EXPENSE_BREAKDOWN_DATA.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 text-slate-800 font-medium">
                        {row.expenseCategory}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#EF4444]">
                        {row.expectedCost}
                      </td>
                      <td className="py-3 px-4">
                        {getConfidenceBadge(row.confidence)}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {row.expectedPeriod}
                      </td>
                    </tr>
                  ))}
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{dateRangeText}</span>
            </button>

            {/* Amount Range Filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsAmountRangeOpen(!isAmountRangeOpen)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
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
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
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
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
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
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
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
              {paginatedProjects.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800">
                    {row.project}
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {row.expectedIncome}
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {row.expectedExpense}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {row.expectedProfit}
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {row.margin}
                  </td>
                  <td className="py-3 px-4">
                    {row.status === "Healthy" ? (
                      <span className="inline-block px-3 py-0.5 rounded-full text-[11px] font-semibold bg-[#E7F6ED] text-[#10B981] border border-emerald-200">
                        Healthy
                      </span>
                    ) : (
                      <span className="inline-block px-3.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FDECE7] text-[#EF4444] border border-rose-200">
                        Risk
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination matching Screenshot */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 bg-white">
          <span>
            Showing 1 to {Math.min(itemsPerPage, totalEntries)} of {totalEntries} entries
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

            {/* Page buttons */}
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium cursor-pointer transition-colors ${
                  currentPage === page
                    ? "bg-[#2563EB] text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {page}
              </button>
            ))}

            {/* Active page 4 */}
            <button
              type="button"
              onClick={() => setCurrentPage(4)}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold cursor-pointer transition-colors ${
                currentPage === 4
                  ? "bg-[#17549C] text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              4
            </button>

            {/* Ellipsis */}
            <span className="px-1 text-slate-400">...</span>

            {/* Last Page 15 */}
            <button
              type="button"
              onClick={() => setCurrentPage(15)}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium cursor-pointer transition-colors ${
                currentPage === 15
                  ? "bg-[#17549C] text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {totalPages}
            </button>

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
