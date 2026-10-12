import React, { useState, useMemo, useRef, useEffect } from "react";
import { ArrowLeft, Calendar as CalendarIcon, ChevronDown, ChevronUp, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EmployeeOption {
  id: string;
  empId: string;
  name: string;
  designation: string;
  basicSalary: number;
  deduction: number;
}

const EMPLOYEES: EmployeeOption[] = [
  {
    id: "1",
    empId: "EMP-001",
    name: "John Doe",
    designation: "Production",
    basicSalary: 40000,
    deduction: 1000,
  },
  {
    id: "2",
    empId: "EMP-002",
    name: "Anthony Lewis",
    designation: "Finance",
    basicSalary: 40000,
    deduction: 1000,
  },
  {
    id: "3",
    empId: "EMP-003",
    name: "Brian Villalobos",
    designation: "Production",
    basicSalary: 35000,
    deduction: 1000,
  },
  {
    id: "4",
    empId: "EMP-004",
    name: "Harvey Smith",
    designation: "Production",
    basicSalary: 20000,
    deduction: 1000,
  },
  {
    id: "5",
    empId: "EMP-005",
    name: "Stephan Peralt",
    designation: "Executive Officer",
    basicSalary: 22000,
    deduction: 1000,
  },
  {
    id: "6",
    empId: "EMP-006",
    name: "Doglas Martini",
    designation: "Manager",
    basicSalary: 25000,
    deduction: 1000,
  },
  {
    id: "7",
    empId: "EMP-007",
    name: "Linda Ray",
    designation: "Finance",
    basicSalary: 30000,
    deduction: 1000,
  },
  {
    id: "8",
    empId: "EMP-008",
    name: "Elliot Murray",
    designation: "Production",
    basicSalary: 35000,
    deduction: 1000,
  },
  {
    id: "9",
    empId: "EMP-009",
    name: "Rebecca Smtih",
    designation: "Executive",
    basicSalary: 45000,
    deduction: 1000,
  },
  {
    id: "10",
    empId: "EMP-010",
    name: "Connie Waters",
    designation: "Production",
    basicSalary: 50000,
    deduction: 1000,
  },
];

export const AddSalaryPage: React.FC = () => {
  const navigate = useNavigate();

  // State matching screenshot
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeOption>(EMPLOYEES[0]);
  const [date, setDate] = useState("12 Aug 2026");
  const [basicSalary, setBasicSalary] = useState("40000");
  const [deduction, setDeduction] = useState("1000");
  const [paymentStatus, setPaymentStatus] = useState<"Paid" | "Unpaid">("Paid");

  // Dropdown menus state
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const employeeDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        employeeDropdownRef.current &&
        !employeeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsEmployeeDropdownOpen(false);
      }
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setIsStatusDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered employees for dropdown
  const filteredEmployees = useMemo(() => {
    if (!employeeSearch.trim()) return EMPLOYEES;
    return EMPLOYEES.filter((emp) =>
      emp.name.toLowerCase().includes(employeeSearch.toLowerCase())
    );
  }, [employeeSearch]);

  // Handle employee selection
  const handleSelectEmployee = (emp: EmployeeOption) => {
    setSelectedEmployee(emp);
    setBasicSalary(String(emp.basicSalary));
    setDeduction(String(emp.deduction));
    setIsEmployeeDropdownOpen(false);
    setEmployeeSearch("");
  };

  // Calculate Net Salary
  const netSalary = useMemo(() => {
    const basic = parseFloat(basicSalary) || 0;
    const ded = parseFloat(deduction) || 0;
    return Math.max(0, basic - ded);
  }, [basicSalary, deduction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real flow, persist to API / state / localStorage
    const savedEntry = {
      empId: selectedEmployee.empId,
      name: selectedEmployee.name,
      designation: selectedEmployee.designation,
      date,
      basicSalary: parseFloat(basicSalary) || 0,
      deduction: parseFloat(deduction) || 0,
      netSalary,
      paymentStatus,
    };

    // Store in localStorage for persistence across pages
    try {
      const existing = JSON.parse(localStorage.getItem("custom_salary_entries") || "[]");
      existing.unshift(savedEntry);
      localStorage.setItem("custom_salary_entries", JSON.stringify(existing));
    } catch {
      // ignore
    }

    navigate("/cost/salary-cost");
  };

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

              {/* Employee Custom Dropdown Popover matching Image 2 */}
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

                  {/* Search Bar inside Popover */}
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

                  {/* Employee Items */}
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
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2">
                Designation (Auto-Fill) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                readOnly
                value={selectedEmployee.designation}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/70 text-xs sm:text-sm font-medium text-slate-700 cursor-not-allowed focus:outline-none"
              />
            </div>
          </div>

          {/* Row 3: Basic Salary & Deduction */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {/* Basic Salary */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2">
                Basic Salary <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs sm:text-sm font-medium text-slate-700">
                  $
                </span>
                <input
                  type="number"
                  required
                  value={basicSalary}
                  onChange={(e) => setBasicSalary(e.target.value)}
                  className="w-full pl-7 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Deduction */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2">
                Deduction <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs sm:text-sm font-medium text-slate-700">
                  $
                </span>
                <input
                  type="number"
                  required
                  value={deduction}
                  onChange={(e) => setDeduction(e.target.value)}
                  className="w-full pl-7 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Row 4: Net Salary & Payment Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {/* Net Salary */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2">
                Net Salary <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs sm:text-sm font-medium text-slate-700">
                  $
                </span>
                <input
                  type="text"
                  readOnly
                  value={netSalary}
                  className="w-full pl-7 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/70 text-xs sm:text-sm font-medium text-slate-800 cursor-not-allowed focus:outline-none"
                />
              </div>
            </div>

            {/* Payment Status Dropdown */}
            <div className="relative" ref={statusDropdownRef}>
              <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2">
                Payment Status <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsStatusDropdownOpen(!isStatusDropdownOpen);
                  setIsEmployeeDropdownOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 hover:border-slate-300 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                <span>{paymentStatus}</span>
                {isStatusDropdownOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {/* Status Popover matching Image 2 */}
              {isStatusDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-sm font-bold text-slate-900">
                      Payment Status
                    </span>
                    <ChevronUp
                      className="w-4 h-4 text-slate-500 cursor-pointer"
                      onClick={() => setIsStatusDropdownOpen(false)}
                    />
                  </div>

                  <div className="py-2 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentStatus("Paid");
                        setIsStatusDropdownOpen(false);
                      }}
                      className={`w-full py-2.5 px-3 text-center text-xs sm:text-sm font-semibold transition-colors cursor-pointer rounded-md ${
                        paymentStatus === "Paid"
                          ? "bg-slate-100 text-slate-900"
                          : "text-slate-800 hover:bg-slate-50"
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
                      className={`w-full py-2.5 px-3 text-center text-xs sm:text-sm font-semibold transition-colors cursor-pointer rounded-md ${
                        paymentStatus === "Unpaid"
                          ? "bg-slate-100 text-slate-900"
                          : "text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      Unpaid
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Buttons: Cancel & Submit */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => navigate("/cost/salary-cost")}
              className="px-5 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer bg-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSalaryPage;
