import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import Pagination from "./common_components/Pagination";
import { costAnalysisByFilter } from "@/data/mockData";
import { useState } from "react";
import type { TabType } from "@/pages/Dashboard";

/* -------------------- TYPES -------------------- */


type SortKey =
  | "project"
  | "category"
  | "estimated"
  | "actual"
  | "variance"
  | "date"
  | "department";

type SortDirection = "asc" | "desc";

/* -------------------- HELPERS -------------------- */

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Labour":
      return "bg-emerald-50 text-emerald-600";
    case "Material":
      return "bg-blue-50 text-blue-600";
    case "Logistics":
      return "bg-orange-50 text-orange-600";
    default:
      return "bg-gray-50 text-gray-600";
  }
};

const parseCurrency = (value: string) =>
  Number(value.replace(/[^0-9.-]+/g, ""));

const parsePercentage = (value: string) =>
  Number(value.replace("%", "").replace("+", ""));


export default function ProjectCostAnalysisTable({
  activeTab,
}: {
  activeTab: TabType;
}) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDirection, setSortDirection] =
    useState<SortDirection>("asc");

  const rawRows = costAnalysisByFilter[activeTab] ?? [];

  
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const rows = [...rawRows].sort((a, b) => {
    if (!sortKey) return 0;

    let aValue: number | string = "";
    let bValue: number | string = "";

    switch (sortKey) {
      case "project":
        aValue = a.project;
        bValue = b.project;
        break;

      case "category":
        aValue = a.category;
        bValue = b.category;
        break;

      case "estimated":
        aValue = parseCurrency(a.estimated);
        bValue = parseCurrency(b.estimated);
        break;

      case "actual":
        aValue = parseCurrency(a.actual);
        bValue = parseCurrency(b.actual);
        break;

      case "variance":
        aValue = parsePercentage(a.variance);
        bValue = parsePercentage(b.variance);
        break;

      case "date":
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
        break;

      case "department":
        aValue = a.department;
        bValue = b.department;
        break;
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });
const ITEMS_PER_PAGE = 4
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const paginatedRows = rows.slice(startIndex, endIndex);
  return (
    <div className="bg-white rounded-lg xl:p-6 p-4 shadow-sm border border-gray-100">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900">
          Project Cost Analysis
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Detailed breakdown of all project costs and variances
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div
                  onClick={() => handleSort("project")}
                  className="flex items-center gap-1 cursor-pointer hover:text-gray-700"
                >
                  Project
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div
                  onClick={() => handleSort("category")}
                  className="flex items-center gap-1 cursor-pointer hover:text-gray-700"
                >
                  Category
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div
                  onClick={() => handleSort("estimated")}
                  className="flex items-center gap-1 cursor-pointer hover:text-gray-700"
                >
                  Estimated
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div
                  onClick={() => handleSort("actual")}
                  className="flex items-center gap-1 cursor-pointer hover:text-gray-700"
                >
                  Actual
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div
                  onClick={() => handleSort("variance")}
                  className="flex items-center gap-1 cursor-pointer hover:text-gray-700"
                >
                  Variance
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div
                  onClick={() => handleSort("date")}
                  className="flex items-center gap-1 cursor-pointer hover:text-gray-700"
                >
                  Date
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div
                  onClick={() => handleSort("department")}
                  className="flex items-center gap-1 cursor-pointer hover:text-gray-700"
                >
                  Department
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {paginatedRows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-gray-50/50 transition-colors"
              >
                <td className="py-4 px-4 text-sm font-medium text-gray-900">
                  {row.project}
                </td>

                <td className="py-4 px-4 text-sm">
                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-medium",
                      getCategoryColor(row.category)
                    )}
                  >
                    {row.category}
                  </span>
                </td>

                <td className="py-4 px-4 text-sm text-gray-600">
                  {row.estimated}
                </td>

                <td className="py-4 px-4 text-sm text-gray-600">
                  {row.actual}
                </td>

                <td className="py-4 px-4 text-sm">
                  <span
                    className={cn(
                      "font-medium px-2 py-0.5 rounded text-xs",
                      row.varianceColor === "green"
                        ? "text-emerald-600 bg-emerald-50"
                        : "text-red-600 bg-red-50"
                    )}
                  >
                    {row.variance}
                  </span>
                </td>

                <td className="py-4 px-4 text-sm text-gray-600">{row.date}</td>

                <td className="py-4 px-4 text-sm text-gray-600">
                  {row.department}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Pagination
          totalItems={rows.length}
          itemsPerPage={ITEMS_PER_PAGE}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
