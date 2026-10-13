import React from "react";
import { NAV_ITEMS } from "@/config/navigation.config";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useAppSelector } from "@/redux/hooks";

interface SidePanelProps {
  isOpen: boolean;
  activeTab: number;
  activeSubTab: string;
  onSubTabClick: (label: string, path: string) => void;
  onClose?: () => void;
}

const SidePanel: React.FC<SidePanelProps> = ({
  isOpen,
  activeTab,
  activeSubTab,
  onSubTabClick,
  onClose,
}) => {
  const user = useAppSelector((state) => state.auth.user);
  const currentNav = NAV_ITEMS[activeTab];

  const headerBlockHeight = 120;
  const itemHeight = 76;
  const calculatedTop = activeTab * itemHeight;

  // Calculate approximate height of this tab's content
  const itemsCount = currentNav?.items?.length || 0;
  const contentHeight = 50 + itemsCount * 48;

  // Adjust top offset so content doesn't overflow below viewport on shorter screens
  const maxAllowedTop =
    typeof window !== "undefined"
      ? Math.max(
          10,
          window.innerHeight - headerBlockHeight - contentHeight - 40,
        )
      : calculatedTop;
  const adjustedMarginTop = Math.min(
    calculatedTop,
    Math.max(10, maxAllowedTop),
  );

  return (
    <div
      className={`
        w-56 h-screen 
        fixed left-14 md:left-16 lg:left-20 top-0 
        z-30
        flex flex-col 
        transition-all duration-300 ease-in-out
        overflow-y-auto thin-scrollbar
        shrink-0
        ${
          isOpen
            ? "translate-x-0 opacity-100 pointer-events-auto"
            : "-translate-x-full md:-translate-x-full opacity-0 pointer-events-none"
        }
        bg-[#E5ECFF] p-3 pt-6
      `}
    >
      <div className="flex flex-col fade-in duration-300">
        <div className="flex items-start justify-between mb-2">
          <div className="min-w-0 flex-1 pr-2">
            <h2 className="text-(--text-color-primary-blue) font-bold text-lg leading-tight mb-1 truncate">
              {"Account Panel"}
            </h2>
            <p className="text-black text-xs md:text-sm font-normal truncate">
              {user?.email || "Account@steelpro.com"}
            </p>
          </div>
          {/* Desktop collapse button */}
          <button
            onClick={onClose}
            className="hidden md:flex items-center justify-center p-1.5 hover:bg-white/80 rounded-lg text-gray-600 hover:text-gray-900 transition-colors border border-gray-200/60 shadow-xs cursor-pointer shrink-0"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="md:hidden p-1.5 hover:bg-white/80 rounded-lg text-gray-600 hover:text-gray-900 transition-colors cursor-pointer shrink-0"
            title="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
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
        style={{ marginTop: `${adjustedMarginTop}px` }}
      >
        {/* Title */}
        {currentNav?.title && (
          <button
            onClick={() => {
              if (currentNav.path) {
                onSubTabClick("", currentNav.path);
              } else if (currentNav.items?.length) {
                onSubTabClick(
                  currentNav.items[0].label,
                  currentNav.items[0].path,
                );
              }
            }}
            className={`w-full text-sm text-white rounded-lg md:py-3 py-2 font-medium shadow-sm mb-3 cursor-pointer transition-transform hover:scale-[1.01] ${currentNav.color}`}
          >
            {currentNav.title}
          </button>
        )}

        {/* Sub-items */}
        {currentNav?.items?.length ? (
          <div className="flex flex-col gap-2 fade-in pl-0">
            {currentNav.items.map((item) => {
              const isActive = activeSubTab === item.label;

              return (
                <button
                  key={item.label}
                  onClick={() => onSubTabClick(item.label, item.path)}
                  className={`w-full py-2.5 px-4 rounded-lg shadow-sm text-left text-sm transition-all duration-200 font-semibold cursor-pointer
                    ${
                      isActive
                        ? `${currentNav.color} text-white shadow-md scale-[1.01]`
                        : "bg-white text-gray-700 hover:bg-gray-50/90 hover:text-gray-900 border-2 border-transparent"
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
