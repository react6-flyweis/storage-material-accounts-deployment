import { CircleDollarSign } from "lucide-react";
import type { ProjectFinancialSummary } from "@/redux/api/projectApi";
import { formatIndianShortCurrency } from "@/modules/customers/customer-utils";

interface ProjectFinancialKpiGridProps {
  financialSummary?: ProjectFinancialSummary;
}

export function ProjectFinancialKpiGrid({
  financialSummary,
}: ProjectFinancialKpiGridProps) {
  const marginVal = financialSummary?.actualMargin;
  const formattedMargin =
    typeof marginVal === "number"
      ? Number.isInteger(marginVal)
        ? `${marginVal}.0%`
        : `${marginVal}%`
      : "0%";

  const blueKpiCards = [
    {
      title: "Project Value",
      value: formatIndianShortCurrency(financialSummary?.projectValue ?? 0),
    },
    {
      title: "Total Invoiced",
      value: formatIndianShortCurrency(financialSummary?.totalInvoiced ?? 0),
    },
    {
      title: "Total Received",
      value: formatIndianShortCurrency(financialSummary?.totalReceived ?? 0),
    },
    {
      title: "Outstanding",
      value: formatIndianShortCurrency(financialSummary?.outstanding ?? 0),
    },
  ];

  const whiteKpiCards = [
    {
      title: "Total Project Cost",
      value: formatIndianShortCurrency(financialSummary?.totalProjectCost ?? 0),
    },
    {
      title: "Expected Profit",
      value: formatIndianShortCurrency(financialSummary?.expectedProfit ?? 0),
    },
    {
      title: "Actual Profit",
      value: formatIndianShortCurrency(financialSummary?.actualProfit ?? 0),
    },
    {
      title: "Actual Margin",
      value: formattedMargin,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Row 1: 4 Dark Blue Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {blueKpiCards.map((card) => (
          <div
            key={card.title}
            className="bg-[#184887] rounded-xl p-4 text-white flex items-center gap-3.5 shadow-xs transition-transform hover:-translate-y-0.5 duration-200"
          >
            <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center shrink-0">
              <CircleDollarSign className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div>
              <p className="text-white/80 text-xs font-normal">{card.title}</p>
              <p className="text-white text-xl font-bold tracking-tight mt-0.5">
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: 4 White Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {whiteKpiCards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs flex items-center gap-3.5 transition-transform hover:-translate-y-0.5 duration-200"
          >
            <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center shrink-0">
              <CircleDollarSign className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium">{card.title}</p>
              <p className="text-slate-900 text-xl font-bold tracking-tight mt-0.5">
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
