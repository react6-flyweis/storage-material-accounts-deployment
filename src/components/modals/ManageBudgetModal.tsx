import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useUpdateLeadBudgetMutation,
  type CustomBudgetLine,
  type BudgetVsActualCostHead,
} from "@/redux/api/financialApi";
import { formatCurrency } from "@/lib/dashboardFormatters";

interface ManageBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  projectName?: string;
  costHeads?: BudgetVsActualCostHead[];
  customBudgetLines?: CustomBudgetLine[];
  onSuccess?: () => void;
}

export default function ManageBudgetModal({
  isOpen,
  onClose,
  leadId,
  projectName,
  costHeads = [],
  customBudgetLines = [],
  onSuccess,
}: ManageBudgetModalProps) {
  // 5 Fixed Budget Fields
  const [materialBudget, setMaterialBudget] = useState<number>(0);
  const [logisticBudget, setLogisticBudget] = useState<number>(0);
  const [productionBudget, setProductionBudget] = useState<number>(0);
  const [shipperBudget, setShipperBudget] = useState<number>(0);
  const [otherCost, setOtherCost] = useState<number>(0);

  // Dynamic Custom Lines
  const [customLines, setCustomLines] = useState<
    Array<{ key: string; label: string; amount: number; expenseCategoriesStr: string }>
  >([]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [updateBudget, { isLoading: isSaving }] = useUpdateLeadBudgetMutation();

  // Populate initial values when modal opens or costHeads/customBudgetLines change
  useEffect(() => {
    if (!isOpen) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    // Map existing standard cost heads to fixed fields
    let mat = 0;
    let log = 0;
    let prod = 0;
    let ship = 0;
    let oth = 0;

    costHeads.forEach((ch) => {
      if (ch.isCustom) return;
      const cat = (ch.category || "").toLowerCase();
      const head = (ch.head || "").toLowerCase();
      if (cat.includes("material") || head.includes("material")) {
        mat = ch.budget || 0;
      } else if (cat.includes("logistic") || head.includes("logistic") || head.includes("carrier") || head.includes("freight")) {
        log = ch.budget || 0;
      } else if (cat.includes("production") || head.includes("production") || head.includes("manpower") || head.includes("labor")) {
        prod = ch.budget || 0;
      } else if (cat.includes("shipper") || head.includes("shipper")) {
        ship = ch.budget || 0;
      } else if (cat.includes("other") || head.includes("other") || head.includes("contingency") || head.includes("overhead") || head.includes("miscellaneous")) {
        oth += ch.budget || 0;
      }
    });

    setMaterialBudget(mat);
    setLogisticBudget(log);
    setProductionBudget(prod);
    setShipperBudget(ship);
    setOtherCost(oth);

    // Populate custom lines from raw customBudgetLines
    if (customBudgetLines && customBudgetLines.length > 0) {
      setCustomLines(
        customBudgetLines.map((line) => ({
          key: line.key,
          label: line.label,
          amount: line.amount,
          expenseCategoriesStr: (line.expenseCategories || []).join(", "),
        }))
      );
    } else {
      // Or extract from costHeads where isCustom is true
      const customHeads = costHeads.filter((ch) => ch.isCustom);
      if (customHeads.length > 0) {
        setCustomLines(
          customHeads.map((ch, idx) => ({
            key: `custom-${idx + 1}`,
            label: ch.head || ch.category || `Custom Line ${idx + 1}`,
            amount: ch.budget || 0,
            expenseCategoriesStr: ch.category || "",
          }))
        );
      } else {
        setCustomLines([]);
      }
    }
  }, [isOpen, costHeads, customBudgetLines]);

  if (!isOpen) return null;

  const handleAddCustomLine = () => {
    const newKey = `custom-${Date.now()}`;
    setCustomLines((prev) => [
      ...prev,
      {
        key: newKey,
        label: "",
        amount: 0,
        expenseCategoriesStr: "",
      },
    ]);
  };

  const handleRemoveCustomLine = (index: number) => {
    setCustomLines((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleCustomLineChange = (
    index: number,
    field: "label" | "amount" | "expenseCategoriesStr",
    value: string | number
  ) => {
    setCustomLines((prev) =>
      prev.map((line, idx) => {
        if (idx !== index) return line;
        return {
          ...line,
          [field]: value,
        };
      })
    );
  };

  // Calculate live total budget
  const fixedTotal =
    (Number(materialBudget) || 0) +
    (Number(logisticBudget) || 0) +
    (Number(productionBudget) || 0) +
    (Number(shipperBudget) || 0) +
    (Number(otherCost) || 0);

  const customTotal = customLines.reduce(
    (acc, curr) => acc + (Number(curr.amount) || 0),
    0
  );

  const overallTotal = fixedTotal + customTotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!leadId) {
      setErrorMsg("Lead ID is missing.");
      return;
    }

    try {
      const formattedCustomLines = customLines
        .filter((cl) => cl.label.trim().length > 0 || cl.amount > 0)
        .map((cl, idx) => ({
          key: cl.key || `custom-${idx + 1}`,
          label: cl.label.trim() || `Custom Line ${idx + 1}`,
          amount: Number(cl.amount) || 0,
          expenseCategories: cl.expenseCategoriesStr
            ? cl.expenseCategoriesStr
                .split(",")
                .map((c) => c.trim().toLowerCase())
                .filter(Boolean)
            : undefined,
        }));

      await updateBudget({
        leadId,
        materialBudget: Number(materialBudget) || 0,
        logisticBudget: Number(logisticBudget) || 0,
        productionBudget: Number(productionBudget) || 0,
        shipperBudget: Number(shipperBudget) || 0,
        otherCost: Number(otherCost) || 0,
        customLines: formattedCustomLines,
      }).unwrap();

      setSuccessMsg("Budget updated successfully!");
      if (onSuccess) {
        onSuccess();
      }
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string }; message?: string };
      setErrorMsg(
        errorObj?.data?.message ||
          errorObj?.message ||
          "Failed to update project budget. Please try again."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Set Project Budget
            </h3>
            {projectName && (
              <p className="text-xs text-gray-500 mt-0.5">{projectName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 5 Fixed Budget Fields */}
          <div>
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Standard Budget Heads
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Material Budget (USD)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={materialBudget || ""}
                    onChange={(e) => setMaterialBudget(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Logistic Budget (USD)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={logisticBudget || ""}
                    onChange={(e) => setLogisticBudget(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Production Budget (USD)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={productionBudget || ""}
                    onChange={(e) => setProductionBudget(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Shipper Budget (USD)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={shipperBudget || ""}
                    onChange={(e) => setShipperBudget(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Other Cost (USD)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={otherCost || ""}
                    onChange={(e) => setOtherCost(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Custom Lines */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Custom Budget Lines
                </h4>
                <p className="text-[11px] text-gray-400">
                  Add dynamic budget categories with matching expense categories
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCustomLine}
                className="text-xs h-7 gap-1 border-dashed border-gray-300 text-blue-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Line
              </Button>
            </div>

            {customLines.length === 0 ? (
              <div className="text-center py-4 bg-gray-50/50 rounded-lg border border-dashed border-gray-200 text-xs text-gray-400">
                No custom budget lines added yet.
              </div>
            ) : (
              <div className="space-y-3">
                {customLines.map((line, idx) => (
                  <div
                    key={line.key || idx}
                    className="p-3 bg-gray-50/70 border border-gray-200 rounded-xl space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-gray-600">
                        Line #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomLine(idx)}
                        className="text-gray-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                        title="Remove custom line"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                      <div className="sm:col-span-5">
                        <label className="block text-[11px] font-medium text-gray-600 mb-0.5">
                          Label
                        </label>
                        <input
                          type="text"
                          value={line.label}
                          onChange={(e) =>
                            handleCustomLineChange(idx, "label", e.target.value)
                          }
                          placeholder="e.g. Permits & fees"
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-medium text-gray-600 mb-0.5">
                          Amount (USD)
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-gray-400 text-xs">
                            $
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={line.amount || ""}
                            onChange={(e) =>
                              handleCustomLineChange(
                                idx,
                                "amount",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            placeholder="0.00"
                            className="w-full pl-5 pr-2 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block text-[11px] font-medium text-gray-600 mb-0.5">
                          Expense Categories
                        </label>
                        <input
                          type="text"
                          value={line.expenseCategoriesStr}
                          onChange={(e) =>
                            handleCustomLineChange(
                              idx,
                              "expenseCategoriesStr",
                              e.target.value
                            )
                          }
                          placeholder="permits, inspection"
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total Budget Summary Box */}
          <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-gray-500 block">Calculated Total Budget</span>
              <span className="text-xs text-gray-600">
                Fixed ({formatCurrency(fixedTotal)}) + Custom ({formatCurrency(customTotal)})
              </span>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-blue-700">
                {formatCurrency(overallTotal)}
              </span>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="text-xs h-9 px-4 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="text-xs h-9 px-5 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer flex items-center gap-1.5"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Budget"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
