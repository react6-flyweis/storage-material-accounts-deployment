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
  X,
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
import ProjectSelectorDropdownModal from "@/components/common_components/ProjectSelectorDropdownModal";
import {
  useGetCostVarianceSummaryQuery,
  useGetCostVarianceAlertsQuery,
  useGetCostVarianceTrendQuery,
  useGetCostVarianceDetailsQuery,
} from "@/redux/api/costsApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  source?: string;
}

export interface TrendChartPoint {
  month: string;
  awardedAmount: number;
  actualInvoice: number;
}

export interface VarianceDetailRow {
  id: string;
  leadId?: string;
  project: string;
  projectName?: string;
  jobId?: string | number;
  description: string;
  deliveryId: string;
  vendor: string;
  vendorCode: string;
  awardedAmount: string;
  actualInvoice: string;
  variance: string;
  variancePct?: string;
  rawAwarded: number;
  rawActual: number;
  rawVariance: number;
  varianceType: "over" | "under" | "exact";
  status: "Over Budget" | "Under Budget" | "On Budget" | string;
  source?: string;
  // breakdown?: CostVarianceBreakdown;
}

export default function CostVariancePage() {
  // --- Unified Filter States ---
  // 1. Single unified search input (project name / job id / description / vendor)
  const [search, setSearch] = useState("");

  // 2. Unified project selector (standard component across project)
  const [selectedProjectLabel, setSelectedProjectLabel] =
    useState("All Projects");
  const [selectedLeadId, setSelectedLeadId] = useState("");

  // 3. Status filter state (Over Budget, Under Budget, On Budget)
  const [selectedStatus, setSelectedStatus] = useState("All Status");

  // 4. Date range filter states
  const [dateRangeStr, setDateRangeStr] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  /*
   * Filters connected to backend API:
   * 1. Search (search) -> /api/account/costs/variance/details?search=...
   * 2. Project (leadId / project) -> /api/account/costs/variance/details?leadId=...
   * 3. Status (status) -> /api/account/costs/variance/details?status=...
   * 4. Date Range (startDate, endDate) -> /api/account/costs/variance/details?startDate=...&endDate=...
   *
   * Disconnected filters (Designation, Price Range, Sort By) are hidden.
   */

  // Pagination
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Export dropdown
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Query parameters connected to API
  const queryParams = useMemo(
    () => ({
      search: search.trim() || undefined,
      leadId: selectedLeadId || undefined,
      projectId: selectedLeadId || undefined,
      project:
        selectedProjectLabel !== "All Projects"
          ? selectedProjectLabel
          : undefined,
      status: selectedStatus !== "All Status" ? selectedStatus : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      view: "project", // Default view: whole project planned budget vs whole project expense
    }),
    [
      search,
      selectedLeadId,
      selectedProjectLabel,
      selectedStatus,
      startDate,
      endDate,
    ],
  );

  // RTK Query endpoints
  const { data: summaryData, isLoading: isSummaryLoading } =
    useGetCostVarianceSummaryQuery(queryParams);
  const { data: alertsData, isLoading: isAlertsLoading } =
    useGetCostVarianceAlertsQuery(queryParams);
  const { data: trendData, isLoading: isTrendLoading } =
    useGetCostVarianceTrendQuery(queryParams);
  const { data: detailsData, isLoading: isDetailsLoading } =
    useGetCostVarianceDetailsQuery(queryParams);

  // Normalized live records
  const varianceRows: VarianceDetailRow[] = useMemo(() => {
    const rawRows = Array.isArray(detailsData?.rows)
      ? detailsData.rows
      : Array.isArray(detailsData)
        ? detailsData
        : [];

    return rawRows.map((row, idx) => {
      // Awarded Amount or Planned Budget
      const rawAwarded =
        row.plannedBudget != null
          ? Number(row.plannedBudget)
          : row.awardedAmount != null
            ? Number(row.awardedAmount)
            : 0;

      // Actual Invoice or Actual Expense
      const rawActual =
        row.actualExpense != null
          ? Number(row.actualExpense)
          : row.actualInvoice != null
            ? Number(row.actualInvoice)
            : 0;

      // Variance
      const rawVariance =
        typeof row.variance === "number"
          ? row.variance
          : row.variance != null
            ? Number(row.variance)
            : rawActual - rawAwarded;

      // Variance percentage
      let rawPct: number | null = null;
      if (row.variancePct != null) {
        rawPct = Number(row.variancePct);
      } else if (rawAwarded > 0) {
        rawPct = Number(((rawVariance / rawAwarded) * 100).toFixed(1));
      }

      // Status
      const approvalStatus =
        row.approvalStatus ||
        row.status ||
        (rawVariance > 0
          ? "Over Budget"
          : rawVariance < 0
            ? "Under Budget"
            : "On Budget");

      const varianceType: "over" | "under" | "exact" =
        row.varianceType ||
        (approvalStatus === "Over Budget" || rawVariance > 0
          ? "over"
          : approvalStatus === "Under Budget" || rawVariance < 0
            ? "under"
            : "exact");

      return {
        id: row._id || row.id || `row-${idx}`,
        leadId: row.leadId,
        project: row.projectName || row.project || "General",
        projectName: row.projectName || row.project,
        jobId: row.jobId,
        description:
          row.description ||
          (row.source === "project_budget"
            ? "Total project budget vs total expense"
            : "-"),
        deliveryId: row.deliveryId || "-",
        vendor: row.vendor || "",
        vendorCode: row.vendorCode || "-",
        awardedAmount: `$${rawAwarded.toLocaleString()}`,
        actualInvoice: `$${rawActual.toLocaleString()}`,
        variance:
          rawVariance > 0
            ? `+$${rawVariance.toLocaleString()}`
            : rawVariance < 0
              ? `-$${Math.abs(rawVariance).toLocaleString()}`
              : "$0",
        variancePct:
          rawPct != null ? `${rawPct > 0 ? "+" : ""}${rawPct}%` : undefined,
        rawAwarded,
        rawActual,
        rawVariance,
        varianceType,
        status: approvalStatus,
        source: row.source,
        breakdown: row.breakdown,
      };
    });
  }, [detailsData]);

  // High Variance Alerts (project budget vs expense ±5% variance)
  const highVarianceAlerts = useMemo(() => {
    const rawList = Array.isArray(alertsData)
      ? alertsData
      : Array.isArray((alertsData as unknown as { alerts?: unknown[] })?.alerts)
        ? (alertsData as unknown as { alerts: unknown[] }).alerts
        : Array.isArray((alertsData as unknown as { rows?: unknown[] })?.rows)
          ? (alertsData as unknown as { rows: unknown[] }).rows
          : Array.isArray((alertsData as unknown as { data?: unknown[] })?.data)
            ? (alertsData as unknown as { data: unknown[] }).data
            : [];

    return rawList.map((a: any, idx: number) => {
      const awarded =
        a.plannedBudget != null
          ? Number(a.plannedBudget)
          : a.awarded != null
            ? Number(a.awarded)
            : 0;
      const actual =
        a.actualExpense != null
          ? Number(a.actualExpense)
          : a.actual != null
            ? Number(a.actual)
            : 0;
      const rawVariance =
        typeof a.variance === "number"
          ? a.variance
          : a.variance != null
            ? Number(a.variance)
            : actual - awarded;

      let pct = a.percentageBadge;
      if (!pct) {
        if (a.variancePct != null) {
          const num = Number(a.variancePct);
          pct = `${num > 0 ? "+" : ""}${num}%`;
        } else if (awarded > 0) {
          const num = ((rawVariance / awarded) * 100).toFixed(1);
          pct = `${Number(num) > 0 ? "+" : ""}${num}%`;
        } else {
          pct = "+0%";
        }
      }

      return {
        id: a._id || a.id || `alert-${idx}`,
        title: a.title || a.projectName || a.project || "Budget Variance Alert",
        subtitle:
          a.subtitle ||
          (a.jobId ? `Job #${a.jobId} • ` : "") +
            (a.projectName || a.description || "Project budget vs expense"),
        awarded: `$${awarded.toLocaleString()}`,
        actual: `$${actual.toLocaleString()}`,
        variance:
          rawVariance > 0
            ? `+$${rawVariance.toLocaleString()}`
            : `$${rawVariance.toLocaleString()}`,
        percentageBadge: pct,
        source: a.source,
      };
    });
  }, [alertsData]);

  const trendChartData: TrendChartPoint[] = useMemo(() => {
    const rawList = Array.isArray(trendData)
      ? trendData
      : Array.isArray((trendData as unknown as { points?: unknown[] })?.points)
        ? (trendData as unknown as { points: unknown[] }).points
        : Array.isArray((trendData as unknown as { trend?: unknown[] })?.trend)
          ? (trendData as unknown as { trend: unknown[] }).trend
          : Array.isArray((trendData as unknown as { rows?: unknown[] })?.rows)
            ? (trendData as unknown as { rows: unknown[] }).rows
            : [];

    return rawList.map((pt: any) => ({
      month: pt.month || pt.label || "",
      awardedAmount: Number(pt.awardedAmount) || 0,
      actualInvoice: Number(pt.actualInvoice) || 0,
    }));
  }, [trendData]);

  // Filtered rows (client-side matching and sorting for instant reactivity)
  const filteredRows = useMemo(() => {
    let rows = varianceRows.filter((row) => {
      // Unified search filter (project name, jobId, description, vendor, deliveryId)
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          row.description.toLowerCase().includes(q) ||
          row.vendor.toLowerCase().includes(q) ||
          row.deliveryId.toLowerCase().includes(q) ||
          row.project.toLowerCase().includes(q) ||
          (row.jobId && String(row.jobId).toLowerCase().includes(q)) ||
          row.vendorCode.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Project filter
      if (selectedProjectLabel !== "All Projects") {
        if (
          row.project.toLowerCase() !== selectedProjectLabel.toLowerCase() &&
          !row.project
            .toLowerCase()
            .includes(selectedProjectLabel.toLowerCase())
        ) {
          return false;
        }
      }

      // Status filter (uses approvalStatus text)
      if (selectedStatus !== "All Status") {
        const matchesStatus =
          row.status.toLowerCase().includes(selectedStatus.toLowerCase()) ||
          selectedStatus.toLowerCase().includes(row.status.toLowerCase());
        if (!matchesStatus) return false;
      }

      return true;
    });

    return rows;
  }, [varianceRows, search, selectedProjectLabel, selectedStatus]);

  const totalEntries = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / rowsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedRows = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * rowsPerPage;
    return filteredRows.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredRows, validCurrentPage, rowsPerPage]);

  const startEntryIndex =
    totalEntries === 0 ? 0 : (validCurrentPage - 1) * rowsPerPage + 1;
  const endEntryIndex = Math.min(validCurrentPage * rowsPerPage, totalEntries);

  const handleExport = (type: "csv" | "excel" | "pdf") => {
    setIsExportOpen(false);
    if (type === "csv" || type === "excel") {
      const headers =
        "Project,Job ID,Description,Vendor,Awarded Amount,Actual Invoice,Variance,Status\n";
      const rows = filteredRows
        .map(
          (r) =>
            `"${r.project}","${r.jobId || ""}","${r.description}","${r.vendor || ""}","${r.awardedAmount}","${r.actualInvoice}","${r.variance}","${r.status}"`,
        )
        .join("\n");
      const blob = new Blob([headers + rows], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Cost_Variance_Report_${new Date().toISOString().slice(0, 10)}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className=" space-y-6 font-sans antialiased">
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
              Track awarded amounts vs actual invoices and identify cost
              discrepancies
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
              <div
                className={`text-2xl font-bold tracking-tight ${
                  Number(summaryData?.netVariance ?? 0) < 0
                    ? "text-[#10B981]"
                    : Number(summaryData?.netVariance ?? 0) > 0
                      ? "text-[#EF4444]"
                      : "text-[#3B82F6]"
                }`}
              >
                {summaryData?.netVariance != null
                  ? `$${Number(summaryData.netVariance).toLocaleString()}`
                  : "$0"}
              </div>
            )}
            <p className="text-[11px] text-[#94A3B8] font-normal truncate">
              {summaryData?.totalPlannedBudget != null &&
              summaryData?.totalActualExpense != null
                ? `Budget: $${Number(summaryData.totalPlannedBudget).toLocaleString()} · Spent: $${Number(summaryData.totalActualExpense).toLocaleString()}`
                : summaryData?.netVarianceSub || "Overall variance"}
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
            <p className="text-[11px] text-[#3B82F6] font-medium truncate">
              {summaryData?.projectCount != null
                ? `${summaryData.projectCount} budgeted projects${summaryData.noBudget ? ` (${summaryData.noBudget} no budget)` : ""}`
                : summaryData?.onBudgetSub || "Exact match"}
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
                  <Badge className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FEE2E2] text-[#EF4444] border border-[#FECACA] hover:bg-[#FEE2E2]">
                    {alert.percentageBadge}
                  </Badge>
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
                  formatter={(value: unknown) => [
                    `$${Number(value || 0).toLocaleString()}`,
                  ]}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Unified Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
          <Input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by description, vendor, delivery ID, or project..."
            className="w-full pl-9.5 pr-4 py-2.5 h-10 bg-white border border-[#E2E8F0] rounded-xl text-xs md:text-sm text-[#1E293B] placeholder-[#94A3B8] shadow-xs focus-visible:ring-1 focus-visible:ring-blue-500"
          />
        </div>

        {/* Unified Project Selector */}
        <div>
          <ProjectSelectorDropdownModal
            trigger={
              <Button
                type="button"
                variant="outline"
                className="w-full h-10 px-3 bg-white border border-[#E2E8F0] rounded-xl text-xs md:text-sm font-medium text-[#475569] hover:bg-[#F8FAFC] shadow-xs cursor-pointer flex items-center justify-between gap-2"
              >
                <span className="truncate">{selectedProjectLabel}</span>
                <ChevronDown className="w-4 h-4 text-[#94A3B8] shrink-0" />
              </Button>
            }
            selectedProject={selectedProjectLabel}
            selectedProjectId={selectedLeadId}
            onSelectProject={(label, leadId) => {
              setSelectedProjectLabel(label);
              setSelectedLeadId(leadId || "");
              setCurrentPage(1);
            }}
            align="start"
          />
        </div>

        {/* Status Filter */}
        <div>
          <Select
            value={selectedStatus}
            onValueChange={(val) => {
              setSelectedStatus(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full h-10 bg-white border border-[#E2E8F0] rounded-xl text-xs md:text-sm font-medium text-[#475569] shadow-xs">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Status">All Status</SelectItem>
              <SelectItem value="Over Budget">Over Budget</SelectItem>
              <SelectItem value="Under Budget">Under Budget</SelectItem>
              <SelectItem value="On Budget">On Budget</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filter */}
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            className={`w-full h-10 px-3 bg-white border rounded-xl text-xs md:text-sm font-medium cursor-pointer shadow-xs transition-colors flex items-center justify-between gap-2 ${
              dateRangeStr
                ? "border-blue-500 text-blue-600 bg-blue-50/30"
                : "border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC]"
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Calendar className="w-4 h-4 text-[#94A3B8] shrink-0" />
              <span className="truncate">
                {dateRangeStr || "Select Date Range"}
              </span>
            </div>
            {dateRangeStr ? (
              <span
                role="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDateRangeStr("");
                  setStartDate("");
                  setEndDate("");
                  setCurrentPage(1);
                }}
                className="p-0.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </span>
            ) : (
              <ChevronDown className="w-4 h-4 text-[#94A3B8] shrink-0" />
            )}
          </Button>

          {isCalendarOpen && (
            <CalendarRangePickerModal
              isOpen={isCalendarOpen}
              onClose={() => setIsCalendarOpen(false)}
              initialStartDate={startDate || undefined}
              initialEndDate={endDate || undefined}
              onApply={(range) => {
                if (range && range.startDate && range.endDate) {
                  setStartDate(range.startDate);
                  setEndDate(range.endDate);
                  setDateRangeStr(`${range.startDate} - ${range.endDate}`);
                  setCurrentPage(1);
                } else if (range?.from && range?.to) {
                  const fromStr = range.from.toISOString().slice(0, 10);
                  const toStr = range.to.toISOString().slice(0, 10);
                  setStartDate(fromStr);
                  setEndDate(toStr);
                  setDateRangeStr(`${fromStr} - ${toStr}`);
                  setCurrentPage(1);
                }
                setIsCalendarOpen(false);
              }}
              onSelectRange={(rangeStr) => {
                if (rangeStr) {
                  setDateRangeStr(rangeStr);
                }
              }}
              align="right"
            />
          )}
        </div>
      </div>

      {/* ----------------- Table Container with Subheader & Filter Row ----------------- */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        {/* Sub-header inside table box */}
        <div className="p-4 md:p-5 border-b border-[#F1F5F9] flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-base md:text-lg font-bold text-[#1E293B]">
            Variance Details
          </h2>
        </div>

        {/* Row count inside table */}
        <div className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-[#64748B]">
          <div className="flex items-center gap-1.5">
            <span>Row Per Page</span>
            <Select
              value={String(rowsPerPage)}
              onValueChange={(val) => {
                setRowsPerPage(Number(val));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-7 w-16 bg-white border border-[#E2E8F0] rounded-md px-2 py-1 font-semibold text-[#1E293B]">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span>Entries</span>
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
                    <td className="py-4 px-5">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="py-4 px-5">
                      <Skeleton className="h-4 w-36" />
                    </td>
                    <td className="py-4 px-5">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="py-4 px-5">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="py-4 px-5">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="py-4 px-5">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="py-4 px-5">
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </td>
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
                    {/* Project / Project Name / Job ID */}
                    <td className="py-4 px-5">
                      <div className="font-semibold text-[#1E293B]">
                        {row.project}
                      </div>
                      {row.jobId && (
                        <div className="text-[11px] text-[#64748B] mt-0.5 font-normal">
                          Job #{row.jobId}
                        </div>
                      )}
                    </td>

                    {/* Description & DEL Code */}
                    <td className="py-4 px-5">
                      <div className="font-semibold text-[#1E293B]">
                        {row.description}
                      </div>
                      {row.deliveryId && row.deliveryId !== "-" && (
                        <div className="text-[11px] text-[#94A3B8] mt-0.5 font-normal">
                          DEL: {row.deliveryId}
                        </div>
                      )}
                    </td>

                    {/* Vendor (optional; often empty on project rows) */}
                    <td className="py-4 px-5">
                      {row.vendor ? (
                        <div>
                          <div className="font-medium text-[#1E293B]">
                            {row.vendor}
                          </div>
                          {row.vendorCode && row.vendorCode !== "-" && (
                            <div className="text-[11px] text-[#94A3B8] mt-0.5 font-normal">
                              {row.vendorCode}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 font-normal">—</span>
                      )}
                    </td>

                    {/* Awarded Amount or Planned Budget */}
                    <td className="py-4 px-5 font-semibold text-[#1E293B]">
                      {row.awardedAmount}
                    </td>

                    {/* Actual Invoice or Actual Expense */}
                    <td className="py-4 px-5 font-semibold text-[#1E293B]">
                      {row.actualInvoice}
                    </td>

                    {/* Variance and Variance Percentage */}
                    <td className="py-4 px-5 font-semibold">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {row.varianceType === "over" && (
                          <span className="text-[#EF4444]">{row.variance}</span>
                        )}
                        {row.varianceType === "under" && (
                          <span className="text-[#10B981]">{row.variance}</span>
                        )}
                        {row.varianceType === "exact" && (
                          <span className="text-[#64748B]">{row.variance}</span>
                        )}
                        {row.variancePct && (
                          <span
                            className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${
                              row.varianceType === "over"
                                ? "bg-red-50 text-red-600"
                                : row.varianceType === "under"
                                  ? "bg-green-50 text-green-700"
                                  : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {row.variancePct}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Approval Status Badge */}
                    <td className="py-4 px-5">
                      {row.status === "Over Budget" && (
                        <Badge className="bg-[#FEE2E2] text-[#EF4444] border-transparent font-medium text-xs hover:bg-[#FEE2E2] rounded-md px-2.5 py-0.5">
                          Over Budget
                        </Badge>
                      )}
                      {row.status === "Under Budget" && (
                        <Badge className="bg-[#DCFCE7] text-[#10B981] border-transparent font-medium text-xs hover:bg-[#DCFCE7] rounded-md px-2.5 py-0.5">
                          Under Budget
                        </Badge>
                      )}
                      {row.status === "On Budget" && (
                        <Badge className="bg-[#EFF6FF] text-[#3B82F6] border-transparent font-medium text-xs hover:bg-[#EFF6FF] rounded-md px-2.5 py-0.5">
                          On Budget
                        </Badge>
                      )}
                      {row.status !== "Over Budget" &&
                        row.status !== "Under Budget" &&
                        row.status !== "On Budget" && (
                          <Badge className="bg-slate-100 text-slate-700 border-transparent font-medium text-xs rounded-md px-2.5 py-0.5">
                            {row.status}
                          </Badge>
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
            Showing {startEntryIndex} to {endEntryIndex} of {totalEntries}{" "}
            entries
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

            {/* Pagination buttons */}
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

            {totalPages > 5 && <span className="px-1 text-[#94A3B8]">...</span>}

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
    </div>
  );
}
