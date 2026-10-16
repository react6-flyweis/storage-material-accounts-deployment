import { useState, useMemo } from "react";
import {
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar,
  AlertTriangle,
  FileText,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import CalendarRangePickerModal from "@/components/common_components/CalendarRangePickerModal";
import {
  useGetCostVarianceSummaryQuery,
  useGetCostVarianceAlertsQuery,
  useGetCostVarianceTrendQuery,
  useGetCostVarianceDetailsQuery,
  useGetCostFiltersQuery,
} from "@/redux/api/costsApi";
import { Skeleton } from "@/components/ui/skeleton";

// --- Types ---
export interface KpiCardData {
  netVariance: string;
  netVarianceSub: string;
  overBudgetCount: number;
  overBudgetAmount: string;
  underBudgetCount: number;
  underBudgetAmount: string;
  onBudgetCount: number;
  onBudgetSub: string;
}

export interface HighVarianceAlertItem {
  id: string;
  title: string;
  subtitle: string;
  awarded: string;
  actual: string;
  variance: string;
  percentageBadge: string;
}

export interface TrendChartPoint {
  month: string;
  awardedAmount: number;
  actualInvoice: number;
}

export interface VarianceDetailRow {
  id: string;
  project: string;
  description: string;
  deliveryId: string;
  vendor: string;
  vendorCode: string;
  awardedAmount: string;
  actualInvoice: string;
  variance: string;
  varianceType: "over" | "under" | "exact";
  status: "Over Budget" | "Under Budget" | "On Budget";
}






export default function CostVariancePage() {
  // RTK Query endpoints
  const { data: summaryData, isLoading: isSummaryLoading } = useGetCostVarianceSummaryQuery();
  const { data: alertsData, isLoading: isAlertsLoading } = useGetCostVarianceAlertsQuery();
  const { data: trendData, isLoading: isTrendLoading } = useGetCostVarianceTrendQuery();
  const { data: detailsData, isLoading: isDetailsLoading } = useGetCostVarianceDetailsQuery();
  const { data: costFilters } = useGetCostFiltersQuery();

  // Normalized live records
  const varianceRows: VarianceDetailRow[] = useMemo(() => {
    if (!detailsData?.rows) return [];
    return detailsData.rows.map((row, idx) => ({
      id: row._id || row.id || `row-${idx}`,
      project: row.project || "General",
      description: row.description || "-",
      deliveryId: row.deliveryId || "-",
      vendor: row.vendor || "-",
      vendorCode: row.vendorCode || "-",
      awardedAmount:
        typeof row.awardedAmount === "number"
          ? `$${row.awardedAmount.toLocaleString()}`
          : String(row.awardedAmount || "$0"),
      actualInvoice:
        typeof row.actualInvoice === "number"
          ? `$${row.actualInvoice.toLocaleString()}`
          : String(row.actualInvoice || "$0"),
      variance:
        typeof row.variance === "number"
          ? (row.variance > 0
              ? `+$${row.variance.toLocaleString()}`
              : `$${row.variance.toLocaleString()}`)
          : String(row.variance || "0"),
      varianceType:
        row.varianceType ||
        (Number(row.variance) > 0 ? "over" : Number(row.variance) < 0 ? "under" : "exact"),
      status:
        (row.status as "Over Budget" | "Under Budget" | "On Budget") ||
        (Number(row.variance) > 0
          ? "Over Budget"
          : Number(row.variance) < 0
          ? "Under Budget"
          : "On Budget"),
    }));
  }, [detailsData]);

  const highVarianceAlerts = useMemo(() => {
    if (!alertsData) return [];
    return alertsData.map((a, idx) => ({
      id: a._id || a.id || `alert-${idx}`,
      title: a.title,
      subtitle: a.subtitle || a.projectName || "Cost Overrun Alert",
      awarded:
        typeof a.awarded === "number"
          ? `$${a.awarded.toLocaleString()}`
          : String(a.awarded || "$0"),
      actual:
        typeof a.actual === "number"
          ? `$${a.actual.toLocaleString()}`
          : String(a.actual || "$0"),
      variance:
        typeof a.variance === "number"
          ? (a.variance > 0
              ? `+$${a.variance.toLocaleString()}`
              : `$${a.variance.toLocaleString()}`)
          : String(a.variance || "0"),
      percentageBadge: a.percentageBadge || "+0%",
    }));
  }, [alertsData]);

  const trendChartData: TrendChartPoint[] = useMemo(() => {
    if (!trendData || trendData.length === 0) return [];
    return trendData.map((pt) => ({
      month: pt.month,
      awardedAmount: Number(pt.awardedAmount) || 0,
      actualInvoice: Number(pt.actualInvoice) || 0,
    }));
  }, [trendData]);

  // --- States ---
  const [topSearch, setTopSearch] = useState("");
  const [selectedTopProject, setSelectedTopProject] = useState("All Projects");
  const [selectedTopStatus, setSelectedTopStatus] = useState("All Status");

  // Table filters
  const [tableSearch, setTableSearch] = useState("");
  const [dateRangeStr, setDateRangeStr] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState("Designation");
  const [selectedTableProject, setSelectedTableProject] = useState("Project");
  const [selectedPriceRange, setSelectedPriceRange] = useState("$0.00 - $100+");
  const [selectedSort, setSelectedSort] = useState("Sort By : Last 7 Days");

  // Pagination
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Export dropdown
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return varianceRows.filter((row) => {
      // Top search filter
      if (topSearch.trim()) {
        const q = topSearch.toLowerCase();
        const matches =
          row.description.toLowerCase().includes(q) ||
          row.vendor.toLowerCase().includes(q) ||
          row.deliveryId.toLowerCase().includes(q) ||
          row.project.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Top project filter
      if (selectedTopProject !== "All Projects") {
        if (row.project !== selectedTopProject) return false;
      }

      // Top status filter
      if (selectedTopStatus !== "All Status") {
        if (row.status !== selectedTopStatus) return false;
      }

      // Table search
      if (tableSearch.trim()) {
        const q = tableSearch.toLowerCase();
        const matches =
          row.description.toLowerCase().includes(q) ||
          row.vendor.toLowerCase().includes(q) ||
          row.deliveryId.toLowerCase().includes(q) ||
          row.project.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Table project filter
      if (selectedTableProject !== "Project") {
        if (row.project !== selectedTableProject) return false;
      }

      return true;
    });
  }, [
    varianceRows,
    topSearch,
    selectedTopProject,
    selectedTopStatus,
    tableSearch,
    selectedTableProject,
  ]);

  const totalEntries = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / rowsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedRows = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * rowsPerPage;
    return filteredRows.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredRows, validCurrentPage, rowsPerPage]);

  const startEntryIndex = totalEntries === 0 ? 0 : (validCurrentPage - 1) * rowsPerPage + 1;
  const endEntryIndex = Math.min(validCurrentPage * rowsPerPage, totalEntries);

  const handleExport = (type: "csv" | "excel" | "pdf") => {
    setIsExportOpen(false);
    // Standard mock export action
    alert(`Exporting ${type.toUpperCase()}...`);
  };

  return (
    <div className="min-h-screen bg-[#F4F7FE] p-4 md:p-6 lg:p-8 space-y-6 text-[#1E293B] font-sans antialiased">
      {/* ----------------- Header Section ----------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-[26px] font-bold text-[#1E293B] tracking-tight">
            Cost Variance Analysis
          </h1>
          <div className="flex items-center gap-1.5 text-xs md:text-sm text-[#64748B] mt-1 font-normal">
            {/* Outline house icon matching design */}
            <span className="text-[#94A3B8] inline-flex items-center">
              <svg
                className="w-4 h-4 stroke-current fill-none"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </span>
            <span>
              Track awarded amounts vs actual invoices and identify cost discrepancies
            </span>
          </div>
        </div>

        {/* Export Button with Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsExportOpen(!isExportOpen)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs md:text-sm font-medium text-[#475569] shadow-xs hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Export</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
          </button>

          {isExportOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-[#E2E8F0] rounded-xl shadow-lg z-30 py-1 overflow-hidden">
              <button
                type="button"
                onClick={() => handleExport("csv")}
                className="w-full text-left px-4 py-2 text-xs md:text-sm text-[#475569] hover:bg-[#F1F5F9] transition-colors"
              >
                Export as CSV
              </button>
              <button
                type="button"
                onClick={() => handleExport("excel")}
                className="w-full text-left px-4 py-2 text-xs md:text-sm text-[#475569] hover:bg-[#F1F5F9] transition-colors"
              >
                Export as Excel
              </button>
              <button
                type="button"
                onClick={() => handleExport("pdf")}
                className="w-full text-left px-4 py-2 text-xs md:text-sm text-[#475569] hover:bg-[#F1F5F9] transition-colors"
              >
                Export as PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ----------------- KPI Cards Grid (4 Cards) ----------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Net Variance */}
        <div className="bg-white rounded-2xl border border-[#CBD5E1] p-5 shadow-xs flex items-center justify-between transition-all">
          <div className="space-y-1">
            <span className="text-xs md:text-[13px] font-medium text-[#64748B]">
              Net Variance
            </span>
            {isSummaryLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl font-bold text-[#10B981] tracking-tight">
                {summaryData?.netVariance != null ? `$${Number(summaryData.netVariance).toLocaleString()}` : "$0"}
              </div>
            )}
            <p className="text-[11px] text-[#94A3B8] font-normal">
              {summaryData?.netVarianceSub || "Overall variance"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#F1F5F9] flex items-center justify-center text-[#64748B] font-semibold text-lg">
            $
          </div>
        </div>

        {/* Card 2: Over Budget */}
        <div className="bg-white rounded-2xl border border-[#EF4444] p-5 shadow-xs flex items-center justify-between transition-all">
          <div className="space-y-1">
            <span className="text-xs md:text-[13px] font-medium text-[#64748B]">
              Over Budget
            </span>
            {isSummaryLoading ? (
              <Skeleton className="h-7 w-14" />
            ) : (
              <div className="text-2xl font-bold text-[#1E293B] tracking-tight">
                {summaryData?.overBudgetCount ?? 0}
              </div>
            )}
            <p className="text-[11px] text-[#EF4444] font-medium">
              {summaryData?.overBudgetAmount != null
                ? `+$${Number(summaryData.overBudgetAmount).toLocaleString()} average`
                : "$0 average"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#FEE2E2] flex items-center justify-center text-[#EF4444]">
            <TrendingUp className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        {/* Card 3: Under Budget */}
        <div className="bg-white rounded-2xl border border-[#10B981] p-5 shadow-xs flex items-center justify-between transition-all">
          <div className="space-y-1">
            <span className="text-xs md:text-[13px] font-medium text-[#64748B]">
              Under Budget
            </span>
            {isSummaryLoading ? (
              <Skeleton className="h-7 w-14" />
            ) : (
              <div className="text-2xl font-bold text-[#1E293B] tracking-tight">
                {summaryData?.underBudgetCount ?? 0}
              </div>
            )}
            <p className="text-[11px] text-[#10B981] font-medium">
              {summaryData?.underBudgetAmount != null
                ? `$${Number(summaryData.underBudgetAmount).toLocaleString()} saved`
                : "$0 saved"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#DCFCE7] flex items-center justify-center text-[#10B981]">
            <TrendingDown className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        {/* Card 4: On Budget */}
        <div className="bg-white rounded-2xl border border-[#3B82F6] p-5 shadow-xs flex items-center justify-between transition-all">
          <div className="space-y-1">
            <span className="text-xs md:text-[13px] font-medium text-[#64748B]">
              On Budget
            </span>
            {isSummaryLoading ? (
              <Skeleton className="h-7 w-14" />
            ) : (
              <div className="text-2xl font-bold text-[#1E293B] tracking-tight">
                {summaryData?.onBudgetCount ?? 0}
              </div>
            )}
            <p className="text-[11px] text-[#3B82F6] font-medium">
              {summaryData?.onBudgetSub || "Exact match"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#DBEAFE] flex items-center justify-center text-[#3B82F6]">
            <FileText className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>
      </div>

      {/* ----------------- High Variance Alerts Section ----------------- */}
      <div className="bg-white rounded-2xl border border-[#FCA5A5] p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-[#EF4444] font-semibold text-sm md:text-base">
          <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
          <span>High Variance Alerts</span>
        </div>

        <div className="space-y-3">
          {isAlertsLoading ? (
            Array.from({ length: 2 }).map((_, idx) => (
              <div
                key={`alert-skel-${idx}`}
                className="bg-[#FFF1F2] border border-[#FFE4E6] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-28" />
                  <div className="flex gap-4 pt-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))
          ) : highVarianceAlerts.length === 0 ? (
            <div className="py-4 text-center text-xs text-[#94A3B8]">
              No high variance alerts detected.
            </div>
          ) : (
            highVarianceAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-[#FFF1F2] border border-[#FFE4E6] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <h4 className="text-sm font-semibold text-[#1E293B]">
                    {alert.title}
                  </h4>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {alert.subtitle}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-1 mt-2 text-xs">
                    <div>
                      <span className="text-[#64748B]">Awarded:</span>{" "}
                      <span className="font-semibold text-[#1E293B]">
                        {alert.awarded}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#64748B]">Actual:</span>{" "}
                      <span className="font-semibold text-[#1E293B]">
                        {alert.actual}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#64748B]">Variance:</span>{" "}
                      <span className="font-bold text-[#EF4444]">
                        {alert.variance}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Red pill badge on right */}
                <div className="self-start md:self-center">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FEE2E2] text-[#EF4444] border border-[#FECACA]">
                    {alert.percentageBadge}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ----------------- Awarded vs Actual Cost Trend Chart ----------------- */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 md:p-6 shadow-xs">
        <h3 className="text-sm md:text-base font-semibold text-[#1E293B] mb-6">
          Awarded vs Actual Cost Trend
        </h3>

        <div className="w-full h-72">
          {isTrendLoading ? (
            <Skeleton className="w-full h-72 rounded-xl" />
          ) : trendChartData.length === 0 ? (
            <div className="w-full h-72 flex items-center justify-center text-xs text-[#94A3B8]">
              No trend data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendChartData}
                margin={{ top: 10, right: 20, left: 0, bottom: 25 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#F1F5F9"
                />
                <XAxis
                  dataKey="month"
                  axisLine={{ stroke: "#94A3B8" }}
                  tickLine={{ stroke: "#94A3B8" }}
                  tick={{ fill: "#64748B", fontSize: 11 }}
                />
                <YAxis
                  axisLine={{ stroke: "#94A3B8" }}
                  tickLine={{ stroke: "#94A3B8" }}
                  tick={{ fill: "#94A3B8", fontSize: 11 }}
                />
                <Tooltip
                  formatter={(value: unknown) => [`$${Number(value || 0).toLocaleString()}`]}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "8px",
                    border: "1px solid #E2E8F0",
                    fontSize: "12px",
                  }}
                />
                {/* Awarded Amount Line (Blue) */}
                <Line
                  type="monotone"
                  dataKey="awardedAmount"
                  name="Awarded Amount"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{
                    r: 3.5,
                    fill: "#ffffff",
                    stroke: "#3B82F6",
                    strokeWidth: 2,
                  }}
                  activeDot={{ r: 5 }}
                />
                {/* Actual Invoice Line (Red) */}
                <Line
                  type="monotone"
                  dataKey="actualInvoice"
                  name="Actual Invoice"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={{
                    r: 3.5,
                    fill: "#ffffff",
                    stroke: "#EF4444",
                    strokeWidth: 2,
                  }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-2 ml-4 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-[#3B82F6]">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-[#3B82F6] bg-white inline-block"></span>
            <span>Awarded Amount</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#EF4444]">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-[#EF4444] bg-white inline-block"></span>
            <span>Actual Invoice</span>
          </div>
        </div>
      </div>

      {/* ----------------- Top Controls (Search & Filters Above Table) ----------------- */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search Input */}
        <div className="md:col-span-6 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            value={topSearch}
            onChange={(e) => setTopSearch(e.target.value)}
            placeholder="Search by description, vendor, or invoice..."
            className="w-full pl-9.5 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs md:text-sm text-[#1E293B] placeholder-[#94A3B8] shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* All Projects Filter */}
        <div className="md:col-span-3 relative">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">
              {/* Small cube icon matching screenshot */}
              <svg
                className="w-4 h-4 stroke-current fill-none"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </span>
            <select
              value={selectedTopProject}
              onChange={(e) => setSelectedTopProject(e.target.value)}
              className="w-full appearance-none pl-9 pr-8 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs md:text-sm font-medium text-[#475569] shadow-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All Projects">All Projects</option>
              {costFilters?.projects?.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
          </div>
        </div>

        {/* All Status Filter */}
        <div className="md:col-span-3 relative">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">
              {/* Funnel/Filter icon */}
              <svg
                className="w-4 h-4 stroke-current fill-none"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
              >
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
            </span>
            <select
              value={selectedTopStatus}
              onChange={(e) => setSelectedTopStatus(e.target.value)}
              className="w-full appearance-none pl-9 pr-8 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs md:text-sm font-medium text-[#475569] shadow-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All Status">All Status</option>
              <option value="Over Budget">Over Budget</option>
              <option value="Under Budget">Under Budget</option>
              <option value="On Budget">On Budget</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ----------------- Table Container with Subheader & Filter Row ----------------- */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        {/* Sub-header inside table box */}
        <div className="p-4 md:p-5 border-b border-[#F1F5F9] flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-base md:text-lg font-bold text-[#1E293B]">
            Variance Details
          </h2>

          {/* Action filters bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Date range picker trigger button */}
            <button
              type="button"
              onClick={() => setIsCalendarOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs text-[#64748B] hover:bg-[#F8FAFC] transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span>{dateRangeStr || "dd/mm/yyyy - dd/mm/yyyy"}</span>
            </button>

            {/* Designation dropdown */}
            <div className="relative">
              <select
                value={selectedDesignation}
                onChange={(e) => setSelectedDesignation(e.target.value)}
                className="appearance-none pl-3 pr-7 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#64748B] cursor-pointer hover:bg-[#F8FAFC]"
              >
                <option value="Designation">Designation</option>
                <option value="Manager">Manager</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Coordinator">Coordinator</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8] pointer-events-none" />
            </div>

            {/* Project dropdown */}
            <div className="relative">
              <select
                value={selectedTableProject}
                onChange={(e) => setSelectedTableProject(e.target.value)}
                className="appearance-none pl-3 pr-7 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#64748B] cursor-pointer hover:bg-[#F8FAFC]"
              >
                <option value="Project">Project</option>
                <option value="SMDT Warehouse">SMDT Warehouse</option>
                <option value="Steel Unit">Steel Unit</option>
                <option value="Industrial Shed">Industrial Shed</option>
                <option value="Warehouse Expansion">Warehouse Expansion</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8] pointer-events-none" />
            </div>

            {/* Price filter dropdown */}
            <div className="relative">
              <select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="appearance-none pl-3 pr-7 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#64748B] cursor-pointer hover:bg-[#F8FAFC]"
              >
                <option value="$0.00 - $100+">$0.00 - $100+</option>
                <option value="$1,000 - $5,000">$1,000 - $5,000</option>
                <option value="$5,000 - $20,000">$5,000 - $20,000</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8] pointer-events-none" />
            </div>

            {/* Sort by dropdown */}
            <div className="relative">
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="appearance-none pl-3 pr-7 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#64748B] cursor-pointer hover:bg-[#F8FAFC]"
              >
                <option value="Sort By : Last 7 Days">
                  Sort By : Last 7 Days
                </option>
                <option value="Sort By : Highest Variance">
                  Sort By : Highest Variance
                </option>
                <option value="Sort By : Lowest Variance">
                  Sort By : Lowest Variance
                </option>
                <option value="Sort By : Newest">Sort By : Newest</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Row count & search bar inside table */}
        <div className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-[#64748B]">
          <div className="flex items-center gap-1.5">
            <span>Row Per Page</span>
            <div className="relative">
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="appearance-none bg-white border border-[#E2E8F0] rounded-md px-2 py-1 pr-6 font-semibold text-[#1E293B] cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
              <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#94A3B8] pointer-events-none" />
            </div>
            <span>Entries</span>
          </div>

          {/* Quick search input */}
          <div className="relative w-48 md:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => {
                setTableSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search"
              className="w-full pl-8 pr-3 py-1 bg-white border border-[#E2E8F0] rounded-md text-xs placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* ----------------- Table Component ----------------- */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm border-collapse">
            <thead>
              <tr className="border-y border-[#E2E8F0] bg-[#F8FAFC] text-[13px] font-semibold text-[#1E293B]">
                <th className="py-3.5 px-5">Project</th>
                <th className="py-3.5 px-5">Description</th>
                <th className="py-3.5 px-5">Vendor</th>
                <th className="py-3.5 px-5">Awarded Amount</th>
                <th className="py-3.5 px-5">Actual Invoice</th>
                <th className="py-3.5 px-5">Variance</th>
                <th className="py-3.5 px-5">Approval Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {isDetailsLoading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={`row-skel-${idx}`}>
                    <td className="py-4 px-5"><Skeleton className="h-4 w-28" /></td>
                    <td className="py-4 px-5"><Skeleton className="h-4 w-36" /></td>
                    <td className="py-4 px-5"><Skeleton className="h-4 w-32" /></td>
                    <td className="py-4 px-5"><Skeleton className="h-4 w-20" /></td>
                    <td className="py-4 px-5"><Skeleton className="h-4 w-20" /></td>
                    <td className="py-4 px-5"><Skeleton className="h-4 w-20" /></td>
                    <td className="py-4 px-5"><Skeleton className="h-6 w-24 rounded-full" /></td>
                  </tr>
                ))
              ) : paginatedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center text-xs text-[#94A3B8]"
                  >
                    No records found matching criteria
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-[#F8FAFC]/80 transition-colors"
                  >
                    {/* Project */}
                    <td className="py-4 px-5 font-semibold text-[#1E293B]">
                      {row.project}
                    </td>

                    {/* Description & DEL Code */}
                    <td className="py-4 px-5">
                      <div className="font-semibold text-[#1E293B]">
                        {row.description}
                      </div>
                      <div className="text-[11px] text-[#94A3B8] mt-0.5 font-normal">
                        {row.deliveryId}
                      </div>
                    </td>

                    {/* Vendor & Code */}
                    <td className="py-4 px-5">
                      <div className="font-medium text-[#1E293B]">
                        {row.vendor}
                      </div>
                      <div className="text-[11px] text-[#94A3B8] mt-0.5 font-normal">
                        {row.vendorCode}
                      </div>
                    </td>

                    {/* Awarded Amount */}
                    <td className="py-4 px-5 font-semibold text-[#1E293B]">
                      {row.awardedAmount}
                    </td>

                    {/* Actual Invoice */}
                    <td className="py-4 px-5 font-semibold text-[#1E293B]">
                      {row.actualInvoice}
                    </td>

                    {/* Variance */}
                    <td className="py-4 px-5 font-semibold">
                      {row.varianceType === "over" && (
                        <span className="text-[#EF4444]">{row.variance}</span>
                      )}
                      {row.varianceType === "under" && (
                        <span className="text-[#10B981]">{row.variance}</span>
                      )}
                      {row.varianceType === "exact" && (
                        <span className="text-[#64748B]">{row.variance}</span>
                      )}
                    </td>

                    {/* Approval Status Badge */}
                    <td className="py-4 px-5">
                      {row.status === "Over Budget" && (
                        <span className="inline-block px-3 py-1 rounded-md text-xs font-medium bg-[#FEE2E2] text-[#EF4444]">
                          Over Budget
                        </span>
                      )}
                      {row.status === "Under Budget" && (
                        <span className="inline-block px-3 py-1 rounded-md text-xs font-medium bg-[#DCFCE7] text-[#10B981]">
                          Under Budget
                        </span>
                      )}
                      {row.status === "On Budget" && (
                        <span className="inline-block px-3 py-1 rounded-md text-xs font-medium bg-[#EFF6FF] text-[#3B82F6]">
                          On Budget
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ----------------- Table Pagination Footer ----------------- */}
        <div className="p-4 px-5 border-t border-[#F1F5F9] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
          <div>
            Showing {startEntryIndex} to {endEntryIndex} of {totalEntries} entries
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={validCurrentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded text-[#94A3B8] hover:text-[#1E293B] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Pagination buttons: 1, 2, 3, 4 (active), ... 15 */}
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              className={`w-7 h-7 rounded-md font-medium flex items-center justify-center transition-colors ${
                validCurrentPage === 1
                  ? "bg-[#1E40AF] text-white"
                  : "text-[#64748B] hover:bg-[#F1F5F9]"
              }`}
            >
              1
            </button>

            {totalPages >= 2 && (
              <button
                type="button"
                onClick={() => setCurrentPage(2)}
                className={`w-7 h-7 rounded-md font-medium flex items-center justify-center transition-colors ${
                  validCurrentPage === 2
                    ? "bg-[#1E40AF] text-white"
                    : "text-[#64748B] hover:bg-[#F1F5F9]"
                }`}
              >
                2
              </button>
            )}

            {totalPages >= 3 && (
              <button
                type="button"
                onClick={() => setCurrentPage(3)}
                className={`w-7 h-7 rounded-md font-medium flex items-center justify-center transition-colors ${
                  validCurrentPage === 3
                    ? "bg-[#1E40AF] text-white"
                    : "text-[#64748B] hover:bg-[#F1F5F9]"
                }`}
              >
                3
              </button>
            )}

            {totalPages >= 4 && (
              <button
                type="button"
                onClick={() => setCurrentPage(4)}
                className={`w-7 h-7 rounded-md font-medium flex items-center justify-center transition-colors ${
                  validCurrentPage === 4
                    ? "bg-[#1E40AF] text-white"
                    : "text-[#64748B] hover:bg-[#F1F5F9]"
                }`}
              >
                4
              </button>
            )}

            {totalPages > 5 && (
              <span className="px-1 text-[#94A3B8]">...</span>
            )}

            {totalPages >= 5 && (
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                className={`w-7 h-7 rounded-md font-medium flex items-center justify-center transition-colors ${
                  validCurrentPage === totalPages
                    ? "bg-[#1E40AF] text-white"
                    : "text-[#64748B] hover:bg-[#F1F5F9]"
                }`}
              >
                {totalPages > 15 ? 15 : totalPages}
              </button>
            )}

            <button
              type="button"
              disabled={validCurrentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded text-[#94A3B8] hover:text-[#1E293B] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Date Range Modal */}
      {isCalendarOpen && (
        <CalendarRangePickerModal
          isOpen={isCalendarOpen}
          onClose={() => setIsCalendarOpen(false)}
          onApply={(range) => {
            if (range && range.startDate && range.endDate) {
              setDateRangeStr(`${range.startDate} - ${range.endDate}`);
            }
            setIsCalendarOpen(false);
          }}
        />
      )}
    </div>
  );
}
