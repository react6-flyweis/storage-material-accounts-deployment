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
  FileText,
  Loader2,
  Mail,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { InvoiceStatsCards, type InvoiceStatCardItem } from "@/components/invoices/InvoiceStatsCards";
import { CalendarRangePickerModal } from "@/components/common_components/CalendarRangePickerModal";
import {
  useGetInvoiceManagementFiltersQuery,
  useGetProjectInvoicesSummaryQuery,
  useGetProjectInvoicesRecordsQuery,
  useMarkProjectInvoicePaidMutation,
  useFollowUpProjectInvoiceMutation,
  downloadInvoiceExport,
  downloadInvoicePdfBinary,
  type ProjectInvoiceRecordItem,
} from "@/redux/api/invoiceManagementApi";
import { formatCurrency, formatDisplayDate, formatDateToIso } from "@/lib/dashboardFormatters";
import SuccessModal from "@/components/common_components/SuccessModal";

interface ProjectInvoicesPageProps {
  tableTitle?: string;
  defaultInvoices?: ProjectInvoiceRecordItem[];
}

export default function ProjectInvoicesPage({
  tableTitle = "Project Invoices",
}: ProjectInvoicesPageProps) {
  const navigate = useNavigate();

  // Query state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedProject, setSelectedProject] = useState<string>("All");
  const [dateRange, setDateRange] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});
  const [dateRangeLabel, setDateRangeLabel] = useState<string>("All Dates");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<"dueDate" | "amount" | "date">("dueDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Feedback Modals
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    title: string;
    subTitle: string;
  }>({
    isOpen: false,
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
  } = useGetProjectInvoicesSummaryQuery(summaryQueryParams);

  // 3. Records Table
  const recordsQueryParams = useMemo(() => {
    return {
      page: currentPage,
      limit: rowsPerPage,
      search: debouncedSearch || undefined,
      projectId: selectedProject !== "All" ? selectedProject : undefined,
      paymentStatus: selectedStatus !== "All" ? selectedStatus.toLowerCase() : undefined,
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
  } = useGetProjectInvoicesRecordsQuery(recordsQueryParams);

  // Mutations
  const [markPaid, { isLoading: isMarkingPaid }] = useMarkProjectInvoicePaidMutation();
  const [followUp, { isLoading: isFollowingUp }] = useFollowUpProjectInvoiceMutation();

  const handleMarkPaid = async (invoiceId: string) => {
    try {
      await markPaid(invoiceId).unwrap();
      setSuccessModal({
        isOpen: true,
        title: "Invoice Marked as Paid",
        subTitle: `Invoice has been successfully updated to Paid.`,
      });
    } catch {
      alert("Failed to mark invoice as paid. Please try again.");
    }
  };

  const handleFollowUp = async (invoiceId: string) => {
    try {
      await followUp(invoiceId).unwrap();
      setSuccessModal({
        isOpen: true,
        title: "Follow-up Sent",
        subTitle: `Overdue reminder notification has been triggered for this invoice.`,
      });
    } catch {
      alert("Failed to send follow-up reminder. Please try again.");
    }
  };

  const handleSort = (field: "amount" | "date" | "dueDate") => {
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
        "project",
        {
          projectId: selectedProject !== "All" ? selectedProject : undefined,
          paymentStatus: selectedStatus !== "All" ? selectedStatus.toLowerCase() : undefined,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
        `project-invoices-${new Date().toISOString().split("T")[0]}.xlsx`
      );
    } catch (err: unknown) {
      console.warn("Direct export returned error, falling back to client CSV:", err);
      // Fallback CSV export
      const records = recordsData?.records || [];
      const headers = ["INVOICE NUMBER", "PROJECT", "CUSTOMER", "TYPE", "AMOUNT", "DUE DATE", "PAYMENT STATUS"];
      const rows = records.map((r) => [
        r.invoiceNumber || r.invoiceId,
        r.projectName || r.project || "",
        r.customerName || "",
        r.invoiceTypeLabel || r.invoiceType || "",
        r.amount.toString(),
        r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "",
        r.paymentStatus || "",
      ]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `project-invoices-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsExporting(false);
    }
  };

  // Format 4 Metric Cards for display
  const metricCards: InvoiceStatCardItem[] = useMemo(() => {
    const s = summaryData;
    return [
      {
        title: "Total Invoices",
        value: s ? s.totalInvoices : 0,
        iconBorder: "border-[#DDD6FE]",
        iconBg: "bg-[#F5F3FF]",
        accentColor: "#8B5CF6",
      },
      {
        title: "Invoice Amount",
        value: s ? formatCurrency(s.invoiceAmount ?? s.totalBilled) : "$0",
        iconBorder: "border-[#A7F3D0]",
        iconBg: "bg-[#ECFDF5]",
        accentColor: "#10B981",
      },
      {
        title: "Total Received",
        value: s ? formatCurrency(s.totalReceived) : "$0",
        iconBorder: "border-[#BAE6FD]",
        iconBg: "bg-[#F0F9FF]",
        accentColor: "#0284C7",
      },
      {
        title: "Outstanding Amount",
        value: s ? formatCurrency(s.outstandingAmount) : "$0",
        iconBorder: "border-[#FECACA]",
        iconBg: "bg-[#FEF2F2]",
        accentColor: "#EF4444",
      },
    ];
  }, [summaryData]);

  const records = recordsData?.records || [];
  const totalRecords = recordsData?.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));

  // Projects list from shared filters or dynamic
  const availableProjects = filtersData?.projects || [];

  return (
    <div className="space-y-5">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Invoice Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-normal">
            Track customer accounts receivable, billing, payments, and overdue follow-ups.
          </p>
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          {isExporting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-600" />
          ) : (
            <Upload className="w-3.5 h-3.5 text-slate-600 rotate-90" />
          )}
          Export Excel
        </button>
      </div>

      {/* 2. 4 Summary Metric Cards */}
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
        {/* Table Card Header Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {tableTitle}
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
                placeholder="Search invoice #"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8.5 pl-8 pr-3 w-36 sm:w-48 rounded-lg border border-slate-200 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 bg-white"
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
                <span>
                  {selectedStatus === "All" ? "Status" : selectedStatus}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
              </button>

              {showStatusMenu && (
                <div className="absolute right-0 mt-1.5 w-36 bg-white border border-slate-200 rounded-xl shadow-lg p-1 z-30 space-y-0.5">
                  {["All", "Paid", "Pending", "Overdue"].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setSelectedStatus(status);
                        setShowStatusMenu(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                        selectedStatus === status
                          ? "bg-blue-50 text-blue-600 font-semibold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {status === "All" ? "All Statuses" : status}
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

        {/* Invoices Table */}
        <div className="overflow-x-auto -mx-5 sm:mx-0">
          <table className="w-full text-left border-collapse min-w-190">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3 font-bold text-slate-800">INVOICE NUMBER</th>
                <th className="px-5 py-3 font-bold text-slate-800">PROJECT</th>
                <th className="px-5 py-3 font-bold text-slate-800">CUSTOMER</th>
                <th className="px-5 py-3 font-bold text-slate-800">INVOICE TYPE</th>
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
                  onClick={() => handleSort("date")}
                >
                  <div className="inline-flex items-center gap-1">
                    INV DATE
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
                <th className="px-5 py-3 font-bold text-slate-800">PAYMENT STATUS</th>
                <th className="px-5 py-3 font-bold text-slate-800 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isRecordsLoading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Loading invoices...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-slate-400">
                    No invoices found matching criteria.
                  </td>
                </tr>
              ) : (
                records.map((inv) => {
                  const isPaid =
                    inv.paymentStatus === "Paid" ||
                    inv.paymentStatus === "Complete" ||
                    inv.invoiceStatus === "paid";
                  const isOverdue = inv.invoiceStatus === "overdue";

                  return (
                    <tr
                      key={inv.invoiceId}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-slate-600 font-mono font-medium">
                        <button
                          type="button"
                          onClick={() => {
                            navigate(`/invoices/project-invoices/${inv.invoiceId}`, {
                              state: { invoice: inv },
                            });
                          }}
                          className="hover:text-blue-600 hover:underline cursor-pointer text-left font-mono font-medium"
                        >
                          {inv.invoiceNumber || inv.invoiceId}
                        </button>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {inv.projectName || inv.project || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 font-normal">
                        {inv.customerName || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 font-normal">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 capitalize">
                          {inv.invoiceTypeLabel || inv.invoiceType || "General"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {formatCurrency(inv.amount)}
                        {inv.amountDue !== undefined && inv.amountDue > 0 && inv.amountDue !== inv.amount && (
                          <span className="block text-[10px] text-slate-400 font-normal">
                            Due: {formatCurrency(inv.amountDue)}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 font-normal whitespace-nowrap">
                        {formatDisplayDate(inv.invoiceDate || inv.dueDate)}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 font-normal whitespace-nowrap">
                        {formatDisplayDate(inv.dueDate)}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md text-[11px] ${
                            isPaid
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : isOverdue
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {isPaid ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : isOverdue ? (
                            <AlertCircle className="w-3 h-3 text-red-600" />
                          ) : null}
                          {isPaid ? "Paid" : isOverdue ? "Overdue" : inv.paymentStatus || "Pending"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {/* Mark as paid button */}
                          {!isPaid && (
                            <button
                              onClick={() => handleMarkPaid(inv.invoiceId)}
                              disabled={isMarkingPaid}
                              className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors cursor-pointer"
                            >
                              Mark Paid
                            </button>
                          )}

                          {/* Follow-up button */}
                          {isOverdue && (
                            <button
                              onClick={() => handleFollowUp(inv.invoiceId)}
                              disabled={isFollowingUp}
                              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition-colors cursor-pointer"
                              title="Send overdue payment reminder"
                            >
                              <Mail className="w-3 h-3" />
                              Follow Up
                            </button>
                          )}

                          {/* Download PDF Binary */}
                          {(inv.pdfUrl || inv.documentUrl) && (
                            <button
                              type="button"
                              onClick={() => {
                                downloadInvoicePdfBinary(
                                  inv.invoiceId,
                                  inv.invoiceNumber,
                                  inv.pdfUrl || inv.documentUrl
                                ).catch(() => {
                                  if (inv.pdfUrl || inv.documentUrl) {
                                    window.open(inv.pdfUrl || inv.documentUrl || "", "_blank");
                                  }
                                });
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors cursor-pointer"
                              title="Download PDF"
                            >
                              <FileText className="w-3 h-3" />
                              PDF
                            </button>
                          )}

                          {/* View details */}
                          <button
                            type="button"
                            onClick={() => {
                              navigate(`/invoices/project-invoices/${inv.invoiceId}`, {
                                state: { invoice: inv },
                              });
                            }}
                            className="px-2.5 py-1 text-[11px] text-slate-600 hover:text-slate-900 font-medium hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          >
                            Details
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

        {/* 4. Pagination */}
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
          if (range?.from && range?.to) {
            const startStr = formatDateToIso(range.from);
            const endStr = formatDateToIso(range.to);
            setDateRange({ startDate: startStr, endDate: endStr });
            setDateRangeLabel(`${formatDisplayDate(startStr)} - ${formatDisplayDate(endStr)}`);
          } else {
            setDateRange({});
            setDateRangeLabel("All Dates");
          }
          setCurrentPage(1);
        }}
      />

      {/* Success Notification Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal((prev) => ({ ...prev, isOpen: false }))}
        title={successModal.title}
        subTitle={successModal.subTitle}
      />
    </div>
  );
}
