import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Modal from "../common_components/Modal";

export interface TaxRate {
  id: string;
  name: string;
  rate: number;
}

interface TaxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (tax: TaxRate | null) => void;
  currentTax?: TaxRate | null;
}

export default function TaxModal({
  isOpen,
  onClose,
  onSelect,
  currentTax,
}: TaxModalProps) {
  const [view, setView] = useState<"list" | "add">("list");

  const [taxes, setTaxes] = useState<TaxRate[]>([
    { id: "1", name: "Argyle", rate: 8.25 },
    { id: "2", name: "Sugar land", rate: 8.0 },
  ]);

  const [selectedTaxId, setSelectedTaxId] = useState<string | null>(
    currentTax?.id || null
  );

  // Add New Tax State
  const [newStateName, setNewStateName] = useState("");
  const [newTaxRate, setNewTaxRate] = useState("");

  const handleAddTax = () => {
    const rate = parseFloat(newTaxRate);
    if (newStateName.trim() && !isNaN(rate)) {
      const newTax: TaxRate = {
        id: Date.now().toString(),
        name: newStateName.trim(),
        rate: rate,
      };
      setTaxes([...taxes, newTax]);
      setNewStateName("");
      setNewTaxRate("");
      setView("list");
      setSelectedTaxId(newTax.id); // Auto select new tax
    }
  };

  const handleDone = () => {
    const tax = taxes.find((t) => t.id === selectedTaxId) || null;
    onSelect(tax);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={view === "list" ? "Tax" : "New Tax"}
      width="max-w-md"
      className="px-0"
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 min-h-[300px] flex flex-col">
          {view === "list" ? (
            <>
              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
                {taxes.map((tax) => (
                  <div
                    key={tax.id}
                    className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() =>
                      setSelectedTaxId(selectedTaxId === tax.id ? null : tax.id)
                    }
                  >
                    <div
                      className={`w-5 h-5 rounded hover:border-blue-400 border flex items-center justify-center transition-colors ${
                        selectedTaxId === tax.id
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {selectedTaxId === tax.id && (
                        <div className="w-2.5 h-2.5 bg-white rounded-sm" />
                      )}
                    </div>
                    <span className="text-sm text-gray-700">
                      {tax.name} ({tax.rate.toFixed(2)}%)
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 flex items-center justify-between border-t border-gray-300">
                <button
                  onClick={() => setView("add")}
                  className="flex items-center gap-2 text-blue-600 text-sm font-medium hover:text-blue-700"
                >
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  New Tax
                </button>

                <Button
                  onClick={handleDone}
                  className="bg-[#2563EB] hover:bg-blue-700 text-white px-8"
                >
                  Done
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex-1 space-y-4 px-6 py-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                    State Name
                  </label>
                  <input
                    type="text"
                    value={newStateName}
                    onChange={(e) => setNewStateName(e.target.value)}
                    placeholder="Enter"
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                    Tax Rate
                  </label>
                  <input
                    type="number"
                    value={newTaxRate}
                    onChange={(e) => setNewTaxRate(e.target.value)}
                    placeholder="Enter %"
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="mt-auto p-4 flex justify-end gap-3 border-t border-gray-300">
                <Button
                  variant="ghost"
                  onClick={() => setView("list")}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddTax}
                  className="bg-[#2563EB] hover:bg-blue-700 text-white px-6"
                  disabled={!newStateName.trim() || !newTaxRate}
                >
                  Add
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
