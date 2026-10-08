import React, { useState } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ShoppingCart, Calendar, ChevronDown } from "lucide-react";

interface ExpenseOverviewDataPoint {
  month: string;
  year: string;
  approved: number;
  total: number;
  pending: number;
}

const mockMonthlyExpenseData: Record<string, ExpenseOverviewDataPoint[]> = {
  "Last 6 Months": [
    { month: "Nov", year: "2023", approved: 95, total: 82, pending: 20 },
    { month: "Dec", year: "2023", approved: 68, total: 52, pending: 24 },
    { month: "Jan", year: "2024", approved: 72, total: 32, pending: 12 },
    { month: "Feb", year: "2024", approved: 80, total: 40, pending: 28 },
    { month: "Mar", year: "2024", approved: 70, total: 38, pending: 22 },
    { month: "Apr", year: "2024", approved: 65, total: 50, pending: 45 },
  ],
  "Last 3 Months": [
    { month: "Feb", year: "2024", approved: 80, total: 40, pending: 28 },
    { month: "Mar", year: "2024", approved: 70, total: 38, pending: 22 },
    { month: "Apr", year: "2024", approved: 65, total: 50, pending: 45 },
  ],
  "This Year": [
    { month: "Jan", year: "2024", approved: 72, total: 32, pending: 12 },
    { month: "Feb", year: "2024", approved: 80, total: 40, pending: 28 },
    { month: "Mar", year: "2024", approved: 70, total: 38, pending: 22 },
    { month: "Apr", year: "2024", approved: 65, total: 50, pending: 45 },
  ],
};

interface CustomXAxisTickProps {
  x?: number;
  y?: number;
  payload?: {
    value: string;
  };
}

const CustomXAxisTick: React.FC<CustomXAxisTickProps> = ({
  x = 0,
  y = 0,
  payload,
}) => {
  const value = payload?.value || "";
  const [m, yVal] = value.split(" ");

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={12}
        textAnchor="middle"
        fill="#64748B"
        fontSize={11}
        fontWeight={500}
      >
        {m}
      </text>
      <text
        x={0}
        y={0}
        dy={26}
        textAnchor="middle"
        fill="#94A3B8"
        fontSize={10}
      >
        {yVal}
      </text>
    </g>
  );
};

interface CustomLineDotProps {
  cx?: number;
  cy?: number;
}

const CustomLineDot: React.FC<CustomLineDotProps> = ({ cx, cy }) => {
  if (cx == null || cy == null) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill="#F59E0B" />
      <circle cx={cx} cy={cy} r={3} fill="#FEF3C7" />
    </g>
  );
};

export const ExpenseOverviewChartCard: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState("Last 6 Months");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const data =
    mockMonthlyExpenseData[selectedRange] ||
    mockMonthlyExpenseData["Last 6 Months"];
  const formattedData = data.map((d) => ({
    ...d,
    displayKey: `${d.month} ${d.year}`,
  }));

  return (
    <div className="bg-white rounded-xl p-5 sm:p-6 shadow-xs border border-slate-100 flex flex-col justify-between h-full">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-[#F97316]">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-slate-800 text-sm sm:text-base">
            Expense Overview (In Lacks)
          </h3>
        </div>

        {/* Time Filter Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{selectedRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
              {Object.keys(mockMonthlyExpenseData).map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => {
                    setSelectedRange(range);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                    selectedRange === range
                      ? "bg-blue-50 text-blue-600 font-semibold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Legend / Key Summary Indicators matching image */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 my-4">
        {/* Total Expense */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
            <span className="text-[11px] sm:text-xs text-slate-500 font-normal">
              Total Expense
            </span>
          </div>
          <span className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
            49K
          </span>
        </div>

        {/* Approved Expense */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="text-[11px] sm:text-xs text-slate-500 font-normal">
              Approved Expense
            </span>
          </div>
          <span className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
            38K
          </span>
        </div>

        {/* Pending Approval */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            <span className="text-[11px] sm:text-xs text-slate-500 font-normal">
              Pending Approval
            </span>
          </div>
          <span className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
            38K
          </span>
        </div>
      </div>

      {/* Chart matching screenshot: Green Bar (Approved) + Blue Bar (Total) + Orange Line (Pending) */}
      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={formattedData}
            margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
            barGap={4}
          >
            <CartesianGrid
              strokeDasharray="0"
              stroke="#F1F5F9"
              vertical={false}
            />
            <XAxis
              dataKey="displayKey"
              axisLine={{ stroke: "#E2E8F0" }}
              tickLine={false}
              tick={<CustomXAxisTick />}
              interval={0}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 11 }}
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const item = payload[0].payload as ExpenseOverviewDataPoint;
                return (
                  <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-xs space-y-1.5 min-w-36">
                    <div className="font-semibold text-slate-800 border-b border-slate-100 pb-1">
                      {item.month} {item.year}
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                        Approved:
                      </span>
                      <span className="font-bold text-slate-900">
                        {item.approved} Lacks
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                        Total:
                      </span>
                      <span className="font-bold text-slate-900">
                        {item.total} Lacks
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                        Pending:
                      </span>
                      <span className="font-bold text-slate-900">
                        {item.pending} Lacks
                      </span>
                    </div>
                  </div>
                );
              }}
            />
            {/* Green Bar for Approved Expense */}
            <Bar
              dataKey="approved"
              fill="#10B981"
              barSize={18}
              radius={[4, 4, 0, 0]}
            />
            {/* Blue Bar for Total Expense */}
            <Bar
              dataKey="total"
              fill="#2563EB"
              barSize={18}
              radius={[4, 4, 0, 0]}
            />
            {/* Orange Line for Pending Approval */}
            <Line
              type="linear"
              dataKey="pending"
              stroke="#F59E0B"
              strokeWidth={2.5}
              dot={<CustomLineDot />}
              activeDot={{ r: 7, fill: "#F59E0B" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ExpenseOverviewChartCard;
