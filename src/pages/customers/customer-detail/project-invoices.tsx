import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  ListFilter,
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Hammer,
  ShieldCheck,
  CircleDollarSign,
  LineChart,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  X,
  Loader2,
  RefreshCw,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SuccessModal from "@/components/common_components/SuccessModal";
import {
  useGetProjectInvoicesSummaryQuery,
  useGetProjectInvoiceRecordsQuery,
  useMarkProjectInvoicePaidMutation,
  useFollowUpProjectInvoiceMutation,
  type ProjectInvoiceRecordItem,
} from "@/redux/api/projectApi";
import { formatCurrency, formatDisplayDate } from "@/lib/dashboardFormatters";

export type { ProjectInvoiceRecordItem as InvoiceRowItem };

export default function ProjectInvoicesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId, id, customerId } = useParams<{
    projectId?: string;
    id?: string;
    customerId?: string;
  }>();

  const locationState = location.state as {
    projectName?: string;
    projectId?: string;
    leadId?: string;
    customerName?: string;
    customerId?: string;
  } | null;

  const currentProjectId =
    projectId || id || locationState?.projectId || locationState?.leadId || "";

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Sorting state: backend supports sortBy: "dueDate" | "amount" | "date", sortOrder: "asc" | "desc"
  const [sortField, setSortField] = useState<"dueDate" | "amount" | "date">(
    "date",
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [sortLabel, setSortLabel] = useState("Latest");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Checkbox selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 1. Invoices summary API
  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    refetch: refetchSummary,
  } = useGetProjectInvoicesSummaryQuery(currentProjectId, {
    skip: !currentProjectId,
  });

  // 2. Invoices records API
  const {
    data: recordsResponse,
    isLoading: isRecordsLoading,
    isFetching: isRecordsFetching,
    isError: isRecordsError,
    refetch: refetchRecords,
  } = useGetProjectInvoiceRecordsQuery(
    {
      projectId: currentProjectId,
      page: currentPage,
      limit: rowsPerPage,
      search: debouncedSearch.trim() || undefined,
      paymentStatus: statusFilter === "all" ? undefined : statusFilter,
      sortBy: sortField,
      sortOrder: sortDirection,
    },
    {
      skip: !currentProjectId,
    },
  );

  const records = useMemo(() => {
    return recordsResponse?.records || [];
  }, [recordsResponse]);

  const totalRecords = recordsResponse?.total ?? records.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));

  // 3. Row action mutations
  const [markPaid] = useMarkProjectInvoicePaidMutation();
  const [followUp] = useFollowUpProjectInvoiceMutation();
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    title: string;
    subTitle: string;
  }>({
    isOpen: false,
    title: "",
    subTitle: "",
  });

  const handleMarkPaid = async (invoiceId: string, invoiceNumber: string) => {
    try {
      setActionLoadingId(`${invoiceId}-paid`);
      setActionError(null);
      const res = await markPaid({ invoiceId, projectId: currentProjectId }).unwrap();
      setSuccessModal({
        isOpen: true,
        title: "Invoice Marked as Paid",
        subTitle:
          (res as { message?: string })?.message ||
          `Invoice ${invoiceNumber} marked as paid successfully.`,
      });
    } catch (err: unknown) {
      console.error("Failed to mark invoice as paid:", err);
      const errorMsg =
        (err as { data?: { message?: string }; message?: string })?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to mark invoice as paid. Please try again.";
      setActionError(errorMsg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleFollowUp = async (invoiceId: string, invoiceNumber: string) => {
    try {
      setActionLoadingId(`${invoiceId}-followup`);
      setActionError(null);
      const res = await followUp({ invoiceId, projectId: currentProjectId }).unwrap();
      const channels = res?.data?.channels;
      const channelInfo = channels
        ? [channels.email ? "Email" : null, channels.inApp ? "In-App Notification" : null]
            .filter(Boolean)
            .join(" & ")
        : "";
      setSuccessModal({
        isOpen: true,
        title: "Payment Follow-up Sent",
        subTitle:
          res?.message ||
          `Payment follow-up sent for invoice ${invoiceNumber}${
            channelInfo ? ` via ${channelInfo}` : ""
          }.`,
      });
    } catch (err: unknown) {
      console.error("Failed to send follow-up reminder:", err);
      const errorMsg =
        (err as { data?: { message?: string }; message?: string })?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to send follow-up reminder. Please try again.";
      setActionError(errorMsg);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Determine project title
  const displayProjectName =
    locationState?.projectName ||
    recordsResponse?.projectName ||
    (currentProjectId ? `Project ${currentProjectId}` : "Project");

  // Stat cards matching API summary response
  const stats = [
    {
      title: "Total Invoices",
      value: isSummaryLoading
        ? "..."
        : `${summaryData?.totalInvoices ?? 0} Invoices`,
      bg: "bg-[#1E4D8C]",
      icon: <Hammer className="w-5 h-5 text-[#1E4D8C]" />,
    },
    {
      title: "Paid Amount",
      value: isSummaryLoading
        ? "..."
        : formatCurrency(summaryData?.totalReceived ?? 0),
      bg: "bg-[#22C55E]",
      icon: <ShieldCheck className="w-5 h-5 text-[#22C55E]" />,
    },
    {
      title: "Pending Amount",
      value: isSummaryLoading
        ? "..."
        : formatCurrency(summaryData?.outstandingAmount ?? 0),
      bg: "bg-[#E5A500]",
      icon: <CircleDollarSign className="w-5 h-5 text-[#E5A500]" />,
    },
    {
      title: "Overdue Amount",
      value: isSummaryLoading
        ? "..."
        : formatCurrency(summaryData?.overdueAmount ?? 0),
      hasAlert: (summaryData?.overdueAmount ?? 0) > 0,
      bg: "bg-[#FA743E]",
      icon: <LineChart className="w-5 h-5 text-[#FA743E]" />,
    },
  ];

  // Checkbox handlers
  const allCurrentSelected =
    records.length > 0 &&
    records.every((inv) => selectedIds.includes(inv.invoiceId));

  const toggleSelectAll = () => {
    if (allCurrentSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !records.some((inv) => inv.invoiceId === id)),
      );
    } else {
      const visibleIds = records.map((inv) => inv.invoiceId);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // Header column sort toggle
  const handleHeaderSort = (field: "date" | "amount" | "dueDate") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
      if (field === "date") setSortLabel("Latest");
      else if (field === "amount") setSortLabel("Amount (High-Low)");
      else if (field === "dueDate") setSortLabel("Due Date");
    }
    setCurrentPage(1);
  };

  // Sort dropdown selection
  const handleSortSelect = (
    label: string,
    field: "dueDate" | "amount" | "date",
    dir: "asc" | "desc",
  ) => {
    setSortLabel(label);
    setSortField(field);
    setSortDirection(dir);
    setShowSortDropdown(false);
    setCurrentPage(1);
  };

  // Status badge renderer
  const renderStatusBadge = (statusStr?: string, paymentStatusStr?: string) => {
    const rawStatus = (paymentStatusStr || statusStr || "")
      .toLowerCase()
      .trim();

    if (rawStatus === "paid") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#DCFCE7] text-[#16A34A] border border-[#86EFAC]">
          <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
          Paid
        </span>
      );
    }

    if (rawStatus === "overdue") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
          Overdue
          <AlertCircle className="w-3 h-3 text-[#DC2626]" />
        </span>
      );
    }

    // Default to pending / unpaid
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FEF9C3] text-[#D97706] border border-[#FDE047]">
        {rawStatus === "unpaid" ? "Unpaid" : "Pending"}
        <Clock className="w-3 h-3 text-[#D97706]" />
      </span>
    );
  };

  // Render pagination buttons
  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 6) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        );
      }
    }

    return pages.map((page, index) => {
      if (page === "...") {
        return (
          <span
            key={`dots-${index}`}
            className="text-slate-400 text-xs px-1 select-none"
          >
            ...
          </span>
        );
      }

      const isCurrent = page === currentPage;
      return (
        <button
          key={`page-${page}`}
          type="button"
          onClick={() => setCurrentPage(Number(page))}
          className={`w-7 h-7 rounded-full text-xs transition-colors flex items-center justify-center font-medium ${
            isCurrent
              ? "bg-[#FA743E] text-white font-bold shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          {page}
        </button>
      );
    });
  };

  // If no projectId can be found
  if (!currentProjectId) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4 my-12 bg-white rounded-2xl shadow-xs border border-slate-200">
        <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-600">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Project Not Found</h2>
        <p className="text-xs text-slate-500">
          No project ID was provided in the route parameters or navigation
          state.
        </p>
        <Button
          onClick={() => navigate(-1)}
          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs px-4 py-2"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 1. Header: Back button, Title & Create New Invoice button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="default"
            onClick={() => navigate(-1)}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-white" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {displayProjectName} - Invoices
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {(isRecordsFetching || isSummaryLoading) && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
              <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
              <span>Updating...</span>
            </div>
          )}
          <Button
            type="button"
            onClick={() =>
              navigate("/payments/new-invoice", {
                state: {
                  projectId: currentProjectId,
                  projectName: displayProjectName,
                  customerId,
                },
              })
            }
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-5 py-2.5 rounded-lg font-medium text-sm shadow-xs transition-colors cursor-pointer"
          >
            Create New Invoice
          </Button>
        </div>
      </div>

      {/* 2. 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className={`${stat.bg} rounded-2xl p-5 sm:p-6 text-white flex items-center justify-between shadow-xs transition-transform hover:-translate-y-0.5 duration-200`}
          >
            <div>
              <p className="text-white/85 text-xs sm:text-sm font-normal">
                {stat.title}
              </p>
              <h3 className="text-3xl font-bold mt-1 tracking-tight flex items-center gap-2">
                {stat.value}
                {stat.hasAlert && (
                  <AlertTriangle className="w-5 h-5 text-white inline-block" />
                )}
              </h3>
            </div>
            <div className="bg-white rounded-xl w-12 h-12 flex items-center justify-center shadow-xs shrink-0">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {isSummaryError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>Could not load invoices summary statistics.</span>
          </div>
          <button
            type="button"
            onClick={() => refetchSummary()}
            className="underline font-semibold hover:text-red-900"
          >
            Retry
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-red-500 hover:text-red-700 p-0.5"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. Toolbar: Search, Filter & Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Search input & Filter button */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search invoices"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 w-48 sm:w-56 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-none"
            />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowFilterDropdown(!showFilterDropdown);
                setShowSortDropdown(false);
              }}
              className={`h-9 px-3.5 rounded-lg border bg-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                statusFilter !== "all"
                  ? "border-blue-500 text-blue-600 bg-blue-50/50"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
              <span>Filter</span>
              {statusFilter !== "all" && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              )}
            </button>

            {/* Filter Dropdown Popover */}
            {showFilterDropdown && (
              <div className="absolute left-0 mt-1.5 w-60 bg-white rounded-xl shadow-lg border border-slate-200 p-4 z-20 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800">
                    Filter Invoices
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowFilterDropdown(false)}
                    className="text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">
                    Payment Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full text-xs rounded-md border border-slate-200 p-1.5 text-slate-700 bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-between gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter("all");
                      setShowFilterDropdown(false);
                      setCurrentPage(1);
                    }}
                    className="text-[11px] text-slate-500 hover:text-slate-700 font-medium"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFilterDropdown(false)}
                    className="px-3 py-1 bg-[#2563EB] text-white rounded text-xs font-semibold hover:bg-[#1D4ED8]"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Sort by dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowSortDropdown(!showSortDropdown);
              setShowFilterDropdown(false);
            }}
            className="h-9 px-3.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-none transition-colors cursor-pointer"
          >
            <ListFilter className="h-3.5 w-3.5 text-slate-500" />
            <span>
              Sort by :{" "}
              <span className="font-semibold text-slate-900">{sortLabel}</span>
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-500 ml-0.5" />
          </button>

          {showSortDropdown && (
            <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-lg border border-slate-200 p-1.5 z-20 space-y-0.5">
              <button
                type="button"
                onClick={() => handleSortSelect("Latest", "date", "desc")}
                className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  sortLabel === "Latest"
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                Latest (Date)
              </button>
              <button
                type="button"
                onClick={() => handleSortSelect("Oldest", "date", "asc")}
                className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  sortLabel === "Oldest"
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                Oldest (Date)
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSortSelect("Due Date (Earliest)", "dueDate", "asc")
                }
                className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  sortLabel === "Due Date (Earliest)"
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                Due Date (Earliest)
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSortSelect("Due Date (Latest)", "dueDate", "desc")
                }
                className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  sortLabel === "Due Date (Latest)"
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                Due Date (Latest)
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSortSelect("Amount (High-Low)", "amount", "desc")
                }
                className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  sortLabel === "Amount (High-Low)"
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                Amount (High-Low)
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSortSelect("Amount (Low-High)", "amount", "asc")
                }
                className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  sortLabel === "Amount (Low-High)"
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                Amount (Low-High)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. Table Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-[#F8FAFC] text-xs font-bold text-slate-800">
                <th className="w-12 px-5 py-4">
                  <input
                    type="checkbox"
                    checked={allCurrentSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all invoices"
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="px-5 py-4 font-bold text-slate-800">Invoice</th>
                <th
                  className="px-5 py-4 font-bold text-slate-800 cursor-pointer select-none"
                  onClick={() => handleHeaderSort("amount")}
                >
                  <div className="inline-flex items-center gap-1">
                    Amount
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th
                  className="px-5 py-4 font-bold text-slate-800 cursor-pointer select-none"
                  onClick={() => handleHeaderSort("date")}
                >
                  <div className="inline-flex items-center gap-1">
                    Sent Date
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th
                  className="px-5 py-4 font-bold text-slate-800 cursor-pointer select-none"
                  onClick={() => handleHeaderSort("dueDate")}
                >
                  <div className="inline-flex items-center gap-1">
                    Due Date
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-5 py-4 font-bold text-slate-800">Items</th>
                <th className="px-5 py-4 font-bold text-slate-800">Status</th>
                <th className="px-5 py-4 font-bold text-slate-800 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {isRecordsLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="text-xs text-slate-500">
                        Loading invoices...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : isRecordsError ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 text-red-600">
                      <AlertCircle className="w-6 h-6" />
                      <span className="text-sm font-semibold">
                        Failed to load invoices
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetchRecords()}
                        className="text-xs mt-1"
                      >
                        Try Again
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    No invoices found matching the criteria.
                  </td>
                </tr>
              ) : (
                records.map((inv) => {
                  const normalizedStatus = (
                    inv.paymentStatus ||
                    inv.status ||
                    ""
                  ).toLowerCase();
                  const isPending =
                    normalizedStatus === "pending" ||
                    normalizedStatus === "unpaid";
                  const isOverdue = normalizedStatus === "overdue";

                  return (
                    <tr
                      key={inv.invoiceId}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="w-12 px-5 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(inv.invoiceId)}
                          onChange={() => toggleSelect(inv.invoiceId)}
                          aria-label={`Select invoice ${inv.invoiceNumber}`}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-900 whitespace-nowrap font-mono">
                        <button
                          type="button"
                          onClick={() => {
                            navigate(`/invoices/project-invoices/${inv.invoiceId}`, {
                              state: { invoice: inv },
                            });
                          }}
                          className="hover:text-blue-600 hover:underline cursor-pointer text-left font-mono font-bold"
                        >
                          {inv.invoiceNumber}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-slate-700 font-medium">
                        {formatCurrency(inv.amount)}
                      </td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                        {formatDisplayDate(inv.sentDate || inv.invoiceDate)}
                      </td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                        {inv.dueDate ? formatDisplayDate(inv.dueDate) : "-"}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {inv.items ?? 1}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {renderStatusBadge(inv.status, inv.paymentStatus)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              navigate(`/invoices/project-invoices/${inv.invoiceId}`, {
                                state: { invoice: inv },
                              });
                            }}
                            className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 font-medium hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            Details
                          </button>
                          {isPending ? (
                            <>
                              <Button
                                type="button"
                                disabled={Boolean(actionLoadingId)}
                                onClick={() => handleMarkPaid(inv.invoiceId, inv.invoiceNumber)}
                                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold px-3 py-1.5 h-auto rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                              >
                                {actionLoadingId === `${inv.invoiceId}-paid` ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Saving...
                                  </>
                                ) : (
                                  "Mark as Paid"
                                )}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                disabled={Boolean(actionLoadingId)}
                                onClick={() => handleFollowUp(inv.invoiceId, inv.invoiceNumber)}
                                className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold px-3 py-1.5 h-auto rounded-lg transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                                title="Send payment reminder"
                              >
                                {actionLoadingId === `${inv.invoiceId}-followup` ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Sending...
                                  </>
                                ) : (
                                  <>
                                    <Mail className="w-3 h-3 text-slate-500" />
                                    Follow up
                                  </>
                                )}
                              </Button>
                            </>
                          ) : isOverdue ? (
                            <>
                              <Button
                                type="button"
                                disabled={Boolean(actionLoadingId)}
                                onClick={() => handleFollowUp(inv.invoiceId, inv.invoiceNumber)}
                                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold px-3 py-1.5 h-auto rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                                title="Send overdue payment reminder"
                              >
                                {actionLoadingId === `${inv.invoiceId}-followup` ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Sending...
                                  </>
                                ) : (
                                  <>
                                    <Mail className="w-3 h-3" />
                                    Follow up
                                  </>
                                )}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                disabled={Boolean(actionLoadingId)}
                                onClick={() => handleMarkPaid(inv.invoiceId, inv.invoiceNumber)}
                                className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold px-3 py-1.5 h-auto rounded-lg transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                              >
                                {actionLoadingId === `${inv.invoiceId}-paid` ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Saving...
                                  </>
                                ) : (
                                  "Mark as Paid"
                                )}
                              </Button>
                            </>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Bottom Pagination Bar */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Row Per Page [10 ˅] Entries */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-normal">
          <span>Row Per Page</span>
          <div className="relative">
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="appearance-none bg-white border border-slate-200 rounded-md pl-2.5 pr-6 py-1 text-xs text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-blue-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <span>
            Entries (
            {totalRecords > 0
              ? `${(currentPage - 1) * rowsPerPage + 1}-${Math.min(currentPage * rowsPerPage, totalRecords)} of ${totalRecords}`
              : "0"}
            )
          </span>
        </div>

        {/* Right: < 1 2 3 ... > */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {renderPageNumbers()}

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 6. Success Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal((prev) => ({ ...prev, isOpen: false }))}
        title={successModal.title}
        subTitle={successModal.subTitle}
      />
    </div>
  );
}
