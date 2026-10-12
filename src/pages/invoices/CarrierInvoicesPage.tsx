import { useState, useMemo } from "react";
import {
  Download,
  Upload,
  Eye,
  FileText,
  DollarSign,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import PayableStatCards, {
  type PayableStatsData,
} from "@/components/invoices/PayableStatCards";
import PayableFilters from "@/components/invoices/PayableFilters";
import PayableStatusBadge from "@/components/invoices/PayableStatusBadge";
import ManualPayableUploadDialog, {
  type PayableInvoiceEntry,
} from "@/components/invoices/ManualPayableUploadDialog";
import RecordPaymentModal from "@/components/invoices/RecordPaymentModal";
import PayableDetailModal from "@/components/invoices/PayableDetailModal";
import SuccessModal from "@/components/common_components/SuccessModal";
import type { DateRange } from "@/components/ui/date-range-filter";

const INITIAL_CARRIER_INVOICES: PayableInvoiceEntry[] = [
  {
    id: "car-1",
    invoiceNumber: "FRT-1091",
    type: "freight_carrier",
    payeeName: "Swift Freight Logistics",
    carrierCode: "SFL-902",
    route: "Dallas -> Fort Worth",
    project: "ABC Logistic Warehouse",
    jobId: "JOB-2025-01",
    amount: 14500,
    date: "2025-02-18",
    dueDate: "2025-03-18",
    payableStatus: "pending_admin_approval",
    paymentStatus: "Pending",
    category: "Heavy Haul Flatbed",
    documentUrl:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    notes: "Delivery load LD-09877 delivery slip verified",
  },
  {
    id: "car-2",
    invoiceNumber: "FRT-1092",
    type: "freight_carrier",
    payeeName: "BlueDart Cargo Haulers",
    carrierCode: "BDC-143",
    route: "Houston -> Austin",
    project: "SMDT Warehouse Expansion",
    jobId: "JOB-2025-02",
    amount: 32000,
    date: "2025-02-12",
    dueDate: "2025-03-12",
    payableStatus: "paid",
    paymentStatus: "Paid",
    category: "Step Deck Trailer",
    documentUrl:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    notes: "Transit across interstate corridor",
    paymentDetails: {
      paidAt: "2025-02-26",
      method: "Bank Transfer (ACH / NEFT)",
      referenceNumber: "ACH-552109",
      notes: "Fuel surcharge and base freight included",
    },
  },
  {
    id: "car-3",
    invoiceNumber: "FRT-1093",
    type: "freight_carrier",
    payeeName: "Prime Haulers Line",
    carrierCode: "PHL-512",
    route: "San Antonio -> Dallas",
    project: "Steel Unit Complex",
    jobId: "JOB-2025-03",
    amount: 45000,
    date: "2025-02-05",
    dueDate: "2025-03-05",
    payableStatus: "approved_for_payment",
    paymentStatus: "Pending",
    category: "Multi-Axle Lowboy",
    documentUrl:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    notes: "Special oversized transport permit included",
  },
  {
    id: "car-4",
    invoiceNumber: "FRT-1094",
    type: "freight_carrier",
    payeeName: "National Road Express",
    carrierCode: "NRE-808",
    route: "El Paso -> Lubbock",
    project: "Industrial Storage Shed",
    jobId: "JOB-2025-04",
    amount: 8750,
    date: "2025-01-28",
    dueDate: "2025-02-28",
    payableStatus: "pending_admin_approval",
    paymentStatus: "Pending",
    category: "Standard Dry Van",
    documentUrl:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    notes: "Hardware and components transit",
  },
  {
    id: "car-5",
    invoiceNumber: "FRT-1095",
    type: "freight_carrier",
    payeeName: "Eagle Express Freight",
    carrierCode: "EEF-321",
    route: "Fort Worth -> Waco",
    project: "Warehouse Expansion Ph-2",
    jobId: "JOB-2025-05",
    amount: 21400,
    date: "2025-01-20",
    dueDate: "2025-02-20",
    payableStatus: "paid",
    paymentStatus: "Paid",
    category: "Curtain Side Trailer",
    documentUrl:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    notes: "Delivery accepted on site with BOL sign-off",
    paymentDetails: {
      paidAt: "2025-02-18",
      method: "Company Cheque",
      referenceNumber: "CHK-409112",
      notes: "Direct mail cheque settlement",
    },
  },
];

export default function CarrierInvoicesPage() {
  // State for data
  const [invoices, setInvoices] = useState<PayableInvoiceEntry[]>(() => {
    try {
      const stored = localStorage.getItem("custom_carrier_invoices");
      if (stored) {
        const parsed = JSON.parse(stored) as PayableInvoiceEntry[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const customIds = new Set(parsed.map((p) => p.id));
          const remainder = INITIAL_CARRIER_INVOICES.filter(
            (item) => !customIds.has(item.id)
          );
          return [...parsed, ...remainder];
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_CARRIER_INVOICES;
  });

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState("All");
  const [payableStatusFilter, setPayableStatusFilter] = useState("All");
  const [projectFilter, setProjectFilter] = useState("All");

  // Selection states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<PayableInvoiceEntry | null>(
    null
  );
  const [detailTarget, setDetailTarget] = useState<PayableInvoiceEntry | null>(
    null
  );
  const [successConfig, setSuccessConfig] = useState<{
    open: boolean;
    title: string;
    message?: string;
  }>({
    open: false,
    title: "",
    message: "",
  });

  // Unique projects list
  const projectsList = useMemo(() => {
    const set = new Set<string>();
    invoices.forEach((inv) => {
      if (inv.project) set.add(inv.project);
    });
    return Array.from(set);
  }, [invoices]);

  // Statistics calculation
  const stats: PayableStatsData = useMemo(() => {
    let totalInvoiced = 0;
    let paidAmount = 0;
    let paidCount = 0;
    let pendingApprovalAmount = 0;
    let pendingApprovalCount = 0;
    let outstandingAmount = 0;
    let outstandingCount = 0;

    invoices.forEach((inv) => {
      totalInvoiced += inv.amount;
      if (
        inv.paymentStatus.toLowerCase() === "paid" ||
        inv.payableStatus.toLowerCase() === "paid"
      ) {
        paidAmount += inv.amount;
        paidCount++;
      } else {
        outstandingAmount += inv.amount;
        outstandingCount++;
        if (inv.payableStatus.toLowerCase().includes("pending")) {
          pendingApprovalAmount += inv.amount;
          pendingApprovalCount++;
        }
      }
    });

    return {
      totalInvoiced,
      totalInvoicesCount: invoices.length,
      paidAmount,
      paidCount,
      pendingApprovalAmount,
      pendingApprovalCount,
      outstandingAmount,
      outstandingCount,
    };
  }, [invoices]);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNumber = inv.invoiceNumber.toLowerCase().includes(q);
        const matchPayee = inv.payeeName.toLowerCase().includes(q);
        const matchCode = (inv.carrierCode || "").toLowerCase().includes(q);
        const matchProject = inv.project.toLowerCase().includes(q);
        const matchRoute = (inv.route || "").toLowerCase().includes(q);
        if (
          !matchNumber &&
          !matchPayee &&
          !matchCode &&
          !matchProject &&
          !matchRoute
        )
          return false;
      }

      if (statusFilter !== "All") {
        if (inv.paymentStatus.toLowerCase() !== statusFilter.toLowerCase())
          return false;
      }

      if (payableStatusFilter !== "All") {
        if (inv.payableStatus.toLowerCase() !== payableStatusFilter.toLowerCase())
          return false;
      }

      if (projectFilter !== "All") {
        if (inv.project !== projectFilter) return false;
      }

      if (dateRange?.from) {
        const invDate = new Date(inv.date);
        if (invDate < dateRange.from) return false;
        if (dateRange.to && invDate > dateRange.to) return false;
      }

      return true;
    });
  }, [
    invoices,
    searchQuery,
    statusFilter,
    payableStatusFilter,
    projectFilter,
    dateRange,
  ]);

  // Pagination calculation
  const totalItems = filteredInvoices.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredInvoices.slice(start, start + rowsPerPage);
  }, [filteredInvoices, currentPage, rowsPerPage]);

  // Checkbox handling
  const isAllSelected =
    paginatedInvoices.length > 0 &&
    paginatedInvoices.every((i) => selectedIds.includes(i.id));

  const toggleSelectAll = () => {
    const pageIds = paginatedInvoices.map((i) => i.id);
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Save changes to localStorage
  const persistInvoices = (updated: PayableInvoiceEntry[]) => {
    setInvoices(updated);
    try {
      localStorage.setItem("custom_carrier_invoices", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Add new carrier invoice handler
  const handleAddInvoice = (newEntry: PayableInvoiceEntry) => {
    const updated = [newEntry, ...invoices];
    persistInvoices(updated);
    setSuccessConfig({
      open: true,
      title: "Freight Carrier Invoice Uploaded!",
      message: `Invoice #${newEntry.invoiceNumber} for ${newEntry.payeeName} has been queued for verification.`,
    });
  };

  // Confirm payment handler
  const handleConfirmPayment = (
    invoiceId: string,
    paymentData: {
      amount: number;
      date: string;
      method: string;
      referenceNumber: string;
      bankAccount: string;
      notes: string;
    }
  ) => {
    const updated = invoices.map((inv) => {
      if (inv.id === invoiceId) {
        return {
          ...inv,
          paymentStatus: "Paid" as const,
          payableStatus: "paid" as const,
          paymentDetails: {
            paidAt: paymentData.date,
            method: paymentData.method,
            referenceNumber: paymentData.referenceNumber,
            notes: paymentData.notes,
          },
        };
      }
      return inv;
    });

    persistInvoices(updated);
    const target = invoices.find((i) => i.id === invoiceId);
    setSuccessConfig({
      open: true,
      title: "Carrier Payment Recorded!",
      message: `Freight disbursement of $${paymentData.amount.toLocaleString()} for ${
        target?.payeeName || "Carrier"
      } (Ref: ${paymentData.referenceNumber}) has been recorded.`,
    });
  };

  // CSV Export
  const handleExportCsv = (rowsToExport: PayableInvoiceEntry[] = filteredInvoices) => {
    const headers = [
      "Invoice Number",
      "Carrier Name",
      "Carrier Code",
      "Route",
      "Project",
      "Job ID",
      "Amount",
      "Invoice Date",
      "Due Date",
      "Workflow Status",
      "Payment Status",
      "Category",
    ];

    const csvContent = [
      headers.join(","),
      ...rowsToExport.map((row) =>
        [
          `"${row.invoiceNumber}"`,
          `"${row.payeeName}"`,
          `"${row.carrierCode || ""}"`,
          `"${row.route || ""}"`,
          `"${row.project}"`,
          `"${row.jobId}"`,
          row.amount,
          `"${row.date}"`,
          `"${row.dueDate}"`,
          `"${row.payableStatus}"`,
          `"${row.paymentStatus}"`,
          `"${row.category || ""}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `carrier-invoices-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setDateRange(undefined);
    setStatusFilter("All");
    setPayableStatusFilter("All");
    setProjectFilter("All");
    setCurrentPage(1);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-[#EEF2FB] min-h-full">
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Carrier Invoices
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review freight loads, verify logistics charges, and disburse carrier payables
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleExportCsv()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-[#1D51A4] hover:bg-[#163e7c] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-white" />
            <span>Upload Invoice</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Stat Cards */}
      <PayableStatCards stats={stats} />

      {/* Search and Filters Bar */}
      <PayableFilters
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        dateRange={dateRange}
        onDateRangeChange={(dr) => {
          setDateRange(dr);
          setCurrentPage(1);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(s) => {
          setStatusFilter(s);
          setCurrentPage(1);
        }}
        payableStatusFilter={payableStatusFilter}
        onPayableStatusFilterChange={(ps) => {
          setPayableStatusFilter(ps);
          setCurrentPage(1);
        }}
        projectFilter={projectFilter}
        onProjectFilterChange={(p) => {
          setProjectFilter(p);
          setCurrentPage(1);
        }}
        projectsList={projectsList}
        onReset={handleResetFilters}
      />

      {/* Bulk Action Bar (when selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center justify-between animate-in fade-in duration-200">
          <span className="text-xs sm:text-sm font-semibold text-blue-900">
            {selectedIds.length} carrier invoice(s) selected
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const selectedRows = invoices.filter((i) =>
                  selectedIds.includes(i.id)
                );
                handleExportCsv(selectedRows);
              }}
              className="px-3 py-1.5 rounded-lg bg-white border border-blue-300 text-blue-900 text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer"
            >
              Export Selected
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 rounded-lg text-blue-700 hover:text-blue-950 text-xs font-medium cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Carrier Invoices Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-[#1D51A4] focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Carrier Name</th>
                <th className="py-3.5 px-4">Carrier Code</th>
                <th className="py-3.5 px-4">Route / Transit</th>
                <th className="py-3.5 px-4">Project</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4">Workflow Status</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    No freight carrier invoices found matching current criteria.
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((row) => {
                  const isPaid =
                    row.paymentStatus.toLowerCase() === "paid" ||
                    row.payableStatus.toLowerCase() === "paid";

                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(row.id)}
                          onChange={() => toggleSelect(row.id)}
                          className="rounded border-slate-300 text-[#1D51A4] focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Invoice Number & PDF link */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{row.invoiceNumber}</span>
                          {row.documentUrl && (
                            <a
                              href={row.documentUrl}
                              target="_blank"
                              rel="noreferrer"
                              title="View Invoice PDF"
                              className="text-blue-600 hover:text-blue-800 p-0.5 rounded transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Carrier Name */}
                      <td className="py-3.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                        {row.payeeName}
                      </td>

                      {/* Carrier Code */}
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                        {row.carrierCode || "-"}
                      </td>

                      {/* Route */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {row.route || "Direct Plant Dispatch"}
                      </td>

                      {/* Project */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {row.project}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                        ${row.amount.toLocaleString()}
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {row.dueDate}
                      </td>

                      {/* Workflow Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <PayableStatusBadge status={row.payableStatus} />
                      </td>

                      {/* Payment Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            isPaid
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {isPaid ? "Completed" : "Pending"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Modal */}
                          <button
                            type="button"
                            onClick={() => setDetailTarget(row)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Download CSV */}
                          <button
                            type="button"
                            onClick={() => handleExportCsv([row])}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="Download CSV"
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          {/* Accounts Action: Record Payment */}
                          {!isPaid ? (
                            <button
                              type="button"
                              onClick={() => setPaymentTarget(row)}
                              className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                              title="Record Disbursement"
                            >
                              <DollarSign className="w-3 h-3" />
                              <span>Record Pay</span>
                            </button>
                          ) : (
                            <span className="text-[11px] font-medium text-emerald-600 inline-flex items-center gap-0.5 px-2 py-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Paid</span>
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-4 sm:px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 font-normal">
            Showing {Math.min(1, totalItems)} to{" "}
            {Math.min(paginatedInvoices.length, totalItems)} of {totalItems} entries
          </div>

          <div className="flex items-center gap-4 text-xs">
            {/* Rows Per Page */}
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-semibold text-slate-700 px-2">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Upload Dialog */}
      <ManualPayableUploadDialog
        open={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        type="freight_carrier"
        onSuccess={handleAddInvoice}
        existingProjects={projectsList}
      />

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={!!paymentTarget}
        onClose={() => setPaymentTarget(null)}
        invoice={paymentTarget}
        onConfirmPayment={handleConfirmPayment}
      />

      {/* Detail Modal */}
      <PayableDetailModal
        isOpen={!!detailTarget}
        onClose={() => setDetailTarget(null)}
        invoice={detailTarget}
        onRecordPayment={(inv) => {
          setDetailTarget(null);
          setPaymentTarget(inv);
        }}
        onDownloadCsv={(inv) => handleExportCsv([inv])}
      />

      {/* Success Notification Modal */}
      <SuccessModal
        isOpen={successConfig.open}
        onClose={() => setSuccessConfig((prev) => ({ ...prev, open: false }))}
        title={successConfig.title}
        subTitle={successConfig.message}
      />
    </div>
  );
}
