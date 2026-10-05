import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign, Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const tableData = [
  {
    orderId: "ORD-2024-001",
    projectName: "Website Development",
    revenue: "$45,000",
    expense: "$32,000",
    netProfit: "$13,000",
    margin: "28.9%",
    status: "Completed",
    statusColor: "bg-emerald-100 text-emerald-700",
    marginColor: "text-emerald-600",
  },
  {
    orderId: "ORD-2024-002",
    projectName: "Mobile App Design",
    revenue: "$28,000",
    expense: "$25,200",
    netProfit: "$2,800",
    margin: "10.0%",
    status: "In Progress",
    statusColor: "bg-yellow-100 text-yellow-700",
    marginColor: "text-emerald-600",
  },
  {
    orderId: "ORD-2024-003",
    projectName: "Marketing Campaign",
    revenue: "$15,000",
    expense: "$14,500",
    netProfit: "$500",
    margin: "3.3%",
    status: "Completed",
    statusColor: "bg-emerald-100 text-emerald-700",
    marginColor: "text-red-500",
  },
  {
    orderId: "ORD-2024-004",
    projectName: "Data Analytics Platform",
    revenue: "$65,000",
    expense: "$48,000",
    netProfit: "$17,000",
    margin: "26.2%",
    status: "Completed",
    statusColor: "bg-emerald-100 text-emerald-700",
    marginColor: "text-emerald-600",
  },
  {
    orderId: "ORD-2024-005",
    projectName: "Brand Identity Package",
    revenue: "$22,000",
    expense: "$18,500",
    netProfit: "$3,500",
    margin: "15.9%",
    status: "In Progress",
    statusColor: "bg-yellow-100 text-yellow-700",
    marginColor: "text-emerald-600",
  },
];

const barData = [
  { name: "IT Services", revenue: 110000, expense: 80000 },
  { name: "Design", revenue: 50000, expense: 42000 },
  { name: "Marketing", revenue: 16000, expense: 15000 },
  { name: "Finance", revenue: 0, expense: 0 },
];

const lineData = [
  { month: "Jan", profit: 24000 },
  { month: "Feb", profit: 32000 },
  { month: "Mar", profit: 39000 },
  { month: "Apr", profit: 46000 },
  { month: "May", profit: 50000 },
  { month: "Jun", profit: 56000 },
];

export default function ProfitAndLossOverview() {
  return (
    <Card className="p-6 bg-white rounded-md border-none shadow-sm space-y-8">
      <div>
        <h3 className="md:text-lg font-normal text-gray-900 mb-6">
          Profit & Loss Overview
        </h3>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-500">
              Department
            </label>
            <Select defaultValue="all">
              <SelectTrigger className="w-full bg-white border-gray-200">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="it">IT Services</SelectItem>
                <SelectItem value="design">Design</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-500">Project</label>
            <Select defaultValue="all">
              <SelectTrigger className="w-full bg-white border-gray-200">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-500">
              Date Range
            </label>
            <Select defaultValue="this_month">
              <SelectTrigger className="w-full bg-white border-gray-200">
                <SelectValue placeholder="This Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Project Name
                </th>
                <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Expense
                </th>
                <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Net Profit
                </th>
                <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Margin %
                </th>
                <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tableData.map((row, idx) => (
                <tr
                  key={row.orderId}
                  className={cn(
                    "hover:bg-gray-50/50 transition-colors",
                    idx === 2 ? "bg-red-50/20" : "" // Highlight simplistic way for the Marketing row if needed, strictly not required by data but by image looking a bit pinkish background? Or maybe selected.
                    // The image has a light reddish/pinkish background for the Marketing Campaign row.
                  )}
                  style={
                    idx === 2
                      ? { backgroundColor: "rgba(254, 242, 242, 1)" }
                      : {}
                  }
                >
                  <td className="py-4 px-4 text-sm text-gray-900 font-medium">
                    {row.orderId}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-900">
                    {row.projectName}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-900 font-medium">
                    {row.revenue}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-900 font-medium">
                    {row.expense}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-900 font-medium">
                    {row.netProfit}
                  </td>
                  <td
                    className={cn(
                      "py-4 px-4 text-sm font-medium",
                      row.marginColor
                    )}
                  >
                    {row.margin}
                  </td>
                  <td className="py-4 px-4 text-sm">
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium",
                        row.statusColor
                      )}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6 gap-2 mb-8">
          <div className="bg-blue-50/50 rounded-lg p-5 flex items-center gap-4">
            <div className="xl:w-10 xl:h-10 w-8 h-8 rounded-full border-blue-600 border-2 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">
                Total Revenue
              </p>
              <p className="xl:text-2xl font-normal text-blue-900">$175,000</p>
            </div>
          </div>

          <div className="bg-red-50/50 rounded-lg p-5 flex items-center gap-4">
            <div className="xl:w-10 xl:h-10 w-8 h-8 rounded-full border-2 border-red-500 flex items-center justify-center shrink-0 bg-white">
              <DollarSign className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-red-600 mb-1">
                Total Expense
              </p>
              <p className="xl:text-2xl font-normal text-red-900">$138,200</p>
            </div>
          </div>

          <div className="bg-green-50/50 rounded-lg p-5 flex items-center gap-4">
            <div className="w-5 h-5 md:hidden" />
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">
                Net Profit
              </p>
              <p className="xl:text-2xl font-normal text-green-900">$36,800</p>
            </div>
          </div>

          <div className="bg-purple-50/50 rounded-lg p-5 flex items-center gap-4">
            <div className="xl:w-10 xl:h-10 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
              <Percent className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-600 mb-1">
                Average Margin
              </p>
              <p className="xl:text-2xl font-normal text-purple-900">16.9%</p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue vs Expense Chart */}
          <div>
            <h4 className="md:text-base font-normal text-gray-900 mb-6">
              Revenue vs Expense by Department
            </h4>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  barCategoryGap={30}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E5E7EB"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={true}
                    tickLine={false}
                    tick={{ fill: "#6B7280", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={true}
                    tickLine={false}
                    tick={{ fill: "#6B7280", fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#3B82F6"
                    radius={[2, 2, 0, 0]}
                    name="Revenue"
                  />
                  <Bar
                    dataKey="expense"
                    fill="#EF4444"
                    radius={[2, 2, 0, 0]}
                    name="Expense"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Profit Trend */}
          <div>
            <h4 className="md:text-base font-normal text-gray-900 mb-6">
              Monthly Profit Trend
            </h4>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={lineData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={true}
                    horizontal={true}
                    stroke="#E5E7EB"
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={true}
                    tickLine={false}
                    tick={{ fill: "#6B7280", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={true}
                    tickLine={false}
                    tick={{ fill: "#6B7280", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: "#fff",
                      stroke: "#10B981",
                      strokeWidth: 2,
                    }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
