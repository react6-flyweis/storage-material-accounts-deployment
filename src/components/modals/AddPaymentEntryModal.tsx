import React, { useState } from "react";
import Modal from "../common_components/Modal";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface PaymentEntryData {
  payerName: string;
  paymentType: string;
  amount: string;
  paymentDate: string;
  transactionId: string;
  remarks?: string;
}

interface AddPaymentEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: PaymentEntryData) => void;
}

const payerOptions = [
  "ABC Construction",
  "John Doe",
  "Sarah Lee",
  "Michael Brown",
  "Global Tech Builders",
];

const paymentTypeOptions = [
  "Bank Transfer",
  "Credit Card",
  "Debit Card",
  "Cash",
  "UPI / Wire",
  "Cheque",
];

export const AddPaymentEntryModal: React.FC<AddPaymentEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [payerName, setPayerName] = useState("ABC Construction");
  const [paymentType, setPaymentType] = useState("Bank Transfer");
  const [amount, setAmount] = useState("$5,000");
  const [paymentDate, setPaymentDate] = useState("15 Jan 2026");
  const [transactionId, setTransactionId] = useState("UPI98234XYZ");
  const [remarks, setRemarks] = useState("January membership payment");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave({
        payerName,
        paymentType,
        amount,
        paymentDate,
        transactionId,
        remarks,
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add payment entry"
      width="max-w-xl md:max-w-2xl"
      className="p-0 overflow-hidden"
    >
      <form onSubmit={handleSubmit} className="flex flex-col">
        {/* Fields Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
          {/* Payer Name */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-800">
              Payer Name
            </label>
            <Select value={payerName} onValueChange={setPayerName}>
              <SelectTrigger className="w-full h-11 px-4 bg-white border border-gray-300 rounded-xl text-sm md:text-base text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-none">
                <SelectValue placeholder="Select payer">{payerName}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {payerOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Type */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-800">
              Payment Type
            </label>
            <Select value={paymentType} onValueChange={setPaymentType}>
              <SelectTrigger className="w-full h-11 px-4 bg-white border border-gray-300 rounded-xl text-sm md:text-base text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-none">
                <SelectValue placeholder="Select payment type">{paymentType}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {paymentTypeOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-800">
              Amount
            </label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="$5,000"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm md:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Payment Date */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-800">
              Payment Date
            </label>
            <input
              type="text"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              placeholder="15 Jan 2026"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm md:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Transaction ID */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-800">
              Transaction ID
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="UPI98234XYZ"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm md:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Remarks (Optional) */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-800">
              Remarks (Optional)
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="January membership payment"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm md:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Footer actions with shadcn Button */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="px-8 py-2.5 h-auto rounded-xl bg-[#EDEDED] hover:bg-gray-200 text-gray-800 text-sm md:text-base font-medium shadow-none cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="px-6 py-2.5 h-auto rounded-xl bg-[#1D64EC] hover:bg-blue-700 text-white text-sm md:text-base font-medium transition-colors shadow-xs cursor-pointer"
          >
            Save & Schedule
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddPaymentEntryModal;
