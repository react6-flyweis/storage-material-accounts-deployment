import { MoveDown, MoveUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import SectionHeaderWithAction from "./common_components/SectionHeaderWithAction";
import { useNavigate } from "react-router-dom";

interface TransactionItemProps {
  type: "income" | "expense";
  title: string;
  source: string;
  date: string;
  amount: string;
  status: "Completed" | "Pending";
}

function TransactionItem({
  type,
  title,
  source,
  date,
  amount,
  status,
}: TransactionItemProps) {
  const isIncome = type === "income";

  return (
    <div className="p-4 rounded-2xl border border-gray-100 bg-white mb-4 last:mb-0 hover:border-gray-200 transition-all shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-xl",
              isIncome
                ? "bg-emerald-50 text-emerald-500"
                : "bg-red-50 text-red-500"
            )}
          >
            {isIncome ? (
              <MoveDown className="w-5 h-5" />
            ) : (
              <MoveUp className="w-5 h-5" />
            )}
          </div>
          <div className="flex flex-col">
            <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
            <p className="text-xs text-gray-500 font-regular">{source}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{date}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span
            className={cn(
              "font-bold text-sm",
              isIncome ? "text-emerald-500" : "text-red-500"
            )}
          >
            {isIncome ? `+${amount}` : amount}
          </span>
          <Badge
            variant="outline"
            className={cn(
              "font-normal text-[10px] px-2 py-0 border w-fit h-5",
              status === "Completed"
                ? "bg-emerald-50 text-emerald-500 border-emerald-100"
                : "bg-orange-50 text-orange-500 border-orange-100"
            )}
          >
            {status}
          </Badge>
        </div>
      </div>
    </div>
  );
}

export function RecentTransactions() {
  const navigate = useNavigate();
  return (
    <div className="xl:p-6 p-4 border-none h-full bg-white rounded-md">
      <SectionHeaderWithAction
        title="Recent Transactions"
        actionLabel="View All"
        showIcon={true}
        subtitle="Latest financial activities"
        onActionClick={() => navigate("/payment_overview")}
      />
      <div className="space-y-4 border-t border-gray-300 pt-3">
        <TransactionItem
          type="income"
          title="Payment Received"
          source="ABC Corp"
          date="15-01-2024"
          amount="$25,000"
          status="Completed"
        />
        <TransactionItem
          type="expense"
          title="Material Purchase"
          source="Steel Supplier Ltd"
          date="14-01-2024"
          amount="$12,500"
          status="Pending"
        />
        <TransactionItem
          type="expense"
          title="Labour Payment"
          source="Construction Team A"
          date="14-01-2024"
          amount="8,750"
          status="Completed"
        />
      </div>
    </div>
  );
}
