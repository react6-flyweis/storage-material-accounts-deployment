import React, { useState, useEffect } from "react";
import Modal from "../common_components/Modal";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/Input";
import { Plus } from "lucide-react";

export interface PaymentEntry {
  id: string;
  name: string;
  amount: number;
}

interface PaymentScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  initialPayments?: PaymentEntry[];
  initialUnit?: "%" | "$";
  onDone: (payments: PaymentEntry[], unit: "%" | "$") => void;
}

const PaymentScheduleModal: React.FC<PaymentScheduleModalProps> = ({
  isOpen,
  onClose,
  total,
  initialPayments = [{ id: "1", name: "Deposit", amount: 0 }],
  initialUnit = "%",
  onDone,
}) => {
  const [unit, setUnit] = useState<"%" | "$">(initialUnit);
  const [payments, setPayments] = useState<PaymentEntry[]>(initialPayments);

  useEffect(() => {
    if (isOpen) {
      setUnit(initialUnit);
      setPayments(
        initialPayments.length > 0
          ? initialPayments
          : [{ id: Date.now().toString(), name: "", amount: 0 }]
      );
    }
  }, [isOpen, initialUnit, initialPayments]);

  const addPayment = () => {
    setPayments([
      ...payments,
      { id: Date.now().toString(), name: "", amount: 0 },
    ]);
  };

  const updatePayment = (
    id: string,
    field: "name" | "amount",
    value: string | number
  ) => {
    setPayments(
      payments.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const calculateTotalAllocated = () => {
    return payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  };

  const remaining =
    unit === "%"
      ? 100 - calculateTotalAllocated()
      : total - calculateTotalAllocated();

  const handleDone = () => {
    onDone(payments, unit);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Payment Schedule"
      width="max-w-lg"
      className="px-0"
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 px-6 md:px-8 py-6 space-y-6 max-h-[60vh] overflow-y-auto">
          <div className="flex items-center gap-6 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="schedule-unit"
                checked={unit === "%"}
                onChange={() => setUnit("%")}
                className="w-4 h-4 text-[#2563EB]"
              />
              <span className="text-sm font-medium text-gray-700">%</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="schedule-unit"
                checked={unit === "$"}
                onChange={() => setUnit("$")}
                className="w-4 h-4 text-[#2563EB]"
              />
              <span className="text-sm font-medium text-gray-700">$</span>
            </label>
          </div>

          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
              >
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500">
                    Payment Name
                  </label>
                  <Input
                    value={payment.name}
                    onChange={(e) =>
                      updatePayment(payment.id, "name", e.target.value)
                    }
                    placeholder="e.g. Deposit"
                    className="h-11 border-[#C5C5C5] mt-1"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500">
                    Payment Amount
                  </label>
                  <div className="relative mt-1">
                    <Input
                      type="number"
                      value={payment.amount || ""}
                      onChange={(e) =>
                        updatePayment(
                          payment.id,
                          "amount",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="pr-10 h-11 border-[#C5C5C5]"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-900 text-sm">
                      {unit}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addPayment}
            className="flex items-center gap-2 text-[#2563EB] text-sm font-medium hover:underline"
          >
            <div className="w-5 h-5 bg-[#2563EB] rounded-full flex items-center justify-center text-white">
              <Plus className="w-3.5 h-3.5" />
            </div>
            Add payment
          </button>

          <div className="pt-4 w-full flex justify-center items-center">
            <span
              className={`text-sm font-medium ${
                remaining < 0 ? "text-red-500" : "text-[#2563EB]"
              }`}
            >
              {unit === "%"
                ? `${remaining.toFixed(2)}% Remaining`
                : `$${remaining.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })} Remaining`}
            </span>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end items-center gap-3 bg-white rounded-b-xl">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-[#F3F4F6] hover:bg-gray-200 text-gray-900 border-none px-8 h-12 rounded-lg font-medium min-w-[100px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDone}
            className="bg-[#2563EB] hover:bg-blue-700 text-white px-8 h-12 rounded-lg font-medium min-w-[100px]"
          >
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentScheduleModal;
