import {
  X,
  Building2,
  Truck,
  FileText,
  Download,
  CreditCard,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import type { PayableInvoiceEntry } from "./ManualPayableUploadDialog";
import { PayableStatusBadge } from "./PayableStatusBadge";

interface PayableDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: PayableInvoiceEntry | null;
  onRecordPayment?: (inv: PayableInvoiceEntry) => void;
  onDownloadCsv?: (inv: PayableInvoiceEntry) => void;
}

export function PayableDetailModal({
  isOpen,
  onClose,
  invoice,
  onRecordPayment,
  onDownloadCsv,
}: PayableDetailModalProps) {
  if (!isOpen || !invoice) return null;

  const isVendor = invoice.type === "vendor";
  const isPaid =
    invoice.paymentStatus.toLowerCase() === "paid" ||
    invoice.payableStatus.toLowerCase() === "paid";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1D51A4]/10 text-[#1D51A4] flex items-center justify-center">
              {isVendor ? (
                <Building2 className="w-5 h-5" />
              ) : (
                <Truck className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Invoice #{invoice.invoiceNumber}
                </h3>
                <PayableStatusBadge status={invoice.payableStatus} />
              </div>
              <p className="text-xs text-slate-500">
                {isVendor ? "Vendor Payable Record" : "Freight Carrier Payable Record"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Top Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Payee
              </span>
              <div className="text-sm font-bold text-slate-900 mt-1">
                {invoice.payeeName}
              </div>
              {invoice.carrierCode && (
                <div className="text-xs text-slate-500 mt-0.5">
                  Code: {invoice.carrierCode}
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Total Amount
              </span>
              <div className="text-base font-extrabold text-[#1D51A4] mt-1">
                ${invoice.amount.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Status: {invoice.paymentStatus}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Due Date
              </span>
              <div className="text-sm font-bold text-slate-900 mt-1">
                {invoice.dueDate}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Issued: {invoice.date}
              </div>
            </div>
          </div>

          {/* Allocation & Project Matching Details */}
          <div className="border border-slate-100 rounded-xl p-4.5 bg-white space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Project & Allocation Details
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400">Project</span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {invoice.project}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Job ID / Ref</span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {invoice.jobId}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Category</span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {invoice.category || "General"}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Route / Delivery</span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {invoice.route || "Direct Plant Dispatch"}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Disbursement Information (if paid) */}
          {invoice.paymentDetails ? (
            <div className="border border-emerald-200 rounded-xl p-4.5 bg-emerald-50/50 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Payment Settlement Details</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-emerald-700/70">Disbursed On</span>
                  <p className="font-semibold text-emerald-950 mt-0.5">
                    {invoice.paymentDetails.paidAt || "Recorded"}
                  </p>
                </div>
                <div>
                  <span className="text-emerald-700/70">Payment Mode</span>
                  <p className="font-semibold text-emerald-950 mt-0.5">
                    {invoice.paymentDetails.method || "Bank Wire"}
                  </p>
                </div>
                <div>
                  <span className="text-emerald-700/70">Transaction Ref #</span>
                  <p className="font-semibold text-emerald-950 mt-0.5">
                    {invoice.paymentDetails.referenceNumber || "-"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-slate-100 rounded-xl p-4 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-slate-400" />
                <span>This payable invoice has not been disbursed yet.</span>
              </div>
              {onRecordPayment && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onRecordPayment(invoice);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer transition-colors"
                >
                  Record Payment Now
                </button>
              )}
            </div>
          )}

          {/* Document Attachment & Notes */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/50 text-xs">
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-[#1D51A4]" />
              <div>
                <span className="font-semibold text-slate-800">
                  Attached Invoice File
                </span>
                <p className="text-[11px] text-slate-400">
                  Official bill scan / electronic invoice
                </p>
              </div>
            </div>
            {invoice.documentUrl && (
              <a
                href={invoice.documentUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-medium cursor-pointer transition-colors"
              >
                <span>View Document</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-white sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2.5">
            {onDownloadCsv && (
              <button
                type="button"
                onClick={() => onDownloadCsv(invoice)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download CSV</span>
              </button>
            )}

            {!isPaid && onRecordPayment && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRecordPayment(invoice);
                }}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Record Payment</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PayableDetailModal;
