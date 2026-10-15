import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  ListFilter,
  Calendar as CalendarIcon,
  ChevronDown,
  CheckCircle2,
  CircleDollarSign,
  ArrowLeft,
  Settings,
  Search,
  AlertCircle,
  RefreshCw,
  User,
  Layers,
  TrendingUp,
  Receipt,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import {
  useGetBudgetVsActualProjectsQuery,
  useGetBudgetVsActualDetailQuery,
  type GroupedByDepartmentItem,
} from "@/redux/api/financialApi";
import { formatCurrency } from "@/lib/dashboardFormatters";
import ManageBudgetModal from "@/components/modals/ManageBudgetModal";
import { Button } from "@/components/ui/button";

// Predefined date range filter options
interface DateRangeOption {
  label: string;
  startDate?: string;
  endDate?: string;
}

const DATE_RANGE_OPTIONS: DateRangeOption[] = [
  { label: "All Time", startDate: undefined, endDate: undefined },
  {
    label: "This Month",
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      .toISOString()
      .split("T")[0],
  },
  {
    label: "Last 30 Days",
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  },
  {
    label: "Q1 2025",
    startDate: "2025-01-01",
    endDate: "2025-03-31",
  },
  {
    label: "Year 2025",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
  },
];

export default function ProjectBudgetDetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. Fetch Projects List for Picker (GET /api/account/financial/budget-vs-actual)
  const {
    data: projects = [],
    isLoading: isLoadingProjects,
  } = useGetBudgetVsActualProjectsQuery();

  // Determine active project ID from query param, location state, or first project
  const leadIdFromUrl = searchParams.get("leadId") || (location.state as { leadId?: string; projectId?: string })?.leadId || (location.state as { leadId?: string; projectId?: string })?.projectId;
  const [selectedProjectId, setSelectedProjectId] = useState<string>(leadIdFromUrl || "");

  // Sync state if URL changes or projects list loads
  useEffect(() => {
    if (leadIdFromUrl) {
      setSelectedProjectId(leadIdFromUrl);
    } else if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0]._id);
      setSearchParams({ leadId: projects[0]._id }, { replace: true });
    }
  }, [leadIdFromUrl, projects, selectedProjectId, setSearchParams]);

  // Handle project selection change
  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id);
    setSearchParams({ leadId: id });
    setIsProjectMenuOpen(false);
  };

  // Dropdown states
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const [projectSearchTerm, setProjectSearchTerm] = useState("");

  // Filters state
  const [groupBy, setGroupBy] = useState<"Cost Head" | "Department">("Cost Head");
  const [isGroupByOpen, setIsGroupByOpen] = useState(false);

  const [costCategory, setCostCategory] = useState<string>("All");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const [selectedDateRange, setSelectedDateRange] = useState<DateRangeOption>(
    DATE_RANGE_OPTIONS[0]
  );
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);

  // Manage Budget Modal state
  const [isManageBudgetOpen, setIsManageBudgetOpen] = useState(false);

  // 2. Fetch Project Detail (GET /api/account/financial/budget-vs-actual?leadId=...&startDate=...&endDate=...&groupBy=...)
  const {
    data: detailData,
    isLoading: isLoadingDetail,
    isFetching: isFetchingDetail,
    isError: isDetailError,
    error: detailError,
    refetch: refetchDetail,
  } = useGetBudgetVsActualDetailQuery(
    {
      leadId: selectedProjectId,
      startDate: selectedDateRange.startDate,
      endDate: selectedDateRange.endDate,
      groupBy: groupBy === "Department" ? "department" : undefined,
    },
    {
      skip: !selectedProjectId,
    }
  );

  // Active project metadata from list
  const activeProjectFromList = projects.find((p) => p._id === selectedProjectId);

  // Filtered projects for search
  const filteredProjects = useMemo(() => {
    if (!projectSearchTerm.trim()) return projects;
    const term = projectSearchTerm.toLowerCase();
    return projects.filter(
      (p) =>
        p.projectName?.toLowerCase().includes(term) ||
        p.jobId?.toLowerCase().includes(term) ||
        p._id?.toLowerCase().includes(term)
    );
  }, [projects, projectSearchTerm]);

  // Project display details
  const projectInfo = detailData?.project;
  const projectName = projectInfo?.projectName || activeProjectFromList?.projectName || "Selected Project";
  const projectCode = projectInfo?.projectCode || activeProjectFromList?.jobId || "N/A";
  const clientName = projectInfo?.clientName || "Not specified";
  const salesRep = projectInfo?.salesRep || "Not assigned";

  // Financial Summary
  const summary = detailData?.summary || {
    totalBudget: 0,
    totalActualExpenses: 0,
    totalVariance: 0,
    budgetUsedPct: 0,
    totalInvoiced: 0,
  };

  const isOverBudget =
    summary.totalActualExpenses > summary.totalBudget || summary.budgetUsedPct > 100;

  // Filtered Cost Heads
  const costHeads = detailData?.costHeads || [];
  const filteredCostHeads = useMemo(() => {
    if (costCategory === "All") return costHeads;
    const cat = costCategory.toLowerCase();
    return costHeads.filter((item) => {
      const itemCat = (item.category || "").toLowerCase();
      const itemHead = (item.head || "").toLowerCase();
      return itemCat.includes(cat) || itemHead.includes(cat);
    });
  }, [costHeads, costCategory]);

  // Department Groups
  const groupedDepartments: GroupedByDepartmentItem[] = detailData?.groupedByDepartment || [];

  // Available Categories from cost heads for the category filter dropdown
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    costHeads.forEach((h) => {
      if (h.category) set.add(h.category);
    });
    return ["All", ...Array.from(set)];
  }, [costHeads]);

  // Donut Chart Data Calculation
  const donutData = useMemo(() => {
    const totalBudget = summary.totalBudget || 0;
    const totalActual = summary.totalActualExpenses || 0;

    if (totalBudget === 0 && totalActual === 0) {
      return [
        { name: "Budget", value: 100, color: "#E5E7EB" },
      ];
    }

    if (totalActual <= totalBudget) {
      const remaining = Math.max(0, totalBudget - totalActual);
      return [
        { name: "Actual (USD)", value: totalActual, color: "#EA580C" }, // Orange
        { name: "Remaining (USD)", value: remaining, color: "#0E4A60" }, // Dark teal
      ];
    } else {
      // Over budget
      const overBudgetAmount = totalActual - totalBudget;
      return [
        { name: "Budget (USD)", value: totalBudget, color: "#0E4A60" },
        { name: "Overrun (USD)", value: overBudgetAmount, color: "#EF4444" }, // Red
      ];
    }
  }, [summary]);

  return (
    <div className="space-y-6 px-2 sm:px-4 xl:px-0 pb-10">
      {/* 1. Top Card: Project Details */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 md:p-6">
        {/* Card Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-gray-100 gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-1 rounded-md hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"
              title="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                Project Budget Details
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Track dynamic budget lines vs actual expenses
              </p>
            </div>
          </div>

          {/* Right Action: Manage Budget & Project Selector Dropdown */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Manage Budget Button (POST /api/admin/leads/:leadId/budget) */}
            <Button
              onClick={() => setIsManageBudgetOpen(true)}
              disabled={!selectedProjectId}
              variant="outline"
              size="sm"
              className="text-xs h-9 px-3 gap-1.5 border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-blue-600 cursor-pointer shadow-2xs font-medium"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Configure Budget</span>
            </Button>

            {/* Project Selector Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm font-medium text-gray-700">
                Project
              </span>
              <div className="relative">
                <button
                  onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
                  disabled={isLoadingProjects}
                  className="bg-white border border-gray-200/90 rounded-lg px-3 py-1.5 text-xs md:text-sm font-medium text-gray-700 shadow-2xs hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-colors max-w-xs"
                >
                  <ListFilter className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <span className="truncate">
                    {isLoadingProjects
                      ? "Loading projects..."
                      : projects.length === 0
                      ? "No projects found"
                      : `${projectName} (${projectCode})`}
                  </span>
                  <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
                </button>

                {isProjectMenuOpen && (
                  <div className="absolute right-0 mt-1 w-80 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-40 text-xs animate-in fade-in-50">
                    {/* Search inside project picker */}
                    <div className="px-3 pb-2 border-b border-gray-100">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                        <input
                          type="text"
                          value={projectSearchTerm}
                          onChange={(e) => setProjectSearchTerm(e.target.value)}
                          placeholder="Search project or Job ID..."
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto pt-1">
                      {filteredProjects.length === 0 ? (
                        <div className="px-3 py-4 text-center text-gray-400">
                          No matching projects
                        </div>
                      ) : (
                        filteredProjects.map((proj) => (
                          <button
                            key={proj._id}
                            onClick={() => handleSelectProject(proj._id)}
                            className={`w-full text-left px-3.5 py-2.5 hover:bg-gray-50 cursor-pointer flex flex-col transition-colors ${
                              selectedProjectId === proj._id
                                ? "bg-blue-50/60 text-blue-600 font-semibold"
                                : "text-gray-700"
                            }`}
                          >
                            <span className="truncate">{proj.projectName}</span>
                            <span className="text-[11px] text-gray-400 font-normal">
                              Job #{proj.jobId || "N/A"}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card Body: Left Project Profile + Right 4 KPI Stat Cards */}
        {isLoadingDetail && !detailData ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
            <p className="text-xs">Loading project budget data...</p>
          </div>
        ) : isDetailError ? (
          <div className="py-10 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Failed to load budget details
              </p>
              <p className="text-xs text-gray-500 mt-1 max-w-md">
                {(detailError as { data?: { message?: string } })?.data?.message ||
                  "An error occurred while fetching project budget vs actual data."}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetchDetail()}
              className="text-xs h-8 gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </Button>
          </div>
        ) : (
          <div className="pt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Info Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-4">
                {/* Project Avatar / Icon */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm font-bold text-xl">
                  {projectName.charAt(0).toUpperCase()}
                </div>

                {/* Title & Client */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-indigo-600 tracking-wide uppercase">
                      Job #{projectCode}
                    </span>
                    {isFetchingDetail && (
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <h2 className="text-lg font-bold text-gray-900 leading-tight">
                      {projectName}
                    </h2>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">Client: {clientName}</span>
                  </div>
                </div>
              </div>

              {/* Metadata 2x2 Grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-3 border-t border-gray-100 text-xs">
                <div>
                  <span className="text-gray-400 block font-medium">Project Code</span>
                  <span className="font-semibold text-gray-900 mt-0.5 block">
                    {projectCode}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Sales Rep</span>
                  <span className="font-semibold text-gray-900 mt-0.5 block truncate">
                    {salesRep}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Total Invoiced</span>
                  <span className="font-semibold text-blue-600 mt-0.5 block">
                    {formatCurrency(summary.totalInvoiced || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Budget Status</span>
                  <span
                    className={`font-semibold mt-0.5 block ${
                      isOverBudget ? "text-red-600" : "text-emerald-600"
                    }`}
                  >
                    {isOverBudget ? "Over Budget" : "Under Budget"} ({summary.budgetUsedPct}%)
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
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 font-medium">Budget USD</p>
                  <p className="text-lg font-bold text-gray-900 leading-tight mt-0.5 truncate">
                    {formatCurrency(summary.totalBudget)}
                  </p>
                  <p className="text-[11px] font-semibold text-gray-400 mt-0.5">
                    Total Planned
                  </p>
                </div>
              </div>

              {/* 2. Actual USD */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-2xs p-3.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#ECFDF5] flex items-center justify-center text-[#10B981] shrink-0">
                  <Receipt className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 font-medium">Actual Expenses</p>
                  <p className="text-lg font-bold text-gray-900 leading-tight mt-0.5 truncate">
                    {formatCurrency(summary.totalActualExpenses)}
                  </p>
                  <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">
                    Recorded Spend
                  </p>
                </div>
              </div>

              {/* 3. Variance USD */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-2xs p-3.5 flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    isOverBudget
                      ? "bg-[#FEF2F2] text-[#EF4444]"
                      : "bg-[#ECFDF5] text-[#10B981]"
                  }`}
                >
                  <TrendingUp
                    className={`w-5 h-5 ${
                      isOverBudget ? "text-red-500" : "text-emerald-500"
                    }`}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 font-medium">Variance USD</p>
                  <p
                    className={`text-lg font-bold leading-tight mt-0.5 truncate ${
                      isOverBudget ? "text-red-600" : "text-emerald-600"
                    }`}
                  >
                    {isOverBudget ? "+" : ""}
                    {formatCurrency(Math.abs(summary.totalVariance))}
                  </p>
                  <p
                    className={`text-[11px] font-semibold mt-0.5 ${
                      isOverBudget ? "text-red-500" : "text-emerald-500"
                    }`}
                  >
                    {isOverBudget ? "Over Budget" : "Under Budget"}
                  </p>
                </div>
              </div>

              {/* 4. % of Budget USD */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-2xs p-3.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#F5F3FF] flex items-center justify-center text-[#8B5CF6] shrink-0">
                  <CircleDollarSign className="w-5 h-5 text-purple-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 font-medium">% of Budget Used</p>
                  <p className="text-lg font-bold text-gray-900 leading-tight mt-0.5 truncate">
                    {summary.budgetUsedPct}%
                  </p>
                  <p
                    className={`text-[11px] font-semibold mt-0.5 ${
                      isOverBudget ? "text-red-500" : "text-emerald-600"
                    }`}
                  >
                    {isOverBudget ? "Limit Exceeded" : "Within Budget"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Group by: Cost Head vs Department */}
        <div className="relative">
          <button
            onClick={() => {
              setIsGroupByOpen(!isGroupByOpen);
              setIsCategoryOpen(false);
              setIsDateRangeOpen(false);
            }}
            className="bg-white border border-gray-200/90 rounded-lg px-3.5 py-2 text-xs md:text-sm font-medium text-gray-700 shadow-2xs hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Layers className="w-4 h-4 text-gray-500" />
            <span>Group by: {groupBy}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
          {isGroupByOpen && (
            <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-30 text-xs animate-in fade-in-50">
              {(["Cost Head", "Department"] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setGroupBy(item);
                    setIsGroupByOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 cursor-pointer ${
                    groupBy === item ? "text-blue-600 font-semibold bg-blue-50/50" : "text-gray-700"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cost Category Filter (Visible when grouping by Cost Head) */}
        {groupBy === "Cost Head" && (
          <div className="relative">
            <button
              onClick={() => {
                setIsCategoryOpen(!isCategoryOpen);
                setIsGroupByOpen(false);
                setIsDateRangeOpen(false);
              }}
              className="bg-white border border-gray-200/90 rounded-lg px-3.5 py-2 text-xs md:text-sm font-medium text-gray-700 shadow-2xs hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <ListFilter className="w-4 h-4 text-gray-500" />
              <span>Category: {costCategory}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
            {isCategoryOpen && (
              <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-30 text-xs max-h-56 overflow-y-auto animate-in fade-in-50">
                {availableCategories.map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setCostCategory(item);
                      setIsCategoryOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-50 cursor-pointer capitalize ${
                      costCategory === item
                        ? "text-blue-600 font-semibold bg-blue-50/50"
                        : "text-gray-700"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Date Range Filter */}
        <div className="relative">
          <button
            onClick={() => {
              setIsDateRangeOpen(!isDateRangeOpen);
              setIsGroupByOpen(false);
              setIsCategoryOpen(false);
            }}
            className="bg-white border border-gray-200/90 rounded-lg px-3.5 py-2 text-xs md:text-sm font-medium text-gray-700 shadow-2xs hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-colors"
          >
            <CalendarIcon className="w-4 h-4 text-gray-500" />
            <span>{selectedDateRange.label}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
          {isDateRangeOpen && (
            <div className="absolute left-0 mt-1 w-56 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-30 text-xs animate-in fade-in-50">
              {DATE_RANGE_OPTIONS.map((range) => (
                <button
                  key={range.label}
                  onClick={() => {
                    setSelectedDateRange(range);
                    setIsDateRangeOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 cursor-pointer ${
                    selectedDateRange.label === range.label
                      ? "text-blue-600 font-semibold bg-blue-50/50"
                      : "text-gray-700"
                  }`}
                >
                  {range.label}
                  {range.startDate && (
                    <span className="block text-[10px] text-gray-400 font-normal">
                      {range.startDate} to {range.endDate}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <button
          onClick={() => refetchDetail()}
          disabled={isFetchingDetail}
          className="p-2 bg-white border border-gray-200/90 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 cursor-pointer shadow-2xs transition-colors"
          title="Refresh data"
        >
          <RefreshCw
            className={`w-4 h-4 ${isFetchingDetail ? "animate-spin text-blue-600" : ""}`}
          />
        </button>
      </div>

      {/* 3. Main Content: Left (Budget VS Actual Table) + Right (Overview & Summary) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Table) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-gray-100">
            <div>
              <h2 className="text-base md:text-lg font-bold text-gray-900">
                Budget VS Actual by {groupBy}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {groupBy === "Cost Head"
                  ? `${filteredCostHeads.length} cost heads tracked (including dynamic custom lines)`
                  : `${groupedDepartments.length} departments recorded`}
              </p>
            </div>
            {isFetchingDetail && (
              <span className="text-xs text-blue-600 flex items-center gap-1.5 font-medium">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Updating...
              </span>
            )}
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs md:text-sm">
              <thead className="bg-[#F9FAFB] border-b border-gray-100 text-xs font-semibold text-gray-800">
                <tr>
                  <th className="py-3 px-4 font-semibold text-gray-900">
                    {groupBy === "Cost Head" ? "Cost Head" : "Department"}
                  </th>
                  <th className="py-3 px-4 font-semibold text-gray-900">Budget (USD)</th>
                  <th className="py-3 px-4 font-semibold text-gray-900">Actual (USD)</th>
                  <th className="py-3 px-4 font-semibold text-gray-900">Variance</th>
                  <th className="py-3 px-4 font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {groupBy === "Cost Head" ? (
                  filteredCostHeads.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400 text-xs">
                        No cost heads found for this project.
                      </td>
                    </tr>
                  ) : (
                    filteredCostHeads.map((item, index) => {
                      const itemOverBudget = item.actual > item.budget;
                      const variancePct =
                        item.budget > 0
                          ? ((Math.abs(item.variance) / item.budget) * 100).toFixed(1)
                          : "0.0";
                      const headLabel = item.head || item.category || `Cost Head ${index + 1}`;

                      return (
                        <tr key={index} className="hover:bg-gray-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-medium text-gray-900">
                            <div className="flex items-center gap-2">
                              <span className="capitalize">{headLabel}</span>
                              {item.isCustom && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                  Custom
                                </span>
                              )}
                            </div>
                            {item.category && item.head && item.head !== item.category && (
                              <span className="text-[11px] text-gray-400 capitalize block mt-0.5">
                                Category: {item.category}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-gray-600">
                            {formatCurrency(item.budget)}
                          </td>
                          <td className="py-3.5 px-4 text-gray-600">
                            {formatCurrency(item.actual)}
                          </td>
                          <td
                            className={`py-3.5 px-4 font-semibold ${
                              itemOverBudget ? "text-[#EF4444]" : "text-[#10B981]"
                            }`}
                          >
                            {itemOverBudget ? "+" : "-"}
                            {formatCurrency(Math.abs(item.variance))}
                            <span className="text-[11px] font-normal ml-1 opacity-80">
                              ({variancePct}%)
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {itemOverBudget ? (
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
                      );
                    })
                  )
                ) : (
                  groupedDepartments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400 text-xs">
                        No department data available.
                      </td>
                    </tr>
                  ) : (
                    groupedDepartments.map((dept, index) => {
                      const deptOverBudget = dept.actual > dept.budget;
                      return (
                        <tr key={index} className="hover:bg-gray-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-medium text-gray-900">
                            {dept.department}
                          </td>
                          <td className="py-3.5 px-4 text-gray-600">
                            {formatCurrency(dept.budget)}
                          </td>
                          <td className="py-3.5 px-4 text-gray-600">
                            {formatCurrency(dept.actual)}
                          </td>
                          <td
                            className={`py-3.5 px-4 font-semibold ${
                              deptOverBudget ? "text-[#EF4444]" : "text-[#10B981]"
                            }`}
                          >
                            {deptOverBudget ? "+" : "-"}
                            {formatCurrency(Math.abs(dept.variance))}
                          </td>
                          <td className="py-3.5 px-4">
                            {deptOverBudget ? (
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
                      );
                    })
                  )
                )}

                {/* Total Row */}
                <tr
                  className={`font-semibold border-t ${
                    isOverBudget
                      ? "bg-[#FEF2F2]/60 border-red-100"
                      : "bg-[#ECFDF5]/50 border-emerald-100"
                  }`}
                >
                  <td className="py-3.5 px-4 text-gray-900 font-bold">Total</td>
                  <td className="py-3.5 px-4 text-gray-900">
                    {formatCurrency(summary.totalBudget)}
                  </td>
                  <td className="py-3.5 px-4 text-gray-900">
                    {formatCurrency(summary.totalActualExpenses)}
                  </td>
                  <td
                    className={`py-3.5 px-4 font-bold ${
                      isOverBudget ? "text-[#EF4444]" : "text-[#10B981]"
                    }`}
                  >
                    {isOverBudget ? "+" : "-"}
                    {formatCurrency(Math.abs(summary.totalVariance))}
                    <span className="text-xs font-normal ml-1">
                      ({summary.budgetUsedPct}%)
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {isOverBudget ? (
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
                      formatter={(val: number | string | undefined) => [
                        formatCurrency(Number(val) || 0),
                      ]}
                    />
                    <Pie
                      data={donutData}
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
                      {donutData.map((entry, index) => (
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
                  <p className="text-gray-500 pl-4 mt-0.5 font-medium">
                    {formatCurrency(summary.totalActualExpenses)} ({summary.budgetUsedPct}%)
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        isOverBudget ? "bg-[#EF4444]" : "bg-[#0E4A60]"
                      }`}
                    />
                    <span className="font-bold text-gray-900">
                      {isOverBudget ? "Overrun (USD)" : "Remaining (USD)"}
                    </span>
                  </div>
                  <p className="text-gray-500 pl-4 mt-0.5 font-medium">
                    {isOverBudget
                      ? `+${formatCurrency(
                          summary.totalActualExpenses - summary.totalBudget
                        )}`
                      : formatCurrency(
                          Math.max(0, summary.totalBudget - summary.totalActualExpenses)
                        )}
                  </p>
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
                <span className="font-semibold text-gray-900">
                  {formatCurrency(summary.totalBudget)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500">Total Actual</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(summary.totalActualExpenses)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500">Total Variance</span>
                <span
                  className={`font-bold ${
                    isOverBudget ? "text-[#EF4444]" : "text-[#10B981]"
                  }`}
                >
                  {isOverBudget ? "+" : ""}
                  {formatCurrency(summary.totalVariance)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500">% of Budget Used</span>
                <span
                  className={`font-semibold ${
                    isOverBudget ? "text-[#EF4444]" : "text-gray-900"
                  }`}
                >
                  {summary.budgetUsedPct}%
                </span>
              </div>

              {summary.totalInvoiced !== undefined && (
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-gray-500">Total Invoiced</span>
                  <span className="font-semibold text-blue-600">
                    {formatCurrency(summary.totalInvoiced)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-gray-500 font-medium">Status</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    isOverBudget
                      ? "border border-red-200 bg-red-50 text-red-600"
                      : "border border-emerald-200 bg-emerald-50 text-emerald-600"
                  }`}
                >
                  {isOverBudget ? "Over Budget" : "Under Budget"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manage / Configure Budget Modal */}
      <ManageBudgetModal
        isOpen={isManageBudgetOpen}
        onClose={() => setIsManageBudgetOpen(false)}
        leadId={selectedProjectId}
        projectName={projectName}
        costHeads={detailData?.costHeads}
        customBudgetLines={detailData?.customBudgetLines}
        onSuccess={() => refetchDetail()}
      />
    </div>
  );
}
