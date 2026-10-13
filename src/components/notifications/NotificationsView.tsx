import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BlueBellIcon from "@/assets/BlueBellIcon.svg";
import YellowBellIcon from "@/assets/yellowBellIcon.svg";
import GreenBellIcon from "@/assets/greenBellIcon.svg";
import SalmonBellIcon from "@/assets/salmonBellIcon.svg";
import StatCard from "../ui/stat-card";
import TitleSubtitle from "../common_components/TitleSubtitle";
import { CheckCheck, ChevronLeft, ChevronRight } from "lucide-react";
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from "@/redux/api/notificationsApi";
import {
  getNotificationRoute,
  formatNotificationTime,
  getNotificationTypeConfig,
} from "@/modules/notifications/notifications.utils";
import type { NotificationItem } from "@/modules/notifications/notifications.types";

interface FilterOption {
  id: string;
  label: string;
  read?: string;
  type?: string;
}

const filters: FilterOption[] = [
  { id: "all", label: "All", read: "", type: undefined },
  { id: "unread", label: "Unread", read: "false", type: undefined },
  { id: "payment", label: "Payments", read: "", type: "payment" },
  { id: "invoice", label: "Invoices", read: "", type: "invoice" },
  { id: "task", label: "Tasks", read: "", type: "task" },
  { id: "chat", label: "Chats", read: "", type: "chat" },
  { id: "meeting", label: "Meetings", read: "", type: "meeting" },
  { id: "escalation", label: "Escalations", read: "", type: "escalation" },
];

export const NotificationsView = () => {
  const navigate = useNavigate();
  const [activeFilterId, setActiveFilterId] = useState("all");
  const [activeRead, setActiveRead] = useState<string | undefined>("");
  const [activeType, setActiveType] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: notificationsData, isLoading } = useGetNotificationsQuery(
    {
      page,
      limit,
      read: activeRead || undefined,
      type: activeType,
    },
    { pollingInterval: 15000 }
  );

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();

  const notifications = notificationsData?.notifications || [];
  const stats = notificationsData?.stats || {
    total: 0,
    unread: 0,
    highPriority: 0,
    today: 0,
  };
  const totalItems = notificationsData?.total || 0;
  const totalPages = Math.ceil(totalItems / limit) || 1;

  const statCardsData = [
    {
      title: "Total",
      value: String(stats.total),
      icon: (
        <img
          src={BlueBellIcon}
          alt="total"
          className="md:size-5 size-4"
        />
      ),
      color: "bg-[#1D51A4]",
    },
    {
      title: "Unread",
      value: String(stats.unread),
      icon: (
        <img src={GreenBellIcon} alt="unread" className="md:size-5 size-4" />
      ),
      color: "bg-[#3AB449]",
    },
    {
      title: "High Priority",
      value: String(stats.highPriority),
      icon: (
        <img
          src={YellowBellIcon}
          alt="high-priority"
          className="md:size-5 size-4"
        />
      ),
      color: "bg-[#F59E0B]",
    },
    {
      title: "Today",
      value: String(stats.today),
      icon: (
        <img
          src={SalmonBellIcon}
          alt="today"
          className="md:size-5 size-4"
        />
      ),
      color: "bg-[#FD8D5B]",
    },
  ];

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    const route = getNotificationRoute(notification);
    navigate(route);
  };

  const handleFilterClick = (filter: FilterOption) => {
    setActiveFilterId(filter.id);
    setActiveRead(filter.read);
    setActiveType(filter.type);
    setPage(1);
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="xl:px-0 px-2 pb-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 mt-2">
        <TitleSubtitle
          title="Notifications"
          subtitle="Stay updated with accounting alerts, payment approvals, billing, and communication."
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => markAllAsRead()}
            disabled={isMarkingAll || stats.unread === 0}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg text-blue-600 bg-white hover:bg-blue-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all as read</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {statCardsData.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl shadow-xs p-4 mb-6 flex flex-col md:flex-row items-start md:items-center gap-4 border border-gray-100">
        <span className="text-gray-700 font-medium md:text-sm text-xs mr-2 shrink-0">
          Filter by:
        </span>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            const isActive = activeFilterId === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => handleFilterClick(filter)}
                className={`px-4 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "bg-[#1D51A4] text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className="text-sm">Loading notifications...</span>
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => {
              const typeConfig = getNotificationTypeConfig(notification.type);
              const IconComponent = typeConfig.icon;

              return (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-5 flex flex-col md:flex-row items-start justify-between gap-4 hover:bg-gray-50/80 transition-colors cursor-pointer group ${
                    !notification.isRead ? "bg-blue-50/30" : ""
                  }`}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${typeConfig.bg} ${typeConfig.text}`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-gray-900 font-semibold text-sm md:text-base group-hover:text-blue-600 transition-colors">
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                        )}
                        {notification.priority && (
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded border capitalize ${getPriorityBadgeClass(
                              notification.priority
                            )}`}
                          >
                            {notification.priority} priority
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-xs md:text-sm leading-relaxed mb-2">
                        {notification.body}
                      </p>
                      <span className="text-gray-400 text-xs font-medium">
                        {formatNotificationTime(notification.createdAt)}
                      </span>
                    </div>
                  </div>

                  {!notification.isRead && (
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          void markAsRead(notification._id);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2.5 py-1.5 rounded-md flex items-center gap-1 transition cursor-pointer"
                      >
                        <CheckCheck className="w-4 h-4" />
                        Mark Read
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500 text-sm">
            No notifications found in this category.
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-gray-500">
              Showing page {page} of {totalPages} ({totalItems} total notifications)
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className="px-2.5 py-1.5 border border-gray-200 bg-white rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                className="px-2.5 py-1.5 border border-gray-200 bg-white rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsView;
