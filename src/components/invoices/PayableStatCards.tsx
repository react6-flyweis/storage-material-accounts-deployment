import {
  CircleDollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

interface StatItemProps {
  title: string;
  value: string;
  countSubtitle?: string;
  trendText?: string;
  accentBg: string;
  iconColor: string;
  icon: LucideIcon;
}

function StatItem({
  title,
  value,
  countSubtitle,
  trendText,
  accentBg,
  iconColor,
  icon: Icon,
}: StatItemProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 relative overflow-hidden flex flex-col justify-between hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs sm:text-sm font-medium text-slate-500">
            {title}
          </span>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            {value}
          </div>
          {countSubtitle && (
            <div className="text-xs text-slate-400 font-medium mt-0.5">
              {countSubtitle}
            </div>
          )}
        </div>
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${accentBg} ${iconColor} shrink-0`}
        >
          <Icon className="w-5 h-5 stroke-[1.8]" />
        </div>
      </div>

      {trendText && (
        <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-1.5 text-xs text-slate-500">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-semibold text-emerald-600">{trendText}</span>
          <span>from last month</span>
        </div>
      )}
    </div>
  );
}

export interface PayableStatsData {
  totalInvoiced: number;
  totalInvoicesCount: number;
  paidAmount: number;
  paidCount: number;
  pendingApprovalAmount: number;
  pendingApprovalCount: number;
  outstandingAmount: number;
  outstandingCount: number;
}

export function PayableStatCards({
  stats,
}: {
  stats: PayableStatsData;
}) {
  const format = (n: number) =>
    `$${Number(n || 0).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
      <StatItem
        title="Total Invoices"
        value={format(stats.totalInvoiced)}
        countSubtitle={`${stats.totalInvoicesCount} invoices recorded`}
        trendText="+8.4%"
        accentBg="bg-blue-50/80 border border-blue-200"
        iconColor="text-[#1D51A4]"
        icon={CircleDollarSign}
      />
      <StatItem
        title="Paid Invoices"
        value={format(stats.paidAmount)}
        countSubtitle={`${stats.paidCount} settlements completed`}
        trendText="+12.1%"
        accentBg="bg-emerald-50/80 border border-emerald-200"
        iconColor="text-emerald-600"
        icon={CheckCircle2}
      />
      <StatItem
        title="Pending Approval"
        value={format(stats.pendingApprovalAmount)}
        countSubtitle={`${stats.pendingApprovalCount} waiting for sign-off`}
        accentBg="bg-amber-50/80 border border-amber-200"
        iconColor="text-amber-600"
        icon={Clock}
      />
      <StatItem
        title="Outstanding Balance"
        value={format(stats.outstandingAmount)}
        countSubtitle={`${stats.outstandingCount} payables due`}
        accentBg="bg-rose-50/80 border border-rose-200"
        iconColor="text-rose-600"
        icon={AlertCircle}
      />
    </div>
  );
}

export default PayableStatCards;
