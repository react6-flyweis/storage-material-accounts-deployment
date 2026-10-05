import { Search, Filter, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import SectionHeaderWithAction from "./common_components/SectionHeaderWithAction";
import { useEffect, useRef, useState } from "react";
export const tableDataByFilter:any = {
  today: [
    {
      project: "Downtown Office Complex",
      material: "$45,000",
      estimated: "$42,000",
      actual: "$46,500",
      variance: "$4,500",
      varianceType: "negative",
      date: "2026-01-12",
    },
    {
      project: "Residential Tower A",
      material: "$32,000",
      estimated: "$34,000",
      actual: "$31,500",
      variance: "$2,500",
      varianceType: "positive",
      date: "2026-01-12",
    },
    {
      project: "Shopping Mall Renovation",
      material: "$28,000",
      estimated: "$27,500",
      actual: "$28,500",
      variance: "$1,000",
      varianceType: "negative",
      date: "2026-01-12",
    },
  ],

  week: [
    {
      project: "Downtown Office Complex",
      material: "$450,000",
      estimated: "$420,000",
      actual: "$465,000",
      variance: "$45,000",
      varianceType: "negative",
      date: "2026-01-08",
    },
    {
      project: "Residential Tower A",
      material: "$320,000",
      estimated: "$340,000",
      actual: "$315,000",
      variance: "$25,000",
      varianceType: "positive",
      date: "2026-01-09",
    },
    {
      project: "Shopping Mall Renovation",
      material: "$280,000",
      estimated: "$275,000",
      actual: "$285,000",
      variance: "$10,000",
      varianceType: "negative",
      date: "2026-01-10",
    },
    {
      project: "Industrial Warehouse",
      material: "$180,000",
      estimated: "$190,000",
      actual: "$175,000",
      variance: "$15,000",
      varianceType: "positive",
      date: "2026-01-11",
    },
  ],

  month: [
    {
      project: "Downtown Office Complex",
      material: "$1,250,000",
      estimated: "$1,180,000",
      actual: "$1,310,000",
      variance: "$130,000",
      varianceType: "negative",
      date: "2026-01-01",
    },
    {
      project: "Residential Tower A",
      material: "$980,000",
      estimated: "$1,020,000",
      actual: "$960,000",
      variance: "$60,000",
      varianceType: "positive",
      date: "2026-01-05",
    },
    {
      project: "Shopping Mall Renovation",
      material: "$840,000",
      estimated: "$820,000",
      actual: "$860,000",
      variance: "$40,000",
      varianceType: "negative",
      date: "2026-01-09",
    },
    {
      project: "Industrial Warehouse",
      material: "$640,000",
      estimated: "$610,000",
      actual: "$590,000",
      variance: "$20,000",
      varianceType: "positive",
      date: "2026-01-14",
    },
    {
      project: "Hospital Extension",
      material: "$1,520,000",
      estimated: "$1,480,000",
      actual: "$1,565,000",
      variance: "$85,000",
      varianceType: "negative",
      date: "2026-01-18",
    },
    {
      project: "School Building",
      material: "$720,000",
      estimated: "$700,000",
      actual: "$680,000",
      variance: "$20,000",
      varianceType: "positive",
      date: "2026-01-22",
    },
  ],
};


export default function ProjectDetailsTable() {
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState("today");
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);
  const rawData = tableDataByFilter[filter];

const filteredData = rawData.filter((item: any) => {
  if (!searchQuery.trim()) return true;

  const query = searchQuery.toLowerCase();

  return (
    item.project.toLowerCase().includes(query) ||
    item.material.toLowerCase().includes(query) ||
    item.estimated.toLowerCase().includes(query) ||
    item.actual.toLowerCase().includes(query) ||
    item.variance.toLowerCase().includes(query) ||
    item.date.toLowerCase().includes(query)
  );
});
  return (
    <div className="bg-white rounded-md xl:p-6 p-4  border border-gray-100/50 md:min-h-[400px] overflow-x-auto">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1 flex-wrap">
          <SectionHeaderWithAction
            title="Project Details"
            actionLabel="" // No action label needed here as per image, but we'll use the space for icons
            showIcon={false}
          />
        </div>
        <div className="flex items-center gap-3 text-gray-400 relative">
          {/* Search Input */}
          {isOpen && (
            // <input
            //   ref={inputRef}
            //   type="text"
            //   placeholder="Search..."
            //   className="absolute right-12 w-48 rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-700 shadow-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            //   onBlur={() => setIsOpen(false)}
            // />
            <div className="flex items-center bg-[#F8F9FA] rounded-md px-4 py-1 flex-1 max-w-sm border border-[#9CA3AF] focus-within:border-[#9CA3AF] focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <Search className="w-5 h-5 text-[#9CA3AF] mr-2" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400"
                ref={inputRef}
                onBlur={() => setIsOpen(false)}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}

          {/* Search Icon */}
         {!isOpen && <Search
            className="w-5 h-5 cursor-pointer hover:text-gray-600 transition-colors"
            onClick={() => setIsOpen((prev) => !prev)}
          />
}
          {/* Filter Icon */}
          <Filter className="w-5 h-5 cursor-pointer hover:text-gray-600 transition-colors" onClick={() => setFilter((prev) => (prev === "today" ? "week" : "today"))}/>
        </div>
      </div>

      <div className="overflow-x-auto -mx-6 px-6 ">
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
            {filteredData.map((item: any, index: number) => (
              <tr key={index} className="hover:bg-gray-50/50 transition-colors">
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
                      item.varianceType === "positive"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-red-50 text-red-600"
                    )}
                  >
                    {item.varianceType === "positive" ? (
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
