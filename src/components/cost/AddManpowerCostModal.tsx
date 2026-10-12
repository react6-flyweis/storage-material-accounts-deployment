import React, { useState } from "react";
import { X, User, DollarSign, Briefcase, Clock, Calendar, Building2 } from "lucide-react";

export interface ManpowerCostEntry {
  id: string;
  date: string;
  name: string;
  designation: string;
  avatar: string;
  project: string;
  hours: number;
  otHours: number;
  ratePerHour: number;
  totalCost: number;
  status: "Paid" | "Unpaid";
}

interface AddManpowerCostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: ManpowerCostEntry) => void;
  initialData?: ManpowerCostEntry | null;
}

const DESIGNATIONS = ["Loading", "Labor", "Supervisor", "Operator", "Technician"];
const PROJECTS = [
  "SMDT Warehouse",
  "Steel Unit",
  "Industrial Shed",
  "Warehouse Expansion",
  "Factory Complex",
];

export const AddManpowerCostModal: React.FC<AddManpowerCostModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  if (!isOpen) return null;

  return (
    <AddManpowerCostForm
      onClose={onClose}
      onSubmit={onSubmit}
      initialData={initialData}
    />
  );
};

const AddManpowerCostForm: React.FC<{
  onClose: () => void;
  onSubmit: (entry: ManpowerCostEntry) => void;
  initialData?: ManpowerCostEntry | null;
}> = ({ onClose, onSubmit, initialData }) => {
  const [name, setName] = useState(initialData?.name || "");
  const [designation, setDesignation] = useState(initialData?.designation || "Loading");
  const [project, setProject] = useState(initialData?.project || "SMDT Warehouse");
  const [date, setDate] = useState(initialData?.date || "20 Jun");
  const [hours, setHours] = useState<number | "">(initialData ? initialData.hours : 8);
  const [otHours, setOtHours] = useState<number | "">(initialData ? initialData.otHours : 2);
  const [ratePerHour, setRatePerHour] = useState<number | "">(initialData ? initialData.ratePerHour : 120);
  const [status, setStatus] = useState<"Paid" | "Unpaid">(initialData?.status || "Unpaid");

  const h = Number(hours) || 0;
  const ot = Number(otHours) || 0;
  const rate = Number(ratePerHour) || 0;
  const calculatedTotal = (h + ot) * rate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const entry: ManpowerCostEntry = {
      id: initialData?.id || String(Date.now()),
      name: name.trim(),
      designation,
      project,
      date,
      hours: h,
      otHours: ot,
      ratePerHour: rate,
      totalCost: calculatedTotal > 0 ? calculatedTotal : 1440,
      status,
      avatar:
        initialData?.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          name.trim()
        )}&background=1D51A4&color=fff&size=100`,
    };

    onSubmit(entry);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1D51A4]/10 text-[#1D51A4] flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {initialData ? "Edit Manpower Cost" : "Add Manpower Cost"}
              </h3>
              <p className="text-xs text-slate-500">
                {initialData ? "Update workforce cost record" : "Record labor expense & project allocation"}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Worker Name & Designation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Employee / Worker Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Linda Ray"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1D51A4]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Designation
              </label>
              <select
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#1D51A4] bg-white cursor-pointer"
              >
                {DESIGNATIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Project & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Project
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#1D51A4] bg-white cursor-pointer"
                >
                  {PROJECTS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. 20 Jun"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#1D51A4]"
                />
              </div>
            </div>
          </div>

          {/* Hours, OT Hours, Rate/Hr */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Hours
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="0"
                  value={hours}
                  onChange={(e) => setHours(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full pl-8 pr-2 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#1D51A4]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                OT Hours
              </label>
              <input
                type="number"
                min="0"
                value={otHours}
                onChange={(e) => setOtHours(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#1D51A4]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Rate / Hr ($)
              </label>
              <div className="relative">
                <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="0"
                  value={ratePerHour}
                  onChange={(e) => setRatePerHour(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full pl-7 pr-2 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#1D51A4]"
                />
              </div>
            </div>
          </div>

          {/* Status & Total Calculation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Payment Status
              </label>
              <div className="flex items-center gap-3 mt-1">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={status === "Paid"}
                    onChange={() => setStatus("Paid")}
                    className="accent-[#10B981]"
                  />
                  <span>Paid</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={status === "Unpaid"}
                    onChange={() => setStatus("Unpaid")}
                    className="accent-[#EF4444]"
                  />
                  <span>Unpaid</span>
                </label>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Estimated Total:</span>
              <span className="text-sm font-extrabold text-slate-900">
                ${calculatedTotal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#1D51A4] hover:bg-[#163e7c] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              {initialData ? "Save Changes" : "Add Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddManpowerCostModal;
