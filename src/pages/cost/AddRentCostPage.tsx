import React from "react";
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
import { useCreateRentRecordMutation } from "@/redux/api/costsApi";

interface RentFormValues {
  propertyName: string;
  landlord: string;
  propertyType: string;
  location: string;
  monthlyRent: string;
  paymentSchedule: string;
  leaseStartDate: string;
  leaseEndDate: string;
}

const PROPERTY_TYPES = [
  "Warehouse",
  "Plant",
  "Office",
  "Land",
  "Commercial Space",
];

const SCHEDULE_OPTIONS = [
  "Monthly",
  "Quarterly",
  "Half-Yearly",
  "Yearly",
];

export const AddRentCostPage: React.FC = () => {
  const navigate = useNavigate();
  const [createRentRecord, { isLoading: isMutationLoading }] =
    useCreateRentRecordMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<RentFormValues>({
    defaultValues: {
      propertyName: "",
      landlord: "",
      propertyType: "",
      location: "",
      monthlyRent: "",
      paymentSchedule: "",
      leaseStartDate: "",
      leaseEndDate: "",
    },
  });

  const propertyType = watch("propertyType");
  const paymentSchedule = watch("paymentSchedule");
  const propertyName = watch("propertyName");

  const [isSuccessOpen, setIsSuccessOpen] = React.useState(false);

  const onSubmit = async (values: RentFormValues) => {
    clearErrors("root");
    if (!values.propertyName.trim()) {
      setError("propertyName", { message: "Property name is required" });
      return;
    }
    if (!values.landlord.trim()) {
      setError("landlord", { message: "Landlord / Owner is required" });
      return;
    }
    if (!values.propertyType) {
      setError("propertyType", { message: "Property type is required" });
      return;
    }
    if (!values.location.trim()) {
      setError("location", { message: "Location is required" });
      return;
    }
    if (!values.monthlyRent) {
      setError("monthlyRent", { message: "Monthly rent is required" });
      return;
    }
    if (!values.paymentSchedule) {
      setError("paymentSchedule", { message: "Payment schedule is required" });
      return;
    }
    if (!values.leaseStartDate) {
      setError("leaseStartDate", { message: "Lease start date is required" });
      return;
    }
    if (!values.leaseEndDate) {
      setError("leaseEndDate", { message: "Lease end date is required" });
      return;
    }

    const numericAmount = Number(values.monthlyRent.replace(/[^0-9.]/g, "")) || 0;

    try {
      await createRentRecord({
        propertyName: values.propertyName.trim(),
        landlord: values.landlord.trim(),
        propertyType: values.propertyType,
        location: values.location.trim(),
        monthlyRent: numericAmount,
        leaseStartDate: values.leaseStartDate,
        leaseEndDate: values.leaseEndDate,
        paymentSchedule: values.paymentSchedule,
      }).unwrap();
      setIsSuccessOpen(true);
    } catch (err: unknown) {
      const errorMsg = getApiErrorMessage(
        err,
        "Failed to save rent cost record. Please try again."
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
          onClick={() => navigate("/cost/rent-cost")}
          className="flex items-center gap-3 text-slate-900 hover:text-slate-950 font-bold text-xl sm:text-2xl transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-5 h-5 text-slate-800 group-hover:-translate-x-0.5 transition-transform stroke-[2.2]" />
          <span>Add Rent Cost</span>
        </button>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 sm:p-8">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-6">
          Basic Details
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Submission Error Banner */}
          {errors.root?.message && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-rose-900">Submission Error</p>
                <p className="text-rose-700 leading-relaxed">{errors.root.message}</p>
              </div>
            </div>
          )}

          {/* Row 1: Property Name & Landlord / Owner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div className="space-y-2">
              <Label className="text-xs sm:text-[13px] font-semibold text-slate-900">
                Property Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder="e.g. Surat Storage Warehouse"
                {...register("propertyName", {
                  required: "Property name is required",
                  onChange: () => clearErrors("root"),
                })}
                className="bg-white border-slate-200 h-10"
              />
              {errors.propertyName && (
                <p className="text-xs text-rose-500">{errors.propertyName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs sm:text-[13px] font-semibold text-slate-900">
                Landlord / Owner <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder="e.g. Rajesh Kapoor"
                {...register("landlord", {
                  required: "Landlord / Owner is required",
                  onChange: () => clearErrors("root"),
                })}
                className="bg-white border-slate-200 h-10"
              />
              {errors.landlord && (
                <p className="text-xs text-rose-500">{errors.landlord.message}</p>
              )}
            </div>
          </div>

          {/* Row 2: Property Type & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div className="space-y-2">
              <Label className="text-xs sm:text-[13px] font-semibold text-slate-900">
                Property Type <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={propertyType}
                onValueChange={(val) => {
                  setValue("propertyType", val, { shouldValidate: true });
                  clearErrors("propertyType");
                  clearErrors("root");
                }}
              >
                <SelectTrigger className="w-full bg-white border-slate-200 h-10">
                  <SelectValue placeholder="Select Property Type" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.filter((opt) => Boolean(opt && opt.trim())).map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.propertyType && (
                <p className="text-xs text-rose-500">{errors.propertyType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs sm:text-[13px] font-semibold text-slate-900">
                Location <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder="e.g. Pune"
                {...register("location", {
                  required: "Location is required",
                  onChange: () => clearErrors("root"),
                })}
                className="bg-white border-slate-200 h-10"
              />
              {errors.location && (
                <p className="text-xs text-rose-500">{errors.location.message}</p>
              )}
            </div>
          </div>

          {/* Row 3: Monthly Rent & Payment Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div className="space-y-2">
              <Label className="text-xs sm:text-[13px] font-semibold text-slate-900">
                Monthly Rent <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="number"
                step="any"
                placeholder="0.00"
                {...register("monthlyRent", {
                  required: "Monthly rent is required",
                  onChange: () => clearErrors("root"),
                })}
                className="bg-white border-slate-200 h-10"
              />
              {errors.monthlyRent && (
                <p className="text-xs text-rose-500">{errors.monthlyRent.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs sm:text-[13px] font-semibold text-slate-900">
                Payment Schedule <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={paymentSchedule}
                onValueChange={(val) => {
                  setValue("paymentSchedule", val, { shouldValidate: true });
                  clearErrors("paymentSchedule");
                  clearErrors("root");
                }}
              >
                <SelectTrigger className="w-full bg-white border-slate-200 h-10">
                  <SelectValue placeholder="Select Payment Schedule" />
                </SelectTrigger>
                <SelectContent>
                  {SCHEDULE_OPTIONS.filter((opt) => Boolean(opt && opt.trim())).map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.paymentSchedule && (
                <p className="text-xs text-rose-500">{errors.paymentSchedule.message}</p>
              )}
            </div>
          </div>

          {/* Row 4: Lease Start Date & Lease End Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div className="space-y-2">
              <Label className="text-xs sm:text-[13px] font-semibold text-slate-900">
                Lease Start Date <span className="text-rose-500">*</span>
              </Label>
              <DatePicker
                value={watch("leaseStartDate")}
                onChange={(val) => {
                  setValue("leaseStartDate", val, { shouldValidate: true });
                  clearErrors(["leaseStartDate", "root"]);
                }}
                placeholder="Select Start Date"
              />
              {errors.leaseStartDate && (
                <p className="text-xs text-rose-500">{errors.leaseStartDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs sm:text-[13px] font-semibold text-slate-900">
                Lease End Date <span className="text-rose-500">*</span>
              </Label>
              <DatePicker
                value={watch("leaseEndDate")}
                onChange={(val) => {
                  setValue("leaseEndDate", val, { shouldValidate: true });
                  clearErrors(["leaseEndDate", "root"]);
                }}
                placeholder="Select End Date"
              />
              {errors.leaseEndDate && (
                <p className="text-xs text-rose-500">{errors.leaseEndDate.message}</p>
              )}
            </div>
          </div>

          {/* Bottom Actions: Cancel & Add */}
          <div className="pt-6 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/cost/rent-cost")}
              className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isPending}
              className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-6"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span>Adding...</span>
                </>
              ) : (
                <span>Add</span>
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
          navigate("/cost/rent-cost");
        }}
        title="Rent Cost Added Successfully!"
        description={`New property ${propertyName} has been registered successfully.`}
      />
    </div>
  );
};

export default AddRentCostPage;
