import React from "react";

interface SummaryItem {
  label: string;
  value: string;
}

const mainItems: SummaryItem[] = [
  { label: "Total Contract Value", value: "$2,45,00,000" },
  { label: "Billed to Date", value: "$1,60,00,000" },
  { label: "Total Income", value: "$1,37,50,000" },
  { label: "Received Income", value: "$1,05,50,000" },
  { label: "Pending Income", value: "$25,00,000" },
  { label: "Overdue Income", value: "$7,00,000" },
];

const retentionItems: SummaryItem[] = [
  { label: "Retention Amount", value: "$6,50,000" },
  { label: "Retention Released", value: "$3,20,000" },
];

export const ProjectIncomeSummaryCard: React.FC = () => {
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
          $31,80,000
        </span>
      </div>
    </div>
  );
};

export default ProjectIncomeSummaryCard;
