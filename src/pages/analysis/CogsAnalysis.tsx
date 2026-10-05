import { FileText, Funnel, FileX } from "lucide-react";
import TitleSubtitle from "@/components/common_components/TitleSubtitle";
import { ProfitGrowthOverTimeChart } from "@/components/ProfitGrowthOverTimeChart";
import TopHighestCostProjectsCard from "@/components/TopHighestCostProjectsCard";
import ProjectsExceedingBudgetCard from "@/components/ProjectsExceedingBudgetCard";
import OverallCostEfficiencyCard from "@/components/OverallCostEfficiencyCard";
import ProjectCostAnalysisTable from "@/components/ProjectCostAnalysisTable";
import { Button } from "@/components/ui/button";
import CogsAnalysisCard from "@/components/analytics/CogsAnalysisCard";
import CogsStatsGrid from "@/components/analytics/CogsStatsGrid";
import type { TabType } from "../Dashboard";
import { useState } from "react";
import FilterTabs from "@/components/common_components/FilterTabs";
import SuccessModal from "@/components/common_components/SuccessModal";

const CogsAnalysis = () => {
  const [activeTab, setActiveTab] = useState<TabType>("today");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  return (
    <div className="xl:px-0 px-2 pb-10 space-y-6">
      <FilterTabs activeTab={activeTab} onChange={setActiveTab} />
      <div className="flex justify-between items-center flex-wrap gap-2 pr-0">
        <TitleSubtitle
          title="COGS Analysis"
          subtitle="Comprehensive cost analysis and variance tracking"
        />
        <div className="flex flex-wrap gap-3 ml-auto xl:mt-0 mt-2">
          <Button
            variant="outline"
            className="text-gray-600 border-gray-200 bg-gray-50 h-9"
            onClick={()=>setActiveTab("month")}
          >
            <Funnel className="w-4 h-4 mr-2" />
            Filter Project
          </Button>
          <Button
            variant="outline"
            className="text-gray-600 border-gray-200 bg-gray-50 h-9 "
            onClick={() => {
              setModalTitle("Excel Exported Successfully");
              setIsSuccessModalOpen(true);
            }}
          >
            <FileX className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          <Button
            variant="outline"
            className="
            bg-blue-600
            text-white
            h-9 font-normal"
            onClick={() => {
              setModalTitle("PDF Exported Successfully");
              setIsSuccessModalOpen(true);
            }}
          >
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>
      <CogsStatsGrid />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <CogsAnalysisCard />
        <ProfitGrowthOverTimeChart activeTab={activeTab} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 xl:gap-4 gap-3 mb-6">
        <TopHighestCostProjectsCard />
        <ProjectsExceedingBudgetCard />
        <OverallCostEfficiencyCard />
      </div>

      <div className="mb-6">
        <ProjectCostAnalysisTable  activeTab={activeTab}/>
      </div>
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title={modalTitle}
      />
    </div>
  );
};

export default CogsAnalysis;
