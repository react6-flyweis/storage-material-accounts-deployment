import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";

const barChartData = [
  { name: "Operations", inflows: 0, outflows: 0 }, // Order top to bottom in chart usually means bottom to top in array for Recharts vertical layout?
  { name: "Marketing", inflows: 0, outflows: 0 },
  { name: "Design", inflows: 0, outflows: 0 },
  { name: "IT Services", inflows: 0, outflows: 0 },
].reverse(); // Recharts renders bottom-up. Image shows Operations at top.

const pieData = [
  { name: "Vendor", value: 100, color: "#3B82F6" },
  { name: "Labour", value: 45, color: "#EF4444" },
  { name: "Logistic", value: 25, color: "#F59E0B" },
  { name: "Enance", value: 25, color: "#10B981" },
];

const tableRows = [
  {
    department: "IT Services",
    inflows: "$1,10,000",
    outflows: "$1,10,000",
    netBalance: "$1,10,000",
    variance: "+15.2%",
    varianceColor: "text-emerald-500",
    action: "View Details",
  },
  {
    department: "Design",
    inflows: "$1,10,000",
    outflows: "$1,10,000",
    netBalance: "$1,10,000",
    variance: "+15.2%",
    varianceColor: "text-red-500",
    action: "View Details",
  },
  {
    department: "Marketing",
    inflows: "$1,10,000",
    outflows: "$1,10,000",
    netBalance: "$1,10,000",
    variance: "+15.2%",
    varianceColor: "text-red-500",
    action: "View Details",
  },
  {
    department: "Operations",
    inflows: "$1,10,000",
    outflows: "$1,10,000",
    netBalance: "$1,10,000",
    variance: "+15.2%",
    varianceColor: "text-red-500",
    rowBg: "bg-red-50/50",
    action: "View Details",
  },
];

export default function CashFlowAnalysis() {
  return (
    <div className="p-4 bg-white">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-6">
          Cash Flow Aalysis
        </h3>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-4xl">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-900">
            Department
          </label>
          <Select defaultValue="all">
            <SelectTrigger className="w-full bg-white border-gray-400">
              <SelectValue placeholder="All Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Department</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-900">
            Department
          </label>
          <Select defaultValue="all">
            <SelectTrigger className="w-full bg-white border-gray-400">
              <SelectValue placeholder="All Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Department</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:gap-6 md:gap-4 gap-2 mb-4">
        <Card className="bg-[#F0FDF4] border-none rounded-lg">
          <CardContent className="p-4 xl:p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">
              Total inflows
            </p>
            <p className="xl:text-2xl font-bold text-gray-900">$2,450,000</p>
          </CardContent>
        </Card>
        <Card className="bg-[#FEF2F2]border-none rounded-lg">
          <CardContent className="p-4 xl:p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">
              Total Outflows
            </p>
            <p className="xl:text-2xl font-bold text-gray-900">$1,680,000</p>
          </CardContent>
        </Card>
        <Card className="bg-[#EFF6FF] border-none rounded-lg">
          <CardContent className="p-4 xl:p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">
              net cash balance
            </p>
            <p className="xl:text-2xl font-bold text-gray-900">$770,000</p>
          </CardContent>
        </Card>
        <Card className="bg-[#FEF2F2] border-none rounded-lg">
          <CardContent className="p-4 xl:p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">
              Variance vs last month
            </p>
            <p className="xl:text-2xl font-bold text-gray-900">31.4%</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:gap-8 md:gap-6 gap-2">
        {/* Bar Chart */}
        <div>
          <h4 className="md:text-base font-semibold text-black mb-6">
            Inflows vs outflows by department
          </h4>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="0"
                  horizontal={true}
                  vertical={true}
                  stroke="#00000033"
                />
                <XAxis
                  type="number"
                  tickCount={7}
                  domain={[-0.5, 3]}
                  ticks={[0, 0.5, 1, 1.5, 2, 2.5, 3]}
                  tickLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={true}
                  tickLine={false}
                  width={100}
                  style={{ fontSize: "14px", fill: "#111827" }}
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
                  dataKey="inflows"
                  fill="#4ADE80"
                  barSize={10}
                  radius={[0, 4, 4, 0]}
                />
                <Bar
                  dataKey="outflows"
                  fill="#F87171"
                  barSize={10}
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div>
          <h4 className="md:text-base font-semibold text-black mb-6">
            Expense Distribution by category
          </h4>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={0}
                  dataKey="value"
                  label={({
                    cx,
                    cy,
                    midAngle = 0,
                    innerRadius,
                    outerRadius,
                    value,
                    name,
                  }) => {
                    const RADIAN = Math.PI / 180;
                    const radius =
                      25 + innerRadius + (outerRadius - innerRadius);
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    return (
                      <text
                        x={x}
                        y={y}
                        fill={
                          pieData.find((p) => p.name === name)?.color || "#000"
                        }
                        textAnchor={x > cx ? "start" : "end"}
                        dominantBaseline="central"
                        className="text-sm font-medium"
                      >
                        {`${name} ${value}%`}
                      </text>
                    );
                  }}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detail Table */}
      <div className="overflow-x-auto mb-8">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-gray-100">
              <th className="text-left py-4 px-4 md:text-sm text-xs font-normal text-gray-400 uppercase tracking-wider">
                DEPARTMENT
              </th>
              <th className="text-left py-4 px-4 md:text-sm text-xs font-normal text-gray-400 uppercase tracking-wider">
                INFLOWS
              </th>
              <th className="text-left py-4 px-4 md:text-sm text-xs font-normal text-gray-400 uppercase tracking-wider">
                OUTFLOWS
              </th>
              <th className="text-left py-4 px-4 md:text-sm text-xs font-normal text-gray-400 uppercase tracking-wider">
                NET BALANCE
              </th>
              <th className="text-left py-4 px-4 md:text-sm text-xs font-normal text-gray-400 uppercase tracking-wider">
                VARIANCE %
              </th>
              <th className="text-left py-4 px-4 md:text-sm text-xs font-normal text-gray-400 uppercase tracking-wider">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {tableRows.map((row, idx) => (
              <tr
                key={idx}
                className={cn(
                  "hover:bg-gray-50/50 transition-colors",
                  row.rowBg || "bg-white"
                )}
              >
                <td className="py-4 px-4 text-sm text-gray-900 font-medium">
                  {row.department}
                </td>
                <td className="py-4 px-4 text-sm text-emerald-500 font-medium">
                  {row.inflows}
                </td>
                <td className="py-4 px-4 text-sm text-red-500 font-medium">
                  {row.outflows}
                </td>
                <td className="py-4 px-4 text-sm text-emerald-500 font-medium">
                  {row.netBalance}
                </td>
                <td
                  className={cn(
                    "py-4 px-4 text-sm font-medium",
                    row.varianceColor
                  )}
                >
                  {row.variance}
                </td>
                <td className="py-4 px-4 text-sm text-blue-500 cursor-pointer hover:underline font-medium">
                  {row.action}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
