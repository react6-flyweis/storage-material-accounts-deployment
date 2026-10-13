import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useMemo, useRef } from "react";
import Sidebar from "../common_components/Sidebar";
import Header from "../common_components/Header";
import SidePanel from "../common_components/SidePanel";
import { NAV_ITEMS } from "@/config/navigation.config";

function getActiveNavFromPath(pathname: string) {
  let matchedTab = 0;
  let matchedSubTab = "";
  let longestMatchLen = -1;

  NAV_ITEMS.forEach((tab, tabIndex) => {
    // Direct match with main tab's path
    if (
      tab.path &&
      (pathname === tab.path || pathname.startsWith(tab.path + "/"))
    ) {
      if (tab.path.length > longestMatchLen) {
        matchedTab = tabIndex;
        matchedSubTab = "";
        longestMatchLen = tab.path.length;
      }
    }

    // Match with sub-items
    tab.items?.forEach((sub) => {
      if (
        sub.path &&
        (pathname === sub.path ||
          (sub.path !== "/" && pathname.startsWith(sub.path + "/")))
      ) {
        if (sub.path.length > longestMatchLen) {
          matchedTab = tabIndex;
          matchedSubTab = sub.label;
          longestMatchLen = sub.path.length;
        }
      }
    });
  });

  return { activeTab: matchedTab, activeSubTab: matchedSubTab };
}

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const mainRef = useRef<HTMLElement | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Derive active tab and subtab directly from current URL
  const { activeTab, activeSubTab } = useMemo(
    () => getActiveNavFromPath(location.pathname),
    [location.pathname],
  );

  // 🔹 Main tab click
  const handleTabChange = (index: number) => {
    // If sidebar was collapsed on desktop, open it when switching tabs
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      setIsSidebarOpen(true);
    }

    const tab = NAV_ITEMS[index];
    if (tab.path) {
      navigate(tab.path);
    } else if (tab.items?.length) {
      navigate(tab.items[0].path);
    }

    // On mobile, close sidebar after navigating to direct route
    if (
      typeof window !== "undefined" &&
      window.innerWidth < 768 &&
      tab.path &&
      !tab.items?.length
    ) {
      setIsSidebarOpen(false);
    }
  };

  // 🔹 Sub-tab click
  const handleSubTabChange = (_label: string, path: string) => {
    navigate(path);
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  // Scroll to top on route transition
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-[#E5ECFF] relative overflow-hidden">
      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={closeSidebar}
        />
      )}

      <Sidebar
        isOpen={isSidebarOpen}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
      />

      <SidePanel
        isOpen={isSidebarOpen}
        activeTab={activeTab}
        activeSubTab={activeSubTab}
        onSubTabClick={handleSubTabChange}
        onClose={closeSidebar}
      />

      <div
        className={`flex-1 min-w-0 flex flex-col h-screen transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "md:ml-72 lg:ml-76" : "md:ml-16 lg:ml-20"
        }`}
      >
        <Header onMenuToggle={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main ref={mainRef} className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
