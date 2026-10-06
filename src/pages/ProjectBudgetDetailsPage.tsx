import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ListFilter,
  Calendar,
  ChevronDown,
  MapPin,
  CheckCircle2,
  CircleDollarSign,
  ArrowLeft,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

// Mock Projects for dropdown
const AVAILABLE_PROJECTS = [
  {
    id: "PRJ-2025-015",
    name: "Riverside Office Complex",
    code: "CI-12345",
    address: "4712 Cherry Ridge Drive Rochester, NY 14620.",
    projectCode: "PRJ-2025-015",
    startDate: "Feb 10, 2025",
    projectManager: "John Smith",
    targetEndDate: "Feb 10, 2025",
    budget: "$4,900.00",
    actual: "$4,900.00",
    variance: "$4,900.00",
    percentBudget: "$4,900.00",
  },
  {
    id: "PRJ-2025-016",
    name: "Project A - Industrial Park",
    code: "CI-12346",
    address: "102 Industrial Way, Austin, TX 78701.",
    projectCode: "PRJ-2025-016",
    startDate: "Mar 01, 2025",
    projectManager: "Sarah Jenkins",
    targetEndDate: "Dec 15, 2025",
    budget: "$5,200.00",
    actual: "$4,800.00",
    variance: "$400.00",
    percentBudget: "92.3%",
  },
  {
    id: "PRJ-2025-017",
    name: "Project B - Cold Storage Facility",
    code: "CI-12347",
    address: "889 Arctic Blvd, Chicago, IL 60601.",
    projectCode: "PRJ-2025-017",
    startDate: "Jan 15, 2025",
    projectManager: "Michael Chang",
    targetEndDate: "Aug 30, 2025",
    budget: "$6,100.00",
    actual: "$6,500.00",
    variance: "$400.00",
    percentBudget: "106.5%",
  },
];

// Table row data matching screenshot
interface CostHeadItem {
  id: string;
  costHead: string;
  budget: string;
  actual: string;
  variance: string;
  status: "Over Budget" | "Under Budget";
}

const COST_HEAD_ITEMS: CostHeadItem[] = [
  {
    id: "1",
    costHead: "Material Cost",
    budget: "$1,245,360.00",
    actual: "$1,050,180.00",
    variance: "18.66%",
    status: "Over Budget",
  },
  {
    id: "2",
    costHead: "Carrier/Freight cost",
    budget: "$1,245,360.00",
    actual: "$1,050,180.00",
    variance: "18.66%",
    status: "Under Budget",
  },
  {
    id: "3",
    costHead: "Manpower/Labor cost",
    budget: "$1,245,360.00",
    actual: "$1,050,180.00",
    variance: "18.66%",
    status: "Over Budget",
  },
  {
    id: "4",
    costHead: "Equipment Cost",
    budget: "$1,245,360.00",
    actual: "$1,050,180.00",
    variance: "18.66%",
    status: "Under Budget",
  },
  {
    id: "5",
    costHead: "Subcontractor cost",
    budget: "$1,245,360.00",
    actual: "$1,050,180.00",
    variance: "18.66%",
    status: "Under Budget",
  },
  {
    id: "6",
    costHead: "Miscellaneous Cost",
    budget: "$1,245,360.00",
    actual: "$1,050,180.00",
    variance: "18.66%",
    status: "Under Budget",
  },
  {
    id: "7",
    costHead: "Contingency",
    budget: "$1,245,360.00",
    actual: "$1,050,180.00",
    variance: "18.66%",
    status: "Under Budget",
  },
  {
    id: "8",
    costHead: "Project Overhead",
    budget: "$1,245,360.00",
    actual: "$1,050,180.00",
    variance: "18.66%",
    status: "Under Budget",
  },
];

// Donut Chart Data
const DONUT_DATA = [
  { name: "Actual (USD)", value: 42, color: "#EA580C" }, // Orange segment
  { name: "Remaining (USD)", value: 58, color: "#0E4A60" }, // Dark teal segment
];

export default function ProjectBudgetDetailsPage() {
  const navigate = useNavigate();

  // Selected project state
  const [selectedProjectId, setSelectedProjectId] = useState("PRJ-2025-015");
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);

  // Filters state
  const [groupBy, setGroupBy] = useState("Cost Head");
  const [isGroupByOpen, setIsGroupByOpen] = useState(false);
  const [department, setDepartment] = useState("All");
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [costCategory, setCostCategory] = useState("All");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [dateRange, setDateRange] = useState("24 Mar 2025 - 31 Mar 2025");
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);

  const activeProject =
    AVAILABLE_PROJECTS.find((p) => p.id === selectedProjectId) ||
    AVAILABLE_PROJECTS[0];

  return (
    <div className="space-y-6 px-2 sm:px-4 xl:px-0 pb-10">
      {/* 1. Top Card: Project Details */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 md:p-6">
        {/* Card Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-gray-100 gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-1 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
              title="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Project Details
            </h1>
          </div>

          {/* Project Selector Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs md:text-sm font-medium text-gray-700">
              Project
            </span>
            <div className="relative">
              <button
                onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
                className="bg-white border border-gray-200/90 rounded-lg px-3 py-1.5 text-xs md:text-sm font-medium text-gray-700 shadow-2xs hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <ListFilter className="w-3.5 h-3.5 text-gray-500" />
                <span>{`${activeProject.name} (${activeProject.id})`}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>
              {isProjectMenuOpen && (
                <div className="absolute right-0 mt-1 w-72 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-30 text-xs">
                  {AVAILABLE_PROJECTS.map((proj) => (
                    <button
                      key={proj.id}
                      onClick={() => {
                        setSelectedProjectId(proj.id);
                        setIsProjectMenuOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 hover:bg-gray-50 cursor-pointer ${
                        selectedProjectId === proj.id
                          ? "text-blue-600 font-semibold"
                          : "text-gray-700"
                      }`}
                    >
                      {proj.name} ({proj.id})
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card Body: Left Project Profile + Right 4 KPI Stat Cards */}
        <div className="pt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Info Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-4">
              {/* Project Avatar Image */}
              <div className="w-18 h-18 rounded-full overflow-hidden shrink-0 border border-gray-200 shadow-2xs bg-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&auto=format&fit=crop&q=80"
                  alt={activeProject.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Title & Location */}
              <div>
                <span className="text-xs font-semibold text-indigo-600 tracking-wide block">
                  {activeProject.code}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <h2 className="text-lg font-bold text-gray-900 leading-tight">
                    {activeProject.name}
                  </h2>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="line-clamp-1">{activeProject.address}</span>
                </div>
              </div>
            </div>

            {/* Metadata 2x2 Grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 pt-2 border-t border-gray-100 text-xs">
              <div>
                <span className="text-gray-500 block">Project Code</span>
                <span className="font-semibold text-gray-900 mt-0.5 block">
                  {activeProject.projectCode}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Start Date</span>
                <span className="font-semibold text-gray-900 mt-0.5 block">
                  {activeProject.startDate}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Project Manager</span>
                <span className="font-semibold text-gray-900 mt-0.5 block">
                  {activeProject.projectManager}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Target End Date</span>
                <span className="font-semibold text-gray-900 mt-0.5 block">
                  {activeProject.targetEndDate}
                </span>
              </div>
            </div>
          </div>

          {/* Right 4 Stat Cards Grid (2x2) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* 1. Budget USD */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-2xs p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] shrink-0">
                <CircleDollarSign className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Budget USD</p>
                <p className="text-lg font-bold text-gray-900 leading-tight mt-0.5">
                  {activeProject.budget}
                </p>
                <p className="text-xs font-semibold text-emerald-500 mt-0.5">
                  +12.5%
                </p>
              </div>
            </div>

            {/* 2. Actual USD */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-2xs p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#ECFDF5] flex items-center justify-center text-[#10B981] shrink-0">
                <CircleDollarSign className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Actual USD</p>
                <p className="text-lg font-bold text-gray-900 leading-tight mt-0.5">
                  {activeProject.actual}
                </p>
                <p className="text-xs font-semibold text-emerald-500 mt-0.5">
                  +12.5%
                </p>
              </div>
            </div>

            {/* 3. Variance USD */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-2xs p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#FEF2F2] flex items-center justify-center text-[#EF4444] shrink-0">
                <CircleDollarSign className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Variance USD</p>
                <p className="text-lg font-bold text-gray-900 leading-tight mt-0.5">
                  {activeProject.variance}
                </p>
                <p className="text-xs font-semibold text-emerald-500 mt-0.5">
                  +12.5%
                </p>
              </div>
            </div>

            {/* 4. % of Budget USD */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-2xs p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#F5F3FF] flex items-center justify-center text-[#8B5CF6] shrink-0">
                <CircleDollarSign className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">% of Budget USD</p>
                <p className="text-lg font-bold text-gray-900 leading-tight mt-0.5">
                  {activeProject.percentBudget}
                </p>
                <p className="text-xs font-semibold text-emerald-500 mt-0.5">
                  +12.5%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Group by: Cost Head */}
        <div className="relative">
          <button
            onClick={() => {
              setIsGroupByOpen(!isGroupByOpen);
              setIsDeptOpen(false);
              setIsCategoryOpen(false);
              setIsDateRangeOpen(false);
            }}
            className="bg-white border border-gray-200/90 rounded-lg px-3.5 py-2 text-xs md:text-sm font-medium text-gray-700 shadow-2xs hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-colors"
          >
            <ListFilter className="w-4 h-4 text-gray-500" />
            <span>Group by: {groupBy}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
          {isGroupByOpen && (
            <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-30 text-xs">
              {["Cost Head", "Department", "Vendor", "Milestone"].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setGroupBy(item);
                    setIsGroupByOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 cursor-pointer ${
                    groupBy === item ? "text-blue-600 font-semibold" : "text-gray-700"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Department: All */}
        <div className="relative">
          <button
            onClick={() => {
              setIsDeptOpen(!isDeptOpen);
              setIsGroupByOpen(false);
              setIsCategoryOpen(false);
              setIsDateRangeOpen(false);
            }}
            className="bg-white border border-gray-200/90 rounded-lg px-3.5 py-2 text-xs md:text-sm font-medium text-gray-700 shadow-2xs hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-colors"
          >
            <ListFilter className="w-4 h-4 text-gray-500" />
            <span>Department: {department}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
          {isDeptOpen && (
            <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-30 text-xs">
              {["All", "Procurement", "Operations", "Logistics", "Engineering"].map(
                (item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setDepartment(item);
                      setIsDeptOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-50 cursor-pointer ${
                      department === item ? "text-blue-600 font-semibold" : "text-gray-700"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
            </div>
          )}
        </div>

        {/* Cost Category: All */}
        <div className="relative">
          <button
            onClick={() => {
              setIsCategoryOpen(!isCategoryOpen);
              setIsGroupByOpen(false);
              setIsDeptOpen(false);
              setIsDateRangeOpen(false);
            }}
            className="bg-white border border-gray-200/90 rounded-lg px-3.5 py-2 text-xs md:text-sm font-medium text-gray-700 shadow-2xs hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-colors"
          >
            <ListFilter className="w-4 h-4 text-gray-500" />
            <span>Cost Category: {costCategory}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
          {isCategoryOpen && (
            <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-30 text-xs">
              {["All", "Direct Cost", "Indirect Cost", "Overhead", "Capital"].map(
                (item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setCostCategory(item);
                      setIsCategoryOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-50 cursor-pointer ${
                      costCategory === item
                        ? "text-blue-600 font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
            </div>
          )}
        </div>

        {/* Date Range */}
        <div className="relative">
          <button
            onClick={() => {
              setIsDateRangeOpen(!isDateRangeOpen);
              setIsGroupByOpen(false);
              setIsDeptOpen(false);
              setIsCategoryOpen(false);
            }}
            className="bg-white border border-gray-200/90 rounded-lg px-3.5 py-2 text-xs md:text-sm font-medium text-gray-700 shadow-2xs hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-colors"
          >
            <span>{dateRange}</span>
            <Calendar className="w-4 h-4 text-gray-500 ml-1" />
          </button>
          {isDateRangeOpen && (
            <div className="absolute left-0 mt-1 w-56 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-30 text-xs">
              {[
                "24 Mar 2025 - 31 Mar 2025",
                "Last 7 Days",
                "Last 30 Days",
                "This Month",
                "Q1 2025",
              ].map((range) => (
                <button
                  key={range}
                  onClick={() => {
                    setDateRange(range);
                    setIsDateRangeOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 cursor-pointer ${
                    dateRange === range ? "text-blue-600 font-semibold" : "text-gray-700"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Main Content: Left (Budget VS Actual by Cost Head) + Right (Overview & Summary) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Table) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5">
            <h2 className="text-base md:text-lg font-bold text-gray-900">
              Budget VS Actual by Cost Head
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead className="bg-[#F9FAFB] border-y border-gray-100 text-xs font-semibold text-gray-800">
                <tr>
                  <th className="py-3 px-4 font-semibold text-gray-900">Cost Head</th>
                  <th className="py-3 px-4 font-semibold text-gray-900">Budget (USD)</th>
                  <th className="py-3 px-4 font-semibold text-gray-900">Actual (USD)</th>
                  <th className="py-3 px-4 font-semibold text-gray-900">Variance</th>
                  <th className="py-3 px-4 font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {COST_HEAD_ITEMS.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-gray-900">
                      {item.costHead}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">
                      {item.budget}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">
                      {item.actual}
                    </td>
                    <td
                      className={`py-3.5 px-4 font-semibold ${
                        item.status === "Over Budget"
                          ? "text-[#EF4444]"
                          : "text-[#10B981]"
                      }`}
                    >
                      {item.variance}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.status === "Over Budget" ? (
                        <span className="border border-red-200 bg-red-50 text-red-600 rounded-full px-2.5 py-0.5 text-xs font-medium inline-block">
                          Over Budget
                        </span>
                      ) : (
                        <span className="border border-emerald-200 bg-emerald-50 text-emerald-600 rounded-full px-2.5 py-0.5 text-xs font-medium inline-block">
                          Under Budget
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {/* Total Row (Tinted red/pink row matching screenshot) */}
                <tr className="bg-[#FEF2F2]/60 font-semibold border-t border-red-100">
                  <td className="py-3.5 px-4 text-gray-900 font-bold">Total</td>
                  <td className="py-3.5 px-4 text-gray-900">$1,245,360.00</td>
                  <td className="py-3.5 px-4 text-gray-900">$1,050,180.00</td>
                  <td className="py-3.5 px-4 text-[#EF4444] font-bold">18.66%</td>
                  <td className="py-3.5 px-4">
                    <span className="border border-red-200 bg-red-50 text-red-600 rounded-full px-2.5 py-0.5 text-xs font-medium inline-block">
                      Over Budget
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (Stacked Cards) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Budget VS Actual Overview (Donut Chart) */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-5">
            <h2 className="text-sm md:text-base font-bold text-gray-900 mb-4">
              Budget VS Actual Overview
            </h2>

            <div className="flex items-center justify-between gap-4">
              {/* Donut Chart */}
              <div className="w-36 h-36 relative shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      formatter={(val) => [`${val}%`]}
                    />
                    <Pie
                      data={DONUT_DATA}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={66}
                      startAngle={90}
                      endAngle={-270}
                      stroke="none"
                    >
                      {DONUT_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend List */}
              <div className="space-y-3 flex-1 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C] shrink-0" />
                    <span className="font-bold text-gray-900">Actual (USD)</span>
                  </div>
                  <p className="text-gray-500 pl-4 mt-0.5">$98765 (56%)</p>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0E4A60] shrink-0" />
                    <span className="font-bold text-gray-900">Remaining (USD)</span>
                  </div>
                  <p className="text-gray-500 pl-4 mt-0.5">$98765 (58%)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Project Budget Summary */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-5 space-y-4">
            <h2 className="text-sm md:text-base font-bold text-gray-900">
              Project Budget Summary
            </h2>

            <div className="space-y-3 text-xs md:text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Total Budget</span>
                <span className="font-semibold text-gray-900">$1,245,360.00</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500">Total Actual</span>
                <span className="font-semibold text-gray-900">$1,245,360.00</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500">Total Variance</span>
                <span className="font-bold text-[#EF4444]">$1,245,360.00</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500">% of Budget Used</span>
                <span className="font-semibold text-gray-900">$1,245,360.00</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-gray-500 font-medium">Status</span>
                <span className="border border-red-200 bg-red-50 text-red-600 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                  Over Budget
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
