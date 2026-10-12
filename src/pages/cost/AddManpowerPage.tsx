import React, { useState, useMemo, useRef, useEffect } from "react";
import { ArrowLeft, Calendar as CalendarIcon, ChevronDown, ChevronUp, Search } from "lucide-react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import SuccessModal from "@/components/common_components/SuccessModal";
import type { ManpowerCostEntry } from "@/components/cost/AddManpowerCostModal";
import { INITIAL_MANPOWER_DATA } from "@/components/cost/manpowerData";

interface EmployeeOption {
  id: string;
  empId: string;
  name: string;
  designation: string;
  ratePerHour: number;
}

const EMPLOYEES: EmployeeOption[] = [
  {
    id: "1",
    empId: "EMP-001",
    name: "John Doe",
    designation: "Labor",
    ratePerHour: 100,
  },
  {
    id: "2",
    empId: "EMP-002",
    name: "Linda Ray",
    designation: "Loading",
    ratePerHour: 120,
  },
  {
    id: "3",
    empId: "EMP-003",
    name: "Elliot Murray",
    designation: "Labor",
    ratePerHour: 120,
  },
  {
    id: "4",
    empId: "EMP-004",
    name: "Rebecca Smtih",
    designation: "Loading",
    ratePerHour: 120,
  },
  {
    id: "5",
    empId: "EMP-005",
    name: "Connie Waters",
    designation: "Labor",
    ratePerHour: 120,
  },
  {
    id: "6",
    empId: "EMP-006",
    name: "Lori Broaddus",
    designation: "Loading",
    ratePerHour: 120,
  },
  {
    id: "7",
    empId: "EMP-007",
    name: "Anthony Lewis",
    designation: "Labor",
    ratePerHour: 120,
  },
  {
    id: "8",
    empId: "EMP-008",
    name: "Brian Villalobos",
    designation: "Loading",
    ratePerHour: 120,
  },
  {
    id: "9",
    empId: "EMP-009",
    name: "Harvey Smith",
    designation: "Labor",
    ratePerHour: 120,
  },
  {
    id: "10",
    empId: "EMP-010",
    name: "Doglas Martini",
    designation: "Labor",
    ratePerHour: 120,
  },
];

const PROJECTS = [
  "ABC Logistic Warehouse",
  "SMDT Warehouse",
  "Steel Unit",
  "Industrial Shed",
  "Warehouse Expansion",
];

const DESIGNATIONS = [
  "Labor",
  "Loading",
  "Supervisor",
  "Operator",
  "Technician",
];

export const AddManpowerPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id?: string }>();

  // Determine if editing
  const stateEntry = (location.state as { entry?: ManpowerCostEntry } | undefined)?.entry;

  const targetEntry = useMemo(() => {
    if (stateEntry) return stateEntry;
    if (id) {
      try {
        const stored = localStorage.getItem("custom_manpower_entries");
        if (stored) {
          const parsed = JSON.parse(stored) as ManpowerCostEntry[];
          const found = parsed.find((p) => p.id === id);
          if (found) return found;
        }
      } catch {
        // ignore
      }
      return INITIAL_MANPOWER_DATA.find((p) => p.id === id);
    }
    return undefined;
  }, [stateEntry, id]);

  const isEditing = Boolean(targetEntry || id || location.pathname.includes("/edit"));

  const initialEmployee = useMemo(() => {
    if (targetEntry) {
      const match = EMPLOYEES.find(
        (emp) => emp.name.toLowerCase() === targetEntry.name.toLowerCase()
      );
      if (match) return match;
      return {
        id: targetEntry.id,
        empId: `EMP-${targetEntry.id.padStart(3, "0")}`,
        name: targetEntry.name,
        designation: targetEntry.designation,
        ratePerHour: targetEntry.ratePerHour,
      };
    }
    return EMPLOYEES[0];
  }, [targetEntry]);

  // Form states matching screenshot
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeOption>(initialEmployee);
  const [date, setDate] = useState(targetEntry?.date || "12 Aug 2026");
  const [designation, setDesignation] = useState(targetEntry?.designation || EMPLOYEES[0].designation);
  const [project, setProject] = useState(targetEntry?.project || PROJECTS[0]);
  const [workingHours, setWorkingHours] = useState(targetEntry ? String(targetEntry.hours) : "8");
  const [otOvers, setOtOvers] = useState(targetEntry ? String(targetEntry.otHours) : "2");
  const [ratePerHour, setRatePerHour] = useState(targetEntry ? String(targetEntry.ratePerHour) : "100");
  const [totalCost, setTotalCost] = useState(targetEntry ? String(targetEntry.totalCost) : "8");
  const [paymentStatus, setPaymentStatus] = useState<"Paid" | "Unpaid">(targetEntry?.status || "Paid");



  // Dropdowns state
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [isDesignationDropdownOpen, setIsDesignationDropdownOpen] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // Success Dialog state
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const employeeDropdownRef = useRef<HTMLDivElement>(null);
  const designationDropdownRef = useRef<HTMLDivElement>(null);
  const projectDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(target)) {
        setIsEmployeeDropdownOpen(false);
      }
      if (designationDropdownRef.current && !designationDropdownRef.current.contains(target)) {
        setIsDesignationDropdownOpen(false);
      }
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(target)) {
        setIsProjectDropdownOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(target)) {
        setIsStatusDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allEmployeeOptions = useMemo(() => {
    if (
      selectedEmployee &&
      !EMPLOYEES.some(
        (e) => e.name.toLowerCase() === selectedEmployee.name.toLowerCase()
      )
    ) {
      return [selectedEmployee, ...EMPLOYEES];
    }
    return EMPLOYEES;
  }, [selectedEmployee]);

  // Filtered employees for dropdown
  const filteredEmployees = useMemo(() => {
    if (!employeeSearch.trim()) return allEmployeeOptions;
    return allEmployeeOptions.filter((emp) =>
      emp.name.toLowerCase().includes(employeeSearch.toLowerCase())
    );
  }, [employeeSearch, allEmployeeOptions]);

  const handleSelectEmployee = (emp: EmployeeOption) => {
    setSelectedEmployee(emp);
    setDesignation(emp.designation);
    setRatePerHour(String(emp.ratePerHour));
    const h = parseFloat(workingHours) || 8;
    const ot = parseFloat(otOvers) || 0;
    setTotalCost(String((h + ot) * emp.ratePerHour));
    setIsEmployeeDropdownOpen(false);
    setEmployeeSearch("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const hours = parseFloat(workingHours) || 8;
    const ot = parseFloat(otOvers) || 0;
    const rate = parseFloat(ratePerHour) || 100;
    const cost = parseFloat(totalCost) || (hours + ot) * rate;

    const recordId = targetEntry?.id || id || String(Date.now());
    const savedRecord: ManpowerCostEntry = {
      id: recordId,
      date,
      name: selectedEmployee.name,
      designation,
      avatar:
        targetEntry?.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          selectedEmployee.name
        )}&background=1D51A4&color=fff&size=100`,
      project,
      hours,
      otHours: ot,
      ratePerHour: rate,
      totalCost: cost,
      status: paymentStatus,
    };

    try {
      const stored = localStorage.getItem("custom_manpower_entries");
      let list: ManpowerCostEntry[] = [];
      if (stored) {
        list = JSON.parse(stored) as ManpowerCostEntry[];
      }

      if (isEditing) {
        const idx = list.findIndex((item) => item.id === recordId);
        if (idx >= 0) {
          list[idx] = savedRecord;
        } else {
          // If editing an item not yet in custom_manpower_entries, combine with INITIAL_MANPOWER_DATA
          const customIds = new Set(list.map((p) => p.id));
          const remainder = INITIAL_MANPOWER_DATA.filter((item) => !customIds.has(item.id));
          const combined = [...list, ...remainder];
          const combinedIdx = combined.findIndex((item) => item.id === recordId);
          if (combinedIdx >= 0) {
            combined[combinedIdx] = savedRecord;
          } else {
            combined.unshift(savedRecord);
          }
          list = combined;
        }
      } else {
        list.unshift(savedRecord);
      }

      localStorage.setItem("custom_manpower_entries", JSON.stringify(list));
    } catch {
      // ignore
    }

    setIsSuccessModalOpen(true);
  };

  const handleSuccessClose = () => {
    setIsSuccessModalOpen(false);
    navigate("/cost/manpower-cost");
  };

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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Select Employee & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {/* Select Employee */}
            <div className="relative" ref={employeeDropdownRef}>
              <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2">
                Select Employee <span className="text-rose-500">*</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setIsEmployeeDropdownOpen(!isEmployeeDropdownOpen);
                  setIsDesignationDropdownOpen(false);
                  setIsProjectDropdownOpen(false);
                  setIsStatusDropdownOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 hover:border-slate-300 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                <span>{selectedEmployee.name}</span>
                {isEmployeeDropdownOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {/* Employee Popover Dropdown */}
              {isEmployeeDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-sm font-bold text-slate-900">
                      Select Employee
                    </span>
                    <ChevronUp
                      className="w-4 h-4 text-slate-500 cursor-pointer"
                      onClick={() => setIsEmployeeDropdownOpen(false)}
                    />
                  </div>

                  {/* Search inside Popover */}
                  <div className="relative my-3">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      autoFocus
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                      placeholder="Search"
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* List */}
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-50 py-1">
                    {filteredEmployees.map((emp) => (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => handleSelectEmployee(emp)}
                        className={`w-full py-2.5 px-3 text-center text-xs sm:text-sm font-semibold transition-colors cursor-pointer rounded-md ${
                          selectedEmployee.id === emp.id
                            ? "bg-slate-100 text-slate-900"
                            : "text-slate-800 hover:bg-slate-50"
                        }`}
                      >
                        {emp.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2">
                Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                />
                <CalendarIcon className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Row 2: Employee ID (Auto-Fill) & Designation (Auto-Fill) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {/* Employee ID */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2">
                Employee ID (Auto-Fill) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                readOnly
                value={selectedEmployee.empId}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/70 text-xs sm:text-sm font-medium text-slate-700 cursor-not-allowed focus:outline-none"
              />
            </div>

            {/* Designation */}
            <div className="relative" ref={designationDropdownRef}>
              <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2">
                Designation (Auto-Fill) <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsDesignationDropdownOpen(!isDesignationDropdownOpen);
                  setIsEmployeeDropdownOpen(false);
                  setIsProjectDropdownOpen(false);
                  setIsStatusDropdownOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 hover:border-slate-300 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                <span>{designation}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {isDesignationDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-slate-200 p-2 z-50">
                  {DESIGNATIONS.map((des) => (
                    <button
                      key={des}
                      type="button"
                      onClick={() => {
                        setDesignation(des);
                        setIsDesignationDropdownOpen(false);
                      }}
                      className={`w-full py-2 px-3 text-left text-xs sm:text-sm rounded-md transition-colors cursor-pointer ${
                        designation === des
                          ? "bg-slate-100 font-semibold text-slate-900"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {des}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Row 3: Project */}
          <div className="relative" ref={projectDropdownRef}>
            <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2">
              Project
            </label>
            <button
              type="button"
              onClick={() => {
                setIsProjectDropdownOpen(!isProjectDropdownOpen);
                setIsEmployeeDropdownOpen(false);
                setIsDesignationDropdownOpen(false);
                setIsStatusDropdownOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 hover:border-slate-300 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
            >
              <span>{project}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {isProjectDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-slate-200 p-2 z-50">
                {PROJECTS.map((proj) => (
                  <button
                    key={proj}
                    type="button"
                    onClick={() => {
                      setProject(proj);
                      setIsProjectDropdownOpen(false);
                    }}
                    className={`w-full py-2.5 px-3 text-left text-xs sm:text-sm rounded-md transition-colors cursor-pointer ${
                      project === proj
                        ? "bg-slate-100 font-semibold text-slate-900"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {proj}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Row 4: Working Hours, OT Overs, Rate per hour */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {/* Working Hours */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2">
                Working Hours <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* OT Overs (matching screenshot spelling) */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2">
                OT Overs <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={otOvers}
                onChange={(e) => setOtOvers(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Rate per hour */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2">
                Rate per hour <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs sm:text-sm font-medium text-slate-700">
                  $
                </span>
                <input
                  type="text"
                  required
                  value={ratePerHour}
                  onChange={(e) => setRatePerHour(e.target.value)}
                  className="w-full pl-7 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Row 5: Total Cost & Payment Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {/* Total Cost */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2">
                Total Cost <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={totalCost}
                onChange={(e) => setTotalCost(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Payment Status */}
            <div className="relative" ref={statusDropdownRef}>
              <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2">
                Payment Status <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsStatusDropdownOpen(!isStatusDropdownOpen);
                  setIsEmployeeDropdownOpen(false);
                  setIsDesignationDropdownOpen(false);
                  setIsProjectDropdownOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 hover:border-slate-300 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                <span>{paymentStatus}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {isStatusDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-slate-200 p-2 z-50">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentStatus("Paid");
                      setIsStatusDropdownOpen(false);
                    }}
                    className={`w-full py-2 px-3 text-left text-xs sm:text-sm rounded-md transition-colors cursor-pointer ${
                      paymentStatus === "Paid"
                        ? "bg-slate-100 font-semibold text-slate-900"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Paid
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentStatus("Unpaid");
                      setIsStatusDropdownOpen(false);
                    }}
                    className={`w-full py-2 px-3 text-left text-xs sm:text-sm rounded-md transition-colors cursor-pointer ${
                      paymentStatus === "Unpaid"
                        ? "bg-slate-100 font-semibold text-slate-900"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Unpaid
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Buttons: Cancel & Submit */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => navigate("/cost/manpower-cost")}
              className="px-5 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer bg-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              {isEditing ? "Update" : "Submit"}
            </button>
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
