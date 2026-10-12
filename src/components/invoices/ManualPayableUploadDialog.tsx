import React, { useState, useRef } from "react";
import {
  Upload,
  X,
  Building2,
  Truck,
  AlertCircle,
} from "lucide-react";

export interface PayableInvoiceEntry {
  id: string;
  invoiceNumber: string;
  type: "vendor" | "freight_carrier";
  payeeName: string;
  carrierCode?: string;
  project: string;
  jobId: string;
  amount: number;
  date: string;
  dueDate: string;
  payableStatus: "pending_admin_approval" | "approved_for_payment" | "paid" | "rejected";
  paymentStatus: "Pending" | "Paid" | "Overdue";
  category?: string;
  documentUrl?: string;
  notes?: string;
  route?: string;
  paymentDetails?: {
    paidAt?: string;
    method?: string;
    referenceNumber?: string;
    notes?: string;
  };
}

interface ManualPayableUploadDialogProps {
  open: boolean;
  onClose: () => void;
  type: "vendor" | "freight_carrier";
  onSuccess: (newEntry: PayableInvoiceEntry) => void;
  existingProjects?: string[];
}

const DEFAULT_VENDORS = [
  "Jindal Steel Pvt Ltd",
  "Tata Steel Corp",
  "Apex Fasteners & Fittings",
  "ABC Concrete Suppliers",
  "Omega Industrial Panels",
  "Steel Building Depot",
];

const DEFAULT_CARRIERS = [
  { name: "Swift Freight Logistics", code: "SFL-902" },
  { name: "BlueDart Cargo Haulers", code: "BDC-143" },
  { name: "Prime Haulers Line", code: "PHL-512" },
  { name: "National Road Express", code: "NRE-808" },
  { name: "Eagle Express Freight", code: "EEF-321" },
];

const DEFAULT_PROJECTS = [
  { name: "ABC Logistic Warehouse", jobId: "JOB-2025-01" },
  { name: "SMDT Warehouse Expansion", jobId: "JOB-2025-02" },
  { name: "Steel Unit Complex", jobId: "JOB-2025-03" },
  { name: "Industrial Storage Shed", jobId: "JOB-2025-04" },
  { name: "Warehouse Expansion Ph-2", jobId: "JOB-2025-05" },
];

export function ManualPayableUploadDialog({
  open,
  onClose,
  type,
  onSuccess,
  existingProjects,
}: ManualPayableUploadDialogProps) {
  const isVendor = type === "vendor";
  const title = isVendor ? "Upload Vendor Invoice" : "Upload Freight Carrier Invoice";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [payeeName, setPayeeName] = useState(
    isVendor ? DEFAULT_VENDORS[0] : DEFAULT_CARRIERS[0].name
  );
  const [carrierCode, setCarrierCode] = useState(
    !isVendor ? DEFAULT_CARRIERS[0].code : ""
  );
  const [project, setProject] = useState(
    existingProjects && existingProjects.length > 0
      ? existingProjects[0]
      : DEFAULT_PROJECTS[0].name
  );
  const [jobId, setJobId] = useState(DEFAULT_PROJECTS[0].jobId);
  const [invoiceNumber, setInvoiceNumber] = useState(
    () => `${isVendor ? "VND" : "FRT"}-${Date.now().toString().slice(-4)}`
  );
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [category, setCategory] = useState(isVendor ? "Raw Material" : "Standard Freight");
  const [route, setRoute] = useState(isVendor ? "" : "Dallas -> Fort Worth");
  const [notes, setNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  if (!open) return null;

  const handleCarrierChange = (name: string) => {
    setPayeeName(name);
    const found = DEFAULT_CARRIERS.find((c) => c.name === name);
    if (found) setCarrierCode(found.code);
  };

  const handleProjectChange = (projName: string) => {
    setProject(projName);
    const found = DEFAULT_PROJECTS.find((p) => p.name === projName);
    if (found) setJobId(found.jobId);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg("Please enter a valid invoice amount.");
      return;
    }
    if (!invoiceNumber.trim()) {
      setErrorMsg("Please enter an invoice number.");
      return;
    }

    const newRecord: PayableInvoiceEntry = {
      id: String(Date.now()),
      invoiceNumber: invoiceNumber.trim(),
      type,
      payeeName,
      carrierCode: !isVendor ? carrierCode : undefined,
      project,
      jobId,
      amount: numAmount,
      date,
      dueDate,
      payableStatus: "pending_admin_approval",
      paymentStatus: "Pending",
      category,
      route: !isVendor ? route : undefined,
      notes: notes.trim(),
      documentUrl: selectedFile
        ? URL.createObjectURL(selectedFile)
        : "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    };

    onSuccess(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1D51A4]/10 text-[#1D51A4] flex items-center justify-center">
              {isVendor ? (
                <Building2 className="w-5 h-5" />
              ) : (
                <Truck className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500">
                Record new accounts payable for approval & payout
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Row 1: Payee & Invoice Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {isVendor ? "Select Vendor" : "Select Freight Carrier"}{" "}
                <span className="text-rose-500">*</span>
              </label>
              {isVendor ? (
                <select
                  value={payeeName}
                  onChange={(e) => setPayeeName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#1D51A4]"
                >
                  {DEFAULT_VENDORS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={payeeName}
                  onChange={(e) => handleCarrierChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#1D51A4]"
                >
                  {DEFAULT_CARRIERS.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Invoice Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. VND-4091"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#1D51A4]"
              />
            </div>
          </div>

          {/* Row 2: Project & Job ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Project Allocation <span className="text-rose-500">*</span>
              </label>
              <select
                value={project}
                onChange={(e) => handleProjectChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#1D51A4]"
              >
                {DEFAULT_PROJECTS.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Job ID / Delivery Reference
              </label>
              <input
                type="text"
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#1D51A4]"
              />
            </div>
          </div>

          {/* Row 3: Total Amount & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Total Amount ($) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-semibold">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#1D51A4]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder={isVendor ? "Raw Materials / Steel" : "Logistics / Fuel"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#1D51A4]"
              />
            </div>
          </div>

          {/* Row 4: Invoice Date & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Invoice Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#1D51A4]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Due Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#1D51A4]"
              />
            </div>
          </div>

          {/* If Freight, allow Route entry */}
          {!isVendor && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Route / Transit Details
              </label>
              <input
                type="text"
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                placeholder="e.g. Dallas -> Fort Worth"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#1D51A4]"
              />
            </div>
          )}

          {/* File Upload Dropzone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Attach Invoice Document (PDF / Scan)
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center hover:border-[#1D51A4] hover:bg-slate-50/50 transition-colors cursor-pointer"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-slate-800">
                  {selectedFile ? selectedFile.name : "Click or drag & drop invoice file"}
                </div>
                <p className="text-[11px] text-slate-400">PDF, PNG, JPG up to 10MB</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Internal Notes / Remittance Reference
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add PO notes or approval instructions..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#1D51A4] resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#1D51A4] hover:bg-[#163e7c] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Submit for Approval</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ManualPayableUploadDialog;
