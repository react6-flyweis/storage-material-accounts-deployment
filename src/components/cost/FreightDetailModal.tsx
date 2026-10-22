import React, { useState } from "react";
import {
  X,
  Package,
  Building2,
  Calendar,
  Truck,
  DollarSign,
  CheckCircle,
  Download,
  Loader2,
  AlertCircle,
  ExternalLink,
  FileText,
} from "lucide-react";
import type { FreightDeliveryRecord } from "./freightCostData";
import {
  useGetFreightDetailQuery,
  useApproveFreightInvoiceMutation,
  useRejectFreightInvoiceMutation,
  useMarkFreightPaidMutation,
  useDownloadFreightInvoiceMutation,
} from "@/redux/api/costsApi";
import { formatDisplayDate } from "@/lib/dashboardFormatters";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface FreightDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: FreightDeliveryRecord | null;
  bidId?: string;
  onSuccessAction?: (message: string) => void;
}

export const FreightDetailModal: React.FC<FreightDetailModalProps> = ({
  isOpen,
  onClose,
  record,
  bidId,
  onSuccessAction,
}) => {
  const effectiveBidId = bidId || record?.bidId || record?.id || "";

  // Detail query
  const {
    data: detail,
    isLoading,
    isFetching,
    error: fetchError,
  } = useGetFreightDetailQuery(effectiveBidId, {
    skip: !isOpen || !effectiveBidId,
  });

  // Action mutations
  const [approveInvoiceApi, { isLoading: isApproving }] =
    useApproveFreightInvoiceMutation();
  const [rejectInvoiceApi, { isLoading: isRejecting }] =
    useRejectFreightInvoiceMutation();
  const [markPaidApi, { isLoading: isMarkingPaid }] =
    useMarkFreightPaidMutation();
  const [downloadInvoiceApi, { isLoading: isDownloading }] =
    useDownloadFreightInvoiceMutation();

  // Review notes modal / state
  const [reviewNotes, setReviewNotes] = useState("");
  const [pendingAction, setPendingAction] = useState<"approve" | "reject" | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);

  const handleClose = () => {
    setActionError(null);
    setPendingAction(null);
    setReviewNotes("");
    onClose();
  };

  // Reset dialog state when effectiveBidId changes
  const [prevEffectiveBidId, setPrevEffectiveBidId] = useState(effectiveBidId);
  if (effectiveBidId !== prevEffectiveBidId) {
    setPrevEffectiveBidId(effectiveBidId);
    setActionError(null);
    setPendingAction(null);
    setReviewNotes("");
  }

  // Actions
  const handleDownload = async () => {
    if (!effectiveBidId) return;
    try {
      setActionError(null);
      const res = await downloadInvoiceApi(effectiveBidId).unwrap();
      if (res.downloadUrl) {
        window.open(res.downloadUrl, "_blank");
      } else if (res.blob) {
        const url = URL.createObjectURL(res.blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Invoice_${detail?.invoiceDetails?.invoiceNumber || effectiveBidId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { data?: { message?: string }; message?: string })?.data
          ?.message ||
        (err as { message?: string })?.message ||
        "Failed to download invoice";
      setActionError(errorMsg);
    }
  };

  const handleConfirmNotesAction = async () => {
    if (!effectiveBidId || !pendingAction) return;
    setActionError(null);
    try {
      if (pendingAction === "approve") {
        await approveInvoiceApi({
          bidId: effectiveBidId,
          reviewNotes: reviewNotes.trim() || undefined,
        }).unwrap();
        setPendingAction(null);
        setReviewNotes("");
        onSuccessAction?.("Freight invoice approved successfully.");
      } else if (pendingAction === "reject") {
        await rejectInvoiceApi({
          bidId: effectiveBidId,
          reviewNotes: reviewNotes.trim() || undefined,
        }).unwrap();
        setPendingAction(null);
        setReviewNotes("");
        onSuccessAction?.("Freight invoice rejected.");
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { data?: { message?: string }; message?: string })?.data
          ?.message ||
        (err as { message?: string })?.message ||
        `Failed to ${pendingAction} invoice`;
      setActionError(errorMsg);
    }
  };

  const handleMarkPaid = async () => {
    if (!effectiveBidId) return;
    setActionError(null);
    try {
      await markPaidApi(effectiveBidId).unwrap();
      onSuccessAction?.("Freight invoice marked as Paid successfully.");
    } catch (err: unknown) {
      const errorMsg =
        (err as { data?: { message?: string }; message?: string })?.data
          ?.message ||
        (err as { message?: string })?.message ||
        "Failed to mark freight cost as paid.";
      setActionError(errorMsg);
    }
  };

  // Values strictly from API detail
  const freightRequestId = detail?.freightRequestId;
  const totalLoads =
    detail?.totalLoads !== undefined ? `${detail.totalLoads} Loads` : undefined;

  const totalCostFormatted =
    detail?.totalFreightCostFormatted != null
      ? typeof detail.totalFreightCostFormatted === "number"
        ? `$${detail.totalFreightCostFormatted.toLocaleString()}`
        : String(detail.totalFreightCostFormatted)
      : detail?.totalFreightCost != null
      ? `$${detail.totalFreightCost.toLocaleString()}`
      : "—";

  const awardedCarrier =
    detail?.bidSummary?.awardedCarrier ||
    detail?.carrierInformation?.carrier ||
    "—";

  const awardedBid =
    detail?.bidSummary?.awardedBid != null
      ? `$${detail.bidSummary.awardedBid.toLocaleString()}`
      : "—";

  const averageBid =
    detail?.bidSummary?.averageBid != null
      ? `$${detail.bidSummary.averageBid.toLocaleString()}`
      : "—";

  const highestBid =
    detail?.bidSummary?.highestBid != null
      ? `$${detail.bidSummary.highestBid.toLocaleString()}`
      : "—";

  const savingsFormatted =
    detail?.bidSummary?.savings != null
      ? `$${detail.bidSummary.savings.toLocaleString()}${
          detail.bidSummary.savingsPct != null
            ? ` (${detail.bidSummary.savingsPct}%)`
            : ""
        }`
      : "—";

  const projectName = detail?.projectInformation?.projectName || "—";
  const deliveryDate = detail?.projectInformation?.deliveryDate
    ? formatDisplayDate(detail.projectInformation.deliveryDate)
    : "—";
  const deliveryId = detail?.projectInformation?.deliveryId || "—";

  const carrierName = detail?.carrierInformation?.carrier || awardedCarrier;
  const carrierCostFormatted =
    detail?.carrierInformation?.freightCost != null
      ? `$${detail.carrierInformation.freightCost.toLocaleString()}`
      : totalCostFormatted;
  const carrierPaymentStatus =
    detail?.carrierInformation?.paymentStatus ||
    detail?.paymentStatus ||
    "—";

  const deliveryStatus = detail?.deliveryLink?.deliveryStatus || "—";
  const documents = detail?.deliveryLink?.documents || [];

  const invoiceNumber = detail?.invoiceDetails?.invoiceNumber || "—";
  const invoiceDate = detail?.invoiceDetails?.invoiceDate
    ? formatDisplayDate(detail.invoiceDetails.invoiceDate)
    : "—";
  const paymentDueDate = detail?.invoiceDetails?.paymentDueDate
    ? formatDisplayDate(detail.invoiceDetails.paymentDueDate)
    : "—";
  const invoiceStatus =
    detail?.invoiceDetails?.invoiceStatus ||
    detail?.invoiceStatus ||
    "—";

  const hasInvoiceDetails = Boolean(
    detail?.invoiceDetails &&
      (detail.invoiceDetails.invoiceNumber ||
        detail.invoiceDetails.invoiceDate ||
        detail.invoiceDetails.paymentDueDate ||
        detail.invoiceDetails.amount != null ||
        detail.invoiceDetails.invoiceStatus)
  );

  const costComparisonSummary = detail?.costComparisonSummary;
  const costComparisonList = detail?.costComparison || [];

  // Permissions gate strictly from backend actions object
  const canApprove = Boolean(detail?.actions?.canApprove);
  const canReject = Boolean(detail?.actions?.canReject);
  const canMarkPaid = Boolean(detail?.actions?.canMarkPaid);
  const canDownloadInvoice = Boolean(detail?.actions?.canDownloadInvoice);

  const isAnyActionLoading =
    isApproving || isRejecting || isMarkingPaid || isDownloading;

  const isDataLoading = isLoading || isFetching;

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) handleClose();
        }}
      >
        <DialogContent
          className="sm:max-w-2xl max-h-[92vh] p-0 gap-0 overflow-y-auto rounded-3xl border-slate-100 shadow-2xl bg-white flex flex-col focus:outline-none"
          showCloseButton={false}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-7 pt-7 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#3B5BDB] flex items-center justify-center text-white shadow-xs">
                <Package className="w-6 h-6 stroke-2" />
              </div>
              <div>
                <DialogTitle className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Freight Cost Details
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Freight cost details, bids, and delivery link
                </DialogDescription>
                {detail && !isDataLoading && (
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mt-0.5">
                    {freightRequestId && (
                      <span>
                        Freight Request ID:{" "}
                        <span className="text-[#3B5BDB] font-bold">
                          {freightRequestId}
                        </span>
                      </span>
                    )}
                    {totalLoads && <span>Total Loads: {totalLoads}</span>}
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-7 space-y-6 pt-4 flex-1">
            {actionError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Error view: Show ONLY error when fetch fails */}
            {fetchError ? (
              <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 my-6">
                <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 stroke-2" />
                </div>
                <div className="space-y-1.5 max-w-md">
                  <h3 className="text-base font-bold text-slate-900">
                    Failed to load freight cost details
                  </h3>
                  <p className="text-xs text-slate-500">
                    {(fetchError as { data?: { message?: string }; message?: string })
                      ?.data?.message ||
                      (fetchError as { message?: string })?.message ||
                      "Unable to load freight details from server."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="mt-2 px-5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : isDataLoading || (!detail && Boolean(effectiveBidId)) ? (
              /* Loading view */
              <div className="space-y-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-28 rounded-2xl" />
                  <Skeleton className="h-28 rounded-2xl" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Skeleton className="h-36 rounded-2xl" />
                  <Skeleton className="h-36 rounded-2xl" />
                  <Skeleton className="h-36 rounded-2xl" />
                </div>
                <Skeleton className="h-32 rounded-2xl" />
              </div>
            ) : detail ? (
              /* Real Data view */
              <>
                {/* Top 2 Green Outline Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Green Box: Total Freight Cost */}
                  <div className="rounded-2xl border border-emerald-300 bg-emerald-50/30 p-5 flex flex-col justify-center">
                    <span className="text-xs font-semibold text-emerald-800">
                      Total Freight Cost
                    </span>
                    <div className="text-3xl font-extrabold text-emerald-700 tracking-tight mt-1">
                      {totalCostFormatted}
                    </div>
                    <span className="text-xs font-medium text-emerald-700 mt-2">
                      Status: {carrierPaymentStatus}
                    </span>
                  </div>

                  {/* Right Green Box: Bid Summary */}
                  <div className="rounded-2xl border border-emerald-300 bg-emerald-50/30 p-5 text-xs space-y-1.5">
                    <div className="font-bold text-slate-900 mb-1.5">Bid Summary</div>
                    <div className="font-semibold text-slate-800">
                      Awarded Carrier: {awardedCarrier}
                    </div>
                    <div className="font-semibold text-emerald-700">
                      Awarded Bid: {awardedBid}
                    </div>
                    <div className="font-semibold text-emerald-700">
                      Average Bid: {averageBid}
                    </div>
                    <div className="font-semibold text-emerald-700">
                      Highest Bid: {highestBid}
                    </div>
                    <div className="font-semibold text-emerald-700 pt-0.5">
                      Savings = {savingsFormatted}
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

                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <Building2 className="w-4 h-4 stroke-2" />
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          Project
                        </div>
                        <div className="text-xs font-bold text-slate-900 leading-tight">
                          {projectName}
                        </div>
                      </div>
                    </div>

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

                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
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

                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                        <Truck className="w-4 h-4 stroke-2" />
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          Carrier
                        </div>
                        <div className="text-xs font-bold text-slate-900 leading-tight">
                          {carrierName}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <DollarSign className="w-4 h-4 stroke-2" />
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          Freight Cost
                        </div>
                        <div className="text-xs font-bold text-slate-900 leading-tight">
                          {carrierCostFormatted}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                        <CheckCircle className="w-4 h-4 stroke-2" />
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400 font-medium mb-0.5">
                          Payment Status
                        </div>
                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#22C55E] text-white text-[11px] font-bold">
                          {carrierPaymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Col 3: Delivery Link */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-900 text-sm">
                      Delivery Link
                    </h3>

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

                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                        <FileText className="w-4 h-4 stroke-2" />
                      </div>
                      <div className="space-y-1.5 w-full">
                        <div className="text-[11px] text-slate-400 font-medium">
                          Documents
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {documents.length > 0 ? (
                            documents.map((doc, idx) => (
                              <a
                                key={`${doc.label}-${idx}`}
                                href={doc.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-between px-2.5 py-1 rounded-md bg-[#22C55E] hover:bg-[#16a34a] text-white text-[11px] font-semibold transition-colors"
                              >
                                <span className="truncate">{doc.label}</span>
                                <ExternalLink className="w-3 h-3 ml-1 shrink-0" />
                              </a>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              No documents attached
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Cards: Cost Comparison + Invoice Details (if present) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Cost Comparison */}
                  <div
                    className={`${
                      hasInvoiceDetails ? "md:col-span-5" : "md:col-span-12"
                    } rounded-2xl border border-blue-200 bg-blue-50/20 p-5 text-xs space-y-2 flex flex-col justify-center`}
                  >
                    <div className="font-bold text-[#1E3A8A] text-sm">
                      Cost Comparison
                    </div>
                    <div className="font-bold text-[#1E3A8A]">
                      Awarded Bid: {awardedBid}
                    </div>
                    <div className="font-bold text-[#1E3A8A]">
                      Invoiced Amount:{" "}
                      {costComparisonSummary?.invoicedAmount != null
                        ? `$${costComparisonSummary.invoicedAmount.toLocaleString()}`
                        : "—"}
                    </div>
                    <div className="font-bold text-[#1E3A8A]">
                      Variance:{" "}
                      {costComparisonSummary?.variance != null
                        ? `$${costComparisonSummary.variance.toLocaleString()}`
                        : "—"}
                    </div>

                    {costComparisonList.length > 0 ? (
                      <div className="pt-2 border-t border-blue-200/60 mt-1 space-y-1">
                        <div className="text-[11px] font-semibold text-slate-600">
                          Bids Received:
                        </div>
                        {costComparisonList.map((bid) => (
                          <div
                            key={bid.bidId}
                            className="flex items-center justify-between text-[11px] text-slate-700"
                          >
                            <span className="truncate">{bid.carrierName}</span>
                            <span className="font-semibold ml-2">
                              ${bid.amount.toLocaleString()}{" "}
                              {bid.selected && (
                                <span className="text-emerald-600 font-bold">
                                  (Selected)
                                </span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-blue-200/60 mt-1 text-[11px] text-slate-400 italic">
                        No bid comparisons available
                      </div>
                    )}
                  </div>

                  {/* Right Box (7 cols): Invoice Details (Hidden if null/empty) */}
                  {hasInvoiceDetails && (
                    <div className="md:col-span-7 rounded-2xl border border-blue-200 bg-blue-50/20 p-5 text-xs space-y-2">
                      <div className="font-bold text-slate-900 text-sm mb-1">
                        Invoice Details
                      </div>
                      {invoiceNumber !== "—" && (
                        <div className="font-bold text-[#1E3A8A]">
                          Invoice Number: {invoiceNumber}
                        </div>
                      )}
                      {invoiceDate !== "—" && (
                        <div className="font-bold text-[#1E3A8A]">
                          Invoice Date: {invoiceDate}
                        </div>
                      )}
                      {paymentDueDate !== "—" && (
                        <div className="font-bold text-[#1E3A8A]">
                          Payment Due Date: {paymentDueDate}
                        </div>
                      )}
                      {invoiceStatus !== "—" && (
                        <div className="font-bold text-[#1E3A8A]">
                          Invoice Status: {invoiceStatus}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons Row - Strictly gated by actions.* */}
                {(canDownloadInvoice || canReject || canApprove || canMarkPaid) && (
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    {canDownloadInvoice && (
                      <button
                        type="button"
                        disabled={isDownloading}
                        onClick={handleDownload}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
                      >
                        {isDownloading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                        <span>Download Invoice</span>
                      </button>
                    )}

                    {canReject && (
                      <button
                        type="button"
                        disabled={isAnyActionLoading}
                        onClick={() => {
                          setReviewNotes("");
                          setPendingAction("reject");
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-[#475569] hover:bg-[#334155] text-white font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
                      >
                        Reject
                      </button>
                    )}

                    {canApprove && (
                      <button
                        type="button"
                        disabled={isAnyActionLoading}
                        onClick={() => {
                          setReviewNotes("");
                          setPendingAction("approve");
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
                      >
                        Approve
                      </button>
                    )}

                    {canMarkPaid && (
                      <button
                        type="button"
                        disabled={isAnyActionLoading}
                        onClick={handleMarkPaid}
                        className="inline-flex items-center px-3.5 py-1.5 rounded-lg bg-[#22C55E] hover:bg-[#16a34a] text-white font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
                      >
                        {isMarkingPaid && (
                          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        )}
                        <span>Mark Paid</span>
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 flex flex-col items-center justify-center text-center space-y-3 my-6">
                <p className="text-xs text-slate-500">No freight details found.</p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Notes Prompt for Approve / Reject */}
      <Dialog
        open={Boolean(pendingAction)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingAction(null);
            setReviewNotes("");
          }
        }}
      >
        <DialogContent
          className="max-w-sm rounded-2xl p-5 border border-slate-100 shadow-2xl bg-white space-y-3 focus:outline-none"
          showCloseButton={false}
        >
          <DialogHeader className="gap-1 text-left">
            <DialogTitle className="font-bold text-slate-900 text-sm capitalize">
              {pendingAction} Freight Invoice
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              You can optionally add review notes for this action.
            </DialogDescription>
          </DialogHeader>
          <textarea
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder="Enter review notes..."
            rows={3}
            className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
          />
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setPendingAction(null);
                setReviewNotes("");
              }}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isApproving || isRejecting}
              onClick={handleConfirmNotesAction}
              className={`px-3.5 py-1.5 text-xs font-semibold text-white rounded-lg cursor-pointer flex items-center gap-1.5 ${
                pendingAction === "approve"
                  ? "bg-[#7C3AED] hover:bg-[#6D28D9]"
                  : "bg-[#475569] hover:bg-[#334155]"
              }`}
            >
              {(isApproving || isRejecting) && (
                <Loader2 className="w-3 h-3 animate-spin" />
              )}
              Confirm {pendingAction}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FreightDetailModal;
