import { useState, useMemo } from "react";
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
} from "lucide-react";
import { CalendarRangePickerModal } from "@/components/common_components/CalendarRangePickerModal";
import { InvoiceStatsCards } from "@/components/invoices/InvoiceStatsCards";
import {
  UploadMiscInvoiceDialog,
  type NewMiscInvoiceData,
} from "@/components/invoices/UploadMiscInvoiceDialog";
import {
  MiscInvoiceDetailsModal,
  type MiscInvoiceDetailsModalData,
} from "@/components/invoices/MiscInvoiceDetailsModal";
import SuccessModal from "@/components/common_components/SuccessModal";

export interface MiscInvoiceItem {
  id: string;
  invoiceNumber: string;
  serviceProvider: string;
  category: string;
  amount: number;
  amountFormatted: string;
  invoiceDate: string;
  dueDate: string;
  approvalStatus: "Approved" | "Pending";
  paymentStatus: "Pending" | "Paid";
  project?: string;
  linkedDelivery?: string;
}

const DEFAULT_MISC_INVOICES: MiscInvoiceItem[] = [
  {
    id: "misc-1",
    invoiceNumber: "INC00025",
    serviceProvider: "ABC Repairs",
    category: "Maintenance",
    amount: 10000,
    amountFormatted: "$10,000",
    invoiceDate: "22 Feb 2025",
    dueDate: "22 Feb 2025",
    approvalStatus: "Approved",
    paymentStatus: "Pending",
    project: "ABC Warehouse",
    linkedDelivery: "DEL-2024-0045",
  },
  {
    id: "misc-2",
    invoiceNumber: "INC00024",
    serviceProvider: "TechSoft",
    category: "Software",
    amount: 25750,
    amountFormatted: "$25,750",
    invoiceDate: "07 Feb 2025",
    dueDate: "07 Feb 2025",
    approvalStatus: "Approved",
    paymentStatus: "Pending",
    project: "Industrial Park",
    linkedDelivery: "DEL-2024-0046",
  },
  {
    id: "misc-3",
    invoiceNumber: "INC00023",
    serviceProvider: "SecureGuard",
    category: "Security",
    amount: 50125,
    amountFormatted: "$50,125",
    invoiceDate: "30 Jan 2025",
    dueDate: "30 Jan 2025",
    approvalStatus: "Approved",
    paymentStatus: "Paid",
    project: "Office Complex",
    linkedDelivery: "DEL-2024-0047",
  },
  {
    id: "misc-4",
    invoiceNumber: "INC00022",
    serviceProvider: "Legal Associates",
    category: "Professional",
    amount: 75900,
    amountFormatted: "$75,900",
    invoiceDate: "17 Jan 2025",
    dueDate: "17 Jan 2025",
    approvalStatus: "Pending",
    paymentStatus: "Pending",
    project: "Corporate Office",
    linkedDelivery: "DEL-2024-0048",
  },
  {
    id: "misc-5",
    invoiceNumber: "INC00021",
    serviceProvider: "Power Utility",
    category: "Utilities",
    amount: 99999,
    amountFormatted: "$99,999",
    invoiceDate: "04 Jan 2025",
    dueDate: "04 Jan 2025",
    approvalStatus: "Approved",
    paymentStatus: "Pending",
    project: "Industrial Park",
    linkedDelivery: "DEL-2024-0049",
  },
  {
    id: "misc-6",
    invoiceNumber: "INC00020",
    serviceProvider: "ABC Repairs",
    category: "Maintenance",
    amount: 120500,
    amountFormatted: "$1,20,500",
    invoiceDate: "09 Dec 2024",
    dueDate: "09 Dec 2024",
    approvalStatus: "Approved",
    paymentStatus: "Paid",
    project: "ABC Warehouse",
    linkedDelivery: "DEL-2024-0050",
  },
  {
    id: "misc-7",
    invoiceNumber: "INC00019",
    serviceProvider: "TechSoft",
    category: "Software",
    amount: 250000,
    amountFormatted: "$2,50,000",
    invoiceDate: "02 Dec 2024",
    dueDate: "02 Dec 2024",
    approvalStatus: "Approved",
    paymentStatus: "Pending",
    project: "Corporate Office",
    linkedDelivery: "DEL-2024-0051",
  },
  {
    id: "misc-8",
    invoiceNumber: "INC00018",
    serviceProvider: "SecureGuard",
    category: "Security",
    amount: 500750,
    amountFormatted: "$5,00,750",
    invoiceDate: "15 Nov 2024",
    dueDate: "15 Nov 2024",
    approvalStatus: "Pending",
    paymentStatus: "Pending",
    project: "Office Complex",
    linkedDelivery: "DEL-2024-0052",
  },
];

export default function MiscellaneousInvoicesPage() {
  const [invoices, setInvoices] = useState<MiscInvoiceItem[]>(() => {
    try {
      const stored = localStorage.getItem("misc_invoices_table_data");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_MISC_INVOICES;
  });

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [projectFilter, setProjectFilter] = useState("All");
  const [dateRangeLabel, setDateRangeLabel] = useState(
    "01 Jan 2025 - 31 Jan 2025",
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successModalContent, setSuccessModalContent] = useState({
    title: "Invoice Uploaded Successfully",
    subTitle:
      "The miscellaneous invoice has been recorded and submitted for approval.",
  });
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<"amount" | "invoiceDate" | null>(
    null,
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Details Modal state
  const [detailInvoice, setDetailInvoice] =
    useState<MiscInvoiceDetailsModalData | null>(null);

  const projectsList = useMemo(() => {
    const list = invoices.map((inv) => inv.project || inv.category);
    return Array.from(new Set(list));
  }, [invoices]);

  const providerSuggestions = useMemo(() => {
    return Array.from(new Set(invoices.map((inv) => inv.serviceProvider)));
  }, [invoices]);

  const categorySuggestions = useMemo(() => {
    return Array.from(new Set(invoices.map((inv) => inv.category)));
  }, [invoices]);

  // Filter & sort
  const filteredInvoices = useMemo(() => {
    let result = invoices.filter((inv) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchNumber = inv.invoiceNumber.toLowerCase().includes(q);
        const matchProvider = inv.serviceProvider.toLowerCase().includes(q);
        const matchCategory = inv.category.toLowerCase().includes(q);
        const matchAmount = inv.amountFormatted.toLowerCase().includes(q);
        const matchProject = (inv.project || "").toLowerCase().includes(q);
        if (
          !matchNumber &&
          !matchProvider &&
          !matchCategory &&
          !matchAmount &&
          !matchProject
        ) {
          return false;
        }
      }

      if (statusFilter !== "All") {
        if (
          inv.paymentStatus !== statusFilter &&
          inv.approvalStatus !== statusFilter
        ) {
          return false;
        }
      }

      if (projectFilter !== "All") {
        if (inv.project !== projectFilter && inv.category !== projectFilter) {
          return false;
        }
      }

      return true;
    });

    if (sortField) {
      result = [...result].sort((a, b) => {
        if (sortField === "amount") {
          return sortOrder === "asc"
            ? a.amount - b.amount
            : b.amount - a.amount;
        } else {
          const dateA = new Date(a.invoiceDate).getTime() || 0;
          const dateB = new Date(b.invoiceDate).getTime() || 0;
          return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        }
      });
    }

    return result;
  }, [invoices, searchTerm, statusFilter, projectFilter, sortField, sortOrder]);

  const handleSort = (field: "amount" | "invoiceDate") => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleExport = () => {
    const headers = [
      "INVOICE ID",
      "SERVICE PROVIDER",
      "CATEGORY",
      "AMOUNT",
      "INVOICE DATE",
      "APPROVAL",
      "PAYMENT",
    ];
    const rows = filteredInvoices.map((inv) => [
      inv.invoiceNumber,
      `"${inv.serviceProvider}"`,
      `"${inv.category}"`,
      inv.amountFormatted,
      inv.invoiceDate,
      inv.approvalStatus,
      inv.paymentStatus,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `miscellaneous_invoices.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadInvoice = (data: NewMiscInvoiceData) => {
    let formattedDate = data.dueDate;
    try {
      if (data.dueDate) {
        const d = new Date(data.dueDate);
        if (!isNaN(d.getTime())) {
          formattedDate = d.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        }
      }
    } catch {
      // keep as is
    }

    const nextId = invoices.length + 1;
    const newInv: MiscInvoiceItem = {
      id: `misc-${Date.now()}`,
      invoiceNumber: data.invoiceNumber,
      serviceProvider: data.serviceProvider,
      category: data.category,
      amount: data.amount,
      amountFormatted: `$${data.amount.toLocaleString()}`,
      invoiceDate: formattedDate,
      dueDate: formattedDate,
      approvalStatus: "Pending",
      paymentStatus: data.paymentStatus === "Paid" ? "Paid" : "Pending",
      project: "General Project Support",
      linkedDelivery: `DEL-2024-00${50 + nextId}`,
    };

    const updated = [newInv, ...invoices];
    setInvoices(updated);
    localStorage.setItem("misc_invoices_table_data", JSON.stringify(updated));

    setIsUploadOpen(false);
    setSuccessModalContent({
      title: "Invoice Uploaded Successfully",
      subTitle:
        "The miscellaneous invoice has been recorded and submitted for approval.",
    });
    setIsSuccessOpen(true);
  };

  const handleTogglePaymentStatus = (id: string) => {
    let markedAsPaid = false;
    let invNum = "";
    const updated = invoices.map((inv) => {
      if (inv.id === id) {
        invNum = inv.invoiceNumber;
        const nextStatus: "Paid" | "Pending" =
          inv.paymentStatus === "Paid" ? "Pending" : "Paid";
        if (nextStatus === "Paid") {
          markedAsPaid = true;
        }
        return { ...inv, paymentStatus: nextStatus };
      }
      return inv;
    });
    setInvoices(updated);
    localStorage.setItem("misc_invoices_table_data", JSON.stringify(updated));

    // Update detailInvoice if currently open
    if (detailInvoice && detailInvoice.id === id) {
      setDetailInvoice((prev) =>
        prev
          ? {
              ...prev,
              paymentStatus: prev.paymentStatus === "Paid" ? "Pending" : "Paid",
            }
          : null,
      );
    }

    if (markedAsPaid) {
      setSuccessModalContent({
        title: "Payment Recorded",
        subTitle: `Invoice ${invNum || id} has been successfully marked as Paid.`,
      });
      setIsSuccessOpen(true);
    }
  };

  const handleOpenDetailModal = (inv: MiscInvoiceItem) => {
    setDetailInvoice({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      serviceProvider: inv.serviceProvider,
      category: inv.category,
      amount: inv.amount,
      amountFormatted: inv.amountFormatted,
      dueDate: inv.dueDate,
      invoiceDate: inv.invoiceDate,
      paymentStatus: inv.paymentStatus,
      approvalStatus: inv.approvalStatus,
      linkedDelivery: inv.linkedDelivery || "DEL-2024-0045",
      uploadedBy: "John Smith",
      uploadedAt: "2024-03-16",
    });
  };

  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredInvoices.slice(start, start + rowsPerPage);
  }, [filteredInvoices, currentPage, rowsPerPage]);

  return (
    <div className="space-y-5">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Invoice Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-normal">
            Manage non-standard business invoices, operational expenses,
            approvals, and payments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600 rotate-90" />
            <span>Export</span>
          </button>

          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#3B66BD] hover:bg-[#2F54A0] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-white" />
            <span>Upload Invoice</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 Stat Cards */}
      <InvoiceStatsCards
        cards={[
          {
            title: "Total Invoices",
            value: "184",
            accentColor: "#8B5CF6",
          },
          {
            title: "Total Invoice Amount",
            value: "$100,000",
            accentColor: "#10B981",
          },
          {
            title: "Pending Payment",
            value: "$400,000",
            accentColor: "#F59E0B",
          },
          {
            title: "Overdue",
            value: "$300,000",
            accentColor: "#EF4444",
          },
        ]}
      />

      {/* 3. Main Invoices Table Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-5 sm:p-6 space-y-5">
        {/* Table Card Header Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Miscellaneous Invoice Records
          </h2>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-8.5 pl-8 pr-3 w-36 sm:w-48 rounded-lg border border-slate-200 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>

            {/* Date Range Filter */}
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="inline-flex items-center gap-1.5 h-8.5 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors"
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
                className={`inline-flex items-center gap-1.5 h-8.5 px-3 bg-white border rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors ${
                  statusFilter !== "All"
                    ? "border-blue-500 text-blue-600 bg-blue-50/40"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>{statusFilter === "All" ? "Status" : statusFilter}</span>
              </button>

              {showStatusMenu && (
                <div className="absolute right-0 mt-1.5 w-36 bg-white border border-slate-200 rounded-xl shadow-lg p-1 z-30 space-y-0.5">
                  {["All", "Pending", "Paid", "Approved"].map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        setStatusFilter(st);
                        setShowStatusMenu(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                        statusFilter === st
                          ? "bg-blue-50 text-blue-600 font-semibold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {st === "All" ? "All Statuses" : st}
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
                className={`inline-flex items-center gap-1.5 h-8.5 px-3 bg-white border rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors ${
                  projectFilter !== "All"
                    ? "border-blue-500 text-blue-600 bg-blue-50/40"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  {projectFilter === "All" ? "Project" : projectFilter}
                </span>
              </button>

              {showProjectMenu && (
                <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-1 z-30 space-y-0.5">
                  <button
                    onClick={() => {
                      setProjectFilter("All");
                      setShowProjectMenu(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                      projectFilter === "All"
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    All Projects
                  </button>
                  {projectsList.map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setProjectFilter(p);
                        setShowProjectMenu(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer truncate ${
                        projectFilter === p
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
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto -mx-5 sm:mx-0">
          <table className="w-full text-left border-collapse min-w-190">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <th className="px-5 py-3.5">INVOICE ID</th>
                <th className="px-5 py-3.5">SERVICE PROVIDER</th>
                <th className="px-5 py-3.5">CATEGORY</th>
                <th
                  className="px-5 py-3.5 cursor-pointer select-none"
                  onClick={() => handleSort("amount")}
                >
                  <div className="inline-flex items-center gap-1">
                    <span>AMOUNT</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th
                  className="px-5 py-3.5 cursor-pointer select-none"
                  onClick={() => handleSort("invoiceDate")}
                >
                  <div className="inline-flex items-center gap-1">
                    <span>INVOICE DATE</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-5 py-3.5">APPROVAL</th>
                <th className="px-5 py-3.5">PAYMENT</th>
                <th className="px-5 py-3.5">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedInvoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center text-slate-400"
                  >
                    No miscellaneous invoices found.
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    {/* INVOICE ID */}
                    <td
                      onClick={() => handleOpenDetailModal(inv)}
                      className="px-5 py-4 text-slate-400 font-normal hover:text-blue-600 hover:underline cursor-pointer"
                    >
                      {inv.invoiceNumber}
                    </td>

                    {/* SERVICE PROVIDER */}
                    <td className="px-5 py-4 font-bold text-slate-900">
                      {inv.serviceProvider}
                    </td>

                    {/* CATEGORY */}
                    <td className="px-5 py-4 text-slate-600 font-normal">
                      {inv.category}
                    </td>

                    {/* AMOUNT */}
                    <td className="px-5 py-4">
                      <span
                        onClick={() => handleOpenDetailModal(inv)}
                        className="font-bold text-[#2563EB] underline underline-offset-2 hover:text-blue-700 cursor-pointer"
                      >
                        {inv.amountFormatted}
                      </span>
                    </td>

                    {/* INVOICE DATE */}
                    <td className="px-5 py-4 text-slate-600 font-normal whitespace-nowrap">
                      {inv.invoiceDate}
                    </td>

                    {/* APPROVAL */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`font-semibold ${
                          inv.approvalStatus === "Approved"
                            ? "text-[#16A34A]"
                            : "text-[#D97706]"
                        }`}
                      >
                        {inv.approvalStatus}
                      </span>
                    </td>

                    {/* PAYMENT */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`font-semibold ${
                          inv.paymentStatus === "Paid"
                            ? "text-[#16A34A]"
                            : "text-[#D97706]"
                        }`}
                      >
                        {inv.paymentStatus}
                      </span>
                    </td>

                    {/* ACTION */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {/* View Eye Icon */}
                        <button
                          type="button"
                          title="View Invoice Details"
                          onClick={() => handleOpenDetailModal(inv)}
                          className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Download Icon */}
                        <button
                          type="button"
                          title="Download Invoice"
                          onClick={() => handleOpenDetailModal(inv)}
                          className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {/* Payment Toggle Button */}
                        {inv.paymentStatus === "Paid" ? (
                          <button
                            type="button"
                            onClick={() => handleTogglePaymentStatus(inv.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00A859] hover:bg-[#008f4c] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                          >
                            <span className="text-xs font-bold">$</span>
                            <span>Paid</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleTogglePaymentStatus(inv.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                          >
                            <span className="w-3.5 h-3.5 rounded-full border border-white flex items-center justify-center text-[9px] leading-none">
                              ✓
                            </span>
                            <span>Mark Paid</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Pagination matching screenshot */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          {/* Showing 10 v Results */}
          <div className="flex items-center gap-2">
            <span>Showing</span>
            <div className="relative">
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="appearance-none bg-white border border-slate-200 rounded-md pl-2 pr-6 py-1 text-xs text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-blue-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <span>Results</span>
          </div>

          {/* Pagination buttons: < 1 2 3 ... 15 > */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {[1, 2, 3].map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                  currentPage === page
                    ? "border border-purple-500 text-purple-600 bg-purple-50/30"
                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {page}
              </button>
            ))}

            <span className="px-1 text-slate-400">...</span>

            <button
              type="button"
              onClick={() => setCurrentPage(15)}
              className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                currentPage === 15
                  ? "border border-purple-500 text-purple-600 bg-purple-50/30"
                  : "border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              15
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(15, p + 1))}
              disabled={currentPage >= 15}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Date Range Modal */}
      <CalendarRangePickerModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        onSelectRange={(range) => setDateRangeLabel(range)}
      />

      {/* Upload Misc Invoice Dialog matching user reference modal */}
      <UploadMiscInvoiceDialog
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSubmit={handleUploadInvoice}
        serviceProviderSuggestions={providerSuggestions}
        categorySuggestions={categorySuggestions}
      />

      {/* Details Dialog matching user reference modal */}
      <MiscInvoiceDetailsModal
        isOpen={!!detailInvoice}
        onClose={() => setDetailInvoice(null)}
        invoice={detailInvoice}
        onTogglePayment={handleTogglePaymentStatus}
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
