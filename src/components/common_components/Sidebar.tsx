import React, { useState } from "react";
import iconBg from "../../assets/sideBarIconBg.svg";
import { NAV_ITEMS } from "@/config/navigation.config";

interface SidebarProps {
  isOpen: boolean;
  activeTab: number;
  setActiveTab: (index: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  activeTab,
  setActiveTab,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  return (
    <>
      <div
        className={`
              w-14 md:w-16 lg:w-20
              h-screen
              fixed left-0 top-0
              z-50 bg-[#1D51A4]
              transition-transform duration-300 ease-in-out
              overflow-visible
              ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            `}
      >
        {/* Scroll wrapper with RTL direction to place custom scrollbar on the LEFT side */}
        <div
          style={{ scrollbarGutter: "stable", direction: "rtl" }}
          className="h-full pt-32 pb-8 flex flex-col items-center overflow-y-auto overflow-x-visible thin-scrollbar"
        >
          {/* Inner content with LTR direction */}
          <div
            style={{ direction: "ltr" }}
            className="w-full flex flex-col items-center"
          >
            {NAV_ITEMS.map((item, index) => (
              <div
                className="relative w-full h-16 flex items-center justify-end pr-3"
                key={index}
              >
                {activeTab === index && (
                  <div className="absolute top-1/2 -translate-y-1/2 right-0 h-19 w-full z-10 pointer-events-none flex justify-end">
                    <img
                      src={iconBg}
                      alt=""
                      className="h-full w-auto object-contain"
                    />
                  </div>
                )}

                <button
                  onClick={() => setActiveTab(index)}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredIndex(index);
                    setHoverPosition({
                      top: rect.top + rect.height / 2,
                      left: rect.left,
                    });
                  }}
                  onMouseLeave={() => {
                    setHoveredIndex(null);
                    setHoverPosition(null);
                  }}
                  className="relative z-20 p-0 flex justify-center items-center group focus:outline-none cursor-pointer"
                >
                  <div
                    className={`w-10 h-10 p-1.5 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-105 ${item.color} shadow-lg`}
                  >
                    <img
                      src={item.icon}
                      alt={item.title}
                      className="max-w-5.5 max-h-5.5 object-contain"
                    />
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Hover Label Pill with Icon */}
        {hoveredIndex !== null && hoverPosition && (
          <div
            className="fixed flex items-center bg-white rounded-full p-1 pr-6 pointer-events-none whitespace-nowrap shadow-[0_10px_25px_-5px_rgba(0,0,0,0.18),0_8px_10px_-6px_rgba(0,0,0,0.12)] z-50 -translate-y-1/2 animate-in fade-in duration-150"
            style={{ top: hoverPosition.top, left: hoverPosition.left - 4 }}
          >
            {/* Category Icon Circle inside the pill */}
            <div
              className={`w-10 h-10 p-1.5 rounded-full flex items-center justify-center ${NAV_ITEMS[hoveredIndex]?.color} shadow-sm shrink-0`}
            >
              <img
                src={NAV_ITEMS[hoveredIndex]?.icon}
                alt={NAV_ITEMS[hoveredIndex]?.title}
                className="w-5.5 h-5.5 object-contain"
              />
            </div>
            {/* Title Text */}
            <span className="ml-3 font-medium text-black text-sm lg:text-[15px] tracking-tight">
              {NAV_ITEMS[hoveredIndex]?.title}
            </span>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
