import { useState } from "react";
import {
  MarginAnalysisHeader,
  MarginKpiCards,
  MarginTrendChart,
  MarginByProjectsChart,
  ProfitLossSummaryTable,
  ProfitLossDetailModal,
  type MarginFilters,
} from "@/components/margin-analysis";

export default function MarginAnalysisPage() {
  const [filters, setFilters] = useState<MarginFilters>({
    companyId: "all",
    projectId: "all",
    currency: "USD",
    startDate: "",
    endDate: "",
    presetLabel: "All Time",
  });

  const [modalProjectId, setModalProjectId] = useState<string | null>(null);

  return (
    <div className="space-y-6 px-2 sm:px-4 xl:px-0 pb-10">
      {/* 1. Header & Filters Section */}
      <MarginAnalysisHeader
        filters={filters}
        onFilterChange={setFilters}
      />

      {/* 2. Top 5 Stat Cards */}
      <MarginKpiCards filters={filters} />

      {/* 3. Middle Section: Two Charts Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <MarginTrendChart filters={filters} />
        <MarginByProjectsChart filters={filters} />
      </div>

      {/* 4. Bottom Section: Profit & Loss Summary */}
      <ProfitLossSummaryTable
        filters={filters}
        onOpenAnalysisModal={(leadId) =>
          setModalProjectId(
            leadId ||
              (filters.projectId !== "all" ? filters.projectId : undefined) ||
              "all",
          )
        }
      />

      {/* 5. View Profit & Loss Analysis Modal */}
      <ProfitLossDetailModal
        isOpen={Boolean(modalProjectId)}
        onClose={() => setModalProjectId(null)}
        projectId={
          modalProjectId === "all" ? undefined : modalProjectId || undefined
        }
        filters={filters}
      />
    </div>
  );
}
