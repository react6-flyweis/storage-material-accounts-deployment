import React, { useMemo } from "react";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
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
import type { ManpowerCostEntry } from "@/components/cost/AddManpowerCostModal";
import { getApiErrorMessage } from "@/redux/utils/apiError";
import {
  useGetCostFiltersQuery,
  useCreateManpowerRecordMutation,
  useUpdateManpowerRecordMutation,
  useGetManpowerRecordsQuery,
} from "@/redux/api/costsApi";

interface EmployeeOption {
  id: string;
  empId: string;
  name: string;
  designation: string;
}

interface ExtendedManpowerEntry extends Omit<Partial<ManpowerCostEntry>, "status"> {
  _id?: string;
  employeeName?: string;
  employeeUserId?: string;
  employeeId?: string;
  workingHours?: number;
  hourlyRate?: number;
  paymentStatus?: string;
  status?: string;
  rawDate?: string;
  projectId?: string;
}

interface ManpowerFormValues {
  employeeId: string;
  date: string;
  designation: string;
  project: string;
  workingHours: number | "";
  otHours: number | "";
  ratePerHour: number | "";
  totalCost: number | "";
  paymentStatus: "paid" | "pending" | "";
}

export const AddManpowerPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id?: string }>();

  const { data: filtersData } = useGetCostFiltersQuery();
  const [createManpowerApi, { isLoading: isCreating }] = useCreateManpowerRecordMutation();
  const [updateManpowerApi, { isLoading: isUpdating }] = useUpdateManpowerRecordMutation();

  const employeeOptions = useMemo<EmployeeOption[]>(() => {
    if (!filtersData?.employees) return [];
    return filtersData.employees
      .map((emp, index) => {
        const id = String(emp._id || emp.empId || index + 1);
        const name = (emp.name || (emp as { employeeName?: string }).employeeName || "").trim();
        return {
          id: id.trim(),
          empId: emp.empId || `EMP-${String(index + 1).padStart(3, "0")}`,
          name,
          designation: emp.designation || "",
        };
      })
      .filter((emp) => Boolean(emp.id && emp.name));
  }, [filtersData]);

  const projectOptions = useMemo<string[]>(() => {
    if (!filtersData?.projects) return [];
    const list = filtersData.projects
      .map((p) => (typeof p.projectName === "string" ? p.projectName.trim() : ""))
      .filter((p): p is string => Boolean(p));
    return Array.from(new Set(list));
  }, [filtersData]);

  const designationOptions = useMemo<string[]>(() => {
    if (!filtersData?.designations) return [];
    const list = filtersData.designations
      .map((d) => (typeof d === "string" ? d.trim() : ""))
      .filter((d): d is string => Boolean(d));
    return Array.from(new Set(list));
  }, [filtersData]);

  // Determine if editing
  const stateEntry = (location.state as { entry?: ExtendedManpowerEntry } | undefined)?.entry;

  const { data: recordsData } = useGetManpowerRecordsQuery(undefined, {
    skip: !id || Boolean(stateEntry),
  });

  const targetEntry = useMemo<ExtendedManpowerEntry | undefined>(() => {
    if (stateEntry) return stateEntry;
    if (id && recordsData?.rows) {
      const found = recordsData.rows.find((r) => (r.id || r._id) === id);
      if (found) {
        const isPaid =
          (typeof found.paymentStatus === "string" && found.paymentStatus.toLowerCase() === "paid") ||
          (typeof found.status === "string" && found.status.toLowerCase() === "paid");
        const empName =
          found.employee?.name ||
          found.employeeName ||
          (found as { name?: string }).name ||
          "";
        const designation =
          found.employee?.designation ||
          found.designation ||
          "";
        const empUserId =
          found.employee?.userId ||
          found.employeeUserId ||
          found.employeeId ||
          "";
        const projectName =
          found.project ||
          found.projectName ||
          "";
        const hours = found.hours ?? found.workingHours ?? 0;
        const otHours = found.otHours || 0;
        const ratePerHour = found.ratePerHour || 0;
        const totalCost = found.totalCost || (hours + otHours) * ratePerHour;
        return {
          id: found.id || found._id || id,
          name: empName,
          employeeName: empName,
          designation,
          project: projectName,
          projectId: found.leadId || undefined,
          date: found.date,
          workingHours: hours,
          hours,
          otHours,
          hourlyRate: ratePerHour,
          ratePerHour,
          totalCost,
          status: (isPaid ? "Paid" : "Pending") as "Paid" | "Pending",
          paymentStatus: (isPaid ? "Paid" : "Pending") as "Paid" | "Pending",
          employeeUserId: empUserId,
          employeeId: empUserId,
          avatar: "",
        };
      }
    }
    return undefined;
  }, [stateEntry, id, recordsData]);

  const isEditing = Boolean(targetEntry || id || location.pathname.includes("/edit"));

  const initialEmployee = useMemo(() => {
    if (targetEntry) {
      const targetName = (targetEntry.name || targetEntry.employeeName || "").trim().toLowerCase();
      const targetUserId = String(targetEntry.employeeUserId || targetEntry.employeeId || "");
      const targetId = String(targetEntry.id || "");

      const match = employeeOptions.find((emp) => {
        const empName = (emp.name || "").trim().toLowerCase();
        const nameMatches = Boolean(empName && targetName && empName === targetName);
        const userIdMatches = Boolean(
          emp.id && targetUserId && (emp.id === targetUserId || emp.empId === targetUserId)
        );
        const idMatches = Boolean(
          emp.id && targetId && (emp.id === targetId || emp.empId === targetId)
        );
        return nameMatches || userIdMatches || idMatches;
      });

      if (match) return match;

      return {
        id: targetUserId || targetId || "1",
        empId: targetUserId && !isNaN(Number(targetUserId))
          ? `EMP-${targetUserId.padStart(3, "0")}`
          : targetUserId || "EMP-001",
        name: targetEntry.name || targetEntry.employeeName || "",
        designation: targetEntry.designation || "",
      };
    }
    return null;
  }, [targetEntry, employeeOptions]);

  const initialDate = targetEntry?.rawDate || targetEntry?.date || "";
  const initialWorkingHours = targetEntry?.workingHours ?? targetEntry?.hours ?? "";
  const initialOtHours = targetEntry?.otHours ?? "";
  const initialRatePerHour = targetEntry?.hourlyRate ?? targetEntry?.ratePerHour ?? "";
  const initialTotalCost = targetEntry?.totalCost ?? "";
  const statusStr = (targetEntry?.status || targetEntry?.paymentStatus || "").toLowerCase();
  const initialStatus = (statusStr === "paid" ? "paid" : statusStr === "pending" ? "pending" : "") as "paid" | "pending" | "";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<ManpowerFormValues>({
    defaultValues: {
      employeeId: initialEmployee?.id || "",
      date: initialDate,
      designation: targetEntry?.designation || initialEmployee?.designation || "",
      project: targetEntry?.project || "",
      workingHours: initialWorkingHours,
      otHours: initialOtHours,
      ratePerHour: initialRatePerHour,
      totalCost: initialTotalCost,
      paymentStatus: initialStatus,
    },
  });

  const selectedEmployeeId = watch("employeeId");
  const selectedDesignation = watch("designation");
  const selectedProject = watch("project");
  const selectedPaymentStatus = watch("paymentStatus");

  React.useEffect(() => {
    if (initialEmployee?.id) {
      setValue("employeeId", initialEmployee.id);
    }
    if (targetEntry) {
      if (targetEntry.designation || initialEmployee?.designation) {
        setValue("designation", targetEntry.designation || initialEmployee?.designation || "");
      }
      if (targetEntry.project) {
        setValue("project", targetEntry.project);
      }
      const dateVal = targetEntry.rawDate || targetEntry.date;
      if (dateVal) {
        setValue("date", dateVal);
      }
      const hours = targetEntry.workingHours ?? targetEntry.hours;
      if (hours !== undefined && hours !== null && (hours as unknown) !== "") {
        setValue("workingHours", hours);
      }
      const ot = targetEntry.otHours;
      if (ot !== undefined && ot !== null && (ot as unknown) !== "") {
        setValue("otHours", ot);
      }
      const rate = targetEntry.hourlyRate ?? targetEntry.ratePerHour;
      if (rate !== undefined && rate !== null && (rate as unknown) !== "") {
        setValue("ratePerHour", rate);
      }
      const total = targetEntry.totalCost;
      if (total !== undefined && total !== null && (total as unknown) !== "") {
        setValue("totalCost", total);
      }
      const statusRaw = (targetEntry.status || targetEntry.paymentStatus || "").toLowerCase();
      const statusVal = statusRaw === "paid" ? "paid" : statusRaw === "pending" ? "pending" : "";
      if (statusVal) {
        setValue("paymentStatus", statusVal);
      }
    }
  }, [targetEntry, initialEmployee, setValue]);

  const selectedEmployee = useMemo(() => {
    if (!selectedEmployeeId) return initialEmployee;
    return employeeOptions.find((emp) => emp.id === selectedEmployeeId) || initialEmployee;
  }, [employeeOptions, selectedEmployeeId, initialEmployee]);

  // Success Dialog state
  const [isSuccessModalOpen, setIsSuccessModalOpen] = React.useState(false);

  const recalculateTotal = (hours: number, ot: number, rate: number) => {
    if (!hours && !ot && !rate) return;
    const total = (hours + ot) * rate;
    setValue("totalCost", total, { shouldValidate: true });
  };

  const onSubmit = async (values: ManpowerFormValues) => {
    clearErrors("root");
    if (!selectedEmployee) {
      setError("employeeId", { message: "Please select an employee" });
      return;
    }
    if (!values.date) {
      setError("date", { message: "Please select a date" });
      return;
    }
    if (!values.designation) {
      setError("designation", { message: "Please select a designation" });
      return;
    }
    if (!values.paymentStatus) {
      setError("paymentStatus", { message: "Please select a payment status" });
      return;
    }

    const hours = Number(values.workingHours) || 0;
    const ot = Number(values.otHours) || 0;
    const rate = Number(values.ratePerHour) || 0;
    const cost = Number(values.totalCost) || (hours + ot) * rate;

    const recordId = targetEntry?.id || id || String(Date.now());
    const selectedProjectObj = filtersData?.projects?.find(
      (p) =>
        p.projectName &&
        values.project &&
        p.projectName.toLowerCase() === values.project.toLowerCase()
    );

    const apiPayload = {
      date: values.date,
      leadId: selectedProjectObj?._id || null,
      projectName: values.project || selectedProjectObj?.projectName || "",
      project: values.project || selectedProjectObj?.projectName || "",
      employeeName: selectedEmployee.name,
      employeeUserId: selectedEmployee.id,
      employee: {
        userId: selectedEmployee.id,
        name: selectedEmployee.name,
        designation: values.designation,
      },
      designation: values.designation,
      workingHours: hours,
      hours: hours,
      otHours: ot,
      ratePerHour: rate,
      totalCost: cost,
      paymentStatus: values.paymentStatus === "paid" ? "Paid" : "Pending",
      status: values.paymentStatus === "paid" ? "Paid" : "Unpaid",
    };

    try {
      if (isEditing) {
        await updateManpowerApi({ id: recordId, ...apiPayload }).unwrap();
      } else {
        await createManpowerApi(apiPayload).unwrap();
      }
      setIsSuccessModalOpen(true);
    } catch (err) {
      const errorMsg = getApiErrorMessage(err, "Failed to save manpower cost record. Please try again.");
      setError("root", { message: errorMsg });
    }
  };

  const handleSuccessClose = () => {
    setIsSuccessModalOpen(false);
    navigate("/cost/manpower-cost");
  };

  const isPending = isSubmitting || isCreating || isUpdating;

  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-6 bg-[#EEF2FB] min-h-full">
      {/* Top Header with Back Button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/cost/manpower-cost")}
          className="flex items-center gap-2.5 text-slate-800 hover:text-slate-950 font-bold text-lg sm:text-xl transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700 group-hover:-translate-x-0.5 transition-transform" />
          <span>Manpower Cost</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 sm:p-8 max-w-5xl">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-6">
          {isEditing ? "Edit Manpower Cost" : "Basic Details"}
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

          {/* Row 1: Select Employee & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-semibold text-slate-900">
                Select Employee <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={selectedEmployeeId}
                onValueChange={(val) => {
                  setValue("employeeId", val, { shouldValidate: true });
                  const found = employeeOptions.find((e) => e.id === val);
                  if (found?.designation) {
                    setValue("designation", found.designation, { shouldValidate: true });
                  }
                  clearErrors("employeeId");
                  clearErrors("root");
                }}
              >
                <SelectTrigger className="w-full bg-white border-slate-200 h-10">
                  <SelectValue placeholder="Select Employee" />
                </SelectTrigger>
                <SelectContent>
                  {employeeOptions.length === 0 ? (
                    <div className="p-2 text-xs text-slate-400">No employees found</div>
                  ) : (
                    employeeOptions
                      .filter((emp) => Boolean(emp.id && emp.id.trim()))
                      .map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name} {emp.designation ? `(${emp.designation})` : ""}
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
              {errors.employeeId && (
                <p className="text-xs text-rose-500">{errors.employeeId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-semibold text-slate-900">
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
                Designation <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={selectedDesignation}
                onValueChange={(val) => {
                  setValue("designation", val, { shouldValidate: true });
                  clearErrors("designation");
                  clearErrors("root");
                }}
              >
                <SelectTrigger className="w-full bg-white border-slate-200 h-10">
                  <SelectValue placeholder="Select Designation" />
                </SelectTrigger>
                <SelectContent>
                  {designationOptions.length === 0 ? (
                    <div className="p-2 text-xs text-slate-400">No designations found</div>
                  ) : (
                    designationOptions
                      .filter((des) => Boolean(des && des.trim()))
                      .map((des) => (
                        <SelectItem key={des} value={des}>
                          {des}
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
              {errors.designation && (
                <p className="text-xs text-rose-500">{errors.designation.message}</p>
              )}
            </div>
          </div>

          {/* Row 3: Project */}
          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-semibold text-slate-900">
              Project
            </Label>
            <Select
              value={selectedProject}
              onValueChange={(val) => {
                setValue("project", val, { shouldValidate: true });
                clearErrors("root");
              }}
            >
              <SelectTrigger className="w-full bg-white border-slate-200 h-10">
                <SelectValue placeholder="Select Project (Optional)" />
              </SelectTrigger>
              <SelectContent>
                {projectOptions.length === 0 ? (
                  <div className="p-2 text-xs text-slate-400">No projects available</div>
                ) : (
                  projectOptions
                    .filter((proj) => Boolean(proj && proj.trim()))
                    .map((proj) => (
                      <SelectItem key={proj} value={proj}>
                        {proj}
                      </SelectItem>
                    ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Row 4: Working Hours, OT Overs, Rate per hour */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-semibold text-slate-900">
                Working Hours <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="number"
                min="0"
                step="any"
                placeholder="0"
                {...register("workingHours", {
                  required: "Working hours are required",
                  valueAsNumber: true,
                  min: { value: 0, message: "Hours must be >= 0" },
                  onChange: (e) => {
                    const h = parseFloat(e.target.value) || 0;
                    const ot = Number(watch("otHours")) || 0;
                    const rate = Number(watch("ratePerHour")) || 0;
                    recalculateTotal(h, ot, rate);
                    clearErrors("root");
                  },
                })}
                className="bg-white border-slate-200 h-10"
              />
              {errors.workingHours && (
                <p className="text-xs text-rose-500">{errors.workingHours.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-semibold text-slate-900">
                OT Overs
              </Label>
              <Input
                type="number"
                min="0"
                step="any"
                placeholder="0"
                {...register("otHours", {
                  valueAsNumber: true,
                  min: { value: 0, message: "OT hours must be >= 0" },
                  onChange: (e) => {
                    const ot = parseFloat(e.target.value) || 0;
                    const h = Number(watch("workingHours")) || 0;
                    const rate = Number(watch("ratePerHour")) || 0;
                    recalculateTotal(h, ot, rate);
                    clearErrors("root");
                  },
                })}
                className="bg-white border-slate-200 h-10"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-semibold text-slate-900">
                Rate per hour <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="number"
                step="any"
                placeholder="0.00"
                {...register("ratePerHour", {
                  required: "Rate per hour is required",
                  valueAsNumber: true,
                  min: { value: 0, message: "Rate must be >= 0" },
                  onChange: (e) => {
                    const rate = parseFloat(e.target.value) || 0;
                    const h = Number(watch("workingHours")) || 0;
                    const ot = Number(watch("otHours")) || 0;
                    recalculateTotal(h, ot, rate);
                    clearErrors("root");
                  },
                })}
                className="bg-white border-slate-200 h-10"
              />
              {errors.ratePerHour && (
                <p className="text-xs text-rose-500">{errors.ratePerHour.message}</p>
              )}
            </div>
          </div>

          {/* Row 5: Total Cost & Payment Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-semibold text-slate-900">
                Total Cost <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="number"
                step="any"
                placeholder="0.00"
                {...register("totalCost", {
                  required: "Total cost is required",
                  valueAsNumber: true,
                  min: { value: 0, message: "Total cost must be >= 0" },
                  onChange: () => clearErrors("root"),
                })}
                className="bg-white border-slate-200 h-10"
              />
              {errors.totalCost && (
                <p className="text-xs text-rose-500">{errors.totalCost.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-semibold text-slate-900">
                Payment Status <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={selectedPaymentStatus}
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

          {/* Bottom Buttons: Cancel & Submit */}
          <div className="flex items-center justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/cost/manpower-cost")}
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
                  <span>{isEditing ? "Updating..." : "Submitting..."}</span>
                </>
              ) : (
                <span>{isEditing ? "Update" : "Submit"}</span>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleSuccessClose}
        title={isEditing ? "Manpower Cost Updated" : "Manpower Cost Added"}
        subTitle={
          isEditing
            ? "The manpower cost record has been updated successfully."
            : "The manpower cost record has been added successfully."
        }
      />
    </div>
  );
};

export default AddManpowerPage;
