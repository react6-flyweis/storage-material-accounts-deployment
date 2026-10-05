import { Card } from "@/components/ui/card";
import { ChartNoAxesColumn } from "lucide-react";

export default function BudgetVsActualCard() {
  return (
    <Card className="p-6 bg-white rounded-md border-none shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-lg font-normal text-gray-900">Budget vs Actual</h3>
        <ChartNoAxesColumn className="w-5 h-5 text-blue-500" />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">Budgeted</span>
          <span className="font-normal text-gray-900">$12,000</span>
        </div>

        <div className="relative h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-blue-600 rounded-full"
            style={{ width: "75%" }}
          ></div>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">Actual</span>
          <span className="font-normal text-gray-900">$8995.00</span>
        </div>
      </div>
    </Card>
  );
}
