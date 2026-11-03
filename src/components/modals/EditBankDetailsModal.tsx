import { useState } from "react";
import Modal from "../common_components/Modal";
import { Button } from "@/components/ui/button";
import type { InvoiceBankDetails } from "@/redux/api/invoiceManagementApi";

export interface EditBankDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBankDetails?: Partial<InvoiceBankDetails> | null;
  onSave: (bankDetails: InvoiceBankDetails) => void;
}

export default function EditBankDetailsModal(props: EditBankDetailsModalProps) {
  if (!props.isOpen) return null;
  return <EditBankDetailsModalContent {...props} />;
}

function EditBankDetailsModalContent({
  isOpen,
  onClose,
  initialBankDetails,
  onSave,
}: EditBankDetailsModalProps) {
  const [bankName, setBankName] = useState(
    initialBankDetails?.bankName || ""
  );
  const [accountName, setAccountName] = useState(
    initialBankDetails?.accountName || ""
  );
  const [accountNumber, setAccountNumber] = useState(
    initialBankDetails?.accountNumber || ""
  );
  const [routingNumber, setRoutingNumber] = useState(
    initialBankDetails?.routingNumber || ""
  );
  const [swiftCode, setSwiftCode] = useState(
    initialBankDetails?.swiftCode || ""
  );
  const [iban, setIban] = useState(initialBankDetails?.iban || "");
  const [branchAddress, setBranchAddress] = useState(
    initialBankDetails?.branchAddress || ""
  );
  const [paymentInstructions, setPaymentInstructions] = useState(
    initialBankDetails?.paymentInstructions || "Include invoice number in memo."
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      bankName: bankName.trim(),
      accountName: accountName.trim(),
      accountNumber: accountNumber.trim(),
      routingNumber: routingNumber.trim(),
      swiftCode: swiftCode.trim(),
      iban: iban.trim(),
      branchAddress: branchAddress.trim(),
      paymentInstructions: paymentInstructions.trim(),
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bank Details & Wire / ACH"
      width="max-w-xl md:max-w-2xl"
      className="p-0 overflow-hidden"
    >
      <form onSubmit={handleSave} className="flex flex-col">
        {/* Fields Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 max-h-[65vh] overflow-y-auto">
          {/* Bank Name */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-800">
              Bank Name
            </label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g. JPMorgan Chase"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm md:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Account Name */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-800">
              Account Name
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="e.g. Steel Building Depot LLC"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm md:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Account Number */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-800">
              Account Number
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="e.g. ****1234"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm md:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Routing Number */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-800">
              Routing Number (ABA)
            </label>
            <input
              type="text"
              value={routingNumber}
              onChange={(e) => setRoutingNumber(e.target.value)}
              placeholder="e.g. 021000021"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm md:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* SWIFT / BIC */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-800">
              SWIFT / BIC (Optional)
            </label>
            <input
              type="text"
              value={swiftCode}
              onChange={(e) => setSwiftCode(e.target.value)}
              placeholder="e.g. CHASUS33"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm md:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* IBAN */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-800">
              IBAN (Optional)
            </label>
            <input
              type="text"
              value={iban}
              onChange={(e) => setIban(e.target.value)}
              placeholder="e.g. US1234567890"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm md:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Branch Address */}
          <div className="flex flex-col gap-2 sm:col-span-2">
            <label className="text-sm font-medium text-gray-800">
              Branch Address (Optional)
            </label>
            <input
              type="text"
              value={branchAddress}
              onChange={(e) => setBranchAddress(e.target.value)}
              placeholder="Bank branch street address, city, state"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm md:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Payment Instructions / Memo */}
          <div className="flex flex-col gap-2 sm:col-span-2">
            <label className="text-sm font-medium text-gray-800">
              Payment Instructions / Memo
            </label>
            <input
              type="text"
              value={paymentInstructions}
              onChange={(e) => setPaymentInstructions(e.target.value)}
              placeholder="e.g. Include invoice number in wire memo."
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm md:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Footer actions matching panel modals */}
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
            Save Bank Details
          </Button>
        </div>
      </form>
    </Modal>
  );
}
