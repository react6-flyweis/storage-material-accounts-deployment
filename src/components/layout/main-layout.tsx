import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../common_components/Sidebar";
import Header from "../common_components/Header";
import SidePanel from "../common_components/SidePanel";
import { NAV_ITEMS } from "@/config/navigation.config";

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [activeSubTab, setActiveSubTab] = useState<string>("");

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  // 🔹 Main tab click
  const handleTabChange = (index: number) => {
    const tab = NAV_ITEMS[index];
    setActiveTab(index);
    localStorage.setItem("activeTab", index.toString());

    if (tab.items?.length) {
      setActiveSubTab(tab.items[0].label);
      localStorage.setItem("activeSubTab", tab.items[0].label);
      navigate(tab.items[0].path);
    } else if (tab.path) {
      setActiveSubTab("");
      localStorage.removeItem("activeSubTab");
      navigate(tab.path);
    }
  };

  // 🔹 Sub-tab click
  const handleSubTabChange = (label: string, path: string) => {
    setActiveSubTab(label);
    localStorage.setItem("activeSubTab", label);
    navigate(path);
  };

  // 🔹 Sync with URL (AUTO)
  useEffect(() => {
    NAV_ITEMS.forEach((tab, tabIndex) => {
      if (tab.path === location.pathname) {
        setActiveTab(tabIndex);
        setActiveSubTab("");
      }

      tab.items?.forEach((sub) => {
        if (sub.path === location.pathname) {
          setActiveTab(tabIndex);
          setActiveSubTab(sub.label);
        }
      });
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
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
