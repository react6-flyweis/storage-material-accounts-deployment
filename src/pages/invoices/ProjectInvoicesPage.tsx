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
} from "lucide-react";
import { InvoiceStatsCards } from "@/components/invoices/InvoiceStatsCards";
import {
  InvoiceDetailModal,
  type InvoiceItem,
} from "@/components/invoices/InvoiceDetailModal";
import { CalendarRangePickerModal } from "@/components/common_components/CalendarRangePickerModal";
import { INITIAL_PROJECT_INVOICES } from "@/components/invoices/invoiceData";

interface ProjectInvoicesPageProps {
  tableTitle?: string;
  defaultInvoices?: InvoiceItem[];
}

export default function ProjectInvoicesPage({
  tableTitle = "Vendor Invoices",
  defaultInvoices = INITIAL_PROJECT_INVOICES,
}: ProjectInvoicesPageProps) {
  const [invoices, setInvoices] = useState<InvoiceItem[]>(defaultInvoices);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedProject, setSelectedProject] = useState<string>("All");
  const [dateRangeLabel, setDateRangeLabel] = useState<string>(
    "01 Jan 2025 - 31 Jan 2025"
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<"amount" | "invDate" | "dueDate" | null>(
    null
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const totalDisplayPages = 15;

  // Selected invoice for detail modal
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);

  // Filter & sort
  const filteredInvoices = useMemo(() => {
    let list = [...invoices];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(
        (inv) =>
          inv.invoiceId.toLowerCase().includes(q) ||
          inv.project.toLowerCase().includes(q) ||
          inv.customer.toLowerCase().includes(q) ||
          inv.invoiceType.toLowerCase().includes(q) ||
          inv.amountFormatted.toLowerCase().includes(q) ||
          inv.invDate.toLowerCase().includes(q) ||
          inv.dueDate.toLowerCase().includes(q)
      );
    }

    if (selectedStatus !== "All") {
      list = list.filter((inv) => inv.paymentStatus === selectedStatus);
    }

    if (selectedProject !== "All") {
      list = list.filter((inv) => inv.project === selectedProject);
    }

    if (sortField) {
      list.sort((a, b) => {
        let valA: string | number = a[sortField];
        let valB: string | number = b[sortField];

        if (sortField === "amount") {
          return sortOrder === "asc" ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
        } else {
          valA = new Date(valA as string).getTime() || 0;
          valB = new Date(valB as string).getTime() || 0;
          return sortOrder === "asc" ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
        }
      });
    }

    return list;
  }, [invoices, searchTerm, selectedStatus, selectedProject, sortField, sortOrder]);

  const handleSort = (field: "amount" | "invDate" | "dueDate") => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleStatusUpdate = (id: string, newStatus: "Pending" | "Complete") => {
    setInvoices((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, paymentStatus: newStatus } : item
      )
    );
    if (selectedInvoice && selectedInvoice.id === id) {
      setSelectedInvoice((prev) =>
        prev ? { ...prev, paymentStatus: newStatus } : null
      );
    }
  };

  // CSV Export
  const handleExport = () => {
    const headers = [
      "INVOICE ID",
      "PROJECT",
      "CUSTOMER",
      "INVOICE TYPE",
      "AMOUNT",
      "INV DATE",
      "DUE DATE",
      "PAYMENT",
    ];
    const rows = filteredInvoices.map((inv) => [
      inv.invoiceId,
      inv.project,
      inv.customer,
      inv.invoiceType,
      inv.amountFormatted,
      inv.invDate,
      inv.dueDate,
      inv.paymentStatus,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${tableTitle.toLowerCase().replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uniqueProjects = Array.from(new Set(invoices.map((i) => i.project)));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen bg-[#F3F6FC]">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Invoice Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-normal">
            Track project-related invoices, billing, expenses, payments, outstanding amounts, and profitability.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Upload className="w-3.5 h-3.5 text-slate-600 rotate-90" />
          Export
        </button>
      </div>

      {/* 2. 4 Summary Metric Cards */}
      <InvoiceStatsCards />

      {/* 3. Main Invoices Table Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-5 sm:p-6 space-y-5">
        {/* Table Card Header Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            {tableTitle}
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
                  {["All", "Pending", "Complete"].map((status) => (
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
                <span>
                  {selectedProject === "All" ? "Project" : selectedProject}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
              </button>

              {showProjectMenu && (
                <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-1 z-30 space-y-0.5">
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
                  {uniqueProjects.map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setSelectedProject(p);
                        setShowProjectMenu(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer truncate ${
                        selectedProject === p
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

        {/* Invoices Table */}
        <div className="overflow-x-auto -mx-5 sm:mx-0">
          <table className="w-full text-left border-collapse min-w-190">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3 font-bold text-slate-800">
                  INVOICE ID
                </th>
                <th className="px-5 py-3 font-bold text-slate-800">
                  PROJECT
                </th>
                <th className="px-5 py-3 font-bold text-slate-800">
                  CUSTOMER
                </th>
                <th className="px-5 py-3 font-bold text-slate-800">
                  INVOICE TYPE
                </th>
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
                  onClick={() => handleSort("invDate")}
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
                <th className="px-5 py-3 font-bold text-slate-800">
                  PAYMENT
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                    No invoices found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-slate-400 font-normal">
                      {inv.invoiceId}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      {inv.project}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 font-normal">
                      {inv.customer}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 font-normal">
                      {inv.invoiceType}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="font-medium text-[#2563EB] hover:text-blue-800 underline underline-offset-2 cursor-pointer transition-colors"
                      >
                        {inv.amountFormatted}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 font-normal whitespace-nowrap">
                      {inv.invDate}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 font-normal whitespace-nowrap">
                      {inv.dueDate}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`font-semibold ${
                          inv.paymentStatus === "Complete"
                            ? "text-[#16A34A]"
                            : "text-[#D97706]"
                        }`}
                      >
                        {inv.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Pagination matching screenshot */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          {/* Left: Showing 10 v Results */}
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

          {/* Right: < [1] 2 3 .. 15 > */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentPage(1)}
              className={`min-w-6 h-6 px-1.5 rounded-md flex items-center justify-center font-medium transition-colors ${
                currentPage === 1
                  ? "border border-[#7C3AED] text-[#7C3AED]"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              1
            </button>

            <button
              onClick={() => setCurrentPage(2)}
              className={`min-w-6 h-6 px-1.5 rounded-md flex items-center justify-center font-medium transition-colors ${
                currentPage === 2
                  ? "border border-[#7C3AED] text-[#7C3AED]"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              2
            </button>

            <button
              onClick={() => setCurrentPage(3)}
              className={`min-w-6 h-6 px-1.5 rounded-md flex items-center justify-center font-medium transition-colors ${
                currentPage === 3
                  ? "border border-[#7C3AED] text-[#7C3AED]"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              3
            </button>

            <span className="text-slate-400 px-0.5">..</span>

            <button
              onClick={() => setCurrentPage(totalDisplayPages)}
              className={`min-w-6 h-6 px-1.5 rounded-md flex items-center justify-center font-medium transition-colors ${
                currentPage === totalDisplayPages
                  ? "border border-[#7C3AED] text-[#7C3AED]"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              15
            </button>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalDisplayPages, p + 1))}
              disabled={currentPage === totalDisplayPages}
              className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Detail Modal */}
      <InvoiceDetailModal
        isOpen={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
        onStatusChange={handleStatusUpdate}
      />

      {/* Calendar Range Picker Modal */}
      <CalendarRangePickerModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        onSelectRange={(range) => {
          setDateRangeLabel(range);
          setIsCalendarOpen(false);
        }}
      />
    </div>
  );
}
