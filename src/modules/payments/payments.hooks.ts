import { useState, useEffect, useCallback, useTransition } from "react";
import {
  getTaxFilingStatsProvider,
  getTaxFilingFiltersProvider,
  getTaxFilingProvider,
  exportTaxFilingProvider,
  getTaxFilingDetailProvider,
  getTaxFilingPrepareProvider,
  approveTaxFilingProvider,
  payTaxFilingProvider,
  submitTaxPaymentProvider,
  getTaxFilingReceiptProvider,
  downloadTaxFilingReceiptPdfProvider,
  getTaxNotificationSettingsProvider,
  updateTaxNotificationSettingsProvider,
  fileTaxProvider,
  getStateWiseTaxProvider,
  getStateWiseTaxStatsProvider,
  exportStateWiseTaxProvider,
  getStateWiseTaxUpcomingDeadlinesProvider,
  getProjectWiseTaxProvider,
  getProjectWiseTaxStatsProvider,
  exportProjectWiseTaxProvider,
  syncTaxFilingProvider,
  syncStateWiseTaxProvider,
  syncProjectWiseTaxProvider,
  type GetTaxFilingStatsParams,
  type GetTaxFilingStatsResponse,
  type GetTaxFilingParams,
  type GetTaxFilingResponse,
  type GetTaxFilingFiltersResponse,
  type GetTaxFilingDetailResponse,
  type GetTaxFilingPrepareResponse,
  type PayTaxPayload,
  type PayTaxResponse,
  type GetTaxFilingReceiptResponse,
  type TaxNotificationSettings,
  type GetTaxNotificationSettingsResponse,
  type UpdateTaxNotificationSettingsResponse,
  type FileTaxResponse,
  type GetStateWiseTaxParams,
  type GetStateWiseTaxResponse,
  type GetStateWiseTaxStatsParams,
  type GetStateWiseTaxStatsResponse,
  type GetStateWiseTaxUpcomingDeadlinesParams,
  type GetStateWiseTaxUpcomingDeadlinesResponse,
  type GetProjectWiseTaxParams,
  type GetProjectWiseTaxResponse,
  type GetProjectWiseTaxStatsParams,
  type GetProjectWiseTaxStatsResponse,
} from "./payments.api";

export function useTaxFilingStatsQuery(params?: GetTaxFilingStatsParams) {
  const [data, setData] = useState<GetTaxFilingStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isError, setIsError] = useState(false);

  const paramKey = JSON.stringify(params);

  const fetchData = useCallback(async () => {
    setIsFetching(true);
    try {
      const res = await getTaxFilingStatsProvider(params);
      setData(res);
      setIsError(false);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [paramKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setIsLoading(true);
    fetchData();
  }, [fetchData]);

  return { data, isLoading, isFetching, isError, refetch: fetchData };
}

export function useTaxFilingFiltersQuery() {
  const [data, setData] = useState<GetTaxFilingFiltersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await getTaxFilingFiltersProvider();
      setData(res);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, isError, refetch: fetchData };
}

export function useTaxFilingQuery(params?: GetTaxFilingParams) {
  const [data, setData] = useState<GetTaxFilingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isError, setIsError] = useState(false);

  const paramKey = JSON.stringify(params);

  const fetchData = useCallback(async () => {
    setIsFetching(true);
    try {
      const res = await getTaxFilingProvider(params);
      setData(res);
      setIsError(false);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [paramKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setIsLoading(true);
    fetchData();
  }, [fetchData]);

  return { data, isLoading, isFetching, isError, refetch: fetchData };
}

export function useExportTaxFilingMutation() {
  const [isPending, startTransition] = useTransition();

  const mutateAsync = async (params?: GetTaxFilingParams): Promise<Blob> => {
    return exportTaxFilingProvider(params);
  };

  const mutate = (params?: GetTaxFilingParams) => {
    startTransition(async () => {
      await mutateAsync(params);
    });
  };

  return { isPending, mutateAsync, mutate };
}

export function useTaxFilingDetailQuery(id?: string) {
  const [data, setData] = useState<GetTaxFilingDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchData = useCallback(async (fetchId: string) => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await getTaxFilingDetailProvider(fetchId);
      setData(res);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setData(null);
    if (id) {
      fetchData(id);
    } else {
      setIsLoading(false);
    }
  }, [id, fetchData]);

  return { data, isLoading, isError, refetch: () => id && fetchData(id) };
}

export function useTaxFilingPrepareQuery(id?: string) {
  const [data, setData] = useState<GetTaxFilingPrepareResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchData = useCallback(async (fetchId: string) => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await getTaxFilingPrepareProvider(fetchId);
      setData(res);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setData(null);
    if (id) {
      fetchData(id);
    } else {
      setIsLoading(false);
    }
  }, [id, fetchData]);

  return { data, isLoading, isError, refetch: () => id && fetchData(id) };
}

export function useSubmitTaxPaymentMutation() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async (
    id: string,
    payload: PayTaxPayload
  ): Promise<PayTaxResponse> => {
    setIsPending(true);
    try {
      return await submitTaxPaymentProvider(id, payload);
    } finally {
      setIsPending(false);
    }
  };

  return { isPending, mutateAsync };
}

export function useApproveTaxFilingMutation() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async (
    id: string,
    payload: PayTaxPayload
  ): Promise<PayTaxResponse> => {
    setIsPending(true);
    try {
      return await approveTaxFilingProvider(id, payload);
    } finally {
      setIsPending(false);
    }
  };

  return { isPending, mutateAsync };
}

export function usePayTaxFilingMutation() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async (
    id: string,
    payload: PayTaxPayload
  ): Promise<PayTaxResponse> => {
    setIsPending(true);
    try {
      return await payTaxFilingProvider(id, payload);
    } finally {
      setIsPending(false);
    }
  };

  return { isPending, mutateAsync };
}

export function useTaxFilingReceiptQuery(id?: string) {
  const [data, setData] = useState<GetTaxFilingReceiptResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchData = useCallback(async (fetchId: string) => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await getTaxFilingReceiptProvider(fetchId);
      setData(res);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setData(null);
    if (id) {
      fetchData(id);
    } else {
      setIsLoading(false);
    }
  }, [id, fetchData]);

  return { data, isLoading, isError, refetch: () => id && fetchData(id) };
}

export function useDownloadTaxReceiptPdfMutation() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async (id: string): Promise<Blob> => {
    setIsPending(true);
    try {
      return await downloadTaxFilingReceiptPdfProvider(id);
    } finally {
      setIsPending(false);
    }
  };

  return { isPending, mutateAsync };
}

export function useTaxNotificationSettingsQuery() {
  const [data, setData] = useState<GetTaxNotificationSettingsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await getTaxNotificationSettingsProvider();
      setData(res);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, isError, refetch: fetchData };
}

export function useUpdateTaxNotificationSettingsMutation() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async (
    payload: TaxNotificationSettings
  ): Promise<UpdateTaxNotificationSettingsResponse> => {
    setIsPending(true);
    try {
      return await updateTaxNotificationSettingsProvider(payload);
    } finally {
      setIsPending(false);
    }
  };

  return { isPending, mutateAsync };
}

export function useFileTaxMutation() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async (id: string): Promise<FileTaxResponse> => {
    setIsPending(true);
    try {
      return await fileTaxProvider(id);
    } finally {
      setIsPending(false);
    }
  };

  return { isPending, mutateAsync };
}

export function useStateWiseTaxQuery(params?: GetStateWiseTaxParams) {
  const [data, setData] = useState<GetStateWiseTaxResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isError, setIsError] = useState(false);

  const paramKey = JSON.stringify(params);

  const fetchData = useCallback(async () => {
    setIsFetching(true);
    try {
      const res = await getStateWiseTaxProvider(params);
      setData(res);
      setIsError(false);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [paramKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setIsLoading(true);
    fetchData();
  }, [fetchData]);

  return { data, isLoading, isFetching, isError, refetch: fetchData };
}

export function useStateWiseTaxStatsQuery(params?: GetStateWiseTaxStatsParams) {
  const [data, setData] = useState<GetStateWiseTaxStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isError, setIsError] = useState(false);

  const paramKey = JSON.stringify(params);

  const fetchData = useCallback(async () => {
    setIsFetching(true);
    try {
      const res = await getStateWiseTaxStatsProvider(params);
      setData(res);
      setIsError(false);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [paramKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setIsLoading(true);
    fetchData();
  }, [fetchData]);

  return { data, isLoading, isFetching, isError, refetch: fetchData };
}

export function useExportStateWiseTaxMutation() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async (params?: GetStateWiseTaxParams): Promise<Blob> => {
    setIsPending(true);
    try {
      return await exportStateWiseTaxProvider(params);
    } finally {
      setIsPending(false);
    }
  };

  return { isPending, mutateAsync };
}

export function useStateWiseTaxUpcomingDeadlinesQuery(
  params?: GetStateWiseTaxUpcomingDeadlinesParams
) {
  const [data, setData] = useState<GetStateWiseTaxUpcomingDeadlinesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const paramKey = JSON.stringify(params);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getStateWiseTaxUpcomingDeadlinesProvider(params);
      setData(res);
      setIsError(false);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [paramKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, isError, refetch: fetchData };
}

export function useProjectWiseTaxQuery(params?: GetProjectWiseTaxParams) {
  const [data, setData] = useState<GetProjectWiseTaxResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isError, setIsError] = useState(false);

  const paramKey = JSON.stringify(params);

  const fetchData = useCallback(async () => {
    setIsFetching(true);
    try {
      const res = await getProjectWiseTaxProvider(params);
      setData(res);
      setIsError(false);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [paramKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setIsLoading(true);
    fetchData();
  }, [fetchData]);

  return { data, isLoading, isFetching, isError, refetch: fetchData };
}

export function useProjectWiseTaxStatsQuery(params?: GetProjectWiseTaxStatsParams) {
  const [data, setData] = useState<GetProjectWiseTaxStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isError, setIsError] = useState(false);

  const paramKey = JSON.stringify(params);

  const fetchData = useCallback(async () => {
    setIsFetching(true);
    try {
      const res = await getProjectWiseTaxStatsProvider(params);
      setData(res);
      setIsError(false);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [paramKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setIsLoading(true);
    fetchData();
  }, [fetchData]);

  return { data, isLoading, isFetching, isError, refetch: fetchData };
}

export function useExportProjectWiseTaxMutation() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async (params?: GetProjectWiseTaxParams): Promise<Blob> => {
    setIsPending(true);
    try {
      return await exportProjectWiseTaxProvider(params);
    } finally {
      setIsPending(false);
    }
  };

  return { isPending, mutateAsync };
}

export function useSyncTaxFilingMutation() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async () => {
    setIsPending(true);
    try {
      return await syncTaxFilingProvider();
    } finally {
      setIsPending(false);
    }
  };

  return { isPending, mutateAsync };
}

export function useSyncStateWiseTaxMutation() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async () => {
    setIsPending(true);
    try {
      return await syncStateWiseTaxProvider();
    } finally {
      setIsPending(false);
    }
  };

  return { isPending, mutateAsync };
}

export function useSyncProjectWiseTaxMutation() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async () => {
    setIsPending(true);
    try {
      return await syncProjectWiseTaxProvider();
    } finally {
      setIsPending(false);
    }
  };

  return { isPending, mutateAsync };
}
