import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { ApiResponse } from "./apiResponse";
import type { RootState } from "../store";
import { logout, updateTokens } from "../slices/authSlice";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: apiBaseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth?.accessToken;

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

const isAuthEndpoint = (args: string | FetchArgs, endpoint: string) => {
  if (typeof args === "string") {
    return args.includes(endpoint);
  }

  return args.url.includes(endpoint);
};

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status !== 401) {
    return result;
  }

  if (
    isAuthEndpoint(args, "/api/auth/login") ||
    isAuthEndpoint(args, "/api/auth/refresh")
  ) {
    return result;
  }

  const state = api.getState() as RootState;
  const refreshToken = state.auth?.refreshToken;

  if (!refreshToken) {
    api.dispatch(logout());
    return result;
  }

  const refreshResult = await rawBaseQuery(
    {
      url: "/api/auth/refresh",
      method: "POST",
      body: { refreshToken },
    },
    api,
    extraOptions,
  );

  if (refreshResult.error) {
    api.dispatch(logout());
    return result;
  }

  const refreshData = refreshResult.data as
    | ApiResponse<{
        accessToken: string;
      }>
    | undefined;
  const nextAccessToken = refreshData?.data?.accessToken;

  if (!nextAccessToken) {
    api.dispatch(logout());
    return result;
  }

  api.dispatch(
    updateTokens({
      accessToken: nextAccessToken,
      refreshToken,
    }),
  );

  result = await rawBaseQuery(args, api, extraOptions);

  return result;
};
