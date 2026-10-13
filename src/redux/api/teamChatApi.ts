import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";
import type { TeamMessage } from "@/types/communication";

export interface ChatUser {
  _id: string;
  name: string;
  email?: string;
  role: string;
  avatar?: string;
  department?: string;
  status?: "Online" | "Offline" | "Away";
  unreadCount?: number;
}

export interface ChatGroupMember {
  _id: string;
  name: string;
  email?: string;
  role?: string;
  avatar?: string;
}

export interface ChatGroupDetails {
  _id: string;
  name: string;
  avatar?: string;
  members: ChatGroupMember[];
  admins: ChatGroupMember[];
  createdBy?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatConversation {
  type: "direct" | "group";
  userId?: string;
  groupId?: string;
  name: string;
  email?: string;
  role?: string;
  avatar?: string;
  memberCount?: number;
  isAdmin?: boolean;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  unreadCount?: number;
}

export interface UnreadCountResponse {
  count: number;
  total: number;
  direct?: number;
  group?: number;
  byConversation?: Record<string, number>;
}

export interface MessagesResponse {
  messages: TeamMessage[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export const teamChatApi = createApi({
  reducerPath: "teamChatApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "TeamChatUnread",
    "TeamChatConversations",
    "TeamChatMessages",
    "TeamChatUsers",
    "TeamChatGroupDetails",
  ],
  endpoints: (builder) => ({
    getUsers: builder.query<ChatUser[], string | void>({
      query: (search) => ({
        url: `/api/team-chat/users${search ? `?search=${encodeURIComponent(search)}` : ""}`,
        method: "GET",
      }),
      transformResponse: (response: { data?: { users?: ChatUser[] } | ChatUser[] } | ChatUser[]) => {
        if (Array.isArray(response)) return response;
        if (response?.data && "users" in response.data && Array.isArray(response.data.users)) {
          return response.data.users;
        }
        if (response?.data && Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      },
      providesTags: ["TeamChatUsers"],
    }),

    getConversations: builder.query<ChatConversation[], void>({
      query: () => ({
        url: "/api/team-chat/conversations",
        method: "GET",
      }),
      transformResponse: (
        response: { data?: { conversations?: ChatConversation[] } | ChatConversation[] } | ChatConversation[]
      ) => {
        if (Array.isArray(response)) return response;
        if (
          response?.data &&
          "conversations" in response.data &&
          Array.isArray(response.data.conversations)
        ) {
          return response.data.conversations;
        }
        if (response?.data && Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      },
      providesTags: ["TeamChatConversations"],
    }),

    getUnreadCount: builder.query<UnreadCountResponse, void>({
      query: () => ({
        url: "/api/team-chat/unread-count",
        method: "GET",
      }),
      transformResponse: (
        response: {
          data?: {
            count?: number;
            total?: number;
            direct?: number;
            group?: number;
            byConversation?: Record<string, number>;
          };
          count?: number;
          total?: number;
          direct?: number;
          group?: number;
          byConversation?: Record<string, number>;
        }
      ) => {
        const raw = response?.data ?? response ?? {};
        const total = raw.count ?? raw.total ?? 0;
        return {
          count: total,
          total: total,
          direct: raw.direct ?? 0,
          group: raw.group ?? 0,
          byConversation: raw.byConversation,
        };
      },
      providesTags: ["TeamChatUnread"],
    }),

    getDirectMessages: builder.query<
      MessagesResponse,
      { userId: string; page?: number; limit?: number }
    >({
      query: ({ userId, page = 1, limit = 30 }) => ({
        url: `/api/team-chat/direct/${userId}/messages?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      transformResponse: (
        response: {
          data?: {
            messages?: TeamMessage[];
            message?: TeamMessage;
            total?: number;
            page?: number;
            limit?: number;
            hasMore?: boolean;
          } | TeamMessage[];
          messages?: TeamMessage[];
          message?: TeamMessage;
          total?: number;
          page?: number;
          limit?: number;
          hasMore?: boolean;
        } | TeamMessage[]
      ) => {
        const payload = (response && "data" in response ? response.data : response) ?? {};
        if (Array.isArray(payload)) {
          return {
            messages: payload,
            total: payload.length,
            page: 1,
            limit: 30,
            hasMore: false,
          };
        }
        if ("messages" in payload && Array.isArray(payload.messages)) {
          return {
            messages: payload.messages,
            total: payload.total ?? payload.messages.length,
            page: payload.page ?? 1,
            limit: payload.limit ?? 30,
            hasMore: payload.hasMore ?? false,
          };
        }
        if ("message" in payload && payload.message) {
          return {
            messages: [payload.message],
            total: 1,
            page: 1,
            limit: 30,
            hasMore: false,
          };
        }
        return {
          messages: [],
          total: 0,
          page: 1,
          limit: 30,
          hasMore: false,
        };
      },
      providesTags: (_result, _error, { userId }) => [
        { type: "TeamChatMessages", id: `direct-${userId}` },
      ],
    }),

    getGroupMessages: builder.query<
      MessagesResponse,
      { groupId: string; page?: number; limit?: number }
    >({
      query: ({ groupId, page = 1, limit = 30 }) => ({
        url: `/api/team-chat/groups/${groupId}/messages?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      transformResponse: (
        response: {
          data?: {
            messages?: TeamMessage[];
            message?: TeamMessage;
            total?: number;
            page?: number;
            limit?: number;
            hasMore?: boolean;
          } | TeamMessage[];
          messages?: TeamMessage[];
          message?: TeamMessage;
          total?: number;
          page?: number;
          limit?: number;
          hasMore?: boolean;
        } | TeamMessage[]
      ) => {
        const payload = (response && "data" in response ? response.data : response) ?? {};
        if (Array.isArray(payload)) {
          return {
            messages: payload,
            total: payload.length,
            page: 1,
            limit: 30,
            hasMore: false,
          };
        }
        if ("messages" in payload && Array.isArray(payload.messages)) {
          return {
            messages: payload.messages,
            total: payload.total ?? payload.messages.length,
            page: payload.page ?? 1,
            limit: payload.limit ?? 30,
            hasMore: payload.hasMore ?? false,
          };
        }
        if ("message" in payload && payload.message) {
          return {
            messages: [payload.message],
            total: 1,
            page: 1,
            limit: 30,
            hasMore: false,
          };
        }
        return {
          messages: [],
          total: 0,
          page: 1,
          limit: 30,
          hasMore: false,
        };
      },
      providesTags: (_result, _error, { groupId }) => [
        { type: "TeamChatMessages", id: `group-${groupId}` },
      ],
    }),

    getGroupDetails: builder.query<ChatGroupDetails, string>({
      query: (groupId) => ({
        url: `/api/team-chat/groups/${groupId}`,
        method: "GET",
      }),
      transformResponse: (response: { data?: { group?: ChatGroupDetails } | ChatGroupDetails }) => {
        if (response?.data && "group" in response.data && response.data.group) {
          return response.data.group;
        }
        if (response?.data) {
          return response.data as ChatGroupDetails;
        }
        return {
          _id: "",
          name: "",
          members: [],
          admins: [],
        };
      },
      providesTags: (_result, _error, groupId) => [
        { type: "TeamChatGroupDetails", id: groupId },
      ],
    }),

    updateGroupMembers: builder.mutation<
      void,
      { groupId: string; members: string[] }
    >({
      query: ({ groupId, members }) => ({
        url: `/api/team-chat/groups/${groupId}/members`,
        method: "PUT",
        body: { members },
      }),
      invalidatesTags: (_result, _error, { groupId }) => [
        "TeamChatConversations",
        { type: "TeamChatGroupDetails", id: groupId },
      ],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useLazyGetUsersQuery,
  useGetConversationsQuery,
  useGetUnreadCountQuery,
  useGetDirectMessagesQuery,
  useLazyGetDirectMessagesQuery,
  useGetGroupMessagesQuery,
  useLazyGetGroupMessagesQuery,
  useGetGroupDetailsQuery,
  useLazyGetGroupDetailsQuery,
  useUpdateGroupMembersMutation,
} = teamChatApi;
