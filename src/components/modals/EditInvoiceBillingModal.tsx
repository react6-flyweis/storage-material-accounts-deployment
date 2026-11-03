import { useState } from "react";
import Modal from "../common_components/Modal";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import {
  useUpdateCustomerInvoiceBillingMutation,
  buildAddressLines,
  type InvoiceAddress,
  type InvoiceBankDetails,
} from "@/redux/api/invoiceManagementApi";

export interface EditInvoiceBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
  initialBillingAddress?: InvoiceAddress | null;
  initialRecipientAddress?: InvoiceAddress | null;
  initialBankDetails?: InvoiceBankDetails | null;
  onSuccess?: () => void;
}

export default function EditInvoiceBillingModal(props: EditInvoiceBillingModalProps) {
  if (!props.isOpen) return null;
  return <EditInvoiceBillingModalContent {...props} />;
}

function EditInvoiceBillingModalContent({
  isOpen,
  onClose,
  invoiceId,
  initialBillingAddress,
  initialRecipientAddress,
  initialBankDetails,
  onSuccess,
}: EditInvoiceBillingModalProps) {
  const [activeTab, setActiveTab] = useState<"seller" | "recipient" | "bank">(
    "seller"
  );

  // Billing Address (Seller)
  const [billingCompany, setBillingCompany] = useState(
    initialBillingAddress?.companyName || "STEEL BUILDING DEPOT"
  );
  const [billingLine1, setBillingLine1] = useState(
    initialBillingAddress?.line1 || "1851 Madison Ave Suite 300"
  );
  const [billingLine2, setBillingLine2] = useState(
    initialBillingAddress?.line2 || ""
  );
  const [billingCity, setBillingCity] = useState(
    initialBillingAddress?.city || "Council Bluffs"
  );
  const [billingState, setBillingState] = useState(
    initialBillingAddress?.state || "IA"
  );
  const [billingPostalCode, setBillingPostalCode] = useState(
    initialBillingAddress?.postalCode || "51503"
  );
  const [billingCountry, setBillingCountry] = useState(
    initialBillingAddress?.country || "United States"
  );

  // Recipient Address (Bill-To / Customer)
  const [recipCompany, setRecipCompany] = useState(
    initialRecipientAddress?.companyName || ""
  );
  const [recipLine1, setRecipLine1] = useState(
    initialRecipientAddress?.line1 || ""
  );
  const [recipLine2, setRecipLine2] = useState(
    initialRecipientAddress?.line2 || ""
  );
  const [recipCity, setRecipCity] = useState(
    initialRecipientAddress?.city || ""
  );
  const [recipState, setRecipState] = useState(
    initialRecipientAddress?.state || ""
  );
  const [recipPostalCode, setRecipPostalCode] = useState(
    initialRecipientAddress?.postalCode || ""
  );
  const [recipCountry, setRecipCountry] = useState(
    initialRecipientAddress?.country || "United States"
  );

  // Bank Details
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

  const [errorMessage, setErrorMessage] = useState("");
  const [updateBilling, { isLoading: isSaving }] =
    useUpdateCustomerInvoiceBillingMutation();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      const billingAddress: InvoiceAddress = {
        companyName: billingCompany.trim(),
        line1: billingLine1.trim(),
        line2: billingLine2.trim(),
        city: billingCity.trim(),
        state: billingState.trim(),
        postalCode: billingPostalCode.trim(),
        country: billingCountry.trim() || "United States",
        lines: buildAddressLines({
          line1: billingLine1,
          line2: billingLine2,
          city: billingCity,
          state: billingState,
          postalCode: billingPostalCode,
          country: billingCountry,
        }),
      };

      const recipientAddress: InvoiceAddress = {
        companyName: recipCompany.trim(),
        line1: recipLine1.trim(),
        line2: recipLine2.trim(),
        city: recipCity.trim(),
        state: recipState.trim(),
        postalCode: recipPostalCode.trim(),
        country: recipCountry.trim() || "United States",
        lines: buildAddressLines({
          line1: recipLine1,
          line2: recipLine2,
          city: recipCity,
          state: recipState,
          postalCode: recipPostalCode,
          country: recipCountry,
        }),
      };

      const bankDetails: InvoiceBankDetails = {
        bankName: bankName.trim(),
        accountName: accountName.trim(),
        accountNumber: accountNumber.trim(),
        routingNumber: routingNumber.trim(),
        swiftCode: swiftCode.trim(),
        iban: iban.trim(),
        branchAddress: branchAddress.trim(),
        paymentInstructions: paymentInstructions.trim(),
      };

      await updateBilling({
        invoiceId,
        billingAddress,
        recipientAddress,
        bankDetails,
      }).unwrap();

      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to update billing details on invoice.";
      setErrorMessage(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Invoice Billing & Bank Details"
      width="max-w-xl md:max-w-2xl"
      className="p-0 overflow-hidden"
    >
      <form onSubmit={handleSave} className="flex flex-col">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 px-6 pt-3 gap-2 bg-gray-50/50">
          <button
            type="button"
            onClick={() => setActiveTab("seller")}
            className={`text-sm font-medium px-4 py-2.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === "seller"
                ? "border-[#1D64EC] text-[#1D64EC]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Seller Address
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("recipient")}
            className={`text-sm font-medium px-4 py-2.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === "recipient"
                ? "border-[#1D64EC] text-[#1D64EC]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Bill-To Customer
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("bank")}
            className={`text-sm font-medium px-4 py-2.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === "bank"
                ? "border-[#1D64EC] text-[#1D64EC]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Bank & Wire Details
          </button>
        </div>

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMessage}
          </div>
        )}

        {/* Tab 1: Seller Address */}
        {activeTab === "seller" && (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 max-h-[60vh] overflow-y-auto">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <label className="text-sm font-medium text-gray-800">
                Seller Company Name
              </label>
              <input
                type="text"
                value={billingCompany}
                onChange={(e) => setBillingCompany(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm md:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <label className="text-sm font-medium text-gray-800">
                Street Address
              </label>
              <input
                type="text"
                value={billingLine1}
                onChange={(e) => setBillingLine1(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm md:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <label className="text-sm font-medium text-gray-800">
                Suite / Unit / Floor (Optional)
              </label>
              <input
                type="text"
                value={billingLine2}
                onChange={(e) => setBillingLine2(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm md:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-800">City</label>
              <input
                type="text"
                value={billingCity}
                onChange={(e) => setBillingCity(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm md:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-800">State</label>
              <input
                type="text"
                value={billingState}
                onChange={(e) => setBillingState(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm md:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-800">
                Postal Code
              </label>
              <input
                type="text"
                value={billingPostalCode}
                onChange={(e) => setBillingPostalCode(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm md:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-800">
                Country
              </label>
              <input
                type="text"
                value={billingCountry}
                onChange={(e) => setBillingCountry(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm md:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Recipient (Customer) */}
        {activeTab === "recipient" && (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 max-h-[60vh] overflow-y-auto">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <label className="text-sm font-medium text-gray-800">
                Customer Name / Entity
              </label>
              <input
                type="text"
                value={recipCompany}
                onChange={(e) => setRecipCompany(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm md:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <label className="text-sm font-medium text-gray-800">
                Street Address
              </label>
              <input
                type="text"
                value={recipLine1}
                onChange={(e) => setRecipLine1(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm md:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <label className="text-sm font-medium text-gray-800">
                Suite / Unit / Floor (Optional)
              </label>
              <input
                type="text"
                value={recipLine2}
                onChange={(e) => setRecipLine2(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm md:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-800">City</label>
              <input
                type="text"
                value={recipCity}
                onChange={(e) => setRecipCity(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm md:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-800">State</label>
              <input
                type="text"
                value={recipState}
                onChange={(e) => setRecipState(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm md:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-800">
                Postal Code
              </label>
              <input
                type="text"
                value={recipPostalCode}
                onChange={(e) => setRecipPostalCode(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm md:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-800">
                Country
              </label>
              <input
                type="text"
                value={recipCountry}
                onChange={(e) => setRecipCountry(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm md:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Bank Details */}
        {activeTab === "bank" && (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 max-h-[60vh] overflow-y-auto">
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
            <div className="flex flex-col gap-2 sm:col-span-2">
              <label className="text-sm font-medium text-gray-800">
                Branch Address (Optional)
              </label>
              <input
                type="text"
                value={branchAddress}
                onChange={(e) => setBranchAddress(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm md:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <label className="text-sm font-medium text-gray-800">
                Payment Instructions / Memo
              </label>
              <input
                type="text"
                value={paymentInstructions}
                onChange={(e) => setPaymentInstructions(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm md:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>
        )}

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
            disabled={isSaving}
            className="px-6 py-2.5 h-auto rounded-xl bg-[#1D64EC] hover:bg-blue-700 text-white text-sm md:text-base font-medium transition-colors shadow-xs cursor-pointer"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
            ) : null}
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
