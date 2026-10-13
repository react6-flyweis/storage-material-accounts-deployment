import { useState, useMemo } from "react";
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
} from "lucide-react";
import { CalendarRangePickerModal } from "@/components/common_components/CalendarRangePickerModal";
import { InvoiceStatsCards } from "@/components/invoices/InvoiceStatsCards";
import {
  UploadInvoiceDialog,
  type NewInvoiceData,
} from "@/components/invoices/UploadInvoiceDialog";
import SuccessModal from "@/components/common_components/SuccessModal";

export interface CarrierInvoiceItem {
  id: string;
  invoiceNumber: string;
  carrierName: string;
  project: string;
  deliveryId: string;
  amount: number;
  amountFormatted: string;
  dueDate: string;
  verificationStatus: "Verified" | "Pending";
  paymentStatus: "Pending" | "Completed";
}

const DEFAULT_CARRIER_INVOICES: CarrierInvoiceItem[] = [
  {
    id: "car-1",
    invoiceNumber: "INC00025",
    carrierName: "Fast Freight Logistics",
    project: "ABC Warehouse",
    deliveryId: "FR-2026-001",
    amount: 10000,
    amountFormatted: "$10,000",
    dueDate: "22 Feb 2025",
    verificationStatus: "Verified",
    paymentStatus: "Pending",
  },
  {
    id: "car-2",
    invoiceNumber: "INC00024",
    carrierName: "QuickHaul Transport",
    project: "Industrial Park",
    deliveryId: "FR-2026-002",
    amount: 25750,
    amountFormatted: "$25,750",
    dueDate: "07 Feb 2025",
    verificationStatus: "Verified",
    paymentStatus: "Pending",
  },
  {
    id: "car-3",
    invoiceNumber: "INC00023",
    carrierName: "Reliable Freight",
    project: "Office Complex",
    deliveryId: "FR-2026-003",
    amount: 50125,
    amountFormatted: "$50,125",
    dueDate: "30 Jan 2025",
    verificationStatus: "Verified",
    paymentStatus: "Completed",
  },
  {
    id: "car-4",
    invoiceNumber: "INC00022",
    carrierName: "Fast Freight Logistics",
    project: "ABC Warehouse",
    deliveryId: "FR-2026-004",
    amount: 75900,
    amountFormatted: "$75,900",
    dueDate: "17 Jan 2025",
    verificationStatus: "Pending",
    paymentStatus: "Pending",
  },
  {
    id: "car-5",
    invoiceNumber: "INC00021",
    carrierName: "QuickHaul Transport",
    project: "Industrial Park",
    deliveryId: "FR-2026-005",
    amount: 99999,
    amountFormatted: "$99,999",
    dueDate: "04 Jan 2025",
    verificationStatus: "Verified",
    paymentStatus: "Pending",
  },
  {
    id: "car-6",
    invoiceNumber: "INC00020",
    carrierName: "Reliable Freight",
    project: "Office Complex",
    deliveryId: "FR-2026-007",
    amount: 120500,
    amountFormatted: "$1,20,500",
    dueDate: "09 Dec 2024",
    verificationStatus: "Verified",
    paymentStatus: "Completed",
  },
  {
    id: "car-7",
    invoiceNumber: "INC00019",
    carrierName: "Fast Freight Logistics",
    project: "ABC Warehouse",
    deliveryId: "FR-2026-008",
    amount: 250000,
    amountFormatted: "$2,50,000",
    dueDate: "02 Dec 2024",
    verificationStatus: "Verified",
    paymentStatus: "Pending",
  },
  {
    id: "car-8",
    invoiceNumber: "INC00018",
    carrierName: "QuickHaul Transport",
    project: "Industrial Park",
    deliveryId: "FR-2026-009",
    amount: 500750,
    amountFormatted: "$5,00,750",
    dueDate: "15 Nov 2024",
    verificationStatus: "Pending",
    paymentStatus: "Pending",
  },
];

export default function CarrierInvoicesPage() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<CarrierInvoiceItem[]>(() => {
    try {
      const stored = localStorage.getItem("carrier_invoices_table_data");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_CARRIER_INVOICES;
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
    subTitle: "The invoice has been recorded and submitted for verification.",
  });
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<"amount" | "dueDate" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const projectsList = useMemo(() => {
    return Array.from(new Set(invoices.map((inv) => inv.project)));
  }, [invoices]);

  const carrierSuggestions = useMemo(() => {
    return Array.from(new Set(invoices.map((inv) => inv.carrierName)));
  }, [invoices]);

  // Filter & sort
  const filteredInvoices = useMemo(() => {
    let result = invoices.filter((inv) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchNumber = inv.invoiceNumber.toLowerCase().includes(q);
        const matchCarrier = inv.carrierName.toLowerCase().includes(q);
        const matchProject = inv.project.toLowerCase().includes(q);
        const matchDelivery = inv.deliveryId.toLowerCase().includes(q);
        const matchAmount = inv.amountFormatted.toLowerCase().includes(q);
        if (
          !matchNumber &&
          !matchCarrier &&
          !matchProject &&
          !matchDelivery &&
          !matchAmount
        ) {
          return false;
        }
      }

      if (statusFilter !== "All") {
        if (
          inv.paymentStatus !== statusFilter &&
          inv.verificationStatus !== statusFilter
        ) {
          return false;
        }
      }

      if (projectFilter !== "All") {
        if (inv.project !== projectFilter) return false;
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
          const dateA = new Date(a.dueDate).getTime() || 0;
          const dateB = new Date(b.dueDate).getTime() || 0;
          return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        }
      });
    }

    return result;
  }, [invoices, searchTerm, statusFilter, projectFilter, sortField, sortOrder]);

  const handleSort = (field: "amount" | "dueDate") => {
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
      "CARRIER",
      "PROJECT",
      "DELIVERY ID",
      "AMOUNT",
      "DUE DATE",
      "VERIFICATION",
      "PAYMENT",
    ];
    const rows = filteredInvoices.map((inv) => [
      inv.invoiceNumber,
      `"${inv.carrierName}"`,
      `"${inv.project}"`,
      inv.deliveryId,
      inv.amountFormatted,
      inv.dueDate,
      inv.verificationStatus,
      inv.paymentStatus,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `carrier_invoices.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadInvoice = (data: NewInvoiceData) => {
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

    const nextDeliveryNum = invoices.length + 1;
    const generatedDeliveryId = `FR-2026-${String(nextDeliveryNum).padStart(3, "0")}`;

    const newInv: CarrierInvoiceItem = {
      id: `car-${Date.now()}`,
      invoiceNumber: data.invoiceNumber,
      carrierName: data.vendorName,
      project: data.linkedDelivery
        ? data.linkedDelivery.split(" - ")[1] || "ABC Warehouse"
        : "ABC Warehouse",
      deliveryId: generatedDeliveryId,
      amount: data.amount,
      amountFormatted: `$${data.amount.toLocaleString()}`,
      dueDate: formattedDate,
      verificationStatus: "Pending",
      paymentStatus: data.paymentStatus === "Paid" ? "Completed" : "Pending",
    };

    const updated = [newInv, ...invoices];
    setInvoices(updated);
    localStorage.setItem(
      "carrier_invoices_table_data",
      JSON.stringify(updated),
    );

    setIsUploadOpen(false);
    setSuccessModalContent({
      title: "Invoice Uploaded Successfully",
      subTitle:
        "The carrier invoice has been recorded and submitted for verification.",
    });
    setIsSuccessOpen(true);
  };

  const handleTogglePaymentStatus = (id: string) => {
    let markedAsPaid = false;
    let invNum = "";
    const updated = invoices.map((inv) => {
      if (inv.id === id) {
        invNum = inv.invoiceNumber;
        const nextStatus: "Completed" | "Pending" =
          inv.paymentStatus === "Completed" ? "Pending" : "Completed";
        if (nextStatus === "Completed") {
          markedAsPaid = true;
        }
        return { ...inv, paymentStatus: nextStatus };
      }
      return inv;
    });
    setInvoices(updated);
    localStorage.setItem(
      "carrier_invoices_table_data",
      JSON.stringify(updated),
    );

    if (markedAsPaid) {
      setSuccessModalContent({
        title: "Payment Recorded",
        subTitle: `Invoice ${invNum || id} has been successfully marked as Paid.`,
      });
      setIsSuccessOpen(true);
    }
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
            Upload, approve, and track invoice payments
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
            value: "188",
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
            Carrier Invoices
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
                  {["All", "Pending", "Completed", "Verified"].map((st) => (
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
                <th className="px-5 py-3.5">CARRIER</th>
                <th className="px-5 py-3.5">PROJECT</th>
                <th className="px-5 py-3.5">DELIVERY ID</th>
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
                  onClick={() => handleSort("dueDate")}
                >
                  <div className="inline-flex items-center gap-1">
                    <span>DUE DATE</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-5 py-3.5">VERIFICATION</th>
                <th className="px-5 py-3.5">PAYMENT</th>
                <th className="px-5 py-3.5">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedInvoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-12 text-center text-slate-400"
                  >
                    No carrier invoices found.
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
                      onClick={() =>
                        navigate(`/carrier-invoices/${inv.id}`, {
                          state: { invoice: inv },
                        })
                      }
                      className="px-5 py-4 text-slate-400 font-normal hover:text-blue-600 hover:underline cursor-pointer"
                    >
                      {inv.invoiceNumber}
                    </td>

                    {/* CARRIER */}
                    <td className="px-5 py-4 font-bold text-slate-900">
                      {inv.carrierName}
                    </td>

                    {/* PROJECT */}
                    <td className="px-5 py-4 text-slate-600 font-normal">
                      {inv.project}
                    </td>

                    {/* DELIVERY ID */}
                    <td className="px-5 py-4 text-slate-600 font-normal">
                      {inv.deliveryId}
                    </td>

                    {/* AMOUNT */}
                    <td className="px-5 py-4">
                      <span
                        onClick={() =>
                          navigate(`/carrier-invoices/${inv.id}`, {
                            state: { invoice: inv },
                          })
                        }
                        className="font-bold text-[#2563EB] underline underline-offset-2 hover:text-blue-700 cursor-pointer"
                      >
                        {inv.amountFormatted}
                      </span>
                    </td>

                    {/* DUE DATE */}
                    <td className="px-5 py-4 text-slate-600 font-normal whitespace-nowrap">
                      {inv.dueDate}
                    </td>

                    {/* VERIFICATION */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`font-semibold ${
                          inv.verificationStatus === "Verified"
                            ? "text-[#16A34A]"
                            : "text-[#D97706]"
                        }`}
                      >
                        {inv.verificationStatus}
                      </span>
                    </td>

                    {/* PAYMENT */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`font-semibold ${
                          inv.paymentStatus === "Completed"
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
                          title="View Invoice"
                          onClick={() =>
                            navigate(`/carrier-invoices/${inv.id}`, {
                              state: { invoice: inv },
                            })
                          }
                          className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Download Icon */}
                        <button
                          type="button"
                          title="Download Invoice"
                          onClick={() => {
                            navigate(`/carrier-invoices/${inv.id}`, {
                              state: { invoice: inv },
                            });
                          }}
                          className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {/* Payment Toggle Button */}
                        {inv.paymentStatus === "Completed" ? (
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

      {/* Upload Invoice Dialog */}
      <UploadInvoiceDialog
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSubmit={handleUploadInvoice}
        vendorSuggestions={carrierSuggestions}
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
