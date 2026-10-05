import React from "react";
import Modal from "../common_components/Modal";
import { X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { OrderItem } from "@/pages/PaymentOverview";
import { useGetPaymentOrderDetailQuery } from "@/redux/api/paymentsApi";
import { formatCurrency } from "@/lib/dashboardFormatters";

export interface OrderPaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: OrderItem | null;
  onUpdate?: (order: OrderItem) => void;
}

export const OrderPaymentDetailsModal: React.FC<OrderPaymentDetailsModalProps> = ({
  isOpen,
  onClose,
  order,
  onUpdate,
}) => {
  // Use order identifier (wipId, leadId, projectId / quoteOrderId, or id)
  const lookupId =
    order?.wipId ||
    order?.projectId ||
    order?.leadId ||
    order?.id ||
    "";

  // A3. Fetch full order detail from server
  const {
    data: detailData,
    isLoading: isDetailLoading,
    isFetching: isDetailFetching,
  } = useGetPaymentOrderDetailQuery(lookupId, {
    skip: !isOpen || !lookupId,
  });

  // Extract fields from profile/financials or fallback to order item
  const quoteId =
    detailData?.profile?.quoteId ||
    detailData?.profile?.quoteOrderId ||
    detailData?.orderDetails?.quoteOrderId ||
    detailData?.orderDetails?.orderId ||
    order?.projectId ||
    "QUO-990-009";

  const customerName =
    detailData?.profile?.customerName ||
    detailData?.orderDetails?.customerName ||
    order?.client ||
    "John Doe";

  const orderValue = detailData?.profile?.orderValue !== undefined
    ? formatCurrency(detailData.profile.orderValue)
    : detailData?.orderValue !== undefined
    ? formatCurrency(detailData.orderValue)
    : order?.orderValue || "$0";

  const deposit = detailData?.financials?.deposit !== undefined
    ? formatCurrency(detailData.financials.deposit)
    : detailData?.paymentBreakdown?.deposit !== undefined
    ? formatCurrency(detailData.paymentBreakdown.deposit)
    : order?.deposit || "$0";

  const progress = detailData?.financials?.progress !== undefined
    ? formatCurrency(detailData.financials.progress)
    : detailData?.paymentBreakdown?.progress !== undefined
    ? formatCurrency(detailData.paymentBreakdown.progress)
    : order?.progress || "$0";

  const profit = detailData?.financials?.profit !== undefined
    ? formatCurrency(detailData.financials.profit)
    : detailData?.profit !== undefined
    ? formatCurrency(detailData.profit)
    : order?.profit || "$0";

  const outstanding = detailData?.financials?.outstanding !== undefined
    ? formatCurrency(detailData.financials.outstanding)
    : detailData?.outstanding !== undefined
    ? formatCurrency(detailData.outstanding)
    : order?.outstanding || "$0";

  const totalPayable = detailData?.financials?.totalPayable !== undefined
    ? formatCurrency(detailData.financials.totalPayable)
    : outstanding;

  const status =
    detailData?.paymentStatus ||
    detailData?.status ||
    order?.status ||
    "In progress";

  const handleUpdate = () => {
    if (onUpdate) {
      const mergedOrder: OrderItem = {
        id: lookupId || order?.id || "order-id",
        wipId: detailData?.wipId || order?.wipId,
        leadId: detailData?.leadId || order?.leadId,
        client: customerName,
        projectId: quoteId,
        location:
          detailData?.profile?.location ||
          detailData?.orderDetails?.location ||
          order?.location ||
          "",
        orderValue: orderValue,
        currentCost:
          detailData?.currentCost !== undefined
            ? formatCurrency(detailData.currentCost)
            : order?.currentCost || "$0",
        deposit: deposit,
        progress: progress,
        final:
          detailData?.financials?.final !== undefined
            ? formatCurrency(detailData.financials.final)
            : detailData?.paymentBreakdown?.final !== undefined
            ? formatCurrency(detailData.paymentBreakdown.final)
            : order?.final || "$0",
        outstanding: outstanding,
        profit: profit,
        margin: `${
          detailData?.financials?.marginPct ??
          detailData?.marginPct ??
          order?.margin ??
          0
        }%`,
        status: status,
        totalReceived:
          detailData?.financials?.totalReceived !== undefined
            ? formatCurrency(detailData.financials.totalReceived)
            : detailData?.totalReceived !== undefined
            ? formatCurrency(detailData.totalReceived)
            : order?.totalReceived || "$0",
        raw: detailData as any,
      };
      onUpdate(mergedOrder);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      hideHeader={true}
      width="max-w-[430px]"
      className="p-0 overflow-hidden rounded-2xl"
    >
      <div className="flex flex-col bg-white rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              Order & Payment
            </h2>
            {isDetailFetching && (
              <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            )}
            <Badge
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-semibold text-white border-none shadow-none",
                status.toLowerCase() === "completed"
                  ? "bg-[#16A34A] hover:bg-[#16A34A]"
                  : status.toLowerCase() === "started"
                  ? "bg-[#D97706] hover:bg-[#D97706]"
                  : status.toLowerCase() === "on hold" ||
                    status.toLowerCase() === "on_hold"
                  ? "bg-gray-500 hover:bg-gray-500"
                  : "bg-[#2563EB] hover:bg-[#2563EB]"
              )}
            >
              {status.toLowerCase() === "in_progress"
                ? "In Progress"
                : status.toLowerCase() === "on_hold"
                ? "On Hold"
                : status}
            </Badge>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Loading state if first fetch without existing data */}
        {isDetailLoading && !order ? (
          <div className="p-8 flex items-center justify-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <span>Loading order details...</span>
          </div>
        ) : (
          <>
            {/* Section 1: Quote and Customer Details */}
            <div className="px-6 py-4 space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-normal">Quote ID</span>
                <span className="text-gray-700 font-medium">{quoteId}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-normal">Customer Name</span>
                <span className="text-gray-700 font-medium">{customerName}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-normal">Order Value</span>
                <span className="text-gray-900 font-bold">{orderValue}</span>
              </div>
            </div>

            <div className="border-b border-gray-200 mx-6" />

            {/* Section 2: Payment Breakdown */}
            <div className="px-6 py-4 space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-normal">Deposit</span>
                <span className="text-gray-700 font-medium">{deposit}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-normal">Progress</span>
                <span className="text-gray-700 font-medium">{progress}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-normal">Profit</span>
                <span className="text-[#16A34A] font-medium">{profit}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-normal">Outstanding</span>
                <span className="text-gray-700 font-medium">{outstanding}</span>
              </div>
            </div>

            <div className="border-b border-gray-200 mx-6" />

            {/* Section 3: Total Payable */}
            <div className="px-6 py-4.5 flex items-center justify-between">
              <span className="text-gray-900 font-bold text-base">
                Total Payable
              </span>
              <span className="text-[#EF4444] font-bold text-base">
                {totalPayable}
              </span>
            </div>

            {/* Footer: Update button */}
            <div className="flex justify-center pb-6 pt-1 px-6">
              <Button
                type="button"
                onClick={handleUpdate}
                className="w-36 py-2.5 h-auto bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                Update
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default OrderPaymentDetailsModal;
