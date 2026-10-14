import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import {
  X,
  Package,
  Building2,
  Calendar,
  Truck,
  DollarSign,
  CheckCircle,
  Download,
} from "lucide-react";

export interface LogisticsDetailRecord {
  id?: string;
  loadId?: string;
  deliveryId: string;
  project: string;
  carrier?: string;
  deliveryCompany?: string;
  cost?: number;
  finalAmountFormatted?: string;
  costFormatted?: string;
  date?: string;
  approvalStatus?: string;
  invoiceStatus?: string;
  paymentStatus?: string;
  deliveryStatus?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  paymentDueDate?: string;
}

interface LogisticsCostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: LogisticsDetailRecord | null;
  onDownloadInvoice?: (record: LogisticsDetailRecord) => void;
}

export const LogisticsCostDetailModal: React.FC<LogisticsCostDetailModalProps> = ({
  isOpen,
  onClose,
  record,
  onDownloadInvoice,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !record) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const loadId = record.loadId || "TRX-9876";
  const deliveryId = record.deliveryId || "DEL-1235";
  const amountFormatted = record.finalAmountFormatted || record.costFormatted || "$4,500.00";
  const invoiceStatus = record.invoiceStatus || "Under Review";
  const paymentStatus = record.paymentStatus || "Pending";
  const project = record.project || "ABC Logistics Warehouse";
  const deliveryDate = record.date ? (record.date.includes(",") ? record.date : `Wednesday, ${record.date}`) : "Wednesday, March 25, 2026";
  const carrier = record.carrier || record.deliveryCompany || "FastFreight Logistics";
  const deliveryStatus = record.deliveryStatus || "Delivered";
  const invoiceNumber = record.invoiceNumber || "INV-45892";
  const invoiceDate = record.invoiceDate || "March 25, 2026";
  const paymentDueDate = record.paymentDueDate || "April 1, 2026";

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto my-6 animate-in zoom-in-95 duration-200 border border-slate-100"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-7 pt-7 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#3B5BDB] flex items-center justify-center text-white shadow-xs">
              <Package className="w-6 h-6 stroke-2" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Logistics Cost Details
              </h2>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 mt-0.5">
                <span>
                  Load ID : <span className="text-[#2563EB] font-bold">{loadId}</span>
                </span>
                <span>
                  Delivery ID : <span className="text-[#2563EB] font-bold">{deliveryId}</span>
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-7 pb-6 space-y-6 pt-1">
          {/* Top Green Box: Total Logistics Cost */}
          <div className="rounded-2xl border border-[#86EFAC] bg-[#F0FDF4]/70 p-5">
            <span className="text-xs font-semibold text-[#15803D]">
              Total Logistics Cost
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#14532D] tracking-tight mt-1">
              {amountFormatted}
            </div>
            <div className="mt-2.5 space-y-0.5 text-xs font-medium text-[#15803D]">
              <div>Invoice Status : {invoiceStatus}</div>
              <div>Payment Status : {paymentStatus}</div>
            </div>
          </div>

          {/* 3 Columns: Project Information | Carrier Information | Delivery Link */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Col 1: Project Information */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">
                Project Information
              </h3>

              {/* Project */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <Building2 className="w-4 h-4 stroke-2" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    Project
                  </div>
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {project}
                  </div>
                </div>
              </div>

              {/* Delivery Date */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                  <Calendar className="w-4 h-4 stroke-2" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    Delivery Date
                  </div>
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {deliveryDate}
                  </div>
                </div>
              </div>

              {/* Delivery ID */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500 shrink-0">
                  <Package className="w-4 h-4 stroke-2" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    Delivery ID
                  </div>
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {deliveryId}
                  </div>
                </div>
              </div>
            </div>

            {/* Col 2: Carrier Information */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">
                Carrier Information
              </h3>

              {/* Carrier */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <Truck className="w-4 h-4 stroke-2" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    Carrier
                  </div>
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {carrier}
                  </div>
                </div>
              </div>

              {/* Logistic Cost */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <DollarSign className="w-4 h-4 stroke-2" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    Logistic Cost
                  </div>
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {amountFormatted}
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                  <CheckCircle className="w-4 h-4 stroke-2" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-medium mb-1">
                    Payment Status
                  </div>
                  <span className="inline-block px-3 py-0.5 rounded-full bg-[#16A34A] text-white text-[11px] font-bold">
                    Invoiced
                  </span>
                </div>
              </div>
            </div>

            {/* Col 3: Delivery Link */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">
                Delivery Link
              </h3>

              {/* Delivery Status */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <Truck className="w-4 h-4 stroke-2" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    Delivery Status
                  </div>
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {deliveryStatus}
                  </div>
                </div>
              </div>

              {/* Proof of Delivery (POD) */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                  <CheckCircle className="w-4 h-4 stroke-2" />
                </div>
                <div className="space-y-1.5 w-full">
                  <div className="text-[11px] text-slate-400 font-medium">
                    Proof of Delivery (POD)
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="inline-block px-3 py-1 rounded-full bg-[#16A34A] text-white text-[11px] font-semibold text-center shadow-2xs">
                      Proof of Delivery (POD)
                    </span>
                    <span className="inline-block px-3 py-1 rounded-full bg-[#16A34A] text-white text-[11px] font-semibold text-center shadow-2xs">
                      Delivery Receipt
                    </span>
                    <span className="inline-block px-3 py-1 rounded-full bg-[#16A34A] text-white text-[11px] font-semibold text-center shadow-2xs">
                      Bill of Lading
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Blue Outline Card: Invoice Details */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50/20 p-5 text-xs space-y-2">
            <div className="font-bold text-slate-900 text-sm mb-2">
              Invoice Details
            </div>
            <div className="font-bold text-[#1E3A8A]">
              Invoice Number : {invoiceNumber}
            </div>
            <div className="font-bold text-[#1E3A8A]">
              Invoice Date : {invoiceDate}
            </div>
            <div className="font-bold text-[#1E3A8A]">
              Payment Due Date : {paymentDueDate}
            </div>
            <div className="font-bold text-[#1E3A8A]">
              Invoice Status : {invoiceStatus}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 py-4 bg-white border-t border-slate-100 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-center"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => onDownloadInvoice?.(record)}
            className="flex-1 py-2.5 rounded-xl bg-[#3B5BDB] hover:bg-[#304bc0] text-white text-xs sm:text-sm font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Invoice</span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default LogisticsCostDetailModal;
