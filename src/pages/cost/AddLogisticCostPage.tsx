import React, { useMemo } from "react";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import SuccessModal from "@/components/common_components/SuccessModal";
import { getApiErrorMessage } from "@/redux/utils/apiError";
import {
  useCreateLogisticsRecordMutation,
  useLazyLookupLogisticsDeliveryQuery,
  useGetCostFiltersQuery,
} from "@/redux/api/costsApi";

const PAYMENT_STATUSES = [
  { label: "Paid", value: "paid" },
  { label: "Pending", value: "pending" },
] as const;

interface LogisticsFormValues {
  deliveryId: string;
  date: string;
  project: string;
  autoFillDeliveryId: string;
  finalAmount: string;
  paymentStatus: "paid" | "pending" | "unpaid" | "";
  deliveryCompany: string;
}

export const AddLogisticCostPage: React.FC = () => {
  const navigate = useNavigate();

  // RTK Query endpoints
  const [createLogisticsRecord, { isLoading: isMutationLoading }] =
    useCreateLogisticsRecordMutation();
  const [triggerLookup, { isFetching: isLookingUp }] =
    useLazyLookupLogisticsDeliveryQuery();
  const { data: costFilters } = useGetCostFiltersQuery();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<LogisticsFormValues>({
    defaultValues: {
      deliveryId: "",
      date: "",
      project: "",
      autoFillDeliveryId: "",
      finalAmount: "",
      paymentStatus: "",
      deliveryCompany: "",
    },
  });

  const deliveryId = watch("deliveryId");
  const project = watch("project");
  const paymentStatus = watch("paymentStatus");

  const [isSuccessOpen, setIsSuccessOpen] = React.useState(false);
  const projectList = useMemo(() => {
    if (!costFilters?.projects) return [];
    const list = costFilters.projects
      .map((p) => (typeof p.projectName === "string" ? p.projectName.trim() : ""))
      .filter((p): p is string => Boolean(p));
    return Array.from(new Set(list));
  }, [costFilters?.projects]);

  const handleDeliveryLookup = async (id: string) => {
    if (!id.trim()) return;
    try {
      const res = await triggerLookup(id).unwrap();
      if (res) {
        if (res.project) setValue("project", res.project, { shouldValidate: true });
        if (res.deliveryCompany || res.carrier) {
          setValue("deliveryCompany", res.deliveryCompany || res.carrier || "", { shouldValidate: true });
        }
        if (res.finalAmount) {
          setValue("finalAmount", String(res.finalAmount), { shouldValidate: true });
        }
        setValue("autoFillDeliveryId", res.deliveryRef || id, { shouldValidate: true });
        clearErrors("root");
      }
    } catch {
      // Lookup failed or no existing bid match
    }
  };

  const onSubmit = async (values: LogisticsFormValues) => {
    clearErrors("root");
    if (!values.deliveryId) {
      setError("deliveryId", { message: "Delivery ID / Reference is required" });
      return;
    }
    if (!values.date) {
      setError("date", { message: "Date is required" });
      return;
    }
    if (!values.finalAmount) {
      setError("finalAmount", { message: "Final amount is required" });
      return;
    }
    if (!values.paymentStatus) {
      setError("paymentStatus", { message: "Payment status is required" });
      return;
    }

    const numericAmount = Number(values.finalAmount.replace(/[^0-9.]/g, "")) || 0;

    try {
      await createLogisticsRecord({
        deliveryRef: values.deliveryId,
        deliveryCompany: values.deliveryCompany,
        project: values.project,
        finalAmount: numericAmount,
        date: values.date,
        paymentStatus: values.paymentStatus as "Paid" | "Pending" | "Unpaid",
      }).unwrap();
      setIsSuccessOpen(true);
    } catch (err: unknown) {
      const errorMsg = getApiErrorMessage(
        err,
        "Failed to save logistics cost record. Please try again."
      );
      setError("root", { message: errorMsg });
    }
  };

  const isPending = isSubmitting || isMutationLoading;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header / Back Button */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => navigate("/cost/logistics-cost")}
          className="flex items-center gap-3 text-slate-900 hover:text-slate-950 font-bold text-xl sm:text-2xl transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-5 h-5 text-slate-800 group-hover:-translate-x-0.5 transition-transform stroke-[2.2]" />
          <span>Add Logistic Cost</span>
        </button>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 sm:p-8">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-6">
          Basic Details
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Submit Error Alert Banner */}
          {errors.root?.message && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-rose-900">Submission Error</p>
                <p className="text-rose-700 leading-relaxed">{errors.root.message}</p>
              </div>
            </div>
          )}

          {/* Row 1: Enter Delivery ID & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div className="space-y-2">
              <Label className="text-xs sm:text-[13px] font-semibold text-slate-900">
                Enter Delivery ID / Reference <span className="text-rose-500">*</span>
              </Label>
              <div className="relative flex items-center">
                <Input
                  type="text"
                  placeholder="e.g. DEL-0012 or bid reference"
                  {...register("deliveryId", {
                    required: "Delivery ID / Reference is required",
                    onChange: () => clearErrors("root"),
                  })}
                  onBlur={() => handleDeliveryLookup(deliveryId)}
                  className="bg-white border-slate-200 h-10 pr-24"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDeliveryLookup(deliveryId)}
                  disabled={isLookingUp || !deliveryId?.trim()}
                  className="absolute right-1.5 h-7 px-2.5 text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100"
                >
                  {isLookingUp ? "Looking up..." : "Lookup"}
                </Button>
              </div>
              {errors.deliveryId && (
                <p className="text-xs text-rose-500">{errors.deliveryId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs sm:text-[13px] font-semibold text-slate-900">
                Date <span className="text-rose-500">*</span>
              </Label>
              <DatePicker
                value={watch("date")}
                onChange={(val) => {
                  setValue("date", val, { shouldValidate: true });
                  clearErrors("date");
                  clearErrors("root");
                }}
                placeholder="Select Date"
              />
              {errors.date && (
                <p className="text-xs text-rose-500">{errors.date.message}</p>
              )}
            </div>
          </div>

          {/* Row 2: Project (Auto-Fill) & Delivery ID (Auto-Fill) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div className="space-y-2">
              <Label className="text-xs sm:text-[13px] font-semibold text-slate-900">
                Project (Auto-Fill)
              </Label>
              <Select
                value={project}
                onValueChange={(val) => {
                  setValue("project", val, { shouldValidate: true });
                  clearErrors("root");
                }}
              >
                <SelectTrigger className="w-full bg-white border-slate-200 h-10">
                  <SelectValue placeholder="Select Project (Optional)" />
                </SelectTrigger>
                <SelectContent>
                  {projectList.length === 0 ? (
                    <div className="p-2 text-xs text-slate-400">No projects available</div>
                  ) : (
                    projectList
                      .filter((p) => Boolean(p && p.trim()))
                      .map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs sm:text-[13px] font-semibold text-slate-900">
                Delivery ID (Auto-Fill)
              </Label>
              <Input
                type="text"
                placeholder="Auto-filled on lookup"
                {...register("autoFillDeliveryId")}
                className="bg-white border-slate-200 h-10"
              />
            </div>
          </div>

          {/* Row 3: Final Amount & Payment Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div className="space-y-2">
              <Label className="text-xs sm:text-[13px] font-semibold text-slate-900">
                Final Amount <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="number"
                step="any"
                placeholder="0.00"
                {...register("finalAmount", {
                  required: "Final amount is required",
                  onChange: () => clearErrors("root"),
                })}
                className="bg-white border-slate-200 h-10"
              />
              {errors.finalAmount && (
                <p className="text-xs text-rose-500">{errors.finalAmount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs sm:text-[13px] font-semibold text-slate-900">
                Payment Status <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={paymentStatus}
                onValueChange={(val) => {
                  setValue("paymentStatus", val as "paid" | "pending" | "unpaid", { shouldValidate: true });
                  clearErrors("paymentStatus");
                  clearErrors("root");
                }}
              >
                <SelectTrigger className="w-full bg-white border-slate-200 h-10">
                  <SelectValue placeholder="Select Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUSES.filter((status) => Boolean(status.value)).map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.paymentStatus && (
                <p className="text-xs text-rose-500">{errors.paymentStatus.message}</p>
              )}
            </div>
          </div>

          {/* Row 4: Delivery Company */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div className="space-y-2">
              <Label className="text-xs sm:text-[13px] font-semibold text-slate-900">
                Delivery Company (Auto-Fill)
              </Label>
              <Input
                type="text"
                placeholder="e.g. Carrier / Company"
                {...register("deliveryCompany")}
                className="bg-white border-slate-200 h-10"
              />
            </div>
          </div>

          {/* Form Bottom Actions */}
          <div className="flex items-center justify-between pt-8 border-t border-slate-100 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/cost/logistics-cost")}
              className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isPending}
              className="bg-[#635BFF] hover:bg-[#5248EE] text-white px-6"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit for Approval</span>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => {
          setIsSuccessOpen(false);
          navigate("/cost/logistics-cost");
        }}
        title="Logistic Cost Submitted!"
        subTitle="The logistics delivery cost has been successfully submitted for approval."
      />
    </div>
  );
};

export default AddLogisticCostPage;
