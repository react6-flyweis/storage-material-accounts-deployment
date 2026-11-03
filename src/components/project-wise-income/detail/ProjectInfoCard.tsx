import React from "react";
import { Landmark, Building, CircleDollarSign, Calendar } from "lucide-react";
import type { ProjectWiseIncomeDetailProject } from "@/redux/api/reportsApi";
import { formatCurrency, formatDisplayDate } from "@/lib/dashboardFormatters";

interface ProjectInfoCardProps {
  project?: ProjectWiseIncomeDetailProject;
  name?: string;
  code?: string;
  location?: string;
  quoteValue?: string | number;
  startDate?: string;
  endDate?: string;
  status?: string;
  isLoading?: boolean;
}

const formatStatusText = (status?: string): string => {
  if (!status) return "-";
  const map: Record<string, string> = {
    po_received: "PO Received",
    in_progress: "In Progress",
    completed: "Completed",
    on_hold: "On Hold",
    active: "Active",
    pending: "Pending",
  };
  const key = status.toLowerCase().trim();
  return map[key] || status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

export const ProjectInfoCard: React.FC<ProjectInfoCardProps> = ({
  project,
  name,
  code,
  location,
  quoteValue,
  startDate,
  endDate,
  status,
  isLoading = false,
}) => {
  const displayName = project?.projectName || name || "-";
  const displayCode = project?.projectId || code || "-";
  const displayLocation = project?.location || location || "-";
  const displayQuoteValue =
    project?.quoteValue !== undefined
      ? formatCurrency(project.quoteValue)
      : typeof quoteValue === "number"
      ? formatCurrency(quoteValue)
      : quoteValue || "-";
  const displayStartDate = project?.startDate
    ? formatDisplayDate(project.startDate)
    : startDate
    ? formatDisplayDate(startDate)
    : "-";
  const displayEndDate = project?.endDate
    ? formatDisplayDate(project.endDate)
    : endDate
    ? formatDisplayDate(endDate)
    : "-";
  const displayStatus = project?.status
    ? formatStatusText(project.status)
    : status
    ? formatStatusText(status)
    : "-";

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-100 flex flex-col justify-between animate-pulse">
        <div className="flex items-center justify-between pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-100 shrink-0" />
            <div className="space-y-2">
              <div className="w-48 h-5 bg-slate-100 rounded" />
              <div className="w-24 h-3 bg-slate-100 rounded" />
            </div>
          </div>
          <div className="w-20 h-6 bg-slate-100 rounded-full" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="w-20 h-3 bg-slate-100 rounded" />
              <div className="w-24 h-4 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-100 flex flex-col justify-between">
      {/* Top Row: Icon + Name + Code + Active Badge */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#2563EB] shrink-0">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {displayName}
            </h2>
            <p className="text-xs text-slate-500 font-normal mt-0.5">{displayCode}</p>
          </div>
        </div>

        {/* Status Badge */}
        {displayStatus !== "-" && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
            <span>{displayStatus}</span>
          </div>
        )}
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
              {displayLocation}
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
              {displayQuoteValue}
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
              {displayStartDate}
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
              {displayEndDate}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectInfoCard;
