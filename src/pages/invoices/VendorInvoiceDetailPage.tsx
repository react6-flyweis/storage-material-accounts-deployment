import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  Download,
  Mail,
  Calendar,
  Link as LinkIcon,
  UploadCloud,
} from "lucide-react";
import SuccessModal from "@/components/common_components/SuccessModal";
import logo from "@/assets/logo.svg";
import type { VendorInvoiceItem } from "./VendorInvoicesPage";

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  vendorName: string;
  amount: number;
  amountFormatted: string;
  dueDate: string;
  invoiceDate: string;
  paymentStatus: "Pending" | "Completed" | "Paid";
  linkedInvoice?: string;
  linkedProjectDesc?: string;
  uploadedBy?: string;
  uploadedAt?: string;
}

export default function VendorInvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve invoice either from route state or local storage or fallback defaults
  const [invoice, setInvoice] = useState<InvoiceData>(() => {
    if (location.state && location.state.invoice) {
      const inv = location.state.invoice;
      return {
        id: inv.id || "1",
        invoiceNumber: inv.invoiceNumber || "VND-2024-0123",
        vendorName: inv.vendorName || "ABC Concrete Suppliers",
        amount: inv.amount || 15250,
        amountFormatted: inv.amountFormatted || "$15,250",
        dueDate: inv.dueDate || "2024-04-15",
        invoiceDate: "2024-03-15",
        paymentStatus: inv.paymentStatus || "Pending",
        linkedInvoice: "DEL-2024-0045",
        linkedProjectDesc: "Concrete Mix - Site A",
        uploadedBy: "John Smith",
        uploadedAt: "2024-03-16",
      };
    }

    try {
      const stored = localStorage.getItem("vendor_invoices_table_data");
      if (stored) {
        const parsed = JSON.parse(stored) as VendorInvoiceItem[];
        const found = parsed.find(
          (item) => item.id === id || item.invoiceNumber === id,
        );
        if (found) {
          return {
            id: found.id,
            invoiceNumber: found.invoiceNumber,
            vendorName: found.vendorName,
            amount: found.amount,
            amountFormatted: found.amountFormatted,
            dueDate: found.dueDate || "2024-04-15",
            invoiceDate: "2024-03-15",
            paymentStatus: found.paymentStatus,
            linkedInvoice: "DEL-2024-0045",
            linkedProjectDesc: `${found.project || "Industrial Park"} - Site A`,
            uploadedBy: "John Smith",
            uploadedAt: "2024-03-16",
          };
        }
      }
    } catch {
      // ignore
    }

    // Default sample data matching screenshot
    return {
      id: "vnd-demo",
      invoiceNumber: "VND-2024-0123",
      vendorName: "ABC Concrete Suppliers",
      amount: 15250,
      amountFormatted: "$15,250",
      dueDate: "2024-04-15",
      invoiceDate: "2024-03-15",
      paymentStatus: "Pending",
      linkedInvoice: "DEL-2024-0045",
      linkedProjectDesc: "Concrete Mix - Site A",
      uploadedBy: "John Smith",
      uploadedAt: "2024-03-16",
    };
  });

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState({
    title: "Payment Recorded",
    subTitle: `Invoice ${invoice.invoiceNumber} has been successfully marked as Paid.`,
  });

  const handleMarkPaid = () => {
    const nextStatus: "Completed" | "Pending" =
      invoice.paymentStatus === "Completed" || invoice.paymentStatus === "Paid"
        ? "Pending"
        : "Completed";

    setInvoice((prev) => ({
      ...prev,
      paymentStatus: nextStatus,
    }));

    // Update in local storage if present
    try {
      const stored = localStorage.getItem("vendor_invoices_table_data");
      if (stored) {
        const parsed = JSON.parse(stored) as VendorInvoiceItem[];
        const updated = parsed.map((item) =>
          item.id === invoice.id || item.invoiceNumber === invoice.invoiceNumber
            ? { ...item, paymentStatus: nextStatus }
            : item,
        );
        localStorage.setItem(
          "vendor_invoices_table_data",
          JSON.stringify(updated),
        );
      }
    } catch {
      // ignore
    }

    if (nextStatus === "Completed") {
      setSuccessMessage({
        title: "Payment Recorded",
        subTitle: `Invoice ${invoice.invoiceNumber} has been successfully marked as Paid.`,
      });
      setIsSuccessOpen(true);
    }
  };

  const handleDownload = () => {
    window.print();
  };

  const isPaid =
    invoice.paymentStatus === "Completed" || invoice.paymentStatus === "Paid";

  return (
    <div className="min-h-screen bg-[#EEF2FB] p-4 sm:p-6 lg:p-8 space-y-6">
      {/* 1. Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-slate-500" />
            <span>Back</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Vendor Invoice Details
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Download</span>
          </button>

          <button
            type="button"
            onClick={() => {
              window.location.href = `mailto:?subject=Vendor Invoice ${invoice.invoiceNumber}`;
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3B66BD] hover:bg-[#2F54A0] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-white" />
            <span>Email</span>
          </button>
        </div>
      </div>

      {/* 2. Metadata / Summary Cards Banner */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-6 space-y-6">
        {/* Banner Top Row: Invoice Number, Badge, and Amount Box */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs text-slate-400 font-medium block mb-1">
              Invoice Number
            </span>
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {invoice.invoiceNumber}
              </h2>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-lg border ${
                  isPaid
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                Payment: {isPaid ? "Paid" : "Pending"}
              </span>
            </div>
          </div>

          <div className="bg-[#F0F5FF] border border-[#D8E6FF] rounded-xl px-7 py-3 text-right sm:text-left self-start sm:self-auto">
            <span className="text-xs text-slate-500 font-medium block">
              Invoice Amount
            </span>
            <span className="text-2xl font-extrabold text-[#2563EB]">
              {invoice.amountFormatted}
            </span>
          </div>
        </div>

        {/* Banner Grid: Basic Details, Linked To, Timeline & History */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Column 1: Basic Details */}
          <div>
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Basic Details
            </h3>
            <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-100 flex flex-wrap gap-4 items-center">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">
                  Vendor Name
                </span>
                <span className="font-bold text-slate-900 block mt-0.5">
                  {invoice.vendorName}
                </span>
              </div>
              <div className="border-l border-slate-200 pl-3">
                <span className="text-[11px] text-slate-400 block font-medium">
                  Invoice Date
                </span>
                <span className="font-medium text-slate-700 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {invoice.invoiceDate}
                </span>
              </div>
              <div className="border-l border-slate-200 pl-3">
                <span className="text-[11px] text-slate-400 block font-medium">
                  Due Date
                </span>
                <span className="font-medium text-slate-700 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {invoice.dueDate}
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Linked To */}
          <div>
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Linked To
            </h3>
            <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <LinkIcon className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-800 block">
                  Invoice: {invoice.linkedInvoice}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {invoice.linkedProjectDesc}
                </span>
              </div>
            </div>
          </div>

          {/* Column 3: Timeline & History */}
          <div>
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Timeline & History
            </h3>
            <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <UploadCloud className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-800 block">
                  Invoice Uploaded
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  By {invoice.uploadedBy} on {invoice.uploadedAt}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Formal Invoice Document Paper Sheet */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-8 sm:p-12 max-w-4xl mx-auto space-y-10">
        {/* Invoice Paper Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <img
              src={logo}
              alt="Logo"
              className="h-12 w-auto object-contain"
            />
          </div>

          <div className="text-center">
            <h2 className="text-lg font-bold uppercase tracking-widest text-slate-400">
              INVOICE
            </h2>
          </div>

          <div>
            <button
              type="button"
              onClick={handleMarkPaid}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                isPaid
                  ? "bg-[#00A859] hover:bg-[#008f4c] text-white"
                  : "bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-xs"
              }`}
            >
              {isPaid ? "✓ Paid" : "Mark Paid"}
            </button>
          </div>
        </div>

        {/* Sender / Receiver & Invoice Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs text-slate-600">
          <div className="space-y-1">
            <p className="font-normal text-slate-700">
              1851 Madison Ave Suite 300
            </p>
            <p className="font-normal text-slate-700">Council Bluffs, IA</p>
            <p className="font-normal text-slate-700">51503</p>
            <p className="font-normal text-slate-700">United States</p>
            <p className="text-slate-500">travis@storagematerials.com</p>
            <p className="text-slate-500">www.storagematerials.com</p>
          </div>

          <div className="space-y-2 sm:text-right">
            <div className="flex justify-between sm:justify-end sm:gap-12">
              <span className="font-semibold text-slate-700">
                Payment terms
              </span>
              <span className="text-slate-800">15 days</span>
            </div>
            <div className="flex justify-between sm:justify-end sm:gap-12">
              <span className="font-semibold text-slate-700">Invoice #</span>
              <span className="text-slate-800 font-mono">2460</span>
            </div>
            <div className="flex justify-between sm:justify-end sm:gap-12">
              <span className="font-semibold text-slate-700">Date</span>
              <span className="text-slate-800">10-25-2025</span>
            </div>
            <div className="flex justify-between sm:justify-end sm:gap-12">
              <span className="font-semibold text-slate-700">
                Business/Tax #
              </span>
              <span className="text-slate-800">99- 4515145</span>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="space-y-4">
          <div className="flex justify-between text-xs font-bold text-slate-800 border-b border-slate-900 pb-2">
            <span>Description</span>
            <span>Total</span>
          </div>

          {/* Item 1 */}
          <div className="border-b border-slate-200 pb-3">
            <div className="flex justify-between text-xs font-semibold text-slate-800">
              <span>Material Order</span>
              <span>$75,00.000</span>
            </div>
            <span className="text-[11px] text-slate-400">ORD-23456</span>
          </div>

          {/* Material List Items */}
          <div className="pt-2">
            <span className="text-xs font-bold text-slate-800 block mb-2">
              Material List
            </span>

            {[1, 2, 3, 4].map((idx) => (
              <div
                key={idx}
                className="py-3 border-b border-slate-100 flex justify-between items-start text-xs"
              >
                <div>
                  <span className="text-slate-700 font-medium block">
                    Material 1
                  </span>
                  <span className="text-[11px] text-slate-400">PRT-23456</span>
                </div>
                <span className="text-slate-800 font-medium">$450</span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end pt-4">
          <div className="w-64 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span className="font-bold text-slate-800">Subtotal</span>
              <span className="font-medium">$1,917,952.00</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="text-slate-600">Tax</span>
              <span className="font-medium">$153,436.15</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total</span>
              <span>$2,071,388.16</span>
            </div>
          </div>
        </div>

        {/* Footer Notes & Signatures */}
        <div className="pt-8 border-t border-slate-200 space-y-6 text-xs text-slate-600">
          <p className="font-medium">
            Thank you for your business! Reach out with any questions
          </p>
          <p className="text-[11px] text-slate-400">
            By Signing this document the customer agrees to the services and
            conditions outlined in this document
          </p>

          <div className="pt-12 flex justify-end">
            <div className="w-64 border-t border-slate-400 pt-2 text-center text-xs text-slate-500 font-medium">
              Client signature
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title={successMessage.title}
        subTitle={successMessage.subTitle}
      />
    </div>
  );
}
