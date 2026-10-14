import React, { useState, useMemo } from "react";
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

export interface PartCostItem {
  id: string;
  partName: string;
  partColour: string;
  costUnit: string;
  mbsCost: number | string;
  currentMarketCost: string;
  description: string;
}

// Exactly matches the items from the user's provided screenshot
export const INITIAL_PART_COST_DATA: PartCostItem[] = [
  {
    id: "1",
    partName: "'30_VRR48'",
    partColour: "'-'",
    costUnit: "'FT'",
    mbsCost: 2.6,
    currentMarketCost: "-",
    description: "'VRR+ Insul R10'",
  },
  {
    id: "2",
    partName: "'30_VRR72'",
    partColour: "'-'",
    costUnit: "'FT'",
    mbsCost: 3.9,
    currentMarketCost: "-",
    description: "'VRR+ Insul R10'",
  },
  {
    id: "3",
    partName: "'35_VRR48'",
    partColour: "'-'",
    costUnit: "'FT'",
    mbsCost: 2.9,
    currentMarketCost: "-",
    description: "'VRR+ Insul R11'",
  },
  {
    id: "4",
    partName: "'35_VRR72'",
    partColour: "'-'",
    costUnit: "'FT'",
    mbsCost: 4.4,
    currentMarketCost: "-",
    description: "'VRR+ Insul R11'",
  },
  {
    id: "5",
    partName: "'40_VRR48'",
    partColour: "'-'",
    costUnit: "'FT'",
    mbsCost: 3.3,
    currentMarketCost: "-",
    description: "'VRR+ Insul R13'",
  },
  {
    id: "6",
    partName: "'40_VRR72'",
    partColour: "'-'",
    costUnit: "'FT'",
    mbsCost: 4.9,
    currentMarketCost: "-",
    description: "'VRR+ Insul R13'",
  },
  {
    id: "7",
    partName: "'60_VRR48'",
    partColour: "'-'",
    costUnit: "'FT'",
    mbsCost: 4.2,
    currentMarketCost: "-",
    description: "'VRR+ Insul R19'",
  },
  {
    id: "8",
    partName: "'60_VRR72'",
    partColour: "'-'",
    costUnit: "'FT'",
    mbsCost: 6.3,
    currentMarketCost: "-",
    description: "'VRR+ Insul R19'",
  },
  {
    id: "9",
    partName: "'30_UF48 '",
    partColour: "'-'",
    costUnit: "'FT'",
    mbsCost: 2.6,
    currentMarketCost: "-",
    description: "-",
  },
  {
    id: "10",
    partName: "'30_UF72 '",
    partColour: "'-'",
    costUnit: "'FT'",
    mbsCost: 3.9,
    currentMarketCost: "-",
    description: "'UF Insul R10 '",
  },
  {
    id: "11",
    partName: "'35_UF48 '",
    partColour: "'-'",
    costUnit: "'FT'",
    mbsCost: 2.9,
    currentMarketCost: "-",
    description: "'UF Insul R10 '",
  },
  {
    id: "12",
    partName: "'35_UF72 '",
    partColour: "'-'",
    costUnit: "'FT'",
    mbsCost: 4.4,
    currentMarketCost: "-",
    description: "'UF Insul R11 '",
  },
  {
    id: "13",
    partName: "'40_UF48 '",
    partColour: "'-'",
    costUnit: "'FT'",
    mbsCost: 2.9,
    currentMarketCost: "-",
    description: "'UF Insul R11 '",
  },
  {
    id: "14",
    partName: "'40_UF72 ' '",
    partColour: "'-'",
    costUnit: "'FT'",
    mbsCost: 4.4,
    currentMarketCost: "-",
    description: "'UF Insul R13 '",
  },
  {
    id: "15",
    partName: "'60_UF48 '",
    partColour: "'-'",
    costUnit: "'FT'",
    mbsCost: 3.3,
    currentMarketCost: "-",
    description: "'UF Insul R13 '",
  },
  {
    id: "16",
    partName: "'60_UF72 '",
    partColour: "'-'",
    costUnit: "'FT'",
    mbsCost: 4.9,
    currentMarketCost: "-",
    description: "'UF Insul R19 '",
  },
  {
    id: "17",
    partName: "'R30_FG9.5'",
    partColour: "'-'",
    costUnit: "'FT'",
    mbsCost: 4.2,
    currentMarketCost: "-",
    description: "'UF Insul R19 '",
  },
  {
    id: "18",
    partName: "'R30_FG10'",
    partColour: "'-'",
    costUnit: "'FT'",
    mbsCost: 6.3,
    currentMarketCost: "-",
    description: "'Fiber Glass 9.5'",
  },
  {
    id: "19",
    partName: "'R30_MW7.5'",
    partColour: "'-'",
    costUnit: "'FT'",
    mbsCost: 4.1,
    currentMarketCost: "-",
    description: "'Fiber Glass 10'",
  },
  {
    id: "20",
    partName: "'R30_SF'",
    partColour: "'-'",
    costUnit: "'FT'",
    mbsCost: 4.5,
    currentMarketCost: "-",
    description: "'Mineral Wool 7.5'",
  },
];

type SortField =
  | "partName"
  | "partColour"
  | "costUnit"
  | "mbsCost"
  | "currentMarketCost"
  | "description";

export const ItemCostListPage: React.FC = () => {
  const [data] = useState<PartCostItem[]>(INITIAL_PART_COST_DATA);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedSortBy, setSelectedSortBy] = useState("Latest");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [selectedUnitFilter, setSelectedUnitFilter] = useState("All");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

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
    let result = [...data];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.partName.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.costUnit.toLowerCase().includes(q),
      );
    }

    if (selectedUnitFilter !== "All") {
      result = result.filter(
        (item) => item.costUnit.replace(/'/g, "") === selectedUnitFilter,
      );
    }

    if (sortField) {
      result.sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];

        if (typeof valA === "number" && typeof valB === "number") {
          return sortDirection === "asc" ? valA - valB : valB - valA;
        }

        const strA = String(valA);
        const strB = String(valB);
        return sortDirection === "asc"
          ? strA.localeCompare(strB)
          : strB.localeCompare(strA);
      });
    }

    return result;
  }, [data, searchTerm, selectedUnitFilter, sortField, sortDirection]);

  // Export to Excel / CSV
  const handleExport = () => {
    const exportRows = filteredData.map((item) => ({
      "Part Name": item.partName.replace(/'/g, ""),
      "Part Colour": item.partColour.replace(/'/g, ""),
      "Cost Unit": item.costUnit.replace(/'/g, ""),
      "MBS Cost": item.mbsCost,
      "Current Market Cost": item.currentMarketCost,
      Description: item.description.replace(/'/g, ""),
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
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1.5">
              $24,400
            </p>
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
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1.5">
              120
            </p>
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
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1.5">
              2
            </p>
          </div>
          <div className="text-white/90 pr-2">
            <FileText className="w-9 h-9 stroke-[2]" />
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
              placeholder="Search"
              className="w-48 sm:w-56 pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] shadow-2xs transition-colors"
            />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFilterDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Filter</span>
            </button>

            {isFilterDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-40 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Cost Unit
                </div>
                {["All", "FT"].map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => {
                      setSelectedUnitFilter(unit);
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

        {/* Right side: Sort by : Latest dropdown */}
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
            <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95">
              {["Latest", "Part Name (A-Z)", "MBS Cost (Low to High)", "MBS Cost (High to Low)"].map(
                (sortOption) => (
                  <button
                    key={sortOption}
                    type="button"
                    onClick={() => {
                      setSelectedSortBy(sortOption);
                      if (sortOption === "Part Name (A-Z)") {
                        setSortField("partName");
                        setSortDirection("asc");
                      } else if (sortOption === "MBS Cost (Low to High)") {
                        setSortField("mbsCost");
                        setSortDirection("asc");
                      } else if (sortOption === "MBS Cost (High to Low)") {
                        setSortField("mbsCost");
                        setSortDirection("desc");
                      } else {
                        setSortField(null);
                      }
                      setIsSortDropdownOpen(false);
                    }}
                    className={`w-full px-3.5 py-1.5 text-left text-xs flex items-center justify-between cursor-pointer ${
                      selectedSortBy === sortOption
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-slate-700 hover:bg-slate-50 font-normal"
                    }`}
                  >
                    <span>{sortOption}</span>
                    {selectedSortBy === sortOption && <span>✓</span>}
                  </button>
                ),
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4. Section Heading: Part Cost List */}
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
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-900">
                <th
                  onClick={() => handleSort("partName")}
                  className="py-3 px-5 whitespace-nowrap cursor-pointer hover:bg-slate-50/70 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Part Name</span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort("partColour")}
                  className="py-3 px-5 whitespace-nowrap cursor-pointer hover:bg-slate-50/70 select-none"
                >
                  <div className="flex items-center gap-1 text-slate-700">
                    <span>Part Colour</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("costUnit")}
                  className="py-3 px-5 whitespace-nowrap cursor-pointer hover:bg-slate-50/70 select-none"
                >
                  <div className="flex items-center gap-1 text-slate-700">
                    <span>Cost Unit</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("mbsCost")}
                  className="py-3 px-5 whitespace-nowrap cursor-pointer hover:bg-slate-50/70 select-none"
                >
                  <div className="flex items-center gap-1 text-slate-700">
                    <span>MBS Cost</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("currentMarketCost")}
                  className="py-3 px-5 whitespace-nowrap cursor-pointer hover:bg-slate-50/70 select-none"
                >
                  <div className="flex items-center gap-1 text-slate-700">
                    <span>Current Market Cost</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("description")}
                  className="py-3 px-5 whitespace-nowrap cursor-pointer hover:bg-slate-50/70 select-none"
                >
                  <div className="flex items-center gap-1 text-slate-700">
                    <span>Description</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-[13px] text-slate-700">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 text-sm">
                    No items found matching your filter.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="py-3.5 px-5 whitespace-nowrap font-medium text-slate-800">
                      {item.partName}
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap text-slate-600">
                      {item.partColour}
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap text-slate-600">
                      {item.costUnit}
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap font-medium text-slate-700">
                      {item.mbsCost}
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap text-slate-500">
                      {item.currentMarketCost}
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap text-slate-600">
                      {item.description}
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
            Showing {filteredData.length} of {data.length} entries
          </span>
          <div className="flex items-center gap-1 text-slate-600">
            <button
              type="button"
              disabled
              className="p-1 rounded border border-slate-200 text-slate-300 cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 py-0.5 text-xs font-semibold bg-[#2563EB] text-white rounded">
              1
            </span>
            <button
              type="button"
              disabled
              className="p-1 rounded border border-slate-200 text-slate-300 cursor-not-allowed"
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
