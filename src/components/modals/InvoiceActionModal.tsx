import React, { useState, useEffect } from "react";
import Modal from "../common_components/Modal";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/Input";

export type InvoiceActionType = "markup" | "discount" | "deposit";

interface InvoiceActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: InvoiceActionType;
  initialValue?: number;
  initialUnit?: "%" | "$";
  onDone: (value: number, unit: "%" | "$") => void;
}

const InvoiceActionModal: React.FC<InvoiceActionModalProps> = ({
  isOpen,
  onClose,
  type,
  initialValue = 0,
  initialUnit = "%",
  onDone,
}) => {
  const [unit, setUnit] = useState<"%" | "$">(initialUnit);
  const [value, setValue] = useState<string>(initialValue.toString());

  useEffect(() => {
    if (isOpen) {
      setUnit(initialUnit);
      setValue(initialValue.toString());
    }
  }, [isOpen, initialUnit, initialValue]);

  const getTitle = () => {
    switch (type) {
      case "markup":
        return "Add Markup";
      case "discount":
        return "Add discount";
      case "deposit":
        return "Deposit";
      default:
        return "";
    }
  };

  const getInputLabel = () => {
    switch (type) {
      case "markup":
        return "Markup";
      case "discount":
        return "Discount";
      case "deposit":
        return "Deposit";
      default:
        return "";
    }
  };

  const handleDone = () => {
    onDone(parseFloat(value) || 0, unit);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      width="max-w-md"
      className="px-0"
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 px-8 py-6 space-y-6">
          {type === "deposit" && (
            <p className="text-[#6B7280] text-sm leading-relaxed">
              Get some peace of mind and get a deposit before the work starts.
            </p>
          )}

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="unit"
                checked={unit === "%"}
                onChange={() => setUnit("%")}
                className="w-4 h-4 text-[#2563EB] border-gray-300 focus:ring-[#2563EB]"
              />
              <span className="text-sm font-medium text-gray-700">%</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="unit"
                checked={unit === "$"}
                onChange={() => setUnit("$")}
                className="w-4 h-4 text-[#2563EB] border-gray-300 focus:ring-[#2563EB]"
              />
              <span className="text-sm font-medium text-gray-700">$</span>
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              {getInputLabel()}
            </label>
            <div className="relative">
              <Input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="pr-10 h-12 border-[#C5C5C5] focus:border-[#2563EB] bg-white rounded-lg"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                {unit}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end items-center gap-3 bg-white rounded-b-xl">
          {type === "deposit" && (
            <Button
              variant="outline"
              onClick={onClose}
              className="bg-[#F3F4F6] hover:bg-gray-200 text-gray-900 border-none px-8 h-12 rounded-lg font-medium min-w-[100px]"
            >
              Cancel
            </Button>
          )}
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

export default InvoiceActionModal;
