import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import bellIcon from "../assets/bellIcon.svg";
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from "@/redux/api/notificationsApi";
import {
  getNotificationRoute,
  formatNotificationTime,
  getNotificationTypeConfig,
} from "@/modules/notifications/notifications.utils";
import type { NotificationItem } from "@/modules/notifications/notifications.types";

export function NotificationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data: unreadData } = useGetUnreadCountQuery(undefined, {
    pollingInterval: 10000,
  });
  const { data: notificationsData } = useGetNotificationsQuery(
    { page: 1, limit: 5 },
    { pollingInterval: 15000 }
  );

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();

  const totalUnread = unreadData?.unread ?? notificationsData?.stats?.unread ?? 0;
  const items: NotificationItem[] = notificationsData?.notifications || [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    setIsOpen(false);
    const route = getNotificationRoute(notification);
    navigate(route);
  };

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await markAllAsRead();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-label="Open notifications"
        onClick={() => setIsOpen((prev) => !prev)}
        className="text-gray-500 hover:text-gray-700 relative p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer flex items-center justify-center focus:outline-none"
      >
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-white shadow-xs z-10">
            {totalUnread > 99 ? "99+" : totalUnread}
          </span>
        )}
        <img
          src={bellIcon}
          alt="notifications"
          className="w-7 h-6 object-contain"
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl border border-gray-100 shadow-[0_20px_45px_rgba(15,23,42,0.15)] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
            <div>
              <p className="text-sm font-semibold text-gray-900">Notifications</p>
              <p className="text-xs text-gray-500">
                {totalUnread > 0
                  ? `${totalUnread} unread update${totalUnread > 1 ? "s" : ""}`
                  : "You're all caught up"}
              </p>
            </div>
            {totalUnread > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={isMarkingAll}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium transition cursor-pointer disabled:opacity-50"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto thin-scrollbar">
            {items.length > 0 ? (
              items.map((item) => {
                const typeConfig = getNotificationTypeConfig(item.type);
                const Icon = typeConfig.icon;

                return (
                  <button
                    type="button"
                    key={item._id}
                    onClick={() => handleNotificationClick(item)}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-gray-50 cursor-pointer ${
                      !item.isRead ? "bg-blue-50/40" : ""
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${typeConfig.bg} ${typeConfig.text}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          {item.title}
                        </p>
                        {!item.isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                        {item.body}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {formatNotificationTime(item.createdAt)}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-gray-500">
                No notifications yet
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 bg-gray-50/70">
            <Link
              to="/notification"
              onClick={() => setIsOpen(false)}
              className="w-full block text-center rounded-b-2xl px-4 py-2.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationMenu;
