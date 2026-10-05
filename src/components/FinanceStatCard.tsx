import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FinanceStatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  valueColor?: string;
  iconBgColor?: string;
  className?: string;
}

export default function FinanceStatCard({
  title,
  value,
  icon,
  valueColor = "text-black",
  iconBgColor = "bg-[#EFF6FF]",
  className,
}: FinanceStatCardProps) {
  return (
    <Card
      className={cn(
        "md:p-4 p-3 rounded-md bg-white  transition-all hover:shadow-md",
        className
      )}
    >
      <div className="flex items-center justify-between flex-wrap">
        <div className="flex flex-col gap-1.5">
          <p className="  lg:text-sm text-xs font-regular text-[#4B5563] tracking-tight">
            {title}
          </p>
          <p
            className={cn(
              "lg:text-xl md:text-lg text-xs font-medium tracking-tight",
              valueColor
            )}
          >
            {value}
          </p>
        </div>

        <div
          className={cn(
            "md:p-3 p-2 rounded-xl ml-auto flex items-center justify-center shrink-0",
            iconBgColor
          )}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}
