import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ProjectProfitabilityItem {
  id: string | number;
  name: string;
  value: string; // e.g. "$245,000" or "25.2% -> 18.5%"
  badgeValue: string; // e.g. "42.5%" or "-6.7%"
  badgeColor?: "green" | "red"; // To determine styling
}

interface ProjectProfitabilityCardProps {
  title: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  items: ProjectProfitabilityItem[];
  className?: string;
}

export default function ProjectProfitabilityCard({
  title,
  icon,
  iconBgColor = "bg-green-50",
  items,
  className,
}: ProjectProfitabilityCardProps) {
  return (
    <Card
      className={cn(
        "xl:p-6 p-4 bg-white rounded-md border-none shadow-sm",
        className
      )}
    >
      <div className="flex items-center gap-3 mb-0">
        <div
          className={cn(
            "md:w-10 md:h-10 w-8 h-8 rounded-xl flex items-center justify-center",
            iconBgColor
          )}
        >
          {icon}
        </div>
        <h3 className="xl:text-lg text-base font-bold text-gray-900">
          {title}
        </h3>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between xl:p-4 p-2 bg-[#F9FAFB] rounded-md hover:bg-gray-50 transition-colors"
          >
            <div className="space-y-1">
              <p className="xl:text-sm text-xs font-regular text-gray-900">
                {item.name}
              </p>
              <p className="xl:text-sm text-xs font-regular text-gray-500">
                {item.value}
              </p>
            </div>
            <div
              className={cn(
                "px-3 py-1 rounded-full text-xs font-normal",
                item.badgeColor === "red"
                  ? "bg-red-50 text-red-600"
                  : "bg-green-50 text-green-600"
              )}
            >
              {item.badgeValue}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
