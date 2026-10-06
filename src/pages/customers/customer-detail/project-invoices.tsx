import { useState, useMemo } from "react";
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
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMarkInvoicePaidMutation } from "@/redux/api/customerApi";

export interface InvoiceRowItem {
  id: string;
  invoiceNumber: string;
  amount: number;
  amountFormatted: string;
  sentDate: string;
  sentDateRaw: string;
  items: number;
  status: "Pending" | "Paid" | "Overdue";
}

const INITIAL_INVOICES: InvoiceRowItem[] = [
  {
    id: "inv-1001",
    invoiceNumber: "INV-1001",
    amount: 30000,
    amountFormatted: "$30,000",
    sentDate: "22 Feb 2025",
    sentDateRaw: "2025-02-22",
    items: 125,
    status: "Pending",
  },
  {
    id: "inv-1002",
    invoiceNumber: "INV-1002",
    amount: 30000,
    amountFormatted: "$30,000",
    sentDate: "07 Feb 2025",
    sentDateRaw: "2025-02-07",
    items: 98,
    status: "Paid",
  },
  {
    id: "inv-1003",
    invoiceNumber: "INV-1003",
    amount: 30000,
    amountFormatted: "$30,000",
    sentDate: "30 Jan 2025",
    sentDateRaw: "2025-01-30",
    items: 210,
    status: "Overdue",
  },
  {
    id: "inv-1004",
    invoiceNumber: "INV-1004",
    amount: 30000,
    amountFormatted: "$30,000",
    sentDate: "17 Jan 2025",
    sentDateRaw: "2025-01-17",
    items: 125,
    status: "Pending",
  },
  {
    id: "inv-1005",
    invoiceNumber: "INV-1005",
    amount: 30000,
    amountFormatted: "$30,000",
    sentDate: "04 Jan 2025",
    sentDateRaw: "2025-01-04",
    items: 98,
    status: "Paid",
  },
  {
    id: "inv-1006",
    invoiceNumber: "INV-1006",
    amount: 30000,
    amountFormatted: "$30,000",
    sentDate: "09 Dec 2024",
    sentDateRaw: "2024-12-09",
    items: 210,
    status: "Overdue",
  },
];

export default function ProjectInvoicesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId, id } = useParams<{
    projectId?: string;
    id?: string;
  }>();

  const state = location.state as {
    projectName?: string;
    projectId?: string;
    customerName?: string;
  } | null;

  const currentProjectId = projectId || id || state?.projectId;
  const projectTitle =
    state?.projectName ||
    (currentProjectId ? `Project ${currentProjectId}` : "Project 1");

  // Invoices list state
  const [invoices, setInvoices] = useState<InvoiceRowItem[]>(INITIAL_INVOICES);
  const [markPaidMutation] = useMarkInvoicePaidMutation();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Sorting state
  const [sortField, setSortField] = useState<"sentDate" | "items" | "amount">("sentDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [sortLabel, setSortLabel] = useState("Latest");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Checkbox selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination state: Default page 4 as shown in the screenshot
  const [currentPage, setCurrentPage] = useState(4);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const totalDisplayPages = 15;

  // Follow-up modal state
  const [followUpInvoice, setFollowUpInvoice] = useState<InvoiceRowItem | null>(null);
  const [followUpSuccess, setFollowUpSuccess] = useState(false);

  // Stat cards data matching the image
  const totalInvoicesCount = invoices.length;
  const paidAmount = "$100,000";
  const pendingAmount = "$20,000";
  const overdueAmount = "$8,000";

  const stats = [
    {
      title: "Total Invoices",
      value: `${totalInvoicesCount} Invoices`,
      bg: "bg-[#1E4D8C]",
      icon: <Hammer className="w-5 h-5 text-[#1E4D8C]" />,
    },
    {
      title: "Paid Amount",
      value: paidAmount,
      bg: "bg-[#22C55E]",
      icon: <ShieldCheck className="w-5 h-5 text-[#22C55E]" />,
    },
    {
      title: "Pending Amount",
      value: pendingAmount,
      bg: "bg-[#E5A500]",
      icon: <CircleDollarSign className="w-5 h-5 text-[#E5A500]" />,
    },
    {
      title: "Overdue Amount",
      value: overdueAmount,
      hasAlert: true,
      bg: "bg-[#FA743E]",
      icon: <LineChart className="w-5 h-5 text-[#FA743E]" />,
    },
  ];

  // Filtering & Sorting
  const filteredAndSortedInvoices = useMemo(() => {
    let result = [...invoices];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.amountFormatted.toLowerCase().includes(q) ||
          inv.sentDate.toLowerCase().includes(q) ||
          inv.status.toLowerCase().includes(q) ||
          String(inv.items).includes(q)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(
        (inv) => inv.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === "sentDate") {
        comparison =
          new Date(a.sentDateRaw).getTime() - new Date(b.sentDateRaw).getTime();
      } else if (sortField === "items") {
        comparison = a.items - b.items;
      } else if (sortField === "amount") {
        comparison = a.amount - b.amount;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [invoices, searchTerm, statusFilter, sortField, sortDirection]);

  // Projects visible on current page
  const visibleInvoices = useMemo(() => {
    if (searchTerm || statusFilter !== "all") {
      const start = (Math.max(1, currentPage) - 1) * rowsPerPage;
      return filteredAndSortedInvoices.slice(start, start + rowsPerPage);
    }
    // Default mock pagination view shows the 6 invoices
    return filteredAndSortedInvoices;
  }, [filteredAndSortedInvoices, currentPage, rowsPerPage, searchTerm, statusFilter]);

  // Checkbox handlers
  const allCurrentSelected =
    visibleInvoices.length > 0 &&
    visibleInvoices.every((inv) => selectedIds.includes(inv.id));

  const toggleSelectAll = () => {
    if (allCurrentSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !visibleInvoices.some((inv) => inv.id === id))
      );
    } else {
      const visibleIds = visibleInvoices.map((inv) => inv.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Header column sort
  const handleSort = (field: "sentDate" | "items") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Sort dropdown selector
  const handleSortSelect = (
    label: string,
    field: "sentDate" | "items" | "amount",
    dir: "asc" | "desc"
  ) => {
    setSortLabel(label);
    setSortField(field);
    setSortDirection(dir);
    setShowSortDropdown(false);
  };

  // Mark as Paid action
  const handleMarkAsPaid = async (invId: string) => {
    try {
      await markPaidMutation(invId).unwrap();
    } catch {
      // ignore
    }
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invId ? { ...inv, status: "Paid" as const } : inv
      )
    );
  };

  // Status badge renderer matching image
  const renderStatusBadge = (status: "Pending" | "Paid" | "Overdue") => {
    switch (status) {
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FEF9C3] text-[#D97706] border border-[#FDE047]">
            Pending
            <Clock className="w-3 h-3 text-[#D97706]" />
          </span>
        );
      case "Paid":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#DCFCE7] text-[#16A34A] border border-[#86EFAC]">
            <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
            Paid
          </span>
        );
      case "Overdue":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
            Overdue
            <AlertCircle className="w-3 h-3 text-[#DC2626]" />
          </span>
        );
    }
  };

  // Render pagination buttons matching < 1 2 3 4 ... 15 > with orange active circle
  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalDisplayPages <= 6) {
      for (let i = 1; i <= totalDisplayPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, "...", totalDisplayPages);
      } else if (currentPage >= totalDisplayPages - 3) {
        pages.push(
          1,
          "...",
          totalDisplayPages - 3,
          totalDisplayPages - 2,
          totalDisplayPages - 1,
          totalDisplayPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalDisplayPages
        );
      }
    }

    return pages.map((page, index) => {
      if (page === "...") {
        return (
          <span key={`dots-${index}`} className="text-slate-400 text-xs px-1 select-none">
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen bg-[#F0F4F8]">
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
            {projectTitle.startsWith("Project") ? projectTitle : `Project 1`} - Invoices
          </h1>
        </div>

        <Button
          type="button"
          onClick={() => navigate("/payments/new-invoice")}
          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-5 py-2.5 rounded-lg font-medium text-sm shadow-xs transition-colors cursor-pointer"
        >
          Create New Invoice
        </Button>
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

      {/* 3. Toolbar: Search, Filter & Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Search input & Filter button */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
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
                    Status
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
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
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

        {/* Right: Sort by : Latest dropdown */}
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
              Sort by : <span className="font-semibold text-slate-900">{sortLabel}</span>
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-500 ml-0.5" />
          </button>

          {showSortDropdown && (
            <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-slate-200 p-1.5 z-20 space-y-0.5">
              <button
                type="button"
                onClick={() => handleSortSelect("Latest", "sentDate", "desc")}
                className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  sortLabel === "Latest"
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                Latest
              </button>
              <button
                type="button"
                onClick={() => handleSortSelect("Oldest", "sentDate", "asc")}
                className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  sortLabel === "Oldest"
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                Oldest
              </button>
              <button
                type="button"
                onClick={() => handleSortSelect("Items (High-Low)", "items", "desc")}
                className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  sortLabel === "Items (High-Low)"
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                Items (High-Low)
              </button>
              <button
                type="button"
                onClick={() => handleSortSelect("Amount (High-Low)", "amount", "desc")}
                className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  sortLabel === "Amount (High-Low)"
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                Amount (High-Low)
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
                <th className="px-5 py-4 font-bold text-slate-800">Amount</th>
                <th
                  className="px-5 py-4 font-bold text-slate-800 cursor-pointer select-none"
                  onClick={() => handleSort("sentDate")}
                >
                  <div className="inline-flex items-center gap-1">
                    Sent Date
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th
                  className="px-5 py-4 font-bold text-slate-800 cursor-pointer select-none"
                  onClick={() => handleSort("items")}
                >
                  <div className="inline-flex items-center gap-1">
                    Items
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-5 py-4 font-bold text-slate-800">Status</th>
                <th className="px-5 py-4 font-bold text-slate-800 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {visibleInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    No invoices found matching the criteria.
                  </td>
                </tr>
              ) : (
                visibleInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="w-12 px-5 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(inv.id)}
                        onChange={() => toggleSelect(inv.id)}
                        aria-label={`Select invoice ${inv.invoiceNumber}`}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900 whitespace-nowrap font-mono">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-5 py-4 text-slate-700 font-medium">
                      {inv.amountFormatted}
                    </td>
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                      {inv.sentDate}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {inv.items}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {renderStatusBadge(inv.status)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {inv.status === "Pending" ? (
                        <Button
                          type="button"
                          onClick={() => handleMarkAsPaid(inv.id)}
                          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold px-4 py-1.5 h-auto rounded-lg shadow-xs transition-colors cursor-pointer"
                        >
                          Mark as Paid
                        </Button>
                      ) : inv.status === "Overdue" ? (
                        <Button
                          type="button"
                          onClick={() => setFollowUpInvoice(inv)}
                          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold px-4 py-1.5 h-auto rounded-lg shadow-xs transition-colors cursor-pointer"
                        >
                          Follow up
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Bottom Pagination Bar matching screenshot */}
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
          <span>Entries</span>
        </div>

        {/* Right: < 1 2 3 4 ... 15 > */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {renderPageNumbers()}

          <button
            type="button"
            disabled={currentPage === totalDisplayPages}
            onClick={() => setCurrentPage((p) => Math.min(totalDisplayPages, p + 1))}
            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Follow-up Reminder Modal */}
      {followUpInvoice && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Payment Follow-up
              </h3>
              <button
                type="button"
                onClick={() => {
                  setFollowUpInvoice(null);
                  setFollowUpSuccess(false);
                }}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {followUpSuccess ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center space-y-2">
                <p className="text-sm font-semibold text-green-800">
                  Follow-up reminder sent successfully!
                </p>
                <p className="text-xs text-green-600">
                  Notification delivered for {followUpInvoice.invoiceNumber} (
                  {followUpInvoice.amountFormatted}).
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Send an automated payment reminder to customer for overdue invoice{" "}
                  <span className="font-bold text-slate-900">
                    {followUpInvoice.invoiceNumber}
                  </span>{" "}
                  amounting to{" "}
                  <span className="font-bold text-slate-900">
                    {followUpInvoice.amountFormatted}
                  </span>
                  .
                </p>
                <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-700 border border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-500 mb-1">
                    Reminder Message Preview:
                  </p>
                  <p className="italic">
                    "Dear Customer, this is a gentle reminder that invoice{" "}
                    {followUpInvoice.invoiceNumber} for {followUpInvoice.amountFormatted}{" "}
                    is currently overdue. Please arrange payment at your earliest
                    convenience."
                  </p>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFollowUpInvoice(null);
                  setFollowUpSuccess(false);
                }}
                className="text-xs"
              >
                {followUpSuccess ? "Close" : "Cancel"}
              </Button>
              {!followUpSuccess && (
                <Button
                  size="sm"
                  onClick={() => {
                    setFollowUpSuccess(true);
                    setTimeout(() => {
                      setFollowUpInvoice(null);
                      setFollowUpSuccess(false);
                    }, 1800);
                  }}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send Reminder
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
