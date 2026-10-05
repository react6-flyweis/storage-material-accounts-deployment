import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function BudgetAlertCard() {
  return (
    <Card className="p-4 bg-orange-50 border border-orange-100 rounded-md shadow-sm">
      <div className="flex gap-3">
        <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-sm font-regular text-orange-900">Budget Alert</h4>
          <p className="text-sm text-orange-800 leading-relaxed">
            You've used 75% of your monthly budget.
          </p>
        </div>
      </div>
    </Card>
  );
}
