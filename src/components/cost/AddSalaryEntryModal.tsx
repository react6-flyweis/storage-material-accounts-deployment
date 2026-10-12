import React, { useState } from "react";
import { X, DollarSign, User, CheckCircle } from "lucide-react";

export interface SalaryEntry {
  id: string;
  empId: string;
  name: string;
  designation: string;
  avatar: string;
  basicSalary: number;
  deductions: number;
  netSalary: number;
  status: "Paid" | "Unpaid";
  adminApproval: "Approved" | "Pending" | "Rejected";
  date: string;
}

interface AddSalaryEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: SalaryEntry) => void;
  nextEmpId: string;
}

export const AddSalaryEntryModal: React.FC<AddSalaryEntryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  nextEmpId,
}) => {
  const [empId, setEmpId] = useState(nextEmpId);
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("Finance");
  const [basicSalary, setBasicSalary] = useState<number | "">("");
  const [deductions, setDeductions] = useState<number | "">(1000);
  const [status, setStatus] = useState<"Paid" | "Unpaid">("Paid");
  const [adminApproval, setAdminApproval] = useState<"Approved" | "Pending">("Approved");
  const [date, setDate] = useState(() => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    return `${dd} / ${mm} / ${yyyy}`;
  });

  if (!isOpen) return null;

  const basicNum = Number(basicSalary) || 0;
  const dedNum = Number(deductions) || 0;
  const netNum = Math.max(0, basicNum - dedNum);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newEntry: SalaryEntry = {
      id: String(Date.now()),
      empId: empId.trim() || nextEmpId,
      name: name.trim(),
      designation,
      avatar: `https://images.unsplash.com/photo-${1534528741775 + (Math.floor(Math.random() * 100))}?w=100&auto=format&fit=crop&q=80`,
      basicSalary: basicNum,
      deductions: dedNum,
      netSalary: netNum > 0 ? netNum : basicNum,
      status,
      adminApproval,
      date,
    };

    onSubmit(newEntry);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1D51A4]/10 text-[#1D51A4] flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Add Salary Entry</h3>
              <p className="text-xs text-slate-500">Record a new employee payroll transaction</p>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Employee ID
              </label>
              <input
                type="text"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                placeholder="Emp-011"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#1D51A4] focus:ring-1 focus:ring-[#1D51A4]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Designation / Dept
              </label>
              <div className="relative">
                <select
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#1D51A4]"
                >
                  <option value="Finance">Finance</option>
                  <option value="Production">Production</option>
                  <option value="Executive Officer">Executive Officer</option>
                  <option value="Manager">Manager</option>
                  <option value="Executive">Executive</option>
                  <option value="Engineering">Engineering</option>
                  <option value="HR">HR</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Employee Name *
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#1D51A4] focus:ring-1 focus:ring-[#1D51A4]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Basic Salary ($) *
              </label>
              <input
                type="number"
                required
                value={basicSalary}
                onChange={(e) => setBasicSalary(e.target.value ? Number(e.target.value) : "")}
                placeholder="40000"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#1D51A4]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Deductions ($)
              </label>
              <input
                type="number"
                value={deductions}
                onChange={(e) => setDeductions(e.target.value ? Number(e.target.value) : "")}
                placeholder="1000"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#1D51A4]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Net Salary ($)
              </label>
              <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800">
                ${netNum > 0 ? netNum : basicNum}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "Paid" | "Unpaid")}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#1D51A4]"
              >
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admin Approval
              </label>
              <select
                value={adminApproval}
                onChange={(e) => setAdminApproval(e.target.value as "Approved" | "Pending")}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#1D51A4]"
              >
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="14 / 01 / 2024"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#1D51A4]"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#1D51A4] hover:bg-[#163e7c] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Save Salary Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSalaryEntryModal;
