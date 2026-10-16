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
import { Skeleton } from "@/components/ui/skeleton";
import { CostStatCard } from "@/components/cost/CostStatCard";
import {
  useGetSalarySummaryQuery,
  useGetSalaryRecordsQuery,
  useMarkSalaryPaidMutation,
  useDeleteSalaryRecordMutation,
  useGetCostFiltersQuery,
} from "@/redux/api/costsApi";
import { formatDisplayDate } from "@/lib/dashboardFormatters";

type SortColumn = "empId" | "basicSalary" | "deductions" | "netSalary";

export const SalaryCostPage: React.FC = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDesignation, setSelectedDesignation] = useState("All");
  const [selectedSalaryRange, setSelectedSalaryRange] = useState("All");
  const [selectedSortBy, setSelectedSortBy] = useState("Last 7 Days");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRangeText, setDateRangeText] = useState("dd/mm/yyyy - dd/mm/yyyy");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // RTK Query API Integration
  const { data: filtersData } = useGetCostFiltersQuery();
  const { data: summaryData, isLoading: isSummaryLoading } = useGetSalarySummaryQuery();
  const { data: recordsData, isLoading: isRecordsLoading } = useGetSalaryRecordsQuery({
    page: currentPage,
    limit: rowsPerPage,
    search: searchTerm,
    designation: selectedDesignation !== "All" ? selectedDesignation : undefined,
  });
  const [markPaidApi] = useMarkSalaryPaidMutation();
  const [deleteSalaryApi] = useDeleteSalaryRecordMutation();

  // Dialog states
  const [entryToDelete, setEntryToDelete] = useState<SalaryEntry | null>(null);
  const [selectedDetailEntry, setSelectedDetailEntry] =
    useState<SalaryEntry | null>(null);
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
  const handleMarkPaid = async (entry: SalaryEntry) => {
    try {
      await markPaidApi(entry.id).unwrap();
      setSuccessDialogConfig({
        isOpen: true,
        title: "Marked as Paid!",
        message: `Salary of $${entry.netSalary} for ${entry.name} (${entry.empId}) has been successfully marked as Paid.`,
      });
    } catch (e) {
      console.error("API mark paid error:", e);
    }
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

  const handleConfirmDelete = async () => {
    if (!entryToDelete) return;

    const removedName = entryToDelete.name;
    const removedId = entryToDelete.empId;

    try {
      await deleteSalaryApi(entryToDelete.id).unwrap();
      setSuccessDialogConfig({
        isOpen: true,
        title: "Salary Entry Deleted!",
        message: `The salary entry for ${removedName} (${removedId}) has been deleted successfully.`,
      });
    } catch (e) {
      console.error("API delete error:", e);
    } finally {
      setEntryToDelete(null);
    }
  };

  // Merge API rows with typed structure
  const effectiveData: SalaryEntry[] = useMemo(() => {
    if (recordsData?.rows && recordsData.rows.length > 0) {
      return recordsData.rows.map((row, idx) => {
        const isPaid =
          (typeof row.paymentStatus === "string" &&
            row.paymentStatus.toLowerCase() === "paid") ||
          (typeof (row as { status?: string }).status === "string" &&
            (row as { status?: string }).status?.toLowerCase() === "paid");

        return {
          id: row._id || row.id || String(idx),
          empId:
            row.employeeId ||
            row.employeeUserId ||
            `EMP-${String(idx + 1).padStart(3, "0")}`,
          name: row.employeeName,
          designation: row.designation || "General",
          avatar:
            row.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(row.employeeName)}&background=1D51A4&color=fff&size=100`,
          basicSalary: row.basicSalary || row.netSalary || 0,
          deductions: row.deductions || 0,
          netSalary: row.netSalary,
          status: (isPaid ? "Paid" : "Pending") as "Paid" | "Pending",
          adminApproval:
            (row.adminApproval as "Approved" | "Pending" | "Rejected") ||
            "Approved",
          date: formatDisplayDate(row.date),
        };
      });
    }
    return [];
  }, [recordsData]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let result = [...effectiveData];

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.empId.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q) ||
          item.designation.toLowerCase().includes(q),
      );
    }

    // Designation filter
    if (selectedDesignation !== "All") {
      result = result.filter(
        (item) =>
          item.designation.toLowerCase() === selectedDesignation.toLowerCase(),
      );
    }

    // Salary range filter
    if (selectedSalaryRange === "under25k") {
      result = result.filter((item) => item.basicSalary < 25000);
    } else if (selectedSalaryRange === "25k-35k") {
      result = result.filter(
        (item) => item.basicSalary >= 25000 && item.basicSalary <= 35000,
      );
    } else if (selectedSalaryRange === "35k-50k") {
      result = result.filter(
        (item) => item.basicSalary > 35000 && item.basicSalary <= 50000,
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
    effectiveData,
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
      const headers =
        "Emp ID,Name,Designation,Basic Salary,Deductions,Net Salary,Status,Admin Approval,Date\n";
      const rows = effectiveData
        .map(
          (d) =>
            `"${d.empId}","${d.name}","${d.designation}",${d.basicSalary},${d.deductions},${d.netSalary},"${d.status}","${d.adminApproval}","${d.date}"`,
        )
        .join("\n");
      const blob = new Blob([headers + rows], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Salary_Cost_${new Date().toISOString().slice(0, 10)}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      setSuccessDialogConfig({
        isOpen: true,
        title: `Export to ${type.toUpperCase()} Started`,
        message:
          "Your export document is being processed and will download shortly.",
      });
    }
  };

  return (
    <div className="space-y-5">
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
              Track employee salaries, payroll expenses, deductions, overtime,
              and monthly salary trends.
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
        <CostStatCard
          title="Total Salary Cost"
          value={
            summaryData?.totalSalaryCost !== undefined
              ? `$${Number(summaryData.totalSalaryCost).toLocaleString()}`
              : "$0"
          }
          isLoading={isSummaryLoading}
          changeText="From backend analytics"
          color="purple"
          icon={<Coins className="w-5 h-5 stroke-[1.8]" />}
        />
        <CostStatCard
          title="Net Salary Paid"
          value={
            summaryData?.netSalaryPaid !== undefined
              ? `$${Number(summaryData.netSalaryPaid).toLocaleString()}`
              : "$0"
          }
          isLoading={isSummaryLoading}
          changeText="From backend analytics"
          color="emerald"
          icon={<ShoppingBag className="w-5 h-5 stroke-[1.8]" />}
        />
        <CostStatCard
          title="Pending Salary"
          value={
            summaryData?.pendingSalary !== undefined
              ? `$${Number(summaryData.pendingSalary).toLocaleString()}`
              : "$0"
          }
          isLoading={isSummaryLoading}
          changeText="From backend analytics"
          color="amber"
          icon={<Tag className="w-5 h-5 stroke-[1.8]" />}
        />
      </div>

      {/* Main Card: Employee Salary List */}
      <div className={`bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden transition-opacity ${isRecordsLoading ? "opacity-70" : "opacity-100"}`}>
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
                {(filtersData?.designations && filtersData.designations.length > 0
                  ? filtersData.designations
                  : ["Finance", "Production", "Executive Officer", "Manager", "Executive"]
                ).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
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
              {isRecordsLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`salary-skeleton-${i}`} className="animate-pulse">
                    <td className="py-3.5 px-5"><Skeleton className="h-4 w-16" /></td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-3.5 w-28" />
                          <Skeleton className="h-2.5 w-16" />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5"><Skeleton className="h-4 w-14" /></td>
                    <td className="py-3.5 px-5"><Skeleton className="h-4 w-14" /></td>
                    <td className="py-3.5 px-5"><Skeleton className="h-4 w-14" /></td>
                    <td className="py-3.5 px-5"><Skeleton className="h-6 w-16 rounded-md" /></td>
                    <td className="py-3.5 px-5"><Skeleton className="h-6 w-20 rounded-md" /></td>
                    <td className="py-3.5 px-5"><Skeleton className="h-6 w-24 rounded-md" /></td>
                    <td className="py-3.5 px-5"><Skeleton className="h-7 w-24 rounded-lg" /></td>
                    <td className="py-3.5 px-5"><Skeleton className="h-7 w-20 rounded-lg" /></td>
                    <td className="py-3.5 px-5 text-right"><Skeleton className="h-6 w-12 ml-auto rounded-md" /></td>
                  </tr>
                ))
              ) : displayRows.length === 0 ? (
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
                              row.name,
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
                            : "bg-[#FEF3C7] text-[#D97706]"
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

                    {/* Payslip Column 2: Mark Paid (when not Paid) */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      {row.status !== "Paid" ? (
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
            {Math.min(displayRows.length, totalEntries)} of {totalEntries}{" "}
            entries
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
