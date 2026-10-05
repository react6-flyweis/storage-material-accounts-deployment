import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = {
  label: string;
  value: string;
};

type SearchableSelectProps = {
  label?: string;
  placeholder?: string;
  options: Option[];
  value?: Option | null | any;
  onChange: any;
  className?: string;
  inputClassName?: string;
};

export default function SearchableSelect({
  label = "Vendor",
  placeholder = "Search...",
  options,
  value,
  onChange,
  className,
  inputClassName = "py-3",
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className={cn("w-full max-w-full pb-1", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`w-full px-4 bg-white border border-gray-200 rounded-lg flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${inputClassName}`}
      >
        <span className="text-gray-800 truncate">{value?.label ?? label}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden absolute z-10 w-full">
          {/* Search */}
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Options */}
          <ul className="max-h-49 overflow-y-auto py-1">
            {filteredOptions.length ? (
              filteredOptions.map((opt) => (
                <li
                  key={opt.value}
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "px-4 py-2 cursor-pointer text-sm",
                    value?.value === opt.value
                      ? "bg-gray-100 font-medium"
                      : "hover:bg-gray-50"
                  )}
                >
                  {opt.label}
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-sm text-gray-400">
                No results found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
