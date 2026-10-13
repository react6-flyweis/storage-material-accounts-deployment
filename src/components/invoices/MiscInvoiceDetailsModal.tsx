import React from "react";
import ReactDOM from "react-dom";
import {
  X,
  FileText,
  Calendar,
  Link as LinkIcon,
  UploadCloud,
  CheckCircle2,
  Download,
} from "lucide-react";

export interface MiscInvoiceDetailsModalData {
  id: string;
  invoiceNumber: string;
  serviceProvider: string;
  category: string;
  amount: number;
  amountFormatted: string;
  dueDate: string;
  invoiceDate: string;
  paymentStatus: "Pending" | "Paid" | "Completed";
  approvalStatus: "Approved" | "Pending";
  linkedDelivery?: string;
  uploadedBy?: string;
  uploadedAt?: string;
}

interface MiscInvoiceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: MiscInvoiceDetailsModalData | null;
  onTogglePayment?: (id: string) => void;
}

export const MiscInvoiceDetailsModal: React.FC<
  MiscInvoiceDetailsModalProps
> = ({ isOpen, onClose, invoice, onTogglePayment }) => {
  if (!isOpen || !invoice) return null;

  const isPaid =
    invoice.paymentStatus.toLowerCase() === "paid" ||
    invoice.paymentStatus.toLowerCase() === "completed";

  const handleDownload = () => {
    window.print();
  };

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 transition-opacity animate-in fade-in duration-150 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-122 max-h-[90vh] overflow-y-auto p-6 relative animate-in zoom-in-95 duration-150 my-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Invoice Details
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          {/* Top Invoice Banner Box */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50/70 border border-slate-100 rounded-xl">
            <div>
              <span className="text-[11px] text-slate-400 block font-normal">
                Invoice Number
              </span>
              <span className="text-lg font-extrabold text-slate-900 tracking-tight font-mono">
                {invoice.invoiceNumber}
              </span>
            </div>
            <div>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-lg border ${
                  isPaid
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-[#FEF9C3] text-[#A16207] border-[#FDE047]"
                }`}
              >
                Payment: {isPaid ? "Paid" : "Pending"}
              </span>
            </div>
          </div>

          {/* Service Provider, Dates & Amount Box */}
          <div className="grid grid-cols-2 gap-4">
            {/* Left column: Provider & Dates */}
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">
                  Vendor Name
                </span>
                <span className="font-bold text-slate-800 text-sm block">
                  {invoice.serviceProvider}
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block">
                  Invoice Date
                </span>
                <span className="font-medium text-slate-700 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {invoice.invoiceDate}
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block">
                  Due Date
                </span>
                <span className="font-medium text-slate-700 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {invoice.dueDate}
                </span>
              </div>
            </div>

            {/* Right column: Invoice Amount and Linked To */}
            <div className="space-y-3">
              <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-3.5">
                <span className="text-[11px] text-slate-500 font-medium block">
                  Invoice Amount
                </span>
                <span className="text-2xl font-black text-[#2563EB] tracking-tight block mt-0.5">
                  {invoice.amountFormatted}
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block mb-1">
                  Linked To
                </span>
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 flex items-center gap-2">
                  <LinkIcon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <div className="text-[11px] leading-tight overflow-hidden">
                    <span className="font-bold text-slate-800 block truncate">
                      Delivery: {invoice.linkedDelivery || "DEL-2024-0045"}
                    </span>
                    <span className="text-slate-400 block truncate mt-0.5">
                      {invoice.category} - Site A
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline & History */}
          <div className="pt-1">
            <span className="text-xs font-semibold text-slate-700 block mb-1.5">
              Timeline & History
            </span>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <UploadCloud className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-slate-800 block">
                  Invoice Uploaded
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  By {invoice.uploadedBy || "John Smith"} on{" "}
                  {invoice.uploadedAt || "2024-03-16"}
                </span>
              </div>
            </div>
          </div>

          {/* Invoice Document Box */}
          <div className="pt-1">
            <span className="text-xs font-semibold text-slate-700 block mb-1.5">
              Invoice Document
            </span>
            <div className="border border-dashed border-slate-300 rounded-xl p-5 flex flex-col items-center justify-center text-center bg-white space-y-2">
              <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                <FileText className="w-7 h-7 text-slate-400 stroke-[1.5]" />
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Invoice Document Preview
              </p>
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer mt-1"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Download Invoice</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              if (onTogglePayment) onTogglePayment(invoice.id);
            }}
            className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer ${
              isPaid
                ? "bg-[#00A859] hover:bg-[#008f4c] text-white"
                : "bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            <span>{isPaid ? "Paid" : "Mark Paid"}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default MiscInvoiceDetailsModal;
