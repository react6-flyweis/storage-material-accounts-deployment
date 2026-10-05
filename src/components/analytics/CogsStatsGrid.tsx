import React from "react";
import {
  CircleDollarSign,
  Calculator,
  MoveUp,
  MoveDown,
  ChartSpline,
} from "lucide-react";
import ScrollIcon from "@/assets/icon/scrollIcon.svg";
import { cn } from "@/lib/utils";

// Types
interface StatCardProps {
  label: string;
  value: string;
  trend: number;
  trendLabel?: string;
  icon: React.ReactNode;
  colorTheme: "blue" | "green" | "orange" | "red";
}

interface CogsStatsGridProps {
  className?: string;
}

// Sub-component for individual card
const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  trend,
  icon,
  colorTheme,
}) => {
  const themeStyles = {
    blue: {
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    green: {
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    orange: {
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    red: {
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
    },
  };

  const currentTheme = themeStyles[colorTheme];
  const isPositive = trend >= 0;

  return (
    <div className="bg-white xl:p-6 p-2 rounded-md border border-gray-100 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("xl:p-3 rounded-md", currentTheme.iconBg)}>
          <div
            className={cn(
              "w-8 h-8 flex justify-center items-center",
              currentTheme.iconColor
            )}
          >
            {icon}
          </div>
        </div>
        <div
          className={cn(
            "flex items-center xl:text-sm text-xs font-medium",
            isPositive ? "text-green-600" : "text-red-500"
          )}
        >
          {isPositive ? (
            <MoveUp className="w-3 h-3 mr-1" />
          ) : (
            <MoveDown className="w-3 h-3 mr-1" />
          )}
          {Math.abs(trend)}%
        </div>
      </div>

      <div>
        <h3 className="xl:text-2xl text-md font-bold text-gray-900 mb-1">
          {value}
        </h3>
        <p className="xl:text-sm text-xs text-gray-500 font-medium">{label}</p>
      </div>
    </div>
  );
};

export const CogsStatsGrid: React.FC<CogsStatsGridProps> = ({ className }) => {
  const stats = [
    {
      label: "Total COGS",
      value: "$2,847,392",
      trend: 12.5,
      icon: <CircleDollarSign className="xl:size-6 size-4" />,
      colorTheme: "blue" as const,
    },
    {
      label: "Estimated Cost",
      value: "$2,650,000",
      trend: 8.2,
      icon: <Calculator className="xl:size-6 size-4" />,
      colorTheme: "green" as const,
    },
    {
      label: "Actual Cost",
      value: "$2,847,392",
      trend: 15.3,
      icon: <img src={ScrollIcon} alt="" className="xl:size-6 size-4" />,
      colorTheme: "orange" as const,
    },
    {
      label: "Cost Variance %",
      value: "7.4%",
      trend: -2.1,
      icon: <ChartSpline className="xl:size-6 size-4" />,
      colorTheme: "red" as const,
    },
  ];

  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4 xl:gap-6 gap-2",
        className
      )}
    >
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          label={stat.label}
          value={stat.value}
          trend={stat.trend}
          icon={stat.icon}
          colorTheme={stat.colorTheme}
        />
      ))}
    </div>
  );
};

export default CogsStatsGrid;
