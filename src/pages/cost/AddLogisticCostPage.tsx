import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import SuccessModal from "@/components/common_components/SuccessModal";
import CalendarRangePickerModal from "@/components/common_components/CalendarRangePickerModal";

const DELIVERY_IDS = [
  "DEL-0012",
  "DEL-1234",
  "DEL-1235",
  "DEL-1236",
  "DEL-1237",
  "DEL-1238",
  "DEL-1239",
  "DEL-1240",
];

const PROJECTS = [
  "ABC Logistic Warehouse",
  "SMDT Warehouse",
  "Steel Unit",
  "Industrial Shed",
  "Warehouse Expansion",
];

const PAYMENT_STATUSES = ["Paid", "Pending", "Unpaid"] as const;

export const AddLogisticCostPage: React.FC = () => {
  const navigate = useNavigate();

  // Form states matching user's image 1 precisely:
  // Title: Add Miscellaneous Cost (or Add Logistic Cost with same structure)
  // Section: Basic Details
  // Enter Delivery ID *: DEL-0012 (dropdown)
  // Date *: 12 Aug 2026 (calendar icon button)
  // Project (Auto-Fill): ABC Logistic Warehouse (dropdown)
  // Delivery ID (Auto-Fill) *: Machine Repair (input text)
  // Final Amount *: $4,500 (input text / currency)
  // Payment Status *: Paid (dropdown)
  // Delivery Company (Auto-Fill) *: ABC Logistics (read-only / auto-fill input)
  // Bottom buttons: Cancel (left) and Submit for Approval (purple button on right)

  const [deliveryId, setDeliveryId] = useState("DEL-0012");
  const [date, setDate] = useState("12 Aug 2026");
  const [project, setProject] = useState("ABC Logistic Warehouse");
  const [autoFillDeliveryId, setAutoFillDeliveryId] = useState("Machine Repair");
  const [finalAmount, setFinalAmount] = useState("$4,500");
  const [paymentStatus, setPaymentStatus] = useState<"Paid" | "Pending" | "Unpaid">("Paid");
  const [deliveryCompany, setDeliveryCompany] = useState("ABC Logistics");

  // Dropdown states
  const [isDeliveryIdOpen, setIsDeliveryIdOpen] = useState(false);
  const [isProjectOpen, setIsProjectOpen] = useState(false);
  const [isPaymentStatusOpen, setIsPaymentStatusOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const deliveryIdRef = useRef<HTMLDivElement>(null);
  const projectRef = useRef<HTMLDivElement>(null);
  const paymentStatusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (deliveryIdRef.current && !deliveryIdRef.current.contains(event.target as Node)) {
        setIsDeliveryIdOpen(false);
      }
      if (projectRef.current && !projectRef.current.contains(event.target as Node)) {
        setIsProjectOpen(false);
      }
      if (paymentStatusRef.current && !paymentStatusRef.current.contains(event.target as Node)) {
        setIsPaymentStatusOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDeliveryIdSelect = (id: string) => {
    setDeliveryId(id);
    setIsDeliveryIdOpen(false);
    // Auto fill defaults if selecting another delivery id
    if (id === "DEL-0012") {
      setProject("ABC Logistic Warehouse");
      setAutoFillDeliveryId("Machine Repair");
      setFinalAmount("$4,500");
      setDeliveryCompany("ABC Logistics");
    } else {
      setProject("SMDT Warehouse");
      setAutoFillDeliveryId(id);
      setDeliveryCompany("Fulltruck Logistics");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryId.trim() || !finalAmount.trim()) return;

    // Clean amount
    const numericAmount = Number(finalAmount.replace(/[^0-9.]/g, "")) || 4500;

    try {
      const stored = localStorage.getItem("custom_logistic_records");
      const currentList = stored ? JSON.parse(stored) : [];
      const newRecord = {
        id: `log-${Date.now()}`,
        deliveryId,
        deliveryCompany,
        project,
        finalAmount: numericAmount,
        finalAmountFormatted: finalAmount.startsWith("$") ? finalAmount : `$${numericAmount.toLocaleString()}`,
        date,
        approvalStatus: "Pending",
        carrier: deliveryCompany,
        paymentStatus,
      };
      localStorage.setItem("custom_logistic_records", JSON.stringify([newRecord, ...currentList]));
    } catch {
      // ignore
    }

    setIsSuccessOpen(true);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header / Back Button - matches image: ArrowLeft followed by Add Miscellaneous Cost */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => navigate("/cost/logistics-cost")}
          className="flex items-center gap-3 text-slate-900 hover:text-slate-950 font-bold text-xl sm:text-2xl transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-5 h-5 text-slate-800 group-hover:-translate-x-0.5 transition-transform stroke-[2.2]" />
          <span>Add Miscellaneous Cost</span>
        </button>
      </div>

      {/* Main Form Card matching image 1 precisely */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 sm:p-8">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-6">
          Basic Details
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1: Enter Delivery ID * & Date * */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {/* Enter Delivery ID * (Dropdown) */}
            <div className="relative" ref={deliveryIdRef}>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 mb-2">
                Enter Delivery ID <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsDeliveryIdOpen(!isDeliveryIdOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 hover:border-slate-300 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                <span>{deliveryId}</span>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>

              {isDeliveryIdOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95 max-h-48 overflow-y-auto">
                  {DELIVERY_IDS.map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleDeliveryIdSelect(id)}
                      className="w-full px-4 py-2 text-left text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium flex items-center justify-between cursor-pointer"
                    >
                      <span>{id}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date * */}
            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 mb-2">
                Date <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsDatePickerOpen(true)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 hover:border-slate-300 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                <span>{date}</span>
                <CalendarIcon className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>

          {/* Row 2: Project (Auto-Fill) & Delivery ID (Auto-Fill) * */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {/* Project (Auto-Fill) (Dropdown) */}
            <div className="relative" ref={projectRef}>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 mb-2">
                Project (Auto-Fill)
              </label>
              <button
                type="button"
                onClick={() => setIsProjectOpen(!isProjectOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 hover:border-slate-300 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                <span>{project}</span>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>

              {isProjectOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95">
                  {PROJECTS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setProject(p);
                        setIsProjectOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium flex items-center justify-between cursor-pointer"
                    >
                      <span>{p}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Delivery ID (Auto-Fill) * */}
            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 mb-2">
                Delivery ID (Auto-Fill) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={autoFillDeliveryId}
                onChange={(e) => setAutoFillDeliveryId(e.target.value)}
                placeholder="Machine Repair"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors bg-white"
              />
            </div>
          </div>

          {/* Row 3: Final Amount * & Payment Status * */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {/* Final Amount * */}
            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 mb-2">
                Final Amount <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={finalAmount}
                onChange={(e) => setFinalAmount(e.target.value)}
                placeholder="$4,500"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors bg-white"
              />
            </div>

            {/* Payment Status * (Dropdown) */}
            <div className="relative" ref={paymentStatusRef}>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 mb-2">
                Payment Status <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsPaymentStatusOpen(!isPaymentStatusOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 hover:border-slate-300 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                <span>{paymentStatus}</span>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>

              {isPaymentStatusOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95">
                  {PAYMENT_STATUSES.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => {
                        setPaymentStatus(status);
                        setIsPaymentStatusOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium cursor-pointer"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Row 4: Delivery Company (Auto-Fill) * */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 mb-2">
                Delivery Company (Auto-Fill) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={deliveryCompany}
                onChange={(e) => setDeliveryCompany(e.target.value)}
                placeholder="ABC Logistics"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors bg-white"
              />
            </div>
          </div>

          {/* Form Bottom Actions matching screenshot 1 */}
          <div className="flex items-center justify-between pt-8 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={() => navigate("/cost/logistics-cost")}
              className="px-6 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer bg-white shadow-2xs"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-[#635BFF] hover:bg-[#5248EE] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all cursor-pointer active:scale-98"
            >
              Submit for Approval
            </button>
          </div>
        </form>
      </div>

      {/* Date Picker Modal */}
      <CalendarRangePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onSelectRange={(rangeStr) => {
          setDate(rangeStr);
          setIsDatePickerOpen(false);
        }}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => {
          setIsSuccessOpen(false);
          navigate("/cost/logistics-cost");
        }}
        title="Logistic Cost Submitted!"
        subTitle="The logistics delivery cost has been successfully submitted for approval."
      />
    </div>
  );
};

export default AddLogisticCostPage;
