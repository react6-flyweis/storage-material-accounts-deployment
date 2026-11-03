import React, { useState } from "react";
import Modal from "../common_components/Modal";
import { X, Package, Building2, Calendar, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  useGetPaymentApprovalDetailQuery,
  useReviewPaymentApprovalMutation,
  type ReviewAction,
} from "@/redux/api/paymentApprovalsApi";

export type ApprovalStatus = "Pending" | "Under Review" | "Approved" | "Disputed" | "Paid";
export type InvoiceType =
  | "Carrier"
  | "Delivery Company"
  | "Vendor"
  | "Vendor Payment"
  | "Shipper Payment"
  | "Equipment"
  | "Other Expenses"
  | string;

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

// Map API status codes → UI labels
const STATUS_LABEL_MAP: Record<string, ApprovalStatus> = {
  pending: "Pending",
  under_review: "Under Review",
  approved: "Approved",
  disputed: "Disputed",
  paid: "Paid",
};

// Map UI priority string to display label
function formatPriority(priority: string): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
}

// Format ISO date string to human-readable
function formatDate(iso: string): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// Format number as $x,xxx
function formatCurrency(amount: number): string {
  return `$${amount?.toLocaleString() ?? 0}`;
}

const PaymentApprovalDetailsModal: React.FC<PaymentApprovalDetailsModalProps> = ({
  isOpen,
  onClose,
  item,
  onStatusChange,
  onDownloadInvoice,
  onViewInvoice,
}) => {
  const navigate = useNavigate();
  const [reviewNotes, setReviewNotes] = useState("");
  const [pendingAction, setPendingAction] = useState<ReviewAction | null>(null);

  // B3 – fetch rich detail when modal is open and we have an id
  const {
    data: detail,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useGetPaymentApprovalDetailQuery(item?.id ?? "", {
    skip: !isOpen || !item?.id,
  });

  // B4 – review mutation
  const [reviewApproval, { isLoading: isReviewing }] =
    useReviewPaymentApprovalMutation();

  if (!item) return null;

  // ── Derived display values (prefer detail API, fall back to list-level item) ──
  const status: ApprovalStatus =
    (detail ? STATUS_LABEL_MAP[detail.status?.toLowerCase()] : undefined) ??
    item.status;

  const invoiceAmount = detail
    ? formatCurrency(detail.invoiceDetails?.invoiceAmount ?? detail.amount)
    : item.amount.startsWith("$")
    ? item.amount
    : `$${item.amount}`;

  const invoiceStatus = detail?.invoiceDetails?.status ?? (status === "Pending" ? "Pending Approval" : status);
  const paymentDueDate = detail ? formatDate(detail.invoiceDetails?.paymentDueDate ?? detail.dueDate) : item.dueDate;
  const priority = detail
    ? formatPriority(detail.invoiceDetails?.paymentPriority ?? "medium")
    : item.priority ?? "Medium";

  const companyName = detail?.companyInformation?.companyName ?? item.companyName;
  const deliveryDate = detail
    ? formatDate(detail.companyInformation?.deliveryDate ?? "")
    : item.deliveryDate ?? "";
  const deliveryId = detail?.companyInformation?.deliveryId ?? item.deliveryId ?? "";

  const baseFreight = detail ? formatCurrency(detail.costBreakdown?.baseFreight) : item.baseFreight ?? "";
  const fuelSurcharge = detail ? formatCurrency(detail.costBreakdown?.fuelSurcharge) : item.fuelSurcharge ?? "";
  const handlingFee = detail ? formatCurrency(detail.costBreakdown?.handlingFee) : item.handlingFee ?? "";

  const freightRequestId = detail?.linkedTransaction?.freightRequestId ?? item.freightRequestId ?? "";
  const loadId = detail?.linkedTransaction?.loadId ?? item.loadId ?? "";
  const projectName = detail?.linkedTransaction?.projectName ?? item.project;
  const linkedDeliveryNumber = detail?.linkedTransaction?.linkedDeliveryNumber ?? item.linkedDeliveryId ?? "";
  const route = detail?.linkedTransaction?.route ?? item.route ?? "";

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleReview = async (action: ReviewAction) => {
    if (!item.id) return;
    setPendingAction(action);
    try {
      await reviewApproval({
        approvalId: item.id,
        action,
        reviewNotes: reviewNotes.trim() || undefined,
      }).unwrap();

      const uiStatus = STATUS_LABEL_MAP[action] ?? ("Under Review" as ApprovalStatus);
      onStatusChange?.(item.id, uiStatus);
      setReviewNotes("");
    } catch {
      // errors surface via RTK Query; toast/notify if needed
    } finally {
      setPendingAction(null);
    }
  };

  const handleDownload = () => onDownloadInvoice?.(item);
  const handleViewInvoice = () => {
    if (onViewInvoice) {
      onViewInvoice(item);
    } else {
      navigate("/payments/invoice/preview");
    }
  };

  const renderStatusBadge = (s: ApprovalStatus) => {
    const cls: Record<ApprovalStatus, string> = {
      Pending: "border-orange-400 text-orange-600",
      "Under Review": "border-blue-400 text-blue-600",
      Approved: "border-green-500 text-green-600",
      Disputed: "border-red-500 text-red-600",
      Paid: "border-emerald-500 text-emerald-600",
    };
    return (
      <span
        className={`border ${cls[s] ?? "border-gray-300 text-gray-600"} bg-white rounded-full px-3 py-0.5 text-xs font-semibold inline-block`}
      >
        {s}
      </span>
    );
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
                {renderStatusBadge(status)}
              </div>

              {/* Subtitle details */}
              <div className="text-xs text-gray-600 mt-1 flex flex-wrap items-center gap-x-4 gap-y-0.5">
                <span>
                  Invoice Number :{" "}
                  <strong className="text-[#2563EB] font-bold">
                    {detail?.invoiceNumber ?? item.invoiceNumber}
                  </strong>
                </span>
                <span>
                  Invoice Type :{" "}
                  <strong className="text-[#2563EB] font-bold">
                    {detail?.invoiceType ?? item.invoiceType}
                  </strong>
                </span>
              </div>

              <div className="text-xs text-gray-600 mt-0.5">
                <span>
                  Company :{" "}
                  <strong className="text-[#2563EB] font-bold">
                    {companyName}
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

        {/* Loading overlay */}
        {isDetailLoading && (
          <div className="flex items-center justify-center py-8 gap-2 text-sm text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading details…
          </div>
        )}

        {isDetailError && (
          <p className="text-sm text-red-400 py-2 text-center">
            Failed to load full details. Showing summary data.
          </p>
        )}

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
                <span className="font-bold">{invoiceStatus}</span>
              </div>
              <div>
                Payment Due Date :{" "}
                <span className="font-bold">{paymentDueDate}</span>
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
                <p className="text-sm font-bold text-gray-900">{companyName}</p>
              </div>
            </div>

            {/* Delivery Date */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-[#9333EA]" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Delivery Date</p>
                <p className="text-sm font-bold text-gray-900">{deliveryDate || "—"}</p>
              </div>
            </div>

            {/* Delivery ID */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FFEDD5] text-[#EA580C] flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-[#EA580C]" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Delivery ID</p>
                <p className="text-sm font-bold text-gray-900">{deliveryId || "—"}</p>
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
              <div>Base Freight : {baseFreight || "—"}</div>
              <div>Fuel Surcharge : {fuelSurcharge || "—"}</div>
              <div>Handling Fee : {handlingFee || "—"}</div>
              <div>Total : {invoiceAmount}</div>
            </div>
          </div>

          {/* Right: Linked Transaction */}
          <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-5 space-y-2">
            <h3 className="font-bold text-gray-900 text-sm mb-3">
              Linked Transaction
            </h3>
            <div className="space-y-2 text-sm">
              <div className="font-bold text-gray-900">
                Freight Request ID :{" "}
                <span className="font-bold text-gray-900">{freightRequestId || "—"}</span>
              </div>
              <div className="font-semibold text-[#15803D]">
                Load ID : {loadId || "—"}
              </div>
              <div className="font-semibold text-[#15803D]">
                Project : {projectName || "—"}
              </div>
              <div className="font-semibold text-[#15803D]">
                Delivery ID : {linkedDeliveryNumber || "—"}
              </div>
              <div className="font-semibold text-[#15803D]">
                Route : {route || "—"}
              </div>
            </div>
          </div>
        </div>

        {/* Review Notes (visible when not yet approved/paid) */}
        {status !== "Approved" && status !== "Paid" && (
          <div className="mt-4">
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Add review notes (optional)…"
              rows={2}
              className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400 text-gray-700 placeholder:text-gray-400"
            />
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-6 mt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-gray-200 text-gray-800 bg-white hover:bg-gray-50 rounded-xl h-10 px-8 font-medium cursor-pointer shadow-none"
          >
            Close
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            {/* B4 Review action buttons — shown based on current status */}
            {status === "Pending" && (
              <Button
                type="button"
                disabled={isReviewing}
                onClick={() => handleReview("under_review")}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-5 font-medium shadow-xs cursor-pointer flex items-center gap-2"
              >
                {isReviewing && pendingAction === "under_review" && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                Mark Under Review
              </Button>
            )}

            {(status === "Pending" || status === "Under Review") && (
              <>
                <Button
                  type="button"
                  disabled={isReviewing}
                  onClick={() => handleReview("approved")}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-10 px-5 font-medium shadow-xs cursor-pointer flex items-center gap-2"
                >
                  {isReviewing && pendingAction === "approved" && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  Approve
                </Button>
                <Button
                  type="button"
                  disabled={isReviewing}
                  onClick={() => handleReview("disputed")}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-xl h-10 px-5 font-medium shadow-xs cursor-pointer flex items-center gap-2"
                >
                  {isReviewing && pendingAction === "disputed" && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  Dispute
                </Button>
              </>
            )}

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
