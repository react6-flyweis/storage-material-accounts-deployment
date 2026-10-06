import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  ListFilter,
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Hammer,
  ShieldCheck,
  CircleDollarSign,
  LineChart,
  Clock,
  CheckCircle2,
  CircleAlert,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfileCard, { type ProfileData } from "@/components/profile-card";
import { useGetCustomerDetailQuery } from "@/redux/api/customerApi";
import { formatJoinedDate } from "@/modules/customers/customer-utils";

export interface ProjectRowItem {
  id: string;
  projectId: string;
  name: string;
  building: string;
  startDate: string;
  startDateRaw: string;
  stage: string;
  progress: number;
  status: "Work in Progress" | "Active" | "Completed" | "Canceled" | string;
}

// Complete mock dataset: Page 4 matches the user's screenshot exactly
const ALL_PROJECTS_DATA: ProjectRowItem[] = [
  // Page 1
  {
    id: "p1-1",
    projectId: "2025010",
    name: "Summit Commercial Center",
    building: "3",
    startDate: "15 May 2025",
    startDateRaw: "2025-05-15",
    stage: "Planning",
    progress: 10,
    status: "Work in Progress",
  },
  {
    id: "p1-2",
    projectId: "2025011",
    name: "Oceanic Cold Storage",
    building: "1",
    startDate: "02 May 2025",
    startDateRaw: "2025-05-02",
    stage: "Engineering",
    progress: 25,
    status: "Active",
  },
  {
    id: "p1-3",
    projectId: "2025012",
    name: "Pinnacle Logistics Park",
    building: "2",
    startDate: "24 Apr 2025",
    startDateRaw: "2025-04-24",
    stage: "Fabrication",
    progress: 60,
    status: "Active",
  },
  {
    id: "p1-4",
    projectId: "2025013",
    name: "Falcon Distribution Center",
    building: "1",
    startDate: "18 Apr 2025",
    startDateRaw: "2025-04-18",
    stage: "Completed",
    progress: 100,
    status: "Completed",
  },

  // Page 2
  {
    id: "p2-1",
    projectId: "2025020",
    name: "Ironwood Storage Depot",
    building: "2",
    startDate: "10 Apr 2025",
    startDateRaw: "2025-04-10",
    stage: "Shipment",
    progress: 70,
    status: "Work in Progress",
  },
  {
    id: "p2-2",
    projectId: "2025021",
    name: "Blue Horizon Yard",
    building: "1",
    startDate: "01 Apr 2025",
    startDateRaw: "2025-04-01",
    stage: "Engineering",
    progress: 40,
    status: "Active",
  },
  {
    id: "p2-3",
    projectId: "2025022",
    name: "Greenfield Workshop",
    building: "4",
    startDate: "22 Mar 2025",
    startDateRaw: "2025-03-22",
    stage: "Completed",
    progress: 100,
    status: "Completed",
  },
  {
    id: "p2-4",
    projectId: "2025023",
    name: "Northstar Freight Extension",
    building: "1",
    startDate: "15 Mar 2025",
    startDateRaw: "2025-03-15",
    stage: "Canceled",
    progress: 0,
    status: "Canceled",
  },

  // Page 3
  {
    id: "p3-1",
    projectId: "2025030",
    name: "Apex Logistics Hub",
    building: "2",
    startDate: "08 Mar 2025",
    startDateRaw: "2025-03-08",
    stage: "Engineering",
    progress: 35,
    status: "Active",
  },
  {
    id: "p3-2",
    projectId: "2025031",
    name: "Titan Storage Center",
    building: "1",
    startDate: "01 Mar 2025",
    startDateRaw: "2025-03-01",
    stage: "Shipment",
    progress: 80,
    status: "Work in Progress",
  },
  {
    id: "p3-3",
    projectId: "2025032",
    name: "Sunset Industrial Shed",
    building: "3",
    startDate: "25 Feb 2025",
    startDateRaw: "2025-02-25",
    stage: "Completed",
    progress: 100,
    status: "Completed",
  },
  {
    id: "p3-4",
    projectId: "2025033",
    name: "Highland Freight Depot",
    building: "2",
    startDate: "24 Feb 2025",
    startDateRaw: "2025-02-24",
    stage: "Completed",
    progress: 100,
    status: "Completed",
  },

  // Page 4: Exact projects shown in the design image
  {
    id: "p4-1",
    projectId: "2025001",
    name: "ABC Warehouse",
    building: "2",
    startDate: "22 Feb 2025",
    startDateRaw: "2025-02-22",
    stage: "Shipment",
    progress: 75,
    status: "Work in Progress",
  },
  {
    id: "p4-2",
    projectId: "2025002",
    name: "Tech Park Dev",
    building: "1",
    startDate: "07 Feb 2025",
    startDateRaw: "2025-02-07",
    stage: "Engineering",
    progress: 30,
    status: "Active",
  },
  {
    id: "p4-3",
    projectId: "2025003",
    name: "Downtown Plaza",
    building: "3",
    startDate: "30 Jan 2025",
    startDateRaw: "2025-01-30",
    stage: "Completed",
    progress: 100,
    status: "Completed",
  },
  {
    id: "p4-4",
    projectId: "2025004",
    name: "Riverside Complex",
    building: "1",
    startDate: "17 Jan 2025",
    startDateRaw: "2025-01-17",
    stage: "Canceled",
    progress: 0,
    status: "Canceled",
  },
];

export default function CustomerProjectsPage() {
  const navigate = useNavigate();
  const { customerId } = useParams<{ customerId?: string }>();

  // Fetch customer details if customerId is present in URL
  const { data: customerDetail, isLoading: isCustomerLoading } =
    useGetCustomerDetailQuery(
      { id: customerId || "67a1b2c3d4e5f6789012345a" },
      { skip: !customerId && false }
    );

  // Profile data (matches image fallback)
  const profileData: ProfileData = useMemo(() => {
    if (customerDetail?.profile) {
      return {
        name: customerDetail.profile.customerName || "John Doe",
        status: customerDetail.profile.status || "Active",
        id: customerDetail.profile.customerId || "ID-2025-1047",
        joined: customerDetail.profile.joinedDate
          ? formatJoinedDate(customerDetail.profile.joinedDate)
          : "January 15, 2023",
        phone: customerDetail.profile.phone || "(163) 2459 315",
        email: customerDetail.profile.email || "darlee@example.com",
        address:
          customerDetail.profile.address ||
          "1861 Bayonne Ave, Manchester, NJ, 08759",
        company: customerDetail.profile.company || "ABC Industries",
        photo:
          customerDetail.profile.photo ||
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
      };
    }
    return {
      name: "John Doe",
      status: "Active",
      id: "ID-2025-1047",
      joined: "January 15, 2023",
      phone: "(163) 2459 315",
      email: "darlee@example.com",
      address: "1861 Bayonne Ave, Manchester, NJ, 08759",
      company: "ABC Industries",
      photo:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    };
  }, [customerDetail]);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Sorting state
  const [sortField, setSortField] = useState<"startDate" | "stage" | "progress" | "name">("startDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [sortLabel, setSortLabel] = useState("Latest");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Checkbox selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination state: Default page 4 as shown in the screenshot
  const [currentPage, setCurrentPage] = useState(4);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const totalDisplayPages = 15;

  // Stat cards data (matching the screenshot)
  const stats = [
    {
      title: "Total Projects",
      value: "04",
      bg: "bg-[#1E4D8C]",
      icon: <Hammer className="w-5 h-5 text-[#1E4D8C]" />,
    },
    {
      title: "Completed",
      value: "3",
      bg: "bg-[#22C55E]",
      icon: <ShieldCheck className="w-5 h-5 text-[#22C55E]" />,
    },
    {
      title: "Work in progress",
      value: "1",
      bg: "bg-[#E5A500]",
      icon: <CircleDollarSign className="w-5 h-5 text-[#E5A500]" />,
    },
    {
      title: "Canceled",
      value: "1",
      bg: "bg-[#FA743E]",
      icon: <LineChart className="w-5 h-5 text-[#FA743E]" />,
    },
  ];

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let result = [...ALL_PROJECTS_DATA];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.building.toLowerCase().includes(q) ||
          p.stage.toLowerCase().includes(q) ||
          p.status.toLowerCase().includes(q) ||
          p.startDate.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(
        (p) => p.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (stageFilter !== "all") {
      result = result.filter(
        (p) => p.stage.toLowerCase() === stageFilter.toLowerCase()
      );
    }

    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === "startDate") {
        comparison =
          new Date(a.startDateRaw).getTime() - new Date(b.startDateRaw).getTime();
      } else if (sortField === "progress") {
        comparison = a.progress - b.progress;
      } else if (sortField === "stage") {
        comparison = a.stage.localeCompare(b.stage);
      } else if (sortField === "name") {
        comparison = a.name.localeCompare(b.name);
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [searchTerm, statusFilter, stageFilter, sortField, sortDirection]);

  // Current page projects: on page 4, display the 4 projects from page 4
  const visibleProjects = useMemo(() => {
    // If filtered or searched, use standard slice
    if (searchTerm || statusFilter !== "all" || stageFilter !== "all") {
      const start = (Math.max(1, currentPage) - 1) * rowsPerPage;
      return filteredAndSortedProjects.slice(start, start + rowsPerPage);
    }

    // Default pagination: Page 4 contains the exact 4 items from the image
    if (currentPage === 4) {
      return ALL_PROJECTS_DATA.filter((p) => p.id.startsWith("p4"));
    } else if (currentPage === 1) {
      return ALL_PROJECTS_DATA.filter((p) => p.id.startsWith("p1"));
    } else if (currentPage === 2) {
      return ALL_PROJECTS_DATA.filter((p) => p.id.startsWith("p2"));
    } else if (currentPage === 3) {
      return ALL_PROJECTS_DATA.filter((p) => p.id.startsWith("p3"));
    } else {
      // Fallback for pages 5..15: show page 4 items
      return ALL_PROJECTS_DATA.filter((p) => p.id.startsWith("p4"));
    }
  }, [filteredAndSortedProjects, currentPage, rowsPerPage, searchTerm, statusFilter, stageFilter]);

  // Checkbox handlers
  const allCurrentSelected =
    visibleProjects.length > 0 &&
    visibleProjects.every((p) => selectedIds.includes(p.id));

  const toggleSelectAll = () => {
    if (allCurrentSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !visibleProjects.some((p) => p.id === id))
      );
    } else {
      const visibleIds = visibleProjects.map((p) => p.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Header column sort toggle
  const handleSort = (field: "startDate" | "stage" | "progress" | "name") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Sort dropdown selector
  const handleSortSelect = (label: string, field: "startDate" | "progress" | "name", dir: "asc" | "desc") => {
    setSortLabel(label);
    setSortField(field);
    setSortDirection(dir);
    setShowSortDropdown(false);
  };

  // View button navigation
  const handleView = (project: ProjectRowItem) => {
    const targetId = project.projectId || project.id;
    const targetPath = customerId
      ? `/customers/${customerId}/projects/${targetId}`
      : `/customers/projects/${targetId}`;

    navigate(targetPath, {
      state: {
        projectId: targetId,
        projectName: project.name,
        customerName: profileData.name,
        customerId: profileData.id,
      },
    });
  };

  // Status badge renderer matching the exact screenshot design
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "Work in Progress":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FEF9C3] text-[#D97706] border border-[#FDE047]">
            Work in Progress
            <Clock className="w-3 h-3 text-[#D97706]" />
          </span>
        );
      case "Active":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#DCFCE7] text-[#16A34A] border border-[#86EFAC]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
            Active
            <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
          </span>
        );
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#DCFCE7] text-[#16A34A] border border-[#86EFAC]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
            Completed
            <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
          </span>
        );
      case "Canceled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FFEDD5] text-[#EA580C] border border-[#FED7AA]">
            Canceled
            <CircleAlert className="w-3 h-3 text-[#EA580C]" />
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  // Pagination page buttons matching < 1 2 3 4 ... 15 > with orange active circle
  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalDisplayPages <= 6) {
      for (let i = 1; i <= totalDisplayPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, "...", totalDisplayPages);
      } else if (currentPage >= totalDisplayPages - 3) {
        pages.push(
          1,
          "...",
          totalDisplayPages - 3,
          totalDisplayPages - 2,
          totalDisplayPages - 1,
          totalDisplayPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalDisplayPages
        );
      }
    }

    return pages.map((page, index) => {
      if (page === "...") {
        return (
          <span key={`dots-${index}`} className="text-slate-400 text-xs px-1 select-none">
            ...
          </span>
        );
      }

      const isCurrent = page === currentPage;
      return (
        <button
          key={`page-${page}`}
          type="button"
          onClick={() => setCurrentPage(Number(page))}
          className={`w-7 h-7 rounded-full text-xs transition-colors flex items-center justify-center font-medium ${
            isCurrent
              ? "bg-[#FA743E] text-white font-bold shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          {page}
        </button>
      );
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen bg-[#F0F4F8]">
      {/* Top Header Row: Back button & Title */}
      <div className="flex items-center gap-3">
        <Button
          variant="default"
          onClick={() => {
            if (customerId) {
              navigate(`/customers/${customerId}`);
            } else {
              navigate(-1);
            }
          }}
          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 text-white" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          All Projects
        </h1>
      </div>

      {/* Customer Info Profile Card */}
      <ProfileCard profile={profileData} isLoading={isCustomerLoading} />

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className={`${stat.bg} rounded-2xl p-5 sm:p-6 text-white flex items-center justify-between shadow-xs transition-transform hover:-translate-y-0.5 duration-200`}
          >
            <div>
              <p className="text-white/85 text-xs sm:text-sm font-normal">
                {stat.title}
              </p>
              <h3 className="text-3xl font-bold mt-1 tracking-tight">
                {stat.value}
              </h3>
            </div>
            <div className="bg-white rounded-xl w-12 h-12 flex items-center justify-center shadow-xs shrink-0">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar: Search, Filter & Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Search input & Filter button */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 w-48 sm:w-56 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-none"
            />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowFilterDropdown(!showFilterDropdown);
                setShowSortDropdown(false);
              }}
              className={`h-9 px-3.5 rounded-lg border bg-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                statusFilter !== "all" || stageFilter !== "all"
                  ? "border-blue-500 text-blue-600 bg-blue-50/50"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
              <span>Filter</span>
              {(statusFilter !== "all" || stageFilter !== "all") && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              )}
            </button>

            {/* Filter Dropdown Popover */}
            {showFilterDropdown && (
              <div className="absolute left-0 mt-1.5 w-64 bg-white rounded-xl shadow-lg border border-slate-200 p-4 z-20 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800">Filter Projects</span>
                  <button
                    type="button"
                    onClick={() => setShowFilterDropdown(false)}
                    className="text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full text-xs rounded-md border border-slate-200 p-1.5 text-slate-700 bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Work in Progress">Work in Progress</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Canceled">Canceled</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">Stage</label>
                  <select
                    value={stageFilter}
                    onChange={(e) => {
                      setStageFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full text-xs rounded-md border border-slate-200 p-1.5 text-slate-700 bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">All Stages</option>
                    <option value="Shipment">Shipment</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Completed">Completed</option>
                    <option value="Canceled">Canceled</option>
                    <option value="Fabrication">Fabrication</option>
                    <option value="Planning">Planning</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-between gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter("all");
                      setStageFilter("all");
                      setShowFilterDropdown(false);
                      setCurrentPage(1);
                    }}
                    className="text-[11px] text-slate-500 hover:text-slate-700 font-medium"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFilterDropdown(false)}
                    className="px-3 py-1 bg-[#2563EB] text-white rounded text-xs font-semibold hover:bg-[#1D4ED8]"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Sort by : Latest dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowSortDropdown(!showSortDropdown);
              setShowFilterDropdown(false);
            }}
            className="h-9 px-3.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-none transition-colors cursor-pointer"
          >
            <ListFilter className="h-3.5 w-3.5 text-slate-500" />
            <span>
              Sort by : <span className="font-semibold text-slate-900">{sortLabel}</span>
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-500 ml-0.5" />
          </button>

          {showSortDropdown && (
            <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-slate-200 p-1.5 z-20 space-y-0.5">
              <button
                type="button"
                onClick={() => handleSortSelect("Latest", "startDate", "desc")}
                className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  sortLabel === "Latest" ? "bg-blue-50 text-blue-600 font-semibold" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                Latest
              </button>
              <button
                type="button"
                onClick={() => handleSortSelect("Oldest", "startDate", "asc")}
                className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  sortLabel === "Oldest" ? "bg-blue-50 text-blue-600 font-semibold" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                Oldest
              </button>
              <button
                type="button"
                onClick={() => handleSortSelect("Progress (High-Low)", "progress", "desc")}
                className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  sortLabel === "Progress (High-Low)" ? "bg-blue-50 text-blue-600 font-semibold" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                Progress (High-Low)
              </button>
              <button
                type="button"
                onClick={() => handleSortSelect("Project Name (A-Z)", "name", "asc")}
                className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  sortLabel === "Project Name (A-Z)" ? "bg-blue-50 text-blue-600 font-semibold" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                Project Name (A-Z)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-[#F8FAFC] text-xs font-bold text-slate-800">
                <th className="w-12 px-5 py-4">
                  <input
                    type="checkbox"
                    checked={allCurrentSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all projects"
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="px-5 py-4 font-bold text-slate-800">Project Name</th>
                <th className="px-5 py-4 font-bold text-slate-800">Building</th>
                <th
                  className="px-5 py-4 font-bold text-slate-800 cursor-pointer select-none"
                  onClick={() => handleSort("startDate")}
                >
                  <div className="inline-flex items-center gap-1">
                    Start Date
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th
                  className="px-5 py-4 font-bold text-slate-800 cursor-pointer select-none"
                  onClick={() => handleSort("stage")}
                >
                  <div className="inline-flex items-center gap-1">
                    Stage
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th
                  className="px-5 py-4 font-bold text-slate-800 cursor-pointer select-none"
                  onClick={() => handleSort("progress")}
                >
                  <div className="inline-flex items-center gap-1">
                    Progress
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-5 py-4 font-bold text-slate-800">Status</th>
                <th className="px-5 py-4 font-bold text-slate-800 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {visibleProjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                    No projects found matching the criteria.
                  </td>
                </tr>
              ) : (
                visibleProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="w-12 px-5 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(project.id)}
                        onChange={() => toggleSelect(project.id)}
                        aria-label={`Select project ${project.name}`}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900 whitespace-nowrap">
                      {project.name}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {project.building}
                    </td>
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                      {project.startDate}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {project.stage}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {project.progress}%
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {renderStatusBadge(project.status)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        type="button"
                        onClick={() => handleView(project)}
                        className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold px-5 py-1.5 h-auto rounded-lg shadow-xs transition-colors cursor-pointer"
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Pagination Bar matching screenshot */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Row Per Page [10 ˅] Entries */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-normal">
          <span>Row Per Page</span>
          <div className="relative">
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="appearance-none bg-white border border-slate-200 rounded-md pl-2.5 pr-6 py-1 text-xs text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-blue-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <span>Entries</span>
        </div>

        {/* Right: < 1 2 3 4 ... 15 > */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {renderPageNumbers()}

          <button
            type="button"
            disabled={currentPage === totalDisplayPages}
            onClick={() => setCurrentPage((p) => Math.min(totalDisplayPages, p + 1))}
            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
