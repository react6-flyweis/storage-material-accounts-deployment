import { useState } from "react";
import { format, isValid } from "date-fns";
import { Card } from "@/components/ui/card";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { useStateWiseTaxUpcomingDeadlinesQuery } from "@/modules/payments/payments.hooks";
import type { StateWiseTaxDeadlineItem } from "@/modules/payments/payments.api";

function formatCurrency(val?: number) {
  if (val === undefined || val === null || isNaN(val)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(val);
}

function formatDateDisplay(dateStr?: string) {
  if (!dateStr) return "-";
  const dateObj = new Date(dateStr);
  if (!isValid(dateObj)) return dateStr;
  return format(dateObj, "dd MMM yyyy").toUpperCase();
}

interface UpcomingFilingDeadlinesProps {
  projectId?: string;
  limit?: number;
  initialScope?: "state" | "project";
  onSelectDeadline?: (
    taxRecordId: string,
    stateName: string,
    status?: string
  ) => void;
}

export default function UpcomingFilingDeadlines({
  projectId,
  limit = 6,
  initialScope = "state",
  onSelectDeadline,
}: UpcomingFilingDeadlinesProps) {
  const [scope, setScope] = useState<"state" | "project">(initialScope);

  const { data, isLoading, isError } = useStateWiseTaxUpcomingDeadlinesQuery({
    projectId: projectId !== "all" ? projectId : undefined,
    limit,
    scope,
  });

  const deadlines: StateWiseTaxDeadlineItem[] = data?.data?.deadlines || [];
  const meta = data?.data?.meta;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-gray-900 text-lg">
            Upcoming Filing Deadlines
          </h3>
          {meta?.complianceStatus && (
            <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium text-xs">
              {meta.complianceStatus}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isLoading && (
            <span className="text-xs text-gray-400 flex items-center gap-1 mr-2">
              <Loader2 className="w-3 h-3 animate-spin" /> Loading deadlines...
            </span>
          )}
          <div className="inline-flex rounded-md border border-slate-200 p-0.5 bg-slate-50 text-xs">
            <button
              type="button"
              onClick={() => setScope("state")}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                scope === "state"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              By State
            </button>
            <button
              type="button"
              onClick={() => setScope("project")}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                scope === "project"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              By Project
            </button>
          </div>
        </div>
      </div>

      {isLoading && deadlines.length === 0 ? (
        <div className="p-8 flex items-center justify-center text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading upcoming filing deadlines...
        </div>
      ) : isError && deadlines.length === 0 ? (
        <div className="p-6 text-center text-rose-500 text-sm">
          Failed to load upcoming filing deadlines.
        </div>
      ) : deadlines.length === 0 ? (
        <div className="p-8 text-center text-gray-500 text-sm">
          No upcoming filing deadlines found.
        </div>
      ) : (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {deadlines.map((item, index) => {
            const taxRecordId = item.taxRecordId || item._id;
            const title =
              scope === "project"
                ? item.projectName || item.jobId || item.state || "Project"
                : item.state || "State";
            const subtitle =
              scope === "project"
                ? `${item.jobId ? `${item.jobId} • ` : ""}${
                    item.location || item.state || ""
                  }`
                : item.filingType || "Monthly Return";
            const statusLabel =
              typeof item.status === "object"
                ? item.status.label
                : item.status;

            return (
              <Card
                key={taxRecordId || index}
                className={`p-5 border border-slate-200 shadow-sm transition-colors ${
                  taxRecordId && onSelectDeadline
                    ? "hover:border-blue-400 hover:shadow-md cursor-pointer"
                    : ""
                }`}
                onClick={() => {
                  if (taxRecordId && onSelectDeadline) {
                    onSelectDeadline(
                      taxRecordId,
                      item.state || title,
                      statusLabel
                    );
                  }
                }}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900">
                        {title}
                      </h4>
                      <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
                    </div>
                    {item.payable !== undefined && item.payable > 0 && (
                      <span className="text-sm font-bold text-red-600">
                        {formatCurrency(item.payable)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 text-emerald-600 font-medium text-xs">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      {item.daysLeft !== undefined
                        ? `${item.daysLeft} days left`
                        : "Due soon"}
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      {formatDateDisplay(item.dueDate)}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
