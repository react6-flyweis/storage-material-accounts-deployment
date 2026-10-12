import React from "react";
import { DollarSign, ShoppingBag, FileText, CreditCard } from "lucide-react";

export interface InvoiceStatsData {
  totalInvoices: number | string;
  totalBilled: string;
  amountReceived: string;
  outstanding: string;
}

interface InvoiceStatsCardsProps {
  stats?: InvoiceStatsData;
}

export const InvoiceStatsCards: React.FC<InvoiceStatsCardsProps> = ({
  stats = {
    totalInvoices: 126,
    totalBilled: "$4.82 Cr",
    amountReceived: "$3.76 Cr",
    outstanding: "$1.06 Cr",
  },
}) => {
  const cards = [
    {
      title: "Total Project Invoices",
      value: stats.totalInvoices,
      icon: <DollarSign className="w-4 h-4 text-[#8B5CF6]" />,
      iconBorder: "border-[#DDD6FE]",
      iconBg: "bg-[#F5F3FF]",
      accentColor: "#8B5CF6", // Purple
    },
    {
      title: "Total Billed",
      value: stats.totalBilled,
      icon: <ShoppingBag className="w-4 h-4 text-[#10B981]" />,
      iconBorder: "border-[#A7F3D0]",
      iconBg: "bg-[#ECFDF5]",
      accentColor: "#10B981", // Green
    },
    {
      title: "Amount Received",
      value: stats.amountReceived,
      icon: <FileText className="w-4 h-4 text-[#F59E0B]" />,
      iconBorder: "border-[#FDE68A]",
      iconBg: "bg-[#FFFBEB]",
      accentColor: "#F59E0B", // Yellow/Amber
    },
    {
      title: "Outstanding",
      value: stats.outstanding,
      icon: <CreditCard className="w-4 h-4 text-[#EF4444]" />,
      iconBorder: "border-[#FECACA]",
      iconBg: "bg-[#FEF2F2]",
      accentColor: "#EF4444", // Red
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="relative bg-white rounded-2xl p-5 shadow-xs border border-slate-100 flex flex-col justify-between overflow-hidden hover:shadow-md transition-shadow group"
        >
          {/* Top content */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs sm:text-sm text-slate-500 font-normal">
                {card.title}
              </p>
              <h3 className="text-2xl sm:text-[28px] font-bold text-slate-900 mt-2 tracking-tight">
                {card.value}
              </h3>
            </div>
            <div
              className={`w-9 h-9 rounded-full border ${card.iconBorder} ${card.iconBg} flex items-center justify-center shrink-0 shadow-xs`}
            >
              {card.icon}
            </div>
          </div>

          {/* Corner Ribbon / Accent on bottom-left matching design */}
          <div
            className="absolute -bottom-1 -left-1 w-7 h-7 pointer-events-none"
            style={{
              clipPath: "polygon(0 0, 0 100%, 100% 100%)",
              backgroundColor: card.accentColor,
              borderBottomLeftRadius: "14px",
            }}
          />
        </div>
      ))}
    </div>
  );
};
