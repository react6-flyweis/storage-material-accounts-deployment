import React from "react";
import type { ProjectWiseIncomeSummarySidebar } from "@/redux/api/reportsApi";
import { formatCurrency } from "@/lib/dashboardFormatters";

interface ProjectIncomeSummaryCardProps {
  sidebar?: ProjectWiseIncomeSummarySidebar;
  isLoading?: boolean;
}

export const ProjectIncomeSummaryCard: React.FC<ProjectIncomeSummaryCardProps> = ({
  sidebar,
  isLoading = false,
}) => {
  const mainItems = [
    {
      label: "Total Contract Value",
      value: formatCurrency(sidebar?.totalContractValue),
    },
    {
      label: "Billed to Date",
      value: formatCurrency(sidebar?.billedToDate),
    },
    {
      label: "Total Income",
      value: formatCurrency(sidebar?.totalIncome),
    },
    {
      label: "Received Income",
      value: formatCurrency(sidebar?.receivedIncome),
    },
    {
      label: "Pending Income",
      value: formatCurrency(sidebar?.pendingIncome),
    },
    {
      label: "Overdue Income",
      value: formatCurrency(sidebar?.overdueIncome),
    },
  ];

  const retentionItems = [
    {
      label: "Retention Amount",
      value: formatCurrency(sidebar?.retentionAmount),
    },
    {
      label: "Retention Released",
      value: formatCurrency(sidebar?.retentionReleased),
    },
  ];

  const balanceToBeReceived = formatCurrency(sidebar?.balanceToBeReceived);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-xs border border-slate-100 flex flex-col justify-between overflow-hidden h-full animate-pulse p-5 space-y-4">
        <div className="w-36 h-5 bg-slate-100 rounded" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="w-28 h-3.5 bg-slate-100 rounded" />
              <div className="w-20 h-3.5 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
        <div className="w-full h-12 bg-slate-100 rounded-lg mt-4" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-100 flex flex-col justify-between overflow-hidden h-full">
      <div>
        {/* Card Header */}
        <div className="p-5 pb-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-base sm:text-lg">
            Project Income Summary
          </h3>
        </div>

        {/* List Items */}
        <div className="p-5 space-y-3.5 text-xs sm:text-sm">
          {mainItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between"
            >
              <span className="text-slate-500 font-normal">{item.label}</span>
              <span className="font-bold text-slate-900">{item.value}</span>
            </div>
          ))}

          {/* Subtle Divider */}
          <div className="border-t border-slate-100 my-2 pt-1 space-y-3.5">
            {retentionItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between"
              >
                <span className="text-slate-500 font-normal">{item.label}</span>
                <span className="font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Highlight Banner matching screenshot */}
      <div className="mx-5 mb-5 p-3.5 rounded-lg bg-[#E6F4EA] flex items-center justify-between">
        <span className="font-bold text-slate-900 text-xs sm:text-sm">
          Balance to be Received
        </span>
        <span className="font-bold text-slate-900 text-sm sm:text-base">
          {balanceToBeReceived}
        </span>
      </div>
    </div>
  );
};

export default ProjectIncomeSummaryCard;
