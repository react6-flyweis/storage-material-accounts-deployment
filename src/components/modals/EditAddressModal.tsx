import { useState } from "react";
import Modal from "../common_components/Modal";
import { Button } from "@/components/ui/button";
import {
  buildAddressLines,
  type InvoiceAddress,
} from "@/redux/api/invoiceManagementApi";

export interface EditAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  type?: "billing" | "recipient";
  initialAddress?: Partial<InvoiceAddress> | null;
  onSave: (address: InvoiceAddress) => void;
}

export default function EditAddressModal(props: EditAddressModalProps) {
  if (!props.isOpen) return null;
  return <EditAddressModalContent {...props} />;
}

function EditAddressModalContent({
  isOpen,
  onClose,
  title,
  type = "billing",
  initialAddress,
  onSave,
}: EditAddressModalProps) {
  const isBilling = type === "billing";
  const modalTitle =
    title ||
    (isBilling
      ? "Edit Billing Address"
      : "Edit Bill-To Address");

  const [companyName, setCompanyName] = useState(
    initialAddress?.companyName || ""
  );
  const [line1, setLine1] = useState(initialAddress?.line1 || "");
  const [line2, setLine2] = useState(initialAddress?.line2 || "");
  const [city, setCity] = useState(initialAddress?.city || "");
  const [state, setState] = useState(initialAddress?.state || "");
  const [postalCode, setPostalCode] = useState(
    initialAddress?.postalCode || ""
  );
  const [country, setCountry] = useState(
    initialAddress?.country || "United States"
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = buildAddressLines({
      line1,
      line2,
      city,
      state,
      postalCode,
      country,
    });

    onSave({
      companyName: companyName.trim(),
      line1: line1.trim(),
      line2: line2.trim(),
      city: city.trim(),
      state: state.trim(),
      postalCode: postalCode.trim(),
      country: country.trim() || "United States",
      lines,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      width="max-w-xl md:max-w-2xl"
      className="p-0 overflow-hidden"
    >
      <form onSubmit={handleSave} className="flex flex-col">
        {/* Fields Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 max-h-[65vh] overflow-y-auto">
          {/* Company / Entity Name */}
          <div className="flex flex-col gap-2 sm:col-span-2">
            <label className="text-sm font-medium text-gray-800">
              Company / Entity Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder={isBilling ? "e.g. STEEL BUILDING DEPOT" : "e.g. Customer Name"}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm md:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Street Address Line 1 */}
          <div className="flex flex-col gap-2 sm:col-span-2">
            <label className="text-sm font-medium text-gray-800">
              Street Address
            </label>
            <input
              type="text"
              value={line1}
              onChange={(e) => setLine1(e.target.value)}
              placeholder="e.g. 1851 Madison Ave"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm md:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Line 2 */}
          <div className="flex flex-col gap-2 sm:col-span-2">
            <label className="text-sm font-medium text-gray-800">
              Suite / Unit / Floor (Optional)
            </label>
            <input
              type="text"
              value={line2}
              onChange={(e) => setLine2(e.target.value)}
              placeholder="e.g. Suite 300"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm md:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* City */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-800">
              City
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Council Bluffs"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm md:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* State */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-800">
              State / Province
            </label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="e.g. IA"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm md:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Postal Code */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-800">
              Postal / Zip Code
            </label>
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="e.g. 51503"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm md:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Country */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-800">
              Country
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. United States"
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
            Save Address
          </Button>
        </div>
      </form>
    </Modal>
  );
}
