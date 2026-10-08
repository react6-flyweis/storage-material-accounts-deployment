import React from "react";
import { X, CheckCircle, Clock, AlertCircle } from "lucide-react";

export interface ProjectIncomeRow {
  id: string;
  projectName: string;
  totalIncome: string;
  totalIncomeNum: number;
  receivedIncome: string;
  receivedIncomeNum: number;
  pendingIncome: string;
  pendingIncomeNum: number;
  overdueIncome: string;
  overdueIncomeNum: number;
  receivedPercentage: number;
}

interface ProjectIncomeDetailModalProps {
  project: ProjectIncomeRow | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectIncomeDetailModal: React.FC<ProjectIncomeDetailModalProps> = ({
  project,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {project.projectName}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Project Financial Income Details
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Progress Overview Card */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-slate-700">
                Collection Progress
              </span>
              <span className="font-bold text-[#10B981] text-sm">
                {project.receivedPercentage}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#10B981] rounded-full transition-all duration-500"
                style={{ width: `${project.receivedPercentage}%` }}
              />
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/40">
              <span className="text-xs text-slate-500">Total Income</span>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {project.totalIncome}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/40">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Received
              </span>
              <div className="text-base font-bold text-emerald-600 mt-0.5">
                {project.receivedIncome}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-amber-100 bg-amber-50/40">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Pending
              </span>
              <div className="text-base font-bold text-amber-600 mt-0.5">
                {project.pendingIncome}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-purple-100 bg-purple-50/40">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-purple-600" />
                Overdue
              </span>
              <div className="text-base font-bold text-purple-600 mt-0.5">
                {project.overdueIncome}
              </div>
            </div>
          </div>

          {/* Milestone Details */}
          <div className="border border-slate-100 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Payment Milestones
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Phase 1: Mobilization Advance</span>
                <span className="font-semibold text-emerald-600">Paid ($50,00,000)</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Phase 2: Material Delivery</span>
                <span className="font-semibold text-emerald-600">Paid ($55,50,000)</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Phase 3: Erection & Installation</span>
                <span className="font-semibold text-amber-600">Pending ($25,00,000)</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Phase 4: Final Handover Retention</span>
                <span className="font-semibold text-slate-400">Scheduled ($7,00,000)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50/30">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectIncomeDetailModal;
