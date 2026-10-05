import { Search, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import SectionHeaderWithAction from "./common_components/SectionHeaderWithAction";
import { useEffect, useRef, useState, useMemo } from "react";
import type { ProjectBudgetVsActual } from "@/redux/api/dashboardApi";
import { formatCurrency, formatDate } from "@/lib/dashboardFormatters";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectTableRow {
  id: string;
  project: string;
  material: string;
  estimated: string;
  actual: string;
  variance: string;
  isOver: boolean;
  date: string;
}

interface ProjectDetailsTableProps {
  projects?: ProjectBudgetVsActual[];
  isLoading?: boolean;
}

export default function ProjectDetailsTable({
  projects,
  isLoading,
}: ProjectDetailsTableProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const tableRows: ProjectTableRow[] = useMemo(() => {
    if (projects && projects.length > 0) {
      return projects.map((p) => {
        const isOver = p.varianceDirection === "over";
        return {
          id: p.leadId || p.jobId,
          project: p.projectName,
          material: formatCurrency(p.material),
          estimated: formatCurrency(p.estimated),
          actual: formatCurrency(p.actual),
          variance: formatCurrency(Math.abs(p.variance)),
          isOver,
          date: formatDate(p.date),
        };
      });
    }

    return [];
  }, [projects]);

  const filteredData: ProjectTableRow[] = useMemo(() => {
    if (!searchQuery.trim()) return tableRows;
    const query = searchQuery.toLowerCase();

    return tableRows.filter((item: ProjectTableRow) =>
      item.project.toLowerCase().includes(query) ||
      item.material.toLowerCase().includes(query) ||
      item.estimated.toLowerCase().includes(query) ||
      item.actual.toLowerCase().includes(query) ||
      item.variance.toLowerCase().includes(query) ||
      item.date.toLowerCase().includes(query)
    );
  }, [tableRows, searchQuery]);

  return (
    <div className="bg-white rounded-md xl:p-6 p-4 border border-gray-100/50 md:min-h-[400px] overflow-x-auto">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1 flex-wrap">
          <SectionHeaderWithAction
            title="Project Details"
            subtitle="Project budget vs actual tracking"
            actionLabel=""
            showIcon={false}
          />
        </div>
        <div className="flex items-center gap-3 text-gray-400 relative">
          {/* Search Input */}
          {isOpen && (
            <div className="flex items-center bg-[#F8F9FA] rounded-md px-4 py-1 flex-1 max-w-sm border border-[#9CA3AF] focus-within:border-[#9CA3AF] focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <Search className="w-5 h-5 text-[#9CA3AF] mr-2" />
              <input
                type="text"
                placeholder="Search projects..."
                className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400"
                ref={inputRef}
                onBlur={() => setIsOpen(false)}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}

          {/* Search Icon */}
          {!isOpen && (
            <Search
              className="w-5 h-5 cursor-pointer hover:text-gray-600 transition-colors"
              onClick={() => setIsOpen(true)}
            />
          )}
        </div>
      </div>

      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="pb-4 font-semibold text-gray-900 text-sm">
                Project
              </th>
              <th className="pb-4 font-semibold text-gray-900 text-sm">
                Material
              </th>
              <th className="pb-4 font-semibold text-gray-900 text-sm">
                Estimated
              </th>
              <th className="pb-4 font-semibold text-gray-900 text-sm">
                Actual
              </th>
              <th className="pb-4 font-semibold text-gray-900 text-sm">
                Variance
              </th>
              <th className="pb-4 font-semibold text-gray-900 text-sm">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <tr key={idx}>
                  <td className="py-4">
                    <Skeleton className="h-4 w-40" />
                  </td>
                  <td className="py-4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="py-4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="py-4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="py-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </td>
                  <td className="py-4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                </tr>
              ))
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-gray-400">
                  No project budget records found
                </td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 text-sm text-gray-700 font-medium">
                    {item.project}
                  </td>
                  <td className="py-4 text-sm text-gray-600">{item.material}</td>
                  <td className="py-4 text-sm text-gray-600">{item.estimated}</td>
                  <td className="py-4 text-sm text-gray-600">{item.actual}</td>
                  <td className="py-4">
                    <div
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-normal",
                        !item.isOver
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-red-50 text-red-600"
                      )}
                    >
                      {!item.isOver ? (
                        <ArrowDown className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowUp className="w-3.5 h-3.5" />
                      )}
                      {item.variance}
                    </div>
                  </td>
                  <td className="py-4 text-sm text-gray-500 font-normal">
                    {item.date}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
