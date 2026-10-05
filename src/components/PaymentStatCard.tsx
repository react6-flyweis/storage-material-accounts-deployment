import { Card } from "@/components/ui/card";

interface PaymentStatCardProps {
  title: string;
  percentage: string;
  totalAmount: string;
  receivedAmount: string;
  pendingAmount: string;
}

export const PaymentStatCard = ({
  title,
  percentage,
  totalAmount,
  receivedAmount,
  pendingAmount,
}: PaymentStatCardProps) => {
  return (
    <Card className="xl:p-6 md:p-4 p-3 rounded-md border-none  bg-white">
      <div className="flex flex-wrap justify-between items-center">
        <h3 className="font-bold text-black md:text-base text-sm leading-tight mr-2">
          {title}
        </h3>
        <span className="text-emerald-500 font-semibold text-sm md:text-base ml-auto">
          {percentage}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="xl:text-sm text-xs text-gray-500 font-medium">
            Total Amount
          </span>
          <span className="font-semibold text-gray-900 text-sm md:text-base">
            {totalAmount}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="xl:text-sm text-xs text-gray-500 font-medium">
            Received
          </span>
          <span className="font-semibold text-emerald-500 text-sm md:text-base">
            {receivedAmount}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="xl:text-sm text-xs text-gray-500 font-medium">
            Pending
          </span>
          <span className="font-semibold text-red-500 text-sm md:text-base">
            {pendingAmount}
          </span>
        </div>
      </div>
    </Card>
  );
};
