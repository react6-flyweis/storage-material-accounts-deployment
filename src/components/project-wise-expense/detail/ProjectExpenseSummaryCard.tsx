import React from "react";

interface SummaryItem {
  label: string;
  value: string;
}

const mainExpenseItems: SummaryItem[] = [
  { label: "Total Contract Value", value: "$2,45,00,000" },
  { label: "Total Budget Expense", value: "$1,50,00,000" },
  { label: "Total Expense", value: "$1,28,40,000" },
  { label: "Approved Expense", value: "$1,12,30,000" },
  { label: "Pending Approval", value: "$16,10,000" },
  { label: "Paid Till Date", value: "$98,70,000" },
  { label: "Balance Payable", value: "$13,60,000" },
];

export const ProjectExpenseSummaryCard: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-100 flex flex-col justify-between overflow-hidden h-full">
      <div>
        {/* Card Header */}
        <div className="p-5 pb-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-base sm:text-lg">
            Project Expense Summary
          </h3>
        </div>

        {/* List Items */}
        <div className="p-5 space-y-3.5 text-xs sm:text-sm">
          {mainExpenseItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between"
            >
              <span className="text-slate-500 font-normal">{item.label}</span>
              <span className="font-bold text-slate-900">{item.value}</span>
            </div>
          ))}

          {/* Budget Variance (Red Highlight Row) */}
          <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
            <span className="font-bold text-[#EF4444] text-xs sm:text-sm">
              Budget Variance
            </span>
            <span className="font-bold text-[#EF4444] text-sm sm:text-base">
              -$21,60,000
            </span>
          </div>
        </div>
      </div>

      {/* Budget Utilization Footer Banner (Soft Green Container) */}
      <div className="mx-5 mb-5 p-3.5 rounded-lg bg-[#E6F4EA] flex items-center justify-between">
        <span className="font-bold text-[#15803D] text-xs sm:text-sm">
          Budget Utilization
        </span>
        <span className="font-bold text-[#15803D] text-sm sm:text-base">
          85.63%
        </span>
      </div>
    </div>
  );
};

export default ProjectExpenseSummaryCard;
