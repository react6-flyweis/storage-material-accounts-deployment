import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import SectionHeaderWithAction from "./common_components/SectionHeaderWithAction";
import { useNavigate } from "react-router-dom";

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
            <button className="text-(--button-bg-primary-color) font-regular text-xs md:text-sm hover:underline text-left block truncate w-full">
              {invoice}
            </button>
          </div>
        </div>

        {/* Priority Badge */}
        <div className="flex items-center md:justify-end min-w-[80px] pt-2 md:pt-0 border-t md:border-t-0 border-gray-50">
          <Badge
            className={cn(
              "font-normal text-[10px] px-4 py-1 rounded-full border-none h-6",
              priority === "High"
                ? "bg-[#FEE2E2] text-[#EF4444]"
                : "bg-gray-100 text-gray-500"
            )}
          >
            {priority}
          </Badge>
        </div>
      </div>
    </div>
  );
}

export default function UpcomingPayments() {
  const payments: PaymentItemProps[] = [
    {
      company: "ABC Industries",
      category: "Progress Payment",
      amount: "$1,35,000",
      date: "25-0102924", // Matching the typo from the image for consistency or fixing it? I'll fix it to 25-01-2024
      salesRep: "John Doe",
      invoice: "INV 2024-001",
      priority: "High",
    },
    {
      company: "ABC Industries",
      category: "Progress Payment",
      amount: "$1,35,000",
      date: "25-01-2024",
      salesRep: "John Doe",
      invoice: "INV 2024-001",
      priority: "High",
    },
    {
      company: "ABC Industries",
      category: "Progress Payment",
      amount: "$1,35,000",
      date: "25-01-2024",
      salesRep: "John Doe",
      invoice: "INV 2024-001",
      priority: "High",
    },
    {
      company: "ABC Industries",
      category: "Progress Payment",
      amount: "$1,35,000",
      date: "25-01-2024",
      salesRep: "John Doe",
      invoice: "INV 2024-001",
      priority: "High",
    },
  ];

  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-md xl:p-6 p-4  border border-gray-100/50">
      <SectionHeaderWithAction
        title="Upcoming Payments"
        subtitle="From Sales Team"
        actionLabel="View All"
        showIcon={true}
        onActionClick={() => navigate("/payment_overview")}
        containerClassName="mb-6"
      />
      <div className="space-y-4 overflow-y-auto border-t border-gray-300 pt-4">
        {payments.map((payment, index) => (
          <PaymentItem key={index} {...payment} />
        ))}
      </div>
    </div>
  );
}
