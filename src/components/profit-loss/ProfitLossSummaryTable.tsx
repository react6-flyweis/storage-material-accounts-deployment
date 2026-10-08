import React, { useState } from "react";
import { Search } from "lucide-react";

interface PLRow {
  id: string;
  particulars: string;
  thisPeriod: string;
  lastPeriod: string;
  varianceAmount: string;
  variancePercent: string;
  percentColor?: string;
  rowType?: "header" | "item" | "total-income" | "total-expense" | "bold" | "net-profit";
}

export const ProfitLossSummaryTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const incomeItems: PLRow[] = [
    {
      id: "inc-1",
      particulars: "Project Revenue",
      thisPeriod: "$12,200,000",
      lastPeriod: "$10,850,000",
      varianceAmount: "$1,350,000",
      variancePercent: "12.44%",
      percentColor: "text-[#16A34A]",
      rowType: "item",
    },
    {
      id: "inc-2",
      particulars: "Other Income",
      thisPeriod: "$300,000",
      lastPeriod: "$150,000",
      varianceAmount: "$150,000",
      variancePercent: "100.00%",
      percentColor: "text-[#16A34A]",
      rowType: "item",
    },
    {
      id: "inc-total",
      particulars: "Total Income (A)",
      thisPeriod: "$12,500,000",
      lastPeriod: "$11,000,000",
      varianceAmount: "$1,500,000",
      variancePercent: "13.64%",
      percentColor: "text-[#16A34A]",
      rowType: "total-income",
    },
  ];

  const expenseItems: PLRow[] = [
    {
      id: "exp-1",
      particulars: "Direct Costs",
      thisPeriod: "$12,500,000",
      lastPeriod: "$11,000,000",
      varianceAmount: "$11,000,000",
      variancePercent: "12.44%",
      percentColor: "text-[#DC2626]",
      rowType: "item",
    },
    {
      id: "exp-2",
      particulars: "Indirect Costs",
      thisPeriod: "$12,500,000",
      lastPeriod: "$11,000,000",
      varianceAmount: "$11,000,000",
      variancePercent: "100.00%",
      percentColor: "text-[#DC2626]",
      rowType: "item",
    },
    {
      id: "exp-3",
      particulars: "Administrative Expenses",
      thisPeriod: "$12,500,000",
      lastPeriod: "$11,000,000",
      varianceAmount: "$11,000,000",
      variancePercent: "13.64%",
      percentColor: "text-[#DC2626]",
      rowType: "item",
    },
    {
      id: "exp-4",
      particulars: "Other Expenses",
      thisPeriod: "$12,500,000",
      lastPeriod: "$11,000,000",
      varianceAmount: "$11,000,000",
      variancePercent: "13.64%",
      percentColor: "text-[#DC2626]",
      rowType: "item",
    },
    {
      id: "exp-total",
      particulars: "Total Expenses (B)",
      thisPeriod: "$8,950,000",
      lastPeriod: "$8,050,000",
      varianceAmount: "$9,00,000",
      variancePercent: "11.08%",
      percentColor: "text-[#DC2626]",
      rowType: "total-expense",
    },
  ];

  const bottomItems: PLRow[] = [
    {
      id: "operating-profit",
      particulars: "Operating Profit (A-B)",
      thisPeriod: "$3,550,000",
      lastPeriod: "$2,950,000",
      varianceAmount: "$11,000,000",
      variancePercent: "20.34%",
      percentColor: "text-[#16A34A]",
      rowType: "bold",
    },
    {
      id: "tax-expense",
      particulars: "Tax Expense",
      thisPeriod: "$800,000",
      lastPeriod: "$650,000",
      varianceAmount: "$150,000",
      variancePercent: "23.08%",
      percentColor: "text-[#DC2626]",
      rowType: "item",
    },
    {
      id: "net-profit",
      particulars: "Net Profit",
      thisPeriod: "$2,750,000",
      lastPeriod: "$2,300,000",
      varianceAmount: "$450,000",
      variancePercent: "19.58%",
      percentColor: "text-[#16A34A]",
      rowType: "net-profit",
    },
  ];

  const filterList = (list: PLRow[]) => {
    if (!searchTerm.trim()) return list;
    const q = searchTerm.toLowerCase();
    return list.filter((r) => r.particulars.toLowerCase().includes(q));
  };

  const filteredIncome = filterList(incomeItems);
  const filteredExpense = filterList(expenseItems);
  const filteredBottom = filterList(bottomItems);

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
      {/* Table Card Header: Title & Search */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          Profit & Loss Summary
        </h2>

        {/* Search Input */}
        <div className="relative min-w-55 sm:min-w-70">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-212.5">
          <thead>
            <tr className="bg-[#E9EEF4]/70 text-slate-700 text-xs font-semibold border-b border-slate-200/60">
              <th
                rowSpan={2}
                className="px-5 py-3.5 text-left font-bold text-slate-800 w-[28%]"
              >
                Particulars
              </th>
              <th
                rowSpan={2}
                className="px-5 py-3.5 text-left font-bold text-slate-800 w-[22%]"
              >
                <div>This Period</div>
                <div className="font-normal text-slate-500 text-[11px] mt-0.5">
                  (01 May - 31 May 2025)
                </div>
              </th>
              <th
                rowSpan={2}
                className="px-5 py-3.5 text-left font-bold text-slate-800 w-[22%]"
              >
                <div>Last Period</div>
                <div className="font-normal text-slate-500 text-[11px] mt-0.5">
                  (01 Apr-31 Apr 2025)
                </div>
              </th>
              <th
                colSpan={2}
                className="px-5 py-2 text-center font-bold text-slate-800 border-b border-slate-200/80 w-[28%]"
              >
                Variance
              </th>
            </tr>
            <tr className="bg-[#E9EEF4]/70 text-slate-700 text-xs font-semibold border-b border-slate-200/60">
              <th className="px-5 py-2 text-left font-medium text-slate-600">
                Amount
              </th>
              <th className="px-5 py-2 text-right font-medium text-slate-600">
                %
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs sm:text-[13px]">
            {/* --- SECTION 1: INCOME --- */}
            {filteredIncome.length > 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 pt-4 pb-2 text-[#16A34A] font-bold text-xs sm:text-sm tracking-wide"
                >
                  Income
                </td>
              </tr>
            )}

            {filteredIncome.map((row) => {
              if (row.rowType === "total-income") {
                return (
                  <tr
                    key={row.id}
                    className="bg-[#F0FDF4] hover:bg-[#E6F9EC] transition-colors"
                  >
                    <td className="px-5 py-3 font-bold text-slate-900">
                      {row.particulars}
                    </td>
                    <td className="px-5 py-3 font-semibold text-[#16A34A]">
                      {row.thisPeriod}
                    </td>
                    <td className="px-5 py-3 font-semibold text-[#16A34A]">
                      {row.lastPeriod}
                    </td>
                    <td className="px-5 py-3 font-semibold text-[#16A34A]">
                      {row.varianceAmount}
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-[#16A34A]">
                      {row.variancePercent}
                    </td>
                  </tr>
                );
              }

              return (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-5 py-3 text-slate-600 font-normal">
                    {row.particulars}
                  </td>
                  <td className="px-5 py-3 text-slate-700 font-medium">
                    {row.thisPeriod}
                  </td>
                  <td className="px-5 py-3 text-slate-700 font-medium">
                    {row.lastPeriod}
                  </td>
                  <td className="px-5 py-3 text-slate-700 font-medium">
                    {row.varianceAmount}
                  </td>
                  <td
                    className={`px-5 py-3 text-right font-semibold ${row.percentColor}`}
                  >
                    {row.variancePercent}
                  </td>
                </tr>
              );
            })}

            {/* --- SECTION 2: EXPENSES --- */}
            {filteredExpense.length > 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 pt-4 pb-2 text-[#DC2626] font-bold text-xs sm:text-sm tracking-wide"
                >
                  Expenses
                </td>
              </tr>
            )}

            {filteredExpense.map((row) => {
              if (row.rowType === "total-expense") {
                return (
                  <tr
                    key={row.id}
                    className="bg-[#FFF1F2] hover:bg-[#FFE4E6] transition-colors"
                  >
                    <td className="px-5 py-3 font-bold text-slate-900">
                      {row.particulars}
                    </td>
                    <td className="px-5 py-3 font-bold text-slate-900">
                      {row.thisPeriod}
                    </td>
                    <td className="px-5 py-3 font-bold text-slate-900">
                      {row.lastPeriod}
                    </td>
                    <td className="px-5 py-3 font-bold text-slate-900">
                      {row.varianceAmount}
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-[#DC2626]">
                      {row.variancePercent}
                    </td>
                  </tr>
                );
              }

              return (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-5 py-3 text-slate-600 font-normal">
                    {row.particulars}
                  </td>
                  <td className="px-5 py-3 text-slate-700 font-medium">
                    {row.thisPeriod}
                  </td>
                  <td className="px-5 py-3 text-slate-700 font-medium">
                    {row.lastPeriod}
                  </td>
                  <td className="px-5 py-3 text-slate-700 font-medium">
                    {row.varianceAmount}
                  </td>
                  <td
                    className={`px-5 py-3 text-right font-semibold ${row.percentColor}`}
                  >
                    {row.variancePercent}
                  </td>
                </tr>
              );
            })}

            {/* --- SECTION 3: PROFIT & TAX ROWS --- */}
            {filteredBottom.map((row) => {
              if (row.rowType === "net-profit") {
                return (
                  <tr
                    key={row.id}
                    className="bg-blue-50/20 hover:bg-blue-50/40 transition-colors border-t border-slate-200"
                  >
                    <td className="px-5 py-3 font-bold">
                      <span className="text-[#2563EB] underline decoration-1 underline-offset-2 cursor-pointer">
                        {row.particulars}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-bold text-slate-900">
                      {row.thisPeriod}
                    </td>
                    <td className="px-5 py-3 font-bold text-slate-900">
                      {row.lastPeriod}
                    </td>
                    <td className="px-5 py-3 font-bold text-slate-900">
                      {row.varianceAmount}
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-[#16A34A]">
                      {row.variancePercent}
                    </td>
                  </tr>
                );
              }

              if (row.rowType === "bold") {
                return (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/60 transition-colors font-bold"
                  >
                    <td className="px-5 py-3 font-bold text-slate-900">
                      {row.particulars}
                    </td>
                    <td className="px-5 py-3 font-bold text-slate-900">
                      {row.thisPeriod}
                    </td>
                    <td className="px-5 py-3 font-bold text-slate-900">
                      {row.lastPeriod}
                    </td>
                    <td className="px-5 py-3 font-bold text-slate-900">
                      {row.varianceAmount}
                    </td>
                    <td
                      className={`px-5 py-3 text-right font-bold ${row.percentColor}`}
                    >
                      {row.variancePercent}
                    </td>
                  </tr>
                );
              }

              return (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-5 py-3 text-slate-600 font-normal">
                    {row.particulars}
                  </td>
                  <td className="px-5 py-3 text-slate-700 font-medium">
                    {row.thisPeriod}
                  </td>
                  <td className="px-5 py-3 text-slate-700 font-medium">
                    {row.lastPeriod}
                  </td>
                  <td className="px-5 py-3 text-slate-700 font-medium">
                    {row.varianceAmount}
                  </td>
                  <td
                    className={`px-5 py-3 text-right font-semibold ${row.percentColor}`}
                  >
                    {row.variancePercent}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="px-5 py-3 border-t border-slate-100 bg-white">
        <span className="text-[11px] text-slate-400 font-normal">
          All Amount are in USD
        </span>
      </div>
    </div>
  );
};

export default ProfitLossSummaryTable;
