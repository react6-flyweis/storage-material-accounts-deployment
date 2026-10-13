import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, LogOut, User as UserAvatarIcon } from "lucide-react";
import UserIcon from "../../../assets/icon/UserIcon";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { logout } from "../../../redux/slices/authSlice";

interface UserProfileMenuProps {
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
  onProfileClick,
  onSettingsClick,
}) => {
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

  const handleNavigateProfile = () => {
    setIsProfileOpen(false);
    if (onProfileClick) {
      onProfileClick();
    } else {
      // navigate("/profile");
    }
  };

  const handleNavigateSettings = () => {
    setIsProfileOpen(false);
    if (onSettingsClick) {
      onSettingsClick();
    } else {
      navigate("/settings");
    }
  };

  return (
    <div className="relative" ref={profileRef}>
      <button
        type="button"
        className="text-gray-500 hover:text-gray-700 relative focus:outline-none bg-(--button-bg-primary-color) rounded-full p-2 cursor-pointer"
        onClick={() => setIsProfileOpen(!isProfileOpen)}
        title="Open user profile menu"
        aria-expanded={isProfileOpen}
      >
        <UserAvatarIcon className="w-4 h-4 text-white" />
      </button>

      {isProfileOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100  z-50 animate-in fade-in zoom-in-95 duration-100">
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
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left cursor-pointer"
              onClick={handleNavigateProfile}
            >
              <UserIcon className="w-5 h-5 text-gray-500" />
              <p className="text-(--text-color-gray-two) font-light">
                My profile
              </p>
            </button>
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left cursor-pointer"
              onClick={handleNavigateSettings}
            >
              <Settings className="w-5 h-5 text-(--text-color-gray-two)" />
              <p className="text-[#3E4857] font-light">Settings</p>
            </button>
          </div>
          <div className="px-2 pt-2">
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors text-left font-medium cursor-pointer"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileMenu;
