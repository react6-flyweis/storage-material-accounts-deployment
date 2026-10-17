import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useGetProjectQuotationsQuery,
  useGetProjectDetailQuery,
  type ProjectQuotationItem,
} from "@/redux/api/projectApi";
import { QuotationListTable } from "./components/QuotationListTable";
import { QuotationDetailViewer } from "./components/QuotationDetailViewer";

export default function ProjectQuotationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    id = "",
    customerId = "",
    projectId = "",
    quotationId = "",
  } = useParams<{
    id?: string;
    customerId?: string;
    projectId?: string;
    quotationId?: string;
  }>();

  const locationState = location.state as {
    projectName?: string;
    projectId?: string;
    leadId?: string;
    customerId?: string;
    customerName?: string;
    amount?: number;
  } | null;

  // Resolve current project and customer identifier
  const currentProjectId =
    projectId || id || locationState?.projectId || locationState?.leadId || "";
  const currentCustomerId = customerId || locationState?.customerId || "";

  // Selected quotation state (supports direct route param or inline selection)
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(
    quotationId || null
  );

  // Sync state if URL param updates
  useEffect(() => {
    if (quotationId) {
      setSelectedQuotationId(quotationId);
    } else {
      setSelectedQuotationId(null);
    }
  }, [quotationId]);

  // Search and status filter state for quotations list
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Base navigation paths
  const baseListingPath = currentCustomerId
    ? `/customers/${currentCustomerId}/projects/${currentProjectId}/project-quotation`
    : `/customers/projects/${currentProjectId}/project-quotation`;

  const projectDetailsPath = currentCustomerId
    ? `/customers/${currentCustomerId}/projects/${currentProjectId}`
    : `/customers/projects/${currentProjectId}`;

  // Project details query for reliable project title
  const { data: projectDetail } = useGetProjectDetailQuery(currentProjectId, {
    skip: !currentProjectId,
  });

  const displayProjectName =
    projectDetail?.overview?.projectName ||
    locationState?.projectName ||
    "Project";

  // 1.8 Quotations list: GET /api/account/projects/:projectId/quotations?status=
  const {
    data: quotationsResponse,
    isLoading: isQuotationsLoading,
    isFetching: isQuotationsFetching,
    isError: isQuotationsError,
    refetch: refetchQuotations,
  } = useGetProjectQuotationsQuery(
    {
      projectId: currentProjectId,
      status: statusFilter !== "all" ? statusFilter : undefined,
    },
    { skip: !currentProjectId }
  );

  const quotations: ProjectQuotationItem[] = useMemo(() => {
    return quotationsResponse?.quotations ?? [];
  }, [quotationsResponse]);

  const totalQuotations = quotationsResponse?.total ?? quotations.length;

  // Selection handlers
  const handleSelectQuotation = (quotation: ProjectQuotationItem) => {
    const qId = quotation.quotationId || quotation._id || "";
    if (!qId) return;
    setSelectedQuotationId(qId);
    navigate(`${baseListingPath}/${encodeURIComponent(qId)}`, {
      state: locationState,
    });
  };

  const handleBackToList = () => {
    setSelectedQuotationId(null);
    navigate(baseListingPath, { state: locationState });
  };

  const handleBackToProject = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(projectDetailsPath);
    }
  };

  // If no projectId can be resolved
  if (!currentProjectId) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4 my-12 bg-white rounded-2xl shadow-xs border border-slate-200">
        <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-600">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Project Not Found</h2>
        <p className="text-xs text-slate-500">
          No project identifier was provided in the route parameters or navigation state.
        </p>
        <Button
          onClick={() => navigate(-1)}
          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs px-4 py-2 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Go Back
        </Button>
      </div>
    );
  }

  // 1. If a quotation is selected: render Quotation Detail View (Read-Only Viewer)
  if (selectedQuotationId) {
    return (
      <div className="space-y-6">
        <QuotationDetailViewer
          projectId={currentProjectId}
          quotationId={selectedQuotationId}
          onBack={handleBackToList}
          passedProjectName={displayProjectName}
        />
      </div>
    );
  }

  // 2. Otherwise: render Quotation Listing Page
  return (
    <div className="space-y-5">
      {/* Header: Back button, Title, Refresh indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="default"
            onClick={handleBackToProject}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-white" />
            Back
          </Button>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-sans">
              {displayProjectName} - Quotations
            </h1>
            <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-semibold border border-blue-100">
              {totalQuotations} Total
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isQuotationsFetching && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
              <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
              <span>Updating...</span>
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => refetchQuotations()}
            className="text-xs h-9 px-3 text-slate-700 hover:text-slate-900 border-slate-200 gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Quotation List Table Component */}
      <QuotationListTable
        quotations={quotations}
        isLoading={isQuotationsLoading}
        isError={isQuotationsError}
        onRetry={refetchQuotations}
        onSelectQuotation={handleSelectQuotation}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        projectName={displayProjectName}
        total={totalQuotations}
      />
    </div>
  );
}
