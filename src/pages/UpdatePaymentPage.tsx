import React, { useState, useEffect } from "react";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { OrderItem } from "./PaymentOverview";
import {
  useCreatePaymentOrderMutation,
  useUpdatePaymentOrderMutation,
  type PaymentStatusEnum,
  type PaymentOrderDetailData,
} from "@/redux/api/paymentsApi";
import { formatCurrency } from "@/lib/dashboardFormatters";

const paymentFormSchema = z.object({
  quoteId: z.string().trim().min(1, "Quote/Order ID is required"),
  orderValue: z.string().trim().min(1, "Order value is required"),
  paymentDeposit: z.string().trim().min(1, "Payment deposit is required"),
  paymentProgress: z.string().trim().min(1, "Payment progress is required"),
  finalValue: z.string().trim().optional(),
  profit: z.string().trim().optional(),
  margin: z.string().trim().optional(),
  paymentStatus: z.enum(["In Progress", "Completed", "Started", "On Hold"]),
});

export type PaymentFormData = z.infer<typeof paymentFormSchema>;

interface UpdatePaymentPageProps {
  order?: OrderItem | null;
  onBack?: () => void;
  onSave?: (updatedOrder: OrderItem) => void;
  title?: string;
}

const parseCurrencyNumber = (val?: string | number | null): number => {
  if (val === undefined || val === null || val === "") return 0;
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  const cleaned = String(val).replace(/[^0-9.-]+/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

const mapStatusToEnum = (status: string): PaymentStatusEnum => {
  const s = status.toLowerCase().replace(/\s+/g, "_");
  if (s === "in_progress" || s === "in progress") return "in_progress";
  if (s === "started") return "started";
  if (s === "completed") return "completed";
  if (s === "on_hold" || s === "on hold") return "on_hold";
  return "in_progress";
};

const mapEnumToUiStatus = (
  val?: string
): "In Progress" | "Completed" | "Started" | "On Hold" => {
  if (!val) return "In Progress";
  const s = val.toLowerCase().replace(/\s+/g, "_");
  if (s === "in_progress") return "In Progress";
  if (s === "completed") return "Completed";
  if (s === "started") return "Started";
  if (s === "on_hold") return "On Hold";
  return "In Progress";
};

export const UpdatePaymentPage: React.FC<UpdatePaymentPageProps> = ({
  order: propOrder,
  onBack: propOnBack,
  onSave: propOnSave,
  title,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Support order passed via prop or location.state
  const existingOrder =
    propOrder || (location.state as { order?: OrderItem })?.order;
  const isEditing = Boolean(existingOrder);
  const pageTitle = title || (isEditing ? "Update Payment" : "Add Payment");

  const [submitError, setSubmitError] = useState<string | null>(null);

  // RTK Query Mutations
  const [createPaymentOrder, { isLoading: isCreating }] =
    useCreatePaymentOrderMutation();
  const [updatePaymentOrder, { isLoading: isUpdating }] =
    useUpdatePaymentOrderMutation();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      quoteId: existingOrder?.projectId || "",
      orderValue: existingOrder?.orderValue || "",
      paymentDeposit: existingOrder?.deposit || "",
      paymentProgress: existingOrder?.progress || "",
      finalValue: existingOrder?.final || "",
      profit: existingOrder?.profit || "",
      margin: existingOrder?.margin || "",
      paymentStatus: mapEnumToUiStatus(existingOrder?.status),
    },
  });

  // Watch fields for live recalculation
  const watchedOrderValue = watch("orderValue");
  const watchedDeposit = watch("paymentDeposit");
  const watchedProgress = watch("paymentProgress");
  const watchedFinal = watch("finalValue");

  const numOrderValue = parseCurrencyNumber(watchedOrderValue);
  const numDeposit = parseCurrencyNumber(watchedDeposit);
  const numProgress = parseCurrencyNumber(watchedProgress);
  const numFinal = parseCurrencyNumber(watchedFinal);
  const numCurrentCost = parseCurrencyNumber(existingOrder?.currentCost || 0);

  const totalReceived = numDeposit + numProgress + numFinal;
  const calculatedProfit = totalReceived - numCurrentCost;
  const calculatedMarginPct =
    numOrderValue > 0
      ? ((calculatedProfit / numOrderValue) * 100).toFixed(1)
      : "0.0";

  // Automatically update profit and margin display when values change
  useEffect(() => {
    if (numOrderValue > 0 || totalReceived > 0) {
      setValue("profit", formatCurrency(calculatedProfit), {
        shouldValidate: false,
      });
      setValue("margin", `${calculatedMarginPct}%`, {
        shouldValidate: false,
      });
    }
  }, [calculatedProfit, calculatedMarginPct, numOrderValue, totalReceived, setValue]);

  const handleBack = () => {
    if (propOnBack) {
      propOnBack();
    } else {
      navigate(-1);
    }
  };

  const isSubmitting = isCreating || isUpdating;

  const onSubmit = async (data: PaymentFormData) => {
    setSubmitError(null);
    const parsedOrderValue = parseCurrencyNumber(data.orderValue);
    const parsedDeposit = parseCurrencyNumber(data.paymentDeposit);
    const parsedProgress = parseCurrencyNumber(data.paymentProgress);
    const parsedFinal = parseCurrencyNumber(data.finalValue);
    const mappedStatus = mapStatusToEnum(data.paymentStatus);

    try {
      let savedResult: PaymentOrderDetailData;

      if (isEditing) {
        // A4. Update: PUT /api/account/payments/orders/:id
        const targetId =
          existingOrder?.projectId ||
          existingOrder?.wipId ||
          existingOrder?.leadId ||
          existingOrder?.id ||
          data.quoteId.trim();

        savedResult = await updatePaymentOrder({
          id: targetId,
          orderValue: parsedOrderValue,
          depositPaid: parsedDeposit,
          progressPaid: parsedProgress,
          finalPaid: parsedFinal,
          status: mappedStatus,
        }).unwrap();
      } else {
        // A4. Create: POST /api/account/payments/orders
        savedResult = await createPaymentOrder({
          quoteOrderId: data.quoteId.trim(),
          orderValue: parsedOrderValue,
          currentCost: numCurrentCost > 0 ? numCurrentCost : undefined,
          depositPaid: parsedDeposit,
          progressPaid: parsedProgress,
          finalPaid: parsedFinal,
          status: mappedStatus,
          notes: "",
        }).unwrap();
      }

      // Map back to OrderItem format
      const updated: OrderItem = {
        id:
          savedResult.wipId ||
          savedResult.leadId ||
          savedResult.profile?.quoteOrderId ||
          savedResult.orderDetails?.quoteOrderId ||
          data.quoteId,
        wipId: savedResult.wipId || existingOrder?.wipId,
        leadId: savedResult.leadId || existingOrder?.leadId,
        client:
          savedResult.profile?.customerName ||
          savedResult.orderDetails?.customerName ||
          existingOrder?.client ||
          "Customer",
        projectId:
          savedResult.profile?.quoteOrderId ||
          savedResult.orderDetails?.quoteOrderId ||
          savedResult.orderDetails?.orderId ||
          data.quoteId,
        location:
          savedResult.profile?.location ||
          savedResult.orderDetails?.location ||
          existingOrder?.location ||
          "Workshop . Texas",
        orderValue: formatCurrency(savedResult.orderValue ?? parsedOrderValue),
        currentCost: formatCurrency(savedResult.currentCost ?? numCurrentCost),
        deposit: formatCurrency(
          savedResult.financials?.deposit ??
            savedResult.paymentBreakdown?.deposit ??
            parsedDeposit
        ),
        progress: formatCurrency(
          savedResult.financials?.progress ??
            savedResult.paymentBreakdown?.progress ??
            parsedProgress
        ),
        final: formatCurrency(
          savedResult.financials?.final ??
            savedResult.paymentBreakdown?.final ??
            parsedFinal
        ),
        outstanding: formatCurrency(
          savedResult.financials?.outstanding ?? savedResult.outstanding
        ),
        profit: formatCurrency(
          savedResult.financials?.profit ??
            savedResult.profit ??
            calculatedProfit
        ),
        margin: `${
          savedResult.financials?.marginPct ??
          savedResult.marginPct ??
          calculatedMarginPct
        }%`,
        status: (savedResult.paymentStatus || data.paymentStatus) as any,
        totalReceived: formatCurrency(
          savedResult.financials?.totalReceived ??
            savedResult.totalReceived ??
            totalReceived
        ),
        raw: savedResult as any,
      };

      if (propOnSave) {
        propOnSave(updated);
      } else {
        navigate("/payment_overview", { state: { updatedOrder: updated } });
      }
    } catch (err: unknown) {
      console.error("Save payment failed:", err);
      const errMsg =
        err &&
        typeof err === "object" &&
        "data" in err &&
        (err as { data?: { message?: string } }).data?.message
          ? (err as { data: { message: string } }).data.message
          : err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to save payment order. Please check inputs and try again.";
      setSubmitError(errMsg);
    }
  };

  return (
    <div className="space-y-6 px-2 sm:px-4 xl:px-0 pb-10">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={handleBack}
          className="p-1 hover:bg-white/60 rounded-lg transition-colors cursor-pointer text-gray-800"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
        </Button>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
          {pageTitle}
        </h1>
      </div>

      {/* Error banner if submission failed */}
      {submitError && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{submitError}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setSubmitError(null)}
            className="ml-auto text-xs text-red-600 hover:text-red-800"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Main Card */}
      <Card className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-gray-100 gap-0">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Card Title */}
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Basic Details
            </h2>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            {/* Enter Quote/Order ID */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="quoteId"
                className="text-xs sm:text-sm font-medium text-gray-800"
              >
                Enter Quote/Order ID <span className="text-red-500">*</span>
              </label>
              <input
                id="quoteId"
                type="text"
                placeholder="QUO-9870-991"
                disabled={isEditing}
                {...register("quoteId")}
                className={cn(
                  "w-full px-4 py-2.5 bg-[#F9FAFB] border rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-1 focus:bg-white transition-colors disabled:opacity-70 disabled:bg-gray-100",
                  errors.quoteId
                    ? "border-red-400 focus:ring-red-400"
                    : "border-gray-200 focus:ring-blue-500"
                )}
              />
              {errors.quoteId && (
                <p className="text-xs text-red-500">
                  {errors.quoteId.message}
                </p>
              )}
            </div>

            {/* Order Value */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="orderValue"
                className="text-xs sm:text-sm font-medium text-gray-800"
              >
                Order Value <span className="text-red-500">*</span>
              </label>
              <input
                id="orderValue"
                type="text"
                placeholder="$4,50,900"
                {...register("orderValue")}
                className={cn(
                  "w-full px-4 py-2.5 bg-[#F9FAFB] border rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-1 focus:bg-white transition-colors",
                  errors.orderValue
                    ? "border-red-400 focus:ring-red-400"
                    : "border-gray-200 focus:ring-blue-500"
                )}
              />
              {errors.orderValue && (
                <p className="text-xs text-red-500">
                  {errors.orderValue.message}
                </p>
              )}
            </div>

            {/* Payment Deposit */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="paymentDeposit"
                className="text-xs sm:text-sm font-medium text-gray-800"
              >
                Payment Deposit <span className="text-red-500">*</span>
              </label>
              <input
                id="paymentDeposit"
                type="text"
                placeholder="$1,35,000"
                {...register("paymentDeposit")}
                className={cn(
                  "w-full px-4 py-2.5 bg-[#F9FAFB] border rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-1 focus:bg-white transition-colors",
                  errors.paymentDeposit
                    ? "border-red-400 focus:ring-red-400"
                    : "border-gray-200 focus:ring-blue-500"
                )}
              />
              {errors.paymentDeposit && (
                <p className="text-xs text-red-500">
                  {errors.paymentDeposit.message}
                </p>
              )}
            </div>

            {/* Payment Progress */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="paymentProgress"
                className="text-xs sm:text-sm font-medium text-gray-800"
              >
                Payment Progress <span className="text-red-500">*</span>
              </label>
              <input
                id="paymentProgress"
                type="text"
                placeholder="$1,35,000"
                {...register("paymentProgress")}
                className={cn(
                  "w-full px-4 py-2.5 bg-[#F9FAFB] border rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-1 focus:bg-white transition-colors",
                  errors.paymentProgress
                    ? "border-red-400 focus:ring-red-400"
                    : "border-gray-200 focus:ring-blue-500"
                )}
              />
              {errors.paymentProgress && (
                <p className="text-xs text-red-500">
                  {errors.paymentProgress.message}
                </p>
              )}
            </div>

            {/* Final */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="finalValue"
                className="text-xs sm:text-sm font-medium text-gray-800"
              >
                Final
              </label>
              <input
                id="finalValue"
                type="text"
                placeholder="$1,35,000"
                {...register("finalValue")}
                className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-colors"
              />
            </div>

            {/* Spacer for 2nd column in row 3 */}
            <div className="hidden md:block" />

            {/* Profit (Auto-fill) */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="profit"
                className="text-xs sm:text-sm font-medium text-gray-800 flex items-center justify-between"
              >
                <span>Profit (Auto-fill)</span>
                <span className="text-[11px] text-gray-400 font-normal">
                  Recalculated on server
                </span>
              </label>
              <input
                id="profit"
                type="text"
                placeholder="$89,000"
                {...register("profit")}
                className="w-full px-4 py-2.5 bg-[#F3F4F6] border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none cursor-default"
                readOnly
              />
            </div>

            {/* Margin % (Auto-fill) */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="margin"
                className="text-xs sm:text-sm font-medium text-gray-800 flex items-center justify-between"
              >
                <span>Margin % (Auto-fill)</span>
                <span className="text-[11px] text-gray-400 font-normal">
                  Recalculated on server
                </span>
              </label>
              <input
                id="margin"
                type="text"
                placeholder="19.8%"
                {...register("margin")}
                className="w-full px-4 py-2.5 bg-[#F3F4F6] border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none cursor-default"
                readOnly
              />
            </div>

            {/* Payment Status */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="paymentStatus"
                className="text-xs sm:text-sm font-medium text-gray-800"
              >
                Payment Status <span className="text-red-500">*</span>
              </label>
              <Controller
                name="paymentStatus"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="paymentStatus"
                      className="w-full h-10 px-4 bg-[#F9FAFB] border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-1 focus:ring-blue-500 shadow-none"
                    >
                      <SelectValue placeholder="Select status">
                        {field.value}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Started">Started</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.paymentStatus && (
                <p className="text-xs text-red-500">
                  {errors.paymentStatus.message}
                </p>
              )}
            </div>
          </div>

          {/* Card Footer Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-6 py-2 h-9 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg shadow-none cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2 h-9 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-medium rounded-lg shadow-xs cursor-pointer gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isSubmitting ? "Saving..." : "Save"}</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default UpdatePaymentPage;
