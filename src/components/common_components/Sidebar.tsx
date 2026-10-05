import React from "react";
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
  return (
    <div
      className={`
            w-14 md:w-16 lg:w-20
            flex flex-col items-center
            h-screen
            fixed left-0 top-0
            z-40 bg-[#1D51A4]
            transition-transform duration-300 ease-in-out
            overflow-y-auto scrollbar-none
            ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}
    >
      <div className="mb-2 h-32 w-full "></div>

      <div className="flex flex-col w-full">
        {NAV_ITEMS.map((item, index) => (
          <div
            className="relative w-full h-19 flex items-center justify-end pr-3"
            key={index}
          >
            {activeTab === index && (
              <div className="absolute inset-y-0 right-0 h-full w-full z-10 pointer-events-none flex justify-end">
                <img
                  src={iconBg}
                  alt=""
                  className="h-full w-auto object-contain"
                />
              </div>
            )}

            <button
              onClick={() => setActiveTab(index)}
              className="relative z-20 p-0 flex justify-center items-center group focus:outline-none"
            >
              <div
                className={`w-10 h-10 p-1.5 rounded-full flex items-center justify-center transition-transform hover:scale-105 ${item.color} shadow-lg`}
              >
                <img
                  src={item.icon}
                  alt={item.title}
                  className="w-5.5 h-5.5 object-contain"
                />
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
