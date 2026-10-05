import React from "react";
import Modal from "../common_components/Modal";
import { X, Package, Building2, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export type ApprovalStatus = "Pending" | "Under Review" | "Approved" | "Disputed" | "Paid";
export type InvoiceType = "Carrier" | "Delivery Company" | "Vendor";

export interface PaymentApprovalItem {
  id: string;
  invoiceType: InvoiceType;
  companyName: string;
  invoiceNumber: string;
  project: string;
  amount: string;
  rawAmount?: number;
  dueDate: string;
  linkedTo: string;
  status: ApprovalStatus;
  priority?: "High" | "Medium" | "Low";
  deliveryDate?: string;
  deliveryId?: string;
  baseFreight?: string;
  fuelSurcharge?: string;
  handlingFee?: string;
  freightRequestId?: string;
  loadId?: string;
  linkedDeliveryId?: string;
  route?: string;
}

interface PaymentApprovalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: PaymentApprovalItem | null;
  onStatusChange?: (id: string, newStatus: ApprovalStatus) => void;
  onDownloadInvoice?: (item: PaymentApprovalItem) => void;
  onViewInvoice?: (item: PaymentApprovalItem) => void;
}

const PaymentApprovalDetailsModal: React.FC<PaymentApprovalDetailsModalProps> = ({
  isOpen,
  onClose,
  item,
  onDownloadInvoice,
  onViewInvoice,
}) => {
  const navigate = useNavigate();

  if (!item) return null;

  const handleDownload = () => {
    if (onDownloadInvoice) {
      onDownloadInvoice(item);
    }
  };

  const handleViewInvoice = () => {
    if (onViewInvoice) {
      onViewInvoice(item);
    } else {
      navigate("/payments/invoice/preview");
    }
  };

  // Safe fallback values matching design
  const invoiceAmount = item.amount.startsWith("$") ? item.amount : `$${item.amount}`;
  const baseFreight = item.baseFreight || "$4000";
  const fuelSurcharge = item.fuelSurcharge || "$300";
  const handlingFee = item.handlingFee || "$200";
  const deliveryDate = item.deliveryDate || "Wednesday, March 25, 2026";
  const deliveryId = item.deliveryId || "DEL-1001";
  const priority = item.priority || "Medium";
  const freightRequestId = item.freightRequestId || "Freight Request ID";
  const loadId = item.loadId || "LD-09876";
  const linkedDeliveryId = item.linkedDeliveryId || "DEL-9876";
  const route = item.route || "Austin → Houston";

  const renderStatusBadge = () => {
    switch (item.status) {
      case "Pending":
        return (
          <span className="border border-orange-400 text-orange-600 bg-white rounded-full px-3 py-0.5 text-xs font-semibold inline-block">
            Pending
          </span>
        );
      case "Under Review":
        return (
          <span className="border border-blue-400 text-blue-600 bg-white rounded-full px-3 py-0.5 text-xs font-semibold inline-block">
            Under Review
          </span>
        );
      case "Approved":
        return (
          <span className="border border-green-500 text-green-600 bg-white rounded-full px-3 py-0.5 text-xs font-semibold inline-block">
            Approved
          </span>
        );
      case "Disputed":
        return (
          <span className="border border-red-500 text-red-600 bg-white rounded-full px-3 py-0.5 text-xs font-semibold inline-block">
            Disputed
          </span>
        );
      default:
        return (
          <span className="border border-emerald-500 text-emerald-600 bg-white rounded-full px-3 py-0.5 text-xs font-semibold inline-block">
            {item.status}
          </span>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      hideHeader={true}
      width="max-w-2xl"
      className="p-6 sm:p-7 overflow-y-auto rounded-3xl"
    >
      <div className="flex flex-col bg-white">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-2">
          <div className="flex items-start gap-3.5">
            {/* Dark Blue Circular Icon */}
            <div className="w-12 h-12 rounded-full bg-[#2753B8] flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
              <Package className="w-6 h-6 stroke-[1.8]" />
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                  Payment Details
                </h2>
                {renderStatusBadge()}
              </div>

              {/* Subtitle details */}
              <div className="text-xs text-gray-600 mt-1 flex flex-wrap items-center gap-x-4 gap-y-0.5">
                <span>
                  Invoice Number :{" "}
                  <strong className="text-[#2563EB] font-bold">
                    {item.invoiceNumber}
                  </strong>
                </span>
                <span>
                  Invoice Type :{" "}
                  <strong className="text-[#2563EB] font-bold">
                    {item.invoiceType}
                  </strong>
                </span>
              </div>

              <div className="text-xs text-gray-600 mt-0.5">
                <span>
                  Company :{" "}
                  <strong className="text-[#2563EB] font-bold">
                    {item.companyName}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Close X button */}
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Grid: Invoice Details & Company Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* Left: Invoice Details Card (Light Blue) */}
          <div className="bg-[#F2F6FE] border border-[#BFDBFE] rounded-2xl p-5 space-y-2">
            <h3 className="font-bold text-gray-900 text-sm mb-3">
              Invoice Details
            </h3>
            <div className="space-y-2 text-sm font-semibold text-[#1E3A8A]">
              <div>
                Invoice Amount : <span className="font-bold">{invoiceAmount}</span>
              </div>
              <div>
                Status :{" "}
                <span className="font-bold">
                  {item.status === "Pending" ? "Pending Approval" : item.status}
                </span>
              </div>
              <div>
                Payment Due Date :{" "}
                <span className="font-bold">{item.dueDate}</span>
              </div>
              <div>
                Payment Priority : <span className="font-bold">{priority}</span>
              </div>
            </div>
          </div>

          {/* Right: Company Information */}
          <div className="space-y-3.5 pl-0 md:pl-2">
            <h3 className="font-bold text-gray-900 text-base mb-1">
              Company Information
            </h3>

            {/* Company Name */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#E0EEFF] text-[#2563EB] flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-[#2563EB]" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Company Name</p>
                <p className="text-sm font-bold text-gray-900">
                  {item.companyName}
                </p>
              </div>
            </div>

            {/* Delivery Date */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-[#9333EA]" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Delivery Date</p>
                <p className="text-sm font-bold text-gray-900">{deliveryDate}</p>
              </div>
            </div>

            {/* Delivery ID */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FFEDD5] text-[#EA580C] flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-[#EA580C]" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Delivery ID</p>
                <p className="text-sm font-bold text-gray-900">{deliveryId}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Grid: Cost Breakdown & Linked Transaction */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Left: Cost Breakdown (Mint Green) */}
          <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-5 space-y-2">
            <h3 className="font-bold text-[#15803D] text-sm mb-3">
              Cost Breakdown
            </h3>
            <div className="space-y-2 text-sm font-semibold text-[#15803D]">
              <div>Base Freight : {baseFreight}</div>
              <div>Fuel Surcharge : {fuelSurcharge}</div>
              <div>Handling Fee : {handlingFee}</div>
              <div>Total : {invoiceAmount}</div>
            </div>
          </div>

          {/* Right: Linked Transaction (Mint Green) */}
          <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-5 space-y-2">
            <h3 className="font-bold text-gray-900 text-sm mb-3">
              Linked Transaction
            </h3>
            <div className="space-y-2 text-sm">
              <div className="font-bold text-gray-900">
                Freight Request ID :{" "}
                <span className="font-bold text-gray-900">
                  {freightRequestId}
                </span>
              </div>
              <div className="font-semibold text-[#15803D]">
                Load ID : {loadId}
              </div>
              <div className="font-semibold text-[#15803D]">
                Project : {item.project}
              </div>
              <div className="font-semibold text-[#15803D]">
                Delivery ID : {linkedDeliveryId}
              </div>
              <div className="font-semibold text-[#15803D]">
                Route : {route}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 mt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-gray-200 text-gray-800 bg-white hover:bg-gray-50 rounded-xl h-10 px-8 font-medium cursor-pointer shadow-none"
          >
            Close
          </Button>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={handleDownload}
              className="bg-[#2B59C3] hover:bg-[#204499] text-white rounded-xl h-10 px-5 gap-2 font-medium flex items-center shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Invoice</span>
            </Button>

            <Button
              type="button"
              onClick={handleViewInvoice}
              className="bg-[#2B59C3] hover:bg-[#204499] text-white rounded-xl h-10 px-6 font-medium shadow-xs cursor-pointer"
            >
              View Invoice
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentApprovalDetailsModal;
