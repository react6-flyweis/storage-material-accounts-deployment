import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";
import { X, Upload, ChevronDown } from "lucide-react";

export interface NewInvoiceData {
  invoiceNumber: string;
  vendorName: string;
  amount: number;
  dueDate: string;
  linkedDelivery?: string;
  paymentStatus: "Unpaid" | "Paid" | "Pending";
  file?: File | null;
  billingAddress?: import("@/redux/api/invoiceManagementApi").InvoiceAddress;
  recipientAddress?: import("@/redux/api/invoiceManagementApi").InvoiceAddress;
  bankDetails?: import("@/redux/api/invoiceManagementApi").InvoiceBankDetails;
}

interface UploadInvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewInvoiceData) => void;
  vendorSuggestions?: string[];
  deliverySuggestions?: string[];
}

const DEFAULT_VENDORS = [
  "Steel Supplier Ltd",
  "Concrete Solutions",
  "Electrical Systems",
  "Apex Fasteners & Fittings",
  "Omega Industrial Panels",
  "Jindal Steel Pvt Ltd",
];

const DEFAULT_DELIVERIES = [
  "DEL-8821 - ABC Warehouse (Steel Beams)",
  "DEL-8822 - Industrial Park (Cement mix)",
  "DEL-8823 - Office Complex (Cables & Conduit)",
  "FRT-1042 - National Road Express",
  "FRT-1099 - Swift Freight Logistics",
];

export const UploadInvoiceDialog: React.FC<UploadInvoiceDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  vendorSuggestions = DEFAULT_VENDORS,
  deliverySuggestions = DEFAULT_DELIVERIES,
}) => {
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [linkedDelivery, setLinkedDelivery] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"Unpaid" | "Paid" | "Pending">("Unpaid");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Dropdown states
  const [showDeliveryDropdown, setShowDeliveryDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setInvoiceNumber("");
    setVendorName("");
    setAmount("");
    setDueDate("");
    setLinkedDelivery("");
    setPaymentStatus("Unpaid");
    setSelectedFile(null);
    setIsDragging(false);
    setShowDeliveryDropdown(false);
    setShowStatusDropdown(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(/[^0-9.]/g, "")) || 0;
    onSubmit({
      invoiceNumber: invoiceNumber.trim() || `INV-${Date.now().toString().slice(-5)}`,
      vendorName: vendorName.trim() || "Vendor",
      amount: parsedAmount,
      dueDate: dueDate || new Date().toISOString().split("T")[0],
      linkedDelivery: linkedDelivery || undefined,
      paymentStatus,
      file: selectedFile,
    });
    handleReset();
  };

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 transition-opacity animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-120 p-6 relative animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Upload New Invoice
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Invoice Number & Vendor/Carrier Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Invoice Number
              </label>
              <input
                type="text"
                placeholder="e.g., VND-2024-0126"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-slate-100 border border-transparent focus:border-blue-500 focus:bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Vendor/Carrier Name
              </label>
              <input
                type="text"
                list="vendor-options"
                placeholder="Select or enter vendor"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-slate-100 border border-transparent focus:border-blue-500 focus:bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all"
              />
              <datalist id="vendor-options">
                {vendorSuggestions.map((v) => (
                  <option key={v} value={v} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Row 2: Amount & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-slate-100 border border-transparent focus:border-blue-500 focus:bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-slate-100 border border-transparent focus:border-blue-500 focus:bg-white text-xs text-slate-800 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Row 3: Link to Delivery/Freight (Optional) */}
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Link to Delivery/Freight (Optional)
            </label>
            <div
              onClick={() => {
                setShowDeliveryDropdown(!showDeliveryDropdown);
                setShowStatusDropdown(false);
              }}
              className="w-full h-10 px-3 rounded-lg bg-slate-100 flex items-center justify-between text-xs text-slate-700 cursor-pointer border border-transparent hover:border-slate-200 transition-colors"
            >
              <span className={linkedDelivery ? "text-slate-800 font-medium" : "text-slate-400"}>
                {linkedDelivery || "Select delivery or freight reque"}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>

            {showDeliveryDropdown && (
              <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg py-1 max-h-48 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => {
                    setLinkedDelivery("");
                    setShowDeliveryDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  None
                </button>
                {deliverySuggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setLinkedDelivery(item);
                      setShowDeliveryDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer font-normal"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Row 4: Payment Status */}
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Payment Status
            </label>
            <div
              onClick={() => {
                setShowStatusDropdown(!showStatusDropdown);
                setShowDeliveryDropdown(false);
              }}
              className="w-full h-10 px-3 rounded-lg bg-slate-100 flex items-center justify-between text-xs text-slate-700 cursor-pointer border border-transparent hover:border-slate-200 transition-colors"
            >
              <span className="text-slate-800 font-medium">{paymentStatus}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>

            {showStatusDropdown && (
              <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg py-1">
                {(["Unpaid", "Paid", "Pending"] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => {
                      setPaymentStatus(status);
                      setShowStatusDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs cursor-pointer ${
                      paymentStatus === status
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Row 5: Upload Invoice File */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Upload Invoice File
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl py-6 px-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-blue-500 bg-blue-50/50"
                  : selectedFile
                  ? "border-blue-300 bg-blue-50/20"
                  : "border-slate-300 bg-white hover:bg-slate-50/60"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 mb-2">
                <Upload className="w-7 h-7 text-slate-400 stroke-[1.5]" />
              </div>
              <p className="text-xs font-medium text-slate-700 mb-0.5">
                {selectedFile ? (
                  <span className="font-semibold text-blue-600">{selectedFile.name}</span>
                ) : (
                  "Click to upload or drag and drop"
                )}
              </p>
              <p className="text-[11px] text-slate-400">
                {selectedFile
                  ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                  : "PDF, PNG, or JPG (max 10MB)"}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#3B66BD] hover:bg-[#2F54A0] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Upload Invoice
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
