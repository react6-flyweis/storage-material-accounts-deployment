import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAddProjectWiseIncomeReceivedMutation,
  type IncomeTypeOption,
  type AddProjectWiseIncomeReceivedPayload,
} from "@/redux/api/reportsApi";
import { formatDateToIso } from "@/lib/dashboardFormatters";

export interface AddReceivedPaymentFormData {
  incomeType: string;
  invoiceNumber?: string;
  description?: string;
  amount: string;
  date: string;
  status: "received" | "pending";
}

interface AddIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectIdOrLeadId: string;
  incomeTypeOptions?: IncomeTypeOption[];
  defaultType?: "received" | "pending";
  onSuccess?: (createdTransaction?: any) => void;
}

export const AddIncomeModal: React.FC<AddIncomeModalProps> = ({
  isOpen,
  onClose,
  projectIdOrLeadId,
  incomeTypeOptions,
  defaultType = "received",
  onSuccess,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [addIncome, { isLoading: isSubmitting }] =
    useAddProjectWiseIncomeReceivedMutation();

  const options = incomeTypeOptions || [];

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<AddReceivedPaymentFormData>({
    defaultValues: {
      incomeType: options[0]?.key || "",
      invoiceNumber: "",
      description: "",
      amount: "",
      date: formatDateToIso(new Date()),
      status: defaultType,
    },
  });

  const currentStatus = watch("status");
  const isPending = currentStatus === "pending";

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      reset({
        incomeType: options[0]?.key || "",
        invoiceNumber: "",
        description: "",
        amount: "",
        date: formatDateToIso(new Date()),
        status: defaultType,
      });
    }
  }, [isOpen, defaultType, options, reset]);

  const onFormSubmit = async (data: AddReceivedPaymentFormData) => {
    try {
      setErrorMessage(null);
      const cleanAmount = parseFloat(String(data.amount).replace(/[^0-9.]/g, ""));
      if (isNaN(cleanAmount) || cleanAmount <= 0) {
        setErrorMessage("Please enter a valid positive amount.");
        return;
      }

      const payload: AddProjectWiseIncomeReceivedPayload = {
        amount: cleanAmount,
        incomeType: data.incomeType || undefined,
        invoiceNumber: data.invoiceNumber?.trim() || undefined,
        description: data.description?.trim() || undefined,
        date: data.date ? data.date : undefined,
        status: data.status || "received",
      };

      const result = await addIncome({
        projectIdOrLeadId,
        body: payload,
      }).unwrap();

      onSuccess?.(result?.transaction);
      onClose();
    } catch (err: any) {
      console.error("Failed to add income transaction:", err);
      const msg =
        err?.data?.message ||
        err?.message ||
        "Failed to save income payment. Please check your inputs and try again.";
      setErrorMessage(msg);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden bg-white border border-slate-200 shadow-xl rounded-2xl">
        <DialogHeader className="px-6 py-4 border-b border-slate-100 bg-white">
          <DialogTitle className="text-lg font-bold text-slate-900">
            {isPending ? "Add Pending Payment" : "Add Received Payment"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div className="p-6 space-y-4 text-xs sm:text-sm">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200">
                {errorMessage}
              </div>
            )}

            {/* Row 1: Income Type and Invoice Number */}
            {isPending ? (
              <div className="space-y-1.5">
                <Label htmlFor="incomeType" className="text-xs font-semibold text-slate-700">
                  Income Type
                </Label>
                <Controller
                  name="incomeType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="incomeType" className="w-full h-10 text-xs sm:text-sm bg-white">
                        <SelectValue placeholder="Select income type" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.map((opt) => (
                          <SelectItem key={opt.key} value={opt.key} className="text-xs sm:text-sm">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="incomeType" className="text-xs font-semibold text-slate-700">
                    Income Type
                  </Label>
                  <Controller
                    name="incomeType"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="incomeType" className="w-full h-10 text-xs sm:text-sm bg-white">
                          <SelectValue placeholder="Select income type" />
                        </SelectTrigger>
                        <SelectContent>
                          {options.map((opt) => (
                            <SelectItem key={opt.key} value={opt.key} className="text-xs sm:text-sm">
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="invoiceNumber" className="text-xs font-semibold text-slate-700">
                    Invoice ID <span className="text-slate-400 font-normal">(Optional)</span>
                  </Label>
                  <Input
                    id="invoiceNumber"
                    type="text"
                    placeholder="Auto INV-#### if blank"
                    {...register("invoiceNumber")}
                    className="h-10 text-xs sm:text-sm bg-white"
                  />
                </div>
              </div>
            )}

            {/* Row 2: Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-semibold text-slate-700">
                Description <span className="text-slate-400 font-normal">(Optional)</span>
              </Label>
              <Input
                id="description"
                type="text"
                placeholder="Defaults to income type label if blank"
                {...register("description")}
                className="h-10 text-xs sm:text-sm bg-white"
              />
            </div>

            {/* Row 3: Amount and Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="amount" className="text-xs font-semibold text-slate-700">
                  Amount <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0.00"
                  {...register("amount", {
                    required: "Amount is required",
                    validate: (val) => {
                      const num = parseFloat(String(val).replace(/[^0-9.]/g, ""));
                      return num > 0 || "Amount must be a positive number";
                    },
                  })}
                  className={`h-10 text-xs sm:text-sm bg-white ${
                    errors.amount ? "border-red-500" : ""
                  }`}
                />
                {errors.amount && (
                  <span className="text-[11px] text-red-500 block">
                    {errors.amount.message}
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="date" className="text-xs font-semibold text-slate-700">
                  {isPending ? "Expected Due Date" : "Date"}
                </Label>
                <Input
                  id="date"
                  type="date"
                  {...register("date")}
                  className="h-10 text-xs sm:text-sm bg-white"
                />
              </div>
            </div>

            {/* Row 4: Status */}
            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-xs font-semibold text-slate-700">
                Status
              </Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="status" className="w-full h-10 text-xs sm:text-sm bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="received" className="text-xs sm:text-sm">
                        Received (creates paid invoice)
                      </SelectItem>
                      <SelectItem value="pending" className="text-xs sm:text-sm">
                        Pending
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <DialogFooter className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex sm:justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs sm:text-sm h-9 px-5 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm h-9 px-6 font-semibold cursor-pointer shadow-xs"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
              <span>{isSubmitting ? "Saving..." : "Save"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddIncomeModal;
