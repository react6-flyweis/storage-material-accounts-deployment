import { ArrowLeft, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectDetailsHeaderProps {
  projectName?: string;
  projectId?: string;
  isLoading?: boolean;
  isError?: boolean;
  onBack: () => void;
  onRetry: () => void;
}

export function ProjectDetailsHeader({
  projectName,
  projectId,
  isLoading,
  isError,
  onBack,
  onRetry,
}: ProjectDetailsHeaderProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="default"
            onClick={onBack}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-white" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Project Details- {projectName || projectId || "Project"} Overview
          </h1>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-blue-600 font-medium bg-blue-50 px-3 py-1.5 rounded-full w-fit">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Loading project data...
          </div>
        )}
      </div>

      {isError && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-amber-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Could not fetch live details for project ID{" "}
              <strong>{projectId || "unknown"}</strong>.
            </span>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-1 font-semibold text-amber-900 hover:text-amber-700 underline ml-2 shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
