import React, { useState, useMemo } from "react";
import {
  Home,
  Download,
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar,
  FileSpreadsheet,
  FileText,
  DollarSign,
  ShoppingBag,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import CalendarRangePickerModal from "@/components/common_components/CalendarRangePickerModal";
import SuccessModal from "@/components/common_components/SuccessModal";
import { Skeleton } from "@/components/ui/skeleton";
import { CostStatCard } from "@/components/cost/CostStatCard";
import {
  useGetCostFiltersQuery,
  useGetMiscSummaryQuery,
  useGetMiscOverviewChartQuery,
  useGetMiscByCategoryQuery,
  useGetMiscByProjectQuery,
  useGetMiscRecordsQuery,
} from "@/redux/api/costsApi";
import { formatDisplayDate } from "@/lib/dashboardFormatters";
import type {
  ProjectWiseMiscCost,
  MiscExpenseRecord,
} from "@/components/cost/miscellaneousCostData";

export const MiscellaneousCostPage: React.FC = () => {
  const navigate = useNavigate();

  // Export dropdown
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState("Last 6 Months");

  // Success modal
  const [successDialogConfig, setSuccessDialogConfig] = useState<{
    isOpen: boolean;
    title: string;
    message?: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  // RTK Query API Integration
  const { data: filtersData } = useGetCostFiltersQuery();
  const { data: summaryData, isLoading: isSummaryLoading } = useGetMiscSummaryQuery();
  const { data: chartDataApi, isLoading: isChartLoading } = useGetMiscOverviewChartQuery({
    timeframe: selectedTimeframe,
  });
  const { data: categoryDataApi, isLoading: isCategoryLoading } = useGetMiscByCategoryQuery();

  // ===================== TABLE 1: PROJECT-WISE MISCELLANEOUS COST =====================
  const [table1DateRange, setTable1DateRange] = useState("dd/mm/yyyy - dd/mm/yyyy");
  const [isTable1DateOpen, setIsTable1DateOpen] = useState(false);
  const [table1Designation, setTable1Designation] = useState("All");
  const [table1Project, setTable1Project] = useState("All");
  const [table1AmountRange, setTable1AmountRange] = useState("All");
  const [table1SortBy, setTable1SortBy] = useState("Last 7 Days");
  const [table1RowsPerPage, setTable1RowsPerPage] = useState(10);
  const [table1Search, setTable1Search] = useState("");
  const [table1Page, setTable1Page] = useState(1);

  const { data: projectWiseApi, isLoading: isProjectLoading } = useGetMiscByProjectQuery({
    search: table1Search,
    project: table1Project !== "All" ? table1Project : undefined,
  });

  const effectiveProjectData: ProjectWiseMiscCost[] = useMemo(() => {
    if (projectWiseApi && projectWiseApi.length > 0) {
      return projectWiseApi.map((p, idx) => ({
        id: p.leadId || `p-${idx}`,
        project: p.projectName,
        customer: {
          name: p.projectName,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(p.projectName)}&background=1D51A4&color=fff&size=100`,
        },
        expensesCount: p.transactionsCount ?? 0,
        amount: p.amount,
        amountFormatted: `$${(p.amount ?? 0).toLocaleString()}`,
        budget: p.amount,
        budgetFormatted: `$${(p.amount ?? 0).toLocaleString()}`,
        variance: 0,
        varianceFormatted: "$0",
        status: "Under",
      }));
    }
    return [];
  }, [projectWiseApi]);

  const filteredProjectData = effectiveProjectData;

  const table1TotalPages = Math.max(
    1,
    Math.ceil(filteredProjectData.length / table1RowsPerPage),
  );

  const table1DisplayRows = useMemo(() => {
    const start = (table1Page - 1) * table1RowsPerPage;
    return filteredProjectData.slice(start, start + table1RowsPerPage);
  }, [filteredProjectData, table1Page, table1RowsPerPage]);

  // ===================== TABLE 2: MISCELLANEOUS EXPENSE RECORDS =====================
  const [table2DateRange, setTable2DateRange] = useState("dd/mm/yyyy - dd/mm/yyyy");
  const [isTable2DateOpen, setIsTable2DateOpen] = useState(false);
  const [table2Designation, setTable2Designation] = useState("All");
  const [table2Project, setTable2Project] = useState("All");
  const [table2AmountRange, setTable2AmountRange] = useState("All");
  const [table2SortBy, setTable2SortBy] = useState("Last 7 Days");
  const [table2RowsPerPage, setTable2RowsPerPage] = useState(10);
  const [table2Search, setTable2Search] = useState("");
  const [table2Page, setTable2Page] = useState(1);
  const [dateSortOrder, setDateSortOrder] = useState<"asc" | "desc">("desc");
  const [vendorSortOrder, setVendorSortOrder] = useState<"asc" | "desc">("asc");

  const { data: recordsApi, isLoading: isRecordsLoading } = useGetMiscRecordsQuery({
    page: table2Page,
    limit: table2RowsPerPage,
    search: table2Search,
    project: table2Project !== "All" ? table2Project : undefined,
  });

  const effectiveExpenseData: MiscExpenseRecord[] = useMemo(() => {
    if (recordsApi?.rows && recordsApi.rows.length > 0) {
      return recordsApi.rows.map((r, idx) => ({
        id: r.id || r._id || `exp-${idx}`,
        date: r.expenseDate || "",
        expense: r.expenseName || "Expense",
        category: r.expenseCategory || "Miscellaneous",
        project: r.projectName || "General",
        vendor: r.vendorPayee || "N/A",
        amount: r.amount || 0,
        amountFormatted: `$${(r.amount || 0).toLocaleString()}`,
        approvalStatus: (r.paymentStatus === "Paid" ? "Approved" : "Pending") as "Approved" | "Pending" | "Rejected",
      }));
    }
    return [];
  }, [recordsApi]);

  const filteredExpenseData = effectiveExpenseData;

  const table2Total = recordsApi?.total ?? effectiveExpenseData.length;
  const table2TotalPages =
    recordsApi?.pagination?.totalPages ??
    Math.max(1, Math.ceil(table2Total / table2RowsPerPage));

  const table2DisplayRows = useMemo(() => {
    return filteredExpenseData;
  }, [filteredExpenseData]);

  // Export Action
  const handleExport = (type: string) => {
    setIsExportMenuOpen(false);
    if (type === "csv") {
      const headers = "Date,Expense,Category,Project,Vendor,Amount,Approval Status\n";
      const rows = effectiveExpenseData
        .map(
          (d) =>
            `"${d.date}","${d.expense}","${d.category}","${d.project}","${d.vendor}","${d.amountFormatted}","${d.approvalStatus}"`,
        )
        .join("\n");
      const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Miscellaneous_Cost_${new Date().toISOString().slice(0, 10)}.csv`);
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

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Miscellaneous Cost
          </h1>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 font-normal mt-1">
            <Home className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              Track, categorize, approve, and analyze miscellaneous business
              expenses across projects, locations, and operations.
            </span>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Export Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isExportMenuOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95">
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

          {/* Add Miscellaneous Cost Button */}
          <button
            type="button"
            onClick={() => navigate("/cost/miscellaneous-cost/add")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1D51A4] hover:bg-[#163e7c] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <div className="w-4 h-4 rounded-full border border-white/60 flex items-center justify-center">
              <Plus className="w-3 h-3 text-white" />
            </div>
            <span>Add Miscellaneous Cost</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        <CostStatCard
          title="Total Miscellaneous Cost"
          value={
            summaryData?.totalMiscCost !== undefined
              ? `$${Number(summaryData.totalMiscCost).toLocaleString()}`
              : "$0"
          }
          isLoading={isSummaryLoading}
          changeText="From backend analytics"
          color="purple"
          icon={<DollarSign className="w-5 h-5 stroke-[1.8]" />}
        />
        <CostStatCard
          title="Approved Expenses"
          value={
            summaryData?.approvedExpenses !== undefined
              ? `$${Number(summaryData.approvedExpenses).toLocaleString()}`
              : "$0"
          }
          isLoading={isSummaryLoading}
          changeText="From backend analytics"
          color="emerald"
          icon={<ShoppingBag className="w-5 h-5 stroke-[1.8]" />}
        />
        <CostStatCard
          title="Pending Approval"
          value={
            summaryData?.pendingApproval !== undefined
              ? `$${Number(summaryData.pendingApproval).toLocaleString()}`
              : "$0"
          }
          isLoading={isSummaryLoading}
          changeText="From backend analytics"
          color="amber"
          icon={<Clock className="w-5 h-5 stroke-[1.8]" />}
        />
        <CostStatCard
          title="Unplanned Expenses"
          value={
            summaryData?.unplannedExpenses !== undefined
              ? `$${Number(summaryData.unplannedExpenses).toLocaleString()}`
              : "$0"
          }
          isLoading={isSummaryLoading}
          changeText="From backend analytics"
          color="amber"
          icon={<Clock className="w-5 h-5 stroke-[1.8]" />}
        />
      </div>

      {/* 3. Middle Section: Chart + Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (7 cols): Miscellaneous Cost Overview */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 shadow-xs p-5 flex flex-col justify-between">
          <div>
            {/* Chart Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900">
                  Miscellaneous Cost Overview
                </span>
              </div>
              <div className="relative">
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-7 py-1.5 text-xs text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-[#1D51A4]"
                >
                  <option value="Last 6 Months">Last 6 Months</option>
                  <option value="This Year">This Year</option>
                  <option value="Previous Year">Previous Year</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Chart Legend */}
            <div className="flex items-center gap-4 mt-3 mb-1">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                <span>Planned</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                <span>Actual</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="h-64 w-full mt-2">
            {isChartLoading ? (
              <div className="h-full w-full flex items-center justify-center p-4">
                <Skeleton className="h-56 w-full rounded-xl" />
              </div>
            ) : chartDataApi && chartDataApi.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartDataApi}
                  margin={{ top: 10, right: 10, left: -15, bottom: 20 }}
                  barGap={8}
                >
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={{ stroke: "#F1F5F9" }}
                    tick={{ fill: "#64748B", fontSize: 11 }}
                    interval={0}
                    dy={6}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#64748B", fontSize: 11 }}
                    ticks={[0, 10, 20, 40, 60, 80, 100]}
                    tickFormatter={(val) => (val === 0 ? "0" : `${val} L`)}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 text-white rounded-lg p-2.5 text-xs shadow-xl border border-slate-800 space-y-1">
                            <p className="font-semibold text-slate-300 whitespace-pre-line">
                              {label}
                            </p>
                            <div className="flex items-center gap-2 text-blue-400">
                              <span>Planned:</span>
                              <span className="font-bold">
                                {payload[0]?.value} L
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-emerald-400">
                              <span>Actual:</span>
                              <span className="font-bold">
                                {payload[1]?.value} L
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="planned"
                    fill="#2563EB"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={28}
                  />
                  <Bar
                    dataKey="actual"
                    fill="#10B981"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No overview chart data available.
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Expense Category Distribution */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 pb-4 border-b border-slate-100">
              Expense Category Distribution
            </h2>

            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-semibold text-slate-400 border-b border-slate-100">
                    <th className="py-2.5 text-slate-500">Category</th>
                    <th className="py-2.5 text-[#1D51A4]">Amount</th>
                    <th className="py-2.5 text-right text-slate-500">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-[13px]">
                  {isCategoryLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={`cat-skel-${i}`}>
                        <td className="py-3"><Skeleton className="h-4 w-32" /></td>
                        <td className="py-3"><Skeleton className="h-4 w-16" /></td>
                        <td className="py-3 text-right"><Skeleton className="h-4 w-10 ml-auto" /></td>
                      </tr>
                    ))
                  ) : categoryDataApi && categoryDataApi.length > 0 ? (
                    categoryDataApi.map((row) => (
                      <tr
                        key={row.category}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="py-3 font-medium text-slate-600">
                          {row.category}
                        </td>
                        <td className="py-3 font-bold text-[#1D51A4]">
                          {row.amount}
                        </td>
                        <td className="py-3 font-semibold text-slate-800 text-right">
                          {row.percentage}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-400">
                        No expense categories recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Table 1: Project-wise Miscellaneous Cost */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        {/* Table 1 Header Filter Bar */}
        <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Project-wise Miscellaneous Cost
          </h2>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Date Range Picker */}
            <button
              type="button"
              onClick={() => setIsTable1DateOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{table1DateRange}</span>
            </button>

            {/* Designation Dropdown */}
            <div className="relative">
              <select
                value={table1Designation}
                onChange={(e) => {
                  setTable1Designation(e.target.value);
                  if (table1Page !== 1) setTable1Page(1);
                }}
                className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-[#1D51A4]"
              >
                <option value="All">All Designations</option>
                {filtersData?.designations?.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Project Dropdown */}
            <div className="relative">
              <select
                value={table1Project}
                onChange={(e) => {
                  setTable1Project(e.target.value);
                  if (table1Page !== 1) setTable1Page(1);
                }}
                className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-[#1D51A4]"
              >
                <option value="All">All Projects</option>
                {filtersData?.projects?.map((p) => (
                  <option key={p._id} value={p.projectName}>
                    {p.projectName}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Amount Range Dropdown */}
            <div className="relative">
              <select
                value={table1AmountRange}
                onChange={(e) => setTable1AmountRange(e.target.value)}
                className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-[#1D51A4]"
              >
                <option value="All">$0.00 - $00</option>
                <option value="under1L">$0 - $1.00L</option>
                <option value="1L-2L">$1.00L - $2.00L</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort By Dropdown */}
            <div className="relative">
              <select
                value={table1SortBy}
                onChange={(e) => setTable1SortBy(e.target.value)}
                className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-[#1D51A4]"
              >
                <option value="Last 7 Days">Sort By : Last 7 Days</option>
                <option value="Last 30 Days">Sort By : Last 30 Days</option>
                <option value="This Month">Sort By : This Month</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Sub-bar: Rows per page + Search */}
        <div className="px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-normal">
            <span>Row Per Page</span>
            <div className="relative">
              <select
                value={table1RowsPerPage}
                onChange={(e) => {
                  setTable1RowsPerPage(Number(e.target.value));
                  setTable1Page(1);
                }}
                className="appearance-none bg-white border border-slate-200 rounded-md pl-2.5 pr-6 py-1 text-xs text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-[#1D51A4]"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <span>Entries</span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={table1Search}
              onChange={(e) => {
                setTable1Search(e.target.value);
                setTable1Page(1);
              }}
              placeholder="Search"
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1D51A4] transition-colors"
            />
          </div>
        </div>

        {/* Table 1 Data */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-y border-slate-100 text-xs font-semibold text-slate-700">
                <th className="py-3 px-5 whitespace-nowrap">Project</th>
                <th className="py-3 px-5 whitespace-nowrap">Customer</th>
                <th className="py-3 px-5 whitespace-nowrap">Expenses</th>
                <th className="py-3 px-5 whitespace-nowrap">Amount</th>
                <th className="py-3 px-5 whitespace-nowrap">Budget</th>
                <th className="py-3 px-5 whitespace-nowrap">Variance</th>
                <th className="py-3 px-5 whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-[13px]">
              {isProjectLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`proj-skel-${i}`}>
                    <td className="py-3.5 px-5"><Skeleton className="h-4 w-36" /></td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2.5">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </td>
                    <td className="py-3.5 px-5"><Skeleton className="h-4 w-8" /></td>
                    <td className="py-3.5 px-5"><Skeleton className="h-4 w-16" /></td>
                    <td className="py-3.5 px-5"><Skeleton className="h-4 w-16" /></td>
                    <td className="py-3.5 px-5"><Skeleton className="h-4 w-16" /></td>
                    <td className="py-3.5 px-5"><Skeleton className="h-6 w-16 rounded-md" /></td>
                  </tr>
                ))
              ) : table1DisplayRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No project-wise miscellaneous costs found.
                  </td>
                </tr>
              ) : (
                table1DisplayRows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                  {/* Project */}
                  <td className="py-3.5 px-5 font-normal text-slate-700 whitespace-nowrap">
                    {row.project}
                  </td>

                  {/* Customer with Avatar */}
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={
                          row.customer?.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            row.customer?.name || (row as unknown as { projectName?: string }).projectName || "Customer",
                          )}&background=1D51A4&color=fff&size=100`
                        }
                        alt={row.customer?.name || (row as unknown as { projectName?: string }).projectName || "Customer"}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-100"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            row.customer?.name || (row as unknown as { projectName?: string }).projectName || "Customer",
                          )}&background=1D51A4&color=fff&size=100`;
                        }}
                      />
                      <span className="font-semibold text-slate-900 text-xs sm:text-[13px]">
                        {row.customer?.name || (row as unknown as { projectName?: string }).projectName || "N/A"}
                      </span>
                    </div>
                  </td>

                  {/* Expenses Count */}
                  <td className="py-3.5 px-5 font-bold text-slate-900 whitespace-nowrap">
                    {row.expensesCount}
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-5 font-bold text-slate-900 whitespace-nowrap">
                    {row.amountFormatted}
                  </td>

                  {/* Budget */}
                  <td className="py-3.5 px-5 font-bold text-slate-900 whitespace-nowrap">
                    {row.budgetFormatted}
                  </td>

                  {/* Variance */}
                  <td className="py-3.5 px-5 font-bold whitespace-nowrap">
                    <span
                      className={
                        row.status === "Over"
                          ? "text-[#EF4444]"
                          : "text-[#10B981]"
                      }
                    >
                      {row.varianceFormatted}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <span
                      className={`inline-block px-3 py-1 rounded-md text-[11px] font-semibold tracking-wide ${
                        row.status === "Over"
                          ? "bg-[#FEE2E2] text-[#EF4444]"
                          : "bg-[#DCFCE7] text-[#16A34A]"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>

        {/* Table 1 Pagination */}
        <div className="px-4 sm:px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 font-normal">
            Showing {filteredProjectData.length > 0 ? (table1Page - 1) * table1RowsPerPage + 1 : 0} to {Math.min(table1Page * table1RowsPerPage, filteredProjectData.length)} of {filteredProjectData.length} entries
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              disabled={table1Page <= 1}
              onClick={() => setTable1Page((p) => Math.max(1, p - 1))}
              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: Math.min(5, table1TotalPages) }, (_, idx) => {
              const page = idx + 1;
              return (
                <button
                  key={`t1-p-${page}`}
                  type="button"
                  onClick={() => setTable1Page(page)}
                  className={`w-6 h-6 rounded-full text-xs transition-colors flex items-center justify-center cursor-pointer ${
                    page === table1Page
                      ? "bg-[#1D51A4] text-white font-bold shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 font-medium"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            {table1TotalPages > 5 && (
              <>
                <span className="px-1 text-slate-400">...</span>
                <button
                  type="button"
                  onClick={() => setTable1Page(table1TotalPages)}
                  className={`w-6 h-6 rounded-full text-xs transition-colors flex items-center justify-center cursor-pointer ${
                    table1Page === table1TotalPages
                      ? "bg-[#1D51A4] text-white font-bold shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 font-medium"
                  }`}
                >
                  {table1TotalPages}
                </button>
              </>
            )}

            <button
              type="button"
              disabled={table1Page >= table1TotalPages}
              onClick={() => setTable1Page((p) => Math.min(table1TotalPages, p + 1))}
              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Table 2: Miscellaneous Expense Records */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        {/* Table 2 Header Filter Bar */}
        <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Miscellaneous Expense Records
          </h2>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Date Range Picker */}
            <button
              type="button"
              onClick={() => setIsTable2DateOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{table2DateRange}</span>
            </button>

            {/* Designation Dropdown */}
            <div className="relative">
              <select
                value={table2Designation}
                onChange={(e) => {
                  setTable2Designation(e.target.value);
                  if (table2Page !== 1) setTable2Page(1);
                }}
                className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-[#1D51A4]"
              >
                <option value="All">All Designations</option>
                {filtersData?.designations?.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Project Dropdown */}
            <div className="relative">
              <select
                value={table2Project}
                onChange={(e) => {
                  setTable2Project(e.target.value);
                  if (table2Page !== 1) setTable2Page(1);
                }}
                className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-[#1D51A4]"
              >
                <option value="All">All Projects</option>
                {filtersData?.projects?.map((p) => (
                  <option key={p._id} value={p.projectName}>
                    {p.projectName}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Amount Range Dropdown */}
            <div className="relative">
              <select
                value={table2AmountRange}
                onChange={(e) => setTable2AmountRange(e.target.value)}
                className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-[#1D51A4]"
              >
                <option value="All">$0.00 - $00</option>
                <option value="under1k">$0 - $1,000</option>
                <option value="1k-2k">$1,000 - $2,000</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort By Dropdown */}
            <div className="relative">
              <select
                value={table2SortBy}
                onChange={(e) => setTable2SortBy(e.target.value)}
                className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-[#1D51A4]"
              >
                <option value="Last 7 Days">Sort By : Last 7 Days</option>
                <option value="Last 30 Days">Sort By : Last 30 Days</option>
                <option value="This Month">Sort By : This Month</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Sub-bar: Rows per page + Search */}
        <div className="px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-normal">
            <span>Row Per Page</span>
            <div className="relative">
              <select
                value={table2RowsPerPage}
                onChange={(e) => {
                  setTable2RowsPerPage(Number(e.target.value));
                  setTable2Page(1);
                }}
                className="appearance-none bg-white border border-slate-200 rounded-md pl-2.5 pr-6 py-1 text-xs text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-[#1D51A4]"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <span>Entries</span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={table2Search}
              onChange={(e) => {
                setTable2Search(e.target.value);
                setTable2Page(1);
              }}
              placeholder="Search"
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1D51A4] transition-colors"
            />
          </div>
        </div>

        {/* Table 2 Data */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-y border-slate-100 text-xs font-semibold text-slate-700">
                <th
                  onClick={() =>
                    setDateSortOrder(dateSortOrder === "asc" ? "desc" : "asc")
                  }
                  className="py-3 px-5 cursor-pointer hover:text-slate-900 select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    <span className="text-[10px] text-slate-400">▾</span>
                  </div>
                </th>
                <th className="py-3 px-5 whitespace-nowrap">Expense</th>
                <th className="py-3 px-5 whitespace-nowrap">Category</th>
                <th className="py-3 px-5 whitespace-nowrap">Project</th>
                <th
                  onClick={() =>
                    setVendorSortOrder(
                      vendorSortOrder === "asc" ? "desc" : "asc",
                    )
                  }
                  className="py-3 px-5 cursor-pointer hover:text-slate-900 select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Vendor/Payee</span>
                    <span className="text-[10px] text-slate-400">▾</span>
                  </div>
                </th>
                <th className="py-3 px-5 whitespace-nowrap">Amount</th>
                <th className="py-3 px-5 whitespace-nowrap">Approval Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-[13px]">
              {isRecordsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`exp-skel-${i}`}>
                    <td className="py-3.5 px-5"><Skeleton className="h-4 w-20" /></td>
                    <td className="py-3.5 px-5"><Skeleton className="h-4 w-32" /></td>
                    <td className="py-3.5 px-5"><Skeleton className="h-4 w-24" /></td>
                    <td className="py-3.5 px-5"><Skeleton className="h-4 w-28" /></td>
                    <td className="py-3.5 px-5"><Skeleton className="h-4 w-24" /></td>
                    <td className="py-3.5 px-5"><Skeleton className="h-4 w-16" /></td>
                    <td className="py-3.5 px-5"><Skeleton className="h-6 w-20 rounded-md" /></td>
                  </tr>
                ))
              ) : table2DisplayRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No miscellaneous expense records found.
                  </td>
                </tr>
              ) : (
                table2DisplayRows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                  {/* Date */}
                  <td className="py-3.5 px-5 font-normal text-slate-600 whitespace-nowrap">
                    {formatDisplayDate(row.date)}
                  </td>

                  {/* Expense Name */}
                  <td className="py-3.5 px-5 font-bold text-slate-900 whitespace-nowrap">
                    {row.expense}
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-5 font-normal text-slate-600 whitespace-nowrap">
                    {row.category}
                  </td>

                  {/* Project */}
                  <td className="py-3.5 px-5 font-normal text-slate-600 whitespace-nowrap">
                    {row.project}
                  </td>

                  {/* Vendor/Payee */}
                  <td className="py-3.5 px-5 font-normal text-slate-600 whitespace-nowrap">
                    {row.vendor}
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-5 font-bold text-slate-900 whitespace-nowrap">
                    {row.amountFormatted}
                  </td>

                  {/* Approval Status Badge */}
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <span
                      className={`inline-block px-3 py-1 rounded-md text-[11px] font-semibold tracking-wide ${
                        row.approvalStatus === "Approved"
                          ? "bg-[#DCFCE7] text-[#16A34A]"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {row.approvalStatus}
                    </span>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>

        {/* Table 2 Pagination */}
        <div className="px-4 sm:px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 font-normal">
            Showing {table2Total > 0 ? (table2Page - 1) * table2RowsPerPage + 1 : 0} to {Math.min(table2Page * table2RowsPerPage, table2Total)} of {table2Total} entries
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              disabled={table2Page <= 1}
              onClick={() => setTable2Page((p) => Math.max(1, p - 1))}
              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: Math.min(5, table2TotalPages) }, (_, idx) => {
              const page = idx + 1;
              return (
                <button
                  key={`t2-p-${page}`}
                  type="button"
                  onClick={() => setTable2Page(page)}
                  className={`w-6 h-6 rounded-full text-xs transition-colors flex items-center justify-center cursor-pointer ${
                    page === table2Page
                      ? "bg-[#1D51A4] text-white font-bold shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 font-medium"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            {table2TotalPages > 5 && (
              <>
                <span className="px-1 text-slate-400">...</span>
                <button
                  type="button"
                  onClick={() => setTable2Page(table2TotalPages)}
                  className={`w-6 h-6 rounded-full text-xs transition-colors flex items-center justify-center cursor-pointer ${
                    table2Page === table2TotalPages
                      ? "bg-[#1D51A4] text-white font-bold shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 font-medium"
                  }`}
                >
                  {table2TotalPages}
                </button>
              </>
            )}

            <button
              type="button"
              disabled={table2Page >= table2TotalPages}
              onClick={() => setTable2Page((p) => Math.min(table2TotalPages, p + 1))}
              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Date Range Picker Modal 1 */}
      <CalendarRangePickerModal
        isOpen={isTable1DateOpen}
        onClose={() => setIsTable1DateOpen(false)}
        onApply={(range) => {
          if (range?.from && range?.to) {
            setTable1DateRange(
              `${range.from.toLocaleDateString("en-GB")} - ${range.to.toLocaleDateString("en-GB")}`,
            );
          }
          setIsTable1DateOpen(false);
        }}
      />

      {/* Date Range Picker Modal 2 */}
      <CalendarRangePickerModal
        isOpen={isTable2DateOpen}
        onClose={() => setIsTable2DateOpen(false)}
        onApply={(range) => {
          if (range?.from && range?.to) {
            setTable2DateRange(
              `${range.from.toLocaleDateString("en-GB")} - ${range.to.toLocaleDateString("en-GB")}`,
            );
          }
          setIsTable2DateOpen(false);
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

export default MiscellaneousCostPage;
