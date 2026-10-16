import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  ChevronDown,
  TrendingUp,
  FileText,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import * as XLSX from "xlsx";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetItemListSummaryQuery,
  useGetItemListRecordsQuery,
  useGetItemListCategoriesQuery,
  type ItemCostRecord,
} from "@/redux/api/costsApi";

type SortField =
  | "partName"
  | "partColour"
  | "costUnit"
  | "mbsCost"
  | "currentMarketCost"
  | "description";

export const ItemCostListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedUnitFilter, setSelectedUnitFilter] = useState("All");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [selectedSortBy, setSelectedSortBy] = useState("Latest");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // RTK Query API Hooks
  const { data: statsData, isLoading: isStatsLoading } = useGetItemListSummaryQuery();
  const { data: categoriesData } = useGetItemListCategoriesQuery();
  const {
    data: recordsData,
    isLoading: isRecordsLoading,
  } = useGetItemListRecordsQuery({
    search: debouncedSearch || undefined,
  });

  const apiRows: ItemCostRecord[] = useMemo(() => {
    return recordsData?.rows ?? [];
  }, [recordsData]);

  // Dynamic filter options from API categories or unique cost units
  const availableUnits = useMemo(() => {
    const set = new Set<string>();
    apiRows.forEach((r) => {
      if (r.costUnit) set.add(r.costUnit.replace(/'/g, "").trim());
    });
    if (categoriesData && Array.isArray(categoriesData)) {
      categoriesData.forEach((c) => set.add(c.trim()));
    }
    return ["All", ...Array.from(set).filter(Boolean)];
  }, [apiRows, categoriesData]);

  // Calculated Stats
  const totalItemCost =
    statsData?.totalItemCost ??
    recordsData?.stats?.totalItemCost ??
    apiRows.reduce((acc, r) => acc + (Number(r.mbsCost) || 0), 0);

  const totalItems =
    statsData?.totalItems ??
    recordsData?.stats?.totalItems ??
    recordsData?.total ??
    apiRows.length;

  const newAdded =
    statsData?.newAdded ??
    recordsData?.stats?.newAdded ??
    0;

  // Sorting handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filtered & Sorted items
  const filteredData = useMemo(() => {
    let result = [...apiRows];

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (item) =>
          (item.partName && item.partName.toLowerCase().includes(q)) ||
          (item.description && item.description.toLowerCase().includes(q)) ||
          (item.costUnit && item.costUnit.toLowerCase().includes(q)) ||
          (item.category && item.category.toLowerCase().includes(q)),
      );
    }

    if (selectedUnitFilter !== "All") {
      result = result.filter(
        (item) =>
          item.costUnit?.replace(/'/g, "").trim().toLowerCase() ===
            selectedUnitFilter.toLowerCase() ||
          item.category?.trim().toLowerCase() === selectedUnitFilter.toLowerCase(),
      );
    }

    if (sortField) {
      result.sort((a, b) => {
        const valA = a[sortField as keyof ItemCostRecord];
        const valB = b[sortField as keyof ItemCostRecord];

        if (typeof valA === "number" && typeof valB === "number") {
          return sortDirection === "asc" ? valA - valB : valB - valA;
        }

        const strA = String(valA ?? "");
        const strB = String(valB ?? "");
        return sortDirection === "asc"
          ? strA.localeCompare(strB)
          : strB.localeCompare(strA);
      });
    }

    return result;
  }, [apiRows, debouncedSearch, selectedUnitFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Export to Excel / CSV
  const handleExport = () => {
    const exportRows = filteredData.map((item) => ({
      "Part Name": item.partName?.replace(/'/g, "") ?? "",
      "Part Colour": item.partColour?.replace(/'/g, "") ?? "-",
      "Cost Unit": item.costUnit?.replace(/'/g, "") ?? "-",
      "MBS Cost": item.mbsCost,
      "Current Market Cost": item.currentMarketCost ?? "-",
      Description: item.description?.replace(/'/g, "") ?? "-",
      Category: item.category ?? "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Item Cost List");
    XLSX.writeFile(
      workbook,
      `Item_Cost_List_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 1. Header Title & Export Button */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1E293B] tracking-tight">
          Item Cost List
        </h1>

        <button
          type="button"
          onClick={handleExport}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export</span>
        </button>
      </div>

      {/* 2. Three Top Stat Cards precisely styled as in image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Total Item Cost (Vibrant Blue) */}
        <div className="bg-[#2563EB] text-white rounded-2xl p-5 shadow-sm flex items-center justify-between transition-transform hover:-translate-y-0.5">
          <div>
            <p className="text-xs sm:text-[13px] font-medium text-blue-100">
              Total Item Cost
            </p>
            {isStatsLoading || isRecordsLoading ? (
              <Skeleton className="h-8 w-28 bg-white/20 rounded mt-1.5" />
            ) : (
              <p className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1.5">
                ${Number(totalItemCost || 0).toLocaleString()}
              </p>
            )}
          </div>
          <div className="text-white/90 pr-2">
            <DollarSign className="w-9 h-9 stroke-[2.2]" />
          </div>
        </div>

        {/* Card 2: Total Items (Vibrant Emerald Green) */}
        <div className="bg-[#059669] text-white rounded-2xl p-5 shadow-sm flex items-center justify-between transition-transform hover:-translate-y-0.5">
          <div>
            <p className="text-xs sm:text-[13px] font-medium text-emerald-100">
              Total Items
            </p>
            {isStatsLoading || isRecordsLoading ? (
              <Skeleton className="h-8 w-16 bg-white/20 rounded mt-1.5" />
            ) : (
              <p className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1.5">
                {Number(totalItems || 0).toLocaleString()}
              </p>
            )}
          </div>
          <div className="text-white/90 pr-2">
            <TrendingUp className="w-9 h-9 stroke-[2.2]" />
          </div>
        </div>

        {/* Card 3: New Added (Vibrant Orange) */}
        <div className="bg-[#EA580C] text-white rounded-2xl p-5 shadow-sm flex items-center justify-between transition-transform hover:-translate-y-0.5 sm:col-span-2 lg:col-span-1">
          <div>
            <p className="text-xs sm:text-[13px] font-medium text-orange-100">
              New Added
            </p>
            {isStatsLoading || isRecordsLoading ? (
              <Skeleton className="h-8 w-14 bg-white/20 rounded mt-1.5" />
            ) : (
              <p className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1.5">
                {Number(newAdded || 0).toLocaleString()}
              </p>
            )}
          </div>
          <div className="text-white/90 pr-2">
            <FileText className="w-9 h-9 stroke-2" />
          </div>
        </div>
      </div>

      {/* 3. Search, Filter & Sort Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        {/* Left side: Search input + Filter button */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search part name, unit, category..."
              className="w-48 sm:w-64 pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] shadow-2xs transition-colors"
            />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFilterDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Unit: {selectedUnitFilter}</span>
            </button>

            {isFilterDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95 max-h-60 overflow-y-auto">
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Cost Unit / Category
                </div>
                {availableUnits.map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => {
                      setSelectedUnitFilter(unit);
                      setCurrentPage(1);
                      setIsFilterDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between cursor-pointer ${
                      selectedUnitFilter === unit
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-slate-700 hover:bg-slate-50 font-normal"
                    }`}
                  >
                    <span>{unit === "All" ? "All Units" : unit}</span>
                    {selectedUnitFilter === unit && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side: Sort by dropdown */}
        <div className="relative self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setIsSortDropdownOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span>Sort by : {selectedSortBy}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isSortDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95">
              {[
                { label: "Latest", field: null, dir: "asc" as const },
                { label: "Part Name (A-Z)", field: "partName" as const, dir: "asc" as const },
                { label: "Part Name (Z-A)", field: "partName" as const, dir: "desc" as const },
                { label: "MBS Cost (Low to High)", field: "mbsCost" as const, dir: "asc" as const },
                { label: "MBS Cost (High to Low)", field: "mbsCost" as const, dir: "desc" as const },
              ].map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => {
                    setSelectedSortBy(opt.label);
                    setSortField(opt.field);
                    setSortDirection(opt.dir);
                    setIsSortDropdownOpen(false);
                  }}
                  className={`w-full px-3.5 py-1.5 text-left text-xs flex items-center justify-between cursor-pointer ${
                    selectedSortBy === opt.label
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-slate-700 hover:bg-slate-50 font-normal"
                  }`}
                >
                  <span>{opt.label}</span>
                  {selectedSortBy === opt.label && <span>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Section Heading */}
      <div>
        <h2 className="text-sm sm:text-base font-bold text-[#0F172A] tracking-tight">
          Part Cost List
        </h2>
      </div>

      {/* 5. Part Cost List Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-900 bg-slate-50/50">
                <th
                  onClick={() => handleSort("partName")}
                  className="py-3 px-5 whitespace-nowrap cursor-pointer hover:bg-slate-100/70 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Part Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("partColour")}
                  className="py-3 px-5 whitespace-nowrap cursor-pointer hover:bg-slate-100/70 select-none"
                >
                  <div className="flex items-center gap-1 text-slate-700">
                    <span>Part Colour</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("costUnit")}
                  className="py-3 px-5 whitespace-nowrap cursor-pointer hover:bg-slate-100/70 select-none"
                >
                  <div className="flex items-center gap-1 text-slate-700">
                    <span>Cost Unit</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("mbsCost")}
                  className="py-3 px-5 whitespace-nowrap cursor-pointer hover:bg-slate-100/70 select-none"
                >
                  <div className="flex items-center gap-1 text-slate-700">
                    <span>MBS Cost</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("currentMarketCost")}
                  className="py-3 px-5 whitespace-nowrap cursor-pointer hover:bg-slate-100/70 select-none"
                >
                  <div className="flex items-center gap-1 text-slate-700">
                    <span>Current Market Cost</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("description")}
                  className="py-3 px-5 whitespace-nowrap cursor-pointer hover:bg-slate-100/70 select-none"
                >
                  <div className="flex items-center gap-1 text-slate-700">
                    <span>Description</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-[13px] text-slate-700">
              {isRecordsLoading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3.5 px-5">
                      <Skeleton className="h-4 w-28 rounded bg-slate-200" />
                    </td>
                    <td className="py-3.5 px-5">
                      <Skeleton className="h-4 w-12 rounded bg-slate-200" />
                    </td>
                    <td className="py-3.5 px-5">
                      <Skeleton className="h-4 w-12 rounded bg-slate-200" />
                    </td>
                    <td className="py-3.5 px-5">
                      <Skeleton className="h-4 w-16 rounded bg-slate-200" />
                    </td>
                    <td className="py-3.5 px-5">
                      <Skeleton className="h-4 w-16 rounded bg-slate-200" />
                    </td>
                    <td className="py-3.5 px-5">
                      <Skeleton className="h-4 w-36 rounded bg-slate-200" />
                    </td>
                  </tr>
                ))
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                    No items found matching your filter.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, idx) => (
                  <tr
                    key={item._id || item.itemId || item.id || idx}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="py-3.5 px-5 whitespace-nowrap font-medium text-slate-800">
                      {item.partName}
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap text-slate-600">
                      {item.partColour || "-"}
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap text-slate-600">
                      {item.costUnit || "-"}
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap font-medium text-slate-700">
                      {item.mbsCost != null
                        ? typeof item.mbsCost === "number"
                          ? `$${item.mbsCost.toFixed(2)}`
                          : item.mbsCost
                        : "-"}
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap text-slate-500">
                      {item.currentMarketCost != null
                        ? typeof item.currentMarketCost === "number"
                          ? `$${item.currentMarketCost.toFixed(2)}`
                          : item.currentMarketCost
                        : "-"}
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap text-slate-600">
                      {item.description || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Bottom Footer info */}
        <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-white">
          <span>
            Showing {filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
          </span>
          <div className="flex items-center gap-1 text-slate-600">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-[#2563EB] text-white rounded">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemCostListPage;
