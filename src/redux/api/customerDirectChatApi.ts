import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";
import type {
  CustomerDirectConversation,
  CustomerDirectMessage,
  CustomerDirectConversationsResponse,
  CustomerDirectMessagesResponse,
} from "@/modules/customer-direct-chat/customer-direct-chat.types";

export interface GetCustomerConversationsParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface GetCustomerMessagesParams {
  customerId: string;
  page?: number;
  limit?: number;
}

export const customerDirectChatApi = createApi({
  reducerPath: "customerDirectChatApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["CustomerDirectConversations", "CustomerDirectMessages"],
  endpoints: (builder) => ({
    getCustomerDirectConversations: builder.query<
      CustomerDirectConversation[],
      GetCustomerConversationsParams | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.append("search", params.search);
        if (params?.page) queryParams.append("page", String(params.page));
        if (params?.limit) queryParams.append("limit", String(params.limit));
        const qs = queryParams.toString();
        return {
          url: `/api/sales/customer-direct-chat/conversations${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      transformResponse: (response: CustomerDirectConversationsResponse) => {
        const data = response?.data;
        if (Array.isArray(data)) return data;
        if (data && "conversations" in data && Array.isArray(data.conversations)) {
          return data.conversations;
        }
        if (Array.isArray(response?.conversations)) return response.conversations;
        return [];
      },
      providesTags: ["CustomerDirectConversations"],
    }),

    getCustomerDirectMessages: builder.query<
      CustomerDirectMessage[],
      GetCustomerMessagesParams
    >({
      query: ({ customerId, page = 1, limit = 50 }) => ({
        url: `/api/sales/customer-direct-chat/${encodeURIComponent(customerId)}/messages?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      transformResponse: (response: CustomerDirectMessagesResponse) => {
        const data = response?.data;
        if (Array.isArray(data)) return data;
        if (data && "messages" in data && Array.isArray(data.messages)) {
          return data.messages;
        }
        if (Array.isArray(response?.messages)) return response.messages;
        return [];
      },
      providesTags: (_result, _error, { customerId }) => [
        { type: "CustomerDirectMessages", id: customerId },
      ],
    }),

    sendCustomerDirectMessage: builder.mutation<
      CustomerDirectMessage,
      { customerId: string; content: string }
    >({
      query: ({ customerId, content }) => ({
        url: `/api/sales/customer-direct-chat/${encodeURIComponent(customerId)}/messages`,
        method: "POST",
        body: { content },
      }),
      invalidatesTags: (_result, _error, { customerId }) => [
        "CustomerDirectConversations",
        { type: "CustomerDirectMessages", id: customerId },
      ],
    }),
  }),
});

export const {
  useGetCustomerDirectConversationsQuery,
  useLazyGetCustomerDirectConversationsQuery,
  useGetCustomerDirectMessagesQuery,
  useLazyGetCustomerDirectMessagesQuery,
  useSendCustomerDirectMessageMutation,
} = customerDirectChatApi;
