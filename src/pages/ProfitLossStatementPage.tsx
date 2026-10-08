import React, { useState } from "react";
import { Calendar, ChevronDown, Upload } from "lucide-react";
import ProfitLossMetrics from "@/components/profit-loss/ProfitLossMetrics";
import ProfitLossSummaryTable from "@/components/profit-loss/ProfitLossSummaryTable";
import CalendarRangePickerModal from "@/components/common_components/CalendarRangePickerModal";
import ProjectSelectorDropdownModal from "@/components/common_components/ProjectSelectorDropdownModal";

export const ProfitLossStatementPage: React.FC = () => {
  const [selectedDateRange, setSelectedDateRange] = useState(
    "07 Jan 2026 - 23 Jan 2026"
  );
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(
    "Riverside Office Complex (PRJ-2025-0015)"
  );
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);

  const handleExport = () => {
    alert("Exporting Profit & Loss Statement report (PDF / Excel)...");
  };

  return (
    <div className="p-3 sm:p-5 lg:p-6 space-y-6">
      {/* Header Row: Title & Subtitle on left, Filters & Export on right */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Profit & Loss Statement
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
            Overview of income, expenses and profitability for your projects.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Date Range Selector & Calendar Modal */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsDatePickerOpen(!isDatePickerOpen);
                setIsProjectDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
            >
              <span>{selectedDateRange}</span>
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
            </button>

            <CalendarRangePickerModal
              isOpen={isDatePickerOpen}
              onClose={() => setIsDatePickerOpen(false)}
              onSelectRange={(range: string) => setSelectedDateRange(range)}
            />
          </div>

          {/* Project Filter Dropdown & Project Selector Modal */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsProjectDropdownOpen(!isProjectDropdownOpen);
                setIsDatePickerOpen(false);
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs min-w-32.5 max-w-[280px] justify-between"
            >
              <span className="truncate">{selectedProject}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            <ProjectSelectorDropdownModal
              isOpen={isProjectDropdownOpen}
              onClose={() => setIsProjectDropdownOpen(false)}
              selectedProject={selectedProject}
              onSelectProject={(proj) => setSelectedProject(proj)}
            />
          </div>

          {/* Export Report Button */}
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs cursor-pointer shrink-0"
          >
            <Upload className="w-3.5 h-3.5 rotate-0" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Top 5 Metric Cards */}
      <ProfitLossMetrics />

      {/* Profit & Loss Summary Table Card */}
      <ProfitLossSummaryTable />
    </div>
  );
};

export default ProfitLossStatementPage;
