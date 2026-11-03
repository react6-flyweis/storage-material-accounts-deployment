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
  Eye,
  X,
  FileText,
  RefreshCw,
  Loader2,
  ExternalLink,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useGetProjectPaymentsSummaryQuery,
  useGetProjectPaymentRecordsQuery,
  type ProjectPaymentRecordItem,
} from "@/redux/api/projectApi";
import { formatCurrency, formatDisplayDate } from "@/lib/dashboardFormatters";

export type { ProjectPaymentRecordItem as PaymentItem };

export default function ProjectPaymentsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId, id } = useParams<{
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Sorting state
  const [sortField, setSortField] = useState<"date" | "amount">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [sortLabel, setSortLabel] = useState("Latest");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Preview modal state
  const [previewPayment, setPreviewPayment] =
    useState<ProjectPaymentRecordItem | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 1. Payments summary API
  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    refetch: refetchSummary,
  } = useGetProjectPaymentsSummaryQuery(currentProjectId, {
    skip: !currentProjectId,
  });

  // 2. Payments records API
  const {
    data: recordsResponse,
    isLoading: isRecordsLoading,
    isFetching: isRecordsFetching,
    isError: isRecordsError,
    refetch: refetchRecords,
  } = useGetProjectPaymentRecordsQuery(
    {
      projectId: currentProjectId,
      page: currentPage,
      limit: rowsPerPage,
      search: debouncedSearch.trim() || undefined,
      status: statusFilter === "all" ? undefined : statusFilter,
    },
    {
      skip: !currentProjectId,
    }
  );

  const rawRecords = recordsResponse?.records || [];

  // Filter & sort payments
  const records = useMemo(() => {
    const list = rawRecords.filter((item) => {
      const q = debouncedSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (item.invoiceNumber && item.invoiceNumber.toLowerCase().includes(q)) ||
        (item.relatedTo && item.relatedTo.toLowerCase().includes(q)) ||
        (item.status && item.status.toLowerCase().includes(q)) ||
        (item.source && item.source.toLowerCase().includes(q)) ||
        (item.amount !== undefined && String(item.amount).includes(q)) ||
        (item.date && item.date.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === "all" ||
        (item.status &&
          (item.status.toLowerCase() === statusFilter.toLowerCase() ||
            (statusFilter.toLowerCase() === "received" &&
              item.status.toLowerCase() === "recieved")));

      return matchesSearch && matchesStatus;
    });

    return list.slice().sort((a, b) => {
      if (sortField === "amount") {
        const valA = Number(a.amount) || 0;
        const valB = Number(b.amount) || 0;
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }
      const timeA = new Date(a.date).getTime() || 0;
      const timeB = new Date(b.date).getTime() || 0;
      return sortDirection === "asc" ? timeA - timeB : timeB - timeA;
    });
  }, [rawRecords, debouncedSearch, statusFilter, sortField, sortDirection]);

  const totalRecords = recordsResponse?.total ?? records.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));

  const displayProjectName =
    locationState?.projectName ||
    recordsResponse?.projectName ||
    (currentProjectId ? `Project ${currentProjectId}` : "Project 1");

  // Stat cards matching API summary response
  const stats = [
    {
      title: "Total Payments Received",
      value: isSummaryLoading
        ? "..."
        : formatCurrency(summaryData?.totalPaymentsReceived ?? 0),
      bg: "bg-[#1E4D8C]",
      icon: <Hammer className="w-5 h-5 text-[#1E4D8C]" />,
    },
    {
      title: "Payment Completion",
      value: isSummaryLoading
        ? "..."
        : `${
            summaryData?.paymentCompletionPct !== undefined
              ? summaryData.paymentCompletionPct % 1 === 0
                ? summaryData.paymentCompletionPct
                : summaryData.paymentCompletionPct.toFixed(2)
              : 0
          }%`,
      bg: "bg-[#22C55E]",
      icon: <ShieldCheck className="w-5 h-5 text-[#22C55E]" />,
    },
    {
      title: "Pending Amount",
      value: isSummaryLoading
        ? "..."
        : formatCurrency(summaryData?.pendingAmount ?? 0),
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

  // Header column sort toggle
  const handleHeaderSort = (field: "date" | "amount") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
      if (field === "date") setSortLabel("Latest");
      else if (field === "amount") setSortLabel("Amount (High-Low)");
    }
    setCurrentPage(1);
  };

  // Sort dropdown selection
  const handleSortSelect = (
    label: string,
    field: "date" | "amount",
    dir: "asc" | "desc"
  ) => {
    setSortLabel(label);
    setSortField(field);
    setSortDirection(dir);
    setShowSortDropdown(false);
    setCurrentPage(1);
  };

  // Downloading state tracking by paymentId
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Helper to resolve full downloadable URL (prepending origin if relative path)
  const getFullDownloadUrl = (url?: string | null) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
    return `${apiBaseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  // Helper to trigger saving a blob to file
  const triggerBlobSave = (blob: Blob, filename: string) => {
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  };

  // Navigate to invoice detail page
  const handleViewInvoiceDetail = (item: ProjectPaymentRecordItem) => {
    const targetInvoiceId = item.invoiceId || item.invoiceNumber || item.paymentId;
    if (!targetInvoiceId) return;

    // Use current project id or location state
    const projId = currentProjectId || locationState?.projectId || "";
    const customerId = locationState?.customerId || "";

    const navOptions = {
      state: {
        invoiceId: item.invoiceId,
        invoiceNumber: item.invoiceNumber,
        projectId: projId,
        projectName: displayProjectName,
        customerName: locationState?.customerName,
        customerId: customerId,
        payment: item,
      },
    };

    if (projId) {
      navigate(`/customers/projects/${projId}/project-invoices/${targetInvoiceId}`, navOptions);
    } else {
      navigate(`/invoices/project-invoices/${targetInvoiceId}`, navOptions);
    }
  };

  // Download payment receipt / invoice document handler as binary blob
  const handleDownloadInvoice = async (item: ProjectPaymentRecordItem) => {
    const itemKey = item.paymentId || item.invoiceId;
    setDownloadingId(itemKey);

    const invoiceIdentifier = item.invoiceNumber || item.invoiceId || item.paymentId;
    const defaultFilename = `Invoice_${invoiceIdentifier}.pdf`;

    try {
      const apiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
      const token = (await import("@/redux/store")).store.getState().auth?.accessToken;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      // 1. Build candidates to fetch binary
      const candidateUrls: string[] = [];
      if (item.documentUrl) {
        candidateUrls.push(getFullDownloadUrl(item.documentUrl));
      }
      if (item.invoiceId) {
        candidateUrls.push(`${apiBase}/api/invoices/${encodeURIComponent(item.invoiceId)}/pdf`);
        candidateUrls.push(`${apiBase}/api/invoices/${encodeURIComponent(item.invoiceId)}/download`);
        candidateUrls.push(`${apiBase}/api/account/invoices/${encodeURIComponent(item.invoiceId)}/pdf`);
      }
      if (item.paymentId) {
        candidateUrls.push(`${apiBase}/api/account/payments/${encodeURIComponent(item.paymentId)}/receipt`);
        candidateUrls.push(`${apiBase}/api/account/payments/${encodeURIComponent(item.paymentId)}/download`);
      }

      let downloadedBlob: Blob | null = null;
      for (const url of candidateUrls) {
        try {
          const response = await fetch(url, { headers });
          if (response.ok) {
            downloadedBlob = await response.blob();
            break;
          }
        } catch {
          // continue to next candidate
        }
      }

      if (downloadedBlob && downloadedBlob.size > 0) {
        // Derive filename if documentUrl has a file extension
        let filename = defaultFilename;
        if (item.documentUrl) {
          const urlParts = item.documentUrl.split("?")[0].split("/");
          const lastPart = urlParts[urlParts.length - 1];
          if (lastPart && lastPart.includes(".")) {
            filename = lastPart;
          }
        }
        triggerBlobSave(downloadedBlob, filename);
        return;
      }

      // 2. Fallback: Generate receipt text file if no remote binary was retrieved
      const textContent = `PAYMENT RECEIPT
Payment ID: ${item.paymentId}
Invoice: ${item.invoiceNumber || item.invoiceId || "N/A"}
Date: ${formatDisplayDate(item.date)}
Amount: ${formatCurrency(item.amount)}
Related To: ${item.relatedTo}
Status: ${item.status}
Source: ${item.source || "N/A"}
Project: ${displayProjectName}
`;
      const fallbackBlob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
      triggerBlobSave(fallbackBlob, `Receipt_${item.invoiceNumber || item.paymentId}.txt`);
    } catch (error) {
      console.error("Failed to download payment file:", error);
      // Fallback text receipt on any unexpected error
      const textContent = `PAYMENT RECEIPT\nPayment ID: ${item.paymentId}\nInvoice: ${item.invoiceNumber || item.invoiceId || "N/A"}\nAmount: ${formatCurrency(item.amount)}\n`;
      const fallbackBlob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
      triggerBlobSave(fallbackBlob, `Receipt_${item.invoiceNumber || item.paymentId}.txt`);
    } finally {
      setDownloadingId(null);
    }
  };

  // Render status badge
  const renderStatusBadge = (statusStr?: string) => {
    const rawStatus = (statusStr || "").toLowerCase().trim();

    if (rawStatus === "received" || rawStatus === "recieved" || rawStatus === "paid") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#DCFCE7] text-[#16A34A] border border-[#86EFAC]">
          <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
          Received
        </span>
      );
    }

    if (rawStatus === "overdue" || rawStatus === "failed") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
          Overdue
          <AlertCircle className="w-3 h-3 text-[#DC2626]" />
        </span>
      );
    }

    // Default: pending / unpaid
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FEF9C3] text-[#D97706] border border-[#FDE047]">
        Pending
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
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
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
          className={`w-7 h-7 rounded-full text-xs transition-colors flex items-center justify-center font-medium cursor-pointer ${
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
          No project ID was provided in the route parameters or navigation state.
        </p>
        <Button
          onClick={() => navigate(-1)}
          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs px-4 py-2 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 1. Header: Back button & Title */}
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
            {displayProjectName} - Payments
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {(isRecordsFetching || isSummaryLoading) && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
              <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
              <span>Updating...</span>
            </div>
          )}
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
            <span>Could not load payments summary statistics.</span>
          </div>
          <button
            type="button"
            onClick={() => refetchSummary()}
            className="underline font-semibold hover:text-red-900 cursor-pointer"
          >
            Retry
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
              placeholder="Search payments"
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
                    Filter Payments
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowFilterDropdown(false)}
                    className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
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
                    <option value="Received">Received</option>
                    <option value="Pending">Pending</option>
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
                    className="text-[11px] text-slate-500 hover:text-slate-700 font-medium cursor-pointer"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFilterDropdown(false)}
                    className="px-3 py-1 bg-[#2563EB] text-white rounded text-xs font-semibold hover:bg-[#1D4ED8] cursor-pointer"
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
                className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
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
                className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
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
                  handleSortSelect("Amount (High-Low)", "amount", "desc")
                }
                className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
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
                className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
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
                <th
                  className="px-5 py-4 font-bold text-slate-800 cursor-pointer select-none"
                  onClick={() => handleHeaderSort("date")}
                >
                  <div className="inline-flex items-center gap-1">
                    Date
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th
                  className="px-5 py-4 font-bold text-slate-800 cursor-pointer select-none"
                  onClick={() => handleHeaderSort("amount")}
                >
                  <div className="inline-flex items-center gap-1">
                    Amount
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-5 py-4 font-bold text-slate-800">
                  Related To
                </th>
                <th className="px-5 py-4 font-bold text-slate-800">
                  Status
                </th>
                <th className="px-5 py-4 font-bold text-slate-800">
                  Invoice
                </th>
                <th className="px-5 py-4 font-bold text-slate-800 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {isRecordsLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="text-xs text-slate-500">
                        Loading payments...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : isRecordsError ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 text-red-600">
                      <AlertCircle className="w-6 h-6" />
                      <span className="text-sm font-semibold">
                        Failed to load payments
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetchRecords()}
                        className="text-xs mt-1 cursor-pointer"
                      >
                        Try Again
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-slate-400"
                  >
                    No payment records found.
                  </td>
                </tr>
              ) : (
                records.map((item) => (
                  <tr
                    key={item.paymentId || item.invoiceId}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-5 py-4 text-slate-700 font-normal whitespace-nowrap">
                      {formatDisplayDate(item.date)}
                    </td>
                    <td className="px-5 py-4 text-slate-900 font-semibold whitespace-nowrap">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="px-5 py-4 text-slate-700 font-normal whitespace-nowrap">
                      {item.relatedTo || "-"}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {renderStatusBadge(item.status)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {item.invoiceNumber || item.invoiceId ? (
                          <button
                            type="button"
                            onClick={() => handleViewInvoiceDetail(item)}
                            className="font-mono text-xs text-slate-700 hover:text-blue-600 hover:underline cursor-pointer font-medium text-left"
                            title="View invoice detail"
                          >
                            {item.invoiceNumber || item.invoiceId}
                          </button>
                        ) : (
                          <span className="font-mono text-xs text-slate-700">-</span>
                        )}
                        {item.source && (
                          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {item.source.replace(/_/g, " ")}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <Button
                          type="button"
                          disabled={downloadingId === (item.paymentId || item.invoiceId)}
                          onClick={() => handleDownloadInvoice(item)}
                          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold px-4 py-1.5 h-auto rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                        >
                          {downloadingId === (item.paymentId || item.invoiceId) ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Download className="w-3 h-3" />
                          )}
                          <span>
                            {downloadingId === (item.paymentId || item.invoiceId)
                              ? "Downloading..."
                              : "Download"}
                          </span>
                        </Button>
                        <button
                          type="button"
                          onClick={() => handleViewInvoiceDetail(item)}
                          title="View invoice details"
                          className="p-1 text-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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

      {/* Preview Invoice / Payment Details Modal */}
      {previewPayment && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Payment Details - {previewPayment.invoiceNumber || previewPayment.paymentId}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPayment(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 bg-[#F8FAFC] rounded-xl p-4 border border-slate-100 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Payment ID</span>
                <span className="font-bold text-slate-800 font-mono text-[11px]">
                  {previewPayment.paymentId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice Number</span>
                <span className="font-bold text-slate-800 font-mono">
                  {previewPayment.invoiceNumber || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date</span>
                <span className="font-semibold text-slate-800">
                  {formatDisplayDate(previewPayment.date)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(previewPayment.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Related To</span>
                <span className="font-semibold text-slate-800">
                  {previewPayment.relatedTo || "-"}
                </span>
              </div>
              {previewPayment.source && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Source</span>
                  <span className="font-medium text-slate-800 capitalize">
                    {previewPayment.source.replace(/_/g, " ")}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Status</span>
                <span>{renderStatusBadge(previewPayment.status)}</span>
              </div>
              {previewPayment.documentUrl && (
                <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                  <span className="text-slate-500">Document</span>
                  <a
                    href={getFullDownloadUrl(previewPayment.documentUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    <span>View File</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewPayment(null)}
                className="text-xs cursor-pointer"
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  handleDownloadInvoice(previewPayment);
                  setPreviewPayment(null);
                }}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>
                  {previewPayment.documentUrl ? "Download Document" : "Download Receipt"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
