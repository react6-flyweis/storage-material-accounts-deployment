import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar,
  Eye,
  Plus,
  TrendingDown,
  FileText,
  AlertCircle,
  Home,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import CalendarRangePickerModal from "@/components/common_components/CalendarRangePickerModal";
import SuccessModal from "@/components/common_components/SuccessModal";
import LogisticsCostDetailModal, {
  type LogisticsDetailRecord,
} from "@/components/cost/LogisticsCostDetailModal";
import {
  useGetLogisticsSummaryQuery,
  useGetLogisticsRecordsQuery,
  useGetCostFiltersQuery,
} from "@/redux/api/costsApi";
import { Skeleton } from "@/components/ui/skeleton";

export interface LogisticsRecord {
  id: string;
  deliveryId: string;
  deliveryCompany: string;
  project: string;
  finalAmount: number;
  finalAmountFormatted: string;
  date: string;
  approvalStatus: "Approved" | "Pending" | "Rejected";
  carrier?: string;
  paymentStatus?: "Paid" | "Unpaid" | "Pending";
}

export const LogisticsCostPage: React.FC = () => {
  const navigate = useNavigate();

  // RTK Query endpoints
  const { data: summaryData, isLoading: isSummaryLoading } = useGetLogisticsSummaryQuery();
  const { data: recordsData, isLoading: isRecordsLoading } = useGetLogisticsRecordsQuery();
  const { data: costFilters } = useGetCostFiltersQuery();

  // Normalized records from API
  const records: LogisticsRecord[] = useMemo(() => {
    if (!recordsData?.rows) return [];
    return recordsData.rows.map((r, idx) => ({
      id: r.approvalId || r.id || (r as { _id?: string })._id || `log-${idx}`,
      deliveryId: r.deliveryRef || r.deliveryId || `DEL-${1000 + idx}`,
      deliveryCompany: r.deliveryCompany || r.carrier || "-",
      project: r.projectName || r.project || "-",
      finalAmount: Number(r.finalAmount) || 0,
      finalAmountFormatted:
        r.finalAmountFormatted ||
        (r.finalAmount != null ? `$${Number(r.finalAmount).toLocaleString()}` : "$0"),
      date:
        r.date ||
        (r.createdAt
          ? new Date(r.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "-"),
      approvalStatus: (r.approvalStatus as "Approved" | "Pending" | "Rejected") || "Pending",
      carrier: r.carrier || r.deliveryCompany,
      paymentStatus: (r.paymentStatus as "Paid" | "Unpaid" | "Pending") || "Pending",
    }));
  }, [recordsData]);

  // Top Filter States
  const [topSearch, setTopSearch] = useState("");
  const [selectedCarrier, setSelectedCarrier] = useState("Carrier");
  const [selectedDeliveryCompany, setSelectedDeliveryCompany] = useState("Delivery Company");
  const [selectedProject, setSelectedProject] = useState("Project");
  const [selectedStatus, setSelectedStatus] = useState("Status");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("Payment Status");

  // Table Filter States
  const [tableSearch, setTableSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [tableDesignation, setTableDesignation] = useState("Designation");
  const [tableProject, setTableProject] = useState("Project");
  const [tableAmountRange, setTableAmountRange] = useState("$0.00 - $00");
  const [tableSortBy, setTableSortBy] = useState("Sort By : Last 7 Days");
  const [dateRangeText, setDateRangeText] = useState("dd/mm/yyyy - dd/mm/yyyy");

  // Modals & Popovers
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<LogisticsDetailRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [successDialogConfig, setSuccessDialogConfig] = useState<{
    isOpen: boolean;
    title: string;
    message?: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  // Dropdown open states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
        setIsExportOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (key: string) => {
    setOpenDropdown(openDropdown === key ? null : key);
  };

  // Filter options from shared costFilters
  const carrierOptions = useMemo(() => [
    "Carrier",
    ...(costFilters?.vendors
      ?.map((v) => (typeof v === "string" ? v : (v.name || v.vendorName || "")).trim())
      .filter(Boolean) || []),
  ], [costFilters]);

  const companyOptions = useMemo(() => [
    "Delivery Company",
    ...(costFilters?.vendors
      ?.map((v) => (typeof v === "string" ? v : (v.name || v.vendorName || "")).trim())
      .filter(Boolean) || []),
  ], [costFilters]);

  const projectOptions = useMemo(() => [
    "Project",
    ...(costFilters?.projects
      ?.map((p) => (p.projectName || p.name || "").trim())
      .filter(Boolean) || []),
  ], [costFilters]);

  const statusOptions = ["Status", "Approved", "Pending", "Rejected"];
  const paymentStatusOptions = ["Payment Status", "Paid", "Pending", "Unpaid"];

  // Table filter options
  const designationOptions = ["Designation", "Logistics Lead", "Operations Manager", "Site Supervisor"];
  const amountRangeOptions = ["$0.00 - $00", "$0 - $1,000", "$1,000 - $2,500", "$2,500 - $5,000", "$5,000+"];
  const sortByOptions = ["Sort By : Last 7 Days", "Sort By : Last 30 Days", "Sort By : Highest Amount", "Sort By : Lowest Amount"];

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Top bar filters
      if (topSearch.trim()) {
        const query = topSearch.toLowerCase();
        const match =
          r.deliveryId.toLowerCase().includes(query) ||
          r.deliveryCompany.toLowerCase().includes(query) ||
          r.project.toLowerCase().includes(query) ||
          (r.carrier && r.carrier.toLowerCase().includes(query));
        if (!match) return false;
      }
      if (selectedCarrier !== "Carrier" && r.carrier !== selectedCarrier) return false;
      if (selectedDeliveryCompany !== "Delivery Company" && r.deliveryCompany !== selectedDeliveryCompany) return false;
      if (selectedProject !== "Project" && r.project !== selectedProject) return false;
      if (selectedStatus !== "Status" && r.approvalStatus !== selectedStatus) return false;
      if (selectedPaymentStatus !== "Payment Status" && r.paymentStatus !== selectedPaymentStatus) return false;

      // Table specific search & project
      if (tableSearch.trim()) {
        const query = tableSearch.toLowerCase();
        const match =
          r.deliveryId.toLowerCase().includes(query) ||
          r.deliveryCompany.toLowerCase().includes(query) ||
          r.project.toLowerCase().includes(query);
        if (!match) return false;
      }
      if (tableProject !== "Project" && r.project !== tableProject) return false;

      return true;
    });
  }, [
    records,
    topSearch,
    selectedCarrier,
    selectedDeliveryCompany,
    selectedProject,
    selectedStatus,
    selectedPaymentStatus,
    tableSearch,
    tableProject,
  ]);

  // Pagination calculation
  const totalEntries = filteredRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalEntries);
  const currentRows = filteredRecords.slice(startIndex, endIndex);

  const handleOpenDetail = (record: LogisticsRecord) => {
    const detailRecord: LogisticsDetailRecord = {
      id: record.id,
      deliveryId: record.deliveryId,
      project: record.project,
      carrier: record.carrier || record.deliveryCompany,
      deliveryCompany: record.deliveryCompany,
      cost: record.finalAmount,
      finalAmountFormatted: record.finalAmountFormatted,
      date: record.date,
      approvalStatus: record.approvalStatus,
      paymentStatus: record.paymentStatus,
    };
    setSelectedRecordForDetail(detailRecord);
    setIsDetailModalOpen(true);
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    setIsExportOpen(false);
    if (format === "csv") {
      const headers = ["Delivery ID", "Delivery Company", "Project", "Final Amount", "Date", "Approval Status", "Payment Status"];
      const rows = filteredRecords.map((r) => [
        r.deliveryId,
        `"${r.deliveryCompany}"`,
        `"${r.project}"`,
        r.finalAmount,
        r.date,
        r.approvalStatus,
        r.paymentStatus || "Unpaid",
      ]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `logistics_cost_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA] px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            Logistics Cost
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 mt-1 flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Track freight and delivery costs - The most important financial screen</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition-colors"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isExportOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg z-30 py-1 text-xs">
                <button
                  onClick={() => handleExport("csv")}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 font-medium text-slate-700"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => handleExport("excel")}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 font-medium text-slate-700"
                >
                  Export Excel
                </button>
                <button
                  onClick={() => handleExport("pdf")}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 font-medium text-slate-700"
                >
                  Export PDF
                </button>
              </div>
            )}
          </div>

          {/* Add Logistic Cost Button */}
          <button
            onClick={() => navigate("/cost/logistics-cost/add")}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg shadow-sm transition-all shadow-blue-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Logistic Cost</span>
          </button>
        </div>
      </div>

      {/* 4 Solid Colored KPI Stat Cards Matching Reference Screenshot Exactly */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Logistics Cost (Blue #2E5BFF) */}
        <div className="bg-[#2E5BFF] text-white rounded-2xl p-5 shadow-sm relative overflow-hidden flex items-center justify-between min-h-[105px]">
          <div>
            <p className="text-xs sm:text-sm font-medium text-white/90">Total Logistics Cost</p>
            {isSummaryLoading ? (
              <Skeleton className="h-8 w-28 bg-white/20 mt-1" />
            ) : (
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white">
                {summaryData?.totalLogisticsCost != null
                  ? `$${Number(summaryData.totalLogisticsCost).toLocaleString()}`
                  : "$0"}
              </h2>
            )}
          </div>
          <div className="text-white/80 pr-2">
            <span className="text-3xl sm:text-4xl font-light font-mono select-none">$</span>
          </div>
        </div>

        {/* Card 2: Total Savings (Green #22C55E) */}
        <div className="bg-[#10B981] text-white rounded-2xl p-5 shadow-sm relative overflow-hidden flex items-center justify-between min-h-[105px]">
          <div>
            <p className="text-xs sm:text-sm font-medium text-white/90">Total Savings</p>
            {isSummaryLoading ? (
              <Skeleton className="h-8 w-24 bg-white/20 mt-1" />
            ) : (
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white">
                {summaryData?.totalSavings != null
                  ? `$${Number(summaryData.totalSavings).toLocaleString()}`
                  : "$0"}
              </h2>
            )}
          </div>
          <div className="text-white/85 pr-2">
            <TrendingDown className="w-9 h-9 stroke-[2.5]" />
          </div>
        </div>

        {/* Card 3: Pending Invoices (Orange #F97316) */}
        <div className="bg-[#F97316] text-white rounded-2xl p-5 shadow-sm relative overflow-hidden flex items-center justify-between min-h-[105px]">
          <div>
            <p className="text-xs sm:text-sm font-medium text-white/90">Pending Invoices</p>
            {isSummaryLoading ? (
              <Skeleton className="h-8 w-16 bg-white/20 mt-1" />
            ) : (
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white">
                {summaryData?.pendingInvoices ?? 0}
              </h2>
            )}
          </div>
          <div className="text-white/85 pr-2">
            <FileText className="w-8 h-8 stroke-[2]" />
          </div>
        </div>

        {/* Card 4: Disputed Items (Red #EF4444) */}
        <div className="bg-[#EF4444] text-white rounded-2xl p-5 shadow-sm relative overflow-hidden flex items-center justify-between min-h-[105px]">
          <div>
            <p className="text-xs sm:text-sm font-medium text-white/90">Disputed Items</p>
            {isSummaryLoading ? (
              <Skeleton className="h-8 w-16 bg-white/20 mt-1" />
            ) : (
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white">
                {summaryData?.disputedItems ?? 0}
              </h2>
            )}
          </div>
          <div className="text-white/85 pr-2">
            <AlertCircle className="w-8 h-8 stroke-[2]" />
          </div>
        </div>
      </div>

      {/* Top Filter Bar: Search + 5 Dropdowns */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-3.5">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={topSearch}
            onChange={(e) => setTopSearch(e.target.value)}
            placeholder="Search by Freight ID, Load ID, Delivery ID, Project, Carrier"
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg placeholder-slate-400 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* 5 Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Carrier Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("carrier")}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <span className="truncate">{selectedCarrier}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0" />
            </button>
            {openDropdown === "carrier" && (
              <div className="absolute left-0 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto py-1 text-xs">
                {carrierOptions.map((opt) => (
                  <div
                    key={opt}
                    onClick={() => {
                      setSelectedCarrier(opt);
                      setOpenDropdown(null);
                    }}
                    className={`px-3 py-1.5 cursor-pointer hover:bg-slate-50 truncate ${
                      selectedCarrier === opt ? "font-semibold text-blue-600 bg-blue-50" : "text-slate-700"
                    }`}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delivery Company Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("deliveryCompany")}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <span className="truncate">{selectedDeliveryCompany}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0" />
            </button>
            {openDropdown === "deliveryCompany" && (
              <div className="absolute left-0 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto py-1 text-xs">
                {companyOptions.map((opt) => (
                  <div
                    key={opt}
                    onClick={() => {
                      setSelectedDeliveryCompany(opt);
                      setOpenDropdown(null);
                    }}
                    className={`px-3 py-1.5 cursor-pointer hover:bg-slate-50 truncate ${
                      selectedDeliveryCompany === opt ? "font-semibold text-blue-600 bg-blue-50" : "text-slate-700"
                    }`}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Project Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("project")}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <span className="truncate">{selectedProject}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0" />
            </button>
            {openDropdown === "project" && (
              <div className="absolute left-0 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto py-1 text-xs">
                {projectOptions.map((opt) => (
                  <div
                    key={opt}
                    onClick={() => {
                      setSelectedProject(opt);
                      setOpenDropdown(null);
                    }}
                    className={`px-3 py-1.5 cursor-pointer hover:bg-slate-50 truncate ${
                      selectedProject === opt ? "font-semibold text-blue-600 bg-blue-50" : "text-slate-700"
                    }`}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("status")}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <span className="truncate">{selectedStatus}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0" />
            </button>
            {openDropdown === "status" && (
              <div className="absolute left-0 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto py-1 text-xs">
                {statusOptions.map((opt) => (
                  <div
                    key={opt}
                    onClick={() => {
                      setSelectedStatus(opt);
                      setOpenDropdown(null);
                    }}
                    className={`px-3 py-1.5 cursor-pointer hover:bg-slate-50 truncate ${
                      selectedStatus === opt ? "font-semibold text-blue-600 bg-blue-50" : "text-slate-700"
                    }`}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Status Dropdown */}
          <div className="relative col-span-2 sm:col-span-1">
            <button
              onClick={() => toggleDropdown("paymentStatus")}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <span className="truncate">{selectedPaymentStatus}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0" />
            </button>
            {openDropdown === "paymentStatus" && (
              <div className="absolute left-0 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto py-1 text-xs">
                {paymentStatusOptions.map((opt) => (
                  <div
                    key={opt}
                    onClick={() => {
                      setSelectedPaymentStatus(opt);
                      setOpenDropdown(null);
                    }}
                    className={`px-3 py-1.5 cursor-pointer hover:bg-slate-50 truncate ${
                      selectedPaymentStatus === opt ? "font-semibold text-blue-600 bg-blue-50" : "text-slate-700"
                    }`}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* Table Header Row: Title & Secondary Filter Pills */}
        <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Freight + Delivery Cost
          </h3>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Date Range Picker Button */}
            <button
              onClick={() => setIsDatePickerOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{dateRangeText}</span>
            </button>

            {/* Designation Filter */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("tableDesignation")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <span>{tableDesignation}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
              {openDropdown === "tableDesignation" && (
                <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1 text-xs">
                  {designationOptions.map((opt) => (
                    <div
                      key={opt}
                      onClick={() => {
                        setTableDesignation(opt);
                        setOpenDropdown(null);
                      }}
                      className="px-3 py-1.5 cursor-pointer hover:bg-slate-50 text-slate-700"
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Project Filter */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("tableProject")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <span>{tableProject}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
              {openDropdown === "tableProject" && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1 text-xs">
                  {projectOptions.map((opt) => (
                    <div
                      key={opt}
                      onClick={() => {
                        setTableProject(opt);
                        setOpenDropdown(null);
                      }}
                      className="px-3 py-1.5 cursor-pointer hover:bg-slate-50 text-slate-700"
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Amount Range Filter */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("tableAmount")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <span>{tableAmountRange}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
              {openDropdown === "tableAmount" && (
                <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1 text-xs">
                  {amountRangeOptions.map((opt) => (
                    <div
                      key={opt}
                      onClick={() => {
                        setTableAmountRange(opt);
                        setOpenDropdown(null);
                      }}
                      className="px-3 py-1.5 cursor-pointer hover:bg-slate-50 text-slate-700"
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sort By Filter */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("tableSort")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <span>{tableSortBy}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
              {openDropdown === "tableSort" && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1 text-xs">
                  {sortByOptions.map((opt) => (
                    <div
                      key={opt}
                      onClick={() => {
                        setTableSortBy(opt);
                        setOpenDropdown(null);
                      }}
                      className="px-3 py-1.5 cursor-pointer hover:bg-slate-50 text-slate-700"
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row Per Page + Search Bar */}
        <div className="px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2 text-xs sm:text-[13px] text-slate-500 font-medium">
            <span>Row Per Page</span>
            <div className="relative">
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="appearance-none bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 pr-6 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <span>Entries</span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => {
                setTableSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search"
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg placeholder-slate-400 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-[13px]">
            <thead className="bg-[#EDF2F7] text-slate-700 font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4 sm:px-5 whitespace-nowrap font-bold">Delivery ID</th>
                <th className="py-3 px-4 sm:px-5 whitespace-nowrap font-bold">Delivery Company</th>
                <th className="py-3 px-4 sm:px-5 whitespace-nowrap font-bold">Project</th>
                <th className="py-3 px-4 sm:px-5 whitespace-nowrap font-bold">Final Amount</th>
                <th className="py-3 px-4 sm:px-5 whitespace-nowrap font-bold">Date</th>
                <th className="py-3 px-4 sm:px-5 whitespace-nowrap font-bold">Approval Status</th>
                <th className="py-3 px-4 sm:px-5 whitespace-nowrap font-bold">Payment Status</th>
                <th className="py-3 px-4 sm:px-5 text-right whitespace-nowrap font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isRecordsLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`skel-${i}`} className="border-b border-slate-100">
                    <td className="py-4 px-4 sm:px-5">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="py-4 px-4 sm:px-5">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="py-4 px-4 sm:px-5">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="py-4 px-4 sm:px-5">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="py-4 px-4 sm:px-5">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="py-4 px-4 sm:px-5">
                      <Skeleton className="h-6 w-16 rounded" />
                    </td>
                    <td className="py-4 px-4 sm:px-5">
                      <Skeleton className="h-6 w-16 rounded" />
                    </td>
                    <td className="py-4 px-4 sm:px-5 text-right">
                      <Skeleton className="h-8 w-8 ml-auto rounded" />
                    </td>
                  </tr>
                ))
              ) : currentRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No logistics records found.
                  </td>
                </tr>
              ) : (
                currentRows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    <td className="py-3.5 px-4 sm:px-5 font-medium text-slate-400 whitespace-nowrap">
                      {row.deliveryId}
                    </td>
                    <td className="py-3.5 px-4 sm:px-5 font-bold text-slate-900 whitespace-nowrap">
                      {row.deliveryCompany}
                    </td>
                    <td className="py-3.5 px-4 sm:px-5 text-slate-500 whitespace-nowrap">
                      {row.project}
                    </td>
                    <td className="py-3.5 px-4 sm:px-5 font-bold text-slate-900 whitespace-nowrap">
                      {row.finalAmountFormatted}
                    </td>
                    <td className="py-3.5 px-4 sm:px-5 text-slate-600 whitespace-nowrap">
                      {row.date}
                    </td>
                    <td className="py-3.5 px-4 sm:px-5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-medium border ${
                          row.approvalStatus === "Approved"
                            ? "bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]"
                            : row.approvalStatus === "Pending"
                            ? "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]"
                            : "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]"
                        }`}
                      >
                        {row.approvalStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-medium border ${
                          row.paymentStatus?.toLowerCase() === "paid"
                            ? "bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]"
                            : "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]"
                        }`}
                      >
                        {row.paymentStatus || "Unpaid"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-5 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenDetail(row)}
                        title="View Details"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 text-xs text-slate-500">
          <div>
            Showing {totalEntries === 0 ? 0 : startIndex + 1} to {endIndex} of {totalEntries} entries
          </div>

          <div className="flex items-center gap-1.5 self-center sm:self-auto">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              if (
                totalPages > 6 &&
                page > 3 &&
                page < totalPages - 1 &&
                page !== currentPage
              ) {
                if (page === 4) {
                  return (
                    <span key={page} className="px-1 text-slate-400">
                      ...
                    </span>
                  );
                }
                return null;
              }

              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-md font-medium text-xs transition-colors ${
                    currentPage === page
                      ? "bg-[#1E40AF] text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalEntries === 0}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Date Range Modal */}
      <CalendarRangePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onSelectRange={(rangeStr) => {
          setDateRangeText(rangeStr);
          setIsDatePickerOpen(false);
        }}
      />

      {/* Logistics Detail Modal */}
      <LogisticsCostDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedRecordForDetail(null);
        }}
        record={selectedRecordForDetail}
        approvalId={selectedRecordForDetail?.id}
        onSuccessAction={(msg) => {
          setSuccessDialogConfig({
            isOpen: true,
            title: "Success",
            message: msg,
          });
        }}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={successDialogConfig.isOpen}
        onClose={() => setSuccessDialogConfig((prev) => ({ ...prev, isOpen: false }))}
        title={successDialogConfig.title}
        message={successDialogConfig.message}
      />
    </div>
  );
};

export default LogisticsCostPage;
