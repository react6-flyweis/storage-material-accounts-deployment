import { useNavigate, useParams, useLocation } from "react-router-dom";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetProjectDetailQuery } from "@/redux/api/projectApi";
import { ProjectDetailsHeader } from "./components/ProjectDetailsHeader";
import { ProjectQuickActions } from "./components/ProjectQuickActions";
import { ProjectOverviewCard } from "./components/ProjectOverviewCard";
import { ProjectFinancialKpiGrid } from "./components/ProjectFinancialKpiGrid";
import { ProjectProgressStepper } from "./components/ProjectProgressStepper";
import { ProjectFinancialPerformanceTable } from "./components/ProjectFinancialPerformanceTable";

export default function ProjectDetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    customerId = "",
    projectId = "",
    id = "",
  } = useParams<{
    customerId?: string;
    projectId?: string;
    id?: string;
  }>();

  const passedState = location.state as {
    projectId?: string;
    projectName?: string;
    customerId?: string;
    customerName?: string;
  } | null;

  const actualCustomerId = customerId || passedState?.customerId || "";
  const actualProjectId = projectId || id || passedState?.projectId || "";

  // Pure API Call: GET /api/account/projects/:projectId
  const {
    data: projectDetail,
    isLoading: isProjectLoading,
    isError: isProjectError,
    refetch: refetchProject,
  } = useGetProjectDetailQuery(actualProjectId, {
    skip: !actualProjectId,
  });

  const basePath = actualCustomerId
    ? `/customers/${actualCustomerId}/projects/${actualProjectId}`
    : `/customers/projects/${actualProjectId}`;

  const handleBack = () => {
    if (actualCustomerId) {
      navigate(`/customers/${actualCustomerId}`);
    } else {
      navigate(-1);
    }
  };

  // If no projectId is provided in URL or route state
  if (!actualProjectId) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-4 max-w-lg mx-auto my-12 shadow-xs">
        <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-600">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Project Not Found
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            No project identifier was provided in the URL or navigation state.
          </p>
        </div>
        <Button
          onClick={handleBack}
          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs px-4 py-2 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 1. Header: Back button, Title, Loading & Error alerts */}
      <ProjectDetailsHeader
        projectName={
          projectDetail?.overview?.projectName || passedState?.projectName
        }
        projectId={actualProjectId}
        isLoading={isProjectLoading}
        isError={isProjectError}
        onBack={handleBack}
        onRetry={refetchProject}
      />

      {/* 2. 6 Quick Action Buttons */}
      <ProjectQuickActions
        basePath={basePath}
        projectId={actualProjectId}
        customerId={actualCustomerId}
        overview={projectDetail?.overview}
        contact={projectDetail?.contact}
        agreement={projectDetail?.agreement}
        actionLinks={projectDetail?.actionLinks}
      />

      {/* Section Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Project Overview
        </h2>
      </div>

      {/* 3. Project Overview Card */}
      <ProjectOverviewCard
        overview={projectDetail?.overview}
        contact={projectDetail?.contact}
        assignment={projectDetail?.assignment}
        agreement={projectDetail?.agreement}
      />

      {/* 4. Financial KPI Cards Grid (4 Dark Blue + 4 White) */}
      <ProjectFinancialKpiGrid
        financialSummary={projectDetail?.financialSummary}
      />

      {/* 5. Progress Step Card */}
      <ProjectProgressStepper
        progressStep={projectDetail?.progressStep}
        assignmentName={projectDetail?.assignment?.name}
      />

      {/* 6. Project Financial Performance Table */}
      <ProjectFinancialPerformanceTable
        profitabilityOverview={projectDetail?.profitabilityOverview}
      />
    </div>
  );
}
