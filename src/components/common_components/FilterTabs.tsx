type TabType = "today" | "week" | "month";

interface FilterTabsProps {
  activeTab: TabType;
  onChange: (tab: TabType) => void;
}

export default function FilterTabs({
  activeTab,
  onChange,
}: FilterTabsProps) {
  const getTabStyles = (tab: TabType): string => {
    const isActive = activeTab === tab;

    return `
      relative w-64 px-8 font-medium transition-all
      ${isActive ? "opacity-100" : "opacity-80 hover:opacity-100"}
    `;
  };

  return (
    <div className="relative flex h-10 bg-[#89D5DC] overflow-hidden">
      {/* Today */}
      <button
        type="button"
        onClick={() => onChange("today")}
        className={`${getTabStyles("today")} z-30 ${
          activeTab === "today" ? "bg-[#89D5DC] text-black" : "bg-[#89D5DC]/70 text-white"
        }`}
        style={{
          clipPath: "polygon(0 0, calc(100% - 30px) 0, 100% 100%, 0 100%)",
        }}
      >
        Today
      </button>

      {/* Week */}
      <button
        type="button"
        onClick={() => onChange("week")}
        className={`${getTabStyles("week")} -ml-6 z-20 ${
          activeTab === "week" ? "bg-[#6B93CE] text-black" : "bg-[#6B93CE]/70 text-white"
        }`}
        style={{
          clipPath: "polygon(30px 0, calc(100% - 30px) 0, 100% 100%, 0 100%)",
        }}
      >
        Week
      </button>

      {/* Month */}
      <button
        type="button"
        onClick={() => onChange("month")}
        className={`${getTabStyles("month")} -ml-6 z-10 ${
          activeTab === "month" ? "bg-[#4A72B7] text-black" : "bg-[#4A72B7]/70 text-white"
        }`}
        style={{
          clipPath: "polygon(30px 0, calc(100% - 30px) 0, 100% 100%, 0 100%)",
        }}
      >
        Month
      </button>
    </div>
  );
}
