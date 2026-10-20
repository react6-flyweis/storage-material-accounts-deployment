import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, CreditCard, Loader2, ShieldCheck, Wallet } from "lucide-react";
import PaymentSuccessDialog from "./payment-success-dialog";
import {
  useSubmitTaxPaymentMutation,
  useDownloadTaxReceiptPdfMutation,
} from "@/modules/payments/payments.hooks";
import type { PayTaxResponseData } from "@/modules/payments/payments.api";
import { store } from "@/redux/store";
import { format, isValid } from "date-fns";

interface TaxPaymentDialogProps {
  taxId?: string;
  state: string;
  amount?: number;
  filingPeriod?: string;
  dueDate?: string;
  daysUntilDue?: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
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

export default function TaxPaymentDialog({
  taxId,
  state,
  amount = 0,
  filingPeriod = "-",
  dueDate = "-",
  daysUntilDue,
  isOpen,
  onOpenChange,
  onSuccess,
}: TaxPaymentDialogProps) {
  // Only the fields supported by the API: paymentMethod and notificationEmail
  const [paymentMethodType, setPaymentMethodType] = useState<"ach" | "card" | "other">("ach");
  const [achDigits, setAchDigits] = useState("4851");
  const [cardDigits, setCardDigits] = useState("4242");
  const [customMethod, setCustomMethod] = useState("");
  const [notificationEmail, setNotificationEmail] = useState("accounts@acmeindustries.com");

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PayTaxResponseData | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Use logged in user's email if available, otherwise default
      const userEmail = store.getState().auth?.user?.email;
      if (userEmail) {
        setNotificationEmail(userEmail);
      }
    } else {
      setIsSubmitted(false);
      setPaymentResult(null);
      setPaymentError(null);
      setPaymentMethodType("ach");
      setAchDigits("4851");
      setCardDigits("4242");
      setCustomMethod("");
    }
  }, [isOpen]);

  const submitPaymentMutation = useSubmitTaxPaymentMutation();
  const downloadReceiptMutation = useDownloadTaxReceiptPdfMutation();

  const isTexas =
    state?.toLowerCase().includes("texas") ||
    state?.toUpperCase() === "TX";

  const renderStateBadge = () => {
    if (!isTexas) {
      return (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-blue-900 text-xs font-bold text-white">
          {state?.charAt(0) || "T"}
        </div>
      );
    }

    return (
      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-blue-900 text-xs font-bold text-white">
        <div className="absolute inset-0 flex">
          <div className="h-full w-1/3 bg-blue-900" />
          <div className="flex h-full w-2/3 flex-col">
            <div className="h-1/2 bg-white" />
            <div className="h-1/2 bg-red-600" />
          </div>
        </div>
        <span className="absolute left-1 top-1/2 z-10 -translate-y-1/2 text-[10px] leading-none text-white">
          ⭑
        </span>
      </div>
    );
  };

  const getComputedPaymentMethod = () => {
    if (paymentMethodType === "ach") {
      const digits = achDigits.replace(/\D/g, "").slice(-4) || "4851";
      return `ACH ending in ${digits}`;
    }
    if (paymentMethodType === "card") {
      const digits = cardDigits.replace(/\D/g, "").slice(-4) || "4242";
      return `Card ending in ${digits}`;
    }
    return customMethod.trim() || "ACH ending in 4851";
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalMethod = getComputedPaymentMethod();
    const emailToSubmit = notificationEmail.trim();

    setPaymentError(null);

    if (!taxId || taxId === "temp-id") {
      setPaymentError("A valid tax record ID is required to submit payment to the API.");
      return;
    }

    if (!emailToSubmit) {
      setPaymentError("Please provide a valid notification email for your payment receipt.");
      return;
    }

    try {
      const res = await submitPaymentMutation.mutateAsync(taxId, {
        paymentMethod: finalMethod,
        notificationEmail: emailToSubmit,
      });

      if (res?.data) {
        setPaymentResult(res.data);
      }
      setIsSubmitted(true);
      onSuccess?.();
    } catch (err: unknown) {
      console.error("Payment failed", err);
      setPaymentError(
        err instanceof Error ? err.message : "Payment submission failed. Please try again."
      );
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      const receiptId = paymentResult?.tax?._id || taxId || "receipt";
      const blob = await downloadReceiptMutation.mutateAsync(receiptId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `tax-receipt-${paymentResult?.payment?.confirmationNumber || Date.now()}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download receipt PDF", err);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsSubmitted(false);
      setPaymentResult(null);
      setPaymentError(null);
      setPaymentMethodType("ach");
    }
    onOpenChange(open);
  };

  if (isSubmitted) {
    const payment = paymentResult?.payment;
    let periodDisplay = filingPeriod;
    if (
      typeof payment?.filingPeriod === "object" &&
      payment.filingPeriod?.start &&
      payment.filingPeriod?.end
    ) {
      try {
        const startD = new Date(payment.filingPeriod.start);
        const endD = new Date(payment.filingPeriod.end);
        if (isValid(startD) && isValid(endD)) {
          periodDisplay = `${format(startD, "MMM d")} – ${format(endD, "MMM d, yyyy")}`;
        }
      } catch {
        periodDisplay = filingPeriod;
      }
    } else if (typeof payment?.filingPeriod === "string") {
      periodDisplay = payment.filingPeriod;
    }

    return (
      <PaymentSuccessDialog
        open={isOpen}
        onOpenChange={handleOpenChange}
        amountPaid={formatCurrency(payment?.amountPaid ?? amount)}
        filingPeriod={periodDisplay}
        paymentMethod={payment?.paymentMethod || getComputedPaymentMethod()}
        confirmationNumber={payment?.confirmationNumber || "-"}
        receiptEmail={payment?.notificationEmail || notificationEmail}
        status={payment?.status || "processing"}
        estimatedSettlement={payment?.estimatedSettlement || "1-3 business days"}
        isDownloading={downloadReceiptMutation.isPending}
        onDownload={handleDownloadReceipt}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-5 flex flex-row items-center justify-between border-b sticky top-0 bg-white z-10">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 m-0 text-slate-900">
            Review & Pay Tax
            <Badge className="bg-[#f9923b] hover:bg-[#eb842d] text-white rounded-md font-medium text-xs px-2.5 py-0.5 border-0 ml-2">
              Payment Due
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
          {/* Tax Amount Details Box */}
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
            <div className="bg-[#fcfdfd] px-5 py-4 border-b border-slate-200 flex items-center gap-3">
              {renderStateBadge()}
              <span className="font-semibold text-slate-900">
                {state} Tax Payment
              </span>
            </div>

            <div className="p-5 flex flex-col gap-3.5">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-slate-600">
                  Filing Period
                </span>
                <span className="font-semibold text-slate-900">
                  {filingPeriod}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-slate-600">
                  Filing Due Date
                </span>
                <span className="font-semibold text-slate-900">
                  {dueDate} {daysUntilDue !== undefined ? `(${daysUntilDue} days left)` : ""}
                </span>
              </div>

              <div className="border-t border-slate-200 my-1" />

              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-slate-800 text-base">
                  Total Payable
                </span>
                <span className="font-bold text-red-600 text-lg">
                  {formatCurrency(amount)}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmitPayment} className="flex flex-col gap-6">
            {/* 1. Payment Method Selection (aligned directly with API paymentMethod) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">
                  1. Payment Method
                </h3>
                <span className="text-xs text-slate-500">Processed via Avalara</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethodType("ach")}
                  className={`flex flex-col items-start p-3.5 rounded-lg border text-left transition-all ${
                    paymentMethodType === "ach"
                      ? "bg-violet-50/70 text-violet-900 border-violet-400 ring-1 ring-violet-400"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className={`w-4 h-4 ${paymentMethodType === "ach" ? "text-violet-600" : "text-slate-500"}`} />
                    <span className="font-semibold text-xs">Bank (ACH)</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    ACH ending in {achDigits || "4851"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethodType("card")}
                  className={`flex flex-col items-start p-3.5 rounded-lg border text-left transition-all ${
                    paymentMethodType === "card"
                      ? "bg-violet-50/70 text-violet-900 border-violet-400 ring-1 ring-violet-400"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard className={`w-4 h-4 ${paymentMethodType === "card" ? "text-violet-600" : "text-slate-500"}`} />
                    <span className="font-semibold text-xs">Credit Card</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Card ending in {cardDigits || "4242"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethodType("other")}
                  className={`flex flex-col items-start p-3.5 rounded-lg border text-left transition-all ${
                    paymentMethodType === "other"
                      ? "bg-violet-50/70 text-violet-900 border-violet-400 ring-1 ring-violet-400"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet className={`w-4 h-4 ${paymentMethodType === "other" ? "text-violet-600" : "text-slate-500"}`} />
                    <span className="font-semibold text-xs">Other</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Custom Method
                  </span>
                </button>
              </div>

              {/* Sub-inputs for chosen payment method */}
              {paymentMethodType === "ach" && (
                <div className="mt-2 bg-slate-50 border border-slate-200 rounded-lg p-3.5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="achDigits" className="text-xs font-medium text-slate-700">
                        ACH Account Digits
                      </Label>
                      <p className="text-[11px] text-slate-500">
                        Method sent: <span className="font-mono font-medium text-slate-800">ACH ending in {achDigits || "4851"}</span>
                      </p>
                    </div>
                    <div className="w-28 shrink-0">
                      <Input
                        id="achDigits"
                        value={achDigits}
                        maxLength={4}
                        onChange={(e) => setAchDigits(e.target.value.replace(/\D/g, ""))}
                        placeholder="4851"
                        className="bg-white text-center font-mono text-xs h-9"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethodType === "card" && (
                <div className="mt-2 bg-slate-50 border border-slate-200 rounded-lg p-3.5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="cardDigits" className="text-xs font-medium text-slate-700">
                        Card Last 4 Digits
                      </Label>
                      <p className="text-[11px] text-slate-500">
                        Method sent: <span className="font-mono font-medium text-slate-800">Card ending in {cardDigits || "4242"}</span>
                      </p>
                    </div>
                    <div className="w-28 shrink-0">
                      <Input
                        id="cardDigits"
                        value={cardDigits}
                        maxLength={4}
                        onChange={(e) => setCardDigits(e.target.value.replace(/\D/g, ""))}
                        placeholder="4242"
                        className="bg-white text-center font-mono text-xs h-9"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethodType === "other" && (
                <div className="mt-2 bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
                  <Label htmlFor="customMethod" className="text-xs font-medium text-slate-700">
                    Custom Payment Method Name
                  </Label>
                  <Input
                    id="customMethod"
                    value={customMethod}
                    onChange={(e) => setCustomMethod(e.target.value)}
                    placeholder="e.g. Wire Transfer, Direct Debit ending in 1234"
                    className="bg-white text-xs h-9"
                    required
                  />
                </div>
              )}
            </div>

            {/* 2. Notification Email (aligned directly with API notificationEmail) */}
            <div className="space-y-2">
              <Label htmlFor="notificationEmail" className="text-sm font-semibold text-slate-900">
                2. Notification & Receipt Email
              </Label>
              <Input
                id="notificationEmail"
                type="email"
                value={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.value)}
                placeholder="accounts@acmeindustries.com"
                className="bg-white border-slate-200 shadow-none h-11 text-sm"
                required
              />
              <p className="text-xs text-slate-500">
                Your payment confirmation receipt and Avalara filing proof will be sent to this email address.
              </p>
            </div>

            {/* Partner & Security Notice */}
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3.5 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Avalara Certified Partner</span>
                <p className="mt-0.5">
                  Payments are approved directly through Avalara API. Estimated settlement is 1–3 business days.
                </p>
              </div>
            </div>

            {/* Error Banner */}
            {paymentError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm flex items-start gap-2">
                <span className="font-medium">{paymentError}</span>
              </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  disabled={submitPaymentMutation.isPending}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                size="lg"
                disabled={submitPaymentMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {submitPaymentMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Submit Payment ${formatCurrency(amount)}`
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
