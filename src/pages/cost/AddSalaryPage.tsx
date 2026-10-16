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
import { getApiErrorMessage } from "@/redux/utils/apiError";
import {
  useGetCostFiltersQuery,
  useCreateSalaryRecordMutation,
} from "@/redux/api/costsApi";

interface EmployeeOption {
  id: string;
  empId: string;
  name: string;
  designation: string;
}

interface SalaryFormValues {
  employeeId: string;
  date: string;
  basicSalary: number | "";
  deduction: number | "";
  paymentStatus: "paid" | "pending" | "";
}

export const AddSalaryPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: filtersData } = useGetCostFiltersQuery();
  const [createSalaryRecord, { isLoading: isMutationLoading }] =
    useCreateSalaryRecordMutation();

  const employeeOptions = useMemo<EmployeeOption[]>(() => {
    if (!filtersData?.employees) return [];
    return filtersData.employees
      .map((emp, index) => {
        const id = String(emp._id || emp.empId || index + 1).trim();
        const name = (emp.name || (emp as { employeeName?: string }).employeeName || "").trim();
        return {
          id,
          empId: emp.empId || `EMP-${String(index + 1).padStart(3, "0")}`,
          name,
          designation: emp.designation || "",
        };
      })
      .filter((emp) => Boolean(emp.id && emp.name));
  }, [filtersData]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<SalaryFormValues>({
    defaultValues: {
      employeeId: "",
      date: "",
      basicSalary: "",
      deduction: "",
      paymentStatus: "",
    },
  });

  const selectedEmployeeId = watch("employeeId");
  const basicSalaryVal = watch("basicSalary");
  const deductionVal = watch("deduction");
  const paymentStatus = watch("paymentStatus");

  // Selected employee resolved from options
  const selectedEmployee = useMemo(() => {
    if (!selectedEmployeeId) return null;
    return employeeOptions.find((emp) => emp.id === selectedEmployeeId) || null;
  }, [employeeOptions, selectedEmployeeId]);

  // Calculate Net Salary
  const netSalary = useMemo(() => {
    const basic = Number(basicSalaryVal) || 0;
    const ded = Number(deductionVal) || 0;
    return Math.max(0, basic - ded);
  }, [basicSalaryVal, deductionVal]);

  const onSubmit = async (values: SalaryFormValues) => {
    clearErrors("root");
    if (!selectedEmployee) {
      setError("employeeId", { message: "Please select an employee" });
      return;
    }
    if (!values.date) {
      setError("date", { message: "Please select a date" });
      return;
    }
    if (!values.paymentStatus) {
      setError("paymentStatus", { message: "Please select a payment status" });
      return;
    }

    const basic = Number(values.basicSalary) || 0;
    const ded = Number(values.deduction) || 0;
    const net = Math.max(0, basic - ded);

    const payload = {
      empId: selectedEmployee.empId,
      employeeId: selectedEmployee.empId,
      employeeUserId: selectedEmployee.id,
      employeeName: selectedEmployee.name,
      designation: selectedEmployee.designation,
      date: values.date,
      basicSalary: basic,
      deductions: ded,
      netSalary: net,
      paymentStatus: values.paymentStatus,
    };

    try {
      await createSalaryRecord(payload).unwrap();
      navigate("/cost/salary-cost");
    } catch (err) {
      const errorMsg = getApiErrorMessage(
        err,
        "Failed to create salary record. Please try again.",
      );
      setError("root", { message: errorMsg });
    }
  };

  const isPending = isSubmitting || isMutationLoading;

  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-6 bg-[#EEF2FB] min-h-full">
      {/* Top Header with Back Button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/cost/salary-cost")}
          className="flex items-center gap-2.5 text-slate-800 hover:text-slate-950 font-bold text-lg sm:text-xl transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700 group-hover:-translate-x-0.5 transition-transform" />
          <span>Salary</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 sm:p-8 max-w-5xl">
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
                <p className="text-rose-700 leading-relaxed">
                  {errors.root.message}
                </p>
              </div>
            </div>
          )}

          {/* Row 1: Select Employee & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {/* Select Employee */}
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-semibold text-slate-900">
                Select Employee <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={selectedEmployeeId}
                onValueChange={(val) => {
                  setValue("employeeId", val, { shouldValidate: true });
                }}
              >
                <SelectTrigger className="w-full bg-white border-slate-200 h-10">
                  <SelectValue placeholder="Select Employee" />
                </SelectTrigger>
                <SelectContent>
                  {employeeOptions.length === 0 ? (
                    <div className="p-2 text-xs text-slate-400">
                      No employees found
                    </div>
                  ) : (
                    employeeOptions
                      .filter((emp) => Boolean(emp.id && emp.id.trim()))
                      .map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name}{" "}
                          {emp.designation ? `(${emp.designation})` : ""}
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
              {errors.employeeId && (
                <p className="text-xs text-rose-500">
                  {errors.employeeId.message}
                </p>
              )}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-semibold text-slate-900">
                Date <span className="text-rose-500">*</span>
              </Label>
              <DatePicker
                value={watch("date")}
                onChange={(val) => {
                  setValue("date", val, { shouldValidate: true });
                }}
                placeholder="Select Date"
              />
              {errors.date && (
                <p className="text-xs text-rose-500">{errors.date.message}</p>
              )}
            </div>
          </div>

          {/* Row 2: Employee ID (Auto-Fill) & Designation (Auto-Fill) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-semibold text-slate-900">
                Employee ID (Auto-Fill)
              </Label>
              <Input
                type="text"
                readOnly
                value={selectedEmployee?.empId || ""}
                placeholder="Auto-filled on employee select"
                className="bg-slate-50 border-slate-200 text-slate-700 cursor-not-allowed h-10"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-semibold text-slate-900">
                Designation (Auto-Fill)
              </Label>
              <Input
                type="text"
                readOnly
                value={selectedEmployee?.designation || ""}
                placeholder="Auto-filled on employee select"
                className="bg-slate-50 border-slate-200 text-slate-700 cursor-not-allowed h-10"
              />
            </div>
          </div>

          {/* Row 3: Basic Salary & Deduction */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-semibold text-slate-900">
                Basic Salary <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="number"
                step="any"
                placeholder="0.00"
                {...register("basicSalary", {
                  required: "Basic salary is required",
                  valueAsNumber: true,
                  min: { value: 0, message: "Salary must be non-negative" },
                  onChange: () => clearErrors("root"),
                })}
                className="bg-white border-slate-200 h-10"
              />
              {errors.basicSalary && (
                <p className="text-xs text-rose-500">
                  {errors.basicSalary.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-semibold text-slate-900">
                Deduction <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="number"
                step="any"
                placeholder="0.00"
                {...register("deduction", {
                  required: "Deduction is required",
                  valueAsNumber: true,
                  min: { value: 0, message: "Deduction must be non-negative" },
                  onChange: () => clearErrors("root"),
                })}
                className="bg-white border-slate-200 h-10"
              />
              {errors.deduction && (
                <p className="text-xs text-rose-500">
                  {errors.deduction.message}
                </p>
              )}
            </div>
          </div>

          {/* Row 4: Net Salary & Payment Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-semibold text-slate-900">
                Net Salary
              </Label>
              <Input
                type="text"
                readOnly
                value={
                  basicSalaryVal !== "" ? `$${netSalary.toLocaleString()}` : ""
                }
                placeholder="$0.00"
                className="bg-slate-50 border-slate-200 text-slate-700 cursor-not-allowed h-10"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-semibold text-slate-900">
                Payment Status <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={paymentStatus}
                onValueChange={(val) => {
                  setValue("paymentStatus", val as "paid" | "pending", {
                    shouldValidate: true,
                  });
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
                <p className="text-xs text-rose-500">
                  {errors.paymentStatus.message}
                </p>
              )}
            </div>
          </div>

          {/* Bottom Buttons: Cancel & Submit */}
          <div className="flex items-center justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/cost/salary-cost")}
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
                <span>Submit</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSalaryPage;
