import React from "react";
import { Search } from "lucide-react";

interface HeaderSearchProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export const HeaderSearch: React.FC<HeaderSearchProps> = ({
  placeholder = "Search by equipment name...",
  value,
  onChange,
  className = "",
}) => {
  return (
    <div
      className={`hidden md:flex items-center bg-[#F8F9FA] rounded-md px-4 xl:py-2 py-1.5 flex-1 max-w-sm border border-[#9CA3AF] focus-within:border-[#9CA3AF] focus-within:ring-2 focus-within:ring-blue-100 transition-all ${className}`}
    >
      <Search className="w-5 h-5 text-[#9CA3AF] mr-2 shrink-0" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400"
      />
    </div>
  );
};

export default HeaderSearch;
