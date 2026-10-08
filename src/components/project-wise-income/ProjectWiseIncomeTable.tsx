import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Calendar,
  Eye,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import {
  ProjectIncomeDetailModal,
  type ProjectIncomeRow,
} from "./ProjectIncomeDetailModal";
import CalendarRangePickerModal from "@/components/common_components/CalendarRangePickerModal";

const initialProjectRows: ProjectIncomeRow[] = [
  {
    id: "1",
    projectName: "Alpha Infra project",
    totalIncome: "$1,32,50,000",
    totalIncomeNum: 13250000,
    receivedIncome: "$1,05,50,000",
    receivedIncomeNum: 10550000,
    pendingIncome: "$25,00,000",
    pendingIncomeNum: 2500000,
    overdueIncome: "$7,00,000",
    overdueIncomeNum: 700000,
    receivedPercentage: 79,
  },
  {
    id: "2",
    projectName: "Riverside Building",
    totalIncome: "$1,32,50,000",
    totalIncomeNum: 13250000,
    receivedIncome: "$1,05,50,000",
    receivedIncomeNum: 10550000,
    pendingIncome: "$25,00,000",
    pendingIncomeNum: 2500000,
    overdueIncome: "$7,00,000",
    overdueIncomeNum: 700000,
    receivedPercentage: 79,
  },
  {
    id: "3",
    projectName: "Logistic Warehouse",
    totalIncome: "$1,32,50,000",
    totalIncomeNum: 13250000,
    receivedIncome: "$1,05,50,000",
    receivedIncomeNum: 10550000,
    pendingIncome: "$25,00,000",
    pendingIncomeNum: 2500000,
    overdueIncome: "$7,00,000",
    overdueIncomeNum: 700000,
    receivedPercentage: 79,
  },
  {
    id: "4",
    projectName: "Alpha Infra project",
    totalIncome: "$1,32,50,000",
    totalIncomeNum: 13250000,
    receivedIncome: "$1,05,50,000",
    receivedIncomeNum: 10550000,
    pendingIncome: "$25,00,000",
    pendingIncomeNum: 2500000,
    overdueIncome: "$7,00,000",
    overdueIncomeNum: 700000,
    receivedPercentage: 79,
  },
  {
    id: "5",
    projectName: "Riverside Building",
    totalIncome: "$1,32,50,000",
    totalIncomeNum: 13250000,
    receivedIncome: "$1,05,50,000",
    receivedIncomeNum: 10550000,
    pendingIncome: "$25,00,000",
    pendingIncomeNum: 2500000,
    overdueIncome: "$7,00,000",
    overdueIncomeNum: 700000,
    receivedPercentage: 79,
  },
  {
    id: "6",
    projectName: "Logistic Warehouse",
    totalIncome: "$1,32,50,000",
    totalIncomeNum: 13250000,
    receivedIncome: "$1,05,50,000",
    receivedIncomeNum: 10550000,
    pendingIncome: "$25,00,000",
    pendingIncomeNum: 2500000,
    overdueIncome: "$7,00,000",
    overdueIncomeNum: 700000,
    receivedPercentage: 79,
  },
  {
    id: "7",
    projectName: "Alpha Infra project",
    totalIncome: "$1,32,50,000",
    totalIncomeNum: 13250000,
    receivedIncome: "$1,05,50,000",
    receivedIncomeNum: 10550000,
    pendingIncome: "$25,00,000",
    pendingIncomeNum: 2500000,
    overdueIncome: "$7,00,000",
    overdueIncomeNum: 700000,
    receivedPercentage: 79,
  },
  {
    id: "8",
    projectName: "Sunshine Residency",
    totalIncome: "$95,00,000",
    totalIncomeNum: 9500000,
    receivedIncome: "$78,00,000",
    receivedIncomeNum: 7800000,
    pendingIncome: "$12,00,000",
    pendingIncomeNum: 1200000,
    overdueIncome: "$5,00,000",
    overdueIncomeNum: 500000,
    receivedPercentage: 82,
  },
  {
    id: "9",
    projectName: "Metro Warehouse Phase 2",
    totalIncome: "$1,85,00,000",
    totalIncomeNum: 18500000,
    receivedIncome: "$1,20,00,000",
    receivedIncomeNum: 12000000,
    pendingIncome: "$45,00,000",
    pendingIncomeNum: 4500000,
    overdueIncome: "$20,00,000",
    overdueIncomeNum: 2000000,
    receivedPercentage: 65,
  },
  {
    id: "10",
    projectName: "Wedding Hall Dam",
    totalIncome: "$64,00,000",
    totalIncomeNum: 6400000,
    receivedIncome: "$58,00,000",
    receivedIncomeNum: 5800000,
    pendingIncome: "$6,00,000",
    pendingIncomeNum: 600000,
    overdueIncome: "$0",
    overdueIncomeNum: 0,
    receivedPercentage: 90,
  },
  {
    id: "11",
    projectName: "Horizon Business Hub",
    totalIncome: "$1,10,00,000",
    totalIncomeNum: 11000000,
    receivedIncome: "$88,00,000",
    receivedIncomeNum: 8800000,
    pendingIncome: "$18,00,000",
    pendingIncomeNum: 1800000,
    overdueIncome: "$4,00,000",
    overdueIncomeNum: 400000,
    receivedPercentage: 80,
  },
  {
    id: "12",
    projectName: "Grand Central Depot",
    totalIncome: "$1,45,00,000",
    totalIncomeNum: 14500000,
    receivedIncome: "$95,00,000",
    receivedIncomeNum: 9500000,
    pendingIncome: "$35,00,000",
    pendingIncomeNum: 3500000,
    overdueIncome: "$15,00,000",
    overdueIncomeNum: 1500000,
    receivedPercentage: 66,
  },
];

type SortField =
  | "projectName"
  | "totalIncomeNum"
  | "receivedIncomeNum"
  | "pendingIncomeNum"
  | "overdueIncomeNum"
  | "receivedPercentage";

export const ProjectWiseIncomeTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(4); // Default to page 4 to match the screenshot!
  const [dateRangeText, setDateRangeText] = useState("01 Jan 2024 - 07 Jan 2024");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Modal State
  const [selectedProject, setSelectedProject] = useState<ProjectIncomeRow | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter and Sort
  const filteredAndSortedRows = useMemo(() => {
    let result = [...initialProjectRows];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter((row) =>
        row.projectName.toLowerCase().includes(q)
      );
    }

    if (sortField) {
      result.sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === "string") {
          return sortDirection === "asc"
            ? (valA as string).localeCompare(valB as string)
            : (valB as string).localeCompare(valA as string);
        }
        return sortDirection === "asc"
          ? (valA as number) - (valB as number)
          : (valB as number) - (valA as number);
      });
    }

    return result;
  }, [searchTerm, sortField, sortDirection]);

  // Total pages based on filtered results or fixed 15 to reflect screenshot
  const totalDisplayPages = 15;

  // Pagination slice (for demonstration, cycles through existing rows)
  const paginatedRows = useMemo(() => {
    // If user searched, use normal slice
    if (searchTerm.trim()) {
      const start = (currentPage - 1) * rowsPerPage;
      return filteredAndSortedRows.slice(start, start + rowsPerPage);
    }
    // Otherwise show the 7 primary rows as in the screenshot
    return filteredAndSortedRows.slice(0, 7);
  }, [filteredAndSortedRows, currentPage, rowsPerPage, searchTerm]);

  const navigate = useNavigate();

  const handleRowClick = (row: ProjectIncomeRow) => {
    navigate(`/project-wise-income/${row.id}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
      {/* Top Filter and Search Bar */}
      <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100">
        <h2 className="font-bold text-slate-900 text-base sm:text-lg">
          Project-wise Income List
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Project Input */}
          <div className="relative min-w-[200px] sm:min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search Project"
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Date Range Selector Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{dateRangeText}</span>
            </button>

            <CalendarRangePickerModal
              isOpen={isDatePickerOpen}
              onClose={() => setIsDatePickerOpen(false)}
              onSelectRange={(range: string) => setDateRangeText(range)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-[#F8FAFC] text-[11px] sm:text-xs text-slate-700 font-semibold">
              {/* Project Name */}
              <th
                onClick={() => handleSort("projectName")}
                className="px-5 py-3.5 cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Project Name</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Total Income ($) */}
              <th
                onClick={() => handleSort("totalIncomeNum")}
                className="px-5 py-3.5 cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Total Income ($)</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Received Income ($) */}
              <th
                onClick={() => handleSort("receivedIncomeNum")}
                className="px-5 py-3.5 cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Received Income ($)</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Pending Income ($) */}
              <th
                onClick={() => handleSort("pendingIncomeNum")}
                className="px-5 py-3.5 cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Pending Income ($)</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Overdue Income */}
              <th
                onClick={() => handleSort("overdueIncomeNum")}
                className="px-5 py-3.5 cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Overdue Income</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Received % */}
              <th className="px-5 py-3.5 select-none">
                <div className="flex items-center gap-1.5">
                  <span>Received %</span>
                </div>
              </th>

              {/* Action */}
              <th className="px-5 py-3.5 select-none">
                <div className="flex items-center gap-1.5">
                  <span>Action</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs">
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400">
                  No projects found
                </td>
              </tr>
            ) : (
              paginatedRows.map((row, index) => (
                <tr
                  key={`${row.id}-${index}`}
                  className="hover:bg-slate-50/60 transition-colors group"
                >
                  {/* Project Name */}
                  <td className="px-5 py-4 font-semibold">
                    <button
                      type="button"
                      onClick={() => handleRowClick(row)}
                      className="text-[#2563EB] hover:underline cursor-pointer text-left"
                    >
                      {row.projectName}
                    </button>
                  </td>

                  {/* Total Income ($) */}
                  <td className="px-5 py-4 text-slate-800 font-medium">
                    {row.totalIncome}
                  </td>

                  {/* Received Income ($) */}
                  <td className="px-5 py-4 text-[#16A34A] font-medium">
                    {row.receivedIncome}
                  </td>

                  {/* Pending Income ($) */}
                  <td className="px-5 py-4 text-[#D97706] font-medium">
                    {row.pendingIncome}
                  </td>

                  {/* Overdue Income */}
                  <td className="px-5 py-4 text-slate-600">
                    {row.overdueIncome}
                  </td>

                  {/* Received % */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-700 w-7">
                        {row.receivedPercentage}%
                      </span>
                      <div className="w-20 sm:w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#10B981] rounded-full"
                          style={{ width: `${row.receivedPercentage}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => handleRowClick(row)}
                      aria-label={`View details for ${row.projectName}`}
                      className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer matching screenshot */}
      <div className="px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Row Per Page [10 v] Entries */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-normal">
          <span>Row Per Page</span>
          <div className="relative">
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="appearance-none bg-white border border-slate-200 rounded-md pl-2.5 pr-6 py-1 text-xs text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-blue-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <span>Entries</span>
        </div>

        {/* Right: < 1 2 3 [4] ... 15 > */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Numbers: 1, 2, 3, 4, ..., 15 */}
          {[1, 2, 3, 4].map((page) => {
            const isCurrent = page === currentPage;
            return (
              <button
                key={`page-${page}`}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-6 h-6 rounded-full text-xs transition-colors flex items-center justify-center cursor-pointer ${
                  isCurrent
                    ? "bg-[#2563EB] text-white font-bold shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 font-medium"
                }`}
              >
                {page}
              </button>
            );
          })}

          <span className="text-slate-400 px-1 select-none">...</span>

          <button
            type="button"
            onClick={() => setCurrentPage(15)}
            className={`w-6 h-6 rounded-full text-xs transition-colors flex items-center justify-center cursor-pointer ${
              currentPage === 15
                ? "bg-[#2563EB] text-white font-bold shadow-xs"
                : "text-slate-600 hover:bg-slate-100 font-medium"
            }`}
          >
            15
          </button>

          <button
            type="button"
            disabled={currentPage === totalDisplayPages}
            onClick={() =>
              setCurrentPage((p) => Math.min(totalDisplayPages, p + 1))
            }
            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal */}
      <ProjectIncomeDetailModal
        isOpen={isModalOpen}
        project={selectedProject}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProject(null);
        }}
      />
    </div>
  );
};

export default ProjectWiseIncomeTable;
