import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, X, Users, FolderKanban } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  useGetCustomersQuery,
  type CustomerListItem,
} from "@/redux/api/customerApi";
import {
  useGetAccountProjectsQuery,
  type AccountProjectListItem,
} from "@/redux/api/projectApi";
import { getStatusBadgeClasses } from "@/modules/customers/customer-utils";
import { cn } from "@/lib/utils";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export interface HeaderSearchProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export const HeaderSearch: React.FC<HeaderSearchProps> = ({
  placeholder = "Search customers, projects...",
  value: propValue,
  onChange: propOnChange,
  className = "",
}) => {
  const [internalSearch, setInternalSearch] = useState("");
  const isControlled = propValue !== undefined;
  const currentSearch = isControlled ? propValue : internalSearch;

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const debouncedSearch = useDebounce(currentSearch, 300);

  const trimmedSearch = debouncedSearch.trim();
  const shouldSkip = !trimmedSearch;

  const {
    data: customersData,
    isLoading: isCustomersLoading,
    isFetching: isCustomersFetching,
  } = useGetCustomersQuery(
    { search: trimmedSearch, page: 1, limit: 5 },
    { skip: shouldSkip },
  );

  const {
    data: projectsData,
    isLoading: isProjectsLoading,
    isFetching: isProjectsFetching,
  } = useGetAccountProjectsQuery(
    { search: trimmedSearch, page: 1, limit: 5 },
    { skip: shouldSkip },
  );

  const customers = customersData?.customers ?? [];
  const projects = projectsData?.projects ?? [];

  const isDebouncing = currentSearch.trim() !== debouncedSearch.trim();
  const isLoading =
    (isCustomersLoading ||
      isProjectsLoading ||
      isCustomersFetching ||
      isProjectsFetching) &&
    !shouldSkip;
  const showLoading =
    (isLoading || isDebouncing) && Boolean(currentSearch.trim());

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectCustomer = (customer: CustomerListItem) => {
    setIsOpen(false);
    if (!isControlled) {
      setInternalSearch("");
    } else if (propOnChange) {
      const syntheticEvent = {
        target: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>;
      propOnChange(syntheticEvent);
    }
    const id = customer._id || customer.customerId;
    navigate(`/customers/${id}`);
  };

  const handleSelectProject = (project: AccountProjectListItem) => {
    setIsOpen(false);
    if (!isControlled) {
      setInternalSearch("");
    } else if (propOnChange) {
      const syntheticEvent = {
        target: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>;
      propOnChange(syntheticEvent);
    }
    const id = project.leadId;
    navigate(`/customers/projects/${id}`);
  };

  const handleClear = () => {
    if (!isControlled) {
      setInternalSearch("");
    }
    if (propOnChange) {
      const syntheticEvent = {
        target: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>;
      propOnChange(syntheticEvent);
    }
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalSearch(e.target.value);
    }
    propOnChange?.(e);
    if (e.target.value.trim()) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleInputFocus = () => {
    if (currentSearch.trim()) {
      setIsOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Enter" && isOpen) {
      if (customers.length > 0) {
        handleSelectCustomer(customers[0]);
      } else if (projects.length > 0) {
        handleSelectProject(projects[0]);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative hidden md:block flex-1 max-w-sm lg:max-w-md",
        className,
      )}
    >
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <Input
          type="text"
          value={currentSearch}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-9 pr-8 bg-[#F8F9FA] border-gray-200 text-sm focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-blue-100 focus-visible:border-[#9CA3AF] transition-colors rounded-md h-9 w-full"
        />
        {currentSearch && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            title="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {isOpen && currentSearch.trim() && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden min-w-[300px]">
          {showLoading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-xs text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              <span>Searching customers & projects...</span>
            </div>
          ) : customers.length === 0 && projects.length === 0 ? (
            <div className="py-6 text-center text-xs text-gray-500">
              No results found
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
              {customers.length > 0 && (
                <div>
                  <div className="px-3.5 py-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/90 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 backdrop-blur-xs">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      <span>Customers</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-normal">
                      {customers.length}
                    </span>
                  </div>
                  <ul className="divide-y divide-gray-50">
                    {customers.map((customer) => (
                      <li key={customer._id || customer.customerId}>
                        <button
                          type="button"
                          onClick={() => handleSelectCustomer(customer)}
                          className="w-full text-left px-3.5 py-2.5 hover:bg-gray-50 transition-colors flex flex-col gap-1 group cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-sm text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                              {customer.customerName || "Unnamed Customer"}
                            </span>
                            {customer.status && (
                              <span
                                className={cn(
                                  "text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 border",
                                  getStatusBadgeClasses(customer.status),
                                )}
                              >
                                {customer.status}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            {customer.email && (
                              <span className="truncate max-w-[160px] sm:max-w-[200px]">
                                {customer.email}
                              </span>
                            )}
                            {customer.email && customer.phone && (
                              <span className="text-gray-300">•</span>
                            )}
                            {customer.phone && (
                              <span className="shrink-0">{customer.phone}</span>
                            )}
                            {customer.totalProjects !== undefined && (
                              <>
                                {(customer.email || customer.phone) && (
                                  <span className="text-gray-300">•</span>
                                )}
                                <span className="shrink-0">
                                  {customer.totalProjects}{" "}
                                  {customer.totalProjects === 1
                                    ? "project"
                                    : "projects"}
                                </span>
                              </>
                            )}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {projects.length > 0 && (
                <div>
                  <div className="px-3.5 py-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/90 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 backdrop-blur-xs">
                    <div className="flex items-center gap-1.5">
                      <FolderKanban className="w-3.5 h-3.5 text-gray-400" />
                      <span>Projects</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-normal">
                      {projects.length}
                    </span>
                  </div>
                  <ul className="divide-y divide-gray-50">
                    {projects.map((project) => {
                      const id =
                        (project as { _id?: string })._id || project.projectId;
                      const statusToDisplay =
                        project.lifecycleStatus || project.status;
                      const jobOrProjectId = project.jobId || project.projectId;

                      return (
                        <li key={id || project.leadId}>
                          <button
                            type="button"
                            onClick={() => handleSelectProject(project)}
                            className="w-full text-left px-3.5 py-2.5 hover:bg-gray-50 transition-colors flex flex-col gap-1 group cursor-pointer"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium text-sm text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                {project.projectName || "Unnamed Project"}
                              </span>
                              {statusToDisplay && (
                                <span
                                  className={cn(
                                    "text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 border capitalize",
                                    getStatusBadgeClasses(statusToDisplay),
                                  )}
                                >
                                  {statusToDisplay.replace(/_/g, " ")}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              {jobOrProjectId && (
                                <span className="font-mono text-[11px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded shrink-0">
                                  #{jobOrProjectId}
                                </span>
                              )}
                              {project.buildingType && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span className="truncate">
                                    {project.buildingType}
                                  </span>
                                </>
                              )}
                              {project.location && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span className="truncate">
                                    {project.location}
                                  </span>
                                </>
                              )}
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HeaderSearch;
