import { createApi } from "@reduxjs/toolkit/query/react";
import { loginSuccess } from "../slices/authSlice";
import type { ApiResponse } from "./apiResponse";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponseUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  avatar?: string;
}

export type LoginApiResponse = ApiResponse<{
  accessToken: string;
  refreshToken: string;
  role: string;
  user: LoginResponseUser;
}>;

export interface LoginSession {
  user: LoginResponseUser;
  accessToken: string;
  refreshToken: string;
  role: string;
}

export interface ForgotPasswordRequest {
  email: string;
  role?: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponseData {
  resetToken: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  data: VerifyOtpResponseData;
}

export interface ResetPasswordRequest {
  resetToken: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    login: builder.mutation<LoginSession, LoginRequest>({
      query: (credentials) => ({
        url: "/api/auth/login",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(_credentials, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(loginSuccess(data));
        } catch {
          // Login errors handled by caller
        }
      },
      transformResponse: (response: LoginApiResponse) => {
        const userRole = (response?.data?.role || response?.data?.user?.role || "").toLowerCase();
        const configuredRole = (import.meta.env.VITE_APP_ROLE || "account").toLowerCase();
        const allowedRoles = Array.from(new Set([configuredRole, "account"]));

        if (!allowedRoles.includes(userRole)) {
          throw new Error(
            "Access denied. Only account personnel are authorized to log in.",
          );
        }

        return response.data as LoginSession;
      },
    }),
    forgotPassword: builder.mutation<ForgotPasswordResponse, ForgotPasswordRequest>({
      query: (body) => ({
        url: "/api/auth/forgot-password",
        method: "POST",
        body: {
          role: body.role || import.meta.env.VITE_APP_ROLE || "account",
          ...body,
        },
      }),
    }),
    verifyOtp: builder.mutation<VerifyOtpResponse, VerifyOtpRequest>({
      query: (body) => ({
        url: "/api/auth/verify-otp",
        method: "POST",
        body,
      }),
    }),
    resetPassword: builder.mutation<ResetPasswordResponse, ResetPasswordRequest>({
      query: (body) => ({
        url: "/api/auth/reset-password",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
} = authApi;
