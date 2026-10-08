import React from "react";

interface CategoryStat {
  name: string;
  amount: string;
  dotColor: string;
}

const topCategories: CategoryStat[] = [
  {
    name: "Material Cost",
    amount: "$1,27,000",
    dotColor: "bg-[#2563EB]",
  },
  {
    name: "Manpower Cost",
    amount: "$73,89,000",
    dotColor: "bg-[#10B981]",
  },
  {
    name: "Freight & Logistics",
    amount: "$55,47,000",
    dotColor: "bg-[#F59E0B]",
  },
  {
    name: "Site/Project Expense",
    amount: "$37,05,000",
    dotColor: "bg-[#8B5CF6]",
  },
  {
    name: "Equipment & Machinery",
    amount: "$28,55,000",
    dotColor: "bg-[#A855F7]",
  },
];

export const TopExpenseCategoriesCard: React.FC = () => {
  return (
    <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-100">
      <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-4">
        Top Expense Categories (This Month)
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {topCategories.map((cat) => (
          <div
            key={cat.name}
            className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${cat.dotColor}`} />
              <span className="text-xs text-slate-500 font-normal truncate">
                {cat.name}
              </span>
            </div>
            <div className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mt-1 truncate">
              {cat.amount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopExpenseCategoriesCard;
