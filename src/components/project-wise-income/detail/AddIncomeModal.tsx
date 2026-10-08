import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { ChevronDown, Calendar as CalendarIcon, X } from "lucide-react";

export interface AddReceivedPaymentFormData {
  incomeType: string;
  invoiceId?: string;
  description: string;
  amount: string;
  date: string;
  status: "Received" | "Pending";
}

interface AddIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: {
    incomeType: string;
    date: string;
    description: string;
    invoiceRef: string;
    amount: string;
    status: "Received" | "Pending";
  }) => void;
  defaultType?: "Received" | "Pending";
}

export const AddIncomeModal: React.FC<AddIncomeModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  defaultType = "Received",
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<AddReceivedPaymentFormData>({
    defaultValues: {
      incomeType: "Milestone Income",
      invoiceId: defaultType === "Received" ? "INV-0018" : "",
      description: "Site Extra Work claim #12",
      amount: "$5,000",
      date: "12 April 2026",
      status: defaultType,
    },
  });

  const currentStatus = watch("status");
  const isPending = currentStatus === "Pending";

  useEffect(() => {
    if (isOpen) {
      reset({
        incomeType: "Milestone Income",
        invoiceId: defaultType === "Received" ? "INV-0018" : "",
        description: "Site Extra Work claim #12",
        amount: "$5,000",
        date: "12 April 2026",
        status: defaultType,
      });
    }
  }, [isOpen, defaultType, reset]);

  if (!isOpen) return null;

  const onFormSubmit = (data: AddReceivedPaymentFormData) => {
    onAdd({
      incomeType: data.incomeType,
      date: data.date,
      description: data.description,
      invoiceRef: isPending
        ? data.invoiceId || "INV-DUE"
        : data.invoiceId || "INV-0018",
      amount: data.amount,
      status: data.status,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-bold text-gray-900 leading-none">
            {isPending ? "Add Pending Payment" : "Add Received Payment"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form with react-hook-form */}
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div className="p-6 space-y-4">
            {/* Row 1: If Received -> Income Type & Invoice ID; If Pending -> Income Type Full Width */}
            {isPending ? (
              /* Pending Mode: Full Width Income Type matching image */
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1.5">
                  Income Type
                </label>
                <div className="relative">
                  <select
                    {...register("incomeType", {
                      required: "Income type is required",
                    })}
                    className={`w-full h-11 px-3.5 pr-10 rounded-lg border bg-white text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer ${
                      errors.incomeType ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="Milestone Income">Milestone Income</option>
                    <option value="Advance Received">Advance Received</option>
                    <option value="Variation Order">Variation Order</option>
                    <option value="Claims & Adjustments">
                      Claims & Adjustments
                    </option>
                    <option value="Retention Release">Retention Release</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-700 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {errors.incomeType && (
                  <span className="text-[11px] text-red-500 mt-1 block">
                    {errors.incomeType.message}
                  </span>
                )}
              </div>
            ) : (
              /* Received Mode: 2 Columns (Income Type & Invoice ID) */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1.5">
                    Income Type
                  </label>
                  <div className="relative">
                    <select
                      {...register("incomeType", {
                        required: "Income type is required",
                      })}
                      className={`w-full h-11 px-3.5 pr-10 rounded-lg border bg-white text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer ${
                        errors.incomeType ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="Milestone Income">Milestone Income</option>
                      <option value="Advance Received">Advance Received</option>
                      <option value="Variation Order">Variation Order</option>
                      <option value="Claims & Adjustments">
                        Claims & Adjustments
                      </option>
                      <option value="Retention Release">
                        Retention Release
                      </option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-700 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {errors.incomeType && (
                    <span className="text-[11px] text-red-500 mt-1 block">
                      {errors.incomeType.message}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1.5">
                    Invoice ID
                  </label>
                  <input
                    type="text"
                    placeholder="INV-0018"
                    {...register("invoiceId", {
                      required: "Invoice ID is required",
                    })}
                    className={`w-full h-11 px-3.5 rounded-lg border bg-white text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                      errors.invoiceId ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.invoiceId && (
                    <span className="text-[11px] text-red-500 mt-1 block">
                      {errors.invoiceId.message}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Row 2: Description (Full Width) */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">
                Description
              </label>
              <input
                type="text"
                placeholder="Site Extra Work claim #12"
                {...register("description", {
                  required: "Description is required",
                })}
                className={`w-full h-11 px-3.5 rounded-lg border bg-white text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.description && (
                <span className="text-[11px] text-red-500 mt-1 block">
                  {errors.description.message}
                </span>
              )}
            </div>

            {/* Row 3: Amount & Date / Expected Due */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1.5">
                  Amount
                </label>
                <input
                  type="text"
                  placeholder="$5,000"
                  {...register("amount", {
                    required: "Amount is required",
                  })}
                  className={`w-full h-11 px-3.5 rounded-lg border bg-white text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                    errors.amount ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.amount && (
                  <span className="text-[11px] text-red-500 mt-1 block">
                    {errors.amount.message}
                  </span>
                )}
              </div>

              {/* Date / Expected Due */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1.5">
                  {isPending ? "Expected Due" : "Date"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="12 April 2026"
                    {...register("date", {
                      required: isPending
                        ? "Expected due date is required"
                        : "Date is required",
                    })}
                    className={`w-full h-11 px-3.5 pr-10 rounded-lg border bg-white text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                      errors.date ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  <CalendarIcon className="w-5 h-5 text-gray-900 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[1.75]" />
                </div>
                {errors.date && (
                  <span className="text-[11px] text-red-500 mt-1 block">
                    {errors.date.message}
                  </span>
                )}
              </div>
            </div>

            {/* Row 4: Status */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">
                Status
              </label>
              <div className="relative">
                <select
                  {...register("status", {
                    required: "Status is required",
                  })}
                  className={`w-full h-11 px-3.5 pr-10 rounded-lg border bg-white text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer ${
                    errors.status ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="Received">Received</option>
                  <option value="Pending">Pending</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-700 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {errors.status && (
                <span className="text-[11px] text-red-500 mt-1 block">
                  {errors.status.message}
                </span>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg bg-[#ECEEF1] hover:bg-gray-200 text-sm font-medium text-gray-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 rounded-lg bg-[#1E64EB] hover:bg-blue-700 text-sm font-medium text-white transition-colors shadow-xs cursor-pointer"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddIncomeModal;
