import React from "react";
import Modal from "../common_components/Modal";
import SearchableSelect from "../common_components/SearchableSelect";
import { vendors } from "@/data/mockData";

interface AddNewTaxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: () => void;
}

const AddNewTaxModal: React.FC<AddNewTaxModalProps> = ({ isOpen, onClose, onSubmit }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Tax"
      width="max-w-xl"
    >
      <form className="flex flex-col max-h-full">
        <div className="overflow-y-auto pr-2 max-h-[400px] scrollbar-thin scrollbar-thumb-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">State</label>
              <input
                type="text"
                placeholder="Enter State"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-gray-400 text-gray-700"
              />
            </div>
            <div className="relative">
              <SearchableSelect
                label="Filling Frequency"
                options={vendors}
                value={null}
                onChange={() => {}}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Due Date
              </label>
              <input
                type="date"
                placeholder="Honda"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-gray-400 text-gray-700"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Threshold / Parameters
              </label>
              <input
                type="text"
                placeholder="Enter"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-gray-400 text-gray-700"
              />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-full">
              <label className="text-sm font-medium text-gray-700">
                Website Link
              </label>
              <input
                type="text"
                placeholder="Enter"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-gray-400 text-gray-700"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-5 pt-6 border-t border-gray-100 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 rounded-xl bg-[#F0F0F0] text-[#1A1A1A] font-medium hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              className="px-10 py-3 rounded-xl bg-[#2563EB] text-white font-normal hover:bg-blue-700 transition-colors shadow-sm"
            >
              Add
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default AddNewTaxModal;
