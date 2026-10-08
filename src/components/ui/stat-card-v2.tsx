import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

type StatCardV2Props = {
  title: string;
  value: ReactNode;
  subtitle: ReactNode;
  icon: ReactNode;
  color: "purple" | "green" | "yellow" | "red";
};

const colorStyles = {
  purple: {
    border: "border-purple-300",
    iconText: "text-purple-600",
    pattern: "text-purple-200",
  },
  green: {
    border: "border-green-300",
    iconText: "text-green-600",
    pattern: "text-green-200",
  },
  yellow: {
    border: "border-yellow-300",
    iconText: "text-yellow-600",
    pattern: "text-yellow-200",
  },
  red: {
    border: "border-red-300",
    iconText: "text-red-600",
    pattern: "text-red-200",
  },
};

export default function StatCardV2({
  title,
  value,
  subtitle,
  icon,
  color,
}: StatCardV2Props) {
  const style = colorStyles[color];

  return (
    <Card className="relative overflow-hidden bg-white border border-gray-100 rounded-lg p-3 flex flex-col justify-between gap-0">
      <div className="flex justify-between items-center gap-2">
        <span className="text-gray-900 text-sm font-medium whitespace-nowrap">
          {title}
        </span>
        <div
          className={`p-1.5 rounded-md border ${style.border} ${style.iconText}`}
        >
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-bold text-gray-900">{value}</h3>
        <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
      </div>
      <div className="absolute -bottom-2 -right-2 w-16 h-16 pointer-events-none opacity-40">
        <svg
          viewBox="0 0 100 100"
          className={`w-full h-full ${style.pattern}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <pattern
            id={`lines-${color}`}
            patternUnits="userSpaceOnUse"
            width="8"
            height="8"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="8"
              stroke="currentColor"
              strokeWidth="2"
            />
          </pattern>
          <path d="M100 0 L100 100 L0 100 Z" fill={`url(#lines-${color})`} />
        </svg>
      </div>
    </Card>
  );
}
