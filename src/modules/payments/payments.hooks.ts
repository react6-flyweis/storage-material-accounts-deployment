import { useState, useEffect, useCallback, useTransition } from "react";
import {
  getTaxFilingFiltersProvider,
  getTaxFilingProvider,
  exportTaxFilingProvider,
  getStateWiseTaxProvider,
  getStateWiseTaxStatsProvider,
  exportStateWiseTaxProvider,
  getStateWiseTaxUpcomingDeadlinesProvider,
  getProjectWiseTaxProvider,
  getProjectWiseTaxStatsProvider,
  exportProjectWiseTaxProvider,
  type GetTaxFilingParams,
  type GetTaxFilingResponse,
  type GetTaxFilingFiltersResponse,
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
  const [isPending, startTransition] = useTransition();

  const mutateAsync = async (params?: GetStateWiseTaxParams): Promise<Blob> => {
    return exportStateWiseTaxProvider(params);
  };

  const mutate = (params?: GetStateWiseTaxParams) => {
    startTransition(async () => {
      await mutateAsync(params);
    });
  };

  return { isPending, mutateAsync, mutate };
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
  const [isPending, startTransition] = useTransition();

  const mutateAsync = async (params?: GetProjectWiseTaxParams): Promise<Blob> => {
    return exportProjectWiseTaxProvider(params);
  };

  const mutate = (params?: GetProjectWiseTaxParams) => {
    startTransition(async () => {
      await mutateAsync(params);
    });
  };

  return { isPending, mutateAsync, mutate };
}
