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
import {
  useGetLogisticsDetailQuery,
  useApproveLogisticsInvoiceMutation,
  useRejectLogisticsInvoiceMutation,
  useMarkLogisticsPaidMutation,
  useDownloadLogisticsInvoiceMutation,
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

export interface LogisticsDetailRecord {
  id?: string;
  loadId?: string;
  deliveryId?: string;
  project?: string;
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
  approvalId?: string;
  onSuccessAction?: (message: string) => void;
}

export const LogisticsCostDetailModal: React.FC<LogisticsCostDetailModalProps> = ({
  isOpen,
  onClose,
  record,
  approvalId,
  onSuccessAction,
}) => {
  const effectiveId = approvalId || record?.id || "";

  // Detail query
  const {
    data: detail,
    isLoading,
    isFetching,
    error: fetchError,
  } = useGetLogisticsDetailQuery(effectiveId, {
    skip: !isOpen || !effectiveId,
  });

  // Action mutations
  const [approveInvoiceApi, { isLoading: isApproving }] =
    useApproveLogisticsInvoiceMutation();
  const [rejectInvoiceApi, { isLoading: isRejecting }] =
    useRejectLogisticsInvoiceMutation();
  const [markPaidApi, { isLoading: isMarkingPaid }] =
    useMarkLogisticsPaidMutation();
  const [downloadInvoiceApi, { isLoading: isDownloading }] =
    useDownloadLogisticsInvoiceMutation();

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

  // Reset dialog state when effectiveId changes
  const [prevEffectiveId, setPrevEffectiveId] = useState(effectiveId);
  if (effectiveId !== prevEffectiveId) {
    setPrevEffectiveId(effectiveId);
    setActionError(null);
    setPendingAction(null);
    setReviewNotes("");
  }

  // Actions
  const handleDownload = async () => {
    if (!effectiveId) return;
    try {
      setActionError(null);
      const res = await downloadInvoiceApi(effectiveId).unwrap();
      if (res.downloadUrl) {
        window.open(res.downloadUrl, "_blank");
      } else if (res.blob) {
        const url = URL.createObjectURL(res.blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Invoice_${detail?.invoiceDetails?.invoiceNumber || effectiveId}.pdf`;
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
    if (!effectiveId || !pendingAction) return;
    setActionError(null);
    try {
      if (pendingAction === "approve") {
        await approveInvoiceApi({
          id: effectiveId,
          reviewNotes: reviewNotes.trim() || undefined,
        }).unwrap();
        setPendingAction(null);
        setReviewNotes("");
        onSuccessAction?.("Logistics invoice approved successfully.");
      } else if (pendingAction === "reject") {
        await rejectInvoiceApi({
          id: effectiveId,
          reviewNotes: reviewNotes.trim() || undefined,
        }).unwrap();
        setPendingAction(null);
        setReviewNotes("");
        onSuccessAction?.("Logistics invoice rejected.");
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { data?: { message?: string }; message?: string })?.data
          ?.message ||
        (err as { message?: string })?.message ||
        `Failed to ${pendingAction} logistics invoice`;
      setActionError(errorMsg);
    }
  };

  const handleMarkPaid = async () => {
    if (!effectiveId) return;
    setActionError(null);
    try {
      await markPaidApi(effectiveId).unwrap();
      onSuccessAction?.("Logistics invoice marked as Paid successfully.");
    } catch (err: unknown) {
      const errorMsg =
        (err as { data?: { message?: string }; message?: string })?.data
          ?.message ||
        (err as { message?: string })?.message ||
        "Failed to mark logistics cost as paid.";
      setActionError(errorMsg);
    }
  };

  // Values strictly from API detail
  const loadId = detail?.loadId;
  const deliveryId =
    detail?.deliveryId || detail?.projectInformation?.deliveryId;

  const totalCostFormatted =
    detail?.totalLogisticsCostFormatted != null
      ? typeof detail.totalLogisticsCostFormatted === "number"
        ? `$${detail.totalLogisticsCostFormatted.toLocaleString()}`
        : String(detail.totalLogisticsCostFormatted)
      : detail?.totalLogisticsCost != null
      ? `$${detail.totalLogisticsCost.toLocaleString()}`
      : "—";

  const invoiceStatus =
    detail?.invoiceDetails?.invoiceStatus ||
    detail?.invoiceStatus ||
    "—";

  const paymentStatus =
    detail?.carrierInformation?.paymentStatus ||
    detail?.paymentStatus ||
    "—";

  const projectName = detail?.projectInformation?.projectName || "—";
  const deliveryDate = detail?.projectInformation?.deliveryDate
    ? formatDisplayDate(detail.projectInformation.deliveryDate)
    : "—";

  const carrierName = detail?.carrierInformation?.carrier || "—";
  const carrierCostFormatted =
    detail?.carrierInformation?.logisticCost != null
      ? `$${detail.carrierInformation.logisticCost.toLocaleString()}`
      : totalCostFormatted;

  const deliveryStatus = detail?.deliveryLink?.deliveryStatus || "—";
  const documents = detail?.deliveryLink?.documents || [];

  const invoiceNumber = detail?.invoiceDetails?.invoiceNumber || "—";
  const invoiceDate = detail?.invoiceDetails?.invoiceDate
    ? formatDisplayDate(detail.invoiceDetails.invoiceDate)
    : "—";
  const paymentDueDate = detail?.invoiceDetails?.paymentDueDate
    ? formatDisplayDate(detail.invoiceDetails.paymentDueDate)
    : "—";

  const hasInvoiceDetails = Boolean(
    detail?.invoiceDetails &&
      (detail.invoiceDetails.invoiceNumber ||
        detail.invoiceDetails.invoiceDate ||
        detail.invoiceDetails.paymentDueDate ||
        detail.invoiceDetails.amount != null ||
        detail.invoiceDetails.invoiceStatus)
  );

  // Permissions strictly gated by detail.actions.*
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
              <div className="w-11 h-11 rounded-2xl bg-[#0EA5E9] flex items-center justify-center text-white shadow-xs">
                <Truck className="w-6 h-6 stroke-2" />
              </div>
              <div>
                <DialogTitle className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Logistics Cost Details
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Logistics cost details, invoices, and delivery link
                </DialogDescription>
                {detail && !isDataLoading && (
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mt-0.5">
                    {loadId && (
                      <span>
                        Load ID:{" "}
                        <span className="text-[#0EA5E9] font-bold">{loadId}</span>
                      </span>
                    )}
                    {deliveryId && <span>Delivery ID: {deliveryId}</span>}
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
          <div className="px-7 pb-6 space-y-6 pt-4 flex-1">
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
                    Failed to load logistics cost details
                  </h3>
                  <p className="text-xs text-slate-500">
                    {(fetchError as { data?: { message?: string }; message?: string })
                      ?.data?.message ||
                      (fetchError as { message?: string })?.message ||
                      "Unable to load logistics details from server."}
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
            ) : isDataLoading || (!detail && Boolean(effectiveId)) ? (
              /* Loading view */
              <div className="space-y-4 py-8">
                <Skeleton className="h-28 rounded-2xl" />
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
                {/* Top Green Box: Total Logistics Cost */}
                <div className="rounded-2xl border border-[#86EFAC] bg-[#F0FDF4]/70 p-5">
                  <span className="text-xs font-semibold text-[#15803D]">
                    Total Logistics Cost
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-[#14532D] tracking-tight mt-1">
                    {totalCostFormatted}
                  </div>
                  <div className="mt-2.5 space-y-0.5 text-xs font-medium text-[#15803D]">
                    <div>Invoice Status: {invoiceStatus}</div>
                    <div>Payment Status: {paymentStatus}</div>
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
                      <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500 shrink-0">
                        <Package className="w-4 h-4 stroke-2" />
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          Delivery ID
                        </div>
                        <div className="text-xs font-bold text-slate-900 leading-tight">
                          {deliveryId || "—"}
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
                          Logistic Cost
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
                        <div className="text-[11px] text-slate-400 font-medium mb-1">
                          Payment Status
                        </div>
                        <span className="inline-block px-3 py-0.5 rounded-full bg-[#16A34A] text-white text-[11px] font-bold">
                          {paymentStatus}
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

                {/* Bottom Box: Invoice Details (Hidden if null/empty) */}
                {hasInvoiceDetails && (
                  <div className="rounded-2xl border border-blue-200 bg-blue-50/20 p-5 text-xs space-y-2">
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
                <p className="text-xs text-slate-500">No logistics details found.</p>
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
              {pendingAction} Logistics Invoice
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

export default LogisticsCostDetailModal;
