import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ShieldCheck, Loader2, Download, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import TaxPaymentDialog from "./tax-payment-dialog";
import { Button } from "@/components/ui/button";
import { format, isValid } from "date-fns";
import type { TaxFilingItem } from "@/modules/payments/payments.api";
import {
  useTaxFilingDetailQuery,
  useTaxFilingPrepareQuery,
  useTaxFilingReceiptQuery,
  useDownloadTaxReceiptPdfMutation,
  useFileTaxMutation,
} from "@/modules/payments/payments.hooks";

interface TaxDetailsSheetProps {
  state: string;
  status: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  item?: TaxFilingItem | null;
  isPrepareMode?: boolean;
  onSuccess?: () => void;
}

function formatCurrency(val?: number | null) {
  if (val === undefined || val === null || isNaN(val)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(val);
}

function formatDate(dateStr?: string | null, pattern: string = "MMM dd, yyyy") {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (!isValid(d)) return "-";
    return format(d, pattern);
  } catch {
    return "-";
  }
}

function formatPeriod(dateStr?: string | null) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (!isValid(d)) return "-";
    return format(d, "MMM yyyy");
  } catch {
    return "-";
  }
}

function getDueInText(dueDateStr?: string | null, daysUntilDue?: number) {
  if (daysUntilDue !== undefined) {
    if (daysUntilDue > 1) return ` (${daysUntilDue} days left)`;
    if (daysUntilDue === 1) return " (1 day left)";
    if (daysUntilDue === 0) return " (Due today)";
    return ` (Overdue by ${Math.abs(daysUntilDue)} days)`;
  }
  if (!dueDateStr) return "";
  try {
    const due = new Date(dueDateStr);
    if (!isValid(due)) return "";
    const now = new Date();
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = dueDay.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1) return ` (${diffDays} days left)`;
    if (diffDays === 1) return " (1 day left)";
    if (diffDays === 0) return " (Due today)";
    return ` (Overdue by ${Math.abs(diffDays)} days)`;
  } catch {
    return "";
  }
}

function getStatusBadgeToneClass(statusStr?: string, tone?: string) {
  const t = tone?.toLowerCase();
  const s = statusStr?.toLowerCase() || "";
  if (t === "warning" || s.includes("due") || s.includes("pending")) {
    return "bg-[#f9923b] hover:bg-[#eb842d] text-white";
  }
  if (t === "success" || s.includes("paid") || s.includes("filed")) {
    return "bg-emerald-500 hover:bg-emerald-600 text-white";
  }
  if (t === "danger" || s.includes("overdue") || s.includes("failed")) {
    return "bg-rose-500 hover:bg-rose-600 text-white";
  }
  if (t === "info") {
    return "bg-blue-500 hover:bg-blue-600 text-white";
  }
  return "bg-slate-600 text-white";
}

export default function TaxDetailsSheet({
  state: propState,
  status: propStatus,
  isOpen,
  onOpenChange,
  item,
  isPrepareMode = false,
  onSuccess,
}: TaxDetailsSheetProps) {
  const taxId =
    item?.taxRecordId ||
    (item?._id && item._id !== "temp-id" ? item._id : undefined);

  const { data: detailRes, isLoading: isDetailLoading } = useTaxFilingDetailQuery(
    isOpen && !isPrepareMode && taxId ? taxId : undefined
  );

  const { data: prepareRes, isLoading: isPrepareLoading } = useTaxFilingPrepareQuery(
    isOpen && isPrepareMode && taxId ? taxId : undefined
  );

  const fileTaxMutation = useFileTaxMutation();
  const downloadReceiptMutation = useDownloadTaxReceiptPdfMutation();

  const [isLegacyFiled, setIsLegacyFiled] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const handleSheetOpenChange = (open: boolean) => {
    if (!open) {
      setIsLegacyFiled(false);
      setIsPaymentDialogOpen(false);
    }
    onOpenChange(open);
  };

  const isLoading = isPrepareMode ? isPrepareLoading : isDetailLoading;
  // Guard against stale cache: only use detail if it belongs to current taxId
  const rawDetail = isPrepareMode ? prepareRes?.data?.detail : detailRes?.data?.detail;
  const detail = rawDetail && (!rawDetail._id || rawDetail._id === taxId) ? rawDetail : null;
  const prepareTax = prepareRes?.data?.tax && (!prepareRes.data.tax._id || prepareRes.data.tax._id === taxId) ? prepareRes.data.tax : null;
  const avalaraInfo = detailRes?.data?.avalara || (prepareRes?.data as { avalara?: { filingId?: string; returnsConfigured?: boolean } })?.avalara;

  const isVisible = isOpen || isPaymentDialogOpen;

  const stateCode = (detail?.state || item?.state || propState || "").toUpperCase();
  const stateLabelFromApi = detail?.stateLabel || item?.stateLabel;
  const displayTitle = stateLabelFromApi
    ? (stateLabelFromApi.toLowerCase().includes("tax details")
        ? stateLabelFromApi
        : `${stateLabelFromApi} Tax Details`)
    : `${stateCode || "State"} Tax Details`;

  const rawStatus = isVisible
    ? (detail?.uiStatus?.label || (typeof item?.status === "object" ? item.status.label : item?.status) || propStatus || "Pending")
    : "";
  const currentStatus = isLegacyFiled ? "Paid" : rawStatus;
  const isFiled = currentStatus.toLowerCase() === "filed" || currentStatus.toLowerCase() === "paid";
  const statusTone = isLegacyFiled ? "success" : (detail?.uiStatus?.tone || (isFiled ? "success" : "warning"));

  // 5.5 Fetch receipt JSON if filed
  const { data: receiptRes } = useTaxFilingReceiptQuery(
    isVisible && isFiled && taxId ? taxId : undefined
  );

  const isPaymentDue =
    isVisible &&
    !isLegacyFiled &&
    !isFiled &&
    (detail?.payNow?.enabled ??
      (currentStatus.toLowerCase().includes("due") ||
        currentStatus.toLowerCase().includes("pending")));

  const filingPeriod = isVisible
    ? (detail?.filingPeriod ||
      item?.filingPeriod ||
      (item?.dueDate || item?.paidAt ? formatPeriod(item.dueDate || item.paidAt) : "-"))
    : "-";

  const filingFrequency = isVisible ? (detail?.filingFrequency || item?.filingFrequency || "-") : "-";
  const filingDueDate = isVisible ? (detail?.filingDueDate || item?.dueDate) : undefined;
  const daysUntilDue = isVisible ? (detail?.daysUntilDue ?? item?.daysUntilDue) : undefined;

  const taxCollected = isVisible ? (detail?.breakdown?.taxCollected ?? prepareTax?.taxCollected ?? item?.taxDue ?? item?.amount ?? 0) : 0;
  const taxableSales = isVisible ? prepareTax?.taxableSales : undefined;
  const taxPaid = isVisible ? (isLegacyFiled ? taxCollected : detail?.breakdown?.taxPaid ?? item?.taxPaid ?? (isFiled ? taxCollected : 0)) : 0;
  const penalty = isVisible ? (detail?.breakdown?.penalty ?? 0) : 0;
  const interest = isVisible ? (detail?.breakdown?.interest ?? 0) : 0;
  const totalPayable =
    isVisible && !isLegacyFiled && !isFiled
      ? (detail?.breakdown?.totalPayable ??
         detail?.payNow?.amount ??
         prepareTax?.payable ??
         prepareTax?.taxDue ??
         item?.payable ??
         item?.taxDue ??
         item?.amount ??
         0)
      : 0;

  const recentActivity = isVisible ? (detail?.recentActivity || []) : [];

  const handlePayClick = () => {
    setIsPaymentDialogOpen(true);
  };

  const handleLegacyMarkFiled = async () => {
    if (!taxId) return;
    try {
      await fileTaxMutation.mutateAsync(taxId);
      setIsLegacyFiled(true);
      onSuccess?.();
    } catch (err) {
      console.error("Failed to mark tax as filed", err);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!taxId) return;
    try {
      const blob = await downloadReceiptMutation.mutateAsync(taxId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const confNum = receiptRes?.data?.confirmationNumber || item?.receipt?.confirmationNumber || `tax-receipt-${stateCode}`;
      link.setAttribute("download", `${confNum}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download PDF receipt", err);
    }
  };

  const renderStateBadge = () => {
    const isTexas =
      stateCode === "TX" ||
      displayTitle.toLowerCase().includes("texas") ||
      displayTitle.toLowerCase().startsWith("tx");

    if (!isTexas) {
      return (
        <div className="w-8 h-8 rounded-full bg-blue-900 border text-white flex items-center justify-center font-bold text-xs shrink-0">
          {stateCode?.charAt(0) || displayTitle?.charAt(0) || "T"}
        </div>
      );
    }

    return (
      <div className="w-8 h-8 rounded-full bg-blue-900 border text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden relative">
        <div className="absolute inset-0 flex">
          <div className="w-1/3 bg-blue-900 h-full" />
          <div className="w-2/3 flex flex-col h-full">
            <div className="h-1/2 bg-white" />
            <div className="h-1/2 bg-red-600" />
          </div>
        </div>
        <div
          className="absolute top-[46%] -translate-y-1/2 text-[10px] leading-none text-white z-10"
          style={{ left: "3px" }}
        >
          ⭑
        </div>
      </div>
    );
  };

  return (
    <>
      <Sheet open={isOpen && !isPaymentDialogOpen} onOpenChange={handleSheetOpenChange}>
        <SheetContent
          side="right"
          className="sm:max-w-md w-full p-0 overflow-y-auto bg-white border-l z-60"
        >
          <SheetHeader className="p-6 border-b flex flex-row items-center gap-3 space-y-0 text-left">
            {renderStateBadge()}
            <SheetTitle className="text-lg font-bold flex items-center gap-3 text-slate-900 m-0">
              {displayTitle}
              <Badge className={`${getStatusBadgeToneClass(currentStatus, statusTone)} rounded-md font-medium text-xs px-2.5 py-0.5 border-0 capitalize`}>
                {currentStatus}
              </Badge>
            </SheetTitle>
          </SheetHeader>

          {isLoading ? (
            <div className="p-6 pt-4 flex flex-col gap-6 bg-white">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-44 w-full rounded-lg" />
              <div className="space-y-3">
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>
          ) : (
            <div className="p-6 pt-0 flex flex-col gap-4 bg-white">
              {/* Prepare Mode Message Banner */}
              {isPrepareMode && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{prepareRes?.data?.message || "Filing details ready for review"}</span>
                </div>
              )}

              <div className="space-y-2 mt-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Filing Period</span>
                  <span className="text-slate-800 font-medium">
                    {filingPeriod}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Filing Frequency</span>
                  <span className="text-slate-800 font-medium capitalize">
                    {filingFrequency}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">
                    {isFiled ? "Filed Date" : "Filing Due Date"}
                  </span>
                  <span className="text-slate-800 font-medium">
                    {isFiled
                      ? formatDate(receiptRes?.data?.paidAt || item?.filedDate || item?.paidAt)
                      : `${formatDate(filingDueDate)}${getDueInText(filingDueDate, daysUntilDue)}`}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-200" />

              <div className="space-y-2">
                {taxableSales !== undefined && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Taxable Sales</span>
                    <span className="text-slate-800 font-medium">
                      {formatCurrency(taxableSales)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Tax Collected</span>
                  <span className="text-slate-800 font-medium">
                    {formatCurrency(taxCollected)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Less: Tax Paid</span>
                  <span className="text-slate-800 font-medium">
                    {taxPaid > 0 ? formatCurrency(taxPaid) : "$0.00"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Penalty</span>
                  <span className="text-slate-800 font-medium">
                    {penalty > 0 ? formatCurrency(penalty) : "$0.00"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Interest</span>
                  <span className="text-slate-800 font-medium">
                    {interest > 0 ? formatCurrency(interest) : "$0.00"}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-200" />

              <div className="flex justify-between items-center pt-2 pb-2">
                <span className="font-bold text-slate-800 text-lg">
                  {isFiled ? "Total Amount Paid" : "Total Payable"}
                </span>
                <span className={`font-bold text-lg ${isFiled ? "text-emerald-600" : "text-red-600"}`}>
                  {formatCurrency(isFiled ? (taxPaid || taxCollected) : totalPayable)}
                </span>
              </div>

              {/* 5.5 Filed Receipt Card */}
              {isFiled && (
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-600" />
                      Filing Receipt Details
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleDownloadReceipt}
                      disabled={downloadReceiptMutation.isPending}
                      className="h-7 text-xs bg-white text-gray-700 border-gray-300"
                    >
                      <Download className="w-3.5 h-3.5 mr-1 text-gray-600" />
                      {downloadReceiptMutation.isPending ? "Downloading..." : "PDF Receipt"}
                    </Button>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Confirmation #:</span>
                      <span className="font-semibold text-slate-900">
                        {receiptRes?.data?.confirmationNumber || item?.receipt?.confirmationNumber || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Method:</span>
                      <span className="font-medium text-slate-800">
                        {receiptRes?.data?.method || item?.method || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Payment Account:</span>
                      <span className="font-medium text-slate-800">
                        {receiptRes?.data?.paymentMethod || (item?.method ? `${item.method}` : "-")}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {isPaymentDue && totalPayable > 0 ? (
                <div className="space-y-2">
                  <Button
                    type="button"
                    onClick={handlePayClick}
                    size="lg"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  >
                    Pay {formatCurrency(totalPayable)} Now
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleLegacyMarkFiled}
                    disabled={fileTaxMutation.isPending}
                    className="w-full text-xs text-gray-500 hover:text-gray-700"
                  >
                    {fileTaxMutation.isPending ? (
                      <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                    ) : null}
                    Mark as Filed (No Online Payment)
                  </Button>
                </div>
              ) : null}

              {/* Tax Partner Card */}
              <div className="mt-2 border border-emerald-500 rounded-xl p-4 bg-emerald-50/40">
                <div className="flex gap-3">
                  <ShieldCheck
                    className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5"
                    strokeWidth={2}
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 mb-1">
                      Secure Payment
                    </h4>
                    <p className="text-xs text-slate-600">
                      Payments are processed securely via our tax partner.
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-emerald-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-600">
                      Tax Partner:
                    </span>
                    <span className="text-[14px] font-bold text-[#ff6600] tracking-tight">
                      Avalara
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 tracking-wider">
                      CERTIFIED PARTNER
                    </span>
                  </div>
                  {avalaraInfo?.filingId && (
                    <span className="text-[11px] text-slate-500 font-mono font-medium">
                      Filing ID: {avalaraInfo.filingId}
                    </span>
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="mt-4 pb-6">
                <h4 className="font-bold text-[#1e1b4b] text-base mb-4">
                  Recent Activity
                </h4>
                {recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.map((act, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">
                          {formatDate(act.at)}
                        </span>
                        <span className="text-slate-700 font-medium">
                          {act.amount !== undefined
                            ? `${formatCurrency(act.amount)} Paid`
                            : act.label || `${formatCurrency(act.amount)} Paid`}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">
                        {item?.paidAt
                          ? formatDate(item.paidAt)
                          : item?.updatedAt
                          ? formatDate(item.updatedAt)
                          : formatDate(filingDueDate)}
                      </span>
                      <span className="text-slate-700 font-medium">
                        {item?.paidAt
                          ? `${formatCurrency(item.amount)} Paid`
                          : `Status: ${currentStatus}`}
                      </span>
                    </div>
                  </div>
                )}
                <div className="border-t border-slate-200 mt-6" />
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <TaxPaymentDialog
        taxId={taxId}
        state={stateCode || displayTitle.replace(/\s+tax\s+details/i, "")}
        amount={totalPayable}
        filingPeriod={filingPeriod}
        dueDate={formatDate(filingDueDate)}
        daysUntilDue={daysUntilDue}
        isOpen={isPaymentDialogOpen}
        onOpenChange={(open) => {
          setIsPaymentDialogOpen(open);
          if (!open) {
            onOpenChange(false);
          }
        }}
        onSuccess={() => {
          onSuccess?.();
          setIsPaymentDialogOpen(false);
          onOpenChange(false);
        }}
      />
    </>
  );
}
