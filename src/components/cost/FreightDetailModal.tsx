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
import type { FreightDeliveryRecord } from "./freightCostData";

interface FreightDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: FreightDeliveryRecord | null;
  onApprove?: (record: FreightDeliveryRecord) => void;
  onReject?: (record: FreightDeliveryRecord) => void;
  onMarkPaid?: (record: FreightDeliveryRecord) => void;
  onDownloadInvoice?: (record: FreightDeliveryRecord) => void;
}

export const FreightDetailModal: React.FC<FreightDetailModalProps> = ({
  isOpen,
  onClose,
  record,
  onApprove,
  onReject,
  onMarkPaid,
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

  const freightId = record.freightId || "FR-1001";
  const totalLoads = record.totalLoads || "2 Loads";
  const costFormatted = record.costFormatted || "$4,500.00";
  const awardedCarrier =
    record.awardedCarrier || record.deliveryCompany || "FastFreight Logistics";
  const awardedBid = record.awardedBid || "$4,500";
  const averageBid = record.averageBid || "$4,850";
  const highestBid = record.highestBid || "$5,100";
  const savings = record.savings || "$350 (Saved $350 (7.2%))";
  const deliveryId = record.deliveryId || "DEL-1001";
  const deliveryStatus = record.deliveryStatus || "Delivered";
  const invoiceNumber = record.invoiceNumber || "INV-45892";
  const invoiceDate = record.invoiceDate || "March 25, 2026";
  const paymentDueDate = record.paymentDueDate || "April 1, 2026";
  const invoiceStatus = record.invoiceStatus || "Under Review";

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh]  overflow-y-auto my-8 animate-in zoom-in-95 duration-200 border border-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-7 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#3B5BDB] flex items-center justify-center text-white shadow-xs">
              <Package className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Freight Cost Details
              </h2>
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mt-0.5">
                <span>
                  Freight Request ID :{" "}
                  <span className="text-[#3B5BDB]">{freightId}</span>
                </span>
                <span>Total Loads : {totalLoads}</span>
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
        <div className="p-7 space-y-6 pt-2">
          {/* Top 2 Green Outline Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Green Box: Total Freight Cost */}
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50/20 p-5 flex flex-col justify-center">
              <span className="text-xs font-semibold text-emerald-800">
                Total Freight Cost
              </span>
              <div className="text-3xl font-extrabold text-emerald-700 tracking-tight mt-1">
                {costFormatted}
              </div>
              <span className="text-xs font-medium text-emerald-700 mt-2">
                Status: Invoiced
              </span>
            </div>

            {/* Right Green Box: Bid Summary */}
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50/20 p-5 text-xs space-y-1.5">
              <div className="font-bold text-slate-900 mb-2">Bid Summary</div>
              <div className="font-semibold text-slate-800">
                Awarded Carrier: {awardedCarrier}
              </div>
              <div className="font-semibold text-emerald-700">
                Awarded Bid : {awardedBid}
              </div>
              <div className="font-semibold text-emerald-700">
                Average Bid : {averageBid}
              </div>
              <div className="font-semibold text-emerald-700">
                Highest Bid : {highestBid}
              </div>
              <div className="font-semibold text-emerald-700 pt-0.5">
                Savings = {savings}
              </div>
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
                  <Building2 className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    Project
                  </div>
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {record.project}
                  </div>
                </div>
              </div>

              {/* Delivery Date */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                  <Calendar className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    Delivery Date
                  </div>
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    Wednesday, {record.date}
                  </div>
                </div>
              </div>

              {/* Delivery ID */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                  <Package className="w-4 h-4 stroke-[2]" />
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
                  <Truck className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    Carrier
                  </div>
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {awardedCarrier}
                  </div>
                </div>
              </div>

              {/* Freight Cost */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <DollarSign className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    Freight Cost
                  </div>
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {costFormatted}
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                  <CheckCircle className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-medium mb-0.5">
                    Payment Status
                  </div>
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#22C55E] text-white text-[11px] font-bold">
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
                  <Truck className="w-4 h-4 stroke-[2]" />
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
                  <CheckCircle className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="space-y-1.5 w-full">
                  <div className="text-[11px] text-slate-400 font-medium">
                    Proof of Delivery (POD)
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="inline-block px-2.5 py-1 rounded-md bg-[#22C55E] text-white text-[11px] font-semibold text-center">
                      Proof of Delivery (POD)
                    </span>
                    <span className="inline-block px-2.5 py-1 rounded-md bg-[#22C55E] text-white text-[11px] font-semibold text-center">
                      Delivery Receipt
                    </span>
                    <span className="inline-block px-2.5 py-1 rounded-md bg-[#22C55E] text-white text-[11px] font-semibold text-center">
                      Bill of Lading
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom 2 Blue Outline Cards */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Left Box (5 cols): Cost Comparison */}
            <div className="md:col-span-4 rounded-2xl border border-blue-200 bg-blue-50/20 p-5 text-xs space-y-3 flex flex-col justify-center">
              <div className="font-bold text-[#1E3A8A] text-sm">
                Cost Comparison
              </div>
              <div className="font-bold text-[#1E3A8A]">
                Awarded Bid : {awardedBid}
              </div>
              <div className="font-bold text-[#1E3A8A]">
                Invoiced Amount : {awardedBid}
              </div>
              <div className="font-bold text-[#1E3A8A]">Variance : $0</div>
            </div>

            {/* Right Box (7 cols): Invoice Details */}
            <div className="md:col-span-8 rounded-2xl border border-blue-200 bg-blue-50/20 p-5 text-xs space-y-2">
              <div className="font-bold text-slate-900 text-sm mb-1">
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

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => onDownloadInvoice?.(record)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={() => onReject?.(record)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#475569] hover:bg-[#334155] text-white font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => onApprove?.(record)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => onMarkPaid?.(record)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#22C55E] hover:bg-[#16a34a] text-white font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  Mark paid
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 py-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => onDownloadInvoice?.(record)}
            className="px-6 py-2.5 rounded-xl bg-[#2E5BFF] hover:bg-[#1f48e0] text-white text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
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

export default FreightDetailModal;
