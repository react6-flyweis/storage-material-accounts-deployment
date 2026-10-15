import { Button } from "@/components/ui/button";
import type { ProjectOverview } from "@/redux/api/projectApi";

interface MaterialDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  overview?: ProjectOverview;
}

export function MaterialDeliveryModal({
  isOpen,
  onClose,
  overview,
}: MaterialDeliveryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">
            Material Delivery
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm font-semibold cursor-pointer"
          >
            ✕
          </button>
        </div>
        <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
          <p>
            Project:{" "}
            <strong className="text-slate-900">
              {overview?.projectName || "—"}
            </strong>
          </p>
          <p>
            Job / Project ID:{" "}
            <span className="font-mono text-slate-800">
              {overview?.jobId || overview?.projectId || "—"}
            </span>
          </p>
          <p>
            Current Status:{" "}
            <span className="font-semibold text-slate-800">
              {overview?.statusLabel || overview?.status || "—"}
            </span>
          </p>
          <p className="text-slate-500 pt-1">
            Material delivery tracking is linked to project milestones.
          </p>
        </div>
        <div className="pt-2 flex justify-end">
          <Button
            size="sm"
            onClick={onClose}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs cursor-pointer"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
