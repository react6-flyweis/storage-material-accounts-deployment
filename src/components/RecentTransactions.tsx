import { MoveDown, MoveUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import SectionHeaderWithAction from "./common_components/SectionHeaderWithAction";
import { useNavigate } from "react-router-dom";
import type { RecentTransaction } from "@/redux/api/dashboardApi";
import { formatCurrency, formatDate } from "@/lib/dashboardFormatters";
import { Skeleton } from "@/components/ui/skeleton";

interface TransactionItemProps {
  isCredit: boolean;
  title: string;
  source: string;
  date: string;
  amount: string;
  status: string;
}

function TransactionItem({
  isCredit,
  title,
  source,
  date,
  amount,
  status,
}: TransactionItemProps) {
  const isCompleted = status.toLowerCase() === "completed";

  return (
    <div className="p-4 rounded-2xl border border-gray-100 bg-white mb-4 last:mb-0 hover:border-gray-200 transition-all shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-xl shrink-0",
              isCredit
                ? "bg-emerald-50 text-emerald-500"
                : "bg-red-50 text-red-500"
            )}
          >
            {isCredit ? (
              <MoveDown className="w-5 h-5" />
            ) : (
              <MoveUp className="w-5 h-5" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm truncate">{title}</h4>
            {source && <p className="text-xs text-gray-500 font-normal truncate">{source}</p>}
            <p className="text-[10px] text-gray-400 mt-0.5">{date}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span
            className={cn(
              "font-bold text-sm",
              isCredit ? "text-emerald-500" : "text-red-500"
            )}
          >
            {amount}
          </span>
          <Badge
            variant="outline"
            className={cn(
              "font-normal text-[10px] px-2 py-0 border w-fit h-5",
              isCompleted
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

interface RecentTransactionsProps {
  transactions?: RecentTransaction[];
  isLoading?: boolean;
}

export function RecentTransactions({ transactions, isLoading }: RecentTransactionsProps) {
  const navigate = useNavigate();

  const items: TransactionItemProps[] = transactions
    ? transactions.map((t) => {
        const isCredit = t.direction === "credit";
        const formattedAmt = formatCurrency(t.amount);
        return {
          isCredit,
          title: t.label || (isCredit ? "Payment Received" : "Expense Payment"),
          source: t.entityName || (t.category ? `Category: ${t.category}` : ""),
          date: formatDate(t.date),
          amount: isCredit ? `+${formattedAmt}` : formattedAmt,
          status: t.status || "Completed",
        };
      })
    : [];

  return (
    <div className="xl:p-6 p-4 border-none h-full bg-white rounded-md flex flex-col justify-between">
      <div>
        <SectionHeaderWithAction
          title="Recent Transactions"
          actionLabel="View All"
          showIcon={true}
          subtitle="Latest financial activities"
          onActionClick={() => navigate("/payment_overview")}
        />
        <div className="space-y-4 border-t border-gray-300 pt-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-gray-100 bg-white mb-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            ))
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">
              No recent transactions found
            </div>
          ) : (
            items.map((item, idx) => <TransactionItem key={idx} {...item} />)
          )}
        </div>
      </div>
    </div>
  );
}
