import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";
import { X, Upload, ChevronDown, Loader2 } from "lucide-react";
import ProjectSelectorDropdownModal from "@/components/common_components/ProjectSelectorDropdownModal";

export interface NewMiscInvoiceData {
  invoiceNumber: string;
  serviceProvider: string;
  amount: number;
  dueDate: string;
  serviceCategory: string;
  paymentStatus: "Unpaid" | "Paid" | "Pending";
  projectId?: string;
  file?: File | null;
}

interface UploadMiscInvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewMiscInvoiceData) => Promise<void> | void;
  serviceProviderSuggestions?: string[];
  categorySuggestions?: string[];
  projects?: Array<{
    leadId?: string;
    projectId?: string;
    projectName: string;
    jobId?: string;
  }>;
  isSubmitting?: boolean;
}

const DEFAULT_PROVIDERS = [
  "ABC Repairs",
  "TechSoft",
  "SecureGuard",
  "Legal Associates",
  "Power Utility",
  "Apex Facilities",
];

const DEFAULT_CATEGORIES = [
  "Maintenance",
  "Software",
  "Security",
  "Professional",
  "Utilities",
  "Office Supplies",
];

export const UploadMiscInvoiceDialog: React.FC<UploadMiscInvoiceDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  serviceProviderSuggestions = DEFAULT_PROVIDERS,
  categorySuggestions = DEFAULT_CATEGORIES,
  projects = [],
  isSubmitting = false,
}) => {
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [serviceProvider, setServiceProvider] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("Maintenance");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"Unpaid" | "Paid" | "Pending">("Unpaid");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Dropdown states
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setInvoiceNumber("");
    setServiceProvider("");
    setAmount("");
    setDueDate("");
    setCategory("Maintenance");
    setSelectedProjectId("");
    setPaymentStatus("Unpaid");
    setSelectedFile(null);
    setIsDragging(false);
    setShowCategoryDropdown(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(/[^0-9.]/g, "")) || 0;
    await onSubmit({
      invoiceNumber: invoiceNumber.trim() || `MSC-${Date.now().toString().slice(-5)}`,
      serviceProvider: serviceProvider.trim() || "Service Provider",
      amount: parsedAmount,
      dueDate: dueDate || new Date().toISOString().split("T")[0],
      serviceCategory: category || "Maintenance",
      paymentStatus,
      projectId: selectedProjectId || undefined,
      file: selectedFile,
    });
    handleReset();
  };

  const selectedProjectObj = projects.find(
    (p) => (p.projectId || p.leadId) === selectedProjectId
  );

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 transition-opacity animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-120 p-6 relative animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Upload Miscellaneous Invoice
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
          {/* Row 1: Invoice Number & Service Provider */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Invoice Number
              </label>
              <input
                type="text"
                placeholder="e.g., MSC-2025-001"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-slate-100 border border-transparent focus:border-blue-500 focus:bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Service Provider <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                list="provider-options"
                placeholder="Vendor or Provider Name"
                value={serviceProvider}
                onChange={(e) => setServiceProvider(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-slate-100 border border-transparent focus:border-blue-500 focus:bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all"
              />
              <datalist id="provider-options">
                {serviceProviderSuggestions.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Row 2: Amount & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Amount ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
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

          {/* Row 3: Project Selector (Optional/Required) */}
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Project
            </label>
            <ProjectSelectorDropdownModal
              trigger={
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryDropdown(false);
                    setShowStatusDropdown(false);
                  }}
                  className="w-full h-10 px-3 rounded-lg bg-slate-100 flex items-center justify-between text-xs text-slate-700 cursor-pointer border border-transparent hover:border-slate-200 transition-colors"
                >
                  <span className="text-slate-800 font-medium truncate">
                    {selectedProjectObj
                      ? `${selectedProjectObj.projectName} ${selectedProjectObj.jobId ? `(${selectedProjectObj.jobId})` : ""}`
                      : "Select a project (optional)"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              }
              selectedProjectId={selectedProjectId || undefined}
              selectedProject={
                selectedProjectObj
                  ? selectedProjectObj.jobId
                    ? `${selectedProjectObj.projectName} (${selectedProjectObj.jobId})`
                    : selectedProjectObj.projectName
                  : undefined
              }
              projects={projects.map((p) => ({
                id: p.projectId || p.leadId || "",
                name: p.projectName,
                code: p.jobId,
              }))}
              onSelectProject={(label, leadId) => {
                if (!leadId || label === "All Projects") {
                  setSelectedProjectId("");
                } else {
                  setSelectedProjectId(leadId);
                }
              }}
              align="start"
              className="w-full"
            />
          </div>

          {/* Row 4: Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category */}
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Category
              </label>
              <div
                onClick={() => {
                  setShowCategoryDropdown(!showCategoryDropdown);
                  setShowStatusDropdown(false);
                }}
                className="w-full h-10 px-3 rounded-lg bg-slate-100 flex items-center justify-between text-xs text-slate-700 cursor-pointer border border-transparent hover:border-slate-200 transition-colors"
              >
                <span className="text-slate-800 font-medium">{category}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>

              {showCategoryDropdown && (
                <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg py-1 max-h-48 overflow-y-auto">
                  {categorySuggestions.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setCategory(cat);
                        setShowCategoryDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs cursor-pointer ${
                        category === cat
                          ? "bg-blue-50 text-blue-600 font-semibold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Status */}
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Payment Status
              </label>
              <div
                onClick={() => {
                  setShowStatusDropdown(!showStatusDropdown);
                  setShowCategoryDropdown(false);
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
          </div>

          {/* Row 5: Upload Invoice File */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Upload Document / Receipt
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
              disabled={isSubmitting}
              onClick={handleClose}
              className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#3B66BD] hover:bg-[#2F54A0] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isSubmitting ? "Uploading..." : "Save Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default UploadMiscInvoiceDialog;
