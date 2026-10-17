import { useState, useMemo, useEffect } from "react";
import {
  Upload,
  Search,
  Calendar,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Eye,
  Download,
  Loader2,
  TrendingUp,
  TrendingDown,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  Plus,
} from "lucide-react";
import { CalendarRangePickerModal } from "@/components/common_components/CalendarRangePickerModal";
import SuccessModal from "@/components/common_components/SuccessModal";
import {
  useGetQuotationProfitSummaryQuery,
  useGetQuotationProfitRecordsQuery,
  useLazyGetQuotationProfitDetailQuery,
  useUploadQuotationProfitMutation,
  useGetInvoiceManagementFiltersQuery,
  downloadInvoiceExport,
  type QuotationProfitRecordItem,
  type QuotationProfitDetailData,
} from "@/redux/api/invoiceManagementApi";
import { formatCurrency, formatDisplayDate } from "@/lib/dashboardFormatters";
import { uploadFileToS3 } from "@/lib/upload";

export default function QuotationProfitLossPage() {
  // Query state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedProject, setSelectedProject] = useState<string>("All");
  const [dateRange, setDateRange] = useState<{ startDate?: string; endDate?: string }>({});
  const [dateRangeLabel, setDateRangeLabel] = useState<string>("All Dates");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Dropdowns
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<string>("actualProfit");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<QuotationProfitDetailData | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Upload/Override Form State
  const [overrideQuotationId, setOverrideQuotationId] = useState("");
  const [overrideRevenue, setOverrideRevenue] = useState("");
  const [overrideCost, setOverrideCost] = useState("");
  const [overrideStatus, setOverrideStatus] = useState<"Profitable" | "Low Margin" | "Loss">("Profitable");
  const [overrideFile, setOverrideFile] = useState<File | null>(null);
  const [isSubmittingOverride, setIsSubmittingOverride] = useState(false);

  // Success modal
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    title: string;
    subTitle: string;
  }>({
    isOpen: false,
    title: "",
    subTitle: "",
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 1. Shared Filters
  const { data: filtersData } = useGetInvoiceManagementFiltersQuery();

  // 2. Summary KPIs
  const summaryQueryParams = useMemo(() => {
    return {
      projectId: selectedProject !== "All" ? selectedProject : undefined,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    };
  }, [selectedProject, dateRange]);

  const {
    data: summaryData,
    isLoading: isSummaryLoading,
  } = useGetQuotationProfitSummaryQuery(summaryQueryParams);

  // 3. Records Table
  const recordsQueryParams = useMemo(() => {
    return {
      page: currentPage,
      limit: rowsPerPage,
      search: debouncedSearch || undefined,
      projectId: selectedProject !== "All" ? selectedProject : undefined,
      status: selectedStatus !== "All" ? selectedStatus : undefined,
      sortBy: sortField,
      sortOrder,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    };
  }, [
    currentPage,
    rowsPerPage,
    debouncedSearch,
    selectedProject,
    selectedStatus,
    sortField,
    sortOrder,
    dateRange,
  ]);

  const {
    data: recordsData,
    isLoading: isRecordsLoading,
    isFetching: isRecordsFetching,
  } = useGetQuotationProfitRecordsQuery(recordsQueryParams);

  // Mutations & lazy query
  const [fetchDetail] = useLazyGetQuotationProfitDetailQuery();
  const [uploadProfitAnalysis] = useUploadQuotationProfitMutation();

  const handleOpenDetail = async (quotationId: string) => {
    setIsDetailLoading(true);
    setIsDetailOpen(true);
    try {
      const res = await fetchDetail(quotationId).unwrap();
      setDetailData(res);
    } catch {
      // Fallback: populate from record item if available
      const local = recordsData?.records?.find((r) => r.quotationId === quotationId);
      if (local) {
        setDetailData({ record: local });
      }
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleOpenUploadModal = (record?: QuotationProfitRecordItem) => {
    if (record) {
      setOverrideQuotationId(record.quotationId);
      setOverrideRevenue(record.actualRevenue ? String(record.actualRevenue) : "");
      setOverrideCost(record.actualCost ? String(record.actualCost) : "");
      setOverrideStatus((record.status as any) || "Profitable");
    } else {
      setOverrideQuotationId("");
      setOverrideRevenue("");
      setOverrideCost("");
      setOverrideStatus("Profitable");
    }
    setOverrideFile(null);
    setIsUploadOpen(true);
  };

  const handleSubmitOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideQuotationId) {
      alert("Please select or enter a Quotation ID");
      return;
    }

    try {
      setIsSubmittingOverride(true);
      let documentUrl: string | undefined = undefined;

      if (overrideFile) {
        documentUrl = await uploadFileToS3(overrideFile, "profit-analysis");
      }

      await uploadProfitAnalysis({
        quotationId: overrideQuotationId,
        revenue: parseFloat(overrideRevenue.replace(/[^0-9.]/g, "")) || 0,
        actualCost: parseFloat(overrideCost.replace(/[^0-9.]/g, "")) || 0,
        status: overrideStatus,
        documentUrl,
      }).unwrap();

      setIsUploadOpen(false);
      setSuccessModal({
        isOpen: true,
        title: "P&L Analysis Saved",
        subTitle: `Quotation profitability analysis has been successfully recorded.`,
      });
    } catch {
      alert("Failed to upload quotation profit data. Please try again.");
    } finally {
      setIsSubmittingOverride(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  // Excel Export
  const handleExport = async () => {
    try {
      setIsExporting(true);
      await downloadInvoiceExport(
        "quotation-profit",
        {
          projectId: selectedProject !== "All" ? selectedProject : undefined,
          status: selectedStatus !== "All" ? selectedStatus : undefined,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
        `quotation-profit-loss-${new Date().toISOString().split("T")[0]}.xlsx`
      );
    } catch (err: unknown) {
      console.warn("Direct export failed, falling back to client CSV:", err);
      const records = recordsData?.records || [];
      const headers = ["QUOTATION ID", "PROJECT", "CUSTOMER", "QUOTED REVENUE", "ACTUAL REVENUE", "ACTUAL COST", "ACTUAL PROFIT", "STATUS"];
      const rows = records.map((r) => [
        r.quotationNumber || r.quotationId,
        r.projectName || "",
        r.customerName || "",
        r.quotedRevenue?.toString() || "0",
        r.actualRevenue?.toString() || "0",
        r.actualCost?.toString() || "0",
        r.actualProfit?.toString() || "0",
        r.status || "",
      ]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `quotation-profit-loss-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsExporting(false);
    }
  };

  const records = recordsData?.records || [];
  const totalRecords = recordsData?.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));
  const availableProjects = filtersData?.projects || [];
  const statusOptions = filtersData?.quotationProfitStatuses || ["Profitable", "Low Margin", "Loss"];

  return (
    <div className="space-y-5">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Quotation-wise Profit / Loss
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-normal">
            Analyze quoted vs actual revenue, combined project costs (vendor, freight, materials), and net profitability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-600" />
            ) : (
              <Upload className="w-3.5 h-3.5 text-slate-600 rotate-90" />
            )}
            <span>Export Excel</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenUploadModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#3B66BD] hover:bg-[#2F54A0] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>Upload / Override P&L</span>
          </button>
        </div>
      </div>

      {/* 2. 5 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Quotations */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100 relative overflow-hidden flex flex-col justify-between">
          <p className="text-xs text-slate-500 font-medium">Total Quotations</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">
            {isSummaryLoading ? "..." : summaryData?.totalQuotations ?? 0}
          </h3>
          <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-purple-500 rounded-bl-xl [clip-path:polygon(0_0,0_100%,100%_100%)]" />
        </div>

        {/* Card 2: Quoted Revenue */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100 relative overflow-hidden flex flex-col justify-between">
          <p className="text-xs text-slate-500 font-medium">Quoted Revenue</p>
          <h3 className="text-2xl font-bold text-blue-600 mt-2">
            {isSummaryLoading ? "..." : formatCurrency(summaryData?.quotedRevenue)}
          </h3>
          <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-blue-500 rounded-bl-xl [clip-path:polygon(0_0,0_100%,100%_100%)]" />
        </div>

        {/* Card 3: Actual Revenue */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100 relative overflow-hidden flex flex-col justify-between">
          <p className="text-xs text-slate-500 font-medium">Actual Revenue</p>
          <h3 className="text-2xl font-bold text-emerald-600 mt-2">
            {isSummaryLoading ? "..." : formatCurrency(summaryData?.actualRevenue)}
          </h3>
          <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-emerald-500 rounded-bl-xl [clip-path:polygon(0_0,0_100%,100%_100%)]" />
        </div>

        {/* Card 4: Actual Cost */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100 relative overflow-hidden flex flex-col justify-between">
          <p className="text-xs text-slate-500 font-medium">Actual Cost</p>
          <h3 className="text-2xl font-bold text-amber-600 mt-2">
            {isSummaryLoading ? "..." : formatCurrency(summaryData?.actualCost)}
          </h3>
          <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-amber-500 rounded-bl-xl [clip-path:polygon(0_0,0_100%,100%_100%)]" />
        </div>

        {/* Card 5: Actual Profit */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 font-medium">Actual Profit</p>
            {(summaryData?.actualProfit ?? 0) >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
          </div>
          <h3
            className={`text-2xl font-bold mt-2 ${
              (summaryData?.actualProfit ?? 0) >= 0 ? "text-emerald-700" : "text-red-600"
            }`}
          >
            {isSummaryLoading ? "..." : formatCurrency(summaryData?.actualProfit)}
          </h3>
          <div
            className={`absolute -bottom-1 -left-1 w-6 h-6 rounded-bl-xl [clip-path:polygon(0_0,0_100%,100%_100%)] ${
              (summaryData?.actualProfit ?? 0) >= 0 ? "bg-emerald-500" : "bg-red-500"
            }`}
          />
        </div>
      </div>

      {/* 3. Main Records Table Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-5 sm:p-6 space-y-5">
        {/* Table Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Quotation Profitability Records
            </h2>
            {isRecordsFetching && !isRecordsLoading && (
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search quotation or project"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8.5 pl-8 pr-3 w-40 sm:w-56 rounded-lg border border-slate-200 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>

            {/* Date Range Picker */}
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="inline-flex items-center gap-1.5 h-8.5 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium cursor-pointer shadow-xs transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{dateRangeLabel}</span>
            </button>

            {/* Status Filter */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowStatusMenu(!showStatusMenu);
                  setShowProjectMenu(false);
                }}
                className={`inline-flex items-center gap-1.5 h-8.5 px-3 bg-white border rounded-lg text-xs font-medium cursor-pointer shadow-xs transition-colors ${
                  selectedStatus !== "All"
                    ? "border-blue-500 text-blue-600 bg-blue-50/40"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>{selectedStatus === "All" ? "Status" : selectedStatus}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
              </button>

              {showStatusMenu && (
                <div className="absolute right-0 mt-1.5 w-40 bg-white border border-slate-200 rounded-xl shadow-lg p-1 z-30 space-y-0.5">
                  <button
                    onClick={() => {
                      setSelectedStatus("All");
                      setShowStatusMenu(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                      selectedStatus === "All"
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    All Statuses
                  </button>
                  {statusOptions.map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        setSelectedStatus(st);
                        setShowStatusMenu(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                        selectedStatus === st
                          ? "bg-blue-50 text-blue-600 font-semibold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Project Filter */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProjectMenu(!showProjectMenu);
                  setShowStatusMenu(false);
                }}
                className={`inline-flex items-center gap-1.5 h-8.5 px-3 bg-white border rounded-lg text-xs font-medium cursor-pointer shadow-xs transition-colors ${
                  selectedProject !== "All"
                    ? "border-blue-500 text-blue-600 bg-blue-50/40"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span className="max-w-28 truncate">
                  {selectedProject === "All"
                    ? "Project"
                    : availableProjects.find((p) => (p.projectId || p.leadId) === selectedProject)?.projectName || "Project"}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
              </button>

              {showProjectMenu && (
                <div className="absolute right-0 mt-1.5 w-52 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg p-1 z-30 space-y-0.5">
                  <button
                    onClick={() => {
                      setSelectedProject("All");
                      setShowProjectMenu(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                      selectedProject === "All"
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    All Projects
                  </button>
                  {availableProjects.map((p) => {
                    const id = p.projectId || p.leadId;
                    return (
                      <button
                        key={id}
                        onClick={() => {
                          setSelectedProject(id);
                          setShowProjectMenu(false);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer truncate ${
                          selectedProject === id
                            ? "bg-blue-50 text-blue-600 font-semibold"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {p.projectName} {p.jobId ? `(${p.jobId})` : ""}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-5 sm:mx-0">
          <table className="w-full text-left border-collapse min-w-190">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3 font-bold text-slate-800">QUOTATION #</th>
                <th className="px-5 py-3 font-bold text-slate-800">PROJECT</th>
                <th className="px-5 py-3 font-bold text-slate-800">CUSTOMER</th>
                <th
                  className="px-5 py-3 font-bold text-slate-800 cursor-pointer select-none"
                  onClick={() => handleSort("quotedRevenue")}
                >
                  <div className="inline-flex items-center gap-1">
                    QUOTED REV
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th
                  className="px-5 py-3 font-bold text-slate-800 cursor-pointer select-none"
                  onClick={() => handleSort("actualRevenue")}
                >
                  <div className="inline-flex items-center gap-1">
                    ACTUAL REV
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th
                  className="px-5 py-3 font-bold text-slate-800 cursor-pointer select-none"
                  onClick={() => handleSort("actualCost")}
                >
                  <div className="inline-flex items-center gap-1">
                    ACTUAL COST
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th
                  className="px-5 py-3 font-bold text-slate-800 cursor-pointer select-none"
                  onClick={() => handleSort("actualProfit")}
                >
                  <div className="inline-flex items-center gap-1">
                    NET PROFIT
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-5 py-3 font-bold text-slate-800">STATUS</th>
                <th className="px-5 py-3 font-bold text-slate-800 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isRecordsLoading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Loading quotation profitability data...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-slate-400">
                    No quotation profitability records found.
                  </td>
                </tr>
              ) : (
                records.map((rec) => {
                  const isProfitable = rec.status === "Profitable" || (rec.actualProfit ?? 0) > 0;
                  const isLowMargin = rec.status === "Low Margin";

                  return (
                    <tr
                      key={rec.quotationId}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-mono font-medium text-slate-700">
                        {rec.quotationNumber || rec.quotationId}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {rec.projectName || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 font-normal">
                        {rec.customerName || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 font-normal">
                        {formatCurrency(rec.quotedRevenue)}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-800">
                        {formatCurrency(rec.actualRevenue)}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 font-normal">
                        {formatCurrency(rec.actualCost)}
                      </td>
                      <td className="px-5 py-3.5 font-bold">
                        <span
                          className={
                            rec.actualProfit >= 0 ? "text-emerald-600" : "text-red-600"
                          }
                        >
                          {formatCurrency(rec.actualProfit)}
                        </span>
                        {rec.actualRevenue > 0 && (
                          <span className="block text-[10px] text-slate-400 font-normal">
                            Margin: {Math.round((rec.actualProfit / rec.actualRevenue) * 100)}%
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md text-[11px] ${
                            isProfitable
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : isLowMargin
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {isProfitable ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : isLowMargin ? (
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                          ) : (
                            <XCircle className="w-3 h-3 text-red-600" />
                          )}
                          {rec.status || (isProfitable ? "Profitable" : "Loss")}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {/* Document link */}
                          {rec.documentUrl && (
                            <a
                              href={rec.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                              title="Download Attached Document"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {/* Override / Upload */}
                          <button
                            onClick={() => handleOpenUploadModal(rec)}
                            className="px-2 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors cursor-pointer"
                          >
                            Override
                          </button>

                          {/* View Detail */}
                          <button
                            onClick={() => handleOpenDetail(rec.quotationId)}
                            className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="View P&L Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Showing</span>
            <div className="relative">
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-7 pl-2 pr-6 border border-slate-200 rounded-md text-xs text-slate-700 bg-white focus:outline-none appearance-none cursor-pointer"
              >
                {[10, 20, 50, 100].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <span>of {totalRecords} Records</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium text-slate-700 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Upload / Override Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 transition-opacity animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Upload / Override Quotation P&L
              </h2>
              <button
                type="button"
                onClick={() => setIsUploadOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitOverride} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Quotation ID / Ref <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter quotation ID or mongo ID"
                  value={overrideQuotationId}
                  onChange={(e) => setOverrideQuotationId(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-slate-100 border border-transparent focus:border-blue-500 focus:bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Actual Revenue ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 10000"
                    value={overrideRevenue}
                    onChange={(e) => setOverrideRevenue(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-slate-100 border border-transparent focus:border-blue-500 focus:bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Actual Cost ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Defaults to project expenses"
                    value={overrideCost}
                    onChange={(e) => setOverrideCost(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-slate-100 border border-transparent focus:border-blue-500 focus:bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all"
                  />
                  <span className="block text-[10px] text-slate-400 mt-1">
                    Leave blank to auto-calculate from combined project expenses.
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Status
                </label>
                <select
                  value={overrideStatus}
                  onChange={(e) => setOverrideStatus(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-lg bg-slate-100 border border-transparent focus:border-blue-500 focus:bg-white text-xs text-slate-800 focus:outline-none transition-all"
                >
                  <option value="Profitable">Profitable</option>
                  <option value="Low Margin">Low Margin</option>
                  <option value="Loss">Loss</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Upload Supporting Document (Optional)
                </label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setOverrideFile(e.target.files[0]);
                    }
                  }}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSubmittingOverride}
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOverride}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#3B66BD] hover:bg-[#2F54A0] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingOverride && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isSubmittingOverride ? "Saving..." : "Submit P&L"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 transition-opacity animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Quotation P&L Details
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isDetailLoading ? (
              <div className="py-12 text-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                Loading quotation details...
              </div>
            ) : detailData ? (
              <div className="space-y-4 pt-4 text-xs">
                {/* Basic Info */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Quotation Ref</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">
                      {detailData.record?.quotationNumber ||
                        detailData.quotation?.quotationNumber ||
                        detailData.quotationId ||
                        "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Project</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {detailData.record?.projectName || detailData.quotation?.projectName || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Customer</span>
                    <span className="font-medium text-slate-700">
                      {detailData.record?.customerName || detailData.quotation?.customerName || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Status</span>
                    <span className="font-semibold text-emerald-600">
                      {detailData.record?.status || detailData.status || "Profitable"}
                    </span>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                    <span className="text-slate-500 block text-[11px]">Quoted Rev</span>
                    <span className="font-bold text-blue-700 text-sm">
                      {formatCurrency(detailData.record?.quotedRevenue ?? detailData.quotedRevenue)}
                    </span>
                  </div>
                  <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                    <span className="text-slate-500 block text-[11px]">Actual Rev</span>
                    <span className="font-bold text-emerald-700 text-sm">
                      {formatCurrency(detailData.record?.actualRevenue ?? detailData.actualRevenue)}
                    </span>
                  </div>
                  <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-lg">
                    <span className="text-slate-500 block text-[11px]">Actual Cost</span>
                    <span className="font-bold text-amber-700 text-sm">
                      {formatCurrency(detailData.record?.actualCost ?? detailData.actualCost)}
                    </span>
                  </div>
                  <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-lg">
                    <span className="text-slate-500 block text-[11px]">Net Profit</span>
                    <span className="font-bold text-purple-700 text-sm">
                      {formatCurrency(detailData.record?.actualProfit ?? detailData.actualProfit)}
                    </span>
                  </div>
                </div>

                {/* Cost Breakdown if provided */}
                {detailData.costBreakdown && (
                  <div className="p-4 rounded-xl border border-slate-100 space-y-2">
                    <h4 className="font-bold text-slate-800 mb-2">Cost Breakdown</h4>
                    <div className="flex justify-between text-slate-600">
                      <span>Manual Project Expenses</span>
                      <span className="font-medium">
                        {formatCurrency(detailData.costBreakdown.manualExpenses)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Vendor / Material Costs</span>
                      <span className="font-medium">
                        {formatCurrency(detailData.costBreakdown.emailVendorExpenses)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Freight & Carrier Expenses</span>
                      <span className="font-medium">
                        {formatCurrency(detailData.costBreakdown.freightExpenses)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Document Link */}
                {(detailData.record?.documentUrl || detailData.documentUrl) && (
                  <div className="pt-2">
                    <a
                      href={detailData.record?.documentUrl || detailData.documentUrl || ""}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      View Attached Profit Analysis File
                    </a>
                  </div>
                )}
              </div>
            ) : null}

            <div className="flex items-center justify-end pt-4 mt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date Range Modal */}
      <CalendarRangePickerModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        onApply={(range) => {
          if (range?.startDate && range?.endDate) {
            const startStr = range.startDate.toISOString().split("T")[0];
            const endStr = range.endDate.toISOString().split("T")[0];
            setDateRange({ startDate: startStr, endDate: endStr });
            setDateRangeLabel(`${formatDisplayDate(startStr)} - ${formatDisplayDate(endStr)}`);
          } else {
            setDateRange({});
            setDateRangeLabel("All Dates");
          }
          setCurrentPage(1);
        }}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal((prev) => ({ ...prev, isOpen: false }))}
        title={successModal.title}
        subTitle={successModal.subTitle}
      />
    </div>
  );
}
