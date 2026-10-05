import type { ApiResponse } from "../api/apiResponse";

/**
 * Extracts a human-readable error message from various error responses,
 * including RTK Query errors, fetch/network errors, Axios-like errors, and standard JS Errors.
 *
 * @param error - The caught error object
 * @param fallbackMessage - Default message if no specific error can be parsed
 * @returns A clean error message string
 */
export const getApiErrorMessage = (
  error: unknown,
  fallbackMessage = "Something went wrong. Please try again.",
): string => {
  if (!error) {
    return fallbackMessage;
  }

  // Handle RTK Query / Axios error object with response data
  if (typeof error === "object" && "data" in error) {
    const responseData = (error as { data?: ApiResponse | Record<string, unknown> | string }).data;

    if (typeof responseData === "string" && responseData.trim()) {
      return responseData.trim();
    }

    if (responseData && typeof responseData === "object") {
      // Check message
      if (
        "message" in responseData &&
        typeof responseData.message === "string" &&
        responseData.message.trim()
      ) {
        return responseData.message.trim();
      }

      // Check error property
      if (
        "error" in responseData &&
        typeof responseData.error === "string" &&
        responseData.error.trim()
      ) {
        return responseData.error.trim();
      }

      // Check msg property
      if (
        "msg" in responseData &&
        typeof responseData.msg === "string" &&
        responseData.msg.trim()
      ) {
        return responseData.msg.trim();
      }

      // Check errors array (e.g., validation errors)
      if ("errors" in responseData && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
        const firstError = responseData.errors[0];
        if (typeof firstError === "string" && firstError.trim()) {
          return firstError.trim();
        }
        if (typeof firstError === "object" && firstError && "msg" in firstError && typeof firstError.msg === "string") {
          return firstError.msg.trim();
        }
        if (typeof firstError === "object" && firstError && "message" in firstError && typeof firstError.message === "string") {
          return firstError.message.trim();
        }
      }
    }
  }

  // Handle FetchBaseQueryError error string (e.g. status: 'FETCH_ERROR', error: 'TypeError: Failed to fetch')
  if (typeof error === "object" && "error" in error) {
    const err = error as { error?: string };
    if (typeof err.error === "string" && err.error.trim()) {
      return err.error.trim();
    }
  }

  // Handle error with message property
  if (
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string" &&
    (error as { message: string }).message.trim()
  ) {
    return (error as { message: string }).message.trim();
  }

  // Handle standard Error instance
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  // Handle string error
  if (typeof error === "string" && error.trim()) {
    return error.trim();
  }

  return fallbackMessage;
};
