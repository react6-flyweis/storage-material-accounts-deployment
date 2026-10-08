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
import CalendarRangePickerModal from "@/components/common_components/CalendarRangePickerModal";

export interface ProjectExpenseRow {
  id: string;
  projectName: string;
  totalExpense: string;
  totalExpenseNum: number;
  approvedExpense: string;
  approvedExpenseNum: number;
  pendingApproval: string;
  pendingApprovalNum: number;
  budgetedExpense: string;
  budgetedExpenseNum: number;
  budgetVariance: string;
  variancePercentage: string;
}

const initialExpenseRows: ProjectExpenseRow[] = [
  {
    id: "1",
    projectName: "Alpha Infra project",
    totalExpense: "$1,28,40,000",
    totalExpenseNum: 12840000,
    approvedExpense: "$1,12,30,000",
    approvedExpenseNum: 11230000,
    pendingApproval: "$16,10,000",
    pendingApprovalNum: 1610000,
    budgetedExpense: "$7,00,000",
    budgetedExpenseNum: 700000,
    budgetVariance: "-8,60,000",
    variancePercentage: "-4.89%",
  },
  {
    id: "2",
    projectName: "Riverside Building",
    totalExpense: "$1,32,50,000",
    totalExpenseNum: 13250000,
    approvedExpense: "$1,05,50,000",
    approvedExpenseNum: 10550000,
    pendingApproval: "$25,00,000",
    pendingApprovalNum: 2500000,
    budgetedExpense: "$7,00,000",
    budgetedExpenseNum: 700000,
    budgetVariance: "-3,25,000",
    variancePercentage: "-4.89%",
  },
  {
    id: "3",
    projectName: "Logistic Warehouse",
    totalExpense: "$1,28,40,000",
    totalExpenseNum: 12840000,
    approvedExpense: "$1,12,30,000",
    approvedExpenseNum: 11230000,
    pendingApproval: "$16,10,000",
    pendingApprovalNum: 1610000,
    budgetedExpense: "$7,00,000",
    budgetedExpenseNum: 700000,
    budgetVariance: "-8,60,000",
    variancePercentage: "-4.89%",
  },
  {
    id: "4",
    projectName: "Alpha Infra project",
    totalExpense: "$1,32,50,000",
    totalExpenseNum: 13250000,
    approvedExpense: "$1,05,50,000",
    approvedExpenseNum: 10550000,
    pendingApproval: "$25,00,000",
    pendingApprovalNum: 2500000,
    budgetedExpense: "$7,00,000",
    budgetedExpenseNum: 700000,
    budgetVariance: "-3,25,000",
    variancePercentage: "-4.89%",
  },
  {
    id: "5",
    projectName: "Riverside Building",
    totalExpense: "$1,28,40,000",
    totalExpenseNum: 12840000,
    approvedExpense: "$1,12,30,000",
    approvedExpenseNum: 11230000,
    pendingApproval: "$16,10,000",
    pendingApprovalNum: 1610000,
    budgetedExpense: "$7,00,000",
    budgetedExpenseNum: 700000,
    budgetVariance: "-8,60,000",
    variancePercentage: "-4.89%",
  },
  {
    id: "6",
    projectName: "Logistic Warehouse",
    totalExpense: "$1,32,50,000",
    totalExpenseNum: 13250000,
    approvedExpense: "$1,05,50,000",
    approvedExpenseNum: 10550000,
    pendingApproval: "$25,00,000",
    pendingApprovalNum: 2500000,
    budgetedExpense: "$7,00,000",
    budgetedExpenseNum: 700000,
    budgetVariance: "-3,25,000",
    variancePercentage: "-4.89%",
  },
  {
    id: "7",
    projectName: "Alpha Infra project",
    totalExpense: "$1,28,40,000",
    totalExpenseNum: 12840000,
    approvedExpense: "$1,12,30,000",
    approvedExpenseNum: 11230000,
    pendingApproval: "$16,10,000",
    pendingApprovalNum: 1610000,
    budgetedExpense: "$7,00,000",
    budgetedExpenseNum: 700000,
    budgetVariance: "-8,60,000",
    variancePercentage: "-4.89%",
  },
];

type SortField =
  | "projectName"
  | "totalExpenseNum"
  | "approvedExpenseNum"
  | "pendingApprovalNum"
  | "budgetedExpenseNum";

export const ProjectWiseExpenseTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(4); // Default to 4 matching screenshot
  const [dateRangeText, setDateRangeText] = useState(
    "01 Jan 2024 - 07 Jan 2024"
  );
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<ProjectExpenseRow | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedRows = useMemo(() => {
    let result = [...initialExpenseRows];

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

  const totalDisplayPages = 15;

  const navigate = useNavigate();

  const handleRowClick = (row: ProjectExpenseRow) => {
    navigate(`/project-wise-expense/${row.id}`);
  };

  const paginatedRows = useMemo(() => {
    if (searchTerm.trim()) {
      const start = (currentPage - 1) * rowsPerPage;
      return filteredAndSortedRows.slice(start, start + rowsPerPage);
    }
    return filteredAndSortedRows.slice(0, 7);
  }, [filteredAndSortedRows, currentPage, rowsPerPage, searchTerm]);

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
      {/* Top Filter and Search Bar */}
      <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100">
        <h2 className="font-bold text-slate-900 text-base sm:text-lg">
          Project-wise Expense List
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

              {/* Total Expense ($) */}
              <th
                onClick={() => handleSort("totalExpenseNum")}
                className="px-5 py-3.5 cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Total Expense ($)</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Approved Expense ($) */}
              <th
                onClick={() => handleSort("approvedExpenseNum")}
                className="px-5 py-3.5 cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Approved Expense ($)</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Pending Approval ($) */}
              <th
                onClick={() => handleSort("pendingApprovalNum")}
                className="px-5 py-3.5 cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Pending Approval ($)</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Budgeted Expense */}
              <th
                onClick={() => handleSort("budgetedExpenseNum")}
                className="px-5 py-3.5 cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Budgeted Expense</span>
                </div>
              </th>

              {/* Budget Varience */}
              <th className="px-5 py-3.5 select-none">
                <div className="flex items-center gap-1.5">
                  <span>Budget Varience</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Variance % */}
              <th className="px-5 py-3.5 select-none">
                <div className="flex items-center gap-1.5">
                  <span>Variance %</span>
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
                <td colSpan={8} className="text-center py-8 text-slate-400">
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
                      className="text-[#2563EB] hover:underline cursor-pointer text-left font-semibold"
                    >
                      {row.projectName}
                    </button>
                  </td>

                  {/* Total Expense ($) */}
                  <td className="px-5 py-4 text-slate-800 font-medium">
                    {row.totalExpense}
                  </td>

                  {/* Approved Expense ($) */}
                  <td className="px-5 py-4 text-[#16A34A] font-medium">
                    {row.approvedExpense}
                  </td>

                  {/* Pending Approval ($) */}
                  <td className="px-5 py-4 text-[#D97706] font-medium">
                    {row.pendingApproval}
                  </td>

                  {/* Budgeted Expense */}
                  <td className="px-5 py-4 text-slate-700 font-medium">
                    {row.budgetedExpense}
                  </td>

                  {/* Budget Varience */}
                  <td className="px-5 py-4 text-slate-600">
                    {row.budgetVariance}
                  </td>

                  {/* Variance % badge */}
                  <td className="px-5 py-4">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {row.variancePercentage}
                    </span>
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

      {/* Pagination Footer */}
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

      {/* Quick Row Detail Modal */}
      {selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-sm p-5 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              {selectedRow.projectName}
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Total Expense:</span>
                <span className="font-semibold text-slate-900">
                  {selectedRow.totalExpense}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Approved Expense:</span>
                <span className="font-semibold text-[#16A34A]">
                  {selectedRow.approvedExpense}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Pending Approval:</span>
                <span className="font-semibold text-[#D97706]">
                  {selectedRow.pendingApproval}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Budgeted Expense:</span>
                <span className="font-semibold text-slate-900">
                  {selectedRow.budgetedExpense}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Budget Variance:</span>
                <span className="font-semibold text-slate-700">
                  {selectedRow.budgetVariance}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Variance %:</span>
                <span className="font-semibold text-emerald-600">
                  {selectedRow.variancePercentage}
                </span>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedRow(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectWiseExpenseTable;
