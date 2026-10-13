import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";
import type {
  NotificationsListData,
  NotificationsQueryParams,
  NotificationsListResponse,
  UnreadCountResponse,
  NotificationActionResponse,
} from "@/modules/notifications/notifications.types";

export const notificationsApi = createApi({
  reducerPath: "notificationsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Notifications", "UnreadCount"],
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationsListData, NotificationsQueryParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.page !== undefined) queryParams.append("page", params.page.toString());
        if (params?.limit !== undefined) queryParams.append("limit", params.limit.toString());
        if (params?.type) queryParams.append("type", params.type);
        if (params?.priority) queryParams.append("priority", params.priority);
        if (params?.read !== undefined && params.read !== "") queryParams.append("read", params.read);

        const queryString = queryParams.toString();
        return {
          url: `/api/notifications${queryString ? `?${queryString}` : ""}`,
          method: "GET",
        };
      },
      providesTags: ["Notifications"],
      transformResponse: (response: NotificationsListResponse) => {
        return response?.data || {
          notifications: [],
          total: 0,
          stats: { total: 0, unread: 0, highPriority: 0, today: 0 },
          page: 1,
          limit: 10,
        };
      },
    }),

    getUnreadCount: builder.query<{ unread: number }, void>({
      query: () => ({
        url: "/api/notifications/unread-count",
        method: "GET",
      }),
      providesTags: ["UnreadCount"],
      transformResponse: (response: UnreadCountResponse) => {
        if (typeof response === "number") {
          return { unread: response };
        }
        if (typeof response?.data === "number") {
          return { unread: response.data };
        }
        const count = response?.data?.unread ?? response?.data?.count ?? 0;
        return { unread: count };
      },
    }),

    markAsRead: builder.mutation<NotificationActionResponse, string>({
      query: (id) => ({
        url: `/api/notifications/${id}/read`,
        method: "PUT",
      }),
      invalidatesTags: ["Notifications", "UnreadCount"],
    }),

    markAllAsRead: builder.mutation<NotificationActionResponse, void>({
      query: () => ({
        url: "/api/notifications/read-all",
        method: "PUT",
      }),
      invalidatesTags: ["Notifications", "UnreadCount"],
    }),

    deleteNotification: builder.mutation<NotificationActionResponse, string>({
      query: (id) => ({
        url: `/api/notifications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notifications", "UnreadCount"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} = notificationsApi;
