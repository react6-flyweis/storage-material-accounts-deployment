import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  ChevronDown,
  Hammer,
  ShieldCheck,
  CircleDollarSign,
  LineChart,
  AlertTriangle,
  Eye,
  X,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentItem {
  id: string;
  date: string;
  amount: string;
  relatedTo: "Vendor" | "Carrier";
  status: "Recieved" | "Pending";
  invoiceNumber: string;
}

const PAYMENTS_DATA: PaymentItem[] = [
  {
    id: "pay-1",
    date: "Apr 02, 2024",
    amount: "$5,00",
    relatedTo: "Vendor",
    status: "Recieved",
    invoiceNumber: "INV-PAY-001",
  },
  {
    id: "pay-2",
    date: "Apr 02, 2024",
    amount: "$5,00",
    relatedTo: "Carrier",
    status: "Recieved",
    invoiceNumber: "INV-PAY-002",
  },
  {
    id: "pay-3",
    date: "Apr 02, 2024",
    amount: "$5,00",
    relatedTo: "Vendor",
    status: "Recieved",
    invoiceNumber: "INV-PAY-003",
  },
  {
    id: "pay-4",
    date: "Apr 02, 2024",
    amount: "$5,00",
    relatedTo: "Carrier",
    status: "Recieved",
    invoiceNumber: "INV-PAY-004",
  },
  {
    id: "pay-5",
    date: "Apr 02, 2024",
    amount: "$5,00",
    relatedTo: "Vendor",
    status: "Recieved",
    invoiceNumber: "INV-PAY-005",
  },
  {
    id: "pay-6",
    date: "Apr 02, 2024",
    amount: "$5,00",
    relatedTo: "Carrier",
    status: "Recieved",
    invoiceNumber: "INV-PAY-006",
  },
  {
    id: "pay-7",
    date: "Apr 02, 2024",
    amount: "$5,00",
    relatedTo: "Vendor",
    status: "Recieved",
    invoiceNumber: "INV-PAY-007",
  },
  {
    id: "pay-8",
    date: "Apr 02, 2024",
    amount: "$5,00",
    relatedTo: "Carrier",
    status: "Recieved",
    invoiceNumber: "INV-PAY-008",
  },
  {
    id: "pay-9",
    date: "Apr 02, 2024",
    amount: "$5,00",
    relatedTo: "Vendor",
    status: "Recieved",
    invoiceNumber: "INV-PAY-009",
  },
];

export default function ProjectPaymentsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as {
    projectName?: string;
    projectId?: string;
    customerName?: string;
  } | null;

  const projectTitle = state?.projectName || "Project 1";

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Preview modal state
  const [previewPayment, setPreviewPayment] = useState<PaymentItem | null>(null);

  // Stat cards matching the image
  const stats = [
    {
      title: "Total Payments Received",
      value: "$980,000",
      bg: "bg-[#1E4D8C]",
      icon: <Hammer className="w-5 h-5 text-[#1E4D8C]" />,
    },
    {
      title: "Payment Completion",
      value: "82%",
      bg: "bg-[#22C55E]",
      icon: <ShieldCheck className="w-5 h-5 text-[#22C55E]" />,
    },
    {
      title: "Pending Amount",
      value: "$150,000",
      bg: "bg-[#E5A500]",
      icon: <CircleDollarSign className="w-5 h-5 text-[#E5A500]" />,
    },
    {
      title: "Overdue Amount",
      value: "$70,000",
      hasAlert: true,
      bg: "bg-[#FA743E]",
      icon: <LineChart className="w-5 h-5 text-[#FA743E]" />,
    },
  ];

  // Filter payments
  const filteredPayments = useMemo(() => {
    return PAYMENTS_DATA.filter((item) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.date.toLowerCase().includes(q) ||
        item.amount.toLowerCase().includes(q) ||
        item.relatedTo.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q) ||
        item.invoiceNumber.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" ||
        item.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  // Download payment invoice handler
  const handleDownloadInvoice = (item: PaymentItem) => {
    const textContent = `PAYMENT RECEIPT
Invoice: ${item.invoiceNumber}
Date: ${item.date}
Amount: ${item.amount}
Related To: ${item.relatedTo}
Status: ${item.status}
Project: ${projectTitle}
`;
    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Receipt_${item.invoiceNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen bg-[#F0F4F8]">
      {/* 1. Top Header: Back Button & Title */}
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
          {projectTitle.startsWith("Project") ? projectTitle : `Project 1`} - Payments
        </h1>
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

      {/* 3. Payments Table Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 space-y-5">
        {/* Card Header with Title, Search & Status Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Payments
          </h2>

          <div className="flex items-center gap-3">
            {/* Search Input with right icon */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search Invoices"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 w-48 sm:w-60 rounded-lg border border-slate-200 bg-white pl-3.5 pr-9 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-none"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Status Filter Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="h-9 px-3.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 shadow-none transition-colors cursor-pointer"
              >
                <span>
                  {statusFilter === "all" ? "Status Filter" : statusFilter}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
              </button>

              {showStatusDropdown && (
                <div className="absolute right-0 mt-1.5 w-36 bg-white rounded-xl shadow-lg border border-slate-200 p-1.5 z-20 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter("all");
                      setShowStatusDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${
                      statusFilter === "all"
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    All Statuses
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter("Recieved");
                      setShowStatusDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${
                      statusFilter === "Recieved"
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Recieved
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter("Pending");
                      setShowStatusDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${
                      statusFilter === "Pending"
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Pending
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold text-slate-400">
                  DATE
                </th>
                <th className="py-3 px-4 font-semibold text-slate-400">
                  AMOUNT
                </th>
                <th className="py-3 px-4 font-semibold text-slate-400">
                  RELATED TO
                </th>
                <th className="py-3 px-4 font-semibold text-slate-400">
                  STATUS
                </th>
                <th className="py-3 px-4 font-semibold text-slate-400">
                  INVOICE
                </th>
                <th className="py-3 px-4 font-semibold text-slate-400 text-right w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    No payments found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="py-4 px-4 text-slate-700 font-normal whitespace-nowrap">
                      {item.date}
                    </td>
                    <td className="py-4 px-4 text-slate-700 font-normal whitespace-nowrap">
                      {item.amount}
                    </td>
                    <td className="py-4 px-4 text-slate-700 font-normal whitespace-nowrap">
                      {item.relatedTo}
                    </td>
                    <td className="py-4 px-4 text-[#22C55E] font-medium whitespace-nowrap">
                      {item.status}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleDownloadInvoice(item)}
                        className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold px-4 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
                      >
                        Download
                      </button>
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setPreviewPayment(item)}
                        title="View invoice details"
                        className="p-1 text-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
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
      </div>

      {/* Preview Invoice Modal */}
      {previewPayment && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Payment Details - {previewPayment.invoiceNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPayment(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 bg-[#F8FAFC] rounded-xl p-4 border border-slate-100 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice ID</span>
                <span className="font-bold text-slate-800 font-mono">
                  {previewPayment.invoiceNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date</span>
                <span className="font-semibold text-slate-800">
                  {previewPayment.date}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount</span>
                <span className="font-bold text-slate-900">
                  {previewPayment.amount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Related To</span>
                <span className="font-semibold text-slate-800">
                  {previewPayment.relatedTo}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <span className="font-bold text-[#22C55E]">
                  {previewPayment.status}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewPayment(null)}
                className="text-xs"
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  handleDownloadInvoice(previewPayment);
                  setPreviewPayment(null);
                }}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs"
              >
                Download Receipt
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
