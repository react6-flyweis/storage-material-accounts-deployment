import { useMemo } from "react";
import type { ProjectProfitabilityItem } from "@/redux/api/projectApi";
import { formatIndianShortCurrency } from "@/modules/customers/customer-utils";

interface ProjectFinancialPerformanceTableProps {
  profitabilityOverview?: ProjectProfitabilityItem[];
}

export function ProjectFinancialPerformanceTable({
  profitabilityOverview,
}: ProjectFinancialPerformanceTableProps) {
  const rows = useMemo(() => {
    if (!profitabilityOverview || profitabilityOverview.length === 0) {
      return [];
    }

    return profitabilityOverview.map((item) => {
      const isPercent =
        item.unit === "percent" || item.key.toLowerCase().includes("margin");
      const isSummary = [
        "revenue",
        "totalcost",
        "total_cost",
        "profit",
        "margin",
        "marginpct",
        "margin_pct",
      ].includes(item.key.toLowerCase());

      const formatVal = (v: number) => {
        if (isPercent) return `${v}%`;
        return formatIndianShortCurrency(v);
      };

      const formatVariance = (v: number) => {
        const prefix = v > 0 ? "+" : "";
        if (isPercent) return `${prefix}${v}%`;
        return `${prefix}${formatIndianShortCurrency(v)}`;
      };

      const isPositive = item.variance >= 0;
      const isCost =
        item.key.toLowerCase().includes("cost") ||
        item.key.toLowerCase().includes("expense");

      let actualColor = isPositive ? "text-[#10B981]" : "text-[#EF4444]";
      let varianceBg = isPositive
        ? "bg-[#DCFCE7] text-[#16A34A]"
        : "bg-[#FEE2E2] text-[#EF4444]";

      if (isCost) {
        actualColor = isPositive ? "text-[#EF4444]" : "text-[#10B981]";
        varianceBg = isPositive
          ? "bg-[#FEE2E2] text-[#EF4444]"
          : "bg-[#DCFCE7] text-[#16A34A]";
      }

      let rowBg = "";
      if (
        item.key.toLowerCase().includes("totalcost") ||
        item.key.toLowerCase().includes("total_cost")
      ) {
        rowBg = "bg-[#F0FDF4]/60";
      } else if (item.key.toLowerCase().includes("margin")) {
        rowBg = "bg-[#FEF2F2]/60";
      }

      return {
        key: item.key,
        metric: item.label,
        expected: formatVal(item.expected),
        actual: formatVal(item.actual),
        actualColor,
        variance: formatVariance(item.variance),
        varianceBg,
        isSummary,
        rowBg,
      };
    });
  }, [profitabilityOverview]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-4 overflow-hidden">
      <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
        PROJECT FINANCIAL PERFORMANCE
      </h3>

      {rows.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500">
          No financial performance data recorded for this project.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#ECEEF2] text-xs font-bold text-slate-800">
                <th className="py-3.5 px-6 font-bold text-slate-800">
                  Financial Metric
                </th>
                <th className="py-3.5 px-6 font-bold text-slate-800">
                  Expected
                </th>
                <th className="py-3.5 px-6 font-bold text-slate-800">Actual</th>
                <th className="py-3.5 px-6 font-bold text-slate-800 text-center">
                  Variance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {rows.map((row) => (
                <tr
                  key={row.key || row.metric}
                  className={`hover:bg-slate-50/60 transition-colors ${
                    row.rowBg || ""
                  }`}
                >
                  <td
                    className={`py-3.5 px-6 ${
                      row.isSummary
                        ? "font-bold text-slate-900"
                        : "font-medium text-slate-800"
                    }`}
                  >
                    {row.metric}
                  </td>
                  <td
                    className={`py-3.5 px-6 ${
                      row.isSummary
                        ? "font-bold text-slate-900"
                        : "text-slate-600 font-normal"
                    }`}
                  >
                    {row.expected}
                  </td>
                  <td
                    className={`py-3.5 px-6 ${
                      row.actualColor
                    } ${row.isSummary ? "font-bold" : "font-semibold"}`}
                  >
                    {row.actual}
                  </td>
                  <td className="py-3.5 px-6 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        row.varianceBg
                      }`}
                    >
                      {row.variance}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
