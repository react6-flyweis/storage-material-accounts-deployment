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
  CircleDollarSign,
  Briefcase,
  Clock,
  Tag,
  FileSpreadsheet,
  FileText,
  Pencil,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import CalendarRangePickerModal from "@/components/common_components/CalendarRangePickerModal";
import type { ManpowerCostEntry } from "@/components/cost/AddManpowerCostModal";
import DeleteConfirmModal from "@/components/cost/DeleteConfirmModal";
import SuccessModal from "@/components/common_components/SuccessModal";
import { Skeleton } from "@/components/ui/skeleton";
import { CostStatCard } from "@/components/cost/CostStatCard";
import {
  useGetManpowerSummaryQuery,
  useGetManpowerRecordsQuery,
  useDeleteManpowerRecordMutation,
  useUpdateManpowerRecordMutation,
  useGetCostFiltersQuery,
} from "@/redux/api/costsApi";
import { formatDisplayDate } from "@/lib/dashboardFormatters";

type SortColumn = "date" | "hours" | "totalCost";

export const ManpowerCostPage: React.FC = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDesignation, setSelectedDesignation] = useState("All");
  const [selectedProject, setSelectedProject] = useState("All");
  const [selectedAmountRange, setSelectedAmountRange] = useState("All");
  const [selectedSortBy, setSelectedSortBy] = useState("Last 7 Days");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRangeText, setDateRangeText] = useState("dd/mm/yyyy - dd/mm/yyyy");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // API hooks
  const { data: filtersData } = useGetCostFiltersQuery();
  const { data: summaryData, isLoading: isSummaryLoading } = useGetManpowerSummaryQuery();
  const { data: recordsData, isLoading: isRecordsLoading } = useGetManpowerRecordsQuery({
    page: currentPage,
    limit: rowsPerPage,
    search: searchTerm,
    designation: selectedDesignation !== "All" ? selectedDesignation : undefined,
  });
  const [deleteRecordApi] = useDeleteManpowerRecordMutation();
  const [updateRecordApi] = useUpdateManpowerRecordMutation();

  // Modal states
  const [entryToDelete, setEntryToDelete] = useState<ManpowerCostEntry | null>(
    null,
  );
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
  const handleMarkPaid = async (entry: ManpowerCostEntry) => {
    try {
      const entryObj = entry as unknown as { rawDate?: string; projectId?: string; employeeUserId?: string };
      await updateRecordApi({
        id: entry.id,
        date: entryObj.rawDate || entry.date,
        leadId: entryObj.projectId,
        employeeName: entry.name,
        employeeUserId: entryObj.employeeUserId,
        employee: {
          userId: entryObj.employeeUserId,
          name: entry.name,
          designation: entry.designation,
        },
        designation: entry.designation,
        workingHours: entry.hours,
        hours: entry.hours,
        otHours: entry.otHours,
        ratePerHour: entry.ratePerHour,
        totalCost: entry.totalCost,
        paymentStatus: "Paid",
        status: "Paid",
      }).unwrap();
      setSuccessDialogConfig({
        isOpen: true,
        title: "Marked as Paid!",
        message: `Manpower expense of $${entry.totalCost} for ${entry.name} has been successfully marked as Paid.`,
      });
    } catch (e) {
      console.error("API update error:", e);
    }
  };

  // Delete Handlers
  const handleOpenDeleteConfirm = (entry: ManpowerCostEntry) => {
    setEntryToDelete(entry);
  };

  const handleConfirmDelete = async () => {
    if (!entryToDelete) return;

    const removedName = entryToDelete.name;
    try {
      await deleteRecordApi(entryToDelete.id).unwrap();
      setSuccessDialogConfig({
        isOpen: true,
        title: "Record Deleted!",
        message: `The manpower cost record for ${removedName} has been deleted successfully.`,
      });
    } catch (e) {
      console.error("API delete error:", e);
    } finally {
      setEntryToDelete(null);
    }
  };

  // Map API rows if returned
  const effectiveData = useMemo<ManpowerCostEntry[]>(() => {
    if (recordsData?.rows && recordsData.rows.length > 0) {
      return recordsData.rows.map((row, idx) => {
        const isPaid =
          (typeof row.paymentStatus === "string" &&
            row.paymentStatus.toLowerCase() === "paid") ||
          (typeof row.status === "string" &&
            row.status.toLowerCase() === "paid");

        const empName =
          row.employee?.name ||
          row.employeeName ||
          (row as { name?: string }).name ||
          "";

        const designation =
          row.employee?.designation ||
          row.designation ||
          "";

        const empUserId =
          row.employee?.userId ||
          row.employeeUserId ||
          row.employeeId ||
          "";

        const projectName =
          row.project ||
          row.projectName ||
          "";

        const hours = row.hours ?? row.workingHours ?? 0;
        const otHours = row.otHours ?? 0;
        const ratePerHour = row.ratePerHour ?? 0;
        const totalCost = row.totalCost ?? (hours + otHours) * ratePerHour;

        return {
          id: row.id || row._id || String(idx),
          name: empName,
          employeeName: empName,
          designation,
          project: projectName || "—",
          projectId: row.leadId || undefined,
          date: formatDisplayDate(row.date),
          rawDate: row.date,
          workingHours: hours,
          hours,
          otHours,
          hourlyRate: ratePerHour,
          ratePerHour,
          totalCost,
          status: (isPaid ? "Paid" : "Unpaid") as "Paid" | "Unpaid",
          paymentStatus: (isPaid ? "Paid" : "Pending") as "Paid" | "Pending",
          employeeUserId: empUserId,
          employeeId: empUserId,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            empName || "Employee",
          )}&background=1D51A4&color=fff&size=100`,
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
          item.name?.toLowerCase().includes(q) ||
          item.designation?.toLowerCase().includes(q) ||
          item.project?.toLowerCase().includes(q),
      );
    }

    // Designation filter
    if (selectedDesignation !== "All") {
      result = result.filter(
        (item) =>
          item.designation?.toLowerCase() === selectedDesignation.toLowerCase(),
      );
    }

    // Project filter
    if (selectedProject !== "All") {
      result = result.filter(
        (item) => item.project?.toLowerCase() === selectedProject.toLowerCase(),
      );
    }

    // Amount range filter
    if (selectedAmountRange === "0-1000") {
      result = result.filter((item) => item.totalCost <= 1000);
    } else if (selectedAmountRange === "1000-1500") {
      result = result.filter(
        (item) => item.totalCost > 1000 && item.totalCost <= 1500,
      );
    } else if (selectedAmountRange === "1500+") {
      result = result.filter((item) => item.totalCost > 1500);
    }

    // Sorting
    if (sortColumn) {
      result.sort((a, b) => {
        if (sortColumn === "date") {
          return sortOrder === "asc"
            ? a.date.localeCompare(b.date)
            : b.date.localeCompare(a.date);
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
    selectedProject,
    selectedAmountRange,
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
        "Date,Employee/Worker,Designation,Project,Hours,OT Hours,Rate/Hr,Total Cost,Status\n";
      const rows = effectiveData
        .map(
          (d) =>
            `"${d.date}","${d.name}","${d.designation}","${d.project}",${d.hours},${d.otHours},${d.ratePerHour},${d.totalCost},"${d.status}"`,
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
        `Manpower_Cost_${new Date().toISOString().slice(0, 10)}.csv`,
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
              Manpower Cost
            </h1>
          </div>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 font-normal mt-1">
            <Home className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              Track manpower expenses, labor allocation, working hours,
              overtime, and project-wise workforce costs.
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

          {/* Add Manpower Cost Button */}
          <button
            type="button"
            onClick={() => navigate("/cost/manpower-cost/add")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1D51A4] hover:bg-[#163e7c] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Add Manpower Cost</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        <CostStatCard
          title="Total Manpower Cost"
          value={
            summaryData?.totalManpowerCost !== undefined
              ? `$${Number(summaryData.totalManpowerCost).toLocaleString()}`
              : "$0"
          }
          isLoading={isSummaryLoading}
          changeText="From backend analytics"
          color="purple"
          icon={<CircleDollarSign className="w-5 h-5 stroke-[1.8]" />}
        />
        <CostStatCard
          title="Active Workforce"
          value={
            summaryData?.activeWorkers !== undefined
              ? String(summaryData.activeWorkers)
              : "0"
          }
          isLoading={isSummaryLoading}
          changeText="From backend analytics"
          color="emerald"
          icon={<Briefcase className="w-5 h-5 stroke-[1.8]" />}
        />
        <CostStatCard
          title="Total Working Hours"
          value={
            summaryData?.totalHours !== undefined
              ? `${summaryData.totalHours} hrs`
              : "0 hrs"
          }
          isLoading={isSummaryLoading}
          changeText="From backend analytics"
          color="amber"
          icon={<Clock className="w-5 h-5 stroke-[1.8]" />}
        />
        <CostStatCard
          title="Average Cost / Hour"
          value={
            summaryData?.averageRatePerHour !== undefined
              ? `$${summaryData.averageRatePerHour}`
              : "$0"
          }
          isLoading={isSummaryLoading}
          changeText="From backend analytics"
          color="amber"
          icon={<Tag className="w-5 h-5 stroke-[1.8]" />}
        />
      </div>

      {/* Main Card: Manpower Cost Records */}
      <div className={`bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden transition-opacity ${isRecordsLoading ? "opacity-70" : "opacity-100"}`}>
        {/* Table Header Filter Bar */}
        <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Manpower Cost Records
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
                  : ["Loading", "Labor", "Supervisor", "Operator"]
                ).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Project Dropdown */}
            <div className="relative">
              <select
                value={selectedProject}
                onChange={(e) => {
                  setSelectedProject(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-[#1D51A4]"
              >
                <option value="All">Project</option>
                {(filtersData?.projects && filtersData.projects.length > 0
                  ? filtersData.projects.map((p) => p.projectName)
                  : ["SMDT Warehouse", "Steel Unit", "Industrial Shed", "Warehouse Expansion"]
                ).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Amount Range Dropdown */}
            <div className="relative">
              <select
                value={selectedAmountRange}
                onChange={(e) => {
                  setSelectedAmountRange(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-[#1D51A4]"
              >
                <option value="All">$0.00 - $00</option>
                <option value="0-1000">$0 - $1,000</option>
                <option value="1000-1500">$1,000 - $1,500</option>
                <option value="1500+">$1,500+</option>
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
                  onClick={() => handleSort("date")}
                  className="py-3 px-5 cursor-pointer hover:text-slate-900 select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    <span className="text-[10px] text-slate-400">▾</span>
                  </div>
                </th>
                <th className="py-3 px-5 whitespace-nowrap">Employee/Worker</th>
                <th className="py-3 px-5 whitespace-nowrap">Project</th>
                <th
                  onClick={() => handleSort("hours")}
                  className="py-3 px-5 cursor-pointer hover:text-slate-900 select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Hours</span>
                    <span className="text-[10px] text-slate-400">▾</span>
                  </div>
                </th>
                <th className="py-3 px-5 whitespace-nowrap">OT Hours</th>
                <th className="py-3 px-5 whitespace-nowrap">Rate/Hr</th>
                <th
                  onClick={() => handleSort("totalCost")}
                  className="py-3 px-5 cursor-pointer hover:text-slate-900 select-none whitespace-nowrap"
                >
                  Total Cost
                </th>
                <th className="py-3 px-5 whitespace-nowrap">Status</th>
                <th className="py-3 px-5 whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y border-t border-slate-100 text-xs">
              {isRecordsLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`manpower-skeleton-${i}`} className="animate-pulse">
                    <td className="py-3.5 px-5"><Skeleton className="h-4 w-20" /></td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-3.5 w-28" />
                          <Skeleton className="h-2.5 w-16" />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5"><Skeleton className="h-4 w-24" /></td>
                    <td className="py-3.5 px-5"><Skeleton className="h-4 w-12" /></td>
                    <td className="py-3.5 px-5"><Skeleton className="h-4 w-12" /></td>
                    <td className="py-3.5 px-5"><Skeleton className="h-4 w-14" /></td>
                    <td className="py-3.5 px-5"><Skeleton className="h-4 w-16" /></td>
                    <td className="py-3.5 px-5"><Skeleton className="h-6 w-16 rounded-md" /></td>
                    <td className="py-3.5 px-5"><Skeleton className="h-6 w-16 rounded-md" /></td>
                  </tr>
                ))
              ) : displayRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No manpower cost records found matching your criteria.
                  </td>
                </tr>
              ) : (
                displayRows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Date */}
                    <td className="py-3.5 px-5 font-medium text-slate-600 whitespace-nowrap">
                      {row.date}
                    </td>

                    {/* Employee / Worker */}
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

                    {/* Project */}
                    <td className="py-3.5 px-5 font-medium text-slate-700 whitespace-nowrap">
                      {row.project}
                    </td>

                    {/* Hours */}
                    <td className="py-3.5 px-5 font-medium text-slate-700 whitespace-nowrap">
                      {row.hours} hr
                    </td>

                    {/* OT Hours */}
                    <td className="py-3.5 px-5 font-medium text-slate-700 whitespace-nowrap">
                      {row.otHours} hr
                    </td>

                    {/* Rate / Hr */}
                    <td className="py-3.5 px-5 font-medium text-slate-700 whitespace-nowrap">
                      ${row.ratePerHour}
                    </td>

                    {/* Total Cost */}
                    <td className="py-3.5 px-5 font-bold text-slate-900 whitespace-nowrap">
                      ${row.totalCost.toLocaleString()}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span
                        className={`inline-block px-3 py-1 rounded-md text-[11px] font-semibold tracking-wide ${
                          row.status === "Paid"
                            ? "bg-[#D1FADF] text-[#027A48]"
                            : "bg-[#FEE4E2] text-[#D92D20]"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {row.status === "Unpaid" ? (
                          <button
                            type="button"
                            onClick={() => handleMarkPaid(row)}
                            className="px-3.5 py-1.5 rounded-md bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                          >
                            Mark Paid
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="px-3.5 py-1.5 rounded-md bg-[#059669] text-white text-xs font-semibold shadow-xs transition-colors cursor-default"
                          >
                            Completed
                          </button>
                        )}

                        {/* Edit Icon */}
                        <button
                          type="button"
                          onClick={() => {
                            navigate(`/cost/manpower-cost/edit/${row.id}`, {
                              state: { entry: row },
                            });
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Icon */}
                        <button
                          type="button"
                          onClick={() => handleOpenDeleteConfirm(row)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

            <span className="text-slate-400 px-0.5">...</span>

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
              disabled={currentPage >= totalPages && currentPage !== 4}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Date Range Picker Modal */}
      <CalendarRangePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onSelectRange={(range: string) => {
          setDateRangeText(range);
          setIsDatePickerOpen(false);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!entryToDelete}
        onClose={() => setEntryToDelete(null)}
        onConfirm={handleConfirmDelete}
        employeeName={entryToDelete?.name}
        empId={
          entryToDelete ? `EMP-${entryToDelete.id.padStart(3, "0")}` : undefined
        }
      />

      {/* Success Modal */}
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

export default ManpowerCostPage;
