import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import SectionHeaderWithAction from "./common_components/SectionHeaderWithAction";
import { useNavigate } from "react-router-dom";
import type { UpcomingPayment } from "@/redux/api/dashboardApi";
import { formatCurrency, formatDate } from "@/lib/dashboardFormatters";
import { Skeleton } from "@/components/ui/skeleton";

interface PaymentItemProps {
  company: string;
  category: string;
  amount: string;
  date: string;
  salesRep: string;
  invoice: string;
  priority: "High" | "Medium" | "Low";
}

function PaymentItem({
  company,
  category,
  amount,
  date,
  salesRep,
  invoice,
  priority,
}: PaymentItemProps) {
  const navigate = useNavigate();

  const getPriorityStyle = (p: "High" | "Medium" | "Low") => {
    switch (p) {
      case "High":
        return "bg-[#FEE2E2] text-[#EF4444]";
      case "Medium":
        return "bg-amber-100 text-amber-700";
      case "Low":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  return (
    <div className="p-4 md:p-6 rounded-md border border-gray-200 bg-white mb-4 last:mb-0 w-full overflow-x-auto">
      <div className="flex flex-row md:items-center justify-between gap-6">
        {/* Company Info */}
        <div className="md:flex-1 min-w-[150px]">
          <h4 className="font-semibold text-gray-900 text-sm md:text-base mb-1">
            {company}
          </h4>
          <p className="text-xs text-gray-400 font-normal">{category}</p>
        </div>

        {/* Details Grid for Mobile / Flex for Desktop */}
        <div className="flex flex-4 gap-y-4 md:gap-4 items-start md:items-center">
          {/* Amount */}
          <div className="flex-1 min-w-[100px]">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
              Amount
            </p>
            <p className="font-bold text-(--text-color-green) text-sm md:text-base">
              {amount}
            </p>
          </div>

          {/* Date */}
          <div className="flex-1 min-w-[100px]">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
              Date
            </p>
            <p className="text-gray-900 font-medium text-xs md:text-sm">
              {date}
            </p>
          </div>

          {/* Sales Rep */}
          <div className="flex-1 min-w-[100px]">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
              Sales Rep
            </p>
            <p className="text-gray-900 font-medium text-xs md:text-sm">
              {salesRep}
            </p>
          </div>

          {/* Invoice */}
          <div className="flex-1 min-w-[100px]">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
              Invoice
            </p>
            <button
              onClick={() => navigate("/payment_overview")}
              className="text-(--button-bg-primary-color) font-regular text-xs md:text-sm hover:underline text-left block truncate w-full cursor-pointer"
            >
              {invoice}
            </button>
          </div>
        </div>

        {/* Priority Badge */}
        <div className="flex items-center md:justify-end min-w-[80px] pt-2 md:pt-0 border-t md:border-t-0 border-gray-50">
          <Badge
            className={cn(
              "font-normal text-[10px] px-4 py-1 rounded-full border-none h-6",
              getPriorityStyle(priority)
            )}
          >
            {priority}
          </Badge>
        </div>
      </div>
    </div>
  );
}

interface UpcomingPaymentsProps {
  upcomingPayments?: UpcomingPayment[];
  isLoading?: boolean;
}

export default function UpcomingPayments({
  upcomingPayments,
  isLoading,
}: UpcomingPaymentsProps) {
  const navigate = useNavigate();

  const items: PaymentItemProps[] = upcomingPayments
    ? upcomingPayments.map((p) => {
        let priority: "High" | "Medium" | "Low" = "Medium";
        const rawPriority = (p.priority || "").toLowerCase();
        if (rawPriority === "high") priority = "High";
        else if (rawPriority === "low") priority = "Low";

        return {
          company: p.companyName || p.customerId?.company || "Unknown Company",
          category: p.paymentDescription || p.description || "Payment Due",
          amount: formatCurrency(p.amount || p.totalAmount),
          date: formatDate(p.dueDate),
          salesRep: p.salesRep || p.leadId?.assignedSales?.name || "-",
          invoice: p.invoiceNumber || "N/A",
          priority,
        };
      })
    : [];

  return (
    <div className="bg-white rounded-md xl:p-6 p-4 border border-gray-100/50">
      <SectionHeaderWithAction
        title="Upcoming Payments"
        subtitle="From Sales Team"
        actionLabel="View All"
        showIcon={true}
        onActionClick={() => navigate("/payment_overview")}
        containerClassName="mb-6"
      />
      <div className="space-y-4 overflow-y-auto border-t border-gray-300 pt-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="p-4 md:p-6 rounded-md border border-gray-100 bg-white mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="md:flex-1 min-w-[150px]">
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-3 w-28" />
              </div>
              <div className="flex flex-4 gap-4 items-center">
                <div className="flex-1">
                  <Skeleton className="h-3 w-14 mb-1" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <div className="flex-1">
                  <Skeleton className="h-3 w-14 mb-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex-1">
                  <Skeleton className="h-3 w-14 mb-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex-1">
                  <Skeleton className="h-3 w-14 mb-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">
            No upcoming payments scheduled
          </div>
        ) : (
          items.map((payment, index) => (
            <PaymentItem key={index} {...payment} />
          ))
        )}
      </div>
    </div>
  );
}
