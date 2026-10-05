import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Modal from "../common_components/Modal";

interface ItemListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (description: string) => void;
}

export default function ItemListModal({
  isOpen,
  onClose,
  onSelect,
}: ItemListModalProps) {
  const [view, setView] = useState<"list" | "add">("list");
  const [items, setItems] = useState<string[]>([
    "Roll-up doors & windows",
    "Trim & fasteners",
  ]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState("");

  const handleAddItem = () => {
    if (newItemName.trim()) {
      setItems([...items, newItemName.trim()]);
      setNewItemName("");
      setView("list");
    }
  };

  const handleDone = () => {
    if (selectedItem) {
      onSelect(selectedItem);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Item list"
      width="max-w-md"
      className="px-0"
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 min-h-[300px] flex flex-col">
          {view === "list" ? (
            <>
              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => setSelectedItem(item)}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        selectedItem === item
                          ? "border-blue-600"
                          : "border-gray-300 group-hover:border-blue-400"
                      }`}
                    >
                      {selectedItem === item && (
                        <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                      )}
                    </div>
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-center justify-between px-6 py-4">
                <button
                  onClick={() => setView("add")}
                  className="flex items-center gap-2 text-blue-600 text-sm font-medium hover:text-blue-700"
                >
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  Add Item
                </button>

                <Button
                  onClick={handleDone}
                  disabled={!selectedItem}
                  className="bg-[#2563EB] hover:bg-blue-700 text-white px-8"
                >
                  Done
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex-1 px-6 py-4">
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                  Item Name
                </label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Enter item name"
                  className="w-full max-w-md  border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  autoFocus
                />
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
                  onClick={handleAddItem}
                  className="bg-[#2563EB] hover:bg-blue-700 text-white px-6"
                  disabled={!newItemName.trim()}
                >
                  Done
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
