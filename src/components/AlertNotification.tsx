import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import SectionHeaderWithAction from "./common_components/SectionHeaderWithAction";
import { useNavigate } from "react-router-dom";

interface AlertItemProps {
  title: string;
  priority: "High" | "Medium" | "Low";
}

function AlertItem({ title, priority }: AlertItemProps) {
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

  const style = priorityStyles[priority];
  const navigate = useNavigate()
  return (
    <div className={cn("p-4 rounded-xl mb-4 last:mb-0 cursor-pointer", style.bg)} onClick={()=>navigate("/payment_overview")} >
      <h4 className="font-semibold text-gray-900 text-sm mb-3">{title}</h4>
      <Badge
        className={cn(
          "font-normal text-[10px] px-3 py-0.5 rounded-full h-6",
          style.badge
        )}
      >
        {priority} Priority
      </Badge>
    </div>
  );
}

export function AlertNotification() {
  const navigate = useNavigate();
  return (
    <div className="xl:p-6 p-4 border-none h-full bg-white rounded-md">
      <SectionHeaderWithAction
        title="Alert & Notification"
        actionLabel="View All"
        showIcon={true}
        subtitle="Important Financial reminders"
        onActionClick={() => navigate("/notification")}
      />
      <div className="space-y-4 pt-3 border-t border-gray-300">
        <AlertItem
          title="Payment due from ABC Corp - $15,000"
          priority="High"
        />
        <AlertItem title="Tax Filing Deadline in 5 days" priority="Medium" />
        <AlertItem
          title="Transport expenses over limit this month"
          priority="Low"
        />
      </div>
    </div>
  );
}
