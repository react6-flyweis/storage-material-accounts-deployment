import React from "react";
import { X, FileText, Download, CheckCircle, Clock } from "lucide-react";

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  invoiceNumber?: string;
  project: string;
  customer: string;
  invoiceType: string;
  amount: number;
  amountFormatted: string;
  invDate: string;
  dueDate: string;
  paymentStatus: "Pending" | "Complete" | "Paid" | string;
  invoiceStatus?: string;
  amountDue?: number;
  paid?: number;
  pdfUrl?: string | null;
  documentUrl?: string | null;
}

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceItem | null;
  onStatusChange?: (id: string, status: "Pending" | "Complete") => void;
  onMarkPaid?: (invoiceId: string) => void;
  onFollowUp?: (invoiceId: string) => void;
  isMarkingPaid?: boolean;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onMarkPaid,
  onFollowUp,
  isMarkingPaid,
}) => {
  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Invoice Details
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {invoice.invoiceId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Main Info Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block mb-0.5">Project</span>
              <span className="font-bold text-slate-900 text-sm">
                {invoice.project}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Customer</span>
              <span className="font-semibold text-slate-800 text-sm">
                {invoice.customer}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Invoice Type</span>
              <span className="font-medium text-slate-800">
                {invoice.invoiceType}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Payment Status</span>
              <span
                className={`inline-flex items-center gap-1 font-bold ${
                  invoice.paymentStatus === "Complete"
                    ? "text-emerald-600"
                    : "text-amber-500"
                }`}
              >
                {invoice.paymentStatus === "Complete" ? (
                  <CheckCircle className="w-3.5 h-3.5" />
                ) : (
                  <Clock className="w-3.5 h-3.5" />
                )}
                {invoice.paymentStatus}
              </span>
            </div>
          </div>

          {/* Dates & Amount */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-slate-100">
              <span className="text-slate-500 block mb-1">Invoice Date</span>
              <span className="font-semibold text-slate-700">
                {invoice.invDate}
              </span>
            </div>
            <div className="p-3 rounded-lg border border-slate-100">
              <span className="text-slate-500 block mb-1">Due Date</span>
              <span className="font-semibold text-slate-700">
                {invoice.dueDate}
              </span>
            </div>
            <div className="p-3 rounded-lg border border-blue-100 bg-blue-50/40">
              <span className="text-blue-700 block mb-1 font-medium">Total Amount</span>
              <span className="font-bold text-blue-700 text-sm">
                {invoice.amountFormatted}
              </span>
            </div>
          </div>

          {/* Breakdown summary */}
          <div className="border border-slate-100 rounded-xl p-4 text-xs space-y-2">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span className="font-medium text-slate-700">
                {invoice.amountFormatted}
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Tax / Deductions (18% GST incl.)</span>
              <span className="font-medium text-slate-700">Applicable</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-slate-900 text-sm">
              <span>Balance Due</span>
              <span className={invoice.paymentStatus === "Complete" ? "text-emerald-600" : "text-amber-600"}>
                {invoice.paymentStatus === "Complete" ? "$0" : invoice.amountFormatted}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {invoice.paymentStatus !== "Paid" && invoice.paymentStatus !== "Complete" && onMarkPaid && (
              <button
                disabled={isMarkingPaid}
                onClick={() => onMarkPaid(invoice.invoiceId || invoice.id)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                {isMarkingPaid ? "Updating..." : "Mark as Paid"}
              </button>
            )}
            {invoice.invoiceStatus === "overdue" && onFollowUp && (
              <button
                onClick={() => onFollowUp(invoice.invoiceId || invoice.id)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer"
              >
                Follow Up
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {(invoice.pdfUrl || invoice.documentUrl) ? (
              <a
                href={
                  (invoice.pdfUrl || invoice.documentUrl || "").startsWith("http")
                    ? (invoice.pdfUrl || invoice.documentUrl || "")
                    : `${import.meta.env.VITE_API_BASE_URL || "https://mr-storage-backend-025k.onrender.com"}${(invoice.pdfUrl || invoice.documentUrl || "").startsWith("/") ? "" : "/"}${invoice.pdfUrl || invoice.documentUrl}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                View PDF
              </a>
            ) : (
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Print
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
