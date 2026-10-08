import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { ChevronDown, Calendar as CalendarIcon } from "lucide-react";

export interface AddProjectExpenseFormData {
  expenseType: string;
  invoiceId: string;
  description: string;
  amount: string;
  date: string;
  status: "Paid" | "Pending" | "Partially Paid" | string;
  vendorReference: string;
  // Aliases for backwards compatibility
  category?: string;
  vendorRef?: string;
  invoiceRef?: string;
  paymentStatus?: "Paid" | "Pending" | "Partially Paid" | string;
}

interface AddProjectExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (expense: AddProjectExpenseFormData) => void;
}

export const AddProjectExpenseModal: React.FC<AddProjectExpenseModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddProjectExpenseFormData>({
    defaultValues: {
      expenseType: "Material Cost",
      invoiceId: "INV-0018",
      description: "Site Extra Work claim #12",
      amount: "$5,000",
      date: "12 April 2026",
      status: "Paid",
      vendorReference: "Jindal steel pvt",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        expenseType: "Material Cost",
        invoiceId: "INV-0018",
        description: "Site Extra Work claim #12",
        amount: "$5,000",
        date: "12 April 2026",
        status: "Paid",
        vendorReference: "Jindal steel pvt",
      });
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const onFormSubmit = (data: AddProjectExpenseFormData) => {
    onAdd({
      ...data,
      category: data.expenseType,
      invoiceRef: data.invoiceId,
      vendorRef: data.vendorReference,
      paymentStatus: data.status,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 bg-white">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-none">
            Add Expense Transaction
          </h2>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div className="p-6 space-y-4">
            {/* Row 1: Expense Type & Invoice ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1.5">
                  Expense Type
                </label>
                <div className="relative">
                  <select
                    {...register("expenseType", {
                      required: "Expense Type is required",
                    })}
                    className="w-full h-11 px-3.5 pr-10 rounded-lg border border-gray-300 bg-white text-sm text-slate-900 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                  >
                    <option value="Material Cost">Material Cost</option>
                    <option value="Manpower Cost">Manpower Cost</option>
                    <option value="Freight & Logistics">Freight & Logistics</option>
                    <option value="Site / Project Expense">
                      Site / Project Expense
                    </option>
                    <option value="Equipment & Machinery">
                      Equipment & Machinery
                    </option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-800 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {errors.expenseType && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.expenseType.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1.5">
                  Invoice ID
                </label>
                <input
                  type="text"
                  placeholder="INV-0018"
                  {...register("invoiceId", {
                    required: "Invoice ID is required",
                  })}
                  className="w-full h-11 px-3.5 rounded-lg border border-gray-300 bg-white text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                />
                {errors.invoiceId && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.invoiceId.message}
                  </p>
                )}
              </div>
            </div>

            {/* Row 2: Description */}
            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1.5">
                Description
              </label>
              <input
                type="text"
                placeholder="Site Extra Work claim #12"
                {...register("description", {
                  required: "Description is required",
                })}
                className="w-full h-11 px-3.5 rounded-lg border border-gray-300 bg-white text-sm text-slate-900 focus:outline-none focus:border-blue-500"
              />
              {errors.description && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Row 3: Amount & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1.5">
                  Amount
                </label>
                <input
                  type="text"
                  placeholder="$5,000"
                  {...register("amount", {
                    required: "Amount is required",
                  })}
                  className="w-full h-11 px-3.5 rounded-lg border border-gray-300 bg-white text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                />
                {errors.amount && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.amount.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1.5">
                  Date
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="12 April 2026"
                    {...register("date", {
                      required: "Date is required",
                    })}
                    className="w-full h-11 px-3.5 pr-10 rounded-lg border border-gray-300 bg-white text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                  <CalendarIcon className="w-5 h-5 text-slate-900 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[1.75]" />
                </div>
                {errors.date && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.date.message}
                  </p>
                )}
              </div>
            </div>

            {/* Row 4: Status & Vendor/Reference */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1.5">
                  Status
                </label>
                <div className="relative">
                  <select
                    {...register("status")}
                    className="w-full h-11 px-3.5 pr-10 rounded-lg border border-gray-300 bg-white text-sm text-slate-900 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Partially Paid">Partially Paid</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-800 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1.5">
                  Vendor/Reference
                </label>
                <div className="relative">
                  <select
                    {...register("vendorReference")}
                    className="w-full h-11 px-3.5 pr-10 rounded-lg border border-gray-300 bg-white text-sm text-slate-900 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                  >
                    <option value="Jindal steel pvt">Jindal steel pvt</option>
                    <option value="Jindal Steel Pvt. Ltd.">
                      Jindal Steel Pvt. Ltd.
                    </option>
                    <option value="Shree Enterprises">Shree Enterprises</option>
                    <option value="Shiv Cargo Movers">Shiv Cargo Movers</option>
                    <option value="Patel Infra Services">
                      Patel Infra Services
                    </option>
                    <option value="Shakti Equipment's">
                      Shakti Equipment's
                    </option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-800 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-7 py-2.5 rounded-lg bg-[#EEEEEE] hover:bg-gray-200 text-sm font-medium text-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-9 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-sm font-semibold text-white transition-colors shadow-xs cursor-pointer"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProjectExpenseModal;
