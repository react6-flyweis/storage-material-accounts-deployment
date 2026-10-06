import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ListFilter,
  Calendar,
  ChevronDown,
  Search,
  CircleDollarSign,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  X,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import { Button } from "@/components/ui/button";

// --- Stat Cards Data ---
interface StatMetric {
  title: string;
  value: string;
  change: string;
}

const STAT_METRICS: StatMetric[] = [
  {
    title: "Gross Margin %",
    value: "24.35%",
    change: "+12.5%",
  },
  {
    title: "Operating Margin",
    value: "18.71%",
    change: "+12.5%",
  },
  {
    title: "Net Profit Margin",
    value: "14.82%",
    change: "+12.5%",
  },
  {
    title: "Contribution Margin",
    value: "28.90%",
    change: "+12.5%",
  },
  {
    title: "Avg Selling Price",
    value: "$4,900.00",
    change: "+12.5%",
  },
];

// --- Line Chart Data (Trend Over Time) ---
const TREND_OVER_TIME_DATA = [
  {
    month: "Jan",
    grossMargin: 12,
    operatingMargin: 11,
    netProfitMargin: 11,
    contributionMargin: 10,
  },
  {
    month: "Feb",
    grossMargin: 20,
    operatingMargin: 38,
    netProfitMargin: 32,
    contributionMargin: 24,
  },
  {
    month: "Mar",
    grossMargin: 21,
    operatingMargin: 38,
    netProfitMargin: 32,
    contributionMargin: 24,
  },
  {
    month: "Apr",
    grossMargin: 15,
    operatingMargin: 28,
    netProfitMargin: 24,
    contributionMargin: 18,
  },
  {
    month: "May",
    grossMargin: 26,
    operatingMargin: 49,
    netProfitMargin: 44,
    contributionMargin: 34,
  },
  {
    month: "Jun",
    grossMargin: 27,
    operatingMargin: 51,
    netProfitMargin: 45,
    contributionMargin: 34,
  },
  {
    month: "Jul",
    grossMargin: 33,
    operatingMargin: 67,
    netProfitMargin: 62,
    contributionMargin: 45,
  },
];

// --- Grouped Bar Chart Data (Margin by Projects) ---
const PROJECT_MARGIN_DATA = [
  {
    project: "Project A",
    grossMargin: 70,
    operatingMargin: 41,
    netProfitMargin: 92,
    contributionMargin: 23,
  },
  {
    project: "Project B",
    grossMargin: 69,
    operatingMargin: 41,
    netProfitMargin: 92,
    contributionMargin: 23,
  },
  {
    project: "Project C",
    grossMargin: 70,
    operatingMargin: 41,
    netProfitMargin: 92,
    contributionMargin: 23,
  },
  {
    project: "Project D",
    grossMargin: 69,
    operatingMargin: 41,
    netProfitMargin: 92,
    contributionMargin: 23,
  },
  {
    project: "Project E",
    grossMargin: 70,
    operatingMargin: 41,
    netProfitMargin: 92,
    contributionMargin: 23,
  },
];

// --- Table Data (Profit & Loss Summary) ---
interface PlRowItem {
  id: string;
  projectName: string;
  category: string;
  sales: string;
  cogs: string;
  grossProfit: string;
  grossMargin: string;
}

const PL_SUMMARY_DATA: PlRowItem[] = [
  {
    id: "p-a",
    projectName: "Project A",
    category: "$1,245,360.00",
    sales: "$1,050,180.00",
    cogs: "$5,842,190.00",
    grossProfit: "$5,842,190.00",
    grossMargin: "18.66%",
  },
  {
    id: "p-b",
    projectName: "Project B",
    category: "$1,245,360.00",
    sales: "$1,050,180.00",
    cogs: "$5,842,190.00",
    grossProfit: "$5,842,190.00",
    grossMargin: "18.66%",
  },
  {
    id: "p-c",
    projectName: "Project C",
    category: "$1,245,360.00",
    sales: "$1,050,180.00",
    cogs: "$5,842,190.00",
    grossProfit: "$5,842,190.00",
    grossMargin: "18.66%",
  },
  {
    id: "p-d",
    projectName: "Project D",
    category: "$1,245,360.00",
    sales: "$1,050,180.00",
    cogs: "$5,842,190.00",
    grossProfit: "$5,842,190.00",
    grossMargin: "18.66%",
  },
  {
    id: "p-e",
    projectName: "Project E",
    category: "$1,245,360.00",
    sales: "$1,050,180.00",
    cogs: "$5,842,190.00",
    grossProfit: "$5,842,190.00",
    grossMargin: "18.66%",
  },
  {
    id: "p-f",
    projectName: "Project F",
    category: "$980,240.00",
    sales: "$890,500.00",
    cogs: "$4,210,000.00",
    grossProfit: "$4,210,000.00",
    grossMargin: "21.15%",
  },
  {
    id: "p-g",
    projectName: "Project G",
    category: "$1,450,000.00",
    sales: "$1,200,000.00",
    cogs: "$6,100,500.00",
    grossProfit: "$6,100,500.00",
    grossMargin: "17.40%",
  },
  {
    id: "p-h",
    projectName: "Project H",
    category: "$750,000.00",
    sales: "$680,000.00",
    cogs: "$3,150,000.00",
    grossProfit: "$3,150,000.00",
    grossMargin: "22.30%",
  },
  {
    id: "p-i",
    projectName: "Project I",
    category: "$2,100,000.00",
    sales: "$1,850,000.00",
    cogs: "$8,900,000.00",
    grossProfit: "$8,900,000.00",
    grossMargin: "19.50%",
  },
  {
    id: "p-j",
    projectName: "Project J",
    category: "$1,120,000.00",
    sales: "$990,000.00",
    cogs: "$4,950,000.00",
    grossProfit: "$4,950,000.00",
    grossMargin: "18.90%",
  },
];

// Custom Line Tooltip
const CustomLineTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-gray-100 rounded-lg shadow-lg p-2.5 text-xs z-50">
        <p className="font-semibold text-gray-800 mb-1">{label}</p>
        <div className="space-y-1">
          {payload.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-gray-600">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: item.color }}
                />
                {item.name}:
              </span>
              <span className="font-semibold text-gray-900">
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Custom Bar Tooltip
const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-gray-100 rounded-lg shadow-lg p-2.5 text-xs z-50">
        <p className="font-semibold text-gray-800 mb-1">{label}</p>
        <div className="space-y-1">
          {payload.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-gray-600">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: item.color }}
                />
                {item.name}:
              </span>
              <span className="font-semibold text-gray-900">
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function MarginAnalysisPage() {
  const navigate = useNavigate();

  // Top filter states
  const [selectedCompany, setSelectedCompany] = useState("All Companies");
  const [selectedProject, setSelectedProject] = useState("All Projects");
  const [selectedCurrency, setSelectedCurrency] = useState("All Currencies (USD)");
  const [selectedDateRange, setSelectedDateRange] = useState("24 Mar 2025 - 31 Mar 2025");

  // Dropdown open states
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [isProjectOpen, setIsProjectOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);

  // Chart filters
  const [trendInterval, setTrendInterval] = useState("Monthly");
  const [isTrendMenuOpen, setIsTrendMenuOpen] = useState(false);
  const [projectChartFilter, setProjectChartFilter] = useState("All Projects");
  const [isProjectChartMenuOpen, setIsProjectChartMenuOpen] = useState(false);

  // Table states
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);

  // Modal state
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);

  // Filtered rows for table
  const filteredData = useMemo(() => {
    return PL_SUMMARY_DATA.filter((row) => {
      const matchSearch =
        row.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchProject =
        selectedProject === "All Projects" || row.projectName === selectedProject;
      return matchSearch && matchProject;
    });
  }, [searchQuery, selectedProject]);

  const totalPages = 15; // Set to 15 matching screenshot
  const paginatedRows = useMemo(() => {
    return filteredData.slice(0, pageSize);
  }, [filteredData, pageSize]);

  return (
    <div className="space-y-6 px-2 sm:px-4 xl:px-0 pb-10">
      {/* 1. Header Section & Subtitle */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Margin Analysis
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Plan shipments by uploading shipper data, optimizing bundles, and building truckloads.
        </p>

        {/* Filters Bar */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {/* All Companies Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsCompanyOpen(!isCompanyOpen);
                setIsProjectOpen(false);
                setIsCurrencyOpen(false);
                setIsDateRangeOpen(false);
              }}
              className="bg-white border border-gray-200/90 rounded-lg px-3.5 py-2 text-xs md:text-sm font-medium text-gray-700 shadow-2xs hover:bg-gray-50/80 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <ListFilter className="w-4 h-4 text-gray-500" />
              <span>{selectedCompany}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
            {isCompanyOpen && (
              <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-30 text-xs">
                {["All Companies", "Apex Steel Corp", "Pacific Panels", "Summit Logistics", "Vanguard Metal"].map(
                  (c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setSelectedCompany(c);
                        setIsCompanyOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-50 cursor-pointer ${
                        selectedCompany === c ? "text-blue-600 font-semibold" : "text-gray-700"
                      }`}
                    >
                      {c}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {/* All Projects Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsProjectOpen(!isProjectOpen);
                setIsCompanyOpen(false);
                setIsCurrencyOpen(false);
                setIsDateRangeOpen(false);
              }}
              className="bg-white border border-gray-200/90 rounded-lg px-3.5 py-2 text-xs md:text-sm font-medium text-gray-700 shadow-2xs hover:bg-gray-50/80 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <ListFilter className="w-4 h-4 text-gray-500" />
              <span>{selectedProject}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
            {isProjectOpen && (
              <div className="absolute left-0 mt-1 w-44 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-30 text-xs">
                {["All Projects", "Project A", "Project B", "Project C", "Project D", "Project E"].map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setSelectedProject(p);
                      setIsProjectOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-50 cursor-pointer ${
                      selectedProject === p ? "text-blue-600 font-semibold" : "text-gray-700"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* All Currencies Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsCurrencyOpen(!isCurrencyOpen);
                setIsCompanyOpen(false);
                setIsProjectOpen(false);
                setIsDateRangeOpen(false);
              }}
              className="bg-white border border-gray-200/90 rounded-lg px-3.5 py-2 text-xs md:text-sm font-medium text-gray-700 shadow-2xs hover:bg-gray-50/80 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <ListFilter className="w-4 h-4 text-gray-500" />
              <span>{selectedCurrency}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
            {isCurrencyOpen && (
              <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-30 text-xs">
                {["All Currencies (USD)", "EUR (€)", "GBP (£)", "CAD ($)"].map((curr) => (
                  <button
                    key={curr}
                    onClick={() => {
                      setSelectedCurrency(curr);
                      setIsCurrencyOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-50 cursor-pointer ${
                      selectedCurrency === curr ? "text-blue-600 font-semibold" : "text-gray-700"
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date Range Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsDateRangeOpen(!isDateRangeOpen);
                setIsCompanyOpen(false);
                setIsProjectOpen(false);
                setIsCurrencyOpen(false);
              }}
              className="bg-white border border-gray-200/90 rounded-lg px-3.5 py-2 text-xs md:text-sm font-medium text-gray-700 shadow-2xs hover:bg-gray-50/80 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <span>{selectedDateRange}</span>
              <Calendar className="w-4 h-4 text-gray-500 ml-1" />
            </button>
            {isDateRangeOpen && (
              <div className="absolute left-0 mt-1 w-56 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-30 text-xs">
                {[
                  "24 Mar 2025 - 31 Mar 2025",
                  "Last 7 Days",
                  "Last 30 Days",
                  "This Month (March 2025)",
                  "Q1 2025",
                  "Year to Date",
                ].map((range) => (
                  <button
                    key={range}
                    onClick={() => {
                      setSelectedDateRange(range);
                      setIsDateRangeOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-50 cursor-pointer ${
                      selectedDateRange === range ? "text-blue-600 font-semibold" : "text-gray-700"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Top 5 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {STAT_METRICS.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-xl border border-gray-100 shadow-xs p-4 flex items-center gap-3.5 transition-all hover:shadow-sm"
          >
            <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] shrink-0">
              <CircleDollarSign className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{item.title}</p>
              <p className="text-xl font-bold text-gray-900 leading-tight mt-0.5">
                {item.value}
              </p>
              <p className="text-xs font-semibold text-emerald-500 mt-0.5">
                {item.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Middle Section: Two Charts Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Chart: Margin Trend Over Time */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm md:text-base font-bold text-gray-900">
                Margin Trend Over Time
              </h2>

              {/* Monthly Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsTrendMenuOpen(!isTrendMenuOpen)}
                  className="flex items-center gap-1.5 border border-gray-200 rounded-md px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  <span>{trendInterval}</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>
                {isTrendMenuOpen && (
                  <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-100 rounded-md shadow-md py-1 z-30 text-xs">
                    {["Monthly", "Quarterly", "Weekly"].map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          setTrendInterval(item);
                          setIsTrendMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-gray-50 cursor-pointer ${
                          trendInterval === item ? "text-blue-600 font-semibold" : "text-gray-700"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-600 mb-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
                <span>Gross Margin</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                <span>Operating Margin</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
                <span>Net Profit Margin</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308]" />
                <span>Contribution Margin</span>
              </div>
            </div>
          </div>

          {/* Line Chart */}
          <div className="w-full h-65">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={TREND_OVER_TIME_DATA}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="month"
                  axisLine={{ stroke: "#D1D5DB" }}
                  tickLine={{ stroke: "#9CA3AF" }}
                  tick={{ fill: "#374151", fontSize: 12, fontWeight: 500 }}
                  dy={4}
                />
                <YAxis hide={true} domain={[0, 75]} />
                <RechartsTooltip content={<CustomLineTooltip />} />
                <Line
                  type="monotone"
                  dataKey="grossMargin"
                  name="Gross Margin"
                  stroke="#3B82F6"
                  strokeWidth={2.2}
                  dot={false}
                  activeDot={{ r: 5, fill: "#3B82F6" }}
                />
                <Line
                  type="monotone"
                  dataKey="operatingMargin"
                  name="Operating Margin"
                  stroke="#10B981"
                  strokeWidth={2.2}
                  dot={false}
                  activeDot={{ r: 5, fill: "#10B981" }}
                />
                <Line
                  type="monotone"
                  dataKey="netProfitMargin"
                  name="Net Profit Margin"
                  stroke="#8B5CF6"
                  strokeWidth={2.2}
                  dot={false}
                  activeDot={{ r: 5, fill: "#8B5CF6" }}
                />
                <Line
                  type="monotone"
                  dataKey="contributionMargin"
                  name="Contribution Margin"
                  stroke="#EAB308"
                  strokeWidth={2.2}
                  dot={false}
                  activeDot={{ r: 5, fill: "#EAB308" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Margin by Projects */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm md:text-base font-bold text-gray-900">
                Margin by Projects
              </h2>

              {/* All Projects button/dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProjectChartMenuOpen(!isProjectChartMenuOpen)}
                  className="flex items-center gap-1.5 border border-gray-200 rounded-md px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  <span>{projectChartFilter}</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>
                {isProjectChartMenuOpen && (
                  <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-100 rounded-md shadow-md py-1 z-30 text-xs">
                    {["All Projects", "Top 5", "Bottom 5"].map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          setProjectChartFilter(item);
                          setIsProjectChartMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-gray-50 cursor-pointer ${
                          projectChartFilter === item
                            ? "text-blue-600 font-semibold"
                            : "text-gray-700"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-600 mb-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
                <span>Gross Margin</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                <span>Operating Margin</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
                <span>Net Profit Margin</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308]" />
                <span>Contribution Margin</span>
              </div>
            </div>
          </div>

          {/* Grouped Bar Chart */}
          <div className="w-full h-65">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={PROJECT_MARGIN_DATA}
                barGap={3}
                barCategoryGap="24%"
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke="#F9FAFB" />
                <XAxis
                  dataKey="project"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 11 }}
                  dy={4}
                />
                <YAxis
                  ticks={[0, 20, 40, 60, 80, 100]}
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 11 }}
                />
                <RechartsTooltip content={<CustomBarTooltip />} />
                <Bar
                  dataKey="grossMargin"
                  name="Gross Margin"
                  fill="#3B82F6"
                  barSize={8}
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="operatingMargin"
                  name="Operating Margin"
                  fill="#10B981"
                  barSize={8}
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="netProfitMargin"
                  name="Net Profit Margin"
                  fill="#8B5CF6"
                  barSize={8}
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="contributionMargin"
                  name="Contribution Margin"
                  fill="#EAB308"
                  barSize={8}
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Profit & Loss Summary */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
        {/* Table Top Header */}
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-base md:text-lg font-bold text-gray-900">
            Profit & Loss Summary
          </h2>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search Project"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-56 pl-9 pr-3 py-1.5 text-xs md:text-sm border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Action Button */}
            <button
              onClick={() => navigate("/project_budget_details")}
              className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium text-xs md:text-sm px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              View Profit & Loss Analysis
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead className="bg-[#F9FAFB] border-y border-gray-100 text-xs font-semibold text-gray-800">
              <tr>
                <th className="py-3 px-4 font-semibold text-gray-900">Project Name</th>
                <th className="py-3 px-4 font-semibold text-gray-900">Category</th>
                <th className="py-3 px-4 font-semibold text-gray-900">Sales (USD)</th>
                <th className="py-3 px-4 font-semibold text-gray-900">COGS (USD)</th>
                <th className="py-3 px-4 font-semibold text-gray-900">Gross Profit (USD)</th>
                <th className="py-3 px-4 font-semibold text-gray-900">Gross Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedRows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/70 transition-colors">
                  <td
                    onClick={() => navigate("/project_budget_details")}
                    className="py-3.5 px-4 font-semibold text-gray-900 cursor-pointer hover:text-blue-600 hover:underline"
                  >
                    {row.projectName}
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">
                    {row.category}
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">
                    {row.sales}
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">
                    {row.cogs}
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">
                    {row.grossProfit}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#10B981]">
                    {row.grossMargin}
                  </td>
                </tr>
              ))}
              {paginatedRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No matching projects found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Row */}
        <div className="p-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm">
          {/* Left: Showing X Results */}
          <div className="flex items-center gap-2 text-gray-600">
            <span>Showing</span>
            <div className="relative">
              <button
                onClick={() => setIsPageSizeOpen(!isPageSizeOpen)}
                className="border border-gray-200 rounded px-2 py-1 flex items-center gap-1.5 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                <span>{pageSize}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>
              {isPageSizeOpen && (
                <div className="absolute left-0 bottom-full mb-1 w-16 bg-white border border-gray-100 rounded shadow-md py-1 z-30">
                  {[5, 10, 20].map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        setPageSize(size);
                        setIsPageSizeOpen(false);
                      }}
                      className="w-full text-center py-1 hover:bg-gray-50 cursor-pointer"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span>Results</span>
          </div>

          {/* Right: Page Navigation matching screenshot */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page 1 (Active with purple border) */}
            <button
              onClick={() => setCurrentPage(1)}
              className={`w-8 h-8 rounded flex items-center justify-center font-medium cursor-pointer ${
                currentPage === 1
                  ? "border border-purple-500 text-purple-600 bg-purple-50/20"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              1
            </button>

            {/* Page 2 */}
            <button
              onClick={() => setCurrentPage(2)}
              className={`w-8 h-8 rounded flex items-center justify-center font-medium cursor-pointer ${
                currentPage === 2
                  ? "border border-purple-500 text-purple-600 bg-purple-50/20"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              2
            </button>

            {/* Page 3 */}
            <button
              onClick={() => setCurrentPage(3)}
              className={`w-8 h-8 rounded flex items-center justify-center font-medium cursor-pointer ${
                currentPage === 3
                  ? "border border-purple-500 text-purple-600 bg-purple-50/20"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              3
            </button>

            <span className="px-1 text-gray-400">...</span>

            {/* Page 15 */}
            <button
              onClick={() => setCurrentPage(15)}
              className={`w-8 h-8 rounded flex items-center justify-center font-medium cursor-pointer ${
                currentPage === 15
                  ? "border border-purple-500 text-purple-600 bg-purple-50/20"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              15
            </button>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. View Profit & Loss Analysis Modal */}
      {isAnalysisModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    Profit & Loss Analysis Breakdown
                  </h3>
                  <p className="text-xs text-gray-500">
                    Detailed financial performance by project and category
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAnalysisModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Summary Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Total Sales</p>
                <p className="text-base font-bold text-gray-900 mt-0.5">$5,250,900</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Total COGS</p>
                <p className="text-base font-bold text-gray-900 mt-0.5">$4,271,080</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <p className="text-xs text-emerald-700">Gross Profit</p>
                <p className="text-base font-bold text-emerald-700 mt-0.5">$979,820</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">Gross Margin</p>
                <p className="text-base font-bold text-blue-700 mt-0.5">18.66%</p>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="border border-gray-100 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Cost of Goods Sold (COGS) Breakdown
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-600">Raw Material & Steel Panels</span>
                  <span className="font-semibold text-gray-900">$2,450,000 (57.3%)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-600">Fabrication & Production Labor</span>
                  <span className="font-semibold text-gray-900">$1,020,000 (23.9%)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-600">Freight & Logistics</span>
                  <span className="font-semibold text-gray-900">$510,080 (11.9%)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Hardware & Accessories</span>
                  <span className="font-semibold text-gray-900">$291,000 (6.8%)</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                className="text-gray-600 text-xs h-9"
                onClick={() => setIsAnalysisModalOpen(false)}
              >
                Close
              </Button>
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-9"
                onClick={() => setIsAnalysisModalOpen(false)}
              >
                Export Report
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
