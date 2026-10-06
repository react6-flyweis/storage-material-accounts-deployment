import React from "react";
import { NAV_ITEMS } from "@/config/navigation.config";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SidePanelProps {
  isOpen: boolean;
  activeTab: number;
  activeSubTab: string;
  onSubTabClick: (label: string, path: string) => void;
}

const SidePanel: React.FC<SidePanelProps> = ({
  isOpen,
  activeTab,
  activeSubTab,
  onSubTabClick,
}) => {
  const itemHeight = 76;

  const currentNav = NAV_ITEMS[activeTab];

  return (
    <div
      className={`
        w-56 h-screen 
        fixed left-14 md:left-16 lg:left-20 top-0 
        z-40
        flex flex-col 
        transition-all duration-300 ease-in-out
        overflow-y-auto
        shrink-0
        ${isOpen ? "translate-x-0" : "-translate-x-[200%] md:translate-x-0"}
        bg-[#E5ECFF] p-3 pt-6
      `}
    >
      <div className="flex flex-col fade-in duration-300">
        <div className="mb-2">
          <h2 className="text-(--text-color-primary-blue) font-bold text-lg leading-tight mb-1">
            Account Panel
          </h2>
          <p className="text-black text-sm font-normal">Account@steelpro.com</p>
        </div>

        <div className="flex items-center justify-between rounded-md p-1 mb-6">
          <span className="md:text-sm text-black font-normal bg-[#D8DEEA] px-10 py-1">
            TODAY
          </span>
          <div className="flex">
            <button className="p-1 hover:bg-gray-300 rounded text-gray-500">
              <ChevronLeft />
            </button>
            <button className="p-1 hover:bg-gray-300 rounded text-gray-500">
              <ChevronRight />
            </button>
          </div>
        </div>
      </div>
      <div
        className="transition-all duration-300 ease-out px-1"
        style={{ marginTop: `${activeTab * itemHeight}px` }}
      >
        {/* Title */}
        <button
          onClick={() => {
            if (currentNav.items?.length) {
              onSubTabClick(
                currentNav.items[0].label,
                currentNav.items[0].path,
              );
            } else if (currentNav.path) {
              onSubTabClick("", currentNav.path);
            }
          }}
          className={`w-full text-sm text-white rounded-lg md:py-3 py-2 font-medium shadow-sm mb-3 cursor-pointer ${currentNav.color}`}
        >
          {currentNav.title}
        </button>

        {/* Sub-items */}
        {currentNav.items?.length ? (
          <div className="flex flex-col gap-2 fade-in pl-0">
            {currentNav.items.map((item) => {
              const isActive = activeSubTab === item.label;

              return (
                <button
                  key={item.label}
                  onClick={() => onSubTabClick(item.label, item.path)}
                  style={
                    isActive
                      ? {
                          borderColor: currentNav.color
                            .replace("bg-[", "")
                            .replace("]", ""),
                        }
                      : undefined
                  }
                  className={`w-full py-3 px-4 rounded-lg shadow-sm text-left text-sm transition-colors font-semibold
    ${
      isActive
        ? "border-2 bg-white text-gray-800"
        : "bg-white text-gray-600 hover:bg-gray-50 border-2 border-transparent"
    }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SidePanel;
