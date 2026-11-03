import React, { useRef, useMemo } from "react";
import { ArrowLeft, Upload, AlertCircle, Loader2 } from "lucide-react";
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
  useGetCostFiltersQuery,
  useCreateMiscRecordMutation,
} from "@/redux/api/costsApi";

const CATEGORIES = [
  "Maintenance",
  "Equipment",
  "Office Supplies",
  "Communication",
  "Safety",
  "Utilities",
  "Travel",
  "Others",
];

interface MiscFormValues {
  expenseCategory: string;
  expenseDate: string;
  expenseName: string;
  project: string;
  amount: number | "";
  vendor: string;
  attachmentName: string;
  paymentStatus: "paid" | "pending" | "";
}

export const AddMiscellaneousCostPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: filtersData } = useGetCostFiltersQuery();
  const [createMiscRecordApi, { isLoading: isMutationLoading }] = useCreateMiscRecordMutation();

  const dynamicProjects = useMemo(() => {
    if (!filtersData?.projects) return [];
    const list = filtersData.projects
      .map((p) => (typeof p.projectName === "string" ? p.projectName.trim() : ""))
      .filter((p): p is string => Boolean(p));
    return Array.from(new Set(list));
  }, [filtersData?.projects]);

  const dynamicVendors = useMemo(() => {
    if (!filtersData?.vendors) return [];
    const list = filtersData.vendors
      .map((v) => {
        if (typeof v === "string") return v.trim();
        return (v?.name || v?.vendorName || "").trim();
      })
      .filter((v): v is string => Boolean(v));
    return Array.from(new Set(list));
  }, [filtersData?.vendors]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<MiscFormValues>({
    defaultValues: {
      expenseCategory: "",
      expenseDate: "",
      expenseName: "",
      project: "",
      amount: "",
      vendor: "",
      attachmentName: "",
      paymentStatus: "",
    },
  });

  const expenseCategory = watch("expenseCategory");
  const project = watch("project");
  const vendor = watch("vendor");
  const attachmentName = watch("attachmentName");
  const paymentStatus = watch("paymentStatus");

  // Success dialog state
  const [isSuccessOpen, setIsSuccessOpen] = React.useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("attachmentName", file.name, { shouldValidate: true });
    }
  };

  const onSubmit = async (values: MiscFormValues) => {
    clearErrors("root");
    if (!values.expenseCategory) {
      setError("expenseCategory", { message: "Please select an expense category" });
      return;
    }
    if (!values.expenseDate) {
      setError("expenseDate", { message: "Please select an expense date" });
      return;
    }
    if (!values.paymentStatus) {
      setError("paymentStatus", { message: "Please select a payment status" });
      return;
    }

    const numAmount = Number(values.amount) || 0;
    const selectedProj = filtersData?.projects?.find((p) => p.projectName === values.project);

    try {
      await createMiscRecordApi({
        expenseCategory: values.expenseCategory,
        expenseDate: values.expenseDate,
        expenseName: values.expenseName.trim(),
        leadId: selectedProj?._id,
        vendorPayee: values.vendor,
        amount: numAmount,
        paymentStatus: values.paymentStatus,
        receiptFile: values.attachmentName || undefined,
      }).unwrap();
      setIsSuccessOpen(true);
    } catch (err) {
      const errorMsg = getApiErrorMessage(err, "Failed to record miscellaneous cost. Please try again.");
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
          onClick={() => navigate("/cost/miscellaneous-cost")}
          className="flex items-center gap-2.5 text-slate-800 hover:text-slate-950 font-bold text-lg sm:text-xl transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700 group-hover:-translate-x-0.5 transition-transform" />
          <span>Add Miscellaneous Cost</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 sm:p-8">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-6">
          Basic Details
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

          {/* Row 1: Expense Category & Expense Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-semibold text-slate-900">
                Expense Category <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={expenseCategory}
                onValueChange={(val) => {
                  setValue("expenseCategory", val, { shouldValidate: true });
                  clearErrors("expenseCategory");
                  clearErrors("root");
                }}
              >
                <SelectTrigger className="w-full bg-white border-slate-200 h-10">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.filter((cat) => Boolean(cat && cat.trim())).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.expenseCategory && (
                <p className="text-xs text-rose-500">{errors.expenseCategory.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-semibold text-slate-900">
                Expense Date <span className="text-rose-500">*</span>
              </Label>
              <DatePicker
                value={watch("expenseDate")}
                onChange={(val) => {
                  setValue("expenseDate", val, { shouldValidate: true });
                  clearErrors("expenseDate");
                  clearErrors("root");
                }}
                placeholder="Select Date"
              />
              {errors.expenseDate && (
                <p className="text-xs text-rose-500">{errors.expenseDate.message}</p>
              )}
            </div>
          </div>

          {/* Row 2: Expense Name & Project */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-semibold text-slate-900">
                Expense Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder="e.g. Machine Repair"
                {...register("expenseName", {
                  required: "Expense name is required",
                  onChange: () => clearErrors("root"),
                })}
                className="bg-white border-slate-200 h-10"
              />
              {errors.expenseName && (
                <p className="text-xs text-rose-500">{errors.expenseName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-semibold text-slate-900">
                Project
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
                  {dynamicProjects.length === 0 ? (
                    <div className="p-2 text-xs text-slate-400">No projects available</div>
                  ) : (
                    dynamicProjects
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
          </div>

          {/* Row 3: Amount & Vendor/Payee */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-semibold text-slate-900">
                Amount <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="number"
                step="any"
                placeholder="0.00"
                {...register("amount", {
                  required: "Amount is required",
                  valueAsNumber: true,
                  min: { value: 0, message: "Amount must be >= 0" },
                  onChange: () => clearErrors("root"),
                })}
                className="bg-white border-slate-200 h-10"
              />
              {errors.amount && (
                <p className="text-xs text-rose-500">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-semibold text-slate-900">
                Vendor / Payee
              </Label>
              {dynamicVendors.length > 0 ? (
                <Select
                  value={vendor}
                  onValueChange={(val) => {
                    setValue("vendor", val, { shouldValidate: true });
                    clearErrors("root");
                  }}
                >
                  <SelectTrigger className="w-full bg-white border-slate-200 h-10">
                    <SelectValue placeholder="Select Vendor (Optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {dynamicVendors
                      .filter((v) => Boolean(v && v.trim()))
                      .map((v) => (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type="text"
                  placeholder="e.g. XYZ Services"
                  {...register("vendor")}
                  className="bg-white border-slate-200 h-10"
                />
              )}
            </div>
          </div>

          {/* Row 4: Attachments & Payment Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-semibold text-slate-900">
                Attachments
              </Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white flex items-center justify-between text-xs sm:text-sm font-medium text-slate-800 hover:border-slate-300 transition-colors cursor-pointer"
              >
                <span className={attachmentName ? "text-slate-900" : "text-slate-400"}>
                  {attachmentName || "Upload File (Optional)"}
                </span>
                <Upload className="w-4 h-4 text-slate-500" />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-semibold text-slate-900">
                Payment Status <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={paymentStatus}
                onValueChange={(val) => {
                  setValue("paymentStatus", val as "paid" | "pending", { shouldValidate: true });
                  clearErrors("paymentStatus");
                  clearErrors("root");
                }}
              >
                <SelectTrigger className="w-full bg-white border-slate-200 h-10">
                  <SelectValue placeholder="Select Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              {errors.paymentStatus && (
                <p className="text-xs text-rose-500">{errors.paymentStatus.message}</p>
              )}
            </div>
          </div>

          {/* Bottom Buttons: Cancel & Submit for Approval */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/cost/miscellaneous-cost")}
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
          navigate("/cost/miscellaneous-cost");
        }}
        title="Cost Submitted for Approval!"
        subTitle="The miscellaneous expense has been recorded and submitted for approval."
      />
    </div>
  );
};

export default AddMiscellaneousCostPage;
