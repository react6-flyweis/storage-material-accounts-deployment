import React, { useState, useMemo } from "react";
import {
  Home,
  Download,
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar,
  ArrowUpRight,
  Coins,
  ShoppingBag,
  Tag,
  FileSpreadsheet,
  FileText,
  Eye,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import CalendarRangePickerModal from "@/components/common_components/CalendarRangePickerModal";
import type { SalaryEntry } from "@/components/cost/AddSalaryEntryModal";
import DeleteConfirmModal from "@/components/cost/DeleteConfirmModal";
import SuccessModal from "@/components/common_components/SuccessModal";
import SalaryDetailModal from "@/components/cost/SalaryDetailModal";

// Initial mock data matching screenshot exactly
const INITIAL_SALARY_DATA: SalaryEntry[] = [
  {
    id: "1",
    empId: "Emp-001",
    name: "Anthony Lewis",
    designation: "Finance",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    basicSalary: 40000,
    deductions: 1000,
    netSalary: 40000,
    status: "Unpaid",
    adminApproval: "Approved",
    date: "14 Aug 2026",
  },
  {
    id: "2",
    empId: "Emp-002",
    name: "Brian Villalobos",
    designation: "Production",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    basicSalary: 35000,
    deductions: 1000,
    netSalary: 35000,
    status: "Paid",
    adminApproval: "Approved",
    date: "14 Aug 2026",
  },
  {
    id: "3",
    empId: "Emp-003",
    name: "Harvey Smith",
    designation: "Production",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
    basicSalary: 20000,
    deductions: 1000,
    netSalary: 20000,
    status: "Paid",
    adminApproval: "Approved",
    date: "14 Aug 2026",
  },
  {
    id: "4",
    empId: "Emp-004",
    name: "Stephan Peralt",
    designation: "Executive Officer",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80",
    basicSalary: 22000,
    deductions: 1000,
    netSalary: 22000,
    status: "Paid",
    adminApproval: "Approved",
    date: "14 Aug 2026",
  },
  {
    id: "5",
    empId: "Emp-005",
    name: "Doglas Martini",
    designation: "Manager",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
    basicSalary: 25000,
    deductions: 1000,
    netSalary: 25000,
    status: "Paid",
    adminApproval: "Approved",
    date: "14 Aug 2026",
  },
  {
    id: "6",
    empId: "Emp-006",
    name: "Linda Ray",
    designation: "Finance",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80",
    basicSalary: 30000,
    deductions: 1000,
    netSalary: 30000,
    status: "Paid",
    adminApproval: "Approved",
    date: "14 Aug 2026",
  },
  {
    id: "7",
    empId: "Emp-007",
    name: "Elliot Murray",
    designation: "Production",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    basicSalary: 35000,
    deductions: 1000,
    netSalary: 35000,
    status: "Paid",
    adminApproval: "Approved",
    date: "14 Aug 2026",
  },
  {
    id: "8",
    empId: "Emp-008",
    name: "Rebecca Smtih",
    designation: "Executive",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
    basicSalary: 45000,
    deductions: 1000,
    netSalary: 45000,
    status: "Paid",
    adminApproval: "Approved",
    date: "14 Aug 2026",
  },
  {
    id: "9",
    empId: "Emp-009",
    name: "Connie Waters",
    designation: "Production",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80",
    basicSalary: 50000,
    deductions: 1000,
    netSalary: 50000,
    status: "Paid",
    adminApproval: "Approved",
    date: "14 Aug 2026",
  },
  {
    id: "10",
    empId: "Emp-010",
    name: "Lori Broaddus",
    designation: "Finance",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
    basicSalary: 25000,
    deductions: 1000,
    netSalary: 25000,
    status: "Paid",
    adminApproval: "Approved",
    date: "14 Aug 2026",
  },
  {
    id: "11",
    empId: "Emp-011",
    name: "Lucas Scott",
    designation: "Production",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80",
    basicSalary: 32000,
    deductions: 1000,
    netSalary: 31000,
    status: "Paid",
    adminApproval: "Approved",
    date: "14 Aug 2026",
  },
  {
    id: "12",
    empId: "Emp-012",
    name: "Sophia Martinez",
    designation: "Finance",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    basicSalary: 42000,
    deductions: 1500,
    netSalary: 40500,
    status: "Paid",
    adminApproval: "Approved",
    date: "15 Aug 2026",
  },
  {
    id: "13",
    empId: "Emp-013",
    name: "James Wilson",
    designation: "Executive Officer",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80",
    basicSalary: 48000,
    deductions: 2000,
    netSalary: 46000,
    status: "Unpaid",
    adminApproval: "Pending",
    date: "16 Aug 2026",
  },
  {
    id: "14",
    empId: "Emp-014",
    name: "Emma Davis",
    designation: "Manager",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop&q=80",
    basicSalary: 28000,
    deductions: 800,
    netSalary: 27200,
    status: "Paid",
    adminApproval: "Approved",
    date: "16 Aug 2026",
  },
  {
    id: "15",
    empId: "Emp-015",
    name: "Oliver Brown",
    designation: "Executive",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80",
    basicSalary: 36000,
    deductions: 1200,
    netSalary: 34800,
    status: "Paid",
    adminApproval: "Approved",
    date: "17 Aug 2026",
  },
  {
    id: "16",
    empId: "Emp-016",
    name: "Ava Taylor",
    designation: "Finance",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
    basicSalary: 39000,
    deductions: 1100,
    netSalary: 37900,
    status: "Paid",
    adminApproval: "Approved",
    date: "17 Aug 2026",
  },
];

type SortColumn = "empId" | "basicSalary" | "deductions" | "netSalary";

export const SalaryCostPage: React.FC = () => {
  const navigate = useNavigate();

  // Load state with fallback to local storage
  const [data, setData] = useState<SalaryEntry[]>(() => {
    try {
      const stored = localStorage.getItem("custom_salary_entries");
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, unknown>[];
        const mapped: SalaryEntry[] = parsed.map((item, idx: number) => ({
          id: `custom-${idx}`,
          empId: String(item.empId || `Emp-${String(idx + 20).padStart(3, "0")}`),
          name: String(item.name || "Employee"),
          designation: String(item.designation || "Production"),
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            String(item.name || "Employee")
          )}&background=1D51A4&color=fff&size=100`,
          basicSalary: Number(item.basicSalary) || 40000,
          deductions: Number(item.deduction) || 1000,
          netSalary: Number(item.netSalary) || 39000,
          status: (item.paymentStatus as "Paid" | "Unpaid") || "Paid",
          adminApproval: "Approved",
          date: String(item.date || "14 Aug 2026"),
        }));
        return [...mapped, ...INITIAL_SALARY_DATA];
      }
    } catch {
      // fallback
    }
    return INITIAL_SALARY_DATA;
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDesignation, setSelectedDesignation] = useState("All");
  const [selectedSalaryRange, setSelectedSalaryRange] = useState("All");
  const [selectedSortBy, setSelectedSortBy] = useState("Last 7 Days");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(4); // Default to 4 as per screenshot
  const [dateRangeText, setDateRangeText] = useState("dd/mm/yyyy - dd/mm/yyyy");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Dialog states
  const [entryToDelete, setEntryToDelete] = useState<SalaryEntry | null>(null);
  const [selectedDetailEntry, setSelectedDetailEntry] = useState<SalaryEntry | null>(null);
  const [successDialogConfig, setSuccessDialogConfig] = useState<{
    isOpen: boolean;
    title: string;
    message?: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  // Handle Sort
  const handleSort = (col: SortColumn) => {
    if (sortColumn === col) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(col);
      setSortOrder("asc");
    }
  };

  // Mark Paid Handler
  const handleMarkPaid = (entry: SalaryEntry) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === entry.id ? { ...item, status: "Paid" } : item
      )
    );

    setSuccessDialogConfig({
      isOpen: true,
      title: "Marked as Paid!",
      message: `Salary of $${entry.netSalary} for ${entry.name} (${entry.empId}) has been successfully marked as Paid.`,
    });
  };

  // Generate Slip Handler
  const handleGenerateSlip = (entry: SalaryEntry) => {
    setSuccessDialogConfig({
      isOpen: true,
      title: "Payslip Generated Successfully!",
      message: `Payslip for ${entry.name} (${entry.empId}) has been compiled and is ready for download.`,
    });
  };

  // Delete Handlers
  const handleOpenDeleteConfirm = (entry: SalaryEntry) => {
    setEntryToDelete(entry);
  };

  const handleConfirmDelete = () => {
    if (!entryToDelete) return;

    const removedName = entryToDelete.name;
    const removedId = entryToDelete.empId;

    setData((prev) => prev.filter((item) => item.id !== entryToDelete.id));
    setEntryToDelete(null);

    setSuccessDialogConfig({
      isOpen: true,
      title: "Salary Entry Deleted!",
      message: `The salary entry for ${removedName} (${removedId}) has been deleted successfully.`,
    });
  };

  // Filter and sort data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.empId.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q) ||
          item.designation.toLowerCase().includes(q)
      );
    }

    // Designation filter
    if (selectedDesignation !== "All") {
      result = result.filter(
        (item) => item.designation.toLowerCase() === selectedDesignation.toLowerCase()
      );
    }

    // Salary range filter
    if (selectedSalaryRange === "under25k") {
      result = result.filter((item) => item.basicSalary < 25000);
    } else if (selectedSalaryRange === "25k-35k") {
      result = result.filter(
        (item) => item.basicSalary >= 25000 && item.basicSalary <= 35000
      );
    } else if (selectedSalaryRange === "35k-50k") {
      result = result.filter(
        (item) => item.basicSalary > 35000 && item.basicSalary <= 50000
      );
    } else if (selectedSalaryRange === "50k+") {
      result = result.filter((item) => item.basicSalary > 50000);
    }

    // Sorting
    if (sortColumn) {
      result.sort((a, b) => {
        if (sortColumn === "empId") {
          return sortOrder === "asc"
            ? a.empId.localeCompare(b.empId)
            : b.empId.localeCompare(a.empId);
        }
        const valA = a[sortColumn];
        const valB = b[sortColumn];
        return sortOrder === "asc" ? valA - valB : valB - valA;
      });
    }

    return result;
  }, [
    data,
    searchTerm,
    selectedDesignation,
    selectedSalaryRange,
    sortColumn,
    sortOrder,
  ]);

  const totalEntries = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / rowsPerPage));

  const displayRows = useMemo(() => {
    const activeDataPage = currentPage > totalPages ? 1 : currentPage;
    const start = (activeDataPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, totalPages, rowsPerPage]);

  const handleExport = (type: string) => {
    setIsExportMenuOpen(false);
    if (type === "csv") {
      const headers = "Emp ID,Name,Designation,Basic Salary,Deductions,Net Salary,Status,Admin Approval,Date\n";
      const rows = data
        .map(
          (d) =>
            `"${d.empId}","${d.name}","${d.designation}",${d.basicSalary},${d.deductions},${d.netSalary},"${d.status}","${d.adminApproval}","${d.date}"`
        )
        .join("\n");
      const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Salary_Cost_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      setSuccessDialogConfig({
        isOpen: true,
        title: `Export to ${type.toUpperCase()} Started`,
        message: "Your export document is being processed and will download shortly.",
      });
    }
  };

  return (
    <div className="p-3 sm:p-5 lg:p-6 space-y-5 bg-[#EEF2FB] min-h-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Salary Cost
            </h1>
          </div>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 font-normal mt-1">
            <Home className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              Track employee salaries, payroll expenses, deductions, overtime, and monthly salary trends.
            </span>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Export Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isExportMenuOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95">
                <button
                  type="button"
                  onClick={() => handleExport("csv")}
                  className="w-full px-3.5 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export as CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("excel")}
                  className="w-full px-3.5 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                  <span>Export as Excel</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("pdf")}
                  className="w-full px-3.5 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                >
                  <FileText className="w-3.5 h-3.5 text-rose-600" />
                  <span>Export as PDF</span>
                </button>
              </div>
            )}
          </div>

          {/* Add Salary Entry Button */}
          <button
            type="button"
            onClick={() => navigate("/cost/salary-cost/add")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1D51A4] hover:bg-[#163e7c] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <div className="w-4 h-4 rounded-full border border-white/60 flex items-center justify-center">
              <Plus className="w-3 h-3 text-white" />
            </div>
            <span>Add Salary Entry</span>
          </button>
        </div>
      </div>

      {/* Top 3 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
        {/* Card 1: Total Salary Cost */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs sm:text-sm font-medium text-slate-500">
              Total Salary Cost
            </span>
            <div className="w-10 h-10 rounded-xl border border-purple-300 bg-purple-50/50 flex items-center justify-center text-purple-600">
              <Coins className="w-5 h-5 stroke-[1.8]" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              $48,65,000
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 mt-2">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
              <span>5.62% from last month</span>
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-purple-200/20 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Card 2: Net Salary Paid */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs sm:text-sm font-medium text-slate-500">
              Net Salary Paid
            </span>
            <div className="w-10 h-10 rounded-xl border border-emerald-300 bg-emerald-50/50 flex items-center justify-center text-emerald-600">
              <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              $43,82,500
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 mt-2">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
              <span>11.4% from last month</span>
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-emerald-200/20 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Card 3: Pending Salary */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs sm:text-sm font-medium text-slate-500">
              Pending Salary
            </span>
            <div className="w-10 h-10 rounded-xl border border-amber-300 bg-amber-50/50 flex items-center justify-center text-amber-500">
              <Tag className="w-5 h-5 stroke-[1.8]" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              $4,82,500
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 mt-2">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
              <span>8.52% from last month</span>
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-amber-200/20 rounded-full blur-xl pointer-events-none" />
        </div>
      </div>

      {/* Main Card: Employee Salary List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        {/* Table Header Filter Bar */}
        <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Employee Salary List
          </h2>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Date Range Picker */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{dateRangeText}</span>
              </button>
            </div>

            {/* Designation Dropdown */}
            <div className="relative">
              <select
                value={selectedDesignation}
                onChange={(e) => {
                  setSelectedDesignation(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-[#1D51A4]"
              >
                <option value="All">Designation</option>
                <option value="Finance">Finance</option>
                <option value="Production">Production</option>
                <option value="Executive Officer">Executive Officer</option>
                <option value="Manager">Manager</option>
                <option value="Executive">Executive</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Salary Range Dropdown */}
            <div className="relative">
              <select
                value={selectedSalaryRange}
                onChange={(e) => {
                  setSelectedSalaryRange(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-[#1D51A4]"
              >
                <option value="All">$0.00 - $00</option>
                <option value="under25k">$0 - $25,000</option>
                <option value="25k-35k">$25,000 - $35,000</option>
                <option value="35k-50k">$35,000 - $50,000</option>
                <option value="50k+">$50,000+</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort By Dropdown */}
            <div className="relative">
              <select
                value={selectedSortBy}
                onChange={(e) => setSelectedSortBy(e.target.value)}
                className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-[#1D51A4]"
              >
                <option value="Last 7 Days">Sort By : Last 7 Days</option>
                <option value="Last 30 Days">Sort By : Last 30 Days</option>
                <option value="This Month">Sort By : This Month</option>
                <option value="This Year">Sort By : This Year</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Sub-bar: Rows per page + Search */}
        <div className="px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-normal">
            <span>Row Per Page</span>
            <div className="relative">
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="appearance-none bg-white border border-slate-200 rounded-md pl-2.5 pr-6 py-1 text-xs text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-[#1D51A4]"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <span>Entries</span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search"
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1D51A4] transition-colors"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-y border-slate-100 text-xs font-semibold text-slate-700">
                <th
                  onClick={() => handleSort("empId")}
                  className="py-3 px-5 cursor-pointer hover:text-slate-900 select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Emp ID</span>
                    <span className="text-[10px] text-slate-400">▾</span>
                  </div>
                </th>
                <th className="py-3 px-5 whitespace-nowrap">Name</th>
                <th
                  onClick={() => handleSort("basicSalary")}
                  className="py-3 px-5 cursor-pointer hover:text-slate-900 select-none whitespace-nowrap"
                >
                  Basic Salary
                </th>
                <th
                  onClick={() => handleSort("deductions")}
                  className="py-3 px-5 cursor-pointer hover:text-slate-900 select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Deductions</span>
                    <span className="text-[10px] text-slate-400">▾</span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort("netSalary")}
                  className="py-3 px-5 cursor-pointer hover:text-slate-900 select-none whitespace-nowrap"
                >
                  Net Salary
                </th>
                <th className="py-3 px-5 whitespace-nowrap">Status</th>
                <th className="py-3 px-5 whitespace-nowrap">Admin Approval</th>
                <th className="py-3 px-5 whitespace-nowrap">Date</th>
                <th className="py-3 px-5 whitespace-nowrap">Payslip</th>
                <th className="py-3 px-5 whitespace-nowrap">Payslip</th>
                <th className="py-3 px-5 whitespace-nowrap text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {displayRows.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    No salary entries found matching your criteria.
                  </td>
                </tr>
              ) : (
                displayRows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Emp ID */}
                    <td className="py-3.5 px-5 font-medium text-slate-500 whitespace-nowrap">
                      {row.empId}
                    </td>

                    {/* Name + Designation with Avatar */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img
                          src={row.avatar}
                          alt={row.name}
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              row.name
                            )}&background=1D51A4&color=fff&size=100`;
                          }}
                          className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-100"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-xs sm:text-[13px]">
                            {row.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-normal">
                            {row.designation}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Basic Salary */}
                    <td className="py-3.5 px-5 font-medium text-slate-700 whitespace-nowrap">
                      ${row.basicSalary}
                    </td>

                    {/* Deductions */}
                    <td className="py-3.5 px-5 font-medium text-slate-700 whitespace-nowrap">
                      ${row.deductions}
                    </td>

                    {/* Net Salary */}
                    <td className="py-3.5 px-5 font-medium text-slate-700 whitespace-nowrap">
                      ${row.netSalary}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span
                        className={`inline-block px-3 py-1 rounded-md text-[11px] font-semibold tracking-wide ${
                          row.status === "Paid"
                            ? "bg-[#DCFCE7] text-[#16A34A]"
                            : "bg-[#FEE2E2] text-[#EF4444]"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>

                    {/* Admin Approval */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span
                        className={`inline-block px-3 py-1 rounded-md text-[11px] font-semibold tracking-wide ${
                          row.adminApproval === "Approved"
                            ? "bg-[#DCFCE7] text-[#16A34A]"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {row.adminApproval}
                      </span>
                    </td>

                    {/* Date inside badge */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-1 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-2xs">
                        {row.date}
                      </span>
                    </td>

                    {/* Payslip Column 1: Generate Slip (when Paid) */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      {row.status === "Paid" ? (
                        <button
                          type="button"
                          onClick={() => handleGenerateSlip(row)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#0F172A] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                          Generate Slip
                        </button>
                      ) : null}
                    </td>

                    {/* Payslip Column 2: Mark Paid (when Unpaid) */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      {row.status === "Unpaid" ? (
                        <button
                          type="button"
                          onClick={() => handleMarkPaid(row)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                          Mark Paid
                        </button>
                      ) : null}
                    </td>

                    {/* Action Buttons: Delete (Trash2) & View (Eye) */}
                    <td className="py-3.5 px-5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenDeleteConfirm(row)}
                          aria-label={`Delete record for ${row.name}`}
                          className="p-1.5 rounded-md border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedDetailEntry(row)}
                          aria-label={`View details for ${row.name}`}
                          className="p-1.5 rounded-md border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                          title="View details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-4 sm:px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 font-normal">
            Showing {Math.min(1, totalEntries)} to{" "}
            {Math.min(displayRows.length, totalEntries)} of {totalEntries} entries
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {[1, 2, 3, 4].map((page) => {
              const isCurrent = page === currentPage;
              return (
                <button
                  key={`page-${page}`}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-6 h-6 rounded-full text-xs transition-colors flex items-center justify-center cursor-pointer ${
                    isCurrent
                      ? "bg-[#1D51A4] text-white font-bold shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 font-medium"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <span className="px-1 text-slate-400">...</span>

            <button
              type="button"
              onClick={() => setCurrentPage(15)}
              className={`w-6 h-6 rounded-full text-xs transition-colors flex items-center justify-center cursor-pointer ${
                currentPage === 15
                  ? "bg-[#1D51A4] text-white font-bold shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 font-medium"
              }`}
            >
              15
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(15, p + 1))}
              className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Date Range Modal */}
      <CalendarRangePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onSelectRange={(range: string) => {
          setDateRangeText(range);
          setIsDatePickerOpen(false);
        }}
      />

      {/* Employee Detail Modal */}
      <SalaryDetailModal
        isOpen={!!selectedDetailEntry}
        onClose={() => setSelectedDetailEntry(null)}
        entry={selectedDetailEntry}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!entryToDelete}
        onClose={() => setEntryToDelete(null)}
        onConfirm={handleConfirmDelete}
        employeeName={entryToDelete?.name}
        empId={entryToDelete?.empId}
      />

      {/* Common Success Modal */}
      <SuccessModal
        isOpen={successDialogConfig.isOpen}
        onClose={() =>
          setSuccessDialogConfig((prev) => ({ ...prev, isOpen: false }))
        }
        title={successDialogConfig.title}
        subTitle={successDialogConfig.message}
      />
    </div>
  );
};

export default SalaryCostPage;
