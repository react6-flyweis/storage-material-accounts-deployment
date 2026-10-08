import React from "react";
import { Landmark, Building, CircleDollarSign, Calendar } from "lucide-react";

interface ProjectExpenseInfoCardProps {
  name?: string;
  code?: string;
  location?: string;
  quoteValue?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export const ProjectExpenseInfoCard: React.FC<ProjectExpenseInfoCardProps> = ({
  name = "Alpha Infra Proect",
  code = "PRO-2025-1047",
  location = "Pune, Maharashtra",
  quoteValue = "$12,500",
  startDate = "2024-10-10",
  endDate = "2025-10-10",
  status = "Active",
}) => {
  return (
    <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-100 flex flex-col justify-between">
      {/* Top Row: Icon + Name + Code + Active Badge */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          {/* Light green rounded box matching screenshot */}
          <div className="w-12 h-12 rounded-xl bg-[#ECFDF5] flex items-center justify-center text-[#10B981] shrink-0">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {name}
            </h2>
            <p className="text-xs text-slate-500 font-normal mt-0.5">{code}</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
          <span>{status}</span>
        </div>
      </div>

      {/* Bottom Metadata Row: Location, Quote Value, Start Date, End Date */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
        {/* Location */}
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 text-slate-400">
            <Building className="w-4 h-4" />
          </div>
          <div>
            <span className="text-slate-400 font-medium block">
              Project Location
            </span>
            <span className="text-slate-700 font-semibold text-xs sm:text-sm mt-0.5 block">
              {location}
            </span>
          </div>
        </div>

        {/* Quote Value */}
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 text-slate-400">
            <CircleDollarSign className="w-4 h-4" />
          </div>
          <div>
            <span className="text-slate-400 font-medium block">
              Quote Value
            </span>
            <span className="text-slate-700 font-semibold text-xs sm:text-sm mt-0.5 block">
              {quoteValue}
            </span>
          </div>
        </div>

        {/* Start Date */}
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 text-slate-400">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="text-slate-400 font-medium block">
              Start Date
            </span>
            <span className="text-slate-700 font-semibold text-xs sm:text-sm mt-0.5 block">
              {startDate}
            </span>
          </div>
        </div>

        {/* End Date */}
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 text-slate-400">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="text-slate-400 font-medium block">End Date</span>
            <span className="text-slate-700 font-semibold text-xs sm:text-sm mt-0.5 block">
              {endDate}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectExpenseInfoCard;
