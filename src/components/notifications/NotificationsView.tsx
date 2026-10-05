import { useState } from "react";
import BlueBellIcon from "@/assets/BlueBellIcon.svg";
import YellowBellIcon from "@/assets/yellowBellIcon.svg";
import GreenBellIcon from "@/assets/greenBellIcon.svg";
import SalmonBellIcon from "@/assets/salmonBellIcon.svg";
import StatCard from "../ui/stat-card";
import { UserPlus } from "lucide-react";
import TitleSubtitle from "../common_components/TitleSubtitle";

interface Notification {
  id: string;
  type: "update" | "reminder" | "leads" | "schedule" | "new";
  title: string;
  description: string;
  time: string;
  category: "Tasks" | "Leads" | "Meetings" | "General" | "Excalation" | "Unread";
  isUnread: boolean;
}
export const equipmentStats = [
  {
    title: "Total",
    value: "12",
    icon: (
      <img
        src={BlueBellIcon}
        alt="total-maintenance"
        className="md:size-5 size-4"
      />
    ),
    color: "bg-[#1D51A4]",
  },
  {
    title: "Unread",
    value: "42",
    icon: (
      <img src={GreenBellIcon} alt="breakdown" className="md:size-5 size-4" />
    ),
    color: "bg-[#3AB449]",
  },
  {
    title: "High Priority",
    value: "74",
    icon: (
      <img
        src={YellowBellIcon}
        alt="due-maintenance"
        className="md:size-5 size-4"
      />
    ),
    color: "bg-[#F59E0B]",
  },
  {
    title: "Today",
    value: "12",
    icon: (
      <img
        src={SalmonBellIcon}
        alt="under-maintenance"
        className="md:size-5 size-4"
      />
    ),
    color: "bg-[#FD8D5B]",
  },
];

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "new",
    title: "New Equipment Updated",
    description:
      "Alice Johnson from The Steel Company has been Updated a Equipment.",
    time: "2 minutes ago",
    category: "Tasks",
    isUnread: false,
  },
  {
    id: "2",
    type: "reminder",
    title: "Task Reminder",
    description: "Follow up with Bob Smith is due in 30 minutes",
    time: "30 minutes ago",
    category: "Leads",
    isUnread: false,
  },
    {
    id: "12",
    type: "reminder",
    title: "Task Reminder",
    description: "Follow with Bob Smith is due in 30 minutes",
    time: "3 minutes ago",
    category: "Leads",
    isUnread: false,
  },
  {
    id: "3",
    type: "leads",
    title: "AI Equipment Service Overdue",
    description: "Service Overdue, Pay before 17 April",
    time: "1 hour ago",
    category: "Tasks",
    isUnread: false,
  },
  {
    id: "4",
    type: "schedule",
    title: "Meeting scheduled",
    description: "Meeting with Design studio confirmed for tomorrow at 2 pm",
    time: "2 hours ago",
    category: "Meetings",
    isUnread: false,
  },
  {
    id: "5",
    type: "update",
    title: "Invoice Approved",
    description: "Finance team approved the invoice #INV-2024-001",
    time: "5 hours ago",
    category: "General",
    isUnread: false,
  },
  {
    id: "6",
    type: "schedule",
    title: "Project Review",
    description: "Weekly project review meeting starting in 15 minutes",
    time: "Yesterday",
    category: "Meetings",
    isUnread: false,
  },
  {
    id: "37",
    type: "new",
    title: "New Excalation",
    description: "John Doe has been added to the team.",
    time: "2 days ago",
    category: "Excalation",
    isUnread: false,
  },
    {
    id: "27",
    type: "new",
    title: "New User Added",
    description: "John Doe has been added to the team.",
    time: "2 days ago",
    category: "Unread",
    isUnread: false,
  },
    {
    id: "17",
    type: "new",
    title: "New User Added",
    description: "John Doe has been added to the team.",
    time: "2 days ago",
    category: "Unread",
    isUnread: false,
  },
      {
    id: "18",
    type: "reminder",
    title: "New Reminder Added",
    description: "John Doe has been added to the team.",
    time: "2 days ago",
    category: "Unread",
    isUnread: false,
  },
];

const NotificationsView = () => {
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = [
    { label: "All", value: "All" },
    { label: "Unread(3)", value: "Unread" },
    { label: "Leads(2)", value: "Leads" },
    { label: "Tasks(2)", value: "Tasks" },
    { label: "Meetings(2)", value: "Meetings" },
    { label: "Excalation", value: "Excalation" },
  ];

  const getFilteredNotifications = () => {
    if (activeFilter === "All") return mockNotifications;
    if (activeFilter === "unread")
      return mockNotifications.filter((n) => n.isUnread);
    const categoryMap: { [key: string]: string } = {
      "Meetings(2)": "Meetings",
    };
    const category = categoryMap[activeFilter] || activeFilter;
    return mockNotifications.filter((n) => n.category === category);
  };

  const filteredData = getFilteredNotifications();

  const getIconStyles = (type: string) => {
    switch (type) {
      case "update":
        return { bg: "bg-blue-100", text: "text-blue-600" };
      case "reminder":
        return { bg: "bg-yellow-100", text: "text-yellow-600" };
      case "alert":
        return { bg: "bg-red-100", text: "text-red-600" };
      case "schedule":
        return { bg: "bg-cyan-100", text: "text-cyan-600" };
      case "new":
        return { bg: "bg-[#DBEAFE]", text: "text-[#1D51A4]" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-600" };
    }
  };

  const renderIcon = (type: string) => {
    const styles = getIconStyles(type);
    let path = <path />;

    if (type === "new") {
      path = <UserPlus />;
    }
    if (type === "update") {
      path = (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3.75 15a2.25 2.25 0 0 1 2.25-2.25h2.25a2.25 2.25 0 0 1 2.25 2.25v1.5a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V15Z"
        />
      );
    } else if (type === "reminder") {
      path = (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
        />
      );
    } else if (type === "leads") {
      path = (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
        />
      );
    } else if (type === "schedule") {
      path = (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
        />
      );
    }

    return (
      <div
        className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${styles.bg} ${styles.text}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          {path}
        </svg>
      </div>
    );
  };

  return (
   <div className="xl:px-0 px-2 pb-10 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 mt-2">
        <TitleSubtitle
          title="Notifications"
          subtitle="Stay updated with project changes, approvals, drawings, dispatches,
            billings, and communication."
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {equipmentStats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>
      {/* Filters Header */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-col md:flex-row items-start md:items-center gap-4">
        <span className="text-gray-700 font-medium md:text-lg text-xs mr-2">
          Filter by:
        </span>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={`px-6 py-2 rounded-lg md:text-sm text-xs font-medium transition-colors
                ${
                  activeFilter === filter.value
                    ? "bg-(--button-bg-primary-color) text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }
              `}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredData.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredData.map((notification) => (
              <div
                key={notification.id}
                className="p-6 flex flex-col md:flex-row gap-4 hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                {/* Icon */}
                {renderIcon(notification.type)}

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-gray-900 font-semibold text-base mb-1 group-hover:text-blue-600 transition-colors">
                    {notification.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-2">
                    {notification.description}
                  </p>
                  <span className="text-gray-400 text-xs font-medium">
                    {notification.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            No notifications found in this category.
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsView;
