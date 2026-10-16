import React, { useState, useMemo } from "react";
import {
  Home,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar,
  Eye,
  Info,
  DollarSign,
  Truck,
  Box,
  AlertCircle,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import CalendarRangePickerModal from "@/components/common_components/CalendarRangePickerModal";
import SuccessModal from "@/components/common_components/SuccessModal";
import FreightDetailModal from "@/components/cost/FreightDetailModal";
import type {
  CarrierCostItem,
  MonthlyFreightTrendItem,
  CarrierDistributionItem,
  FreightDeliveryRecord,
} from "@/components/cost/freightCostData";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetFreightSummaryQuery,
  useGetFreightTrendQuery,
  useGetFreightCarrierDistributionQuery,
  useGetFreightRecordsQuery,
  useGetCostFiltersQuery,
} from "@/redux/api/costsApi";

export const FreightCostPage: React.FC = () => {
  // Table filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRangeText, setDateRangeText] = useState("dd/mm/yyyy - dd/mm/yyyy");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState("All");
  const [selectedProject, setSelectedProject] = useState("All");
  const [selectedAmountRange, setSelectedAmountRange] = useState("All");
  const [selectedSortBy, setSelectedSortBy] = useState("Last 7 Days");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Detail Modal & Success Modal states
  const [selectedRecord, setSelectedRecord] = useState<FreightDeliveryRecord | null>(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [successDialogConfig, setSuccessDialogConfig] = useState<{
    isOpen: boolean;
    title: string;
    message?: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  const { data: filtersData } = useGetCostFiltersQuery();
  const { data: summaryData, isLoading: isSummaryLoading } = useGetFreightSummaryQuery();
  const { data: trendDataApi, isLoading: isTrendLoading } = useGetFreightTrendQuery();
  const { data: carrierDistApi, isLoading: isDistributionLoading } = useGetFreightCarrierDistributionQuery();
  const { data: recordsApi, isLoading: isRecordsLoading } = useGetFreightRecordsQuery({
    page: currentPage,
    limit: rowsPerPage,
    search: searchTerm,
    project: selectedProject !== "All" ? selectedProject : undefined,
  });

  const kpiData = {
    totalFreightCost: summaryData?.totalFreightCost !== undefined ? `$${Number(summaryData.totalFreightCost).toLocaleString()}` : "$0",
    totalFreightCostSubtitle: "Yearly Total",
    activeCarriers: summaryData?.activeCarriers !== undefined ? summaryData.activeCarriers : 0,
    activeCarriersSubtitle: "Contracted Carriers",
    avgCostPerDelivery: summaryData?.avgCostPerDelivery !== undefined ? `$${Number(summaryData.avgCostPerDelivery).toLocaleString()}` : "$0",
    avgCostPerDeliverySubtitle: "This Month",
    pendingInvoices: summaryData?.pendingInvoices !== undefined ? summaryData.pendingInvoices : 0,
    pendingInvoicesSubtitle: "Awaiting Payment",
  };

  const trendData: MonthlyFreightTrendItem[] = useMemo(() => {
    return (trendDataApi || []).map((t) => ({
      month: t.month,
      cost: t.cost,
      deliveries: t.deliveries ?? 0,
    }));
  }, [trendDataApi]);
  const distributionData: CarrierDistributionItem[] = carrierDistApi || [];

  const carrierAnalysisData = useMemo<CarrierCostItem[]>(() => {
    if (carrierDistApi && carrierDistApi.length > 0) {
      const totalAmount = carrierDistApi.reduce((sum, c) => sum + (c.amount || 0), 0) || 1;
      return carrierDistApi.map((c, i) => ({
        id: `carrier-${i}`,
        name: c.carrier,
        ytdTotal: "YTD Total",
        totalCost: c.amount,
        totalCostFormatted: `$${Number(c.amount).toLocaleString()}`,
        percentageOfTotal: `${Math.round((c.amount / totalAmount) * 100)}%`,
      }));
    }
    return [];
  }, [carrierDistApi]);

  const [localStatusOverrides, setLocalStatusOverrides] = useState<
    Record<string, "Approved" | "Pending" | "Rejected">
  >({});

  const effectiveDeliveryRecords: FreightDeliveryRecord[] = useMemo(() => {
    if (recordsApi?.rows && recordsApi.rows.length > 0) {
      return recordsApi.rows.map((r, i) => {
        const id = r.id || r._id || `freight-${i}`;
        const amount = Number(r.amount ?? r.cost) || 0;
        const rawStatus = r.approvalStatus || r.status || "Pending";
        const status: "Approved" | "Pending" | "Rejected" =
          rawStatus === "Approved"
            ? "Approved"
            : rawStatus === "Rejected"
            ? "Rejected"
            : "Pending";
        return {
          id,
          freightId: r.freightId || (r.deliveryId ? `FRT-${r.deliveryId}` : `FRT-${1000 + i}`),
          project: r.projectName || r.project || "-",
          deliveryCompany: r.carrierName || r.deliveryCompany || "-",
          deliveryId: r.deliveryId || "-",
          date: r.date || "-",
          cost: amount,
          costFormatted: r.costFormatted || `$${amount.toLocaleString()}`,
          approvalStatus: status,
          awardedCarrier: r.carrierName || r.deliveryCompany,
          statusText: rawStatus,
        };
      });
    }
    return [];
  }, [recordsApi]);

  const displayRows: FreightDeliveryRecord[] = useMemo(() => {
    return effectiveDeliveryRecords.map((r) => {
      const override = localStatusOverrides[r.id];
      return override ? { ...r, approvalStatus: override } : r;
    });
  }, [effectiveDeliveryRecords, localStatusOverrides]);

  const handleExport = (type: string) => {
    setIsExportMenuOpen(false);
    if (type === "csv") {
      const headers = "Freight ID,Project,Delivery Company,Delivery ID,Date,Cost,Approval Status\n";
      const rows = displayRows
        .map(
          (c) =>
            `"${c.freightId}","${c.project}","${c.deliveryCompany}","${c.deliveryId}","${c.date}","${c.costFormatted}","${c.approvalStatus}"`,
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
        `Freight_Delivery_Cost_${new Date().toISOString().slice(0, 10)}.csv`,
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

  // Modal actions
  const handleApprove = (record: FreightDeliveryRecord) => {
    setLocalStatusOverrides((prev) => ({ ...prev, [record.id]: "Approved" }));
    setSelectedRecord(null);
    setSuccessDialogConfig({
      isOpen: true,
      title: "Freight Cost Approved",
      message: `Invoice for ${record.freightId} (${record.deliveryCompany}) has been approved successfully.`,
    });
  };

  const handleReject = (record: FreightDeliveryRecord) => {
    setLocalStatusOverrides((prev) => ({ ...prev, [record.id]: "Rejected" }));
    setSelectedRecord(null);
    setSuccessDialogConfig({
      isOpen: true,
      title: "Freight Cost Rejected",
      message: `Invoice for ${record.freightId} has been rejected.`,
    });
  };

  const handleMarkPaid = (record: FreightDeliveryRecord) => {
    setSelectedRecord(null);
    setSuccessDialogConfig({
      isOpen: true,
      title: "Invoice Marked as Paid",
      message: `Invoice for ${record.deliveryCompany} (${record.costFormatted}) marked as paid successfully.`,
    });
  };

  const handleDownloadInvoice = (record: FreightDeliveryRecord) => {
    setSuccessDialogConfig({
      isOpen: true,
      title: "Downloading Invoice",
      message: `Invoice ${record.invoiceNumber || "INV-45892"} is downloading.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Freight Cost
          </h1>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 font-normal mt-1">
            <Home className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              Monitor and track freight costs across all projects and deliveries
            </span>
          </div>
        </div>

        {/* Export Button */}
        <div className="relative self-start sm:self-auto">
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
      </div>

      {/* 2. Top 4 Solid Color KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {/* Card 1: Total Freight Cost (Blue) */}
        <div className="bg-[#2E5BFF] text-white rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs sm:text-sm font-medium text-blue-100">
              Total Freight Cost
            </span>
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
              <DollarSign className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-4">
            {isSummaryLoading ? (
              <Skeleton className="h-8 w-28 bg-white/30 rounded" />
            ) : (
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {kpiData.totalFreightCost}
              </div>
            )}
            <p className="text-xs text-blue-100 font-medium mt-2">
              {kpiData.totalFreightCostSubtitle}
            </p>
          </div>
        </div>

        {/* Card 2: Active Carriers (Green) */}
        <div className="bg-[#22C55E] text-white rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs sm:text-sm font-medium text-emerald-100">
              Active Carriers
            </span>
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
              <Truck className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-4">
            {isSummaryLoading ? (
              <Skeleton className="h-8 w-16 bg-white/30 rounded" />
            ) : (
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {kpiData.activeCarriers}
              </div>
            )}
            <p className="text-xs text-emerald-100 font-medium mt-2">
              {kpiData.activeCarriersSubtitle}
            </p>
          </div>
        </div>

        {/* Card 3: Avg Cost/Delivery (Orange) */}
        <div className="bg-[#F97316] text-white rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs sm:text-sm font-medium text-orange-100">
              Avg Cost/Delivery
            </span>
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
              <Box className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-4">
            {isSummaryLoading ? (
              <Skeleton className="h-8 w-24 bg-white/30 rounded" />
            ) : (
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {kpiData.avgCostPerDelivery}
              </div>
            )}
            <p className="text-xs text-orange-100 font-medium mt-2">
              {kpiData.avgCostPerDeliverySubtitle}
            </p>
          </div>
        </div>

        {/* Card 4: Pending Invoices (Gold/Yellow) */}
        <div className="bg-[#D97706] text-white rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs sm:text-sm font-medium text-amber-100">
              Pending Invoices
            </span>
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
              <AlertCircle className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-4">
            {isSummaryLoading ? (
              <Skeleton className="h-8 w-16 bg-white/30 rounded" />
            ) : (
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {kpiData.pendingInvoices}
              </div>
            )}
            <p className="text-xs text-amber-100 font-medium mt-2">
              {kpiData.pendingInvoicesSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Two Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Monthly Freight Cost Trend */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Monthly Freight Cost Trend
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cost and delivery volume over time
            </p>
          </div>

          <div className="h-72 w-full mt-6">
            {isTrendLoading ? (
              <div className="h-full w-full flex items-center justify-center">
                <Skeleton className="h-64 w-full rounded-xl" />
              </div>
            ) : trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendData}
                  margin={{ top: 20, right: 20, left: 0, bottom: 25 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#F1F5F9"
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={{ stroke: "#E2E8F0" }}
                    tickLine={false}
                    tick={{ fill: "#64748B", fontSize: 11 }}
                    dy={8}
                  />
                  <YAxis
                    yAxisId="cost"
                    domain={[0, 80000]}
                    ticks={[0, 20000, 40000, 60000, 80000]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748B", fontSize: 11 }}
                  />
                  <YAxis yAxisId="deliveries" domain={[0, 40]} hide />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 text-white rounded-lg p-2.5 text-xs shadow-xl border border-slate-800 space-y-1">
                            <p className="font-semibold text-slate-300">
                              {label}
                            </p>
                            <p className="text-[#3B82F6]">
                              Freight Cost: ${payload[0]?.value?.toLocaleString()}
                            </p>
                            <p className="text-[#22C55E]">
                              Deliveries: {payload[1]?.value}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    yAxisId="cost"
                    type="monotone"
                    dataKey="cost"
                    stroke="#2E5BFF"
                    strokeWidth={2.5}
                    dot={{ r: 5, fill: "#2E5BFF", strokeWidth: 0 }}
                    activeDot={{ r: 7 }}
                  />
                  <Line
                    yAxisId="deliveries"
                    type="monotone"
                    dataKey="deliveries"
                    stroke="#22C55E"
                    strokeWidth={2.5}
                    dot={{ r: 5, fill: "#22C55E", strokeWidth: 0 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No monthly trend data recorded.
              </div>
            )}
          </div>

          {/* Custom Legend underneath chart matching image */}
          <div className="flex items-center justify-center gap-6 mt-2 text-xs font-medium">
            <div className="flex items-center gap-1.5 text-[#2E5BFF]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2E5BFF]" />
              <span>Freight Cost ($)</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#22C55E]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
              <span>Deliveries</span>
            </div>
          </div>
        </div>

        {/* Right: Cost Distribution by Carrier */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Cost Distribution by Carrier
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Breakdown of freight costs by carrier
            </p>
          </div>

          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={distributionData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 35, bottom: 15 }}
                barSize={32}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#F1F5F9"
                />
                <XAxis
                  type="number"
                  domain={[0, 140000]}
                  ticks={[0, 35000, 70000, 105000, 140000]}
                  axisLine={{ stroke: "#E2E8F0" }}
                  tickLine={false}
                  tick={{ fill: "#64748B", fontSize: 11 }}
                  dy={6}
                />
                <YAxis
                  type="category"
                  dataKey="carrier"
                  axisLine={{ stroke: "#E2E8F0" }}
                  tickLine={false}
                  tick={{ fill: "#334155", fontSize: 11, fontWeight: 500 }}
                  width={110}
                />
                <Tooltip
                  formatter={(val) => [
                    `$${Number(val || 0).toLocaleString()}`,
                    "Freight Cost",
                  ]}
                  cursor={{ fill: "transparent" }}
                />
                <Bar
                  dataKey="amount"
                  radius={[0, 8, 8, 0]}
                  fill="#3B82F6"
                  shape={(props: unknown) => {
                    const { x, y, width, height, index } = props as {
                      x: number;
                      y: number;
                      width: number;
                      height: number;
                      index: number;
                    };
                    const shades = [
                      "#2E5BFF",
                      "#5B84F6",
                      "#8AA6E8",
                      "#C3D1F2",
                    ];
                    const fill = shades[index % shades.length];
                    return (
                      <path
                        d={`M${x},${y} h${Math.max(0, width - 8)} q8,0 8,8 v${
                          height - 16
                        } q0,8 -8,8 h-${Math.max(0, width - 8)} z`}
                        fill={fill}
                      />
                    );
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Carrier Cost Analysis Cards */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-5">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Carrier Cost Analysis
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Detailed breakdown by carrier partner
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isDistributionLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={`carrier-skel-${i}`} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="pt-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-3 w-28 mt-1.5" />
                </div>
              </div>
            ))
          ) : carrierAnalysisData.length > 0 ? (
            carrierAnalysisData.map((carrier) => (
              <div
                key={carrier.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-sm transition-shadow flex flex-col justify-between"
              >
              {/* Carrier Header with Blue Icon */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <Truck className="w-5 h-5 stroke-2" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {carrier.name}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {carrier.ytdTotal}
                  </span>
                </div>
              </div>

              {/* Stats: Total Cost & % of Total */}
              <div className="mt-5 space-y-3 pt-4 border-t border-slate-100/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    Total Cost
                  </span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    {carrier.totalCostFormatted}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    % of Total
                  </span>
                  <span className="font-extrabold text-[#2E5BFF] text-base">
                    {carrier.percentageOfTotal}
                  </span>
                </div>
              </div>
            </div>
          ))) : null}
        </div>
      </div>

      {/* 5. Table Section: Freight + Delivery Cost */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        {/* Table Header Filter Bar */}
        <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Freight + Delivery Cost
          </h2>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Date Range Picker */}
            <button
              type="button"
              onClick={() => setIsDatePickerOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{dateRangeText}</span>
            </button>

            {/* Designation Dropdown */}
            <div className="relative">
              <select
                value={selectedDesignation}
                onChange={(e) => {
                  setSelectedDesignation(e.target.value);
                  if (currentPage !== 1) setCurrentPage(1);
                }}
                className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-[#1D51A4]"
              >
                <option value="All">Designation</option>
                <option value="Manager">Manager</option>
                <option value="Logistics">Logistics</option>
                <option value="Operations">Operations</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Project Dropdown */}
            <div className="relative">
              <select
                value={selectedProject}
                onChange={(e) => {
                  setSelectedProject(e.target.value);
                  if (currentPage !== 1) setCurrentPage(1);
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
                value={selectedAmountRange}
                onChange={(e) => setSelectedAmountRange(e.target.value)}
                className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-[#1D51A4]"
              >
                <option value="All">$0.00 - $00</option>
                <option value="under2k">$0 - $2,000</option>
                <option value="2k-5k">$2,000 - $5,000</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort By Dropdown */}
            <div className="relative">
              <select
                value={selectedSortBy}
                onChange={(e) => setSelectedSortBy(e.target.value)}
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
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
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
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search"
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1D51A4] transition-colors"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-y border-slate-100 text-xs font-semibold text-slate-700">
                <th
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="py-3 px-5 cursor-pointer hover:text-slate-900 select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Freight ID</span>
                    <span className="text-[10px] text-slate-400">▾</span>
                  </div>
                </th>
                <th className="py-3 px-5 whitespace-nowrap">Project</th>
                <th className="py-3 px-5 whitespace-nowrap">Delivery Company</th>
                <th className="py-3 px-5 whitespace-nowrap">Delivery ID</th>
                <th
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="py-3 px-5 cursor-pointer hover:text-slate-900 select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    <span className="text-[10px] text-slate-400">▾</span>
                  </div>
                </th>
                <th className="py-3 px-5 whitespace-nowrap">Cost</th>
                <th className="py-3 px-5 whitespace-nowrap">Approval Status</th>
                <th className="py-3 px-5 whitespace-nowrap text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-[13px]">
              {isRecordsLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`freight-skel-${i}`}>
                    <td className="py-3.5 px-5"><Skeleton className="h-4 w-20" /></td>
                    <td className="py-3.5 px-5"><Skeleton className="h-4 w-28" /></td>
                    <td className="py-3.5 px-5"><Skeleton className="h-4 w-32" /></td>
                    <td className="py-3.5 px-5"><Skeleton className="h-4 w-20" /></td>
                    <td className="py-3.5 px-5"><Skeleton className="h-4 w-24" /></td>
                    <td className="py-3.5 px-5"><Skeleton className="h-4 w-16" /></td>
                    <td className="py-3.5 px-5"><Skeleton className="h-6 w-20 rounded-md" /></td>
                    <td className="py-3.5 px-5 text-right"><Skeleton className="h-6 w-8 ml-auto rounded-md" /></td>
                  </tr>
                ))
              ) : displayRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No freight records found matching your criteria.
                  </td>
                </tr>
              ) : (
                displayRows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                  {/* Freight ID (Blue link style) */}
                  <td className="py-3.5 px-5 font-semibold text-[#2563EB] whitespace-nowrap cursor-pointer hover:underline">
                    <span onClick={() => setSelectedRecord(row)}>
                      {row.freightId}
                    </span>
                  </td>

                  {/* Project */}
                  <td className="py-3.5 px-5 font-normal text-slate-600 whitespace-nowrap">
                    {row.project}
                  </td>

                  {/* Delivery Company */}
                  <td className="py-3.5 px-5 font-bold text-slate-900 whitespace-nowrap">
                    {row.deliveryCompany}
                  </td>

                  {/* Delivery ID */}
                  <td className="py-3.5 px-5 font-normal text-slate-600 whitespace-nowrap">
                    {row.deliveryId}
                  </td>

                  {/* Date with Calendar icon */}
                  <td className="py-3.5 px-5 whitespace-nowrap text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{row.date}</span>
                    </div>
                  </td>

                  {/* Cost */}
                  <td className="py-3.5 px-5 font-bold text-slate-900 whitespace-nowrap">
                    {row.costFormatted}
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

                  {/* Eye Icon View Details Action */}
                  <td className="py-3.5 px-5 whitespace-nowrap text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedRecord(row)}
                      className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <div className="px-4 sm:px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 font-normal">
            Showing 1 to {displayRows.length} of 16 entries
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {[1, 2, 3].map((page) => (
              <button
                key={`page-${page}`}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-6 h-6 rounded-full text-xs transition-colors flex items-center justify-center cursor-pointer ${
                  page === currentPage
                    ? "bg-[#1D51A4] text-white font-bold shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 font-medium"
                }`}
              >
                {page}
              </button>
            ))}

            {/* Current Active Page 4 as seen in screenshot */}
            <button
              type="button"
              onClick={() => setCurrentPage(4)}
              className={`w-6 h-6 rounded-full text-xs transition-colors flex items-center justify-center cursor-pointer ${
                currentPage === 4
                  ? "bg-[#1D51A4] text-white font-bold shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 font-medium"
              }`}
            >
              4
            </button>

            <span className="px-1 text-slate-400">...</span>

            <button
              type="button"
              onClick={() => setCurrentPage(15)}
              className="w-6 h-6 rounded-full text-xs text-slate-600 hover:bg-slate-100 font-medium transition-colors flex items-center justify-center cursor-pointer"
            >
              15
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(15, p + 1))}
              className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Bottom Banner: About Freight Costs */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5 flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-full bg-[#2E5BFF] flex items-center justify-center text-white shrink-0 mt-0.5">
          <Info className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-900">
            About Freight Costs
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            This screen provides visibility into freight costs across all projects and deliveries. Freight costs are automatically captured from awarded freight bids and linked to deliveries. For complete freight bidding operations and delivery management, please refer to the appropriate operational modules (Construction User Panel or Sales User Panel).
          </p>
        </div>
      </div>

      {/* Date Picker Modal */}
      <CalendarRangePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onApply={(range) => {
          if (range?.from && range?.to) {
            setDateRangeText(
              `${range.from.toLocaleDateString("en-GB")} - ${range.to.toLocaleDateString("en-GB")}`,
            );
          }
          setIsDatePickerOpen(false);
        }}
      />

      {/* Freight Cost Details Modal */}
      <FreightDetailModal
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        record={selectedRecord}
        onApprove={handleApprove}
        onReject={handleReject}
        onMarkPaid={handleMarkPaid}
        onDownloadInvoice={handleDownloadInvoice}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={successDialogConfig.isOpen}
        onClose={() =>
          setSuccessDialogConfig((prev) => ({ ...prev, isOpen: false }))
        }
        title={successDialogConfig.title}
        subTitle={successDialogConfig.message}
      />
    </div>
  );
};

export default FreightCostPage;
