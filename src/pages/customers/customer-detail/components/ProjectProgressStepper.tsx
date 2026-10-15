import { useMemo } from "react";
import { Calendar } from "lucide-react";
import type { ProjectProgressStep } from "@/redux/api/projectApi";
import { formatIsoDate, formatStepperDate } from "./project-details-utils";

interface ProjectProgressStepperProps {
  progressStep?: ProjectProgressStep;
  assignmentName?: string;
}

export function ProjectProgressStepper({
  progressStep,
  assignmentName,
}: ProjectProgressStepperProps) {
  const steps = useMemo(() => {
    return (progressStep?.steps || []).map((s) => ({
      number: s.stepNumber,
      title: s.label,
      date: formatStepperDate(s.date),
      status: s.status,
    }));
  }, [progressStep?.steps]);

  const progressPercent = useMemo(() => {
    if (steps.length <= 1) return 0;
    const currentIdx = steps.findIndex((s) => s.status === "current");
    const completedCount = steps.filter((s) => s.status === "completed").length;
    const activeIdx =
      currentIdx >= 0 ? currentIdx : Math.max(0, completedCount - 1);
    return (activeIdx / (steps.length - 1)) * 100;
  }, [steps]);

  const priorityLower = (progressStep?.priority || "").toLowerCase();
  const priorityBadgeClass =
    priorityLower === "high" || priorityLower === "urgent"
      ? "bg-[#FEE2E2] text-[#DC2626]"
      : priorityLower === "low"
        ? "bg-[#DCFCE7] text-[#16A34A]"
        : priorityLower
          ? "bg-[#FEF3C7] text-[#D97706]"
          : "bg-slate-100 text-slate-700";

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-6">
      <h3 className="text-base font-bold text-slate-900">Progress Step</h3>

      {steps.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500">
          No progress steps recorded for this project.
        </div>
      ) : (
        /* Horizontal Stepper */
        <div className="relative pt-4 pb-2 overflow-x-auto">
          <div className="min-w-[760px] relative">
            {/* Connecting progress bar lines */}
            <div className="absolute top-4 left-6 right-6 h-1 bg-slate-200 -translate-y-1/2 z-0">
              <div
                className="h-full bg-[#2563EB] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Stepper items */}
            <div
              className="grid relative z-10"
              style={{
                gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`,
              }}
            >
              {steps.map((step) => {
                const isCompleted = step.status === "completed";
                const isCurrent = step.status === "current";

                return (
                  <div
                    key={step.number}
                    className="flex flex-col items-center text-center px-1"
                  >
                    {/* Circle badge */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-xs transition-colors ${
                        isCompleted
                          ? "bg-[#22C55E] text-white"
                          : isCurrent
                            ? "bg-[#2563EB] text-white ring-4 ring-blue-100"
                            : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {step.number}
                    </div>

                    {/* Step Title */}
                    <p
                      className={`text-[11px] font-semibold mt-2 leading-tight ${
                        isCurrent
                          ? "text-[#2563EB] font-bold"
                          : isCompleted
                            ? "text-slate-800"
                            : "text-slate-500"
                      }`}
                    >
                      {step.title}
                    </p>

                    {/* Step Subtitle / Date */}
                    {step.date && (
                      <p
                        className={`text-[10px] mt-0.5 ${
                          isCurrent
                            ? "text-[#2563EB] font-medium"
                            : "text-slate-400"
                        }`}
                      >
                        {step.date}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Details Box inside Stepper Card */}
      <div className="bg-[#F8FAFC] rounded-xl p-5 border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Col 1: Progress */}
        <div>
          <p className="text-xs font-bold text-slate-900">
            Progress (
            {progressStep?.progressLabel ||
              `${progressStep?.completedSteps ?? 0} of ${progressStep?.totalSteps ?? steps.length}`}
            )
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Current step: {progressStep?.currentStepLabel || "—"}
          </p>
        </div>

        {/* Col 2: Dates */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <div>
              <p className="font-bold text-slate-800 text-[11px]">
                Lead Generated
              </p>
              <p className="text-slate-500 text-[11px]">
                {formatIsoDate(progressStep?.leadGeneratedDate)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <div>
              <p className="font-bold text-slate-800 text-[11px]">
                {progressStep?.currentStepLabel || "Current Step"}
              </p>
              <p className="text-slate-500 text-[11px]">
                {formatIsoDate(progressStep?.currentStepDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Col 3: Assigned Sales & Priority */}
        <div className="space-y-2">
          <div>
            <p className="text-xs font-bold text-slate-800">Assigned Sales</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {progressStep?.assignedSales?.name ||
                assignmentName ||
                "Unassigned"}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">Priority</p>
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize mt-0.5 ${priorityBadgeClass}`}
            >
              {progressStep?.priority || "—"}
            </span>
          </div>
        </div>

        {/* Col 4: Next Step */}
        <div>
          <p className="text-xs font-bold text-slate-900">
            {progressStep?.nextStepLabel || "Next Step"}
          </p>
          <p className="text-xs text-slate-500 leading-relaxed mt-1">
            {progressStep?.nextStepNote || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
