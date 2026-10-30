import { createApi as rtkCreateApi } from "@reduxjs/toolkit/query/react";

/**
 * Custom wrapper around RTK Query's createApi to inject global defaults,
 * such as forcing refetches on window focus and component mount.
 */
export const createApi: typeof rtkCreateApi = (options) => {
  return rtkCreateApi({
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
    ...options,
  });
};
