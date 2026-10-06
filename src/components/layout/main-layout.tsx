import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import Sidebar from "../common_components/Sidebar";
import Header from "../common_components/Header";
import SidePanel from "../common_components/SidePanel";
import { NAV_ITEMS } from "@/config/navigation.config";

function getActiveNavFromPath(pathname: string) {
  let matchedTab = 0;
  let matchedSubTab = "";
  let longestMatchLen = -1;

  NAV_ITEMS.forEach((tab, tabIndex) => {
    if (tab.path === pathname) {
      matchedTab = tabIndex;
      matchedSubTab = "";
      longestMatchLen = tab.path.length;
    }

    tab.items?.forEach((sub) => {
      const isMatch =
        sub.path === pathname ||
        (sub.path !== "/" &&
          (pathname === sub.path ||
            pathname.startsWith(sub.path + "/") ||
            pathname.startsWith(sub.path)));

      if (isMatch && sub.path.length > longestMatchLen) {
        matchedTab = tabIndex;
        matchedSubTab = sub.label;
        longestMatchLen = sub.path.length;
      }
    });
  });

  return { activeTab: matchedTab, activeSubTab: matchedSubTab };
}

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  // Derive active tab and subtab directly from current URL
  const { activeTab, activeSubTab } = useMemo(
    () => getActiveNavFromPath(location.pathname),
    [location.pathname]
  );

  // 🔹 Main tab click
  const handleTabChange = (index: number) => {
    const tab = NAV_ITEMS[index];
    if (tab.items?.length) {
      navigate(tab.items[0].path);
    } else if (tab.path) {
      navigate(tab.path);
    }
  };

  // 🔹 Sub-tab click
  const handleSubTabChange = (_label: string, path: string) => {
    navigate(path);
  };

  // Scroll to top on route transition
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-[#E5ECFF] relative overflow-hidden">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
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
      />

      <div className="flex-1 min-w-0 flex flex-col h-screen md:ml-[304px] lg:ml-[336px]">
        <Header onMenuToggle={toggleSidebar} />
        <main className="flex-1 overflow-y-auto mt-1 xl:pb-3 xl:pr-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
