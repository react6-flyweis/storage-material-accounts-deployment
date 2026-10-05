import React from "react";
import { ChartNoAxesColumn } from "lucide-react";

interface CogsCategory {
  category: string;
  value: number;
  color: string;
  percentage: number;
}

interface CogsAnalysisCardProps {
  data?: CogsCategory[];
  totalCost?: number;
}

const defaultData: CogsCategory[] = [
  {
    category: "Material",
    value: 1250000,
    color: "bg-blue-500",
    percentage: 44,
  },
  {
    category: "Labour",
    value: 980000,
    color: "bg-green-500",
    percentage: 34,
  },
  {
    category: "Logistics",
    value: 617392,
    color: "bg-orange-500",
    percentage: 22,
  },
];

export const CogsAnalysisCard: React.FC<CogsAnalysisCardProps> = ({
  data = defaultData,
  totalCost = 2847392,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="w-full p-6 bg-white rounded-md shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-bold text-gray-900">Cost by Category</h3>
        <ChartNoAxesColumn className="w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-8">
        {data.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-medium">{item.category}</span>
              <span className="text-gray-900 font-semibold">
                {formatCurrency(item.value)}
              </span>
            </div>

            <div className="relative h-3 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`absolute top-0 left-0 h-full rounded-full ${item.color}`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>

            <div className="flex justify-end">
              <span className="text-xs text-gray-500 font-medium">
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
        <span className="text-gray-600 font-medium">Total Cost</span>
        <span className="xl:text-xl text-md font-bold text-gray-900">
          {formatCurrency(totalCost)}
        </span>
      </div>
    </div>
  );
};

export default CogsAnalysisCard;
