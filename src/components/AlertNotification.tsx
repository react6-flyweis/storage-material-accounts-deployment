import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import SectionHeaderWithAction from "./common_components/SectionHeaderWithAction";
import { useNavigate } from "react-router-dom";
import type { DashboardAlert } from "@/redux/api/dashboardApi";
import { formatDate } from "@/lib/dashboardFormatters";
import { Skeleton } from "@/components/ui/skeleton";

interface AlertItemProps {
  title: string;
  priority: "High" | "Medium" | "Low";
  dueDate?: string | null;
}

function AlertItem({ title, priority, dueDate }: AlertItemProps) {
  const priorityStyles = {
    High: {
      bg: "bg-[#FEF2F2]",
      badge: "bg-[#FEE2E2] text-[#EF4444] border-none",
    },
    Medium: {
      bg: "bg-[#FFFBEB]",
      badge: "bg-[#FEF3C7] text-[#D97706] border-none",
    },
    Low: {
      bg: "bg-[#EFF6FF]",
      badge: "bg-[#DBEAFE] text-[#2563EB] border-none",
    },
  };

  const style = priorityStyles[priority] || priorityStyles.Medium;
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        "p-4 rounded-xl mb-4 last:mb-0 cursor-pointer transition-all hover:opacity-90",
        style.bg,
      )}
      onClick={() => navigate("/payment_overview")}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold text-gray-900 text-sm mb-2 flex-1">
          {title}
        </h4>
        {dueDate && (
          <span className="text-[10px] text-gray-500 whitespace-nowrap">
            Due: {formatDate(dueDate)}
          </span>
        )}
      </div>
      <Badge
        className={cn(
          "font-normal text-[10px] px-3 py-0.5 rounded-full h-6",
          style.badge,
        )}
      >
        {priority} Priority
      </Badge>
    </div>
  );
}

interface AlertNotificationProps {
  alerts?: DashboardAlert[];
  isLoading?: boolean;
}

export function AlertNotification({
  alerts,
  isLoading,
}: AlertNotificationProps) {
  const navigate = useNavigate();

  const items: AlertItemProps[] = alerts
    ? alerts.map((a) => {
        let p: "High" | "Medium" | "Low" = "Medium";
        const rawPriority = (a.priority || "").toLowerCase();
        if (rawPriority === "high") p = "High";
        else if (rawPriority === "low") p = "Low";

        return {
          title: a.message,
          priority: p,
          dueDate: a.dueDate,
        };
      })
    : [];

  return (
    <div className="xl:p-6 p-4 border-none h-full bg-white rounded-md flex flex-col justify-between">
      <div>
        <SectionHeaderWithAction
          title="Alert & Notification"
          actionLabel="View All"
          showIcon={true}
          subtitle="Important Financial reminders"
          onActionClick={() => navigate("/notification")}
        />
        <div className="space-y-4 pt-3 border-t border-gray-300">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl mb-4 bg-gray-50 border border-gray-100 flex flex-col gap-2"
              >
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
            ))
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">
              No active alerts
            </div>
          ) : (
            items
              .slice(0, 3)
              .map((item, idx) => <AlertItem key={idx} {...item} />)
          )}
        </div>
      </div>
    </div>
  );
}
