import React from "react";
import { CircleDollarSign, ShoppingBag, Lock, Hourglass, Percent } from "lucide-react";

interface MetricCardItem {
  id: string;
  title: string;
  amount: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBoxStyle: string;
  stripeColor: string;
}

export const ProfitLossMetrics: React.FC = () => {
  const metrics: MetricCardItem[] = [
    {
      id: "revenue",
      title: "Total Revenue",
      amount: "$12,500,000",
      subtitle: "vs Apr 2025",
      icon: <CircleDollarSign className="w-5 h-5 text-[#8B5CF6]" />,
      iconBoxStyle: "border-[#DDD6FE] bg-[#F5F3FF]",
      stripeColor: "rgba(139, 92, 246, 0.12)",
    },
    {
      id: "expenses",
      title: "Total Expenses",
      amount: "$8,950,000",
      subtitle: "vs Apr 2025",
      icon: <ShoppingBag className="w-5 h-5 text-[#10B981]" />,
      iconBoxStyle: "border-[#A7F3D0] bg-[#ECFDF5]",
      stripeColor: "rgba(16, 185, 129, 0.12)",
    },
    {
      id: "gross-profit",
      title: "Gross Profit",
      amount: "$3,550,000",
      subtitle: "vs Apr 2025",
      icon: <Lock className="w-5 h-5 text-[#F59E0B]" />,
      iconBoxStyle: "border-[#FDE68A] bg-[#FFFBEB]",
      stripeColor: "rgba(245, 158, 11, 0.12)",
    },
    {
      id: "net-profit",
      title: "Net Profit",
      amount: "$2,750,000",
      subtitle: "vs Apr 2025",
      icon: <Hourglass className="w-5 h-5 text-[#EF4444]" />,
      iconBoxStyle: "border-[#FECACA] bg-[#FEF2F2]",
      stripeColor: "rgba(239, 68, 68, 0.12)",
    },
    {
      id: "net-margin",
      title: "Net Profit Margin",
      amount: "22.0%",
      subtitle: "vs Apr 2025",
      icon: <Percent className="w-5 h-5 text-[#8B5CF6]" />,
      iconBoxStyle: "border-[#DDD6FE] bg-[#F5F3FF]",
      stripeColor: "rgba(139, 92, 246, 0.12)",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {metrics.map((card) => (
        <div
          key={card.id}
          className="relative overflow-hidden bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-100 flex flex-col justify-between transition-all hover:shadow-sm"
        >
          {/* Top row: Title and Icon Badge */}
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs sm:text-sm font-medium text-slate-700">
              {card.title}
            </span>
            <div
              className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${card.iconBoxStyle}`}
            >
              {card.icon}
            </div>
          </div>

          {/* Amount and Subtitle */}
          <div className="mt-3 relative z-10">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight block">
              {card.amount}
            </span>
            <span className="text-xs text-slate-400 font-normal mt-1 block">
              {card.subtitle}
            </span>
          </div>

          {/* Subtle Decorative Hatched Stripe Corner */}
          <div
            className="absolute -bottom-6 -right-6 w-20 h-20 pointer-events-none opacity-80"
            style={{
              background: `repeating-linear-gradient(45deg, transparent, transparent 4px, ${card.stripeColor} 4px, ${card.stripeColor} 6px)`,
              borderRadius: "50%",
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default ProfitLossMetrics;
