import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { CalendarRangePickerModal } from "@/components/common_components/CalendarRangePickerModal";
import { InvoiceStatsCards, type InvoiceStatCardItem } from "@/components/invoices/InvoiceStatsCards";
import SuccessModal from "@/components/common_components/SuccessModal";
import {
  useGetVendorInvoicesSummaryQuery,
  useGetVendorInvoicesRecordsQuery,
  useMarkPayablePaidMutation,
  useGetInvoiceManagementFiltersQuery,
  downloadInvoiceExport,
  type VendorInvoiceRecordItem,
} from "@/redux/api/invoiceManagementApi";
import { formatCurrency, formatDisplayDate } from "@/lib/dashboardFormatters";

export type { VendorInvoiceRecordItem as VendorInvoiceItem };

export default function VendorInvoicesPage() {
  const navigate = useNavigate();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedVerification, setSelectedVerification] = useState<string>("All");
  const [selectedPayment, setSelectedPayment] = useState<string>("All");
  const [selectedProject, setSelectedProject] = useState<string>("All");
  const [dateRange, setDateRange] = useState<{ startDate?: string; endDate?: string }>({});
  const [dateRangeLabel, setDateRangeLabel] = useState<string>("All Dates");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Dropdown states
  const [showVerificationMenu, setShowVerificationMenu] = useState(false);
  const [showPaymentMenu, setShowPaymentMenu] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<"dueDate" | "amount" | "date">("dueDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // Success modal
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successModalContent, setSuccessModalContent] = useState({
    title: "",
    subTitle: "",
  });
  const [isExporting, setIsExporting] = useState(false);

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
  } = useGetVendorInvoicesSummaryQuery(summaryQueryParams);

  // 3. Records Table
  const recordsQueryParams = useMemo(() => {
    return {
      page: currentPage,
      limit: rowsPerPage,
      search: debouncedSearch || undefined,
      projectId: selectedProject !== "All" ? selectedProject : undefined,
      verificationStatus: selectedVerification !== "All" ? selectedVerification : undefined,
      paymentStatus: selectedPayment !== "All" ? selectedPayment : undefined,
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
    selectedVerification,
    selectedPayment,
    sortField,
    sortOrder,
    dateRange,
  ]);

  const {
    data: recordsData,
    isLoading: isRecordsLoading,
    isFetching: isRecordsFetching,
  } = useGetVendorInvoicesRecordsQuery(recordsQueryParams);

  // Payables mark-paid mutation
  const [markPayablePaid, { isLoading: isMarkingPaid }] = useMarkPayablePaidMutation();

  const handleMarkPaid = async (inv: VendorInvoiceRecordItem) => {
    try {
      await markPayablePaid({ invoiceId: inv.invoiceId, paymentMethod: "ACH" }).unwrap();
      setSuccessModalContent({
        title: "Payment Recorded",
        subTitle: `Invoice ${inv.invoiceNumber} has been successfully marked as Paid.`,
      });
      setIsSuccessOpen(true);
    } catch {
      alert("Failed to mark invoice as paid. Please ensure it is verified before recording payment.");
    }
  };

  const handleSort = (field: "dueDate" | "amount" | "date") => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  // Excel export
  const handleExport = async () => {
    try {
      setIsExporting(true);
      await downloadInvoiceExport(
        "vendor",
        {
          projectId: selectedProject !== "All" ? selectedProject : undefined,
          verificationStatus: selectedVerification !== "All" ? selectedVerification : undefined,
          paymentStatus: selectedPayment !== "All" ? selectedPayment : undefined,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
        `vendor-invoices-${new Date().toISOString().split("T")[0]}.xlsx`
      );
    } catch (err: unknown) {
      console.warn("Direct export failed, falling back to client CSV:", err);
      const records = recordsData?.records || [];
      const headers = ["INVOICE NUMBER", "VENDOR", "PROJECT", "AMOUNT", "DUE DATE", "VERIFICATION", "PAYMENT"];
      const rows = records.map((r) => [
        r.invoiceNumber,
        r.vendorName || r.name || "",
        r.projectName || r.project || "",
        r.amount.toString(),
        r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "",
        r.verification || "",
        r.payment || "",
      ]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `vendor-invoices-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsExporting(false);
    }
  };

  // Metric Cards
  const metricCards: InvoiceStatCardItem[] = useMemo(() => {
    const s = summaryData;
    return [
      {
        title: "Total Invoices",
        value: s ? s.totalInvoices ?? 0 : 0,
        iconBorder: "border-[#DDD6FE]",
        iconBg: "bg-[#F5F3FF]",
        accentColor: "#8B5CF6",
      },
      {
        title: "Invoice Amount",
        value: s ? formatCurrency(s.invoiceAmount) : "$0",
        iconBorder: "border-[#A7F3D0]",
        iconBg: "bg-[#ECFDF5]",
        accentColor: "#10B981",
      },
      {
        title: "Pending Verification",
        value: s ? (s.pendingVerification ?? 0) : 0,
        iconBorder: "border-[#FDE68A]",
        iconBg: "bg-[#FFFBEB]",
        accentColor: "#F59E0B",
      },
      {
        title: "Pending Payment",
        value: s ? formatCurrency(s.pendingPaymentAmount) : "$0",
        iconBorder: "border-[#FECACA]",
        iconBg: "bg-[#FEF2F2]",
        accentColor: "#EF4444",
      },
    ];
  }, [summaryData]);

  const records = recordsData?.records || [];
  const totalRecords = recordsData?.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));
  const availableProjects = filtersData?.projects || [];
  const verificationOptions = filtersData?.verificationStatuses || ["Verified", "Pending"];
  const paymentOptions = filtersData?.paymentStatuses || ["Completed", "Pending"];

  return (
    <div className="space-y-5">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Vendor Invoices
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-normal">
            Track material vendor invoices, verify deliveries, and manage accounts payable.
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
        </div>
      </div>

      {/* 2. Top 4 Stat Cards */}
      {isSummaryLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100 animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <InvoiceStatsCards cards={metricCards} />
      )}

      {/* 3. Main Invoices Table Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-5 sm:p-6 space-y-5">
        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Material Vendor Invoices
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
                placeholder="Search invoice or vendor"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8.5 pl-8 pr-3 w-40 sm:w-52 rounded-lg border border-slate-200 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>

            {/* Date Range Filter */}
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="inline-flex items-center gap-1.5 h-8.5 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium cursor-pointer shadow-xs transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{dateRangeLabel}</span>
            </button>

            {/* Verification Filter */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowVerificationMenu(!showVerificationMenu);
                  setShowPaymentMenu(false);
                  setShowProjectMenu(false);
                }}
                className={`inline-flex items-center gap-1.5 h-8.5 px-3 bg-white border rounded-lg text-xs font-medium cursor-pointer shadow-xs transition-colors ${
                  selectedVerification !== "All"
                    ? "border-blue-500 text-blue-600 bg-blue-50/40"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  {selectedVerification === "All" ? "Verification" : selectedVerification}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
              </button>

              {showVerificationMenu && (
                <div className="absolute right-0 mt-1.5 w-40 bg-white border border-slate-200 rounded-xl shadow-lg p-1 z-30 space-y-0.5">
                  <button
                    onClick={() => {
                      setSelectedVerification("All");
                      setShowVerificationMenu(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                      selectedVerification === "All"
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    All Verifications
                  </button>
                  {verificationOptions.map((v) => (
                    <button
                      key={v}
                      onClick={() => {
                        setSelectedVerification(v);
                        setShowVerificationMenu(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                        selectedVerification === v
                          ? "bg-blue-50 text-blue-600 font-semibold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Filter */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowPaymentMenu(!showPaymentMenu);
                  setShowVerificationMenu(false);
                  setShowProjectMenu(false);
                }}
                className={`inline-flex items-center gap-1.5 h-8.5 px-3 bg-white border rounded-lg text-xs font-medium cursor-pointer shadow-xs transition-colors ${
                  selectedPayment !== "All"
                    ? "border-blue-500 text-blue-600 bg-blue-50/40"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>{selectedPayment === "All" ? "Payment" : selectedPayment}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
              </button>

              {showPaymentMenu && (
                <div className="absolute right-0 mt-1.5 w-36 bg-white border border-slate-200 rounded-xl shadow-lg p-1 z-30 space-y-0.5">
                  <button
                    onClick={() => {
                      setSelectedPayment("All");
                      setShowPaymentMenu(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                      selectedPayment === "All"
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    All Payments
                  </button>
                  {paymentOptions.map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setSelectedPayment(p);
                        setShowPaymentMenu(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                        selectedPayment === p
                          ? "bg-blue-50 text-blue-600 font-semibold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {p}
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
                  setShowVerificationMenu(false);
                  setShowPaymentMenu(false);
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
                <th className="px-5 py-3 font-bold text-slate-800">INVOICE NUMBER</th>
                <th className="px-5 py-3 font-bold text-slate-800">VENDOR</th>
                <th className="px-5 py-3 font-bold text-slate-800">PROJECT</th>
                <th
                  className="px-5 py-3 font-bold text-slate-800 cursor-pointer select-none"
                  onClick={() => handleSort("amount")}
                >
                  <div className="inline-flex items-center gap-1">
                    AMOUNT
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th
                  className="px-5 py-3 font-bold text-slate-800 cursor-pointer select-none"
                  onClick={() => handleSort("dueDate")}
                >
                  <div className="inline-flex items-center gap-1">
                    DUE DATE
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-5 py-3 font-bold text-slate-800">VERIFICATION</th>
                <th className="px-5 py-3 font-bold text-slate-800">PAYMENT STATUS</th>
                <th className="px-5 py-3 font-bold text-slate-800 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isRecordsLoading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Loading vendor invoices...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                    No vendor invoices found matching criteria.
                  </td>
                </tr>
              ) : (
                records.map((inv) => {
                  const isVerified =
                    inv.verification === "Verified" ||
                    inv.verificationStatus === "approved_for_payment" ||
                    inv.payableStatus === "approved_for_payment" ||
                    inv.payableStatus === "paid";
                  const isPaid =
                    inv.payment === "Completed" ||
                    inv.payment === "Paid" ||
                    inv.paymentStatus === "paid" ||
                    inv.payableStatus === "paid";
                  const canMarkPaid = isVerified && !isPaid;

                  return (
                    <tr
                      key={inv.invoiceId}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-slate-600 font-mono font-medium">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {inv.vendorName || inv.name || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 font-normal">
                        {inv.projectName || inv.project || "—"}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {formatCurrency(inv.amount)}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 font-normal whitespace-nowrap">
                        {formatDisplayDate(inv.dueDate)}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md text-[11px] ${
                            isVerified
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {isVerified ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                          )}
                          {inv.verification || (isVerified ? "Verified" : "Pending")}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md text-[11px] ${
                            isPaid
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {inv.payment || (isPaid ? "Completed" : "Pending")}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {canMarkPaid && (
                            <button
                              onClick={() => handleMarkPaid(inv)}
                              disabled={isMarkingPaid}
                              className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors cursor-pointer"
                            >
                              Mark Paid
                            </button>
                          )}

                          {inv.documentUrl && (
                            <a
                              href={inv.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                              title="Download Invoice"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <button
                            onClick={() =>
                              navigate(`/invoices/vendor-invoices/${inv.invoiceId}`, {
                                state: { invoice: inv },
                              })
                            }
                            className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="View Details"
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
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title={successModalContent.title}
        subTitle={successModalContent.subTitle}
      />
    </div>
  );
}
