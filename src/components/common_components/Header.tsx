import React, { useState, useRef, useEffect } from "react";
import logo from "../../assets/logo.png";
import bellIcon from "../../assets/bellIcon.svg";
import { useNavigate } from "react-router-dom";
import UserIcon from "../../assets/icon/UserIcon";
import { Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { logout } from "../../redux/slices/authSlice";

interface HeaderProps {
  onMenuToggle: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = () => {
    dispatch(logout());
    setIsProfileOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <header className="flex items-center justify-between p-3 md:p-4 bg-white shadow-sm rounded-none z-20 sticky top-0 w-full gap-2 md:gap-4">
      <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
        <button
          className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          onClick={onMenuToggle}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>

        {/* Search Bar */}
        <div className="hidden md:flex items-center bg-[#F8F9FA] rounded-md px-4 xl:py-2 py-1.5 flex-1 max-w-sm border border-[#9CA3AF] focus-within:border-[#9CA3AF] focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <Search className="w-5 h-5 text-[#9CA3AF] mr-2" />
          <input
            type="text"
            placeholder="Search by equipment name..."
            className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        <div className="relative">
          <button
            onClick={() => navigate("/notification")}
            className="text-gray-500 hover:text-gray-700 relative p-1 rounded-full hover:bg-gray-50 transition-colors"
          >
            <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-white">
              3
            </span>
            <img
              src={bellIcon}
              alt="notifications"
              className="w-8 h-6 object-contain"
            />
          </button>
        </div>
        <div className="relative" ref={profileRef}>
          <button
            className="text-gray-500 hover:text-gray-700 relative focus:outline-none bg-(--button-bg-primary-color) rounded-full p-2"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 20.25a7.5 7.5 0 0 1 15 0"
              />
            </svg>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              {user && (
                <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {user.name || "Accounts User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.email || ""}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
                    {user.role || "Accounts"}
                  </span>
                </div>
              )}
              <div className="px-2 pb-2 border-b border-gray-100">
                <button
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
                  onClick={() => {
                    navigate("/profile");
                    setIsProfileOpen(false);
                  }}
                >
                  <UserIcon className="w-5 h-5 text-gray-500" />

                  <p className="text-(--text-color-gray-two) font-light">
                    My profile
                  </p>
                </button>
                <button
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate("/settings");
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5 text-(--text-color-gray-two)"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                  <p className="text-[#3E4857] font-light">Settings</p>
                </button>
              </div>
              <div className="px-2 pt-2">
                <button
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors text-left font-medium"
                  onClick={handleSignOut}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
                    />
                  </svg>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>

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
