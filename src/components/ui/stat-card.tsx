import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

type StatCardProps = {
  title: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  color?: string;
  className?: string;
  navigateTo?: string;
  onClick?: () => void;
  iconClassName?: string;
};

export default function StatCard({
  title,
  value,
  icon,
  color,
  className,
  navigateTo,
  onClick,
  iconClassName,
}: StatCardProps) {
  const navigation = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (navigateTo) {
      navigation(navigateTo);
    }
  };

  return (
    <Card
      className={cn(
        "sm:p-5 px-3 py-2 rounded-md text-white border-none cursor-pointer",
        className,
        color
      )}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="md:text-base text-xs opacity-90">{title}</p>
          <p className="md:text-2xl text-base mt-1 w-17.5 sm:w-auto overflow-y-hidden overflow-x-auto">
            {value}
          </p>
        </div>

        {icon && (
          <div className={cn("bg-white sm:p-2 p-1 rounded-md", iconClassName)}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
