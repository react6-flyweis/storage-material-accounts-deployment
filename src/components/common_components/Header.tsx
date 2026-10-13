import React from "react";
import logo from "../../assets/logo.png";
import { ChevronLeft, Menu } from "lucide-react";
import { NotificationMenu } from "../notification-menu";
import { HeaderSearch, UserProfileMenu } from "./header";

export interface HeaderProps {
  onMenuToggle: () => void;
  isSidebarOpen?: boolean;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Header: React.FC<HeaderProps> = ({
  onMenuToggle,
  isSidebarOpen,
  onProfileClick,
  onSettingsClick,
  searchPlaceholder,
  searchValue,
  onSearchChange,
}) => {
  return (
    <header className="flex items-center justify-between p-3 md:p-4 bg-white shadow-sm rounded-none z-20 sticky top-0 w-full gap-2 md:gap-4">
      <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          onClick={onMenuToggle}
          title="Toggle Navigation Menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Desktop sidebar collapse/expand toggle */}
        <button
          type="button"
          className="hidden md:flex items-center justify-center p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors cursor-pointer"
          onClick={onMenuToggle}
          title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <ChevronLeft
            className={`w-5 h-5 transition-transform duration-300 ${
              isSidebarOpen ? "rotate-0" : "rotate-180"
            }`}
          />
        </button>

        {/* Search Bar */}
        <HeaderSearch
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={onSearchChange}
        />
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        <NotificationMenu />
        <UserProfileMenu
          onProfileClick={onProfileClick}
          onSettingsClick={onSettingsClick}
        />

        <div className="flex items-center shrink-0">
          <img
            src={logo}
            alt="Logo"
            className="xl:w-50 xl:h-12 sm:w-35 sm:h-12 w-30 h-8 object-contain"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
